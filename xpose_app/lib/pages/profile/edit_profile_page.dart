import 'dart:io';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:Xpose/models/user_model.dart';
import 'package:Xpose/services/auth_service.dart';
import 'package:image_picker/image_picker.dart';

class EditProfilePage extends StatefulWidget {
  final User user;

  const EditProfilePage({super.key, required this.user});

  @override
  State<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _emailController;

  XFile? _pickedImage;
  String? _currentProfileImageUrl;

  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.user.name ?? '');
    _emailController = TextEditingController(text: widget.user.email ?? '');
    _currentProfileImageUrl = widget.user.profileUrl;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);

    if (image != null) {
      setState(() {
        _pickedImage = image;
        _currentProfileImageUrl = null;
      });
    }
  }

  Future<void> _updateProfile() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      String? profilePictureData;
      if (_pickedImage != null) {
        final bytes = await _pickedImage!.readAsBytes();
        profilePictureData = 'data:${_pickedImage!.mimeType ?? 'image/jpeg'};base64,${base64Encode(bytes)}';
      } else if (_currentProfileImageUrl != null && _currentProfileImageUrl!.startsWith('http')) {
        profilePictureData = _currentProfileImageUrl;
      } else {
        profilePictureData = null;
      }

      try {
        await AuthService.updateProfile(
          widget.user.id!,
          name: _nameController.text.trim().isEmpty ? null : _nameController.text.trim(),
          email: _emailController.text.trim().isEmpty ? null : _emailController.text.trim(),
          profileUrl: profilePictureData,
        );

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Profile updated successfully!'),
              backgroundColor: Colors.green,
            ),
          );
          Navigator.pop(context);
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to update profile: ${e.toString()}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      } finally {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    ImageProvider<Object> currentImageProvider;
    if (_pickedImage != null) {
      currentImageProvider = FileImage(File(_pickedImage!.path));
    } else if (_currentProfileImageUrl != null && _currentProfileImageUrl!.isNotEmpty && _currentProfileImageUrl!.startsWith('http')) {
      currentImageProvider = NetworkImage(_currentProfileImageUrl!);
    } else {
      currentImageProvider = const AssetImage('assets/profile-fallback/profile-fallback.png');
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Profile'),
        backgroundColor: Colors.blueGrey[900],
        foregroundColor: Colors.white,
        centerTitle: true,
        elevation: 0,
      ),
      body: Container(
        color: Theme.of(context).scaffoldBackgroundColor,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Stack(
                  children: [
                    CircleAvatar(
                      radius: 65,
                      backgroundColor: Colors.white,
                      backgroundImage: currentImageProvider,
                      onBackgroundImageError: (exception, stackTrace) {
                        if (_currentProfileImageUrl != null && _currentProfileImageUrl!.startsWith('http')) {
                          setState(() {
                            _currentProfileImageUrl = null;
                          });
                        }
                      },
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: GestureDetector(
                        onTap: _pickImage,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Theme.of(context).colorScheme.primary,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                          ),
                          child: const Icon(Icons.camera_alt, color: Colors.white, size: 24),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 30),
                Text(
                  'Update your profile information. All fields are optional and will keep current values if left empty.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 15,
                    color: Colors.blueGrey[600],
                    fontStyle: FontStyle.italic,
                  ),
                ),
                const SizedBox(height: 30),
                TextFormField(
                  controller: _nameController,
                  style: const TextStyle(color: Colors.black87),
                  decoration: InputDecoration(
                    hintText: 'Name',
                    hintStyle: TextStyle(color: Colors.blueGrey[700]),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    prefixIcon: Icon(Icons.person_outline, color: Colors.blueGrey[700]),
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.blueGrey.shade200, width: 1),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Theme.of(context).colorScheme.primary, width: 2),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                TextFormField(
                  controller: _emailController,
                  style: const TextStyle(color: Colors.black87),
                  decoration: InputDecoration(
                    hintText: 'Email',
                    hintStyle: TextStyle(color: Colors.blueGrey[700]),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    prefixIcon: Icon(Icons.email_outlined, color: Colors.blueGrey[700]),
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.blueGrey.shade200, width: 1),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Theme.of(context).colorScheme.primary, width: 2),
                    ),
                  ),
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 40),
                _isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _updateProfile,
                    icon: const Icon(Icons.save_outlined, size: 24),
                    label: const Text(
                      'Save Changes',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 15),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 5,
                      shadowColor: Colors.black.withOpacity(0.3),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}