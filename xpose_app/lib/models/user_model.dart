// lib/models/user_model.dart
import 'package:flutter/foundation.dart';

class User {
  final int? id;
  final String mobile;
  final String? name;
  final String? email;
  final String? profileUrl;

  User({
    this.id,
    required this.mobile,
    this.name,
    this.email,
    this.profileUrl,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      mobile: json['mobile'],
      name: json['name'],
      email: json['email'],
      profileUrl: json['profileUrl'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'mobile': mobile,
      'name': name,
      'email': email,
      'profileUrl': profileUrl,
    };
  }

  User copyWith({
    int? id,
    String? mobile,
    String? name,
    String? email,
    String? profileUrl,
  }) {
    return User(
      id: id ?? this.id,
      mobile: mobile ?? this.mobile,
      name: name ?? this.name,
      email: email ?? this.email,
      profileUrl: profileUrl ?? this.profileUrl,
    );
  }
}