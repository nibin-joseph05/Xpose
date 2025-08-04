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
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    final baseUrl = dotenv.env['API_BASE_URL']?.replaceFirst(RegExp(r':\d+$'), '') ?? 'http://localhost';

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.transparent)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (url) {
            setState(() {
              _isLoading = true;
              _hasError = false;
            });
          },
          onPageFinished: (url) {
            setState(() => _isLoading = false);
            _injectRecaptchaScript();
          },
          onNavigationRequest: (request) {
            if (request.url.startsWith('https://www.google.com/recaptcha/') ||
                request.url.startsWith('https://www.gstatic.com/recaptcha/') ||
                request.url.startsWith('data:')) {
              return NavigationDecision.navigate;
            }
            if (request.url.startsWith('http://localhost') ||
                request.url.startsWith('about:blank')) {
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
          onWebResourceError: (error) {
            debugPrint('WebView error: ${error.description}');
            setState(() => _hasError = true);
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
        <script src="https://www.google.com/recaptcha/api.js?hl=en" async defer></script>
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
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow: hidden;
          }
          #recaptcha-container {
            flex-shrink: 0;
            min-width: 304px;
            min-height: 78px;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            max-width: 100%;
            max-height: 100%;
          }
          .grecaptcha-badge {
            visibility: hidden !important;
            opacity: 0 !important;
            display: none !important;
          }
          .grecaptcha-bubble-border, .grecaptcha-bubble-content {
            box-sizing: border-box;
            max-width: 100%;
            height: auto;
          }
        </style>
      </head>
      <body>
        <div id="recaptcha-container"></div>
      </body>
      </html>
    ''';
  }

  void _reloadRecaptcha() {
    setState(() {
      _isLoading = true;
      _hasError = false;
    });
    _controller.reload();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        WebViewWidget(controller: _controller),
        if (_isLoading)
          Center(
            child: CircularProgressIndicator(
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
        if (_hasError)
          Positioned.fill(
            child: Container(
              color: Colors.black.withOpacity(0.7),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, color: Colors.red, size: 40),
                  const SizedBox(height: 10),
                  const Text(
                    'Failed to load reCAPTCHA.',
                    style: TextStyle(color: Colors.white, fontSize: 16),
                    textAlign: TextAlign.center,
                  ),
                  const Text(
                    'Check internet or retry.',
                    style: TextStyle(color: Colors.white70, fontSize: 14),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 10),
                  ElevatedButton(
                    onPressed: _reloadRecaptcha,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      foregroundColor: Theme.of(context).colorScheme.onPrimary,
                    ),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}