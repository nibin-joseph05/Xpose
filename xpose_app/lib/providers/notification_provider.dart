
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/notification_service.dart';
import '../models/notification_model.dart' as notif_model;

class NotificationState {
  final int unreadCount;
  final List<notif_model.Notification> notifications;
  final bool isLoading;

  NotificationState({
    required this.unreadCount,
    required this.notifications,
    this.isLoading = false,
  });

  NotificationState copyWith({
    int? unreadCount,
    List<notif_model.Notification>? notifications,
    bool? isLoading,
  }) {
    return NotificationState(
      unreadCount: unreadCount ?? this.unreadCount,
      notifications: notifications ?? this.notifications,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class NotificationNotifier extends StateNotifier<NotificationState> {
  NotificationNotifier() : super(NotificationState(unreadCount: 0, notifications: [])) {
    _initialize();
  }

  Future<void> _initialize() async {
    await fetchUnreadCount();
    await fetchNotifications();
  }

  Future<void> fetchUnreadCount() async {
    try {
      state = state.copyWith(isLoading: true);

      final userId = await NotificationService.getCurrentUserId();
      if (userId != null) {
        final unreadNotifications = await NotificationService.getUnreadNotificationsForUser(userId);
        state = state.copyWith(
          unreadCount: unreadNotifications.length,
          isLoading: false,
        );
      } else {
        state = state.copyWith(unreadCount: 0, isLoading: false);
      }
    } catch (e) {
      state = state.copyWith(unreadCount: 0, isLoading: false);
    }
  }

  Future<void> fetchNotifications() async {
    try {
      state = state.copyWith(isLoading: true);

      final userId = await NotificationService.getCurrentUserId();
      if (userId != null) {
        final notifications = await NotificationService.getNotificationsForUser(userId);
        state = state.copyWith(
          notifications: notifications,
          isLoading: false,
        );
      } else {
        state = state.copyWith(notifications: [], isLoading: false);
      }
    } catch (e) {
      state = state.copyWith(notifications: [], isLoading: false);
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


final notificationProvider = StateNotifierProvider<NotificationNotifier, NotificationState>((ref) {
  return NotificationNotifier();
});