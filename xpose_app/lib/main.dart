import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // Required for SystemChrome
import 'package:Xpose/components/splash_screen.dart'; // Import the splash screen

void main() {
  // Ensure Flutter binding is initialized before setting system overlays
  WidgetsFlutterBinding.ensureInitialized();
  // Set preferred orientations to portrait only for mobile app feel
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  // Set system UI overlay style (status bar and navigation bar colors)
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent, // Transparent status bar
    statusBarIconBrightness: Brightness.light, // White status bar icons
    systemNavigationBarColor: Color(0xFF1A1A1A), // Dark navigation bar
    systemNavigationBarIconBrightness: Brightness.light, // White navigation bar icons
  ));
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'XPOSE',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        hintColor: const Color(0xFFFFB200), // Orange/yellow accent from logo
        scaffoldBackgroundColor: const Color(0xFF1A1A1A), // Dark background matching logo
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF1A1A1A),
          foregroundColor: Colors.white,
          elevation: 0,
        ),
        textTheme: const TextTheme(
          bodyLarge: TextStyle(color: Colors.white),
          bodyMedium: TextStyle(color: Colors.white70),
          titleLarge: TextStyle(color: Colors.white),
          titleMedium: TextStyle(color: Colors.white),
        ),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF00BFFF), // Bright blue from logo
          secondary: Color(0xFFFFB200), // Orange/yellow accent
          surface: Color(0xFF2F363F), // Darker grey from logo
          background: Color(0xFF1A1A1A), // Black background
          onPrimary: Colors.white,
          onSecondary: Colors.black,
          onSurface: Colors.white,
          onBackground: Colors.white,
        ),
        // Add text selection theme for better UX
        textSelectionTheme: const TextSelectionThemeData(
          cursorColor: Color(0xFFFFB200),
          selectionColor: Color(0x3300BFFF),
          selectionHandleColor: Color(0xFFFFB200),
        ),
      ),
      home: const SplashScreen(), // Start with the SplashScreen
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background, // Maintain dark background
      appBar: AppBar(
        title: Text(
          'XPOSE',
          style: TextStyle(
            color: Theme.of(context).colorScheme.primary, // Primary color for app bar title
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        backgroundColor: Theme.of(context).colorScheme.background, // Match scaffold background
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Welcome to XPOSE',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: Theme.of(context).colorScheme.primary,
                fontSize: 32,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Securely reporting for a safer community.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onBackground.withOpacity(0.7),
                fontSize: 18,
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ),
      ),
    );
  }
}