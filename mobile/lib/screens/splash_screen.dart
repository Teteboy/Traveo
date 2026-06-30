import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _fadeAnim;
  late Animation<double> _scaleAnim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200));
    _fadeAnim  = CurvedAnimation(parent: _ctrl, curve: Curves.easeIn);
    _scaleAnim = Tween<double>(begin: 0.8, end: 1.0)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.elasticOut));
    _ctrl.forward();
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) Navigator.of(context).pushReplacementNamed('/ouverture');
    });
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(children: [
        // Background – dark-green gradient per design
        Positioned.fill(child: Container(
          decoration: const BoxDecoration(gradient: AppColors.gradientBackground))),

        // Content
        Center(child: FadeTransition(
          opacity: _fadeAnim,
          child: ScaleTransition(
            scale: _scaleAnim,
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              // Real logo
              ColorFiltered(
                colorFilter: AppColors.logoGreenFilter,
                child: Image.asset('assets/images/Logo.png', width: 110, height: 110,
                  errorBuilder: (_, __, ___) => const Icon(Icons.flight_rounded,
                      color: AppColors.primary, size: 80)),
              ),
              const SizedBox(height: 20),
              const Text('Traveo',
                style: TextStyle(color: AppColors.primary, fontSize: 44,
                    fontWeight: FontWeight.w900, letterSpacing: -2)),
              const SizedBox(height: 8),
              Text('Plan less. Experience more.',
                style: TextStyle(color: AppColors.textMuted,
                    fontSize: 15, fontWeight: FontWeight.w600, letterSpacing: 0.3)),
              const SizedBox(height: 60),
              // Loading dots
              _LoadingDots(),
            ]),
          ),
        )),
      ]),
    );
  }
}

class _LoadingDots extends StatefulWidget {
  @override State<_LoadingDots> createState() => _LoadingDotsState();
}
class _LoadingDotsState extends State<_LoadingDots> with SingleTickerProviderStateMixin {
  late AnimationController _c;
  @override void initState() {
    super.initState();
    _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 900))
      ..repeat();
  }
  @override void dispose() { _c.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _c,
      builder: (_, __) => Row(mainAxisSize: MainAxisSize.min,
        children: List.generate(3, (i) {
          final delay = i / 3;
          final val = ((_c.value - delay) % 1.0).clamp(0.0, 1.0);
          final opacity = (val < 0.5 ? val * 2 : (1 - val) * 2).clamp(0.3, 1.0);
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 4),
            width: 8, height: 8,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: opacity),
              shape: BoxShape.circle));
        })));
  }
}
