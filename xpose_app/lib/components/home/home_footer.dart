import 'package:flutter/material.dart';
import 'package:Xpose/pages/profile/profile_page.dart';
import 'package:Xpose/pages/home/home.dart';
import 'package:Xpose/pages/reports/reports_search_page.dart';
import 'package:Xpose/pages/crime_categories/crime_categories_page.dart';
import 'package:Xpose/pages/sos/sos_page.dart';

class HomeFooter extends StatelessWidget {
  const HomeFooter({super.key});

  @override
  Widget build(BuildContext context) {
    final double footerHeight = 70.0;
    final double navIconSize = 24.0;
    final double sosButtonDiameter = 60.0;
    final double sosIconSize = 36.0;

    final double sosButtonTopOffset = -sosButtonDiameter / 2;

    return Container(
      height: footerHeight,
      alignment: Alignment.bottomCenter,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.blueGrey[900]?.withOpacity(0.8),
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(25),
          topRight: Radius.circular(25),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.4),
            blurRadius: 15,
            spreadRadius: 3,
            offset: const Offset(0, -6),
          ),
        ],
      ),
      child: Stack(
        clipBehavior: Clip.none,
        alignment: Alignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              Expanded(
                child: _buildNavItem(
                  context,
                  Icons.home_filled,
                  'Home',
                  navIconSize,
                  isActive: true,
                  onTap: () {
                    Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute(builder: (context) => const HomePage()),
                          (Route<dynamic> route) => false,
                    );
                  },
                ),
              ),
              Expanded(
                child: _buildNavItem(
                  context,
                  Icons.assignment,
                  'Reports',
                  navIconSize,
                  isActive: false,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const ReportSearchPage()),
                    );
                  },
                ),
              ),
              SizedBox(width: sosButtonDiameter + 20),
              Expanded(
                child: _buildNavItem(
                  context,
                  Icons.person,
                  'Profile',
                  navIconSize,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => ProfilePage()),
                    );
                  },
                ),
              ),
              Expanded(
                child: _buildNavItem(
                  context,
                  Icons.more_horiz,
                  'More',
                  navIconSize,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const CrimeCategoriesPage()),
                    );
                  },
                ),
              ),
            ],
          ),
          Positioned(
            top: sosButtonTopOffset,
            child: _buildSosButton(context, sosButtonDiameter, sosIconSize),
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(
      BuildContext context,
      IconData icon,
      String label,
      double iconSize, {
        bool isActive = false,
        required VoidCallback onTap,
      }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(30),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 4.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isActive
                    ? Theme.of(context).colorScheme.primary.withOpacity(0.2)
                    : Colors.transparent,
              ),
              padding: const EdgeInsets.all(8),
              child: Icon(
                icon,
                color: isActive
                    ? Theme.of(context).colorScheme.primary
                    : Colors.white70,
                size: iconSize,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: isActive
                    ? Theme.of(context).colorScheme.primary
                    : Colors.white70,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSosButton(BuildContext context, double diameter, double iconSize) {
    return Container(
      width: diameter,
      height: diameter,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          colors: [
            Colors.red[600]!,
            Colors.red[800]!,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.red.withOpacity(0.7),
            blurRadius: 20,
            spreadRadius: 5,
            offset: const Offset(0, 8),
          ),
        ],
        border: Border.all(
          color: Colors.red[300]!,
          width: 3,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const SosPage()),
            );
          },

          borderRadius: BorderRadius.circular(diameter / 2),
          child: Center(
            child: Icon(
              Icons.sos,
              color: Colors.white,
              size: iconSize,
            ),
          ),
        ),
      ),
    );
  }
}