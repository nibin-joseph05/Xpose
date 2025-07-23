import 'package:flutter/material.dart';
import 'package:Xpose/services/crime_category_service.dart';

class CrimeCategoriesPage extends StatefulWidget {
  const CrimeCategoriesPage({super.key});

  @override
  State<CrimeCategoriesPage> createState() => _CrimeCategoriesPageState();
}

class _CrimeCategoriesPageState extends State<CrimeCategoriesPage> {
  List<Map<String, dynamic>> _allCategories = [];
  List<Map<String, dynamic>> _filteredCategories = [];
  bool _isLoading = true;
  TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchCrimeCategories();
  }

  Future<void> _fetchCrimeCategories() async {
    try {
      final categories = await CrimeCategoryService.fetchCategories();
      setState(() {
        _allCategories = categories.map<Map<String, dynamic>>((category) {
          IconData iconData = Icons.category;
          String name = category['name'] ?? 'Unknown Category';
          switch (name.toLowerCase()) {
            case 'cyber crimes':
              iconData = Icons.security;
              break;
            case 'violent crimes':
              iconData = Icons.gavel;
              break;
            case 'theft & robbery':
              iconData = Icons.local_mall;
              break;
            case 'sexual offenses':
              iconData = Icons.no_adult_content;
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
              iconData = Icons.broken_image;
              break;
            case 'traffic violations & hit-and-run':
              iconData = Icons.directions_car;
              break;
            case 'environmental crimes':
              iconData = Icons.eco;
              break;
            default:
              iconData = Icons.report;
              break;
          }
          return {
            'icon': iconData,
            'label': name,
            'description': category['description'] ?? 'No description available.',
          };
        }).toList();
        _filteredCategories = _allCategories;
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

  void _filterCategories(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredCategories = _allCategories;
      } else {
        _filteredCategories = _allCategories
            .where((category) =>
        category['label'].toLowerCase().contains(query.toLowerCase()) ||
            category['description'].toLowerCase().contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Crime Categories',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              onChanged: _filterCategories,
              style: const TextStyle(color: Colors.white70),
              decoration: InputDecoration(
                hintText: 'Search categories or descriptions...',
                hintStyle: const TextStyle(color: Colors.white54),
                prefixIcon: const Icon(Icons.search, color: Colors.white70),
                filled: true,
                fillColor: Theme.of(context).colorScheme.surface,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                      color: Theme.of(context).colorScheme.primary, width: 1.5),
                ),
              ),
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredCategories.isEmpty
                ? Center(
              child: Text(
                'No categories found.',
                style: Theme.of(context)
                    .textTheme
                    .bodyLarge
                    ?.copyWith(color: Colors.white70),
              ),
            )
                : GridView.builder(
              padding: const EdgeInsets.symmetric(
                  horizontal: 16.0, vertical: 8.0),
              gridDelegate:
              const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.85,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: _filteredCategories.length,
              itemBuilder: (context, index) {
                final Color itemColor =
                Theme.of(context).colorScheme.primary.withOpacity(0.8);
                return _buildCategoryCard(
                  context,
                  icon: _filteredCategories[index]['icon'],
                  label: _filteredCategories[index]['label'],
                  description: _filteredCategories[index]['description'],
                  color: itemColor,
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryCard(
      BuildContext context, {
        required IconData icon,
        required String label,
        required String description,
        required Color color,
      }) {
    return Card(
      elevation: 4,
      shadowColor: color.withOpacity(0.3),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: color.withOpacity(0.2)),
      ),
      color: Theme.of(context).colorScheme.surface,
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Selected: $label')),
          );
        },
        splashColor: color.withOpacity(0.3),
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 36,
                color: color,
              ),
              const SizedBox(height: 6),
              Text(
                label,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 6),
              Flexible(
                child: Text(
                  description,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 11,
                    color: Colors.white70,
                    fontWeight: FontWeight.w400,
                  ),
                  maxLines: 3,
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