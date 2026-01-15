import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../data/models/app_models.dart';
import '../../data/repositories/api_repository.dart';
import '../../core/constants/app_constants.dart';
import '../../utils/device_helper.dart';
import '../../utils/timezone_helper.dart';

class AuthController with ChangeNotifier {
  ModelProfile? _model;
  bool _isLoggedIn = false;
  bool _isLoading = false;
  String? _error;
  Map<String, String>? _deviceInfo;

  final _storage = const FlutterSecureStorage();
  final _apiRepository = ApiRepository();

  ModelProfile? get model => _model;
  bool get isLoggedIn => _isLoggedIn;
  bool get isLoading => _isLoading;
  String? get error => _error;
  Map<String, String>? get deviceInfo => _deviceInfo;

  AuthController() {
    _initDeviceInfo();
    _checkPersistedLogin();
  }

  Future<void> _initDeviceInfo() async {
    _deviceInfo = await DeviceHelper.getDeviceFingerprint();
    notifyListeners();
  }

  Future<void> _checkPersistedLogin() async {
    try {
      final modelId = await _storage.read(key: AppConstants.modelDataKey);
      if (modelId != null && modelId.isNotEmpty) {
        // Try to restore login with saved model ID
        final response = await _apiRepository.getModelProfile(modelId);
        if (response['success'] == true && response['data'] != null) {
          _model = ModelProfile.fromJson(response['data']);
          _isLoggedIn = true;
          notifyListeners();
        } else {
          // If model data is invalid, log out
          await logout();
        }
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error checking persisted login: $e');
      }
    }
  }

  Future<bool> login(String username, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiRepository.login(username, password);

      if (response['success'] == true && response['data'] != null) {
        _model = ModelProfile.fromJson(response['data']);
        _isLoggedIn = true;
        _error = null;

        await _storage.write(key: AppConstants.modelDataKey, value: _model!.id);

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
    _model = null;
    _isLoggedIn = false;
    _error = null;

    await _storage.delete(key: AppConstants.modelDataKey);

    notifyListeners();
  }

  Future<Map<String, dynamic>> createSession() async {
    if (_deviceInfo == null || _model == null) {
      return {'success': false, 'error': 'No device info or model'};
    }

    try {
      final response = await _apiRepository.logSession(
        type: 'login',
        modelId: _model!.id,
        date: TimezoneHelper.getISTDate(),
        loginAt: TimezoneHelper.getISTTimestamp(),
        deviceId: _deviceInfo!['deviceId']!,
        deviceName: _deviceInfo!['deviceName'],
      );

      return response;
    } catch (e) {
      return {'success': false, 'error': 'Failed to create session: $e'};
    }
  }

  Future<void> endSession() async {
    if (_deviceInfo == null || _model == null) return;

    try {
      final response = await _apiRepository.logSession(
        type: 'logout',
        modelId: _model!.id,
        date: TimezoneHelper.getISTDate(),
        logoutAt: TimezoneHelper.getISTTimestamp(),
        deviceId: _deviceInfo!['deviceId']!,
      );

      if (kDebugMode) {
        print('End session response: $response');
      }
    } catch (e) {
      if (kDebugMode) {
        print('Failed to end session: $e');
      }
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
