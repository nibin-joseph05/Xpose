import 'package:flutter/material.dart';
import 'package:flutter/animation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:Xpose/components/home/home_notification.dart';
import 'package:Xpose/providers/notification_provider.dart';
import 'package:Xpose/providers/search_provider.dart';
import 'package:Xpose/models/crime_report.dart';
import 'package:Xpose/services/search_service.dart';

class HomeHeader extends ConsumerStatefulWidget {
  const HomeHeader({super.key});

  @override
  ConsumerState<HomeHeader> createState() => _HomeHeaderState();
}

class _HomeHeaderState extends ConsumerState<HomeHeader>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  final double _iconButtonSize = 48.0;
  final double _iconSize = 28.0;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    )..forward();
    _animation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutBack,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final notificationState = ref.watch(notificationProvider);

    return ScaleTransition(
      scale: _animation,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Image.asset(
            'assets/logo/xpose-logo-round.png',
            width: 48,
            height: 48,
          ),
          const SizedBox(width: 12),
          Text(
            'Xpose',
            style: Theme.of(context).textTheme.displayLarge?.copyWith(
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
          const Spacer(),
          SizedBox(
            width: _iconButtonSize,
            height: _iconButtonSize,
            child: Material(
              color: Theme.of(context).colorScheme.surface,
              shape: const CircleBorder(),
              elevation: 5,
              shadowColor: Colors.black.withOpacity(0.2),
              child: InkWell(
                onTap: () {
                  showSearch(
                    context: context,
                    delegate: CustomSearchDelegate(ref: ref),
                  );
                },
                customBorder: const CircleBorder(),
                child: Icon(Icons.search, size: _iconSize, color: Colors.white),
              ),
            ),
          ),
          const SizedBox(width: 8),
          SizedBox(
            width: _iconButtonSize,
            height: _iconButtonSize,
            child: HomeNotification(
              unreadCount: notificationState.unreadCount,
              onTap: () async {
                final notifier = ref.read(notificationProvider.notifier);
                await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => HomeNotification(
                      unreadCount: notificationState.unreadCount,
                    ),
                  ),
                );

                notifier.fetchUnreadCount();
                notifier.fetchNotifications();
              },
            ),
          ),
        ],
      ),
    );
  }
}

class CustomSearchDelegate extends SearchDelegate {
  final WidgetRef ref;
  bool _isSearching = false;
  late SearchService _searchService;

  CustomSearchDelegate({required this.ref}) {
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
  void close(BuildContext context, result) {
    _searchService.disconnect();
    super.close(context, result);
  }

  @override
  List<Widget>? buildActions(BuildContext context) {
    return [
      if (query.isNotEmpty)
        IconButton(
          icon: const Icon(Icons.clear),
          onPressed: () {
            query = '';
            ref.read(searchResultsProvider.notifier).clearResults();
          },
        ),
    ];
  }

  @override
  Widget? buildLeading(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.arrow_back),
      onPressed: () {
        close(context, null);
      },
    );
  }

  @override
  Widget buildResults(BuildContext context) {
    if (query.isEmpty) {
      return _buildInitialState(context);
    }

    _performSearch(query);

    return Consumer(
      builder: (context, ref, child) {
        final searchResults = ref.watch(searchResultsProvider);

        return searchResults.when(
          loading: () => _buildLoadingState(),
          error: (error, stack) => _buildErrorState(error),
          data: (results) => _buildSearchResults(results, context),
        );
      },
    );
  }

  @override
  Widget buildSuggestions(BuildContext context) {
    if (query.isEmpty) {
      return _buildInitialSuggestions(context);
    }

    _performSearch(query);

    return Consumer(
      builder: (context, ref, child) {
        final searchResults = ref.watch(searchResultsProvider);

        return searchResults.when(
          loading: () => _buildLoadingState(),
          error: (error, stack) => _buildErrorState(error),
          data: (results) => _buildSearchResults(results, context),
        );
      },
    );
  }

  void _performSearch(String searchQuery) {
    if (searchQuery.isNotEmpty && !_isSearching) {
      _isSearching = true;

      Future.microtask(() {
        ref.read(searchQueryProvider.notifier).state = searchQuery;
        Future.delayed(Duration(milliseconds: 500), () {
          if (_searchService.isConnected) {
            _searchService.sendSearchQuery(searchQuery);
          } else {
            print('WebSocket still not connected, retrying...');
            _connectWebSocket();
          }
        });

        _isSearching = false;
      });
    }
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
              _performSearch(query);
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
                  'No report found with ID: "$query"',
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
          // Navigate to report submission page
          // You might want to add navigation logic here
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
          return Colors.green;
        case 'REJECTED':
          return Colors.red;
        case 'PENDING':
        case 'PENDING_REVIEW':
          return Colors.orange;
        case 'IN_PROGRESS':
          return Colors.blue;
        default:
          return Colors.grey;
      }
    }

    String getStatusMessage(String status) {
      switch (status) {
        case 'ACCEPTED':
        case 'APPROVED':
          return 'Your report has been accepted and is being processed';
        case 'RESOLVED':
          return 'Your report has been resolved';
        case 'REJECTED':
          return 'Your report was rejected';
        case 'PENDING':
        case 'PENDING_REVIEW':
          return 'Your report is under review';
        case 'IN_PROGRESS':
          return 'Your report is being investigated';
        default:
          return 'Status: $status';
      }
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
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: getColorForStatus(report.adminStatus).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: getColorForStatus(report.adminStatus)),
                  ),
                  child: Text(
                    report.adminStatus.replaceAll('_', ' '),
                    style: TextStyle(
                      color: getColorForStatus(report.adminStatus),
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 12),
            Text(
              getStatusMessage(report.adminStatus),
              style: TextStyle(
                color: Colors.white.withOpacity(0.8),
                fontSize: 14,
              ),
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
              'Description:',
              style: TextStyle(
                color: Colors.white.withOpacity(0.7),
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
            SizedBox(height: 4),
            Text(
              report.originalDescription.length > 150
                  ? '${report.originalDescription.substring(0, 150)}...'
                  : report.originalDescription,
              style: TextStyle(
                color: Colors.white.withOpacity(0.6),
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInitialState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.receipt_long_rounded, size: 64, color: Colors.grey[600]),
          SizedBox(height: 16),
          Text(
            'Search Your Report',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Enter your Report ID to find your submission',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 14,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  @override
  ThemeData appBarTheme(BuildContext context) {
    final ThemeData theme = Theme.of(context);
    return theme.copyWith(
      appBarTheme: AppBarTheme(
        backgroundColor: theme.colorScheme.surface,
        titleTextStyle: theme.textTheme.titleLarge,
        iconTheme: theme.iconTheme.copyWith(color: Colors.white),
      ),
      inputDecorationTheme: InputDecorationTheme(
        hintStyle: theme.textTheme.bodyMedium?.copyWith(color: Colors.white70),
        border: InputBorder.none,
        focusedBorder: InputBorder.none,
        enabledBorder: InputBorder.none,
        errorBorder: InputBorder.none,
        disabledBorder: InputBorder.none,
        focusedErrorBorder: InputBorder.none,
      ),
    );
  }
}