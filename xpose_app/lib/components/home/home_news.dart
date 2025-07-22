import 'package:flutter/material.dart';
import 'package:Xpose/services/news_service.dart';
import 'package:url_launcher/url_launcher.dart';
import 'dart:async';

class HomeNews extends StatefulWidget {
  const HomeNews({super.key});

  @override
  State<HomeNews> createState() => _HomeNewsState();
}

class _HomeNewsState extends State<HomeNews> {
  List<dynamic> newsArticles = [];
  bool isLoading = true;
  bool hasError = false;
  final ScrollController _scrollController = ScrollController();
  Timer? _timer;
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    loadNews();
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
        final double itemWidth = 300 + 16;

        if (_currentPage * itemWidth < maxScrollExtent - itemWidth / 2) {
          _currentPage++;
        } else {
          _currentPage = 0;
        }

        _scrollController.animateTo(
          _currentPage * itemWidth,
          duration: const Duration(milliseconds: 800),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  Future<void> loadNews() async {
    try {
      final articles = await NewsService.getIndiaTopHeadlines();
      setState(() {
        newsArticles = articles;
        isLoading = false;
        hasError = false;
      });

      if (newsArticles.isNotEmpty) {
        _startAutoScroll();
      }
    } catch (e) {
      setState(() {
        isLoading = false;
        hasError = true;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load news: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 8.0),
          child: Text(
            'Latest News',
            style: theme.textTheme.headlineSmall?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.5,
            ),
          ),
        ),
        const SizedBox(height: 20),
        SizedBox(
          height: 240,
          child: _buildContent(theme),
        ),
      ],
    );
  }

  Widget _buildContent(ThemeData theme) {
    if (isLoading) {
      return Center(
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(theme.colorScheme.secondary),
        ),
      );
    }

    if (hasError) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, color: Colors.white54, size: 40),
            const SizedBox(height: 10),
            Text(
              'Failed to load news',
              style: theme.textTheme.bodyLarge?.copyWith(color: Colors.white70),
            ),
            const SizedBox(height: 10),
            ElevatedButton(
              onPressed: loadNews,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (newsArticles.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.article_outlined, color: Colors.white54, size: 40),
            const SizedBox(height: 10),
            Text(
              'No news available',
              style: theme.textTheme.bodyLarge?.copyWith(color: Colors.white70),
            ),
            const SizedBox(height: 10),
            ElevatedButton(
              onPressed: loadNews,
              child: const Text('Refresh'),
            ),
          ],
        ),
      );
    }

    return Listener(
      onPointerDown: (_) => _timer?.cancel(),
      onPointerUp: (_) => _startAutoScroll(),
      onPointerCancel: (_) => _startAutoScroll(),
      child: ListView.builder(
        controller: _scrollController,
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: newsArticles.length,
        itemBuilder: (context, index) {
          final article = newsArticles[index];
          return _buildNewsCard(article, theme);
        },
      ),
    );
  }

  Widget _buildNewsCard(dynamic article, ThemeData theme) {
    final String title = article['title']?.toString() ?? 'No Title Available';
    final String imageUrl = article['urlToImage']?.toString() ?? '';
    final String source = article['source'] is Map
        ? article['source']['name']?.toString() ?? 'Unknown Source'
        : 'Unknown Source';

    String date = '';
    try {
      if (article['publishedAt'] != null) {
        date = DateTime.parse(article['publishedAt'].toString())
            .toLocal()
            .toString()
            .substring(0, 10);
      }
    } catch (e) {
      date = 'Date unknown';
    }

    final String url = article['url']?.toString() ?? '';

    return GestureDetector(
      onTap: () async {
        if (url.isNotEmpty) {
          if (await canLaunchUrl(Uri.parse(url))) {
            await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Could not open the article')),
            );
          }
        }
      },
      child: Container(
        width: 300,
        margin: const EdgeInsets.only(right: 16),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 12,
              spreadRadius: 2,
              offset: const Offset(4, 4),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              flex: 6,
              child: _buildImageSection(imageUrl, source, date, theme),
            ),

            Expanded(
              flex: 4,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodyLarge?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        height: 1.3,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImageSection(
      String imageUrl, String source, String date, ThemeData theme) {
    return Stack(
      children: [
        Container(
          width: double.infinity,
          color: Colors.grey[800],
          child: imageUrl.isNotEmpty
              ? Image.network(
            imageUrl,
            fit: BoxFit.cover,
            loadingBuilder: (context, child, loadingProgress) {
              if (loadingProgress == null) return child;
              return Center(
                child: CircularProgressIndicator(
                  value: loadingProgress.expectedTotalBytes != null
                      ? loadingProgress.cumulativeBytesLoaded /
                      loadingProgress.expectedTotalBytes!
                      : null,
                  strokeWidth: 1,
                ),
              );
            },
            errorBuilder: (context, error, stackTrace) {
              return _buildPlaceholderIcon();
            },
          )
              : _buildPlaceholderIcon(),
        ),

        Container(
          width: double.infinity,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Colors.transparent,
                Colors.black.withOpacity(0.7),
              ],
            ),
          ),
        ),

        Positioned(
          bottom: 8,
          left: 12,
          right: 12,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Flexible(
                child: Text(
                  source,
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: Colors.white.withOpacity(0.9),
                    fontWeight: FontWeight.w500,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Text(
                date,
                style: theme.textTheme.labelSmall?.copyWith(
                  color: Colors.white.withOpacity(0.7),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPlaceholderIcon() {
    return const Center(
      child: Icon(
        Icons.article,
        color: Colors.white30,
        size: 40,
      ),
    );
  }
}