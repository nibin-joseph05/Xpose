import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:Xpose/pages/auth/auth_page.dart';
import 'package:Xpose/pages/home/home.dart';
import 'package:Xpose/helpers/user_preferences.dart';

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
    final firebaseUser = FirebaseAuth.instance.currentUser;
    final appUser = await UserPreferences.getUser();

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