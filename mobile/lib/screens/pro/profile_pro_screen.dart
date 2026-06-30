import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import 'notifications_screen.dart';
import 'settings_screen.dart';
import '../wallet/pro_wallet_screen.dart';

class ProfileProScreen extends StatefulWidget {
  const ProfileProScreen({super.key});
  @override State<ProfileProScreen> createState() => _State();
}

class _State extends State<ProfileProScreen> {
  bool _editing = false;

  // Business Information — persistent controllers
  final _name    = TextEditingController(text: 'Horizon Travel Agency');
  final _email   = TextEditingController(text: 'contact@horizontravel.cm');
  final _phone   = TextEditingController(text: '+237 699 999 999');
  final _loc     = TextEditingController(text: 'Yaoundé, Centre');
  final _country = TextEditingController(text: 'Cameroon');
  final _website = TextEditingController(text: 'www.horizontravel.cm');
  final _bio     = TextEditingController(
      text: 'Your trusted partner for tours, adventures, and travel experiences across Cameroon and beyond.');

  // Security
  final _secEmail = TextEditingController(text: 'admin@horizontravel.cm');
  final _secPhone = TextEditingController(text: '+237 677 000 000');

  // Business Credentials
  final _regNum  = TextEditingController(text: 'RC/YAO/2021/B/1234');
  final _license = TextEditingController(text: 'AGT-CM-2021-0078');

  @override
  void dispose() {
    for (final c in [_name, _email, _phone, _loc, _country, _website, _bio,
        _secEmail, _secPhone, _regNum, _license]) { c.dispose(); }
    super.dispose();
  }

  void _toggleEdit() {
    if (_editing) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Profile updated successfully!'),
        backgroundColor: AppColors.bgCard));
    }
    setState(() => _editing = !_editing);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: CustomScrollView(slivers: [
        SliverToBoxAdapter(child: _topBanner()),
        SliverToBoxAdapter(child: _section('Business Information', [
          _row('Agency Name',    _name,    Icons.business_rounded),
          _row('Email',          _email,   Icons.email_rounded, type: TextInputType.emailAddress),
          _row('Phone',          _phone,   Icons.phone_rounded,  type: TextInputType.phone),
          _row('Location',       _loc,     Icons.location_on_rounded),
          _row('Country / City', _country, Icons.flag_rounded),
          _row('Website',        _website, Icons.language_rounded),
          _rowMulti('About / Bio', _bio),
        ])),
        SliverToBoxAdapter(child: _section('Account Security', [
          _row('Recovery Email', _secEmail, Icons.mark_email_read_rounded, type: TextInputType.emailAddress),
          _row('Recovery Phone', _secPhone, Icons.phone_forwarded_rounded, type: TextInputType.phone),
          if (!_editing) _changePasswordTile(),
        ])),
        SliverToBoxAdapter(child: _section('Business Credentials', [
          _row('Trade Register No.', _regNum,  Icons.receipt_long_rounded),
          _row('Agency License No.', _license, Icons.verified_rounded),
        ])),
        SliverToBoxAdapter(child: _verificationSection()),
        const SliverToBoxAdapter(child: SizedBox(height: 32)),
      ]),
    );
  }

  Widget _topBanner() => Stack(children: [
    Container(height: 200, width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight,
          colors: [Color(0xFF4F46E5), Color(0xFF8B5CF6)]))),
    SafeArea(child: Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(children: [
        Container(width: 36, height: 36,
          decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(10)),
          child: const Icon(Icons.business_center_rounded, color: Colors.white, size: 18)),
        const Spacer(),
        GestureDetector(
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SettingsScreen())),
          child: Container(width: 36, height: 36,
            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(10)),
            child: const Icon(Icons.settings_rounded, color: Colors.white, size: 18))),
        const SizedBox(width: 8),
        GestureDetector(
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ProWalletScreen())),
          child: Container(width: 36, height: 36,
            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(10)),
            child: const Icon(Icons.account_balance_wallet_rounded, color: Colors.white, size: 18))),
        const SizedBox(width: 8),
        GestureDetector(
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen())),
          child: Stack(children: [
            Container(width: 36, height: 36,
              decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.notifications_rounded, color: Colors.white, size: 18)),
            Positioned(top: 2, right: 2, child: Container(
              padding: const EdgeInsets.all(2.5),
              decoration: const BoxDecoration(color: AppColors.alert, shape: BoxShape.circle),
              child: const Text('2', style: TextStyle(
                  color: Colors.white, fontSize: 7, fontWeight: FontWeight.bold)))),
          ])),
      ]))),
    Positioned(bottom: 0, left: 0, right: 0,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
        child: Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Stack(clipBehavior: Clip.none, children: [
            Container(width: 80, height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 3),
                gradient: const LinearGradient(
                  colors: [Color(0xFF4F46E5), Color(0xFF8B5CF6)]))),
            Positioned(bottom: -2, right: -2,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.primary, borderRadius: BorderRadius.circular(6)),
                child: const Text('PRO', style: TextStyle(
                    color: Colors.white, fontSize: 8, fontWeight: FontWeight.w800)))),
          ]),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(_name.text, style: const TextStyle(
                color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20)),
            const Text('Travel Agency · Pro Account',
              style: TextStyle(color: Colors.white70, fontSize: 11)),
          ])),
          GestureDetector(
            onTap: _toggleEdit,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: _editing ? AppColors.primary : Colors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(10)),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(_editing ? Icons.check_rounded : Icons.edit_rounded,
                    color: Colors.white, size: 16),
                const SizedBox(width: 4),
                Text(_editing ? 'Save' : 'Edit',
                    style: const TextStyle(color: Colors.white,
                        fontSize: 12, fontWeight: FontWeight.w700)),
              ]))),
        ]))),
  ]);

  Widget _section(String title, List<Widget> rows) => Padding(
    padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(padding: const EdgeInsets.only(bottom: 10),
        child: Text(title, style: const TextStyle(
            color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 14))),
      Container(
        decoration: BoxDecoration(color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder),
          boxShadow: [BoxShadow(color: AppColors.cardShadow,
              blurRadius: 6, offset: const Offset(0, 2))]),
        child: Column(children: rows)),
    ]));

  Widget _row(String label, TextEditingController ctrl, IconData icon,
      {TextInputType type = TextInputType.text}) =>
    Column(children: [
      Padding(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(children: [
          Icon(icon, color: AppColors.primary, size: 18),
          const SizedBox(width: 12),
          Expanded(child: _editing
            ? TextField(
                controller: ctrl, keyboardType: type,
                style: const TextStyle(color: AppColors.textDark, fontSize: 14),
                decoration: InputDecoration(hintText: label,
                  hintStyle: const TextStyle(color: AppColors.textGrey),
                  border: InputBorder.none, contentPadding: EdgeInsets.zero))
            : Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(label, style: const TextStyle(
                    color: AppColors.textGrey, fontSize: 10)),
                const SizedBox(height: 2),
                Text(ctrl.text.isEmpty ? '—' : ctrl.text,
                    style: const TextStyle(color: AppColors.textDark, fontSize: 14)),
              ])),
          if (_editing)
            const Icon(Icons.edit_rounded, color: AppColors.textGrey, size: 14),
        ])),
      Divider(height: 1, color: AppColors.cardBorder, indent: 16, endIndent: 16),
    ]);

  Widget _rowMulti(String label, TextEditingController ctrl) =>
    Padding(padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          const Icon(Icons.info_outline_rounded, color: AppColors.primary, size: 18),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(color: AppColors.textGrey, fontSize: 10)),
        ]),
        const SizedBox(height: 8),
        _editing
          ? TextField(controller: ctrl, maxLines: 4,
              style: const TextStyle(color: AppColors.textDark, fontSize: 13),
              decoration: InputDecoration(hintText: label,
                hintStyle: const TextStyle(color: AppColors.textGrey),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide(color: AppColors.cardBorder)),
                contentPadding: const EdgeInsets.all(12)))
          : Text(ctrl.text.isEmpty ? '—' : ctrl.text,
              style: const TextStyle(color: AppColors.textDark, fontSize: 13, height: 1.5)),
      ]));

  Widget _changePasswordTile() => GestureDetector(
    onTap: _changePasswordSheet,
    child: Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(children: [
        const Icon(Icons.lock_rounded, color: AppColors.primary, size: 18),
        const SizedBox(width: 12),
        const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Password', style: TextStyle(color: AppColors.textGrey, fontSize: 10)),
          SizedBox(height: 2),
          Text('••••••••', style: TextStyle(color: AppColors.textDark, fontSize: 14)),
        ])),
        const Text('Change', style: TextStyle(
            color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.w700)),
      ])));

  void _changePasswordSheet() {
    final cur = TextEditingController();
    final nw  = TextEditingController();
    final cfm = TextEditingController();
    showModalBottomSheet(context: context, isScrollControlled: true,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
            left: 24, right: 24, top: 24),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(width: 40, height: 4, margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(color: AppColors.cardBorder,
                borderRadius: BorderRadius.circular(2))),
          const Text('Change Password', style: TextStyle(
              color: AppColors.textDark, fontWeight: FontWeight.w800, fontSize: 18)),
          const SizedBox(height: 20),
          _pwField('Current password', cur),
          _pwField('New password', nw),
          _pwField('Confirm new password', cfm),
          const SizedBox(height: 16),
          SizedBox(width: double.infinity, height: 50,
            child: ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                  content: Text('Password updated successfully!'),
                  backgroundColor: AppColors.bgCard));
              },
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              child: const Text('Update Password',
                  style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)))),
          const SizedBox(height: 8),
        ])));
  }

  Widget _pwField(String hint, TextEditingController ctrl) => Container(
    margin: const EdgeInsets.only(bottom: 12),
    decoration: BoxDecoration(color: AppColors.bgDark,
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: AppColors.cardBorder)),
    child: TextField(controller: ctrl, obscureText: true,
      style: const TextStyle(color: AppColors.textDark),
      decoration: InputDecoration(hintText: hint,
        hintStyle: const TextStyle(color: AppColors.textGrey),
        prefixIcon: const Icon(Icons.lock_rounded, color: AppColors.primary, size: 18),
        border: InputBorder.none,
        contentPadding: const EdgeInsets.symmetric(vertical: 14))));

  Widget _verificationSection() => Padding(
    padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Padding(padding: EdgeInsets.only(bottom: 10),
        child: Text('Verification & Compliance', style: TextStyle(
            color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 14))),
      Container(
        decoration: BoxDecoration(color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder)),
        child: Column(children: [
          _vRow(Icons.verified_user_rounded, 'Identity Verification',  'Verified',        true),
          Divider(height: 1, color: AppColors.cardBorder, indent: 16, endIndent: 16),
          _vRow(Icons.description_rounded,   'Business Registration',  'Verified',        true),
          Divider(height: 1, color: AppColors.cardBorder, indent: 16, endIndent: 16),
          _vRow(Icons.assignment_rounded,    'Service Approval',       'Pending Review',  false),
          Divider(height: 1, color: AppColors.cardBorder, indent: 16, endIndent: 16),
          _vRow(Icons.upload_file_rounded,   'Professional Documents', 'Upload Required', false),
          Padding(padding: const EdgeInsets.all(16),
            child: SizedBox(width: double.infinity, height: 42,
              child: ElevatedButton(onPressed: () {},
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                child: const Text('Upload Documents',
                    style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white))))),
        ])),
    ]));

  Widget _vRow(IconData icon, String label, String status, bool done) => Padding(
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    child: Row(children: [
      Icon(icon, color: done ? AppColors.primary : AppColors.textGrey, size: 20),
      const SizedBox(width: 12),
      Expanded(child: Text(label, style: const TextStyle(color: Colors.white, fontSize: 14))),
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: done
              ? AppColors.primary.withValues(alpha: 0.15)
              : Colors.orange.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(20)),
        child: Text(status, style: TextStyle(
          color: done ? AppColors.primary : Colors.orange,
          fontSize: 10, fontWeight: FontWeight.w700))),
    ]));
}
