import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:Xpose/models/notification_model.dart' as notif_model;
import 'package:Xpose/helpers/user_preferences.dart';

class NotificationService {
  static final String baseUrl = '${dotenv.env['API_BASE_URL']}/api/notifications';

  static Future<List<notif_model.Notification>> getNotificationsForUser(int userId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/user/$userId'),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => notif_model.Notification.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load notifications: ${response.body}');
    }
  }

  static Future<List<notif_model.Notification>> getUnreadNotificationsForUser(int userId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/user/$userId/unread'),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      List<dynamic> body = jsonDecode(response.body);
      return body.map((dynamic item) => notif_model.Notification.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load unread notifications: ${response.body}');
    }
  }

  static Future<notif_model.Notification> markNotificationAsRead(int notificationId) async {
    final response = await http.put(
      Uri.parse('$baseUrl/$notificationId/read'),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      return notif_model.Notification.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to mark notification as read: ${response.body}');
    }
  }

  static Future<int?> getCurrentUserId() async {
    final user = await UserPreferences.getUser();
    return user?.id;
  }
}