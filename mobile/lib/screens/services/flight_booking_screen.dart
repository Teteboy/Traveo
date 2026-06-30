import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import 'services_screen.dart';
import '../wallet/wallet_state.dart';
import '../main_nav_screen.dart';

// ── Shared global flight bookings list (read by ReservationScreen) ──────────
final List<FlightBooking> globalFlightBookings = [];

// ── Flight Booking model ─────────────────────────────────────────────────────
class FlightBooking {
  final String id, from, to, date, returnDate, airline, flightNumber,
      departure, arrival, classType, passengerName, passportNumber,
      paymentMethod, reference, status;
  final double price;
  final bool isRoundTrip;
  final int passengers;

  FlightBooking({
    required this.id, required this.from, required this.to,
    required this.date, required this.returnDate, required this.airline,
    required this.flightNumber, required this.departure, required this.arrival,
    required this.classType, required this.passengerName,
    required this.passportNumber, required this.paymentMethod,
    required this.reference, required this.price, required this.isRoundTrip,
    required this.passengers, this.status = 'Confirmed',
  });
}

// ── Flight data model ─────────────────────────────────────────────────────────
class _Flight {
  final String airline, flightNo, from, to, departure, arrival, duration, classType;
  final double price;
  final int stops;
  final Color color;
  const _Flight({
    required this.airline, required this.flightNo, required this.from,
    required this.to, required this.departure, required this.arrival,
    required this.duration, required this.classType, required this.price,
    required this.stops, required this.color,
  });
}

// ── Sample flight data ────────────────────────────────────────────────────────
final _allFlights = [
  _Flight(airline:'Camair-Co', flightNo:'QC 401', from:'Yaoundé (NSI)', to:'Douala (DLA)',
    departure:'06:00', arrival:'06:45', duration:'45 min', classType:'Economy',
    price:55.0, stops:0, color:const Color(0xFF1DB954)),
  _Flight(airline:'Camair-Co', flightNo:'QC 402', from:'Yaoundé (NSI)', to:'Douala (DLA)',
    departure:'14:30', arrival:'15:15', duration:'45 min', classType:'Business',
    price:140.0, stops:0, color:const Color(0xFF1DB954)),
  _Flight(airline:'Air France', flightNo:'AF 952', from:'Douala (DLA)', to:'Paris (CDG)',
    departure:'23:55', arrival:'06:30+1', duration:'6h 35m', classType:'Economy',
    price:480.0, stops:0, color:const Color(0xFF003087)),
  _Flight(airline:'Air France', flightNo:'AF 954', from:'Douala (DLA)', to:'Paris (CDG)',
    departure:'10:00', arrival:'17:45', duration:'7h 45m', classType:'Business',
    price:1250.0, stops:0, color:const Color(0xFF003087)),
  _Flight(airline:'Ethiopian', flightNo:'ET 916', from:'Douala (DLA)', to:'Addis Ababa (ADD)',
    departure:'08:15', arrival:'14:30', duration:'6h 15m', classType:'Economy',
    price:320.0, stops:0, color:const Color(0xFF009933)),
  _Flight(airline:'Kenya Airways', flightNo:'KQ 481', from:'Yaoundé (NSI)', to:'Nairobi (NBO)',
    departure:'09:00', arrival:'17:20', duration:'8h 20m', classType:'Economy',
    price:390.0, stops:1, color:const Color(0xFFCC0000)),
  _Flight(airline:'Brussels Airlines', flightNo:'SN 365', from:'Douala (DLA)', to:'Brussels (BRU)',
    departure:'22:10', arrival:'05:55+1', duration:'7h 45m', classType:'Economy',
    price:520.0, stops:0, color:const Color(0xFF0033A0)),
  _Flight(airline:'Turkish Airlines', flightNo:'TK 611', from:'Douala (DLA)', to:'Istanbul (IST)',
    departure:'03:40', arrival:'12:00', duration:'8h 20m', classType:'Economy',
    price:410.0, stops:0, color:const Color(0xFFE81932)),
  _Flight(airline:'Camair-Co', flightNo:'QC 510', from:'Douala (DLA)', to:'Lagos (LOS)',
    departure:'07:00', arrival:'08:10', duration:'1h 10m', classType:'Economy',
    price:180.0, stops:0, color:const Color(0xFF1DB954)),
  _Flight(airline:'Asky Airlines', flightNo:'KP 312', from:'Douala (DLA)', to:'Abidjan (ABJ)',
    departure:'11:30', arrival:'13:45', duration:'2h 15m', classType:'Economy',
    price:220.0, stops:0, color:const Color(0xFF0066CC)),
];

// ── Main Screen ────────────────────────────────────────────────────────────────
class FlightBookingScreen extends StatefulWidget {
  const FlightBookingScreen({super.key});
  @override State<FlightBookingScreen> createState() => _FlightBookingScreenState();
}

class _FlightBookingScreenState extends State<FlightBookingScreen> {
  int _step = 0; // 0=Search, 1=Select, 2=Docs, 3=Payment, 4=Done

  // Step 0 – search params
  final _fromCtrl = TextEditingController();
  final _toCtrl = TextEditingController();
  final _dateCtrl = TextEditingController();
  final _returnCtrl = TextEditingController();
  bool _roundTrip = false;
  int _passengers = 1;
  String _classFilter = 'All';

  // Step 1 – selected flight
  _Flight? _selectedFlight;
  List<_Flight> _searchResults = [];

  // Step 2 – passenger / documents
  final _nameCtrl = TextEditingController();
  final _passportCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  bool _passportUploaded = false;
  bool _ticketUploaded = false;

  // Step 3 – payment
  String _paymentMethod = 'Credit Card';
  final _cardCtrl = TextEditingController();
  final _expiryCtrl = TextEditingController();
  final _cvvCtrl = TextEditingController();
  final _mobileCtrl = TextEditingController();
  bool _paymentDone = false;

  FlightBooking? _confirmedBooking;

  @override
  void dispose() {
    for (final c in [_fromCtrl, _toCtrl, _dateCtrl, _returnCtrl, _nameCtrl,
        _passportCtrl, _emailCtrl, _phoneCtrl, _cardCtrl, _expiryCtrl,
        _cvvCtrl, _mobileCtrl]) { c.dispose(); }
    super.dispose();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  String get _stepTitle => ['Search Flights', 'Select Flight',
      'Passenger & Documents', 'Payment', 'Booking Confirmed'][_step];

  double get _totalPrice => (_selectedFlight?.price ?? 0) * _passengers *
      (_roundTrip ? 1.85 : 1.0);

  void _doSearch() {
    final from = _fromCtrl.text.trim().toLowerCase();
    final to = _toCtrl.text.trim().toLowerCase();
    var results = _allFlights.where((f) {
      final matchFrom = from.isEmpty || f.from.toLowerCase().contains(from);
      final matchTo = to.isEmpty || f.to.toLowerCase().contains(to);
      final matchClass = _classFilter == 'All' || f.classType == _classFilter;
      return matchFrom && matchTo && matchClass;
    }).toList();
    setState(() { _searchResults = results; _step = 1; });
  }

  void _confirmBooking() {
    final ref = 'TRV-FL-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
    final now = DateTime.now();
    const months = ['Jan','Feb','Mar','Apr','May','Jun',
                    'Jul','Aug','Sep','Oct','Nov','Dec'];
    final dateStr = '${months[now.month - 1]} ${now.day}, ${now.year}';

    // Deduct from wallet if paying with wallet
    if (_paymentMethod == 'Wallet') {
      walletBalance -= _totalPrice;
      walletTransactions.insert(0, {
        'type': 'debit',
        'label': 'Flight: ${_selectedFlight!.from} → ${_selectedFlight!.to}',
        'amount': -_totalPrice,
        'date': dateStr,
        'icon': 'flight',
      });
    }

    final booking = FlightBooking(
      id: ref,
      from: _selectedFlight!.from, to: _selectedFlight!.to,
      date: _dateCtrl.text.isNotEmpty ? _dateCtrl.text : 'TBD',
      returnDate: _returnCtrl.text,
      airline: _selectedFlight!.airline, flightNumber: _selectedFlight!.flightNo,
      departure: _selectedFlight!.departure, arrival: _selectedFlight!.arrival,
      classType: _selectedFlight!.classType,
      passengerName: _nameCtrl.text, passportNumber: _passportCtrl.text,
      paymentMethod: _paymentMethod, reference: ref,
      price: _totalPrice, isRoundTrip: _roundTrip, passengers: _passengers,
    );
    // Save to global flight bookings list (shown in Bookings tab)
    globalFlightBookings.insert(0, booking);
    // Also save as ServiceBooking (shown in Services > My Bookings)
    globalServiceBookings.insert(0, ServiceBooking(
      id: ref, type: 'Flight - ${_selectedFlight!.classType}',
      name: '${_selectedFlight!.from} → ${_selectedFlight!.to}',
      description: '${_selectedFlight!.airline} ${_selectedFlight!.flightNo}',
      destination: _selectedFlight!.to, date: booking.date,
      price: _totalPrice, icon: Icons.airplanemode_active_rounded,
      color: _selectedFlight!.color,
    ));
    setState(() { _confirmedBooking = booking; _step = 4; });
    // Notify Bookings screen to rebuild
    bookingsRefreshNotifier.value++;
  }

  // ── Build ─────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Column(children: [
        _topBar(context),
        if (_step < 4) _progressBar(),
        Expanded(child: [
          _searchStep(),
          _selectStep(),
          _docsStep(),
          _paymentStep(),
          _confirmedStep(),
        ][_step]),
      ]),
    );
  }

  Widget _topBar(BuildContext context) => Container(
    color: AppColors.bgCard,
    child: SafeArea(bottom: false, child: Padding(
      padding: const EdgeInsets.fromLTRB(12, 10, 16, 12),
      child: Row(children: [
        GestureDetector(
          onTap: () {
            if (_step == 0) { Navigator.pop(context); }
            else { setState(() => _step--); }
          },
          child: Container(width: 38, height: 38,
            decoration: BoxDecoration(color: AppColors.bgMid,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.cardBorder)),
            child: const Icon(Icons.arrow_back_rounded,
                color: AppColors.textDark, size: 20))),
        const SizedBox(width: 12),
        Expanded(child: Text(_stepTitle, style: const TextStyle(
            color: AppColors.textDark, fontWeight: FontWeight.w800, fontSize: 17))),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(20)),
          child: Row(children: [
            const Icon(Icons.airplanemode_active_rounded,
                color: AppColors.primary, size: 14),
            const SizedBox(width: 4),
            const Text('Flights', style: TextStyle(color: AppColors.primary,
                fontSize: 11, fontWeight: FontWeight.w700)),
          ])),
      ]))));

  Widget _progressBar() => Container(
    color: AppColors.bgCard,
    padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
    child: Row(children: List.generate(4, (i) {
      final done = i < _step;
      final active = i == _step;
      return Expanded(child: Row(children: [
        Expanded(child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          height: 4,
          decoration: BoxDecoration(
            color: done || active ? AppColors.primary : AppColors.cardBorder,
            borderRadius: BorderRadius.circular(2)))),
        if (i < 3) const SizedBox(width: 4),
      ]));
    })));

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 0 — SEARCH
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _searchStep() => ListView(
    padding: const EdgeInsets.all(16),
    children: [
      // Trip type toggle
      Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.cardBorder)),
        child: Row(children: [
          _tripTypeBtn('One Way', !_roundTrip, () => setState(() => _roundTrip = false)),
          _tripTypeBtn('Round Trip', _roundTrip, () => setState(() => _roundTrip = true)),
        ])),
      const SizedBox(height: 16),

      // From / To
      _fieldLabel('From'),
      _inputField(_fromCtrl, 'e.g. Yaoundé, Douala', Icons.flight_takeoff_rounded),
      const SizedBox(height: 12),
      _fieldLabel('To'),
      _inputField(_toCtrl, 'e.g. Paris, Lagos', Icons.flight_land_rounded),
      const SizedBox(height: 12),

      // Dates
      Row(children: [
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          _fieldLabel('Departure Date'),
          _dateField(_dateCtrl, 'Select date'),
        ])),
        if (_roundTrip) ...[
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            _fieldLabel('Return Date'),
            _dateField(_returnCtrl, 'Select date'),
          ])),
        ],
      ]),
      const SizedBox(height: 16),

      // Passengers
      _fieldLabel('Passengers'),
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.cardBorder)),
        child: Row(children: [
          const Icon(Icons.person_rounded, color: AppColors.primary, size: 20),
          const SizedBox(width: 8),
          Text('$_passengers Passenger${_passengers > 1 ? 's' : ''}',
            style: const TextStyle(color: AppColors.textDark, fontSize: 14)),
          const Spacer(),
          _counterBtn(Icons.remove_rounded,
              _passengers > 1 ? () => setState(() => _passengers--) : null),
          Padding(padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Text('$_passengers', style: const TextStyle(color: AppColors.textDark,
                fontWeight: FontWeight.w800, fontSize: 16))),
          _counterBtn(Icons.add_rounded,
              _passengers < 9 ? () => setState(() => _passengers++) : null),
        ])),
      const SizedBox(height: 16),

      // Class filter
      _fieldLabel('Class'),
      SizedBox(height: 44, child: ListView(scrollDirection: Axis.horizontal, children:
        ['All', 'Economy', 'Business', 'First'].map((c) => GestureDetector(
          onTap: () => setState(() => _classFilter = c),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            margin: const EdgeInsets.only(right: 10),
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
            decoration: BoxDecoration(
              color: _classFilter == c ? AppColors.primary : AppColors.bgCard,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: _classFilter == c
                  ? AppColors.primary : AppColors.cardBorder)),
            child: Text(c, style: TextStyle(
                color: _classFilter == c ? Colors.white : AppColors.textGrey,
                fontWeight: FontWeight.w600, fontSize: 13))))).toList())),
      const SizedBox(height: 28),

      SizedBox(width: double.infinity, height: 52,
        child: ElevatedButton.icon(
          onPressed: _doSearch,
          icon: const Icon(Icons.search_rounded, color: Colors.white),
          label: const Text('Search Flights',
            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: Colors.white)),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))))),
      const SizedBox(height: 20),

      // Popular routes
      const Text('Popular Routes', style: TextStyle(color: AppColors.textDark,
          fontWeight: FontWeight.w700, fontSize: 14)),
      const SizedBox(height: 10),
      Wrap(spacing: 8, runSpacing: 8, children: [
        'Yaoundé → Paris', 'Douala → Lagos', 'Douala → Brussels',
        'Yaoundé → Nairobi', 'Douala → Istanbul',
      ].map((r) => GestureDetector(
        onTap: () {
          final parts = r.split(' → ');
          _fromCtrl.text = parts[0];
          _toCtrl.text = parts[1];
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
          decoration: BoxDecoration(
            color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.cardBorder)),
          child: Text(r, style: const TextStyle(
              color: AppColors.textGrey, fontSize: 12))))).toList()),
    ]);

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 1 — SELECT FLIGHT
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _selectStep() {
    if (_searchResults.isEmpty) {
      return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(Icons.airplanemode_inactive_rounded,
            color: AppColors.textGrey.withValues(alpha: 0.4), size: 80),
        const SizedBox(height: 16),
        const Text('No flights found', style: TextStyle(color: AppColors.textGrey, fontSize: 16)),
        const SizedBox(height: 8),
        const Text('Try different dates or routes',
            style: TextStyle(color: AppColors.textGrey, fontSize: 12)),
        const SizedBox(height: 24),
        TextButton(onPressed: () => setState(() => _step = 0),
          child: const Text('Modify Search')),
      ]));
    }
    return ListView(padding: const EdgeInsets.all(16), children: [
      // Summary
      Container(
        padding: const EdgeInsets.all(14),
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder)),
        child: Row(children: [
          const Icon(Icons.flight_rounded, color: AppColors.primary, size: 18),
          const SizedBox(width: 8),
          Expanded(child: Text(
            '${_fromCtrl.text.isEmpty ? 'Any' : _fromCtrl.text} → '
            '${_toCtrl.text.isEmpty ? 'Any' : _toCtrl.text}  ·  '
            '$_passengers pax  ·  $_classFilter',
            style: const TextStyle(color: AppColors.textGrey, fontSize: 12))),
          GestureDetector(
            onTap: () => setState(() => _step = 0),
            child: const Text('Edit', style: TextStyle(color: AppColors.primary,
                fontSize: 12, fontWeight: FontWeight.w700))),
        ])),
      Text('${_searchResults.length} flight${_searchResults.length == 1 ? '' : 's'} found',
          style: const TextStyle(color: AppColors.textDark,
              fontWeight: FontWeight.w700, fontSize: 14)),
      const SizedBox(height: 12),
      ..._searchResults.map((f) => _flightCard(f)),
    ]);
  }

  Widget _flightCard(_Flight f) {
    final total = f.price * _passengers * (_roundTrip ? 1.85 : 1.0);
    return GestureDetector(
      onTap: () => setState(() { _selectedFlight = f; _step = 2; }),
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        decoration: BoxDecoration(color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: f.color.withValues(alpha: 0.4))),
        child: Column(children: [
          // Airline header
          Container(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 10),
            decoration: BoxDecoration(
              color: f.color.withValues(alpha: 0.08),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16))),
            child: Row(children: [
              Container(width: 36, height: 36,
                decoration: BoxDecoration(color: f.color.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8)),
                child: Icon(Icons.airplanemode_active_rounded, color: f.color, size: 20)),
              const SizedBox(width: 10),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(f.airline, style: const TextStyle(color: AppColors.textDark,
                    fontWeight: FontWeight.w800, fontSize: 13)),
                Text(f.flightNo, style: TextStyle(color: f.color, fontSize: 11,
                    fontWeight: FontWeight.w600)),
              ])),
              // Class badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: f.color.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8)),
                child: Text(f.classType, style: TextStyle(color: f.color,
                    fontSize: 10, fontWeight: FontWeight.w700))),
            ])),
          // Route
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
            child: Row(children: [
              // Departure
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(f.departure, style: const TextStyle(color: AppColors.textDark,
                    fontWeight: FontWeight.w900, fontSize: 22)),
                Text(f.from.length > 12 ? f.from.substring(0, 12) : f.from,
                    style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
              ]),
              Expanded(child: Column(children: [
                Row(children: [
                  const SizedBox(width: 4),
                  Expanded(child: Container(height: 1, color: AppColors.cardBorder)),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 6),
                    child: Icon(Icons.airplanemode_active_rounded,
                        color: f.color, size: 18)),
                  Expanded(child: Container(height: 1, color: AppColors.cardBorder)),
                  const SizedBox(width: 4),
                ]),
                const SizedBox(height: 4),
                Text(f.duration, style: const TextStyle(color: AppColors.textGrey, fontSize: 10)),
                if (f.stops > 0)
                  Text('${f.stops} stop', style: TextStyle(color: Colors.orange, fontSize: 9)),
                if (f.stops == 0)
                  const Text('Direct', style: TextStyle(color: Color(0xFF1DB954), fontSize: 9)),
              ])),
              // Arrival
              Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text(f.arrival, style: const TextStyle(color: AppColors.textDark,
                    fontWeight: FontWeight.w900, fontSize: 22)),
                Text(f.to.length > 12 ? f.to.substring(0, 12) : f.to,
                    style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
              ]),
            ])),
          // Footer
          Container(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 12),
            decoration: BoxDecoration(
              color: AppColors.bgMid.withValues(alpha: 0.5),
              borderRadius: const BorderRadius.vertical(bottom: Radius.circular(16))),
            child: Row(children: [
              Text('XAF ${f.price.toStringAsFixed(0)}/person',
                  style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
              const Spacer(),
              Text('Total: XAF ${total.toStringAsFixed(0)}',
                  style: const TextStyle(color: AppColors.primary,
                      fontWeight: FontWeight.w900, fontSize: 16)),
              const SizedBox(width: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                decoration: BoxDecoration(color: f.color,
                    borderRadius: BorderRadius.circular(10)),
                child: const Text('Select', style: TextStyle(color: Colors.white,
                    fontWeight: FontWeight.w700, fontSize: 12))),
            ])),
        ])));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 2 — PASSENGER INFO & DOCUMENTS
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _docsStep() => ListView(padding: const EdgeInsets.all(16), children: [
    // Selected flight summary
    if (_selectedFlight != null) _selectedFlightSummary(),
    const SizedBox(height: 20),

    const Text('Passenger Information', style: TextStyle(color: AppColors.textDark,
        fontWeight: FontWeight.w700, fontSize: 15)),
    const SizedBox(height: 12),
    _fieldLabel('Full Name (as on passport)'),
    _inputField(_nameCtrl, 'e.g. Jean Dupont', Icons.person_rounded),
    const SizedBox(height: 12),
    _fieldLabel('Passport / ID Number'),
    _inputField(_passportCtrl, 'e.g. AB1234567', Icons.credit_card_rounded),
    const SizedBox(height: 12),
    _fieldLabel('Email Address'),
    _inputField(_emailCtrl, 'e.g. jean@email.com', Icons.email_rounded,
        type: TextInputType.emailAddress),
    const SizedBox(height: 12),
    _fieldLabel('Phone Number'),
    _inputField(_phoneCtrl, 'e.g. +237 6XX XXX XXX', Icons.phone_rounded,
        type: TextInputType.phone),
    const SizedBox(height: 24),

    const Text('Required Documents', style: TextStyle(color: AppColors.textDark,
        fontWeight: FontWeight.w700, fontSize: 15)),
    const SizedBox(height: 4),
    const Text('Upload scanned copies of your travel documents',
        style: TextStyle(color: AppColors.textGrey, fontSize: 12)),
    const SizedBox(height: 12),

    _docUploadCard(
      title: 'Passport / National ID',
      subtitle: 'PDF or image — valid for 6+ months',
      icon: Icons.badge_rounded,
      uploaded: _passportUploaded,
      onTap: () => setState(() => _passportUploaded = true)),
    const SizedBox(height: 10),
    _docUploadCard(
      title: 'Previous Ticket (if any)',
      subtitle: 'Optional — for rebooking cases',
      icon: Icons.confirmation_number_rounded,
      uploaded: _ticketUploaded,
      onTap: () => setState(() => _ticketUploaded = true),
      required: false),
    const SizedBox(height: 28),

    SizedBox(width: double.infinity, height: 52,
      child: ElevatedButton(
        onPressed: _passportUploaded && _nameCtrl.text.isNotEmpty &&
            _passportCtrl.text.isNotEmpty
            ? () => setState(() => _step = 3)
            : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          disabledBackgroundColor: AppColors.cardBorder,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
        child: const Text('Continue to Payment',
            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15,
                color: Colors.white)))),
    const SizedBox(height: 8),
    const Center(child: Text('Fill required fields and upload passport to continue',
        style: TextStyle(color: AppColors.textGrey, fontSize: 11))),
  ]);

  Widget _selectedFlightSummary() {
    final f = _selectedFlight!;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: f.color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: f.color.withValues(alpha: 0.4))),
      child: Row(children: [
        Icon(Icons.airplanemode_active_rounded, color: f.color, size: 22),
        const SizedBox(width: 10),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('${f.from} → ${f.to}', style: const TextStyle(color: AppColors.textDark,
              fontWeight: FontWeight.w800, fontSize: 13)),
          Text('${f.airline}  ·  ${f.departure} – ${f.arrival}  ·  ${f.classType}',
              style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
        ])),
        Text('XAF ${_totalPrice.toStringAsFixed(0)}',
            style: TextStyle(color: f.color,
                fontWeight: FontWeight.w900, fontSize: 16)),
      ]));
  }

  Widget _docUploadCard({
    required String title, required String subtitle, required IconData icon,
    required bool uploaded, required VoidCallback onTap, bool required = true,
  }) => GestureDetector(
    onTap: onTap,
    child: AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: uploaded
            ? AppColors.primary.withValues(alpha: 0.08) : AppColors.bgCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: uploaded
            ? AppColors.primary : AppColors.cardBorder)),
      child: Row(children: [
        Container(width: 44, height: 44,
          decoration: BoxDecoration(
            color: (uploaded ? AppColors.primary : AppColors.textGrey)
                .withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(12)),
          child: Icon(icon,
              color: uploaded ? AppColors.primary : AppColors.textGrey, size: 22)),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Text(title, style: TextStyle(
                color: uploaded ? AppColors.textDark : AppColors.textDark,
                fontWeight: FontWeight.w700, fontSize: 13)),
            if (required) const Text(' *',
                style: TextStyle(color: Colors.red, fontSize: 12)),
          ]),
          Text(subtitle, style: const TextStyle(
              color: AppColors.textGrey, fontSize: 11)),
        ])),
        if (uploaded)
          const Icon(Icons.check_circle_rounded,
              color: AppColors.primary, size: 24)
        else
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(color: AppColors.bgCardLight,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.cardBorder)),
            child: const Text('Upload', style: TextStyle(
                color: AppColors.textGrey, fontSize: 11,
                fontWeight: FontWeight.w600))),
      ])));

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 3 — PAYMENT
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _paymentStep() => ListView(padding: const EdgeInsets.all(16), children: [
    // Price summary card
    Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight,
          colors: [AppColors.primary.withValues(alpha: 0.2),
                   AppColors.primary.withValues(alpha: 0.05)]),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.3))),
      child: Column(children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          const Text('Base fare', style: TextStyle(color: AppColors.textGrey, fontSize: 13)),
          Text('XAF ${((_selectedFlight?.price ?? 0) * _passengers).toStringAsFixed(2)}',
              style: const TextStyle(color: AppColors.textDark, fontSize: 13)),
        ]),
        if (_roundTrip) ...[
          const SizedBox(height: 6),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            const Text('Return trip (+85%)',
                style: TextStyle(color: AppColors.textGrey, fontSize: 13)),
            Text('+XAF ${((_selectedFlight?.price ?? 0) * _passengers * 0.85).toStringAsFixed(2)}',
                style: const TextStyle(color: AppColors.textDark, fontSize: 13)),
          ]),
        ],
        const SizedBox(height: 6),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          const Text('Taxes & fees', style: TextStyle(color: AppColors.textGrey, fontSize: 13)),
          const Text('Included', style: TextStyle(color: AppColors.textGrey, fontSize: 13)),
        ]),
        const Divider(color: AppColors.cardBorder, height: 20),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          const Text('Total', style: TextStyle(color: AppColors.textDark,
              fontWeight: FontWeight.w800, fontSize: 16)),
          Text('XAF ${_totalPrice.toStringAsFixed(2)}',
              style: const TextStyle(color: AppColors.primary,
                  fontWeight: FontWeight.w900, fontSize: 20)),
        ]),
      ])),

    const Text('Payment Method', style: TextStyle(color: AppColors.textDark,
        fontWeight: FontWeight.w700, fontSize: 15)),
    const SizedBox(height: 12),
    // Payment method selector
    ...[
      ('Wallet', Icons.account_balance_wallet_rounded, const Color(0xFF4F46E5)),
      ('Credit Card', Icons.credit_card_rounded, const Color(0xFF6366F1)),
      ('Mobile Money', Icons.phone_android_rounded, const Color(0xFF1DB954)),
      ('PayPal', Icons.account_balance_wallet_rounded, const Color(0xFF009CDE)),
    ].map((m) => GestureDetector(
      onTap: () => setState(() => _paymentMethod = m.$1),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: _paymentMethod == m.$1
              ? m.$3.withValues(alpha: 0.08) : AppColors.bgCard,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: _paymentMethod == m.$1
              ? m.$3 : AppColors.cardBorder)),
        child: Row(children: [
          Icon(m.$2, color: _paymentMethod == m.$1 ? m.$3 : AppColors.textGrey, size: 22),
          const SizedBox(width: 12),
          Text(m.$1, style: TextStyle(
              color: _paymentMethod == m.$1 ? AppColors.textDark : AppColors.textGrey,
              fontWeight: FontWeight.w600, fontSize: 14)),
          const Spacer(),
          if (_paymentMethod == m.$1)
            Icon(Icons.check_circle_rounded, color: m.$3, size: 20),
        ])))),

    const SizedBox(height: 16),

    // Payment form
    if (_paymentMethod == 'Wallet') ...[
      Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: walletBalance >= _totalPrice
              ? AppColors.primary.withValues(alpha: 0.08)
              : Colors.red.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: walletBalance >= _totalPrice
              ? AppColors.primary.withValues(alpha: 0.3)
              : Colors.red.withValues(alpha: 0.3))),
        child: Row(children: [
          Icon(Icons.account_balance_wallet_rounded,
              color: walletBalance >= _totalPrice
                  ? AppColors.primary : Colors.red, size: 20),
          const SizedBox(width: 10),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Wallet Balance: XAF ${walletBalance.toStringAsFixed(2)}',
                style: TextStyle(
                    color: walletBalance >= _totalPrice
                        ? AppColors.textDark : Colors.red,
                    fontWeight: FontWeight.w700, fontSize: 13)),
            if (walletBalance < _totalPrice)
              Text('Insufficient balance — deposit XAF ${(_totalPrice - walletBalance).toStringAsFixed(2)} more',
                  style: const TextStyle(color: Colors.red, fontSize: 11)),
            if (walletBalance >= _totalPrice)
              Text('XAF ${_totalPrice.toStringAsFixed(2)} will be deducted',
                  style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
          ])),
        ])),
      const SizedBox(height: 8),
    ] else if (_paymentMethod == 'Credit Card') ...[
      _fieldLabel('Card Number'),
      _inputField(_cardCtrl, '1234 5678 9012 3456', Icons.credit_card_rounded,
          type: TextInputType.number),
      const SizedBox(height: 12),
      Row(children: [
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          _fieldLabel('Expiry Date'),
          _inputField(_expiryCtrl, 'MM/YY', Icons.date_range_rounded),
        ])),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          _fieldLabel('CVV'),
          _inputField(_cvvCtrl, '•••', Icons.lock_rounded,
              type: TextInputType.number, obscure: true),
        ])),
      ]),
    ] else if (_paymentMethod == 'Mobile Money') ...[
      _fieldLabel('Mobile Number'),
      _inputField(_mobileCtrl, 'e.g. 6XX XXX XXX', Icons.phone_rounded,
          type: TextInputType.phone),
      const SizedBox(height: 8),
      Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: const Color(0xFF1DB954).withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: const Color(0xFF1DB954).withValues(alpha: 0.3))),
        child: const Row(children: [
          Icon(Icons.info_rounded, color: Color(0xFF1DB954), size: 16),
          SizedBox(width: 8),
          Expanded(child: Text('You will receive a payment prompt on your phone',
              style: TextStyle(color: Color(0xFF1DB954), fontSize: 11))),
        ])),
    ] else ...[
      _fieldLabel('PayPal Email'),
      _inputField(_emailCtrl, 'your@paypal.com', Icons.email_rounded,
          type: TextInputType.emailAddress),
    ],

    const SizedBox(height: 28),

    SizedBox(width: double.infinity, height: 54,
      child: ElevatedButton(
        onPressed: (_paymentMethod == 'Wallet' && walletBalance < _totalPrice)
            ? null
            : _confirmBooking,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          disabledBackgroundColor: AppColors.cardBorder,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(_paymentMethod == 'Wallet'
              ? Icons.account_balance_wallet_rounded
              : Icons.lock_rounded,
              color: Colors.white, size: 18),
          const SizedBox(width: 8),
          Text('Pay XAF ${_totalPrice.toStringAsFixed(2)}',
              style: const TextStyle(fontWeight: FontWeight.w800,
                  fontSize: 16, color: Colors.white)),
        ]))),
    const SizedBox(height: 10),
    const Center(child: Text('Payments are secure and encrypted',
        style: TextStyle(color: AppColors.textGrey, fontSize: 11))),
  ]);

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 4 — CONFIRMED
  // ═══════════════════════════════════════════════════════════════════════════
  Widget _confirmedStep() {
    final b = _confirmedBooking;
    if (b == null) return const SizedBox();
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(children: [
        const SizedBox(height: 20),
        // Success animation
        Container(width: 100, height: 100,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.primary.withValues(alpha: 0.15),
            border: Border.all(color: AppColors.primary, width: 3)),
          child: const Icon(Icons.check_rounded, color: AppColors.primary, size: 56)),
        const SizedBox(height: 20),
        const Text('Booking Confirmed!', style: TextStyle(color: AppColors.textDark,
            fontWeight: FontWeight.w900, fontSize: 24)),
        const SizedBox(height: 6),
        Text('Your booking has been saved', style: TextStyle(
            color: AppColors.textGrey.withValues(alpha: 0.8), fontSize: 14)),
        const SizedBox(height: 28),

        // Booking card
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.primary.withValues(alpha: 0.3))),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            // Airline
            Row(children: [
              Icon(Icons.airplanemode_active_rounded,
                  color: _selectedFlight!.color, size: 20),
              const SizedBox(width: 8),
              Text(_selectedFlight!.airline,
                  style: TextStyle(color: _selectedFlight!.color,
                      fontWeight: FontWeight.w800, fontSize: 14)),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(20)),
                child: const Text('Confirmed', style: TextStyle(
                    color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.w700))),
            ]),
            const SizedBox(height: 16),
            // Route
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(_selectedFlight!.departure,
                    style: const TextStyle(color: AppColors.textDark,
                        fontWeight: FontWeight.w900, fontSize: 28)),
                Text(b.from, style: const TextStyle(
                    color: AppColors.textGrey, fontSize: 11)),
              ]),
              Column(children: [
                Icon(Icons.airplanemode_active_rounded,
                    color: _selectedFlight!.color, size: 22),
                Text(_selectedFlight!.duration,
                    style: const TextStyle(color: AppColors.textGrey, fontSize: 10)),
              ]),
              Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                Text(_selectedFlight!.arrival,
                    style: const TextStyle(color: AppColors.textDark,
                        fontWeight: FontWeight.w900, fontSize: 28)),
                Text(b.to, style: const TextStyle(
                    color: AppColors.textGrey, fontSize: 11)),
              ]),
            ]),
            const Divider(color: AppColors.cardBorder, height: 24),
            _confirmRow('Flight', '${b.flightNumber}  ·  ${b.classType}'),
            _confirmRow('Passenger', b.passengerName),
            _confirmRow('Date', b.date),
            if (b.isRoundTrip) _confirmRow('Return', b.returnDate),
            _confirmRow('Passengers', '${b.passengers}'),
            _confirmRow('Payment', b.paymentMethod),
            const Divider(color: AppColors.cardBorder, height: 20),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              const Text('Total Paid', style: TextStyle(color: AppColors.textGrey,
                  fontWeight: FontWeight.w700, fontSize: 14)),
              Text('XAF ${b.price.toStringAsFixed(2)}',
                  style: const TextStyle(color: AppColors.primary,
                      fontWeight: FontWeight.w900, fontSize: 22)),
            ]),
            const SizedBox(height: 12),
            Center(child: Text('Ref: ${b.reference}',
                style: TextStyle(color: AppColors.textGrey.withValues(alpha: 0.7),
                    fontSize: 12, fontWeight: FontWeight.w600))),
          ])),
        const SizedBox(height: 24),

        // Actions
        SizedBox(width: double.infinity, height: 50,
          child: ElevatedButton.icon(
            onPressed: () => Navigator.pop(context),
            icon: const Icon(Icons.check_rounded, color: Colors.white),
            label: const Text('Done', style: TextStyle(
                fontWeight: FontWeight.w800, fontSize: 15, color: Colors.white)),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14))))),
        const SizedBox(height: 12),
        TextButton(
          onPressed: () {
            setState(() {
              _step = 0;
              _selectedFlight = null;
              _passportUploaded = false;
              _ticketUploaded = false;
              _fromCtrl.clear(); _toCtrl.clear();
              _dateCtrl.clear(); _returnCtrl.clear();
              _nameCtrl.clear(); _passportCtrl.clear();
            });
          },
          child: const Text('Book Another Flight',
              style: TextStyle(color: AppColors.primary,
                  fontWeight: FontWeight.w700))),
      ]));
  }

  Widget _confirmRow(String label, String value) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Row(children: [
      Text(label, style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
      const Spacer(),
      Text(value, style: const TextStyle(color: AppColors.textDark,
          fontSize: 12, fontWeight: FontWeight.w600)),
    ]));

  // ── Reusable widgets ──────────────────────────────────────────────────────
  Widget _tripTypeBtn(String label, bool active, VoidCallback onTap) =>
    Expanded(child: GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: active ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(9)),
        child: Text(label, textAlign: TextAlign.center,
          style: TextStyle(
            color: active ? Colors.white : AppColors.textGrey,
            fontWeight: FontWeight.w700, fontSize: 13)))));

  Widget _fieldLabel(String t) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Text(t, style: const TextStyle(color: AppColors.textGrey,
        fontSize: 12, fontWeight: FontWeight.w600)));

  Widget _inputField(TextEditingController ctrl, String hint, IconData icon,
      {TextInputType type = TextInputType.text, bool obscure = false}) =>
    Container(
      decoration: BoxDecoration(color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder)),
      child: TextField(
        controller: ctrl,
        keyboardType: type,
        obscureText: obscure,
        onChanged: (_) => setState(() {}),
        style: const TextStyle(color: AppColors.textDark, fontSize: 14),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: AppColors.textGrey, fontSize: 13),
          prefixIcon: Icon(icon, color: AppColors.primary, size: 20),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 14))));

  Widget _dateField(TextEditingController ctrl, String hint) =>
    GestureDetector(
      onTap: () async {
        final d = await showDatePicker(
          context: context,
          initialDate: DateTime.now().add(const Duration(days: 1)),
          firstDate: DateTime.now(),
          lastDate: DateTime.now().add(const Duration(days: 365)),
          builder: (ctx, child) => Theme(
            data: Theme.of(ctx).copyWith(
              colorScheme: const ColorScheme.dark(primary: AppColors.primary)),
            child: child!));
        if (d != null) {
          ctrl.text = '${d.day}/${d.month}/${d.year}';
          setState(() {});
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.cardBorder)),
        child: Row(children: [
          const Icon(Icons.calendar_today_rounded,
              color: AppColors.primary, size: 18),
          const SizedBox(width: 10),
          Text(ctrl.text.isEmpty ? hint : ctrl.text,
            style: TextStyle(
              color: ctrl.text.isEmpty ? AppColors.textGrey : AppColors.textDark,
              fontSize: 14)),
        ])));

  Widget _counterBtn(IconData icon, VoidCallback? onTap) => GestureDetector(
    onTap: onTap,
    child: Container(width: 32, height: 32,
      decoration: BoxDecoration(
        color: onTap != null ? AppColors.primary.withValues(alpha: 0.15) : AppColors.bgCard,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.cardBorder)),
      child: Icon(icon,
        color: onTap != null ? AppColors.primary : AppColors.textGrey, size: 18)));
}
