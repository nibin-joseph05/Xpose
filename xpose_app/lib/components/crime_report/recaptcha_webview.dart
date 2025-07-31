import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class RecaptchaWebView extends StatefulWidget {
  final String siteKey;
  final Function(String) onVerified;
  final bool compact;

  const RecaptchaWebView({
    super.key,
    required this.siteKey,
    required this.onVerified,
    this.compact = false,
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
          onWebResourceError: (error) {
            debugPrint('WebView error: ${error.description}');
            widget.onVerified('error: ${error.description}');
          },
        ),
      )
      ..addJavaScriptChannel(
        'RecaptchaVerification',
        onMessageReceived: (message) {
          widget.onVerified(message.message);
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
            'size': '${widget.compact ? 'compact' : 'normal'}',
            'callback': (token) => RecaptchaVerification.postMessage(token),
            'expired-callback': () => RecaptchaVerification.postMessage('expired'),
            'error-callback': () => RecaptchaVerification.postMessage('error')
          });
        } else {
          RecaptchaVerification.postMessage('error: reCAPTCHA not loaded');
        }
      } catch (e) {
        RecaptchaVerification.postMessage('error: ' + e.toString());
      }
    ''');
  }

  String _getHtmlContent() {
    return '''
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://www.google.com/recaptcha/api.js" async defer></script>
        <style>
          body, html { 
            margin: 0; 
            padding: 0; 
            background: transparent; 
            width: 100%; 
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          #recaptcha-container {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        </style>
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
        SizedBox(
          width: widget.compact ? 300 : double.infinity,
          height: widget.compact ? 74 : 120,
          child: WebViewWidget(controller: _controller),
        ),
        if (_isLoading)
          Center(
            child: CircularProgressIndicator(
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
      ],
    );
  }
}