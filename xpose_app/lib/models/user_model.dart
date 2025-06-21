class User {
  final String mobile;

  User({required this.mobile});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      mobile: json['mobile'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'mobile': mobile,
    };
  }
}
