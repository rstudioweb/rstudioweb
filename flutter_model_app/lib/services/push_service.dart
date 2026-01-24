import 'dart:convert';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

import '../firebase_options.dart';
import '../core/constants/app_constants.dart';

/// Handles Firebase Cloud Messaging setup and token logging.
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Ensure Firebase is initialized before handling background messages.
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  debugPrint('FCM background message: ${message.messageId}');
  await _storeNotification(message);
}

Future<void> _storeNotification(RemoteMessage message) async {
  final prefs = await SharedPreferences.getInstance();
  final notifications = prefs.getStringList('notifications') ?? [];

  final notification = {
    'title': message.notification?.title ?? '',
    'body': message.notification?.body ?? '',
    'imageUrl': message.notification?.android?.imageUrl ?? '',
    'timestamp': DateTime.now().toIso8601String(),
    'messageId': message.messageId ?? '',
  };

  notifications.insert(0, jsonEncode(notification));
  // Keep only last 50 notifications
  if (notifications.length > 50) {
    notifications.removeRange(50, notifications.length);
  }
  await prefs.setStringList('notifications', notifications);
}

class PushService {
  static bool _initialized = false;

  static Future<void> init({String? modelId}) async {
    if (_initialized) return;
    _initialized = true;

    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

    final messaging = FirebaseMessaging.instance;

    // Request permission (a no-op on Android below 13, but safe to call).
    final settings = await messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    // Configure notification channel with custom sound
    await messaging.setForegroundNotificationPresentationOptions(
      alert: true,
      badge: true,
      sound: true,
    );

    // Get and store FCM token
    final token = await messaging.getToken();
    debugPrint('FCM token: $token');

    if (token != null && modelId != null) {
      await _storeTokenInFirebase(token, modelId);
    }

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen((message) {
      debugPrint('FCM foreground message: ${message.messageId}');
      _storeNotification(message);
    });

    // Listen for token refresh
    messaging.onTokenRefresh.listen((newToken) {
      debugPrint('FCM token refreshed: $newToken');
      if (modelId != null) {
        _storeTokenInFirebase(newToken, modelId);
      }
    });
  }

  static Future<void> _storeTokenInFirebase(
      String token, String modelId) async {
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
        debugPrint('FCM token stored in Firebase');
      } else {
        debugPrint('Failed to store FCM token: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('Error storing FCM token: $e');
    }
  }

  static Future<List<Map<String, dynamic>>> getNotifications() async {
    final prefs = await SharedPreferences.getInstance();
    final notifications = prefs.getStringList('notifications') ?? [];

    return notifications
        .map((n) => Map<String, dynamic>.from(jsonDecode(n)))
        .toList();
  }

  static Future<void> clearNotifications() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('notifications');
  }
}
