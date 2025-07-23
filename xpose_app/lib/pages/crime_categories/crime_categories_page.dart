import 'package:flutter/material.dart';
import 'package:Xpose/pages/crime_types/crime_types_page.dart';
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
        _allCategories = categories
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
            'description': category['description']?.toString() ?? 'No description available.',
          };
        })
            .toList();
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
      backgroundColor: Theme.of(context).colorScheme.background,
      appBar: AppBar(
        title: Text(
          'Crime Categories',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.w700,
            fontSize: 20,
          ),
        ),
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 2,
        shadowColor: Colors.black.withOpacity(0.2),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              onChanged: _filterCategories,
              style: const TextStyle(color: Colors.white, fontSize: 16),
              decoration: InputDecoration(
                hintText: 'Search categories...',
                hintStyle: TextStyle(color: Colors.white.withOpacity(0.6)),
                prefixIcon: Icon(Icons.search, color: Colors.white.withOpacity(0.8)),
                filled: true,
                fillColor: Colors.white.withOpacity(0.1),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide(
                    color: Theme.of(context).colorScheme.primary,
                    width: 2,
                  ),
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
              ),
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Colors.white))
                : _filteredCategories.isEmpty
                ? Center(
              child: Text(
                'No categories found.',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: Colors.white.withOpacity(0.7),
                  fontSize: 18,
                ),
              ),
            )
                : GridView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.9,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
              ),
              itemCount: _filteredCategories.length,
              itemBuilder: (context, index) {
                final Color itemColor = Theme.of(context).colorScheme.primary.withOpacity(0.9);
                return _buildCategoryCard(
                  context,
                  id: _filteredCategories[index]['id'],
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
        required int id,
        required IconData icon,
        required String label,
        required String description,
        required Color color,
      }) {
    return Card(
      elevation: 6,
      shadowColor: Colors.black.withOpacity(0.3),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: color.withOpacity(0.3)),
      ),
      color: Theme.of(context).colorScheme.surface.withOpacity(0.95),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          if (id > 0) {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => CrimeTypesPage(
                  categoryId: id,
                  categoryName: label,
                ),
              ),
            );
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Cannot navigate: Invalid category ID for $label'),
                backgroundColor: Theme.of(context).colorScheme.primary,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            );
          }
        },
        splashColor: color.withOpacity(0.4),
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 40,
                color: color,
              ),
              const SizedBox(height: 8),
              Text(
                label,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),
              Flexible(
                child: Text(
                  description,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.white.withOpacity(0.8),
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