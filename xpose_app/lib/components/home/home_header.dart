import 'package:flutter/material.dart';
import 'package:flutter/animation.dart';
import 'package:Xpose/components/home/home_notification.dart';

class HomeHeader extends StatefulWidget {
  const HomeHeader({super.key});

  @override
  State<HomeHeader> createState() => _HomeHeaderState();
}

class _HomeHeaderState extends State<HomeHeader>
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
                    delegate: CustomSearchDelegate(),
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
              unreadCount: 3,
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const HomeNotification(),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class CustomSearchDelegate extends SearchDelegate {
  @override
  List<Widget>? buildActions(BuildContext context) {
    return [
      IconButton(
        icon: const Icon(Icons.clear),
        onPressed: () {
          query = '';
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
    return Center(
      child: Text(
        'Search results for: $query',
        style: const TextStyle(color: Colors.white),
      ),
    );
  }

  @override
  Widget buildSuggestions(BuildContext context) {
    return ListView.builder(
      itemCount: 5,
      itemBuilder: (context, index) {
        return ListTile(
          leading: const Icon(Icons.history, color: Colors.white70),
          title: Text(
            'Search suggestion ${index + 1}',
            style: const TextStyle(color: Colors.white),
          ),
          onTap: () {
            query = 'Search suggestion ${index + 1}';
            showResults(context);
          },
        );
      },
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
      ),
    );
  }
}