import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../widgets/common_widgets.dart';
import '../wallet/wallet_screen.dart';
import 'flight_booking_screen.dart';
import 'bus_booking_screen.dart';
import 'train_booking_screen.dart';
import 'boat_booking_screen.dart';
import 'evisa_screen.dart';
import '../pro/bookings_pro_screen.dart' show ListingMediaItem, ListingMediaType;
import '../pro/ai_assistant_screen.dart';
import '../reservation/trip_planner_screen.dart';

// ── Booking model ─────────────────────────────────────────────────────────
class ServiceBooking {
  final String id, type, name, description, destination, date;
  final double price;
  final IconData icon;
  final Color color;
  final String? checkIn, checkOut; // for hotel bookings
  String status;
  ServiceBooking({
    required this.id, required this.type, required this.name,
    required this.description, required this.destination, required this.date,
    required this.price, required this.icon, required this.color,
    this.checkIn, this.checkOut,
    this.status = 'Confirmed',
  });
}

final List<ServiceBooking> globalServiceBookings = [];

// ── Data classes ──────────────────────────────────────────────────────────
class _Svc {
  final String name;
  final IconData icon;
  final Color color;
  const _Svc(this.name, this.icon, this.color);
}

class _Trip {
  final IconData icon;
  final String name, desc;
  final Color color;
  const _Trip(this.icon, this.name, this.desc, this.color);
}

class _Item {
  final String name, location, desc;
  final double price;
  const _Item(this.name, this.location, this.price, this.desc);
}

// ── Services Screen ───────────────────────────────────────────────────────
class ServicesScreen extends StatefulWidget {
  const ServicesScreen({super.key});

  @override
  State<ServicesScreen> createState() => ServicesScreenState();
}

// State is public so MainNavScreen can call jumpToService() via GlobalKey
class ServicesScreenState extends State<ServicesScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tab;
  int _sel = 0;
  String _searchQuery = '';
  String _sortBy = 'default'; // 'default' | 'price_asc' | 'price_desc'
  final _searchCtrl = TextEditingController();

  static const _svcs = [
    _Svc('Guide & Experience', Icons.tour_rounded,                Color(0xFF1DB954)),
    _Svc('Restaurant',    Icons.restaurant_rounded,          Color(0xFF4CAF50)),
    _Svc('Hotel',         Icons.hotel_rounded,               Color(0xFF00ACC1)),
    _Svc('Premium Event', Icons.event_rounded,               Color(0xFFF5A623)),
    _Svc('Transportation', Icons.airplanemode_active_rounded,  Color(0xFF2196F3)),
  ];

  static const _trips = [
    _Trip(Icons.directions_bus_rounded,      'Ride',  'Book a ride in your area',          Color(0xFFFF9800)),
    _Trip(Icons.airplanemode_active_rounded, 'Plane', 'International & domestic flights', Color(0xFF2196F3)),
    _Trip(Icons.train_rounded,               'Train', 'Rail travel across the region',    Color(0xFF9C27B0)),
    _Trip(Icons.directions_boat_rounded,     'Boat',  'River & sea crossings',             Color(0xFF00BCD4)),
  ];

  static const _listings = <List<_Item>>[
    // 0 - Guide & Experience
    [
      _Item('Kribi Beach Day Guide & Experience', 'Kribi',       45.0, 'Full-day guided beach experience with snorkeling'),
      _Item('Yaoundé City Highlights', 'Yaoundé',     30.0, 'Explore the best of the capital city'),
      _Item('Limbe Wildlife Centre',   'Limbe',       25.0, 'Visit rescued primates in their sanctuary'),
    ],
    // 1 - Restaurant
    [
      _Item('La Terrasse Fine Dining', 'Yaoundé',     25.0, 'Award-winning fine dining in the heart of the capital'),
      _Item('Le Wouri Seafood Grill',  'Douala',      35.0, 'Fresh catch grilled to perfection on the waterfront'),
      _Item('Kribi Beach Restaurant',  'Kribi',       20.0, 'Authentic Cameroonian cuisine with ocean views'),
    ],
    // 2 - Hotel
    [
      _Item('Hilton Yaoundé',          'Yaoundé',    180.0, 'Luxury 5-star hotel in the heart of the capital'),
      _Item('Sawa Hotel Douala',       'Douala',     140.0, 'Premium waterfront hotel with stunning views'),
      _Item('Limbe Beach Resort',      'Limbe',       95.0, 'Beachfront resort with private access to the sea'),
    ],
    // 3 - Premium Event
    [
      _Item('Ngondo Festival VIP',     'Douala',     200.0, 'VIP access to Cameroon\'s biggest river festival'),
      _Item('Foumban Royal Arts',      'Foumban',    150.0, 'Exclusive cultural ceremony & palace access'),
      _Item('Jazz in the Valley',      'Bafoussam',  180.0, 'Premium concert with top Cameroonian artists'),
    ],
    // 4 - Transportation handled by _tripSection()
  ];


  static const _proUsers = [
    {'initials': 'KT', 'name': 'Kamga Tours',  'color': Color(0xFF6D28D9)},
    {'initials': 'AF', 'name': 'Africa Wild',  'color': Color(0xFF0369A1)},
    {'initials': 'CM', 'name': 'Cam Explore',  'color': Color(0xFF059669)},
  ];

  @override
  void initState() {
    super.initState();
    _tab = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() { _tab.dispose(); _searchCtrl.dispose(); super.dispose(); }

  /// Called by MainNavScreen via GlobalKey to jump to a specific service tab.
  void jumpToService(int index) {
    setState(() {
      _sel = index.clamp(0, _svcs.length - 1);
      _tab.animateTo(0); // ensure Browse Services tab is active
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Column(children: [
        _header(),
        Container(
          color: AppColors.bgCard,
          child: TabBar(
            controller: _tab,
            indicatorColor: AppColors.primary,
            labelColor: AppColors.primary,
            unselectedLabelColor: AppColors.textGrey,
            labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
            tabs: const [Tab(text: 'Browse Services'), Tab(text: 'My Bookings')])),
        Expanded(child: TabBarView(controller: _tab, children: [
          _browseTab(),
          _bookingsTab(),
        ])),
      ]),
    );
  }

  Widget _header() => Container(
    color: AppColors.bgDark,
    child: SafeArea(bottom: false, child: Padding(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
      child: Row(children: [
        const TraveoLogoWidget(),
        const Spacer(),
        const Text('Services', style: TextStyle(color: AppColors.textDark,
            fontWeight: FontWeight.w800, fontSize: 18)),
        const Spacer(),
        GestureDetector(
          onTap: () => Navigator.push(context,
              MaterialPageRoute(builder: (_) => const WalletScreen())),
          child: Container(width: 40, height: 40,
            decoration: BoxDecoration(color: AppColors.bgCard,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder)),
            child: const Icon(Icons.account_balance_wallet_rounded, color: AppColors.primary, size: 20))),
        const SizedBox(width: 8),
        Container(width: 40, height: 40,
          decoration: BoxDecoration(color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.cardBorder)),
          child: const Icon(Icons.notifications_rounded, color: AppColors.textGrey, size: 20)),
      ]))));

  Widget _browseTab() {
    // Filter listings by search query and sort by price
    List<_Item> filteredListings() {
      if (_sel >= _listings.length) return [];
      var items = List<_Item>.from(_listings[_sel]);
      if (_searchQuery.isNotEmpty) {
        items = items.where((item) =>
          item.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          item.location.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          item.desc.toLowerCase().contains(_searchQuery.toLowerCase())).toList();
      }
      if (_sortBy == 'price_asc') items.sort((a, b) => a.price.compareTo(b.price));
      if (_sortBy == 'price_desc') items.sort((a, b) => b.price.compareTo(a.price));
      return items;
    }

    return ListView(padding: const EdgeInsets.fromLTRB(16, 16, 16, 32), children: [
      const Text('Select Service Type', style: TextStyle(color: AppColors.textDark,
          fontWeight: FontWeight.w700, fontSize: 15)),
      const SizedBox(height: 12),
      SizedBox(
        height: 80,
        child: ListView.builder(
          scrollDirection: Axis.horizontal,
          itemCount: _svcs.length,
          itemBuilder: (_, i) {
            final s = _svcs[i];
            final active = i == _sel;
            return GestureDetector(
              onTap: () => setState(() { _sel = i; _searchQuery = ''; _searchCtrl.clear(); }),
              child: Container(
                width: 90, margin: const EdgeInsets.only(right: 10),
                decoration: BoxDecoration(
                  color: active ? s.color.withValues(alpha: 0.2) : AppColors.bgCard,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: active ? s.color : AppColors.cardBorder)),
                child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Icon(s.icon, color: active ? s.color : AppColors.textGrey, size: 26),
                  const SizedBox(height: 6),
                  Text(s.name, textAlign: TextAlign.center,
                    style: TextStyle(color: active ? s.color : AppColors.textGrey,
                        fontSize: 10, fontWeight: FontWeight.w600)),
                ])));
          })),
      const SizedBox(height: 16),

      // ── Search bar ───────────────────────────────────────────────────────
      if (_sel != 4) ...[
        Container(
          decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.cardBorder)),
          child: TextField(
            controller: _searchCtrl,
            style: const TextStyle(color: AppColors.textDark, fontSize: 13),
            onChanged: (v) => setState(() => _searchQuery = v),
            decoration: InputDecoration(
              hintText: 'Search ${_svcs[_sel].name.toLowerCase()}s by name, location...',
              hintStyle: const TextStyle(color: AppColors.textGrey, fontSize: 12),
              prefixIcon: const Icon(Icons.search_rounded, color: AppColors.primary, size: 20),
              suffixIcon: _searchQuery.isNotEmpty
                ? GestureDetector(
                    onTap: () => setState(() { _searchQuery = ''; _searchCtrl.clear(); }),
                    child: const Icon(Icons.close_rounded, color: AppColors.textGrey, size: 18))
                : null,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(vertical: 13)))),
        const SizedBox(height: 10),

        // ── Sort / Filter row ──────────────────────────────────────────────
        Row(children: [
          const Text('Sort by:', style: TextStyle(color: AppColors.textGrey, fontSize: 12)),
          const SizedBox(width: 10),
          _filterChip('Default', 'default'),
          const SizedBox(width: 8),
          _filterChip('Price ↑', 'price_asc'),
          const SizedBox(width: 8),
          _filterChip('Price ↓', 'price_desc'),
        ]),
        const SizedBox(height: 16),
      ],

      if (_sel == 4)
        _tripSection()
      else ...[
        if (_sel < _listings.length) ...[
          Builder(builder: (_) {
            final items = filteredListings();
            if (items.isEmpty) {
              return Center(child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(children: [
                  const Icon(Icons.search_off_rounded, color: AppColors.textGrey, size: 48),
                  const SizedBox(height: 12),
                  Text('No results for "$_searchQuery"',
                    style: const TextStyle(color: AppColors.textGrey, fontSize: 14)),
                ])));
            }
            return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Available ${_svcs[_sel].name}s',
                style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w700, fontSize: 14)),
              const SizedBox(height: 12),
              ...items.asMap().entries.map((e) => _serviceCard(e.value, _svcs[_sel], e.key)),
            ]);
          }),
        ],
      ],
    ]);
  }

  Widget _filterChip(String label, String value) {
    final active = _sortBy == value;
    return GestureDetector(
      onTap: () => setState(() => _sortBy = value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: active ? AppColors.primary.withValues(alpha: 0.15) : AppColors.bgCard,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: active ? AppColors.primary : AppColors.cardBorder)),
        child: Text(label, style: TextStyle(
          color: active ? AppColors.primary : AppColors.textGrey,
          fontSize: 11, fontWeight: active ? FontWeight.w700 : FontWeight.w500))));
  }

  Widget _tripSection() {
    final widgets = <Widget>[
      const Text('Transportation', style: TextStyle(color: AppColors.textDark,
          fontWeight: FontWeight.w700, fontSize: 14)),
      const SizedBox(height: 12),
    ];
    for (final t in _trips) { widgets.add(_tripCard(t)); }

    // E-Visa card
    widgets.add(_eVisaCard());

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: widgets);
  }

  Widget _eVisaCard() => GestureDetector(
    onTap: () => Navigator.push(context,
        MaterialPageRoute(builder: (_) => const EVisaScreen())),
    child: Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [
          const Color(0xFF1565C0).withValues(alpha: 0.25),
          AppColors.primary.withValues(alpha: 0.15),
        ]),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.info.withValues(alpha: 0.5))),
      child: Row(children: [
        Container(width: 52, height: 52,
          decoration: BoxDecoration(color: AppColors.info.withValues(alpha: 0.18),
            borderRadius: BorderRadius.circular(14)),
          child: const Icon(Icons.document_scanner_rounded, color: AppColors.info, size: 28)),
        const SizedBox(width: 14),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Row(children: [
            Text('E-Visa Application', style: TextStyle(color: AppColors.textDark,
                fontWeight: FontWeight.w800, fontSize: 15)),
            SizedBox(width: 8),
            _NewBadge(),
          ]),
          const Text('Check eligibility & apply for e-visas online',
            style: TextStyle(color: AppColors.textGrey, fontSize: 12)),
        ])),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(color: AppColors.info.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(20)),
          child: const Text('Apply', style: TextStyle(color: AppColors.info,
              fontWeight: FontWeight.w700, fontSize: 12))),
      ])));


  Widget _tripCard(_Trip t) => GestureDetector(
    onTap: () {
      if (t.name == 'Ride') {
        Navigator.push(context,
          MaterialPageRoute(builder: (_) => const BusBookingScreen()));
        return;
      }
      if (t.name == 'Plane') {
        Navigator.push(context,
          MaterialPageRoute(builder: (_) => const FlightBookingScreen()));
        return;
      }
      if (t.name == 'Train') {
        Navigator.push(context,
          MaterialPageRoute(builder: (_) => const TrainBookingScreen()));
        return;
      }
      if (t.name == 'Boat') {
        Navigator.push(context,
          MaterialPageRoute(builder: (_) => const BoatBookingScreen()));
        return;
      }
      _showForm(
        type: 'Transportation - ${t.name}', icon: t.icon, color: t.color,
        fields: ['From', 'To', 'Date', 'Passengers']);
    },
    child: Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.5))),
      child: Row(children: [
        Container(width: 52, height: 52,
          decoration: BoxDecoration(color: t.color.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(14)),
          child: Icon(t.icon, color: t.color, size: 28)),
        const SizedBox(width: 14),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(t.name, style: const TextStyle(color: AppColors.textDark,
              fontWeight: FontWeight.w800, fontSize: 15)),
          Text(t.desc, style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
        ])),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(color: t.color.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(20)),
          child: Text('Book', style: TextStyle(color: t.color,
              fontWeight: FontWeight.w700, fontSize: 12))),
        const SizedBox(width: 8),
        _proAvatar(_trips.indexOf(t) % _proUsers.length),
      ])));

  // Legacy - now handled inline in _browseTab
  Widget _listingsSection(int idx) => const SizedBox();

  Widget _serviceCard(_Item item, _Svc s, int proIdx) {
    final pro = _proUsers[proIdx % _proUsers.length];
    return GestureDetector(
      onTap: () => Navigator.push(context, MaterialPageRoute(
        builder: (_) => ServiceDetailScreen(
          item: item, svc: s,
          proName: pro['name'] as String,
          proInitials: pro['initials'] as String,
          proColor: pro['color'] as Color,
          onBook: () => _showForm(
            type: s.name, icon: s.icon, color: s.color,
            name: item.name, price: item.price, location: item.location,
            fields: s.name == 'Hotel'
                ? ['Check-in Date', 'Check-out Date', 'Number of Guests']
                : ['Date', 'Number of People', 'Special Requests']),
        ))),
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        decoration: BoxDecoration(color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
            child: Container(
              height: 140, width: double.infinity,
              decoration: BoxDecoration(gradient: LinearGradient(
                begin: Alignment.topLeft, end: Alignment.bottomRight,
                colors: [s.color.withValues(alpha: 0.5), s.color.withValues(alpha: 0.2)])),
              child: Stack(children: [
                Center(child: Icon(s.icon,
                    color: AppColors.textDark.withValues(alpha: 0.15), size: 80)),
                Positioned(top: 12, left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(color: s.color.withValues(alpha: 0.85),
                      borderRadius: BorderRadius.circular(20)),
                    child: Text(s.name, style: const TextStyle(color: AppColors.textDark,
                        fontSize: 11, fontWeight: FontWeight.w700)))),
                Positioned(bottom: 12, right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(color: AppColors.bgMid,
                      borderRadius: BorderRadius.circular(20)),
                    child: Text('XAF ${item.price.toStringAsFixed(0)}',
                      style: TextStyle(color: s.color,
                          fontWeight: FontWeight.w900, fontSize: 15)))),
                Positioned(bottom: 12, left: 12,
                  child: Row(children: [
                    const Icon(Icons.location_on_rounded, color: AppColors.textGrey, size: 13),
                    const SizedBox(width: 3),
                    Text(item.location,
                        style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
                  ])),
                Positioned(top: 10, right: 10,
                  child: _proAvatar(proIdx % _proUsers.length)),
              ]))),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(item.name, style: const TextStyle(color: AppColors.textDark,
                  fontWeight: FontWeight.w800, fontSize: 15)),
              const SizedBox(height: 4),
              Text(item.desc, style: const TextStyle(color: AppColors.textGrey,
                  fontSize: 12, height: 1.4), maxLines: 2, overflow: TextOverflow.ellipsis),
              const SizedBox(height: 8),
              Row(children: [
                const Icon(Icons.info_outline_rounded, color: AppColors.primary, size: 13),
                const SizedBox(width: 4),
                const Text('Tap to see full details',
                  style: TextStyle(color: AppColors.primary, fontSize: 11)),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(color: s.color.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: s.color.withValues(alpha: 0.4))),
                  child: Text('Book Now', style: TextStyle(color: s.color,
                      fontWeight: FontWeight.w700, fontSize: 12))),
              ]),
            ])),
        ])));
  }

  void _showForm({
    required String type, required IconData icon, required Color color,
    String? name, double? price, String? location, required List<String> fields,
  }) {
    final controllers = <String, TextEditingController>{
      for (final f in fields) f: TextEditingController(),
    };
    showModalBottomSheet(
      context: context, isScrollControlled: true,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) {
        final fieldWidgets = fields.map((f) => Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Container(
            decoration: BoxDecoration(color: AppColors.bgCardLight,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder)),
            child: TextField(
              controller: controllers[f],
              style: const TextStyle(color: AppColors.textDark),
              decoration: InputDecoration(
                hintText: f,
                hintStyle: const TextStyle(color: AppColors.textGrey),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(
                    horizontal: 14, vertical: 14)))))).toList();

        return Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              Container(width: 40, height: 4,
                margin: const EdgeInsets.only(bottom: 20),
                decoration: BoxDecoration(color: AppColors.cardBorder,
                    borderRadius: BorderRadius.circular(2))),
              Row(children: [
                Container(width: 48, height: 48,
                  decoration: BoxDecoration(color: color.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(14)),
                  child: Icon(icon, color: color, size: 26)),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Book $type', style: const TextStyle(
                      color: AppColors.textDark,
                      fontWeight: FontWeight.w800, fontSize: 17)),
                  if (name != null)
                    Text(name, style: const TextStyle(
                        color: AppColors.textGrey, fontSize: 12)),
                ])),
                if (price != null)
                  Text('XAF ${price.toStringAsFixed(0)}',
                    style: TextStyle(color: color,
                        fontWeight: FontWeight.w900, fontSize: 20)),
              ]),
              const SizedBox(height: 20),
              ...fieldWidgets,
              const SizedBox(height: 8),
              SizedBox(width: double.infinity, height: 50,
                child: ElevatedButton(
                  onPressed: () {
                    final isHotel = type == 'Hotel';
                    final booking = ServiceBooking(
                      id: 'sb${DateTime.now().millisecondsSinceEpoch}',
                      type: type, name: name ?? type,
                      description: 'Booked $type',
                      destination: location ?? controllers['To']?.text ?? '',
                      date: controllers['Check-in Date']?.text
                          ?? controllers['Date']?.text ?? 'TBD',
                      price: price ?? 0, icon: icon, color: color,
                      checkIn: isHotel ? (controllers['Check-in Date']?.text ?? '') : null,
                      checkOut: isHotel ? (controllers['Check-out Date']?.text ?? '') : null,
                    );
                    globalServiceBookings.insert(0, booking);
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      content: Text('$type booked successfully!'),
                      backgroundColor: AppColors.primary));
                    setState(() {});
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: color,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14))),
                  child: const Text('Confirm Booking',
                      style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)))),
              const SizedBox(height: 8),
            ])));
      });
  }



  Widget _proAvatar(int idx) {
    final pro = _proUsers[idx];
    final proColor = pro['color'] as Color;
    final proInitials = pro['initials'] as String;
    final proName = pro['name'] as String;
    return GestureDetector(
      onTap: () => _openProMessage(proName, proInitials, proColor),
      child: Row(children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
          decoration: BoxDecoration(
            color: Colors.black.withValues(alpha: 0.55),
            borderRadius: BorderRadius.circular(6)),
          child: Text(proName, style: const TextStyle(
              color: Colors.white, fontSize: 8,
              fontWeight: FontWeight.w600))),
        const SizedBox(width: 4),
        Container(
          width: 28, height: 28,
          decoration: BoxDecoration(
            color: proColor,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 1.5)),
          child: Center(child: Text(proInitials,
            style: const TextStyle(color: Colors.white,
                fontSize: 9, fontWeight: FontWeight.w800)))),
      ]));
  }

  void _openProMessage(String proName, String initials, Color color) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => _ServiceProMessageSheet(
          proName: proName, initials: initials, color: color));
  }

  Widget _bookingsTab() {
    // Exclude ride/transport bookings — those live on the Bookings page
    final bookings = globalServiceBookings
        .where((b) => !b.type.startsWith('Ride') &&
                      !b.type.startsWith('Transportation') &&
                      b.type != 'Flight')
        .toList();

    if (bookings.isEmpty) {
      return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(Icons.receipt_long_rounded,
            color: AppColors.textGrey.withValues(alpha: 0.3), size: 80),
        const SizedBox(height: 16),
        const Text('No bookings yet',
            style: TextStyle(color: AppColors.textGrey, fontSize: 16)),
        const SizedBox(height: 8),
        const Text('Browse services and book your next experience',
            style: TextStyle(color: AppColors.textGrey, fontSize: 12)),
      ]));
    }

    // Group by type
    final hotels    = bookings.where((b) => b.type == 'Hotel').toList();
    final restaurants = bookings.where((b) => b.type == 'Restaurant').toList();
    final events    = bookings.where((b) => b.type == 'Premium Event').toList();
    final tours     = bookings.where((b) => b.type == 'Guide & Experience').toList();
    final adventures = bookings.where((b) => b.type == 'Restaurant').toList();
    final others    = bookings.where((b) =>
        b.type != 'Hotel' && b.type != 'Restaurant' &&
        b.type != 'Premium Event' && b.type != 'Guide & Experience' && b.type != 'Restaurant').toList();

    return ListView(padding: const EdgeInsets.all(16), children: [
      if (hotels.isNotEmpty) ...[
        _svcSectionHeader('Hotels', Icons.hotel_rounded, const Color(0xFF00ACC1)),
        const SizedBox(height: 10),
        ...hotels.map((b) => _serviceBookingCard(b)),
        const SizedBox(height: 6),
      ],
      if (restaurants.isNotEmpty) ...[
        _svcSectionHeader('Restaurants', Icons.restaurant_rounded, const Color(0xFFE53935)),
        const SizedBox(height: 10),
        ...restaurants.map((b) => _serviceBookingCard(b)),
        const SizedBox(height: 6),
      ],
      if (events.isNotEmpty) ...[
        _svcSectionHeader('Events', Icons.event_rounded, const Color(0xFFF5A623)),
        const SizedBox(height: 10),
        ...events.map((b) => _serviceBookingCard(b)),
        const SizedBox(height: 6),
      ],
      if (tours.isNotEmpty) ...[
        _svcSectionHeader('Tours', Icons.tour_rounded, const Color(0xFF1DB954)),
        const SizedBox(height: 10),
        ...tours.map((b) => _serviceBookingCard(b)),
        const SizedBox(height: 6),
      ],
      if (adventures.isNotEmpty) ...[
        _svcSectionHeader('Restaurants', Icons.restaurant_rounded, const Color(0xFF4CAF50)),
        const SizedBox(height: 10),
        ...adventures.map((b) => _serviceBookingCard(b)),
        const SizedBox(height: 6),
      ],
      if (others.isNotEmpty) ...[
        _svcSectionHeader('Other', Icons.star_rounded, AppColors.primary),
        const SizedBox(height: 10),
        ...others.map((b) => _serviceBookingCard(b)),
      ],
    ]);
  }

  Widget _svcSectionHeader(String title, IconData icon, Color color) {
    return Row(children: [
      Container(width: 28, height: 28,
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(8)),
        child: Icon(icon, color: color, size: 15)),
      const SizedBox(width: 8),
      Text(title, style: TextStyle(color: color,
          fontWeight: FontWeight.w800, fontSize: 14)),
    ]);
  }

  Widget _serviceBookingCard(ServiceBooking b) {
    final isHotel = b.type == 'Hotel';
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: b.color.withValues(alpha: 0.3))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(width: 44, height: 44,
            decoration: BoxDecoration(color: b.color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12)),
            child: Icon(b.icon, color: b.color, size: 24)),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(b.type, style: TextStyle(color: b.color,
                fontSize: 11, fontWeight: FontWeight.w600)),
            Text(b.name, style: const TextStyle(color: AppColors.textDark,
                fontWeight: FontWeight.w800, fontSize: 14)),
          ])),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(20)),
            child: Text(b.status, style: const TextStyle(
                color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.w700))),
        ]),
        const SizedBox(height: 10),
        // Hotel: show check-in / check-out
        if (isHotel && (b.checkIn != null || b.checkOut != null)) ...[
          Row(children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: b.color.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: b.color.withValues(alpha: 0.25))),
              child: Row(children: [
                Icon(Icons.login_rounded, color: b.color, size: 12),
                const SizedBox(width: 4),
                Text('In: ${b.checkIn ?? 'TBD'}',
                    style: TextStyle(color: b.color, fontSize: 11, fontWeight: FontWeight.w600)),
              ])),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: b.color.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: b.color.withValues(alpha: 0.25))),
              child: Row(children: [
                Icon(Icons.logout_rounded, color: b.color, size: 12),
                const SizedBox(width: 4),
                Text('Out: ${b.checkOut ?? 'TBD'}',
                    style: TextStyle(color: b.color, fontSize: 11, fontWeight: FontWeight.w600)),
              ])),
            const Spacer(),
            Text('XAF ${b.price.toStringAsFixed(0)}',
              style: TextStyle(color: b.color, fontWeight: FontWeight.w900, fontSize: 15)),
          ]),
        ] else ...[
          Row(children: [
            if (b.destination.isNotEmpty) ...[
              const Icon(Icons.location_on_rounded, color: AppColors.textGrey, size: 13),
              const SizedBox(width: 4),
              Text(b.destination, style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
              const SizedBox(width: 10),
            ],
            const Icon(Icons.calendar_today_rounded, color: AppColors.textGrey, size: 13),
            const SizedBox(width: 4),
            Text(b.date, style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
            const Spacer(),
            Text('XAF ${b.price.toStringAsFixed(0)}',
              style: const TextStyle(color: AppColors.primary,
                  fontWeight: FontWeight.w900, fontSize: 15)),
          ]),
        ],
      ]));
  }

  // ── TAB 3: AI Traveo ──────────────────────────────────────────────────────
  Widget _aiTraveoTab() {
    return ListView(padding: const EdgeInsets.all(16), children: [
      // AI chat banner
      GestureDetector(
        onTap: () => Navigator.push(context,
            MaterialPageRoute(builder: (_) => const AIAssistantScreen())),
        child: Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF4F46E5), Color(0xFF7C3AED)],
              begin: Alignment.topLeft, end: Alignment.bottomRight),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [BoxShadow(
              color: const Color(0xFF4F46E5).withValues(alpha: 0.3),
              blurRadius: 16, offset: const Offset(0, 6))]),
          child: Row(children: [
            Container(width: 56, height: 56,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(16)),
              child: const Icon(Icons.smart_toy_rounded, color: Colors.white, size: 30)),
            const SizedBox(width: 16),
            const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Traveo AI Assistant', style: TextStyle(
                  color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16)),
              SizedBox(height: 4),
              Text('Chat with AI · Plan & create trips\nGet personalised travel advice',
                style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.4)),
            ])),
            Container(width: 40, height: 40,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15), shape: BoxShape.circle),
              child: const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 20)),
          ]))),

      // Quick links
      Row(children: [
        _aiQuickLink(Icons.add_location_alt_rounded, 'New Trip',
          const Color(0xFF1DB954), () => _openCreateTrip()),
        const SizedBox(width: 10),
        _aiQuickLink(Icons.group_rounded, 'Group Trip',
          const Color(0xFF8B5CF6), () => _openCreateGroupTrip()),
        const SizedBox(width: 10),
        _aiQuickLink(Icons.map_rounded, 'My Trips',
          AppColors.primary, () => _openFullTripPlanner()),
      ]),
      const SizedBox(height: 20),

      // Recent trips preview
      if (globalTrips.isNotEmpty) ...[
        Row(children: [
          Container(width: 3, height: 18,
            decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(2))),
          const SizedBox(width: 8),
          const Text('Recent Trips', style: TextStyle(
              color: AppColors.textDark, fontWeight: FontWeight.w800, fontSize: 15)),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(10)),
            child: Text('${globalTrips.length}', style: const TextStyle(
                color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.w700))),
        ]),
        const SizedBox(height: 12),
        ...globalTrips.take(3).map((t) => _aiRecentTripCard(t)),
        if (globalTrips.length > 3)
          GestureDetector(
            onTap: () => Navigator.push(context,
                MaterialPageRoute(builder: (_) => const AIAssistantScreen())),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 12),
              alignment: Alignment.center,
              child: Text('View all ${globalTrips.length} trips →',
                style: const TextStyle(color: AppColors.primary,
                    fontWeight: FontWeight.w700, fontSize: 13)))),
      ] else ...[
        Container(
          padding: const EdgeInsets.all(28),
          decoration: BoxDecoration(
            color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.5))),
          child: Column(children: [
            Icon(Icons.map_outlined, color: AppColors.primary.withValues(alpha: 0.3), size: 56),
            const SizedBox(height: 14),
            const Text('No trips planned yet', style: TextStyle(
                color: AppColors.textDark, fontWeight: FontWeight.w700, fontSize: 15)),
            const SizedBox(height: 6),
            const Text('Tap Traveo AI to create your first adventure',
                style: TextStyle(color: AppColors.textGrey, fontSize: 12),
                textAlign: TextAlign.center),
          ])),
      ],
    ]);
  }

  Widget _aiQuickLink(IconData icon, String label, Color color, VoidCallback onTap) {
    return Expanded(child: GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.2))),
        child: Column(children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 5),
          Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w700)),
        ]))));
  }

  void _openCreateTrip() {
    showModalBottomSheet(
      context: context, isScrollControlled: true, backgroundColor: Colors.transparent,
      builder: (_) => CreateTripTypeSheet(
        onTypeSelected: (type) {
          Navigator.pop(context);
          Navigator.push(context, MaterialPageRoute(
              builder: (_) => CreateTripFormScreen(type: type)))
              .then((_) => setState(() {}));
        }));
  }

  void _openCreateGroupTrip() {
    Navigator.push(context, MaterialPageRoute(
        builder: (_) => CreateTripFormScreen(type: TripType.group)))
        .then((_) => setState(() {}));
  }

  void _openFullTripPlanner() {
    Navigator.push(context, MaterialPageRoute(
        builder: (_) => Scaffold(
          backgroundColor: AppColors.bgDark,
          appBar: AppBar(
            backgroundColor: AppColors.bgCard,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white, size: 20),
              onPressed: () => Navigator.pop(context)),
            title: const Text('My Trips', style: TextStyle(
                color: Colors.white, fontWeight: FontWeight.w800, fontSize: 17))),
          body: const TripPlannerScreen())))
        .then((_) => setState(() {}));
  }

  Widget _aiRecentTripCard(TripPlan t) {
    final isGroup = t.type == TripType.group;
    final typeColor = isGroup ? const Color(0xFF8B5CF6) : AppColors.primary;
    return GestureDetector(
      onTap: () => Navigator.push(context,
          MaterialPageRoute(builder: (_) => TripDashboardScreen(trip: t)))
          .then((_) => setState(() {})),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.bgCard, borderRadius: BorderRadius.circular(14),
          border: Border.all(color: typeColor.withValues(alpha: 0.25))),
        child: Row(children: [
          Container(width: 42, height: 42,
            decoration: BoxDecoration(
              color: typeColor.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12)),
            child: Icon(isGroup ? Icons.group_rounded : Icons.person_rounded,
                color: typeColor, size: 22)),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(t.title, style: const TextStyle(
                color: AppColors.textDark, fontWeight: FontWeight.w800, fontSize: 13)),
            const SizedBox(height: 3),
            Row(children: [
              Icon(Icons.location_on_rounded, color: typeColor, size: 11),
              const SizedBox(width: 3),
              Text(t.destination, style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
            ]),
          ])),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text(t.dates, style: const TextStyle(color: AppColors.textGrey, fontSize: 10)),
            const SizedBox(height: 4),
            const Icon(Icons.arrow_forward_ios_rounded, color: AppColors.textGrey, size: 11),
          ]),
        ])));
  }
}

// ── New badge ────────────────────────────────────────────────────────────────
class _NewBadge extends StatelessWidget {
  const _NewBadge();
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
    decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(6)),
    child: const Text('NEW', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w900)));
}

// ── Pro messaging sheet (inlined from home_screen) ──────────────────────────
class _ServiceProMessageSheet extends StatefulWidget {
  final String proName, initials;
  final Color color;
  const _ServiceProMessageSheet({
      required this.proName, required this.initials, required this.color});
  @override State<_ServiceProMessageSheet> createState() =>
      _ServiceProMessageSheetState();
}

class _ServiceProMessageSheetState extends State<_ServiceProMessageSheet> {
  final _ctrl = TextEditingController();
  final List<Map<String, dynamic>> _msgs = [];
  bool _sent = false;

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  void _send() {
    final text = _ctrl.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _msgs.add({'from': 'user', 'text': text, 'time': _nowTime()});
      _ctrl.clear();
      _sent = true;
    });
    Future.delayed(const Duration(milliseconds: 1500), () {
      if (!mounted) return;
      setState(() {
        _msgs.add({'from': 'pro',
          'text': 'Thanks for reaching out! '
              'We will get back to you shortly regarding your enquiry.',
          'time': _nowTime()});
      });
    });
  }

  String _nowTime() {
    final now = DateTime.now();
    final h  = now.hour.toString().padLeft(2, '0');
    final mn = now.minute.toString().padLeft(2, '0');
    return '$h:$mn';
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.75),
        padding: const EdgeInsets.all(20),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(width: 40, height: 4,
            decoration: BoxDecoration(color: AppColors.cardBorder,
                borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 16),
          Row(children: [
            Container(width: 44, height: 44,
              decoration: BoxDecoration(
                  color: widget.color, shape: BoxShape.circle),
              child: Center(child: Text(widget.initials,
                style: const TextStyle(color: Colors.white,
                    fontSize: 14, fontWeight: FontWeight.w800)))),
            const SizedBox(width: 12),
            Expanded(child: Column(
              crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(widget.proName,
                style: const TextStyle(color: AppColors.textDark,
                    fontWeight: FontWeight.w800, fontSize: 15)),
              const Text('Pro Service Provider',
                style: TextStyle(color: AppColors.textGrey, fontSize: 11)),
            ])),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(12)),
              child: const Text('Online',
                style: TextStyle(color: AppColors.primary,
                    fontSize: 10, fontWeight: FontWeight.w700))),
          ]),
          const Divider(height: 20, color: AppColors.cardBorder),
          if (_msgs.isNotEmpty)
            Flexible(child: ListView.builder(
              shrinkWrap: true,
              padding: const EdgeInsets.only(bottom: 8),
              itemCount: _msgs.length,
              itemBuilder: (_, i) {
                final m = _msgs[i];
                final isUser = m['from'] == 'user';
                return Align(
                  alignment: isUser
                      ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 8),
                    constraints: BoxConstraints(
                        maxWidth:
                            MediaQuery.of(context).size.width * 0.7),
                    decoration: BoxDecoration(
                      color: isUser
                          ? AppColors.primary.withValues(alpha: 0.15)
                          : AppColors.bgCardMid,
                      borderRadius: BorderRadius.circular(14)),
                    child: Column(
                      crossAxisAlignment: isUser
                          ? CrossAxisAlignment.end
                          : CrossAxisAlignment.start,
                      children: [
                        Text(m['text'] as String,
                          style: const TextStyle(
                              color: AppColors.textDark, fontSize: 13)),
                        const SizedBox(height: 3),
                        Text(m['time'] as String,
                          style: const TextStyle(
                              color: AppColors.textGrey, fontSize: 9)),
                      ])));
              })),
          if (!_sent)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text(
                'Send a message to ${widget.proName} about their service',
                style: const TextStyle(
                    color: AppColors.textGrey, fontSize: 12),
                textAlign: TextAlign.center)),
          Row(children: [
            Expanded(child: Container(
              decoration: BoxDecoration(
                color: AppColors.bgCardMid,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppColors.cardBorder)),
              child: TextField(
                controller: _ctrl,
                style: const TextStyle(
                    color: AppColors.textDark, fontSize: 14),
                decoration: const InputDecoration(
                  hintText: 'Type a message…',
                  hintStyle: TextStyle(color: AppColors.textGrey),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(
                      horizontal: 16, vertical: 10),
                  isDense: true),
                onSubmitted: (_) => _send()))),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: _send,
              child: Container(
                width: 44, height: 44,
                decoration: const BoxDecoration(
                    color: AppColors.primary, shape: BoxShape.circle),
                child: const Icon(Icons.send_rounded,
                    color: Colors.white, size: 20))),
          ]),
        ])));
  }
}


// ── Service Detail Screen ─────────────────────────────────────────────────────
class ServiceDetailScreen extends StatefulWidget {
  final _Item item;
  final _Svc svc;
  final String proName, proInitials;
  final Color proColor;
  final VoidCallback onBook;
  final List<ListingMediaItem> mediaItems;

  const ServiceDetailScreen({
    super.key,
    required this.item,
    required this.svc,
    required this.proName,
    required this.proInitials,
    required this.proColor,
    required this.onBook,
    this.mediaItems = const [],
  });

  @override
  State<ServiceDetailScreen> createState() => _ServiceDetailScreenState();
}

class _ServiceDetailScreenState extends State<ServiceDetailScreen> {
  int _mediaIdx = 0;
  final _pageCtrl = PageController();

  _Item get item => widget.item;
  _Svc get svc => widget.svc;
  String get proName => widget.proName;
  String get proInitials => widget.proInitials;
  Color get proColor => widget.proColor;
  List<ListingMediaItem> get media => widget.mediaItems;

  @override
  void dispose() { _pageCtrl.dispose(); super.dispose(); }

  static final Map<String, Map<String, dynamic>> _details = {
    'Hilton Yaoundé': {
      'fullDesc': 'Experience world-class luxury at the Hilton Yaoundé, located in the heart of Cameroon\'s capital. The hotel features 289 elegantly furnished rooms and suites, two restaurants serving international and local cuisine, a fully-equipped fitness center, and a rooftop pool with panoramic city views. Business travelers will appreciate the executive lounge and state-of-the-art conference facilities. 24-hour room service and a dedicated concierge team ensure a flawless stay.',
      'highlights': ['289 rooms & suites', 'Rooftop pool', '2 restaurants', 'Fitness center', 'Conference halls', '24h room service'],
      'rating': 4.7, 'reviews': 312,
    },
    'Sawa Hotel Douala': {
      'fullDesc': 'Sawa Hotel sits right on the waterfront of Douala, offering breathtaking views of the Wouri estuary. Choose from 196 modern rooms, each with a private balcony overlooking the water. The hotel includes a spa, three dining options including a rooftop bar, two swimming pools, and a private marina. Perfect for both business and leisure travelers seeking premium comfort in Cameroon\'s economic capital.',
      'highlights': ['196 waterfront rooms', 'Private marina', 'Rooftop bar', 'Spa & wellness', '2 pools', 'Estuary views'],
      'rating': 4.4, 'reviews': 198,
    },
    'Limbe Beach Resort': {
      'fullDesc': 'Set against the dramatic backdrop of Mount Cameroon, Limbe Beach Resort offers direct access to the famous black volcanic sand beach. The eco-resort features 45 bungalows built with local materials, each steps from the ocean. Guests enjoy fresh seafood at the beachfront restaurant, kayaking, snorkeling, and guided hikes to the nearby Limbe Wildlife Centre. A truly unique African coastal experience.',
      'highlights': ['45 beach bungalows', 'Black sand beach', 'Snorkeling & kayaking', 'Seafood restaurant', 'Volcano views', 'Wildlife nearby'],
      'rating': 4.2, 'reviews': 145,
    },
    'Kribi Beach Day Guide & Experience': {
      'fullDesc': 'Join our expert guides for a full-day immersive beach experience along the pristine shores of Kribi. The package includes hotel pickup, a boat ride to the famous Lobé Waterfalls (one of the only waterfalls in the world that flows directly into the ocean), snorkeling in crystal-clear waters, a fresh seafood lunch at a local restaurant, and visits to pygmy villages. Everything is included — all you need to bring is sunscreen and your sense of adventure!',
      'highlights': ['Hotel pickup included', 'Lobé Waterfalls boat trip', 'Snorkeling gear provided', 'Seafood lunch', 'Pygmy village visit', 'English/French guide'],
      'rating': 4.8, 'reviews': 224,
    },
    'Yaoundé City Highlights': {
      'fullDesc': 'Discover the beating heart of Cameroon on this curated city tour led by a local expert. Visit the National Museum housing over 10,000 cultural artifacts, the vibrant Mvog-Betsi Zoo, the crafts market at Marché Artisanal, and enjoy a tasting at a local palm wine bar. Lunch is included at a traditional Cameroonian restaurant. The tour ends with a panoramic sunset view from Mont Fébé.',
      'highlights': ['National Museum', 'Mvog-Betsi Zoo', 'Artisan market', 'Traditional lunch', 'Palm wine tasting', 'Mont Fébé sunset'],
      'rating': 4.5, 'reviews': 189,
    },
    'Mount Cameroon Hike': {
      'fullDesc': 'West Africa\'s highest peak awaits! This 2-day guided ascent of Mount Cameroon (4,095m) is designed for adventurers with a good fitness level. Day 1 takes you through montane forest to Hut 2 at 2,850m. Day 2 is the summit push with panoramic views of the Gulf of Guinea on clear days. All camping gear, meals, experienced certified guides, and porters are included. Medical oxygen is carried as standard safety practice.',
      'highlights': ['2-day guided ascent', 'Certified mountain guides', 'All meals & camping gear', 'Porter service', 'Summit certificate', 'Medical oxygen carried'],
      'rating': 4.6, 'reviews': 87,
    },
    'Ngondo Festival VIP': {
      'fullDesc': 'The Ngondo Festival is the sacred water festival of the Sawa people of Douala, held annually on the Wouri River. Our VIP package gives you exclusive front-row access to the grand pirogue race, private seating at traditional ceremonies, a guided cultural briefing by a Sawa elder, and a VIP riverside dinner with local delicacies. Limited to 20 guests per package.',
      'highlights': ['Front-row pirogue race seats', 'Elder-guided cultural briefing', 'VIP riverside dinner', 'Costume rental', 'Professional photographer', 'Limited to 20 guests'],
      'rating': 4.9, 'reviews': 56,
    },
    'Waza Safari Jeep Tour': {
      'fullDesc': 'Embark on a full-day game drive through Waza National Park, home to lions, elephants, giraffes, and hippos. Your expert naturalist guide navigates 170,000 hectares in a 4WD safari vehicle. Package includes early departure from Maroua, picnic lunch in the park, and a sunset sundowner. Best wildlife sightings November–May.',
      'highlights': ['Experienced naturalist guide', '4WD safari vehicle', 'Lions, elephants, giraffes', 'Picnic lunch included', 'Sundowner drink', 'Best Nov–May season'],
      'rating': 4.8, 'reviews': 143,
    },
  };

  Map<String, dynamic> get _info => _details[item.name] ?? {
    'fullDesc': item.desc,
    'highlights': <String>[],
    'rating': 4.0,
    'reviews': 0,
  };

  @override
  Widget build(BuildContext context) {
    final info = _info;
    final highlights = info['highlights'] as List<String>;
    final rating = info['rating'] as double;
    final reviews = info['reviews'] as int;

    return Scaffold(
      backgroundColor: AppColors.bgDark,
      floatingActionButton: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: SizedBox(
          width: double.infinity,
          height: 54,
          child: ElevatedButton(
            onPressed: () { Navigator.pop(context); widget.onBook(); },
            style: ElevatedButton.styleFrom(
              backgroundColor: svc.color,
              elevation: 8,
              shadowColor: svc.color.withValues(alpha: 0.5),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))),
            child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
              const Icon(Icons.bookmark_add_rounded, color: Colors.white, size: 20),
              const SizedBox(width: 10),
              Text('Book ${svc.name} Now',
                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: Colors.white)),
            ])),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      body: CustomScrollView(slivers: [
        SliverToBoxAdapter(child: media.isNotEmpty ? _mediaGallery(context) : _heroBanner(context)),
        SliverToBoxAdapter(child: _infoSection(rating, reviews)),
        SliverToBoxAdapter(child: _descSection(info['fullDesc'] as String)),
        if (highlights.isNotEmpty) SliverToBoxAdapter(child: _highlightsSection(highlights)),
        SliverToBoxAdapter(child: _providerSection(context)),
        // Extra bottom padding so FAB doesn't cover content
        const SliverToBoxAdapter(child: SizedBox(height: 80)),
      ]),
    );
  }

  // ── Swipeable media gallery ─────────────────────────────────────────────
  Widget _mediaGallery(BuildContext context) {
    return SizedBox(
      height: 300,
      child: Stack(children: [
        PageView.builder(
          controller: _pageCtrl,
          itemCount: media.length,
          onPageChanged: (i) => setState(() => _mediaIdx = i),
          itemBuilder: (_, i) {
            final m = media[i];
            final isPhoto = m.type == ListingMediaType.photo;
            final List<Color> gradColors = isPhoto
                ? [svc.color.withValues(alpha: 0.7), svc.color.withValues(alpha: 0.25)]
                : [Colors.black87, const Color(0xFF0A1512)];
            return Stack(fit: StackFit.expand, children: [
              Container(decoration: BoxDecoration(gradient: LinearGradient(
                  begin: Alignment.topLeft, end: Alignment.bottomRight,
                  colors: gradColors))),
              Container(decoration: BoxDecoration(gradient: LinearGradient(
                  begin: Alignment.topCenter, end: Alignment.bottomCenter,
                  colors: [Colors.transparent, AppColors.bgDark]))),
              Center(child: Icon(
                isPhoto ? Icons.photo_rounded : Icons.play_circle_rounded,
                color: Colors.white.withValues(alpha: 0.13), size: 110)),
              if (!isPhoto)
                Center(child: Container(
                  width: 60, height: 60,
                  decoration: BoxDecoration(color: Colors.black54,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white54, width: 2)),
                  child: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 34))),
              Positioned(bottom: 50, left: 16,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(color: Colors.black54,
                    borderRadius: BorderRadius.circular(10)),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    Icon(isPhoto ? Icons.photo_rounded : Icons.videocam_rounded,
                        color: isPhoto ? const Color(0xFF7C3AED) : AppColors.primary, size: 12),
                    const SizedBox(width: 5),
                    Text(m.label, style: const TextStyle(color: Colors.white70,
                        fontSize: 10, fontWeight: FontWeight.w600)),
                  ]))),
            ]);
          }),

        // Back button + service badge
        SafeArea(child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
          child: Row(children: [
            GestureDetector(onTap: () => Navigator.pop(context),
              child: Container(width: 36, height: 36,
                decoration: BoxDecoration(color: Colors.black45,
                  borderRadius: BorderRadius.circular(10)),
                child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 18))),
            const Spacer(),
            Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(color: svc.color.withValues(alpha: 0.85),
                borderRadius: BorderRadius.circular(20)),
              child: Text(svc.name, style: const TextStyle(color: Colors.white,
                  fontSize: 11, fontWeight: FontWeight.w700))),
          ]))),

        // Dot indicators + counter
        Positioned(bottom: 14, left: 0, right: 0,
          child: Column(children: [
            Row(mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(media.length, (i) => AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                width: i == _mediaIdx ? 20 : 6, height: 6,
                margin: const EdgeInsets.symmetric(horizontal: 2),
                decoration: BoxDecoration(
                  color: i == _mediaIdx ? svc.color : Colors.white38,
                  borderRadius: BorderRadius.circular(3))))),
            const SizedBox(height: 4),
            Text('${_mediaIdx + 1} / ${media.length}',
              style: const TextStyle(color: Colors.white60, fontSize: 10)),
          ])),

        // Title + price overlay
        Positioned(bottom: 44, left: 16, right: 80,
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(item.name, style: const TextStyle(color: Colors.white,
                fontWeight: FontWeight.w900, fontSize: 20,
                shadows: [Shadow(blurRadius: 8, color: Colors.black54)])),
            const SizedBox(height: 4),
            Row(children: [
              const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 13),
              const SizedBox(width: 3),
              Text(item.location, style: const TextStyle(color: Colors.white70, fontSize: 12)),
              const Spacer(),
              Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(color: Colors.black54,
                  borderRadius: BorderRadius.circular(16)),
                child: Text('XAF ${item.price.toStringAsFixed(0)}',
                  style: TextStyle(color: svc.color,
                      fontWeight: FontWeight.w900, fontSize: 14))),
            ]),
          ])),

        // Swipe hint
        if (media.length > 1)
          Positioned(top: 60, right: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(color: Colors.black45,
                borderRadius: BorderRadius.circular(8)),
              child: const Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.swipe_rounded, color: Colors.white60, size: 12),
                SizedBox(width: 4),
                Text('Swipe', style: TextStyle(color: Colors.white60, fontSize: 10)),
              ]))),
      ]),
    );
  }

  // ── Static hero banner (shown when no media uploaded) ──────────────────
  Widget _heroBanner(BuildContext context) => Stack(children: [
    Container(height: 240, width: double.infinity,
      decoration: BoxDecoration(gradient: LinearGradient(
        begin: Alignment.topLeft, end: Alignment.bottomRight,
        colors: [svc.color.withValues(alpha: 0.7), svc.color.withValues(alpha: 0.3)]))),
    Container(height: 240, width: double.infinity,
      decoration: BoxDecoration(gradient: LinearGradient(
        begin: Alignment.topCenter, end: Alignment.bottomCenter,
        colors: [Colors.transparent, AppColors.bgDark]))),
    Center(child: Icon(svc.icon, color: Colors.white.withValues(alpha: 0.12), size: 140)),
    SafeArea(child: Padding(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
      child: Row(children: [
        GestureDetector(onTap: () => Navigator.pop(context),
          child: Container(width: 36, height: 36,
            decoration: BoxDecoration(color: Colors.black38, borderRadius: BorderRadius.circular(10)),
            child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 18))),
        const Spacer(),
        Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(color: svc.color.withValues(alpha: 0.85), borderRadius: BorderRadius.circular(20)),
          child: Text(svc.name, style: const TextStyle(color: Colors.white,
              fontSize: 11, fontWeight: FontWeight.w700))),
      ]))),
    Positioned(bottom: 16, left: 16, right: 16, child: Column(
      crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(item.name, style: const TextStyle(color: Colors.white,
          fontWeight: FontWeight.w900, fontSize: 22,
          shadows: [Shadow(blurRadius: 8, color: Colors.black54)])),
      const SizedBox(height: 6),
      Row(children: [
        const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 14),
        const SizedBox(width: 4),
        Text(item.location, style: const TextStyle(color: Colors.white70, fontSize: 13)),
        const Spacer(),
        Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(20)),
          child: Text('XAF ${item.price.toStringAsFixed(0)}',
            style: TextStyle(color: svc.color, fontWeight: FontWeight.w900, fontSize: 16))),
      ]),
    ])),
  ]);

  Widget _infoSection(double rating, int reviews) => Padding(
    padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
    child: Row(children: [
      ...List.generate(5, (i) => Icon(
        i < rating.floor() ? Icons.star_rounded
          : (i < rating && rating % 1 >= 0.5) ? Icons.star_half_rounded
          : Icons.star_outline_rounded,
        color: AppColors.amber, size: 18)),
      const SizedBox(width: 8),
      Text(rating.toStringAsFixed(1), style: const TextStyle(color: AppColors.amber,
          fontWeight: FontWeight.w700, fontSize: 14)),
      const SizedBox(width: 6),
      Text('($reviews reviews)', style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
    ]));

  Widget _descSection(String fullDesc) => Padding(
    padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Text('About', style: TextStyle(color: AppColors.textDark,
          fontWeight: FontWeight.w800, fontSize: 16)),
      const SizedBox(height: 10),
      Container(padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
        child: Text(fullDesc, style: const TextStyle(color: AppColors.textGrey,
            fontSize: 13, height: 1.6))),
    ]));

  Widget _highlightsSection(List<String> highlights) => Padding(
    padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Text('What\'s Included', style: TextStyle(color: AppColors.textDark,
          fontWeight: FontWeight.w800, fontSize: 16)),
      const SizedBox(height: 10),
      Container(padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
        child: Column(children: highlights.map((h) => Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Row(children: [
            Container(width: 22, height: 22,
              decoration: BoxDecoration(color: svc.color.withValues(alpha: 0.15),
                shape: BoxShape.circle),
              child: Icon(Icons.check_rounded, color: svc.color, size: 13)),
            const SizedBox(width: 10),
            Expanded(child: Text(h, style: const TextStyle(color: AppColors.textDark,
                fontSize: 13))),
          ]))).toList())),
    ]));

  Widget _providerSection(BuildContext context) => Padding(
    padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Text('Service Provider', style: TextStyle(color: AppColors.textDark,
          fontWeight: FontWeight.w800, fontSize: 16)),
      const SizedBox(height: 10),
      Container(padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
        child: Row(children: [
          Container(width: 48, height: 48,
            decoration: BoxDecoration(color: proColor, shape: BoxShape.circle,
              border: Border.all(color: Colors.white.withValues(alpha: 0.2), width: 2)),
            child: Center(child: Text(proInitials, style: const TextStyle(
                color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16)))),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Text(proName, style: const TextStyle(color: AppColors.textDark,
                  fontWeight: FontWeight.w800, fontSize: 14)),
              const SizedBox(width: 6),
              Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(6)),
                child: const Text('PRO', style: TextStyle(color: Colors.white,
                    fontSize: 8, fontWeight: FontWeight.w900))),
            ]),
            const Text('Verified Pro Service Provider',
              style: TextStyle(color: AppColors.textGrey, fontSize: 11)),
          ])),
          GestureDetector(
            onTap: () => _openProMsg(context),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.4))),
              child: const Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.chat_rounded, color: AppColors.primary, size: 14),
                SizedBox(width: 5),
                Text('Message', style: TextStyle(color: AppColors.primary,
                    fontWeight: FontWeight.w700, fontSize: 12)),
              ]))),
        ])),
    ]));

  Widget _bookButton(BuildContext context) => Padding(
    padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
    child: SizedBox(width: double.infinity, height: 54,
      child: ElevatedButton(
        onPressed: () { Navigator.pop(context); widget.onBook(); },
        style: ElevatedButton.styleFrom(backgroundColor: svc.color,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))),
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          const Icon(Icons.bookmark_add_rounded, color: Colors.white, size: 20),
          const SizedBox(width: 10),
          Text('Book ${svc.name} Now',
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: Colors.white)),
        ]))));

  void _openProMsg(BuildContext context) {
    showModalBottomSheet(
      context: context, isScrollControlled: true,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => _ServiceProMessageSheet(
          proName: proName, initials: proInitials, color: proColor));
  }
}
