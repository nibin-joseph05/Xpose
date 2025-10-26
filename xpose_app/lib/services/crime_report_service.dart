import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:file_picker/file_picker.dart';
import 'package:http_parser/http_parser.dart';
import 'dart:typed_data';

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
        Uri.parse('$_baseUrl/api/police-stations/by-district?state=$state&district=$district'),
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

  Future<Map<String, dynamic>> fetchNearestPoliceStations(Position position) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/api/police-stations?lat=${position.latitude}&lng=${position.longitude}'),
      );
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = json.decode(response.body);
        final results = data['results'] ?? [];
        if (results.isNotEmpty) {
          return {
            'address': results[0]['vicinity'] ?? 'Lat: ${position.latitude}, Long: ${position.longitude}',
            'state': data['state'] ?? 'Unknown',
            'district': data['district'] ?? 'Unknown',
            'police_stations': List<String>.from(results.map((e) => e['name'].toString())),
          };
        } else {
          throw Exception('No nearby police stations found');
        }
      } else {
        throw Exception('Failed to fetch police stations: ${response.statusCode}');
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

  Future<Map<String, dynamic>> submitReport({
    required int categoryId,
    required String categoryName,
    required String crimeType,
    required String description,
    required String place,
    required String? state,
    required String? district,
    required String policeStation,
    required List<PlatformFile> files,
  }) async {
    try {
      var request = http.MultipartRequest('POST', Uri.parse('$_baseUrl/api/crime-reports/submit'));


      request.fields['crimeReport'] = json.encode({
        'categoryId': categoryId,
        'categoryName': categoryName,
        'crimeType': crimeType,
        'description': description,
        'place': place,
        'state': state,
        'district': district,
        'policeStation': policeStation,
        'files': files.map((file) => file.name).toList(),
      });


      for (var file in files) {
        if (file.path != null) {
          try {
            var multipartFile = await http.MultipartFile.fromPath(
              'evidenceFiles',
              file.path!,
              filename: file.name,
            );
            request.files.add(multipartFile);
            print('Added file: ${file.name} from path: ${file.path}');
          } catch (e) {
            print('Error adding file ${file.name}: $e');

          }
        } else {
          print('File ${file.name} has null path, skipping');
        }
      }

      print('Sending multipart request with ${request.files.length} files');
      print('Crime report data: ${request.fields['crimeReport']}');

      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);

      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseJson = json.decode(response.body);

        return {
          'success': responseJson['success'] ?? false,
          'reportId': responseJson['reportId'] ?? 'Unknown ID',
          'message': responseJson['message'] ?? 'Response received',
          'rejectionReason': responseJson['rejectionReason'],
          'improvementSuggestions': responseJson['improvementSuggestions'] ?? [],
          'status': responseJson['status'],
          'timestamp': responseJson['timestamp'],
          'requiresResubmission': responseJson['requiresResubmission'] ?? false,
          'statusCode': response.statusCode
        };
      } else {
        final errorData = json.decode(response.body);
        return {
          'success': false,
          'reportId': 'ERROR_${response.statusCode}',
          'message': errorData['message'] ?? 'Server error occurred',
          'error': errorData['error'] ?? 'SERVER_ERROR',
          'statusCode': response.statusCode
        };
      }
    } catch (e) {
      print('Error in submitReport: $e');
      print('Stack trace: ${e.toString()}');
      rethrow;
    }
  }
}