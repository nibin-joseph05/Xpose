import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // Required for SystemChrome

void main() {
  // Ensure Flutter binding is initialized before setting system overlays
  WidgetsFlutterBinding.ensureInitialized();
  // Set preferred orientations to portrait only for mobile app feel
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  // Set system UI overlay style (status bar and navigation bar colors)
  SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
    statusBarColor: Colors.transparent, // Transparent status bar
    statusBarIconBrightness: Brightness.light, // White status bar icons
    systemNavigationBarColor: const Color(0xFF1A1A1A), // Dark navigation bar
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
        // primarySwatch is deprecated in favor of colorScheme
        // You can remove primarySwatch: Colors.blue, if you're using ColorScheme.dark fully
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
      home: const SplashScreen(),
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  // Animations for logo and quote
  late Animation<double> _logoInitialScaleAnimation;
  late Animation<double> _logoInitialOpacityAnimation;
  late Animation<double> _quoteOpacityAnimation;

  // Animations for final logo movement and fade-out
  late Animation<Offset> _logoSlideAnimation;
  late Animation<double> _logoFinalOpacityAnimation;
  late Animation<double> _logoFinalScaleAnimation;


  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 4000), // Total splash screen duration increased for more complex animation
      vsync: this,
    );

    // --- Phase 1: Logo fades in and scales up ---
    _logoInitialScaleAnimation = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.4, curve: Curves.easeOut), // Logo scales in during first 40%
      ),
    );

    _logoInitialOpacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.5, curve: Curves.easeIn), // Logo fades in during first 50%
      ),
    );

    // --- Phase 2: Quote fades in after logo is mostly visible ---
    _quoteOpacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.5, 0.7, curve: Curves.easeIn), // Quote fades in from 50% to 70%
      ),
    );

    // --- Phase 3: Logo moves to center, scales slightly, and fades out ---
    // Calculate start and end offsets dynamically for the logo to move
    _logoSlideAnimation = Tween<Offset>(
      begin: const Offset(0.0, 0.0), // Start at center (relative to its initial position)
      end: const Offset(0.0, -0.2), // Move slightly up (relative to its initial position)
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.75, 1.0, curve: Curves.easeOutCubic), // Move from 75% to 100%
      ),
    );

    _logoFinalOpacityAnimation = Tween<double>(begin: 1.0, end: 0.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.8, 1.0, curve: Curves.easeOut), // Fades out from 80% to 100%
      ),
    );

    _logoFinalScaleAnimation = Tween<double>(begin: 1.0, end: 0.8).animate( // Shrinks slightly
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.75, 1.0, curve: Curves.easeOut), // Scales from 75% to 100%
      ),
    );

    _controller.forward();

    _controller.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        // Navigate to HomePage after all animations complete
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const HomePage()),
        );
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      body: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          // Calculate the combined scale and opacity values
          // This is where you combine the 'double' values from your animations
          final double combinedScale = _logoInitialScaleAnimation.value * _logoFinalScaleAnimation.value;
          final double combinedOpacity = _logoInitialOpacityAnimation.value * _logoFinalOpacityAnimation.value;

          return Stack(
            children: [
              // This ensures the background remains dark
              Positioned.fill(
                child: Container(color: Theme.of(context).colorScheme.background),
              ),
              Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Logo animations
                    Transform.translate(
                      // Apply the slide animation offset
                      offset: _logoSlideAnimation.value * (MediaQuery.of(context).size.height / 2),
                      child: Transform.scale( // Use Transform.scale for the combined scale
                        scale: combinedScale,
                        child: Opacity( // Use Opacity for the combined opacity
                          opacity: combinedOpacity,
                          child: Image.asset(
                            'assets/logo/xpose-logo.png', // Ensure this path is correct in pubspec.yaml
                            width: 150,
                            height: 150,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 30),
                    // Quote with fade animation, appears after initial logo animation
                    Opacity(
                      opacity: _quoteOpacityAnimation.value,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 40.0),
                        child: Text(
                          'Courage is contagious. When one person stands up, others are empowered to do the same.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w400,
                            color: Theme.of(context).colorScheme.onBackground.withOpacity(0.8),
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
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