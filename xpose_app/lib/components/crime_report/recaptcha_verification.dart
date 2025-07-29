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
    print('Starting _verifyRecaptcha with token: $token');
    if (token == null) {
      print('Token is null');
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
      print('Calling verifyRecaptcha with token: $token');
      final isValid = await _crimeReportService.verifyRecaptcha(token);
      print('verifyRecaptcha result: $isValid');
      widget.onVerified(isValid);
      if (!isValid) {
        print('Verification failed');
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Invalid reCAPTCHA verification')),
        );
      }
    } catch (e) {
      print('Error in verifyRecaptcha: $e');
      widget.onVerified(false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to verify reCAPTCHA: $e')),
      );
    } finally {
      print('Finished _verifyRecaptcha');
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  void initState() {
    super.initState();
    print('Initializing RecaptchaVerification with siteKey: $_siteKey');
    if (_siteKey.isEmpty) {
      print('Warning: RECAPTCHA_SITE_KEY is missing in .env file');
    }
  }

  @override
  void dispose() {
    _recaptchaController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    print('Building RecaptchaVerification widget');
    if (_siteKey.isEmpty) {
      print('Site key is empty, showing error text');
      return const Text(
        'reCAPTCHA configuration error: Site key missing',
        style: TextStyle(color: Colors.red),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          height: 78,
          child: RecaptchaV2(
            controller: _recaptchaController,
            apiKey: _siteKey,
            apiSecret: '',
            pluginURL: 'https://www.google.com/recaptcha/api.js?render=explicit',
            onVerifiedSuccessfully: (bool isVerified, [String? token]) async {
              print('onVerifiedSuccessfully - isVerified: $isVerified, token: $token');
              if (isVerified && token != null) {
                setState(() {
                  _isVerified = true;
                });
                await _verifyRecaptcha(token);
              } else {
                print('Verification failed in callback');
                widget.onVerified(false);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('reCAPTCHA verification failed')),
                );
              }
            },
            onVerifiedError: (String error) {
              print('onVerifiedError: $error');
              widget.onVerified(false);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('reCAPTCHA error: $error')),
              );
            },
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }
}