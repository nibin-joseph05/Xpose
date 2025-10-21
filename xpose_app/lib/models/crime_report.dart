class CrimeReport {
  final String reportId;
  final String crimeType;
  final int crimeTypeId;
  final int crimeCategoryId;
  final String categoryName;
  final String originalDescription;
  final String translatedDescription;
  final String address;
  final String city;
  final String state;
  final String policeStation;
  final String status;
  final String urgencyLevel;
  final DateTime submittedAt;
  final int? assignedOfficerId;
  final String adminStatus;
  final String policeStatus;
  final String? officerName;

  CrimeReport({
    required this.reportId,
    required this.crimeType,
    required this.crimeTypeId,
    required this.crimeCategoryId,
    required this.categoryName,
    required this.originalDescription,
    required this.translatedDescription,
    required this.address,
    required this.city,
    required this.state,
    required this.policeStation,
    required this.status,
    required this.urgencyLevel,
    required this.submittedAt,
    this.assignedOfficerId,
    required this.adminStatus,
    required this.policeStatus,
    this.officerName,
  });

  CrimeReport copyWith({
    String? reportId,
    String? crimeType,
    int? crimeTypeId,
    int? crimeCategoryId,
    String? categoryName,
    String? originalDescription,
    String? translatedDescription,
    String? address,
    String? city,
    String? state,
    String? policeStation,
    String? status,
    String? urgencyLevel,
    DateTime? submittedAt,
    int? assignedOfficerId,
    String? adminStatus,
    String? policeStatus,
    String? officerName,
  }) {
    return CrimeReport(
      reportId: reportId ?? this.reportId,
      crimeType: crimeType ?? this.crimeType,
      crimeTypeId: crimeTypeId ?? this.crimeTypeId,
      crimeCategoryId: crimeCategoryId ?? this.crimeCategoryId,
      categoryName: categoryName ?? this.categoryName,
      originalDescription: originalDescription ?? this.originalDescription,
      translatedDescription: translatedDescription ?? this.translatedDescription,
      address: address ?? this.address,
      city: city ?? this.city,
      state: state ?? this.state,
      policeStation: policeStation ?? this.policeStation,
      status: status ?? this.status,
      urgencyLevel: urgencyLevel ?? this.urgencyLevel,
      submittedAt: submittedAt ?? this.submittedAt,
      assignedOfficerId: assignedOfficerId ?? this.assignedOfficerId,
      adminStatus: adminStatus ?? this.adminStatus,
      policeStatus: policeStatus ?? this.policeStatus,
      officerName: officerName ?? this.officerName,
    );
  }

  factory CrimeReport.fromJson(Map<String, dynamic> json) {
    return CrimeReport(
      reportId: json['reportId'] ?? '',
      crimeType: json['crimeType'] ?? 'Unknown',
      crimeTypeId: json['crimeTypeId'] ?? 0,
      crimeCategoryId: json['crimeCategoryId'] ?? 0,
      categoryName: json['categoryName'] ?? 'Unknown',
      originalDescription: json['originalDescription'] ?? '',
      translatedDescription: json['translatedDescription'] ?? '',
      address: json['address'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      policeStation: json['policeStation'] ?? '',
      status: json['status'] ?? 'UNKNOWN',
      urgencyLevel: json['urgencyLevel'] ?? 'LOW',
      submittedAt: DateTime.parse(json['submittedAt'] ?? DateTime.now().toIso8601String()),
      assignedOfficerId: json['assignedOfficerId'],
      adminStatus: json['adminStatus'] ?? 'PENDING',
      policeStatus: json['policeStatus'] ?? 'NOT_VIEWED',
      officerName: json['officerName'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'reportId': reportId,
      'crimeType': crimeType,
      'crimeTypeId': crimeTypeId,
      'crimeCategoryId': crimeCategoryId,
      'categoryName': categoryName,
      'originalDescription': originalDescription,
      'translatedDescription': translatedDescription,
      'address': address,
      'city': city,
      'state': state,
      'policeStation': policeStation,
      'status': status,
      'urgencyLevel': urgencyLevel,
      'submittedAt': submittedAt.toIso8601String(),
      'assignedOfficerId': assignedOfficerId,
      'adminStatus': adminStatus,
      'policeStatus': policeStatus,
      'officerName': officerName,
    };
  }
}