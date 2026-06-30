import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class ProfileProScreen extends StatelessWidget {
  const ProfileProScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: AppTheme.bgBlack,
        body: Container(
          decoration: const BoxDecoration(gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [AppTheme.bgMid, AppTheme.bgBlack], stops: [0.0, 0.35])),
          child: SafeArea(child: SingleChildScrollView(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            // Banner with laptop/work image feel (teal tone)
            SizedBox(height: 200, child: Stack(children: [
              Container(height: 155, width: double.infinity,
                decoration: const BoxDecoration(gradient: LinearGradient(colors: [Color(0xFF0A3A5C), Color(0xFF051A2E)])),
                child: Stack(children: [
                  Center(child: Icon(Icons.laptop_mac, size: 80, color: Colors.blueAccent.withValues(alpha: 0.2))),
                  Positioned(right: 120, top: 20, child: Icon(Icons.landscape, size: 60, color: Colors.teal.withValues(alpha: 0.15))),
                ])),
              // Avatar on right side (from design)
              Positioned(bottom: 0, right: 20, child: Container(width: 95, height: 95,
                decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: AppTheme.primaryGreen, width: 3), color: AppTheme.bgCard),
                child: const Icon(Icons.person, color: AppTheme.primaryGreen, size: 54))),
            ])),

            Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Nke onya', style: AppTheme.ts(size: 24, weight: FontWeight.bold)),
                  Text('Trusted travel partner helping clients discover amazing destinations and book unforgettable experiences.',
                    style: AppTheme.ts(size: 11, color: AppTheme.textGrey)),
                ])),
                IconButton(icon: const Icon(Icons.edit, color: AppTheme.primaryGreen, size: 22), onPressed: () {}),
              ]),
              const SizedBox(height: 20),
              _section('Information personnelle', ['Addresse émail', 'Numéro de téléphone', 'Localisation', "Pays, ville d'origine"]),
              const SizedBox(height: 16),
              _section('Securité du compte', ['Addresse émail', 'Numéro de téléphone', 'Localisation']),
              const SizedBox(height: 16),
              _section('Parametre avancés', ['Addresse émail', 'Numéro de téléphone', 'Localisation', "Pays, ville d'origine"]),
              const SizedBox(height: 28),
            ])),
          ]))),
        ),
      );

  Widget _section(String title, List<String> fields) => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: AppTheme.ts(size: 13, weight: FontWeight.bold, color: AppTheme.primaryGreen)),
        const SizedBox(height: 8),
        Container(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          decoration: BoxDecoration(color: AppTheme.bgCard, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppTheme.cardBorder)),
          child: Column(children: fields.asMap().entries.map((e) {
            final last = e.key == fields.length - 1;
            return Column(children: [
              Padding(padding: const EdgeInsets.symmetric(vertical: 14), child: Align(alignment: Alignment.centerLeft, child: Text(e.value, style: AppTheme.ts(size: 13)))),
              if (!last) Divider(color: AppTheme.cardBorder.withValues(alpha: 0.5), height: 1),
            ]);
          }).toList())),
      ]);
}
