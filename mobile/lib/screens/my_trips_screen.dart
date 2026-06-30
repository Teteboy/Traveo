import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import 'pro/ai_assistant_screen.dart';
import 'reservation/trip_planner_screen.dart';
import '../widgets/common_widgets.dart';

class MyTripsScreen extends StatefulWidget {
  const MyTripsScreen({super.key});
  @override State<MyTripsScreen> createState() => _MyTripsScreenState();
}

class _MyTripsScreenState extends State<MyTripsScreen> {

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Column(children: [
        _header(),
        Expanded(child: _body()),
      ]),
    );
  }

  Widget _header() => Container(
    color: AppColors.bgDark,
    child: SafeArea(bottom: false, child: Padding(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
      child: Row(children: [
        const TraveoLogoWidget(),
        const SizedBox(width: 10),
        const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('My Trips', style: TextStyle(
              color: AppColors.textDark, fontWeight: FontWeight.w900, fontSize: 20)),
          Text('Plan, explore & manage your adventures',
              style: TextStyle(color: AppColors.textGrey, fontSize: 11)),
        ])),
      ]))));

  Widget _body() {
    return ListView(padding: const EdgeInsets.all(16), children: [
      // AI chat banner
      GestureDetector(
        onTap: () => Navigator.push(context,
            MaterialPageRoute(builder: (_) => const AIAssistantScreen())),
        child: Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF4F46E5), Color(0xFF7C3AED)],
              begin: Alignment.topLeft, end: Alignment.bottomRight),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [BoxShadow(
              color: const Color(0xFF4F46E5).withValues(alpha: 0.3),
              blurRadius: 16, offset: const Offset(0, 6))]),
          child: Row(children: [
            Container(width: 56, height: 56,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(16)),
              child: const Icon(Icons.smart_toy_rounded, color: Colors.white, size: 30)),
            const SizedBox(width: 16),
            const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Traveo AI Assistant', style: TextStyle(
                  color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16)),
              SizedBox(height: 4),
              Text('Chat with AI · Plan & create trips\nGet personalised travel advice',
                style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.4)),
            ])),
            Container(width: 40, height: 40,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15), shape: BoxShape.circle),
              child: const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 20)),
          ]))),

      // Quick links
      Row(children: [
        _quickLink(Icons.add_location_alt_rounded, 'New Trip',
          const Color(0xFF1DB954), _openCreateTrip),
        const SizedBox(width: 10),
        _quickLink(Icons.group_rounded, 'Group Trip',
          const Color(0xFF8B5CF6), _openCreateGroupTrip),
        const SizedBox(width: 10),
        _quickLink(Icons.map_rounded, 'All Trips',
          AppColors.primary, _openFullTripPlanner),
      ]),
      const SizedBox(height: 24),

      // Recent trips
      if (globalTrips.isNotEmpty) ...[
        Row(children: [
          Container(width: 3, height: 18,
            decoration: BoxDecoration(
                color: AppColors.primary, borderRadius: BorderRadius.circular(2))),
          const SizedBox(width: 8),
          const Text('Recent Trips', style: TextStyle(
              color: AppColors.textDark, fontWeight: FontWeight.w800, fontSize: 15)),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
                color: AppColors.primaryLight, borderRadius: BorderRadius.circular(10)),
            child: Text('${globalTrips.length}', style: const TextStyle(
                color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.w700))),
        ]),
        const SizedBox(height: 12),
        ...globalTrips.take(3).map((t) => _tripCard(t)),
        if (globalTrips.length > 3)
          GestureDetector(
            onTap: _openFullTripPlanner,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 12),
              alignment: Alignment.center,
              child: Text('View all ${globalTrips.length} trips →',
                style: const TextStyle(color: AppColors.primary,
                    fontWeight: FontWeight.w700, fontSize: 13)))),
      ] else ...[
        Container(
          padding: const EdgeInsets.all(28),
          decoration: BoxDecoration(
            color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.5))),
          child: Column(children: [
            Icon(Icons.map_outlined,
                color: AppColors.primary.withValues(alpha: 0.3), size: 64),
            const SizedBox(height: 16),
            const Text('No trips planned yet', style: TextStyle(
                color: AppColors.textDark, fontWeight: FontWeight.w700, fontSize: 16)),
            const SizedBox(height: 8),
            const Text('Tap Traveo AI or New Trip to start your first adventure',
                style: TextStyle(color: AppColors.textGrey, fontSize: 12),
                textAlign: TextAlign.center),
            const SizedBox(height: 20),
            GestureDetector(
              onTap: _openCreateTrip,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(12)),
                child: const Text('+ Plan a Trip', style: TextStyle(
                    color: Colors.white, fontWeight: FontWeight.w800, fontSize: 14)))),
          ])),
      ],
    ]);
  }

  Widget _quickLink(IconData icon, String label, Color color, VoidCallback onTap) =>
    Expanded(child: GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.2))),
        child: Column(children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 6),
          Text(label, style: TextStyle(
              color: color, fontSize: 11, fontWeight: FontWeight.w700)),
        ]))));

  Widget _tripCard(TripPlan t) {
    final isGroup = t.type == TripType.group;
    final typeColor = isGroup ? const Color(0xFF8B5CF6) : AppColors.primary;
    return GestureDetector(
      onTap: () => Navigator.push(context,
          MaterialPageRoute(builder: (_) => TripDashboardScreen(trip: t)))
          .then((_) => setState(() {})),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.bgCard, borderRadius: BorderRadius.circular(14),
          border: Border.all(color: typeColor.withValues(alpha: 0.25))),
        child: Row(children: [
          Container(width: 44, height: 44,
            decoration: BoxDecoration(
              color: typeColor.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12)),
            child: Icon(isGroup ? Icons.group_rounded : Icons.person_rounded,
                color: typeColor, size: 22)),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(t.title, style: const TextStyle(
                color: AppColors.textDark, fontWeight: FontWeight.w800, fontSize: 14)),
            const SizedBox(height: 3),
            Row(children: [
              Icon(Icons.location_on_rounded, color: typeColor, size: 12),
              const SizedBox(width: 3),
              Text(t.destination,
                  style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
            ]),
          ])),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text(t.dates,
                style: const TextStyle(color: AppColors.textGrey, fontSize: 10)),
            const SizedBox(height: 4),
            const Icon(Icons.arrow_forward_ios_rounded,
                color: AppColors.textGrey, size: 11),
          ]),
        ])));
  }

  void _openCreateTrip() {
    showModalBottomSheet(
      context: context, isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => CreateTripTypeSheet(
        onTypeSelected: (type) {
          Navigator.pop(context);
          Navigator.push(context, MaterialPageRoute(
              builder: (_) => CreateTripFormScreen(type: type)))
              .then((_) => setState(() {}));
        }));
  }

  void _openCreateGroupTrip() {
    Navigator.push(context, MaterialPageRoute(
        builder: (_) => CreateTripFormScreen(type: TripType.group)))
        .then((_) => setState(() {}));
  }

  void _openFullTripPlanner() {
    Navigator.push(context, MaterialPageRoute(
        builder: (_) => Scaffold(
          backgroundColor: AppColors.bgDark,
          appBar: AppBar(
            backgroundColor: AppColors.bgCard,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios_rounded,
                  color: Colors.white, size: 20),
              onPressed: () => Navigator.pop(context)),
            title: const Text('My Trips', style: TextStyle(
                color: Colors.white, fontWeight: FontWeight.w800, fontSize: 17))),
          body: const TripPlannerScreen())))
        .then((_) => setState(() {}));
  }
}
