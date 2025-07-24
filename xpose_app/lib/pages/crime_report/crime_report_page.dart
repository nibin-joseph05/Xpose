import 'package:flutter/material.dart';
import 'package:Xpose/pages/crime_categories/crime_categories_page.dart';
import 'package:Xpose/services/crime_category_service.dart';
import 'package:Xpose/services/crime_type_service.dart';
import 'package:file_picker/file_picker.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class CrimeReportPage extends StatefulWidget {
  final int categoryId;
  final String categoryName;
  final String crimeType;

  const CrimeReportPage({
    super.key,
    required this.categoryId,
    required this.categoryName,
    required this.crimeType,
  });

  @override
  State<CrimeReportPage> createState() => _CrimeReportPageState();
}

class _CrimeReportPageState extends State<CrimeReportPage> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _placeController = TextEditingController();
  String? _selectedState;
  String? _selectedDistrict;
  String? _selectedPoliceStation;
  List<String> _states = ['Select State'];
  List<String> _districts = ['Select District'];
  List<String> _policeStations = ['Select Police Station'];
  List<PlatformFile> _selectedFiles = [];
  bool _isLoading = false;
  bool _useCurrentLocation = false;

  @override
  void initState() {
    super.initState();
    _loadStates();
    _checkLocationPermission();
  }

  Future<void> _loadStates() async {
    try {
      final response = await http.get(Uri.parse('https://api.example.com/states'));
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          _states = ['Select State', ...data.map((e) => e['name'].toString())];
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load states: $e')),
      );
    }
  }

  Future<void> _loadDistricts(String state) async {
    if (state != 'Select State') {
      try {
        final response = await http.get(Uri.parse('https://api.example.com/districts?state=$state'));
        if (response.statusCode == 200) {
          final List<dynamic> data = json.decode(response.body);
          setState(() {
            _districts = ['Select District', ...data.map((e) => e['name'].toString())];
            _selectedDistrict = null;
            _policeStations = ['Select Police Station'];
            _selectedPoliceStation = null;
          });
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load districts: $e')),
        );
      }
    } else {
      setState(() {
        _districts = ['Select District'];
        _selectedDistrict = null;
        _policeStations = ['Select Police Station'];
        _selectedPoliceStation = null;
      });
    }
  }

  Future<void> _loadPoliceStations(String district) async {
    if (district != 'Select District') {
      try {
        final response = await http.get(Uri.parse('https://api.example.com/police-stations?district=$district'));
        if (response.statusCode == 200) {
          final List<dynamic> data = json.decode(response.body);
          setState(() {
            _policeStations = ['Select Police Station', ...data.map((e) => e['name'].toString())];
            _selectedPoliceStation = null;
          });
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load police stations: $e')),
        );
      }
    } else {
      setState(() {
        _policeStations = ['Select Police Station'];
        _selectedPoliceStation = null;
      });
    }
  }

  Future<void> _checkLocationPermission() async {
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.whileInUse || permission == LocationPermission.always) {
      setState(() {
        _useCurrentLocation = true;
      });
    }
  }

  Future<void> _fetchCurrentLocation() async {
    try {
      setState(() {
        _isLoading = true;
      });
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      final response = await http.get(
        Uri.parse('https://api.example.com/nearest-police-station?lat=${position.latitude}&long=${position.longitude}'),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _placeController.text = data['address'] ?? 'Lat: ${position.latitude}, Long: ${position.longitude}';
          _selectedState = data['state'] ?? 'Select State';
          _selectedDistrict = data['district'] ?? 'Select District';
          _selectedPoliceStation = data['police_station'] ?? 'Nearest Station';
          _useCurrentLocation = true;
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to fetch police station');
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to fetch location: $e')),
      );
    }
  }

  Future<void> _pickFiles() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        allowMultiple: true,
        type: FileType.custom,
        allowedExtensions: ['jpg', 'png', 'mp4', 'mp3', 'pdf'],
      );
      if (result != null) {
        setState(() {
          _selectedFiles = result.files;
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to pick files: $e')),
      );
    }
  }

  void _submitReport() {
    if (_formKey.currentState!.validate()) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Crime report submitted successfully'),
          backgroundColor: Theme.of(context).colorScheme.primary,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    _placeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      appBar: AppBar(
        title: Text(
          'Report ${widget.crimeType}',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.w700,
            fontSize: 22,
            letterSpacing: 0.5,
          ),
        ),
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 4,
        shadowColor: Colors.black.withOpacity(0.3),
        actions: [
          TextButton.icon(
            onPressed: () {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => const CrimeCategoriesPage()),
              );
            },
            icon: Icon(Icons.category, color: Theme.of(context).colorScheme.primary),
            label: Text(
              'Change Category',
              style: TextStyle(
                color: Theme.of(context).colorScheme.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator(color: Theme.of(context).colorScheme.primary))
          : SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Card(
                elevation: 8,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                  side: BorderSide(
                    color: Theme.of(context).colorScheme.primary.withOpacity(0.4),
                    width: 1.5,
                  ),
                ),
                color: Theme.of(context).colorScheme.surface.withOpacity(0.97),
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.lock,
                            color: Theme.of(context).colorScheme.primary,
                            size: 28,
                          ),
                          const SizedBox(width: 12),
                          Text(
                            'Your Privacy Matters',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                              fontSize: 18,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Your submission is completely anonymous. We do not collect or store any personal information related to your crime report, ensuring your safety and privacy.',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.85),
                          fontSize: 15,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Crime Details',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 20,
                ),
              ),
              const SizedBox(height: 12),
              Card(
                elevation: 8,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                  side: BorderSide(
                    color: Theme.of(context).colorScheme.primary.withOpacity(0.4),
                    width: 1.5,
                  ),
                ),
                color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.category,
                            color: Theme.of(context).colorScheme.primary,
                            size: 24,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              widget.categoryName,
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: Theme.of(context).colorScheme.primary,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Icon(
                            Icons.warning_rounded,
                            color: Theme.of(context).colorScheme.primary,
                            size: 24,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              widget.crimeType,
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: Theme.of(context).colorScheme.primary,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              TextFormField(
                controller: _descriptionController,
                maxLines: 5,
                style: const TextStyle(color: Colors.white, fontSize: 16),
                decoration: InputDecoration(
                  hintText: 'Describe the crime in detail...',
                  hintStyle: TextStyle(color: Colors.white.withOpacity(0.6)),
                  filled: true,
                  fillColor: Colors.white.withOpacity(0.1),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(20),
                    borderSide: BorderSide.none,
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(20),
                    borderSide: BorderSide(
                      color: Theme.of(context).colorScheme.primary,
                      width: 2.5,
                    ),
                  ),
                  contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a description of the crime';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              TextFormField(
                controller: _placeController,
                style: const TextStyle(color: Colors.white, fontSize: 16),
                decoration: InputDecoration(
                  hintText: 'Place of occurrence...',
                  hintStyle: TextStyle(color: Colors.white.withOpacity(0.6)),
                  filled: true,
                  fillColor: Colors.white.withOpacity(0.1),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(20),
                    borderSide: BorderSide.none,
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(20),
                    borderSide: BorderSide(
                      color: Theme.of(context).colorScheme.primary,
                      width: 2.5,
                    ),
                  ),
                  contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                  suffixIcon: _useCurrentLocation
                      ? IconButton(
                    icon: Icon(
                      Icons.location_on,
                      color: Theme.of(context).colorScheme.primary,
                      size: 28,
                    ),
                    onPressed: _fetchCurrentLocation,
                  )
                      : null,
                ),
                readOnly: _useCurrentLocation,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter the place of occurrence';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),
              AnimatedOpacity(
                opacity: _useCurrentLocation ? 0.5 : 1.0,
                duration: const Duration(milliseconds: 300),
                child: DropdownButtonFormField<String>(
                  value: _selectedState,
                  items: _states
                      .map((state) => DropdownMenuItem(
                    value: state,
                    child: Text(
                      state,
                      style: const TextStyle(color: Colors.white),
                    ),
                  ))
                      .toList(),
                  onChanged: _useCurrentLocation
                      ? null
                      : (value) {
                    setState(() {
                      _selectedState = value;
                      _loadDistricts(value!);
                    });
                  },
                  style: const TextStyle(color: Colors.white),
                  dropdownColor: Theme.of(context).colorScheme.surface,
                  decoration: InputDecoration(
                    labelText: 'State',
                    labelStyle: TextStyle(color: Colors.white.withOpacity(0.8)),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.1),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20),
                      borderSide: BorderSide.none,
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20),
                      borderSide: BorderSide(
                        color: Theme.of(context).colorScheme.primary,
                        width: 2.5,
                      ),
                    ),
                    contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                  ),
                  validator: (value) {
                    if (!_useCurrentLocation && (value == null || value == 'Select State')) {
                      return 'Please select a state';
                    }
                    return null;
                  },
                ),
              ),
              const SizedBox(height: 24),
              AnimatedOpacity(
                opacity: _useCurrentLocation ? 0.5 : 1.0,
                duration: const Duration(milliseconds: 300),
                child: DropdownButtonFormField<String>(
                  value: _selectedDistrict,
                  items: _districts
                      .map((district) => DropdownMenuItem(
                    value: district,
                    child: Text(
                      district,
                      style: const TextStyle(color: Colors.white),
                    ),
                  ))
                      .toList(),
                  onChanged: _useCurrentLocation || _selectedState == 'Select State'
                      ? null
                      : (value) {
                    setState(() {
                      _selectedDistrict = value;
                      _loadPoliceStations(value!);
                    });
                  },
                  style: const TextStyle(color: Colors.white),
                  dropdownColor: Theme.of(context).colorScheme.surface,
                  decoration: InputDecoration(
                    labelText: 'District',
                    labelStyle: TextStyle(color: Colors.white.withOpacity(0.8)),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.1),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20),
                      borderSide: BorderSide.none,
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20),
                      borderSide: BorderSide(
                        color: Theme.of(context).colorScheme.primary,
                        width: 2.5,
                      ),
                    ),
                    contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                  ),
                  validator: (value) {
                    if (!_useCurrentLocation && (value == null || value == 'Select District')) {
                      return 'Please select a district';
                    }
                    return null;
                  },
                ),
              ),
              const SizedBox(height: 24),
              AnimatedOpacity(
                opacity: _useCurrentLocation ? 0.5 : 1.0,
                duration: const Duration(milliseconds: 300),
                child: DropdownButtonFormField<String>(
                  value: _selectedPoliceStation,
                  items: _policeStations
                      .map((station) => DropdownMenuItem(
                    value: station,
                    child: Text(
                      station,
                      style: const TextStyle(color: Colors.white),
                    ),
                  ))
                      .toList(),
                  onChanged: _useCurrentLocation || _selectedDistrict == 'Select District'
                      ? null
                      : (value) {
                    setState(() {
                      _selectedPoliceStation = value;
                    });
                  },
                  style: const TextStyle(color: Colors.white),
                  dropdownColor: Theme.of(context).colorScheme.surface,
                  decoration: InputDecoration(
                    labelText: 'Police Station',
                    labelStyle: TextStyle(color: Colors.white.withOpacity(0.8)),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.1),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20),
                      borderSide: BorderSide.none,
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(20),
                      borderSide: BorderSide(
                        color: Theme.of(context).colorScheme.primary,
                        width: 2.5,
                      ),
                    ),
                    contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                  ),
                  validator: (value) {
                    if (!_useCurrentLocation && (value == null || value == 'Select Police Station')) {
                      return 'Please select a police station';
                    }
                    return null;
                  },
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _pickFiles,
                icon: const Icon(Icons.attach_file, color: Colors.white, size: 24),
                label: const Text(
                  'Upload Evidence',
                  style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                  elevation: 4,
                ),
              ),
              if (_selectedFiles.isNotEmpty) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surface.withOpacity(0.9),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Theme.of(context).colorScheme.primary.withOpacity(0.4),
                    ),
                  ),
                  child: Text(
                    'Selected Files: ${_selectedFiles.length}',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.85),
                      fontSize: 15,
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _submitReport,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  minimumSize: const Size(double.infinity, 56),
                  elevation: 4,
                ),
                child: const Text(
                  'Submit Report',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}