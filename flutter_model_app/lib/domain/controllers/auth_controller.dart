import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../data/models/app_models.dart';
import '../../data/repositories/api_repository.dart';
import '../../core/constants/app_constants.dart';
import '../../utils/device_helper.dart';
import '../../utils/timezone_helper.dart';
import '../../services/push_service.dart';

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

        // Check and store FCM token if not present
        await _checkAndStoreFCMToken(_model!.id);

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

  /// Check if model has FCM token stored, if not, fetch and store current token
  Future<void> _checkAndStoreFCMToken(String modelId) async {
    try {
      if (kDebugMode) {
        print('Checking FCM token for model: $modelId');
      }

      // Fetch model data to check if deviceToken exists
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/api/model/list'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode != 200) {
        if (kDebugMode) {
          print('Failed to fetch model list: ${response.statusCode}');
        }
        return;
      }

      final data = jsonDecode(response.body);
      if (data['success'] != true || data['data'] == null) {
        if (kDebugMode) {
          print('Invalid response when fetching model list');
        }
        return;
      }

      // Find current model
      final models = data['data'] is List ? data['data'] : [data['data']];
      final currentModel = models.firstWhere(
        (m) => m['id'] == modelId,
        orElse: () => null,
      );

      if (currentModel == null) {
        if (kDebugMode) {
          print('Current model not found in list');
        }
        return;
      }

      // Check if deviceToken is present
      if (currentModel['deviceToken'] != null &&
          currentModel['deviceToken'].toString().isNotEmpty) {
        if (kDebugMode) {
          print('Model already has FCM token stored');
        }
        return;
      }

      // No token found, get current FCM token and store it
      if (kDebugMode) {
        print('No FCM token found for model, fetching current token...');
      }

      final currentToken = await PushService.getCurrentToken();
      if (currentToken != null) {
        await _storeTokenInDatabase(modelId, currentToken);
      } else {
        if (kDebugMode) {
          print('Failed to get current FCM token');
        }
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error checking FCM token: $e');
      }
    }
  }

  /// Store FCM token in the database
  Future<void> _storeTokenInDatabase(String modelId, String token) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConstants.baseUrl}/api/model/update-token'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'modelId': modelId,
          'deviceToken': token,
        }),
      );

      if (response.statusCode == 200) {
        if (kDebugMode) {
          print('FCM token stored in database successfully');
        }
      } else {
        if (kDebugMode) {
          print('Failed to store FCM token: ${response.statusCode}');
        }
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error storing FCM token in database: $e');
      }
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
