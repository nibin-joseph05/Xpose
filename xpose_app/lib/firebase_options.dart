// File generated by FlutterFire CLI.
// ignore_for_file: type=lint
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
///
/// Example:
/// ```dart
/// import 'firebase_options.dart';
/// // ...
/// await Firebase.initializeApp(
///   options: DefaultFirebaseOptions.currentPlatform,
/// );
/// ```
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        return windows;
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyBccfdXRnJoC1Z18Cq1ZBo4J4HeWveuVU0',
    appId: '1:46001093394:web:38f2ed96238a9c271e91cb',
    messagingSenderId: '46001093394',
    projectId: 'x-pose-95a07',
    authDomain: 'x-pose-95a07.firebaseapp.com',
    storageBucket: 'x-pose-95a07.firebasestorage.app',
    measurementId: 'G-FCHVGFNC4T',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyCNn1SAOhoB8Pl_XzXWKsoLrziYtStWZzc',
    appId: '1:46001093394:android:ca89e38c8a73d1961e91cb',
    messagingSenderId: '46001093394',
    projectId: 'x-pose-95a07',
    storageBucket: 'x-pose-95a07.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyAKvJRcIaurRzpjwNzV37GaWIL96k9246s',
    appId: '1:46001093394:ios:f30a402b93aceec61e91cb',
    messagingSenderId: '46001093394',
    projectId: 'x-pose-95a07',
    storageBucket: 'x-pose-95a07.firebasestorage.app',
    iosBundleId: 'com.example.xposeApp',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'AIzaSyAKvJRcIaurRzpjwNzV37GaWIL96k9246s',
    appId: '1:46001093394:ios:f30a402b93aceec61e91cb',
    messagingSenderId: '46001093394',
    projectId: 'x-pose-95a07',
    storageBucket: 'x-pose-95a07.firebasestorage.app',
    iosBundleId: 'com.example.xposeApp',
  );

  static const FirebaseOptions windows = FirebaseOptions(
    apiKey: 'AIzaSyBccfdXRnJoC1Z18Cq1ZBo4J4HeWveuVU0',
    appId: '1:46001093394:web:0cff73bf98b04aec1e91cb',
    messagingSenderId: '46001093394',
    projectId: 'x-pose-95a07',
    authDomain: 'x-pose-95a07.firebaseapp.com',
    storageBucket: 'x-pose-95a07.firebasestorage.app',
    measurementId: 'G-FLV6HNJVTP',
  );
}
