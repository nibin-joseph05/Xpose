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
    if (token == 'expired' || token == 'error') {
      widget.onVerified(false);
      return;
    }

    try {
      final isValid = await _crimeReportService.verifyRecaptcha(token);
      widget.onVerified(isValid);
      setState(() => _isVerified = isValid);
    } catch (e) {
      widget.onVerified(false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (_siteKey.isNotEmpty)
          RecaptchaWebView(
            siteKey: _siteKey,
            onVerified: _handleToken,
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
              Icon(Icons.verified, color: Colors.green),
              const SizedBox(width: 8),
              Text('Verified', style: TextStyle(color: Colors.green)),
            ],
          ),
      ],
    );
  }
}