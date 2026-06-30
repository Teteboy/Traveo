import 'dart:math';
import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

// ── Data model ────────────────────────────────────────────────────────────────
enum EVisaStatus { pending, approved, rejected }

class EVisaDemand {
  final String id;
  final String country;
  final String applicantName;
  final String passportNumber;
  final String passportCreated;
  final String passportExpiry;
  final double price;
  EVisaStatus status;
  final DateTime submittedAt;

  EVisaDemand({
    required this.id,
    required this.country,
    required this.applicantName,
    required this.passportNumber,
    required this.passportCreated,
    required this.passportExpiry,
    required this.price,
    this.status = EVisaStatus.pending,
    required this.submittedAt,
  });
}

// Global list so demands persist across the session
final List<EVisaDemand> globalEVisaDemands = [];

// ── Eligibility data ─────────────────────────────────────────────────────────
const _eligibleCountries = {
  'France':       {'eligible': true,  'price': 75.0,  'days': 30},
  'Germany':      {'eligible': true,  'price': 80.0,  'days': 90},
  'United States':{'eligible': true,  'price': 160.0, 'days': 90},
  'United Kingdom':{'eligible': true, 'price': 115.0, 'days': 30},
  'Canada':       {'eligible': true,  'price': 100.0, 'days': 60},
  'Japan':        {'eligible': true,  'price': 35.0,  'days': 90},
  'Brazil':       {'eligible': true,  'price': 45.0,  'days': 30},
  'India':        {'eligible': true,  'price': 25.0,  'days': 60},
  'China':        {'eligible': false, 'price': 0.0,   'days': 0},
  'Russia':       {'eligible': false, 'price': 0.0,   'days': 0},
  'Australia':    {'eligible': true,  'price': 140.0, 'days': 90},
  'South Africa': {'eligible': true,  'price': 30.0,  'days': 30},
  'Kenya':        {'eligible': true,  'price': 50.0,  'days': 90},
  'Morocco':      {'eligible': true,  'price': 40.0,  'days': 30},
  'UAE':          {'eligible': true,  'price': 90.0,  'days': 30},
  'Turkey':       {'eligible': true,  'price': 50.0,  'days': 30},
  'Thailand':     {'eligible': true,  'price': 35.0,  'days': 60},
  'Singapore':    {'eligible': true,  'price': 30.0,  'days': 30},
  'Nigeria':      {'eligible': false, 'price': 0.0,   'days': 0},
  'Ethiopia':     {'eligible': true,  'price': 52.0,  'days': 30},
};

// ── Main Entry Screen ─────────────────────────────────────────────────────────
class EVisaScreen extends StatefulWidget {
  const EVisaScreen({super.key});
  @override State<EVisaScreen> createState() => _EVisaScreenState();
}

class _EVisaScreenState extends State<EVisaScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tab;

  @override
  void initState() {
    super.initState();
    _tab = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() { _tab.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Column(children: [
        _header(context),
        Container(
          color: AppColors.bgCard,
          child: TabBar(
            controller: _tab,
            indicatorColor: AppColors.primary,
            labelColor: AppColors.primary,
            unselectedLabelColor: AppColors.textGrey,
            labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12),
            tabs: const [
              Tab(text: 'Eligibility'),
              Tab(text: 'My Demands'),
              Tab(text: 'Documents'),
            ],
          ),
        ),
        Expanded(child: TabBarView(controller: _tab, children: [
          _EligibilityTab(onApply: (country, price) {
            _tab.animateTo(0); // stay, navigator handles it
            Navigator.push(context, MaterialPageRoute(
              builder: (_) => EVisaApplicationScreen(
                country: country, price: price,
                onSubmitted: (_) => setState(() {}),
              ),
            ));
          }),
          _DemandsTab(onUpdate: () => setState(() {})),
          const _DocumentsTab(),
        ])),
      ]),
    );
  }

  Widget _header(BuildContext context) => Container(
    color: AppColors.bgDark,
    child: SafeArea(bottom: false, child: Padding(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
      child: Row(children: [
        GestureDetector(
          onTap: () => Navigator.pop(context),
          child: Container(width: 36, height: 36,
            decoration: BoxDecoration(color: AppColors.bgCard,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.cardBorder)),
            child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 18))),
        const SizedBox(width: 12),
        Container(width: 36, height: 36,
          decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(10)),
          child: const Icon(Icons.document_scanner_rounded, color: AppColors.primary, size: 20)),
        const SizedBox(width: 10),
        const Text('E-Visa', style: TextStyle(color: AppColors.textDark,
            fontWeight: FontWeight.w900, fontSize: 18)),
        const Spacer(),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.primary.withValues(alpha: 0.4))),
          child: const Row(mainAxisSize: MainAxisSize.min, children: [
            Icon(Icons.verified_rounded, color: AppColors.primary, size: 14),
            SizedBox(width: 4),
            Text('Official', style: TextStyle(color: AppColors.primary,
                fontSize: 11, fontWeight: FontWeight.w700)),
          ])),
      ]))));
}

// ── Tab 1: Eligibility ────────────────────────────────────────────────────────
class _EligibilityTab extends StatefulWidget {
  final void Function(String country, double price) onApply;
  const _EligibilityTab({required this.onApply});
  @override State<_EligibilityTab> createState() => _EligibilityTabState();
}

class _EligibilityTabState extends State<_EligibilityTab> {
  final _ctrl = TextEditingController();
  String? _selected;
  Map<String, dynamic>? _result;

  void _check() {
    final name = _selected ?? _ctrl.text.trim();
    if (name.isEmpty) return;
    setState(() {
      _result = _eligibleCountries[name] ??
          {'eligible': false, 'price': 0.0, 'days': 0, 'notFound': true};
    });
  }

  @override
  Widget build(BuildContext context) {
    return ListView(padding: const EdgeInsets.all(16), children: [
      // Banner
      Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: [
            AppColors.primary.withValues(alpha: 0.2),
            AppColors.info.withValues(alpha: 0.1),
          ]),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
        ),
        child: const Row(children: [
          Icon(Icons.public_rounded, color: AppColors.primary, size: 36),
          SizedBox(width: 14),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Check E-Visa Eligibility', style: TextStyle(color: Colors.white,
                fontWeight: FontWeight.w800, fontSize: 15)),
            SizedBox(height: 4),
            Text('Enter the country you wish to visit to check if you qualify for an e-visa.',
              style: TextStyle(color: AppColors.textGrey, fontSize: 12, height: 1.4)),
          ])),
        ]),
      ),
      const SizedBox(height: 20),

      const Text('Destination Country', style: TextStyle(color: AppColors.textDark,
          fontWeight: FontWeight.w700, fontSize: 14)),
      const SizedBox(height: 10),

      // Dropdown
      Container(
        decoration: BoxDecoration(color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder)),
        padding: const EdgeInsets.symmetric(horizontal: 14),
        child: DropdownButtonHideUnderline(
          child: DropdownButton<String>(
            hint: const Text('Select a country', style: TextStyle(color: AppColors.textGrey, fontSize: 13)),
            value: _selected,
            isExpanded: true,
            dropdownColor: AppColors.bgCard,
            icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.textGrey),
            style: const TextStyle(color: Colors.white, fontSize: 13),
            items: _eligibleCountries.keys.map((c) => DropdownMenuItem(
              value: c,
              child: Text(c),
            )).toList(),
            onChanged: (v) => setState(() { _selected = v; _result = null; }),
          ),
        ),
      ),
      const SizedBox(height: 10),
      const Center(child: Text('— or type below —',
          style: TextStyle(color: AppColors.textGrey, fontSize: 11))),
      const SizedBox(height: 10),
      Container(
        decoration: BoxDecoration(color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder)),
        child: TextField(
          controller: _ctrl,
          style: const TextStyle(color: Colors.white, fontSize: 13),
          onChanged: (_) { if (_selected != null) setState(() => _selected = null); },
          decoration: const InputDecoration(
            hintText: 'e.g. France, Japan, USA...',
            hintStyle: TextStyle(color: AppColors.textGrey, fontSize: 12),
            prefixIcon: Icon(Icons.flag_rounded, color: AppColors.primary, size: 20),
            border: InputBorder.none,
            contentPadding: EdgeInsets.symmetric(vertical: 14)),
        ),
      ),
      const SizedBox(height: 16),
      SizedBox(
        width: double.infinity, height: 50,
        child: ElevatedButton(
          onPressed: _check,
          child: const Text('Check Eligibility', style: TextStyle(fontWeight: FontWeight.bold)),
        ),
      ),

      // Result card
      if (_result != null) ...[
        const SizedBox(height: 20),
        _resultCard(_result!, _selected ?? _ctrl.text.trim()),
      ],

      const SizedBox(height: 24),
      const Text('Popular Destinations', style: TextStyle(color: AppColors.textDark,
          fontWeight: FontWeight.w700, fontSize: 14)),
      const SizedBox(height: 12),
      Wrap(
        spacing: 8, runSpacing: 8,
        children: _eligibleCountries.entries
            .where((e) => e.value['eligible'] == true)
            .take(10)
            .map((e) => GestureDetector(
              onTap: () => setState(() {
                _selected = e.key;
                _result = e.value;
              }),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.cardBorder)),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  const Icon(Icons.flag_outlined, color: AppColors.primary, size: 13),
                  const SizedBox(width: 5),
                  Text(e.key, style: const TextStyle(color: AppColors.textDark,
                      fontSize: 12, fontWeight: FontWeight.w600)),
                ]),
              ),
            )).toList(),
      ),
    ]);
  }

  Widget _resultCard(Map<String, dynamic> r, String country) {
    final eligible = r['eligible'] == true;
    final notFound = r['notFound'] == true;
    final color = eligible ? AppColors.primary : AppColors.danger;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(width: 40, height: 40,
            decoration: BoxDecoration(color: color.withValues(alpha: 0.15), shape: BoxShape.circle),
            child: Icon(eligible ? Icons.check_circle_rounded : Icons.cancel_rounded,
                color: color, size: 22)),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(country, style: const TextStyle(color: Colors.white,
                fontWeight: FontWeight.w800, fontSize: 15)),
            Text(
              notFound ? 'Country not found in our database'
                : eligible ? 'Eligible for E-Visa' : 'Not eligible for E-Visa',
              style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 13)),
          ])),
        ]),

        if (eligible && !notFound) ...[
          const SizedBox(height: 14),
          const Divider(color: AppColors.cardBorder),
          const SizedBox(height: 10),
          Row(children: [
            _infoChip(Icons.attach_money_rounded, 'Price', 'USD ${r['price']}', AppColors.primary),
            const SizedBox(width: 10),
            _infoChip(Icons.calendar_month_rounded, 'Stay', '${r['days']} days', AppColors.info),
          ]),
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity, height: 48,
            child: ElevatedButton(
              onPressed: () => widget.onApply(country, (r['price'] as num).toDouble()),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                Icon(Icons.send_rounded, size: 16, color: Colors.white),
                SizedBox(width: 8),
                Text('Apply for E-Visa', style: TextStyle(fontWeight: FontWeight.w800,
                    color: Colors.white, fontSize: 14)),
              ]),
            ),
          ),
        ],

        if (!eligible && !notFound) ...[
          const SizedBox(height: 10),
          const Text('Unfortunately, e-visa applications are not available for this destination. '
              'Please visit the nearest embassy.',
            style: TextStyle(color: AppColors.textGrey, fontSize: 12, height: 1.5)),
        ],
      ]),
    );
  }

  Widget _infoChip(IconData icon, String label, String value, Color color) =>
    Expanded(child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withValues(alpha: 0.3))),
      child: Row(children: [
        Icon(icon, color: color, size: 16),
        const SizedBox(width: 6),
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: const TextStyle(color: AppColors.textGrey, fontSize: 10)),
          Text(value, style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 13)),
        ]),
      ]),
    ));
}

// ── Application Screen ────────────────────────────────────────────────────────
class EVisaApplicationScreen extends StatefulWidget {
  final String country;
  final double price;
  final void Function(EVisaDemand demand) onSubmitted;
  const EVisaApplicationScreen({
    super.key, required this.country,
    required this.price, required this.onSubmitted,
  });
  @override State<EVisaApplicationScreen> createState() => _EVisaApplicationScreenState();
}

class _EVisaApplicationScreenState extends State<EVisaApplicationScreen> {
  int _step = 0; // 0=info, 1=documents, 2=review
  final _pageCtrl = PageController();

  final _nameCtrl = TextEditingController();
  final _passportCtrl = TextEditingController();
  final _passportCreatedCtrl = TextEditingController();
  final _passportExpiryCtrl = TextEditingController();
  final _releveBancaireCtrl = TextEditingController();
  bool _photoUploaded = false;
  bool _submitting = false;

  void _next() {
    if (_step < 2) {
      setState(() => _step++);
      _pageCtrl.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
    } else {
      _submit();
    }
  }

  void _back() {
    if (_step > 0) {
      setState(() => _step--);
      _pageCtrl.previousPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
    } else {
      Navigator.pop(context);
    }
  }

  void _submit() async {
    setState(() => _submitting = true);
    await Future.delayed(const Duration(seconds: 2));
    final demand = EVisaDemand(
      id: 'EV${Random().nextInt(99999).toString().padLeft(5, '0')}',
      country: widget.country,
      applicantName: _nameCtrl.text.trim(),
      passportNumber: _passportCtrl.text.trim(),
      passportCreated: _passportCreatedCtrl.text.trim(),
      passportExpiry: _passportExpiryCtrl.text.trim(),
      price: widget.price,
      submittedAt: DateTime.now(),
    );
    globalEVisaDemands.insert(0, demand);
    widget.onSubmitted(demand);
    if (mounted) {
      setState(() => _submitting = false);
      Navigator.pop(context);
      Navigator.pop(context); // go back to evisa screen (demands tab)
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(children: [
            Icon(Icons.check_circle_rounded, color: Colors.white),
            SizedBox(width: 10),
            Text('E-Visa application submitted!'),
          ]),
          backgroundColor: AppColors.primary,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.gradientRadial),
        child: SafeArea(child: Column(children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: Row(children: [
              GestureDetector(onTap: _back,
                child: Container(width: 36, height: 36,
                  decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white, size: 16))),
              const Spacer(),
              Column(children: [
                const Icon(Icons.document_scanner_rounded, color: AppColors.primary, size: 20),
                Text(widget.country, style: const TextStyle(color: AppColors.primary,
                    fontWeight: FontWeight.w800, fontSize: 13)),
              ]),
              const Spacer(),
              const SizedBox(width: 36),
            ]),
          ),

          // Steps
          Padding(
            padding: const EdgeInsets.fromLTRB(32, 16, 32, 8),
            child: Row(children: [
              _dot(0, 'Info'),
              Expanded(child: Container(height: 2,
                  color: _step >= 1 ? AppColors.primary : Colors.white24)),
              _dot(1, 'Docs'),
              Expanded(child: Container(height: 2,
                  color: _step >= 2 ? AppColors.primary : Colors.white24)),
              _dot(2, 'Review'),
            ]),
          ),

          Expanded(child: PageView(
            controller: _pageCtrl,
            physics: const NeverScrollableScrollPhysics(),
            children: [_infoPage(), _docsPage(), _reviewPage()],
          )),
        ])),
      ),
    );
  }

  Widget _dot(int s, String label) => Column(mainAxisSize: MainAxisSize.min, children: [
    Container(width: 28, height: 28,
      decoration: BoxDecoration(shape: BoxShape.circle,
        color: _step >= s ? AppColors.primary : Colors.white24,
        border: Border.all(color: _step >= s ? AppColors.primary : Colors.white38, width: 1.5)),
      child: Center(child: _step > s
          ? const Icon(Icons.check_rounded, color: Colors.white, size: 14)
          : Text('${s + 1}', style: const TextStyle(color: Colors.white,
              fontSize: 12, fontWeight: FontWeight.w700)))),
    const SizedBox(height: 4),
    Text(label, style: TextStyle(color: _step >= s ? AppColors.primary : Colors.white54,
        fontSize: 10, fontWeight: FontWeight.w600)),
  ]);

  Widget _infoPage() => SingleChildScrollView(
    padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Application for ${widget.country}',
        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 17)),
      Text('Fee: USD ${widget.price.toStringAsFixed(0)}',
        style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 13)),
      const SizedBox(height: 20),
      _card([
        _f('Full Name (as in passport)', ctrl: _nameCtrl, icon: Icons.person_rounded),
        _f('Passport Number', ctrl: _passportCtrl, icon: Icons.credit_card_rounded),
        _f('Passport Issue Date (DD/MM/YYYY)',
            ctrl: _passportCreatedCtrl, icon: Icons.calendar_today_rounded),
        _f('Passport Expiry Date (DD/MM/YYYY)',
            ctrl: _passportExpiryCtrl, icon: Icons.event_busy_rounded),
        _f('Relevé Bancaire (Bank Statement Ref.)',
            ctrl: _releveBancaireCtrl, icon: Icons.account_balance_rounded),
      ]),
      const SizedBox(height: 20),
      _greenBtn('Next — Upload Documents', _next),
    ]),
  );

  Widget _docsPage() => SingleChildScrollView(
    padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Text('Upload Documents', style: TextStyle(color: Colors.white,
          fontWeight: FontWeight.w800, fontSize: 17)),
      const SizedBox(height: 4),
      const Text('Please provide the required documents for your application.',
        style: TextStyle(color: AppColors.textGrey, fontSize: 12)),
      const SizedBox(height: 20),
      _uploadTile(
        icon: Icons.photo_camera_rounded,
        color: AppColors.primary,
        title: 'Passport Size Photograph',
        subtitle: 'White background, face clearly visible',
        uploaded: _photoUploaded,
        onTap: () => setState(() => _photoUploaded = true),
      ),
      const SizedBox(height: 12),
      _infoBox(),
      const SizedBox(height: 24),
      _greenBtn('Next — Review Application', _photoUploaded ? _next : null),
    ]),
  );

  Widget _reviewPage() => SingleChildScrollView(
    padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Text('Review & Submit', style: TextStyle(color: Colors.white,
          fontWeight: FontWeight.w800, fontSize: 17)),
      const SizedBox(height: 16),
      _reviewCard(),
      const SizedBox(height: 20),
      _submitting
        ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
        : _greenBtn('Submit Application', _submit),
    ]),
  );

  Widget _reviewCard() => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(color: AppColors.bgCard.withValues(alpha: 0.8),
      borderRadius: BorderRadius.circular(16),
      border: Border.all(color: AppColors.primary.withValues(alpha: 0.3))),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      _reviewRow('Destination', widget.country, Icons.flag_rounded),
      _reviewRow('Fee', 'USD ${widget.price.toStringAsFixed(0)}', Icons.attach_money_rounded),
      _reviewRow('Applicant', _nameCtrl.text.isEmpty ? '—' : _nameCtrl.text, Icons.person_rounded),
      _reviewRow('Passport No.', _passportCtrl.text.isEmpty ? '—' : _passportCtrl.text, Icons.credit_card_rounded),
      _reviewRow('Issued', _passportCreatedCtrl.text.isEmpty ? '—' : _passportCreatedCtrl.text, Icons.calendar_today_rounded),
      _reviewRow('Expires', _passportExpiryCtrl.text.isEmpty ? '—' : _passportExpiryCtrl.text, Icons.event_busy_rounded),
      _reviewRow('Bank Ref.', _releveBancaireCtrl.text.isEmpty ? '—' : _releveBancaireCtrl.text, Icons.account_balance_rounded),
      _reviewRow('Photo', _photoUploaded ? 'Uploaded ✓' : 'Missing', Icons.photo_camera_rounded,
          valueColor: _photoUploaded ? AppColors.primary : AppColors.danger),
    ]),
  );

  Widget _reviewRow(String label, String value, IconData icon, {Color? valueColor}) =>
    Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(children: [
        Icon(icon, color: AppColors.primary, size: 16),
        const SizedBox(width: 10),
        Text('$label:', style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
        const Spacer(),
        Text(value, style: TextStyle(color: valueColor ?? Colors.white,
            fontWeight: FontWeight.w700, fontSize: 12)),
      ]),
    );

  Widget _uploadTile({
    required IconData icon, required Color color,
    required String title, required String subtitle,
    required bool uploaded, required VoidCallback onTap,
  }) => GestureDetector(
    onTap: onTap,
    child: Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: uploaded ? color.withValues(alpha: 0.1) : AppColors.bgCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: uploaded ? color : AppColors.cardBorder)),
      child: Row(children: [
        Container(width: 48, height: 48,
          decoration: BoxDecoration(color: color.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(12)),
          child: Icon(uploaded ? Icons.check_rounded : icon, color: color, size: 24)),
        const SizedBox(width: 14),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title, style: const TextStyle(color: Colors.white,
              fontWeight: FontWeight.w700, fontSize: 13)),
          Text(subtitle, style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
        ])),
        Text(uploaded ? 'Uploaded' : 'Tap to upload',
          style: TextStyle(color: uploaded ? color : AppColors.textGrey,
              fontSize: 11, fontWeight: FontWeight.w600)),
      ]),
    ),
  );

  Widget _infoBox() => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(color: AppColors.info.withValues(alpha: 0.08),
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: AppColors.info.withValues(alpha: 0.3))),
    child: const Row(children: [
      Icon(Icons.info_outline_rounded, color: AppColors.info, size: 16),
      SizedBox(width: 8),
      Expanded(child: Text(
        'Photo must be recent (within 6 months), 35×45mm format, white background, no glasses.',
        style: TextStyle(color: AppColors.textMuted, fontSize: 11, height: 1.4))),
    ]),
  );

  Widget _card(List<Widget> c) => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(color: AppColors.bgCard.withValues(alpha: 0.75),
      borderRadius: BorderRadius.circular(16),
      border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.5))),
    child: Column(children: c));

  Widget _f(String h, {required TextEditingController ctrl, required IconData icon}) =>
    Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: ctrl,
        style: const TextStyle(color: Colors.white, fontSize: 13),
        decoration: InputDecoration(
          hintText: h,
          prefixIcon: Icon(icon, color: AppColors.primary, size: 18),
        ),
      ),
    );

  Widget _greenBtn(String l, VoidCallback? t) => SizedBox(
    width: double.infinity, height: 50,
    child: ElevatedButton(
      onPressed: t,
      style: ElevatedButton.styleFrom(
        backgroundColor: t == null ? Colors.white12 : AppColors.primary),
      child: Text(l, style: const TextStyle(fontWeight: FontWeight.bold)),
    ),
  );

  @override
  void dispose() {
    _pageCtrl.dispose();
    for (final c in [_nameCtrl, _passportCtrl, _passportCreatedCtrl,
        _passportExpiryCtrl, _releveBancaireCtrl]) { c.dispose(); }
    super.dispose();
  }
}

// ── Tab 2: My Demands ─────────────────────────────────────────────────────────
class _DemandsTab extends StatefulWidget {
  final VoidCallback onUpdate;
  const _DemandsTab({required this.onUpdate});
  @override State<_DemandsTab> createState() => _DemandsTabState();
}

class _DemandsTabState extends State<_DemandsTab> {
  @override
  Widget build(BuildContext context) {
    final demands = globalEVisaDemands;
    if (demands.isEmpty) {
      return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Container(width: 72, height: 72,
          decoration: BoxDecoration(color: AppColors.bgCard, shape: BoxShape.circle,
            border: Border.all(color: AppColors.cardBorder)),
          child: const Icon(Icons.document_scanner_outlined, color: AppColors.textGrey, size: 36)),
        const SizedBox(height: 16),
        const Text('No E-Visa demands yet', style: TextStyle(color: AppColors.textDark,
            fontWeight: FontWeight.w700, fontSize: 16)),
        const SizedBox(height: 6),
        const Text('Go to the Eligibility tab to apply', style: TextStyle(color: AppColors.textGrey, fontSize: 13)),
      ]));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: demands.length + 1,
      itemBuilder: (_, i) {
        if (i == 0) return _statsRow(demands);
        return _demandCard(demands[i - 1]);
      },
    );
  }

  Widget _statsRow(List<EVisaDemand> demands) {
    final approved = demands.where((d) => d.status == EVisaStatus.approved).length;
    final pending = demands.where((d) => d.status == EVisaStatus.pending).length;
    final rejected = demands.where((d) => d.status == EVisaStatus.rejected).length;
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(children: [
        _stat('Total', demands.length.toString(), Colors.white),
        const SizedBox(width: 8),
        _stat('Approved', approved.toString(), AppColors.success),
        const SizedBox(width: 8),
        _stat('Pending', pending.toString(), AppColors.warning),
        const SizedBox(width: 8),
        _stat('Rejected', rejected.toString(), AppColors.danger),
      ]),
    );
  }

  Widget _stat(String label, String val, Color color) => Expanded(child: Container(
    padding: const EdgeInsets.symmetric(vertical: 10),
    decoration: BoxDecoration(color: color.withValues(alpha: 0.08),
      borderRadius: BorderRadius.circular(10),
      border: Border.all(color: color.withValues(alpha: 0.3))),
    child: Column(children: [
      Text(val, style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 18)),
      Text(label, style: const TextStyle(color: AppColors.textGrey, fontSize: 10)),
    ]),
  ));

  Widget _demandCard(EVisaDemand d) {
    Color statusColor;
    IconData statusIcon;
    String statusLabel;
    switch (d.status) {
      case EVisaStatus.approved:
        statusColor = AppColors.success;
        statusIcon = Icons.check_circle_rounded;
        statusLabel = 'Approved';
        break;
      case EVisaStatus.rejected:
        statusColor = AppColors.danger;
        statusIcon = Icons.cancel_rounded;
        statusLabel = 'Rejected';
        break;
      default:
        statusColor = AppColors.warning;
        statusIcon = Icons.hourglass_top_rounded;
        statusLabel = 'Pending';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: statusColor.withValues(alpha: 0.3))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(width: 44, height: 44,
            decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12)),
            child: Icon(Icons.flag_rounded, color: statusColor, size: 22)),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(d.country, style: const TextStyle(color: Colors.white,
                fontWeight: FontWeight.w800, fontSize: 15)),
            Text('ID: ${d.id}', style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
          ])),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: statusColor.withValues(alpha: 0.4))),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(statusIcon, color: statusColor, size: 13),
              const SizedBox(width: 4),
              Text(statusLabel, style: TextStyle(color: statusColor,
                  fontWeight: FontWeight.w700, fontSize: 11)),
            ])),
        ]),
        const SizedBox(height: 10),
        const Divider(color: AppColors.cardBorder),
        const SizedBox(height: 8),
        Row(children: [
          _detail(Icons.person_rounded, d.applicantName),
          const SizedBox(width: 16),
          _detail(Icons.credit_card_rounded, d.passportNumber),
        ]),
        const SizedBox(height: 4),
        _detail(Icons.calendar_month_rounded,
            'Submitted ${d.submittedAt.day}/${d.submittedAt.month}/${d.submittedAt.year}'),
        const SizedBox(height: 4),
        _detail(Icons.attach_money_rounded, 'Fee: USD ${d.price.toStringAsFixed(0)}'),

        // Demo: simulate approval
        if (d.status == EVisaStatus.pending) ...[
          const SizedBox(height: 10),
          Row(children: [
            Expanded(child: OutlinedButton(
              onPressed: () => setState(() { d.status = EVisaStatus.approved; widget.onUpdate(); }),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.success),
                foregroundColor: AppColors.success,
                padding: const EdgeInsets.symmetric(vertical: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
              child: const Text('Simulate Approve', style: TextStyle(fontSize: 11)))),
            const SizedBox(width: 8),
            Expanded(child: OutlinedButton(
              onPressed: () => setState(() { d.status = EVisaStatus.rejected; widget.onUpdate(); }),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.danger),
                foregroundColor: AppColors.danger,
                padding: const EdgeInsets.symmetric(vertical: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
              child: const Text('Simulate Reject', style: TextStyle(fontSize: 11)))),
          ]),
        ],

        if (d.status == EVisaStatus.approved) ...[
          const SizedBox(height: 10),
          SizedBox(width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () => _showVisaDownload(d),
              icon: const Icon(Icons.download_rounded, size: 16, color: Colors.white),
              label: const Text('Download E-Visa', style: TextStyle(
                  fontWeight: FontWeight.w700, color: Colors.white, fontSize: 13)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.success,
                padding: const EdgeInsets.symmetric(vertical: 10),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
            )),
          const SizedBox(height: 6),
          SizedBox(width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () => _showUploadForBooking(d),
              icon: const Icon(Icons.upload_rounded, size: 16, color: AppColors.primary),
              label: const Text('Use for Trip Booking', style: TextStyle(
                  fontWeight: FontWeight.w700, color: AppColors.primary, fontSize: 13)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.primary),
                padding: const EdgeInsets.symmetric(vertical: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
            )),
        ],
      ]),
    );
  }

  Widget _detail(IconData icon, String text) => Row(mainAxisSize: MainAxisSize.min, children: [
    Icon(icon, color: AppColors.primary, size: 13),
    const SizedBox(width: 5),
    Flexible(child: Text(text, style: const TextStyle(color: AppColors.textGrey, fontSize: 11),
        overflow: TextOverflow.ellipsis)),
  ]);

  void _showVisaDownload(EVisaDemand d) {
    showModalBottomSheet(
      context: context, backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(width: 48, height: 4, margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(4))),
          const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 48),
          const SizedBox(height: 12),
          Text('E-Visa for ${d.country}', style: const TextStyle(color: Colors.white,
              fontWeight: FontWeight.w800, fontSize: 16)),
          Text('ID: ${d.id}', style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
          const SizedBox(height: 20),
          SizedBox(width: double.infinity, height: 48,
            child: ElevatedButton.icon(
              onPressed: () => Navigator.pop(context),
              icon: const Icon(Icons.download_rounded, color: Colors.white),
              label: const Text('Download PDF', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.success,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
            )),
          const SizedBox(height: 8),
          Text('Your e-visa has been saved to Documents',
            style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
        ]),
      ),
    );
  }

  void _showUploadForBooking(EVisaDemand d) {
    showModalBottomSheet(
      context: context, backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(width: 48, height: 4, margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(4))),
          const Icon(Icons.flight_takeoff_rounded, color: AppColors.primary, size: 48),
          const SizedBox(height: 12),
          const Text('Use E-Visa for Booking', style: TextStyle(color: Colors.white,
              fontWeight: FontWeight.w800, fontSize: 16)),
          const SizedBox(height: 6),
          Text('Your approved e-visa for ${d.country} will be automatically attached '
              'when booking a trip to this country.',
            textAlign: TextAlign.center,
            style: const TextStyle(color: AppColors.textGrey, fontSize: 12, height: 1.5)),
          const SizedBox(height: 20),
          SizedBox(width: double.infinity, height: 48,
            child: ElevatedButton.icon(
              onPressed: () => Navigator.pop(context),
              icon: const Icon(Icons.done_rounded, color: Colors.white),
              label: const Text('Got it', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
            )),
        ]),
      ),
    );
  }
}

// ── Tab 3: Documents ──────────────────────────────────────────────────────────
class _DocumentsTab extends StatefulWidget {
  const _DocumentsTab();
  @override State<_DocumentsTab> createState() => _DocumentsTabState();
}

class _DocumentsTabState extends State<_DocumentsTab> {
  final List<Map<String, dynamic>> _docs = [
    {'name': 'Passport', 'type': 'Identity', 'icon': Icons.book_rounded, 'color': AppColors.info, 'uploaded': false},
    {'name': 'National ID', 'type': 'Identity', 'icon': Icons.badge_rounded, 'color': AppColors.warning, 'uploaded': false},
    {'name': 'Proof of Residence', 'type': 'Address', 'icon': Icons.home_rounded, 'color': AppColors.secondary, 'uploaded': false},
    {'name': 'Bank Statement', 'type': 'Financial', 'icon': Icons.account_balance_rounded, 'color': const Color(0xFF8B5CF6), 'uploaded': false},
    {'name': 'Travel Insurance', 'type': 'Travel', 'icon': Icons.health_and_safety_rounded, 'color': AppColors.success, 'uploaded': false},
    {'name': 'Flight Tickets', 'type': 'Travel', 'icon': Icons.flight_rounded, 'color': const Color(0xFF06B6D4), 'uploaded': false},
  ];

  @override
  Widget build(BuildContext context) {
    final uploaded = _docs.where((d) => d['uploaded'] == true).toList();
    final approved = globalEVisaDemands.where((d) => d.status == EVisaStatus.approved).toList();

    return ListView(padding: const EdgeInsets.all(16), children: [
      // Upload banner
      Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: [
            AppColors.info.withValues(alpha: 0.2), AppColors.primary.withValues(alpha: 0.1)]),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.info.withValues(alpha: 0.3))),
        child: const Row(children: [
          Icon(Icons.folder_special_rounded, color: AppColors.info, size: 32),
          SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Document Vault', style: TextStyle(color: Colors.white,
                fontWeight: FontWeight.w800, fontSize: 14)),
            Text('Store your travel documents securely. Download anytime if originals are lost.',
              style: TextStyle(color: AppColors.textGrey, fontSize: 11, height: 1.4)),
          ])),
        ]),
      ),
      const SizedBox(height: 16),

      // Approved E-Visas
      if (approved.isNotEmpty) ...[
        const Text('Approved E-Visas', style: TextStyle(color: AppColors.textDark,
            fontWeight: FontWeight.w700, fontSize: 14)),
        const SizedBox(height: 10),
        ...approved.map((d) => Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: AppColors.success.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.success.withValues(alpha: 0.3))),
          child: Row(children: [
            Container(width: 40, height: 40,
              decoration: BoxDecoration(color: AppColors.success.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.verified_rounded, color: AppColors.success, size: 20)),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('E-Visa — ${d.country}', style: const TextStyle(color: Colors.white,
                  fontWeight: FontWeight.w700, fontSize: 13)),
              Text('ID: ${d.id}', style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
            ])),
            IconButton(
              icon: const Icon(Icons.download_rounded, color: AppColors.success, size: 20),
              onPressed: () {},
            ),
          ]),
        )),
        const SizedBox(height: 8),
      ],

      const Text('My Documents', style: TextStyle(color: AppColors.textDark,
          fontWeight: FontWeight.w700, fontSize: 14)),
      const SizedBox(height: 10),

      ..._docs.asMap().entries.map((e) {
        final doc = e.value;
        final isUploaded = doc['uploaded'] == true;
        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: isUploaded ? (doc['color'] as Color).withValues(alpha: 0.07) : AppColors.bgCard,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: isUploaded
                ? (doc['color'] as Color).withValues(alpha: 0.35) : AppColors.cardBorder)),
          child: Row(children: [
            Container(width: 44, height: 44,
              decoration: BoxDecoration(color: (doc['color'] as Color).withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(12)),
              child: Icon(doc['icon'] as IconData, color: doc['color'] as Color, size: 22)),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(doc['name'] as String, style: const TextStyle(color: Colors.white,
                  fontWeight: FontWeight.w700, fontSize: 13)),
              Text(doc['type'] as String, style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
            ])),
            if (isUploaded)
              IconButton(
                icon: const Icon(Icons.download_rounded, color: AppColors.primary, size: 20),
                onPressed: () {},
              )
            else
              GestureDetector(
                onTap: () => setState(() => _docs[e.key]['uploaded'] = true),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.primary.withValues(alpha: 0.4))),
                  child: const Row(mainAxisSize: MainAxisSize.min, children: [
                    Icon(Icons.upload_rounded, color: AppColors.primary, size: 13),
                    SizedBox(width: 4),
                    Text('Upload', style: TextStyle(color: AppColors.primary,
                        fontWeight: FontWeight.w700, fontSize: 11)),
                  ])),
              ),
          ]),
        );
      }),

      if (uploaded.isNotEmpty) ...[
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.06),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.primary.withValues(alpha: 0.2))),
          child: Row(children: [
            const Icon(Icons.lock_rounded, color: AppColors.primary, size: 14),
            const SizedBox(width: 8),
            Expanded(child: Text('${uploaded.length} document(s) stored securely. '
                'Download anytime if your originals are lost.',
              style: const TextStyle(color: AppColors.textGrey, fontSize: 11, height: 1.4))),
          ]),
        ),
      ],
    ]);
  }
}
