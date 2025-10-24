import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:Xpose/providers/search_provider.dart';
import 'package:Xpose/models/crime_report.dart';
import 'package:Xpose/services/search_service.dart';
import 'package:Xpose/report_details/report_details_page.dart';
import 'package:intl/intl.dart';

class ReportSearchPage extends ConsumerStatefulWidget {
  const ReportSearchPage({super.key});

  @override
  ConsumerState<ReportSearchPage> createState() => _ReportSearchPageState();
}

class _ReportSearchPageState extends ConsumerState<ReportSearchPage> {
  final TextEditingController _searchController = TextEditingController();
  bool _isSearching = false;
  late SearchService _searchService;

  @override
  void initState() {
    super.initState();
    _searchService = ref.read(searchServiceProvider);
    _connectWebSocket();
  }

  void _connectWebSocket() {
    final searchService = ref.read(searchServiceProvider);

    searchService.connectWebSocket(
      onResults: (List<CrimeReport> results) {
        print('WebSocket results: ${results.length}');
        ref.read(searchResultsProvider.notifier).updateResults(results);
      },
      onStats: (Map<String, dynamic> stats) {
        print('Search stats: $stats');
      },
      onUpdates: (Map<String, dynamic> update) {
        print('Report update received: $update');
        _handleReportUpdate(update);
      },
    );
  }

  void _handleReportUpdate(Map<String, dynamic> update) {
    final String reportId = update['reportId'];
    final String updateType = update['updateType'];

    if (updateType == 'ADMIN_STATUS_CHANGED') {
      final String newAdminStatus = update['adminStatus'];

      final currentState = ref.read(searchResultsProvider);

      if (currentState is AsyncData<List<CrimeReport>>) {
        final currentResults = currentState.value;
        final updatedResults = currentResults.map((report) {
          if (report.reportId == reportId) {
            return report.copyWith(adminStatus: newAdminStatus);
          }
          return report;
        }).toList();

        ref.read(searchResultsProvider.notifier).updateResults(updatedResults);
        print('Updated admin status for report $reportId to $newAdminStatus');
      }
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    _searchService.disconnect();
    super.dispose();
  }

  void _performSearch(String searchQuery) {
    if (searchQuery.isNotEmpty && !_isSearching) {
      _isSearching = true;



      Future.delayed(const Duration(milliseconds: 500), () {
        if (_searchService.isConnected) {
          _searchService.sendSearchQuery(searchQuery);
        } else {
          print('WebSocket still not connected, retrying...');
          _connectWebSocket();
        }
      });

      _isSearching = false;
    }
  }

  void _clearSearch() {
    _searchController.clear();
    ref.read(searchResultsProvider.notifier).clearResults();
  }

  @override
  Widget build(BuildContext context) {
    final currentQuery = ref.watch(searchQueryProvider);



    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.surface,
        title: TextField(
          controller: _searchController,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            hintText: 'Search Report by ID',
            hintStyle: TextStyle(color: Colors.white70),
            border: InputBorder.none,
            focusedBorder: InputBorder.none,
            enabledBorder: InputBorder.none,
            suffixIcon: currentQuery.isNotEmpty
                ? IconButton(
              icon: const Icon(Icons.clear, color: Colors.white70),
              onPressed: _clearSearch,
            )
                : null,
          ),
          onChanged: (value) {
            ref.read(searchQueryProvider.notifier).state = value;
            if (value.isEmpty) {
              _clearSearch();
            } else {

              _performSearch(value);
            }
          },
          onSubmitted: _performSearch,
          textInputAction: TextInputAction.search,
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        elevation: 0,
      ),
      body: currentQuery.isEmpty
          ? _buildInitialSuggestions(context)
          : Consumer(
        builder: (context, ref, child) {
          final searchResults = ref.watch(searchResultsProvider);

          return searchResults.when(
            loading: () => _buildLoadingState(),
            error: (error, stack) => _buildErrorState(error),
            data: (results) => _buildSearchResults(results, context),
          );
        },
      ),
    );
  }


  Widget _buildInitialSuggestions(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Search Report by ID',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 16),
          Text(
            'Enter your Report ID to find your submission',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 14,
            ),
          ),
          SizedBox(height: 20),
          Container(
            padding: EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.blueAccent.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.blueAccent.withOpacity(0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.info_outline_rounded, color: Colors.blueAccent, size: 20),
                    SizedBox(width: 8),
                    Text(
                      'Where to find your Report ID?',
                      style: TextStyle(
                        color: Colors.blueAccent,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 12),
                _buildInfoStep(1, 'After submitting a report, you will receive a confirmation'),
                _buildInfoStep(2, 'Your unique Report ID will be displayed (e.g., Xpose-7JYP)'),
                _buildInfoStep(3, 'You can also find it in the PDF receipt you saved'),
                _buildInfoStep(4, 'Enter the exact Report ID to search for your submission'),
              ],
            ),
          ),
          SizedBox(height: 24),
          Text(
            'Need help?',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
          SizedBox(height: 12),
          Container(
            padding: EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.orangeAccent.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.orangeAccent.withOpacity(0.3)),
            ),
            child: Row(
              children: [
                Icon(Icons.help_outline_rounded, color: Colors.orangeAccent, size: 16),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'If you lost your Report ID, please submit a new report and save the ID carefully',
                    style: TextStyle(
                      color: Colors.orangeAccent,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoStep(int step, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 20,
            height: 20,
            decoration: BoxDecoration(
              color: Colors.blueAccent,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                step.toString(),
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                color: Colors.white70,
                fontSize: 12,
              ),
            ),
          ),
        ],
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
            'Searching for your report...',
            style: TextStyle(color: Colors.white70, fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(dynamic error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline_rounded, color: Colors.orangeAccent, size: 48),
          SizedBox(height: 16),
          Text(
            'Search Failed',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Please check your connection and try again',
            style: TextStyle(color: Colors.white70, fontSize: 14),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              _performSearch(_searchController.text);
            },
            child: Text('Try Again'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blueAccent,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchResults(List<CrimeReport> results, BuildContext context) {
    if (results.isEmpty) {
      return _buildNoResults(context);
    }

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              Icon(Icons.check_circle_rounded, color: Colors.greenAccent, size: 18),
              SizedBox(width: 8),
              Text(
                'Report found!',
                style: TextStyle(
                  color: Colors.greenAccent,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: results.length,
            itemBuilder: (context, index) {
              final report = results[index];
              return _buildReportCard(report, context);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildNoResults(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.search_off_rounded, color: Colors.grey[500], size: 64),
          SizedBox(height: 16),
          Text(
            'Report Not Found',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 12),
          Container(
            padding: EdgeInsets.all(16),
            margin: EdgeInsets.symmetric(horizontal: 32),
            decoration: BoxDecoration(
              color: Colors.redAccent.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.redAccent.withOpacity(0.3)),
            ),
            child: Column(
              children: [
                Text(
                  'No report found with ID: "${_searchController.text}"',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: 12),
                Text(
                  'Please check:',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                SizedBox(height: 8),
                _buildCheckItem('Report ID is entered exactly as received'),
                _buildCheckItem('No extra spaces before or after the ID'),
                _buildCheckItem('Case sensitivity (IDs are case-sensitive)'),
                _buildCheckItem('The report was successfully submitted'),
              ],
            ),
          ),
          SizedBox(height: 20),
          Text(
            'If you cannot find your report, you may need to:',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 12,
            ),
          ),
          SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _buildActionChip('Submit a new report', Icons.add, context),
              _buildActionChip('Check your saved PDF', Icons.picture_as_pdf, context),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCheckItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.circle, size: 6, color: Colors.redAccent),
          SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                color: Colors.white70,
                fontSize: 11,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionChip(String text, IconData icon, BuildContext context) {
    return GestureDetector(
      onTap: () {
        if (text.contains('new report')) {
          Navigator.of(context).pop();

        }
      },
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.blueAccent.withOpacity(0.2),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.blueAccent.withOpacity(0.5)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: Colors.blueAccent),
            SizedBox(width: 6),
            Text(
              text,
              style: TextStyle(
                color: Colors.blueAccent,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReportCard(CrimeReport report, BuildContext context) {
    Color getColorForStatus(String status) {
      switch (status) {
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

    String getStatusDisplayName(String status) {
      return status.replaceAll('_', ' ').toLowerCase();
    }

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
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
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: Colors.white,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ReportDetailsPage(reportId: report.reportId),
                      ),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.blueAccent.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.blueAccent),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'View Details',
                          style: TextStyle(
                            color: Colors.blueAccent,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(width: 4),
                        Icon(Icons.arrow_forward_rounded, size: 12, color: Colors.blueAccent),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Status Overview',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                SizedBox(height: 8),
                _buildStatusRow('Admin Status', report.adminStatus, getColorForStatus),
                SizedBox(height: 4),
                _buildStatusRow('Police Status', report.policeStatus, getColorForStatus),
                SizedBox(height: 4),
                _buildStatusRow('Report Status', report.status, getColorForStatus),
              ],
            ),
            SizedBox(height: 12),
            Divider(color: Colors.white.withOpacity(0.3)),
            SizedBox(height: 8),
            Text(
              'Crime Type: ${report.crimeType}',
              style: TextStyle(
                color: Colors.white.withOpacity(0.8),
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
            SizedBox(height: 6),
            Text(
              'Location: ${report.city}, ${report.state}',
              style: TextStyle(
                color: Colors.white.withOpacity(0.8),
                fontSize: 12,
              ),
            ),
            SizedBox(height: 6),
            Text(
              'Police Station: ${report.policeStation.isNotEmpty ? report.policeStation : 'Not Assigned'}',
              style: TextStyle(
                color: Colors.white.withOpacity(0.8),
                fontSize: 12,
              ),
            ),
            SizedBox(height: 6),
            Text(
              'Submitted: ${DateFormat('MMM dd, yyyy').format(report.submittedAt)}',
              style: TextStyle(
                color: Colors.white.withOpacity(0.7),
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusRow(String label, String status, Color Function(String) colorGetter) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: colorGetter(status),
            shape: BoxShape.circle,
          ),
        ),
        SizedBox(width: 8),
        Text(
          '$label: ',
          style: TextStyle(
            color: Colors.white70,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
        Text(
          status.replaceAll('_', ' ').toLowerCase(),
          style: TextStyle(
            color: colorGetter(status),
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}