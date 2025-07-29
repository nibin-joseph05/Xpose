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
    if (token.isEmpty || token == 'expired' || token == 'error') {
      widget.onVerified(false);
      setState(() => _isVerified = false);
      return;
    }

    try {
      final isValid = await _crimeReportService.verifyRecaptcha(token);
      widget.onVerified(isValid);
      setState(() => _isVerified = isValid);
    } catch (e) {
      widget.onVerified(false);
      setState(() => _isVerified = false);
    }
  }

  void _showRecaptchaDialog() {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          child: Container(
            height: 500,
            width: MediaQuery.of(context).size.width * 0.9,
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Expanded(
                  child: RecaptchaWebView(
                    siteKey: _siteKey,
                    onVerified: (token) {
                      _handleToken(token);
                      Navigator.of(context).pop();
                    },
                  ),
                ),
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text(
                    'Cancel',
                    style: TextStyle(color: Colors.red, fontSize: 16),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (_siteKey.isNotEmpty)
          ElevatedButton.icon(
            onPressed: _showRecaptchaDialog,
            icon: const Icon(Icons.verified_user, color: Colors.white),
            label: const Text(
              'Verify I\'m not a robot',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.primary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            ),
          ),
        if (_siteKey.isEmpty)
          const Text(
            'reCAPTCHA configuration error',
            style: TextStyle(color: Colors.red),
          ),
        const SizedBox(height: 16),
        if (_isVerified)
          Row(
            children: [
              const Icon(Icons.verified, color: Colors.green),
              const SizedBox(width: 8),
              Text(
                'Verified',
                style: TextStyle(color: Theme.of(context).colorScheme.primary),
              ),
            ],
          ),
      ],
    );
  }
}