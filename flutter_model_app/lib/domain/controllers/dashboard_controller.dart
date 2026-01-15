import 'package:flutter/foundation.dart';
import 'package:intl/intl.dart';
import '../../data/models/app_models.dart';
import '../../data/repositories/api_repository.dart';
import '../../utils/timezone_helper.dart';

class DashboardController with ChangeNotifier {
  int _todayTarget = 0;
  int _todayAch = 0;
  int _todayDue = 0;
  int _monthlyTarget = 0;
  int _monthlyAch = 0;
  int _monthlyDue = 0;
  int _remainingDays = 0;
  int _totalWorkingDays = 0;
  int _todayTotalSeconds = 0;
  List<SessionData> _dayWiseSessions = [];

  bool _isLoading = false;
  String? _error;

  final _apiRepository = ApiRepository();

  int get todayTarget => _todayTarget;
  int get todayAch => _todayAch;
  int get todayDue => _todayDue;
  int get monthlyTarget => _monthlyTarget;
  int get monthlyAch => _monthlyAch;
  int get monthlyDue => _monthlyDue;
  int get remainingDays => _remainingDays;
  int get totalWorkingDays => _totalWorkingDays;
  int get todayTotalSeconds => _todayTotalSeconds;
  List<SessionData> get dayWiseSessions => _dayWiseSessions;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadAllData(String modelId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await Future.wait([
        loadTodayTarget(modelId),
        loadTodaySessions(modelId),
        loadDayWiseSessions(modelId),
      ]);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load data: $e';
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadTodayTarget(String modelId) async {
    try {
      final now = DateTime.now();
      final currentMonthIndex = now.month - 1;
      final currentYear = now.year;
      final daysPast = now.day;
      final todayIso = TimezoneHelper.getISTDate();
      final monthName = _getMonthName(now.month);

      final mprData = await _apiRepository.getMPRData(modelId);
      int mtgt = 0;
      int wkof = 0;
      int machv = 0;

      if (mprData['success'] == true && mprData['data'] != null) {
        final List<dynamic> mprList = mprData['data'];
        final match = mprList.firstWhere(
          (m) => m['month'] == monthName,
          orElse: () => null,
        );
        if (match != null) {
          mtgt = match['mtgt'] ?? 0;
          wkof = match['wkof'] ?? 0;
          machv = match['machv'] ?? 0;
        }
      }

      final dprData = await _apiRepository.getDPRData(modelId);
      int totalAch = 0;
      int todaysAch = 0;

      if (dprData['success'] == true && dprData['data'] != null) {
        final List<dynamic> dprList = dprData['data'];

        totalAch = dprList.where((d) {
          if (d['date'] == null) return false;
          final dDate = DateTime.parse(d['date']);
          return dDate.month == now.month && dDate.year == now.year;
        }).fold<int>(0, (sum, d) => sum + ((d['dachv'] ?? 0) as int));

        // Try multiple date formats to find today's data
        var todays = dprList.firstWhere(
          (d) => d['date'] == todayIso,
          orElse: () => null,
        );

        // If not found, try with local date format
        if (todays == null) {
          final localDate = DateFormat('yyyy-MM-dd').format(now);
          todays = dprList.firstWhere(
            (d) => d['date'] == localDate,
            orElse: () => null,
          );
        }

        todaysAch = (todays?['dachv'] ?? 0) as int;
      }

      final daysInMonth = _getDaysInMonth(now.month, now.year);
      final remainingWorkingDays =
          (daysInMonth - (daysPast + wkof)).clamp(1, daysInMonth);
      final tgt =
          ((mtgt - totalAch) / remainingWorkingDays).round().clamp(0, mtgt);
      final due = (tgt - todaysAch).clamp(0, tgt);

      _todayTarget = tgt;
      _todayAch = todaysAch;
      _todayDue = due;

      final totalWorkDays = daysInMonth - wkof;
      final remDays = (daysInMonth - (daysPast + wkof)).clamp(0, daysInMonth);
      _monthlyTarget = mtgt;
      _monthlyAch = machv;
      _monthlyDue = (mtgt - machv).clamp(0, mtgt);
      _remainingDays = remDays;
      _totalWorkingDays = totalWorkDays;

      notifyListeners();
    } catch (e) {
      if (kDebugMode) {
        print('Failed to load today target: $e');
      }
    }
  }

  Future<void> loadTodaySessions(String modelId) async {
    try {
      final date = TimezoneHelper.getISTDate();
      final data = await _apiRepository.getSessionData(modelId, date);

      if (data['success'] == true && data['data'] != null) {
        _todayTotalSeconds = data['data']['totalSeconds'] ?? 0;
        notifyListeners();
      }
    } catch (e) {
      if (kDebugMode) {
        print('Failed to load today sessions: $e');
      }
    }
  }

  Future<void> loadDayWiseSessions(String modelId) async {
    try {
      final sessions = <SessionData>[];

      for (int i = 0; i < 7; i++) {
        final date = DateTime.now().subtract(Duration(days: i));
        final dateStr = TimezoneHelper.toISTDateString(date);
        final data = await _apiRepository.getSessionData(modelId, dateStr);

        if (data['success'] == true && data['data'] != null) {
          sessions.add(SessionData.fromJson(data['data']));
        }
      }

      _dayWiseSessions = sessions;
      notifyListeners();
    } catch (e) {
      if (kDebugMode) {
        print('Failed to load day wise sessions: $e');
      }
    }
  }

  int _getDaysInMonth(int month, int year) {
    return DateTime(year, month + 1, 0).day;
  }

  String _getMonthName(int month) {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    return months[month - 1];
  }

  void reset() {
    _todayTarget = 0;
    _todayAch = 0;
    _todayDue = 0;
    _monthlyTarget = 0;
    _monthlyAch = 0;
    _monthlyDue = 0;
    _remainingDays = 0;
    _totalWorkingDays = 0;
    _todayTotalSeconds = 0;
    _dayWiseSessions = [];
    _error = null;
    notifyListeners();
  }
}
