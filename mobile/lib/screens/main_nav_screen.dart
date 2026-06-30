import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_theme.dart';
import 'home/home_screen.dart';
import 'discover/discover_screen.dart';
import 'profile/profile_screen.dart';
import 'services/services_screen.dart';
import 'user/user_post_screen.dart';
import 'my_trips_screen.dart';

// Notifier that ReservationScreen listens to for rebuilds
final bookingsRefreshNotifier = ValueNotifier<int>(0);

class MainNavScreen extends StatefulWidget {
  const MainNavScreen({super.key});
  @override State<MainNavScreen> createState() => _MainNavScreenState();
}

class _MainNavScreenState extends State<MainNavScreen> {
  int _idx = 0;

  // GlobalKey lets us call jumpToService() on the live ServicesScreen state
  final _servicesKey = GlobalKey<ServicesScreenState>();

  void _onServiceTap(int serviceIndex) {
    // 1. Switch bottom nav to Services tab (index 2)
    setState(() => _idx = 2);
    // 2. Tell ServicesScreen to highlight the right category
    //    Use addPostFrameCallback so the tab is visible before we update it
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _servicesKey.currentState?.jumpToService(serviceIndex);
    });
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark));

    return Scaffold(
      body: IndexedStack(index: _idx, children: [
        HomeScreen(onServiceTap: _onServiceTap),
        const DiscoverScreen(),
        ServicesScreen(key: _servicesKey),
        const MyTripsScreen(),
        const ProfileScreen(),
      ]),
      bottomNavigationBar: _buildNav(),
    );
  }

  Widget _buildNav() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        border: const Border(top: BorderSide(color: AppColors.cardBorder)),
        boxShadow: [BoxShadow(
            color: AppColors.cardShadow,
            blurRadius: 20, offset: const Offset(0, -4))]),
      child: SafeArea(child: SizedBox(height: 68,
        child: Row(children: [
          _navItem(0, Icons.home_rounded, 'Home'),
          _navItem(1, Icons.explore_rounded, 'Discover'),
          // Centre Post button
          Expanded(child: Center(
            child: GestureDetector(
              onTap: () => Navigator.push(context,
                  MaterialPageRoute(builder: (_) => const UserPostScreen())),
              child: Container(
                width: 54, height: 54,
                margin: const EdgeInsets.only(bottom: 6),
                decoration: BoxDecoration(
                  gradient: AppColors.gradientButton,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.35),
                      blurRadius: 14)]),
                child: const Icon(Icons.add_photo_alternate_rounded,
                    color: Colors.white, size: 26))))),
          _navItem(2, Icons.room_service_rounded, 'Services'),
          _navItem(3, Icons.luggage_rounded, 'My Trips'),
          _navItem(4, Icons.person_rounded, 'Profile'),
        ]))));
  }

  Widget _navItem(int i, IconData icon, String label) {
    final active = _idx == i;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() => _idx = i);
        },
        behavior: HitTestBehavior.opaque,
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(icon,
              color: active ? AppColors.primary : AppColors.textLight, size: 22),
          const SizedBox(height: 3),
          Text(label, style: TextStyle(
              color: active ? AppColors.primary : AppColors.textLight,
              fontSize: 9,
              fontWeight: active ? FontWeight.w700 : FontWeight.w500)),
        ])));
  }
}
