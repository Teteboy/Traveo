import 'package:flutter/material.dart';
import '../../widgets/common_widgets.dart';
import '../../theme/app_theme.dart';
import 'notifications_screen.dart';
import 'settings_screen.dart';
import 'bookings_pro_screen.dart';
import 'events_pro_screen.dart';

class GestionProScreen extends StatelessWidget {
  const GestionProScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: CustomScrollView(slivers: [
        SliverToBoxAdapter(child: _header(context)),
        SliverToBoxAdapter(child: _heroBanner(context)),
        SliverToBoxAdapter(child: _sectionTitle('My Services')),
        SliverToBoxAdapter(child: _servicesGrid(context)),
        SliverToBoxAdapter(child: _sectionTitle('Operations')),
        SliverToBoxAdapter(child: _operationsRow(context)),
        SliverToBoxAdapter(child: _sectionTitle('Verification & Compliance')),
        SliverToBoxAdapter(child: _verificationCard(context)),
        const SliverToBoxAdapter(child: SizedBox(height: 32)),
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
        GestureDetector(
          onTap: () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => const SettingsScreen())),
          child: Container(width: 40, height: 40,
            decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder)),
            child: const Icon(Icons.settings_rounded, color: AppColors.textGrey, size: 20))),
        const SizedBox(width: 8),
        GestureDetector(
          onTap: () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => const NotificationsScreen())),
          child: Stack(children: [
            Container(width: 40, height: 40,
              decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.cardBorder)),
              child: const Icon(Icons.notifications_rounded, color: AppColors.textGrey, size: 20)),
            Positioned(top: 2, right: 2, child: Container(
              padding: const EdgeInsets.all(3),
              decoration: const BoxDecoration(color: Colors.orange, shape: BoxShape.circle),
              child: const Text('2', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)))),
          ])),
      ]))));

  Widget _heroBanner(BuildContext ctx) => Container(
    margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
    padding: const EdgeInsets.all(20),
    decoration: BoxDecoration(
      borderRadius: BorderRadius.circular(18),
      gradient: const LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight,
        colors: [Color(0xFF1A3D6B), Color(0xFF0A1A3A)])),
    child: Row(children: [
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Service Management', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18)),
        const SizedBox(height: 4),
        const Text('Manage offerings, bookings & availability',
          style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.4)),
        const SizedBox(height: 14),
        GestureDetector(
          onTap: () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => const BookingsProScreen())),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(10)),
            child: const Text('View Bookings', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)))),
      ])),
      Container(width: 80, height: 80,
        decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(12)),
        child: const Icon(Icons.business_center_rounded, color: Colors.white38, size: 48)),
    ]));

  Widget _sectionTitle(String t) => Padding(
    padding: const EdgeInsets.fromLTRB(16, 20, 16, 10),
    child: Text(t, style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 14)));

  Widget _servicesGrid(BuildContext ctx) {
    final services = [
      _SI('Accommodations',       Icons.hotel_rounded,           const Color(0xFF1A3D6B), 'Rooms, rates & availability',        () => _sheet(ctx, 'Accommodations')),
      _SI('Guides & Experiences', Icons.hiking_rounded,          const Color(0xFF065F46), 'Local guides, tours & activities',   () => _sheet(ctx, 'Guides & Experiences')),
      _SI('Transport & Transfers',Icons.directions_car_rounded,  const Color(0xFF7C3AED), 'Pickups, transfers & rentals',       () => _sheet(ctx, 'Transport & Transfers')),
      _SI('Restaurants',          Icons.restaurant_rounded,      const Color(0xFF92400E), 'Tables, availability & menus',       () => _sheet(ctx, 'Restaurants')),
      _SI('Events',               Icons.event_rounded,           const Color(0xFF9D174D), 'Create & manage premium events',     () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => const EventsProScreen()))),
      _SI('Travel Bundles',       Icons.card_travel_rounded,     const Color(0xFF1E3A5F), 'Join flight + service packages',     () => _sheet(ctx, 'Travel Bundles')),
    ];
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
      child: GridView.count(
        shrinkWrap: true, physics: const NeverScrollableScrollPhysics(),
        crossAxisCount: 2, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 1.1,
        children: services.map(_serviceCard).toList()));
  }

  Widget _serviceCard(_SI s) => GestureDetector(
    onTap: s.onTap,
    child: Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.5))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(width: 44, height: 44,
          decoration: BoxDecoration(color: s.color.withValues(alpha: 0.25), borderRadius: BorderRadius.circular(12)),
          child: Icon(s.icon, color: s.color.withValues(alpha: 0.9), size: 24)),
        const SizedBox(height: 10),
        Text(s.title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
        const SizedBox(height: 3),
        Text(s.desc, maxLines: 2, overflow: TextOverflow.ellipsis,
          style: const TextStyle(color: AppColors.textGrey, fontSize: 10, height: 1.3)),
        const Spacer(),
        const Row(children: [
          Text('Manage', style: TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.w700)),
          SizedBox(width: 4),
          Icon(Icons.arrow_forward_rounded, color: AppColors.primary, size: 13),
        ]),
      ])));

  Widget _operationsRow(BuildContext ctx) => Padding(
    padding: const EdgeInsets.symmetric(horizontal: 16),
    child: Row(children: [
      Expanded(child: _opCard(Icons.calendar_today_rounded, 'Booking\nManagement', const Color(0xFF1A3D6B),
        () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => const BookingsProScreen())))),
      const SizedBox(width: 12),
      Expanded(child: _opCard(Icons.gavel_rounded, 'Dispute\nCenter', const Color(0xFF7C3AED),
        () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => const _DisputeScreen())))),
      const SizedBox(width: 12),
      Expanded(child: _opCard(Icons.star_rounded, 'Reviews &\nRatings', const Color(0xFF92400E),
        () => Navigator.push(ctx, MaterialPageRoute(builder: (_) => const _ReviewsScreen())))),
    ]));

  Widget _opCard(IconData icon, String label, Color color, VoidCallback onTap) =>
    GestureDetector(onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.5))),
        child: Column(children: [
          Icon(icon, color: color, size: 26),
          const SizedBox(height: 8),
          Text(label, textAlign: TextAlign.center,
            style: const TextStyle(color: AppColors.textGrey, fontSize: 10, height: 1.3)),
        ])));

  Widget _verificationCard(BuildContext ctx) => Container(
    margin: const EdgeInsets.symmetric(horizontal: 16),
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(16),
      border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
    child: Column(children: [
      _vRow(Icons.verified_user_rounded,  'Identity Verification',    'Verified',        true),
      _div(),
      _vRow(Icons.description_rounded,    'Business Registration',    'Verified',        true),
      _div(),
      _vRow(Icons.assignment_rounded,     'Service Approval',         'Pending Review',  false),
      _div(),
      _vRow(Icons.upload_file_rounded,    'Professional Documents',   'Upload Required', false),
      const SizedBox(height: 14),
      SizedBox(width: double.infinity, height: 42,
        child: ElevatedButton(
          onPressed: () => _uploadSheet(ctx),
          style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
          child: const Text('Upload Documents', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)))),
    ]));

  Widget _vRow(IconData icon, String label, String status, bool done) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 12),
    child: Row(children: [
      Icon(icon, color: done ? AppColors.primary : AppColors.textGrey, size: 20),
      const SizedBox(width: 12),
      Expanded(child: Text(label, style: const TextStyle(color: Colors.white, fontSize: 13))),
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: done ? AppColors.primary.withValues(alpha: 0.15) : Colors.orange.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(20)),
        child: Text(status, style: TextStyle(
          color: done ? AppColors.primary : Colors.orange, fontSize: 10, fontWeight: FontWeight.w700))),
    ]));

  Widget _div() => Divider(height: 1, color: AppColors.cardBorder.withValues(alpha: 0.4));

  // ── Main manage sheet ────────────────────────────────────────────────────
  void _sheet(BuildContext ctx, String title) {
    showModalBottomSheet(
      context: ctx, isScrollControlled: true, backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom + 32, left: 24, right: 24, top: 24),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 18)),
            const Spacer(),
            GestureDetector(onTap: () => Navigator.pop(ctx),
              child: const Icon(Icons.close_rounded, color: AppColors.textGrey)),
          ]),
          const SizedBox(height: 6),
          Text('What would you like to do?', style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
          const SizedBox(height: 20),
          _st(Icons.add_circle_rounded,  'Add New Listing',  AppColors.primary, () {
            Navigator.pop(ctx);
            _addListingSheet(ctx, title);
          }),
          _st(Icons.edit_rounded,         'Edit Existing',    Colors.blue, () {
            Navigator.pop(ctx);
            _editExistingSheet(ctx, title);
          }),
          _st(Icons.toggle_on_rounded,    'Set Availability', Colors.green, () {
            Navigator.pop(ctx);
            _setAvailabilitySheet(ctx, title);
          }),
          _st(Icons.attach_money_rounded, 'Update Pricing',   Colors.orange, () {
            Navigator.pop(ctx);
            _updatePricingSheet(ctx, title);
          }),
          const SizedBox(height: 8),
        ])));
  }

  // ── Add New Listing ───────────────────────────────────────────────────────
  void _addListingSheet(BuildContext ctx, String serviceType) {
    final nameCtrl  = TextEditingController();
    final descCtrl  = TextEditingController();
    final priceCtrl = TextEditingController();
    final locCtrl   = TextEditingController();

    final _fieldHints = _hintsForService(serviceType);

    showModalBottomSheet(
      context: ctx, isScrollControlled: true, backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => StatefulBuilder(builder: (bsCtx, setBS) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom + 24, left: 24, right: 24, top: 24),
        child: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          _sheetHeader('Add New Listing', 'New listing will be submitted for admin approval', bsCtx),
          const SizedBox(height: 20),
          _formLbl('Listing Name'),
          _formField(_fieldHints['name']!, nameCtrl),
          _formLbl('Location'),
          _formField(_fieldHints['location']!, locCtrl),
          _formLbl('Price'),
          _formField(_fieldHints['price']!, priceCtrl),
          _formLbl('Description'),
          _formField(_fieldHints['desc']!, descCtrl, lines: 3),
          Container(padding: const EdgeInsets.all(10), margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.07),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.primary.withValues(alpha: 0.2))),
            child: const Row(children: [
              Icon(Icons.visibility_rounded, color: AppColors.primary, size: 14),
              SizedBox(width: 8),
              Expanded(child: Text('This description is shown to users when they view your service detail page.',
                style: TextStyle(color: AppColors.primary, fontSize: 11))),
            ])),
          const SizedBox(height: 4),
          Container(padding: const EdgeInsets.all(12), margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(color: Colors.orange.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.orange.withValues(alpha: 0.25))),
            child: const Row(children: [
              Icon(Icons.admin_panel_settings_rounded, color: Colors.orange, size: 15),
              SizedBox(width: 8),
              Expanded(child: Text('Listings go live only after admin approval.',
                style: TextStyle(color: Colors.orange, fontSize: 12))),
            ])),
          _submitBtn('Submit for Approval', () {
            if (nameCtrl.text.isEmpty) {
              ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(
                content: Text('Please enter a listing name'), backgroundColor: Colors.red));
              return;
            }
            Navigator.pop(bsCtx);
            ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(
              content: Text('"${nameCtrl.text}" submitted for approval!'),
              backgroundColor: AppColors.bgCard));
          }),
          const SizedBox(height: 8),
        ])))));
  }

  // ── Edit Existing ─────────────────────────────────────────────────────────
  void _editExistingSheet(BuildContext ctx, String serviceType) {
    // Sample listings for this service type
    final listings = _sampleListings(serviceType);
    String? selectedId = listings.isNotEmpty ? listings[0]['id'] : null;

    showModalBottomSheet(
      context: ctx, isScrollControlled: true, backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => StatefulBuilder(builder: (bsCtx, setBS) {
        final sel = listings.firstWhere((l) => l['id'] == selectedId, orElse: () => listings[0]);
        final nameCtrl  = TextEditingController(text: sel['name']);
        final priceCtrl = TextEditingController(text: sel['price']);
        final descCtrl  = TextEditingController(text: sel['desc']);

        return Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom + 24, left: 24, right: 24, top: 24),
          child: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
            _sheetHeader('Edit Existing', 'Select a listing to edit', bsCtx),
            const SizedBox(height: 16),

            // Listing selector
            ...listings.map((l) => GestureDetector(
              onTap: () => setBS(() => selectedId = l['id']),
              child: Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: selectedId == l['id'] ? AppColors.primary.withValues(alpha: 0.12) : AppColors.bgDark,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: selectedId == l['id'] ? AppColors.primary : AppColors.cardBorder)),
                child: Row(children: [
                  Icon(Icons.circle, color: selectedId == l['id'] ? AppColors.primary : AppColors.cardBorder, size: 10),
                  const SizedBox(width: 10),
                  Expanded(child: Text(l['name']!, style: TextStyle(
                    color: selectedId == l['id'] ? Colors.white : AppColors.textGrey,
                    fontWeight: FontWeight.w600, fontSize: 13))),
                  Text(l['price']!, style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
                ])))),

            const SizedBox(height: 16),
            Divider(color: AppColors.cardBorder.withValues(alpha: 0.4), height: 1),
            const SizedBox(height: 16),

            _formLbl('Listing Name'),
            _formField('Name', nameCtrl),
            _formLbl('Price'),
            _formField('e.g. FCFA 120 / person', priceCtrl),
            _formLbl('Description'),
            _formField('Description', descCtrl, lines: 3),
            const SizedBox(height: 4),
            _submitBtn('Save Changes', () {
              Navigator.pop(bsCtx);
              ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(
                content: Text('"${nameCtrl.text}" updated successfully!'),
                backgroundColor: AppColors.bgCard));
            }),
            const SizedBox(height: 8),
          ])));
      }));
  }

  // ── Set Availability ──────────────────────────────────────────────────────
  void _setAvailabilitySheet(BuildContext ctx, String serviceType) {
    final listings   = _sampleListings(serviceType);
    String? selectedId = listings.isNotEmpty ? listings[0]['id'] : null;

    // Week slots
    final slots = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    final timeSlots = ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'];
    final Set<String> activeDays  = {'Mon', 'Wed', 'Fri', 'Sat'};
    final Set<String> activeTimes = {'08:00 AM', '10:00 AM'};

    showModalBottomSheet(
      context: ctx, isScrollControlled: true, backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => StatefulBuilder(builder: (bsCtx, setBS) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom + 24, left: 24, right: 24, top: 24),
        child: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          _sheetHeader('Set Availability', 'Choose days and time slots for this service', bsCtx),
          const SizedBox(height: 16),

          // Listing picker
          if (listings.length > 1) ...[
            _formLbl('Select Listing'),
            SingleChildScrollView(scrollDirection: Axis.horizontal,
              child: Row(children: listings.map((l) => GestureDetector(
                onTap: () => setBS(() => selectedId = l['id']),
                child: Container(
                  margin: const EdgeInsets.only(right: 8, bottom: 14),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                  decoration: BoxDecoration(
                    color: selectedId == l['id'] ? AppColors.primary : AppColors.bgDark,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: selectedId == l['id'] ? AppColors.primary : AppColors.cardBorder)),
                  child: Text(l['name']!, style: TextStyle(
                    color: selectedId == l['id'] ? Colors.white : AppColors.textGrey,
                    fontSize: 12, fontWeight: FontWeight.w600)))
              )).toList())),
          ],

          _formLbl('Available Days'),
          Wrap(spacing: 8, runSpacing: 8,
            children: slots.map((d) {
              final on = activeDays.contains(d);
              return GestureDetector(
                onTap: () => setBS(() => on ? activeDays.remove(d) : activeDays.add(d)),
                child: Container(
                  width: 44, height: 44,
                  decoration: BoxDecoration(
                    color: on ? AppColors.primary : AppColors.bgDark,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: on ? AppColors.primary : AppColors.cardBorder)),
                  child: Center(child: Text(d.substring(0, 2),
                    style: TextStyle(color: on ? Colors.white : AppColors.textGrey,
                      fontSize: 12, fontWeight: FontWeight.w700)))));
            }).toList()),

          const SizedBox(height: 16),
          _formLbl('Time Slots'),
          Wrap(spacing: 8, runSpacing: 8,
            children: timeSlots.map((t) {
              final on = activeTimes.contains(t);
              return GestureDetector(
                onTap: () => setBS(() => on ? activeTimes.remove(t) : activeTimes.add(t)),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: on ? AppColors.primary : AppColors.bgDark,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: on ? AppColors.primary : AppColors.cardBorder)),
                  child: Text(t, style: TextStyle(
                    color: on ? Colors.white : AppColors.textGrey,
                    fontSize: 12, fontWeight: FontWeight.w600))));
            }).toList()),

          const SizedBox(height: 20),
          _submitBtn('Save Availability', () {
            Navigator.pop(bsCtx);
            ScaffoldMessenger.of(ctx).showSnackBar(SnackBar(
              content: Text('Availability saved — ${activeDays.length} days, ${activeTimes.length} time slots'),
              backgroundColor: AppColors.bgCard));
          }),
          const SizedBox(height: 8),
        ])))));
  }

  // ── Update Pricing ────────────────────────────────────────────────────────
  void _updatePricingSheet(BuildContext ctx, String serviceType) {
    final listings  = _sampleListings(serviceType);
    String? selectedId = listings.isNotEmpty ? listings[0]['id'] : null;

    showModalBottomSheet(
      context: ctx, isScrollControlled: true, backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => StatefulBuilder(builder: (bsCtx, setBS) {
        final sel = listings.firstWhere((l) => l['id'] == selectedId, orElse: () => listings[0]);
        final stdCtrl   = TextEditingController(text: sel['price']!.replaceAll(RegExp(r'[^\d.]'), ''));
        final grpCtrl   = TextEditingController();
        final vipCtrl   = TextEditingController();
        final childCtrl = TextEditingController();

        return Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom + 24, left: 24, right: 24, top: 24),
          child: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
            _sheetHeader('Update Pricing', 'Set prices per category for each listing', bsCtx),
            const SizedBox(height: 16),

            // Listing picker
            if (listings.length > 1) ...[
              _formLbl('Select Listing'),
              SingleChildScrollView(scrollDirection: Axis.horizontal,
                child: Row(children: listings.map((l) => GestureDetector(
                  onTap: () => setBS(() => selectedId = l['id']),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8, bottom: 14),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                    decoration: BoxDecoration(
                      color: selectedId == l['id'] ? AppColors.primary : AppColors.bgDark,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: selectedId == l['id'] ? AppColors.primary : AppColors.cardBorder)),
                    child: Text(l['name']!, style: TextStyle(
                      color: selectedId == l['id'] ? Colors.white : AppColors.textGrey,
                      fontSize: 12, fontWeight: FontWeight.w600)))
                )).toList())),
            ],

            _priceRow(Icons.person_rounded,         'Standard (per person)',   stdCtrl,   AppColors.primary),
            _priceRow(Icons.group_rounded,           'Group (10+ people)',      grpCtrl,   Colors.blue),
            _priceRow(Icons.star_rounded,            'VIP / Premium',           vipCtrl,   Colors.orange),
            _priceRow(Icons.child_friendly_rounded,  'Child (under 12)',        childCtrl, Colors.green),

            const SizedBox(height: 8),
            Container(padding: const EdgeInsets.all(12), margin: const EdgeInsets.only(bottom: 20),
              decoration: BoxDecoration(color: Colors.orange.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.orange.withValues(alpha: 0.25))),
              child: const Row(children: [
                Icon(Icons.info_outline_rounded, color: Colors.orange, size: 15),
                SizedBox(width: 8),
                Expanded(child: Text('Leave blank to use standard price for that category.',
                  style: TextStyle(color: Colors.orange, fontSize: 12))),
              ])),

            _submitBtn('Save Pricing', () {
              Navigator.pop(bsCtx);
              ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(
                content: Text('Pricing updated successfully!'),
                backgroundColor: AppColors.bgCard));
            }),
            const SizedBox(height: 8),
          ])));
      }));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  Widget _sheetHeader(String title, String subtitle, BuildContext ctx) => Row(
    crossAxisAlignment: CrossAxisAlignment.start, children: [
    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 18)),
      const SizedBox(height: 3),
      Text(subtitle, style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
    ])),
    GestureDetector(onTap: () => Navigator.pop(ctx),
      child: const Icon(Icons.close_rounded, color: AppColors.textGrey)),
  ]);

  Widget _formLbl(String t) => Padding(
    padding: const EdgeInsets.only(bottom: 8, top: 4),
    child: Text(t, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13)));

  Widget _formField(String hint, TextEditingController ctrl, {int lines = 1}) => Container(
    margin: const EdgeInsets.only(bottom: 14),
    decoration: BoxDecoration(color: AppColors.bgDark, borderRadius: BorderRadius.circular(12),
      border: Border.all(color: AppColors.cardBorder)),
    child: TextField(controller: ctrl, maxLines: lines,
      style: const TextStyle(color: Colors.white, fontSize: 14),
      decoration: InputDecoration(hintText: hint, hintStyle: const TextStyle(color: AppColors.textGrey),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12), border: InputBorder.none)));

  Widget _priceRow(IconData icon, String label, TextEditingController ctrl, Color color) => Container(
    margin: const EdgeInsets.only(bottom: 12),
    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
    decoration: BoxDecoration(color: AppColors.bgDark, borderRadius: BorderRadius.circular(12),
      border: Border.all(color: AppColors.cardBorder)),
    child: Row(children: [
      Icon(icon, color: color, size: 18),
      const SizedBox(width: 10),
      Expanded(child: Text(label, style: const TextStyle(color: AppColors.textGrey, fontSize: 12))),
      const SizedBox(width: 8),
      SizedBox(width: 90, child: TextField(
        controller: ctrl, keyboardType: TextInputType.number,
        style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700),
        textAlign: TextAlign.right,
        decoration: const InputDecoration(
          prefixText: 'FCFA ', prefixStyle: TextStyle(color: AppColors.textGrey, fontSize: 13),
          hintText: '0.00', hintStyle: TextStyle(color: AppColors.textGrey),
          border: InputBorder.none, contentPadding: EdgeInsets.symmetric(vertical: 12)))),
    ]));

  Widget _submitBtn(String label, VoidCallback onTap) => SizedBox(width: double.infinity, height: 48,
    child: ElevatedButton(onPressed: onTap,
      style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
      child: Text(label, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white))));

  // Returns field hint text tailored to each service type
  Map<String, String> _hintsForService(String type) {
    switch (type) {
      case 'Accommodations':
        return {'name': 'e.g. Deluxe Sea-View Room', 'location': 'e.g. Kribi Beachfront', 'price': 'e.g. FCFA 80 / night', 'desc': 'Describe amenities, bed type, max occupancy...'};
      case 'Guides & Experiences':
        return {'name': 'e.g. Yaoundé Heritage Walk', 'location': 'e.g. Yaoundé, Centre', 'price': 'e.g. FCFA 45 / person', 'desc': 'Describe the experience, duration, what\'s included...'};
      case 'Transport & Transfers':
        return {'name': 'e.g. Airport Pickup – Douala', 'location': 'e.g. Douala Intl Airport', 'price': 'e.g. FCFA 30 / trip', 'desc': 'Vehicle type, max passengers, route details...'};
      case 'Restaurants':
        return {'name': 'e.g. Riverside Terrace (Table for 4)', 'location': 'e.g. Akwa, Douala', 'price': 'e.g. FCFA 25 / cover', 'desc': 'Cuisine type, ambiance, reservation policy...'};
      case 'Travel Bundles':
        return {'name': 'e.g. Kribi 3-Day Package', 'location': 'e.g. Kribi, South Region', 'price': 'e.g. FCFA 220 / person', 'desc': 'What\'s included in the bundle, duration, itinerary...'};
      default:
        return {'name': 'Listing name', 'location': 'Location', 'price': 'Price', 'desc': 'Description'};
    }
  }

  // Sample existing listings per service category (for Edit / Availability / Pricing)
  List<Map<String, String>> _sampleListings(String type) {
    switch (type) {
      case 'Accommodations':
        return [
          {'id': 'a1', 'name': 'Standard Room',       'price': 'FCFA 60/night'},
          {'id': 'a2', 'name': 'Deluxe Sea-View Room', 'price': 'FCFA 95/night'},
          {'id': 'a3', 'name': 'Family Suite',         'price': 'FCFA 140/night'},
        ];
      case 'Guides & Experiences':
        return [
          {'id': 'g1', 'name': 'Yaoundé Heritage Walk', 'price': 'FCFA 45/person'},
          {'id': 'g2', 'name': 'Kribi Boat Guide & Experience', 'price': 'FCFA 70/person'},
        ];
      case 'Transport & Transfers':
        return [
          {'id': 't1', 'name': 'Airport Pickup – Douala',   'price': 'FCFA 30/trip'},
          {'id': 't2', 'name': 'City Transfer – Yaoundé',   'price': 'FCFA 25/trip'},
          {'id': 't3', 'name': 'Intercity – Douala/Kribi',  'price': 'FCFA 55/trip'},
        ];
      case 'Restaurants':
        return [
          {'id': 'r1', 'name': 'Riverside Terrace (4 pax)', 'price': 'FCFA 25/cover'},
          {'id': 'r2', 'name': 'Private Dining Room',        'price': 'FCFA 80/booking'},
        ];
      case 'Travel Bundles':
        return [
          {'id': 'b1', 'name': 'Kribi 3-Day Package',  'price': 'FCFA 220/person'},
          {'id': 'b2', 'name': 'Buea Restaurant Week',  'price': 'FCFA 350/person'},
        ];
      default:
        return [{'id': 'x1', 'name': 'My Listing', 'price': 'FCFA 50/person'}];
    }
  }

  void _uploadSheet(BuildContext ctx) {
    // doc label → {fileName, sizeMB, ok, error}
    final Map<String, Map<String, dynamic>> docState = {
      'Trade Register Certificate': {},
      'Business License':           {},
      'Owner National ID':          {},
      'Proof of Address':           {},
    };

    // Simulated file picks — cycles deterministically to show valid & invalid cases
    final _picks = [
      {'name': 'trade_register.pdf',  'sizeMB': 0.45, 'ok': true},
      {'name': 'business_license.pdf','sizeMB': 0.82, 'ok': true},
      {'name': 'national_id_scan.jpg','sizeMB': 1.24, 'ok': false, 'err': 'File exceeds 1 MB limit (1.24 MB). Please compress or re-scan.'},
      {'name': 'proof_address.pdf',   'sizeMB': 0.31, 'ok': true},
    ];
    int _pickIdx = 0;

    showModalBottomSheet(
      context: ctx, isScrollControlled: true, backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => StatefulBuilder(builder: (bsCtx, setBS) {
        final allUploaded = docState.values.every((d) => d.isNotEmpty && d['ok'] == true);
        final anyError    = docState.values.any((d) => d['error'] != null);

        void pickFile(String docLabel) {
          final pick = _picks[_pickIdx % _picks.length];
          _pickIdx++;
          setBS(() {
            if (pick['ok'] as bool) {
              docState[docLabel] = {
                'name': pick['name'], 'sizeMB': pick['sizeMB'], 'ok': true,
              };
            } else {
              docState[docLabel] = {
                'name': pick['name'], 'sizeMB': pick['sizeMB'],
                'ok': false, 'error': pick['err'],
              };
            }
          });
        }

        return Padding(
          padding: EdgeInsets.only(
              bottom: MediaQuery.of(ctx).viewInsets.bottom + 32,
              left: 24, right: 24, top: 24),
          child: SingleChildScrollView(child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
            // Header
            Row(children: [
              const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Upload Documents', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 18)),
                SizedBox(height: 3),
                Text('Required for service approval', style: TextStyle(color: AppColors.textGrey, fontSize: 12)),
              ])),
              GestureDetector(onTap: () => Navigator.pop(bsCtx),
                child: const Icon(Icons.close_rounded, color: AppColors.textGrey)),
            ]),
            const SizedBox(height: 8),

            // Limit info
            Container(margin: const EdgeInsets.only(top: 12, bottom: 20),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.25))),
              child: const Row(children: [
                Icon(Icons.info_outline_rounded, color: AppColors.primary, size: 15),
                SizedBox(width: 8),
                Expanded(child: Text(
                  'Each document must be PDF, JPG or PNG · Max 1 MB per file',
                  style: TextStyle(color: AppColors.primary, fontSize: 12, height: 1.4))),
              ])),

            // Document rows
            ...docState.entries.map((e) {
              final label = e.key;
              final d     = e.value;
              final hasFile   = d.isNotEmpty;
              final isOk      = d['ok'] == true;
              final hasError  = d['error'] != null;
              final sizeMB    = d['sizeMB'] as double?;

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.bgDark,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: hasError  ? Colors.red.withValues(alpha: 0.5)
                         : isOk     ? AppColors.primary.withValues(alpha: 0.4)
                         : AppColors.cardBorder.withValues(alpha: 0.5))),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    Icon(
                      hasError ? Icons.error_rounded : isOk ? Icons.check_circle_rounded : Icons.upload_file_rounded,
                      color: hasError ? Colors.red : isOk ? AppColors.primary : AppColors.textGrey,
                      size: 20),
                    const SizedBox(width: 12),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(label, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                      if (hasFile) ...[
                        const SizedBox(height: 3),
                        Row(children: [
                          Text(d['name'] as String,
                            style: const TextStyle(color: AppColors.textGrey, fontSize: 11),
                            maxLines: 1, overflow: TextOverflow.ellipsis),
                          const SizedBox(width: 8),
                          Text('${sizeMB!.toStringAsFixed(2)} MB',
                            style: TextStyle(
                              color: hasError ? Colors.red : AppColors.textGrey,
                              fontSize: 11, fontWeight: FontWeight.w600)),
                        ]),
                      ],
                    ])),
                    GestureDetector(
                      onTap: () => pickFile(label),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: hasError
                            ? Colors.red.withValues(alpha: 0.1)
                            : AppColors.primary.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: hasError
                              ? Colors.red.withValues(alpha: 0.3)
                              : AppColors.primary.withValues(alpha: 0.3))),
                        child: Text(hasFile ? 'Replace' : 'Choose',
                          style: TextStyle(
                            color: hasError ? Colors.red : AppColors.primary,
                            fontSize: 11, fontWeight: FontWeight.w700)))),
                  ]),
                  if (hasError) ...[
                    const SizedBox(height: 10),
                    Container(padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.red.withValues(alpha: 0.07),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.red.withValues(alpha: 0.25))),
                      child: Row(children: [
                        const Icon(Icons.warning_rounded, color: Colors.red, size: 14),
                        const SizedBox(width: 8),
                        Expanded(child: Text(d['error'] as String,
                          style: const TextStyle(color: Colors.red, fontSize: 11, height: 1.4))),
                      ])),
                  ],
                ]));
            }),

            const SizedBox(height: 8),

            // Submit button
            SizedBox(width: double.infinity, height: 50,
              child: ElevatedButton(
                onPressed: (allUploaded && !anyError) ? () {
                  Navigator.pop(bsCtx);
                  ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(
                    content: Text('Documents submitted for review!'),
                    backgroundColor: AppColors.bgCard));
                } : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  disabledBackgroundColor: AppColors.bgCardLight,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                child: Text(
                  allUploaded && !anyError
                    ? 'Submit for Review'
                    : anyError
                      ? 'Fix errors above to continue'
                      : 'Upload all documents to continue',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: (allUploaded && !anyError) ? Colors.white : AppColors.textGrey,
                    fontSize: 13)))),
            const SizedBox(height: 8),
          ])));
      }));
  }

  Widget _st(IconData icon, String label, Color color, VoidCallback onTap) =>
    GestureDetector(onTap: onTap,
      child: Container(margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: color.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.2))),
        child: Row(children: [
          Icon(icon, color: color, size: 20), const SizedBox(width: 12),
          Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w600, fontSize: 14)),
          const Spacer(),
          Icon(Icons.arrow_forward_ios_rounded, color: color.withValues(alpha: 0.5), size: 14),
        ])));


}

class _SI {
  final String title, desc; final IconData icon; final Color color; final VoidCallback onTap;
  const _SI(this.title, this.icon, this.color, this.desc, this.onTap);
}

// ── Dispute Center ────────────────────────────────────────────────────────
class _DisputeScreen extends StatelessWidget {
  const _DisputeScreen();
  @override
  Widget build(BuildContext context) {
    final items = [
      {'user':'James K.','issue':'Refund request – Mt Cameroon hike cancelled','status':'Open','date':'Mar 9, 2026'},
      {'user':'Fatou D.','issue':'Service not as described – city tour','status':'Resolved','date':'Feb 28, 2026'},
      {'user':'Eric M.','issue':'Double booking – Kribi Beach tour','status':'Under Review','date':'Feb 20, 2026'},
    ];
    Color sc(String s) => s=='Open' ? Colors.orange : s=='Resolved' ? AppColors.primary : Colors.blue;
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(backgroundColor: AppColors.bgCard,
        leading: IconButton(icon: const Icon(Icons.arrow_back_rounded, color: Colors.white), onPressed: () => Navigator.pop(context)),
        title: const Text('Dispute Center')),
      body: ListView(padding: const EdgeInsets.all(16), children: [
        ...items.map((d) => Container(
          margin: const EdgeInsets.only(bottom: 12), padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Text(d['user']!, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14)),
              const Spacer(),
              Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: sc(d['status']!).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(20)),
                child: Text(d['status']!, style: TextStyle(color: sc(d['status']!), fontSize: 10, fontWeight: FontWeight.w700))),
            ]),
            const SizedBox(height: 6),
            Text(d['issue']!, style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
            const SizedBox(height: 6),
            Text(d['date']!, style: const TextStyle(color: AppColors.textGrey, fontSize: 10)),
          ]))),
      ]));
  }
}

// ── Reviews screen ────────────────────────────────────────────────────────
class _ReviewsScreen extends StatelessWidget {
  const _ReviewsScreen();
  @override
  Widget build(BuildContext context) {
    final reviews = [
      {'user':'Sarah M.','rating':5,'comment':'Amazing Kribi Beach tour! The guide was knowledgeable and the experience was unforgettable.','date':'Mar 5, 2026'},
      {'user':'James K.','rating':4,'comment':'Great experience overall. The hike was well organized, just a bit rushed at the summit.','date':'Mar 3, 2026'},
      {'user':'Amina T.','rating':5,'comment':'The Yaoundé city tour was excellent. Very informative and the driver was punctual.','date':'Feb 22, 2026'},
      {'user':'Paul N.',  'rating':3,'comment':'The group discount was good but communication about the meeting point was unclear.','date':'Feb 18, 2026'},
    ];
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(backgroundColor: AppColors.bgCard,
        leading: IconButton(icon: const Icon(Icons.arrow_back_rounded, color: Colors.white), onPressed: () => Navigator.pop(context)),
        title: const Text('Reviews & Ratings'),
        actions: [
          Container(margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
            child: Row(children: [
              const Icon(Icons.star_rounded, color: AppColors.amber, size: 16),
              const SizedBox(width: 4),
              Text('4.3 avg', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 12)),
            ])),
        ]),
      body: ListView(padding: const EdgeInsets.all(16), children: [
        ...reviews.map((r) => Container(
          margin: const EdgeInsets.only(bottom: 12), padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Text(r['user'] as String, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
              const Spacer(),
              Row(children: List.generate(5, (i) => Icon(Icons.star_rounded,
                color: i < (r['rating'] as int) ? AppColors.amber : AppColors.textGrey.withValues(alpha: 0.3), size: 14))),
            ]),
            const SizedBox(height: 8),
            Text(r['comment'] as String, style: const TextStyle(color: AppColors.textGrey, fontSize: 12, height: 1.4)),
            const SizedBox(height: 6),
            Text(r['date'] as String, style: const TextStyle(color: AppColors.textGrey, fontSize: 10)),
          ]))),
      ]));
  }
}

class SearchBarWidget2 extends StatelessWidget {
  const SearchBarWidget2({super.key});
  @override
  Widget build(BuildContext ctx) => Scaffold(
    backgroundColor: AppColors.bgDark,
    appBar: AppBar(title: const Text('Search'), backgroundColor: AppColors.bgCard),
    body: const Padding(padding: EdgeInsets.all(16),
      child: TextField(autofocus: true,
        style: TextStyle(color: Colors.white),
        decoration: InputDecoration(hintText: 'Search services...',
          prefixIcon: Icon(Icons.search_rounded, color: AppColors.primary)))));
}
