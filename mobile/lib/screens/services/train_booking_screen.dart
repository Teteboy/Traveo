import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import 'services_screen.dart';
import '../wallet/wallet_state.dart';
import '../main_nav_screen.dart';

// ─────────────────────────────────────────────────────────────────────────────
// Model
// ─────────────────────────────────────────────────────────────────────────────
final List<TrainBooking> globalTrainBookings = [];

class TrainBooking {
  final String id, from, to, date, returnDate, operator, trainNumber,
      departure, arrival, classType, passengerName, idNumber,
      paymentMethod, reference, status;
  final double price;
  final bool isRoundTrip;
  final int passengers;

  TrainBooking({
    required this.id, required this.from, required this.to,
    required this.date, required this.returnDate, required this.operator,
    required this.trainNumber, required this.departure, required this.arrival,
    required this.classType, required this.passengerName,
    required this.idNumber, required this.paymentMethod,
    required this.reference, required this.price,
    required this.isRoundTrip, required this.passengers,
    this.status = 'Confirmed',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal data
// ─────────────────────────────────────────────────────────────────────────────
class _Train {
  final String operator, trainNo, from, to, departure, arrival,
      duration, classType;
  final double price;
  final int stops;
  final Color color;
  const _Train({
    required this.operator, required this.trainNo, required this.from,
    required this.to, required this.departure, required this.arrival,
    required this.duration, required this.classType, required this.price,
    required this.stops, required this.color,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Train data — Cameroon Rail (Camrail) network
// ─────────────────────────────────────────────────────────────────────────────
final _allTrains = [
  _Train(operator:'Camrail', trainNo:'IC 101', from:'Yaoundé', to:'Douala',
    departure:'06:30', arrival:'10:00', duration:'3h 30m', classType:'Economy',
    price:12.0, stops:2, color:const Color(0xFF9C27B0)),
  _Train(operator:'Camrail', trainNo:'IC 102', from:'Yaoundé', to:'Douala',
    departure:'14:00', arrival:'17:30', duration:'3h 30m', classType:'First Class',
    price:28.0, stops:2, color:const Color(0xFF9C27B0)),
  _Train(operator:'Camrail', trainNo:'IC 103', from:'Douala', to:'Yaoundé',
    departure:'07:00', arrival:'10:30', duration:'3h 30m', classType:'Economy',
    price:12.0, stops:2, color:const Color(0xFF9C27B0)),
  _Train(operator:'Camrail', trainNo:'IC 104', from:'Douala', to:'Yaoundé',
    departure:'15:00', arrival:'18:30', duration:'3h 30m', classType:'First Class',
    price:28.0, stops:2, color:const Color(0xFF9C27B0)),
  _Train(operator:'Camrail', trainNo:'EN 201', from:'Yaoundé', to:'Ngaoundéré',
    departure:'18:00', arrival:'06:00+1', duration:'12h 00m', classType:'Sleeper',
    price:35.0, stops:4, color:const Color(0xFF3F51B5)),
  _Train(operator:'Camrail', trainNo:'EN 202', from:'Ngaoundéré', to:'Yaoundé',
    departure:'17:30', arrival:'05:30+1', duration:'12h 00m', classType:'Sleeper',
    price:35.0, stops:4, color:const Color(0xFF3F51B5)),
  _Train(operator:'Camrail', trainNo:'RE 301', from:'Yaoundé', to:'Belabo',
    departure:'08:00', arrival:'13:30', duration:'5h 30m', classType:'Economy',
    price:18.0, stops:3, color:const Color(0xFF009688)),
  _Train(operator:'Camrail', trainNo:'RE 302', from:'Belabo', to:'Yaoundé',
    departure:'09:00', arrival:'14:30', duration:'5h 30m', classType:'Economy',
    price:18.0, stops:3, color:const Color(0xFF009688)),
  _Train(operator:'Camrail', trainNo:'IC 401', from:'Douala', to:'Kumba',
    departure:'07:30', arrival:'11:00', duration:'3h 30m', classType:'Economy',
    price:10.0, stops:2, color:const Color(0xFFFF5722)),
  _Train(operator:'Camrail', trainNo:'IC 402', from:'Kumba', to:'Douala',
    departure:'12:00', arrival:'15:30', duration:'3h 30m', classType:'Economy',
    price:10.0, stops:2, color:const Color(0xFFFF5722)),
];

const _purple = Color(0xFF9C27B0);

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────
class TrainBookingScreen extends StatefulWidget {
  const TrainBookingScreen({super.key});
  @override State<TrainBookingScreen> createState() => _State();
}

class _State extends State<TrainBookingScreen> {
  // 0=Search 1=Select 2=Docs 3=Payment 4=Confirmed
  int _step = 0;

  // Step 0
  final _fromCtrl   = TextEditingController();
  final _toCtrl     = TextEditingController();
  final _dateCtrl   = TextEditingController();
  final _returnCtrl = TextEditingController();
  bool _roundTrip   = false;
  int  _passengers  = 1;
  String _classFilter = 'All';

  // Step 1
  _Train? _selected;
  List<_Train> _results = [];

  // Step 2
  final _nameCtrl      = TextEditingController();
  final _idCtrl        = TextEditingController();
  final _emailCtrl     = TextEditingController();
  final _phoneCtrl     = TextEditingController();
  bool _idUploaded     = false;
  bool _ticketUploaded = false;

  // Step 3
  String _pay = 'Credit Card';
  final _cardCtrl = TextEditingController();
  final _expCtrl  = TextEditingController();
  final _cvvCtrl  = TextEditingController();
  final _mobCtrl  = TextEditingController();

  TrainBooking? _confirmed;

  @override
  void dispose() {
    for (final c in [_fromCtrl,_toCtrl,_dateCtrl,_returnCtrl,
        _nameCtrl,_idCtrl,_emailCtrl,_phoneCtrl,
        _cardCtrl,_expCtrl,_cvvCtrl,_mobCtrl]) { c.dispose(); }
    super.dispose();
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  String get _title => const [
    'Search Trains', 'Select Train',
    'Passenger & Documents', 'Payment', 'Booking Confirmed',
  ][_step];

  double get _total =>
      (_selected?.price ?? 0) * _passengers * (_roundTrip ? 1.8 : 1.0);

  void _doSearch() {
    final from = _fromCtrl.text.trim().toLowerCase();
    final to   = _toCtrl.text.trim().toLowerCase();
    final res  = _allTrains.where((t) {
      final mf = from.isEmpty || t.from.toLowerCase().contains(from);
      final mt = to.isEmpty   || t.to.toLowerCase().contains(to);
      final mc = _classFilter == 'All' || t.classType == _classFilter;
      return mf && mt && mc;
    }).toList();
    setState(() { _results = res; _step = 1; });
  }

  void _confirmBooking() {
    final ref = 'TRV-TR-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
    final now = DateTime.now();
    const mo = ['Jan','Feb','Mar','Apr','May','Jun',
                 'Jul','Aug','Sep','Oct','Nov','Dec'];
    final dateStr = '${mo[now.month-1]} ${now.day}, ${now.year}';

    if (_pay == 'Wallet') {
      walletBalance -= _total;
      walletTransactions.insert(0, {
        'type':'debit',
        'label':'Train: ${_selected!.from} → ${_selected!.to}',
        'amount':-_total, 'date':dateStr, 'icon':'train',
      });
    }

    final booking = TrainBooking(
      id: ref, from: _selected!.from, to: _selected!.to,
      date: _dateCtrl.text.isNotEmpty ? _dateCtrl.text : dateStr,
      returnDate: _returnCtrl.text,
      operator: _selected!.operator, trainNumber: _selected!.trainNo,
      departure: _selected!.departure, arrival: _selected!.arrival,
      classType: _selected!.classType,
      passengerName: _nameCtrl.text, idNumber: _idCtrl.text,
      paymentMethod: _pay, reference: ref,
      price: _total, isRoundTrip: _roundTrip, passengers: _passengers,
    );
    globalTrainBookings.insert(0, booking);
    globalServiceBookings.insert(0, ServiceBooking(
      id: ref, type: 'Train - ${_selected!.classType}',
      name: '${_selected!.from} → ${_selected!.to}',
      description: '${_selected!.operator}  ${_selected!.trainNo}',
      destination: _selected!.to, date: booking.date,
      price: _total, icon: Icons.train_rounded,
      color: _selected!.color,
    ));
    bookingsRefreshNotifier.value++;
    setState(() { _confirmed = booking; _step = 4; });
  }

  // ── Build ─────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Column(children: [
        _topBar(),
        if (_step < 4) _progressBar(),
        Expanded(child: _body()),
      ]));
  }

  Widget _body() {
    switch (_step) {
      case 0: return _searchStep();
      case 1: return _selectStep();
      case 2: return _docsStep();
      case 3: return _payStep();
      case 4: return _doneStep();
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
            color: _purple.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(20)),
          child: const Row(children: [
            Icon(Icons.train_rounded, color: _purple, size: 14),
            SizedBox(width: 4),
            Text('Train', style: TextStyle(color: _purple,
                fontSize: 11, fontWeight: FontWeight.w700)),
          ])),
      ]))));

  Widget _progressBar() => Container(
    color: AppColors.bgCard,
    padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
    child: Row(children: List.generate(4, (i) =>
      Expanded(child: Row(children: [
        Expanded(child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          height: 4,
          decoration: BoxDecoration(
            color: i <= _step ? _purple : AppColors.cardBorder,
            borderRadius: BorderRadius.circular(2)))),
        if (i < 3) const SizedBox(width: 4),
      ])))));

  // ═══════════════════════════════════════════════════════════════
  // STEP 0 — SEARCH
  // ═══════════════════════════════════════════════════════════════
  Widget _searchStep() => ListView(padding: const EdgeInsets.all(16), children: [
    Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder)),
      child: Row(children: [
        _tripBtn('One Way', !_roundTrip,
            () => setState(() => _roundTrip = false)),
        _tripBtn('Round Trip', _roundTrip,
            () => setState(() => _roundTrip = true)),
      ])),
    const SizedBox(height: 16),
    _lbl('From'),
    _field(_fromCtrl, 'e.g. Yaoundé', Icons.train_rounded),
    const SizedBox(height: 12),
    _lbl('To'),
    _field(_toCtrl, 'e.g. Douala, Ngaoundéré',
        Icons.location_on_rounded),
    const SizedBox(height: 12),
    Row(children: [
      Expanded(child: Column(
        crossAxisAlignment: CrossAxisAlignment.start, children: [
        _lbl('Departure Date'),
        _dateField(_dateCtrl, 'Select date'),
      ])),
      if (_roundTrip) ...[
        const SizedBox(width: 12),
        Expanded(child: Column(
          crossAxisAlignment: CrossAxisAlignment.start, children: [
          _lbl('Return Date'),
          _dateField(_returnCtrl, 'Select date'),
        ])),
      ],
    ]),
    const SizedBox(height: 16),
    _lbl('Passengers'),
    Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.cardBorder)),
      child: Row(children: [
        const Icon(Icons.people_rounded, color: _purple, size: 20),
        const SizedBox(width: 8),
        Text('$_passengers Passenger${_passengers > 1 ? 's' : ''}',
          style: const TextStyle(color: AppColors.textDark, fontSize: 14)),
        const Spacer(),
        _cntBtn(Icons.remove_rounded,
            _passengers > 1 ? () => setState(() => _passengers--) : null),
        Padding(padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text('$_passengers', style: const TextStyle(
              color: AppColors.textDark,
              fontWeight: FontWeight.w800, fontSize: 16))),
        _cntBtn(Icons.add_rounded,
            _passengers < 9 ? () => setState(() => _passengers++) : null),
      ])),
    const SizedBox(height: 16),
    _lbl('Class'),
    SizedBox(height: 44, child: ListView(
      scrollDirection: Axis.horizontal,
      children: ['All','Economy','First Class','Sleeper'].map((c) =>
        GestureDetector(
          onTap: () => setState(() => _classFilter = c),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            margin: const EdgeInsets.only(right: 10),
            padding: const EdgeInsets.symmetric(
                horizontal: 18, vertical: 10),
            decoration: BoxDecoration(
              color: _classFilter == c ? _purple : AppColors.bgCard,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                  color: _classFilter == c
                      ? _purple : AppColors.cardBorder)),
            child: Text(c, style: TextStyle(
                color: _classFilter == c
                    ? Colors.white : AppColors.textGrey,
                fontWeight: FontWeight.w600,
                fontSize: 13))))).toList())),
    const SizedBox(height: 28),
    SizedBox(width: double.infinity, height: 52,
      child: ElevatedButton.icon(
        onPressed: _doSearch,
        icon: const Icon(Icons.search_rounded, color: Colors.white),
        label: const Text('Search Trains', style: TextStyle(
            fontWeight: FontWeight.w800,
            fontSize: 15, color: Colors.white)),
        style: ElevatedButton.styleFrom(
          backgroundColor: _purple,
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14))))),
    const SizedBox(height: 20),
    const Text('Popular Routes', style: TextStyle(
        color: AppColors.textDark,
        fontWeight: FontWeight.w700, fontSize: 14)),
    const SizedBox(height: 10),
    Wrap(spacing: 8, runSpacing: 8, children: [
      'Yaoundé → Douala', 'Douala → Yaoundé',
      'Yaoundé → Ngaoundéré', 'Douala → Kumba',
      'Yaoundé → Belabo',
    ].map((r) => GestureDetector(
      onTap: () {
        final p = r.split(' → ');
        _fromCtrl.text = p[0]; _toCtrl.text = p[1];
        setState(() {});
      },
      child: Container(
        padding: const EdgeInsets.symmetric(
            horizontal: 12, vertical: 7),
        decoration: BoxDecoration(color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.cardBorder)),
        child: Text(r, style: const TextStyle(
            color: AppColors.textGrey, fontSize: 12))))).toList()),
    const SizedBox(height: 20),
  ]);

  // ═══════════════════════════════════════════════════════════════
  // STEP 1 — SELECT TRAIN
  // ═══════════════════════════════════════════════════════════════
  Widget _selectStep() {
    if (_results.isEmpty) {
      return Center(child: Column(
        mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(Icons.train_rounded,
            color: AppColors.textGrey.withValues(alpha: 0.3), size: 80),
        const SizedBox(height: 16),
        const Text('No trains found', style: TextStyle(
            color: AppColors.textGrey, fontSize: 16)),
        const SizedBox(height: 8),
        const Text('Try different dates or routes',
            style: TextStyle(color: AppColors.textGrey, fontSize: 12)),
        const SizedBox(height: 24),
        TextButton(
          onPressed: () => setState(() => _step = 0),
          child: const Text('Modify Search',
              style: TextStyle(color: _purple))),
      ]));
    }
    return ListView(padding: const EdgeInsets.all(16), children: [
      Container(
        padding: const EdgeInsets.all(14),
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder)),
        child: Row(children: [
          const Icon(Icons.train_rounded, color: _purple, size: 18),
          const SizedBox(width: 8),
          Expanded(child: Text(
            '${_fromCtrl.text.isEmpty ? 'Any' : _fromCtrl.text} → '
            '${_toCtrl.text.isEmpty ? 'Any' : _toCtrl.text}  ·  '
            '$_passengers pax  ·  $_classFilter',
            style: const TextStyle(
                color: AppColors.textGrey, fontSize: 12))),
          GestureDetector(
            onTap: () => setState(() => _step = 0),
            child: const Text('Edit', style: TextStyle(
                color: _purple, fontSize: 12,
                fontWeight: FontWeight.w700))),
        ])),
      Text('${_results.length} train${_results.length == 1 ? '' : 's'} found',
          style: const TextStyle(color: AppColors.textDark,
              fontWeight: FontWeight.w700, fontSize: 14)),
      const SizedBox(height: 12),
      ..._results.map(_trainCard),
    ]);
  }

  Widget _trainCard(_Train t) {
    final tot = t.price * _passengers * (_roundTrip ? 1.8 : 1.0);
    return GestureDetector(
      onTap: () => setState(() { _selected = t; _step = 2; }),
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        decoration: BoxDecoration(color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: t.color.withValues(alpha: 0.4))),
        child: Column(children: [
          Container(
            padding: const EdgeInsets.fromLTRB(14,12,14,10),
            decoration: BoxDecoration(
              color: t.color.withValues(alpha: 0.08),
              borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(16))),
            child: Row(children: [
              Container(width: 36, height: 36,
                decoration: BoxDecoration(
                  color: t.color.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8)),
                child: Icon(Icons.train_rounded,
                    color: t.color, size: 20)),
              const SizedBox(width: 10),
              Expanded(child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                Text(t.operator, style: const TextStyle(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.w800, fontSize: 13)),
                Text(t.trainNo, style: TextStyle(
                    color: t.color, fontSize: 11,
                    fontWeight: FontWeight.w600)),
              ])),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: t.color.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8)),
                child: Text(t.classType, style: TextStyle(
                    color: t.color, fontSize: 10,
                    fontWeight: FontWeight.w700))),
            ])),
          Padding(
            padding: const EdgeInsets.fromLTRB(14,14,14,12),
            child: Row(children: [
              Column(crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                Text(t.departure, style: const TextStyle(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.w900, fontSize: 22)),
                Text(t.from, style: const TextStyle(
                    color: AppColors.textGrey, fontSize: 11)),
              ]),
              Expanded(child: Column(children: [
                Row(children: [
                  const SizedBox(width: 4),
                  Expanded(child: Container(height: 1,
                      color: AppColors.cardBorder)),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 6),
                    child: Icon(Icons.train_rounded,
                        color: t.color, size: 18)),
                  Expanded(child: Container(height: 1,
                      color: AppColors.cardBorder)),
                  const SizedBox(width: 4),
                ]),
                const SizedBox(height: 4),
                Text(t.duration, style: const TextStyle(
                    color: AppColors.textGrey, fontSize: 10)),
                if (t.stops > 0)
                  Text('${t.stops} stop${t.stops > 1 ? 's' : ''}',
                      style: const TextStyle(
                          color: Colors.orange, fontSize: 9))
                else
                  const Text('Direct', style: TextStyle(
                      color: Color(0xFF1DB954), fontSize: 9)),
              ])),
              Column(crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                Text(t.arrival, style: const TextStyle(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.w900, fontSize: 22)),
                Text(t.to, style: const TextStyle(
                    color: AppColors.textGrey, fontSize: 11)),
              ]),
            ])),
          Container(
            padding: const EdgeInsets.fromLTRB(14,10,14,12),
            decoration: BoxDecoration(
              color: AppColors.bgMid.withValues(alpha: 0.5),
              borderRadius: const BorderRadius.vertical(
                  bottom: Radius.circular(16))),
            child: Row(children: [
              Text('XAF ${t.price.toStringAsFixed(0)}/person',
                  style: const TextStyle(
                      color: AppColors.textGrey, fontSize: 12)),
              const Spacer(),
              Text('Total: XAF ${tot.toStringAsFixed(0)}',
                  style: const TextStyle(color: _purple,
                      fontWeight: FontWeight.w900, fontSize: 16)),
              const SizedBox(width: 12),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 14, vertical: 7),
                decoration: BoxDecoration(color: t.color,
                    borderRadius: BorderRadius.circular(10)),
                child: const Text('Select', style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700, fontSize: 12))),
            ])),
        ])));
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 2 — PASSENGER & DOCS
  // ═══════════════════════════════════════════════════════════════
  Widget _docsStep() {
    final t = _selected!;
    return ListView(padding: const EdgeInsets.all(16), children: [
      Container(
        padding: const EdgeInsets.all(14),
        margin: const EdgeInsets.only(bottom: 20),
        decoration: BoxDecoration(
          color: t.color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: t.color.withValues(alpha: 0.4))),
        child: Row(children: [
          Icon(Icons.train_rounded, color: t.color, size: 22),
          const SizedBox(width: 10),
          Expanded(child: Column(
            crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('${t.from} → ${t.to}', style: const TextStyle(
                color: AppColors.textDark,
                fontWeight: FontWeight.w800, fontSize: 13)),
            Text('${t.operator}  ·  ${t.departure}–${t.arrival}  ·  ${t.classType}',
                style: const TextStyle(
                    color: AppColors.textGrey, fontSize: 11)),
          ])),
          Text('XAF ${_total.toStringAsFixed(0)}',
              style: TextStyle(color: t.color,
                  fontWeight: FontWeight.w900, fontSize: 16)),
        ])),
      const Text('Passenger Information', style: TextStyle(
          color: AppColors.textDark,
          fontWeight: FontWeight.w700, fontSize: 15)),
      const SizedBox(height: 12),
      _lbl('Full Name'),
      _field(_nameCtrl, 'e.g. Jean Dupont', Icons.person_rounded),
      const SizedBox(height: 12),
      _lbl('National ID / Passport'),
      _field(_idCtrl, 'e.g. AB1234567', Icons.credit_card_rounded),
      const SizedBox(height: 12),
      _lbl('Email Address'),
      _field(_emailCtrl, 'e.g. jean@email.com',
          Icons.email_rounded, type: TextInputType.emailAddress),
      const SizedBox(height: 12),
      _lbl('Phone Number'),
      _field(_phoneCtrl, '+237 6XX XXX XXX',
          Icons.phone_rounded, type: TextInputType.phone),
      const SizedBox(height: 24),
      const Text('Required Documents', style: TextStyle(
          color: AppColors.textDark,
          fontWeight: FontWeight.w700, fontSize: 15)),
      const SizedBox(height: 4),
      const Text('Upload scanned copies for verification',
          style: TextStyle(color: AppColors.textGrey, fontSize: 12)),
      const SizedBox(height: 12),
      _docCard(
        title: 'National ID / Passport',
        subtitle: 'PDF or image — required for boarding',
        icon: Icons.badge_rounded,
        uploaded: _idUploaded,
        onTap: () => setState(() => _idUploaded = true)),
      const SizedBox(height: 10),
      _docCard(
        title: 'Previous Ticket (optional)',
        subtitle: 'Only needed for rebooking',
        icon: Icons.confirmation_number_rounded,
        uploaded: _ticketUploaded,
        onTap: () => setState(() => _ticketUploaded = true),
        required: false),
      const SizedBox(height: 28),
      SizedBox(width: double.infinity, height: 52,
        child: ElevatedButton(
          onPressed: _idUploaded && _nameCtrl.text.isNotEmpty &&
              _idCtrl.text.isNotEmpty
              ? () => setState(() => _step = 3) : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: _purple,
            disabledBackgroundColor: AppColors.cardBorder,
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14))),
          child: const Text('Continue to Payment',
              style: TextStyle(fontWeight: FontWeight.w800,
                  fontSize: 15, color: Colors.white)))),
      const SizedBox(height: 8),
      const Center(child: Text(
          'Fill all required fields and upload ID to continue',
          style: TextStyle(color: AppColors.textGrey, fontSize: 11))),
    ]);
  }

  Widget _docCard({
    required String title, required String subtitle,
    required IconData icon, required bool uploaded,
    required VoidCallback onTap, bool required = true,
  }) => GestureDetector(
    onTap: onTap,
    child: AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: uploaded
            ? _purple.withValues(alpha: 0.07) : AppColors.bgCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
            color: uploaded ? _purple : AppColors.cardBorder)),
      child: Row(children: [
        Container(width: 44, height: 44,
          decoration: BoxDecoration(
            color: (uploaded ? _purple : AppColors.textGrey)
                .withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(12)),
          child: Icon(icon,
              color: uploaded ? _purple : AppColors.textGrey, size: 22)),
        const SizedBox(width: 12),
        Expanded(child: Column(
          crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Text(title, style: const TextStyle(
                color: AppColors.textDark,
                fontWeight: FontWeight.w700, fontSize: 13)),
            if (required) const Text(' *',
                style: TextStyle(color: Colors.red, fontSize: 12)),
          ]),
          Text(subtitle, style: const TextStyle(
              color: AppColors.textGrey, fontSize: 11)),
        ])),
        if (uploaded)
          const Icon(Icons.check_circle_rounded, color: _purple, size: 24)
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
      ])));

  // ═══════════════════════════════════════════════════════════════
  // STEP 3 — PAYMENT
  // ═══════════════════════════════════════════════════════════════
  Widget _payStep() {
    final t = _selected!;
    return ListView(padding: const EdgeInsets.all(16), children: [
      Container(
        padding: const EdgeInsets.all(16),
        margin: const EdgeInsets.only(bottom: 20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft, end: Alignment.bottomRight,
            colors: [_purple.withValues(alpha: 0.2),
                     _purple.withValues(alpha: 0.05)]),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: _purple.withValues(alpha: 0.3))),
        child: Column(children: [
          _prow('Route', '${t.from} → ${t.to}'),
          _prow('Train', '${t.operator}  ${t.trainNo}'),
          _prow('Class', t.classType),
          _prow('Per person', 'XAF ${t.price.toStringAsFixed(2)}'),
          _prow('Passengers', '$_passengers'),
          if (_roundTrip) _prow('Round Trip (+80%)',
              '+XAF ${(t.price * _passengers * 0.8).toStringAsFixed(2)}'),
          const Divider(color: AppColors.cardBorder, height: 20),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
            const Text('Total', style: TextStyle(
                color: AppColors.textDark,
                fontWeight: FontWeight.w800, fontSize: 16)),
            Text('XAF ${_total.toStringAsFixed(2)}',
                style: const TextStyle(color: _purple,
                    fontWeight: FontWeight.w900, fontSize: 20)),
          ]),
        ])),
      const Text('Payment Method', style: TextStyle(
          color: AppColors.textDark,
          fontWeight: FontWeight.w700, fontSize: 15)),
      const SizedBox(height: 12),
      ...[
        ('Wallet',       Icons.account_balance_wallet_rounded, Color(0xFF4F46E5)),
        ('Credit Card',  Icons.credit_card_rounded,            Color(0xFF6366F1)),
        ('Mobile Money', Icons.phone_android_rounded,          Color(0xFF1DB954)),
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
      const SizedBox(height: 16),
      if (_pay == 'Wallet') ...[
        _walletCard(),
        const SizedBox(height: 8),
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
      ],
      const SizedBox(height: 28),
      SizedBox(width: double.infinity, height: 54,
        child: ElevatedButton(
          onPressed: (_pay == 'Wallet' && walletBalance < _total)
              ? null : _confirmBooking,
          style: ElevatedButton.styleFrom(
            backgroundColor: _purple,
            disabledBackgroundColor: AppColors.cardBorder,
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14))),
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
          style: TextStyle(color: AppColors.textGrey, fontSize: 11))),
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

  // ═══════════════════════════════════════════════════════════════
  // STEP 4 — CONFIRMED
  // ═══════════════════════════════════════════════════════════════
  Widget _doneStep() {
    final b = _confirmed!;
    final t = _selected!;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(children: [
        const SizedBox(height: 20),
        Container(width: 100, height: 100,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: _purple.withValues(alpha: 0.12),
            border: Border.all(color: _purple, width: 3)),
          child: const Icon(Icons.check_rounded,
              color: _purple, size: 56)),
        const SizedBox(height: 20),
        const Text('Booking Confirmed!', style: TextStyle(
            color: AppColors.textDark,
            fontWeight: FontWeight.w900, fontSize: 24)),
        const SizedBox(height: 6),
        const Text('Your train ticket has been saved',
            style: TextStyle(
                color: AppColors.textGrey, fontSize: 14)),
        const SizedBox(height: 28),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: _purple.withValues(alpha: 0.3))),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start,
            children: [
            Row(children: [
              Icon(Icons.train_rounded, color: t.color, size: 20),
              const SizedBox(width: 8),
              Text(t.operator, style: TextStyle(
                  color: t.color,
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
                Text(t.departure, style: const TextStyle(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.w900, fontSize: 28)),
                Text(b.from, style: const TextStyle(
                    color: AppColors.textGrey, fontSize: 11)),
              ]),
              Column(children: [
                Icon(Icons.train_rounded, color: t.color, size: 22),
                Text(t.duration, style: const TextStyle(
                    color: AppColors.textGrey, fontSize: 10)),
              ]),
              Column(crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                Text(t.arrival, style: const TextStyle(
                    color: AppColors.textDark,
                    fontWeight: FontWeight.w900, fontSize: 28)),
                Text(b.to, style: const TextStyle(
                    color: AppColors.textGrey, fontSize: 11)),
              ]),
            ]),
            const Divider(color: AppColors.cardBorder, height: 24),
            _crow('Train', '${b.trainNumber}  ·  ${b.classType}'),
            _crow('Passenger', b.passengerName),
            _crow('Date', b.date),
            if (b.isRoundTrip && b.returnDate.isNotEmpty)
              _crow('Return', b.returnDate),
            _crow('Passengers', '${b.passengers}'),
            _crow('Payment', b.paymentMethod),
            const Divider(color: AppColors.cardBorder, height: 20),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
              const Text('Total Paid', style: TextStyle(
                  color: AppColors.textGrey,
                  fontWeight: FontWeight.w700, fontSize: 14)),
              Text('XAF ${b.price.toStringAsFixed(2)}',
                  style: const TextStyle(color: _purple,
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
              backgroundColor: _purple,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14))))),
        const SizedBox(height: 12),
        TextButton(
          onPressed: () => setState(() {
            _step = 0; _selected = null;
            _idUploaded = false; _ticketUploaded = false;
            _fromCtrl.clear(); _toCtrl.clear();
            _dateCtrl.clear(); _returnCtrl.clear();
            _nameCtrl.clear(); _idCtrl.clear();
            _confirmed = null;
          }),
          child: const Text('Book Another Train', style: TextStyle(
              color: _purple, fontWeight: FontWeight.w700))),
      ]));
  }

  // ── Shared helpers ─────────────────────────────────────────────
  Widget _tripBtn(String label, bool active, VoidCallback onTap) =>
    Expanded(child: GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: active ? _purple : Colors.transparent,
          borderRadius: BorderRadius.circular(9)),
        child: Text(label, textAlign: TextAlign.center,
          style: TextStyle(
            color: active ? Colors.white : AppColors.textGrey,
            fontWeight: FontWeight.w700, fontSize: 13)))));

  Widget _prow(String l, String v) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Row(children: [
      Text(l, style: const TextStyle(
          color: AppColors.textGrey, fontSize: 13)),
      const Spacer(),
      Text(v, style: const TextStyle(
          color: AppColors.textDark, fontSize: 13)),
    ]));

  Widget _crow(String l, String v) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Row(children: [
      Text(l, style: const TextStyle(
          color: AppColors.textGrey, fontSize: 12)),
      const Spacer(),
      Text(v, style: const TextStyle(
          color: AppColors.textDark, fontSize: 12,
          fontWeight: FontWeight.w600)),
    ]));

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
          prefixIcon: Icon(icon, color: _purple, size: 20),
          border: InputBorder.none,
          contentPadding:
              const EdgeInsets.symmetric(vertical: 14))));

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
              colorScheme: const ColorScheme.dark(
                  primary: _purple)),
            child: child!));
        if (d != null) {
          ctrl.text = '${d.day}/${d.month}/${d.year}';
          setState(() {});
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(
            horizontal: 14, vertical: 14),
        decoration: BoxDecoration(color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.cardBorder)),
        child: Row(children: [
          const Icon(Icons.calendar_today_rounded,
              color: _purple, size: 18),
          const SizedBox(width: 10),
          Text(ctrl.text.isEmpty ? hint : ctrl.text,
            style: TextStyle(
              color: ctrl.text.isEmpty
                  ? AppColors.textGrey : AppColors.textDark,
              fontSize: 14)),
        ])));

  Widget _cntBtn(IconData icon, VoidCallback? onTap) => GestureDetector(
    onTap: onTap,
    child: Container(width: 32, height: 32,
      decoration: BoxDecoration(
        color: onTap != null
            ? _purple.withValues(alpha: 0.15) : AppColors.bgCard,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.cardBorder)),
      child: Icon(icon,
        color: onTap != null ? _purple : AppColors.textGrey,
        size: 18)));
}
