import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:provider/provider.dart';
import 'package:Xpose/providers/theme_provider.dart';

class SecurityPrivacyPage extends StatefulWidget {
  const SecurityPrivacyPage({super.key});

  @override
  State<SecurityPrivacyPage> createState() => _SecurityPrivacyPageState();
}

class _SecurityPrivacyPageState extends State<SecurityPrivacyPage> {
  AppTheme _selectedTheme = AppTheme.system;
  bool _locationGranted = false;

  @override
  void initState() {
    super.initState();
    _loadSettings();
    _checkLocationPermission();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    final storedThemeIndex = prefs.getInt('app_theme') ?? AppTheme.system.index;


    final loadedTheme = storedThemeIndex >= 0 && storedThemeIndex < AppTheme.values.length
        ? AppTheme.values[storedThemeIndex]
        : AppTheme.system;

    setState(() {
      _selectedTheme = loadedTheme;
    });

    final themeProvider = Provider.of<ThemeProvider>(context, listen: false);


    themeProvider.setTheme(_selectedTheme);
  }

  Future<void> _updateTheme(AppTheme theme) async {
    final prefs = await SharedPreferences.getInstance();
    final themeProvider = Provider.of<ThemeProvider>(context, listen: false);

    setState(() {
      _selectedTheme = theme;
    });

    await prefs.setInt('app_theme', theme.index);


    themeProvider.setTheme(theme);
  }


  Future<void> _checkLocationPermission() async {
    final status = await Permission.location.status;
    setState(() {
      _locationGranted = status.isGranted;
    });
  }

  Future<void> _requestLocationPermission() async {

    final status = await Permission.location.request();
    setState(() {
      _locationGranted = status.isGranted;
    });
    if (!status.isGranted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Location permission denied. You may need to grant it in app settings.'),
          action: SnackBarAction(
            label: 'Settings',
            onPressed: () {
              openAppSettings();
            },
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final primaryColor = colorScheme.primary;
    final onSurfaceColor = colorScheme.onSurface;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Security & Privacy',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: colorScheme.onBackground,
          ),
        ),
        backgroundColor: colorScheme.surface,
        foregroundColor: colorScheme.onSurface,
        centerTitle: true,
        elevation: 1,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Card(
              margin: const EdgeInsets.symmetric(vertical: 12),
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
                side: BorderSide(color: onSurfaceColor.withOpacity(0.05)),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'App Theme',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: primaryColor,
                      ),
                    ),
                    const SizedBox(height: 8),
                    RadioListTile<AppTheme>(
                      value: AppTheme.light,
                      groupValue: _selectedTheme,
                      title: const Text('Light Mode'),
                      onChanged: (val) {
                        if (val != null) _updateTheme(val);
                      },
                      activeColor: primaryColor,
                    ),
                    RadioListTile<AppTheme>(
                      value: AppTheme.dark,
                      groupValue: _selectedTheme,
                      title: const Text('Dark Mode'),
                      onChanged: (val) {
                        if (val != null) _updateTheme(val);
                      },
                      activeColor: primaryColor,
                    ),
                    RadioListTile<AppTheme>(
                      value: AppTheme.system,
                      groupValue: _selectedTheme,
                      title: const Text('Follow System'),
                      onChanged: (val) {
                        if (val != null) _updateTheme(val);
                      },
                      activeColor: primaryColor,
                    ),
                  ],
                ),
              ),
            ),

            Card(
              margin: const EdgeInsets.symmetric(vertical: 12),
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
                side: BorderSide(color: onSurfaceColor.withOpacity(0.05)),
              ),
              child: Column(
                children: [
                  ListTile(
                    leading: Icon(
                      _locationGranted ? Icons.location_on : Icons.location_off,
                      color: _locationGranted ? Colors.green : colorScheme.error,
                      size: 28,
                    ),
                    title: const Text('Location Access'),
                    subtitle: Text(_locationGranted
                        ? 'Location access granted'
                        : 'Tap to grant location access'),
                    trailing: Icon(Icons.arrow_forward_ios, size: 18, color: onSurfaceColor.withOpacity(0.6)),
                    onTap: _requestLocationPermission,
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8),
                    child: Text(
                      'Your location is used only for crime reporting purposes and not stored permanently. We respect your privacy.',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: onSurfaceColor.withOpacity(0.7),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}