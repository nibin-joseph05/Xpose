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
            Future.delayed(const Duration(milliseconds: 500), () {
              _injectRecaptchaScript();
            });
          },
          onNavigationRequest: (request) {
            if (request.url.startsWith('https://www.google.com/recaptcha/') ||
                request.url.startsWith('https://www.gstatic.com/recaptcha/') ||
                request.url.startsWith('https://recaptcha.net/') ||
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
          final token = message.message.trim();
          // print('Flutter WebView received token: ${token.substring(0, 50)}...');
          // print('Token length: ${token.length}');
          widget.onVerified(token);
        },
      )
      ..loadHtmlString(
        _getHtmlContent(),
        baseUrl: baseUrl,
      );
  }

  void _injectRecaptchaScript() {
    _controller.runJavaScript('''
      console.log('Injecting reCAPTCHA script...');
      
      function waitForRecaptcha() {
        if (typeof grecaptcha !== 'undefined' && grecaptcha.render) {
          console.log('reCAPTCHA is ready, rendering...');
          try {
            grecaptcha.render('recaptcha-container', {
              'sitekey': '${widget.siteKey}',
              'size': '${widget.compact ? 'compact' : 'normal'}',
              'theme': 'light',
              'callback': function(token) {
                console.log('reCAPTCHA success, token length:', token.length);
                RecaptchaVerification.postMessage(token);
              },
              'expired-callback': function() {
                console.log('reCAPTCHA expired');
                RecaptchaVerification.postMessage('expired');
              },
              'error-callback': function(error) {
                console.log('reCAPTCHA error:', error);
                RecaptchaVerification.postMessage('error: ' + error);
              }
            });
          } catch (e) {
            console.error('Error rendering reCAPTCHA:', e);
            RecaptchaVerification.postMessage('error: ' + e.toString());
          }
        } else {
          console.log('reCAPTCHA not ready yet, retrying...');
          setTimeout(waitForRecaptcha, 100);
        }
      }
      
      waitForRecaptcha();
    ''');
  }

  String _getHtmlContent() {
    return '''
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
        <meta charset="UTF-8">
        <script src="https://www.google.com/recaptcha/api.js?render=explicit&hl=en" async defer></script>
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
            overflow: visible;
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
          
          /* Ensure reCAPTCHA iframe is properly sized */
          iframe[src*="recaptcha"] {
            max-width: 100% !important;
            max-height: 100% !important;
          }
        </style>
      </head>
      <body>
        <div id="recaptcha-container"></div>
        <script>
          console.log('HTML loaded, waiting for reCAPTCHA API...');
          
          window.onerror = function(msg, url, lineNo, columnNo, error) {
            console.error('Script error:', msg, 'at', url, lineNo, columnNo);
            if (typeof RecaptchaVerification !== 'undefined') {
              RecaptchaVerification.postMessage('error: Script loading failed');
            }
            return false;
          };
        </script>
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
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(height: 10),
                const Text(
                  'Loading reCAPTCHA...',
                  style: TextStyle(color: Colors.white70),
                ),
              ],
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
                    'Check internet connection or try again.',
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