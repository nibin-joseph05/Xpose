
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/search_service.dart';
import '../models/crime_report.dart';

final searchServiceProvider = Provider<SearchService>((ref) {
  return SearchService();
});

final searchQueryProvider = StateProvider<String>((ref) => '');

final searchResultsProvider = StateNotifierProvider<SearchResultsNotifier, AsyncValue<List<CrimeReport>>>((ref) {
  final searchService = ref.watch(searchServiceProvider);
  return SearchResultsNotifier(searchService);
});

class SearchResultsNotifier extends StateNotifier<AsyncValue<List<CrimeReport>>> {
  final SearchService _searchService;

  SearchResultsNotifier(this._searchService) : super(const AsyncValue.data([]));

  Future<void> searchReports({
    String? query,
    String? status,
    String? adminStatus,
    String? policeStatus,
    String? urgency,
    int page = 0,
    int size = 10,
  }) async {
    state = const AsyncValue.loading();

    try {
      final response = await _searchService.searchReports(
        query: query,
        status: status,
        adminStatus: adminStatus,
        policeStatus: policeStatus,
        urgency: urgency,
        page: page,
        size: size,
      );

      state = AsyncValue.data(response.results);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  void updateResults(List<CrimeReport> results) {
    state = AsyncValue.data(results);
  }

  void clearResults() {
    state = const AsyncValue.data([]);
  }
}
