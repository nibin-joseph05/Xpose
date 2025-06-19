import 'package:flutter/material.dart';
import 'dart:math' as math;
import 'package:Xpose/pages/home/home.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  late AnimationController _mainController;
  late AnimationController _particleController;
  late AnimationController _loadingController;
  late AnimationController _rippleController;

  // Logo animations
  late Animation<double> _logoScaleAnimation;
  late Animation<double> _logoOpacityAnimation;
  late Animation<Offset> _logoPositionAnimation;
  late Animation<double> _logoRotationAnimation;

  // Quote animations
  late Animation<double> _quoteOpacityAnimation;
  late Animation<Offset> _quotePositionAnimation;
  late Animation<double> _quoteScaleAnimation;

  // Background animations
  late Animation<Color?> _bgGradientStartAnimation;
  late Animation<Color?> _bgGradientEndAnimation;
  late Animation<Color?> _bgGradientMidAnimation;

  // Loading animations
  late Animation<double> _loadingOpacityAnimation;
  late Animation<double> _loadingScaleAnimation;
  late Animation<double> _loadingRotationAnimation;

  // Effects animations
  late Animation<double> _shimmerAnimation;
  late Animation<double> _pulseAnimation;
  late Animation<double> _rippleScaleAnimation;
  late Animation<double> _rippleOpacityAnimation;

  @override
  void initState() {
    super.initState();
    _setupControllers();
    _setupAnimations();
    _startAnimationSequence();
  }

  void _setupControllers() {
    _mainController = AnimationController(
      duration: const Duration(milliseconds: 6000),
      vsync: this,
    );

    _particleController = AnimationController(
      duration: const Duration(milliseconds: 8000),
      vsync: this,
    )..repeat();

    _loadingController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat();

    _rippleController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    )..repeat(reverse: true);
  }

  void _setupAnimations() {
    // Logo animations
    _logoScaleAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: 0.0, end: 1.2)
            .chain(CurveTween(curve: Curves.elasticOut.flipped)),
        weight: 25,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.3, end: 1.0)
            .chain(CurveTween(curve: Curves.easeOutBack)),
        weight: 20,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.0, end: 1.05)
            .chain(CurveTween(curve: Curves.easeInOut)),
        weight: 35,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.05, end: 0.85)
            .chain(CurveTween(curve: Curves.easeInCubic)),
        weight: 20,
      ),
    ]).animate(_mainController);

    _logoOpacityAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: 0.0, end: 1.0)
            .chain(CurveTween(curve: Curves.easeInOutQuart)),
        weight: 20,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.0, end: 1.0),
        weight: 50,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.0, end: 0.0)
            .chain(CurveTween(curve: Curves.easeInExpo)),
        weight: 30,
      ),
    ]).animate(_mainController);

    _logoPositionAnimation = TweenSequence<Offset>([
      TweenSequenceItem(
        tween: Tween<Offset>(begin: const Offset(0.0, 0.4), end: Offset.zero)
            .chain(CurveTween(curve: Curves.easeOutQuad)),
        weight: 25,
      ),
      TweenSequenceItem(
        tween: Tween<Offset>(begin: Offset.zero, end: Offset.zero),
        weight: 45,
      ),
      TweenSequenceItem(
        tween: Tween<Offset>(begin: Offset.zero, end: const Offset(0.0, -0.8))
            .chain(CurveTween(curve: Curves.easeInCubic)),
        weight: 30,
      ),
    ]).animate(_mainController);

    _logoRotationAnimation = Tween<double>(begin: 0.0, end: 0.1).animate(
      CurvedAnimation(
        parent: _mainController,
        curve: const Interval(0.0, 0.3, curve: Curves.easeOut),
      ),
    );

    // Quote animations
    _quoteOpacityAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: 0.0, end: 0.0),
        weight: 35,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 0.0, end: 1.0)
            .chain(CurveTween(curve: Curves.easeInOutQuart)),
        weight: 20,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.0, end: 0.0)
            .chain(CurveTween(curve: Curves.easeInExpo)),
        weight: 45,
      ),
    ]).animate(_mainController);

    _quotePositionAnimation = TweenSequence<Offset>([
      TweenSequenceItem(
        tween: Tween<Offset>(begin: const Offset(0.0, 0.3), end: const Offset(0.0, 0.3)),
        weight: 35,
      ),
      TweenSequenceItem(
        tween: Tween<Offset>(begin: const Offset(0.0, 0.3), end: Offset.zero)
            .chain(CurveTween(curve: Curves.easeOutBack)),
        weight: 20,
      ),
      TweenSequenceItem(
        tween: Tween<Offset>(begin: Offset.zero, end: const Offset(0.0, -0.2))
            .chain(CurveTween(curve: Curves.easeInCubic)),
        weight: 45,
      ),
    ]).animate(_mainController);

    _quoteScaleAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: 0.8, end: 0.8),
        weight: 35,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 0.8, end: 1.0)
            .chain(CurveTween(curve: Curves.easeOutBack)),
        weight: 20,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.0, end: 0.9)
            .chain(CurveTween(curve: Curves.easeIn)),
        weight: 45,
      ),
    ]).animate(_mainController);

    // Background gradient
    _bgGradientStartAnimation = ColorTween(
      begin: const Color(0xFF0F172A),
      end: const Color(0xFF1E293B),
    ).animate(CurvedAnimation(
      parent: _mainController,
      curve: const Interval(0.0, 0.8, curve: Curves.easeInOutSine),
    ));

    _bgGradientMidAnimation = ColorTween(
      begin: const Color(0xFF334155),
      end: const Color(0xFF475569),
    ).animate(CurvedAnimation(
      parent: _mainController,
      curve: const Interval(0.0, 0.8, curve: Curves.easeInOutSine),
    ));

    _bgGradientEndAnimation = ColorTween(
      begin: const Color(0xFF64748B),
      end: const Color(0xFF94A3B8),
    ).animate(CurvedAnimation(
      parent: _mainController,
      curve: const Interval(0.0, 0.8, curve: Curves.easeInOutSine),
    ));

    // Loading animations
    _loadingOpacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _mainController,
        curve: const Interval(0.75, 1.0, curve: Curves.easeInOut),
      ),
    );

    _loadingScaleAnimation = Tween<double>(begin: 0.6, end: 1.0).animate(
      CurvedAnimation(
        parent: _mainController,
        curve: const Interval(0.75, 1.0, curve: Curves.easeOutBack),
      ),
    );

    _loadingRotationAnimation = Tween<double>(begin: 0.0, end: 2 * math.pi).animate(
      CurvedAnimation(
        parent: _loadingController,
        curve: Curves.linear,
      ),
    );

    // Effects animations
    _shimmerAnimation = Tween<double>(begin: -1.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _mainController,
        curve: const Interval(0.2, 0.8, curve: Curves.easeInOut),
      ),
    );

    _pulseAnimation = Tween<double>(begin: 0.8, end: 1.2).animate(
      CurvedAnimation(
        parent: _loadingController,
        curve: Curves.easeInOut,
      ),
    );

    // Ripple effect
    _rippleScaleAnimation = Tween<double>(begin: 1.0, end: 1.4).animate(
      CurvedAnimation(
        parent: _rippleController,
        curve: Curves.easeOut,
      ),
    );

    _rippleOpacityAnimation = Tween<double>(begin: 0.6, end: 0.0).animate(
      CurvedAnimation(
        parent: _rippleController,
        curve: Curves.easeOut,
      ),
    );
  }

  void _startAnimationSequence() {
    _mainController.forward().then((_) {
      Future.delayed(const Duration(milliseconds: 800), () {
        _navigateToHome();
      });
    });
  }

  void _navigateToHome() {
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        transitionDuration: const Duration(milliseconds: 1200),
        reverseTransitionDuration: const Duration(milliseconds: 800),
        pageBuilder: (context, animation, secondaryAnimation) => const HomePage(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          final fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
            CurvedAnimation(
              parent: animation,
              curve: const Interval(0.0, 1.0, curve: Curves.easeInOutCubic),
            ),
          );

          final scaleAnimation = Tween<double>(begin: 0.95, end: 1.0).animate(
            CurvedAnimation(
              parent: animation,
              curve: const Interval(0.0, 0.7, curve: Curves.easeOutBack),
            ),
          );

          return FadeTransition(
            opacity: fadeAnimation,
            child: ScaleTransition(
              scale: scaleAnimation,
              child: child,
            ),
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    _mainController.dispose();
    _particleController.dispose();
    _loadingController.dispose();
    _rippleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AnimatedBuilder(
        animation: Listenable.merge([
          _mainController,
          _particleController,
          _loadingController,
          _rippleController
        ]),
        builder: (context, child) {
          return Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  _bgGradientStartAnimation.value!,
                  _bgGradientMidAnimation.value!,
                  _bgGradientEndAnimation.value!,
                ],
                begin: const Alignment(-0.8, -0.8),
                end: const Alignment(0.8, 0.8),
                stops: const [0.0, 0.5, 1.0],
              ),
            ),
            child: Stack(
              children: [
                // Particles layer
                Positioned.fill(
                  child: RepaintBoundary(
                    child: CustomPaint(
                      painter: _ParticlePainter(
                        progress: _particleController.value,
                        opacity: _mainController.value * 0.15,
                      ),
                    ),
                  ),
                ),

                // Shimmer effect layer
                Positioned.fill(
                  child: RepaintBoundary(
                    child: CustomPaint(
                      painter: _ShimmerPainter(
                        progress: _shimmerAnimation.value,
                        opacity: _logoOpacityAnimation.value * 0.2,
                      ),
                    ),
                  ),
                ),

                // Main content
                Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Stack(
                        alignment: Alignment.center,
                        children: [
                          // Ripple effect
                          AnimatedBuilder(
                            animation: _rippleController,
                            builder: (context, child) {
                              return Transform.scale(
                                scale: _rippleScaleAnimation.value,
                                child: Opacity(
                                  opacity: _rippleOpacityAnimation.value,
                                  child: Container(
                                    width: 240,
                                    height: 240,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: const Color(0xFF3B82F6).withOpacity(0.4),
                                        width: 2,
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),

                          // Logo with transformations
                          Transform.translate(
                            offset: _logoPositionAnimation.value * (MediaQuery.of(context).size.height * 0.3),
                            child: Transform.rotate(
                              angle: _logoRotationAnimation.value,
                              child: Transform.scale(
                                scale: _logoScaleAnimation.value,
                                child: Opacity(
                                  opacity: _logoOpacityAnimation.value,
                                  child: Container(
                                    width: 200,
                                    height: 200,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(100),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withOpacity(0.3),
                                          blurRadius: 20,
                                          spreadRadius: 5,
                                          offset: const Offset(0, 10),
                                        ),
                                        BoxShadow(
                                          color: Colors.white.withOpacity(0.1),
                                          blurRadius: 30,
                                          spreadRadius: -5,
                                          offset: const Offset(0, -5),
                                        ),
                                        BoxShadow(
                                          color: const Color(0xFF3B82F6).withOpacity(0.25 * _logoOpacityAnimation.value),
                                          blurRadius: 40,
                                          spreadRadius: 0,
                                          offset: Offset.zero,
                                        ),
                                      ],
                                    ),
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(100),
                                      child: Image.asset(
                                        'assets/logo/xpose-logo-round.png',
                                        width: 200,
                                        height: 200,
                                        fit: BoxFit.cover,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 40),

                      // Quote box with transformations
                      Transform.translate(
                        offset: _quotePositionAnimation.value * 30,
                        child: Transform.scale(
                          scale: _quoteScaleAnimation.value,
                          child: Opacity(
                            opacity: _quoteOpacityAnimation.value,
                            child: Container(
                              margin: const EdgeInsets.symmetric(horizontal: 32.0),
                              padding: const EdgeInsets.all(24.0),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(20),
                                gradient: LinearGradient(
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                  colors: [
                                    const Color(0xFF1E3A8A).withOpacity(0.15),
                                    const Color(0xFF0C4A6E).withOpacity(0.25),
                                  ],
                                ),
                                border: Border.all(
                                  color: const Color(0xFF3B82F6).withOpacity(0.3),
                                  width: 1,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xFF1E40AF).withOpacity(0.2),
                                    blurRadius: 20,
                                    offset: const Offset(0, 8),
                                  ),
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.1),
                                    blurRadius: 5,
                                    spreadRadius: -2,
                                    offset: const Offset(0, -3),
                                  ),
                                ],
                              ),
                              child: Column(
                                children: [
                                  Text(
                                    'Courage is contagious.',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                      fontSize: 24,
                                      fontWeight: FontWeight.w700,
                                      color: Colors.white.withOpacity(0.95),
                                      height: 1.3,
                                      letterSpacing: 0.5,
                                      shadows: [
                                        Shadow(
                                          color: Colors.black.withOpacity(0.5),
                                          offset: const Offset(2, 2),
                                          blurRadius: 8,
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    'When one person stands up,\nothers are empowered to do the same.',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w400,
                                      color: Colors.white.withOpacity(0.85),
                                      fontStyle: FontStyle.italic,
                                      height: 1.5,
                                      letterSpacing: 0.3,
                                      shadows: [
                                        Shadow(
                                          color: Colors.black.withOpacity(0.4),
                                          offset: const Offset(1, 1),
                                          blurRadius: 4,
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  Container(
                                    height: 1,
                                    width: 60,
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        colors: [
                                          Colors.transparent,
                                          const Color(0xFF60A5FA).withOpacity(0.8),
                                          Colors.transparent,
                                        ],
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    '- Nora Raleigh Baskin',
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: Colors.white.withOpacity(0.7),
                                      fontStyle: FontStyle.italic,
                                      letterSpacing: 0.2,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 60),

                      // Loading indicator
                      Opacity(
                        opacity: _loadingOpacityAnimation.value,
                        child: Transform.scale(
                          scale: _loadingScaleAnimation.value * _pulseAnimation.value,
                          child: Container(
                            width: 50,
                            height: 50,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(25),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF3B82F6).withOpacity(0.4),
                                  blurRadius: 15,
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                            child: Transform.rotate(
                              angle: _loadingRotationAnimation.value,
                              child: CustomPaint(
                                painter: _LoadingPainter(
                                  progress: _loadingController.value,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _ParticlePainter extends CustomPainter {
  final double progress;
  final double opacity;

  _ParticlePainter({required this.progress, required this.opacity});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF60A5FA).withOpacity(opacity * 0.7)
      ..style = PaintingStyle.fill;

    final particleCount = 25;
    final time = progress * 2 * math.pi;

    for (int i = 0; i < particleCount; i++) {
      final normalizedI = i / particleCount;
      final noise = 0.5 + 0.5 * math.sin(time * 0.5 + i * 0.7);
      final baseX = size.width * normalizedI;
      final baseY = size.height * 0.3 + (size.height * 0.4 * normalizedI);

      final offsetX = 80 * math.sin(time + i * 0.4) * noise;
      final offsetY = 60 * math.cos(time * 1.2 + i * 0.6) * noise;

      final x = baseX + offsetX;
      final y = baseY + offsetY;

      final radius = 1.0 + 1.5 * math.sin(time * 2.5 + i * 0.8) * noise;

      if (x >= 0 && x <= size.width && y >= 0 && y <= size.height) {
        canvas.drawCircle(Offset(x, y), radius, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class _ShimmerPainter extends CustomPainter {
  final double progress;
  final double opacity;

  _ShimmerPainter({required this.progress, required this.opacity});

  @override
  void paint(Canvas canvas, Size size) {

    canvas.save();

    // Rotate the canvas around its center
    canvas.translate(size.width / 2, size.height / 2);
    canvas.rotate(progress * math.pi * 0.5);
    canvas.translate(-size.width / 2, -size.height / 2);

    final gradient = LinearGradient(
      colors: [
        Colors.transparent,
        const Color(0xFF93C5FD).withOpacity(opacity * 0.7),
        const Color(0xFFBFDBFE).withOpacity(opacity),
        const Color(0xFF93C5FD).withOpacity(opacity * 0.7),
        Colors.transparent,
      ],
      stops: const [0.0, 0.2, 0.5, 0.8, 1.0],
      begin: Alignment(-1.0, 0.0),
      end: Alignment(1.0, 0.0),
    );

    final paint = Paint()
      ..shader = gradient.createShader(Rect.fromLTWH(0, 0, size.width, size.height));

    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), paint);


    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class _LoadingPainter extends CustomPainter {
  final double progress;

  _LoadingPainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 4;

    final paint = Paint()
      ..color = const Color(0xFF60A5FA).withOpacity(0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round;

    canvas.drawCircle(center, radius, paint);

    final progressPaint = Paint()
      ..shader = SweepGradient(
        colors: [
          const Color(0xFF1E40AF).withOpacity(0.2),
          const Color(0xFF3B82F6).withOpacity(0.9),
          const Color(0xFF60A5FA).withOpacity(0.2),
        ],
        stops: const [0.0, 0.5, 1.0],
        transform: GradientRotation(progress * 2 * math.pi),
      ).createShader(Rect.fromCircle(center: center, radius: radius))
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round;

    final startAngle = -math.pi / 2;
    const sweepAngle = math.pi * 1.8;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepAngle,
      false,
      progressPaint,
    );

    // Draw glowing dot at the end of the arc
    final dotPaint = Paint()
      ..color = const Color(0xFF3B82F6)
      ..style = PaintingStyle.fill
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4.0);

    final dotAngle = startAngle + sweepAngle;
    final dotX = center.dx + radius * math.cos(dotAngle);
    final dotY = center.dy + radius * math.sin(dotAngle);

    canvas.drawCircle(Offset(dotX, dotY), 3.5, dotPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}