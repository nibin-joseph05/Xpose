import 'package:Xpose/models/user_model.dart';

enum NotificationType {
  WELCOME_NEW_USER,
  PROFILE_UPDATED,
}

class Notification {
  final int id;
  final UserModel recipient;
  final NotificationType type;
  final String title;
  final String message;
  final DateTime createdAt;
  final bool isRead;

  Notification({
    required this.id,
    required this.recipient,
    required this.type,
    required this.title,
    required this.message,
    required this.createdAt,
    required this.isRead,
  });

  factory Notification.fromJson(Map<String, dynamic> json) {
    return Notification(
      id: json['id'],
      recipient: UserModel.fromJson(json['recipient']),
      type: NotificationType.values.firstWhere(
            (e) => e.toString().split('.').last == json['type'],
        orElse: () => NotificationType.PROFILE_UPDATED,
      ),
      title: json['title'],
      message: json['message'],
      createdAt: DateTime.parse(json['createdAt']),
      isRead: json['read'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'recipient': recipient.toJson(),
      'type': type.toString().split('.').last,
      'title': title,
      'message': message,
      'createdAt': createdAt.toIso8601String(),
      'isRead': isRead,
    };
  }
}