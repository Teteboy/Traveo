import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../widgets/common_widgets.dart';

class AccueilProScreen extends StatelessWidget {
  const AccueilProScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: AppTheme.bgBlack,
        body: DarkBg(child: SafeArea(child: Column(children: [
          // AppBar: search left, logo center, settings+notif right
          Padding(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(children: [
              const Icon(Icons.search, color: AppTheme.primaryGreen, size: 26),
              const Spacer(),
              Row(mainAxisSize: MainAxisSize.min, children: [
                const Icon(Icons.flight_takeoff, color: AppTheme.primaryGreen, size: 20),
                const SizedBox(width: 6),
                Text('Traveo', style: AppTheme.ts(size: 18, weight: FontWeight.bold, color: AppTheme.primaryGreen)),
              ]),
              const Spacer(),
              const Icon(Icons.settings, color: AppTheme.primaryGreen, size: 24),
              const SizedBox(width: 8),
              const NotifBell(),
              const SizedBox(width: 6),
            ])),
          Expanded(child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const SectionHeader('Nom Section'),
              const SizedBox(height: 12),

              // Video banner
              Container(height: 200,
                decoration: BoxDecoration(borderRadius: BorderRadius.circular(16),
                  gradient: const LinearGradient(colors: [Color(0xFF0B3D6B), Color(0xFF051A2E)]),
                  border: Border.all(color: AppTheme.cardBorder)),
                child: Stack(children: [
                  Center(child: Icon(Icons.flight, size: 100, color: Colors.blueAccent.withValues(alpha: 0.15))),
                  Center(child: Container(width: 52, height: 52,
                    decoration: BoxDecoration(color: AppTheme.primaryGreen.withValues(alpha: 0.35), shape: BoxShape.circle),
                    child: const Icon(Icons.play_arrow, color: AppColors.textDark, size: 28))),
                ])),
              const SizedBox(height: 20),

              // Agency logo grid
              SizedBox(height: 130, child: ListView.separated(
                scrollDirection: Axis.horizontal, itemCount: 4,
                separatorBuilder: (_, __) => const SizedBox(width: 12),
                itemBuilder: (_, i) => _logoCard(i),
              )),
              const SizedBox(height: 24),

              const SectionHeader('Nom Section'),
              const SizedBox(height: 12),
              const AgencyCard(name: 'Horizon Travel Agency', description: 'Specializing in guided tours, hotel bookings, and adventure trips across the region.', points: 5.0, stars: 3),
              const AgencyCard(name: 'Horizon Travel Agency', description: 'Specializing in guided tours, hotel bookings, and adventure trips across the region.', points: 3.0, stars: 3),
              const AgencyCard(name: 'Horizon Travel Agency', description: 'Specializing in guided tours, hotel bookings, and adventure trips across the region.', points: 1.0, stars: 1, isActive: false),
              const AgencyCard(name: 'Horizon Travel Agency', description: 'Guided hikes, cultural tours, and adventure packages for all skill levels.', points: 1.0, stars: 1, isActive: false),
            ]),
          )),
        ]))),
      );

  Widget _logoCard(int i) {
    final icons = [Icons.travel_explore, Icons.luggage, Icons.airplanemode_active, Icons.beach_access];
    final labels = ["World Travel", "Go Travel", "Travel Good", "Travel & Tour"];
    return SizedBox(width: 115, child: Column(children: [
      Expanded(child: Container(
        decoration: BoxDecoration(color: AppTheme.bgCard, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppTheme.cardBorder)),
        child: Center(child: Icon(icons[i], color: AppTheme.primaryGreen, size: 36)))),
      const SizedBox(height: 6),
      Text(labels[i], style: AppTheme.ts(size: 11, weight: FontWeight.w600), maxLines: 1, overflow: TextOverflow.ellipsis),
      Text("lle nom de l'age", style: AppTheme.ts(size: 10, color: AppTheme.textGrey)),
    ]));
  }
}
