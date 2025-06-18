// home_services.dart
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
    {'icon': Icons.report, 'label': 'Report Incident', 'color': Colors.blue},
    {'icon': Icons.folder_open, 'label': 'My Reports', 'color': Colors.amber},
    {'icon': Icons.local_police, 'label': 'Harassment', 'color': Colors.purple},
    {'icon': Icons.warning, 'label': 'Drug Abuse', 'color': Colors.red},
    {'icon': Icons.money_off, 'label': 'Theft', 'color': Colors.green},
    {'icon': Icons.gavel, 'label': 'Corruption', 'color': Colors.deepOrange},
    {'icon': Icons.help_outline, 'label': 'Support', 'color': Colors.deepPurple},
    {'icon': Icons.emergency, 'label': 'Emergency', 'color': Colors.redAccent},
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
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 16),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            padding: EdgeInsets.zero,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 3.2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
            ),
            itemCount: _services.length,
            itemBuilder: (context, index) {
              return _buildServiceButton(
                context,
                icon: _services[index]['icon'],
                label: _services[index]['label'],
                color: Color.lerp(
                  _services[index]['color'],
                  Colors.black,
                  0.2,
                )!,
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
      borderRadius: BorderRadius.circular(16),
      elevation: 4,
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {},
        splashColor: color.withOpacity(0.2),
        highlightColor: color.withOpacity(0.1),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: color.withOpacity(0.15),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: color.withOpacity(0.3),
              width: 1,
            ),
          ),
          child: Row(
            children: [
              Icon(icon, size: 24, color: color),
              const SizedBox(width: 12),
              Flexible(
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}