import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../widgets/common_widgets.dart';

class DiscoverDetailScreen extends StatelessWidget {
  const DiscoverDetailScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: AppTheme.bgBlack,
        body: Stack(children: [
          // Full-screen background image area
          Container(
            width: double.infinity,
            height: MediaQuery.of(context).size.height * 0.75,
            decoration: const BoxDecoration(
              gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter,
                colors: [Color(0xFF4A8A5C), Color(0xFF1A4D2E), AppTheme.bgBlack], stops: [0.0, 0.6, 1.0])),
            child: Center(child: Icon(Icons.luggage, size: 180, color: Colors.amber.withValues(alpha: 0.4))),
          ),

          SafeArea(child: Column(children: [
            // Top bar
            Padding(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(children: [
                const Icon(Icons.search, color: AppTheme.primaryGreen, size: 26),
                const Spacer(),
                const Icon(Icons.settings, color: AppTheme.primaryGreen, size: 24),
                const SizedBox(width: 8),
                const NotifBell(),
              ])),

            Expanded(child: Stack(children: [
              // Right action column
              Positioned(right: 12, top: 0, bottom: 150,
                child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  _actionBtn(Icons.thumb_up_outlined),
                  const SizedBox(height: 10),
                  _actionBtn(Icons.thumb_down_outlined),
                  const SizedBox(height: 10),
                  _actionBtn(Icons.chat_bubble_outline),
                  const SizedBox(height: 10),
                  _actionBtn(Icons.notification_add_outlined),
                  const SizedBox(height: 10),
                  _actionBtn(Icons.bookmark_border),
                  const SizedBox(height: 10),
                  _actionBtn(Icons.add_a_photo_outlined),
                ])),

              // Bottom info overlay
              Positioned(left: 0, right: 60, bottom: 0,
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter,
                      colors: [Colors.transparent, AppTheme.bgBlack.withValues(alpha: 0.9)])),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    // Avatar + name
                    Row(children: [
                      Container(width: 44, height: 44,
                        decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: AppTheme.primaryGreen, width: 2), color: AppTheme.bgCard),
                        child: const Icon(Icons.person, color: AppTheme.primaryGreen, size: 26)),
                      const SizedBox(width: 10),
                      Text("lle nom de l'age", style: AppTheme.ts(size: 15, weight: FontWeight.bold)),
                    ]),
                    const SizedBox(height: 8),
                    Text('Experience breathtaking landscapes, rich culture, and unforgettable adventures with our expert-guided tours and curated travel packages.',
                      style: AppTheme.ts(size: 12, color: AppTheme.textGrey)),
                    const SizedBox(height: 8),
                    Row(children: [
                      Row(children: List.generate(3, (_) => const Icon(Icons.star, color: Colors.amber, size: 14))),
                      const SizedBox(width: 4),
                      const Icon(Icons.star_half, color: Colors.amber, size: 14),
                      const Spacer(),
                      Text('3.0 Pts', style: AppTheme.ts(size: 13, weight: FontWeight.bold, color: AppTheme.primaryGreen)),
                    ]),
                  ]),
                )),
            ])),
          ])),

          // Back button
          Positioned(top: 50, left: 16,
            child: GestureDetector(onTap: () => Navigator.pop(context),
              child: Container(width: 36, height: 36, decoration: BoxDecoration(color: AppTheme.bgCard.withValues(alpha: 0.7), shape: BoxShape.circle),
                child: const Icon(Icons.arrow_back, color: AppTheme.textWhite, size: 20)))),
        ]),
      );

  Widget _actionBtn(IconData ic) => Container(
      width: 44, height: 44,
      decoration: BoxDecoration(color: AppTheme.primaryGreen.withValues(alpha: 0.85), borderRadius: BorderRadius.circular(10)),
      child: Icon(ic, color: AppColors.textDark, size: 20));
}
