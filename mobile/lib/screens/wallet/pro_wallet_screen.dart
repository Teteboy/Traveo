import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class ProWalletScreen extends StatefulWidget {
  const ProWalletScreen({super.key});
  @override State<ProWalletScreen> createState() => _ProWalletScreenState();
}

class _ProWalletScreenState extends State<ProWalletScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tab;
  double _balance = 1240.75;
  double _totalEarned = 1640.75;
  double _platformFee = 400.00; // 24.4% platform deduction
  int _selectedMonth = 2;
  final _withdrawCtrl = TextEditingController();

  final List<String> _months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  final Map<int, Map<String, dynamic>> _monthlyData = {
    0: {'gross': 450.0, 'fee': 90.0, 'net': 360.0, 'bookings': 14, 'views': 4800},
    1: {'gross': 620.0, 'fee': 124.0, 'net': 496.0, 'bookings': 20, 'views': 7200},
    2: {'gross': 425.0, 'fee': 85.0, 'net': 340.0, 'bookings': 13, 'views': 4100},
  };

  final List<Map<String, dynamic>> _transactions = [
    {'type': 'credit', 'label': 'Guide & Experience Booking – Kribi Beach', 'amount': 120.0, 'date': 'Mar 5, 2026', 'icon': Icons.beach_access_rounded},
    {'type': 'debit',  'label': 'Platform Fee (20%)',          'amount': -24.0, 'date': 'Mar 5, 2026', 'icon': Icons.receipt_long_rounded},
    {'type': 'credit', 'label': 'Restaurant – La Terrasse',     'amount': 85.0,  'date': 'Mar 3, 2026', 'icon': Icons.terrain_rounded},
    {'type': 'debit',  'label': 'Platform Fee (20%)',          'amount': -17.0, 'date': 'Mar 3, 2026', 'icon': Icons.receipt_long_rounded},
    {'type': 'debit',  'label': 'Withdrawal to Bank',          'amount': -200.0,'date': 'Feb 28, 2026','icon': Icons.account_balance_rounded},
    {'type': 'credit', 'label': 'Premium Event Booking',       'amount': 250.0, 'date': 'Feb 25, 2026', 'icon': Icons.event_rounded},
    {'type': 'debit',  'label': 'Platform Fee (20%)',          'amount': -50.0, 'date': 'Feb 25, 2026', 'icon': Icons.receipt_long_rounded},
    {'type': 'credit', 'label': 'City Tour – Yaoundé',         'amount': 65.0,  'date': 'Feb 22, 2026', 'icon': Icons.location_city_rounded},
  ];

  @override
  void initState() { super.initState(); _tab = TabController(length: 3, vsync: this); }

  @override
  void dispose() { _tab.dispose(); _withdrawCtrl.dispose(); super.dispose(); }

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
            tabs: const [
              Tab(text: 'Analytics'),
              Tab(text: 'Earnings'),
              Tab(text: 'Withdraw'),
            ])),
        Expanded(child: TabBarView(controller: _tab, children: [
          _analyticsTab(),
          _earningsTab(),
          _withdrawTab(),
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
        const Text('Pro Wallet', style: TextStyle(color: AppColors.textDark,
            fontWeight: FontWeight.w800, fontSize: 18)),
        const Spacer(),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.primary.withValues(alpha: 0.3))),
          child: const Row(children: [
            Icon(Icons.verified_rounded, color: AppColors.primary, size: 14),
            SizedBox(width: 4),
            Text('PRO', style: TextStyle(color: AppColors.primary,
                fontWeight: FontWeight.w800, fontSize: 11)),
          ])),
      ]))));

  Widget _balanceCard() => Container(
    margin: const EdgeInsets.all(16),
    padding: const EdgeInsets.all(24),
    decoration: BoxDecoration(
      gradient: const LinearGradient(
        begin: Alignment.topLeft, end: Alignment.bottomRight,
        colors: [Color(0xFF4F46E5), Color(0xFF6D28D9)]),
      borderRadius: BorderRadius.circular(20),
      border: Border.all(color: AppColors.primary.withValues(alpha: 0.4))),
    child: Column(children: [
      // Top row - same alignment as normal wallet
      const Row(children: [
        Icon(Icons.account_balance_wallet_rounded, color: AppColors.primary, size: 22),
        SizedBox(width: 8),
        Text('Pro Wallet', style: TextStyle(color: AppColors.textGrey, fontSize: 13)),
      ]),
      const SizedBox(height: 12),
      Text('FCFA ${_balance.toStringAsFixed(2)}',
        style: const TextStyle(color: AppColors.textDark, fontSize: 38,
            fontWeight: FontWeight.w900, letterSpacing: -1)),
      const Text('Available Balance', style: TextStyle(color: AppColors.textGrey, fontSize: 12)),
      const SizedBox(height: 16),
      // Quick action buttons matching normal wallet style
      Row(children: [
        _quickBtn(Icons.bar_chart_rounded, 'Analytics', () => _tab.animateTo(0)),
        const SizedBox(width: 12),
        _quickBtn(Icons.account_balance_rounded, 'Withdraw', () => _tab.animateTo(2)),
      ]),
      const SizedBox(height: 16),
      // Platform deduction summary
      Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.2),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.white.withValues(alpha: 0.1))),
        child: Column(children: [
          Row(children: [
            const Icon(Icons.info_outline_rounded, color: AppColors.textGrey, size: 14),
            const SizedBox(width: 6),
            const Text('Revenue Breakdown', style: TextStyle(
                color: AppColors.textGrey, fontSize: 12, fontWeight: FontWeight.w700)),
          ]),
          const SizedBox(height: 12),
          _breakdownRow('Total Earned (Gross)', 'FCFA ${_totalEarned.toStringAsFixed(2)}', Colors.white),
          const SizedBox(height: 6),
          _breakdownRow('Platform Fees (Deducted)', '-FCFA ${_platformFee.toStringAsFixed(2)}', Colors.redAccent),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Divider(color: Colors.white.withValues(alpha: 0.1), height: 1)),
          _breakdownRow('Net Balance', 'FCFA ${_balance.toStringAsFixed(2)}', AppColors.primary),
        ]),
      ),
    ]));

  Widget _breakdownRow(String label, String value, Color valueColor) => Row(children: [
    Text(label, style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
    const Spacer(),
    Text(value, style: TextStyle(color: valueColor, fontWeight: FontWeight.w800, fontSize: 13)),
  ]);

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

  Widget _analyticsTab() => ListView(
    padding: const EdgeInsets.all(16),
    children: [
      const Text('Monthly Performance', style: TextStyle(color: AppColors.textDark,
          fontWeight: FontWeight.w700, fontSize: 15)),
      const SizedBox(height: 12),
      SizedBox(height: 36, child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _months.length,
        itemBuilder: (_, i) {
          final hasData = _monthlyData.containsKey(i);
          final active = i == _selectedMonth;
          return GestureDetector(
            onTap: () => setState(() => _selectedMonth = i),
            child: Container(
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: active ? AppColors.primary : AppColors.bgCard,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: active ? AppColors.primary : AppColors.cardBorder)),
              child: Text(_months[i], style: TextStyle(
                color: active ? Colors.white : hasData ? AppColors.textGrey : AppColors.textGrey.withValues(alpha: 0.4),
                fontWeight: FontWeight.w600, fontSize: 12))));
        })),
      const SizedBox(height: 20),
      if (_monthlyData.containsKey(_selectedMonth)) ...[
        _revenueBreakdownCard(_monthlyData[_selectedMonth]!),
        const SizedBox(height: 16),
        _analyticsStatsCard(_monthlyData[_selectedMonth]!),
        const SizedBox(height: 16),
        _barChart(_monthlyData[_selectedMonth]!),
      ] else
        Center(child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(children: [
            Icon(Icons.bar_chart_rounded, color: AppColors.textGrey.withValues(alpha: 0.3), size: 64),
            const SizedBox(height: 12),
            const Text('No data for this month', style: TextStyle(color: AppColors.textGrey)),
          ]))),
    ]);

  Widget _revenueBreakdownCard(Map<String, dynamic> data) {
    final gross = data['gross'] as double;
    final fee = data['fee'] as double;
    final net = data['net'] as double;
    final feePercent = ((fee / gross) * 100).toStringAsFixed(0);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Revenue Breakdown', style: TextStyle(color: AppColors.textDark,
            fontWeight: FontWeight.w700, fontSize: 14)),
        const SizedBox(height: 14),
        _revenueRow('Gross Earnings', 'FCFA ${gross.toStringAsFixed(2)}', Colors.white, Icons.trending_up_rounded),
        const SizedBox(height: 10),
        _revenueRow('Platform Fee ($feePercent%)', '-FCFA ${fee.toStringAsFixed(2)}', Colors.redAccent, Icons.remove_circle_outline_rounded),
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Divider(color: AppColors.cardBorder.withValues(alpha: 0.4), height: 1)),
        _revenueRow('Net to Wallet', 'FCFA ${net.toStringAsFixed(2)}', AppColors.primary, Icons.account_balance_wallet_rounded),
        const SizedBox(height: 14),
        // Visual fee bar
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Text('$feePercent% fee deducted', style: const TextStyle(color: AppColors.textGrey, fontSize: 10)),
            const Spacer(),
            Text('${(100 - int.parse(feePercent))}% to you', style: const TextStyle(color: AppColors.primary, fontSize: 10)),
          ]),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: SizedBox(height: 8, child: Row(children: [
              Expanded(flex: int.parse(feePercent),
                child: Container(color: Colors.redAccent.withValues(alpha: 0.6))),
              Expanded(flex: 100 - int.parse(feePercent),
                child: Container(color: AppColors.primary.withValues(alpha: 0.7))),
            ]))),
        ]),
      ]));
  }

  Widget _revenueRow(String label, String value, Color color, IconData icon) => Row(children: [
    Icon(icon, color: color, size: 16),
    const SizedBox(width: 10),
    Text(label, style: const TextStyle(color: AppColors.textGrey, fontSize: 13)),
    const Spacer(),
    Text(value, style: TextStyle(color: color, fontWeight: FontWeight.w800, fontSize: 14)),
  ]);

  Widget _analyticsStatsCard(Map<String, dynamic> data) => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: AppColors.bgCard,
      borderRadius: BorderRadius.circular(16),
      border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
    child: Row(children: [
      _bigStat('Bookings', '${data['bookings']}', Colors.blue),
      _divider(),
      _bigStat('Views', _fmt(data['views'] as int), Colors.orange),
      _divider(),
      _bigStat('Rating', '4.8 ★', AppColors.amber),
    ]));

  Widget _bigStat(String label, String value, Color color) => Expanded(child: Column(children: [
    Text(value, style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 22)),
    const SizedBox(height: 4),
    Text(label, style: const TextStyle(color: AppColors.textGrey, fontSize: 10), textAlign: TextAlign.center),
  ]));

  Widget _divider() => Container(width: 1, height: 40, color: AppColors.cardBorder.withValues(alpha: 0.4));

  Widget _barChart(Map<String, dynamic> data) {
    final maxVal = (data['gross'] as double);
    final barLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    final barVals = [maxVal * 0.22, maxVal * 0.35, maxVal * 0.18, maxVal * 0.25];
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Weekly Earnings Breakdown', style: TextStyle(color: AppColors.textDark,
            fontWeight: FontWeight.w700, fontSize: 13)),
        const SizedBox(height: 16),
        Row(crossAxisAlignment: CrossAxisAlignment.end,
          children: List.generate(4, (i) {
            final val = barVals[i];
            final pct = maxVal > 0 ? (val / maxVal) : 0.0;
            return Expanded(child: Column(children: [
              Text('FCFA ${val.toStringAsFixed(0)}',
                style: const TextStyle(color: AppColors.primary,
                    fontSize: 9, fontWeight: FontWeight.w700)),
              const SizedBox(height: 4),
              Container(
                height: 80 * pct + 8,
                margin: const EdgeInsets.symmetric(horizontal: 4),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter, end: Alignment.bottomCenter,
                    colors: [AppColors.primary, AppColors.primary.withValues(alpha: 0.4)]),
                  borderRadius: BorderRadius.circular(6))),
              const SizedBox(height: 6),
              Text(barLabels[i], style: const TextStyle(color: AppColors.textGrey, fontSize: 9)),
            ]));
          })),
      ]));
  }

  Widget _earningsTab() => ListView.builder(
    padding: const EdgeInsets.all(16),
    itemCount: _transactions.length,
    itemBuilder: (_, i) {
      final t = _transactions[i];
      final isCredit = t['type'] == 'credit';
      final isPlatformFee = (t['label'] as String).contains('Platform Fee');
      Color iconColor = isCredit ? AppColors.primary : (isPlatformFee ? Colors.redAccent : Colors.orange);
      return Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
        child: Row(children: [
          Container(width: 42, height: 42,
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12)),
            child: Icon(t['icon'] as IconData, color: iconColor, size: 22)),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(t['label'] as String, style: const TextStyle(color: AppColors.textDark,
                fontWeight: FontWeight.w700, fontSize: 13)),
            Text(t['date'] as String, style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
          ])),
          Text('${isCredit ? '+' : ''}FCFA ${(t['amount'] as double).abs().toStringAsFixed(2)}',
            style: TextStyle(color: iconColor, fontWeight: FontWeight.w800, fontSize: 14)),
        ]));
    });

  Widget _withdrawTab() => SingleChildScrollView(
    padding: const EdgeInsets.all(16),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Text('Withdraw Funds', style: TextStyle(color: AppColors.textDark,
          fontWeight: FontWeight.w700, fontSize: 15)),
      const SizedBox(height: 6),
      const Text('Transfer your net earnings to your bank or mobile money',
        style: TextStyle(color: AppColors.textGrey, fontSize: 12)),
      const SizedBox(height: 20),
      Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.bgCard, borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.primary.withValues(alpha: 0.3))),
        child: Column(children: [
          Row(children: [
            const Icon(Icons.account_balance_wallet_rounded, color: AppColors.primary, size: 22),
            const SizedBox(width: 10),
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Available to withdraw', style: TextStyle(color: AppColors.textGrey, fontSize: 11)),
              Text('FCFA ${_balance.toStringAsFixed(2)}',
                style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w900, fontSize: 20)),
            ]),
          ]),
          const SizedBox(height: 12),
          Divider(color: AppColors.cardBorder.withValues(alpha: 0.4), height: 1),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Total Earned', style: TextStyle(color: AppColors.textGrey, fontSize: 10)),
              Text('FCFA ${_totalEarned.toStringAsFixed(2)}',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
            ])),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Fees Deducted', style: TextStyle(color: AppColors.textGrey, fontSize: 10)),
              Text('-FCFA ${_platformFee.toStringAsFixed(2)}',
                style: const TextStyle(color: Colors.redAccent, fontWeight: FontWeight.w700, fontSize: 13)),
            ])),
          ]),
        ])),
      const SizedBox(height: 16),
      _wdField(_withdrawCtrl, 'Withdrawal amount', Icons.attach_money_rounded),
      const SizedBox(height: 16),
      const Text('Withdrawal Method', style: TextStyle(color: AppColors.textDark,
          fontWeight: FontWeight.w700, fontSize: 14)),
      const SizedBox(height: 10),
      ...[
        {'icon': Icons.account_balance_rounded, 'label': 'Bank Transfer', 'sub': '2-3 business days'},
        {'icon': Icons.phone_android_rounded,   'label': 'Mobile Money',   'sub': 'Instant'},
        {'icon': Icons.credit_card_rounded,     'label': 'Card',           'sub': '1-2 business days'},
      ].map((m) => Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
        child: Row(children: [
          Icon(m['icon'] as IconData, color: AppColors.primary, size: 22),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(m['label'] as String, style: const TextStyle(color: AppColors.textDark, fontSize: 13)),
            Text(m['sub'] as String, style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
          ])),
          const Icon(Icons.arrow_forward_ios_rounded, color: AppColors.textGrey, size: 14),
        ]))),
      const SizedBox(height: 16),
      SizedBox(width: double.infinity, height: 50,
        child: ElevatedButton(
          onPressed: () {
            final amt = double.tryParse(_withdrawCtrl.text) ?? 0;
            if (amt <= 0 || amt > _balance) {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                content: Text('Invalid amount'), backgroundColor: Colors.red));
              return;
            }
            setState(() {
              _balance -= amt;
              _transactions.insert(0, {
                'type': 'debit', 'label': 'Withdrawal to Bank',
                'amount': -amt, 'date': 'Mar 11, 2026',
                'icon': Icons.account_balance_rounded,
              });
              _withdrawCtrl.clear();
            });
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
              content: Text('Withdrawal of FCFA ${amt.toStringAsFixed(2)} initiated!'),
              backgroundColor: AppColors.primary));
          },
          style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
          child: const Text('Withdraw Funds',
              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: Colors.white)))),
    ]));

  Widget _wdField(TextEditingController ctrl, String hint, IconData icon) =>
    Container(
      decoration: BoxDecoration(
        color: AppColors.bgCard, borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder)),
      child: TextField(
        controller: ctrl,
        keyboardType: const TextInputType.numberWithOptions(decimal: true),
        style: const TextStyle(color: AppColors.textDark, fontSize: 15),
        decoration: InputDecoration(
          hintText: hint, hintStyle: const TextStyle(color: AppColors.textGrey),
          prefixIcon: Icon(icon, color: AppColors.primary, size: 20),
          border: InputBorder.none, contentPadding: const EdgeInsets.symmetric(vertical: 16))));

  String _fmt(int n) => n >= 1000 ? '${(n / 1000).toStringAsFixed(1)}K' : n.toString();
}
