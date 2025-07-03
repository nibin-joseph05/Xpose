import 'package:flutter/material.dart';
import 'package:Xpose/services/news_service.dart';
import 'dart:async';

class HomeNews extends StatefulWidget {
  const HomeNews({super.key});

  @override
  State<HomeNews> createState() => _HomeNewsState();
}

class _HomeNewsState extends State<HomeNews> {
  List<dynamic> newsArticles = [];
  bool isLoading = true;
  final ScrollController _scrollController = ScrollController();
  Timer? _timer;
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    loadNews();
    _startAutoScroll();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _scrollController.dispose();
    super.dispose();
  }

  void _startAutoScroll() {
    _timer = Timer.periodic(const Duration(seconds: 5), (timer) {
      if (_scrollController.hasClients && newsArticles.isNotEmpty) {
        final double maxScrollExtent = _scrollController.position.maxScrollExtent;
        final double itemWidth = 280 + 12;

        if (_currentPage * itemWidth + itemWidth < maxScrollExtent) {
          _currentPage++;
        } else {
          _currentPage = 0;
        }

        _scrollController.animateTo(
          _currentPage * itemWidth,
          duration: const Duration(milliseconds: 800),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _stopAutoScroll() {
    _timer?.cancel();
  }

  Future<void> loadNews() async {
    try {
      final articles = await NewsService.getKeralaNews();
      setState(() {
        newsArticles = articles;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Kerala News',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 200,
          child: isLoading
              ? const Center(
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Colors.white70),
            ),
          )
              : Listener(
            onPointerDown: (_) => _stopAutoScroll(),
            onPointerUp: (_) => _startAutoScroll(),
            onPointerCancel: (_) => _startAutoScroll(),
            child: ListView.builder(
              controller: _scrollController,
              scrollDirection: Axis.horizontal,
              itemCount: newsArticles.length,
              itemBuilder: (context, index) {
                final article = newsArticles[index];
                return _buildNewsCard(article);
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildNewsCard(dynamic article) {
    final String title = article['title'] ?? 'No Title Available';
    final String imageUrl = article['urlToImage'] ?? '';

    return Container(
      width: 280,
      margin: const EdgeInsets.only(right: 12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.white.withOpacity(0.1),
            offset: const Offset(-4, -4),
            blurRadius: 8,
            spreadRadius: 1,
          ),
          BoxShadow(
            color: Colors.black.withOpacity(0.4),
            offset: const Offset(4, 4),
            blurRadius: 8,
            spreadRadius: 1,
          ),
        ],
      ),
      child: Column(
        children: [
          Expanded(
            flex: 3,
            child: imageUrl.isNotEmpty
                ? ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              child: Image.network(
                imageUrl,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    width: double.infinity,
                    color: Colors.grey[800],
                    child: const Center(
                      child: Icon(Icons.broken_image, color: Colors.white54, size: 40),
                    ),
                  );
                },
              ),
            )
                : ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              child: Container(
                width: double.infinity,
                color: Colors.grey[800],
                child: const Center(
                  child: Icon(Icons.image_not_supported, color: Colors.white54, size: 40),
                ),
              ),
            ),
          ),
          Expanded(
            flex: 2,
            child: Padding(
              padding: const EdgeInsets.all(8),
              child: Align(
                alignment: Alignment.topLeft,
                child: Text(
                  title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}