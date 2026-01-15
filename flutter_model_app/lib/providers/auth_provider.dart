import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/model.dart';
import '../services/api_service.dart';
import '../utils/device_helper.dart';
import '../utils/timezone_helper.dart';

class AuthProvider with ChangeNotifier {
  ModelProfile? _model;
  bool _isLoggedIn = false;
  bool _isLoading = false;
  String? _error;
  Map<String, String>? _deviceInfo;

  // Storage for persistent login
  final _storage = const FlutterSecureStorage();

  ModelProfile? get model => _model;
  bool get isLoggedIn => _isLoggedIn;
  bool get isLoading => _isLoading;
  String? get error => _error;
  Map<String, String>? get deviceInfo => _deviceInfo;

  AuthProvider() {
    _initDeviceInfo();
    _checkPersistedLogin();
  }

  Future<void> _initDeviceInfo() async {
    _deviceInfo = await DeviceHelper.getDeviceFingerprint();
    notifyListeners();
  }

  Future<void> _checkPersistedLogin() async {
    // Check if user was previously logged in
    final modelData = await _storage.read(key: 'model_data');
    if (modelData != null) {
      // You can optionally auto-login here
      // For now, just clear on app restart for security
      await logout();
    }
  }

  Future<bool> login(String username, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.login(username, password);

      if (response['success'] == true && response['data'] != null) {
        _model = ModelProfile.fromJson(response['data']);
        _isLoggedIn = true;
        _error = null;

        // Save to secure storage
        await _storage.write(key: 'model_data', value: _model!.id);

        // Log login session
        if (_deviceInfo != null && _model != null) {
          await ApiService.logSession(
            type: 'login',
            modelId: _model!.id,
            date: TimezoneHelper.getISTDate(),
            loginAt: TimezoneHelper.getISTTimestamp(),
            deviceId: _deviceInfo!['deviceId']!,
            deviceName: _deviceInfo!['deviceName'],
          );
        }

        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response['error'] ?? 'Invalid credentials';
        _model = null;
        _isLoggedIn = false;
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Login failed: $e';
      _model = null;
      _isLoggedIn = false;
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    // Log logout session
    if (_deviceInfo != null && _model != null) {
      await ApiService.logSession(
        type: 'logout',
        modelId: _model!.id,
        date: TimezoneHelper.getISTDate(),
        logoutAt: TimezoneHelper.getISTTimestamp(),
        deviceId: _deviceInfo!['deviceId']!,
      );
    }

    _model = null;
    _isLoggedIn = false;
    _error = null;

    // Clear secure storage
    await _storage.delete(key: 'model_data');

    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
