import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import 'wallet_state.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});
  @override State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tab;
  final _depositCtrl = TextEditingController();
  final _transferCtrl = TextEditingController();
  final _recipientCtrl = TextEditingController();

  @override
  void initState() { super.initState(); _tab = TabController(length: 3, vsync: this); }

  @override
  void dispose() {
    _tab.dispose();
    _depositCtrl.dispose(); _transferCtrl.dispose(); _recipientCtrl.dispose();
    super.dispose();
  }

  IconData _txIcon(String key) {
    switch (key) {
      case 'flight':  return Icons.airplanemode_active_rounded;
      case 'tour':    return Icons.hiking_rounded;
      case 'send':    return Icons.send_rounded;
      case 'receive': return Icons.call_received_rounded;
      default:        return Icons.add_circle_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Column(children: [
        _header(),
        _balanceCard(),
        Container(
          color: AppColors.bgCard,
          child: TabBar(
            controller: _tab,
            indicatorColor: AppColors.primary,
            labelColor: AppColors.primary,
            unselectedLabelColor: AppColors.textGrey,
            labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12),
            tabs: const [Tab(text: 'History'), Tab(text: 'Deposit'), Tab(text: 'Transfer')])),
        Expanded(child: TabBarView(controller: _tab, children: [
          _historyTab(),
          _depositTab(),
          _transferTab(),
        ])),
      ]),
    );
  }

  Widget _header() => Container(
    color: AppColors.bgDark,
    child: SafeArea(bottom: false, child: Padding(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
      child: Row(children: [
        GestureDetector(
          onTap: () => Navigator.pop(context),
          child: Container(width: 40, height: 40,
            decoration: BoxDecoration(color: AppColors.bgCard,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder)),
            child: const Icon(Icons.arrow_back_rounded, color: AppColors.textDark, size: 20))),
        const SizedBox(width: 12),
        const Text('My Wallet', style: TextStyle(color: AppColors.textDark,
            fontWeight: FontWeight.w800, fontSize: 18)),
      ]))));

  Widget _balanceCard() => Container(
    margin: const EdgeInsets.all(16),
    padding: const EdgeInsets.all(24),
    decoration: BoxDecoration(
      gradient: const LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight,
        colors: [Color(0xFF4F46E5), Color(0xFF6D28D9)]),
      borderRadius: BorderRadius.circular(20),
      border: Border.all(color: AppColors.primary.withValues(alpha: 0.4))),
    child: Column(children: [
      const Row(children: [
        Icon(Icons.account_balance_wallet_rounded, color: AppColors.primary, size: 22),
        SizedBox(width: 8),
        Text('Traveo Wallet', style: TextStyle(color: AppColors.textGrey, fontSize: 13)),
      ]),
      const SizedBox(height: 12),
      Text('FCFA ${walletBalance.toStringAsFixed(2)}',
        style: const TextStyle(color: AppColors.textDark, fontSize: 38,
            fontWeight: FontWeight.w900, letterSpacing: -1)),
      const Text('Available Balance', style: TextStyle(color: AppColors.textGrey, fontSize: 12)),
      const SizedBox(height: 16),
      Row(children: [
        _quickBtn(Icons.add_rounded, 'Deposit', () => _tab.animateTo(1)),
        const SizedBox(width: 12),
        _quickBtn(Icons.send_rounded, 'Transfer', () => _tab.animateTo(2)),
      ]),
    ]));

  Widget _quickBtn(IconData icon, String label, VoidCallback onTap) =>
    Expanded(child: GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.primary.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.primary.withValues(alpha: 0.3))),
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(icon, color: AppColors.primary, size: 18),
          const SizedBox(width: 6),
          Text(label, style: const TextStyle(color: AppColors.primary,
              fontWeight: FontWeight.w700, fontSize: 13)),
        ]))));

  Widget _historyTab() => ListView.builder(
    padding: const EdgeInsets.all(16),
    itemCount: walletTransactions.length,
    itemBuilder: (_, i) {
      final t = walletTransactions[i];
      final isCredit = t['type'] == 'credit';
      return Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
        child: Row(children: [
          Container(width: 42, height: 42,
            decoration: BoxDecoration(
              color: (isCredit ? AppColors.primary : Colors.red).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12)),
            child: Icon(_txIcon(t['icon'] as String),
                color: isCredit ? AppColors.primary : Colors.red, size: 22)),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(t['label'] as String,
              style: const TextStyle(color: AppColors.textDark,
                  fontWeight: FontWeight.w700, fontSize: 13)),
            Text(t['date'] as String,
              style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
          ])),
          Text('${isCredit ? '+' : ''}FCFA ${(t['amount'] as double).abs().toStringAsFixed(2)}',
            style: TextStyle(
              color: isCredit ? AppColors.primary : Colors.red,
              fontWeight: FontWeight.w800, fontSize: 14)),
        ]));
    });

  Widget _depositTab() {
    final quickAmounts = [10.0, 25.0, 50.0, 100.0];
    final paymentMethods = [
      {'icon': Icons.credit_card_rounded,     'label': 'Credit / Debit Card'},
      {'icon': Icons.phone_android_rounded,   'label': 'Mobile Money'},
      {'icon': Icons.account_balance_rounded, 'label': 'Bank Transfer'},
    ];
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Deposit Amount', style: TextStyle(color: AppColors.textDark,
            fontWeight: FontWeight.w700, fontSize: 15)),
        const SizedBox(height: 6),
        const Text('Add funds to your Traveo wallet',
          style: TextStyle(color: AppColors.textGrey, fontSize: 12)),
        const SizedBox(height: 20),
        Row(children: quickAmounts.map((amt) =>
          Expanded(child: GestureDetector(
            onTap: () => setState(() => _depositCtrl.text = amt.toStringAsFixed(0)),
            child: Container(
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(vertical: 10),
              decoration: BoxDecoration(color: AppColors.bgCard,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.cardBorder)),
              child: Center(child: Text('FCFA ${amt.toStringAsFixed(0)}',
                style: const TextStyle(color: AppColors.primary,
                    fontWeight: FontWeight.w700, fontSize: 13))))))
        ).toList()),
        const SizedBox(height: 20),
        _inputField(_depositCtrl, 'Enter amount', Icons.attach_money_rounded),
        const SizedBox(height: 16),
        const Text('Payment Method', style: TextStyle(color: AppColors.textDark,
            fontWeight: FontWeight.w700, fontSize: 14)),
        const SizedBox(height: 10),
        ...paymentMethods.map((m) => Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
          child: Row(children: [
            Icon(m['icon'] as IconData, color: AppColors.primary, size: 22),
            const SizedBox(width: 12),
            Text(m['label'] as String,
              style: const TextStyle(color: AppColors.textDark, fontSize: 13)),
            const Spacer(),
            const Icon(Icons.arrow_forward_ios_rounded, color: AppColors.textGrey, size: 14),
          ]))),
        const SizedBox(height: 16),
        _primaryBtn('Deposit Funds', () {
          final amt = double.tryParse(_depositCtrl.text) ?? 0;
          if (amt <= 0) return;
          setState(() {
            walletBalance += amt;
            walletTransactions.insert(0, {
              'type': 'credit', 'label': 'Deposit',
              'amount': amt, 'date': _today(),
              'icon': 'add',
            });
            _depositCtrl.clear();
          });
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text('Deposited FCFA ${amt.toStringAsFixed(2)} successfully!'),
            backgroundColor: AppColors.primary));
        }),
      ]));
  }

  Widget _transferTab() => SingleChildScrollView(
    padding: const EdgeInsets.all(16),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Text('Transfer Money', style: TextStyle(color: AppColors.textDark,
          fontWeight: FontWeight.w700, fontSize: 15)),
      const SizedBox(height: 6),
      const Text('Send money to another Traveo user\'s wallet',
        style: TextStyle(color: AppColors.textGrey, fontSize: 12)),
      const SizedBox(height: 20),
      _inputField(_recipientCtrl, 'Recipient username or email', Icons.person_rounded),
      const SizedBox(height: 12),
      _inputField(_transferCtrl, 'Amount to transfer', Icons.attach_money_rounded),
      const SizedBox(height: 8),
      Row(children: [
        const Icon(Icons.account_balance_wallet_rounded, color: AppColors.textGrey, size: 14),
        const SizedBox(width: 6),
        Text('Balance: FCFA ${walletBalance.toStringAsFixed(2)}',
          style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
      ]),
      const SizedBox(height: 20),
      _primaryBtn('Send Transfer', () {
        final amt = double.tryParse(_transferCtrl.text) ?? 0;
        if (amt <= 0 || _recipientCtrl.text.isEmpty) return;
        if (amt > walletBalance) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Insufficient balance'), backgroundColor: Colors.red));
          return;
        }
        setState(() {
          walletBalance -= amt;
          walletTransactions.insert(0, {
            'type': 'debit',
            'label': 'Transfer to @${_recipientCtrl.text}',
            'amount': -amt, 'date': _today(),
            'icon': 'send',
          });
          _transferCtrl.clear();
          _recipientCtrl.clear();
        });
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Transferred FCFA ${amt.toStringAsFixed(2)} successfully!'),
          backgroundColor: AppColors.primary));
      }),
    ]));

  Widget _inputField(TextEditingController ctrl, String hint, IconData icon) =>
    Container(
      decoration: BoxDecoration(color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder)),
      child: TextField(
        controller: ctrl,
        keyboardType: const TextInputType.numberWithOptions(decimal: true),
        style: const TextStyle(color: AppColors.textDark, fontSize: 15),
        decoration: InputDecoration(
          hintText: hint, hintStyle: const TextStyle(color: AppColors.textGrey),
          prefixIcon: Icon(icon, color: AppColors.primary, size: 20),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 16))));

  Widget _primaryBtn(String label, VoidCallback onTap) =>
    SizedBox(width: double.infinity, height: 50,
      child: ElevatedButton(onPressed: onTap,
        style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
        child: Text(label, style: const TextStyle(
            fontWeight: FontWeight.w800, fontSize: 15, color: Colors.white))));

  String _today() {
    final d = DateTime.now();
    const months = ['Jan','Feb','Mar','Apr','May','Jun',
                    'Jul','Aug','Sep','Oct','Nov','Dec'];
    return '${months[d.month - 1]} ${d.day}, ${d.year}';
  }
}
