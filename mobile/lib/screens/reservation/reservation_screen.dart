import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../widgets/common_widgets.dart';
import '../pro/notifications_screen.dart';
import '../wallet/wallet_screen.dart';
import '../pro/ai_assistant_screen.dart';
import '../services/flight_booking_screen.dart';
import '../services/bus_booking_screen.dart';
import '../services/train_booking_screen.dart';
import '../services/boat_booking_screen.dart';
import '../wallet/wallet_state.dart';
import '../main_nav_screen.dart';
import 'trip_planner_screen.dart';

// ── Data models ────────────────────────────────────────────────────────────
class Booking {
  final String id, type, from, to, date, status, reference;
  final double price;
  final IconData icon;
  const Booking({required this.id, required this.type, required this.from,
      required this.to, required this.date, required this.status,
      required this.reference, required this.price, required this.icon});
}

const _sampleBookings = [
  Booking(id:'b1', type:'Flight', from:'Yaoundé (NSI)', to:'Paris (CDG)',
    date:'March 15, 2026', status:'Confirmed', reference:'TRV-FL-2234',
    price:450.00, icon:Icons.airplanemode_active_rounded),
  Booking(id:'b2', type:'Train', from:'Douala', to:'Yaoundé',
    date:'March 20, 2026', status:'Confirmed', reference:'TRV-TR-0891',
    price:12.50, icon:Icons.train_rounded),
  Booking(id:'b4', type:'Flight', from:'Douala (DLA)', to:'Johannesburg (JNB)',
    date:'April 10, 2026', status:'Confirmed', reference:'TRV-FL-5567',
    price:620.00, icon:Icons.airplanemode_active_rounded),
];

// ── Screen ─────────────────────────────────────────────────────────────────
class ReservationScreen extends StatefulWidget {
  const ReservationScreen({super.key});
  @override State<ReservationScreen> createState() => _ReservationScreenState();
}

class _ReservationScreenState extends State<ReservationScreen>
    with SingleTickerProviderStateMixin, WidgetsBindingObserver {
  late TabController _tab;

  @override
  void initState() {
    super.initState();
    _tab = TabController(length: 1, vsync: this);
    WidgetsBinding.instance.addObserver(this);
    // Rebuild whenever main nav notifies us (e.g. after flight booking)
    bookingsRefreshNotifier.addListener(_onRefresh);
  }

  void _onRefresh() => setState(() {});

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) setState(() {});
  }

  // Called every time this widget is rebuilt from IndexedStack switching to it
  @override
  void didUpdateWidget(ReservationScreen old) {
    super.didUpdateWidget(old);
    setState(() {});
  }

  @override
  void dispose() {
    _tab.dispose();
    WidgetsBinding.instance.removeObserver(this);
    bookingsRefreshNotifier.removeListener(_onRefresh);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Column(children: [
        _header(),
        // Tabs
        Container(
          color: AppColors.bgCard,
          child: TabBar(
            controller: _tab,
            indicatorColor: AppColors.primary,
            indicatorWeight: 3,
            labelColor: AppColors.primary,
            unselectedLabelColor: AppColors.textGrey,
            labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
            tabs: const [
              Tab(text: 'My Bookings'),
            ])),
        Expanded(child: TabBarView(controller: _tab, children: [
          _bookingsTab(),
        ])),
      ]),
    );
  }

  Widget _header() {
    return Container(
      color: AppColors.bgDark,
      child: SafeArea(bottom: false, child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
        child: Row(children: [
          const TraveoLogoWidget(),
          const Spacer(),
          GestureDetector(
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WalletScreen())),
            child: Container(width: 40, height: 40,
              decoration: BoxDecoration(color: AppColors.bgCard,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.cardBorder)),
              child: const Icon(Icons.account_balance_wallet_rounded, color: AppColors.primary, size: 20))),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen())),
            child: Stack(children: [
              Container(width: 40, height: 40,
                decoration: BoxDecoration(color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder)),
                child: const Icon(Icons.notifications_rounded, color: AppColors.textGrey, size: 20)),
              Positioned(top: 2, right: 2, child: Container(
                padding: const EdgeInsets.all(3),
                decoration: const BoxDecoration(color: Colors.orange, shape: BoxShape.circle),
                child: const Text('2', style: TextStyle(color: AppColors.textDark,
                    fontSize: 8, fontWeight: FontWeight.bold)))),
            ])),
        ]))),
    );
  }

  // ── TAB 1: My Bookings ────────────────────────────────────────────────────
  Widget _bookingsTab() {
    final flightBookings = globalFlightBookings;
    final busBookings = globalBusBookings;
    final trainBookings = globalTrainBookings;
    final boatBookings = globalBoatBookings;

    final sampleFlights = _sampleBookings.where((b) => b.type == 'Flight').toList();
    final sampleTrains = _sampleBookings.where((b) => b.type == 'Train').toList();

    final totalFlights = flightBookings.length + sampleFlights.length;
    final totalRides = busBookings.length;
    final totalTrains = trainBookings.length + sampleTrains.length;
    final totalBoats = boatBookings.length;
    final allCount = totalFlights + totalRides + totalTrains + totalBoats;
    final confirmedCount = flightBookings.length + sampleFlights.length
        + busBookings.where((b) => b.status == 'Confirmed').length
        + trainBookings.where((b) => b.status == 'Confirmed').length
        + sampleTrains.length
        + boatBookings.where((b) => b.status == 'Confirmed').length;

    final hasAny = allCount > 0;

    return ListView(padding: const EdgeInsets.all(16), children: [
      Row(children: [
        _statCard('Total', '$allCount', Icons.book_online_rounded),
        const SizedBox(width: 10),
        _statCard('Confirmed', '$confirmedCount',
          Icons.check_circle_rounded, color: AppColors.primary),
        const SizedBox(width: 10),
        _statCard('Pending', '${allCount - confirmedCount}',
          Icons.pending_rounded, color: Colors.orange),
      ]),
      const SizedBox(height: 20),

      if (!hasAny) ...[
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
        _sectionHeader('Flights', Icons.airplanemode_active_rounded, AppColors.primary),
        const SizedBox(height: 12),
        ...flightBookings.map((b) => _flightBookingCard(b)),
        ...sampleFlights.map((b) => _bookingCard(b)),
        const SizedBox(height: 8),
      ],

      if (busBookings.isNotEmpty) ...[
        _sectionHeader('Rides', Icons.local_taxi_rounded, const Color(0xFFFF9800)),
        const SizedBox(height: 12),
        ...busBookings.map((b) => _busBookingCard(b)),
        const SizedBox(height: 8),
      ],

      if (trainBookings.isNotEmpty || sampleTrains.isNotEmpty) ...[
        _sectionHeader('Trains', Icons.train_rounded, const Color(0xFF9C27B0)),
        const SizedBox(height: 12),
        ...trainBookings.map((b) => _trainBookingCard(b)),
        ...sampleTrains.map((b) => _bookingCard(b)),
        const SizedBox(height: 8),
      ],

      if (boatBookings.isNotEmpty) ...[
        _sectionHeader('Boats', Icons.directions_boat_rounded, const Color(0xFF00BCD4)),
        const SizedBox(height: 12),
        ...boatBookings.map((b) => _boatBookingCard(b)),
        const SizedBox(height: 8),
      ],
    ]);
  }

  Widget _sectionHeader(String title, IconData icon, Color color) {
    return Row(children: [
      Container(width: 30, height: 30,
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(8)),
        child: Icon(icon, color: color, size: 16)),
      const SizedBox(width: 10),
      Text(title, style: TextStyle(color: color,
          fontWeight: FontWeight.w800, fontSize: 15)),
    ]);
  }

  Widget _busBookingCard(BusBooking b) {
    final isCancelled = b.status == 'Cancelled';
    final statusColor = isCancelled ? Colors.red : const Color(0xFF1DB954);
    final borderColor = isCancelled
        ? Colors.red.withValues(alpha: 0.35)
        : const Color(0xFFFF9800).withValues(alpha: 0.35);
    return GestureDetector(
      onTap: () {
        if (!isCancelled) {
          Navigator.push(context, MaterialPageRoute(
            builder: (_) => RideBookedDetailScreen(booking: b)));
        } else {
          _showBusDetail(context, b);
        }
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: borderColor)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Container(width: 42, height: 42,
              decoration: BoxDecoration(
                color: const Color(0xFFFF9800).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.local_taxi_rounded,
                  color: Color(0xFFFF9800), size: 22)),
            const SizedBox(width: 10),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Ride · ${b.category}', style: const TextStyle(
                  color: AppColors.textGrey, fontSize: 11, fontWeight: FontWeight.w600)),
              const SizedBox(height: 2),
              Text('${b.from} → ${b.to}',
                style: const TextStyle(
                    color: AppColors.textDark, fontWeight: FontWeight.w800, fontSize: 14),
                overflow: TextOverflow.ellipsis, maxLines: 1),
            ])),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: statusColor.withValues(alpha: 0.12),
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

  void _showBusDetail(BuildContext ctx, BusBooking b) {
    final isCancelled = b.status == 'Cancelled';
    showModalBottomSheet(context: ctx, isScrollControlled: true,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (sheetCtx) => StatefulBuilder(
        builder: (sbCtx, setSheetState) => Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(
                color: AppColors.cardBorder, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 20),
            const Icon(Icons.local_taxi_rounded, color: Color(0xFFFF9800), size: 40),
            const SizedBox(height: 12),
            Text('${b.from} → ${b.to}', style: const TextStyle(
                color: AppColors.textDark, fontWeight: FontWeight.w900, fontSize: 18),
                textAlign: TextAlign.center),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: (isCancelled ? Colors.red : const Color(0xFF1DB954))
                    .withValues(alpha: 0.12),
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
            // Cancel button — only show if not already cancelled
            if (!isCancelled) ...[
              OutlinedButton.icon(
                onPressed: () => _confirmCancelRide(sbCtx, b, setSheetState),
                icon: const Icon(Icons.cancel_outlined, color: Colors.red, size: 18),
                label: const Text('Cancel Ride',
                    style: TextStyle(color: Colors.red, fontWeight: FontWeight.w700)),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 48),
                  side: const BorderSide(color: Colors.red),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)))),
              const SizedBox(height: 6),
              Text('Cancellation fee: 20% = XAF ${(b.price * 0.2).toStringAsFixed(0)}',
                style: TextStyle(color: Colors.red.withValues(alpha: 0.7), fontSize: 11)),
              const SizedBox(height: 12),
            ],
            SizedBox(width: double.infinity, height: 50,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(sheetCtx),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFF9800),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12))),
                child: const Text('Close',
                    style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)))),
            const SizedBox(height: 8),
          ]))));
  }

  void _confirmCancelRide(BuildContext ctx, BusBooking b,
      StateSetter setSheetState) {
    final fee = b.price * 0.20;
    showDialog(
      context: ctx,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.bgCard,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Cancel Ride?',
            style: TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w800)),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          const Text('Are you sure you want to cancel this ride?',
              style: TextStyle(color: AppColors.textGrey, fontSize: 14)),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.red.withValues(alpha: 0.08),
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
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Keep Ride',
                style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700))),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx); // close dialog
              // Deduct 20% from wallet
              walletBalance -= fee;
              walletTransactions.insert(0, {
                'type': 'debit',
                'label': 'Ride cancellation fee',
                'amount': -fee,
                'date': b.date,
                'icon': 'send',
              });
              setSheetState(() => b.status = 'Cancelled');
              setState(() {});
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10))),
            child: const Text('Yes, Cancel',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700))),
        ]));
  }

  Widget _trainBookingCard(TrainBooking b) {
    const color = Color(0xFF9C27B0);
    return GestureDetector(
      onTap: () => _showTrainDetail(context, b),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.35))),
        child: Column(children: [
          Row(children: [
            Container(width: 44, height: 44,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.train_rounded, color: color, size: 24)),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Train · ${b.classType}', style: const TextStyle(
                  color: AppColors.textGrey, fontSize: 11, fontWeight: FontWeight.w600)),
              Text('${b.from} → ${b.to}', style: const TextStyle(
                  color: AppColors.textDark, fontWeight: FontWeight.w800, fontSize: 14)),
            ])),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
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

  void _showTrainDetail(BuildContext ctx, TrainBooking b) {
    showModalBottomSheet(context: ctx, isScrollControlled: true,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(width: 40, height: 4,
            decoration: BoxDecoration(color: AppColors.cardBorder,
                borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 20),
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
            child: ElevatedButton(
              onPressed: () => Navigator.pop(ctx),
              style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF9C27B0),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              child: const Text('Close',
                  style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)))),
          const SizedBox(height: 8),
        ])));
  }

  Widget _boatBookingCard(BoatBooking b) {
    const color = Color(0xFF00BCD4);
    return GestureDetector(
      onTap: () => _showBoatDetail(context, b),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.35))),
        child: Column(children: [
          Row(children: [
            Container(width: 44, height: 44,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.directions_boat_rounded, color: color, size: 24)),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Boat · ${b.category}', style: const TextStyle(
                  color: AppColors.textGrey, fontSize: 11, fontWeight: FontWeight.w600)),
              Text('${b.from} → ${b.to}', style: const TextStyle(
                  color: AppColors.textDark, fontWeight: FontWeight.w800, fontSize: 14)),
            ])),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
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

  void _showBoatDetail(BuildContext ctx, BoatBooking b) {
    showModalBottomSheet(context: ctx, isScrollControlled: true,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(width: 40, height: 4,
            decoration: BoxDecoration(color: AppColors.cardBorder,
                borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 20),
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
            child: ElevatedButton(
              onPressed: () => Navigator.pop(ctx),
              style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00BCD4),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              child: const Text('Close',
                  style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)))),
          const SizedBox(height: 8),
        ])));
  }

  Widget _flightBookingCard(FlightBooking b) {
    return GestureDetector(
      onTap: () => _showFlightDetail(context, b),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.primary.withValues(alpha: 0.35))),
        child: Column(children: [
          Row(children: [
            Container(width: 44, height: 44,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.airplanemode_active_rounded,
                  color: AppColors.primary, size: 24)),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Flight · ${b.classType}', style: const TextStyle(
                  color: AppColors.textGrey, fontSize: 11, fontWeight: FontWeight.w600)),
              Text('${b.from} → ${b.to}', style: const TextStyle(
                  color: AppColors.textDark, fontWeight: FontWeight.w800, fontSize: 14)),
            ])),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.15),
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
  }

  void _showFlightDetail(BuildContext ctx, FlightBooking b) {
    showModalBottomSheet(context: ctx, isScrollControlled: true,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(width: 40, height: 4,
            decoration: BoxDecoration(color: AppColors.cardBorder,
                borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 20),
          const Icon(Icons.airplanemode_active_rounded,
              color: AppColors.primary, size: 40),
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
            child: ElevatedButton(
              onPressed: () => Navigator.pop(ctx),
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12))),
              child: const Text('Close',
                  style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)))),
          const SizedBox(height: 8),
        ])));
  }

  Widget _statCard(String label, String value, IconData icon, {Color color = AppColors.textGrey}) {
    return Expanded(child: Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.5))),
      child: Column(children: [
        Icon(icon, color: color, size: 22),
        const SizedBox(height: 6),
        Text(value, style: TextStyle(color: color,
            fontWeight: FontWeight.w900, fontSize: 20)),
        Text(label, style: const TextStyle(color: AppColors.textGrey, fontSize: 10)),
      ])));
  }

  Widget _bookingCard(Booking b) {
    final confirmed = b.status == 'Confirmed';
    return GestureDetector(
      onTap: () => _showBookingDetail(context, b),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: confirmed
              ? AppColors.primary.withValues(alpha: 0.3)
              : Colors.orange.withValues(alpha: 0.3))),
        child: Column(children: [
          Row(children: [
            Container(width: 44, height: 44,
              decoration: BoxDecoration(
                color: (confirmed ? AppColors.primary : Colors.orange).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12)),
              child: Icon(b.icon,
                  color: confirmed ? AppColors.primary : Colors.orange, size: 24)),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(b.type, style: const TextStyle(color: AppColors.textGrey,
                  fontSize: 11, fontWeight: FontWeight.w600)),
              Text('${b.from} → ${b.to}',
                style: const TextStyle(color: AppColors.textDark,
                    fontWeight: FontWeight.w800, fontSize: 14)),
            ])),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: (confirmed ? AppColors.primary : Colors.orange).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(20)),
              child: Text(b.status,
                style: TextStyle(
                    color: confirmed ? AppColors.primary : Colors.orange,
                    fontSize: 11, fontWeight: FontWeight.w700))),
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

  void _showBookingDetail(BuildContext ctx, Booking b) {
    showModalBottomSheet(context: ctx, isScrollControlled: true,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(width: 40, height: 4,
            decoration: BoxDecoration(color: AppColors.cardBorder,
                borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 20),
          Icon(b.icon, color: AppColors.primary, size: 40),
          const SizedBox(height: 12),
          Text('${b.from} → ${b.to}',
            style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w900, fontSize: 18),
            textAlign: TextAlign.center),
          const SizedBox(height: 20),
          _detailRow('Type', b.type),
          _detailRow('Date', b.date),
          _detailRow('Reference', b.reference),
          _detailRow('Status', b.status),
          _detailRow('Price', 'FCFA ${b.price.toStringAsFixed(2)}'),
          const SizedBox(height: 20),
          SizedBox(width: double.infinity, height: 50,
            child: ElevatedButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Close', style: TextStyle(fontWeight: FontWeight.bold)))),
          const SizedBox(height: 8),
        ])));
  }

  Widget _detailRow(String label, String value) => Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: Row(children: [
      Text(label, style: const TextStyle(color: AppColors.textGrey, fontSize: 13)),
      const Spacer(),
      Text(value, style: const TextStyle(color: AppColors.textDark,
          fontSize: 13, fontWeight: FontWeight.w600)),
    ]));

  // ── TAB 2: AI Traveo ───────────────────────────────────────────────
  Widget _aiTripTab() {
    return ListView(padding: const EdgeInsets.all(16), children: [
      // AI chat + Trip Planner banner
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
        _quickLink(Icons.add_location_alt_rounded, 'New Trip',
          const Color(0xFF1DB954), () => _openCreateTrip()),
        const SizedBox(width: 10),
        _quickLink(Icons.group_rounded, 'Group Trip',
          const Color(0xFF8B5CF6), () => _openCreateGroupTrip()),
        const SizedBox(width: 10),
        _quickLink(Icons.map_rounded, 'My Trips',
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
        ...globalTrips.take(3).map((t) => _recentTripCard(t)),
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

  Widget _quickLink(IconData icon, String label, Color color, VoidCallback onTap) {
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

  Widget _recentTripCard(TripPlan t) {
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
