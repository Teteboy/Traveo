import 'package:flutter/material.dart';
import '../theme/app_theme.dart';


class OuvertureScreen extends StatefulWidget {
  const OuvertureScreen({super.key});
  @override State<OuvertureScreen> createState() => _OuvertureScreenState();
}

class _OuvertureScreenState extends State<OuvertureScreen> {
  final PageController _pageCtrl = PageController();
  int _currentPage = 0;

  final List<Map<String, dynamic>> _pages = [
    {
      'title': 'Discover the World',
      'subtitle': 'Explore thousands of destinations hand-picked by our travel experts just for you.',
      'icon': Icons.travel_explore_rounded,
      'gradient': [Color(0xFF0D3B22), Color(0xFF1A6B42)],
    },
    {
      'title': 'Plan Your Journey',
      'subtitle': 'Use our AI assistant to build the perfect itinerary tailored to your budget and style.',
      'icon': Icons.route_rounded,
      'gradient': [Color(0xFF0A2E3F), Color(0xFF0D5E4A)],
    },
    {
      'title': 'Book with Confidence',
      'subtitle': 'Secure bookings, 24/7 support, and the best prices guaranteed. Your adventure awaits!',
      'icon': Icons.verified_rounded,
      'gradient': [Color(0xFF0D1F3B), Color(0xFF0D4A3B)],
    },
  ];

  @override
  void dispose() { _pageCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(children: [
        // Background – dark-green gradient per design
        Positioned.fill(child: Container(
          decoration: const BoxDecoration(gradient: AppColors.gradientBackground))),

        SafeArea(child: Column(children: [
          // Top row: Logo + Skip
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(children: [
              // Real logo + name
              Row(children: [
                ColorFiltered(
                colorFilter: AppColors.logoGreenFilter,
                child: Image.asset('assets/images/Logo.png', width: 32, height: 32,
                  errorBuilder: (_, __, ___) =>
                      const Icon(Icons.flight_rounded, color: AppColors.primary, size: 28))),
                const SizedBox(width: 8),
                const Text('Traveo', style: TextStyle(color: AppColors.primary,
                    fontWeight: FontWeight.w900, fontSize: 20, letterSpacing: -0.3)),
              ]),
              const Spacer(),
              TextButton(
                onPressed: () => Navigator.of(context).pushReplacementNamed('/auth'),
                child: Text('Skip', style: TextStyle(
                    color: AppColors.textMuted,
                    fontWeight: FontWeight.w600, fontSize: 15))),
            ])),

          // Page view
          Expanded(child: PageView.builder(
            controller: _pageCtrl,
            onPageChanged: (i) => setState(() => _currentPage = i),
            itemCount: _pages.length,
            itemBuilder: (_, i) {
              final p = _pages[i];
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32),
                child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  // Big logo for page 0, styled icon circle for others
                  i == 0
                    ? Column(children: [
                        ColorFiltered(
                        colorFilter: AppColors.logoGreenFilter,
                        child: Image.asset('assets/images/Logo.png', width: 160, height: 160,
                          errorBuilder: (_, __, ___) => Container(
                            width: 160, height: 160,
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.08),
                              shape: BoxShape.circle),
                            child: const Icon(Icons.flight_rounded,
                                color: AppColors.primary, size: 80)))),
                      ])
                    : Container(
                        width: 160, height: 160,
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.06),
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.primary.withValues(alpha: 0.3), width: 2)),
                        child: Icon(p['icon'] as IconData,
                            color: AppColors.primary, size: 72)),

                  const SizedBox(height: 40),
                  Text(p['title'] as String,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w900,
                        color: AppColors.textWhite)),
                  const SizedBox(height: 16),
                  Text(p['subtitle'] as String,
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 16,
                        color: AppColors.textMuted, height: 1.6)),
                ]));
            })),

          // Dots
          Row(mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(_pages.length, (i) => AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              margin: const EdgeInsets.symmetric(horizontal: 4),
              width: _currentPage == i ? 24 : 8, height: 8,
              decoration: BoxDecoration(
                color: _currentPage == i ? AppColors.primary : Colors.white.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(4))))),

          const SizedBox(height: 40),

          // Button
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 0, 24, 36),
            child: GestureDetector(
              onTap: () {
                if (_currentPage < _pages.length - 1) {
                  _pageCtrl.nextPage(duration: const Duration(milliseconds: 400),
                      curve: Curves.easeInOut);
                } else {
                  Navigator.of(context).pushReplacementNamed('/auth');
                }
              },
              child: Container(
                height: 58,
                decoration: BoxDecoration(
                  color: AppColors.primaryDark,
                  borderRadius: BorderRadius.circular(18)),
                child: Center(child: Text(
                  _currentPage < _pages.length - 1 ? 'Next' : 'Get Started',
                  style: const TextStyle(color: AppColors.textWhite,
                      fontWeight: FontWeight.w800, fontSize: 17))))),
          ),
        ])),
      ]),
    );
  }
}
