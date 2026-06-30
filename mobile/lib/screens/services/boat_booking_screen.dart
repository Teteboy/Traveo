import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import 'services_screen.dart';
import '../wallet/wallet_state.dart';
import '../main_nav_screen.dart';

// ─────────────────────────────────────────────────────────────────────────────
// Model
// ─────────────────────────────────────────────────────────────────────────────
final List<BoatBooking> globalBoatBookings = [];

class BoatBooking {
  final String id, from, to, date, company, departure, arrival,
      category, passengerName, idNumber, paymentMethod, reference, status;
  final double price;
  final int passengers;
  final List<String> seats;
  BoatBooking({
    required this.id, required this.from, required this.to,
    required this.date, required this.company, required this.departure,
    required this.arrival, required this.category,
    required this.passengerName, required this.idNumber,
    required this.paymentMethod, required this.reference,
    required this.price, required this.passengers,
    required this.seats, this.status = 'Confirmed',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal data
// ─────────────────────────────────────────────────────────────────────────────
class _Route {
  final String from, to, distance, duration;
  final List<_Stop> stops;
  const _Route(this.from, this.to, this.distance, this.duration, this.stops);
}

class _Stop {
  final String name;
  final double lat, lng;
  const _Stop(this.name, this.lat, this.lng);
}

class _Cat {
  final String name, desc, amenities;
  final IconData icon;
  final Color color;
  final double rate;
  const _Cat(this.name, this.desc, this.amenities, this.icon, this.color, this.rate);
}

// ─────────────────────────────────────────────────────────────────────────────
// Static data — Cameroon river & coastal routes
// ─────────────────────────────────────────────────────────────────────────────
final _routes = [
  _Route('Douala','Limbé','70 km','1h 30m',[
    _Stop('Douala Port',4.061,9.698), _Stop('Limbé Wharf',4.015,9.200)]),
  _Route('Douala','Kribi','160 km','4h 00m',[
    _Stop('Douala Port',4.061,9.698),
    _Stop('Edéa River',3.800,10.130),
    _Stop('Kribi Beach',2.940,9.906)]),
  _Route('Douala','Manoka','30 km','45m',[
    _Stop('Douala Port',4.061,9.698), _Stop('Manoka',3.890,9.580)]),
  _Route('Limbé','Douala','70 km','1h 30m',[
    _Stop('Limbé Wharf',4.015,9.200), _Stop('Douala Port',4.061,9.698)]),
  _Route('Kribi','Douala','160 km','4h 00m',[
    _Stop('Kribi Beach',2.940,9.906),
    _Stop('Edéa River',3.800,10.130),
    _Stop('Douala Port',4.061,9.698)]),
  _Route('Yaoundé','Nachtigal','80 km','2h 00m',[
    _Stop('Yaoundé River',3.848,11.502),
    _Stop('Nachtigal',4.300,11.600)]),
  _Route('Bafang','Edéa','120 km','3h 00m',[
    _Stop('Bafang River',5.149,10.178),
    _Stop('Edéa River',3.800,10.130)]),
  _Route('Douala','Bonabéri','8 km','20m',[
    _Stop('Douala Port',4.061,9.698),
    _Stop('Bonabéri Dock',4.080,9.640)]),
];

List<String> get _allCities =>
    _routes.expand((r) => [r.from, r.to]).toSet().toList()..sort();

const _cats = [
  _Cat('Standard','Basic covered deck with life vests',
      'Life Vests · Covered · Basic',
      Icons.directions_boat_rounded, Color(0xFF00BCD4), 0.05),
  _Cat('Comfort','Cushioned seats with canopy shade',
      'Cushions · Canopy · Drinks',
      Icons.sailing_rounded, Color(0xFF2196F3), 0.09),
  _Cat('Premium','Air-conditioned cabin with meals',
      'A/C · Cabin · Meal · WiFi',
      Icons.directions_ferry_rounded, Color(0xFF3F51B5), 0.15),
  _Cat('VIP Charter','Private charter, fastest route',
      'Private · A/C · Meal · Fast Track',
      Icons.star_rounded, Color(0xFFFF9800), 0.22),
];

const _recentMap = {
  'Douala' : ['Limbé','Kribi','Manoka','Bonabéri'],
  'Limbé'  : ['Douala'],
  'Kribi'  : ['Douala'],
  'Yaoundé': ['Nachtigal'],
};

const _teal = Color(0xFF00BCD4);

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────
class BoatBookingScreen extends StatefulWidget {
  const BoatBookingScreen({super.key});
  @override State<BoatBookingScreen> createState() => _State();
}

class _State extends State<BoatBookingScreen>
    with SingleTickerProviderStateMixin {

  // 0=search 1=map 2=category 3=seats 4=passenger 5=payment 6=confirmed
  int _step = 0;

  // location
  bool _detecting = true;
  String _city = '';

  // search
  final _searchCtrl = TextEditingController();
  String _dest = '';
  final _dateCtrl = TextEditingController();
  int _pax = 1;
  _Route? _route;
  bool _showDropdown = false;
  List<String> _filtered = [];

  // category & seats
  _Cat? _cat;
  final Set<String> _chosen = {};
  final Set<String> _taken = {'A2','B3','C1','D2','A4','B1'};

  // passenger
  final _nameCtrl   = TextEditingController();
  final _idCtrl     = TextEditingController();
  final _emailCtrl  = TextEditingController();
  final _phoneCtrl  = TextEditingController();
  bool _idOk = false;

  // payment
  String _pay = 'Wallet';
  final _cardCtrl = TextEditingController();
  final _expCtrl  = TextEditingController();
  final _cvvCtrl  = TextEditingController();
  final _mobCtrl  = TextEditingController();

  BoatBooking? _done;

  late AnimationController _pulse;
  late Animation<double> _pulseAnim;

  @override
  void initState() {
    super.initState();
    _pulse = AnimationController(vsync: this,
        duration: const Duration(milliseconds: 1200))..repeat(reverse: true);
    _pulseAnim = Tween(begin: 0.8, end: 1.0)
        .animate(CurvedAnimation(parent: _pulse, curve: Curves.easeInOut));
    Future.delayed(const Duration(milliseconds: 1600), () {
      if (mounted) setState(() { _city = 'Douala'; _detecting = false; });
    });
  }

  @override
  void dispose() {
    _pulse.dispose();
    for (final c in [_searchCtrl,_dateCtrl,_nameCtrl,_idCtrl,
        _emailCtrl,_phoneCtrl,_cardCtrl,_expCtrl,_cvvCtrl,_mobCtrl]) {
      c.dispose();
    }
    super.dispose();
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  double get _km => double.tryParse(
      _route?.distance.replaceAll(' km','') ?? '0') ?? 0;
  double get _seatPrice => (_cat?.rate ?? 0) * _km;
  double get _total => _seatPrice * _pax;

  List<String> get _fromDests =>
      _routes.where((r) => r.from == _city).map((r) => r.to).toList();

  List<String> get _recents =>
      (_recentMap[_city] ?? []).where(_fromDests.contains).toList();

  String get _title => const [
    'Book a Boat','Route Map','Choose Class',
    'Select Seats','Passenger Info','Payment','Booking Confirmed',
  ][_step];

  // ── Build ─────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Column(children: [
        _topBar(),
        if (_step > 0 && _step < 6) _progressBar(),
        Expanded(child: _body()),
      ]));
  }

  Widget _body() {
    switch (_step) {
      case 0: return _searchStep();
      case 1: return _mapStep();
      case 2: return _catStep();
      case 3: return _seatsStep();
      case 4: return _passengerStep();
      case 5: return _payStep();
      case 6: return _doneStep();
      default: return const SizedBox();
    }
  }

  Widget _topBar() => Container(
    color: AppColors.bgCard,
    child: SafeArea(bottom: false, child: Padding(
      padding: const EdgeInsets.fromLTRB(12, 10, 16, 12),
      child: Row(children: [
        GestureDetector(
          onTap: () => _step == 0
              ? Navigator.pop(context)
              : setState(() => _step--),
          child: Container(width: 38, height: 38,
            decoration: BoxDecoration(color: AppColors.bgMid,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.cardBorder)),
            child: const Icon(Icons.arrow_back_rounded,
                color: AppColors.textDark, size: 20))),
        const SizedBox(width: 12),
        Expanded(child: Text(_title, style: const TextStyle(
            color: AppColors.textDark,
            fontWeight: FontWeight.w800, fontSize: 17))),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: _teal.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(20)),
          child: const Row(children: [
            Icon(Icons.directions_boat_rounded, color: _teal, size: 14),
            SizedBox(width: 4),
            Text('Boat', style: TextStyle(color: _teal,
                fontSize: 11, fontWeight: FontWeight.w700)),
          ])),
      ]))));

  Widget _progressBar() => Container(
    color: AppColors.bgCard,
    padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
    child: Row(children: List.generate(6, (i) =>
      Expanded(child: Row(children: [
        Expanded(child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          height: 4,
          decoration: BoxDecoration(
            color: i < _step ? _teal : AppColors.cardBorder,
            borderRadius: BorderRadius.circular(2)))),
        if (i < 5) const SizedBox(width: 4),
      ])))));

  // ═══════════════════════════════════════════════════════════════
  // STEP 0 — SEARCH
  // ═══════════════════════════════════════════════════════════════
  Widget _searchStep() {
    final dests = _fromDests;
    return GestureDetector(
      onTap: () {
        if (_showDropdown) setState(() => _showDropdown = false);
        FocusScope.of(context).unfocus();
      },
      child: ListView(padding: EdgeInsets.zero, children: [
        Container(
          margin: const EdgeInsets.fromLTRB(16,16,16,12),
          decoration: BoxDecoration(
            color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.cardBorder),
            boxShadow: [BoxShadow(
                color: Colors.black.withValues(alpha: 0.3),
                blurRadius: 12, offset: const Offset(0,4))]),
          child: Column(children: [
            // Origin
            Padding(
              padding: const EdgeInsets.fromLTRB(16,14,16,0),
              child: Row(children: [
                Container(width: 12, height: 12,
                  decoration: const BoxDecoration(
                      color: Color(0xFF1DB954),
                      shape: BoxShape.circle)),
                const SizedBox(width: 14),
                Expanded(child: _detecting
                    ? Row(children: [
                        ScaleTransition(scale: _pulseAnim,
                          child: const SizedBox(width: 18, height: 18,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: _teal))),
                        const SizedBox(width: 10),
                        const Text('Detecting your location…',
                            style: TextStyle(
                                color: AppColors.textGrey,
                                fontSize: 14)),
                      ])
                    : Row(children: [
                        const Icon(Icons.my_location_rounded,
                            color: Color(0xFF1DB954), size: 16),
                        const SizedBox(width: 8),
                        Expanded(child: Text(_city, style: const TextStyle(
                            color: AppColors.textDark,
                            fontWeight: FontWeight.w700, fontSize: 15))),
                        GestureDetector(
                          onTap: () => _pickCity(
                            title: 'Change your city',
                            cities: _allCities,
                            onPick: (c) => setState(() {
                              _city = c; _dest = ''; _route = null;
                              _searchCtrl.clear(); _showDropdown = false;
                            })),
                          child: const Text('Change', style: TextStyle(
                              color: _teal, fontSize: 12,
                              fontWeight: FontWeight.w600))),
                      ])),
              ])),
            // dotted divider
            Padding(
              padding: const EdgeInsets.only(left: 21),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start,
                children: List.generate(4, (_) => Container(
                  width: 2, height: 4,
                  margin: const EdgeInsets.symmetric(vertical: 2),
                  decoration: BoxDecoration(color: AppColors.cardBorder,
                      borderRadius: BorderRadius.circular(1)))))),
            // Destination
            Padding(
              padding: const EdgeInsets.fromLTRB(16,0,16,14),
              child: Row(children: [
                Container(width: 12, height: 12,
                  decoration: BoxDecoration(
                    color: _teal, borderRadius: BorderRadius.circular(3))),
                const SizedBox(width: 14),
                Expanded(child: TextField(
                  controller: _searchCtrl,
                  enabled: !_detecting,
                  onChanged: (v) {
                    final q = v.toLowerCase().trim();
                    setState(() {
                      _dest = ''; _route = null;
                      if (q.isEmpty) {
                        _showDropdown = false; _filtered = [];
                      } else {
                        _showDropdown = true;
                        _filtered = dests
                            .where((c) => c.toLowerCase().contains(q))
                            .toList();
                      }
                    });
                  },
                  style: const TextStyle(color: AppColors.textDark,
                      fontSize: 15, fontWeight: FontWeight.w600),
                  decoration: InputDecoration(
                    hintText: 'Where to?',
                    hintStyle: const TextStyle(
                        color: AppColors.textGrey, fontSize: 15),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.zero,
                    suffixIcon: _searchCtrl.text.isNotEmpty
                        ? GestureDetector(
                            onTap: () => setState(() {
                              _searchCtrl.clear(); _dest = '';
                              _route = null; _showDropdown = false;
                            }),
                            child: const Icon(Icons.close_rounded,
                                color: AppColors.textGrey, size: 18))
                        : null))),
              ])),
            // Inline dropdown
            if (_showDropdown) ...[
              const Divider(height: 1, color: AppColors.cardBorder),
              ConstrainedBox(
                constraints: const BoxConstraints(maxHeight: 200),
                child: _filtered.isEmpty
                    ? const Padding(
                        padding: EdgeInsets.all(16),
                        child: Text('No routes found',
                            style: TextStyle(
                                color: AppColors.textGrey,
                                fontSize: 13)))
                    : ListView.builder(
                        shrinkWrap: true,
                        padding: EdgeInsets.zero,
                        itemCount: _filtered.length,
                        itemBuilder: (_, i) {
                          final city = _filtered[i];
                          final r = _routes.firstWhere(
                              (x) => x.from == _city && x.to == city);
                          return InkWell(
                            onTap: () {
                              FocusScope.of(context).unfocus();
                              setState(() {
                                _dest = city; _searchCtrl.text = city;
                                _route = r; _showDropdown = false;
                              });
                            },
                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 12),
                              child: Row(children: [
                                Container(width: 34, height: 34,
                                  decoration: BoxDecoration(
                                    color: _teal.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(8)),
                                  child: const Icon(
                                      Icons.directions_boat_rounded,
                                      color: _teal, size: 18)),
                                const SizedBox(width: 12),
                                Expanded(child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                  Text(city, style: const TextStyle(
                                      color: AppColors.textDark,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 14)),
                                  Text('${r.distance}  ·  ${r.duration}',
                                      style: const TextStyle(
                                          color: AppColors.textGrey,
                                          fontSize: 11)),
                                ])),
                                Text('XAF ${_minPrice(r)}+',
                                    style: const TextStyle(
                                        color: _teal,
                                        fontWeight: FontWeight.w700,
                                        fontSize: 13)),
                              ])));
                        })),
            ],
          ])),

        // Date + Passengers
        Padding(
          padding: const EdgeInsets.fromLTRB(16,0,16,12),
          child: Row(children: [
            Expanded(child: _datePicker()),
            const SizedBox(width: 12),
            Expanded(child: Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 12, vertical: 12),
              decoration: BoxDecoration(color: AppColors.bgCard,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.cardBorder)),
              child: Row(children: [
                const Icon(Icons.person_rounded, color: _teal, size: 18),
                const SizedBox(width: 6),
                Text('$_pax pax', style: const TextStyle(
                    color: AppColors.textDark, fontSize: 13)),
                const Spacer(),
                _cntBtn(Icons.remove_rounded,
                    _pax > 1 ? () => setState(() => _pax--) : null),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Text('$_pax', style: const TextStyle(
                      color: AppColors.textDark,
                      fontWeight: FontWeight.w800))),
                _cntBtn(Icons.add_rounded,
                    _pax < 9 ? () => setState(() => _pax++) : null),
              ]))),
          ])),

        // Find Boats button
        Padding(
          padding: const EdgeInsets.fromLTRB(16,0,16,24),
          child: SizedBox(width: double.infinity, height: 54,
            child: ElevatedButton.icon(
              onPressed: !_detecting && _dest.isNotEmpty ? _goSearch : null,
              icon: const Icon(Icons.search_rounded,
                  color: Colors.white, size: 20),
              label: Text(
                _dest.isNotEmpty
                    ? 'Find Boats to $_dest' : 'Find Boats',
                style: const TextStyle(fontWeight: FontWeight.w800,
                    fontSize: 15, color: Colors.white)),
              style: ElevatedButton.styleFrom(
                backgroundColor: _teal,
                disabledBackgroundColor: AppColors.cardBorder,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16)))))),

        // Recent chips
        if (!_detecting && !_showDropdown) ...[
          if (_recents.isNotEmpty) ...[
            Padding(
              padding: const EdgeInsets.fromLTRB(16,0,16,10),
              child: Row(children: [
                const Icon(Icons.history_rounded, color: _teal, size: 16),
                const SizedBox(width: 6),
                const Text('Recent', style: TextStyle(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.w700, fontSize: 14)),
              ])),
            SizedBox(height: 44,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children: _recents.map((d) {
                  final sel = _dest == d;
                  return GestureDetector(
                    onTap: () {
                      final r = _routes.firstWhere(
                          (x) => x.from == _city && x.to == d);
                      setState(() {
                        _dest = d; _searchCtrl.text = d;
                        _route = r; _showDropdown = false;
                      });
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 150),
                      margin: const EdgeInsets.only(right: 10),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: sel
                            ? _teal.withValues(alpha: 0.12)
                            : AppColors.bgCard,
                        borderRadius: BorderRadius.circular(22),
                        border: Border.all(
                            color: sel ? _teal : AppColors.cardBorder)),
                      child: Row(children: [
                        Icon(Icons.access_time_rounded,
                            color: sel ? _teal : AppColors.textGrey,
                            size: 13),
                        const SizedBox(width: 5),
                        Text(d, style: TextStyle(
                            color: sel ? _teal : AppColors.textGrey,
                            fontSize: 13,
                            fontWeight: FontWeight.w600)),
                      ])));
                }).toList())),
            const SizedBox(height: 20),
          ],

          // All destinations
          Padding(
            padding: const EdgeInsets.fromLTRB(16,0,16,10),
            child: Row(children: [
              const Icon(Icons.near_me_rounded, color: _teal, size: 16),
              const SizedBox(width: 6),
              Text('From $_city', style: const TextStyle(
                  color: AppColors.textDark,
                  fontWeight: FontWeight.w700, fontSize: 14)),
            ])),
          ...dests.map((d) {
            final r = _routes.firstWhere(
                (x) => x.from == _city && x.to == d);
            final sel = _dest == d;
            return GestureDetector(
              onTap: () => setState(() {
                _dest = d; _searchCtrl.text = d;
                _route = r; _showDropdown = false;
              }),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                margin: const EdgeInsets.fromLTRB(16,0,16,10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: sel
                      ? _teal.withValues(alpha: 0.06) : AppColors.bgCard,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                      color: sel ? _teal : AppColors.cardBorder,
                      width: sel ? 1.5 : 1)),
                child: Row(children: [
                  Container(width: 44, height: 44,
                    decoration: BoxDecoration(
                      color: _teal.withValues(alpha: 0.10),
                      borderRadius: BorderRadius.circular(12)),
                    child: const Icon(Icons.directions_boat_rounded,
                        color: _teal, size: 22)),
                  const SizedBox(width: 12),
                  Expanded(child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                    Text(d, style: TextStyle(
                        color: AppColors.textDark,
                        fontWeight: sel
                            ? FontWeight.w800 : FontWeight.w700,
                        fontSize: 14)),
                    Text('${r.distance}  ·  ${r.duration}',
                        style: const TextStyle(
                            color: AppColors.textGrey, fontSize: 11)),
                  ])),
                  Column(crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                    Text('from XAF ${_minPrice(r)}',
                        style: const TextStyle(color: _teal,
                            fontWeight: FontWeight.w700, fontSize: 13)),
                    const Text('per seat', style: TextStyle(
                        color: AppColors.textGrey, fontSize: 10)),
                  ]),
                  if (sel) ...[
                    const SizedBox(width: 8),
                    const Icon(Icons.check_circle_rounded,
                        color: _teal, size: 20),
                  ],
                ])));
          }).toList(),
          const SizedBox(height: 20),
        ],
      ]));
  }

  String _minPrice(_Route r) {
    final km = double.tryParse(
        r.distance.replaceAll(' km','')) ?? 0;
    return (0.05 * km).toStringAsFixed(0);
  }

  void _goSearch() {
    if (_route == null) {
      final match = _routes.cast<_Route?>().firstWhere(
          (x) => x!.from == _city && x.to == _dest, orElse: () => null);
      if (match == null) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text('No direct route from $_city to $_dest'),
            backgroundColor: Colors.orange));
        return;
      }
      _route = match;
    }
    setState(() => _step = 1);
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 1 — ROUTE MAP
  // ═══════════════════════════════════════════════════════════════
  Widget _mapStep() {
    final r = _route;
    if (r == null) return const SizedBox();
    return Column(children: [
      Container(
        padding: const EdgeInsets.fromLTRB(16,12,16,12),
        color: AppColors.bgCard,
        child: Row(children: [
          _pill(r.from, const Color(0xFF1DB954)),
          Expanded(child: Row(children: [
            Expanded(child: Container(height: 1.5,
                color: _teal.withValues(alpha: 0.35))),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 8),
              child: Icon(Icons.directions_boat_rounded,
                  color: _teal, size: 20)),
            Expanded(child: Container(height: 1.5,
                color: _teal.withValues(alpha: 0.35))),
          ])),
          _pill(r.to, _teal),
        ])),
      Expanded(child: Stack(children: [
        Container(color: const Color(0xFF071520),
          child: CustomPaint(
              size: const Size(double.infinity, double.infinity),
              painter: _WaterPainter())),
        CustomPaint(
            size: const Size(double.infinity, double.infinity),
            painter: _RoutePainter(r.stops, _teal)),
        ..._stopLabels(r.stops),
        Positioned(top: 16, left: 16,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.55),
              borderRadius: BorderRadius.circular(6)),
            child: const Text('Cameroon Waterways',
                style: TextStyle(color: Colors.white54,
                    fontSize: 9, fontWeight: FontWeight.w500)))),
      ])),
      Container(
        padding: const EdgeInsets.fromLTRB(16,12,16,12),
        color: AppColors.bgCard,
        child: Row(children: [
          _chip(Icons.straighten_rounded, r.distance),
          const SizedBox(width: 14),
          _chip(Icons.access_time_rounded, r.duration),
          const SizedBox(width: 14),
          _chip(Icons.place_rounded, '${r.stops.length} stops'),
          const Spacer(),
          SizedBox(height: 42,
            child: ElevatedButton(
              onPressed: () => setState(() => _step = 2),
              style: ElevatedButton.styleFrom(
                backgroundColor: _teal,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12))),
              child: const Text('Choose Class',
                  style: TextStyle(color: Colors.white,
                      fontWeight: FontWeight.w800, fontSize: 13)))),
        ])),
      Container(
        color: AppColors.bgCard,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start,
          children: [
          const Divider(height: 1, color: AppColors.cardBorder),
          Padding(
            padding: const EdgeInsets.fromLTRB(16,10,16,4),
            child: Text('${r.stops.length} Stops',
                style: const TextStyle(color: AppColors.textGrey,
                    fontSize: 11, fontWeight: FontWeight.w600))),
          ...r.stops.asMap().entries.map((e) {
            final first = e.key == 0;
            final last  = e.key == r.stops.length - 1;
            return Padding(
              padding: const EdgeInsets.fromLTRB(16,4,16,4),
              child: Row(children: [
                Column(children: [
                  Container(width: 10, height: 10,
                    decoration: BoxDecoration(
                      color: first ? const Color(0xFF1DB954)
                          : last ? _teal : Colors.white54,
                      shape: BoxShape.circle,
                      border: Border.all(
                          color: Colors.white24, width: 1.5))),
                  if (!last)
                    Container(width: 1.5, height: 16,
                        color: AppColors.cardBorder),
                ]),
                const SizedBox(width: 10),
                Text(e.value.name, style: TextStyle(
                    color: first || last
                        ? AppColors.textDark : AppColors.textGrey,
                    fontSize: 12,
                    fontWeight: first || last
                        ? FontWeight.w700 : FontWeight.normal)),
              ]));
          }).toList(),
          const SizedBox(height: 10),
        ])),
    ]);
  }

  Widget _pill(String label, Color c) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
    decoration: BoxDecoration(
      color: c.withValues(alpha: 0.12),
      borderRadius: BorderRadius.circular(8),
      border: Border.all(color: c.withValues(alpha: 0.4))),
    child: Text(label, style: TextStyle(
        color: c, fontWeight: FontWeight.w800, fontSize: 13)));

  Widget _chip(IconData icon, String label) => Row(children: [
    Icon(icon, color: _teal, size: 14),
    const SizedBox(width: 4),
    Text(label, style: const TextStyle(
        color: AppColors.textGrey, fontSize: 12)),
  ]);

  List<Widget> _stopLabels(List<_Stop> stops) {
    if (stops.length < 2) return [];
    final lats = stops.map((s) => s.lat).toList();
    final lngs = stops.map((s) => s.lng).toList();
    final minLat = lats.reduce((a,b) => a<b?a:b);
    final maxLat = lats.reduce((a,b) => a>b?a:b);
    final minLng = lngs.reduce((a,b) => a<b?a:b);
    final maxLng = lngs.reduce((a,b) => a>b?a:b);
    final latR = (maxLat-minLat).clamp(0.001, 100.0);
    final lngR = (maxLng-minLng).clamp(0.001, 100.0);

    return stops.asMap().entries.map((e) {
      final i = e.key; final s = e.value;
      final x = (s.lng - minLng) / lngR * 0.72 + 0.12;
      final y = (1.0 - (s.lat - minLat) / latR) * 0.72 + 0.10;
      final first = i == 0; final last = i == stops.length - 1;
      final dot = first ? const Color(0xFF1DB954) : last ? _teal : Colors.white;
      return Positioned.fill(child: FractionallySizedBox(
        widthFactor: 1.0, heightFactor: 1.0,
        child: Align(
          alignment: Alignment(x * 2 - 1, y * 2 - 1),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Container(
              width: first || last ? 18 : 12,
              height: first || last ? 18 : 12,
              decoration: BoxDecoration(
                color: dot, shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2.5),
                boxShadow: [BoxShadow(
                    color: dot.withValues(alpha: 0.5),
                    blurRadius: 8, spreadRadius: 1)])),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 7, vertical: 3),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.8),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(
                    color: dot.withValues(alpha: 0.4))),
              child: Text(
                s.name.length > 16
                    ? s.name.substring(0,16) : s.name,
                style: const TextStyle(color: Colors.white,
                    fontSize: 9,
                    fontWeight: FontWeight.w700))),
          ]))));
    }).toList();
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 2 — CATEGORY
  // ═══════════════════════════════════════════════════════════════
  Widget _catStep() => ListView(padding: const EdgeInsets.all(16), children: [
    _routeStrip(),
    const SizedBox(height: 16),
    const Text('Choose your vessel class', style: TextStyle(
        color: AppColors.textDark,
        fontWeight: FontWeight.w700, fontSize: 16)),
    const SizedBox(height: 4),
    const Text('Price shown per seat for the full route',
        style: TextStyle(color: AppColors.textGrey, fontSize: 12)),
    const SizedBox(height: 14),
    ..._cats.map((c) {
      final perSeat = c.rate * _km;
      final tot = perSeat * _pax;
      final sel = _cat?.name == c.name;
      return GestureDetector(
        onTap: () => setState(() => _cat = c),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: sel ? c.color.withValues(alpha: 0.08) : AppColors.bgCard,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
                color: sel ? c.color : AppColors.cardBorder,
                width: sel ? 2 : 1)),
          child: Row(children: [
            Container(width: 54, height: 54,
              decoration: BoxDecoration(
                color: c.color.withValues(alpha: 0.14),
                borderRadius: BorderRadius.circular(14)),
              child: Icon(c.icon, color: c.color, size: 28)),
            const SizedBox(width: 14),
            Expanded(child: Column(
              crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Text(c.name, style: const TextStyle(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.w800, fontSize: 15)),
                if (sel) ...[
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(color: c.color,
                        borderRadius: BorderRadius.circular(10)),
                    child: const Text('Selected',
                        style: TextStyle(color: Colors.white,
                            fontSize: 8,
                            fontWeight: FontWeight.w700))),
                ],
              ]),
              const SizedBox(height: 3),
              Text(c.desc, style: const TextStyle(
                  color: AppColors.textGrey, fontSize: 11)),
              const SizedBox(height: 8),
              Wrap(spacing: 4, runSpacing: 4,
                children: c.amenities.split(' · ').map((a) =>
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: c.color.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(4)),
                    child: Text(a, style: TextStyle(
                        color: c.color, fontSize: 9,
                        fontWeight: FontWeight.w600)))).toList()),
            ])),
            const SizedBox(width: 10),
            Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
              Text('XAF ${perSeat.toStringAsFixed(0)}',
                  style: TextStyle(color: c.color,
                      fontWeight: FontWeight.w900, fontSize: 20)),
              const Text('/seat', style: TextStyle(
                  color: AppColors.textGrey, fontSize: 10)),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: c.color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8)),
                child: Text('Total XAF ${tot.toStringAsFixed(0)}',
                    style: TextStyle(color: c.color,
                        fontSize: 10, fontWeight: FontWeight.w700))),
            ]),
          ])));
    }).toList(),
    const SizedBox(height: 8),
    SizedBox(width: double.infinity, height: 54,
      child: ElevatedButton(
        onPressed: _cat != null ? () => setState(() => _step = 3) : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: _teal,
          disabledBackgroundColor: AppColors.cardBorder,
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16))),
        child: Text(
          _cat != null
              ? 'Select Seats  ·  XAF ${_total.toStringAsFixed(0)}'
              : 'Select a Class',
          style: const TextStyle(fontWeight: FontWeight.w800,
              fontSize: 15, color: Colors.white)))),
  ]);

  // ═══════════════════════════════════════════════════════════════
  // STEP 3 — SEATS
  // ═══════════════════════════════════════════════════════════════
  Widget _seatsStep() {
    const rows = ['A','B','C','D','E'];
    const cols = [1,2,3,4];
    return ListView(padding: const EdgeInsets.all(16), children: [
      _routeStrip(),
      const SizedBox(height: 14),
      Center(child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(
            horizontal: 20, vertical: 8),
        decoration: BoxDecoration(
          color: _teal.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: _teal.withValues(alpha: 0.3))),
        child: const Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(Icons.directions_boat_rounded,
              color: _teal, size: 16),
          SizedBox(width: 8),
          Text('Bow (Front)',
              style: TextStyle(color: _teal,
                  fontSize: 12, fontWeight: FontWeight.w600)),
        ]))),
      Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder)),
        child: Column(children: [
          Row(children: [
            const SizedBox(width: 28),
            ...cols.map((c) => Expanded(child: Center(
              child: Text('$c', style: const TextStyle(
                  color: AppColors.textGrey, fontSize: 11))))),
          ]),
          const SizedBox(height: 8),
          ...rows.map((row) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(children: [
              SizedBox(width: 28, child: Text(row,
                  style: const TextStyle(
                      color: AppColors.textGrey, fontSize: 11))),
              ...cols.map((col) {
                final id = '$row$col';
                final taken = _taken.contains(id);
                final sel = _chosen.contains(id);
                return Expanded(child: GestureDetector(
                  onTap: taken ? null : () => setState(() {
                    if (sel) {
                      _chosen.remove(id);
                    } else if (_chosen.length < _pax) {
                      _chosen.add(id);
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                        content: Text('Select exactly $_pax seat(s)'),
                        backgroundColor: Colors.orange,
                        duration: const Duration(seconds: 1)));
                    }
                  }),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    margin: const EdgeInsets.all(3),
                    height: 36,
                    decoration: BoxDecoration(
                      color: taken
                          ? AppColors.cardBorder.withValues(alpha: 0.2)
                          : sel ? _teal : AppColors.bgCardLight,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: taken ? Colors.transparent
                            : sel ? _teal
                            : AppColors.cardBorder)),
                    child: Center(child: Icon(
                      taken ? Icons.close_rounded
                          : sel ? Icons.check_rounded
                          : Icons.event_seat_rounded,
                      size: 14,
                      color: taken ? AppColors.cardBorder
                          : sel ? Colors.white
                          : AppColors.textGrey)))));
              }).toList(),
            ]))).toList(),
        ])),
      const SizedBox(height: 12),
      Row(mainAxisAlignment: MainAxisAlignment.center, children: [
        _legend(AppColors.bgCardLight, AppColors.cardBorder, 'Available'),
        const SizedBox(width: 20),
        _legend(_teal, _teal, 'Selected'),
        const SizedBox(width: 20),
        _legend(AppColors.cardBorder.withValues(alpha: 0.2),
            Colors.transparent, 'Taken'),
      ]),
      const SizedBox(height: 14),
      AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: _chosen.length == _pax
              ? _teal.withValues(alpha: 0.08) : AppColors.bgCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
              color: _chosen.length == _pax
                  ? _teal : AppColors.cardBorder)),
        child: Row(children: [
          const Icon(Icons.event_seat_rounded,
              color: _teal, size: 20),
          const SizedBox(width: 10),
          Expanded(child: Text(
            _chosen.isEmpty
                ? 'Tap seats to select ($_pax needed)'
                : 'Seats: ${(_chosen.toList()..sort()).join(', ')}',
            style: const TextStyle(color: AppColors.textDark,
                fontWeight: FontWeight.w600, fontSize: 13))),
          Text('${_chosen.length}/$_pax',
              style: TextStyle(
                  color: _chosen.length == _pax
                      ? _teal : AppColors.textGrey,
                  fontWeight: FontWeight.w800)),
        ])),
      const SizedBox(height: 16),
      SizedBox(width: double.infinity, height: 54,
        child: ElevatedButton(
          onPressed: _chosen.length == _pax
              ? () => setState(() => _step = 4) : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: _teal,
            disabledBackgroundColor: AppColors.cardBorder,
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16))),
          child: Text(
            _chosen.length == _pax
                ? 'Continue  ·  Seats ${(_chosen.toList()..sort()).join(', ')}'
                : 'Select $_pax seat(s) to continue',
            style: const TextStyle(fontWeight: FontWeight.w700,
                fontSize: 13, color: Colors.white)))),
    ]);
  }

  Widget _legend(Color fill, Color border, String label) =>
    Row(mainAxisSize: MainAxisSize.min, children: [
      Container(width: 14, height: 14,
        decoration: BoxDecoration(color: fill,
          borderRadius: BorderRadius.circular(3),
          border: Border.all(color: border))),
      const SizedBox(width: 5),
      Text(label, style: const TextStyle(
          color: AppColors.textGrey, fontSize: 11)),
    ]);

  // ═══════════════════════════════════════════════════════════════
  // STEP 4 — PASSENGER
  // ═══════════════════════════════════════════════════════════════
  Widget _passengerStep() {
    final cat   = _cat!;
    final route = _route!;
    return ListView(padding: const EdgeInsets.all(16), children: [
      _summaryBar(cat, route),
      const SizedBox(height: 20),
      const Text('Passenger Information', style: TextStyle(
          color: AppColors.textDark,
          fontWeight: FontWeight.w700, fontSize: 15)),
      const SizedBox(height: 12),
      _lbl('Full Name'),
      _field(_nameCtrl, 'e.g. Jean Dupont', Icons.person_rounded),
      const SizedBox(height: 12),
      _lbl('National ID / Passport'),
      _field(_idCtrl, 'e.g. 1234567890', Icons.credit_card_rounded),
      const SizedBox(height: 12),
      _lbl('Email'),
      _field(_emailCtrl, 'e.g. jean@email.com',
          Icons.email_rounded, type: TextInputType.emailAddress),
      const SizedBox(height: 12),
      _lbl('Phone'),
      _field(_phoneCtrl, '+237 6XX XXX XXX',
          Icons.phone_rounded, type: TextInputType.phone),
      const SizedBox(height: 20),
      const Text('Upload ID Document', style: TextStyle(
          color: AppColors.textDark,
          fontWeight: FontWeight.w700, fontSize: 15)),
      const SizedBox(height: 10),
      GestureDetector(
        onTap: () => setState(() => _idOk = true),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: _idOk ? _teal.withValues(alpha: 0.07) : AppColors.bgCard,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
                color: _idOk ? _teal : AppColors.cardBorder)),
          child: Row(children: [
            Container(width: 44, height: 44,
              decoration: BoxDecoration(
                color: (_idOk ? _teal : AppColors.textGrey)
                    .withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12)),
              child: Icon(Icons.badge_rounded,
                  color: _idOk ? _teal : AppColors.textGrey, size: 22)),
            const SizedBox(width: 12),
            const Expanded(child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
              Text('National ID / Passport *', style: TextStyle(
                  color: AppColors.textDark,
                  fontWeight: FontWeight.w700, fontSize: 13)),
              Text('PDF or image scan',
                  style: TextStyle(color: AppColors.textGrey, fontSize: 11)),
            ])),
            if (_idOk)
              const Icon(Icons.check_circle_rounded,
                  color: _teal, size: 24)
            else
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 10, vertical: 5),
                decoration: BoxDecoration(color: AppColors.bgCardLight,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.cardBorder)),
                child: const Text('Upload', style: TextStyle(
                    color: AppColors.textGrey, fontSize: 11,
                    fontWeight: FontWeight.w600))),
          ]))),
      const SizedBox(height: 28),
      SizedBox(width: double.infinity, height: 54,
        child: ElevatedButton(
          onPressed: _idOk && _nameCtrl.text.isNotEmpty &&
              _idCtrl.text.isNotEmpty
              ? () => setState(() => _step = 5) : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: _teal,
            disabledBackgroundColor: AppColors.cardBorder,
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16))),
          child: const Text('Continue to Payment',
              style: TextStyle(fontWeight: FontWeight.w800,
                  fontSize: 15, color: Colors.white)))),
    ]);
  }

  Widget _summaryBar(_Cat cat, _Route route) => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: _teal.withValues(alpha: 0.07),
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: _teal.withValues(alpha: 0.3))),
    child: Row(children: [
      Icon(cat.icon, color: cat.color, size: 18),
      const SizedBox(width: 8),
      Expanded(child: Text(
        '${route.from} → ${route.to}  ·  ${cat.name}  ·  '
        'Seats: ${(_chosen.toList()..sort()).join(', ')}',
        style: const TextStyle(
            color: AppColors.textGrey, fontSize: 11))),
      Text('XAF ${_total.toStringAsFixed(0)}',
          style: const TextStyle(color: _teal,
              fontWeight: FontWeight.w900, fontSize: 15)),
    ]));

  // ═══════════════════════════════════════════════════════════════
  // STEP 5 — PAYMENT
  // ═══════════════════════════════════════════════════════════════
  Widget _payStep() {
    final cat   = _cat!;
    final route = _route!;
    return ListView(padding: const EdgeInsets.all(16), children: [
      Container(
        padding: const EdgeInsets.all(16),
        margin: const EdgeInsets.only(bottom: 20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft, end: Alignment.bottomRight,
            colors: [_teal.withValues(alpha: 0.18),
                     _teal.withValues(alpha: 0.04)]),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: _teal.withValues(alpha: 0.3))),
        child: Column(children: [
          _prow('Route', '${route.from} → ${route.to}'),
          _prow('Class', cat.name),
          _prow('Per seat', 'XAF ${_seatPrice.toStringAsFixed(2)}'),
          _prow('× Passengers', '$_pax'),
          _prow('Seats', (_chosen.toList()..sort()).join(', ')),
          const Divider(color: AppColors.cardBorder, height: 20),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
            const Text('Total', style: TextStyle(
                color: AppColors.textDark,
                fontWeight: FontWeight.w800, fontSize: 16)),
            Text('XAF ${_total.toStringAsFixed(2)}',
                style: const TextStyle(color: _teal,
                    fontWeight: FontWeight.w900, fontSize: 20)),
          ]),
        ])),
      const Text('Payment Method', style: TextStyle(
          color: AppColors.textDark,
          fontWeight: FontWeight.w700, fontSize: 15)),
      const SizedBox(height: 12),
      ...[
        ('Wallet',       Icons.account_balance_wallet_rounded, Color(0xFF4F46E5)),
        ('Mobile Money', Icons.phone_android_rounded,          Color(0xFF1DB954)),
        ('Credit Card',  Icons.credit_card_rounded,            Color(0xFF6366F1)),
      ].map((m) => GestureDetector(
        onTap: () => setState(() => _pay = m.$1),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: _pay == m.$1
                ? m.$3.withValues(alpha: 0.08) : AppColors.bgCard,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
                color: _pay == m.$1 ? m.$3 : AppColors.cardBorder)),
          child: Row(children: [
            Icon(m.$2,
                color: _pay == m.$1 ? m.$3 : AppColors.textGrey,
                size: 22),
            const SizedBox(width: 12),
            Text(m.$1, style: TextStyle(
                color: _pay == m.$1
                    ? AppColors.textDark : AppColors.textGrey,
                fontWeight: FontWeight.w600, fontSize: 14)),
            const Spacer(),
            if (_pay == m.$1)
              Icon(Icons.check_circle_rounded, color: m.$3, size: 20),
          ])))),
      const SizedBox(height: 8),
      if (_pay == 'Wallet') ...[
        _walletCard(), const SizedBox(height: 8),
      ] else if (_pay == 'Credit Card') ...[
        _lbl('Card Number'),
        _field(_cardCtrl, '1234 5678 9012 3456',
            Icons.credit_card_rounded, type: TextInputType.number),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: Column(
            crossAxisAlignment: CrossAxisAlignment.start, children: [
            _lbl('Expiry'),
            _field(_expCtrl, 'MM/YY', Icons.date_range_rounded),
          ])),
          const SizedBox(width: 12),
          Expanded(child: Column(
            crossAxisAlignment: CrossAxisAlignment.start, children: [
            _lbl('CVV'),
            _field(_cvvCtrl, '•••', Icons.lock_rounded,
                type: TextInputType.number, obscure: true),
          ])),
        ]),
        const SizedBox(height: 8),
      ] else ...[
        _lbl('Mobile Number'),
        _field(_mobCtrl, '+237 6XX XXX XXX',
            Icons.phone_rounded, type: TextInputType.phone),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFF1DB954).withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
                color: const Color(0xFF1DB954).withValues(alpha: 0.3))),
          child: const Row(children: [
            Icon(Icons.info_rounded,
                color: Color(0xFF1DB954), size: 16),
            SizedBox(width: 8),
            Expanded(child: Text(
                'Payment prompt will be sent to your phone',
                style: TextStyle(
                    color: Color(0xFF1DB954), fontSize: 11))),
          ])),
        const SizedBox(height: 8),
      ],
      const SizedBox(height: 20),
      SizedBox(width: double.infinity, height: 54,
        child: ElevatedButton(
          onPressed: (_pay == 'Wallet' && walletBalance < _total)
              ? null : _confirm,
          style: ElevatedButton.styleFrom(
            backgroundColor: _teal,
            disabledBackgroundColor: AppColors.cardBorder,
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16))),
          child: Row(mainAxisAlignment: MainAxisAlignment.center,
            children: [
            Icon(_pay == 'Wallet'
                ? Icons.account_balance_wallet_rounded
                : Icons.lock_rounded,
                color: Colors.white, size: 18),
            const SizedBox(width: 8),
            Text('Pay XAF ${_total.toStringAsFixed(2)}',
                style: const TextStyle(fontWeight: FontWeight.w800,
                    fontSize: 16, color: Colors.white)),
          ]))),
      const SizedBox(height: 10),
      const Center(child: Text('Secure & encrypted payment',
          style: TextStyle(
              color: AppColors.textGrey, fontSize: 11))),
    ]);
  }

  Widget _walletCard() => Container(
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      color: walletBalance >= _total
          ? const Color(0xFF4F46E5).withValues(alpha: 0.07)
          : Colors.red.withValues(alpha: 0.07),
      borderRadius: BorderRadius.circular(12),
      border: Border.all(
          color: walletBalance >= _total
              ? const Color(0xFF4F46E5).withValues(alpha: 0.3)
              : Colors.red.withValues(alpha: 0.3))),
    child: Row(children: [
      Icon(Icons.account_balance_wallet_rounded,
          color: walletBalance >= _total
              ? const Color(0xFF4F46E5) : Colors.red, size: 20),
      const SizedBox(width: 10),
      Expanded(child: Column(
        crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Balance: XAF ${walletBalance.toStringAsFixed(2)}',
            style: TextStyle(
                color: walletBalance >= _total
                    ? AppColors.textDark : Colors.red,
                fontWeight: FontWeight.w700, fontSize: 13)),
        if (walletBalance < _total)
          Text('Need XAF ${(_total - walletBalance).toStringAsFixed(2)} more',
              style: const TextStyle(color: Colors.red, fontSize: 11))
        else
          Text('XAF ${_total.toStringAsFixed(2)} will be deducted',
              style: const TextStyle(
                  color: AppColors.textGrey, fontSize: 11)),
      ])),
    ]));

  void _confirm() {
    final ref =
        'TRV-BOAT-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
    final now = DateTime.now();
    const mo = ['Jan','Feb','Mar','Apr','May','Jun',
                 'Jul','Aug','Sep','Oct','Nov','Dec'];
    final dateStr = '${mo[now.month-1]} ${now.day}, ${now.year}';

    if (_pay == 'Wallet') {
      walletBalance -= _total;
      walletTransactions.insert(0, {
        'type':'debit',
        'label':'Boat: ${_route!.from} → ${_route!.to}',
        'amount':-_total, 'date':dateStr, 'icon':'boat',
      });
    }

    final durParts = _route!.duration.split('h');
    final durH = int.tryParse(durParts[0].trim()) ?? 1;
    final booking = BoatBooking(
      id: ref, from: _route!.from, to: _route!.to,
      date: _dateCtrl.text.isNotEmpty ? _dateCtrl.text : dateStr,
      company: 'Traveo Ferry',
      departure: '08:00',
      arrival: '${(8 + durH).toString().padLeft(2,'0')}:00',
      category: _cat!.name,
      passengerName: _nameCtrl.text, idNumber: _idCtrl.text,
      paymentMethod: _pay, reference: ref,
      price: _total, passengers: _pax,
      seats: _chosen.toList()..sort(),
    );
    globalBoatBookings.insert(0, booking);
    globalServiceBookings.insert(0, ServiceBooking(
      id: ref, type: 'Boat - ${_cat!.name}',
      name: '${_route!.from} → ${_route!.to}',
      description: 'Seats: ${booking.seats.join(', ')}',
      destination: _route!.to, date: booking.date,
      price: _total, icon: Icons.directions_boat_rounded,
      color: _cat!.color,
    ));
    bookingsRefreshNotifier.value++;
    setState(() { _done = booking; _step = 6; });
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 6 — CONFIRMED
  // ═══════════════════════════════════════════════════════════════
  Widget _doneStep() {
    final b   = _done;
    if (b == null) return const SizedBox();
    final cat   = _cat!;
    final route = _route!;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(children: [
        const SizedBox(height: 20),
        Container(width: 100, height: 100,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: _teal.withValues(alpha: 0.12),
            border: Border.all(color: _teal, width: 3)),
          child: const Icon(Icons.check_rounded,
              color: _teal, size: 56)),
        const SizedBox(height: 20),
        const Text('Booking Confirmed!', style: TextStyle(
            color: AppColors.textDark,
            fontWeight: FontWeight.w900, fontSize: 24)),
        const SizedBox(height: 6),
        const Text('Your boat ticket has been saved',
            style: TextStyle(
                color: AppColors.textGrey, fontSize: 14)),
        const SizedBox(height: 28),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: _teal.withValues(alpha: 0.3))),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start,
            children: [
            Row(children: [
              Icon(cat.icon, color: cat.color, size: 20),
              const SizedBox(width: 8),
              Text(cat.name, style: TextStyle(
                  color: cat.color,
                  fontWeight: FontWeight.w800, fontSize: 14)),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF1DB954).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20)),
                child: const Text('Confirmed', style: TextStyle(
                    color: Color(0xFF1DB954), fontSize: 11,
                    fontWeight: FontWeight.w700))),
            ]),
            const SizedBox(height: 16),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
              Column(crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                Text(b.departure, style: const TextStyle(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.w900, fontSize: 28)),
                Text(b.from, style: const TextStyle(
                    color: AppColors.textGrey, fontSize: 11)),
              ]),
              Column(children: [
                Icon(cat.icon, color: cat.color, size: 22),
                Text(route.duration, style: const TextStyle(
                    color: AppColors.textGrey, fontSize: 10)),
              ]),
              Column(crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                Text(b.arrival, style: const TextStyle(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.w900, fontSize: 28)),
                Text(b.to, style: const TextStyle(
                    color: AppColors.textGrey, fontSize: 11)),
              ]),
            ]),
            const Divider(color: AppColors.cardBorder, height: 24),
            _crow('Date', b.date),
            _crow('Seats', b.seats.join(', ')),
            _crow('Passengers', '${b.passengers}'),
            _crow('Passenger', b.passengerName),
            _crow('Payment', b.paymentMethod),
            const Divider(color: AppColors.cardBorder, height: 20),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
              const Text('Total Paid', style: TextStyle(
                  color: AppColors.textGrey,
                  fontWeight: FontWeight.w700, fontSize: 14)),
              Text('XAF ${b.price.toStringAsFixed(2)}',
                  style: const TextStyle(color: _teal,
                      fontWeight: FontWeight.w900, fontSize: 22)),
            ]),
            const SizedBox(height: 12),
            Center(child: Text('Ref: ${b.reference}',
                style: TextStyle(
                    color: AppColors.textGrey.withValues(alpha: 0.7),
                    fontSize: 12,
                    fontWeight: FontWeight.w600))),
          ])),
        const SizedBox(height: 24),
        SizedBox(width: double.infinity, height: 50,
          child: ElevatedButton.icon(
            onPressed: () => Navigator.pop(context),
            icon: const Icon(Icons.check_rounded, color: Colors.white),
            label: const Text('Done', style: TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 15, color: Colors.white)),
            style: ElevatedButton.styleFrom(
              backgroundColor: _teal,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14))))),
        const SizedBox(height: 12),
        TextButton(
          onPressed: () => setState(() {
            _step = 0; _cat = null; _route = null;
            _dest = ''; _searchCtrl.clear(); _dateCtrl.clear();
            _chosen.clear(); _idOk = false;
            _nameCtrl.clear(); _idCtrl.clear();
            _showDropdown = false; _done = null;
          }),
          child: const Text('Book Another Boat', style: TextStyle(
              color: _teal, fontWeight: FontWeight.w700))),
      ]));
  }

  // ── Shared helpers ────────────────────────────────────────────
  Widget _routeStrip() => Container(
    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
    decoration: BoxDecoration(
      color: _teal.withValues(alpha: 0.07),
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: _teal.withValues(alpha: 0.25))),
    child: Row(children: [
      const Icon(Icons.directions_boat_rounded, color: _teal, size: 16),
      const SizedBox(width: 8),
      Expanded(child: Text(
        '${_route?.from ?? ''} → ${_route?.to ?? ''}  ·  '
        '${_route?.distance ?? ''}  ·  ${_route?.duration ?? ''}',
        style: const TextStyle(
            color: AppColors.textGrey, fontSize: 12))),
      GestureDetector(
        onTap: () => setState(() => _step = 0),
        child: const Text('Edit', style: TextStyle(
            color: _teal, fontSize: 12,
            fontWeight: FontWeight.w700))),
    ]));

  void _pickCity({
    required String title,
    required List<String> cities,
    required ValueChanged<String> onPick,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
              top: Radius.circular(24))),
      builder: (_) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.6,
        maxChildSize: 0.85,
        builder: (_, ctrl) => Column(children: [
          const SizedBox(height: 12),
          Container(width: 40, height: 4,
            decoration: BoxDecoration(color: AppColors.cardBorder,
                borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Text(title, style: const TextStyle(
                color: AppColors.textDark,
                fontWeight: FontWeight.w800, fontSize: 17))),
          const SizedBox(height: 12),
          Expanded(child: ListView.builder(
            controller: ctrl,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: cities.length,
            itemBuilder: (_, i) => ListTile(
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 4),
              leading: const Icon(Icons.location_on_rounded,
                  color: _teal, size: 20),
              title: Text(cities[i], style: const TextStyle(
                  color: AppColors.textDark, fontSize: 15)),
              onTap: () {
                Navigator.pop(context);
                onPick(cities[i]);
              }))),
        ])));
  }

  Widget _crow(String label, String value) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Row(children: [
      Text(label, style: const TextStyle(
          color: AppColors.textGrey, fontSize: 12)),
      const Spacer(),
      Text(value, style: const TextStyle(
          color: AppColors.textDark, fontSize: 12,
          fontWeight: FontWeight.w600)),
    ]));

  Widget _prow(String label, String value) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Row(children: [
      Text(label, style: const TextStyle(
          color: AppColors.textGrey, fontSize: 13)),
      const Spacer(),
      Text(value, style: const TextStyle(
          color: AppColors.textDark, fontSize: 13)),
    ]));

  Widget _datePicker() => GestureDetector(
    onTap: () async {
      final d = await showDatePicker(
        context: context,
        initialDate: DateTime.now().add(const Duration(days: 1)),
        firstDate: DateTime.now(),
        lastDate: DateTime.now().add(const Duration(days: 365)),
        builder: (ctx, child) => Theme(
          data: Theme.of(ctx).copyWith(
            colorScheme: const ColorScheme.dark(primary: _teal)),
          child: child!));
      if (d != null) setState(() =>
          _dateCtrl.text = '${d.day}/${d.month}/${d.year}');
    },
    child: Container(
      padding: const EdgeInsets.symmetric(
          horizontal: 14, vertical: 14),
      decoration: BoxDecoration(color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder)),
      child: Row(children: [
        const Icon(Icons.calendar_today_rounded,
            color: _teal, size: 18),
        const SizedBox(width: 10),
        Text(_dateCtrl.text.isEmpty
            ? 'Travel date' : _dateCtrl.text,
          style: TextStyle(
            color: _dateCtrl.text.isEmpty
                ? AppColors.textGrey : AppColors.textDark,
            fontSize: 13)),
      ])));

  Widget _lbl(String t) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Text(t, style: const TextStyle(
        color: AppColors.textGrey, fontSize: 12,
        fontWeight: FontWeight.w600)));

  Widget _field(TextEditingController ctrl, String hint, IconData icon,
      {TextInputType type = TextInputType.text, bool obscure = false}) =>
    Container(
      decoration: BoxDecoration(color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder)),
      child: TextField(
        controller: ctrl, keyboardType: type, obscureText: obscure,
        onChanged: (_) => setState(() {}),
        style: const TextStyle(color: AppColors.textDark, fontSize: 14),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(
              color: AppColors.textGrey, fontSize: 13),
          prefixIcon: Icon(icon, color: _teal, size: 20),
          border: InputBorder.none,
          contentPadding:
              const EdgeInsets.symmetric(vertical: 14))));

  Widget _cntBtn(IconData icon, VoidCallback? onTap) => GestureDetector(
    onTap: onTap,
    child: Container(width: 28, height: 28,
      decoration: BoxDecoration(
        color: onTap != null
            ? _teal.withValues(alpha: 0.15) : AppColors.bgCard,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: AppColors.cardBorder)),
      child: Icon(icon,
        color: onTap != null ? _teal : AppColors.textGrey,
        size: 16)));
}

// ─────────────────────────────────────────────────────────────────────────────
// Painters
// ─────────────────────────────────────────────────────────────────────────────
class _WaterPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final base = Paint()..color = const Color(0xFF071B2E);
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), base);
    // water ripples
    final wave = Paint()
      ..color = const Color(0xFF0A2540)
      ..strokeWidth = 1.5;
    for (var y = 0.0; y < size.height; y += 28) {
      final path = Path();
      path.moveTo(0, y);
      for (var x = 0.0; x < size.width; x += 60) {
        path.quadraticBezierTo(x + 15, y - 6, x + 30, y);
        path.quadraticBezierTo(x + 45, y + 6, x + 60, y);
      }
      canvas.drawPath(path, wave);
    }
    // coastline blobs
    final coast = Paint()..color = const Color(0xFF0D2E1A);
    canvas.drawCircle(Offset(size.width * 0.08, size.height * 0.2),
        size.width * 0.12, coast);
    canvas.drawCircle(Offset(size.width * 0.9, size.height * 0.75),
        size.width * 0.09, coast);
    canvas.drawCircle(Offset(size.width * 0.5, size.height * 0.88),
        size.width * 0.07, coast);
  }
  @override bool shouldRepaint(_) => false;
}

class _RoutePainter extends CustomPainter {
  final List<_Stop> stops;
  final Color accent;
  const _RoutePainter(this.stops, this.accent);

  @override
  void paint(Canvas canvas, Size size) {
    if (stops.length < 2) return;
    final lats = stops.map((s) => s.lat).toList();
    final lngs = stops.map((s) => s.lng).toList();
    final minLat = lats.reduce((a,b) => a<b?a:b);
    final maxLat = lats.reduce((a,b) => a>b?a:b);
    final minLng = lngs.reduce((a,b) => a<b?a:b);
    final maxLng = lngs.reduce((a,b) => a>b?a:b);
    final latR = (maxLat-minLat).clamp(0.001, 100.0);
    final lngR = (maxLng-minLng).clamp(0.001, 100.0);

    Offset p(_Stop s) => Offset(
      ((s.lng-minLng)/lngR*0.72+0.12)*size.width,
      ((1.0-(s.lat-minLat)/latR)*0.72+0.10)*size.height);

    final path = Path();
    path.moveTo(p(stops[0]).dx, p(stops[0]).dy);
    for (var i = 1; i < stops.length; i++) {
      final ctrl = Offset(
        (p(stops[i-1]).dx+p(stops[i]).dx)/2,
        p(stops[i-1]).dy);
      path.quadraticBezierTo(
          ctrl.dx, ctrl.dy, p(stops[i]).dx, p(stops[i]).dy);
    }

    // glow
    canvas.drawPath(path, Paint()
      ..color = accent.withValues(alpha: 0.2)
      ..strokeWidth = 16
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke);

    // dashed
    final line = Paint()
      ..color = accent
      ..strokeWidth = 3.5
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;
    for (final m in path.computeMetrics()) {
      var d = 0.0;
      while (d < m.length) {
        canvas.drawPath(m.extractPath(d, d+14), line);
        d += 22;
      }
    }
  }
  @override bool shouldRepaint(_) => false;
}
