import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import 'services_screen.dart';
import '../wallet/wallet_state.dart';
import '../wallet/wallet_screen.dart';
import '../main_nav_screen.dart';

// ─────────────────────────────────────────────────────────────────────────────
// Model
// ─────────────────────────────────────────────────────────────────────────────
final List<BusBooking> globalBusBookings = [];

class BusBooking {
  final String id, from, to, date, company, departure, arrival,
      category, carType, reference;
  String status;
  final double price;
  final int etaMinutes;
  final String driverName, driverPhone, driverPlate;
  BusBooking({
    required this.id, required this.from, required this.to,
    required this.date, required this.company, required this.departure,
    required this.arrival, required this.category, required this.carType,
    required this.reference, required this.price, required this.etaMinutes,
    this.driverName = '', this.driverPhone = '', this.driverPlate = '',
    this.status = 'Confirmed',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────
class _Hood {
  final String name, area;
  final double lat, lng;
  const _Hood(this.name, this.area, this.lat, this.lng);
}

class _RideClass {
  final String name, carType, amenities;
  final IconData icon;
  final Color color;
  final double basePrice;
  const _RideClass(this.name, this.carType, this.amenities,
      this.icon, this.color, this.basePrice);
}

const _hoods = [
  _Hood('Bastos',     'Yaoundé', 3.878,  11.516),
  _Hood('Nlongkak',   'Yaoundé', 3.872,  11.503),
  _Hood('Mvog-Mbi',   'Yaoundé', 3.844,  11.498),
  _Hood('Biyem-Assi', 'Yaoundé', 3.826,  11.482),
  _Hood('Melen',      'Yaoundé', 3.856,  11.521),
  _Hood('Essos',      'Yaoundé', 3.849,  11.533),
  _Hood('Omnisports', 'Yaoundé', 3.861,  11.507),
  _Hood('Ngousso',    'Yaoundé', 3.889,  11.541),
  _Hood('Mendong',    'Yaoundé', 3.812,  11.470),
  _Hood('Nkolbisson', 'Yaoundé', 3.869,  11.441),
  _Hood('Bonanjo',    'Douala',  4.051,  9.697),
  _Hood('Akwa',       'Douala',  4.058,  9.712),
  _Hood('Bonapriso',  'Douala',  4.044,  9.703),
  _Hood('Deido',      'Douala',  4.071,  9.726),
  _Hood('Bali',       'Douala',  4.061,  9.691),
  _Hood('Makepe',     'Douala',  4.079,  9.748),
  _Hood('Logbaba',    'Douala',  4.038,  9.737),
  _Hood('Ndokoti',    'Douala',  4.052,  9.732),
  _Hood('Kotto',      'Douala',  4.028,  9.758),
  _Hood('PK14',       'Douala',  4.083,  9.766),
];

const _classes = [
  _RideClass('Economy',    'Toyota Corolla / Avensis',    'A/C · Music · 4 seats',
      Icons.directions_car_rounded,            Color(0xFF1DB954), 500),
  _RideClass('Comfort',    'Toyota Camry / Honda Accord', 'A/C · USB · Leather · 4 seats',
      Icons.airline_seat_recline_extra_rounded, Color(0xFF3B82F6), 850),
  _RideClass('Premium',    'Mercedes C-Class / BMW 3',    'A/C · Leather · WiFi · Refreshments',
      Icons.star_rounded,                      Color(0xFFF5A623), 1500),
  _RideClass('Van / Group','Toyota HiAce / Ford Transit', 'A/C · 8 seats · Luggage',
      Icons.airport_shuttle_rounded,           Color(0xFF9C27B0), 1200),
];

// Recent neighbourhoods (GPS history simulation)
const _recentNames = ['Nlongkak', 'Essos', 'Omnisports'];

const _orange = Color(0xFFFF9800);

// Driver pool for simulated assignment
const _drivers = [
  {'name': 'Jean-Pierre Mbarga', 'phone': '+237 655 123 456', 'plate': 'LT 4521 A'},
  {'name': 'Emmanuel Tchamba',   'phone': '+237 677 234 567', 'plate': 'CE 8834 B'},
  {'name': 'Rodrigue Nkomo',     'phone': '+237 699 345 678', 'plate': 'LT 2210 C'},
  {'name': 'Samuel Owona',       'phone': '+237 651 456 789', 'plate': 'CE 5567 D'},
];

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────
class BusBookingScreen extends StatefulWidget {
  const BusBookingScreen({super.key});
  @override State<BusBookingScreen> createState() => _State();
}

class _State extends State<BusBookingScreen>
    with SingleTickerProviderStateMixin {

  int _step = 0; // 0=search  1=map+classes  2=confirmed
  bool _detecting = true;
  _Hood? _origin;
  final _destCtrl = TextEditingController();
  _Hood? _dest;
  bool _showDropdown = false;
  List<_Hood> _filtered = [];
  _RideClass? _chosenClass;
  BusBooking? _done;

  late AnimationController _pulse;
  late Animation<double> _pulseAnim;

  @override
  void initState() {
    super.initState();
    _pulse = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 1200))
      ..repeat(reverse: true);
    _pulseAnim = Tween(begin: 0.8, end: 1.0)
        .animate(CurvedAnimation(parent: _pulse, curve: Curves.easeInOut));
    Future.delayed(const Duration(milliseconds: 1800), () {
      if (mounted) setState(() { _origin = _hoods[0]; _detecting = false; });
    });
  }

  @override
  void dispose() {
    _pulse.dispose();
    _destCtrl.dispose();
    super.dispose();
  }

  // ── Helpers ───────────────────────────────────────────────────
  double get _distKm {
    if (_origin == null || _dest == null) return 3.0;
    final dlat = (_dest!.lat - _origin!.lat).abs();
    final dlng = (_dest!.lng - _origin!.lng).abs();
    return ((dlat + dlng) * 111).clamp(1.0, 50.0);
  }

  double _priceFor(_RideClass c) => c.basePrice + _distKm * 60;

  int _etaFor(_RideClass c) {
    final base = (10 + _distKm * 3).round();
    final traffic = _distKm > 5 ? 8 : (_distKm > 2 ? 4 : 0);
    return (base + traffic).clamp(10, 45);
  }

  List<_Hood> get _suggestions => _hoods
      .where((n) => n != _origin && n.area == (_origin?.area ?? ''))
      .take(3)
      .toList();

  List<_Hood> get _recents => _hoods
      .where((n) => _recentNames.contains(n.name) && n != _origin)
      .take(3)
      .toList();

  String get _title => ['Book Your Ride', 'Choose Class', 'Ride Booked!'][_step];

  // ── Build ─────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Column(children: [
        _topBar(),
        Expanded(child: _body()),
      ]),
    );
  }

  Widget _body() {
    switch (_step) {
      case 0: return _searchStep();
      case 1: return _mapStep();
      case 2: return _confirmedStep();
      default: return const SizedBox();
    }
  }

  Widget _topBar() {
    return Container(
      color: AppColors.bgCard,
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(12, 10, 16, 12),
          child: Row(children: [
            GestureDetector(
              onTap: () => _step == 0
                  ? Navigator.pop(context)
                  : setState(() => _step--),
              child: Container(
                width: 38, height: 38,
                decoration: BoxDecoration(
                  color: AppColors.bgMid,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.cardBorder)),
                child: const Icon(Icons.arrow_back_rounded,
                    color: AppColors.textDark, size: 20))),
            const SizedBox(width: 12),
            Expanded(child: Text(_title,
                style: const TextStyle(color: AppColors.textDark,
                    fontWeight: FontWeight.w800, fontSize: 17))),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: _orange.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(20)),
              child: const Row(children: [
                Icon(Icons.local_taxi_rounded, color: _orange, size: 14),
                SizedBox(width: 4),
                Text('Ride', style: TextStyle(color: _orange,
                    fontSize: 11, fontWeight: FontWeight.w700)),
              ])),
          ]),
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════
  // STEP 0 — SEARCH
  // ═══════════════════════════════════════════════════
  Widget _searchStep() {
    return GestureDetector(
      onTap: () {
        if (_showDropdown) setState(() => _showDropdown = false);
        FocusScope.of(context).unfocus();
      },
      child: ListView(
        padding: EdgeInsets.zero,
        children: _buildSearchChildren(),
      ),
    );
  }

  List<Widget> _buildSearchChildren() {
    final children = <Widget>[];

    // ── Big origin/destination card ──────────────────
    children.add(
      Container(
        margin: const EdgeInsets.fromLTRB(16, 20, 16, 0),
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppColors.cardBorder),
          boxShadow: [BoxShadow(
              color: Colors.black.withValues(alpha: 0.3),
              blurRadius: 16, offset: const Offset(0, 6))]),
        child: Column(children: [
          // Origin row
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
            child: Row(crossAxisAlignment: CrossAxisAlignment.center, children: [
              Column(mainAxisSize: MainAxisSize.min, children: [
                Container(width: 13, height: 13,
                  decoration: const BoxDecoration(
                      color: Color(0xFF1DB954), shape: BoxShape.circle)),
                Container(width: 2, height: 36, color: AppColors.cardBorder),
              ]),
              const SizedBox(width: 16),
              Expanded(child: _originContent()),
            ])),
          // Swap divider
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(children: [
              Expanded(child: Divider(color: AppColors.cardBorder, height: 1)),
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 12),
                width: 32, height: 32,
                decoration: BoxDecoration(
                  color: _orange.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                  border: Border.all(color: _orange.withValues(alpha: 0.3))),
                child: const Icon(Icons.swap_vert_rounded,
                    color: _orange, size: 16)),
              Expanded(child: Divider(color: AppColors.cardBorder, height: 1)),
            ])),
          // Destination row
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
            child: Row(crossAxisAlignment: CrossAxisAlignment.center, children: [
              Column(mainAxisSize: MainAxisSize.min, children: [
                Container(width: 2, height: 36, color: AppColors.cardBorder),
                Container(width: 13, height: 13,
                  decoration: BoxDecoration(
                    color: _orange,
                    borderRadius: BorderRadius.circular(3))),
              ]),
              const SizedBox(width: 16),
              Expanded(child: _destContent()),
            ])),
          // Inline dropdown
          if (_showDropdown) _inlineDropdown(),
        ]),
      ),
    );

    // ── Recently Visited ─────────────────────────────
    if (!_detecting && !_showDropdown && _recents.isNotEmpty) {
      children.add(const SizedBox(height: 20));
      children.add(
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
          child: Row(children: [
            const Icon(Icons.history_rounded, color: _orange, size: 15),
            const SizedBox(width: 6),
            const Text('Recently Visited', style: TextStyle(
                color: AppColors.textDark,
                fontWeight: FontWeight.w700, fontSize: 14)),
          ]),
        ),
      );
      children.add(
        SizedBox(
          height: 44,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            children: _recents.map((n) => _chipTile(n)).toList(),
          ),
        ),
      );
    }

    // ── Nearby Suggestions ───────────────────────────
    if (!_detecting && !_showDropdown && _suggestions.isNotEmpty) {
      children.add(const SizedBox(height: 16));
      children.add(
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
          child: Row(children: [
            const Icon(Icons.near_me_rounded, color: _orange, size: 15),
            const SizedBox(width: 6),
            const Text('Suggestions Nearby', style: TextStyle(
                color: AppColors.textDark,
                fontWeight: FontWeight.w700, fontSize: 14)),
          ]),
        ),
      );
      children.add(
        SizedBox(
          height: 44,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            children: _suggestions.map((n) => _chipTile(n)).toList(),
          ),
        ),
      );
    }

    // ── Book Your Ride button ─────────────────────────
    children.add(const SizedBox(height: 24));
    children.add(
      Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
        child: SizedBox(
          width: double.infinity, height: 56,
          child: ElevatedButton.icon(
            onPressed: !_detecting && _dest != null
                ? () => setState(() => _step = 1)
                : null,
            icon: const Icon(Icons.local_taxi_rounded,
                color: Colors.white, size: 20),
            label: Text(
              _dest != null
                  ? 'Book Your Ride to ${_dest!.name}'
                  : 'Book Your Ride',
              style: const TextStyle(fontWeight: FontWeight.w800,
                  fontSize: 15, color: Colors.white)),
            style: ElevatedButton.styleFrom(
              backgroundColor: _orange,
              disabledBackgroundColor: AppColors.cardBorder,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16))),
          ),
        ),
      ),
    );

    return children;
  }

  Widget _originContent() {
    if (_detecting) {
      return Row(children: [
        ScaleTransition(
          scale: _pulseAnim,
          child: const SizedBox(width: 18, height: 18,
            child: CircularProgressIndicator(strokeWidth: 2, color: _orange))),
        const SizedBox(width: 10),
        const Text('Locating your neighbourhood…',
          style: TextStyle(color: AppColors.textGrey, fontSize: 14)),
      ]);
    }
    return Row(children: [
      const Icon(Icons.my_location_rounded, color: Color(0xFF1DB954), size: 15),
      const SizedBox(width: 8),
      Expanded(child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(_origin!.name,
            style: const TextStyle(color: AppColors.textDark,
                fontWeight: FontWeight.w800, fontSize: 17)),
          Text(_origin!.area,
            style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
        ])),
      GestureDetector(
        onTap: _pickOrigin,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
          decoration: BoxDecoration(
            color: _orange.withValues(alpha: 0.10),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: _orange.withValues(alpha: 0.3))),
          child: const Text('Change',
            style: TextStyle(color: _orange, fontSize: 11,
                fontWeight: FontWeight.w700)))),
    ]);
  }

  Widget _destContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        const Text('Destination',
          style: TextStyle(color: AppColors.textGrey,
              fontSize: 11, fontWeight: FontWeight.w500)),
        const SizedBox(height: 4),
        Row(crossAxisAlignment: CrossAxisAlignment.center, children: [
          Expanded(child: TextField(
            controller: _destCtrl,
            enabled: !_detecting,
            style: const TextStyle(color: AppColors.textDark,
                fontSize: 17, fontWeight: FontWeight.w700),
            decoration: InputDecoration(
              hintText: 'Where to?',
              hintStyle: const TextStyle(color: AppColors.textGrey, fontSize: 17),
              border: InputBorder.none,
              isDense: true,
              contentPadding: EdgeInsets.zero,
              suffixIcon: _destCtrl.text.isNotEmpty
                  ? GestureDetector(
                      onTap: () => setState(() {
                        _destCtrl.clear(); _dest = null; _showDropdown = false;
                      }),
                      child: const Icon(Icons.close_rounded,
                          color: AppColors.textGrey, size: 18))
                  : null),
            onChanged: (v) {
              final q = v.toLowerCase().trim();
              setState(() {
                _dest = null;
                if (q.isEmpty) {
                  _showDropdown = false; _filtered = [];
                } else {
                  _showDropdown = true;
                  _filtered = _hoods
                      .where((n) => n != _origin &&
                          n.name.toLowerCase().contains(q))
                      .toList();
                }
              });
            })),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: () => _pickLocationOnMap(isOrigin: false),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: _orange.withValues(alpha: 0.10),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: _orange.withValues(alpha: 0.3))),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                const Icon(Icons.map_rounded, color: _orange, size: 13),
                const SizedBox(width: 4),
                const Text('Map', style: TextStyle(
                    color: _orange, fontSize: 11, fontWeight: FontWeight.w700)),
              ]))),
        ]),
        if (_dest != null)
          Text(_dest!.area,
            style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
      ],
    );
  }

  Widget _inlineDropdown() {
    return Column(children: [
      const Divider(height: 1, color: AppColors.cardBorder),
      ConstrainedBox(
        constraints: const BoxConstraints(maxHeight: 200),
        child: _filtered.isEmpty
            ? const Padding(
                padding: EdgeInsets.all(16),
                child: Text('No neighbourhoods found',
                    style: TextStyle(color: AppColors.textGrey, fontSize: 13)))
            : ListView.builder(
                shrinkWrap: true,
                padding: EdgeInsets.zero,
                itemCount: _filtered.length,
                itemBuilder: (_, i) {
                  final n = _filtered[i];
                  return InkWell(
                    onTap: () {
                      FocusScope.of(context).unfocus();
                      setState(() {
                        _dest = n; _destCtrl.text = n.name;
                        _showDropdown = false;
                      });
                    },
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 12),
                      child: Row(children: [
                        Container(width: 34, height: 34,
                          decoration: BoxDecoration(
                            color: _orange.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(8)),
                          child: const Icon(Icons.location_on_rounded,
                              color: _orange, size: 18)),
                        const SizedBox(width: 12),
                        Expanded(child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(n.name,
                              style: const TextStyle(color: AppColors.textDark,
                                  fontWeight: FontWeight.w700, fontSize: 14)),
                            Text(n.area,
                              style: const TextStyle(
                                  color: AppColors.textGrey, fontSize: 11)),
                          ])),
                      ])));
                })),
    ]);
  }

  Widget _chipTile(_Hood n) {
    final sel = _dest?.name == n.name;
    return GestureDetector(
      onTap: () => setState(() {
        _dest = n; _destCtrl.text = n.name; _showDropdown = false;
      }),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        margin: const EdgeInsets.only(right: 10),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: sel ? _orange.withValues(alpha: 0.12) : AppColors.bgCard,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: sel ? _orange : AppColors.cardBorder,
              width: sel ? 1.5 : 1)),
        child: Row(children: [
          Icon(Icons.location_on_rounded,
              color: sel ? _orange : AppColors.textGrey, size: 13),
          const SizedBox(width: 5),
          Text(n.name, style: TextStyle(
              color: sel ? _orange : AppColors.textGrey,
              fontSize: 13, fontWeight: FontWeight.w600)),
        ])),
    );
  }

  // ═══════════════════════════════════════════════════
  // STEP 1 — MAP + CLASSES
  // ═══════════════════════════════════════════════════
  Widget _mapStep() {
    return Column(children: [
      // Route header
      Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
        color: AppColors.bgCard,
        child: Row(children: [
          _pill(_origin!.name, const Color(0xFF1DB954)),
          Expanded(child: Row(children: [
            Expanded(child: Container(height: 1.5,
                color: _orange.withValues(alpha: 0.35))),
            const Padding(padding: EdgeInsets.symmetric(horizontal: 8),
              child: Icon(Icons.local_taxi_rounded, color: _orange, size: 20)),
            Expanded(child: Container(height: 1.5,
                color: _orange.withValues(alpha: 0.35))),
          ])),
          _pill(_dest!.name, _orange),
        ])),
      // Map
      SizedBox(
        height: 210,
        child: Stack(children: [
          Container(
            color: const Color(0xFF0D1B2A),
            child: CustomPaint(
                size: const Size(double.infinity, double.infinity),
                painter: _GridPainter())),
          CustomPaint(
              size: const Size(double.infinity, double.infinity),
              painter: _RoutePainter(_origin!, _dest!)),
          _mapPin(_origin!, const Color(0xFF1DB954)),
          _mapPin(_dest!, _orange),
          Positioned(top: 10, left: 12,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.6),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: _orange.withValues(alpha: 0.3))),
              child: Row(children: [
                const Icon(Icons.straighten_rounded,
                    color: _orange, size: 12),
                const SizedBox(width: 4),
                Text('~${_distKm.toStringAsFixed(1)} km',
                    style: const TextStyle(color: Colors.white,
                        fontSize: 11, fontWeight: FontWeight.w600)),
              ]))),
        ])),
      // Class section header
      Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
        child: Row(children: [
          const Text('Choose your ride class',
            style: TextStyle(color: AppColors.textDark,
                fontWeight: FontWeight.w800, fontSize: 15)),
          const Spacer(),
          Text('${_distKm.toStringAsFixed(1)} km',
            style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
        ])),
      // Horizontal class cards
      SizedBox(
        height: 178,
        child: ListView.builder(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 4),
          itemCount: _classes.length,
          itemBuilder: (_, i) => _classCard(_classes[i]))),
      // Book Now
      AnimatedSwitcher(
        duration: const Duration(milliseconds: 250),
        child: _chosenClass != null
            ? Padding(
                key: const ValueKey('btn'),
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                child: SizedBox(
                  width: double.infinity, height: 54,
                  child: ElevatedButton.icon(
                    onPressed: _confirmRide,
                    icon: const Icon(Icons.check_circle_rounded,
                        color: Colors.white, size: 20),
                    label: Text(
                      'Book Now  ·  XAF ${_priceFor(_chosenClass!).toStringAsFixed(0)}'
                      '  ·  ~${_etaFor(_chosenClass!)} min',
                      style: const TextStyle(fontWeight: FontWeight.w800,
                          fontSize: 13, color: Colors.white)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _orange,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16))))))
            : const Padding(
                key: ValueKey('hint'),
                padding: EdgeInsets.fromLTRB(16, 12, 16, 16),
                child: Center(child: Text('Select a class above to continue',
                    style: TextStyle(
                        color: AppColors.textGrey, fontSize: 13))))),
    ]);
  }

  Widget _mapPin(_Hood n, Color color) {
    final lats = [_origin!.lat, _dest!.lat];
    final lngs = [_origin!.lng, _dest!.lng];
    final minLat = lats.reduce((a, b) => a < b ? a : b);
    final maxLat = lats.reduce((a, b) => a > b ? a : b);
    final minLng = lngs.reduce((a, b) => a < b ? a : b);
    final maxLng = lngs.reduce((a, b) => a > b ? a : b);
    final latR = (maxLat - minLat).clamp(0.001, 100.0);
    final lngR = (maxLng - minLng).clamp(0.001, 100.0);
    final fx = ((n.lng - minLng) / lngR * 0.72 + 0.14).clamp(0.0, 1.0);
    final fy = ((1 - (n.lat - minLat) / latR) * 0.72 + 0.10).clamp(0.0, 1.0);
    return Positioned.fill(child: Align(
      alignment: Alignment(fx * 2 - 1, fy * 2 - 1),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Container(width: 20, height: 20,
          decoration: BoxDecoration(
            color: color, shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 2.5),
            boxShadow: [BoxShadow(color: color.withValues(alpha: 0.5),
                blurRadius: 8, spreadRadius: 1)])),
        const SizedBox(height: 3),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
          decoration: BoxDecoration(
            color: Colors.black.withValues(alpha: 0.8),
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: color.withValues(alpha: 0.4))),
          child: Text(n.name.length > 12 ? n.name.substring(0, 12) : n.name,
            style: const TextStyle(color: Colors.white,
                fontSize: 9, fontWeight: FontWeight.w700))),
      ])));
  }

  Widget _classCard(_RideClass c) {
    final sel = _chosenClass?.name == c.name;
    return GestureDetector(
      onTap: () => setState(() => _chosenClass = c),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 168,
        margin: const EdgeInsets.only(right: 12, top: 4, bottom: 4),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: sel ? c.color.withValues(alpha: 0.10) : AppColors.bgCard,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
              color: sel ? c.color : AppColors.cardBorder,
              width: sel ? 2 : 1),
          boxShadow: sel
              ? [BoxShadow(color: c.color.withValues(alpha: 0.18),
                  blurRadius: 12)]
              : []),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Container(width: 42, height: 42,
              decoration: BoxDecoration(
                color: c.color.withValues(alpha: 0.14),
                borderRadius: BorderRadius.circular(12)),
              child: Icon(c.icon, color: c.color, size: 22)),
            const Spacer(),
            if (sel) Icon(Icons.check_circle_rounded, color: c.color, size: 18),
          ]),
          const SizedBox(height: 8),
          Text(c.name,
            style: const TextStyle(color: AppColors.textDark,
                fontWeight: FontWeight.w800, fontSize: 13)),
          const SizedBox(height: 2),
          Text(c.carType,
            style: const TextStyle(color: AppColors.textGrey, fontSize: 10),
            maxLines: 1, overflow: TextOverflow.ellipsis),
          const Spacer(),
          Text('XAF ${_priceFor(c).toStringAsFixed(0)}',
            style: TextStyle(color: c.color,
                fontWeight: FontWeight.w900, fontSize: 14)),
          const SizedBox(height: 3),
          Row(children: [
            const Icon(Icons.access_time_rounded,
                color: AppColors.textGrey, size: 11),
            const SizedBox(width: 3),
            Text('~${_etaFor(c)} min',
              style: const TextStyle(
                  color: AppColors.textGrey, fontSize: 10)),
          ]),
        ])));
  }

  Widget _pill(String label, Color c) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: c.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: c.withValues(alpha: 0.4))),
      child: Text(label,
          style: TextStyle(color: c, fontWeight: FontWeight.w800, fontSize: 12)));
  }

  // ── Confirm ride ──────────────────────────────────
  void _confirmRide() {
    final price = _priceFor(_chosenClass!);
    if (walletBalance < price) {
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          backgroundColor: AppColors.bgCard,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Insufficient Balance',
              style: TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w800)),
          content: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.account_balance_wallet_rounded,
                color: Color(0xFFFF9800), size: 48),
            const SizedBox(height: 12),
            Text(
              'Your wallet balance (XAF ${walletBalance.toStringAsFixed(0)}) is less '
              'than the ride fare (XAF ${price.toStringAsFixed(0)}).',
              style: const TextStyle(color: AppColors.textGrey, fontSize: 13),
              textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text('You need XAF ${(price - walletBalance).toStringAsFixed(0)} more.',
              style: const TextStyle(color: Colors.red, fontSize: 13,
                  fontWeight: FontWeight.w700),
              textAlign: TextAlign.center),
          ]),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel',
                  style: TextStyle(color: AppColors.textGrey))),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const WalletScreen()));
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFFF9800),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10))),
              child: const Text('Top Up Wallet',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700))),
          ]));
      return;
    }
    final ref = 'TRV-RDE-'
        '${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
    final now = DateTime.now();
    const mo = ['Jan','Feb','Mar','Apr','May','Jun',
                 'Jul','Aug','Sep','Oct','Nov','Dec'];
    final dateStr = '${mo[now.month - 1]} ${now.day}, ${now.year}';
    final eta = _etaFor(_chosenClass!);
    final driverIdx = DateTime.now().millisecondsSinceEpoch % _drivers.length;
    final driver = _drivers[driverIdx];
    final booking = BusBooking(
      id: ref,
      from: _origin!.name, to: _dest!.name, date: dateStr,
      company: 'Traveo Ride',
      departure: '${now.hour.toString().padLeft(2, '0')}'
                 ':${now.minute.toString().padLeft(2, '0')}',
      arrival: 'On arrival',
      category: _chosenClass!.name, carType: _chosenClass!.carType,
      reference: ref, price: _priceFor(_chosenClass!), etaMinutes: eta,
      driverName: driver['name']!, driverPhone: driver['phone']!, driverPlate: driver['plate']!,
    );
    globalBusBookings.insert(0, booking);
    globalServiceBookings.insert(0, ServiceBooking(
      id: ref,
      type: 'Ride - ${_chosenClass!.name}',
      name: '${_origin!.name} → ${_dest!.name}',
      description: _chosenClass!.carType,
      destination: _dest!.name,
      date: dateStr,
      price: _priceFor(_chosenClass!),
      icon: Icons.local_taxi_rounded,
      color: _chosenClass!.color,
    ));
    bookingsRefreshNotifier.value++;
    setState(() { _done = booking; _step = 2; });
  }

  // ═══════════════════════════════════════════════════
  // STEP 2 — CONFIRMED
  // ═══════════════════════════════════════════════════
  bool _qrVisible = false;
  bool _arrived = false;

  Widget _confirmedStep() {
    final b = _done!;
    final cat = _chosenClass!;
    final screenH = MediaQuery.of(context).size.height;
    return Stack(clipBehavior: Clip.hardEdge, children: [
      SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
        child: Column(children: [
          // ── Success badge ──────────────────────────
          Container(width: 80, height: 80,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFF1DB954).withValues(alpha: 0.12),
              border: Border.all(color: const Color(0xFF1DB954), width: 3)),
            child: const Icon(Icons.check_rounded,
                color: Color(0xFF1DB954), size: 44)),
          const SizedBox(height: 12),
          const Text('Ride Booked!',
            style: TextStyle(color: AppColors.textDark,
                fontWeight: FontWeight.w900, fontSize: 22)),
          const SizedBox(height: 4),
          Text('Driver arriving in ~${b.etaMinutes} min',
            style: const TextStyle(color: AppColors.textGrey, fontSize: 13)),
          const SizedBox(height: 20),

          // ── Driver + Class card ────────────────────
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.bgCard,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.cardBorder)),
            child: Column(children: [
              // Driver row
              Row(children: [
                Container(width: 52, height: 52,
                  decoration: BoxDecoration(
                    color: const Color(0xFF1DB954).withValues(alpha: 0.12),
                    shape: BoxShape.circle,
                    border: Border.all(color: const Color(0xFF1DB954), width: 2)),
                  child: const Icon(Icons.person_rounded,
                      color: Color(0xFF1DB954), size: 28)),
                const SizedBox(width: 12),
                Expanded(child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Your Driver',
                    style: TextStyle(color: AppColors.textGrey,
                        fontSize: 10, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  Text(b.driverName,
                    style: const TextStyle(color: AppColors.textDark,
                        fontWeight: FontWeight.w800, fontSize: 14)),
                  const SizedBox(height: 2),
                  Row(children: [
                    const Icon(Icons.directions_car_rounded,
                        color: AppColors.textGrey, size: 12),
                    const SizedBox(width: 4),
                    Text(b.driverPlate,
                      style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
                  ]),
                ])),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1DB954).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                        color: const Color(0xFF1DB954).withValues(alpha: 0.4))),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    const Icon(Icons.phone_rounded,
                        color: Color(0xFF1DB954), size: 14),
                    const SizedBox(width: 4),
                    Text(b.driverPhone,
                      style: const TextStyle(color: Color(0xFF1DB954),
                          fontSize: 11, fontWeight: FontWeight.w700)),
                  ])),
              ]),
              const Divider(color: AppColors.cardBorder, height: 20),
              // Class row
              Row(children: [
                Container(width: 40, height: 40,
                  decoration: BoxDecoration(
                    color: cat.color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10)),
                  child: Icon(cat.icon, color: cat.color, size: 20)),
                const SizedBox(width: 12),
                Expanded(child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Class Selected',
                    style: TextStyle(color: AppColors.textGrey,
                        fontSize: 10, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  Text(cat.name,
                    style: TextStyle(color: cat.color,
                        fontWeight: FontWeight.w800, fontSize: 14)),
                  Text(cat.carType,
                    style: const TextStyle(color: AppColors.textGrey, fontSize: 11),
                    overflow: TextOverflow.ellipsis),
                ])),
                Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                  Text('XAF ${b.price.toStringAsFixed(0)}',
                    style: TextStyle(color: cat.color,
                        fontWeight: FontWeight.w900, fontSize: 16)),
                  const Text('Est. fare',
                    style: TextStyle(color: AppColors.textGrey, fontSize: 10)),
                ]),
              ]),
            ])),
          const SizedBox(height: 14),

          // ── Live tracking mini-map ─────────────────
          Container(
            width: double.infinity,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: _orange.withValues(alpha: 0.35)),
              boxShadow: [BoxShadow(
                color: _orange.withValues(alpha: 0.08),
                blurRadius: 12)]),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Column(children: [
                // Map header
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  color: AppColors.bgCard,
                  child: Row(children: [
                    const Icon(Icons.map_rounded, color: _orange, size: 16),
                    const SizedBox(width: 8),
                    const Text('Live Tracking',
                      style: TextStyle(color: AppColors.textDark,
                          fontWeight: FontWeight.w700, fontSize: 13)),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1DB954).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(20)),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        Container(width: 6, height: 6,
                          decoration: const BoxDecoration(
                            color: Color(0xFF1DB954),
                            shape: BoxShape.circle)),
                        const SizedBox(width: 4),
                        const Text('LIVE',
                          style: TextStyle(color: Color(0xFF1DB954),
                              fontSize: 10, fontWeight: FontWeight.w700)),
                      ])),
                  ])),
                // Map canvas
                SizedBox(
                  height: 200,
                  child: Stack(children: [
                    Container(
                      color: const Color(0xFF0D1B2A),
                      child: CustomPaint(
                        size: const Size(double.infinity, double.infinity),
                        painter: _GridPainter())),
                    CustomPaint(
                      size: const Size(double.infinity, double.infinity),
                      painter: _TrackingRoutePainter(_origin!, _dest!)),
                    _mapPin(_origin!, const Color(0xFF1DB954)),
                    _mapPin(_dest!, _orange),
                    // Driver car icon between origin and dest
                    _driverMarker(_origin!, _dest!),
                    // Distance badge
                    Positioned(top: 8, left: 10,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.7),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                              color: _orange.withValues(alpha: 0.4))),
                        child: Row(children: [
                          const Icon(Icons.straighten_rounded,
                              color: _orange, size: 11),
                          const SizedBox(width: 4),
                          Text('~${_distKm.toStringAsFixed(1)} km  ·  ${b.etaMinutes} min',
                            style: const TextStyle(color: Colors.white,
                                fontSize: 10, fontWeight: FontWeight.w600)),
                        ]))),
                  ])),
                // Route legend
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 10),
                  color: AppColors.bgCard,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                    _legendDot(const Color(0xFF1DB954), b.from, 'Pickup'),
                    Row(children: [
                      Container(width: 30, height: 1.5,
                          color: _orange.withValues(alpha: 0.5)),
                      const Icon(Icons.local_taxi_rounded,
                          color: _orange, size: 14),
                      Container(width: 30, height: 1.5,
                          color: _orange.withValues(alpha: 0.5)),
                    ]),
                    _legendDot(_orange, b.to, 'Destination'),
                  ])),
              ])),
          ),
          const SizedBox(height: 14),

          // ── Booking ref card ───────────────────────
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.bgCard,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: _orange.withValues(alpha: 0.2))),
            child: Column(children: [
              _infoRow('Reference', b.reference),
              _infoRow('Date', b.date),
              _infoRow('Car Type', b.carType),
              const Divider(color: AppColors.cardBorder, height: 16),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: _orange.withValues(alpha: 0.07),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: _orange.withValues(alpha: 0.25))),
                child: const Row(children: [
                  Icon(Icons.qr_code_scanner_rounded, color: _orange, size: 15),
                  SizedBox(width: 8),
                  Expanded(child: Text(
                    'A QR code will appear when you arrive. Driver scans it to collect fare.',
                    style: TextStyle(color: _orange, fontSize: 11))),
                ])),
            ])),
          const SizedBox(height: 14),

          // ── Simulate arrival (for demo) ────────────
          if (!_arrived)
            SizedBox(width: double.infinity, height: 48,
              child: OutlinedButton.icon(
                onPressed: () => setState(() { _arrived = true; _qrVisible = true; }),
                icon: const Icon(Icons.location_on_rounded,
                    color: _orange, size: 18),
                label: const Text('Simulate Arrival',
                  style: TextStyle(color: _orange,
                      fontWeight: FontWeight.w700, fontSize: 14)),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: _orange),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12))))),

          const SizedBox(height: 8),
          SizedBox(width: double.infinity, height: 50,
            child: ElevatedButton.icon(
              onPressed: () => Navigator.pop(context),
              icon: const Icon(Icons.book_online_rounded, color: Colors.white),
              label: const Text('View My Bookings',
                style: TextStyle(fontWeight: FontWeight.w800,
                    fontSize: 15, color: Colors.white)),
              style: ElevatedButton.styleFrom(
                backgroundColor: _orange,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14))))),
          const SizedBox(height: 6),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Back to Home',
              style: TextStyle(color: AppColors.textGrey, fontSize: 13))),
        ]),
      ),

      // ── QR code bottom sheet (slides up on arrival) ──
      AnimatedPositioned(
        duration: const Duration(milliseconds: 450),
        curve: Curves.easeOutCubic,
        bottom: _qrVisible ? 0 : -screenH,
        left: 0, right: 0,
        child: _qrPaymentSheet(_done!, _chosenClass!),
      ),
    ]);
  }

  Widget _legendDot(Color color, String name, String label) {
    return Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
      Row(children: [
        Container(width: 8, height: 8,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text(name,
          style: TextStyle(color: color,
              fontWeight: FontWeight.w700, fontSize: 11)),
      ]),
      Text(label,
        style: const TextStyle(color: AppColors.textGrey, fontSize: 9)),
    ]);
  }

  Widget _driverMarker(_Hood from, _Hood to) {
    final lats = [from.lat, to.lat];
    final lngs = [from.lng, to.lng];
    final minLat = lats.reduce((a, b) => a < b ? a : b);
    final maxLat = lats.reduce((a, b) => a > b ? a : b);
    final minLng = lngs.reduce((a, b) => a < b ? a : b);
    final maxLng = lngs.reduce((a, b) => a > b ? a : b);
    final latR = (maxLat - minLat).clamp(0.001, 100.0);
    final lngR = (maxLng - minLng).clamp(0.001, 100.0);
    // Position driver about 30% along the route
    final midLat = from.lat + (to.lat - from.lat) * 0.3;
    final midLng = from.lng + (to.lng - from.lng) * 0.3;
    final fx = ((midLng - minLng) / lngR * 0.72 + 0.14).clamp(0.0, 1.0);
    final fy = ((1 - (midLat - minLat) / latR) * 0.72 + 0.10).clamp(0.0, 1.0);
    return Positioned.fill(child: Align(
      alignment: Alignment(fx * 2 - 1, fy * 2 - 1),
      child: Container(
        width: 30, height: 30,
        decoration: BoxDecoration(
          color: _orange,
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 2),
          boxShadow: [BoxShadow(
              color: _orange.withValues(alpha: 0.5),
              blurRadius: 10, spreadRadius: 2)]),
        child: const Icon(Icons.local_taxi_rounded,
            color: Colors.white, size: 16))));
  }

  Widget _qrPaymentSheet(BusBooking b, _RideClass cat) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        boxShadow: [BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
            blurRadius: 30, offset: const Offset(0, -8))]),
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 36),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        // Handle
        Container(width: 40, height: 4,
          decoration: BoxDecoration(
              color: AppColors.cardBorder,
              borderRadius: BorderRadius.circular(2))),
        const SizedBox(height: 16),
        // Arrived banner
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: const Color(0xFF1DB954).withValues(alpha: 0.10),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
                color: const Color(0xFF1DB954).withValues(alpha: 0.4))),
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.location_on_rounded,
                  color: Color(0xFF1DB954), size: 18),
              SizedBox(width: 6),
              Text('You have arrived!',
                style: TextStyle(color: Color(0xFF1DB954),
                    fontWeight: FontWeight.w800, fontSize: 14)),
          ])),
        const SizedBox(height: 16),
        const Text('Scan to Pay',
          style: TextStyle(color: AppColors.textDark,
              fontWeight: FontWeight.w900, fontSize: 20)),
        const SizedBox(height: 4),
        Text('Show this QR to ${b.driverName.split(' ').first}',
          style: const TextStyle(color: AppColors.textGrey, fontSize: 13)),
        const SizedBox(height: 18),
        // QR code (custom painted)
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [BoxShadow(
                color: _orange.withValues(alpha: 0.2),
                blurRadius: 20, spreadRadius: 2)]),
          child: SizedBox(
            width: 180, height: 180,
            child: CustomPaint(
              painter: _QrPainter(b.reference)))),
        const SizedBox(height: 14),
        Text(b.reference,
          style: const TextStyle(color: AppColors.textGrey,
              fontSize: 12, fontWeight: FontWeight.w600,
              letterSpacing: 1.2)),
        const SizedBox(height: 16),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: _orange.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _orange.withValues(alpha: 0.3))),
          child: Column(children: [
            Text('XAF ${b.price.toStringAsFixed(0)}',
              style: const TextStyle(color: _orange,
                  fontWeight: FontWeight.w900, fontSize: 26)),
            const SizedBox(height: 2),
            Text('will be deducted from your Traveo Wallet',
              style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
          ])),
        const SizedBox(height: 16),
        SizedBox(width: double.infinity, height: 52,
          child: ElevatedButton.icon(
            onPressed: () {
              // Deduct from wallet
              walletBalance -= b.price;
              walletTransactions.insert(0, {
                'type': 'debit',
                'label': 'Ride: ${b.from} → ${b.to}',
                'amount': -b.price,
                'date': b.date,
                'icon': 'send',
              });
              // Remove ride from bookings
              globalBusBookings.removeWhere((r) => r.id == b.id);
              globalServiceBookings.removeWhere((r) => r.id == b.id);
              bookingsRefreshNotifier.value++;
              setState(() => _qrVisible = false);
              // Show success snackbar
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Row(children: [
                    const Icon(Icons.check_circle_rounded,
                        color: Colors.white, size: 18),
                    const SizedBox(width: 8),
                    Text('XAF ${b.price.toStringAsFixed(0)} deducted — Enjoy your trip!'),
                  ]),
                  backgroundColor: const Color(0xFF1DB954),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10)),
                  behavior: SnackBarBehavior.floating));
            },
            icon: const Icon(Icons.qr_code_scanner_rounded,
                color: Colors.white, size: 20),
            label: const Text('Confirm Payment',
              style: TextStyle(fontWeight: FontWeight.w800,
                  fontSize: 15, color: Colors.white)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1DB954),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14))))),
        const SizedBox(height: 8),
        TextButton(
          onPressed: () => setState(() => _qrVisible = false),
          child: const Text('Close',
            style: TextStyle(color: AppColors.textGrey, fontSize: 13))),
      ]),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(children: [
        Text(label,
          style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
        const Spacer(),
        Text(value,
          style: const TextStyle(color: AppColors.textDark,
              fontSize: 12, fontWeight: FontWeight.w600)),
      ]));
  }

  void _pickOrigin() => _pickLocationOnMap(isOrigin: true);

  void _pickLocationOnMap({required bool isOrigin}) {
    _Hood? tempPick;
    final searchCtrl = TextEditingController();
    List<_Hood> filtered = List.from(_hoods);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => StatefulBuilder(
        builder: (ctx, setBS) => SizedBox(
          height: MediaQuery.of(context).size.height * 0.88,
          child: Column(children: [
            // Handle
            const SizedBox(height: 12),
            Container(width: 40, height: 4,
              decoration: BoxDecoration(color: AppColors.cardBorder,
                  borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 14),
            // Title
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(children: [
                Icon(isOrigin ? Icons.my_location_rounded : Icons.location_on_rounded,
                    color: isOrigin ? const Color(0xFF1DB954) : _orange, size: 20),
                const SizedBox(width: 10),
                Text(isOrigin ? 'Select your location' : 'Select destination',
                  style: const TextStyle(color: AppColors.textDark,
                      fontWeight: FontWeight.w800, fontSize: 17)),
              ])),
            const SizedBox(height: 12),
            // Search input
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.bgDark,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder)),
                child: TextField(
                  controller: searchCtrl,
                  style: const TextStyle(color: AppColors.textDark, fontSize: 14),
                  decoration: InputDecoration(
                    hintText: 'Search neighbourhood…',
                    hintStyle: const TextStyle(color: AppColors.textGrey, fontSize: 14),
                    prefixIcon: const Icon(Icons.search_rounded,
                        color: AppColors.textGrey, size: 20),
                    suffixIcon: searchCtrl.text.isNotEmpty
                        ? GestureDetector(
                            onTap: () {
                              searchCtrl.clear();
                              setBS(() { filtered = List.from(_hoods); });
                            },
                            child: const Icon(Icons.close_rounded,
                                color: AppColors.textGrey, size: 18))
                        : null,
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 12)),
                  onChanged: (v) {
                    final q = v.toLowerCase().trim();
                    setBS(() {
                      filtered = q.isEmpty
                          ? List.from(_hoods)
                          : _hoods.where((n) =>
                              n.name.toLowerCase().contains(q) ||
                              n.area.toLowerCase().contains(q)).toList();
                    });
                  }))),
            const SizedBox(height: 8),
            // Simulated map canvas with selectable pins
            Container(
              height: 220,
              margin: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: const Color(0xFF0D1B2A),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.cardBorder)),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Stack(children: [
                  // Grid background
                  CustomPaint(
                    size: const Size(double.infinity, double.infinity),
                    painter: _GridPainter()),
                  // Tappable neighbourhood pins
                  ...filtered.map((n) {
                    // Normalise lat/lng to canvas position
                    final lats = _hoods.map((h) => h.lat).toList();
                    final lngs = _hoods.map((h) => h.lng).toList();
                    final minLat = lats.reduce((a, b) => a < b ? a : b);
                    final maxLat = lats.reduce((a, b) => a > b ? a : b);
                    final minLng = lngs.reduce((a, b) => a < b ? a : b);
                    final maxLng = lngs.reduce((a, b) => a > b ? a : b);
                    final latR = (maxLat - minLat).clamp(0.001, 100.0);
                    final lngR = (maxLng - minLng).clamp(0.001, 100.0);
                    final fx = ((n.lng - minLng) / lngR * 0.72 + 0.14).clamp(0.0, 1.0);
                    final fy = (1.0 - (n.lat - minLat) / latR * 0.72 - 0.14).clamp(0.0, 1.0);
                    final isSelected = tempPick == n;
                    final pinColor = isSelected
                        ? (isOrigin ? const Color(0xFF1DB954) : _orange)
                        : AppColors.textGrey;
                    return Positioned(
                      left: fx * 10000,  // will be layout-constrained via FractionallySizedBox trick below
                      top:  fy * 10000,
                      child: const SizedBox.shrink());
                  }),
                  // Better approach: LayoutBuilder for pin placement
                  LayoutBuilder(builder: (_, constraints) {
                    return Stack(children: [
                      ...filtered.map((n) {
                        final lats = _hoods.map((h) => h.lat).toList();
                        final lngs = _hoods.map((h) => h.lng).toList();
                        final minLat = lats.reduce((a, b) => a < b ? a : b);
                        final maxLat = lats.reduce((a, b) => a > b ? a : b);
                        final minLng = lngs.reduce((a, b) => a < b ? a : b);
                        final maxLng = lngs.reduce((a, b) => a > b ? a : b);
                        final latR = (maxLat - minLat).clamp(0.001, 100.0);
                        final lngR = (maxLng - minLng).clamp(0.001, 100.0);
                        final fx = ((n.lng - minLng) / lngR * 0.72 + 0.14).clamp(0.0, 1.0);
                        final fy = (1.0 - (n.lat - minLat) / latR * 0.72 - 0.14).clamp(0.0, 1.0);
                        final isSelected = tempPick == n;
                        final pinColor = isSelected
                            ? (isOrigin ? const Color(0xFF1DB954) : _orange)
                            : Colors.white.withValues(alpha: 0.6);
                        return Positioned(
                          left: (fx * constraints.maxWidth - 14).clamp(0, constraints.maxWidth - 28),
                          top:  (fy * constraints.maxHeight - 20).clamp(0, constraints.maxHeight - 30),
                          child: GestureDetector(
                            onTap: () {
                              setBS(() { tempPick = n; });
                            },
                            child: Column(mainAxisSize: MainAxisSize.min, children: [
                              Container(
                                padding: isSelected
                                    ? const EdgeInsets.symmetric(horizontal: 6, vertical: 2)
                                    : EdgeInsets.zero,
                                decoration: isSelected ? BoxDecoration(
                                  color: pinColor,
                                  borderRadius: BorderRadius.circular(6)) : null,
                                child: isSelected
                                    ? Text(n.name, style: const TextStyle(
                                        color: Colors.white, fontSize: 9,
                                        fontWeight: FontWeight.w800))
                                    : const SizedBox.shrink()),
                              Icon(Icons.location_on_rounded, color: pinColor,
                                  size: isSelected ? 22 : 14),
                            ])));
                      }),
                      // Map label
                      Positioned(top: 8, right: 10,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.55),
                            borderRadius: BorderRadius.circular(8)),
                          child: Row(mainAxisSize: MainAxisSize.min, children: [
                            const Icon(Icons.touch_app_rounded,
                                color: Colors.white70, size: 12),
                            const SizedBox(width: 4),
                            const Text('Tap a pin to select',
                              style: TextStyle(color: Colors.white70, fontSize: 10)),
                          ]))),
                    ]);
                  }),
                ])),
            ),
            const SizedBox(height: 8),
            // List of neighbourhoods
            Expanded(child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: filtered.length,
              itemBuilder: (_, i) {
                final n = filtered[i];
                final isSelected = tempPick == n;
                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 4),
                  leading: Icon(Icons.location_on_rounded,
                      color: isSelected
                          ? (isOrigin ? const Color(0xFF1DB954) : _orange)
                          : AppColors.textGrey,
                      size: 20),
                  title: Text(n.name,
                    style: TextStyle(
                      color: isSelected ? AppColors.textDark : AppColors.textDark,
                      fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                      fontSize: 15)),
                  subtitle: Text(n.area,
                    style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
                  trailing: isSelected
                      ? Icon(Icons.check_circle_rounded,
                          color: isOrigin ? const Color(0xFF1DB954) : _orange,
                          size: 20)
                      : null,
                  onTap: () => setBS(() { tempPick = n; }),
                );
              })),
            // Confirm button
            Padding(
              padding: EdgeInsets.fromLTRB(16, 8, 16,
                  MediaQuery.of(context).viewInsets.bottom + 16),
              child: SizedBox(
                width: double.infinity, height: 50,
                child: ElevatedButton(
                  onPressed: tempPick == null ? null : () {
                    Navigator.pop(context);
                    setState(() {
                      if (isOrigin) {
                        _origin = tempPick;
                        _dest = null;
                        _destCtrl.clear();
                        _showDropdown = false;
                      } else {
                        if (tempPick != _origin) {
                          _dest = tempPick;
                          _destCtrl.text = tempPick!.name;
                          _showDropdown = false;
                          _filtered = [];
                        }
                      }
                    });
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isOrigin
                        ? const Color(0xFF1DB954) : _orange,
                    disabledBackgroundColor: AppColors.cardBorder,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14))),
                  child: Text(
                    tempPick == null
                        ? 'Select a location'
                        : 'Confirm: ${tempPick!.name}',
                    style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 15, color: Colors.white))))),
          ]))));
  }
} // end _State

// ─────────────────────────────────────────────────────────────────────────────
// Painters
// ─────────────────────────────────────────────────────────────────────────────
class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final g = Paint()
      ..color = const Color(0xFF1A2A3A)
      ..strokeWidth = 0.8;
    for (var y = 0.0; y < size.height; y += 24) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), g);
    }
    for (var x = 0.0; x < size.width; x += 24) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), g);
    }
    final road = Paint()
      ..color = const Color(0xFF1E3A4A)
      ..strokeWidth = 5
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(Offset(size.width * 0.05, size.height * 0.65),
        Offset(size.width * 0.95, size.height * 0.25), road);
    canvas.drawLine(Offset(size.width * 0.1, size.height * 0.1),
        Offset(size.width * 0.2, size.height * 0.9), road);
    canvas.drawLine(Offset(size.width * 0.5, 0),
        Offset(size.width * 0.6, size.height), road);
  }
  @override bool shouldRepaint(_) => false;
}

class _RoutePainter extends CustomPainter {
  final _Hood from, to;
  const _RoutePainter(this.from, this.to);
  @override
  void paint(Canvas canvas, Size size) {
    final lats = [from.lat, to.lat];
    final lngs = [from.lng, to.lng];
    final minLat = lats.reduce((a, b) => a < b ? a : b);
    final maxLat = lats.reduce((a, b) => a > b ? a : b);
    final minLng = lngs.reduce((a, b) => a < b ? a : b);
    final maxLng = lngs.reduce((a, b) => a > b ? a : b);
    final latR = (maxLat - minLat).clamp(0.001, 100.0);
    final lngR = (maxLng - minLng).clamp(0.001, 100.0);
    Offset p(_Hood n) => Offset(
      ((n.lng - minLng) / lngR * 0.72 + 0.14) * size.width,
      ((1.0 - (n.lat - minLat) / latR) * 0.72 + 0.10) * size.height);
    final path = Path()..moveTo(p(from).dx, p(from).dy);
    path.quadraticBezierTo(
      (p(from).dx + p(to).dx) / 2, p(from).dy - 30,
      p(to).dx, p(to).dy);
    canvas.drawPath(path, Paint()
      ..color = const Color(0xFFFF9800).withValues(alpha: 0.2)
      ..strokeWidth = 14
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke);
    final line = Paint()
      ..color = const Color(0xFFFF9800)
      ..strokeWidth = 3.5
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;
    for (final m in path.computeMetrics()) {
      var d = 0.0;
      while (d < m.length) {
        canvas.drawPath(m.extractPath(d, d + 14), line);
        d += 22;
      }
    }
  }
  @override bool shouldRepaint(_) => false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tracking route painter — shows completed (green) vs remaining (dashed orange)
// ─────────────────────────────────────────────────────────────────────────────
class _TrackingRoutePainter extends CustomPainter {
  final _Hood from, to;
  const _TrackingRoutePainter(this.from, this.to);
  @override
  void paint(Canvas canvas, Size size) {
    final lats = [from.lat, to.lat];
    final lngs = [from.lng, to.lng];
    final minLat = lats.reduce((a, b) => a < b ? a : b);
    final maxLat = lats.reduce((a, b) => a > b ? a : b);
    final minLng = lngs.reduce((a, b) => a < b ? a : b);
    final maxLng = lngs.reduce((a, b) => a > b ? a : b);
    final latR = (maxLat - minLat).clamp(0.001, 100.0);
    final lngR = (maxLng - minLng).clamp(0.001, 100.0);
    Offset p(_Hood n) => Offset(
      ((n.lng - minLng) / lngR * 0.72 + 0.14) * size.width,
      ((1.0 - (n.lat - minLat) / latR) * 0.72 + 0.10) * size.height);

    final driverLat = from.lat + (to.lat - from.lat) * 0.3;
    final driverLng = from.lng + (to.lng - from.lng) * 0.3;
    Offset pd() => Offset(
      ((driverLng - minLng) / lngR * 0.72 + 0.14) * size.width,
      ((1.0 - (driverLat - minLat) / latR) * 0.72 + 0.10) * size.height);

    // Full route glow
    final pathFull = Path()..moveTo(p(from).dx, p(from).dy);
    pathFull.quadraticBezierTo(
      (p(from).dx + p(to).dx) / 2, p(from).dy - 30,
      p(to).dx, p(to).dy);
    canvas.drawPath(pathFull, Paint()
      ..color = const Color(0xFFFF9800).withValues(alpha: 0.12)
      ..strokeWidth = 14
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke);

    // Remaining route (dashed orange)
    final pathRemain = Path()..moveTo(pd().dx, pd().dy);
    pathRemain.quadraticBezierTo(
      (pd().dx + p(to).dx) / 2, pd().dy - 20,
      p(to).dx, p(to).dy);
    final dashed = Paint()
      ..color = const Color(0xFFFF9800)
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;
    for (final m in pathRemain.computeMetrics()) {
      var d = 0.0;
      while (d < m.length) {
        canvas.drawPath(m.extractPath(d, d + 12), dashed);
        d += 20;
      }
    }

    // Completed segment (solid green)
    final pathDone = Path()..moveTo(p(from).dx, p(from).dy);
    pathDone.lineTo(pd().dx, pd().dy);
    canvas.drawPath(pathDone, Paint()
      ..color = const Color(0xFF1DB954)
      ..strokeWidth = 3.5
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke);
  }
  @override bool shouldRepaint(_) => false;
}

// ─────────────────────────────────────────────────────────────────────────────
// QR code painter — deterministic pattern from booking reference
// ─────────────────────────────────────────────────────────────────────────────
class _QrPainter extends CustomPainter {
  final String data;
  const _QrPainter(this.data);

  @override
  void paint(Canvas canvas, Size size) {
    final cellSize = size.width / 21;
    final paint = Paint()..color = const Color(0xFF111111);
    canvas.drawRect(
        Rect.fromLTWH(0, 0, size.width, size.height),
        Paint()..color = Colors.white);

    final hash = data.codeUnits.fold(0, (acc, c) => acc * 31 + c);

    void cell(int x, int y) {
      canvas.drawRect(
        Rect.fromLTWH(x * cellSize + 0.5, y * cellSize + 0.5,
            cellSize - 0.5, cellSize - 0.5),
        paint);
    }

    // Finder patterns (top-left, top-right, bottom-left)
    for (final corner in [[0, 0], [14, 0], [0, 14]]) {
      final cx = corner[0], cy = corner[1];
      for (var i = 0; i < 7; i++) {
        cell(cx + i, cy); cell(cx + i, cy + 6);
        cell(cx, cy + i); cell(cx + 6, cy + i);
      }
      for (var dx = 0; dx < 3; dx++) {
        for (var dy = 0; dy < 3; dy++) {
          cell(cx + 2 + dx, cy + 2 + dy);
        }
      }
    }

    // Data cells (pseudo-random based on hash)
    for (var x = 8; x < 21; x++) {
      for (var y = 8; y < 21; y++) {
        if (x >= 14 && y < 7) continue;
        if (((hash >> ((x * 21 + y) % 31)) & 1) == 1) cell(x, y);
      }
    }
    for (var x = 8; x < 14; x++) {
      for (var y = 8; y < 14; y++) {
        if (((hash >> ((x * 13 + y) % 31)) & 1) == 1) cell(x, y);
      }
    }

    // Timing patterns
    for (var i = 8; i < 13; i++) {
      if (i % 2 == 0) { cell(i, 6); cell(6, i); }
    }
  }

  @override
  bool shouldRepaint(covariant _QrPainter old) => old.data != data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Standalone screen: shows the "Ride Booked" confirmed view for an existing
// booking (navigated from the Bookings page when QR not yet scanned).
// ─────────────────────────────────────────────────────────────────────────────
class RideBookedDetailScreen extends StatefulWidget {
  final BusBooking booking;
  const RideBookedDetailScreen({super.key, required this.booking});
  @override
  State<RideBookedDetailScreen> createState() => _RideBookedDetailState();
}

class _RideBookedDetailState extends State<RideBookedDetailScreen> {
  bool _qrVisible = false;
  bool _arrived = false;

  BusBooking get b => widget.booking;

  // Reconstruct the RideClass from the booking category name
  _RideClass get _cat => _classes.firstWhere(
    (c) => c.name == b.category,
    orElse: () => _classes[0]);

  _Hood get _origin => _hoods.firstWhere(
    (h) => h.name == b.from,
    orElse: () => _Hood(b.from, '', 3.86, 11.51));

  _Hood get _dest => _hoods.firstWhere(
    (h) => h.name == b.to,
    orElse: () => _Hood(b.to, '', 3.85, 11.50));

  double get _distKm {
    final dlat = (_dest.lat - _origin.lat).abs();
    final dlng = (_dest.lng - _origin.lng).abs();
    return ((dlat + dlng) * 111).clamp(1.0, 50.0);
  }

  @override
  Widget build(BuildContext context) {
    final screenH = MediaQuery.of(context).size.height;
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Column(children: [
        _topBar(),
        Expanded(child: Stack(clipBehavior: Clip.hardEdge, children: [
          SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
            child: Column(children: [
              Container(width: 80, height: 80,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFF1DB954).withValues(alpha: 0.12),
                  border: Border.all(color: const Color(0xFF1DB954), width: 3)),
                child: const Icon(Icons.check_rounded, color: Color(0xFF1DB954), size: 44)),
              const SizedBox(height: 12),
              const Text('Ride Booked!',
                style: TextStyle(color: AppColors.textDark,
                    fontWeight: FontWeight.w900, fontSize: 22)),
              const SizedBox(height: 4),
              Text('Driver arriving in ~${b.etaMinutes} min',
                style: const TextStyle(color: AppColors.textGrey, fontSize: 13)),
              const SizedBox(height: 20),

              // Driver + Class card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.cardBorder)),
                child: Column(children: [
                  Row(children: [
                    Container(width: 52, height: 52,
                      decoration: BoxDecoration(
                        color: const Color(0xFF1DB954).withValues(alpha: 0.12),
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFF1DB954), width: 2)),
                      child: const Icon(Icons.person_rounded, color: Color(0xFF1DB954), size: 28)),
                    const SizedBox(width: 12),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Text('Your Driver',
                        style: TextStyle(color: AppColors.textGrey, fontSize: 10, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 2),
                      Text(b.driverName,
                        style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w800, fontSize: 14)),
                      const SizedBox(height: 2),
                      Row(children: [
                        const Icon(Icons.directions_car_rounded, color: AppColors.textGrey, size: 12),
                        const SizedBox(width: 4),
                        Text(b.driverPlate,
                          style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
                      ]),
                    ])),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1DB954).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFF1DB954).withValues(alpha: 0.4))),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        const Icon(Icons.phone_rounded, color: Color(0xFF1DB954), size: 14),
                        const SizedBox(width: 4),
                        Text(b.driverPhone,
                          style: const TextStyle(color: Color(0xFF1DB954),
                              fontSize: 11, fontWeight: FontWeight.w700)),
                      ])),
                  ]),
                  const Divider(color: AppColors.cardBorder, height: 20),
                  Row(children: [
                    Container(width: 40, height: 40,
                      decoration: BoxDecoration(
                        color: _cat.color.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(10)),
                      child: Icon(_cat.icon, color: _cat.color, size: 20)),
                    const SizedBox(width: 12),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Text('Class Selected',
                        style: TextStyle(color: AppColors.textGrey, fontSize: 10, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 2),
                      Text(b.category,
                        style: TextStyle(color: _cat.color, fontWeight: FontWeight.w800, fontSize: 14)),
                      Text(b.carType,
                        style: const TextStyle(color: AppColors.textGrey, fontSize: 11),
                        overflow: TextOverflow.ellipsis),
                    ])),
                    Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                      Text('XAF ${b.price.toStringAsFixed(0)}',
                        style: TextStyle(color: _cat.color, fontWeight: FontWeight.w900, fontSize: 16)),
                      const Text('Est. fare',
                        style: TextStyle(color: AppColors.textGrey, fontSize: 10)),
                    ]),
                  ]),
                ])),
              const SizedBox(height: 14),

              // Live tracking mini-map
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: _orange.withValues(alpha: 0.35)),
                  boxShadow: [BoxShadow(color: _orange.withValues(alpha: 0.08), blurRadius: 12)]),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: Column(children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      color: AppColors.bgCard,
                      child: Row(children: [
                        const Icon(Icons.map_rounded, color: _orange, size: 16),
                        const SizedBox(width: 8),
                        const Text('Live Tracking',
                          style: TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w700, fontSize: 13)),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1DB954).withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(20)),
                          child: Row(mainAxisSize: MainAxisSize.min, children: [
                            Container(width: 6, height: 6,
                              decoration: const BoxDecoration(color: Color(0xFF1DB954), shape: BoxShape.circle)),
                            const SizedBox(width: 4),
                            const Text('LIVE', style: TextStyle(color: Color(0xFF1DB954),
                                fontSize: 10, fontWeight: FontWeight.w700)),
                          ])),
                      ])),
                    SizedBox(height: 200,
                      child: Stack(children: [
                        Container(color: const Color(0xFF0D1B2A),
                          child: CustomPaint(size: const Size(double.infinity, double.infinity), painter: _GridPainter())),
                        CustomPaint(size: const Size(double.infinity, double.infinity),
                          painter: _TrackingRoutePainter(_origin, _dest)),
                        _mapPin(_origin, const Color(0xFF1DB954)),
                        _mapPin(_dest, _orange),
                        _driverMarker(_origin, _dest),
                        Positioned(top: 8, left: 10,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.7),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: _orange.withValues(alpha: 0.4))),
                            child: Row(children: [
                              const Icon(Icons.straighten_rounded, color: _orange, size: 11),
                              const SizedBox(width: 4),
                              Text('~${_distKm.toStringAsFixed(1)} km  ·  ${b.etaMinutes} min',
                                style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w600)),
                            ]))),
                      ])),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      color: AppColors.bgCard,
                      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                        _legendDot(const Color(0xFF1DB954), b.from, 'Pickup'),
                        Row(children: [
                          Container(width: 30, height: 1.5, color: _orange.withValues(alpha: 0.5)),
                          const Icon(Icons.local_taxi_rounded, color: _orange, size: 14),
                          Container(width: 30, height: 1.5, color: _orange.withValues(alpha: 0.5)),
                        ]),
                        _legendDot(_orange, b.to, 'Destination'),
                      ])),
                  ]))),
              const SizedBox(height: 14),

              // Booking ref card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: _orange.withValues(alpha: 0.2))),
                child: Column(children: [
                  _infoRow('Reference', b.reference),
                  _infoRow('Date', b.date),
                  _infoRow('Car Type', b.carType),
                  const Divider(color: AppColors.cardBorder, height: 16),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: _orange.withValues(alpha: 0.07),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: _orange.withValues(alpha: 0.25))),
                    child: const Row(children: [
                      Icon(Icons.qr_code_scanner_rounded, color: _orange, size: 15),
                      SizedBox(width: 8),
                      Expanded(child: Text(
                        'Show QR to driver when you arrive to confirm fare.',
                        style: TextStyle(color: _orange, fontSize: 11))),
                    ])),
                ])),
              const SizedBox(height: 14),

              if (!_arrived)
                SizedBox(width: double.infinity, height: 48,
                  child: OutlinedButton.icon(
                    onPressed: () => setState(() { _arrived = true; _qrVisible = true; }),
                    icon: const Icon(Icons.location_on_rounded, color: _orange, size: 18),
                    label: const Text('Simulate Arrival',
                      style: TextStyle(color: _orange, fontWeight: FontWeight.w700, fontSize: 14)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: _orange),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))))),
              const SizedBox(height: 8),
              SizedBox(width: double.infinity, height: 50,
                child: ElevatedButton.icon(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
                  label: const Text('Back to Bookings',
                    style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: Colors.white)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _orange,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))))),
            ])),

          AnimatedPositioned(
            duration: const Duration(milliseconds: 450),
            curve: Curves.easeOutCubic,
            bottom: _qrVisible ? 0 : -screenH,
            left: 0, right: 0,
            child: _qrPaymentSheet()),
        ])),
      ]),
    );
  }

  Widget _topBar() => Container(
    color: AppColors.bgCard,
    child: SafeArea(bottom: false, child: Padding(
      padding: const EdgeInsets.fromLTRB(12, 10, 16, 12),
      child: Row(children: [
        GestureDetector(
          onTap: () => Navigator.pop(context),
          child: Container(width: 38, height: 38,
            decoration: BoxDecoration(
              color: AppColors.bgMid,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.cardBorder)),
            child: const Icon(Icons.arrow_back_rounded, color: AppColors.textDark, size: 20))),
        const SizedBox(width: 12),
        const Expanded(child: Text('Ride Booked!',
          style: TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w800, fontSize: 17))),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: _orange.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(20)),
          child: const Row(children: [
            Icon(Icons.local_taxi_rounded, color: _orange, size: 14),
            SizedBox(width: 4),
            Text('Ride', style: TextStyle(color: _orange, fontSize: 11, fontWeight: FontWeight.w700)),
          ])),
      ]))));

  Widget _mapPin(_Hood n, Color color) {
    final lats = [_origin.lat, _dest.lat];
    final lngs = [_origin.lng, _dest.lng];
    final minLat = lats.reduce((a, b) => a < b ? a : b);
    final maxLat = lats.reduce((a, b) => a > b ? a : b);
    final minLng = lngs.reduce((a, b) => a < b ? a : b);
    final maxLng = lngs.reduce((a, b) => a > b ? a : b);
    final latR = (maxLat - minLat).clamp(0.001, 100.0);
    final lngR = (maxLng - minLng).clamp(0.001, 100.0);
    final fx = ((n.lng - minLng) / lngR * 0.72 + 0.14).clamp(0.0, 1.0);
    final fy = ((1 - (n.lat - minLat) / latR) * 0.72 + 0.10).clamp(0.0, 1.0);
    return Positioned.fill(child: Align(
      alignment: Alignment(fx * 2 - 1, fy * 2 - 1),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Container(width: 20, height: 20,
          decoration: BoxDecoration(
            color: color, shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 2.5),
            boxShadow: [BoxShadow(color: color.withValues(alpha: 0.5), blurRadius: 8, spreadRadius: 1)])),
        const SizedBox(height: 3),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
          decoration: BoxDecoration(
            color: Colors.black.withValues(alpha: 0.8),
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: color.withValues(alpha: 0.4))),
          child: Text(n.name.length > 12 ? n.name.substring(0, 12) : n.name,
            style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w700))),
      ])));
  }

  Widget _driverMarker(_Hood from, _Hood to) {
    final lats = [from.lat, to.lat];
    final lngs = [from.lng, to.lng];
    final minLat = lats.reduce((a, b) => a < b ? a : b);
    final maxLat = lats.reduce((a, b) => a > b ? a : b);
    final minLng = lngs.reduce((a, b) => a < b ? a : b);
    final maxLng = lngs.reduce((a, b) => a > b ? a : b);
    final latR = (maxLat - minLat).clamp(0.001, 100.0);
    final lngR = (maxLng - minLng).clamp(0.001, 100.0);
    final midLat = from.lat + (to.lat - from.lat) * 0.3;
    final midLng = from.lng + (to.lng - from.lng) * 0.3;
    final fx = ((midLng - minLng) / lngR * 0.72 + 0.14).clamp(0.0, 1.0);
    final fy = ((1 - (midLat - minLat) / latR) * 0.72 + 0.10).clamp(0.0, 1.0);
    return Positioned.fill(child: Align(
      alignment: Alignment(fx * 2 - 1, fy * 2 - 1),
      child: Container(width: 30, height: 30,
        decoration: BoxDecoration(
          color: _orange, shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 2),
          boxShadow: [BoxShadow(color: _orange.withValues(alpha: 0.5), blurRadius: 10, spreadRadius: 2)]),
        child: const Icon(Icons.local_taxi_rounded, color: Colors.white, size: 16))));
  }

  Widget _legendDot(Color color, String name, String label) {
    return Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
      Row(children: [
        Container(width: 8, height: 8,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text(name, style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 11)),
      ]),
      Text(label, style: const TextStyle(color: AppColors.textGrey, fontSize: 9)),
    ]);
  }

  Widget _infoRow(String label, String value) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Row(children: [
      Text(label, style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
      const Spacer(),
      Text(value, style: const TextStyle(color: AppColors.textDark, fontSize: 12, fontWeight: FontWeight.w600)),
    ]));

  Widget _qrPaymentSheet() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.4), blurRadius: 30, offset: const Offset(0, -8))]),
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 36),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Container(width: 40, height: 4,
          decoration: BoxDecoration(color: AppColors.cardBorder, borderRadius: BorderRadius.circular(2))),
        const SizedBox(height: 16),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: const Color(0xFF1DB954).withValues(alpha: 0.10),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF1DB954).withValues(alpha: 0.4))),
          child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            Icon(Icons.location_on_rounded, color: Color(0xFF1DB954), size: 18),
            SizedBox(width: 6),
            Text('You have arrived!',
              style: TextStyle(color: Color(0xFF1DB954), fontWeight: FontWeight.w800, fontSize: 14)),
          ])),
        const SizedBox(height: 16),
        const Text('Scan to Pay',
          style: TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w900, fontSize: 20)),
        const SizedBox(height: 4),
        Text('Show this QR to ${b.driverName.split(' ').first}',
          style: const TextStyle(color: AppColors.textGrey, fontSize: 13)),
        const SizedBox(height: 18),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [BoxShadow(color: _orange.withValues(alpha: 0.2), blurRadius: 20, spreadRadius: 2)]),
          child: SizedBox(width: 180, height: 180,
            child: CustomPaint(painter: _QrPainter(b.reference)))),
        const SizedBox(height: 14),
        Text(b.reference,
          style: const TextStyle(color: AppColors.textGrey,
              fontSize: 12, fontWeight: FontWeight.w600, letterSpacing: 1.2)),
        const SizedBox(height: 16),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: _orange.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _orange.withValues(alpha: 0.3))),
          child: Column(children: [
            Text('XAF ${b.price.toStringAsFixed(0)}',
              style: const TextStyle(color: _orange, fontWeight: FontWeight.w900, fontSize: 26)),
            const SizedBox(height: 2),
            const Text('will be deducted from your Traveo Wallet',
              style: TextStyle(color: AppColors.textGrey, fontSize: 11)),
          ])),
        const SizedBox(height: 16),
        SizedBox(width: double.infinity, height: 52,
          child: ElevatedButton.icon(
            onPressed: () {
              walletBalance -= b.price;
              walletTransactions.insert(0, {
                'type': 'debit',
                'label': 'Ride: ${b.from} → ${b.to}',
                'amount': -b.price,
                'date': b.date,
                'icon': 'send',
              });
              // Remove ride from bookings
              globalBusBookings.removeWhere((r) => r.id == b.id);
              globalServiceBookings.removeWhere((r) => r.id == b.id);
              bookingsRefreshNotifier.value++;
              setState(() => _qrVisible = false);
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                content: Row(children: [
                  const Icon(Icons.check_circle_rounded, color: Colors.white, size: 18),
                  const SizedBox(width: 8),
                  Text('XAF ${b.price.toStringAsFixed(0)} deducted — Enjoy your trip!'),
                ]),
                backgroundColor: const Color(0xFF1DB954),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                behavior: SnackBarBehavior.floating));
              // Navigate back to bookings after payment
              Navigator.pop(context);
            },
            icon: const Icon(Icons.qr_code_scanner_rounded, color: Colors.white, size: 20),
            label: const Text('Confirm Payment',
              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: Colors.white)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1DB954),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))))),
        const SizedBox(height: 8),
        TextButton(
          onPressed: () => setState(() => _qrVisible = false),
          child: const Text('Close', style: TextStyle(color: AppColors.textGrey, fontSize: 13))),
      ]),
    );
  }
}
