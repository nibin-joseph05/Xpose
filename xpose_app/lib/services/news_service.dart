import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class NewsService {
  static final String baseUrl = '${dotenv.env['API_BASE_URL']}/api/news';

  static Future<List<dynamic>> getKeralaNews() async {
    final response = await http.get(
      Uri.parse('$baseUrl/kerala-crime'),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final Map<String, dynamic> data = jsonDecode(response.body);
      return data['articles'] ?? [];
    } else {
      throw Exception('Failed to load news: ${response.body}');
    }
  }
}
