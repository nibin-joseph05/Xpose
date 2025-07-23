import 'package:flutter/material.dart';
import 'package:flutter/animation.dart';
import 'package:Xpose/pages/crime_categories/crime_categories_page.dart';
import 'package:Xpose/pages/crime_types/crime_types_page.dart';
import 'package:Xpose/services/crime_category_service.dart';

class HomeServices extends StatefulWidget {
  const HomeServices({super.key});

  @override
  State<HomeServices> createState() => _HomeServicesState();
}

class _HomeServicesState extends State<HomeServices> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  List<Map<String, dynamic>> _services = [];
  bool _isLoading = true;

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
    _fetchCrimeCategories();
  }

  Future<void> _fetchCrimeCategories() async {
    try {
      final categories = await CrimeCategoryService.fetchCategories();
      setState(() {
        _services = categories
            .asMap()
            .entries
            .where((entry) {
          final category = entry.value;
          return category['id'] != null && category['id'] is int && category['id'] > 0;
        })
            .map((entry) {
          final category = entry.value;
          IconData iconData = Icons.report_problem;
          String name = category['name']?.toString() ?? 'Unknown Category';
          switch (name.toLowerCase()) {
            case 'cyber crimes':
              iconData = Icons.security;
              break;
            case 'violent crimes':
              iconData = Icons.warning_rounded;
              break;
            case 'theft & robbery':
              iconData = Icons.local_mall;
              break;
            case 'sexual offenses':
              iconData = Icons.block;
              break;
            case 'child abuse & exploitation':
              iconData = Icons.child_care;
              break;
            case 'corruption & bribery':
              iconData = Icons.balance;
              break;
            case 'missing persons / abductions':
              iconData = Icons.person_search;
              break;
            case 'vandalism & property damage':
              iconData = Icons.handyman;
              break;
            case 'traffic violations & hit-and-run':
              iconData = Icons.directions_car;
              break;
            case 'environmental crimes':
              iconData = Icons.eco;
              break;
          }
          return {
            'id': category['id'],
            'icon': iconData,
            'label': name,
          };
        })
            .toList();

        if (_services.length > 8) {
          final List<Map<String, dynamic>> displayedServices = _services.sublist(0, 8);
          if (!displayedServices.any((service) => service['label'] == 'More')) {
            displayedServices.add({
              'id': null,
              'icon': Icons.more_horiz,
              'label': 'More'
            });
          }
          _services = displayedServices;
        }

        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load categories: $e')),
      );
    }
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
              fontWeight: FontWeight.w700,
              fontSize: 20,
            ),
          ),
          const SizedBox(height: 16),
          _isLoading
              ? const Center(child: CircularProgressIndicator(color: Colors.white))
              : GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            padding: EdgeInsets.zero,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              childAspectRatio: 1.0,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: _services.length,
            itemBuilder: (context, index) {
              final Color itemColor = Theme.of(context).colorScheme.primary.withOpacity(0.9);
              final service = _services[index];
              bool isMoreButton = service['label'] == 'More' && service['icon'] == Icons.more_horiz;
              return _buildServiceButton(
                context,
                icon: service['icon'],
                label: service['label'],
                color: itemColor,
                onTap: () {
                  if (isMoreButton) {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const CrimeCategoriesPage()),
                    );
                  } else if (service['id'] is int && service['id'] > 0) {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => CrimeTypesPage(
                          categoryId: service['id'],
                          categoryName: service['label'],
                        ),
                      ),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Cannot navigate: Invalid category ID for ${service['label']}'),
                        backgroundColor: Theme.of(context).colorScheme.primary,
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    );
                  }
                },
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
        required VoidCallback onTap,
      }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        splashColor: color.withOpacity(0.3),
        highlightColor: color.withOpacity(0.2),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: color.withOpacity(0.3),
              width: 1.0,
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 36, color: color),
              const SizedBox(height: 8),
              Flexible(
                child: Text(
                  label,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 2,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}