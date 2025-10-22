import 'package:intl/intl.dart';
import 'dart:convert';

class CrimeReportDetail {
  final String reportId;
  final String crimeType;
  final int? crimeTypeId;
  final int? categoryId;
  final String categoryName;
  final String originalDescription;
  final String? processedDescription;
  final String address;
  final String city;
  final String state;
  final String country;
  final String policeStation;
  final String status;
  final String? urgency;
  final DateTime submittedAt;
  final double? confidenceScore;
  final double? spamScore;
  final Map<String, dynamic>? toxicityScores;
  final Map<String, dynamic>? shapExplanation;
  final String? reportQuality;
  final String? blockchainHash;
  final DateTime? blockchainTimestamp;
  final String? blockchainTxId;
  final double? latitude;
  final double? longitude;
  final int? assignedOfficerId;
  final String? assignedOfficerName;
  final String? rawBlockchainData;
  final String adminStatus;
  final String policeStatus;
  final String? policeFeedback;
  final List<String>? policeActionProof;
  final DateTime? actionTakenAt;
  final int? actionTakenBy;
  final String? actionTakenByName;
  final String? languageDetected;
  final String? translatedDescription;
  final String? rejectionReason;
  final DateTime? reviewedAt;
  final int? reviewedById;
  final String? reviewedByName;

  CrimeReportDetail({
    required this.reportId,
    required this.crimeType,
    this.crimeTypeId,
    this.categoryId,
    required this.categoryName,
    required this.originalDescription,
    this.processedDescription,
    required this.address,
    required this.city,
    required this.state,
    required this.country,
    required this.policeStation,
    required this.status,
    this.urgency,
    required this.submittedAt,
    this.confidenceScore,
    this.spamScore,
    this.toxicityScores,
    this.shapExplanation,
    this.reportQuality,
    this.blockchainHash,
    this.blockchainTimestamp,
    this.blockchainTxId,
    this.latitude,
    this.longitude,
    this.assignedOfficerId,
    this.assignedOfficerName,
    this.rawBlockchainData,
    required this.adminStatus,
    required this.policeStatus,
    this.policeFeedback,
    this.policeActionProof,
    this.actionTakenAt,
    this.actionTakenBy,
    this.actionTakenByName,
    this.languageDetected,
    this.translatedDescription,
    this.rejectionReason,
    this.reviewedAt,
    this.reviewedById,
    this.reviewedByName,
  });

  factory CrimeReportDetail.fromJson(Map<String, dynamic> data) {
    return CrimeReportDetail(
      reportId: data['reportId'] ?? data['id'] ?? '',
      crimeType: data['crimeType'] ?? 'Unknown',
      crimeTypeId: data['crimeTypeId'] is int
          ? data['crimeTypeId']
          : (data['crimeTypeId'] as num?)?.toInt(),
      categoryId: data['categoryId'] is int
          ? data['categoryId']
          : (data['categoryId'] as num?)?.toInt(),
      categoryName: data['categoryName'] ?? 'Unknown',
      originalDescription: data['originalDescription'] ?? '',
      processedDescription:
      data['processedDescription'] ?? data['readabilityEnhancedDescription'],
      address: data['address'] ?? '',
      city: data['city'] ?? '',
      state: data['state'] ?? '',
      country: data['country'] ?? '',
      policeStation: data['policeStation'] ?? '',
      status: data['status'] ?? 'UNKNOWN',
      urgency: data['urgency'] ?? data['urgencyLevel'],
      submittedAt:
      DateTime.parse(data['submittedAt'] ?? DateTime.now().toIso8601String()),
      confidenceScore: data['confidenceScore']?.toDouble(),
      spamScore: data['spamScore']?.toDouble(),
      toxicityScores: data['toxicityScores'] is String
          ? (data['toxicityScores'] != null && data['toxicityScores'].isNotEmpty
          ? Map<String, dynamic>.from(json.decode(data['toxicityScores']))
          : null)
          : (data['toxicityScores'] != null
          ? Map<String, dynamic>.from(data['toxicityScores'])
          : null),
      shapExplanation: data['shapExplanation'] is String
          ? (data['shapExplanation'] != null && data['shapExplanation'].isNotEmpty
          ? Map<String, dynamic>.from(json.decode(data['shapExplanation']))
          : null)
          : (data['shapExplanation'] != null
          ? Map<String, dynamic>.from(data['shapExplanation'])
          : null),
      reportQuality: data['reportQuality'],
      blockchainHash: data['blockchainHash'],
      blockchainTimestamp: data['blockchainTimestamp'] != null
          ? DateTime.parse(data['blockchainTimestamp'])
          : null,
      blockchainTxId: data['blockchainTxId'],
      latitude: data['latitude']?.toDouble(),
      longitude: data['longitude']?.toDouble(),

      assignedOfficerId: data['assignedOfficerId'] is int
          ? data['assignedOfficerId']
          : (data['assignedOfficerId'] as num?)?.toInt(),
      assignedOfficerName: data['assignedOfficerName'],

      rawBlockchainData: data['rawBlockchainData'],
      adminStatus: data['adminStatus'] ?? 'PENDING',
      policeStatus: data['policeStatus'] ?? 'NOT_VIEWED',
      policeFeedback: data['policeFeedback'],
      policeActionProof: data['policeActionProof'] is String
          ? (data['policeActionProof'] != null &&
          data['policeActionProof'].isNotEmpty
          ? List<String>.from(json.decode(data['policeActionProof']))
          : null)
          : (data['policeActionProof'] != null
          ? List<String>.from(data['policeActionProof'])
          : null),
      actionTakenAt:
      data['actionTakenAt'] != null ? DateTime.parse(data['actionTakenAt']) : null,

      actionTakenBy: data['actionTakenBy'] is int
          ? data['actionTakenBy']
          : (data['actionTakenBy'] as num?)?.toInt(),
      actionTakenByName: data['actionTakenByName'],

      languageDetected: data['languageDetected'],
      translatedDescription: data['translatedDescription'],
      rejectionReason: data['rejectionReason'],
      reviewedAt:
      data['reviewedAt'] != null ? DateTime.parse(data['reviewedAt']) : null,

      reviewedById: data['reviewedById'] is int
          ? data['reviewedById']
          : (data['reviewedById'] as num?)?.toInt(),
      reviewedByName: data['reviewedByName'],
    );
  }


  Map<String, dynamic> toJson() {
    return {
      'reportId': reportId,
      'crimeType': crimeType,
      'crimeTypeId': crimeTypeId,
      'categoryId': categoryId,
      'categoryName': categoryName,
      'originalDescription': originalDescription,
      'processedDescription': processedDescription,
      'address': address,
      'city': city,
      'state': state,
      'country': country,
      'policeStation': policeStation,
      'status': status,
      'urgency': urgency,
      'submittedAt': submittedAt.toIso8601String(),
      'confidenceScore': confidenceScore,
      'spamScore': spamScore,
      'toxicityScores': toxicityScores,
      'shapExplanation': shapExplanation,
      'reportQuality': reportQuality,
      'blockchainHash': blockchainHash,
      'blockchainTimestamp': blockchainTimestamp?.toIso8601String(),
      'blockchainTxId': blockchainTxId,
      'latitude': latitude,
      'longitude': longitude,
      'assignedOfficerId': assignedOfficerId,
      'rawBlockchainData': rawBlockchainData,
      'adminStatus': adminStatus,
      'policeStatus': policeStatus,
      'policeFeedback': policeFeedback,
      'policeActionProof': policeActionProof,
      'actionTakenAt': actionTakenAt?.toIso8601String(),
      'actionTakenBy': actionTakenBy,
      'languageDetected': languageDetected,
      'translatedDescription': translatedDescription,
      'rejectionReason': rejectionReason,
      'reviewedAt': reviewedAt?.toIso8601String(),
      'reviewedById': reviewedById,
    };
  }
}