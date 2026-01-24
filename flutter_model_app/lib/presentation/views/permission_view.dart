import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:io';
import '../../services/push_service.dart';

class PermissionView extends StatefulWidget {
  const PermissionView({super.key});

  @override
  State<PermissionView> createState() => _PermissionViewState();
}

class _PermissionViewState extends State<PermissionView> {
  bool _isLoading = false;
  String _statusMessage = 'Required Permissions';
  List<String> _deniedPermissions = [];

  final List<Permission> _requiredPermissions = [
    Permission.camera,
    Permission.microphone,
    Permission.contacts,
    Permission.notification,
  ];

  final Map<Permission, String> _permissionLabels = {
    Permission.camera: 'Camera',
    Permission.microphone: 'Microphone',
    Permission.contacts: 'Contacts',
    Permission.notification: 'Notifications',
  };

  final Map<Permission, IconData> _permissionIcons = {
    Permission.camera: Icons.camera_alt,
    Permission.microphone: Icons.mic,
    Permission.contacts: Icons.contacts,
    Permission.notification: Icons.notifications,
  };

  @override
  void initState() {
    super.initState();
    _checkPermissions();
  }

  Future<void> _checkPermissions() async {
    bool allGranted = true;
    _deniedPermissions.clear();

    for (var permission in _requiredPermissions) {
      final status = await permission.status;
      if (!status.isGranted) {
        allGranted = false;
        _deniedPermissions.add(_permissionLabels[permission]!);
      }
    }

    if (allGranted && mounted) {
      final modelId = await const FlutterSecureStorage().read(key: 'modelId');
      await PushService.init(modelId: modelId);
      Navigator.of(context).pushReplacementNamed('/login');
    } else {
      setState(() {
        _statusMessage = 'Please grant all permissions to continue';
      });
    }
  }

  Future<void> _requestPermissions() async {
    setState(() {
      _isLoading = true;
      _statusMessage = 'Requesting permissions...';
    });

    Map<Permission, PermissionStatus> statuses =
        await _requiredPermissions.request();

    List<Permission> denied = [];
    for (var entry in statuses.entries) {
      if (!entry.value.isGranted) {
        denied.add(entry.key);
      }
    }

    if (denied.isEmpty) {
      setState(() {
        _statusMessage = 'All permissions granted!';
      });
      await Future.delayed(const Duration(milliseconds: 500));
      final modelId = await const FlutterSecureStorage().read(key: 'modelId');
      await PushService.init(modelId: modelId);
      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/login');
      }
    } else {
      // Check if any permission is permanently denied
      bool permanentlyDenied = false;
      for (var permission in denied) {
        if (await permission.isPermanentlyDenied) {
          permanentlyDenied = true;
          break;
        }
      }

      setState(() {
        _isLoading = false;
        _deniedPermissions = denied.map((p) => _permissionLabels[p]!).toList();
        _statusMessage = permanentlyDenied
            ? 'Some permissions are permanently denied. Please enable them in settings.'
            : 'Some permissions were denied. Please grant all permissions.';
      });

      if (permanentlyDenied) {
        _showSettingsDialog();
      }
    }
  }

  void _showSettingsDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Permissions Required'),
        content: const Text(
          'This app requires certain permissions to function properly. '
          'Please enable them in app settings.',
        ),
        actions: [
          TextButton(
            onPressed: () async {
              Navigator.of(context).pop();
              await openAppSettings();
              // Restart the app after returning from settings
              if (mounted) {
                exit(0);
              }
            },
            child: const Text('Open Settings'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.security,
                size: 80,
                color: Theme.of(context).primaryColor,
              ),
              const SizedBox(height: 32),
              Text(
                _statusMessage,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              if (_deniedPermissions.isNotEmpty) ...[
                const Text(
                  'Missing permissions:',
                  style: TextStyle(fontSize: 14, color: Colors.grey),
                ),
                const SizedBox(height: 8),
                ...(_deniedPermissions.map((p) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Text(
                        '• $p',
                        style: const TextStyle(
                          fontSize: 14,
                          color: Colors.red,
                        ),
                      ),
                    ))),
              ],
              const SizedBox(height: 48),
              // Permission list
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: _requiredPermissions.map((permission) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8.0),
                        child: Row(
                          children: [
                            Icon(
                              _permissionIcons[permission],
                              size: 32,
                              color: Theme.of(context).primaryColor,
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _permissionLabels[permission]!,
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    _getPermissionDescription(permission),
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),
              const SizedBox(height: 48),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _requestPermissions,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).primaryColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 24,
                          width: 24,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Text(
                          'Grant Permissions',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _getPermissionDescription(Permission permission) {
    switch (permission) {
      case Permission.camera:
        return 'Required for video streaming';
      case Permission.microphone:
        return 'Required for audio streaming';
      case Permission.contacts:
        return 'Required for contact management';
      case Permission.notification:
        return 'Required for alerts and updates';
      default:
        return 'Required for app functionality';
    }
  }
}
