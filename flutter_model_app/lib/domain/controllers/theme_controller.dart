import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/constants/app_constants.dart';

class ThemeController with ChangeNotifier {
  static const String _lightTheme = 'light';
  static const String _darkTheme = 'dark';
  static const String _systemTheme = 'system';

  ThemeMode _themeMode = ThemeMode.system;
  final _storage = const FlutterSecureStorage();

  ThemeMode get themeMode => _themeMode;

  String get currentThemeName {
    switch (_themeMode) {
      case ThemeMode.light:
        return _lightTheme;
      case ThemeMode.dark:
        return _darkTheme;
      case ThemeMode.system:
        return _systemTheme;
    }
  }

  ThemeController() {
    _loadTheme();
  }

  Future<void> _loadTheme() async {
    try {
      final saved = await _storage.read(key: AppConstants.themeKey);
      if (saved == _darkTheme) {
        _themeMode = ThemeMode.dark;
      } else if (saved == _lightTheme) {
        _themeMode = ThemeMode.light;
      } else {
        _themeMode = ThemeMode.system;
      }
      notifyListeners();
    } catch (e) {
      _themeMode = ThemeMode.system;
    }
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    _themeMode = mode;
    String modeString = _systemTheme;
    if (mode == ThemeMode.light) {
      modeString = _lightTheme;
    } else if (mode == ThemeMode.dark) {
      modeString = _darkTheme;
    }
    await _storage.write(key: AppConstants.themeKey, value: modeString);
    notifyListeners();
  }

  Future<void> setLightTheme() => setThemeMode(ThemeMode.light);
  Future<void> setDarkTheme() => setThemeMode(ThemeMode.dark);
  Future<void> setSystemTheme() => setThemeMode(ThemeMode.system);
}
