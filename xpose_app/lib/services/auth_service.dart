import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:Xpose/models/user_model.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:Xpose/helpers/user_preferences.dart';
import 'package:http_parser/http_parser.dart';
import 'package:image_picker/image_picker.dart';

class AuthService {
  static final String baseUrl = '${dotenv.env['API_BASE_URL']}/api/auth';

  static Future<UserModel> registerWithMobile(String mobile) async {
    final response = await http.post(
      Uri.parse('$baseUrl/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'mobile': mobile}),
    );

    if (response.statusCode == 200) {
      return  UserModel.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to register: ${response.body}');
    }
  }

  static Future< UserModel> updateProfile(String mobile, {String? name, String? email, XFile? profileImageFile, String? currentProfileImageUrl}) async {
    var request = http.MultipartRequest('PUT', Uri.parse('$baseUrl/update-profile/$mobile'));

    if (name != null && name.isNotEmpty) {
      request.fields['name'] = name;
    } else {
      request.fields['name'] = '';
    }

    if (email != null && email.isNotEmpty) {
      request.fields['email'] = email;
    } else {
      request.fields['email'] = '';
    }

    if (profileImageFile != null) {
      request.files.add(await http.MultipartFile.fromPath(
        'image',
        profileImageFile.path,
        contentType: MediaType('image', profileImageFile.path.split('.').last),
      ));
    } else if (currentProfileImageUrl != null && currentProfileImageUrl.startsWith('http')) {
      request.fields['currentProfileUrl'] = currentProfileImageUrl;
    } else {
      request.fields['currentProfileUrl'] = 'REMOVE';
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 200) {
       UserModel updatedUser =  UserModel.fromJson(jsonDecode(response.body));
      await UserPreferences.saveUser(updatedUser);
      return updatedUser;
    } else {
      throw Exception('Failed to update profile: ${response.body}');
    }
  }
}