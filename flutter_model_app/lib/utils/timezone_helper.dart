import 'package:intl/intl.dart';

class TimezoneHelper {
  static final DateFormat _dateFormat = DateFormat('yyyy-MM-dd');
  static final DateFormat _timestampFormat = DateFormat(
    "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  );

  // Get IST date string (YYYY-MM-DD)
  static String getISTDate() {
    final now = DateTime.now().toUtc().add(
      const Duration(hours: 5, minutes: 30),
    );
    return _dateFormat.format(now);
  }

  // Get IST timestamp
  static String getISTTimestamp() {
    final now = DateTime.now().toUtc().add(
      const Duration(hours: 5, minutes: 30),
    );
    return _timestampFormat.format(now);
  }

  // Convert DateTime to IST date string
  static String toISTDateString(DateTime date) {
    final istDate = date.toUtc().add(const Duration(hours: 5, minutes: 30));
    return _dateFormat.format(istDate);
  }

  // Format seconds to HH:MM:SS
  static String formatSeconds(int seconds) {
    final hours = seconds ~/ 3600;
    final minutes = (seconds % 3600) ~/ 60;
    final secs = seconds % 60;
    return '${hours.toString().padLeft(2, '0')}:${minutes.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }
}
