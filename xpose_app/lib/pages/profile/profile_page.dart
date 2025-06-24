import 'package:flutter/material.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        backgroundColor: Colors.blueGrey[900],
        foregroundColor: Colors.white,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              color: Colors.blueGrey[800],
              child: Center(
                child: Column(
                  children: [
                    const CircleAvatar(
                      radius: 60,
                      backgroundImage: NetworkImage(
                        'https://placehold.co/120x120/E0F2F7/000000?text=User',
                      ),
                      backgroundColor: Colors.white,
                    ),
                    const SizedBox(height: 15),
                    const Text(
                      'John Doe',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 5),
                    const Text(
                      'john.doe@example.com',
                      style: TextStyle(
                        fontSize: 15,
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  _buildProfileOption(context, Icons.person_outline, 'My Account', 'Manage your profile details'),
                  _buildProfileOption(context, Icons.security, 'Security & Privacy', 'Update password and privacy settings'),
                  _buildProfileOption(context, Icons.notifications_none, 'Notifications', 'Configure notification preferences'),
                  _buildProfileOption(context, Icons.language, 'Language', 'Change app language'),
                  _buildProfileOption(context, Icons.star_border, 'Rate Us', 'Leave a review for the app'),
                  _buildProfileOption(context, Icons.help_outline, 'Help & Support', 'Get help or contact support'),
                  _buildProfileOption(context, Icons.info_outline, 'About App', 'Information about the application'),
                  const SizedBox(height: 20),
                  _buildProfileOption(context, Icons.logout, 'Logout', null, isDestructive: true),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileOption(BuildContext context, IconData icon, String title, String? subtitle, {bool isDestructive = false}) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8.0),
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () {
          print('$title tapped!');
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 15.0, horizontal: 16.0),
          child: Row(
            children: [
              Icon(
                icon,
                color: isDestructive ? Colors.red : Theme.of(context).colorScheme.primary,
                size: 26,
              ),
              const SizedBox(width: 20),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w500,
                        color: isDestructive ? Colors.red : Colors.blueGrey[800],
                      ),
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        subtitle,
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              Icon(
                Icons.arrow_forward_ios,
                size: 18,
                color: Colors.grey[400],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
