import 'package:flutter/material.dart';
import '../../widgets/common_widgets.dart';
import '../../theme/app_theme.dart';
import 'notifications_screen.dart';
import 'ai_assistant_screen.dart';
import 'user_messages_screen.dart';
import 'bookings_pro_screen.dart';
import 'analyse_pro_screen.dart';
import 'gestion_pro_screen.dart';
import 'events_pro_screen.dart';
import '../../models/destination.dart';
import '../discover/destination_detail_screen.dart';
import '../services/services_screen.dart';
import '../services/evisa_screen.dart';
import '../wallet/pro_wallet_screen.dart';

class AccueilProScreen extends StatelessWidget {
  const AccueilProScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: CustomScrollView(slivers: [
        SliverToBoxAdapter(child: _banner(context)),
        SliverToBoxAdapter(child: _agencyInfo(context)),
        SliverToBoxAdapter(child: _statsRow(context)),
        SliverToBoxAdapter(child: _actionGrid(context)),
        SliverToBoxAdapter(child: _eVisaCard(context)),
        SliverToBoxAdapter(child: _aiTeaserCard(context)),
        SliverToBoxAdapter(child: _agencyList(context)),
        const SliverToBoxAdapter(child: SizedBox(height: 20)),
      ]),
    );
  }

  Widget _banner(BuildContext ctx) {
    return Stack(children: [
      ClipRRect(
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(24)),
        child: Container(
          height: 280,
          width: double.infinity,
          decoration: const BoxDecoration(
            gradient: LinearGradient(begin:Alignment.topLeft, end:Alignment.bottomRight,
              colors:[Color(0xFF0A1A2E), Color(0xFF1A3A6B)])),
          child: const Center(child: Icon(Icons.flight_rounded, color:Colors.white12, size:100)))),
      SafeArea(child: Padding(
        padding: const EdgeInsets.fromLTRB(16,10,16,0),
        child: Row(children:[
          const TraveoLogoWidget(),
          const Spacer(),
          GestureDetector(
            onTap:()=>Navigator.push(ctx, MaterialPageRoute(builder:(_)=>const NotificationsScreen())),
            child:Stack(children:[
              Container(width:40, height:40,
                decoration:BoxDecoration(color:Colors.black26,
                  borderRadius:BorderRadius.circular(12)),
                child:const Icon(Icons.notifications_rounded, color:Colors.white, size:20)),
              Positioned(top:2, right:2, child:Container(
                padding:const EdgeInsets.all(3),
                decoration:const BoxDecoration(color:Colors.orange, shape:BoxShape.circle),
                child:const Text('2', style:TextStyle(color:Colors.white, fontSize:8, fontWeight:FontWeight.bold)))),
            ])),
        ]))),
    ]);
  }

  Widget _agencyInfo(BuildContext ctx) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16,16,16,0),
      child: Column(crossAxisAlignment:CrossAxisAlignment.start, children:[
        const Text('Horizon Travel Agency',
          style:TextStyle(color:Colors.white, fontWeight:FontWeight.w900, fontSize:22)),
        const SizedBox(height:4),
        Row(children:[
          Expanded(child:const Text(
            'Your trusted partner for tours, adventures, and travel experiences across Cameroon and beyond.',
            maxLines:3, overflow:TextOverflow.ellipsis,
            style:TextStyle(color:AppColors.textGrey, fontSize:12, height:1.4))),
          const SizedBox(width:16),
          Column(crossAxisAlignment:CrossAxisAlignment.end, children:[
            const Row(children:[
              Icon(Icons.location_on_rounded, color:AppColors.primary, size:14),
              SizedBox(width:2),
              Text('Yaoundé, Cameroon',
                style:TextStyle(color:AppColors.primary, fontSize:11, fontWeight:FontWeight.w600)),
            ]),
            const SizedBox(height:6),
            const Row(children:[
              Icon(Icons.phone_rounded, color:AppColors.primary, size:14),
              SizedBox(width:2),
              Text('+237 699 999 999',
                style:TextStyle(color:AppColors.primary, fontSize:11, fontWeight:FontWeight.w600)),
            ]),
          ]),
        ]),
      ]),
    );
  }

  Widget _actionGrid(BuildContext ctx) {
    final actions = [
      _Ac(Icons.chat_rounded,          'Messages',  Colors.blue,              2,
          () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => const UserMessagesScreen()))),
      _Ac(Icons.book_online_rounded,   'Bookings',  AppColors.primary,        0,
          () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => const BookingsProScreen()))),
      _Ac(Icons.bar_chart_rounded,     'Analytics', const Color(0xFF06B6D4), 0,
          () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => const AnalyseProScreen()))),
      _Ac(Icons.folder_rounded,        'Manage',    Colors.orange,            0,
          () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => const GestionProScreen()))),
      _Ac(Icons.event_rounded,         'Events',    const Color(0xFF9D174D), 0,
          () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => const EventsProScreen()))),
      _Ac(Icons.grid_4x4_rounded,      'Services',  Colors.green,             0,
          () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => const ServicesScreen()))),
    ];
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
      child: GridView.count(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        crossAxisCount: 3,
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        childAspectRatio: 1.15,
        children: actions.map((a) => GestureDetector(
          onTap: a.onTap,
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.bgCard,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.cardBorder)),
            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Stack(clipBehavior: Clip.none, children: [
                Icon(a.icon, color: a.color, size: 26),
                if (a.badge > 0)
                  Positioned(top: -4, right: -8,
                    child: Container(
                      padding: const EdgeInsets.all(3),
                      decoration: const BoxDecoration(color: Colors.orange, shape: BoxShape.circle),
                      child: Text('${a.badge}', style: const TextStyle(
                          color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)))),
              ]),
              const SizedBox(height: 6),
              Text(a.label, style: const TextStyle(
                  color: AppColors.textGrey, fontSize: 11, fontWeight: FontWeight.w600)),
            ]))),
        ).toList()));
  }

  Widget _eVisaCard(BuildContext ctx) {
    return GestureDetector(
      onTap: () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => const EVisaScreen())),
      child: Container(
        margin: const EdgeInsets.fromLTRB(16, 20, 16, 0),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              const Color(0xFF1565C0).withValues(alpha: 0.30),
              const Color(0xFF0EA5E9).withValues(alpha: 0.18),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFF0EA5E9).withValues(alpha: 0.55))),
        child: Row(children: [
          Container(
            width: 52, height: 52,
            decoration: BoxDecoration(
              color: const Color(0xFF0EA5E9).withValues(alpha: 0.18),
              borderRadius: BorderRadius.circular(14)),
            child: const Icon(Icons.document_scanner_rounded,
                color: Color(0xFF0EA5E9), size: 28)),
          const SizedBox(width: 14),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              const Text('E-Visa Application',
                style: TextStyle(color: AppColors.textDark,
                    fontWeight: FontWeight.w800, fontSize: 15)),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.orange.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(6)),
                child: const Text('NEW',
                  style: TextStyle(color: Colors.orange,
                      fontWeight: FontWeight.w800, fontSize: 9))),
            ]),
            const SizedBox(height: 3),
            const Text('Check eligibility & apply for e-visas online',
              style: TextStyle(color: AppColors.textGrey, fontSize: 12)),
          ])),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
            decoration: BoxDecoration(
              color: const Color(0xFF0EA5E9).withValues(alpha: 0.18),
              borderRadius: BorderRadius.circular(20)),
            child: const Text('Apply',
              style: TextStyle(color: Color(0xFF0EA5E9),
                  fontWeight: FontWeight.w700, fontSize: 12))),
        ]),
      ),
    );
  }

  Widget _aiTeaserCard(BuildContext ctx) {
    return GestureDetector(
      onTap:()=>Navigator.push(ctx, MaterialPageRoute(builder:(_)=>const AIAssistantScreen())),
      child: Container(
        margin: const EdgeInsets.fromLTRB(16,20,16,0),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color:AppColors.primary.withValues(alpha:0.3))),
        child: Row(children:[
          Container(width:52, height:52,
            decoration: BoxDecoration(color:AppColors.primary.withValues(alpha:0.15),
              borderRadius:BorderRadius.circular(14)),
            child: const Icon(Icons.smart_toy_rounded, color:AppColors.primary, size:28)),
          const SizedBox(width:14),
          const Expanded(child:Text(
            'Ask our AI Assistant for travel recommendations, destination insights, and business advice.',
            style:TextStyle(color:AppColors.textGrey, fontSize:12, height:1.4))),
          const Icon(Icons.chevron_right_rounded, color:AppColors.primary),
        ])),
    );
  }

  Widget _agencyList(BuildContext ctx) {
    final ptsList = [5.0, 3.0, 1.0, 1.0];
    final tiles = <Widget>[];
    for (int i = 0; i < 4; i++) {
      final pts = ptsList[i];
      final opacity = i >= 2 ? 0.5 : 1.0;
      final dest = kDestinations.isNotEmpty
          ? kDestinations[i % kDestinations.length]
          : null;
      tiles.add(GestureDetector(
        onTap: () => Navigator.push(ctx,
            MaterialPageRoute(builder: (_) => DestinationDetailScreen(destination: dest))),
        child: Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.bgCard.withValues(alpha: opacity < 1 ? 0.4 : 1.0),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
          child: Row(children: [
            Container(width: 52, height: 52,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: opacity < 1 ? 0.05 : 0.15),
                borderRadius: BorderRadius.circular(12)),
              child: Icon(Icons.business_center_rounded,
                color: AppColors.primary.withValues(alpha: opacity), size: 24)),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Horizon Travel Agency',
                style: TextStyle(color: AppColors.textDark.withValues(alpha: opacity),
                    fontWeight: FontWeight.w700, fontSize: 14)),
              const SizedBox(height: 3),
              Text('Specializing in guided tours, hotel bookings, and adventure trips.',
                maxLines: 2, overflow: TextOverflow.ellipsis,
                style: TextStyle(color: AppColors.textGrey.withValues(alpha: opacity),
                    fontSize: 11, height: 1.3)),
            ])),
            Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
              Text('${pts.toStringAsFixed(1)} Pts',
                style: TextStyle(color: AppColors.textDark.withValues(alpha: opacity),
                    fontWeight: FontWeight.w800, fontSize: 14)),
              const SizedBox(height: 4),
              Row(mainAxisSize: MainAxisSize.min,
                children: List.generate(3, (j) => Icon(Icons.star_rounded,
                    color: AppColors.amber.withValues(alpha: opacity), size: 13))),
            ]),
          ]),
        ),
      ));
    }
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Padding(padding: EdgeInsets.only(bottom: 10),
          child: Row(children: [
            Expanded(child: Divider(color: AppColors.cardBorder, thickness: 0.5)),
            Padding(padding: EdgeInsets.symmetric(horizontal: 12),
              child: Text('Top Rated Agencies', style: TextStyle(
                  color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 14))),
            Expanded(child: Divider(color: AppColors.cardBorder, thickness: 0.5)),
          ])),
        ...tiles,
      ]),
    );
  }

  Widget _statsRow(BuildContext ctx) {
    final approved = globalProListings.where((l) => l.status == 'Approved').length;
    final pending  = globalProListings.where((l) => l.status == 'Pending').length;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
      child: Row(children: [
        _statTile('Active', '$approved', AppColors.primary,
            Icons.check_circle_rounded,
            () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => const BookingsProScreen()))),
        const SizedBox(width: 10),
        _statTile('Pending', '$pending', Colors.orange,
            Icons.hourglass_top_rounded,
            () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => const BookingsProScreen()))),
        const SizedBox(width: 10),
        _statTile('Wallet', 'Pro', const Color(0xFF06B6D4),
            Icons.account_balance_wallet_rounded,
            () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => const ProWalletScreen()))),
      ]),
    );
  }

  Widget _statTile(String label, String val, Color color,
      IconData icon, VoidCallback onTap) =>
    Expanded(child: GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withValues(alpha: 0.25))),
        child: Column(children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 6),
          Text(val, style: TextStyle(
              color: color, fontWeight: FontWeight.w900, fontSize: 16)),
          Text(label, style: const TextStyle(
              color: AppColors.textGrey, fontSize: 10)),
        ]))));
}

class _Ac {
  final IconData icon;
  final String label;
  final Color color;
  final int badge;
  final VoidCallback onTap;
  const _Ac(this.icon, this.label, this.color, this.badge, this.onTap);
}
