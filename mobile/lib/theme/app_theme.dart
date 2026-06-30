import 'package:flutter/material.dart';

/// ─────────────────────────────────────────────────────────────────────────────
/// Traveo – Design-System Colors
/// Extracted from Figma screens (green-dark theme)
/// ─────────────────────────────────────────────────────────────────────────────
class AppColors {
  // ── Brand greens ─────────────────────────────────────────────────────────
  static const primary       = Color(0xFF1DB873); // logo, active icons, headings
  static const primaryBright = Color(0xFF2ECC8A); // bright teal-green accents
  static const primaryDark   = Color(0xFF1A4A2E); // filled button bg
  static const primaryHover  = Color(0xFF178F5A); // pressed / hover state
  static const primaryLight  = Color(0x261DB873); // 15% tint overlay

  // ── Backgrounds ──────────────────────────────────────────────────────────
  static const bgDeepest  = Color(0xFF050D08); // near-black (splash / auth bg)
  static const bgDark     = Color(0xFF0A1512); // main scaffold bg
  static const bgCard     = Color(0xFF0E2218); // card surface
  static const bgCardMid  = Color(0xFF142A1E); // slightly raised card
  static const bgNav      = Color(0xFF0D1F14); // bottom nav bar
  static const bgOverlay  = Color(0x99000000); // 60% black overlay on images

  // ── Text ─────────────────────────────────────────────────────────────────
  static const textWhite  = Color(0xFFFFFFFF);
  static const textMuted  = Color(0xB3FFFFFF); // ~70% white – subtitles
  static const textHint   = Color(0x66FFFFFF); // ~40% white – placeholders
  static const textGreen  = Color(0xFF1DB873); // green labels / section titles

  // ── Borders / Dividers ───────────────────────────────────────────────────
  static const cardBorder   = Color(0xFF1E3D28);
  static const divider      = Color(0xFF1A3322);
  static const inputBorder  = Color(0xFFFFFFFF); // white pill border on inputs
  static const activeBorder = Color(0xFFFFFFFF); // selected button white border

  // ── Semantic ─────────────────────────────────────────────────────────────
  static const starYellow = Color(0xFFF5C518);
  static const badgeRed   = Color(0xFFFF3D3D);
  static const success    = Color(0xFF1DB873);
  static const danger     = Color(0xFFEF4444);
  static const warning    = Color(0xFFF59E0B);
  static const info       = Color(0xFF3B82F6);

  // ── Legacy aliases (keep existing screens compiling) ─────────────────────
  static const bgBlack     = bgDeepest;
  static const bgMid       = bgCardMid;
  static const bgCardLight = primaryLight;
  static const purple      = primaryBright;
  static const textDark    = textWhite;  // on dark bg, "dark text" = white
  static const textGrey    = textMuted;
  static const textLight   = textHint;
  static const cardShadow  = Color(0x29000000);
  static const secondary   = Color(0xFFF97316);
  static const accent      = bgCard;
  static const dark        = bgDeepest;
  static const light       = bgCardMid;
  static const gray        = textMuted;
  static const grayLight   = bgCardMid;
  static const white       = textWhite;
  static const teal        = primary;
  static const amber       = warning;
  static const alert       = warning;
  static const alertBg     = Color(0xFFFED7AA);
  static const infoBg      = Color(0xFFDBEAFE);
  static const successBg   = Color(0xFFD1FAE5);
  static const warningBg   = Color(0xFFFEF3C7);

  // ── Logo color filter – keeps logo green (no blue shift needed) ──────────
  static const logoGreenFilter = ColorFilter.matrix(<double>[
    0.0,  0.3,  0.0,  0.0,   0,
    0.8,  1.0,  0.0,  0.0,  20,
    0.0,  0.3,  0.1,  0.0,   0,
    0.0,  0.0,  0.0,  1.0,   0,
  ]);

  // ── Gradients ─────────────────────────────────────────────────────────────
  /// Main full-screen background gradient (top-left dark green → black)
  static const gradientBackground = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF0D3020), Color(0xFF000000), Color(0xFF051A0E)],
    stops: [0.0, 0.5, 1.0],
  );

  static const gradientPrimary = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF1DB873), Color(0xFF2ECC8A)],
  );

  static const gradientRadial = RadialGradient(
    center: Alignment(0.3, -0.4),
    radius: 1.6,
    colors: [Color(0xFF0D3020), Color(0xFF051005), Color(0xFF000000)],
    stops: [0.0, 0.5, 1.0],
  );

  static const gradientButton = LinearGradient(
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
    colors: [Color(0xFF1DB873), Color(0xFF2ECC8A)],
  );

  /// Dark overlay at bottom of image cards (for text legibility)
  static const gradientCardOverlay = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Colors.transparent, Color(0xCC000000)],
    stops: [0.4, 1.0],
  );
}

class AppTheme {
  // ── Mirrors for legacy code ───────────────────────────────────────────────
  static const Color bgBlack      = AppColors.bgDeepest;
  static const Color bgDark       = AppColors.bgDark;
  static const Color bgMid        = AppColors.bgCardMid;
  static const Color bgCard       = AppColors.bgCard;
  static const Color primaryGreen = AppColors.primary;
  static const Color lightGreen   = AppColors.primaryLight;
  static const Color tealGreen    = AppColors.teal;
  static const Color textWhite    = AppColors.textWhite;
  static const Color textGrey     = AppColors.textMuted;
  static const Color cardBorder   = AppColors.cardBorder;
  static const Color accentGreen  = AppColors.primaryLight;
  static const String font        = 'Roboto';

  // ── Text style helpers ────────────────────────────────────────────────────
  static TextStyle ts({
    double size = 14,
    FontWeight weight = FontWeight.normal,
    Color color = AppColors.textWhite,
    double? height,
  }) => TextStyle(
    fontFamily: font, fontSize: size,
    fontWeight: weight, color: color, height: height,
  );

  static TextStyle display({double size = 20,
      FontWeight weight = FontWeight.bold,
      Color color = AppColors.textWhite}) =>
      ts(size: size, weight: weight, color: color);

  static TextStyle body({double size = 14,
      FontWeight fontWeight = FontWeight.normal,
      Color color = AppColors.textWhite}) =>
      ts(size: size, weight: fontWeight, color: color);

  static TextStyle label({double size = 12,
      FontWeight fontWeight = FontWeight.w400,
      Color color = AppColors.textMuted}) =>
      ts(size: size, weight: fontWeight, color: color);

  // ── Shared widget sub-themes ──────────────────────────────────────────────
  static InputDecorationTheme get _inputTheme => InputDecorationTheme(
    filled: true,
    fillColor: AppColors.bgCard,
    hintStyle: const TextStyle(color: AppColors.textHint, fontSize: 14),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(30),
      borderSide: const BorderSide(color: AppColors.inputBorder, width: 1.5)),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(30),
      borderSide: const BorderSide(color: AppColors.inputBorder, width: 1.5)),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(30),
      borderSide: const BorderSide(color: AppColors.primaryBright, width: 2)),
    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
  );

  // ── Light ThemeData (used when system is in light mode) ──────────────────
  // Note: This app is inherently dark-themed per design, so light mode still
  // uses a dark base to stay on-brand.
  static ThemeData get theme => _buildTheme();

  // ── Dark ThemeData ────────────────────────────────────────────────────────
  static ThemeData get darkTheme => _buildTheme();

  static ThemeData _buildTheme() => ThemeData(
    useMaterial3: true,
    fontFamily: font,
    brightness: Brightness.dark,
    colorScheme: const ColorScheme.dark(
      primary: AppColors.primary,
      secondary: AppColors.primaryBright,
      surface: AppColors.bgDark,
      onPrimary: AppColors.textWhite,
      onSecondary: AppColors.textWhite,
      onSurface: AppColors.textWhite,
      error: AppColors.danger,
    ),
    scaffoldBackgroundColor: AppColors.bgDark,
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      scrolledUnderElevation: 0,
      iconTheme: IconThemeData(color: AppColors.primary),
      titleTextStyle: TextStyle(
        color: AppColors.primary,
        fontFamily: font,
        fontWeight: FontWeight.w700,
        fontSize: 18,
      ),
    ),
    cardTheme: CardThemeData(
      color: AppColors.bgCard,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppColors.cardBorder),
      ),
    ),
    inputDecorationTheme: _inputTheme,
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primaryDark,
        foregroundColor: AppColors.textWhite,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
        textStyle: const TextStyle(
          fontFamily: font, fontWeight: FontWeight.w700, fontSize: 15),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.textWhite,
        side: const BorderSide(color: AppColors.textWhite, width: 2),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
        textStyle: const TextStyle(
          fontFamily: font, fontWeight: FontWeight.w700, fontSize: 15),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(foregroundColor: AppColors.primary),
    ),
    switchTheme: SwitchThemeData(
      thumbColor: WidgetStateProperty.resolveWith((s) =>
          s.contains(WidgetState.selected) ? AppColors.primary : AppColors.textMuted),
      trackColor: WidgetStateProperty.resolveWith((s) =>
          s.contains(WidgetState.selected)
              ? AppColors.primaryDark : AppColors.bgCardMid),
    ),
    dividerTheme: const DividerThemeData(
      color: AppColors.divider, thickness: 1, space: 1),
    iconTheme: const IconThemeData(color: AppColors.primary),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.bgNav,
      selectedItemColor: AppColors.primary,
      unselectedItemColor: AppColors.textMuted,
    ),
    textTheme: const TextTheme(
      bodyLarge:   TextStyle(color: AppColors.textWhite),
      bodyMedium:  TextStyle(color: AppColors.textWhite),
      bodySmall:   TextStyle(color: AppColors.textMuted),
      titleLarge:  TextStyle(color: AppColors.textWhite,  fontWeight: FontWeight.w700),
      titleMedium: TextStyle(color: AppColors.textWhite,  fontWeight: FontWeight.w600),
      titleSmall:  TextStyle(color: AppColors.textMuted),
      labelLarge:  TextStyle(color: AppColors.textWhite),
      labelMedium: TextStyle(color: AppColors.textMuted),
      labelSmall:  TextStyle(color: AppColors.textHint),
    ),
  );
}
