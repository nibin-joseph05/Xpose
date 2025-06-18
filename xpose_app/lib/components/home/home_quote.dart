// home_quote.dart
import 'package:flutter/material.dart';
import 'package:flutter/animation.dart';

class HomeQuote extends StatefulWidget {
  const HomeQuote({super.key});

  @override
  State<HomeQuote> createState() => _HomeQuoteState();
}

class _HomeQuoteState extends State<HomeQuote> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    )..forward();
    _fadeAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeIn,
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: Text(
        '“Courage is contagious. When one person stands up,\nothers are empowered to do the same.”\n— Nora Raleigh Baskin',
        textAlign: TextAlign.center,
        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
          fontSize: 14,
          fontStyle: FontStyle.italic,
          color: Colors.white70,
        ),
      ),
    );
  }
}