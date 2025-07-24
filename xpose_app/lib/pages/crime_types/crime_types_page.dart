import 'package:flutter/material.dart';
import 'package:Xpose/services/crime_type_service.dart';
import 'package:Xpose/pages/crime_report/crime_report_page.dart';

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
              iconData = Icons.email;
              break;
            case 'identity theft':
              iconData = Icons.perm_identity;
              break;
            case 'cyberbullying':
              iconData = Icons.chat_bubble_outline;
              break;
            case 'hacking':
              iconData = Icons.computer;
              break;
            case 'online fraud':
              iconData = Icons.credit_card_off;
              break;
            case 'homicide':
              iconData = Icons.dangerous;
              break;
            case 'aggravated assault':
              iconData = Icons.gavel;
              break;
            case 'battery':
              iconData = Icons.personal_injury;
              break;
            case 'kidnapping':
              iconData = Icons.person_off;
              break;
            case 'armed assault':
              iconData = Icons.security;
              break;
            case 'sexual assault':
              iconData = Icons.no_adult_content;
              break;
            case 'rape':
              iconData = Icons.block;
              break;
            case 'molestation':
              iconData = Icons.warning_amber;
              break;
            case 'indecent exposure':
              iconData = Icons.visibility_off;
              break;
            case 'online sexual harassment':
              iconData = Icons.message;
              break;
            case 'child labor':
              iconData = Icons.work_off;
              break;
            case 'sexual exploitation':
              iconData = Icons.child_care;
              break;
            case 'child neglect':
              iconData = Icons.child_care;
              break;
            case 'physical abuse':
              iconData = Icons.pan_tool;
              break;
            case 'child trafficking':
              iconData = Icons.group_off;
              break;
            case 'burglary':
              iconData = Icons.lock_open;
              break;
            case 'armed robbery':
              iconData = Icons.local_mall;
              break;
            case 'pickpocketing':
              iconData = Icons.handshake;
              break;
            case 'shoplifting':
              iconData = Icons.store;
              break;
            case 'snatching':
              iconData = Icons.speed;
              break;
            case 'bribery':
              iconData = Icons.money;
              break;
            case 'extortion':
              iconData = Icons.gavel;
              break;
            case 'misuse of power':
              iconData = Icons.account_balance;
              break;
            case 'fraudulent tendering':
              iconData = Icons.description;
              break;
            case 'missing adult':
              iconData = Icons.person_search;
              break;
            case 'missing child':
              iconData = Icons.child_care;
              break;
            case 'runaway minor':
              iconData = Icons.directions_run;
              break;
            case 'graffiti':
              iconData = Icons.broken_image;
              break;
            case 'arson':
              iconData = Icons.local_fire_department;
              break;
            case 'smashing property':
              iconData = Icons.handyman;
              break;
            case 'tampering with public utilities':
              iconData = Icons.electrical_services;
              break;
            case 'hit and run':
              iconData = Icons.car_crash;
              break;
            case 'illegal parking':
              iconData = Icons.local_parking;
              break;
            case 'reckless driving':
              iconData = Icons.directions_car;
              break;
            case 'driving under influence (dui)':
              iconData = Icons.local_bar;
              break;
            case 'illegal dumping':
              iconData = Icons.delete;
              break;
            case 'water pollution':
              iconData = Icons.water_drop;
              break;
            case 'deforestation':
              iconData = Icons.park;
              break;
            case 'wildlife poaching':
              iconData = Icons.pets;
              break;
            case 'drug possession':
              iconData = Icons.medication;
              break;
            case 'drug trafficking':
              iconData = Icons.local_shipping;
              break;
            case 'drug manufacturing':
              iconData = Icons.science;
              break;
            case 'use in public':
              iconData = Icons.smoke_free;
              break;
            case 'racial abuse':
              iconData = Icons.group;
              break;
            case 'religious discrimination':
              iconData = Icons.church;
              break;
            case 'gender-based violence':
              iconData = Icons.wc;
              break;
            case 'domestic violence':
              iconData = Icons.family_restroom;
              break;
            case 'spousal abuse':
              iconData = Icons.favorite_border;
              break;
            case 'elder abuse':
              iconData = Icons.elderly;
              break;
            case 'marital rape':
              iconData = Icons.heart_broken;
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
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => CrimeReportPage(
                categoryId: widget.categoryId,
                categoryName: widget.categoryName,
                crimeType: label,
              ),
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