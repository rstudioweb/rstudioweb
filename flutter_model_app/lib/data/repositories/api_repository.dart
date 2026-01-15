import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../core/constants/app_constants.dart';

class ApiRepository {
  Future<Map<String, dynamic>> login(String username, String password) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConstants.baseUrl}/api/model/login'),
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

  Future<Map<String, dynamic>> getModelProfile(String modelId) async {
    try {
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/api/model/list'),
        headers: {'Content-Type': 'application/json'},
      );

      final data = jsonDecode(response.body);
      if (data['success'] == true && data['data'] != null) {
        final List<dynamic> models = data['data'];
        final model = models.firstWhere(
          (m) => m['id'] == modelId,
          orElse: () => null,
        );
        if (model != null) {
          return {
            'success': true,
            'data': model,
          };
        }
      }
      return {
        'success': false,
        'error': 'Model not found',
      };
    } catch (e) {
      return {
        'success': false,
        'error': 'Connection failed: $e',
      };
    }
  }

  Future<Map<String, dynamic>> getMPRData(String modelId) async {
    try {
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/api/mpr?modelId=$modelId'),
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

  Future<Map<String, dynamic>> getDPRData(String modelId) async {
    try {
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/api/dpr?modelId=$modelId'),
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

  Future<Map<String, dynamic>> getSessionData(
      String modelId, String date) async {
    try {
      final response = await http.get(
        Uri.parse(
            '${AppConstants.baseUrl}/api/session?modelId=$modelId&date=$date'),
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

  Future<Map<String, dynamic>> logSession({
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
        Uri.parse('${AppConstants.baseUrl}/api/session'),
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

  Future<Map<String, dynamic>> getCamSites(String modelId) async {
    try {
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/api/camsites?modelId=$modelId'),
      );

      if (response.statusCode < 200 || response.statusCode >= 300) {
        return {
          'success': false,
          'error': 'Server error (${response.statusCode}). Please try again.',
        };
      }

      try {
        final data = jsonDecode(response.body);
        if (data is Map<String, dynamic>) {
          return data;
        }
        return {
          'success': false,
          'error': 'Unexpected response format from server.',
        };
      } on FormatException {
        return {
          'success': false,
          'error': 'Unexpected response from server. Please try again.',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'error': 'Failed to fetch camera sites: $e',
      };
    }
  }

  Future<Map<String, dynamic>> addCamSite({
    required String modelId,
    required String name,
    required String status,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConstants.baseUrl}/api/camsites'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'modelId': modelId,
          'name': name,
          'status': status,
        }),
      );

      final data = jsonDecode(response.body);
      return data;
    } catch (e) {
      return {
        'success': false,
        'error': 'Failed to add camera site: $e',
      };
    }
  }

  Future<Map<String, dynamic>> updateCamSiteStatus(
    String siteId,
    String status,
  ) async {
    try {
      final response = await http.put(
        Uri.parse('${AppConstants.baseUrl}/api/camsites'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'siteId': siteId,
          'status': status,
        }),
      );

      final data = jsonDecode(response.body);
      return data;
    } catch (e) {
      return {
        'success': false,
        'error': 'Failed to update camera site: $e',
      };
    }
  }

  Future<Map<String, dynamic>> getAccountApproval(String modelId) async {
    try {
      final response = await http.get(
        Uri.parse(
            '${AppConstants.baseUrl}/api/accountApproval?modelId=$modelId'),
      );

      final data = jsonDecode(response.body);
      return data;
    } catch (e) {
      return {
        'success': false,
        'error': 'Failed to fetch account approvals: $e',
      };
    }
  }
}
