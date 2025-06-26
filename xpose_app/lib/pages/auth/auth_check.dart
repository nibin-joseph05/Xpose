// lib/pages/auth/auth_check.dart
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart' as fb_auth;
import 'package:Xpose/pages/auth/auth_page.dart';
import 'package:Xpose/pages/home/home.dart';
import 'package:Xpose/helpers/user_preferences.dart';
import 'package:Xpose/models/user_model.dart';

class AuthCheck extends StatefulWidget {
  const AuthCheck({super.key});

  @override
  State<AuthCheck> createState() => _AuthCheckState();
}

class _AuthCheckState extends State<AuthCheck> {
  bool _isLoading = true;
  bool _hasUser = false;

  @override
  void initState() {
    super.initState();
    _checkAuthState();
  }

  Future<void> _checkAuthState() async {
    final fb_auth.User? firebaseUser = fb_auth.FirebaseAuth.instance.currentUser; // Use fb_auth.User
    final User? appUser = await UserPreferences.getUser(); // Your custom User model

    setState(() {
      _hasUser = firebaseUser != null && appUser != null;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return _hasUser ? const HomePage() : const AuthPage();
  }
}