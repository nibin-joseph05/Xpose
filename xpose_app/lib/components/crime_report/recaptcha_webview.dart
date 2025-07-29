import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

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

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.transparent)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (url) {
            _injectRecaptchaScript();
          },
        ),
      )
      ..loadHtmlString(_getHtmlContent());
  }

  void _injectRecaptchaScript() {
    _controller.runJavaScript('''
      grecaptcha.render('recaptcha-container', {
        'sitekey': '${widget.siteKey}',
        'callback': (token) => RecaptchaVerification.postMessage(token),
        'expired-callback': () => RecaptchaVerification.postMessage('expired'),
        'error-callback': () => RecaptchaVerification.postMessage('error')
      });
    ''');
  }

  String _getHtmlContent() {
    return '''
      <!DOCTYPE html>
      <html>
      <head>
        <script src="https://www.google.com/recaptcha/api.js" async defer></script>
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            background: transparent; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
          }
          #recaptcha-container { 
            transform: scale(0.85); 
            transform-origin: 0 0; 
          }
        </style>
      </head>
      <body>
        <div id="recaptcha-container"></div>
        <script>
          RecaptchaVerification = {
            postMessage: function(token) {
              window.flutter_inappwebview.callHandler('recaptchaCallback', token);
            }
          };
        </script>
      </body>
      </html>
    ''';
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 100,
      child: WebViewWidget(
        controller: _controller,
      ),
    );
  }
}