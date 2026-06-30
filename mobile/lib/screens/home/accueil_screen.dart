import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../widgets/common_widgets.dart';

class AccueilScreen extends StatelessWidget {
  const AccueilScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: AppTheme.bgBlack,
    body: _bg(child: SafeArea(child: Column(children: [
      const TpAppBar(),
      _searchBar(),
      Expanded(child: SingleChildScrollView(padding: const EdgeInsets.fromLTRB(16,8,16,16), child: Column(children: [
        _heroBanner(),
        const SizedBox(height: 20),
        _thumbRow(),
        const SizedBox(height: 24),
        const SectionHeader('Agences Recommandées'),
        const SizedBox(height: 12),
        const AgencyCard(name: 'Agence Voyage Plus', description: 'Spécialiste des voyages sur mesure en Afrique et Europe.', points: 5.0, stars: 3),
        const AgencyCard(name: 'Travel Expert', description: 'Réservations de billets d\'avion, train et bus partout dans le monde.', points: 3.0, stars: 3),
        const AgencyCard(name: 'World Tours', description: 'Tours et excursions dans le monde entier à prix compétitifs.', points: 1.0, stars: 1, isActive: false),
        const AgencyCard(name: 'Safari Dreams', description: 'Safaris et aventures en Afrique centrale.', points: 1.0, stars: 1, isActive: false),
      ]))),
    ]))),
  );

  Widget _searchBar() => Padding(
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
    child: Container(
      height: 44,
      decoration: BoxDecoration(color: AppTheme.bgCard.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(22), border: Border.all(color: AppTheme.cardBorder)),
      child: Row(children: [
        const SizedBox(width: 16),
        Expanded(child: TextField(style: AppTheme.ts(size: 13),
          decoration: InputDecoration(hintText: 'Rechercher...', hintStyle: AppTheme.ts(size: 13, color: AppTheme.textGrey),
            border: InputBorder.none, enabledBorder: InputBorder.none, focusedBorder: InputBorder.none, contentPadding: EdgeInsets.zero))),
        const Icon(Icons.search, color: AppTheme.primaryGreen, size: 22),
        const SizedBox(width: 12),
      ]),
    ),
  );

  Widget _heroBanner() => Container(
    height: 200,
    decoration: BoxDecoration(borderRadius: BorderRadius.circular(16),
      gradient: const LinearGradient(colors: [Color(0xFF0E4025), AppColors.bgDark]),
      border: Border.all(color: AppTheme.cardBorder)),
    child: Stack(children: [
      Center(child: Icon(Icons.flight, size: 90, color: AppTheme.primaryGreen.withValues(alpha: 0.1))),
      Center(child: Container(width: 48, height: 48,
        decoration: BoxDecoration(color: AppTheme.primaryGreen.withValues(alpha: 0.3), shape: BoxShape.circle),
        child: const Icon(Icons.play_arrow, color: AppColors.textDark, size: 26))),
      Positioned(bottom: 16, left: 16, child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Découvrez le Monde', style: AppTheme.ts(size: 16, weight: FontWeight.bold)),
        Text('Les meilleures offres de voyage', style: AppTheme.ts(size: 12, color: AppTheme.textGrey)),
      ])),
    ]),
  );

  Widget _thumbRow() {
    final items = [(Icons.hiking, 'Aventure'), (Icons.flight, 'Vol'), (Icons.hotel, 'Hôtel'), (Icons.card_travel, 'Voyage')];
    return SizedBox(height: 98, child: ListView.separated(
      scrollDirection: Axis.horizontal, itemCount: items.length,
      separatorBuilder: (_, __) => const SizedBox(width: 12),
      itemBuilder: (_, i) => Column(children: [
        Container(width: 74, height: 70,
          decoration: BoxDecoration(color: AppTheme.bgCard, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppTheme.cardBorder)),
          child: Icon(items[i].$1, color: AppTheme.primaryGreen, size: 30)),
        const SizedBox(height: 5),
        Text(items[i].$2, style: AppTheme.ts(size: 10, color: AppTheme.textGrey)),
      ]),
    ));
  }

  Widget _bg({required Widget child}) => Container(
    decoration: const BoxDecoration(gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter,
      colors: [AppTheme.bgMid, AppTheme.bgBlack], stops: [0.0, 0.4])), child: child);
}
