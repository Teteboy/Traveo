import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

import 's_inscrire_screen.dart';
import 'se_connecter_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  // Tracks which button was last tapped to show the white active border
  String? _activeTap; // 'signup' | 'signin' | null

  void _onSignUp() {
    setState(() => _activeTap = 'signup');
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const SInscrireScreen()),
    ).then((_) => setState(() => _activeTap = null));
  }

  void _onSignIn() {
    setState(() => _activeTap = 'signin');
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const SeConnecterScreen()),
    ).then((_) => setState(() => _activeTap = null));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(children: [
        // ── Dark-green background gradient ────────────────────────────────
        Positioned.fill(child: Container(
          decoration: const BoxDecoration(gradient: AppColors.gradientBackground))),

        SafeArea(child: Column(children: [
          const Spacer(flex: 2),

          // ── Logo + name ─────────────────────────────────────────────────
          ColorFiltered(
            colorFilter: AppColors.logoGreenFilter,
            child: Image.asset('assets/images/Logo.png', width: 110, height: 110,
              errorBuilder: (_, __, ___) => const Icon(
                  Icons.flight_rounded, color: AppColors.primary, size: 80)),
          ),
          const SizedBox(height: 18),
          const Text('Traveo',
            style: TextStyle(
              color: AppColors.primary,
              fontSize: 36,
              fontWeight: FontWeight.w900,
              letterSpacing: -1,
            )),
          const SizedBox(height: 6),
          Text('Plan less. Experience more.',
            style: TextStyle(
              color: AppColors.textMuted,
              fontSize: 14,
              fontWeight: FontWeight.w500,
              letterSpacing: 0.3,
            )),

          const Spacer(flex: 2),

          // ── Buttons card ─────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 36),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
              decoration: BoxDecoration(
                color: AppColors.bgCard.withValues(alpha: 0.85),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppColors.cardBorder, width: 1)),
              child: Column(children: [
                // ── Sign Up – outline button, border only when active ──
                _AuthButton(
                  label: 'Sign Up',
                  onTap: _onSignUp,
                  isActive: _activeTap == 'signup',
                  filled: false,
                ),
                const SizedBox(height: 14),
                // ── Sign In – filled dark button ─────────────────────
                _AuthButton(
                  label: 'Sign In',
                  onTap: _onSignIn,
                  isActive: _activeTap == 'signin',
                  filled: true,
                ),
              ]),
            ),
          ),

          const Spacer(flex: 3),
        ])),
      ]),
    );
  }
}

/// Individual auth button that shows white border only when [isActive]
class _AuthButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  final bool isActive;
  final bool filled;

  const _AuthButton({
    required this.label,
    required this.onTap,
    required this.isActive,
    required this.filled,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: double.infinity,
        height: 52,
        decoration: BoxDecoration(
          color: filled ? AppColors.primaryDark : Colors.transparent,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            // Outline button always shows a border, but white only when active.
            // Filled button only shows white border when active.
            color: isActive
                ? AppColors.activeBorder          // white when clicked
                : (filled
                    ? Colors.transparent          // filled: no border at rest
                    : AppColors.textMuted.withValues(alpha: 0.4)), // outline: faint at rest
            width: isActive ? 2.0 : 1.5,
          ),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: TextStyle(
            color: AppColors.textWhite,
            fontWeight: FontWeight.w900,
            fontSize: 18,
            letterSpacing: 0.2,
          ),
        ),
      ),
    );
  }
}
