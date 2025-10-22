// lib/pages/report_details/report_details_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:Xpose/models/crime_report_detail.dart';
import 'package:Xpose/services/search_service.dart';

class ReportDetailsPage extends ConsumerStatefulWidget {
  final String reportId;

  const ReportDetailsPage({super.key, required this.reportId});

  @override
  ConsumerState<ReportDetailsPage> createState() => _ReportDetailsPageState();
}

class _ReportDetailsPageState extends ConsumerState<ReportDetailsPage> {
  late Future<CrimeReportDetail> _reportFuture;
  late SearchService _searchService;

  @override
  void initState() {
    super.initState();
    _searchService = SearchService();
    _reportFuture = _fetchReportDetails();
  }

  Future<CrimeReportDetail> _fetchReportDetails() async {
    try {
      final report = await _searchService.getReportDetails(widget.reportId);
      return report;
    } catch (e) {
      _showErrorSnackBar('Failed to load report details: $e');
      rethrow;
    }
  }

  void _showErrorSnackBar(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: Colors.red,
          duration: Duration(seconds: 3),
        ),
      );
    }
  }

  void _showSuccessSnackBar(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: Colors.green,
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.surface,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'Report Details',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        elevation: 0,
      ),
      body: FutureBuilder<CrimeReportDetail>(
        future: _reportFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return _buildLoadingState();
          }

          if (snapshot.hasError) {
            return _buildErrorState(snapshot.error.toString());
          }

          if (!snapshot.hasData) {
            return _buildErrorState('Report not found');
          }

          return _buildReportDetails(snapshot.data!);
        },
      ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(
            strokeWidth: 2,
            valueColor: AlwaysStoppedAnimation<Color>(Colors.blueAccent),
          ),
          SizedBox(height: 16),
          Text(
            'Loading report details...',
            style: TextStyle(color: Colors.white70, fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(String error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline_rounded, color: Colors.orangeAccent, size: 64),
            SizedBox(height: 16),
            Text(
              'Unable to Load Report',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 12),
            Text(
              error,
              style: TextStyle(color: Colors.white70, fontSize: 14),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                setState(() {
                  _reportFuture = _fetchReportDetails();
                });
              },
              child: Text('Try Again'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blueAccent,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReportDetails(CrimeReportDetail report) {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [

          _buildReportHeader(report),
          SizedBox(height: 24),


          _buildStatusSection(report),
          SizedBox(height: 24),


          _buildCrimeDetailsSection(report),
          SizedBox(height: 24),


          _buildLocationSection(report),
          SizedBox(height: 24),


          _buildDescriptionSection(report),
          SizedBox(height: 24),


          _buildAdditionalInfoSection(report),
          SizedBox(height: 24),


          if (report.policeFeedback != null ||
              (report.policeActionProof != null && report.policeActionProof!.isNotEmpty))
            _buildPoliceActionsSection(report),


          if (report.rejectionReason != null || report.reviewedAt != null)
            _buildReviewSection(report),
        ],
      ),
    );
  }

  Widget _buildReportHeader(CrimeReportDetail report) {
    return Card(
      color: Theme.of(context).colorScheme.surface,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    report.reportId,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                if (report.blockchainHash != null)
                  Icon(Icons.verified_rounded, color: Colors.greenAccent, size: 24),
              ],
            ),
            SizedBox(height: 8),
            Text(
              'Crime Report',
              style: TextStyle(
                color: Colors.white70,
                fontSize: 14,
              ),
            ),
            SizedBox(height: 12),
            Divider(color: Colors.white.withOpacity(0.3)),
            SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.calendar_today_rounded, size: 16, color: Colors.white70),
                SizedBox(width: 8),
                Text(
                  'Submitted: ${DateFormat('MMM dd, yyyy - HH:mm').format(report.submittedAt)}',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
            if (report.blockchainTimestamp != null) ...[
              SizedBox(height: 4),
              Row(
                children: [
                  Icon(Icons.link_rounded, size: 16, color: Colors.white70),
                  SizedBox(width: 8),
                  Text(
                    'Blockchain: ${DateFormat('MMM dd, yyyy').format(report.blockchainTimestamp!)}',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStatusSection(CrimeReportDetail report) {
    Color getStatusColor(String status) {
      switch (status.toUpperCase()) {
        case 'ACCEPTED':
        case 'APPROVED':
        case 'RESOLVED':
        case 'ACTION_TAKEN':
          return Colors.green;
        case 'REJECTED':
          return Colors.red;
        case 'PENDING':
        case 'PENDING_REVIEW':
        case 'VIEWED':
          return Colors.orange;
        case 'IN_PROGRESS':
        case 'ASSIGNED':
          return Colors.blue;
        case 'NOT_VIEWED':
          return Colors.grey;
        default:
          return Colors.grey;
      }
    }

    Widget _buildStatusItem(String title, String status) {
      return Container(
        width: double.infinity,
        padding: EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: getStatusColor(status).withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: getStatusColor(status).withOpacity(0.3)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: TextStyle(
                color: Colors.white70,
                fontSize: 12,
              ),
            ),
            SizedBox(height: 4),
            Text(
              status.replaceAll('_', ' ').toUpperCase(),
              style: TextStyle(
                color: getStatusColor(status),
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Report Status',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        SizedBox(height: 12),
        GridView.count(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          shrinkWrap: true,
          physics: NeverScrollableScrollPhysics(),
          childAspectRatio: 2.5,
          children: [
            _buildStatusItem('Admin Status', report.adminStatus),
            _buildStatusItem('Police Status', report.policeStatus),
            _buildStatusItem('Report Status', report.status),
            if (report.urgency != null)
              _buildStatusItem('Urgency Level', report.urgency!),
          ],
        ),
      ],
    );
  }

  Widget _buildCrimeDetailsSection(CrimeReportDetail report) {
    return Card(
      color: Theme.of(context).colorScheme.surface,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Crime Details',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 12),
            _buildDetailRow('Crime Type', report.crimeType),
            _buildDetailRow('Category', report.categoryName),
            if (report.crimeTypeId != null)
              _buildDetailRow('Crime Type ID', report.crimeTypeId.toString()),
            if (report.categoryId != null)
              _buildDetailRow('Category ID', report.categoryId.toString()),
            if (report.assignedOfficerId != null)
              _buildDetailRow('Assigned Officer', 'ID: ${report.assignedOfficerId}'),
            _buildDetailRow('Police Station',
                report.policeStation.isNotEmpty ? report.policeStation : 'Not assigned'),
          ],
        ),
      ),
    );
  }

  Widget _buildLocationSection(CrimeReportDetail report) {
    return Card(
      color: Theme.of(context).colorScheme.surface,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Location Information',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 12),
            _buildDetailRow('Address', report.address),
            _buildDetailRow('City', report.city),
            _buildDetailRow('State', report.state),
            _buildDetailRow('Country', report.country),
            if (report.latitude != null && report.longitude != null)
              _buildDetailRow('Coordinates',
                  '${report.latitude!.toStringAsFixed(4)}, ${report.longitude!.toStringAsFixed(4)}'),
          ],
        ),
      ),
    );
  }

  Widget _buildDescriptionSection(CrimeReportDetail report) {
    return Card(
      color: Theme.of(context).colorScheme.surface,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Incident Description',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 12),
            Text(
              report.originalDescription,
              style: TextStyle(
                color: Colors.white70,
                fontSize: 14,
                height: 1.4,
              ),
            ),
            if (report.languageDetected != null) ...[
              SizedBox(height: 8),
              _buildDetailRow('Language Detected', report.languageDetected!),
            ],
            if (report.translatedDescription != null &&
                report.translatedDescription!.isNotEmpty)
              ...[
                SizedBox(height: 16),
                Text(
                  'Translated Description:',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  report.translatedDescription!,
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                    height: 1.4,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ],
            if (report.processedDescription != null &&
                report.processedDescription != report.originalDescription)
              ...[
                SizedBox(height: 16),
                Text(
                  'Enhanced Description:',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  report.processedDescription!,
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                    height: 1.4,
                  ),
                ),
              ],
          ],
        ),
      ),
    );
  }

  Widget _buildAdditionalInfoSection(CrimeReportDetail report) {
    return Card(
      color: Theme.of(context).colorScheme.surface,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Additional Information',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 12),
            if (report.confidenceScore != null)
              _buildDetailRow('Confidence Score', '${(report.confidenceScore! * 100).toStringAsFixed(1)}%'),
            if (report.spamScore != null)
              _buildDetailRow('Spam Score', '${(report.spamScore! * 100).toStringAsFixed(1)}%'),
            if (report.reportQuality != null)
              _buildDetailRow('Report Quality', report.reportQuality!),
            if (report.blockchainHash != null)
              _buildDetailRow('Blockchain Hash',
                  report.blockchainHash!.substring(0, 16) + '...'),
            if (report.blockchainTxId != null)
              _buildDetailRow('Transaction ID', report.blockchainTxId!),
          ],
        ),
      ),
    );
  }

  Widget _buildPoliceActionsSection(CrimeReportDetail report) {
    return Card(
      color: Theme.of(context).colorScheme.surface,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Police Actions',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 12),
            if (report.policeFeedback != null)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Feedback:',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  SizedBox(height: 8),
                  Container(
                    padding: EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.blueAccent.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      report.policeFeedback!,
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 14,
                        height: 1.4,
                      ),
                    ),
                  ),
                  SizedBox(height: 16),
                ],
              ),
            if (report.policeActionProof != null && report.policeActionProof!.isNotEmpty)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Action Proof:',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  SizedBox(height: 8),
                  ...report.policeActionProof!.map((proof) =>
                      Container(
                        margin: EdgeInsets.only(bottom: 8),
                        padding: EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.greenAccent.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: Colors.greenAccent.withOpacity(0.3)),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.attachment_rounded, size: 16, color: Colors.greenAccent),
                            SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                proof,
                                style: TextStyle(
                                  color: Colors.greenAccent,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                      )
                  ).toList(),
                ],
              ),
            if (report.actionTakenAt != null)
              Padding(
                padding: const EdgeInsets.only(top: 12),
                child: Text(
                  'Action taken on: ${DateFormat('MMM dd, yyyy - HH:mm').format(report.actionTakenAt!)}',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 12,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewSection(CrimeReportDetail report) {
    return Card(
      color: Theme.of(context).colorScheme.surface,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Review Information',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 12),
            if (report.rejectionReason != null)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Rejection Reason:',
                    style: TextStyle(
                      color: Colors.redAccent,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  SizedBox(height: 8),
                  Container(
                    padding: EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.redAccent.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      report.rejectionReason!,
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 14,
                        height: 1.4,
                      ),
                    ),
                  ),
                  SizedBox(height: 12),
                ],
              ),
            if (report.reviewedAt != null)
              _buildDetailRow('Reviewed At', DateFormat('MMM dd, yyyy - HH:mm').format(report.reviewedAt!)),
            if (report.reviewedById != null)
              _buildDetailRow('Reviewed By', 'ID: ${report.reviewedById}'),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Text(
              '$label:',
              style: TextStyle(
                color: Colors.white70,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              value,
              style: TextStyle(
                color: Colors.white,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }
}