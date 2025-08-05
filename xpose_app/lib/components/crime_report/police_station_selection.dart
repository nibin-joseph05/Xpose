import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:Xpose/services/crime_report_service.dart';

class PoliceStationSelection extends StatefulWidget {
  final TextEditingController placeController;
  final Function(String?) onStateChanged;
  final Function(String?) onDistrictChanged;
  final Function(String?) onPoliceStationChanged;
  final String? selectedState;
  final String? selectedDistrict;
  final String? selectedPoliceStation;
  final bool useCurrentLocation;

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

  @override
  State<PoliceStationSelection> createState() => _PoliceStationSelectionState();
}

class _PoliceStationSelectionState extends State<PoliceStationSelection> {
  List<String> _states = ['Select State'];
  List<String> _districts = ['Select District'];
  List<String> _policeStations = ['Select Police Station'];
  bool _isLoading = false;
  final CrimeReportService _crimeReportService = CrimeReportService();

  @override
  void initState() {
    super.initState();
    _loadStates();
  }

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
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading states: $e')),
      );
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
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading districts: $e')),
      );
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
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading police stations: $e')),
      );
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
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error fetching location: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextFormField(
          controller: widget.placeController,
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
            suffixIcon: widget.useCurrentLocation
                ? IconButton(
              icon: _isLoading
                  ? CircularProgressIndicator(
                color: Theme.of(context).colorScheme.primary,
                strokeWidth: 2,
              )
                  : Icon(
                Icons.location_on,
                color: Theme.of(context).colorScheme.primary,
                size: 28,
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
        const SizedBox(height: 24),
        AnimatedOpacity(
          opacity: widget.useCurrentLocation ? 0.5 : 1.0,
          duration: const Duration(milliseconds: 300),
          child: DropdownButtonFormField<String>(
            value: widget.selectedState,
            items: _states
                .map((state) => DropdownMenuItem(
              value: state,
              child: Text(
                state,
                style: const TextStyle(color: Colors.white),
              ),
            ))
                .toList(),
            onChanged: widget.useCurrentLocation
                ? null
                : (value) {
              widget.onStateChanged(value);
              _loadDistricts(value!);
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
              if (!widget.useCurrentLocation && (value == null || value == 'Select State')) {
                return 'Please select a state';
              }
              return null;
            },
          ),
        ),
        const SizedBox(height: 24),
        AnimatedOpacity(
          opacity: widget.useCurrentLocation ? 0.5 : 1.0,
          duration: const Duration(milliseconds: 300),
          child: DropdownButtonFormField<String>(
            value: widget.selectedDistrict,
            items: _districts
                .map((district) => DropdownMenuItem(
              value: district,
              child: Text(
                district,
                style: const TextStyle(color: Colors.white),
              ),
            ))
                .toList(),
            onChanged: widget.useCurrentLocation || widget.selectedState == 'Select State'
                ? null
                : (value) {
              widget.onDistrictChanged(value);
              _loadPoliceStations(widget.selectedState!, value!);
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
              if (!widget.useCurrentLocation && (value == null || value == 'Select District')) {
                return 'Please select a district';
              }
              return null;
            },
          ),
        ),
        const SizedBox(height: 24),
        AnimatedOpacity(
          opacity: widget.useCurrentLocation ? 0.5 : 1.0,
          duration: const Duration(milliseconds: 300),
          child: DropdownButtonFormField<String>(
            value: widget.selectedPoliceStation,
            items: _policeStations
                .map((station) => DropdownMenuItem(
              value: station,
              child: Text(
                station,
                style: const TextStyle(color: Colors.white),
              ),
            ))
                .toList(),
            onChanged: widget.useCurrentLocation || widget.selectedDistrict == 'Select District'
                ? null
                : (value) {
              widget.onPoliceStationChanged(value);
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
              if (!widget.useCurrentLocation && (value == null || value == 'Select Police Station')) {
                return 'Please select a police station';
              }
              return null;
            },
          ),
        ),
        if (_isLoading) ...[
          const SizedBox(height: 16),
          Center(
            child: CircularProgressIndicator(
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
        ],
      ],
    );
  }
}