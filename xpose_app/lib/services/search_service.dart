import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';

import '../models/crime_report.dart';
import 'package:Xpose/models/crime_report_detail.dart';

class SearchService {
  static final String baseUrl = '${dotenv.env['API_BASE_URL']}';
  static final String wsUrl = '${dotenv.env['WS_BASE_URL']}' ?? 'http://192.168.220.2:8080';

  StompClient? _stompClient;
  Function(List<CrimeReport>)? onSearchResults;
  Function(Map<String, dynamic>)? onSearchStats;
  Function(Map<String, dynamic>)? onReportUpdates;
  bool _isConnected = false;

  Future<SearchResponse> searchReports({
    String? query,
    String? status,
    String? adminStatus,
    String? policeStatus,
    String? urgency,
    int page = 0,
    int size = 10,
  }) async {
    try {
      final params = <String, String>{
        'page': page.toString(),
        'size': size.toString(),
      };

      if (query != null && query.isNotEmpty) {
        params['query'] = query;
      }
      if (status != null) params['status'] = status;
      if (adminStatus != null) params['adminStatus'] = adminStatus;
      if (policeStatus != null) params['policeStatus'] = policeStatus;
      if (urgency != null) params['urgency'] = urgency;

      final uri = Uri.parse('$baseUrl/api/search/reports').replace(queryParameters: params);
      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return SearchResponse.fromJson(data);
      } else {
        throw Exception('Failed to search reports: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Search error: $e');
    }
  }

  Future<CrimeReportDetail> getReportDetails(String reportId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/reports/$reportId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = json.decode(response.body);
        return CrimeReportDetail.fromJson(responseData);
      } else if (response.statusCode == 404) {
        throw Exception('Report not found: $reportId');
      } else {
        throw Exception('Failed to load report details: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }

  void connectWebSocket({
    required Function(List<CrimeReport>) onResults,
    required Function(Map<String, dynamic>) onStats,
    required Function(Map<String, dynamic>) onUpdates,
  }) {
    this.onSearchResults = onResults;
    this.onSearchStats = onStats;
    this.onReportUpdates = onUpdates;

    _stompClient = StompClient(
      config: StompConfig(
        url: '${wsUrl.replaceFirst('http', 'ws')}/ws',
        onConnect: onConnect,
        onWebSocketError: (dynamic error) => print('WebSocket error: $error'),
        onStompError: (StompFrame frame) => print('STOMP error: ${frame.body}'),
        onDisconnect: (StompFrame frame) {
          print('Disconnected');
          _isConnected = false;
        },
        stompConnectHeaders: {},
        webSocketConnectHeaders: {},
      ),
    );

    _stompClient!.activate();
  }

  void onConnect(StompFrame frame) {
    print('Connected to WebSocket');
    _isConnected = true;

    _stompClient!.subscribe(
      destination: '/topic/search.results',
      callback: (StompFrame frame) {
        if (onSearchResults != null) {
          final data = jsonDecode(frame.body!);
          final reports = (data as List).map((item) => CrimeReport.fromJson(item)).toList();
          onSearchResults!(reports);
        }
      },
    );

    _stompClient!.subscribe(
      destination: '/topic/search.stats',
      callback: (StompFrame frame) {
        if (onSearchStats != null) {
          final stats = jsonDecode(frame.body!);
          onSearchStats!(stats);
        }
      },
    );

    _stompClient!.subscribe(
      destination: '/topic/report.updates',
      callback: (StompFrame frame) {
        if (onReportUpdates != null) {
          final update = jsonDecode(frame.body!);
          onReportUpdates!(update);
        }
      },
    );
  }

  void sendSearchQuery(String query, {Map<String, dynamic>? filters}) {
    if (!_isConnected || _stompClient == null) {
      print('WebSocket not connected. Cannot send search query.');
      return;
    }

    final searchRequest = {
      'query': query,
      'filters': filters ?? {},
    };

    _stompClient!.send(
      destination: '/app/search.reports',
      body: jsonEncode(searchRequest),
    );
  }

  void disconnect() {
    _isConnected = false;
    _stompClient?.deactivate();
    _stompClient = null;
  }

  bool get isConnected => _isConnected;
}

class SearchResponse {
  final bool success;
  final String message;
  final List<CrimeReport> results;
  final int totalResults;
  final int currentPage;
  final int pageSize;

  SearchResponse({
    required this.success,
    required this.message,
    required this.results,
    required this.totalResults,
    required this.currentPage,
    required this.pageSize,
  });

  factory SearchResponse.fromJson(Map<String, dynamic> json) {
    return SearchResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      results: (json['results'] as List? ?? [])
          .map((item) => CrimeReport.fromJson(item))
          .toList(),
      totalResults: json['totalResults'] ?? 0,
      currentPage: json['currentPage'] ?? 0,
      pageSize: json['pageSize'] ?? 10,
    );
  }
}