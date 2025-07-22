import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class NewsService {
  static Future<List<dynamic>> getIndiaTopHeadlines() async {
    final baseUrl = dotenv.env['API_BASE_URL'];
    final response = await http.get(
      Uri.parse('$baseUrl/api/news/india-top-headlines'),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final Map<String, dynamic> data = jsonDecode(response.body);

      if (data.containsKey('articles')) {
        return data['articles'] ?? [];
      } else if (data.containsKey('data')) {
        return data['data'] ?? [];
      } else {
        return [];
      }
    } else {
      throw Exception('Failed to load news: ${response.statusCode} - ${response.body}');
    }
  }
}