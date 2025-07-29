import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class RecaptchaWebView extends StatefulWidget {
  final String siteKey;
  final Function(String) onVerified;

  const RecaptchaWebView({
    super.key,
    required this.siteKey,
    required this.onVerified,
  });

  @override
  State<RecaptchaWebView> createState() => _RecaptchaWebViewState();
}

class _RecaptchaWebViewState extends State<RecaptchaWebView> {
  late final WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();

    final baseUrl = dotenv.env['API_BASE_URL']?.replaceFirst(RegExp(r':\d+$'), '') ?? 'http://localhost';

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.transparent)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (url) {
            setState(() => _isLoading = false);
            _injectRecaptchaScript();
          },
          onNavigationRequest: (request) {
            if (request.url.startsWith('http://localhost') ||
                request.url.startsWith('about:blank')) {
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..addJavaScriptChannel(
        'RecaptchaVerification',
        onMessageReceived: (message) {
          if (message.message == 'expired' || message.message == 'error') {
            widget.onVerified('');
          } else {
            widget.onVerified(message.message);
          }
        },
      )
      ..loadHtmlString(
        _getHtmlContent(),
        baseUrl: baseUrl,
      );
  }

  void _injectRecaptchaScript() {
    _controller.runJavaScript('''
      try {
        if (typeof grecaptcha !== 'undefined') {
          grecaptcha.render('recaptcha-container', {
            'sitekey': '${widget.siteKey}',
            'callback': (token) => {
              RecaptchaVerification.postMessage(token);
              window.flutter_close_dialog();
            },
            'expired-callback': () => {
              RecaptchaVerification.postMessage('expired');
              window.flutter_close_dialog();
            },
            'error-callback': () => {
              RecaptchaVerification.postMessage('error');
              window.flutter_close_dialog();
            }
          });
        } else {
          RecaptchaVerification.postMessage('error: reCAPTCHA not loaded');
          window.flutter_close_dialog();
        }
      } catch (e) {
        RecaptchaVerification.postMessage('error: ' + e.toString());
        window.flutter_close_dialog();
      }
    ''');
  }

  String _getHtmlContent() {
    return '''
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://www.google.com/recaptcha/api.js?render=explicit&onload=onRecaptchaLoad" async defer></script>
        <style>
          body, html { 
            margin: 0; 
            padding: 0; 
            background: transparent; 
            width: 100%; 
            height: 100%;
            overflow: auto;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          #recaptcha-container {
            width: 100%;
            max-width: 400px;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .g-recaptcha {
            display: inline-block;
          }
        </style>
        <script>
          window.flutter_close_dialog = function() {
            try {
              FlutterCloseDialog.postMessage('close');
            } catch (e) {}
          };
        </script>
      </head>
      <body>
        <div id="recaptcha-container"></div>
      </body>
      </html>
    ''';
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        WebViewWidget(controller: _controller),
        if (_isLoading)
          const Center(child: CircularProgressIndicator()),
      ],
    );
  }
}