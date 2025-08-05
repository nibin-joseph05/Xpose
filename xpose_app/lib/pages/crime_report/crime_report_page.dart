import 'package:flutter/material.dart';
import 'package:Xpose/pages/crime_categories/crime_categories_page.dart';
import 'package:Xpose/components/crime_report/crime_description.dart';
import 'package:Xpose/components/crime_report/police_station_selection.dart';
import 'package:Xpose/components/crime_report/recaptcha_verification.dart';
import 'package:file_picker/file_picker.dart';
import 'package:geolocator/geolocator.dart';
import 'package:Xpose/services/crime_report_service.dart';

class CrimeReportPage extends StatefulWidget {
  const CrimeReportPage({
    super.key,
    required this.categoryId,
    required this.categoryName,
    required this.crimeType,
  });

  final int categoryId;
  final String categoryName;
  final String crimeType;

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
  List<PlatformFile> _selectedFiles = [];
  bool _isLoading = false;
  bool _useCurrentLocation = false;
  bool _isRecaptchaVerified = false;
  final CrimeReportService _crimeReportService = CrimeReportService();

  Future<void> _checkLocationPermission() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Location services are disabled. Please enable them.')),
        );
      }
      return;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Location permissions are denied.')),
          );
        }
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Location permissions are permanently denied. Please enable them in settings.')),
        );
      }
      return;
    }
  }

  Future<void> _detectCurrentLocation() async {
    try {
      setState(() {
        _isLoading = true;
        _useCurrentLocation = true;
      });
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      final data = await _crimeReportService.fetchNearestPoliceStations(position);
      setState(() {
        _placeController.text = data['address']!;
        _selectedState = data['state'];
        _selectedDistrict = data['district'];
        _selectedPoliceStation = null;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error detecting location: $e')),
        );
      }
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
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to pick files: $e')),
        );
      }
    }
  }

  Future<void> _submitReport() async {
    if (!_isRecaptchaVerified) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please verify reCAPTCHA first')),
      );
      return;
    }
    if (_formKey.currentState!.validate()) {
      if (_selectedPoliceStation == null || _selectedPoliceStation == 'Select Police Station') {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select a police station')),
        );
        return;
      }
      setState(() {
        _isLoading = true;
      });
      try {
        await _crimeReportService.submitReport(
          categoryId: widget.categoryId,
          categoryName: widget.categoryName,
          crimeType: widget.crimeType,
          description: _descriptionController.text,
          place: _placeController.text,
          state: _selectedState,
          district: _selectedDistrict,
          policeStation: _selectedPoliceStation!,
          files: _selectedFiles,
        );

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Crime report sent successfully'),
            backgroundColor: Theme.of(context).colorScheme.primary,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
        _formKey.currentState!.reset();
        _descriptionController.clear();
        _placeController.clear();
        setState(() {
          _selectedState = null;
          _selectedDistrict = null;
          _selectedPoliceStation = null;
          _selectedFiles = [];
          _isRecaptchaVerified = false;
          _useCurrentLocation = false;
        });
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error sending report: $e')),
        );
      } finally {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  void initState() {
    super.initState();
    _checkLocationPermission();
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
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 2,
        shadowColor: Colors.black.withOpacity(0.2),
        actions: [
          TextButton.icon(
            onPressed: () {
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => const CrimeCategoriesPage()),
              );
            },
            icon: Icon(Icons.category, color: Theme.of(context).colorScheme.primary, size: 20),
            label: Text(
              'Change Category',
              style: TextStyle(
                color: Theme.of(context).colorScheme.primary,
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator(color: Theme.of(context).colorScheme.primary))
          : SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Card(
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(
                    color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                    width: 1,
                  ),
                ),
                color: Theme.of(context).colorScheme.surface.withOpacity(0.95),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.lock,
                            color: Theme.of(context).colorScheme.primary,
                            size: 24,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Your Privacy Matters',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Your submission is anonymous. No personal information is collected or stored.',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.8),
                          fontSize: 14,
                          height: 1.3,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              AnimatedScale(
                scale: _isLoading ? 0.95 : 1.0,
                duration: const Duration(milliseconds: 200),
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _isLoading ? null : _detectCurrentLocation,
                    icon: Icon(
                      Icons.my_location,
                      color: Colors.white,
                      size: 20,
                    ),
                    label: const Text(
                      'Detect My Location',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      elevation: 3,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'Crime Details',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 18,
                ),
              ),
              const SizedBox(height: 12),
              Card(
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(
                    color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                    width: 1,
                  ),
                ),
                color: Theme.of(context).colorScheme.primary.withOpacity(0.08),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.category,
                            color: Theme.of(context).colorScheme.primary,
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              widget.categoryName,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: Theme.of(context).colorScheme.primary,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Icon(
                            Icons.warning_rounded,
                            color: Theme.of(context).colorScheme.primary,
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              widget.crimeType,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
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
              const SizedBox(height: 20),
              CrimeDescription(
                controller: _descriptionController,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a description of the crime';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 20),
              PoliceStationSelection(
                placeController: _placeController,
                onStateChanged: (value) => setState(() => _selectedState = value),
                onDistrictChanged: (value) => setState(() => _selectedDistrict = value),
                onPoliceStationChanged: (value) => setState(() => _selectedPoliceStation = value),
                selectedState: _selectedState,
                selectedDistrict: _selectedDistrict,
                selectedPoliceStation: _selectedPoliceStation,
                useCurrentLocation: _useCurrentLocation,
              ),
              const SizedBox(height: 20),
              RecaptchaVerification(
                onVerified: (isVerified) => setState(() => _isRecaptchaVerified = isVerified),
              ),
              const SizedBox(height: 20),
              AnimatedScale(
                scale: _isLoading ? 0.95 : 1.0,
                duration: const Duration(milliseconds: 200),
                child: ElevatedButton.icon(
                  onPressed: _isLoading ? null : _pickFiles,
                  icon: const Icon(Icons.add_circle_outline, color: Colors.white, size: 20),
                  label: const Text(
                    'Add Evidence',
                    style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 11, horizontal: 16),
                    elevation: 3,
                  ),
                ),
              ),
              if (_selectedFiles.isNotEmpty) ...[
                const SizedBox(height: 12),
                Card(
                  elevation: 4,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(
                      color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                    ),
                  ),
                  color: Theme.of(context).colorScheme.surface.withOpacity(0.9),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Selected Files: ${_selectedFiles.length}',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.85),
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 8),
                        ..._selectedFiles.map((file) => Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: Text(
                            file.name,
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.7),
                              fontSize: 13,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        )),
                      ],
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 20),
              AnimatedScale(
                scale: _isLoading ? 0.95 : 1.0,
                duration: const Duration(milliseconds: 200),
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _isLoading ? null : _submitReport,
                    icon: _isLoading
                        ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                        : const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                    label: const Text(
                      'Send Report',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      elevation: 3,
                    ),
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