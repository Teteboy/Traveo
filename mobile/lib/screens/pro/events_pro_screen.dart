import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class EventsProScreen extends StatefulWidget {
  const EventsProScreen({super.key});
  @override State<EventsProScreen> createState() => _EventsProScreenState();
}

class _EventsProScreenState extends State<EventsProScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tab;

  final _events = [
    _Event('Cameroon Jazz Festival',   'Mar 28, 2026', 'Yaoundé Palais des Congrès', 200, 45, 35.0, 'Active',   Icons.music_note_rounded,     const Color(0xFF7C3AED)),
    _Event('Kribi Beach Party',        'Apr 5, 2026',  'Kribi Beachfront, South',    150, 20, 25.0, 'Active',   Icons.beach_access_rounded,    const Color(0xFF065F46)),
    _Event('Mt Cameroon Night Hike',   'Apr 12, 2026', 'Buea Base Camp',             30,  0,  80.0, 'Draft',    Icons.terrain_rounded,         const Color(0xFF92400E)),
    _Event('Douala Culinary Weekend',  'Apr 19, 2026', 'Akwa District, Douala',      80,  12, 45.0, 'Active',   Icons.restaurant_rounded,      const Color(0xFF9D174D)),
  ];

  @override
  void initState() { super.initState(); _tab = TabController(length: 2, vsync: this); }
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
            tabs: const [Tab(text: 'My Events'), Tab(text: 'Ticket Sales')])),
        Expanded(child: TabBarView(controller: _tab, children: [_eventsTab(context), _salesTab()])),
      ]),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _createEventSheet(context),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text('New Event', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700))),
    );
  }

  Widget _header(BuildContext ctx) => Container(
    color: AppColors.bgDark,
    child: SafeArea(bottom: false, child: Padding(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
      child: Row(children: [
        GestureDetector(onTap: () => Navigator.pop(ctx),
          child: Container(width: 40, height: 40,
            decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder)),
            child: const Icon(Icons.arrow_back_rounded, color: AppColors.textDark, size: 20))),
        const SizedBox(width: 12),
        const Text('Event Management', style: TextStyle(color: AppColors.textDark,
            fontWeight: FontWeight.w800, fontSize: 18)),
      ]))));

  Widget _eventsTab(BuildContext ctx) => ListView.builder(
    padding: const EdgeInsets.all(16),
    itemCount: _events.length,
    itemBuilder: (_, i) => _eventCard(ctx, _events[i]));

  Widget _eventCard(BuildContext ctx, _Event e) {
    final sold = e.capacity - e.remaining;
    final pct = e.capacity > 0 ? sold / e.capacity : 0.0;
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
      child: Column(children: [
        Container(height: 80, decoration: BoxDecoration(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
          color: e.color.withValues(alpha: 0.25)),
          child: Stack(children: [
            Center(child: Icon(e.icon, color: e.color.withValues(alpha: 0.5), size: 40)),
            Positioned(top: 10, right: 12, child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: e.status == 'Active' ? AppColors.primary.withValues(alpha: 0.9) : Colors.grey.withValues(alpha: 0.7),
                borderRadius: BorderRadius.circular(20)),
              child: Text(e.status, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700)))),
          ])),
        Padding(padding: const EdgeInsets.all(14), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(e.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 15)),
          const SizedBox(height: 4),
          Row(children: [
            const Icon(Icons.calendar_today_rounded, color: AppColors.textGrey, size: 13),
            const SizedBox(width: 4),
            Text(e.date, style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
            const SizedBox(width: 12),
            const Icon(Icons.location_on_rounded, color: AppColors.textGrey, size: 13),
            const SizedBox(width: 4),
            Expanded(child: Text(e.location, maxLines: 1, overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: AppColors.textGrey, fontSize: 11))),
          ]),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('${(sold)} / ${e.capacity} tickets sold',
                style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
              const SizedBox(height: 6),
              ClipRRect(borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(value: pct, minHeight: 6,
                  backgroundColor: AppColors.cardBorder,
                  valueColor: AlwaysStoppedAnimation<Color>(e.color))),
            ])),
            const SizedBox(width: 16),
            Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
              Text('FCFA ${e.price.toStringAsFixed(0)}/ticket',
                style: const TextStyle(color: AppColors.textGrey, fontSize: 10)),
              Text('FCFA ${(sold * e.price).toStringAsFixed(0)} earned',
                style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800, fontSize: 13)),
            ]),
          ]),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: _btn('Edit', AppColors.primary, () {})),
            const SizedBox(width: 10),
            Expanded(child: _btn('Share', Colors.blue, () {})),
          ]),
        ])),
      ]));
  }

  Widget _salesTab() {
    final totalRevenue = _events.fold(0.0, (sum, e) => sum + ((e.capacity - e.remaining) * e.price));
    final totalSold = _events.fold(0, (sum, e) => sum + (e.capacity - e.remaining));
    return ListView(padding: const EdgeInsets.all(16), children: [
      Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(
        color: AppColors.bgCard, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
        child: Column(children: [
          Row(children: [
            _sumStat('Total Revenue', 'FCFA ${totalRevenue.toStringAsFixed(0)}', AppColors.primary),
            _vdiv(),
            _sumStat('Tickets Sold', '$totalSold', Colors.blue),
            _vdiv(),
            _sumStat('Active Events', '${_events.where((e)=>e.status=="Active").length}', Colors.green),
          ]),
        ])),
      const SizedBox(height: 16),
      const Text('Sales by Event', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 14)),
      const SizedBox(height: 12),
      ..._events.map((e) {
        final sold = e.capacity - e.remaining;
        final revenue = sold * e.price;
        return Container(margin: const EdgeInsets.only(bottom: 10), padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
          child: Row(children: [
            Container(width: 42, height: 42,
              decoration: BoxDecoration(color: e.color.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(10)),
              child: Icon(e.icon, color: e.color, size: 22)),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(e.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
              Text('$sold tickets · ${e.date}', style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
            ])),
            Text('FCFA ${revenue.toStringAsFixed(0)}',
              style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800, fontSize: 14)),
          ]));
      }),
    ]);
  }

  Widget _sumStat(String label, String val, Color color) => Expanded(child: Column(children: [
    Text(val, style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 18)),
    const SizedBox(height: 3),
    Text(label, style: const TextStyle(color: AppColors.textGrey, fontSize: 10), textAlign: TextAlign.center),
  ]));

  Widget _vdiv() => Container(width: 1, height: 32, color: AppColors.cardBorder.withValues(alpha: 0.4));

  Widget _btn(String label, Color color, VoidCallback onTap) =>
    GestureDetector(onTap: onTap,
      child: Container(height: 34,
        decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withValues(alpha: 0.3))),
        child: Center(child: Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 12)))));

  void _createEventSheet(BuildContext ctx) {
    showModalBottomSheet(context: ctx, isScrollControlled: true, backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom + 32, left: 24, right: 24, top: 24),
        child: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            const Text('Create Event', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 18)),
            const Spacer(),
            GestureDetector(onTap: () => Navigator.pop(ctx),
              child: const Icon(Icons.close_rounded, color: AppColors.textGrey)),
          ]),
          const SizedBox(height: 20),
          ...['Event Name', 'Location', 'Date & Time', 'Description'].map((h) => _field(h)),
          Row(children: [
            Expanded(child: _field('Ticket Price (FCFA )')),
            const SizedBox(width: 12),
            Expanded(child: _field('Capacity')),
          ]),
          const SizedBox(height: 8),
          Row(children: [
            Expanded(child: _field('Category (VIP / General)')),
          ]),
          const SizedBox(height: 16),
          SizedBox(width: double.infinity, height: 48,
            child: ElevatedButton(onPressed: () => Navigator.pop(ctx),
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              child: const Text('Create Event', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)))),
          const SizedBox(height: 8),
        ]))));
  }

  Widget _field(String hint) => Container(margin: const EdgeInsets.only(bottom: 12),
    decoration: BoxDecoration(color: AppColors.bgDark, borderRadius: BorderRadius.circular(12),
      border: Border.all(color: AppColors.cardBorder)),
    child: TextField(style: const TextStyle(color: Colors.white, fontSize: 14),
      decoration: InputDecoration(hintText: hint, hintStyle: const TextStyle(color: AppColors.textGrey),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        border: InputBorder.none)));
}

class _Event {
  final String name, date, location, status;
  final int capacity, remaining;
  final double price;
  final IconData icon;
  final Color color;
  const _Event(this.name, this.date, this.location, this.capacity, this.remaining,
      this.price, this.status, this.icon, this.color);
}
