import 'package:flutter/material.dart';
import 'package:flutter/animation.dart';

class HomeServices extends StatefulWidget {
  const HomeServices({super.key});

  @override
  State<HomeServices> createState() => _HomeServicesState();
}

class _HomeServicesState extends State<HomeServices> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  final List<Map<String, dynamic>> _services = [
    {'icon': Icons.description, 'label': 'Report Incident'},
    {'icon': Icons.folder_shared, 'label': 'My Reports'},
    {'icon': Icons.gavel, 'label': 'Harassment'},
    {'icon': Icons.local_pharmacy, 'label': 'Drug Abuse'},
    {'icon': Icons.security, 'label': 'Theft'},
    {'icon': Icons.balance, 'label': 'Corruption'},
    {'icon': Icons.contact_support, 'label': 'Support'},
    {'icon': Icons.medical_services, 'label': 'Emergency'},
    {'icon': Icons.more_horiz, 'label': 'More'},
  ];

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    )..forward();
    _scaleAnimation = Tween<double>(begin: 0.95, end: 1).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOutBack,
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
    return ScaleTransition(
      scale: _scaleAnimation,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Report Crime',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            padding: EdgeInsets.zero,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3, // Changed to 3 items per row
              childAspectRatio: 1.0, // Adjusted aspect ratio for square-like items
              crossAxisSpacing: 12, // Adjusted spacing
              mainAxisSpacing: 12,   // Adjusted spacing
            ),
            itemCount: _services.length,
            itemBuilder: (context, index) {
              final Color itemColor = Theme.of(context).colorScheme.primary.withOpacity(0.8);

              return _buildServiceButton(
                context,
                icon: _services[index]['icon'],
                label: _services[index]['label'],
                color: itemColor,
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildServiceButton(
      BuildContext context, {
        required IconData icon,
        required String label,
        required Color color,
      }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {},
        splashColor: color.withOpacity(0.3),
        highlightColor: color.withOpacity(0.2),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.transparent, // Background color removed
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: color.withOpacity(0.3), // Lighter border
              width: 1.0, // Thinner border
            ),
          ),
          child: Column( // Changed to Column for vertical arrangement
            mainAxisAlignment: MainAxisAlignment.center, // Center content vertically
            children: [
              Icon(icon, size: 36, color: color), // Larger icon
              const SizedBox(height: 8), // Spacing between icon and label
              Flexible(
                child: Text(
                  label,
                  textAlign: TextAlign.center, // Center align text
                  style: const TextStyle(
                    fontSize: 13, // Slightly smaller font for label
                    fontWeight: FontWeight.w600,
                    color: Colors.white70, // Softer white
                  ),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 2, // Allow label to wrap if needed
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}