import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:Xpose/services/auth_service.dart';
import 'package:Xpose/helpers/user_preferences.dart';
import 'package:Xpose/pages/home/home.dart';
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
  String? _verificationId;

  late AnimationController _rippleController;
  late Animation<double> _rippleScaleAnimation;
  late Animation<double> _rippleOpacityAnimation;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _checkExistingUser();
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

  Future<void> _checkExistingUser() async {
    final user = await UserPreferences.getUser();
    if (user != null && mounted) {
      _navigateToHome();
    }
  }

  Future<void> _sendOtp() async {
    final phoneNumber = '+91${phoneController.text.trim()}';

    if (phoneController.text.isEmpty) {
      setState(() => phoneErrorText = 'Please enter your mobile number');
      return;
    }

    if (phoneController.text.length != 10) {
      setState(() => phoneErrorText = 'Enter a valid 10-digit number');
      return;
    }

    setState(() {
      phoneErrorText = null;
      isLoading = true;
    });

    try {
      await FirebaseAuth.instance.verifyPhoneNumber(
        phoneNumber: phoneNumber,
        verificationCompleted: (PhoneAuthCredential credential) async {
          await _signInWithCredential(credential);
        },
        verificationFailed: (FirebaseAuthException e) {
          setState(() {
            isLoading = false;
            phoneErrorText = e.message ?? 'Verification failed';
          });
        },
        codeSent: (String verificationId, int? resendToken) {
          setState(() {
            isLoading = false;
            isOtpSent = true;
            _verificationId = verificationId;
          });
        },
        codeAutoRetrievalTimeout: (String verificationId) {},
      );
    } catch (e) {
      setState(() {
        isLoading = false;
        phoneErrorText = 'Error sending OTP: ${e.toString()}';
      });
    }
  }

  Future<void> _verifyOtp() async {
    if (otpController.text.isEmpty) {
      setState(() => otpErrorText = 'Please enter OTP');
      return;
    }

    if (otpController.text.length != 6) {
      setState(() => otpErrorText = 'Enter a valid 6-digit OTP');
      return;
    }

    setState(() {
      otpErrorText = null;
      isLoading = true;
    });

    try {
      final credential = PhoneAuthProvider.credential(
        verificationId: _verificationId!,
        smsCode: otpController.text.trim(),
      );
      await _signInWithCredential(credential);
    } catch (e) {
      setState(() {
        isLoading = false;
        otpErrorText = 'Invalid OTP. Please try again.';
      });
    }
  }

  Future<void> _signInWithCredential(PhoneAuthCredential credential) async {
    try {
      final userCredential = await FirebaseAuth.instance.signInWithCredential(credential);
      final phone = userCredential.user?.phoneNumber?.replaceFirst('+91', '') ?? '';

      final user = await AuthService.registerWithMobile(phone);
      await UserPreferences.saveUser(user);

      if (mounted) {
        _navigateToHome();
      }
    } catch (e) {
      setState(() {
        isLoading = false;
        phoneErrorText = 'Authentication failed: ${e.toString()}';
      });
    }
  }

  void _navigateToHome() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const HomePage()),
    );
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
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF0F172A),
              Color(0xFF1E293B),
            ],
          ),
        ),
        child: Stack(
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
                      const SizedBox(height: 32),
                      Text(
                        'Xpose',
                        style: TextStyle(
                          fontSize: 48,
                          fontWeight: FontWeight.w800,
                          color: Theme.of(context).colorScheme.primary,
                          letterSpacing: 3.0,
                          shadows: [
                            Shadow(
                              blurRadius: 12,
                              color: Theme.of(context).colorScheme.primary.withOpacity(0.6),
                            )
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Welcome to Xpose',
                        style: TextStyle(
                          fontSize: 20,
                          color: Colors.white70,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'Log in to expose and report crimes anonymously.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.white54,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 40),
                      Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFF2C3545).withOpacity(0.9),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: phoneErrorText != null
                                ? Colors.redAccent.withOpacity(0.8)
                                : const Color(0xFF3C4556),
                            width: 1.5,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.3),
                              blurRadius: 15,
                              spreadRadius: 3,
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
                              decoration: const BoxDecoration(
                                color: Color(0xFF3F4B5D),
                                borderRadius: BorderRadius.horizontal(
                                  left: Radius.circular(16),
                                ),
                              ),
                              child: const Text(
                                '+91',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                            ),
                            Expanded(
                              child: TextField(
                                controller: phoneController,
                                keyboardType: TextInputType.phone,
                                maxLength: 10,
                                enabled: !isOtpSent,
                                style: TextStyle(color: isOtpSent ? Colors.grey[600] : Colors.white, fontSize: 16),
                                decoration: InputDecoration(
                                  hintText: 'Enter your number',
                                  hintStyle: const TextStyle(color: Colors.white60),
                                  counterText: '',
                                  border: InputBorder.none,
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                                  errorText: phoneErrorText,
                                  errorStyle: const TextStyle(height: 0, fontSize: 0),
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
                      if (phoneErrorText != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 8.0, left: 8.0),
                          child: Align(
                            alignment: Alignment.centerLeft,
                            child: Text(
                              phoneErrorText!,
                              style: const TextStyle(color: Colors.redAccent, fontSize: 12),
                            ),
                          ),
                        ),
                      const SizedBox(height: 20),
                      if (isOtpSent) ...[
                        TextField(
                          controller: otpController,
                          keyboardType: TextInputType.number,
                          maxLength: 6,
                          style: const TextStyle(color: Colors.white, fontSize: 16),
                          decoration: InputDecoration(
                            labelText: 'Enter OTP',
                            labelStyle: TextStyle(color: Colors.white60),
                            filled: true,
                            counterText: '',
                            fillColor: const Color(0xFF2C3545).withOpacity(0.9),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide(
                                color: otpErrorText != null
                                    ? Colors.redAccent.withOpacity(0.8)
                                    : const Color(0xFF3C4556),
                                width: 1.5,
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide(
                                color: Theme.of(context).colorScheme.primary,
                                width: 2.0,
                              ),
                            ),
                            errorText: otpErrorText,
                            errorStyle: const TextStyle(height: 0, fontSize: 0),
                          ),
                          onChanged: (value) {
                            if (otpErrorText != null) {
                              setState(() => otpErrorText = null);
                            }
                          },
                        ),
                        if (otpErrorText != null)
                          Padding(
                            padding: const EdgeInsets.only(top: 8.0, left: 8.0),
                            child: Align(
                              alignment: Alignment.centerLeft,
                              child: Text(
                                otpErrorText!,
                                style: const TextStyle(color: Colors.redAccent, fontSize: 12),
                              ),
                            ),
                          ),
                        const SizedBox(height: 20),
                      ],
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: isLoading
                              ? null
                              : isOtpSent ? _verifyOtp : _sendOtp,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Theme.of(context).colorScheme.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 18),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            elevation: 10,
                            shadowColor: Theme.of(context).colorScheme.primary.withOpacity(0.6),
                            textStyle: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.5,
                            ),
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
    );
  }
}

class _ParticlePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final random = math.Random();
    final paint = Paint()
      ..color = const Color(0xFF3B82F6).withOpacity(0.08)
      ..style = PaintingStyle.fill;

    for (int i = 0; i < 50; i++) {
      final x = random.nextDouble() * size.width;
      final y = random.nextDouble() * size.height;
      final radius = 1.0 + random.nextDouble() * 2.5;
      canvas.drawCircle(Offset(x, y), radius, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}