import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../services/services_screen.dart' show globalServiceBookings, ServiceBooking;
import '../services/flight_booking_screen.dart' show FlightBooking, globalFlightBookings;
import '../services/bus_booking_screen.dart' show BusBooking, globalBusBookings, RideBookedDetailScreen;
import '../services/train_booking_screen.dart' show TrainBooking, globalTrainBookings;
import '../services/boat_booking_screen.dart' show BoatBooking, globalBoatBookings;
import '../wallet/wallet_state.dart';

// ── Media item for listings ────────────────────────────────────────────────
enum ListingMediaType { photo, video }

class ListingMediaItem {
  final String id;
  final ListingMediaType type;
  final String label; // simulated filename / caption
  ListingMediaItem({required this.id, required this.type, required this.label});
}

// ── Shared global listing store (admin sees these too) ─────────────────────
class ProListing {
  final String id;
  String title, location, description, category, date, price;
  String status; // 'Pending' | 'Approved' | 'Declined' | 'Completed'
  final IconData icon;
  final Color color;
  bool deletedByPro;
  List<ListingMediaItem> mediaItems;

  ProListing({
    required this.id, required this.title, required this.location,
    required this.description, required this.category, required this.date,
    required this.price, required this.status, required this.icon,
    required this.color, this.deletedByPro = false,
    List<ListingMediaItem>? mediaItems,
  }) : mediaItems = mediaItems ?? [];
}

// Global store — admin reads from here too
final List<ProListing> globalProListings = [
  ProListing(id:'l1', title:'Kribi Beach Guide & Experience', location:'Kribi, South Region',
    description:'Full-day guided beach experience including boat ride, seafood lunch and cultural walk.',
    category:'Guide & Experience', date:'Mar 15, 2026', price:'FCFA 120 / person',
    status:'Approved', icon:Icons.beach_access_rounded, color:const Color(0xFF065F46)),
  ProListing(id:'l2', title:'Mt Cameroon Hiking Package', location:'Buea, South West',
    description:'3-day guided hike with certified guides, camping gear, meals and certificates.',
    category:'Restaurant', date:'Mar 18, 2026', price:'FCFA 85 / person',
    status:'Pending', icon:Icons.terrain_rounded, color:const Color(0xFF1A3D6B)),
  ProListing(id:'l3', title:'Yaoundé City Guide & Experience', location:'Yaoundé, Centre',
    description:'Half-day cultural experience visiting monuments, museums and local markets.',
    category:'Culture', date:'Mar 14, 2026', price:'FCFA 65 / person',
    status:'Approved', icon:Icons.location_city_rounded, color:const Color(0xFF7C3AED)),
  ProListing(id:'l4', title:'Waza Safari Weekend', location:'Waza, Far North',
    description:'2-day wildlife safari with accommodation, meals and professional guide.',
    category:'Wildlife', date:'Jan 10, 2026', price:'FCFA 150 / person',
    status:'Completed', icon:Icons.forest_rounded, color:const Color(0xFF92400E)),
  ProListing(id:'l5', title:'Douala Food Experience', location:'Douala, Littoral',
    description:'Street food crawl through Akwa and Bonanjo districts with local food expert.',
    category:'Food', date:'Mar 22, 2026', price:'FCFA 55 / person',
    status:'Declined', icon:Icons.restaurant_rounded, color:const Color(0xFF9D174D)),
];

class BookingsProScreen extends StatefulWidget {
  const BookingsProScreen({super.key});
  @override State<BookingsProScreen> createState() => _BookingsProScreenState();
}

class _BookingsProScreenState extends State<BookingsProScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tab;

  List<ProListing> get _visible => globalProListings.where((l) => !l.deletedByPro).toList();
  List<ProListing> _filtered(String status) =>
    status == 'All' ? _visible : _visible.where((l) => l.status == status).toList();

  @override
  void initState() { super.initState(); _tab = TabController(length: 2, vsync: this); }
  @override
  void dispose() { _tab.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Column(children: [
        _header(),
        Container(color: AppColors.bgCard,
          child: TabBar(controller: _tab,
            indicatorColor: AppColors.primary, labelColor: AppColors.primary,
            unselectedLabelColor: AppColors.textGrey,
            labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
            tabs: const [
              Tab(text: 'My Listings'),
              Tab(text: 'My Bookings'),
            ])),
        Expanded(child: TabBarView(controller: _tab, children: [
          _listingsTab(),
          _myBookingsTab(),
        ])),
      ]),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _addListingSheet(context),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text('Add Listing', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700))),
    );
  }

  Widget _header() => Container(
    color: AppColors.bgDark,
    child: SafeArea(bottom: false, child: Padding(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
      child: Row(children: [
        GestureDetector(onTap: () => Navigator.pop(context),
          child: Container(width: 40, height: 40,
            decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder)),
            child: const Icon(Icons.arrow_back_rounded, color: AppColors.textDark, size: 20))),
        const SizedBox(width: 12),
        const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('My Listings & Bookings', style: TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w800, fontSize: 18)),
          Text('Manage your listings and bookings', style: TextStyle(color: AppColors.textGrey, fontSize: 11)),
        ])),
      ]))));

  Widget _summaryRow() {
    final pending  = _visible.where((l) => l.status == 'Pending').length;
    final approved = _visible.where((l) => l.status == 'Approved').length;
    final declined = _visible.where((l) => l.status == 'Declined').length;
    return Container(margin: const EdgeInsets.all(16), padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
      child: Column(children: [
        Row(children: [
          _stat('Pending',  '$pending',  Colors.orange),
          _vdiv(),
          _stat('Approved', '$approved', AppColors.primary),
          _vdiv(),
          _stat('Declined', '$declined', Colors.red),
        ]),
        const SizedBox(height: 12),
        Container(padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(color: Colors.orange.withValues(alpha: 0.07),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: Colors.orange.withValues(alpha: 0.25))),
          child: const Row(children: [
            Icon(Icons.admin_panel_settings_rounded, color: Colors.orange, size: 16),
            SizedBox(width: 8),
            Expanded(child: Text(
              'Listings are reviewed and approved by admins before going live to users.',
              style: TextStyle(color: Colors.orange, fontSize: 11, height: 1.4))),
          ])),
      ]));
  }

  Widget _stat(String label, String val, Color color) => Expanded(child: Column(children: [
    Text(val, style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 20)),
    const SizedBox(height: 3),
    Text(label, style: const TextStyle(color: AppColors.textGrey, fontSize: 10)),
  ]));
  Widget _vdiv() => Container(width: 1, height: 32, color: AppColors.cardBorder.withValues(alpha: 0.4));

  // ── Listings tab: filterable by status ───────────────────────────────────
  Widget _listingsTab() {
    return DefaultTabController(
      length: 5,
      child: Column(children: [
        _summaryRow(),
        Container(
          color: AppColors.bgCard,
          child: TabBar(
            isScrollable: true, tabAlignment: TabAlignment.start,
            indicatorColor: AppColors.primary, labelColor: AppColors.primary,
            unselectedLabelColor: AppColors.textGrey,
            labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 11),
            tabs: const [
              Tab(text: 'All'), Tab(text: 'Pending'),
              Tab(text: 'Approved'), Tab(text: 'Completed'), Tab(text: 'Declined'),
            ])),
        Expanded(child: TabBarView(children: [
          _list('All'), _list('Pending'), _list('Approved'),
          _list('Completed'), _list('Declined'),
        ])),
      ]),
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // MY BOOKINGS TAB — exact mirror of normal user ReservationScreen
  // ──────────────────────────────────────────────────────────────────────────
  static const _sampleBookings = [
    _SampleBooking(id:'b1', type:'Flight', from:'Yaoundé (NSI)', to:'Paris (CDG)',
      date:'March 15, 2026', status:'Confirmed', reference:'TRV-FL-2234',
      price:450.00, icon:Icons.airplanemode_active_rounded),
    _SampleBooking(id:'b2', type:'Train', from:'Douala', to:'Yaoundé',
      date:'March 20, 2026', status:'Confirmed', reference:'TRV-TR-0891',
      price:12.50, icon:Icons.train_rounded),
    _SampleBooking(id:'b4', type:'Flight', from:'Douala (DLA)', to:'Johannesburg (JNB)',
      date:'April 10, 2026', status:'Confirmed', reference:'TRV-FL-5567',
      price:620.00, icon:Icons.airplanemode_active_rounded),
  ];

  Widget _myBookingsTab() {
    final flightBookings = globalFlightBookings;
    final busBookings    = globalBusBookings;
    final trainBookings  = globalTrainBookings;
    final boatBookings   = globalBoatBookings;
    final svcBookings    = globalServiceBookings;

    final sampleFlights = _sampleBookings.where((b) => b.type == 'Flight').toList();
    final sampleTrains  = _sampleBookings.where((b) => b.type == 'Train').toList();

    final hotels      = svcBookings.where((b) => b.type == 'Hotel').toList();
    final restaurants = svcBookings.where((b) => b.type == 'Restaurant').toList();
    final events      = svcBookings.where((b) => b.type == 'Premium Event').toList();
    final tours       = svcBookings.where((b) => b.type == 'Guide & Experience').toList();
    final otherSvc    = svcBookings.where((b) =>
        b.type != 'Hotel' && b.type != 'Restaurant' &&
        b.type != 'Premium Event' && b.type != 'Guide & Experience' &&
        !b.type.startsWith('Trip') && b.type != 'Flight' &&
        !b.type.startsWith('Ride')).toList();

    final totalFlights   = flightBookings.length + sampleFlights.length;
    final totalRides     = busBookings.length;
    final totalTrains    = trainBookings.length + sampleTrains.length;
    final totalBoats     = boatBookings.length;
    final totalSvc       = svcBookings.length;
    final allCount       = totalFlights + totalRides + totalTrains + totalBoats + totalSvc;
    final confirmedCount = flightBookings.length + sampleFlights.length
        + busBookings.where((b) => b.status == 'Confirmed').length
        + trainBookings.where((b) => b.status == 'Confirmed').length
        + sampleTrains.length
        + boatBookings.where((b) => b.status == 'Confirmed').length
        + svcBookings.where((b) => b.status == 'Confirmed').length;

    return ListView(padding: const EdgeInsets.all(16), children: [
      Row(children: [
        _bkgStatCard('Total',     '$allCount',                    Icons.book_online_rounded,  AppColors.textGrey),
        const SizedBox(width: 10),
        _bkgStatCard('Confirmed', '$confirmedCount',              Icons.check_circle_rounded, AppColors.primary),
        const SizedBox(width: 10),
        _bkgStatCard('Pending',   '${allCount - confirmedCount}', Icons.pending_rounded,      Colors.orange),
      ]),
      const SizedBox(height: 20),

      if (allCount == 0) ...[
        const SizedBox(height: 40),
        Center(child: Column(children: [
          Icon(Icons.receipt_long_rounded,
              color: AppColors.textGrey.withValues(alpha: 0.3), size: 80),
          const SizedBox(height: 16),
          const Text('No trip bookings yet',
              style: TextStyle(color: AppColors.textGrey, fontSize: 16)),
          const SizedBox(height: 8),
          const Text('Book a flight, train, boat or ride to see them here',
              style: TextStyle(color: AppColors.textGrey, fontSize: 12)),
        ])),
      ],

      if (flightBookings.isNotEmpty || sampleFlights.isNotEmpty) ...[
        _bkgSectionHeader('Flights', Icons.airplanemode_active_rounded, AppColors.primary),
        const SizedBox(height: 12),
        ...flightBookings.map((b) => _proFlightCard(b)),
        ...sampleFlights.map((b) => _proSampleCard(b)),
        const SizedBox(height: 8),
      ],

      if (busBookings.isNotEmpty) ...[
        _bkgSectionHeader('Rides', Icons.local_taxi_rounded, const Color(0xFFFF9800)),
        const SizedBox(height: 12),
        ...busBookings.map((b) => _proBusCard(b)),
        const SizedBox(height: 8),
      ],

      if (trainBookings.isNotEmpty || sampleTrains.isNotEmpty) ...[
        _bkgSectionHeader('Trains', Icons.train_rounded, const Color(0xFF9C27B0)),
        const SizedBox(height: 12),
        ...trainBookings.map((b) => _proTrainCard(b)),
        ...sampleTrains.map((b) => _proSampleCard(b)),
        const SizedBox(height: 8),
      ],

      if (boatBookings.isNotEmpty) ...[
        _bkgSectionHeader('Boats', Icons.directions_boat_rounded, const Color(0xFF00BCD4)),
        const SizedBox(height: 12),
        ...boatBookings.map((b) => _proBoatCard(b)),
        const SizedBox(height: 8),
      ],

      if (hotels.isNotEmpty) ...[
        _bkgSectionHeader('Hotels', Icons.hotel_rounded, const Color(0xFF00ACC1)),
        const SizedBox(height: 10),
        ...hotels.map((b) => _userBookingCard(b)),
        const SizedBox(height: 8),
      ],
      if (restaurants.isNotEmpty) ...[
        _bkgSectionHeader('Restaurants', Icons.restaurant_rounded, const Color(0xFFE53935)),
        const SizedBox(height: 10),
        ...restaurants.map((b) => _userBookingCard(b)),
        const SizedBox(height: 8),
      ],
      if (events.isNotEmpty) ...[
        _bkgSectionHeader('Events', Icons.event_rounded, const Color(0xFFF5A623)),
        const SizedBox(height: 10),
        ...events.map((b) => _userBookingCard(b)),
        const SizedBox(height: 8),
      ],
      if (tours.isNotEmpty) ...[
        _bkgSectionHeader('Tours', Icons.tour_rounded, const Color(0xFF1DB954)),
        const SizedBox(height: 10),
        ...tours.map((b) => _userBookingCard(b)),
        const SizedBox(height: 8),
      ],
      if (otherSvc.isNotEmpty) ...[
        _bkgSectionHeader('Other', Icons.star_rounded, AppColors.primary),
        const SizedBox(height: 10),
        ...otherSvc.map((b) => _userBookingCard(b)),
      ],
    ]);
  }

  // ── _list: filterable listing view for the Listings tab ──────────────────
  Widget _list(String status) {
    final items = _filtered(status);
    if (items.isEmpty) {
      return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(Icons.inbox_rounded, color: AppColors.textGrey.withValues(alpha: 0.3), size: 64),
        const SizedBox(height: 12),
        Text('No $status listings', style: const TextStyle(color: AppColors.textGrey, fontSize: 14)),
      ]));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: items.length,
      itemBuilder: (_, i) => _listingCard(items[i]),
    );
  }

  // ── _bkgSectionHeader: coloured section label in bookings tab ─────────────
  Widget _bkgSectionHeader(String title, IconData icon, Color color) => Row(children: [
    Container(width: 32, height: 32,
      decoration: BoxDecoration(color: color.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
      child: Icon(icon, color: color, size: 18)),
    const SizedBox(width: 10),
    Text(title, style: TextStyle(color: color, fontWeight: FontWeight.w800, fontSize: 15)),
    const SizedBox(width: 8),
    Expanded(child: Container(height: 1, color: color.withValues(alpha: 0.2))),
  ]);

  // ── _userBookingCard: card for a ServiceBooking entry ─────────────────────
  Widget _userBookingCard(ServiceBooking b) {
    final color = b.status == 'Confirmed' ? AppColors.primary : Colors.orange;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.3))),
      child: Row(children: [
        Container(width: 44, height: 44,
          decoration: BoxDecoration(color: b.color.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(12)),
          child: Icon(b.icon, color: b.color, size: 24)),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(b.name, style: const TextStyle(
              color: AppColors.textDark, fontWeight: FontWeight.w700, fontSize: 14)),
          const SizedBox(height: 2),
          Text(b.destination, style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
          const SizedBox(height: 4),
          Row(children: [
            const Icon(Icons.calendar_today_rounded, color: AppColors.textGrey, size: 12),
            const SizedBox(width: 4),
            Text(b.date, style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
          ]),
        ])),
        const SizedBox(width: 8),
        Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(20)),
            child: Text(b.status, style: TextStyle(
                color: color, fontSize: 10, fontWeight: FontWeight.w700))),
          const SizedBox(height: 6),
          Text('FCFA ${b.price.toStringAsFixed(2)}',
              style: const TextStyle(color: AppColors.primary,
                  fontWeight: FontWeight.w800, fontSize: 13)),
        ]),
      ]));
  }

  Widget _bkgStatCard(String label, String value, IconData icon, Color color) =>
    Expanded(child: Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.5))),
      child: Column(children: [
        Icon(icon, color: color, size: 22),
        const SizedBox(height: 6),
        Text(value, style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 20)),
        Text(label, style: const TextStyle(color: AppColors.textGrey, fontSize: 10)),
      ])));

  Widget _detailRow(String label, String value) => Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: Row(children: [
      Text(label, style: const TextStyle(color: AppColors.textGrey, fontSize: 13)),
      const Spacer(),
      Text(value, style: const TextStyle(
          color: AppColors.textDark, fontSize: 13, fontWeight: FontWeight.w600)),
    ]));

  Widget _proSampleCard(_SampleBooking b) {
    final color = b.status == 'Confirmed' ? AppColors.primary : Colors.orange;
    return GestureDetector(
      onTap: () => _showProSampleDetail(context, b),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.3))),
        child: Column(children: [
          Row(children: [
            Container(width: 44, height: 44,
              decoration: BoxDecoration(color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12)),
              child: Icon(b.icon, color: color, size: 24)),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(b.type, style: const TextStyle(
                  color: AppColors.textGrey, fontSize: 11, fontWeight: FontWeight.w600)),
              Text('${b.from} → ${b.to}', style: const TextStyle(
                  color: AppColors.textDark, fontWeight: FontWeight.w800, fontSize: 14)),
            ])),
            Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(20)),
              child: Text(b.status, style: TextStyle(
                  color: color, fontSize: 11, fontWeight: FontWeight.w700))),
          ]),
          const SizedBox(height: 10),
          Row(children: [
            const Icon(Icons.calendar_today_rounded, color: AppColors.textGrey, size: 13),
            const SizedBox(width: 5),
            Text(b.date, style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
            const Spacer(),
            Text('Ref: ${b.reference}',
                style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
          ]),
          const SizedBox(height: 6),
          Row(mainAxisAlignment: MainAxisAlignment.end, children: [
            Text('FCFA ${b.price.toStringAsFixed(2)}',
                style: const TextStyle(color: AppColors.primary,
                    fontWeight: FontWeight.w900, fontSize: 16)),
          ]),
        ])));
  }

  void _showProSampleDetail(BuildContext ctx, _SampleBooking b) {
    showModalBottomSheet(context: ctx, isScrollControlled: true,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(width: 40, height: 4,
            decoration: BoxDecoration(color: AppColors.cardBorder, borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 20),
          Icon(b.icon, color: AppColors.primary, size: 40),
          const SizedBox(height: 12),
          Text('${b.from} → ${b.to}', style: const TextStyle(
              color: AppColors.textDark, fontWeight: FontWeight.w900, fontSize: 18),
              textAlign: TextAlign.center),
          const SizedBox(height: 20),
          _detailRow('Type', b.type),
          _detailRow('Date', b.date),
          _detailRow('Reference', b.reference),
          _detailRow('Status', b.status),
          _detailRow('Price', 'FCFA ${b.price.toStringAsFixed(2)}'),
          const SizedBox(height: 20),
          SizedBox(width: double.infinity, height: 50,
            child: ElevatedButton(onPressed: () => Navigator.pop(ctx),
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              child: const Text('Close',
                  style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)))),
          const SizedBox(height: 8),
        ])));
  }

  Widget _proFlightCard(FlightBooking b) => GestureDetector(
    onTap: () => _showProFlightDetail(context, b),
    child: Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.35))),
      child: Column(children: [
        Row(children: [
          Container(width: 44, height: 44,
            decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12)),
            child: const Icon(Icons.airplanemode_active_rounded, color: AppColors.primary, size: 24)),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Flight · ${b.classType}', style: const TextStyle(
                color: AppColors.textGrey, fontSize: 11, fontWeight: FontWeight.w600)),
            Text('${b.from} → ${b.to}', style: const TextStyle(
                color: AppColors.textDark, fontWeight: FontWeight.w800, fontSize: 14)),
          ])),
          Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(20)),
            child: const Text('Confirmed', style: TextStyle(
                color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.w700))),
        ]),
        const SizedBox(height: 10),
        Row(children: [
          const Icon(Icons.calendar_today_rounded, color: AppColors.textGrey, size: 13),
          const SizedBox(width: 5),
          Text(b.date, style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
          const Spacer(),
          Text('Ref: ${b.reference}',
              style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
        ]),
        const SizedBox(height: 6),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('${b.airline}  ·  ${b.flightNumber}',
              style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
          Text('FCFA ${b.price.toStringAsFixed(2)}',
              style: const TextStyle(color: AppColors.primary,
                  fontWeight: FontWeight.w900, fontSize: 16)),
        ]),
      ])));

  void _showProFlightDetail(BuildContext ctx, FlightBooking b) {
    showModalBottomSheet(context: ctx, isScrollControlled: true,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(children: [
          Container(width: 40, height: 4, margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(color: AppColors.cardBorder, borderRadius: BorderRadius.circular(2))),
          const Icon(Icons.airplanemode_active_rounded, color: AppColors.primary, size: 40),
          const SizedBox(height: 12),
          Text('${b.from} → ${b.to}', style: const TextStyle(
              color: AppColors.textDark, fontWeight: FontWeight.w900, fontSize: 18),
              textAlign: TextAlign.center),
          const SizedBox(height: 20),
          _detailRow('Airline', b.airline),
          _detailRow('Flight', b.flightNumber),
          _detailRow('Class', b.classType),
          _detailRow('Date', b.date),
          if (b.isRoundTrip) _detailRow('Return', b.returnDate),
          _detailRow('Departure', b.departure),
          _detailRow('Arrival', b.arrival),
          _detailRow('Passengers', '${b.passengers}'),
          _detailRow('Passenger', b.passengerName),
          _detailRow('Passport', b.passportNumber),
          _detailRow('Payment', b.paymentMethod),
          _detailRow('Reference', b.reference),
          _detailRow('Total', 'FCFA ${b.price.toStringAsFixed(2)}'),
          const SizedBox(height: 20),
          SizedBox(width: double.infinity, height: 50,
            child: ElevatedButton(onPressed: () => Navigator.pop(ctx),
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              child: const Text('Close',
                  style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)))),
          const SizedBox(height: 8),
        ])));
  }

  Widget _proBusCard(BusBooking b) {
    final isCancelled = b.status == 'Cancelled';
    final statusColor = isCancelled ? Colors.red : const Color(0xFF1DB954);
    return GestureDetector(
      onTap: () => isCancelled
          ? _showProBusDetail(context, b)
          : Navigator.push(context,
              MaterialPageRoute(builder: (_) => RideBookedDetailScreen(booking: b))),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isCancelled
              ? Colors.red.withValues(alpha: 0.35)
              : const Color(0xFFFF9800).withValues(alpha: 0.35))),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Container(width: 42, height: 42,
              decoration: BoxDecoration(
                color: const Color(0xFFFF9800).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.local_taxi_rounded, color: Color(0xFFFF9800), size: 22)),
            const SizedBox(width: 10),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Ride · ${b.category}', style: const TextStyle(
                  color: AppColors.textGrey, fontSize: 11, fontWeight: FontWeight.w600)),
              Text('${b.from} → ${b.to}', style: const TextStyle(
                  color: AppColors.textDark, fontWeight: FontWeight.w800, fontSize: 14),
                overflow: TextOverflow.ellipsis, maxLines: 1),
            ])),
            Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(20)),
              child: Text(b.status, style: TextStyle(
                  color: statusColor, fontSize: 10, fontWeight: FontWeight.w700))),
          ]),
          const SizedBox(height: 10),
          Row(children: [
            const Icon(Icons.calendar_today_rounded, color: AppColors.textGrey, size: 12),
            const SizedBox(width: 4),
            Flexible(child: Text(b.date,
                style: const TextStyle(color: AppColors.textGrey, fontSize: 11),
                overflow: TextOverflow.ellipsis)),
            const SizedBox(width: 8),
            const Icon(Icons.directions_car_rounded, color: AppColors.textGrey, size: 12),
            const SizedBox(width: 3),
            Flexible(child: Text(b.carType.split(' / ').first,
                style: const TextStyle(color: AppColors.textGrey, fontSize: 11),
                overflow: TextOverflow.ellipsis)),
            const Spacer(),
            Text('XAF ${b.price.toStringAsFixed(0)}',
                style: const TextStyle(color: Color(0xFFFF9800),
                    fontWeight: FontWeight.w900, fontSize: 14)),
          ]),
        ])));
  }

  void _showProBusDetail(BuildContext ctx, BusBooking b) {
    final isCancelled = b.status == 'Cancelled';
    showModalBottomSheet(context: ctx, isScrollControlled: true,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (sheetCtx) => StatefulBuilder(
        builder: (sbCtx, setSheetState) => Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Container(width: 40, height: 4,
              decoration: BoxDecoration(color: AppColors.cardBorder, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 20),
            const Icon(Icons.local_taxi_rounded, color: Color(0xFFFF9800), size: 40),
            const SizedBox(height: 12),
            Text('${b.from} → ${b.to}', style: const TextStyle(
                color: AppColors.textDark, fontWeight: FontWeight.w900, fontSize: 18),
                textAlign: TextAlign.center),
            const SizedBox(height: 4),
            Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: (isCancelled ? Colors.red : const Color(0xFF1DB954)).withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(20)),
              child: Text(b.status, style: TextStyle(
                  color: isCancelled ? Colors.red : const Color(0xFF1DB954),
                  fontSize: 12, fontWeight: FontWeight.w700))),
            const SizedBox(height: 20),
            _detailRow('Class', b.category),
            _detailRow('Car Type', b.carType),
            _detailRow('Date', b.date),
            _detailRow('Reference', b.reference),
            _detailRow('Est. Fare', 'XAF ${b.price.toStringAsFixed(0)}'),
            _detailRow('Payment', 'On arrival'),
            const SizedBox(height: 20),
            if (!isCancelled) ...[
              OutlinedButton.icon(
                onPressed: () => _proConfirmCancelRide(sbCtx, b, setSheetState),
                icon: const Icon(Icons.cancel_outlined, color: Colors.red, size: 18),
                label: const Text('Cancel Ride',
                    style: TextStyle(color: Colors.red, fontWeight: FontWeight.w700)),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 48),
                  side: const BorderSide(color: Colors.red),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)))),
              const SizedBox(height: 6),
              Text('Cancellation fee: 20% = XAF ${(b.price * 0.2).toStringAsFixed(0)}',
                style: TextStyle(color: Colors.red.withValues(alpha: 0.7), fontSize: 11)),
              const SizedBox(height: 12),
            ],
            SizedBox(width: double.infinity, height: 50,
              child: ElevatedButton(onPressed: () => Navigator.pop(sheetCtx),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFF9800),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                child: const Text('Close',
                    style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)))),
            const SizedBox(height: 8),
          ]))));
  }

  void _proConfirmCancelRide(BuildContext ctx, BusBooking b, StateSetter setSheetState) {
    final fee = b.price * 0.20;
    showDialog(context: ctx, builder: (_) => AlertDialog(
      backgroundColor: AppColors.bgCard,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: const Text('Cancel Ride?',
          style: TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w800)),
      content: Column(mainAxisSize: MainAxisSize.min, children: [
        const Text('Are you sure you want to cancel this ride?',
            style: TextStyle(color: AppColors.textGrey, fontSize: 14)),
        const SizedBox(height: 12),
        Container(padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: Colors.red.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: Colors.red.withValues(alpha: 0.3))),
          child: Row(children: [
            const Icon(Icons.warning_amber_rounded, color: Colors.red, size: 18),
            const SizedBox(width: 8),
            Expanded(child: Text(
              'XAF ${fee.toStringAsFixed(0)} (20%) will be deducted from your wallet.',
              style: const TextStyle(color: Colors.red, fontSize: 12))),
          ])),
      ]),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx),
          child: const Text('Keep Ride',
              style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700))),
        ElevatedButton(
          onPressed: () {
            Navigator.pop(ctx);
            walletBalance -= fee;
            walletTransactions.insert(0, {
              'type': 'debit', 'label': 'Ride cancellation fee',
              'amount': -fee, 'date': b.date, 'icon': 'send',
            });
            setSheetState(() => b.status = 'Cancelled');
            setState(() {});
          },
          style: ElevatedButton.styleFrom(backgroundColor: Colors.red,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
          child: const Text('Yes, Cancel',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700))),
      ]));
  }

  Widget _proTrainCard(TrainBooking b) {
    const color = Color(0xFF9C27B0);
    return GestureDetector(
      onTap: () => _showProTrainDetail(context, b),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.35))),
        child: Column(children: [
          Row(children: [
            Container(width: 44, height: 44,
              decoration: BoxDecoration(color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.train_rounded, color: color, size: 24)),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Train · ${b.classType}', style: const TextStyle(
                  color: AppColors.textGrey, fontSize: 11, fontWeight: FontWeight.w600)),
              Text('${b.from} → ${b.to}', style: const TextStyle(
                  color: AppColors.textDark, fontWeight: FontWeight.w800, fontSize: 14)),
            ])),
            Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(20)),
              child: Text(b.status, style: const TextStyle(
                  color: color, fontSize: 11, fontWeight: FontWeight.w700))),
          ]),
          const SizedBox(height: 10),
          Row(children: [
            const Icon(Icons.calendar_today_rounded, color: AppColors.textGrey, size: 13),
            const SizedBox(width: 5),
            Text(b.date, style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
            const Spacer(),
            Text('XAF ${b.price.toStringAsFixed(0)}',
                style: const TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 15)),
          ]),
        ])));
  }

  void _showProTrainDetail(BuildContext ctx, TrainBooking b) {
    showModalBottomSheet(context: ctx, isScrollControlled: true,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(children: [
          Container(width: 40, height: 4, margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(color: AppColors.cardBorder, borderRadius: BorderRadius.circular(2))),
          const Icon(Icons.train_rounded, color: Color(0xFF9C27B0), size: 40),
          const SizedBox(height: 12),
          Text('${b.from} → ${b.to}', style: const TextStyle(
              color: AppColors.textDark, fontWeight: FontWeight.w900, fontSize: 18),
              textAlign: TextAlign.center),
          const SizedBox(height: 20),
          _detailRow('Operator', b.operator),
          _detailRow('Train', b.trainNumber),
          _detailRow('Class', b.classType),
          _detailRow('Date', b.date),
          if (b.isRoundTrip) _detailRow('Return', b.returnDate),
          _detailRow('Departure', b.departure),
          _detailRow('Arrival', b.arrival),
          _detailRow('Passengers', '${b.passengers}'),
          _detailRow('Passenger', b.passengerName),
          _detailRow('Reference', b.reference),
          _detailRow('Total', 'XAF ${b.price.toStringAsFixed(0)}'),
          const SizedBox(height: 20),
          SizedBox(width: double.infinity, height: 50,
            child: ElevatedButton(onPressed: () => Navigator.pop(ctx),
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF9C27B0),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              child: const Text('Close',
                  style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)))),
          const SizedBox(height: 8),
        ])));
  }

  Widget _proBoatCard(BoatBooking b) {
    const color = Color(0xFF00BCD4);
    return GestureDetector(
      onTap: () => _showProBoatDetail(context, b),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.35))),
        child: Column(children: [
          Row(children: [
            Container(width: 44, height: 44,
              decoration: BoxDecoration(color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.directions_boat_rounded, color: color, size: 24)),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Boat · ${b.category}', style: const TextStyle(
                  color: AppColors.textGrey, fontSize: 11, fontWeight: FontWeight.w600)),
              Text('${b.from} → ${b.to}', style: const TextStyle(
                  color: AppColors.textDark, fontWeight: FontWeight.w800, fontSize: 14)),
            ])),
            Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(20)),
              child: Text(b.status, style: const TextStyle(
                  color: color, fontSize: 11, fontWeight: FontWeight.w700))),
          ]),
          const SizedBox(height: 10),
          Row(children: [
            const Icon(Icons.calendar_today_rounded, color: AppColors.textGrey, size: 13),
            const SizedBox(width: 5),
            Text(b.date, style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
            const Spacer(),
            Text('XAF ${b.price.toStringAsFixed(0)}',
                style: const TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 15)),
          ]),
        ])));
  }

  void _showProBoatDetail(BuildContext ctx, BoatBooking b) {
    showModalBottomSheet(context: ctx, isScrollControlled: true,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(children: [
          Container(width: 40, height: 4, margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(color: AppColors.cardBorder, borderRadius: BorderRadius.circular(2))),
          const Icon(Icons.directions_boat_rounded, color: Color(0xFF00BCD4), size: 40),
          const SizedBox(height: 12),
          Text('${b.from} → ${b.to}', style: const TextStyle(
              color: AppColors.textDark, fontWeight: FontWeight.w900, fontSize: 18),
              textAlign: TextAlign.center),
          const SizedBox(height: 20),
          _detailRow('Company', b.company),
          _detailRow('Class', b.category),
          _detailRow('Date', b.date),
          _detailRow('Departure', b.departure),
          _detailRow('Arrival', b.arrival),
          _detailRow('Passengers', '${b.passengers}'),
          _detailRow('Passenger', b.passengerName),
          _detailRow('Seats', b.seats.join(', ')),
          _detailRow('Reference', b.reference),
          _detailRow('Total', 'XAF ${b.price.toStringAsFixed(0)}'),
          const SizedBox(height: 20),
          SizedBox(width: double.infinity, height: 50,
            child: ElevatedButton(onPressed: () => Navigator.pop(ctx),
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00BCD4),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              child: const Text('Close',
                  style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)))),
          const SizedBox(height: 8),
        ])));
  }

  Widget _listingCard(ProListing l) {
    Color sc = l.status == 'Approved'  ? AppColors.primary
      : l.status == 'Pending'   ? Colors.orange
      : l.status == 'Completed' ? Colors.green
      : Colors.red;
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: sc.withValues(alpha: 0.2))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // Color band at top
        Container(height: 6, decoration: BoxDecoration(
          color: sc, borderRadius: const BorderRadius.vertical(top: Radius.circular(16)))),
        Padding(padding: const EdgeInsets.all(14), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Container(width: 48, height: 48,
              decoration: BoxDecoration(color: l.color.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
              child: Icon(l.icon, color: l.color, size: 24)),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(l.title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14)),
              const SizedBox(height: 2),
              Row(children: [
                const Icon(Icons.location_on_rounded, color: AppColors.textGrey, size: 12),
                const SizedBox(width: 2),
                Text(l.location, style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
              ]),
            ])),
            Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: sc.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(20)),
              child: Text(l.status, style: TextStyle(color: sc, fontSize: 10, fontWeight: FontWeight.w700))),
          ]),
          const SizedBox(height: 10),
          Text(l.description, maxLines: 2, overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: AppColors.textGrey, fontSize: 12, height: 1.4)),
          const SizedBox(height: 10),
          Row(children: [
            _chip(Icons.calendar_today_rounded, l.date),
            const SizedBox(width: 10),
            _chip(Icons.attach_money_rounded, l.price),
            const SizedBox(width: 10),
            _chip(Icons.category_rounded, l.category),
            if (l.mediaItems.isNotEmpty) ...[
              const SizedBox(width: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF7C3AED).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF7C3AED).withValues(alpha: 0.3))),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  const Icon(Icons.perm_media_rounded, color: Color(0xFF7C3AED), size: 11),
                  const SizedBox(width: 3),
                  Text('${l.mediaItems.length}', style: const TextStyle(
                      color: Color(0xFF7C3AED), fontSize: 10, fontWeight: FontWeight.w700)),
                ])),
            ],
          ]),

          // Status-specific info
          if (l.status == 'Pending') ...[
            const SizedBox(height: 12),
            Container(padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: Colors.orange.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.orange.withValues(alpha: 0.25))),
              child: const Row(children: [
                Icon(Icons.hourglass_top_rounded, color: Colors.orange, size: 15),
                SizedBox(width: 8),
                Text('Awaiting admin review', style: TextStyle(color: Colors.orange, fontSize: 12)),
              ])),
          ],
          if (l.status == 'Declined') ...[
            const SizedBox(height: 12),
            Container(padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: Colors.red.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.red.withValues(alpha: 0.25))),
              child: const Row(children: [
                Icon(Icons.info_outline_rounded, color: Colors.red, size: 15),
                SizedBox(width: 8),
                Expanded(child: Text('Declined by admin. Edit and resubmit.',
                  style: TextStyle(color: Colors.red, fontSize: 12))),
              ])),
          ],

          // Actions row
          const SizedBox(height: 12),
          Row(children: [
            if (l.status != 'Completed' && l.status != 'Declined') ...[ 
              _actionBtn('Edit', Colors.blue, () => _editListingSheet(context, l)),
              const SizedBox(width: 8),
            ],
            if (l.status == 'Approved') ...[ 
              _actionBtn('Complete', AppColors.primary, () => _markComplete(l)),
              const SizedBox(width: 8),
              _actionBtn('Cancel', Colors.orange, () => _cancelListing(l)),
              const SizedBox(width: 8),
            ],
            _actionBtn('Delete', Colors.red, () => _confirmDelete(l)),
          ]),
        ])),
      ]));
  }

  Widget _chip(IconData icon, String label) => Row(mainAxisSize: MainAxisSize.min, children: [
    Icon(icon, color: AppColors.textGrey, size: 12),
    const SizedBox(width: 3),
    Text(label, style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
  ]);

  Widget _actionBtn(String label, Color color, VoidCallback onTap) =>
    GestureDetector(onTap: onTap,
      child: Container(height: 32, padding: const EdgeInsets.symmetric(horizontal: 14),
        decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color.withValues(alpha: 0.3))),
        child: Center(child: Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 12)))));

  void _markComplete(ProListing l) {
    showDialog(context: context, builder: (_) => AlertDialog(
      backgroundColor: AppColors.bgCard,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: const Text('Mark as Completed?',
          style: TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w800)),
      content: Text('Mark "${l.title}" as completed? This cannot be undone.',
          style: const TextStyle(color: AppColors.textGrey, fontSize: 13)),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context),
          child: const Text('Cancel', style: TextStyle(color: AppColors.textGrey))),
        ElevatedButton(
          onPressed: () {
            setState(() => l.status = 'Completed');
            Navigator.pop(context);
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
              content: Text('"${l.title}" marked as completed!'),
              backgroundColor: AppColors.bgCard));
          },
          style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
          child: const Text('Confirm', style: TextStyle(color: Colors.white))),
      ]));
  }

  void _cancelListing(ProListing l) {
    showDialog(context: context, builder: (_) => AlertDialog(
      backgroundColor: AppColors.bgCard,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: const Text('Cancel Listing?',
          style: TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w800)),
      content: Text('Cancel "${l.title}"? Users will be notified.',
          style: const TextStyle(color: AppColors.textGrey, fontSize: 13)),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context),
          child: const Text('Keep', style: TextStyle(color: AppColors.textGrey))),
        ElevatedButton(
          onPressed: () {
            setState(() => l.status = 'Declined');
            Navigator.pop(context);
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
              content: Text('"${l.title}" has been cancelled.'),
              backgroundColor: Colors.orange));
          },
          style: ElevatedButton.styleFrom(backgroundColor: Colors.orange,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
          child: const Text('Cancel Listing', style: TextStyle(color: Colors.white))),
      ]));
  }

  void _confirmDelete(ProListing l) {
    showDialog(context: context, builder: (_) => AlertDialog(
      backgroundColor: AppColors.bgCard,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: const Text('Delete Listing', style: TextStyle(color: Colors.white)),
      content: Text('Delete "${l.title}"? Admins will no longer see this listing.',
        style: const TextStyle(color: AppColors.textGrey)),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context),
          child: const Text('Cancel', style: TextStyle(color: AppColors.textGrey))),
        TextButton(onPressed: () {
          setState(() => l.deletedByPro = true);
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Listing removed'), backgroundColor: AppColors.bgCard));
        }, child: const Text('Delete', style: TextStyle(color: Colors.red))),
      ]));
  }

  // ── Add new listing ──────────────────────────────────────────────────────
  void _addListingSheet(BuildContext ctx) {
    final tc = TextEditingController();
    final lc = TextEditingController();
    final dc = TextEditingController();
    final pc = TextEditingController();
    String cat = 'Guide & Experience';
    final cats = ['Guide & Experience','Restaurant','Culture','Food','Wildlife','Hotel','Transport'];
    final List<ListingMediaItem> mediaItems = [];

    showModalBottomSheet(context: ctx, isScrollControlled: true, backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (bsCtx) => StatefulBuilder(builder: (bsCtx, setBS) {
        void addMedia(ListingMediaType type) {
          final photos = ['kribi_beach.jpg','yaoundé_market.jpg','mount_cam.jpg','waza_safari.jpg','limbe.jpg'];
          final videos = ['experience_tour.mp4','guide_intro.mp4','highlights.mp4'];
          final idx = mediaItems.where((m) => m.type == type).length;
          if (type == ListingMediaType.photo && idx >= 8) return;
          if (type == ListingMediaType.video && idx >= 3) return;
          final list = type == ListingMediaType.photo ? photos : videos;
          setBS(() => mediaItems.add(ListingMediaItem(
            id: '${DateTime.now().millisecondsSinceEpoch}',
            type: type, label: list[idx % list.length])));
        }
        return Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom + 24, left: 24, right: 24, top: 24),
          child: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              const Text('Add New Listing', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 18)),
              const Spacer(),
              GestureDetector(onTap: () => Navigator.pop(bsCtx),
                child: const Icon(Icons.close_rounded, color: AppColors.textGrey)),
            ]),
            const SizedBox(height: 4),
            const Text('Will be submitted to admins for review',
              style: TextStyle(color: AppColors.textGrey, fontSize: 12)),
            const SizedBox(height: 20),
            _sheetField('Service Title', tc),
            _sheetField('Location', lc),
            _sheetField('Price (e.g. FCFA 120 / person)', pc),
            _sheetField('Description', dc, lines: 3),
            const Text('Category', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13)),
            const SizedBox(height: 8),
            SingleChildScrollView(scrollDirection: Axis.horizontal,
              child: Row(children: cats.map((c) => GestureDetector(onTap: () => setBS(() => cat = c),
                child: Container(margin: const EdgeInsets.only(right: 8, bottom: 16),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                  decoration: BoxDecoration(
                    color: cat == c ? AppColors.primary : AppColors.bgDark,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: cat == c ? AppColors.primary : AppColors.cardBorder)),
                  child: Text(c, style: TextStyle(color: cat == c ? Colors.white : AppColors.textGrey,
                      fontSize: 12, fontWeight: FontWeight.w600))))).toList())),
            const Divider(color: AppColors.cardBorder),
            const SizedBox(height: 8),
            Row(children: [
              const Icon(Icons.perm_media_rounded, color: AppColors.primary, size: 16),
              const SizedBox(width: 8),
              const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Photos & Videos', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
                Text('Help travelers see your service (up to 8 photos, 3 videos)',
                  style: TextStyle(color: AppColors.textGrey, fontSize: 10)),
              ])),
            ]),
            const SizedBox(height: 10),
            Row(children: [
              Expanded(child: GestureDetector(
                onTap: () => addMedia(ListingMediaType.photo),
                child: Container(padding: const EdgeInsets.symmetric(vertical: 11),
                  decoration: BoxDecoration(
                    color: const Color(0xFF7C3AED).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF7C3AED).withValues(alpha: 0.4))),
                  child: const Column(children: [
                    Icon(Icons.add_photo_alternate_rounded, color: Color(0xFF7C3AED), size: 20),
                    SizedBox(height: 3),
                    Text('Add Photo', style: TextStyle(color: Color(0xFF7C3AED), fontWeight: FontWeight.w700, fontSize: 11)),
                  ])))),
              const SizedBox(width: 10),
              Expanded(child: GestureDetector(
                onTap: () => addMedia(ListingMediaType.video),
                child: Container(padding: const EdgeInsets.symmetric(vertical: 11),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.primary.withValues(alpha: 0.4))),
                  child: const Column(children: [
                    Icon(Icons.videocam_rounded, color: AppColors.primary, size: 20),
                    SizedBox(height: 3),
                    Text('Add Video', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 11)),
                  ])))),
            ]),
            if (mediaItems.isNotEmpty) ...[
              const SizedBox(height: 10),
              SizedBox(height: 82,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: mediaItems.length,
                  itemBuilder: (_, i) {
                    final m = mediaItems[i];
                    final isPhoto = m.type == ListingMediaType.photo;
                    final col = isPhoto ? const Color(0xFF7C3AED) : AppColors.primary;
                    return Stack(children: [
                      Container(width: 74, height: 74, margin: const EdgeInsets.only(right: 8),
                        decoration: BoxDecoration(color: col.withValues(alpha: 0.14),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: col.withValues(alpha: 0.4))),
                        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                          Icon(isPhoto ? Icons.photo_rounded : Icons.play_circle_rounded, color: col, size: 24),
                          const SizedBox(height: 3),
                          Text(m.label.length > 10 ? '${m.label.substring(0,10)}…' : m.label,
                            style: const TextStyle(color: AppColors.textGrey, fontSize: 8), textAlign: TextAlign.center),
                        ])),
                      Positioned(top: 0, right: 7,
                        child: GestureDetector(onTap: () => setBS(() => mediaItems.removeAt(i)),
                          child: Container(width: 15, height: 15,
                            decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                            child: const Icon(Icons.close_rounded, color: Colors.white, size: 9)))),
                    ]);
                  })),
              Text('${mediaItems.where((m) => m.type == ListingMediaType.photo).length} photos · ' +
                  '${mediaItems.where((m) => m.type == ListingMediaType.video).length} videos added',
                style: const TextStyle(color: AppColors.textGrey, fontSize: 10)),
            ],
            const SizedBox(height: 16),
            SizedBox(width: double.infinity, height: 48,
              child: ElevatedButton(
                onPressed: () {
                  if (tc.text.isEmpty || lc.text.isEmpty) return;
                  setState(() {
                    globalProListings.add(ProListing(
                      id: 'l${DateTime.now().millisecondsSinceEpoch}',
                      title: tc.text, location: lc.text,
                      description: dc.text.isEmpty ? 'No description provided.' : dc.text,
                      category: cat, date: 'Mar 26, 2026',
                      price: pc.text.isEmpty ? 'TBD' : pc.text,
                      status: 'Pending', icon: _catIcon(cat), color: _catColor(cat),
                      mediaItems: List.from(mediaItems)));
                  });
                  Navigator.pop(bsCtx);
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                    content: Text('Listing submitted! Awaiting admin approval.'),
                    backgroundColor: AppColors.bgCard));
                },
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                child: const Text('Submit for Approval', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)))),
            const SizedBox(height: 8),
          ])));
      }));
  }

  // ── Edit listing ──────────────────────────────────────────────────────────
  void _editListingSheet(BuildContext ctx, ProListing l) {
    final tc = TextEditingController(text: l.title);
    final lc = TextEditingController(text: l.location);
    final dc = TextEditingController(text: l.description);
    final pc = TextEditingController(text: l.price);

    showModalBottomSheet(context: ctx, isScrollControlled: true, backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom + 24, left: 24, right: 24, top: 24),
        child: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            const Text('Edit Listing', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 18)),
            const Spacer(),
            GestureDetector(onTap: () => Navigator.pop(ctx),
              child: const Icon(Icons.close_rounded, color: AppColors.textGrey)),
          ]),
          const SizedBox(height: 20),
          _sheetField('Title', tc), _sheetField('Location', lc),
          _sheetField('Price', pc), _sheetField('Description', dc, lines: 3),
          const SizedBox(height: 4),
          SizedBox(width: double.infinity, height: 48,
            child: ElevatedButton(onPressed: () {
              setState(() {
                l.title = tc.text;
                l.location = lc.text;
                l.description = dc.text;
                l.price = pc.text;
                if (l.status == 'Declined') l.status = 'Pending'; // resubmit
              });
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                content: Text('Changes saved. Resubmitted for review.'),
                backgroundColor: AppColors.bgCard));
            }, style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              child: const Text('Save Changes', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)))),
          const SizedBox(height: 8),
        ]))));
  }

  // ── Set availability ──────────────────────────────────────────────────────
  void _availabilitySheet(BuildContext ctx, ProListing l) {
    final dates = ['Mar 15', 'Mar 16', 'Mar 22', 'Mar 23', 'Mar 29', 'Mar 30', 'Apr 5', 'Apr 6'];
    final selected = <String>{l.date.split(',')[0]};

    showModalBottomSheet(context: ctx, isScrollControlled: true, backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => StatefulBuilder(builder: (bsCtx, setBS) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom + 24, left: 24, right: 24, top: 24),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Set Availability', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 18)),
          const SizedBox(height: 6),
          const Text('Select available dates for this service',
            style: TextStyle(color: AppColors.textGrey, fontSize: 12)),
          const SizedBox(height: 20),
          Wrap(spacing: 10, runSpacing: 10,
            children: dates.map((d) {
              final on = selected.contains(d);
              return GestureDetector(onTap: () => setBS(() => on ? selected.remove(d) : selected.add(d)),
                child: Container(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: on ? AppColors.primary : AppColors.bgDark,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: on ? AppColors.primary : AppColors.cardBorder)),
                  child: Text(d, style: TextStyle(
                    color: on ? Colors.white : AppColors.textGrey, fontWeight: FontWeight.w600, fontSize: 13))));
            }).toList()),
          const SizedBox(height: 20),
          SizedBox(width: double.infinity, height: 48,
            child: ElevatedButton(onPressed: () {
              Navigator.pop(bsCtx);
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                content: Text('Availability updated!'), backgroundColor: AppColors.bgCard));
            }, style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              child: const Text('Save Availability', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)))),
          const SizedBox(height: 8),
        ]))));
  }

  // ── Update pricing ────────────────────────────────────────────────────────
  void _pricingSheet(BuildContext ctx, ProListing l) {
    final pc   = TextEditingController(text: l.price.replaceAll(RegExp(r'[^\d.]'), ''));
    final grpc = TextEditingController();
    final vip  = TextEditingController();

    showModalBottomSheet(context: ctx, isScrollControlled: true, backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom + 24, left: 24, right: 24, top: 24),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Update Pricing', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 18)),
          const SizedBox(height: 20),
          _sheetField('Standard Price (FCFA)', pc),
          _sheetField('Group Price (10+ people)', grpc),
          _sheetField('VIP / Premium Price', vip),
          const SizedBox(height: 8),
          Container(padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: Colors.orange.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.orange.withValues(alpha: 0.25))),
            child: const Row(children: [
              Icon(Icons.info_outline_rounded, color: Colors.orange, size: 15),
              SizedBox(width: 8),
              Expanded(child: Text('Price changes are subject to admin review.',
                style: TextStyle(color: Colors.orange, fontSize: 12))),
            ])),
          const SizedBox(height: 16),
          SizedBox(width: double.infinity, height: 48,
            child: ElevatedButton(onPressed: () {
              setState(() {
                if (pc.text.isNotEmpty) l.price = 'FCFA ${pc.text} / person';
              });
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                content: Text('Pricing updated!'), backgroundColor: AppColors.bgCard));
            }, style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              child: const Text('Save Pricing', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)))),
          const SizedBox(height: 8),
        ])));
  }

  Widget _sheetField(String hint, TextEditingController ctrl, {int lines = 1}) => Container(
    margin: const EdgeInsets.only(bottom: 14),
    decoration: BoxDecoration(color: AppColors.bgDark, borderRadius: BorderRadius.circular(12),
      border: Border.all(color: AppColors.cardBorder)),
    child: TextField(controller: ctrl, maxLines: lines,
      style: const TextStyle(color: Colors.white, fontSize: 14),
      decoration: InputDecoration(hintText: hint, hintStyle: const TextStyle(color: AppColors.textGrey),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        border: InputBorder.none)));

  IconData _catIcon(String cat) {
    switch(cat) {
      case 'Restaurant': return Icons.restaurant_rounded;
      case 'Culture':   return Icons.museum_rounded;
      case 'Food':      return Icons.restaurant_rounded;
      case 'Wildlife':  return Icons.forest_rounded;
      case 'Hotel':     return Icons.hotel_rounded;
      case 'Transport': return Icons.directions_car_rounded;
      default:          return Icons.hiking_rounded;
    }
  }

  Color _catColor(String cat) {
    switch(cat) {
      case 'Restaurant': return const Color(0xFFE53935);
      case 'Culture':   return const Color(0xFF7C3AED);
      case 'Food':      return const Color(0xFF9D174D);
      case 'Wildlife':  return const Color(0xFF92400E);
      case 'Hotel':     return const Color(0xFF065F46);
      case 'Transport': return const Color(0xFF374151);
      default:          return const Color(0xFF1E3A5F);
    }
  }
}

// ── Lightweight sample booking model (pre-loaded data) ────────────────────
class _SampleBooking {
  final String id, type, from, to, date, status, reference;
  final double price;
  final IconData icon;
  const _SampleBooking({
    required this.id, required this.type, required this.from,
    required this.to, required this.date, required this.status,
    required this.reference, required this.price, required this.icon,
  });
}
