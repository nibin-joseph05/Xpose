import 'package:flutter/material.dart';
import 'dart:math' as math; // Add this import for math functions
import 'package:Xpose/main.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  // Logo animations
  late Animation<double> _logoScaleAnimation;
  late Animation<double> _logoOpacityAnimation;
  late Animation<Offset> _logoPositionAnimation;

  // Quote animations
  late Animation<double> _quoteOpacityAnimation;
  late Animation<Offset> _quotePositionAnimation;

  // Background animations
  late Animation<Color?> _bgGradientStartAnimation;
  late Animation<Color?> _bgGradientEndAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 4500),
      vsync: this,
    );

    _setupAnimations();

    _controller.forward().then((_) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const HomePage()),
      );
    });
  }

  void _setupAnimations() {
    // Logo scales up with overshoot, then settles
    _logoScaleAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: 0.5, end: 1.2)
            .chain(CurveTween(curve: Curves.elasticOut)),
        weight: 40,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.2, end: 1.0)
            .chain(CurveTween(curve: Curves.easeOut)),
        weight: 20,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.0, end: 1.0),
        weight: 30,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.0, end: 0.7)
            .chain(CurveTween(curve: Curves.easeIn)),
        weight: 10,
      ),
    ]).animate(_controller);

    // Logo fades in, stays visible, then fades out
    _logoOpacityAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: 0.0, end: 1.0)
            .chain(CurveTween(curve: Curves.easeInCubic)),
        weight: 20,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.0, end: 1.0),
        weight: 60,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.0, end: 0.0)
            .chain(CurveTween(curve: Curves.easeOut)),
        weight: 20,
      ),
    ]).animate(_controller);

    // Logo slides up slightly, then stays, then moves up more
    _logoPositionAnimation = TweenSequence<Offset>([
      TweenSequenceItem(
        tween: Tween<Offset>(begin: const Offset(0.0, 0.3), end: Offset.zero)
            .chain(CurveTween(curve: Curves.easeOutBack)),
        weight: 30,
      ),
      TweenSequenceItem(
        tween: Tween<Offset>(begin: Offset.zero, end: Offset.zero),
        weight: 50,
      ),
      TweenSequenceItem(
        tween: Tween<Offset>(begin: Offset.zero, end: const Offset(0.0, -0.4))
            .chain(CurveTween(curve: Curves.easeIn)),
        weight: 20,
      ),
    ]).animate(_controller);

    // Quote fades in later and stays visible
    _quoteOpacityAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: 0.0, end: 0.0),
        weight: 40,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 0.0, end: 1.0)
            .chain(CurveTween(curve: Curves.easeInOutQuint)),
        weight: 30,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.0, end: 1.0),
        weight: 30,
      ),
    ]).animate(_controller);

    // Quote slides up slightly when appearing
    _quotePositionAnimation = TweenSequence<Offset>([
      TweenSequenceItem(
        tween: Tween<Offset>(begin: const Offset(0.0, 0.2), end: const Offset(0.0, 0.2)),
        weight: 40,
      ),
      TweenSequenceItem(
        tween: Tween<Offset>(begin: const Offset(0.0, 0.2), end: Offset.zero)
            .chain(CurveTween(curve: Curves.easeOutBack)),
        weight: 30,
      ),
      TweenSequenceItem(
        tween: Tween<Offset>(begin: Offset.zero, end: Offset.zero),
        weight: 30,
      ),
    ]).animate(_controller);

    // Background gradient color shift
    _bgGradientStartAnimation = ColorTween(
      begin: const Color(0xFF0F2027),
      end: const Color(0xFF1A2E39),
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.0, 0.5, curve: Curves.easeInOutSine),
    ));

    _bgGradientEndAnimation = ColorTween(
      begin: const Color(0xFF2C5364),
      end: const Color(0xFF3A7D8C),
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: const Interval(0.0, 0.5, curve: Curves.easeInOutSine),
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Stack(
            children: [
              // Animated background
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        _bgGradientStartAnimation.value!,
                        _bgGradientEndAnimation.value!,
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      stops: const [0.1, 0.9],
                    ),
                  ),
                ),
              ),

              // Subtle animated particles in background
              Positioned.fill(
                child: IgnorePointer(
                  child: Opacity(
                    opacity: 0.15,
                    child: CustomPaint(
                      painter: _ParticlePainter(progress: _controller.value),
                    ),
                  ),
                ),
              ),

              Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Logo with multiple animations
                    Transform.translate(
                      offset: _logoPositionAnimation.value * (MediaQuery.of(context).size.height / 2),
                      child: Transform.scale(
                        scale: _logoScaleAnimation.value,
                        child: Opacity(
                          opacity: _logoOpacityAnimation.value,
                          child: Image.asset(
                            'assets/logo/xpose-logo-round.png',
                            width: 180,
                            height: 180,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 30),

                    // Quote with animations
                    Transform.translate(
                      offset: _quotePositionAnimation.value * 20,
                      child: Opacity(
                        opacity: _quoteOpacityAnimation.value,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 40.0),
                          child: Column(
                            children: [
                              Text(
                                'Courage is contagious.',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white.withOpacity(0.95),
                                  height: 1.4,
                                  shadows: [
                                    Shadow(
                                      color: Colors.black.withOpacity(0.4),
                                      offset: const Offset(1, 1),
                                      blurRadius: 4,
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'When one person stands up,\nothers are empowered to do the same.',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w400,
                                  color: Colors.white.withOpacity(0.85),
                                  fontStyle: FontStyle.italic,
                                  height: 1.4,
                                  shadows: [
                                    Shadow(
                                      color: Colors.black.withOpacity(0.3),
                                      offset: const Offset(1, 1),
                                      blurRadius: 3,
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 16),
                              // Author attribution
                              Opacity(
                                opacity: _quoteOpacityAnimation.value * 0.9,
                                child: Text(
                                  '- Nora Raleigh Baskin',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.white.withOpacity(0.7),
                                    fontStyle: FontStyle.italic,
                                  ),
                                ),
                              ),
                            ],
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

// Background particle animation
class _ParticlePainter extends CustomPainter {
  final double progress;

  _ParticlePainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    final particleCount = 30;
    final radius = 2.0;

    for (int i = 0; i < particleCount; i++) {
      final xPos = (size.width * 0.2) + (size.width * 0.6 * (i / particleCount));
      final yPos = size.height * 0.2 +
          (size.height * 0.6 * (i / particleCount)) +
          (50 * math.sin(progress * 2 * math.pi + i * 0.5));

      canvas.drawCircle(
        Offset(xPos, yPos),
        radius * (0.5 + 0.5 * math.sin(progress * 2 * math.pi + i)),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}