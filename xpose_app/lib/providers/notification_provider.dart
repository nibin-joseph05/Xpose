import 'package:flutter/material.dart';
import 'package:Xpose/services/notification_service.dart';
import 'package:Xpose/models/notification_model.dart' as notif_model;

class NotificationProvider with ChangeNotifier {
  int _unreadCount = 0;
  int get unreadCount => _unreadCount;

  List<notif_model.Notification> _notifications = [];
  List<notif_model.Notification> get notifications => _notifications;

  NotificationProvider() {
    fetchUnreadCount();
    fetchNotifications();
  }

  Future<void> fetchUnreadCount() async {
    try {
      final userId = await NotificationService.getCurrentUserId();
      if (userId != null) {
        final unreadNotifications = await NotificationService.getUnreadNotificationsForUser(userId);
        if (_unreadCount != unreadNotifications.length) {
          _unreadCount = unreadNotifications.length;
          notifyListeners();
        }
      } else {
        if (_unreadCount != 0) {
          _unreadCount = 0;
          notifyListeners();
        }
      }
    } catch (e) {
      if (_unreadCount != 0) {
        _unreadCount = 0;
        notifyListeners();
      }
    }
  }

  Future<void> fetchNotifications() async {
    try {
      final userId = await NotificationService.getCurrentUserId();
      if (userId != null) {
        _notifications = await NotificationService.getNotificationsForUser(userId);
        notifyListeners();
      } else {
        _notifications = [];
        notifyListeners();
      }
    } catch (e) {
      _notifications = [];
      notifyListeners();
    }
  }

  Future<void> markNotificationAsRead(int notificationId) async {
    try {
      await NotificationService.markNotificationAsRead(notificationId);
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (e) {
      rethrow;
    }
  }
}