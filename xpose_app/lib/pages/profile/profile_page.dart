// lib/pages/profile/profile_page.dart (updated)
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart' as fb_auth;
import 'package:Xpose/helpers/user_preferences.dart';
import 'package:Xpose/pages/auth/auth_page.dart';
import 'package:Xpose/models/user_model.dart';
import 'package:Xpose/pages/profile/edit_profile_page.dart';
import 'package:cached_network_image/cached_network_image.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  UserModel? _currentUser;
  late Future<UserModel?> _userFuture;

  @override
  void initState() {
    super.initState();
    _userFuture = _loadUserData();
  }

  Future<UserModel?> _loadUserData() async {
    final UserModel? user = await UserPreferences.getUser();
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
                backgroundColor: Theme.of(context).colorScheme.error,
                foregroundColor: Theme.of(context).colorScheme.onError,
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
        if (_currentUser?.isGuest != true) {
          await fb_auth.FirebaseAuth.instance.signOut();
        }
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
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
          );
        }
      }
    }
  }

  void _showGuestDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Guest Mode'),
          content: const Text('Guest users cannot edit profile. Please login to access this feature.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _navigateToLogin();
              },
              child: const Text('Login'),
            ),
          ],
        );
      },
    );
  }

  void _navigateToLogin() async {
    await UserPreferences.clearUser();
    if (mounted) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (context) => const AuthPage()),
            (Route<dynamic> route) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Profile',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: Theme.of(context).colorScheme.onPrimary,
          ),
        ),
        backgroundColor: Theme.of(context).colorScheme.background,
        foregroundColor: Theme.of(context).colorScheme.onBackground,
        centerTitle: true,
        elevation: 0,
      ),
      body: FutureBuilder<UserModel?>(
        future: _userFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error loading user data: ${snapshot.error}', style: Theme.of(context).textTheme.bodyMedium));
          } else if (_currentUser == null) {
            return Center(child: Text('No user data available. Please log in.', style: Theme.of(context).textTheme.bodyMedium));
          } else {
            final bool isGuestUser = _currentUser?.isGuest ?? false;

            final String userName = _currentUser?.name != null && _currentUser!.name!.isNotEmpty
                ? _currentUser!.name!
                : isGuestUser ? 'Guest User' : 'Name not set';

            final String userEmail = _currentUser?.email != null && _currentUser!.email!.isNotEmpty
                ? _currentUser!.email!
                : isGuestUser ? 'Not available in guest mode' : 'Email not added';

            ImageProvider<Object> profileImageProvider;
            if (_currentUser?.profileUrl != null && _currentUser!.profileUrl!.isNotEmpty && _currentUser!.profileUrl!.startsWith('http')) {
              profileImageProvider = CachedNetworkImageProvider(_currentUser!.profileUrl!);
            } else {
              profileImageProvider = const AssetImage('assets/profile-fallback/profile-fallback.png');
            }

            final String userMobile = _currentUser?.mobile != null && _currentUser!.mobile.isNotEmpty
                ? (isGuestUser ? 'Guest Mode' : _currentUser!.mobile)
                : 'Mobile not available';

            return SingleChildScrollView(
              child: Column(
                children: [
                  if (isGuestUser)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.orange.withOpacity(0.1),
                        border: Border.all(color: Colors.orange),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.info_outline, color: Colors.orange[700], size: 16),
                          const SizedBox(width: 8),
                          Text(
                            'You are logged in as Guest',
                            style: TextStyle(
                              color: Colors.orange[700],
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 30, horizontal: 20),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          Theme.of(context).colorScheme.surface.withOpacity(0.8),
                          Theme.of(context).colorScheme.surface,
                        ],
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
                          backgroundColor: Theme.of(context).colorScheme.onSurface,
                          child: CircleAvatar(
                            radius: 62,
                            backgroundImage: profileImageProvider,
                            onBackgroundImageError: (exception, stackTrace) {
                              if (mounted) {
                                setState(() {});
                              }
                            },
                          ),
                        ),
                        const SizedBox(height: 18),
                        Text(
                          userName,
                          style: Theme.of(context).textTheme.displayLarge?.copyWith(
                            color: Theme.of(context).colorScheme.onPrimary,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 6),
                        Text(
                          userEmail,
                          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            color: Theme.of(context).colorScheme.onPrimary.withOpacity(0.8),
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Mobile: $userMobile',
                          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            color: Theme.of(context).colorScheme.onPrimary.withOpacity(0.8),
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
                          isGuestUser ? 'Login to edit profile' : 'Update your profile information',
                          onTap: isGuestUser ? _showGuestDialog : () async {
                            if (_currentUser != null) {
                              final UserModel? updatedUser = await Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => EditProfilePage(user: _currentUser!),
                                ),
                              );
                              if (updatedUser != null) {
                                setState(() {
                                  _currentUser = updatedUser;
                                });
                                await UserPreferences.saveUser(updatedUser);
                              }
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
    final Color primaryColor = Theme.of(context).colorScheme.primary;
    final Color onSurfaceColor = Theme.of(context).colorScheme.onSurface;
    final Color cardBackgroundColor = Theme.of(context).colorScheme.surface;
    final Color secondaryTextColor = Theme.of(context).colorScheme.onSurface.withOpacity(0.6);

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8.0),
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: onSurfaceColor.withOpacity(0.05),
          width: 1,
        ),
      ),
      color: cardBackgroundColor,
      child: InkWell(
        onTap: onTap ?? () {},
        borderRadius: BorderRadius.circular(12),
        splashColor: primaryColor.withOpacity(0.1),
        highlightColor: primaryColor.withOpacity(0.05),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 18.0, horizontal: 20.0),
          child: Row(
            children: [
              Icon(
                icon,
                color: isDestructive ? Theme.of(context).colorScheme.error : primaryColor,
                size: 26,
              ),
              const SizedBox(width: 18),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: isDestructive ? Theme.of(context).colorScheme.error : onSurfaceColor,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        subtitle,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: secondaryTextColor,
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
                size: 18,
                color: secondaryTextColor.withOpacity(0.6),
              ),
            ],
          ),
        ),
      ),
    );
  }
}