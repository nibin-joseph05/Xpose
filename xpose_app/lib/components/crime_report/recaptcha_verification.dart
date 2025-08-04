import 'package:flutter/material.dart';
import 'package:Xpose/services/crime_report_service.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:Xpose/components/crime_report/recaptcha_webview.dart';

class RecaptchaVerification extends StatefulWidget {
  final Function(bool) onVerified;

  const RecaptchaVerification({super.key, required this.onVerified});

  @override
  State<RecaptchaVerification> createState() => _RecaptchaVerificationState();
}

class _RecaptchaVerificationState extends State<RecaptchaVerification> {
  final CrimeReportService _crimeReportService = CrimeReportService();
  final String _siteKey = dotenv.env['RECAPTCHA_SITE_KEY'] ?? '';
  bool _isVerified = false;
  bool _isLoading = false;
  bool _isDialogShowing = false;

  void _handleToken(String token) async {
    if (_isDialogShowing && Navigator.of(context).canPop()) {
      Navigator.of(context).pop();
    }

    setState(() {
      _isDialogShowing = false;
      _isLoading = true;
    });

    if (token.isEmpty || token.startsWith('error') || token == 'expired') {
      widget.onVerified(false);
      setState(() => _isVerified = false);

      String errorMessage = 'Verification failed. Please try again.';
      if (token.startsWith('error: network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (token == 'expired') {
        errorMessage = 'Session expired. Please verify again.';
      } else if (token.startsWith('error')) {
        errorMessage = 'reCAPTCHA error: ${token.substring(6)}';
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(errorMessage),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          duration: const Duration(seconds: 3),
        ),
      );
      setState(() => _isLoading = false);
      return;
    }

    try {
      final isValid = await _crimeReportService.verifyRecaptcha(token);
      widget.onVerified(isValid);
      setState(() {
        _isVerified = isValid;
        _isLoading = false;
      });

      if (isValid) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Verification successful!'),
            backgroundColor: Theme.of(context).colorScheme.primary,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            duration: const Duration(seconds: 2),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Verification failed. Please try again.'),
            backgroundColor: Colors.orange,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } catch (e) {
      widget.onVerified(false);
      setState(() {
        _isVerified = false;
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error during verification: ${e.toString()}'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          duration: const Duration(seconds: 4),
        ),
      );
    }
  }

  void _showRecaptchaDialog() {
    if (_siteKey.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('reCAPTCHA site key is not configured.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (_isDialogShowing) return;

    setState(() {
      _isDialogShowing = true;
    });

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        final mediaQuery = MediaQuery.of(dialogContext);
        final screenWidth = mediaQuery.size.width;
        final screenHeight = mediaQuery.size.height;

        final double webViewWidth = screenWidth * 0.9;
        final double effectiveWebViewWidth = webViewWidth > 350 ? webViewWidth : 350;

        final double webViewHeight = screenHeight * 0.65;
        final double effectiveWebViewHeight = webViewHeight > 450 ? webViewHeight : 450;


        return AlertDialog(
          backgroundColor: Theme.of(context).colorScheme.surface,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          contentPadding: const EdgeInsets.all(0),
          insetPadding: const EdgeInsets.all(10.0),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20.0, 20.0, 10.0, 10.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        'Verify You Are Not a Robot',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    IconButton(
                      icon: Icon(Icons.close, color: Theme.of(context).colorScheme.onSurface),
                      onPressed: () {
                        setState(() {
                          _isDialogShowing = false;
                          _isVerified = false;
                          widget.onVerified(false);
                        });
                        Navigator.of(dialogContext).pop();
                      },
                    ),
                  ],
                ),
              ),
              SizedBox(
                width: effectiveWebViewWidth,
                height: effectiveWebViewHeight,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                  child: RecaptchaWebView(
                    siteKey: _siteKey,
                    onVerified: _handleToken,
                    compact: false,
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    ).then((_) {
      if (_isDialogShowing) {
        setState(() {
          _isDialogShowing = false;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Security Verification',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 16),
        Card(
          elevation: 6,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(
              color: Theme.of(context).colorScheme.primary.withOpacity(0.6),
              width: 1.5,
            ),
          ),
          color: Theme.of(context).colorScheme.surface.withOpacity(0.95),
          child: InkWell(
            onTap: _isVerified ? null : (_isLoading ? null : _showRecaptchaDialog),
            borderRadius: BorderRadius.circular(16),
            splashColor: Theme.of(context).colorScheme.primary.withOpacity(0.3),
            highlightColor: Theme.of(context).colorScheme.primary.withOpacity(0.1),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 20.0, horizontal: 24.0),
              child: Row(
                children: [
                  _isLoading
                      ? SizedBox(
                    width: 32,
                    height: 32,
                    child: CircularProgressIndicator(
                      color: Theme.of(context).colorScheme.secondary,
                      strokeWidth: 3,
                    ),
                  )
                      : Icon(
                    _isVerified ? Icons.check_circle_rounded : Icons.check_box_outline_blank,
                    color: _isVerified ? Colors.lightGreenAccent.shade400 : Colors.blueGrey.shade200,
                    size: 32,
                  ),
                  const SizedBox(width: 20),
                  Expanded(
                    child: Text(
                      _isLoading
                          ? 'Verifying...'
                          : _isVerified
                          ? 'Identity Verified Successfully!'
                          : 'I\'m not a robot',
                      style: TextStyle(
                        color: _isVerified ? Colors.green.shade300 : Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  if (!_isVerified && !_isLoading)
                    Icon(Icons.arrow_forward_ios, size: 20, color: Colors.white60),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 20),
        const Text(
          'This helps us prevent spam and abuse. '
              'Your information is protected by reCAPTCHA and Google\'s '
              'Privacy Policy and Terms of Service apply.',
          style: TextStyle(color: Colors.white60, fontSize: 13, height: 1.4),
        ),
        if (_siteKey.isEmpty)
          Container(
            margin: const EdgeInsets.only(top: 20),
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.red.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.red.shade700, width: 1.5),
            ),
            child: const Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.warning_amber_rounded, color: Colors.red, size: 24),
                SizedBox(width: 15),
                Expanded(
                  child: Text(
                    'SECURITY ALERT: reCAPTCHA site key missing! '
                        'Please ensure RECAPTCHA_SITE_KEY is set in your .env file.',
                    style: TextStyle(color: Colors.redAccent, fontSize: 14, fontWeight: FontWeight.w500),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}