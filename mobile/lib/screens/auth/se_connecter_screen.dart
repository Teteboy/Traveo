import 'package:flutter/material.dart';
import '../../widgets/common_widgets.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../main_nav_screen.dart';
import '../pro/main_nav_pro_screen.dart';

class SeConnecterScreen extends StatefulWidget {
  const SeConnecterScreen({super.key});
  @override
  State<SeConnecterScreen> createState() => _SeConnecterScreenState();
}

class _SeConnecterScreenState extends State<SeConnecterScreen> {
  bool _isPro = false;
  final _emailCtrl = TextEditingController();
  final _passCtrl  = TextEditingController();
  bool _obscure = true;
  bool _loading = false;
  String? _error;

  @override
  void dispose() { _emailCtrl.dispose(); _passCtrl.dispose(); super.dispose(); }

  Future<void> _login() async {
    final email = _emailCtrl.text.trim();
    final pass = _passCtrl.text;
    if (email.isEmpty || pass.isEmpty) {
      setState(() => _error = 'Veuillez remplir tous les champs');
      return;
    }
    setState(() { _loading = true; _error = null; });
    try {
      final user = await AuthService.instance.login(email, pass);
      if (!mounted) return;
      final role = user['role']?.toString().toLowerCase() ?? 'user';
      Navigator.pushAndRemoveUntil(context,
        MaterialPageRoute(builder: (_) => (role == 'provider' || _isPro)
            ? const MainNavProScreen() : const MainNavScreen()),
        (_) => false);
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = 'Connexion échouée. Vérifiez vos identifiants.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.gradientRadial),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(children: [
              const SizedBox(height: 60),
              const TraveoLogoLarge(size: 70),
              const SizedBox(height: 20),
              const Text('Sign In', style: TextStyle(color: AppColors.textDark,
                  fontSize: 26, fontWeight: FontWeight.w900)),
              const SizedBox(height: 28),

              Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  color: AppColors.bgCard.withValues(alpha: 0.8),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.5))),
                child: Column(children: [
                  _field('Email', controller: _emailCtrl, keyboardType: TextInputType.emailAddress),
                  _passField(),
                ])),

              if (_error != null) ...[
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: Colors.red.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10)),
                  child: Text(_error!, style: const TextStyle(color: Colors.redAccent, fontSize: 13))),
              ],

              const SizedBox(height: 12),
              Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                Text('Pro Account', style: AppTheme.label(size: 13, color: Colors.white)),
                const SizedBox(width: 10),
                Switch(value: _isPro, onChanged: (v) => setState(() => _isPro = v)),
              ]),
              Align(alignment: Alignment.centerRight,
                child: TextButton(onPressed: () {},
                  child: Text('Forgot Password?',
                      style: AppTheme.label(color: AppColors.primary, size: 13)))),
              const SizedBox(height: 8),

              SizedBox(width: double.infinity, height: 52,
                child: ElevatedButton(
                  onPressed: _loading ? null : _login,
                  child: _loading
                    ? const SizedBox(width: 22, height: 22,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Sign In',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)))),

              const SizedBox(height: 16),
              // Demo credentials hint
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(12)),
                child: const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Demo:', style: TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.w700)),
                  SizedBox(height: 4),
                  Text('User:  user@traveo.cm / user1234', style: TextStyle(color: Colors.white54, fontSize: 11)),
                  Text('Pro:   provider@traveo.cm / provider123', style: TextStyle(color: Colors.white54, fontSize: 11)),
                ])),

              const SizedBox(height: 28),
              Text('Or sign in with', style: AppTheme.label(
                  color: AppColors.textDark.withValues(alpha: 0.7), size: 13)),
              const SizedBox(height: 18),
              Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                _social(Icons.g_mobiledata_rounded, const Color(0xFF4285F4)),
                const SizedBox(width: 20),
                _social(Icons.apple, Colors.white, fg: Colors.black),
              ]),
              const SizedBox(height: 40),
            ]),
          ),
        ),
      ),
    );
  }

  Widget _field(String hint, {TextEditingController? controller, TextInputType? keyboardType}) =>
    Container(
      margin: const EdgeInsets.only(bottom: 14),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        style: const TextStyle(color: AppColors.textDark),
        decoration: InputDecoration(hintText: hint)));

  Widget _passField() => Container(
    margin: const EdgeInsets.only(bottom: 14),
    child: TextField(
      controller: _passCtrl, obscureText: _obscure,
      style: const TextStyle(color: AppColors.textDark),
      decoration: InputDecoration(hintText: 'Password',
        suffixIcon: IconButton(
          icon: Icon(_obscure ? Icons.visibility_off : Icons.visibility,
              color: AppColors.textGrey),
          onPressed: () => setState(() => _obscure = !_obscure)))));

  Widget _social(IconData icon, Color bg, {Color fg = Colors.white}) => Container(
    width: 58, height: 58,
    decoration: BoxDecoration(shape: BoxShape.circle, color: bg,
      boxShadow: [BoxShadow(color: bg.withValues(alpha: 0.4), blurRadius: 12, spreadRadius: 2)]),
    child: Icon(icon, color: fg, size: 30));
}
