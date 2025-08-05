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
      final data = await _crimeReportService.fetchNearestPoliceStation(position);
      setState(() {
        widget.placeController.text = data['address']!;
        widget.onStateChanged(data['state']);
        widget.onDistrictChanged(data['district']);
        widget.onPoliceStationChanged(data['police_station']);
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

  void _showDropdownDialog({required String title, required List<String> items, required Function(String?) onChanged, String? value}) {
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
                    title,
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
                  children: items
                      .map((item) => ListTile(
                    title: Text(
                      item,
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                    ),
                    onTap: () {
                      onChanged(item);
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
            suffixIcon: widget.useCurrentLocation
                ? IconButton(
              icon: _isLoading
                  ? CircularProgressIndicator(
                color: Theme.of(context).colorScheme.primary,
                strokeWidth: 2,
              )
                  : Icon(
                Icons.my_location,
                color: Theme.of(context).colorScheme.primary,
                size: 20,
              ),
              onPressed: _isLoading ? null : _fetchCurrentLocation,
            )
                : null,
          ),
          readOnly: widget.useCurrentLocation,
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
            child: GestureDetector(
              onTap: () {
                if (!widget.useCurrentLocation) {
                  _showDropdownDialog(
                    title: 'Select State',
                    items: _states,
                    onChanged: (value) {
                      widget.onStateChanged(value);
                      _loadDistricts(value!);
                    },
                    value: widget.selectedState,
                  );
                }
              },
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: widget.selectedState == null || widget.selectedState == 'Select State'
                        ? Colors.transparent
                        : Theme.of(context).colorScheme.primary,
                    width: 2,
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      widget.selectedState ?? 'Select State',
                      style: TextStyle(
                        color: Colors.white.withOpacity(widget.selectedState == null || widget.selectedState == 'Select State' ? 0.6 : 1.0),
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
        ),
        const SizedBox(height: 16),
        AnimatedOpacity(
          opacity: widget.useCurrentLocation || widget.selectedState == 'Select State' ? 0.5 : 1.0,
          duration: const Duration(milliseconds: 300),
          child: AbsorbPointer(
            absorbing: widget.useCurrentLocation || widget.selectedState == 'Select State',
            child: GestureDetector(
              onTap: () {
                if (!widget.useCurrentLocation && widget.selectedState != 'Select State') {
                  _showDropdownDialog(
                    title: 'Select District',
                    items: _districts,
                    onChanged: (value) {
                      widget.onDistrictChanged(value);
                      _loadPoliceStations(widget.selectedState!, value!);
                    },
                    value: widget.selectedDistrict,
                  );
                }
              },
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: widget.selectedDistrict == null || widget.selectedDistrict == 'Select District'
                        ? Colors.transparent
                        : Theme.of(context).colorScheme.primary,
                    width: 2,
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      widget.selectedDistrict ?? 'Select District',
                      style: TextStyle(
                        color: Colors.white.withOpacity(widget.selectedDistrict == null || widget.selectedDistrict == 'Select District' ? 0.6 : 1.0),
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
        ),
        const SizedBox(height: 16),
        AnimatedOpacity(
          opacity: widget.useCurrentLocation || widget.selectedState == 'Select State' || widget.selectedDistrict == 'Select District' ? 0.5 : 1.0,
          duration: const Duration(milliseconds: 300),
          child: AbsorbPointer(
            absorbing: widget.useCurrentLocation || widget.selectedState == 'Select State' || widget.selectedDistrict == 'Select District',
            child: GestureDetector(
              onTap: () {
                if (!widget.useCurrentLocation && widget.selectedState != 'Select State' && widget.selectedDistrict != 'Select District') {
                  _showDropdownDialog(
                    title: 'Select Police Station',
                    items: _policeStations,
                    onChanged: (value) {
                      widget.onPoliceStationChanged(value);
                    },
                    value: widget.selectedPoliceStation,
                  );
                }
              },
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