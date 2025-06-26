// lib/services/auth_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:Xpose/models/user_model.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:Xpose/helpers/user_preferences.dart';

class AuthService {
  static final String baseUrl = '${dotenv.env['API_BASE_URL']}/api/auth';

  static Future<User> registerWithMobile(String mobile) async {
    final response = await http.post(
      Uri.parse('$baseUrl/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'mobile': mobile}),
    );

    if (response.statusCode == 200) {
      return User.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to register: ${response.body}');
    }
  }

  static Future<User> updateProfile(int id, {String? name, String? email, String? profileUrl}) async {
    final Map<String, String> data = {};

    if (name != null) data['name'] = name;
    if (email != null) data['email'] = email;
    if (profileUrl != null) data['profileUrl'] = profileUrl;

    final response = await http.put(
      Uri.parse('$baseUrl/update-profile/$id'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(data),
    );

    if (response.statusCode == 200) {
      User updatedUser = User.fromJson(jsonDecode(response.body));
      await UserPreferences.saveUser(updatedUser);
      return updatedUser;
    } else {
      throw Exception('Failed to update profile: ${response.body}');
    }
  }
}
