import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../domain/controllers/auth_controller.dart';
import '../../domain/controllers/dashboard_controller.dart';
import '../../domain/controllers/camsites_controller.dart';
import '../../utils/timezone_helper.dart';
import '../widgets/italianno_text.dart';

class DashboardView extends StatefulWidget {
  const DashboardView({super.key});

  @override
  State<DashboardView> createState() => _DashboardViewState();
}

class _DashboardViewState extends State<DashboardView>
    with TickerProviderStateMixin, WidgetsBindingObserver {
  late AnimationController _timeController;
  late AnimationController _scrollController;
  int _sessionStartSeconds = 0;
  int _previousSessionSeconds = 0;
  bool _isSessionActive = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);

    // Schedule data refresh and session setup after frame is built
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _refreshData();
      _loadTodaySessionTime();
      _createLoginSession();
      _loadCamSites();
    });

    // Update time every second
    _timeController = AnimationController(
      duration: Duration(seconds: 1),
      vsync: this,
    )..repeat();

    // Marquee scroll animation
    _scrollController = AnimationController(
      duration: Duration(seconds: 15),
      vsync: this,
    )..repeat();

    // Start session timer
    _sessionStartSeconds = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    _previousSessionSeconds = 0;
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _timeController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    // Auto-logout when app goes to background or is closed
    if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.detached ||
        state == AppLifecycleState.inactive) {
      _handleAutoLogout();
    }
  }

  Future<void> _refreshData() async {
    final authController = Provider.of<AuthController>(context, listen: false);
    final dashboardController =
        Provider.of<DashboardController>(context, listen: false);

    if (authController.model != null) {
      await dashboardController.loadAllData(authController.model!.id);
    }
  }

  Future<void> _createLoginSession() async {
    final authController = Provider.of<AuthController>(context, listen: false);
    if (authController.model == null) return;

    try {
      final response = await authController.createSession();
      if (response['success'] == true) {
        setState(() {
          _isSessionActive = true;
        });
        print('Session created successfully');
      } else {
        print('Failed to create session: ${response['error']}');
      }
    } catch (e) {
      print('Error creating session: $e');
    }
  }

  Future<void> _loadTodaySessionTime() async {
    final authController = Provider.of<AuthController>(context, listen: false);
    final dashboardController =
        Provider.of<DashboardController>(context, listen: false);

    if (authController.model == null) return;

    try {
      await dashboardController.loadTodaySessions(authController.model!.id);
      setState(() {
        _previousSessionSeconds = dashboardController.todayTotalSeconds;
      });
    } catch (e) {
      print('Error loading session time: $e');
    }
  }

  Future<void> _handleAutoLogout() async {
    final authController = Provider.of<AuthController>(context, listen: false);
    if (authController.model == null || !_isSessionActive) return;

    print('Auto-logout triggered');
    await authController.endSession();
    setState(() {
      _isSessionActive = false;
    });
  }

  Future<void> _handleLogout() async {
    final authController = Provider.of<AuthController>(context, listen: false);
    final dashboardController =
        Provider.of<DashboardController>(context, listen: false);

    // End current session before logout
    if (_isSessionActive) {
      print('Manual logout - ending session');
      await authController.endSession();
      setState(() {
        _isSessionActive = false;
      });
    }

    await authController.logout();
    dashboardController.reset();

    if (mounted) {
      Navigator.of(context).pushReplacementNamed('/login');
    }
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning ...';
    if (hour < 17) return 'Good Afternoon ...';
    return 'Good Evening ...';
  }

  String _getFirstName(String fullName) {
    return fullName.split(' ').first;
  }

  // Calculate total session time (previous + current)
  int _getTotalSessionSeconds() {
    final currentSessionSeconds =
        (DateTime.now().millisecondsSinceEpoch ~/ 1000) - _sessionStartSeconds;
    return _previousSessionSeconds + currentSessionSeconds;
  }

  String _getDeviceInfo(AuthController authController) {
    if (authController.deviceInfo != null) {
      final deviceName = authController.deviceInfo!['deviceName'] ?? 'Unknown';
      final os = authController.deviceInfo!['os'] ?? 'Unknown';
      return '$deviceName on $os';
    }
    return 'Device Info Unavailable';
  }

  Future<void> _loadCamSites() async {
    final authController = Provider.of<AuthController>(context, listen: false);
    final camSitesController =
        Provider.of<CamSitesController>(context, listen: false);

    if (authController.model == null) return;

    try {
      await camSitesController.loadCamSites(authController.model!.id);
    } catch (e) {
      print('Error loading camera sites: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final authController = Provider.of<AuthController>(context);
    final dashboardController = Provider.of<DashboardController>(context);
    final model = authController.model;

    if (model == null) {
      return Scaffold(
        backgroundColor: const Color(0xFF0A0A0A),
        body: Center(
          child: Text(
            'Not logged in',
            style: TextStyle(color: Colors.white),
          ),
        ),
      );
    }

    final dateFormat = DateFormat('dd-MM-yyyy');
    final timeFormat = DateFormat('hh:mm:ss a');

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      body: dashboardController.isLoading
          ? Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.red),
              ),
            )
          : RefreshIndicator(
              onRefresh: _refreshData,
              color: Colors.red,
              backgroundColor: const Color(0xFF1A1A1A),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  children: [
                    // Top Section with Profile
                    Container(
                      width: double.infinity,
                      color: const Color(0xFF0A0A0A),
                      padding: const EdgeInsets.fromLTRB(16, 48, 16, 24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Top Bar
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              IconButton(
                                icon: Icon(Icons.menu, color: Colors.white),
                                onPressed: () {
                                  // Show menu
                                  showModalBottomSheet(
                                    context: context,
                                    backgroundColor: const Color(0xFF1A1A1A),
                                    builder: (context) => Container(
                                      padding: const EdgeInsets.all(20),
                                      child: Column(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          ListTile(
                                            leading: Icon(Icons.refresh,
                                                color: Colors.white),
                                            title: Text('Refresh',
                                                style: TextStyle(
                                                    color: Colors.white)),
                                            onTap: () {
                                              Navigator.pop(context);
                                              _refreshData();
                                            },
                                          ),
                                          ListTile(
                                            leading: Icon(Icons.logout,
                                                color: Colors.white),
                                            title: Text('Logout',
                                                style: TextStyle(
                                                    color: Colors.white)),
                                            onTap: () {
                                              Navigator.pop(context);
                                              _handleLogout();
                                            },
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              ),
                              AnimatedBuilder(
                                animation: _timeController,
                                builder: (context, child) {
                                  final now = DateTime.now();
                                  return Text(
                                    'Last Online: ${dateFormat.format(now)}',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                    ),
                                  );
                                },
                              ),
                            ],
                          ),
                          const SizedBox(height: 20),
                          // Profile and Greeting
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    ItaliannoText(
                                      _getGreeting(),
                                      fontSize: 28,
                                      color: Colors.white,
                                    ),
                                    ItaliannoText(
                                      _getFirstName(model.name),
                                      fontSize: 32,
                                      color: Colors.white,
                                    ),
                                  ],
                                ),
                              ),
                              CircleAvatar(
                                radius: 40,
                                backgroundColor: Colors.grey[300],
                                child: Icon(
                                  Icons.person,
                                  size: 50,
                                  color: Colors.grey[600],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          // Date and Time with auto-update
                          AnimatedBuilder(
                            animation: _timeController,
                            builder: (context, child) {
                              final currentTime = DateTime.now();
                              return Row(
                                children: [
                                  Text(
                                    dateFormat.format(currentTime),
                                    style: TextStyle(
                                      color: Colors.white70,
                                      fontSize: 14,
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  Icon(Icons.access_time,
                                      color: Colors.white70, size: 16),
                                  const SizedBox(width: 4),
                                  Text(
                                    timeFormat
                                        .format(currentTime)
                                        .toUpperCase(),
                                    style: TextStyle(
                                      color: Colors.white70,
                                      fontSize: 14,
                                    ),
                                  ),
                                ],
                              );
                            },
                          ),
                        ],
                      ),
                    ),

                    // Red Banner with Animated Marquee
                    if (dashboardController.todayDue > 0)
                      Container(
                        width: double.infinity,
                        color: Colors.red,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        child: AnimatedBuilder(
                          animation: _scrollController,
                          builder: (context, child) {
                            final offset = _scrollController.value *
                                MediaQuery.of(context).size.width;
                            return SingleChildScrollView(
                              scrollDirection: Axis.horizontal,
                              physics: NeverScrollableScrollPhysics(),
                              child: Transform.translate(
                                offset: Offset(-offset, 0),
                                child: Row(
                                  children: [
                                    SizedBox(width: 20),
                                    Text(
                                      'YOU HAVE ${dashboardController.todayDue} TOKEN DUE FOR TODAY     ',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    Text(
                                      'YOU HAVE ${dashboardController.todayDue} TOKEN DUE FOR TODAY     ',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    Text(
                                      'YOU HAVE ${dashboardController.todayDue} TOKEN DUE FOR TODAY',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),

                    const SizedBox(height: 12),

                    // TODAY Section
                    Container(
                      margin: const EdgeInsets.symmetric(horizontal: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1A1A1A),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      padding: const EdgeInsets.all(4),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'TODAY',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              IconButton(
                                icon: Icon(Icons.refresh,
                                    color: Colors.white, size: 20),
                                onPressed: _refreshData,
                                padding: EdgeInsets.zero,
                                constraints: BoxConstraints(),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  children: [
                                    Text(
                                      'TGT',
                                      style: TextStyle(
                                        color: Colors.white70,
                                        fontSize: 12,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          vertical: 12),
                                      decoration: BoxDecoration(
                                        color: Colors.red,
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Center(
                                        child: Text(
                                          dashboardController.todayTarget
                                              .toString(),
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  children: [
                                    Text(
                                      'ACH',
                                      style: TextStyle(
                                        color: Colors.white70,
                                        fontSize: 12,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          vertical: 12),
                                      decoration: BoxDecoration(
                                        color: Colors.green,
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Center(
                                        child: Text(
                                          dashboardController.todayAch
                                              .toString(),
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  children: [
                                    Text(
                                      'DUE',
                                      style: TextStyle(
                                        color: Colors.white70,
                                        fontSize: 12,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          vertical: 12),
                                      decoration: BoxDecoration(
                                        color: Colors.orange,
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Center(
                                        child: Text(
                                          dashboardController.todayDue
                                              .toString(),
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 12),

                    // Today's Online Time Section - Live Stats
                    Container(
                      margin: const EdgeInsets.symmetric(horizontal: 12),
                      height: 180,
                      width: double.infinity,
                      decoration: ShapeDecoration(
                        gradient: const LinearGradient(
                          begin: Alignment(0.50, 0.00),
                          end: Alignment(0.50, 1.00),
                          colors: [Color(0xFFA90002), Color(0xFF430001)],
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          // Header with title and device info
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'TODAY LIVE STATS',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          const Divider(
                            color: Colors.white24,
                            thickness: 1,
                          ),

                          // Current session and Total time row
                          Expanded(
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceAround,
                              children: [
                                // Left: Current Session Time
                                Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.photo_camera,
                                      color: Colors.white,
                                      size: 36,
                                    ),
                                    const SizedBox(height: 8),
                                    AnimatedBuilder(
                                      animation: _timeController,
                                      builder: (context, child) {
                                        final currentSessionSeconds = (DateTime
                                                        .now()
                                                    .millisecondsSinceEpoch ~/
                                                1000) -
                                            _sessionStartSeconds;
                                        return Text(
                                          TimezoneHelper.formatSeconds(
                                            currentSessionSeconds,
                                          ),
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 20,
                                            fontWeight: FontWeight.bold,
                                            fontFamily: 'monospace',
                                          ),
                                        );
                                      },
                                    ),
                                  ],
                                ),
                                // Right: Total Time Today
                                Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.videocam,
                                      color: Colors.white,
                                      size: 36,
                                    ),
                                    const SizedBox(height: 8),
                                    AnimatedBuilder(
                                      animation: _timeController,
                                      builder: (context, child) {
                                        final totalSeconds =
                                            _getTotalSessionSeconds();
                                        return Text(
                                          TimezoneHelper.formatSeconds(
                                              totalSeconds),
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 20,
                                            fontWeight: FontWeight.bold,
                                            fontFamily: 'monospace',
                                          ),
                                        );
                                      },
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Icon(
                                Icons.devices,
                                color: Colors.white,
                                size: 20,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                _getDeviceInfo(authController),
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 12),

                    // MONTHLY Section
                    Container(
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1A1A1A),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      padding: const EdgeInsets.all(6),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'MONTHLY',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                '${dashboardController.remainingDays}/${dashboardController.totalWorkingDays} Days',
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  children: [
                                    Text(
                                      'TGT',
                                      style: TextStyle(
                                        color: Colors.white70,
                                        fontSize: 12,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          vertical: 12),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF2A2A2A),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Center(
                                        child: Text(
                                          dashboardController.monthlyTarget
                                              .toString(),
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  children: [
                                    Text(
                                      'ACH',
                                      style: TextStyle(
                                        color: Colors.white70,
                                        fontSize: 12,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          vertical: 12),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF2A2A2A),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Center(
                                        child: Text(
                                          dashboardController.monthlyAch
                                              .toString(),
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  children: [
                                    Text(
                                      'DUE',
                                      style: TextStyle(
                                        color: Colors.white70,
                                        fontSize: 12,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          vertical: 12),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF2A2A2A),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Center(
                                        child: Text(
                                          dashboardController.monthlyDue
                                              .toString(),
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 12),

                    // MY CAM SITES Section (moved below Monthly)
                    Consumer<CamSitesController>(
                      builder: (context, camSitesController, _) {
                        return Container(
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1A1A1A),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'MY CAM SITES',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.5,
                                ),
                              ),
                              const SizedBox(height: 6),
                              if (camSitesController.isLoading)
                                Center(
                                  child: SizedBox(
                                    height: 70,
                                    child: CircularProgressIndicator(
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                          Colors.red),
                                    ),
                                  ),
                                )
                              else if (camSitesController.error != null)
                                Center(
                                  child: Text(
                                    'Error: ${camSitesController.error}',
                                    style: TextStyle(color: Colors.red),
                                  ),
                                )
                              else if (camSitesController.camSites.isEmpty)
                                Center(
                                  child: Text(
                                    'No camera sites available',
                                    style: TextStyle(color: Colors.white70),
                                  ),
                                )
                              else
                                ListView.builder(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  itemCount: camSitesController.camSites.length,
                                  itemBuilder: (context, index) {
                                    final site =
                                        camSitesController.camSites[index];
                                    final isActive = site.status == 'ACTIVE';
                                    final statusColor =
                                        isActive ? Colors.green : Colors.red;

                                    return Container(
                                      margin: const EdgeInsets.only(bottom: 8),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF2A2A2A),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 12,
                                        vertical: 12,
                                      ),
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          // Site Code
                                          Text(
                                            site.name,
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontSize: 18,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          const SizedBox(width: 16),
                                          // Status Text
                                          Text(
                                            site.status,
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontSize: 12,
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          // Status Indicator
                                          Container(
                                            width: 12,
                                            height: 12,
                                            decoration: BoxDecoration(
                                              shape: BoxShape.circle,
                                              color: statusColor,
                                            ),
                                          ),
                                        ],
                                      ),
                                    );
                                  },
                                ),
                            ],
                          ),
                        );
                      },
                    ),

                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
    );
  }
}
