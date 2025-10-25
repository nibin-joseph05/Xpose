import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum AppTheme { light, dark, system }

class ThemeProvider extends ChangeNotifier {
  AppTheme _theme = AppTheme.system;

  AppTheme get theme => _theme;

  ThemeMode get themeMode {
    switch (_theme) {
      case AppTheme.light:
        return ThemeMode.light;
      case AppTheme.dark:
        return ThemeMode.dark;
      case AppTheme.system:
      default:
        return ThemeMode.system;
    }
  }

  ThemeProvider() {
    _loadTheme();
  }

  Future<void> _loadTheme() async {
    final prefs = await SharedPreferences.getInstance();
    _theme = AppTheme.values[prefs.getInt('app_theme') ?? 2];
    notifyListeners();
  }

  Future<void> setTheme(AppTheme newTheme) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('app_theme', newTheme.index);
    _theme = newTheme;
    notifyListeners();
  }
}
