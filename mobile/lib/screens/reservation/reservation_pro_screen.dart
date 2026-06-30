import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../widgets/common_widgets.dart';

class ReservationProScreen extends StatelessWidget {
  const ReservationProScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: AppTheme.bgBlack,
        body: DarkBg(child: SafeArea(child: Column(children: [
          const TpAppBar(),
          Expanded(child: SingleChildScrollView(padding: const EdgeInsets.all(16), child: Column(children: [
            // Hero with person + tickets (amber/warm tone from design)
            Container(height: 200, decoration: BoxDecoration(borderRadius: BorderRadius.circular(16),
              gradient: const LinearGradient(colors: [Color(0xFF5C4A0F), Color(0xFF2A1F05)]),
              border: Border.all(color: const Color(0xFF8B6914))),
              child: Stack(children: [
                Center(child: Icon(Icons.card_travel, size: 90, color: Colors.amber.withValues(alpha: 0.2))),
                Positioned(right: 20, bottom: 20, child: Icon(Icons.confirmation_number, size: 50, color: AppTheme.primaryGreen.withValues(alpha: 0.4))),
              ])),
            const SizedBox(height: 20),
            _service(Icons.flight, "Service de reservation des billets d'avion"),
            const SizedBox(height: 12),
            _service(Icons.train, 'Service de reservation des billets de train'),
            const SizedBox(height: 12),
            _service(Icons.directions_bus, 'Service de reservation des billets de bus'),
          ]))),
        ]))),
      );

  Widget _service(IconData ic, String title) => Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: AppTheme.bgCard, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppTheme.cardBorder)),
      child: Row(children: [
        Container(width: 80, height: 80, decoration: BoxDecoration(color: Colors.black, borderRadius: BorderRadius.circular(14)),
          child: Icon(ic, color: AppTheme.textWhite, size: 40)),
        const SizedBox(width: 16),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
          Text(title, style: AppTheme.ts(size: 13, weight: FontWeight.w500), textAlign: TextAlign.center),
          const SizedBox(height: 10),
          SizedBox(width: double.infinity, height: 38,
            child: ElevatedButton(onPressed: () {},
              child: Text('Acheter', style: AppTheme.ts(weight: FontWeight.bold, size: 13)))),
        ])),
      ]));
}
