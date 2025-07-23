import 'package:flutter/material.dart';
import 'package:Xpose/services/crime_type_service.dart';

class CrimeTypesPage extends StatefulWidget {
  final int categoryId;
  final String categoryName;

  const CrimeTypesPage({
    super.key,
    required this.categoryId,
    required this.categoryName,
  });

  @override
  State<CrimeTypesPage> createState() => _CrimeTypesPageState();
}

class _CrimeTypesPageState extends State<CrimeTypesPage> {
  List<Map<String, dynamic>> _allCrimeTypes = [];
  List<Map<String, dynamic>> _filteredCrimeTypes = [];
  bool _isLoading = true;
  TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchCrimeTypes();
  }

  Future<void> _fetchCrimeTypes() async {
    try {
      final crimeTypes = await CrimeTypeService.fetchCrimeTypesByCategory(widget.categoryId);
      setState(() {
        _allCrimeTypes = crimeTypes.map<Map<String, dynamic>>((crime) {
          IconData iconData = Icons.warning;
          String name = crime['name']?.toString() ?? 'Unknown Crime Type';
          switch (name.toLowerCase()) {
            case 'phishing scam':
            case 'cyberbullying':
              iconData = Icons.computer;
              break;
            case 'domestic violence':
            case 'homicide':
            case 'aggravated assault':
              iconData = Icons.gavel;
              break;
            case 'burglary':
              iconData = Icons.lock_open;
              break;
            case 'sexual assault':
              iconData = Icons.no_adult_content;
              break;
            case 'illegal parking':
              iconData = Icons.car_crash;
              break;
            case 'graffiti':
              iconData = Icons.broken_image;
              break;
          }
          return {
            'icon': iconData,
            'label': name,
            'description': crime['description']?.toString() ?? 'No description available.',
          };
        }).toList();
        _filteredCrimeTypes = _allCrimeTypes;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load crime types: $e')),
      );
    }
  }

  void _filterCrimeTypes(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredCrimeTypes = _allCrimeTypes;
      } else {
        _filteredCrimeTypes = _allCrimeTypes
            .where((crime) =>
        crime['label'].toLowerCase().contains(query.toLowerCase()) ||
            crime['description'].toLowerCase().contains(query.toLowerCase()))
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
          '${widget.categoryName} Types',
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
              onChanged: _filterCrimeTypes,
              style: const TextStyle(color: Colors.white, fontSize: 16),
              decoration: InputDecoration(
                hintText: 'Search crime types...',
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
                : _filteredCrimeTypes.isEmpty
                ? Center(
              child: Text(
                'No crime types available.',
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
              itemCount: _filteredCrimeTypes.length,
              itemBuilder: (context, index) {
                final Color itemColor = Theme.of(context).colorScheme.primary.withOpacity(0.9);
                return _buildCrimeTypeCard(
                  context,
                  icon: _filteredCrimeTypes[index]['icon'],
                  label: _filteredCrimeTypes[index]['label'],
                  description: _filteredCrimeTypes[index]['description'],
                  color: itemColor,
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCrimeTypeCard(
      BuildContext context, {
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
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Reporting: $label'),
              backgroundColor: Theme.of(context).colorScheme.primary,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          );
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