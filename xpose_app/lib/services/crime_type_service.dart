import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class CrimeTypeService {
  static Future<List<dynamic>> fetchCrimeTypesByCategory(int categoryId) async {
    final baseUrl = dotenv.env['API_BASE_URL'];
    final url = '$baseUrl/api/crimes/dto';

    final response = await http.get(
      Uri.parse(url),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.where((crime) => crime['categoryId'] == categoryId).toList();
    } else {
      throw Exception('Failed to load crime types: ${response.statusCode} - ${response.body}');
    }
  }
}