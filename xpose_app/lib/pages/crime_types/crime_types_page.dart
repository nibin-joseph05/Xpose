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
          String name = crime['name'] ?? 'Unknown Crime Type';
          switch (name.toLowerCase()) {
            case 'hacking':
            case 'phishing':
              iconData = Icons.computer;
              break;
            case 'assault':
            case 'murder':
              iconData = Icons.gavel;
              break;
            case 'burglary':
            case 'robbery':
              iconData = Icons.lock_open;
              break;
            case 'sexual assault':
              iconData = Icons.no_adult_content;
              break;
            case 'child abuse':
              iconData = Icons.child_care;
              break;
            case 'bribery':
              iconData = Icons.money_off;
              break;
            case 'kidnapping':
              iconData = Icons.person_search;
              break;
            case 'vandalism':
              iconData = Icons.broken_image;
              break;
            case 'hit and run':
              iconData = Icons.car_crash;
              break;
            case 'poaching':
              iconData = Icons.nature;
              break;
            default:
              iconData = Icons.warning;
              break;
          }
          return {
            'icon': iconData,
            'label': name,
            'description': crime['description'] ?? 'No description available.',
            'priority': crime['priority'] ?? 'Unknown',
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
      appBar: AppBar(
        title: Text(
          '${widget.categoryName} Types',
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
              onChanged: _filterCrimeTypes,
              style: const TextStyle(color: Colors.white70),
              decoration: InputDecoration(
                hintText: 'Search crime types or descriptions...',
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
                : _filteredCrimeTypes.isEmpty
                ? Center(
              child: Text(
                'No crime types found.',
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
              itemCount: _filteredCrimeTypes.length,
              itemBuilder: (context, index) {
                final Color itemColor =
                Theme.of(context).colorScheme.primary.withOpacity(0.8);
                return _buildCrimeTypeCard(
                  context,
                  icon: _filteredCrimeTypes[index]['icon'],
                  label: _filteredCrimeTypes[index]['label'],
                  description: _filteredCrimeTypes[index]['description'],
                  priority: _filteredCrimeTypes[index]['priority'],
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
        required String priority,
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
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Priority: $priority',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 10,
                  color: Colors.white54,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}