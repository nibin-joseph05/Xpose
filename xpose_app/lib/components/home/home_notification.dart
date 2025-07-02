import 'package:flutter/material.dart';
import 'package:Xpose/services/notification_service.dart';
import 'package:Xpose/models/notification_model.dart' as notif_model;
import 'package:provider/provider.dart';
import 'package:Xpose/providers/notification_provider.dart';

class HomeNotification extends StatefulWidget {
  final VoidCallback? onTap;
  final int unreadCount;

  const HomeNotification({
    super.key,
    this.onTap,
    required this.unreadCount,
  });

  @override
  State<HomeNotification> createState() => _HomeNotificationState();
}

class _HomeNotificationState extends State<HomeNotification> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final bool isFullScreenPage = ModalRoute.of(context)?.isCurrent == true &&
        ModalRoute.of(context)?.settings.arguments == null &&
        Navigator.of(context).canPop();

    if (isFullScreenPage) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Notifications'),
          backgroundColor: Theme.of(context).colorScheme.surface,
          foregroundColor: Colors.white,
        ),
        body: Consumer<NotificationProvider>(
          builder: (context, notificationProvider, child) {
            final notifications = notificationProvider.notifications;

            if (notifications.isEmpty) {
              return const Center(
                  child: Text('No notifications yet.',
                      style: TextStyle(color: Colors.white70)));
            } else {
              return ListView.builder(
                itemCount: notifications.length,
                itemBuilder: (context, index) {
                  final notification = notifications[index];
                  return Card(
                    color: notification.isRead
                        ? Colors.grey[800]
                        : Theme.of(context).colorScheme.surface,
                    margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: ListTile(
                      title: Text(
                        notification.title,
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight:
                          notification.isRead ? FontWeight.normal : FontWeight.bold,
                        ),
                      ),
                      subtitle: Text(
                        notification.message,
                        style: const TextStyle(color: Colors.white70),
                      ),
                      trailing: notification.isRead
                          ? null
                          : IconButton(
                        icon: const Icon(Icons.check_circle_outline,
                            color: Colors.blueAccent),
                        onPressed: () async {
                          try {
                            await notificationProvider.markNotificationAsRead(
                                notification.id);
                          } catch (e) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                  content: Text('Failed to mark as read: $e')),
                            );
                          }
                        },
                      ),
                      onTap: () {
                        if (!notification.isRead) {
                          notificationProvider.markNotificationAsRead(notification.id)
                              .catchError((e) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                  content: Text('Failed to mark as read: $e')),
                            );
                          });
                        }
                      },
                    ),
                  );
                },
              );
            }
          },
        ),
        backgroundColor: Theme.of(context).colorScheme.background,
      );
    } else {
      return Material(
        color: Theme.of(context).colorScheme.surface,
        shape: const CircleBorder(),
        elevation: 5,
        shadowColor: Colors.black.withOpacity(0.2),
        child: InkWell(
          onTap: widget.onTap,
          customBorder: const CircleBorder(),
          child: SizedBox(
            width: 48,
            height: 48,
            child: Stack(
              alignment: Alignment.center,
              clipBehavior: Clip.none,
              children: [
                const Icon(
                  Icons.notifications_none,
                  color: Colors.white,
                  size: 28,
                ),
                if (widget.unreadCount > 0)
                  Positioned(
                    top: 6,
                    right: 6,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Colors.red,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.white, width: 1.5),
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 16,
                        minHeight: 16,
                      ),
                      child: Text(
                        '${widget.unreadCount}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      );
    }
  }
}