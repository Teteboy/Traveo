import 'package:flutter/material.dart';
import '../../widgets/common_widgets.dart';
import '../../theme/app_theme.dart';
import 'notifications_screen.dart';
import 'settings_screen.dart';

class AnalyseProScreen extends StatefulWidget {
  const AnalyseProScreen({super.key});
  @override State<AnalyseProScreen> createState() => _AnalyseProScreenState();
}

class _AnalyseProScreenState extends State<AnalyseProScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tab;
  int _selMonth = 2;
  final _months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  final _monthData = {
    0: {'gross':450.0,'net':360.0,'bookings':14,'views':4800,'rating':4.2,'reviews':8},
    1: {'gross':620.0,'net':496.0,'bookings':20,'views':7200,'rating':4.5,'reviews':14},
    2: {'gross':425.0,'net':340.0,'bookings':13,'views':4100,'rating':4.3,'reviews':9},
  };

  @override
  void initState() { super.initState(); _tab = TabController(length: 3, vsync: this); }
  @override
  void dispose() { _tab.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Column(children: [
        _header(context),
        Container(color: AppColors.bgCard,
          child: TabBar(controller: _tab,
            indicatorColor: AppColors.primary, labelColor: AppColors.primary,
            unselectedLabelColor: AppColors.textGrey,
            labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12),
            tabs: const [Tab(text: 'Overview'), Tab(text: 'Revenue'), Tab(text: 'Reviews')])),
        Expanded(child: TabBarView(controller: _tab, children: [
          _overviewTab(), _revenueTab(), _reviewsTab(),
        ])),
      ]),
    );
  }

  Widget _header(BuildContext ctx) => Container(
    color: AppColors.bgDark,
    child: SafeArea(bottom: false, child: Padding(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
      child: Row(children: [
        const TraveoLogoWidget(),
        const Spacer(),
        GestureDetector(onTap: () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => const SettingsScreen())),
          child: Container(width: 40, height: 40,
            decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.cardBorder)),
            child: const Icon(Icons.settings_rounded, color: AppColors.textGrey, size: 20))),
        const SizedBox(width: 8),
        GestureDetector(onTap: () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => const NotificationsScreen())),
          child: Stack(children: [
            Container(width: 40, height: 40,
              decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.cardBorder)),
              child: const Icon(Icons.notifications_rounded, color: AppColors.textGrey, size: 20)),
            Positioned(top: 2, right: 2, child: Container(padding: const EdgeInsets.all(3),
              decoration: const BoxDecoration(color: Colors.orange, shape: BoxShape.circle),
              child: const Text('2', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)))),
          ])),
      ]))));

  // ── Overview Tab ──────────────────────────────────────────────────────
  Widget _overviewTab() => ListView(padding: const EdgeInsets.all(16), children: [
    _monthPicker(),
    const SizedBox(height: 16),
    if (_monthData.containsKey(_selMonth)) ...[
      _kpiRow(_monthData[_selMonth]!),
      const SizedBox(height: 14),
      _bookingPerformanceCard(_monthData[_selMonth]!),
      const SizedBox(height: 14),
      _weeklyBar(_monthData[_selMonth]!),
    ] else
      _noData(),
  ]);

  Widget _monthPicker() => SizedBox(height: 36,
    child: ListView.builder(scrollDirection: Axis.horizontal, itemCount: 12, itemBuilder: (_, i) {
      final has = _monthData.containsKey(i);
      final active = i == _selMonth;
      return GestureDetector(onTap: () => setState(() => _selMonth = i),
        child: Container(margin: const EdgeInsets.only(right: 8),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: active ? AppColors.primary : AppColors.bgCard,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: active ? AppColors.primary : AppColors.cardBorder)),
          child: Text(_months[i], style: TextStyle(
            color: active ? Colors.white : has ? AppColors.textGrey : AppColors.textGrey.withValues(alpha: 0.4),
            fontWeight: FontWeight.w600, fontSize: 12))));
    }));

  Widget _kpiRow(Map<String, dynamic> d) => Row(children: [
    _kpi('Bookings',   '${d['bookings']}',                    Colors.blue,         Icons.book_online_rounded),
    const SizedBox(width: 10),
    _kpi('Views',      _fmt(d['views'] as int),                Colors.orange,       Icons.visibility_rounded),
    const SizedBox(width: 10),
    _kpi('Rating',     '${d['rating']} ★',                    AppColors.amber,     Icons.star_rounded),
  ]);

  Widget _kpi(String label, String val, Color color, IconData icon) => Expanded(child: Container(
    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
    decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(14),
      border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
    child: Column(children: [
      Icon(icon, color: color, size: 20),
      const SizedBox(height: 6),
      Text(val, style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 16)),
      Text(label, style: const TextStyle(color: AppColors.textGrey, fontSize: 9)),
    ])));

  Widget _bookingPerformanceCard(Map<String, dynamic> d) {
    final bookings = d['bookings'] as int;
    final confirmed = (bookings * 0.77).round();
    final cancelled = bookings - confirmed;
    final confPct = bookings > 0 ? confirmed / bookings : 0.0;
    return Container(padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Booking Performance', style: TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w700, fontSize: 14)),
        const SizedBox(height: 14),
        Row(children: [
          _bStat('Total',     '$bookings',   Colors.white),
          _bdiv(),
          _bStat('Confirmed', '$confirmed',  AppColors.primary),
          _bdiv(),
          _bStat('Cancelled', '$cancelled',  Colors.redAccent),
        ]),
        const SizedBox(height: 14),
        Text('Confirmation rate: ${(confPct * 100).toStringAsFixed(0)}%',
          style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
        const SizedBox(height: 6),
        ClipRRect(borderRadius: BorderRadius.circular(6),
          child: LinearProgressIndicator(value: confPct, minHeight: 8,
            backgroundColor: Colors.redAccent.withValues(alpha: 0.25),
            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary))),
      ]));
  }

  Widget _bStat(String label, String val, Color color) => Expanded(child: Column(children: [
    Text(val, style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 20)),
    const SizedBox(height: 3),
    Text(label, style: const TextStyle(color: AppColors.textGrey, fontSize: 10)),
  ]));
  Widget _bdiv() => Container(width: 1, height: 36, color: AppColors.cardBorder.withValues(alpha: 0.4));

  Widget _weeklyBar(Map<String, dynamic> d) {
    final max = d['gross'] as double;
    final vals = [max * 0.22, max * 0.35, max * 0.18, max * 0.25];
    return Container(padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Weekly Revenue', style: TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w700, fontSize: 14)),
        const SizedBox(height: 16),
        Row(crossAxisAlignment: CrossAxisAlignment.end, children: List.generate(4, (i) {
          final pct = max > 0 ? vals[i] / max : 0.0;
          return Expanded(child: Column(children: [
            Text('FCFA ${vals[i].toStringAsFixed(0)}',
              style: const TextStyle(color: AppColors.primary, fontSize: 9, fontWeight: FontWeight.w700)),
            const SizedBox(height: 4),
            Container(height: 80 * pct + 8, margin: const EdgeInsets.symmetric(horizontal: 4),
              decoration: BoxDecoration(
                gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter,
                  colors: [AppColors.primary, AppColors.primary.withValues(alpha: 0.4)]),
                borderRadius: BorderRadius.circular(6))),
            const SizedBox(height: 6),
            Text('W${i+1}', style: const TextStyle(color: AppColors.textGrey, fontSize: 9)),
          ]));
        })),
      ]));
  }

  Widget _noData() => Center(child: Padding(padding: const EdgeInsets.all(48),
    child: Column(children: [
      Icon(Icons.bar_chart_rounded, color: AppColors.textGrey.withValues(alpha: 0.3), size: 64),
      const SizedBox(height: 12),
      const Text('No data for this month', style: TextStyle(color: AppColors.textGrey)),
    ])));

  // ── Revenue Tab ───────────────────────────────────────────────────────
  Widget _revenueTab() => ListView(padding: const EdgeInsets.all(16), children: [
    _revenueOverviewCard(),
    const SizedBox(height: 14),
    _monthlyComparisonCard(),
    const SizedBox(height: 14),
    _revenueByServiceCard(),
  ]);

  Widget _revenueOverviewCard() {
    final totalGross = _monthData.values.fold(0.0, (s, d) => s + (d['gross'] as double));
    final totalNet   = _monthData.values.fold(0.0, (s, d) => s + (d['net'] as double));
    final totalFees  = totalGross - totalNet;
    return Container(padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Revenue Overview (Jan–Mar)', style: TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w700, fontSize: 14)),
        const SizedBox(height: 14),
        _revRow('Total Gross Earnings', 'FCFA ${totalGross.toStringAsFixed(2)}', Colors.white),
        const SizedBox(height: 8),
        _revRow('Platform Fees Deducted', '-FCFA ${totalFees.toStringAsFixed(2)}', Colors.redAccent),
        Padding(padding: const EdgeInsets.symmetric(vertical: 10),
          child: Divider(color: AppColors.cardBorder.withValues(alpha: 0.4), height: 1)),
        _revRow('Net Earnings', 'FCFA ${totalNet.toStringAsFixed(2)}', AppColors.primary),
      ]));
  }

  Widget _revRow(String label, String val, Color color) => Row(children: [
    Text(label, style: const TextStyle(color: AppColors.textGrey, fontSize: 13)),
    const Spacer(),
    Text(val, style: TextStyle(color: color, fontWeight: FontWeight.w800, fontSize: 14)),
  ]);

  Widget _monthlyComparisonCard() {
    final months = [0, 1, 2];
    final maxVal = _monthData.values.map((d) => d['gross'] as double).reduce((a, b) => a > b ? a : b);
    return Container(padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Monthly Comparison', style: TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w700, fontSize: 14)),
        const SizedBox(height: 16),
        Row(crossAxisAlignment: CrossAxisAlignment.end, children: months.map((m) {
          final d = _monthData[m]!;
          final gross = d['gross'] as double;
          final net = d['net'] as double;
          final pct = maxVal > 0 ? gross / maxVal : 0.0;
          return Expanded(child: Padding(padding: const EdgeInsets.symmetric(horizontal: 6),
            child: Column(children: [
              Text('FCFA ${gross.toStringAsFixed(0)}',
                style: const TextStyle(color: AppColors.textGrey, fontSize: 9, fontWeight: FontWeight.w600)),
              const SizedBox(height: 4),
              Stack(alignment: Alignment.bottomCenter, children: [
                Container(height: 90 * pct + 8, width: double.infinity,
                  decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.25), borderRadius: BorderRadius.circular(6))),
                Container(height: (90 * pct + 8) * (net / gross), width: double.infinity,
                  decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(6))),
              ]),
              const SizedBox(height: 6),
              Text(_months[m], style: const TextStyle(color: AppColors.textGrey, fontSize: 10)),
            ])));
        }).toList()),
        const SizedBox(height: 12),
        Row(children: [
          _legend(AppColors.primary, 'Net'),
          const SizedBox(width: 16),
          _legend(AppColors.primary.withValues(alpha: 0.25), 'Gross'),
        ]),
      ]));
  }

  Widget _legend(Color color, String label) => Row(children: [
    Container(width: 10, height: 10, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3))),
    const SizedBox(width: 5),
    Text(label, style: const TextStyle(color: AppColors.textGrey, fontSize: 10)),
  ]);

  Widget _revenueByServiceCard() {
    final services = [
      {'label': 'Tours & Experiences', 'pct': 0.42, 'val': 'FCFA 615'},
      {'label': 'Accommodations',       'pct': 0.28, 'val': 'FCFA 410'},
      {'label': 'Events',               'pct': 0.18, 'val': 'FCFA 264'},
      {'label': 'Transport',            'pct': 0.12, 'val': 'FCFA 176'},
    ];
    final colors = [AppColors.primary, Colors.blue, Colors.orange, const Color(0xFF7C3AED)];
    return Container(padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Revenue by Service', style: TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w700, fontSize: 14)),
        const SizedBox(height: 14),
        ...services.asMap().entries.map((e) {
          final s = e.value; final color = colors[e.key];
          return Padding(padding: const EdgeInsets.only(bottom: 12), child: Column(children: [
            Row(children: [
              Text(s['label'] as String, style: const TextStyle(color: Colors.white, fontSize: 12)),
              const Spacer(),
              Text(s['val'] as String, style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 12)),
            ]),
            const SizedBox(height: 5),
            ClipRRect(borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(value: s['pct'] as double, minHeight: 6,
                backgroundColor: AppColors.cardBorder,
                valueColor: AlwaysStoppedAnimation<Color>(color))),
          ]));
        }),
      ]));
  }

  // ── Reviews Tab ───────────────────────────────────────────────────────
  Widget _reviewsTab() {
    final reviews = [
      {'user':'Sarah M.',  'rating':5, 'service':'Kribi Beach Guide & Experience',   'comment':'Amazing experience! The guide was fantastic and everything was well organized.', 'date':'Mar 5, 2026'},
      {'user':'James K.',  'rating':4, 'service':'Mt Cameroon Hike',   'comment':'Great hike, well organized. Slightly rushed at the summit but overall excellent.', 'date':'Mar 3, 2026'},
      {'user':'Amina T.',  'rating':5, 'service':'Yaoundé City Guide & Experience',  'comment':'Incredibly informative. Learned so much about the city\'s history and culture.', 'date':'Feb 22, 2026'},
      {'user':'Paul N.',   'rating':3, 'service':'Group Restaurant Tour',    'comment':'Good discount for groups but communication before the event could be improved.', 'date':'Feb 18, 2026'},
      {'user':'Celine B.', 'rating':4, 'service':'Douala Food Guide & Experience',   'comment':'Loved the food stops. Would have liked more time at each restaurant.', 'date':'Feb 10, 2026'},
    ];
    final avg = reviews.fold(0.0, (s, r) => s + (r['rating'] as int)) / reviews.length;
    final dist = [0, 0, 0, 0, 0];
    for (final r in reviews) dist[(r['rating'] as int) - 1]++;

    return ListView(padding: const EdgeInsets.all(16), children: [
      Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(
        color: AppColors.bgCard, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
        child: Row(children: [
          Column(children: [
            Text(avg.toStringAsFixed(1), style: const TextStyle(color: AppColors.amber,
                fontWeight: FontWeight.w900, fontSize: 42)),
            Row(children: List.generate(5, (i) => Icon(Icons.star_rounded,
              color: i < avg.round() ? AppColors.amber : AppColors.textGrey.withValues(alpha: 0.3), size: 14))),
            const SizedBox(height: 4),
            Text('${reviews.length} reviews', style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
          ]),
          const SizedBox(width: 20),
          Expanded(child: Column(children: List.generate(5, (i) {
            final star = 5 - i;
            final count = dist[star - 1];
            final pct = reviews.isNotEmpty ? count / reviews.length : 0.0;
            return Padding(padding: const EdgeInsets.symmetric(vertical: 2), child: Row(children: [
              Text('$star', style: const TextStyle(color: AppColors.textGrey, fontSize: 10)),
              const SizedBox(width: 4),
              const Icon(Icons.star_rounded, color: AppColors.amber, size: 10),
              const SizedBox(width: 6),
              Expanded(child: ClipRRect(borderRadius: BorderRadius.circular(3),
                child: LinearProgressIndicator(value: pct, minHeight: 6,
                  backgroundColor: AppColors.cardBorder,
                  valueColor: const AlwaysStoppedAnimation<Color>(AppColors.amber)))),
              const SizedBox(width: 6),
              Text('$count', style: const TextStyle(color: AppColors.textGrey, fontSize: 10)),
            ]));
          }))),
        ])),
      const SizedBox(height: 16),
      ...reviews.map((r) => Container(
        margin: const EdgeInsets.only(bottom: 12), padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Text(r['user'] as String, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
            const Spacer(),
            Row(children: List.generate(5, (i) => Icon(Icons.star_rounded,
              color: i < (r['rating'] as int) ? AppColors.amber : AppColors.textGrey.withValues(alpha: 0.3), size: 13))),
          ]),
          const SizedBox(height: 3),
          Text(r['service'] as String, style: const TextStyle(color: AppColors.primary, fontSize: 10)),
          const SizedBox(height: 6),
          Text(r['comment'] as String, style: const TextStyle(color: AppColors.textGrey, fontSize: 12, height: 1.4)),
          const SizedBox(height: 6),
          Text(r['date'] as String, style: const TextStyle(color: AppColors.textGrey, fontSize: 10)),
        ]))),
    ]);
  }

  String _fmt(int n) => n >= 1000 ? '${(n/1000).toStringAsFixed(1)}K' : '$n';
}
