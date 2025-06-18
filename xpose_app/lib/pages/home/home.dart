// home_page.dart
import 'package:flutter/material.dart';
import 'package:Xpose/components/home/home_header.dart';
import 'package:Xpose/components/home/home_quote.dart';
import 'package:Xpose/components/home/home_services.dart';
import 'package:Xpose/components/home/home_footer.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      body: SafeArea(
        child: Column(
          children: [
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: HomeHeader(),
            ),
            const Divider(
              height: 1,
              thickness: 0.5,
              color: Colors.white24,
              indent: 24,
              endIndent: 24,
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: HomeQuote(),
            ),
            const SizedBox(height: 8),
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(32),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.3),
                      blurRadius: 20,
                      spreadRadius: 5,
                    ),
                  ],
                ),
                child: const SingleChildScrollView(
                  padding: EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                  child: HomeServices(),
                ),
              ),
            ),
            Container(
              height: 80,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surface,
                border: const Border(
                  top: BorderSide(color: Colors.white24, width: 0.5),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.4),
                    blurRadius: 10,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: const HomeFooter(),
            ),
          ],
        ),
      ),
    );
  }
}