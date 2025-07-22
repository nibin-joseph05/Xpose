import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class CrimeCategoryService {
  static Future<List<dynamic>> fetchCategories() async {
    final baseUrl = dotenv.env['API_BASE_URL'];
    final url = '$baseUrl/api/crime-categories';

    final response = await http.get(
      Uri.parse(url),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data;
    } else {
      throw Exception('Failed to load crime categories: ${response.statusCode} - ${response.body}');
    }
  }
}
