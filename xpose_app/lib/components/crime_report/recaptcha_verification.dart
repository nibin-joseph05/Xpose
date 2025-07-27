import 'package:flutter/material.dart';
import 'package:flutter_recaptcha_v2_compat/flutter_recaptcha_v2_compat.dart';
import 'package:Xpose/services/crime_report_service.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class RecaptchaVerification extends StatefulWidget {
  final Function(bool) onVerified;

  const RecaptchaVerification({super.key, required this.onVerified});

  @override
  State<RecaptchaVerification> createState() => _RecaptchaVerificationState();
}

class _RecaptchaVerificationState extends State<RecaptchaVerification> {
  final CrimeReportService _crimeReportService = CrimeReportService();
  final String _siteKey = dotenv.env['RECAPTCHA_SITE_KEY'] ?? '';
  final RecaptchaV2Controller _recaptchaController = RecaptchaV2Controller();
  bool _isLoading = false;
  bool _isVerified = false;

  Future<void> _verifyRecaptcha(String? token) async {
    if (token == null) {
      widget.onVerified(false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('reCAPTCHA token is null')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final isValid = await _crimeReportService.verifyRecaptcha(token);
      widget.onVerified(isValid);
      if (!isValid) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Invalid reCAPTCHA verification')),
        );
      }
    } catch (e) {
      widget.onVerified(false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to verify reCAPTCHA: $e')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  void initState() {
    super.initState();
    if (_siteKey.isEmpty) {
      print('Warning: RECAPTCHA_SITE_KEY is missing in .env file');
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_siteKey.isEmpty) {
      return const Text(
        'reCAPTCHA configuration error: Site key missing',
        style: TextStyle(color: Colors.red),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        RecaptchaV2(
          controller: _recaptchaController,
          apiKey: _siteKey,
          apiSecret: '',
          pluginURL: 'https://www.google.com/recaptcha/api.js', // Ensure correct URL
          onVerifiedSuccessfully: (bool isVerified, [String? token]) async {
            if (isVerified && token != null) {
              setState(() {
                _isVerified = true;
              });
              await _verifyRecaptcha(token);
            } else {
              widget.onVerified(false);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('reCAPTCHA verification failed')),
              );
            }
          },
          onVerifiedError: (String error) {
            widget.onVerified(false);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('reCAPTCHA error: $error')),
            );
          },
        ),
        const SizedBox(height: 24),
      ],
    );
  }
}