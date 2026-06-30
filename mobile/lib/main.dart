import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'theme/app_theme.dart';
import 'screens/splash_screen.dart';
import 'screens/ouverture_screen.dart';
import 'screens/privacy_policy_screen.dart';
import 'screens/main_nav_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/se_connecter_screen.dart';
import 'screens/auth/s_inscrire_screen.dart';
import 'screens/pro/main_nav_pro_screen.dart';
import 'services/auth_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);

  // Attempt to restore previous session before showing UI
  await AuthService.instance.tryRestoreSession();

  runApp(const TraveoApp());
}

class TraveoApp extends StatelessWidget {
  const TraveoApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Determine initial route based on auth state
    final auth = AuthService.instance;
    String initialRoute = '/';
    if (auth.isLoggedIn) {
      initialRoute = auth.isProvider ? '/home-pro' : '/home';
    }

    return MaterialApp(
      title: 'Traveo',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.theme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      initialRoute: initialRoute,
      routes: {
        '/':          (_) => const SplashScreen(),
        '/ouverture': (_) => const OuvertureScreen(),
        '/auth':      (_) => const LoginScreen(),
        '/signin':    (_) => const SeConnecterScreen(),
        '/signup':    (_) => const SInscrireScreen(),
        '/home':      (_) => const MainNavScreen(),
        '/home-pro':  (_) => const MainNavProScreen(),
        '/privacy':   (_) => const PrivacyPolicyScreen(),
      },
    );
  }
}
