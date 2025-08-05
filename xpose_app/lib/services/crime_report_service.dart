import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class CrimeReportService {
  final String _baseUrl = dotenv.env['API_BASE_URL'] ?? 'http://192.168.220.2:8080';

  Future<List<String>> fetchStates() async {
    try {
      final response = await http.get(Uri.parse('$_baseUrl/api/police-stations/states'));
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((e) => e.toString()).toList();
      } else {
        throw Exception('Failed to load states');
      }
    } catch (e) {
      throw Exception('Failed to load states: $e');
    }
  }

  Future<List<String>> fetchDistricts(String state) async {
    if (state == 'Select State') return [];
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/api/police-stations/districts?state=$state'),
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((e) => e.toString()).toList();
      } else {
        throw Exception('Failed to load districts');
      }
    } catch (e) {
      throw Exception('Failed to load districts: $e');
    }
  }

  Future<List<String>> fetchPoliceStations(String state, String district) async {
    if (state == 'Select State' || district == 'Select District') return [];
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/api/police-stations/by-district?state=$state&district=$district&radius=10000'),
      );
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = json.decode(response.body);
        final results = data['results'] ?? [];
        return List<String>.from(results.map((e) => e['name'].toString()));
      } else {
        throw Exception('Failed to load police stations');
      }
    } catch (e) {
      throw Exception('Failed to load police stations: $e');
    }
  }

  Future<Map<String, String>> fetchNearestPoliceStation(Position position) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/api/police-stations?lat=${position.latitude}&lng=${position.longitude}&radius=3000'),
      );
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = json.decode(response.body);
        final results = data['results'] ?? [];
        if (results.isNotEmpty) {
          final station = results[0];
          return {
            'address': station['vicinity'] ?? 'Lat: ${position.latitude}, Long: ${position.longitude}',
            'state': 'Unknown',
            'district': 'Unknown',
            'police_station': station['name'] ?? 'Nearest Station',
          };
        } else {
          throw Exception('No nearby police stations found');
        }
      } else {
        throw Exception('Failed to fetch police station');
      }
    } catch (e) {
      throw Exception('Failed to fetch location: $e');
    }
  }

  Future<bool> verifyRecaptcha(String token) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/api/recaptcha/verify'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'token': token}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['success'] == true;
      }
      return false;
    } catch (e) {
      print('Recaptcha verification error: $e');
      return false;
    }
  }
}