import 'package:flutter/material.dart';
import 'package:Xpose/pages/crime_categories/crime_categories_page.dart';
import 'package:Xpose/services/crime_category_service.dart';
import 'package:Xpose/services/crime_type_service.dart';
import 'package:file_picker/file_picker.dart';
import 'package:geolocator/geolocator.dart';

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
    setState(() {
      _states = ['Select State', 'State 1', 'State 2', 'State 3'];
    });
  }

  Future<void> _loadDistricts(String state) async {
    if (state != 'Select State') {
      setState(() {
        _districts = ['Select District', 'District 1', 'District 2'];
        _selectedDistrict = null;
        _policeStations = ['Select Police Station'];
        _selectedPoliceStation = null;
      });
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
      setState(() {
        _policeStations = ['Select Police Station', 'Station 1', 'Station 2'];
        _selectedPoliceStation = null;
      });
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
      _fetchCurrentLocation();
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
      setState(() {
        _placeController.text = 'Lat: ${position.latitude}, Long: ${position.longitude}';
        _selectedPoliceStation = 'Nearest Station';
        _isLoading = false;
      });
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
            fontSize: 20,
          ),
        ),
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 2,
        shadowColor: Colors.black.withOpacity(0.2),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => const CrimeCategoriesPage()),
              );
            },
            child: Text(
              'Change Category',
              style: TextStyle(color: Theme.of(context).colorScheme.primary),
            ),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.white))
          : SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Card(
                elevation: 6,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(
                    color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                  ),
                ),
                color: Theme.of(context).colorScheme.surface.withOpacity(0.95),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Your Privacy Matters',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'We do not collect or store any personal information related to your crime report. Your submission is completely anonymous to ensure your safety and privacy.',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.8),
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Crime Details',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              Card(
                elevation: 6,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(
                    color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                  ),
                ),
                color: Theme.of(context).colorScheme.surface.withOpacity(0.95),
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Category: ${widget.categoryName}',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Type: ${widget.crimeType}',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _descriptionController,
                maxLines: 4,
                style: const TextStyle(color: Colors.white, fontSize: 16),
                decoration: InputDecoration(
                  hintText: 'Describe the crime in detail...',
                  hintStyle: TextStyle(color: Colors.white.withOpacity(0.6)),
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
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a description of the crime';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _placeController,
                style: const TextStyle(color: Colors.white, fontSize: 16),
                decoration: InputDecoration(
                  hintText: 'Place of occurrence...',
                  hintStyle: TextStyle(color: Colors.white.withOpacity(0.6)),
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
                  suffixIcon: _useCurrentLocation
                      ? IconButton(
                    icon: Icon(Icons.location_on,
                        color: Theme.of(context).colorScheme.primary),
                    onPressed: _fetchCurrentLocation,
                  )
                      : null,
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter the place of occurrence';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
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
                onChanged: (value) {
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
                ),
                validator: (value) {
                  if (value == null || value == 'Select State') {
                    return 'Please select a state';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
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
                onChanged: _selectedState == 'Select State'
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
                ),
                validator: (value) {
                  if (value == null || value == 'Select District') {
                    return 'Please select a district';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
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
                onChanged: _selectedDistrict == 'Select District'
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
                ),
                validator: (value) {
                  if (value == null || value == 'Select Police Station') {
                    return 'Please select a police station';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: _pickFiles,
                icon: const Icon(Icons.attach_file, color: Colors.white),
                label: const Text(
                  'Upload Evidence',
                  style: TextStyle(color: Colors.white),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                ),
              ),
              if (_selectedFiles.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  'Selected Files: ${_selectedFiles.length}',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 14,
                  ),
                ),
              ],
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _submitReport,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  minimumSize: const Size(double.infinity, 50),
                ),
                child: const Text(
                  'Submit Report',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
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