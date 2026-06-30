import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../widgets/common_widgets.dart';

class GestionScreen extends StatelessWidget {
  const GestionScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: AppTheme.bgBlack,
        body: DarkBg(child: SafeArea(child: Column(children: [
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
            padding: const EdgeInsets.all(16),
            child: Column(children: [
              // Hero management banner (amber/orange tone from design)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  gradient: const LinearGradient(colors: [Color(0xFF5C3D0A), Color(0xFF2A1A05)]),
                  border: Border.all(color: const Color(0xFF8B5E1A))),
                child: Row(children: [
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Titre', style: AppTheme.ts(size: 22, weight: FontWeight.bold)),
                    Text('Analyse de nom de la fontion', style: AppTheme.ts(size: 13, weight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text('Service de reservatio des billets d\'avion', style: AppTheme.ts(size: 12, color: AppTheme.textGrey)),
                    const SizedBox(height: 14),
                    SizedBox(width: 110, height: 38,
                      child: ElevatedButton(onPressed: () {},
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF3A2008), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8), side: const BorderSide(color: AppColors.textDark))),
                        child: Text('Gérer', style: AppTheme.ts(weight: FontWeight.bold)))),
                  ])),
                  const SizedBox(width: 12),
                  Icon(Icons.luggage, size: 80, color: Colors.amber.withValues(alpha: 0.5)),
                ]),
              ),
              const SizedBox(height: 20),

              // 2-column grid
              GridView.builder(
                shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 0.75),
                itemCount: 4,
                itemBuilder: (_, i) => _gridCard(i, i < 2)),
            ]),
          )),
        ]))),
      );

  Widget _gridCard(int i, bool active) {
    final icons = [Icons.flight, Icons.local_shipping, Icons.person, Icons.public];
    final a = active ? 1.0 : 0.4;
    return Container(
      decoration: BoxDecoration(color: AppTheme.bgCard.withValues(alpha: active ? 1 : 0.4), borderRadius: BorderRadius.circular(16), border: Border.all(color: AppTheme.cardBorder.withValues(alpha: a))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Expanded(child: Container(
          decoration: BoxDecoration(color: AppTheme.bgMid.withValues(alpha: a), borderRadius: const BorderRadius.vertical(top: Radius.circular(16))),
          child: Center(child: Icon(icons[i], size: 60, color: AppTheme.primaryGreen.withValues(alpha: a))))),
        Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Titre', style: AppTheme.ts(size: 16, weight: FontWeight.bold, color: AppTheme.textWhite.withValues(alpha: a))),
          const SizedBox(height: 4),
          Text('Service de reservatio des billets d\'avion', style: AppTheme.ts(size: 11, color: AppTheme.textGrey.withValues(alpha: a)), maxLines: 2),
          const SizedBox(height: 10),
          SizedBox(width: double.infinity, height: 34,
            child: ElevatedButton(onPressed: active ? () {} : null,
              style: ElevatedButton.styleFrom(backgroundColor: active ? AppTheme.primaryGreen : AppTheme.bgMid, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
              child: Text('Gérer', style: AppTheme.ts(size: 12, weight: FontWeight.bold)))),
        ])),
      ]),
    );
  }
}
