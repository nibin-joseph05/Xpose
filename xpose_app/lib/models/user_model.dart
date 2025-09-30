// lib/models/user_model.dart
import 'package:flutter/foundation.dart';

class UserModel {
  final int? id;
  final String mobile;
  final String? name;
  final String? email;
  final String? profileUrl;
  final bool isGuest;

  UserModel({
    this.id,
    required this.mobile,
    this.name,
    this.email,
    this.profileUrl,
    this.isGuest = false,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      mobile: json['mobile'],
      name: json['name'],
      email: json['email'],
      profileUrl: json['profileUrl'],
      isGuest: json['isGuest'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'mobile': mobile,
      'name': name,
      'email': email,
      'profileUrl': profileUrl,
      'isGuest': isGuest,
    };
  }

  UserModel copyWith({
    int? id,
    String? mobile,
    String? name,
    String? email,
    String? profileUrl,
    bool? isGuest,
  }) {
    return UserModel(
      id: id ?? this.id,
      mobile: mobile ?? this.mobile,
      name: name ?? this.name,
      email: email ?? this.email,
      profileUrl: profileUrl ?? this.profileUrl,
      isGuest: isGuest ?? this.isGuest,
    );
  }
}