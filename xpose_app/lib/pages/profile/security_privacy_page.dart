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
  bool _smsGranted = false;
  bool _phoneGranted = false;
  bool _storageGranted = false;
  bool _isRequestingPermission = false;

  @override
  void initState() {
    super.initState();
    _loadSettings();
    _checkAllPermissions();
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

  Future<void> _checkAllPermissions() async {
    await _checkLocationPermission();
    await _checkSMSPermission();
    await _checkPhonePermission();
    await _checkStoragePermission();
  }

  Future<void> _checkLocationPermission() async {
    final status = await Permission.location.status;
    setState(() {
      _locationGranted = status.isGranted;
    });
  }

  Future<void> _checkSMSPermission() async {
    final status = await Permission.sms.status;
    setState(() {
      _smsGranted = status.isGranted;
    });
  }

  Future<void> _checkPhonePermission() async {
    final status = await Permission.phone.status;
    setState(() {
      _phoneGranted = status.isGranted;
    });
  }

  Future<void> _checkStoragePermission() async {
    final status = await Permission.storage.status;
    setState(() {
      _storageGranted = status.isGranted;
    });
  }

  Future<void> _requestLocationPermission() async {
    if (_isRequestingPermission) return;

    setState(() {
      _isRequestingPermission = true;
    });

    try {
      final status = await Permission.location.request();
      setState(() {
        _locationGranted = status.isGranted;
      });
      if (!status.isGranted) {
        _showPermissionDeniedSnackBar('Location');
      }
    } finally {
      setState(() {
        _isRequestingPermission = false;
      });
    }
  }

  Future<void> _requestSMSPermission() async {
    if (_isRequestingPermission) return;

    setState(() {
      _isRequestingPermission = true;
    });

    try {
      final status = await Permission.sms.request();
      setState(() {
        _smsGranted = status.isGranted;
      });
      if (!status.isGranted) {
        _showPermissionDeniedSnackBar('SMS');
      }
    } finally {
      setState(() {
        _isRequestingPermission = false;
      });
    }
  }

  Future<void> _requestPhonePermission() async {
    if (_isRequestingPermission) return;

    setState(() {
      _isRequestingPermission = true;
    });

    try {
      final status = await Permission.phone.request();
      setState(() {
        _phoneGranted = status.isGranted;
      });
      if (!status.isGranted) {
        _showPermissionDeniedSnackBar('Phone');
      }
    } finally {
      setState(() {
        _isRequestingPermission = false;
      });
    }
  }

  Future<void> _requestStoragePermission() async {
    if (_isRequestingPermission) return;

    setState(() {
      _isRequestingPermission = true;
    });

    try {
      final status = await Permission.storage.request();
      setState(() {
        _storageGranted = status.isGranted;
      });
      if (!status.isGranted) {
        _showPermissionDeniedSnackBar('Storage');
      }
    } finally {
      setState(() {
        _isRequestingPermission = false;
      });
    }
  }

  void _showPermissionDeniedSnackBar(String permissionName) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$permissionName permission denied. You may need to grant it in app settings.'),
        action: SnackBarAction(
          label: 'Settings',
          onPressed: () {
            openAppSettings();
          },
        ),
      ),
    );
  }

  Widget _buildPermissionCard({
    required String title,
    required String description,
    required bool isGranted,
    required VoidCallback onTap,
    required IconData icon,
    Color? iconColor,
  }) {
    final colorScheme = Theme.of(context).colorScheme;
    final primaryColor = colorScheme.primary;
    final onSurfaceColor = colorScheme.onSurface;

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8),
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(color: onSurfaceColor.withOpacity(0.05)),
      ),
      child: Column(
        children: [
          ListTile(
            leading: _isRequestingPermission
                ? SizedBox(
              width: 28,
              height: 28,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(primaryColor),
              ),
            )
                : Icon(
              icon,
              color: iconColor ?? (isGranted ? Colors.green : colorScheme.error),
              size: 28,
            ),
            title: Text(title),
            subtitle: Text(
              _isRequestingPermission ? 'Requesting permission...' :
              isGranted ? 'Permission granted' : 'Tap to grant permission',
              style: TextStyle(
                color: isGranted ? Colors.green : colorScheme.error,
              ),
            ),
            trailing: _isRequestingPermission
                ? null
                : Icon(Icons.arrow_forward_ios, size: 18, color: onSurfaceColor.withOpacity(0.6)),
            onTap: _isRequestingPermission ? null : onTap,
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8),
            child: Text(
              description,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: onSurfaceColor.withOpacity(0.7),
              ),
            ),
          ),
        ],
      ),
    );
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
          crossAxisAlignment: CrossAxisAlignment.start,
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


            Padding(
              padding: const EdgeInsets.only(top: 16, bottom: 8),
              child: Text(
                'App Permissions',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: primaryColor,
                ),
              ),
            ),

            Text(
              'These permissions are required for emergency SOS features to work properly. We respect your privacy and only use these when you activate SOS.',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: onSurfaceColor.withOpacity(0.7),
              ),
            ),
            const SizedBox(height: 16),


            _buildPermissionCard(
              title: 'Location Access',
              description: 'Your location is used for emergency SOS alerts to send your precise location to emergency contacts. This helps authorities respond quickly when you need help.',
              isGranted: _locationGranted,
              onTap: _requestLocationPermission,
              icon: _locationGranted ? Icons.location_on : Icons.location_off,
            ),


            _buildPermissionCard(
              title: 'SMS Access',
              description: 'Required for sending emergency SOS alerts to your contacts. When you activate SOS, we send your location via SMS to emergency services and trusted contacts.',
              isGranted: _smsGranted,
              onTap: _requestSMSPermission,
              icon: _smsGranted ? Icons.sms : Icons.sms_failed,
            ),


            _buildPermissionCard(
              title: 'Phone Access',
              description: 'Used for making emergency calls and identifying your device during SOS situations. This ensures quick connection with emergency services.',
              isGranted: _phoneGranted,
              onTap: _requestPhonePermission,
              icon: _phoneGranted ? Icons.phone : Icons.phone_disabled,
            ),


            _buildPermissionCard(
              title: 'Storage Access',
              description: 'Allows you to save emergency contacts, incident reports, and backup your safety data. You have full control over what gets stored.',
              isGranted: _storageGranted,
              onTap: _requestStoragePermission,
              icon: _storageGranted ? Icons.storage : Icons.sd_storage,
            ),


            Container(
              margin: const EdgeInsets.only(top: 20, bottom: 10),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: primaryColor.withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.emergency, color: primaryColor, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'Emergency Features',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: primaryColor,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'All permissions are specifically for SOS emergency features. We request them upfront so the app works instantly during emergencies without asking for permissions when every second counts.',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: onSurfaceColor.withOpacity(0.8),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'No data is collected or shared unless you activate the SOS feature.',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.green,
                      fontWeight: FontWeight.bold,
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