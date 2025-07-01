// lib/pages/profile/profile_page.dart
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart' as fb_auth;
import 'package:Xpose/helpers/user_preferences.dart';
import 'package:Xpose/pages/auth/auth_page.dart';
import 'package:Xpose/models/user_model.dart';
import 'package:Xpose/pages/profile/edit_profile_page.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  User? _currentUser;
  late Future<User?> _userFuture;

  @override
  void initState() {
    super.initState();
    _userFuture = _loadUserData();
  }

  Future<User?> _loadUserData() async {
    final User? user = await UserPreferences.getUser();
    setState(() {
      _currentUser = user;
    });
    return user;
  }

  Future<void> _logout() async {
    bool confirmLogout = await showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
          backgroundColor: Theme.of(context).colorScheme.surface,
          title: Text(
            'Confirm Logout',
            style: TextStyle(color: Theme.of(context).colorScheme.onSurface),
          ),
          content: Text(
            'Are you sure you want to log out?',
            style: TextStyle(color: Theme.of(context).colorScheme.onSurface),
          ),
          actions: <Widget>[
            TextButton(
              onPressed: () {
                Navigator.of(dialogContext).pop(false);
              },
              child: Text(
                'Cancel',
                style: TextStyle(color: Theme.of(context).colorScheme.primary),
              ),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(dialogContext).pop(true);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.redAccent,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('Logout'),
            ),
          ],
        );
      },
    );

    if (confirmLogout == true) {
      try {
        await fb_auth.FirebaseAuth.instance.signOut();
        await UserPreferences.clearUser();

        if (mounted) {
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (context) => const AuthPage()),
                (Route<dynamic> route) => false,
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to log out: ${e.toString()}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        backgroundColor: Colors.blueGrey[900],
        foregroundColor: Colors.white,
        centerTitle: true,
        elevation: 0,
      ),
      body: FutureBuilder<User?>(
        future: _userFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error loading user data: ${snapshot.error}'));
          } else if (!snapshot.hasData || snapshot.data == null) {
            return const Center(child: Text('No user data available. Please log in.'));
          } else {
            _currentUser = snapshot.data;
            final String userName = _currentUser?.name != null && _currentUser!.name!.isNotEmpty
                ? _currentUser!.name!
                : 'Name not set';
            final String userEmail = _currentUser?.email != null && _currentUser!.email!.isNotEmpty
                ? _currentUser!.email!
                : 'Email not added';
            final String userProfileUrl = _currentUser?.profileUrl != null && _currentUser!.profileUrl!.isNotEmpty && _currentUser!.profileUrl!.startsWith('http')
                ? _currentUser!.profileUrl!
                : 'assets/profile-fallback/profile-fallback.png';
            final String userMobile = _currentUser?.mobile != null && _currentUser!.mobile.isNotEmpty
                ? _currentUser!.mobile
                : 'Mobile not available';

            return SingleChildScrollView(
              child: Column(
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 30, horizontal: 20),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Colors.blueGrey[800]!, Colors.blueGrey[600]!],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          spreadRadius: 2,
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircleAvatar(
                          radius: 65,
                          backgroundColor: Colors.white,
                          backgroundImage: userProfileUrl.startsWith('http')
                              ? NetworkImage(userProfileUrl) as ImageProvider<Object>
                              : AssetImage(userProfileUrl) as ImageProvider<Object>,
                          onBackgroundImageError: (exception, stackTrace) {
                            if (_currentUser?.profileUrl != null && _currentUser!.profileUrl!.startsWith('http')) {
                              setState(() {
                                _currentUser = _currentUser?.copyWith(profileUrl: 'assets/logo/xpose-logo-round.png');
                              });
                            }
                          },
                        ),
                        const SizedBox(height: 18),
                        Text(
                          userName,
                          style: const TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 6),
                        Text(
                          userEmail,
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.white.withOpacity(0.8),
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Mobile: $userMobile',
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.white.withOpacity(0.8),
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: [
                        _buildProfileOption(
                          context,
                          Icons.edit_note,
                          'Edit Details',
                          'Update your profile information',
                          onTap: () async {
                            if (_currentUser != null) {
                              await Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => EditProfilePage(user: _currentUser!),
                                ),
                              );
                              _userFuture = _loadUserData();
                              setState(() {});
                            }
                          },
                        ),
                        _buildProfileOption(context, Icons.security, 'Security & Privacy', 'Update password and privacy settings'),
                        _buildProfileOption(context, Icons.notifications_none, 'Notifications', 'Configure notification preferences'),
                        _buildProfileOption(context, Icons.language, 'Language', 'Change app language'),
                        _buildProfileOption(context, Icons.star_border, 'Rate Us', 'Leave a review for the app'),
                        _buildProfileOption(context, Icons.help_outline, 'Help & Support', 'Get help or contact support'),
                        _buildProfileOption(context, Icons.info_outline, 'About App', 'Information about the application'),
                        const SizedBox(height: 25),
                        _buildProfileOption(context, Icons.logout, 'Logout', null, isDestructive: true, onTap: _logout),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }
        },
      ),
    );
  }

  Widget _buildProfileOption(BuildContext context, IconData icon, String title, String? subtitle, {bool isDestructive = false, VoidCallback? onTap}) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8.0),
      elevation: 5,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: InkWell(
        onTap: onTap ?? () {},
        borderRadius: BorderRadius.circular(15),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 18.0, horizontal: 20.0),
          child: Row(
            children: [
              Icon(
                icon,
                color: isDestructive ? Colors.redAccent : Theme.of(context).colorScheme.primary,
                size: 28,
              ),
              const SizedBox(width: 20),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: isDestructive ? Colors.redAccent : Colors.blueGrey[800],
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(height: 5),
                      Text(
                        subtitle,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),
              Icon(
                Icons.arrow_forward_ios,
                size: 20,
                color: Colors.grey[400],
              ),
            ],
          ),
        ),
      ),
    );
  }
}