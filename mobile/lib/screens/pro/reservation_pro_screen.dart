import 'package:flutter/material.dart';
import '../../widgets/common_widgets.dart';
import '../../theme/app_theme.dart';
import 'notifications_screen.dart';
import 'settings_screen.dart';
import '../services/flight_booking_screen.dart';
import '../services/train_booking_screen.dart';
import '../services/bus_booking_screen.dart';
import '../services/boat_booking_screen.dart';
import '../reservation/reservation_screen.dart';

class ReservationProScreen extends StatelessWidget {
  const ReservationProScreen({super.key});

  static final _services = [
    _BookSvc(
      icon: Icons.airplanemode_active_rounded,
      title: 'Flight Ticket',
      subtitle: 'Search & book domestic and international flights',
      color: const Color(0xFF2196F3),
      screen: const FlightBookingScreen(),
    ),
    _BookSvc(
      icon: Icons.train_rounded,
      title: 'Train Ticket',
      subtitle: 'Book Camrail and regional rail travel',
      color: const Color(0xFF9C27B0),
      screen: const TrainBookingScreen(),
    ),
    _BookSvc(
      icon: Icons.local_taxi_rounded,
      title: 'Ride',
      subtitle: 'Book a local ride in your neighbourhood',
      color: const Color(0xFFFF9800),
      screen: const BusBookingScreen(),
    ),
    _BookSvc(
      icon: Icons.directions_boat_rounded,
      title: 'Boat',
      subtitle: 'River & coastal ferry crossings',
      color: const Color(0xFF00BCD4),
      screen: const BoatBookingScreen(),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Column(children: [
        _header(context),
        // Hero banner
        Container(
          margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          height: 130,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: const LinearGradient(
              begin: Alignment.topLeft, end: Alignment.bottomRight,
              colors: [Color(0xFF1A3A6B), Color(0xFF0D1B2A)])),
          child: Stack(children: [
            const Center(child: Icon(Icons.travel_explore_rounded,
                color: Colors.white10, size: 90)),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center, children: const [
                Text('Book Travel', style: TextStyle(
                    color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20)),
                SizedBox(height: 4),
                Text('Flights, trains, rides and boats — all in one place',
                    style: TextStyle(color: Colors.white60, fontSize: 12)),
              ])),
          ])),
        const SizedBox(height: 16),
        // My Bookings shortcut
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
          child: GestureDetector(
            onTap: () => Navigator.push(context,
                MaterialPageRoute(builder: (_) => const ReservationScreen())),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.bgCard,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.3))),
              child: Row(children: [
                const Icon(Icons.book_online_rounded,
                    color: AppColors.primary, size: 20),
                const SizedBox(width: 10),
                const Text('View My Bookings', style: TextStyle(
                    color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 13)),
                const Spacer(),
                const Icon(Icons.arrow_forward_ios_rounded,
                    color: AppColors.primary, size: 13),
              ])))),
        Expanded(child: ListView.builder(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
          itemCount: _services.length,
          itemBuilder: (_, i) {
            final s = _services[i];
            return GestureDetector(
              onTap: () => Navigator.push(context,
                  MaterialPageRoute(builder: (_) => s.screen)),
              child: Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: s.color.withValues(alpha: 0.3))),
                child: Row(children: [
                  Container(width: 56, height: 56,
                    decoration: BoxDecoration(
                      color: s.color.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(14)),
                    child: Icon(s.icon, color: s.color, size: 28)),
                  const SizedBox(width: 14),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(s.title, style: const TextStyle(
                        color: Colors.white, fontWeight: FontWeight.w800, fontSize: 15)),
                    const SizedBox(height: 4),
                    Text(s.subtitle, style: const TextStyle(
                        color: AppColors.textGrey, fontSize: 12, height: 1.3)),
                  ])),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: s.color.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10)),
                    child: Text('Book', style: TextStyle(
                        color: s.color, fontWeight: FontWeight.w700, fontSize: 13))),
                ])));
          })),
      ]),
    );
  }

  Widget _header(BuildContext ctx) => Container(
    color: AppColors.bgDark,
    child: SafeArea(bottom: false, child: Padding(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
      child: Row(children: [
        const TraveoLogoWidget(),
        const Spacer(),
        const Text('Travel Booking', style: TextStyle(
            color: AppColors.textDark, fontWeight: FontWeight.w800, fontSize: 16)),
        const Spacer(),
        GestureDetector(
          onTap: () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => const SettingsScreen())),
          child: Container(width: 40, height: 40,
            decoration: BoxDecoration(color: AppColors.bgCard,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.cardBorder)),
            child: const Icon(Icons.settings_rounded, color: AppColors.textGrey, size: 20))),
        const SizedBox(width: 8),
        GestureDetector(
          onTap: () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => const NotificationsScreen())),
          child: Stack(children: [
            Container(width: 40, height: 40,
              decoration: BoxDecoration(color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder)),
              child: const Icon(Icons.notifications_rounded, color: AppColors.textGrey, size: 20)),
            Positioned(top: 2, right: 2, child: Container(
              padding: const EdgeInsets.all(3),
              decoration: const BoxDecoration(color: Colors.orange, shape: BoxShape.circle),
              child: const Text('2', style: TextStyle(
                  color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)))),
          ])),
      ]))));
}

class _BookSvc {
  final IconData icon;
  final String title, subtitle;
  final Color color;
  final Widget screen;
  const _BookSvc({required this.icon, required this.title,
      required this.subtitle, required this.color, required this.screen});
}
