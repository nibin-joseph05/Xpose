import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:Xpose/services/crime_report_service.dart';

class PoliceStationSelection extends StatefulWidget {
  const PoliceStationSelection({
    super.key,
    required this.placeController,
    required this.onStateChanged,
    required this.onDistrictChanged,
    required this.onPoliceStationChanged,
    required this.selectedState,
    required this.selectedDistrict,
    required this.selectedPoliceStation,
    required this.useCurrentLocation,
  });

  final TextEditingController placeController;
  final Function(String?) onStateChanged;
  final Function(String?) onDistrictChanged;
  final Function(String?) onPoliceStationChanged;
  final String? selectedState;
  final String? selectedDistrict;
  final String? selectedPoliceStation;
  final bool useCurrentLocation;

  @override
  State<PoliceStationSelection> createState() => _PoliceStationSelectionState();
}

class _PoliceStationSelectionState extends State<PoliceStationSelection> {
  List<String> _states = ['Select State'];
  List<String> _districts = ['Select District'];
  List<String> _policeStations = ['Select Police Station'];
  bool _isLoading = false;
  final CrimeReportService _crimeReportService = CrimeReportService();

  Future<void> _loadStates() async {
    try {
      setState(() {
        _isLoading = true;
      });
      final states = await _crimeReportService.fetchStates();
      setState(() {
        _states = ['Select State', ...states];
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading states: $e')),
        );
      }
    }
  }

  Future<void> _loadDistricts(String state) async {
    if (state == 'Select State') {
      setState(() {
        _districts = ['Select District'];
        _policeStations = ['Select Police Station'];
        widget.onDistrictChanged(null);
        widget.onPoliceStationChanged(null);
      });
      return;
    }
    try {
      setState(() {
        _isLoading = true;
      });
      final districts = await _crimeReportService.fetchDistricts(state);
      setState(() {
        _districts = ['Select District', ...districts];
        _policeStations = ['Select Police Station'];
        widget.onDistrictChanged(null);
        widget.onPoliceStationChanged(null);
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading districts: $e')),
        );
      }
    }
  }

  Future<void> _loadPoliceStations(String state, String district) async {
    if (state == 'Select State' || district == 'Select District') {
      setState(() {
        _policeStations = ['Select Police Station'];
        widget.onPoliceStationChanged(null);
      });
      return;
    }
    try {
      setState(() {
        _isLoading = true;
      });
      final stations = await _crimeReportService.fetchPoliceStations(state, district);
      setState(() {
        _policeStations = ['Select Police Station', ...stations];
        widget.onPoliceStationChanged(null);
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading police stations: $e')),
        );
      }
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
      final data = await _crimeReportService.fetchNearestPoliceStations(position);
      setState(() {
        widget.placeController.text = data['address']!;
        widget.onStateChanged(data['state']);
        widget.onDistrictChanged(data['district']);
        _policeStations = ['Select Police Station', ...data['police_stations']];
        widget.onPoliceStationChanged(null);
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error fetching location: $e')),
        );
      }
    }
  }

  void _showPoliceStationDialog() {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        backgroundColor: Theme.of(context).colorScheme.surface,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Select Police Station',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white, size: 20),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),
            Container(
              constraints: const BoxConstraints(maxHeight: 300),
              child: SingleChildScrollView(
                child: Column(
                  children: _policeStations
                      .map((station) => ListTile(
                    title: Text(
                      station,
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                    ),
                    onTap: () {
                      widget.onPoliceStationChanged(station == 'Select Police Station' ? null : station);
                      Navigator.of(context).pop();
                    },
                  ))
                      .toList(),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void initState() {
    super.initState();
    _loadStates();
    if (widget.useCurrentLocation) {
      _fetchCurrentLocation();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Location Details',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.w700,
            fontSize: 18,
          ),
        ),
        const SizedBox(height: 12),
        TextFormField(
          controller: widget.placeController,
          style: const TextStyle(color: Colors.white, fontSize: 14),
          decoration: InputDecoration(
            hintText: 'Place of occurrence...',
            hintStyle: TextStyle(color: Colors.white.withOpacity(0.6)),
            filled: true,
            fillColor: Colors.white.withOpacity(0.1),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: Theme.of(context).colorScheme.primary,
                width: 2,
              ),
            ),
            contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please enter the place of occurrence';
            }
            return null;
          },
        ),
        const SizedBox(height: 16),
        AnimatedOpacity(
          opacity: widget.useCurrentLocation ? 0.5 : 1.0,
          duration: const Duration(milliseconds: 300),
          child: AbsorbPointer(
            absorbing: widget.useCurrentLocation,
            child: TextFormField(
              readOnly: true,
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                hintText: widget.selectedState ?? 'Select State',
                hintStyle: TextStyle(
                  color: Colors.white.withOpacity(widget.selectedState == null || widget.selectedState == 'Select State' ? 0.6 : 1.0),
                ),
                filled: true,
                fillColor: Colors.white.withOpacity(0.1),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: Theme.of(context).colorScheme.primary,
                    width: 2,
                  ),
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
              ),
              controller: TextEditingController(text: widget.selectedState ?? 'Select State'),
              onTap: () {
                if (!widget.useCurrentLocation) {
                  showDialog(
                    context: context,
                    builder: (context) => Dialog(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      backgroundColor: Theme.of(context).colorScheme.surface,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Padding(
                            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Select State',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.close, color: Colors.white, size: 20),
                                  onPressed: () => Navigator.of(context).pop(),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            constraints: const BoxConstraints(maxHeight: 300),
                            child: SingleChildScrollView(
                              child: Column(
                                children: _states
                                    .map((state) => ListTile(
                                  title: Text(
                                    state,
                                    style: const TextStyle(color: Colors.white, fontSize: 14),
                                  ),
                                  onTap: () {
                                    widget.onStateChanged(state == 'Select State' ? null : state);
                                    _loadDistricts(state);
                                    Navigator.of(context).pop();
                                  },
                                ))
                                    .toList(),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }
              },
            ),
          ),
        ),
        const SizedBox(height: 16),
        AnimatedOpacity(
          opacity: widget.useCurrentLocation || widget.selectedState == 'Select State' ? 0.5 : 1.0,
          duration: const Duration(milliseconds: 300),
          child: AbsorbPointer(
            absorbing: widget.useCurrentLocation || widget.selectedState == 'Select State',
            child: TextFormField(
              readOnly: true,
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                hintText: widget.selectedDistrict ?? 'Select District',
                hintStyle: TextStyle(
                  color: Colors.white.withOpacity(widget.selectedDistrict == null || widget.selectedDistrict == 'Select District' ? 0.6 : 1.0),
                ),
                filled: true,
                fillColor: Colors.white.withOpacity(0.1),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: Theme.of(context).colorScheme.primary,
                    width: 2,
                  ),
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
              ),
              controller: TextEditingController(text: widget.selectedDistrict ?? 'Select District'),
              onTap: () {
                if (!widget.useCurrentLocation && widget.selectedState != 'Select State') {
                  showDialog(
                    context: context,
                    builder: (context) => Dialog(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      backgroundColor: Theme.of(context).colorScheme.surface,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Padding(
                            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Select District',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.close, color: Colors.white, size: 20),
                                  onPressed: () => Navigator.of(context).pop(),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            constraints: const BoxConstraints(maxHeight: 300),
                            child: SingleChildScrollView(
                              child: Column(
                                children: _districts
                                    .map((district) => ListTile(
                                  title: Text(
                                    district,
                                    style: const TextStyle(color: Colors.white, fontSize: 14),
                                  ),
                                  onTap: () {
                                    widget.onDistrictChanged(district == 'Select District' ? null : district);
                                    _loadPoliceStations(widget.selectedState!, district);
                                    Navigator.of(context).pop();
                                  },
                                ))
                                    .toList(),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }
              },
            ),
          ),
        ),
        const SizedBox(height: 16),
        AnimatedOpacity(
          opacity: _policeStations.length > 1 ? 1.0 : 0.5,
          duration: const Duration(milliseconds: 300),
          child: GestureDetector(
            onTap: _policeStations.length > 1 ? _showPoliceStationDialog : null,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: widget.selectedPoliceStation == null || widget.selectedPoliceStation == 'Select Police Station'
                      ? Colors.transparent
                      : Theme.of(context).colorScheme.primary,
                  width: 2,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    widget.selectedPoliceStation ?? 'Select Police Station',
                    style: TextStyle(
                      color: Colors.white.withOpacity(widget.selectedPoliceStation == null || widget.selectedPoliceStation == 'Select Police Station' ? 0.6 : 1.0),
                      fontSize: 14,
                    ),
                  ),
                  Icon(
                    Icons.arrow_drop_down,
                    color: Colors.white.withOpacity(0.6),
                  ),
                ],
              ),
            ),
          ),
        ),
        if (_isLoading) ...[
          const SizedBox(height: 12),
          Center(
            child: CircularProgressIndicator(
              color: Theme.of(context).colorScheme.primary,
              strokeWidth: 2,
            ),
          ),
        ],
      ],
    );
  }
}