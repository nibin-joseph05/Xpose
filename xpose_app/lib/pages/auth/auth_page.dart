import 'package:flutter/material.dart';
import 'dart:math' as math;

class AuthPage extends StatefulWidget {
  const AuthPage({super.key});

  @override
  State<AuthPage> createState() => _AuthPageState();
}

class _AuthPageState extends State<AuthPage> with TickerProviderStateMixin {
  final TextEditingController phoneController = TextEditingController();
  final TextEditingController otpController = TextEditingController();
  bool isOtpSent = false;
  bool isLoading = false;
  String? phoneErrorText;
  String? otpErrorText;

  late AnimationController _rippleController;
  late Animation<double> _rippleScaleAnimation;
  late Animation<double> _rippleOpacityAnimation;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
  }

  void _setupAnimations() {
    _rippleController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    )..repeat(reverse: true);

    _rippleScaleAnimation = Tween<double>(begin: 1.0, end: 1.1).animate(
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

  void _handleButtonPress() {
    setState(() {
      phoneErrorText = null;
      otpErrorText = null;
    });

    if (!isOtpSent) {
      if (phoneController.text.isEmpty) {
        setState(() {
          phoneErrorText = 'Please enter your mobile number';
        });
        return;
      }
      if (phoneController.text.length != 10) {
        setState(() {
          phoneErrorText = 'Enter a valid 10-digit number';
        });
        return;
      }
    } else {
      if (otpController.text.isEmpty) {
        setState(() {
          otpErrorText = 'Please enter OTP';
        });
        return;
      }
      if (otpController.text.length != 6) {
        setState(() {
          otpErrorText = 'Enter a valid 6-digit OTP';
        });
        return;
      }
    }

    setState(() {
      isLoading = true;
    });

    Future.delayed(const Duration(seconds: 2), () {
      setState(() {
        isLoading = false;
        if (!isOtpSent) {
          isOtpSent = true;
        } else {
          // Navigate to home after verification
        }
      });
    });
  }

  @override
  void dispose() {
    _rippleController.dispose();
    phoneController.dispose();
    otpController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Stack(
        children: [
          Positioned.fill(
            child: CustomPaint(
              painter: _ParticlePainter(),
            ),
          ),
          Positioned.fill(
            child: Opacity(
              opacity: 0.03,
              child: Center(
                child: Image.asset(
                  'assets/logo/xpose-logo-round.png',
                  width: MediaQuery.of(context).size.width * 0.8,
                  fit: BoxFit.cover,
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32.0),
            child: Center(
              child: SingleChildScrollView(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        AnimatedBuilder(
                          animation: _rippleController,
                          builder: (context, child) {
                            return Transform.scale(
                              scale: _rippleScaleAnimation.value,
                              child: Opacity(
                                opacity: _rippleOpacityAnimation.value,
                                child: Container(
                                  width: 140,
                                  height: 140,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: Theme.of(context).colorScheme.primary.withOpacity(0.4),
                                      width: 2,
                                    ),
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                        Container(
                          width: 120,
                          height: 120,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Theme.of(context).colorScheme.primary.withOpacity(0.2),
                                blurRadius: 20,
                                spreadRadius: 5,
                              ),
                            ],
                          ),
                          child: Image.asset(
                            'assets/logo/xpose-logo-round.png',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'Xpose',
                      style: TextStyle(
                        fontSize: 42,
                        fontWeight: FontWeight.w800,
                        color: Theme.of(context).colorScheme.primary,
                        letterSpacing: 2.5,
                        shadows: [
                          Shadow(
                            blurRadius: 10,
                            color: Theme.of(context).colorScheme.primary.withOpacity(0.5),
                          )
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Welcome to Xpose',
                      style: TextStyle(
                        fontSize: 18,
                        color: Colors.grey[400],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Log in to expose and report crimes anonymously.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 15,
                        color: Colors.grey[500],
                      ),
                    ),
                    const SizedBox(height: 32),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.grey[900]!.withOpacity(0.8),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: phoneErrorText != null
                              ? Colors.redAccent.withOpacity(0.7)
                              : Colors.grey[700]!,
                          width: 1,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                            blurRadius: 10,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
                            decoration: BoxDecoration(
                              color: Colors.grey[850],
                              borderRadius: const BorderRadius.horizontal(
                                left: Radius.circular(16),
                              ),
                            ),
                            child: Text(
                              '+91',
                              style: TextStyle(
                                color: Colors.grey[300],
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          Expanded(
                            child: TextField(
                              controller: phoneController,
                              keyboardType: TextInputType.phone,
                              maxLength: 10,
                              enabled: !isOtpSent,
                              style: TextStyle(color: isOtpSent ? Colors.grey : Colors.white),
                              decoration: InputDecoration(
                                hintText: 'Enter your number',
                                hintStyle: const TextStyle(color: Colors.white54),
                                counterText: '',
                                border: InputBorder.none,
                                contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                                errorText: phoneErrorText,
                              ),
                              onChanged: (value) {
                                if (phoneErrorText != null) {
                                  setState(() => phoneErrorText = null);
                                }
                              },
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    if (isOtpSent) ...[
                      TextField(
                        controller: otpController,
                        keyboardType: TextInputType.number,
                        maxLength: 6,
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          labelText: 'Enter OTP',
                          labelStyle: TextStyle(color: Colors.grey[400]),
                          filled: true,
                          counterText: '',
                          fillColor: Colors.grey[900]!.withOpacity(0.8),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: BorderSide(
                              color: otpErrorText != null
                                  ? Colors.redAccent.withOpacity(0.7)
                                  : Colors.grey[700]!,
                              width: 1,
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: BorderSide(
                              color: Theme.of(context).colorScheme.primary,
                              width: 1.5,
                            ),
                          ),
                          errorText: otpErrorText,
                        ),
                        onChanged: (value) {
                          if (otpErrorText != null) {
                            setState(() => otpErrorText = null);
                          }
                        },
                      ),
                      const SizedBox(height: 20),
                    ],
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: isLoading ? null : _handleButtonPress,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Theme.of(context).colorScheme.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          elevation: 8,
                          shadowColor: Theme.of(context).colorScheme.primary.withOpacity(0.5),
                        ),
                        child: isLoading
                            ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 3,
                            valueColor: AlwaysStoppedAnimation(Colors.white),
                          ),
                        )
                            : Text(
                          isOtpSent ? 'VERIFY OTP' : 'GET OTP',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.2,
                          ),
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
    );
  }
}

class _ParticlePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final random = math.Random();
    final paint = Paint()
      ..color = const Color(0xFF3B82F6).withOpacity(0.05)
      ..style = PaintingStyle.fill;

    for (int i = 0; i < 30; i++) {
      final x = random.nextDouble() * size.width;
      final y = random.nextDouble() * size.height;
      final radius = 1.0 + random.nextDouble() * 2;
      canvas.drawCircle(Offset(x, y), radius, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}