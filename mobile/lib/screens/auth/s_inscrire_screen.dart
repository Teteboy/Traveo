import 'package:flutter/material.dart';
import '../../widgets/common_widgets.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../privacy_policy_screen.dart';
import '../main_nav_screen.dart';
import '../pro/main_nav_pro_screen.dart';

class SInscrireScreen extends StatefulWidget {
  const SInscrireScreen({super.key});
  @override
  State<SInscrireScreen> createState() => _SInscrireScreenState();
}

class _SInscrireScreenState extends State<SInscrireScreen> {
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _register() async {
    final email = _emailCtrl.text.trim();
    final pass = _passCtrl.text;
    final confirm = _confirmCtrl.text;
    if (email.isEmpty || pass.isEmpty) {
      setState(() => _error = 'Veuillez remplir tous les champs');
      return;
    }
    if (pass != confirm) {
      setState(() => _error = 'Les mots de passe ne correspondent pas');
      return;
    }
    if (pass.length < 6) {
      setState(() => _error = 'Mot de passe trop court (min. 6 caractères)');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final parts = email.split('@');
      final first = parts.first.isNotEmpty ? parts.first : 'User';
      await AuthService.instance.register(
        email: email,
        password: pass,
        firstName: first,
        lastName: 'Traveo',
      );
      if (!mounted) return;
      Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => const PrivacyPolicyScreen()),
          (_) => false);
      Future.microtask(() {
        if (!mounted) return;
        Navigator.pushReplacement(
            context, MaterialPageRoute(builder: (_) => const MainNavScreen()));
      });
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = 'Inscription échouée. Réessayez.');
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
              const SizedBox(height: 48),
              const TraveoLogoLarge(size: 70),
              const SizedBox(height: 24),
              _card([
                _f('Email address', ctrl: _emailCtrl),
                _f('Create password', obs: true, ctrl: _passCtrl),
                _f('Confirm password', obs: true, ctrl: _confirmCtrl),
              ]),
              if (_error != null) ...[
                const SizedBox(height: 10),
                Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                        color: Colors.red.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10)),
                    child: Text(_error!,
                        style: const TextStyle(
                            color: Colors.redAccent, fontSize: 13))),
              ],
              const SizedBox(height: 24),
              Row(children: [
                Expanded(
                    child: SizedBox(
                        height: 50,
                        child: ElevatedButton(
                            onPressed: _loading ? null : _register,
                            child: _loading
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2, color: Colors.white))
                                : const Text('Create',
                                    style: TextStyle(
                                        fontWeight: FontWeight.bold))))),
                const SizedBox(width: 14),
                Expanded(
                    child: _outlineBtn(
                        'Pro Account',
                        () => Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (_) => const SInscrireProScreen())))),
              ]),
              const SizedBox(height: 32),
              const Text('Sign Up With',
                  style: TextStyle(color: AppColors.textDark, fontSize: 13)),
              const SizedBox(height: 18),
              _social(Icons.g_mobiledata_rounded, const Color(0xFF4285F4)),
              const SizedBox(height: 12),
              _social(Icons.apple, Colors.white, fg: Colors.black),
              const SizedBox(height: 40),
            ]),
          ),
        ),
      ),
    );
  }
}

class SInscrireProScreen extends StatefulWidget {
  const SInscrireProScreen({super.key});
  @override
  State<SInscrireProScreen> createState() => _SInscrireProScreenState();
}

class _SInscrireProScreenState extends State<SInscrireProScreen> {
  int _step = 0; // 0 = account info, 1 = profile info
  final _pageCtrl = PageController();
  bool _loading = false;
  String? _error;

  // Step 0 — account
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();

  // Step 1 — public profile
  final _handleCtrl = TextEditingController();
  final _bioCtrl = TextEditingController();
  final _locationCtrl = TextEditingController();
  final _serviceTypeCtrl = TextEditingController(); // kept for dispose compat
  final _tradeRegCtrl = TextEditingController();

  final Set<String> _selectedServices = {};
  static const _serviceTypes = [
    {
      'label': 'City Guide & Experience',
      'icon': Icons.tour_rounded,
      'color': 0xFF1DB954
    },
    {
      'label': 'Beach & Water Experience',
      'icon': Icons.pool_rounded,
      'color': 0xFF00BCD4
    },
    {
      'label': 'Wildlife Safari Guide',
      'icon': Icons.pets_rounded,
      'color': 0xFF8D6E63
    },
    {
      'label': 'Cultural Guide',
      'icon': Icons.museum_rounded,
      'color': 0xFFF5A623
    },
    {
      'label': 'Adventure Trek Guide',
      'icon': Icons.terrain_rounded,
      'color': 0xFF4CAF50
    },
    {
      'label': 'Hotel & Accommodation',
      'icon': Icons.hotel_rounded,
      'color': 0xFF00ACC1
    },
    {
      'label': 'Restaurant & Food Tour',
      'icon': Icons.restaurant_rounded,
      'color': 0xFFFF7043
    },
    {
      'label': 'Event & Festival Guide',
      'icon': Icons.event_rounded,
      'color': 0xFF7E57C2
    },
    {
      'label': 'Photography Guide',
      'icon': Icons.camera_alt_rounded,
      'color': 0xFFEC407A
    },
    {
      'label': 'Transport & Transfers',
      'icon': Icons.directions_car_rounded,
      'color': 0xFF42A5F5
    },
    {'label': 'Wellness & Spa', 'icon': Icons.spa_rounded, 'color': 0xFF26A69A},
    {'label': 'Other', 'icon': Icons.more_horiz_rounded, 'color': 0xFF78909C},
  ];

  @override
  void dispose() {
    _pageCtrl.dispose();
    for (final c in [
      _nameCtrl,
      _emailCtrl,
      _phoneCtrl,
      _passCtrl,
      _confirmCtrl,
      _handleCtrl,
      _bioCtrl,
      _locationCtrl,
      _serviceTypeCtrl,
      _tradeRegCtrl
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _next() async {
    if (_step == 0) {
      // Validate step-0 fields before advancing
      if (_nameCtrl.text.trim().isEmpty ||
          _emailCtrl.text.trim().isEmpty ||
          _passCtrl.text.isEmpty) {
        setState(() => _error = 'Veuillez remplir tous les champs requis');
        return;
      }
      if (_passCtrl.text != _confirmCtrl.text) {
        setState(() => _error = 'Les mots de passe ne correspondent pas');
        return;
      }
      if (_passCtrl.text.length < 6) {
        setState(() => _error = 'Mot de passe trop court (min. 6 caractères)');
        return;
      }
      setState(() {
        _error = null;
        _step = 1;
      });
      _pageCtrl.nextPage(
          duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
      return;
    }

    if (_selectedServices.isEmpty) {
      setState(() => _error = 'Sélectionnez au moins un service');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      // 1. Create user account
      final name = _nameCtrl.text.trim();
      final parts = name.split(' ');
      final firstName = parts.first;
      final lastName = parts.length > 1 ? parts.sublist(1).join(' ') : 'Pro';
      await AuthService.instance.register(
        email: _emailCtrl.text.trim(),
        password: _passCtrl.text,
        firstName: firstName,
        lastName: lastName,
        phone: _phoneCtrl.text.trim().isEmpty ? null : _phoneCtrl.text.trim(),
      );

      // 2. Upgrade to provider
      final businessType = _selectedServices.first;
      final description = [
        if (_bioCtrl.text.trim().isNotEmpty) _bioCtrl.text.trim(),
        if (_locationCtrl.text.trim().isNotEmpty)
          'Location: ${_locationCtrl.text.trim()}',
        if (_handleCtrl.text.trim().isNotEmpty)
          'Handle: @${_handleCtrl.text.trim()}',
        if (_tradeRegCtrl.text.trim().isNotEmpty)
          'Trade Register: ${_tradeRegCtrl.text.trim()}',
        if (_selectedServices.length > 1)
          'Services: ${_selectedServices.join(', ')}',
      ].join('\n');
      await AuthService.instance.registerProvider(
        companyName: name,
        businessType: businessType,
        description: description.isEmpty ? null : description,
      );

      if (!mounted) return;
      Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => const MainNavProScreen()),
          (_) => false);
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (_) {
      setState(() => _error = 'Création du compte Pro échouée. Réessayez.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _back() {
    if (_step == 1) {
      setState(() => _step = 0);
      _pageCtrl.previousPage(
          duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
    } else {
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.gradientRadial),
        child: SafeArea(
          child: Column(children: [
            // ── Top bar ──────────────────────────────────────────────────────
            Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                child: Row(children: [
                  GestureDetector(
                      onTap: _back,
                      child: Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(10)),
                          child: const Icon(Icons.arrow_back_ios_rounded,
                              color: Colors.white, size: 16))),
                  const Spacer(),
                  Stack(alignment: Alignment.center, children: [
                    const TraveoLogoLarge(size: 40),
                    Positioned(
                        right: 0,
                        top: 0,
                        child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                                color: AppColors.primary,
                                borderRadius: BorderRadius.circular(6)),
                            child: const Text('PRO',
                                style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold)))),
                  ]),
                  const Spacer(),
                  const SizedBox(width: 36),
                ])),

            // ── Step indicator ───────────────────────────────────────────────
            Padding(
                padding: const EdgeInsets.fromLTRB(32, 16, 32, 0),
                child: Row(children: [
                  _stepDot(0, 'Account'),
                  Expanded(
                      child: Container(
                          height: 2,
                          color:
                              _step >= 1 ? AppColors.primary : Colors.white24)),
                  _stepDot(1, 'Profile'),
                ])),

            // ── Page content ─────────────────────────────────────────────────
            Expanded(
                child: PageView(
              controller: _pageCtrl,
              physics: const NeverScrollableScrollPhysics(),
              children: [_step0(), _step1()],
            )),
          ]),
        ),
      ),
    );
  }

  Widget _stepDot(int step, String label) =>
      Column(mainAxisSize: MainAxisSize.min, children: [
        Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _step >= step ? AppColors.primary : Colors.white24,
                border: Border.all(
                    color: _step >= step ? AppColors.primary : Colors.white38,
                    width: 1.5)),
            child: Center(
                child: _step > step
                    ? const Icon(Icons.check_rounded,
                        color: Colors.white, size: 14)
                    : Text('${step + 1}',
                        style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w700)))),
        const SizedBox(height: 4),
        Text(label,
            style: TextStyle(
                color: _step >= step ? AppColors.primary : Colors.white54,
                fontSize: 10,
                fontWeight: FontWeight.w600)),
      ]);

  Widget _step0() => SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(32, 20, 32, 32),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Account Details',
            style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w800,
                fontSize: 18)),
        const SizedBox(height: 4),
        const Text('Basic login info for your Pro account',
            style: TextStyle(color: Colors.white54, fontSize: 12)),
        const SizedBox(height: 20),
        _card([
          _f('Provider / Business Name', ctrl: _nameCtrl),
          _f('Email address', ctrl: _emailCtrl),
          _f('Phone number', ctrl: _phoneCtrl),
          _f('Create password', obs: true, ctrl: _passCtrl),
          _f('Confirm password', obs: true, ctrl: _confirmCtrl),
        ]),
        const SizedBox(height: 20),
        if (_error != null && _step == 0) ...[
          const SizedBox(height: 10),
          Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                  color: Colors.red.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10)),
              child: Text(_error!,
                  style:
                      const TextStyle(color: Colors.redAccent, fontSize: 13))),
        ],
        _greenBtn('Next — Profile Setup', _next),
      ]));

  Widget _step1() => SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(32, 20, 32, 32),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Public Profile',
            style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w800,
                fontSize: 18)),
        const SizedBox(height: 4),
        const Text('This is what travelers see when they visit your profile',
            style: TextStyle(color: Colors.white54, fontSize: 12)),
        const SizedBox(height: 20),

        // Profile preview card
        Container(
            padding: const EdgeInsets.all(16),
            margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                    color: AppColors.primary.withValues(alpha: 0.4))),
            child: Row(children: [
              Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.primary, width: 2),
                      gradient: const LinearGradient(
                          colors: [Color(0xFF1DB954), Color(0xFF4F46E5)])),
                  child: const Center(
                      child: Icon(Icons.person_rounded,
                          color: Colors.white, size: 28))),
              const SizedBox(width: 12),
              Expanded(
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                    Row(children: [
                      const Text('Your Name',
                          style: TextStyle(
                              color: Colors.white70,
                              fontSize: 13,
                              fontWeight: FontWeight.w700)),
                      const SizedBox(width: 6),
                      Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 5, vertical: 2),
                          decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(4)),
                          child: const Text('PRO',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 8,
                                  fontWeight: FontWeight.w800))),
                    ]),
                    const Text('@yourhandle',
                        style: TextStyle(color: Colors.white38, fontSize: 11)),
                    const SizedBox(height: 4),
                    Row(children: [
                      _miniStat(Icons.people_rounded, '0 Followers'),
                      const SizedBox(width: 12),
                      _miniStat(Icons.star_rounded, '5.0 Rating'),
                    ]),
                  ])),
            ])),

        _card([
          // Social handle
          _fieldWithIcon(
              Icons.alternate_email_rounded, '@Handle / Username', _handleCtrl,
              hint: 'e.g. camtourspro'),
          // Bio
          _fieldWithIcon(
              Icons.edit_note_rounded, 'Bio (shown on your profile)', _bioCtrl,
              hint:
                  'Tell travelers about yourself, your specialty & experience...',
              maxLines: 3),
          // Location
          _fieldWithIcon(
              Icons.location_on_rounded, 'Base Location', _locationCtrl,
              hint: 'e.g. Yaoundé, Cameroon'),
          // Service type multi-select
          _multiServiceSelect(),
          // Trade register
          _fieldWithIcon(
              Icons.badge_rounded, 'Trade Register Number', _tradeRegCtrl,
              hint: 'Official business registration'),
        ]),
        const SizedBox(height: 8),
        Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                    color: AppColors.primary.withValues(alpha: 0.3))),
            child: const Row(children: [
              Icon(Icons.info_outline_rounded,
                  color: AppColors.primary, size: 16),
              SizedBox(width: 8),
              Expanded(
                  child: Text(
                      'Your bio, followers, and rating will be visible to all travelers browsing your profile and videos.',
                      style: TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 11,
                          height: 1.4))),
            ])),
        if (_error != null) ...[
          const SizedBox(height: 10),
          Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                  color: Colors.red.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10)),
              child: Text(_error!,
                  style:
                      const TextStyle(color: Colors.redAccent, fontSize: 13))),
        ],
        const SizedBox(height: 20),
        SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
                onPressed: _loading ? null : _next,
                child: _loading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white))
                    : const Text('Create Pro Account',
                        style: TextStyle(fontWeight: FontWeight.bold)))),
      ]));

  Widget _miniStat(IconData icon, String label) =>
      Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, color: AppColors.primary, size: 11),
        const SizedBox(width: 3),
        Text(label,
            style: const TextStyle(color: Colors.white54, fontSize: 10)),
      ]);

  Widget _multiServiceSelect() => Container(
        margin: const EdgeInsets.only(bottom: 13),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            const Icon(Icons.category_rounded,
                color: AppColors.primary, size: 16),
            const SizedBox(width: 8),
            const Text('Services Offered',
                style: TextStyle(color: Colors.white70, fontSize: 12)),
            const Spacer(),
            if (_selectedServices.isNotEmpty)
              Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(10)),
                  child: Text('${_selectedServices.length} selected',
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w700))),
          ]),
          const SizedBox(height: 4),
          const Text('Select all that apply (minimum 1)',
              style: TextStyle(color: Colors.white38, fontSize: 10)),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _serviceTypes.map((s) {
              final label = s['label'] as String;
              final icon = s['icon'] as IconData;
              final color = Color(s['color'] as int);
              final selected = _selectedServices.contains(label);
              return GestureDetector(
                onTap: () => setState(() {
                  if (selected) {
                    _selectedServices.remove(label);
                  } else {
                    _selectedServices.add(label);
                  }
                }),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                  decoration: BoxDecoration(
                      color: selected
                          ? color.withValues(alpha: 0.18)
                          : Colors.white.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                          color: selected ? color : Colors.white24,
                          width: selected ? 1.5 : 1)),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    Icon(icon,
                        color: selected ? color : Colors.white38, size: 14),
                    const SizedBox(width: 5),
                    Text(label,
                        style: TextStyle(
                            color: selected ? color : Colors.white54,
                            fontSize: 11,
                            fontWeight:
                                selected ? FontWeight.w700 : FontWeight.w500)),
                    if (selected) ...[
                      const SizedBox(width: 4),
                      Icon(Icons.check_circle_rounded, color: color, size: 12),
                    ],
                  ]),
                ),
              );
            }).toList(),
          ),
        ]),
      );

  Widget _fieldWithIcon(IconData icon, String label, TextEditingController ctrl,
          {String? hint, bool obs = false, int maxLines = 1}) =>
      Container(
          margin: const EdgeInsets.only(bottom: 13),
          child: TextField(
              controller: ctrl,
              obscureText: obs,
              maxLines: maxLines,
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                  hintText: hint ?? label,
                  labelText: label,
                  labelStyle:
                      const TextStyle(color: Colors.white54, fontSize: 12),
                  prefixIcon: Icon(icon, color: AppColors.primary, size: 18),
                  floatingLabelBehavior: FloatingLabelBehavior.auto)));
}

// ── helpers ────────────────────────────────────────────────────────────────
Widget _card(List<Widget> c) => Container(
    padding: const EdgeInsets.all(20),
    decoration: BoxDecoration(
        color: AppColors.bgCard.withValues(alpha: 0.75),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.5))),
    child: Column(children: c));

Widget _f(String h, {bool obs = false, TextEditingController? ctrl}) =>
    Container(
        margin: const EdgeInsets.only(bottom: 13),
        child: TextField(
            controller: ctrl,
            obscureText: obs,
            style: const TextStyle(color: Colors.white, fontSize: 14),
            decoration: InputDecoration(hintText: h)));

Widget _greenBtn(String l, VoidCallback t) => SizedBox(
    width: double.infinity,
    height: 50,
    child: ElevatedButton(
        onPressed: t,
        child: Text(l, style: const TextStyle(fontWeight: FontWeight.bold))));

Widget _outlineBtn(String l, VoidCallback t) => SizedBox(
    height: 50,
    child: OutlinedButton(
        onPressed: t,
        style: OutlinedButton.styleFrom(
            side: const BorderSide(color: AppColors.primary),
            foregroundColor: AppColors.primary,
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30))),
        child: Text(l,
            style:
                const TextStyle(fontSize: 13, fontWeight: FontWeight.w600))));

Widget _social(IconData i, Color bg, {Color fg = Colors.white}) => Container(
    width: 58,
    height: 58,
    decoration: BoxDecoration(shape: BoxShape.circle, color: bg, boxShadow: [
      BoxShadow(
          color: bg.withValues(alpha: 0.4), blurRadius: 12, spreadRadius: 2)
    ]),
    child: Icon(i, color: fg, size: 30));
