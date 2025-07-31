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

  void _handleToken(String token) async {
    if (token.isEmpty || token.startsWith('error') || token == 'expired') {
      widget.onVerified(false);
      setState(() => _isVerified = false);
      String errorMessage = token.startsWith('error')
          ? token.replaceFirst('error: ', '')
          : token == 'expired'
          ? 'reCAPTCHA session expired. Please try again.'
          : 'reCAPTCHA verification failed.';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(errorMessage),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          duration: const Duration(seconds: 4),
        ),
      );
      return;
    }

    try {
      final isValid = await _crimeReportService.verifyRecaptcha(token);
      widget.onVerified(isValid);
      setState(() {
        _isVerified = isValid;
      });
      if (isValid) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Verification successful!'),
            backgroundColor: Theme.of(context).colorScheme.primary,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            duration: const Duration(seconds: 3),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('reCAPTCHA verification failed. Invalid token.'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            duration: const Duration(seconds: 4),
          ),
        );
      }
    } catch (e) {
      widget.onVerified(false);
      setState(() {
        _isVerified = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Verification error: $e'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          duration: const Duration(seconds: 4),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (_siteKey.isNotEmpty)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface.withOpacity(0.9),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: Theme.of(context).colorScheme.primary.withOpacity(0.4),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Verify you are human',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 12),
                if (!_isVerified)
                  Container(
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: RecaptchaWebView(
                      siteKey: _siteKey,
                      onVerified: _handleToken,
                    ),
                  ),
                if (_isVerified)
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.green.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: Colors.green),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.verified, color: Colors.green),
                        SizedBox(width: 8),
                        Text(
                          'Verified',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        if (_siteKey.isEmpty)
          const Text(
            'reCAPTCHA configuration error',
            style: TextStyle(color: Colors.red, fontSize: 16),
          ),
      ],
    );
  }
}
