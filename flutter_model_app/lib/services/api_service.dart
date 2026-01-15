import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/model.dart';

class ApiService {
  // Change this to your production URL
  static const String baseUrl = 'https://www.camstudio.fun';

  // For local testing use:
  // static const String baseUrl = 'http://localhost:3000';

  // Login
  static Future<Map<String, dynamic>> login(
      String username, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/model/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': username,
          'password': password,
        }),
      );

      final data = jsonDecode(response.body);
      return data;
    } catch (e) {
      return {
        'success': false,
        'error': 'Connection failed: $e',
      };
    }
  }

  // Get MPR data for a model
  static Future<Map<String, dynamic>> getMPRData(String modelId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/mpr?modelId=$modelId'),
      );

      final data = jsonDecode(response.body);
      return data;
    } catch (e) {
      return {
        'success': false,
        'error': 'Failed to fetch MPR data: $e',
      };
    }
  }

  // Get DPR data for a model
  static Future<Map<String, dynamic>> getDPRData(String modelId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/dpr?modelId=$modelId'),
      );

      final data = jsonDecode(response.body);
      return data;
    } catch (e) {
      return {
        'success': false,
        'error': 'Failed to fetch DPR data: $e',
      };
    }
  }

  // Get session data
  static Future<Map<String, dynamic>> getSessionData(
      String modelId, String date) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/session?modelId=$modelId&date=$date'),
      );

      final data = jsonDecode(response.body);
      return data;
    } catch (e) {
      return {
        'success': false,
        'error': 'Failed to fetch session data: $e',
      };
    }
  }

  // Log session (login/logout)
  static Future<Map<String, dynamic>> logSession({
    required String type,
    required String modelId,
    required String date,
    String? loginAt,
    String? logoutAt,
    required String deviceId,
    String? deviceName,
  }) async {
    try {
      final body = <String, dynamic>{
        'type': type,
        'modelId': modelId,
        'date': date,
        'deviceId': deviceId,
      };

      if (loginAt != null) body['loginAt'] = loginAt;
      if (logoutAt != null) body['logoutAt'] = logoutAt;
      if (deviceName != null) body['deviceName'] = deviceName;

      final response = await http.post(
        Uri.parse('$baseUrl/api/session'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(body),
      );

      final data = jsonDecode(response.body);
      return data;
    } catch (e) {
      return {
        'success': false,
        'error': 'Failed to log session: $e',
      };
    }
  }
}
