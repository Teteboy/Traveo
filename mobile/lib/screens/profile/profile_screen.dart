import 'package:flutter/material.dart';
import '../../widgets/common_widgets.dart';
import '../../theme/app_theme.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../auth/se_connecter_screen.dart';
import '../pro/notifications_screen.dart';
import '../wallet/wallet_screen.dart';
import '../pro/settings_screen.dart';
import '../discover/discover_screen.dart'
    show globalFollowState, globalUploadedVideos;

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _locCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  bool _editing = false;
  bool _saving = false;

  // Social metrics — seeded with realistic values
  final int _followers = 142;
  final int _totalViews = 4800;

  // Derived: count of posts by this user in the global feed
  int get _postCount =>
      globalUploadedVideos.where((v) => v.uploader == _nameCtrl.text).length;

  @override
  void initState() {
    super.initState();
    _hydrateFromAuth();
  }

  void _hydrateFromAuth() {
    final user = AuthService.instance.currentUser;
    if (user == null) return;
    _nameCtrl.text =
        user['fullName']?.toString() ?? user['email']?.toString() ?? '';
    _emailCtrl.text = user['email']?.toString() ?? '';
    _phoneCtrl.text = user['phone']?.toString() ?? '';
    _cityCtrl.text = user['country']?.toString() ?? '';
  }

  Future<void> _saveProfile() async {
    setState(() => _saving = true);
    try {
      final parts = _nameCtrl.text.trim().split(' ');
      final firstName = parts.first;
      final lastName = parts.length > 1 ? parts.sublist(1).join(' ') : '';
      await ApiService.instance.updateMe({
        if (firstName.isNotEmpty) 'firstName': firstName,
        if (lastName.isNotEmpty) 'lastName': lastName,
        if (_phoneCtrl.text.trim().isNotEmpty) 'phone': _phoneCtrl.text.trim(),
        if (_cityCtrl.text.trim().isNotEmpty) 'country': _cityCtrl.text.trim(),
      });
      await AuthService.instance.refreshMe();
      if (!mounted) return;
      _hydrateFromAuth();
      setState(() => _editing = false);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Profile updated'),
          backgroundColor: AppColors.primary));
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message), backgroundColor: Colors.red));
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Update failed'), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _logout() async {
    await AuthService.instance.logout();
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const SeConnecterScreen()),
        (_) => false);
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _locCtrl.dispose();
    _cityCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: CustomScrollView(slivers: [
        SliverToBoxAdapter(child: _topBanner()),
        SliverToBoxAdapter(child: _metricsRow()),
        SliverToBoxAdapter(
            child: _section('Personal Information', [
          _row('Email address', _emailCtrl),
          _row('Phone number', _phoneCtrl),
          _row('Location', _locCtrl),
          _row('Country, home city', _cityCtrl),
        ])),
        SliverToBoxAdapter(
            child: _section('Account Security', [
          _row('Email address', TextEditingController()),
          _row('Phone number', TextEditingController()),
          _row('Location', TextEditingController()),
        ])),
        SliverToBoxAdapter(child: _logoutSection()),
        const SliverToBoxAdapter(child: SizedBox(height: 32)),
      ]),
    );
  }

  Widget _logoutSection() => Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
      child: SizedBox(
          width: double.infinity,
          height: 50,
          child: OutlinedButton.icon(
              onPressed: _logout,
              icon: const Icon(Icons.logout_rounded,
                  color: Colors.redAccent, size: 18),
              label: const Text('Log out',
                  style: TextStyle(
                      color: Colors.redAccent,
                      fontWeight: FontWeight.w700,
                      fontSize: 14)),
              style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.redAccent),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14))))));

  Widget _topBanner() {
    return Stack(children: [
      Container(
          height: 180,
          width: double.infinity,
          decoration: const BoxDecoration(
              gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Color(0xFF4F46E5), Color(0xFF8B5CF6)]))),
      SafeArea(
          child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(children: [
                const TraveoLogoWidget(),
                const Spacer(),
                GestureDetector(
                    onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const SettingsScreen())),
                    child: Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(10)),
                        child: const Icon(Icons.settings_rounded,
                            color: Colors.white, size: 18))),
                const SizedBox(width: 8),
                GestureDetector(
                    onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const WalletScreen())),
                    child: Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(10)),
                        child: const Icon(Icons.account_balance_wallet_rounded,
                            color: Colors.white, size: 18))),
                const SizedBox(width: 8),
                GestureDetector(
                    onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const NotificationsScreen())),
                    child: Stack(children: [
                      Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(10)),
                          child: const Icon(Icons.notifications_rounded,
                              color: Colors.white, size: 18)),
                      Positioned(
                          top: 2,
                          right: 2,
                          child: Container(
                              padding: const EdgeInsets.all(2.5),
                              decoration: const BoxDecoration(
                                  color: AppColors.alert,
                                  shape: BoxShape.circle),
                              child: const Text('2',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 7,
                                      fontWeight: FontWeight.bold)))),
                    ])),
              ]))),
      Positioned(
          bottom: 0,
          left: 0,
          right: 0,
          child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
              child: Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
                Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.bgCard,
                        border: Border.all(color: Colors.white, width: 3),
                        gradient: const LinearGradient(
                            colors: [Color(0xFFE8B86D), Color(0xFFD4A050)])),
                    child: const Icon(Icons.person_rounded,
                        color: Colors.white, size: 44)),
                const SizedBox(width: 12),
                Expanded(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                      Text(_nameCtrl.text,
                          style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w900,
                              fontSize: 22)),
                      const Text('Travel Enthusiast',
                          style:
                              TextStyle(color: Colors.white70, fontSize: 12)),
                    ])),
                GestureDetector(
                    onTap: _saving
                        ? null
                        : () {
                            if (_editing) {
                              _saveProfile();
                            } else {
                              setState(() => _editing = true);
                            }
                          },
                    child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(10)),
                        child: _saving
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2, color: Colors.white))
                            : Icon(
                                _editing
                                    ? Icons.check_rounded
                                    : Icons.edit_rounded,
                                color: Colors.white,
                                size: 18))),
              ]))),
    ]);
  }

  Widget _metricsRow() {
    final followersFromGlobal = globalFollowState.values.where((v) => v).length;
    final displayFollowers = _followers + followersFromGlobal;
    return Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
        child: Row(children: [
          _metricBox('$displayFollowers', 'Followers', Icons.people_rounded,
              AppColors.primary),
          const SizedBox(width: 10),
          _metricBox(
              _totalViews >= 1000
                  ? '${(_totalViews / 1000).toStringAsFixed(1)}K'
                  : '$_totalViews',
              'Views',
              Icons.visibility_rounded,
              const Color(0xFF8B5CF6)),
          const SizedBox(width: 10),
          _metricBox('$_postCount', 'Posts', Icons.grid_on_rounded,
              const Color(0xFF1DB954)),
        ]));
  }

  Widget _metricBox(String value, String label, IconData icon, Color color) =>
      Expanded(
          child: Container(
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: color.withValues(alpha: 0.25)),
                  boxShadow: [
                    BoxShadow(color: AppColors.cardShadow, blurRadius: 4)
                  ]),
              child: Column(children: [
                Icon(icon, color: color, size: 18),
                const SizedBox(height: 6),
                Text(value,
                    style: TextStyle(
                        color: color,
                        fontWeight: FontWeight.w900,
                        fontSize: 18)),
                const SizedBox(height: 2),
                Text(label,
                    style: const TextStyle(
                        color: AppColors.textGrey, fontSize: 10)),
              ])));

  Widget _section(String title, List<Widget> rows) => Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Text(title,
                style: const TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w700,
                    fontSize: 14))),
        Container(
            decoration: BoxDecoration(
                color: AppColors.bgCard,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.cardBorder),
                boxShadow: [
                  BoxShadow(
                      color: AppColors.cardShadow,
                      blurRadius: 6,
                      offset: const Offset(0, 2))
                ]),
            child: Column(children: rows)),
      ]));

  Widget _row(String label, TextEditingController ctrl) => Column(children: [
        Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(children: [
              Expanded(
                  child: _editing
                      ? TextField(
                          controller: ctrl,
                          style: const TextStyle(
                              color: AppColors.textDark, fontSize: 14),
                          decoration: InputDecoration(
                              hintText: label,
                              border: InputBorder.none,
                              contentPadding: EdgeInsets.zero))
                      : Text(ctrl.text.isEmpty ? label : ctrl.text,
                          style: TextStyle(
                              color: ctrl.text.isEmpty
                                  ? AppColors.textLight
                                  : AppColors.textDark,
                              fontSize: 14))),
            ])),
        Divider(
            height: 1, color: AppColors.cardBorder, indent: 16, endIndent: 16),
      ]);
}
