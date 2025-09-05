import 'package:flutter/material.dart';
import 'package:Xpose/pages/crime_categories/crime_categories_page.dart';
import 'package:Xpose/components/crime_report/crime_description.dart';
import 'package:Xpose/components/crime_report/police_station_selection.dart';
import 'package:Xpose/components/crime_report/recaptcha_verification.dart';
import 'package:Xpose/components/crime_report/report_success_dialog.dart';
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
  String _loadingStatus = '';
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
      ).timeout(const Duration(seconds: 10), onTimeout: () {
        throw Exception('Location fetch timed out');
      });
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
        _useCurrentLocation = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error detecting location: $e')),
        );
      }
    }
  }

  void _resetToManual() {
    setState(() {
      _useCurrentLocation = false;
      _placeController.clear();
      _selectedState = null;
      _selectedDistrict = null;
      _selectedPoliceStation = null;
    });
  }

  Future<void> _pickFiles() async {
    try {
      final formData = {
        'description': _descriptionController.text,
        'place': _placeController.text,
        'selectedState': _selectedState,
        'selectedDistrict': _selectedDistrict,
        'selectedPoliceStation': _selectedPoliceStation,
        'isRecaptchaVerified': _isRecaptchaVerified,
      };
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        allowMultiple: true,
        type: FileType.custom,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'mp4', 'mp3', 'pdf'],
        withData: false,
        allowCompression: true,
      );
      if (result != null && result.files.isNotEmpty) {
        const int maxFileSize = 50 * 1024 * 1024;
        List<PlatformFile> validFiles = [];
        List<String> rejectedFiles = [];
        for (var file in result.files) {
          if (file.size <= maxFileSize) {
            validFiles.add(file);
          } else {
            rejectedFiles.add('${file.name} (too large)');
          }
        }
        setState(() {
          _selectedFiles.addAll(validFiles);
          if (_descriptionController.text.isEmpty && formData['description'] != null) {
            _descriptionController.text = formData['description'] as String;
          }
        });
        if (validFiles.isNotEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Added ${validFiles.length} file(s) successfully'),
              backgroundColor: Colors.green,
              duration: const Duration(seconds: 2),
            ),
          );
        }
        if (rejectedFiles.isNotEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Rejected files: ${rejectedFiles.join(', ')}'),
              backgroundColor: Colors.orange,
              duration: const Duration(seconds: 3),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to pick files: $e')),
        );
      }
    }
  }
  Widget _buildFilesList() {
    if (_selectedFiles.isEmpty) return const SizedBox.shrink();
    return Card(
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
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Selected Files: ${_selectedFiles.length}',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.85),
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                TextButton(
                  onPressed: () {
                    setState(() {
                      _selectedFiles.clear();
                    });
                  },
                  child: Text(
                    'Clear All',
                    style: TextStyle(
                      color: Colors.red.shade300,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            ...List.generate(_selectedFiles.length, (index) {
              final file = _selectedFiles[index];
              final fileSizeMB = (file.size / (1024 * 1024)).toStringAsFixed(1);
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: Theme.of(context).colorScheme.primary.withOpacity(0.2),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      _getFileIcon(file.extension),
                      color: Theme.of(context).colorScheme.primary,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            file.name,
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.9),
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            '${fileSizeMB}MB',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.6),
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () {
                        setState(() {
                          _selectedFiles.removeAt(index);
                        });
                      },
                      icon: Icon(
                        Icons.remove_circle_outline,
                        color: Colors.red.shade300,
                        size: 20,
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
  IconData _getFileIcon(String? extension) {
    switch (extension?.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
      case 'png':
        return Icons.image;
      case 'mp4':
        return Icons.video_file;
      case 'mp3':
        return Icons.audio_file;
      case 'pdf':
        return Icons.picture_as_pdf;
      default:
        return Icons.attach_file;
    }
  }

  Future<void> _submitReport() async {
    List<String> validationErrors = [];

    if (!_isRecaptchaVerified) {
      validationErrors.add('Please verify reCAPTCHA');
    }

    if (!_formKey.currentState!.validate()) {
      validationErrors.add('Please fill in all required fields correctly');
    }

    if (_descriptionController.text.trim().isEmpty) {
      validationErrors.add('Crime description is required');
    } else if (_descriptionController.text.trim().length < 20) {
      validationErrors.add('Description must be at least 20 characters');
    }

    if (_placeController.text.trim().isEmpty) {
      validationErrors.add('Place of occurrence is required');
    }

    if (_selectedState == null || _selectedState == 'Select State' || _selectedState!.isEmpty) {
      validationErrors.add('State selection is required');
    }

    if (_selectedDistrict == null || _selectedDistrict == 'Select District' || _selectedDistrict!.isEmpty) {
      validationErrors.add('District selection is required');
    }

    if (_selectedPoliceStation == null || _selectedPoliceStation == 'Select Police Station' || _selectedPoliceStation!.isEmpty) {
      validationErrors.add('Police station selection is required');
    }

    if (validationErrors.isNotEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.error_outline, color: Colors.white, size: 20),
                  const SizedBox(width: 8),
                  const Text(
                    'Please Complete All Required Fields',
                    style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              ...validationErrors.take(3).map((error) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  children: [
                    const Icon(Icons.circle, size: 6, color: Colors.white70),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        error,
                        style: const TextStyle(fontSize: 12, color: Colors.white),
                      ),
                    ),
                  ],
                ),
              )),
              if (validationErrors.length > 3)
                Text(
                  '... and ${validationErrors.length - 3} more',
                  style: const TextStyle(fontSize: 11, color: Colors.white70),
                ),
            ],
          ),
          backgroundColor: Colors.red.shade600,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          duration: const Duration(seconds: 4),
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
      _loadingStatus = 'Analyzing your report, please wait…';
    });

    try {
      final response = await _crimeReportService.submitReport(
        categoryId: widget.categoryId,
        categoryName: widget.categoryName,
        crimeType: widget.crimeType,
        description: _descriptionController.text.trim(),
        place: _placeController.text.trim(),
        state: _selectedState,
        district: _selectedDistrict,
        policeStation: _selectedPoliceStation!,
        files: _selectedFiles,
      );

      if (mounted) {
        _formKey.currentState?.reset();
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

        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => ReportSuccessDialog(reportId: response['reportId']),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.error_outline, color: Colors.white, size: 20),
                    const SizedBox(width: 8),
                    const Text(
                      'Submission Failed',
                      style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  'Error: ${e.toString()}',
                  style: const TextStyle(fontSize: 12, color: Colors.white),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.info_outline, color: Colors.white70, size: 16),
                    const SizedBox(width: 6),
                    const Expanded(
                      child: Text(
                        'Check your internet connection and try again',
                        style: TextStyle(fontSize: 11, color: Colors.white70),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            backgroundColor: Colors.red.shade700,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            duration: const Duration(seconds: 5),
            action: SnackBarAction(
              label: 'RETRY',
              textColor: Colors.white,
              backgroundColor: Colors.red.shade800,
              onPressed: () {
                ScaffoldMessenger.of(context).hideCurrentSnackBar();
                _submitReport();
              },
            ),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _loadingStatus = '';
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
          ? Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 16),
            Text(
              _loadingStatus,
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      )
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
              Row(
                children: [
                  Expanded(
                    child: AnimatedScale(
                      scale: _isLoading ? 0.95 : 1.0,
                      duration: const Duration(milliseconds: 200),
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
                  if (_useCurrentLocation) ...[
                    const SizedBox(width: 12),
                    Expanded(
                      child: AnimatedScale(
                        scale: _isLoading ? 0.95 : 1.0,
                        duration: const Duration(milliseconds: 200),
                        child: ElevatedButton.icon(
                          onPressed: _isLoading ? null : _resetToManual,
                          icon: Icon(
                            Icons.edit_location_alt,
                            color: Colors.white,
                            size: 20,
                          ),
                          label: const Text(
                            'Manual Location',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blueGrey[700],
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            elevation: 3,
                          ),
                        ),
                      ),
                    ),
                  ],
                ],
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

              const SizedBox(height: 12),
              _buildFilesList(),
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