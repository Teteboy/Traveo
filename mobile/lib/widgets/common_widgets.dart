import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

// ─────────────────────────────────────────────────────────────────────────────
// LOGO WIDGETS
// ─────────────────────────────────────────────────────────────────────────────

/// Small logo used in all screen headers
class TraveoLogoWidget extends StatelessWidget {
  const TraveoLogoWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      ColorFiltered(
        colorFilter: AppColors.logoGreenFilter,
        child: Image.asset('assets/images/Logo.png', width: 28, height: 28,
          errorBuilder: (_, __, ___) =>
              const Icon(Icons.flight_rounded, color: AppColors.primary, size: 24)),
      ),
      const SizedBox(width: 8),
      const Text('Traveo',
        style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w900,
            fontSize: 20, letterSpacing: -0.5)),
    ]);
  }
}

/// Large logo for splash / auth / onboarding
class TraveoLogoLarge extends StatelessWidget {
  final double size;
  const TraveoLogoLarge({super.key, this.size = 100});

  @override
  Widget build(BuildContext context) => ColorFiltered(
    colorFilter: AppColors.logoGreenFilter,
    child: Image.asset('assets/images/Logo.png', width: size, height: size,
      errorBuilder: (_, __, ___) =>
          Icon(Icons.flight_rounded, color: AppColors.primary, size: size * 0.6)),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DARK BACKGROUND WRAPPER
// Used as: DarkBg(child: ...)
// ─────────────────────────────────────────────────────────────────────────────

class DarkBg extends StatelessWidget {
  final Widget child;
  const DarkBg({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(gradient: AppColors.gradientBackground),
      child: child,
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TOP APP BAR  (logo center, search left, settings + bell right)
// ─────────────────────────────────────────────────────────────────────────────

class TpAppBar extends StatelessWidget {
  const TpAppBar({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(children: [
        const Icon(Icons.search, color: AppColors.primary, size: 26),
        const Spacer(),
        Row(mainAxisSize: MainAxisSize.min, children: [
          ColorFiltered(
            colorFilter: AppColors.logoGreenFilter,
            child: Image.asset('assets/images/Logo.png', width: 22, height: 22,
              errorBuilder: (_, __, ___) =>
                  const Icon(Icons.flight_takeoff, color: AppColors.primary, size: 20)),
          ),
          const SizedBox(width: 6),
          const Text('Traveo',
            style: TextStyle(
              color: AppColors.primary,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            )),
        ]),
        const Spacer(),
        const Icon(Icons.settings, color: AppColors.primary, size: 24),
        const SizedBox(width: 8),
        const NotifBell(),
        const SizedBox(width: 6),
      ]),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION BELL with badge
// ─────────────────────────────────────────────────────────────────────────────

class NotifBell extends StatelessWidget {
  final int count;
  const NotifBell({super.key, this.count = 2});

  @override
  Widget build(BuildContext context) {
    return Stack(clipBehavior: Clip.none, children: [
      const Icon(Icons.notifications_rounded, color: AppColors.primary, size: 26),
      if (count > 0)
        Positioned(
          top: -4, right: -4,
          child: Container(
            padding: const EdgeInsets.all(3),
            decoration: const BoxDecoration(
              color: AppColors.badgeRed,
              shape: BoxShape.circle,
            ),
            child: Text(
              count > 9 ? '9+' : '$count',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 9,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ),
    ]);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION HEADER  (green title with divider lines)
// ─────────────────────────────────────────────────────────────────────────────

class SectionHeader extends StatelessWidget {
  final String title;
  const SectionHeader(this.title, {super.key});

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Expanded(child: Divider(color: AppColors.divider, thickness: 1)),
      Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        child: Text(title,
          style: const TextStyle(
            color: AppColors.primary,
            fontWeight: FontWeight.w700,
            fontSize: 16,
          )),
      ),
      Expanded(child: Divider(color: AppColors.divider, thickness: 1)),
    ]);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENCY CARD  (leaderboard row card)
// ─────────────────────────────────────────────────────────────────────────────

class AgencyCard extends StatelessWidget {
  final String name;
  final String description;
  final double points;
  final int stars;
  final bool isActive;

  const AgencyCard({
    super.key,
    required this.name,
    required this.description,
    required this.points,
    required this.stars,
    this.isActive = true,
  });

  @override
  Widget build(BuildContext context) {
    final textColor = isActive ? AppColors.textWhite : AppColors.textMuted;
    final cardColor = isActive ? AppColors.bgCardMid : AppColors.bgCard;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Row(children: [
        // Icon box
        Container(
          width: 64, height: 64,
          decoration: BoxDecoration(
            color: AppColors.primaryDark,
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Icon(Icons.luggage_rounded, color: AppColors.primary, size: 32),
        ),
        const SizedBox(width: 12),

        // Name + description
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(name,
            style: TextStyle(
              color: textColor,
              fontWeight: FontWeight.w800,
              fontSize: 14,
            )),
          const SizedBox(height: 4),
          Text(description,
            style: TextStyle(color: AppColors.textMuted, fontSize: 11, height: 1.4),
            maxLines: 3,
            overflow: TextOverflow.ellipsis),
        ])),
        const SizedBox(width: 8),

        // Points + stars
        Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Text('${points.toStringAsFixed(1)} Pts',
            style: TextStyle(
              color: isActive ? AppColors.textWhite : AppColors.textMuted,
              fontWeight: FontWeight.w700,
              fontSize: 13,
            )),
          const SizedBox(height: 4),
          Row(mainAxisSize: MainAxisSize.min,
            children: List.generate(3, (i) => Icon(
              i < stars ? Icons.star : Icons.star_border,
              color: isActive ? AppColors.starYellow : AppColors.textHint,
              size: 14,
            ))),
        ]),
      ]),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STAR ROW  (reusable row of up to 5 stars)
// ─────────────────────────────────────────────────────────────────────────────

class StarRow extends StatelessWidget {
  final int filled;
  final int total;
  final double size;
  const StarRow({super.key, required this.filled, this.total = 5, this.size = 16});

  @override
  Widget build(BuildContext context) {
    return Row(mainAxisSize: MainAxisSize.min,
      children: List.generate(total, (i) => Icon(
        i < filled ? Icons.star_rounded : Icons.star_border_rounded,
        color: AppColors.starYellow, size: size,
      )));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GREEN PILL BUTTON  (reusable filled pill)
// ─────────────────────────────────────────────────────────────────────────────

class GreenPillButton extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;
  final double? width;

  const GreenPillButton({
    super.key,
    required this.label,
    this.onTap,
    this.width,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: width,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 11),
        decoration: BoxDecoration(
          color: AppColors.primaryDark,
          borderRadius: BorderRadius.circular(30),
          border: Border.all(color: AppColors.primary.withValues(alpha: 0.4)),
        ),
        child: Text(label,
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: AppColors.textWhite,
            fontWeight: FontWeight.w700,
            fontSize: 14,
          )),
      ),
    );
  }
}
