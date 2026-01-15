import 'dart:io';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/foundation.dart';

class DeviceHelper {
  static Future<Map<String, String>> getDeviceFingerprint() async {
    final deviceInfo = DeviceInfoPlugin();
    String deviceId = 'unknown';
    String deviceName = 'Unknown Device';

    try {
      if (kIsWeb) {
        final webInfo = await deviceInfo.webBrowserInfo;
        deviceId = webInfo.userAgent ?? 'web-unknown';
        deviceName = '${webInfo.browserName} on ${webInfo.platform}';
      } else if (Platform.isAndroid) {
        final androidInfo = await deviceInfo.androidInfo;
        deviceId = androidInfo.id;
        deviceName = '${androidInfo.brand} ${androidInfo.model}';
      } else if (Platform.isIOS) {
        final iosInfo = await deviceInfo.iosInfo;
        deviceId = iosInfo.identifierForVendor ?? 'ios-unknown';
        deviceName = '${iosInfo.name} (${iosInfo.model})';
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error getting device info: $e');
      }
    }

    return {'deviceId': deviceId, 'deviceName': deviceName};
  }
}
