import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:math';
import '../../theme/app_theme.dart';
import '../services/services_screen.dart';

// ═══════════════════════════════════════════════════════════════════════════
// DATA MODELS
// ═══════════════════════════════════════════════════════════════════════════

enum TripType { solo, group }
enum TripStatus { planning, active, completed }

class TripService {
  final String id, name, description;
  final IconData icon;
  final Color color;
  final double price;
  bool selected;

  TripService({
    required this.id,
    required this.name,
    required this.description,
    required this.icon,
    required this.color,
    required this.price,
    this.selected = false,
  });
}

class TripMember {
  final String id, name, initials;
  final Color color;
  final bool isOrganizer;

  const TripMember({
    required this.id,
    required this.name,
    required this.initials,
    required this.color,
    this.isOrganizer = false,
  });
}

class ServiceVote {
  final String serviceId;
  final Map<String, bool> votes;
  ServiceVote({required this.serviceId, Map<String, bool>? votes})
      : votes = votes ?? {};
}

class ChatMessage {
  final String senderId, senderName, senderInitials, text;
  final Color senderColor;
  final DateTime time;
  final bool isSystem;

  const ChatMessage({
    required this.senderId,
    required this.senderName,
    required this.senderInitials,
    required this.text,
    required this.senderColor,
    required this.time,
    this.isSystem = false,
  });
}

// Proposed service item for voting
class ProposedServiceItem {
  final String id, name, location, description;
  final double price;
  final IconData icon;
  final Color color;
  final String category;
  final Map<String, bool> votes; // memberId -> voted

  ProposedServiceItem({
    required this.id,
    required this.name,
    required this.location,
    required this.description,
    required this.price,
    required this.icon,
    required this.color,
    required this.category,
    Map<String, bool>? votes,
  }) : votes = votes ?? {};

  int get voteCount => votes.values.where((v) => v).length;
}

class TripPlan {
  final String id, title, destination, dates, description;
  final TripType type;
  final TripStatus status;
  final List<TripMember> members;
  final List<TripService> services;
  final List<ServiceVote> votes;
  final List<ChatMessage> messages;
  final String inviteCode;
  final int durationDays;
  final double budget;
  // Proposed services for group voting (organizer only)
  final Map<String, List<ProposedServiceItem>> proposedServices; // category -> items
  final Set<String> bookedServiceIds; // ids of items that have been booked

  TripPlan({
    required this.id,
    required this.title,
    required this.destination,
    required this.dates,
    required this.description,
    required this.type,
    this.status = TripStatus.planning,
    this.members = const [],
    this.services = const [],
    this.votes = const [],
    this.messages = const [],
    required this.inviteCode,
    required this.durationDays,
    required this.budget,
    Map<String, List<ProposedServiceItem>>? proposedServices,
    Set<String>? bookedServiceIds,
  })  : proposedServices = proposedServices ?? {},
        bookedServiceIds = bookedServiceIds ?? {};
}

// ── Sample data ──────────────────────────────────────────────────────────
final List<TripPlan> globalTrips = [
  TripPlan(
    id: 'trip1',
    title: 'Kribi Beach Getaway',
    destination: 'Kribi, South Region',
    dates: 'Apr 12–15, 2026',
    description: 'A relaxing 4-day coastal escape with snorkeling, seafood & sunset walks.',
    type: TripType.group,
    status: TripStatus.active,
    members: [
      const TripMember(id: 'm1', name: 'You', initials: 'ME', color: AppColors.primary, isOrganizer: true),
      const TripMember(id: 'm2', name: 'Sandra K.', initials: 'SK', color: Color(0xFF8B5CF6)),
      const TripMember(id: 'm3', name: 'Jean-Paul', initials: 'JP', color: Color(0xFF3B82F6)),
    ],
    inviteCode: 'TRAVEO-KRIBI-4821',
    durationDays: 4,
    budget: 280000,
  ),
];

// ── All available service items by category ──────────────────────────────
final _allProposedItems = <String, List<ProposedServiceItem>>{
  'Hotel': [
    ProposedServiceItem(id: 'h1', name: 'Hilton Yaoundé', location: 'Yaoundé', description: 'Luxury 5-star hotel in the heart of the capital', price: 180000, icon: Icons.hotel_rounded, color: Color(0xFF00ACC1), category: 'Hotel'),
    ProposedServiceItem(id: 'h2', name: 'Sawa Hotel Douala', location: 'Douala', description: 'Premium waterfront hotel with stunning views', price: 140000, icon: Icons.hotel_rounded, color: Color(0xFF00ACC1), category: 'Hotel'),
    ProposedServiceItem(id: 'h3', name: 'Limbe Beach Resort', location: 'Limbe', description: 'Beachfront resort with private access to the sea', price: 95000, icon: Icons.hotel_rounded, color: Color(0xFF00ACC1), category: 'Hotel'),
    ProposedServiceItem(id: 'h4', name: 'Mont Fébé Hotel', location: 'Yaoundé', description: 'Hilltop hotel with panoramic city views', price: 120000, icon: Icons.hotel_rounded, color: Color(0xFF00ACC1), category: 'Hotel'),
  ],

  'Guide & Experience': [
    ProposedServiceItem(id: 't1', name: 'Kribi Beach Day Guide & Experience', location: 'Kribi', description: 'Full-day guided beach experience with snorkeling', price: 45000, icon: Icons.tour_rounded, color: Color(0xFF1DB954), category: 'Guide & Experience'),
    ProposedServiceItem(id: 't2', name: 'Yaoundé City Highlights', location: 'Yaoundé', description: 'Explore the best of the capital city', price: 30000, icon: Icons.tour_rounded, color: Color(0xFF1DB954), category: 'Guide & Experience'),
    ProposedServiceItem(id: 't3', name: 'Limbe Wildlife Centre', location: 'Limbe', description: 'Visit rescued primates in their sanctuary', price: 25000, icon: Icons.tour_rounded, color: Color(0xFF1DB954), category: 'Guide & Experience'),
  ],
  'Restaurant': [
    ProposedServiceItem(id: 'r1', name: 'La Terrasse Fine Dining', location: 'Yaoundé', description: 'Award-winning fine dining in the capital', price: 25000, icon: Icons.restaurant_rounded, color: Color(0xFF4CAF50), category: 'Restaurant'),
    ProposedServiceItem(id: 'r2', name: 'Le Wouri Seafood Grill', location: 'Douala', description: 'Fresh catch grilled on the waterfront', price: 35000, icon: Icons.restaurant_rounded, color: Color(0xFF4CAF50), category: 'Restaurant'),
    ProposedServiceItem(id: 'r3', name: 'Kribi Beach Restaurant', location: 'Kribi', description: 'Authentic cuisine with ocean views', price: 20000, icon: Icons.restaurant_rounded, color: Color(0xFF4CAF50), category: 'Restaurant'),
  ],
  'Event': [
    ProposedServiceItem(id: 'e1', name: 'Ngondo Festival VIP', location: 'Douala', description: 'VIP access to Cameroon\'s biggest river festival', price: 200000, icon: Icons.event_rounded, color: Color(0xFFF5A623), category: 'Event'),
    ProposedServiceItem(id: 'e2', name: 'Foumban Royal Arts', location: 'Foumban', description: 'Exclusive cultural ceremony & palace access', price: 150000, icon: Icons.event_rounded, color: Color(0xFFF5A623), category: 'Event'),
    ProposedServiceItem(id: 'e3', name: 'Jazz in the Valley', location: 'Bafoussam', description: 'Premium concert with top Cameroonian artists', price: 180000, icon: Icons.event_rounded, color: Color(0xFFF5A623), category: 'Event'),
  ],
  'Flight': [
    ProposedServiceItem(id: 'f1', name: 'Yaoundé → Douala', location: 'NSI → DLA', description: 'Domestic 45-minute flight, Camair-Co', price: 45000, icon: Icons.airplanemode_active_rounded, color: Color(0xFF2196F3), category: 'Flight'),
    ProposedServiceItem(id: 'f2', name: 'Douala → Kribi Charter', location: 'DLA → Kribi', description: 'Private charter flight, ~30 min', price: 120000, icon: Icons.airplanemode_active_rounded, color: Color(0xFF2196F3), category: 'Flight'),
    ProposedServiceItem(id: 'f3', name: 'Yaoundé → Paris CDG', location: 'NSI → CDG', description: 'International economy class, Air France', price: 450000, icon: Icons.airplanemode_active_rounded, color: Color(0xFF2196F3), category: 'Flight'),
  ],
  'Train': [
    ProposedServiceItem(id: 'tr1', name: 'Yaoundé → Douala Express', location: 'Yaoundé → Douala', description: 'Intercity express train, ~4 hrs', price: 6500, icon: Icons.train_rounded, color: Color(0xFF9C27B0), category: 'Train'),
    ProposedServiceItem(id: 'tr2', name: 'Yaoundé → Ngaoundéré', location: 'Yaoundé → Ngaoundéré', description: 'Overnight sleeper train, ~14 hrs', price: 15000, icon: Icons.train_rounded, color: Color(0xFF9C27B0), category: 'Train'),
  ],
  'Boat': [
    ProposedServiceItem(id: 'b1', name: 'Wouri River Cruise', location: 'Douala', description: 'Sunset cruise along the Wouri estuary', price: 25000, icon: Icons.directions_boat_rounded, color: Color(0xFF00BCD4), category: 'Boat'),
    ProposedServiceItem(id: 'b2', name: 'Kribi Ferry Crossing', location: 'Kribi', description: 'Ferry to Batanga island and back', price: 8000, icon: Icons.directions_boat_rounded, color: Color(0xFF00BCD4), category: 'Boat'),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// TRIP PLANNER ENTRY — shows existing trips + "Create Trip" button
// ═══════════════════════════════════════════════════════════════════════════

class TripPlannerScreen extends StatefulWidget {
  const TripPlannerScreen({super.key});
  @override
  State<TripPlannerScreen> createState() => _TripPlannerScreenState();
}

class _TripPlannerScreenState extends State<TripPlannerScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulse;
  late Animation<double> _pulseAnim;

  @override
  void initState() {
    super.initState();
    _pulse = AnimationController(vsync: this, duration: const Duration(milliseconds: 2000))
      ..repeat(reverse: true);
    _pulseAnim = Tween<double>(begin: 0.95, end: 1.0).animate(
        CurvedAnimation(parent: _pulse, curve: Curves.easeInOut));
  }

  @override
  void dispose() { _pulse.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _createTripBanner(context),
        const SizedBox(height: 24),
        if (globalTrips.isNotEmpty) ...[
          _sectionTitle('My Trips', '${globalTrips.length}'),
          const SizedBox(height: 12),
          ...globalTrips.map((t) => _tripCard(context, t)),
        ] else
          _emptyState(context),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _createTripBanner(BuildContext context) {
    return AnimatedBuilder(
      animation: _pulseAnim,
      builder: (_, child) => Transform.scale(scale: _pulseAnim.value, child: child),
      child: GestureDetector(
        onTap: () => _openCreateTrip(context),
        child: Container(
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF0D3A20), Color(0xFF1DB873), Color(0xFF0D4025)],
              stops: [0.0, 0.5, 1.0]),
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: AppColors.primary.withValues(alpha: 0.5), width: 1.5),
            boxShadow: [BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.25),
                blurRadius: 20, offset: const Offset(0, 6))]),
          child: Row(children: [
            Container(
              width: 58, height: 58,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(16)),
              child: const Icon(Icons.add_location_alt_rounded,
                  color: Colors.white, size: 30)),
            const SizedBox(width: 16),
            const Expanded(child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Create a New Trip', style: TextStyle(
                    color: Colors.white, fontWeight: FontWeight.w900, fontSize: 17)),
                SizedBox(height: 4),
                Text('Solo escape or group trip\nPlan everything in one place',
                    style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.4)),
              ])),
            Container(
              width: 42, height: 42,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                shape: BoxShape.circle),
              child: const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 22)),
          ]),
        ),
      ),
    );
  }

  Widget _sectionTitle(String title, String badge) => Row(children: [
    Container(width: 3, height: 18,
        decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(2))),
    const SizedBox(width: 8),
    Text(title, style: const TextStyle(
        color: AppColors.textWhite, fontWeight: FontWeight.w800, fontSize: 16)),
    const SizedBox(width: 8),
    Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
            color: AppColors.primaryLight, borderRadius: BorderRadius.circular(10)),
        child: Text(badge, style: const TextStyle(
            color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.w700))),
  ]);

  Widget _emptyState(BuildContext context) => Container(
    padding: const EdgeInsets.all(32),
    child: Column(children: [
      Icon(Icons.map_outlined, color: AppColors.primary.withValues(alpha: 0.3), size: 64),
      const SizedBox(height: 16),
      const Text('No trips yet', style: TextStyle(
          color: AppColors.textWhite, fontWeight: FontWeight.w700, fontSize: 16)),
      const SizedBox(height: 8),
      const Text('Tap above to plan your first trip!',
          style: TextStyle(color: AppColors.textMuted, fontSize: 13),
          textAlign: TextAlign.center),
    ]),
  );

  Widget _tripCard(BuildContext context, TripPlan t) {
    final isGroup = t.type == TripType.group;
    final typeColor = isGroup ? const Color(0xFF8B5CF6) : AppColors.primary;
    final statusColors = {
      TripStatus.planning: Colors.orange,
      TripStatus.active: AppColors.primary,
      TripStatus.completed: AppColors.textMuted,
    };
    final statusLabels = {
      TripStatus.planning: 'Planning',
      TripStatus.active: 'Active',
      TripStatus.completed: 'Done',
    };

    return GestureDetector(
      onTap: () => Navigator.push(context,
          MaterialPageRoute(builder: (_) => TripDashboardScreen(trip: t)))
          .then((_) => setState(() {})),
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: typeColor.withValues(alpha: 0.25)),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.15),
              blurRadius: 10, offset: const Offset(0, 3))]),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(height: 6,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [typeColor, typeColor.withValues(alpha: 0.4)]),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)))),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: typeColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: typeColor.withValues(alpha: 0.3))),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    Icon(isGroup ? Icons.group_rounded : Icons.person_rounded,
                        color: typeColor, size: 11),
                    const SizedBox(width: 4),
                    Text(isGroup ? 'Group' : 'Solo',
                        style: TextStyle(color: typeColor, fontSize: 10, fontWeight: FontWeight.w700)),
                  ])),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: statusColors[t.status]!.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8)),
                  child: Text(statusLabels[t.status]!,
                      style: TextStyle(color: statusColors[t.status]!,
                          fontSize: 10, fontWeight: FontWeight.w700))),
                const Spacer(),
                const Icon(Icons.arrow_forward_ios_rounded, color: AppColors.textMuted, size: 14),
              ]),
              const SizedBox(height: 10),
              Text(t.title, style: const TextStyle(
                  color: AppColors.textWhite, fontWeight: FontWeight.w800, fontSize: 16)),
              const SizedBox(height: 4),
              Row(children: [
                Icon(Icons.location_on_rounded, color: typeColor, size: 13),
                const SizedBox(width: 3),
                Text(t.destination, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
                const SizedBox(width: 12),
                Icon(Icons.calendar_today_rounded, color: typeColor, size: 11),
                const SizedBox(width: 3),
                Text(t.dates, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
              ]),
              const SizedBox(height: 12),
              Row(children: [
                if (isGroup) ...[
                  SizedBox(
                    width: (t.members.length * 20.0) + 12, height: 26,
                    child: Stack(children: t.members.asMap().entries.map((e) =>
                        Positioned(left: e.key * 18.0,
                          child: Container(
                            width: 26, height: 26,
                            decoration: BoxDecoration(
                              color: e.value.color, shape: BoxShape.circle,
                              border: Border.all(color: AppColors.bgCard, width: 1.5)),
                            child: Center(child: Text(e.value.initials.substring(0, 1),
                                style: const TextStyle(color: Colors.white,
                                    fontSize: 9, fontWeight: FontWeight.w800)))))).toList()),
                  ),
                  const SizedBox(width: 8),
                  Text('${t.members.length} members',
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
                ] else ...[
                  Icon(Icons.route_rounded, color: typeColor, size: 14),
                  const SizedBox(width: 4),
                  Text('${t.durationDays} days',
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
                ],
                const Spacer(),
                Text('XAF ${_fmt(t.budget.toInt())}',
                    style: TextStyle(color: typeColor, fontWeight: FontWeight.w900, fontSize: 14)),
              ]),
            ])),
        ]),
      ),
    );
  }

  void _openCreateTrip(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => CreateTripTypeSheet(
        onTypeSelected: (type) {
          Navigator.pop(context);
          Navigator.push(context, MaterialPageRoute(
              builder: (_) => CreateTripFormScreen(type: type)))
              .then((_) => setState(() {}));
        },
      ),
    );
  }

  String _fmt(int n) => n >= 1000000
      ? '${(n / 1000000).toStringAsFixed(1)}M'
      : n >= 1000 ? '${(n / 1000).toStringAsFixed(0)}K' : n.toString();
}

// ═══════════════════════════════════════════════════════════════════════════
// TRIP TYPE SELECTION SHEET
// ═══════════════════════════════════════════════════════════════════════════

class CreateTripTypeSheet extends StatelessWidget {
  final void Function(TripType) onTypeSelected;
  const CreateTripTypeSheet({required this.onTypeSelected});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 40),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Container(width: 40, height: 4,
          decoration: BoxDecoration(color: AppColors.cardBorder, borderRadius: BorderRadius.circular(2))),
        const SizedBox(height: 24),
        const Text('Create a Trip', style: TextStyle(
            color: AppColors.textWhite, fontWeight: FontWeight.w900, fontSize: 22)),
        const SizedBox(height: 6),
        const Text('Choose your trip type', style: TextStyle(color: AppColors.textMuted, fontSize: 14)),
        const SizedBox(height: 28),
        _typeCard(context, type: TripType.solo, icon: Icons.person_rounded, title: 'Solo Trip',
          subtitle: 'Plan your personal trip, select services and book instantly.',
          color: AppColors.primary,
          features: ['Quick form fill', 'Instant booking', 'Private itinerary']),
        const SizedBox(height: 14),
        _typeCard(context, type: TripType.group, icon: Icons.group_rounded, title: 'Group Trip',
          subtitle: 'Invite friends, vote on services together and plan as a team.',
          color: const Color(0xFF8B5CF6),
          features: ['Group chat', 'Service voting', 'Shared itinerary']),
        const SizedBox(height: 8),
      ]),
    );
  }

  Widget _typeCard(BuildContext context, {required TripType type, required IconData icon,
      required String title, required String subtitle, required Color color, required List<String> features}) {
    return GestureDetector(
      onTap: () => onTypeSelected(type),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: AppColors.bgCardMid,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: color.withValues(alpha: 0.35), width: 1.5)),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(width: 52, height: 52,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [color, color.withValues(alpha: 0.6)]),
              borderRadius: BorderRadius.circular(14)),
            child: Icon(icon, color: Colors.white, size: 26)),
          const SizedBox(width: 14),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title, style: const TextStyle(
                color: AppColors.textWhite, fontWeight: FontWeight.w800, fontSize: 16)),
            const SizedBox(height: 4),
            Text(subtitle, style: const TextStyle(color: AppColors.textMuted, fontSize: 12, height: 1.4)),
            const SizedBox(height: 10),
            Wrap(spacing: 6, runSpacing: 4, children: features.map((f) => Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
              child: Text(f, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w600)))).toList()),
          ])),
          Icon(Icons.chevron_right_rounded, color: color, size: 22),
        ]),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CREATE TRIP FORM SCREEN
// ═══════════════════════════════════════════════════════════════════════════

class CreateTripFormScreen extends StatefulWidget {
  final TripType type;
  const CreateTripFormScreen({super.key, required this.type});
  @override
  State<CreateTripFormScreen> createState() => _CreateTripFormScreenState();
}

class _CreateTripFormScreenState extends State<CreateTripFormScreen> {
  final _titleCtrl = TextEditingController();
  final _destCtrl  = TextEditingController();
  final _descCtrl  = TextEditingController();
  DateTime? _startDate, _endDate;
  double _budget = 100000;
  int _page = 0;

  bool get _isSolo => widget.type == TripType.solo;

  final List<TripService> _services = [
    TripService(id: 's1', name: 'Flight', description: 'International & domestic flights',
        icon: Icons.airplanemode_active_rounded, color: Color(0xFF3B82F6), price: 150000),
    TripService(id: 's2', name: 'Hotel', description: 'Accommodation & lodging',
        icon: Icons.hotel_rounded, color: Color(0xFF8B5CF6), price: 80000),
    TripService(id: 's3', name: 'Tour Guide', description: 'Local expert guide service',
        icon: Icons.tour_rounded, color: AppColors.primary, price: 25000),
    TripService(id: 's4', name: 'Transport', description: 'Local rides & transfers',
        icon: Icons.directions_car_rounded, color: Color(0xFFF59E0B), price: 15000),
    TripService(id: 's5', name: 'Restaurant', description: 'Restaurants & dining',
        icon: Icons.restaurant_rounded, color: Color(0xFF10B981), price: 20000),
    TripService(id: 's6', name: 'Dining', description: 'Restaurant & food packages',
        icon: Icons.restaurant_rounded, color: Color(0xFFF97316), price: 20000),
    TripService(id: 's7', name: 'Events', description: 'Shows, concerts & events',
        icon: Icons.event_rounded, color: Color(0xFFEC4899), price: 12000),
    TripService(id: 's8', name: 'Boat', description: 'River & sea crossings',
        icon: Icons.directions_boat_rounded, color: Color(0xFF06B6D4), price: 35000),
  ];

  bool get _formValid =>
      _titleCtrl.text.isNotEmpty && _destCtrl.text.isNotEmpty &&
      _startDate != null && _endDate != null;

  @override
  void dispose() {
    _titleCtrl.dispose(); _destCtrl.dispose(); _descCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        backgroundColor: AppColors.bgCard,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, color: AppColors.textWhite, size: 20),
          onPressed: () { if (_page > 0) setState(() => _page--); else Navigator.pop(context); }),
        title: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(_isSolo ? 'Solo Trip' : 'Group Trip',
              style: const TextStyle(color: AppColors.textWhite, fontWeight: FontWeight.w800, fontSize: 17)),
          Text(_page == 0 ? 'Trip Details' : 'Select Services',
              style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
        ]),
        actions: [
          if (_isSolo)
            Padding(padding: const EdgeInsets.only(right: 16),
              child: Row(mainAxisSize: MainAxisSize.min,
                children: List.generate(2, (i) => Container(
                  width: 8, height: 8, margin: const EdgeInsets.only(left: 4),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: i <= _page ? AppColors.primary : AppColors.cardBorder)))))
          else const SizedBox(),
        ],
      ),
      body: _page == 0 ? _detailsPage() : _servicesPage(),
    );
  }

  Widget _detailsPage() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: (_isSolo ? AppColors.primary : const Color(0xFF8B5CF6)).withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: (_isSolo ? AppColors.primary : const Color(0xFF8B5CF6)).withValues(alpha: 0.2))),
          child: Row(children: [
            Icon(_isSolo ? Icons.person_rounded : Icons.group_rounded,
                color: _isSolo ? AppColors.primary : const Color(0xFF8B5CF6), size: 20),
            const SizedBox(width: 10),
            Expanded(child: Text(
              _isSolo ? 'Solo Trip — Fill in details and select services'
                       : 'Group Trip — Fill in details, then invite your crew',
              style: TextStyle(
                color: _isSolo ? AppColors.primary : const Color(0xFF8B5CF6),
                fontSize: 12, fontWeight: FontWeight.w600))),
          ])),
        const SizedBox(height: 22),
        _fieldLabel('Trip Title'),
        _textField(_titleCtrl, 'e.g. Kribi Beach Escape', Icons.title_rounded),
        const SizedBox(height: 16),
        _fieldLabel('Destination'),
        _textField(_destCtrl, 'e.g. Kribi, South Region', Icons.location_on_rounded),
        const SizedBox(height: 16),
        _fieldLabel('Description (optional)'),
        _textField(_descCtrl, 'What\'s this trip about?', Icons.description_rounded, maxLines: 3),
        const SizedBox(height: 16),
        _fieldLabel('Dates'),
        Row(children: [
          Expanded(child: _datePicker('Start', _startDate, false, (d) {
            setState(() {
              _startDate = d;
              // Reset end date if it's before or equal to the new start date
              if (_endDate != null && !_endDate!.isAfter(d)) _endDate = null;
            });
          })),
          const SizedBox(width: 12),
          Expanded(child: _datePicker('End', _endDate, true, (d) => setState(() => _endDate = d))),
        ]),
        const SizedBox(height: 20),
        _fieldLabel('Estimated Budget: XAF ${_fmt(_budget.toInt())}'),
        SliderTheme(
          data: SliderThemeData(
            activeTrackColor: AppColors.primary,
            inactiveTrackColor: AppColors.cardBorder,
            thumbColor: AppColors.primary,
            overlayColor: AppColors.primaryLight,
            thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 10)),
          child: Slider(value: _budget, min: 10000, max: 2000000, divisions: 100,
              onChanged: (v) => setState(() => _budget = v))),
        Row(children: [
          Text('10K', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
          const Spacer(),
          Text('2M', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
        ]),
        const SizedBox(height: 32),
        SizedBox(width: double.infinity, height: 52,
          child: ElevatedButton(
            onPressed: _formValid ? _onNextDetails : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: _formValid ? AppColors.primary : AppColors.cardBorder,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
            child: Text(_isSolo ? 'Next: Select Services →' : 'Next: Create Group →',
              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: Colors.white)))),
        const SizedBox(height: 16),
      ]),
    );
  }

  Widget _servicesPage() {
    final selectedServices = _services.where((s) => s.selected).toList();
    final total = selectedServices.fold<double>(0, (sum, s) => sum + s.price);

    return Column(children: [
      Expanded(child: ListView(padding: const EdgeInsets.all(16), children: [
        Container(
          padding: const EdgeInsets.all(14), margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.06),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.primary.withValues(alpha: 0.2))),
          child: const Row(children: [
            Icon(Icons.info_outline_rounded, color: AppColors.primary, size: 18),
            SizedBox(width: 10),
            Expanded(child: Text('Select the services you want for your trip.',
                style: TextStyle(color: AppColors.primary, fontSize: 12))),
          ])),
        ...List.generate(_services.length, (i) => _serviceToggleCard(_services[i])),
      ])),
      Container(
        padding: const EdgeInsets.fromLTRB(16, 14, 16, 32),
        decoration: BoxDecoration(color: AppColors.bgCard,
            border: Border(top: BorderSide(color: AppColors.cardBorder))),
        child: Row(children: [
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('${selectedServices.length} services selected',
                style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
            Text('XAF ${_fmt(total.toInt())}',
                style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w900, fontSize: 20)),
          ]),
          const Spacer(),
          SizedBox(height: 50, width: 160,
            child: ElevatedButton(
              onPressed: selectedServices.isNotEmpty ? _bookSoloTrip : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: selectedServices.isNotEmpty ? AppColors.primary : AppColors.cardBorder,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              child: const Text('Book Trip', style: TextStyle(
                  fontWeight: FontWeight.w800, color: Colors.white, fontSize: 14)))),
        ]),
      ),
    ]);
  }

  Widget _fieldLabel(String text) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Text(text, style: const TextStyle(
        color: AppColors.textWhite, fontWeight: FontWeight.w600, fontSize: 13)));

  Widget _textField(TextEditingController ctrl, String hint, IconData icon, {int maxLines = 1}) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.bgCard, borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder)),
      child: TextField(
        controller: ctrl, maxLines: maxLines,
        style: const TextStyle(color: AppColors.textWhite, fontSize: 14),
        onChanged: (_) => setState(() {}),
        decoration: InputDecoration(
          hintText: hint, hintStyle: const TextStyle(color: AppColors.textHint, fontSize: 13),
          prefixIcon: Icon(icon, color: AppColors.primary, size: 18),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14))));
  }

  Widget _datePicker(String label, DateTime? date, bool isEnd, void Function(DateTime) onPick) {
    // End date is disabled until start date is chosen
    final isDisabled = isEnd && _startDate == null;
    return GestureDetector(
      onTap: isDisabled ? null : () async {
        final firstDate = isEnd
            ? _startDate!.add(const Duration(days: 1))
            : DateTime.now();
        final initialDate = isEnd
            ? (_endDate ?? _startDate!.add(const Duration(days: 1)))
            : (_startDate ?? DateTime.now().add(const Duration(days: 7)));
        final picked = await showDatePicker(
          context: context,
          initialDate: initialDate,
          firstDate: firstDate,
          lastDate: DateTime.now().add(const Duration(days: 365)),
          builder: (ctx, child) => Theme(
            data: Theme.of(ctx).copyWith(
                colorScheme: const ColorScheme.dark(primary: AppColors.primary)),
            child: child!));
        if (picked != null) onPick(picked);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: isDisabled
              ? AppColors.cardBorder.withValues(alpha: 0.4)
              : (date != null ? AppColors.primary.withValues(alpha: 0.5) : AppColors.cardBorder))),
        child: Row(children: [
          Icon(Icons.calendar_today_rounded,
              color: isDisabled ? AppColors.textHint : (date != null ? AppColors.primary : AppColors.textMuted), size: 16),
          const SizedBox(width: 8),
          Expanded(child: Text(
            date != null ? '${date.day}/${date.month}/${date.year}' : label,
            style: TextStyle(
                color: isDisabled ? AppColors.textHint : (date != null ? AppColors.textWhite : AppColors.textHint),
                fontSize: 12))),
        ]),
      ),
    );
  }

  Widget _serviceToggleCard(TripService s) {
    return GestureDetector(
      onTap: () => setState(() => s.selected = !s.selected),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: s.selected ? s.color.withValues(alpha: 0.08) : AppColors.bgCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
              color: s.selected ? s.color.withValues(alpha: 0.5) : AppColors.cardBorder,
              width: s.selected ? 1.5 : 1)),
        child: Row(children: [
          Container(width: 44, height: 44,
            decoration: BoxDecoration(
              color: s.selected ? s.color.withValues(alpha: 0.15) : AppColors.bgCardMid,
              borderRadius: BorderRadius.circular(12)),
            child: Icon(s.icon, color: s.selected ? s.color : AppColors.textMuted, size: 22)),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(s.name, style: TextStyle(
                color: s.selected ? AppColors.textWhite : AppColors.textMuted,
                fontWeight: FontWeight.w700, fontSize: 14)),
            Text(s.description, style: const TextStyle(color: AppColors.textHint, fontSize: 11)),
          ])),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text('XAF ${_fmt(s.price.toInt())}',
                style: TextStyle(color: s.selected ? s.color : AppColors.textMuted,
                    fontWeight: FontWeight.w800, fontSize: 12)),
            const SizedBox(height: 4),
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 22, height: 22,
              decoration: BoxDecoration(
                color: s.selected ? s.color : Colors.transparent,
                shape: BoxShape.circle,
                border: Border.all(color: s.selected ? s.color : AppColors.cardBorder, width: 2)),
              child: s.selected ? const Icon(Icons.check, color: Colors.white, size: 14) : null),
          ]),
        ]),
      ),
    );
  }

  void _onNextDetails() {
    if (_isSolo) {
      setState(() => _page = 1);
    } else {
      _createGroupTrip();
    }
  }

  void _bookSoloTrip() {
    final selected = _services.where((s) => s.selected).toList();
    final total = selected.fold<double>(0, (sum, s) => sum + s.price);
    final days = _endDate!.difference(_startDate!).inDays + 1;
    final newTrip = TripPlan(
      id: 'trip_${DateTime.now().millisecondsSinceEpoch}',
      title: _titleCtrl.text, destination: _destCtrl.text,
      dates: '${_startDate!.day}/${_startDate!.month} – ${_endDate!.day}/${_endDate!.month}/${_endDate!.year}',
      description: _descCtrl.text.isNotEmpty ? _descCtrl.text : 'Solo trip',
      type: TripType.solo, status: TripStatus.active,
      members: const [TripMember(id: 'me', name: 'You', initials: 'ME', color: AppColors.primary, isOrganizer: true)],
      services: selected, inviteCode: '', durationDays: days, budget: total);
    globalTrips.insert(0, newTrip);
    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => TripDashboardScreen(trip: newTrip)));
  }

  void _createGroupTrip() {
    final days = _endDate!.difference(_startDate!).inDays + 1;
    final inviteCode = 'TRAVEO-${_destCtrl.text.split(',').first.toUpperCase().replaceAll(' ', '-')}-${Random().nextInt(9999)}';
    final newTrip = TripPlan(
      id: 'trip_${DateTime.now().millisecondsSinceEpoch}',
      title: _titleCtrl.text, destination: _destCtrl.text,
      dates: '${_startDate!.day}/${_startDate!.month} – ${_endDate!.day}/${_endDate!.month}/${_endDate!.year}',
      description: _descCtrl.text.isNotEmpty ? _descCtrl.text : 'Group trip',
      type: TripType.group, status: TripStatus.planning,
      members: [const TripMember(id: 'me', name: 'You', initials: 'ME', color: AppColors.primary, isOrganizer: true)],
      services: _services,
      votes: _services.map((s) => ServiceVote(serviceId: s.id)).toList(),
      messages: [ChatMessage(
        senderId: 'system', senderName: 'Traveo', senderInitials: 'TV',
        text: 'Group trip "${_titleCtrl.text}" created! Share the invite code to add members.',
        senderColor: AppColors.primary, time: DateTime.now(), isSystem: true)],
      inviteCode: inviteCode, durationDays: days, budget: _budget);
    globalTrips.insert(0, newTrip);
    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => TripDashboardScreen(trip: newTrip)));
  }

  String _fmt(int n) => n >= 1000000
      ? '${(n / 1000000).toStringAsFixed(1)}M'
      : n >= 1000 ? '${(n / 1000).toStringAsFixed(0)}K' : n.toString();
}

// ═══════════════════════════════════════════════════════════════════════════
// TRIP DASHBOARD SCREEN
// ═══════════════════════════════════════════════════════════════════════════

class TripDashboardScreen extends StatefulWidget {
  final TripPlan trip;
  const TripDashboardScreen({super.key, required this.trip});
  @override
  State<TripDashboardScreen> createState() => _TripDashboardScreenState();
}

class _TripDashboardScreenState extends State<TripDashboardScreen>
    with TickerProviderStateMixin {
  late TabController _tab;
  final _msgCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  late TripPlan _trip;

  // Per-category search & filter state
  final Map<String, TextEditingController> _catSearchCtrls = {};
  final Map<String, String> _catSearchQuery = {};
  final Map<String, String> _catFilterLocation = {};
  final Map<String, RangeValues> _catPriceRange = {};
  final Map<String, bool> _catShowFilters = {};
  final Map<String, bool> _catExpanded = {};

  // Legacy global vars (kept to avoid breaking _serviceCategoryCard references)
  final _serviceSearchCtrl = TextEditingController();
  String _serviceSearchQuery = '';
  String _filterLocation = 'All';
  RangeValues _priceRange = const RangeValues(0, 500000);
  bool _showFilters = false;

  // Voting mode per category: true = put to vote, false = direct book
  final Map<String, bool> _votingModePerCategory = {};

  TextEditingController _catCtrl(String cat) =>
      _catSearchCtrls.putIfAbsent(cat, TextEditingController.new);
  String _catQuery(String cat) => _catSearchQuery[cat] ?? '';
  String _catLoc(String cat) => _catFilterLocation[cat] ?? 'All';
  RangeValues _catPrice(String cat) => _catPriceRange[cat] ?? const RangeValues(0, 500000);
  bool _catFilters(String cat) => _catShowFilters[cat] ?? false;
  bool _catIsExpanded(String cat) => _catExpanded[cat] ?? false;

  bool get _isGroup => _trip.type == TripType.group;
  bool get _isOrganizer => _trip.members.any((m) => m.id == 'me' && m.isOrganizer);
  Color get _typeColor => _isGroup ? const Color(0xFF8B5CF6) : AppColors.primary;

  @override
  void initState() {
    super.initState();
    _trip = widget.trip;
    // Tabs: Chat (group), Bookings, Proposed (group organizer), Itinerary, Members
    final tabCount = _isGroup ? (_isOrganizer ? 5 : 4) : 3;
    _tab = TabController(length: tabCount, vsync: this);
  }

  @override
  void dispose() {
    _tab.dispose(); _msgCtrl.dispose(); _scrollCtrl.dispose();
    _serviceSearchCtrl.dispose();
    for (final ctrl in _catSearchCtrls.values) ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Column(children: [
        _header(context),
        _tabBar(),
        Expanded(child: TabBarView(controller: _tab, children: [
          if (_isGroup) _chatTab(),
          _bookingsTab(),
          if (_isGroup && _isOrganizer) _proposedServicesTab(),
          _itineraryTab(),
          _membersTab(),
        ])),
      ]),
    );
  }

  Widget _header(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft, end: Alignment.bottomRight,
          colors: [_typeColor.withValues(alpha: 0.15), AppColors.bgCard])),
      child: SafeArea(bottom: false, child: Column(children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: Row(children: [
            GestureDetector(
              onTap: () => Navigator.pop(context),
              child: Container(width: 38, height: 38,
                decoration: BoxDecoration(color: AppColors.bgCardMid,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.cardBorder)),
                child: const Icon(Icons.arrow_back_ios_rounded, color: AppColors.textWhite, size: 18))),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(_trip.title, style: const TextStyle(
                  color: AppColors.textWhite, fontWeight: FontWeight.w800, fontSize: 17),
                  maxLines: 1, overflow: TextOverflow.ellipsis),
              Text(_trip.destination, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
            ])),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: _typeColor.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: _typeColor.withValues(alpha: 0.3))),
              child: Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(_isGroup ? Icons.group_rounded : Icons.person_rounded, color: _typeColor, size: 13),
                const SizedBox(width: 4),
                Text(_isGroup ? 'Group' : 'Solo',
                    style: TextStyle(color: _typeColor, fontSize: 11, fontWeight: FontWeight.w700)),
              ])),
          ])),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 14),
          child: Row(children: [
            _chip(Icons.calendar_today_rounded, _trip.dates, AppColors.textMuted),
            const SizedBox(width: 8),
            _chip(Icons.route_rounded, '${_trip.durationDays}d', AppColors.textMuted),
            const SizedBox(width: 8),
            if (_isGroup) _chip(Icons.group_rounded, '${_trip.members.length} members', _typeColor),
          ])),
      ])),
    );
  }

  Widget _chip(IconData icon, String label, Color color) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    decoration: BoxDecoration(color: AppColors.bgCardMid,
      borderRadius: BorderRadius.circular(8), border: Border.all(color: AppColors.cardBorder)),
    child: Row(mainAxisSize: MainAxisSize.min, children: [
      Icon(icon, color: color, size: 11), const SizedBox(width: 4),
      Text(label, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w600)),
    ]));

  Widget _tabBar() => Container(
    color: AppColors.bgCard,
    child: TabBar(
      controller: _tab,
      indicatorColor: _typeColor, indicatorWeight: 2.5,
      labelColor: _typeColor, unselectedLabelColor: AppColors.textMuted,
      labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 11),
      isScrollable: true,
      tabs: [
        if (_isGroup) const Tab(icon: Icon(Icons.chat_rounded, size: 16), text: 'Chat'),
        const Tab(icon: Icon(Icons.book_online_rounded, size: 16), text: 'Bookings'),
        if (_isGroup && _isOrganizer)
          const Tab(icon: Icon(Icons.star_rounded, size: 16), text: 'Propose'),
        const Tab(icon: Icon(Icons.map_rounded, size: 16), text: 'Itinerary'),
        const Tab(icon: Icon(Icons.group_rounded, size: 16), text: 'Members'),
      ],
    ));

  // ── CHAT TAB ──────────────────────────────────────────────────────────────
  Widget _chatTab() {
    return Column(children: [
      if (_trip.inviteCode.isNotEmpty)
        GestureDetector(
          onTap: _copyInvite,
          child: Container(
            margin: const EdgeInsets.all(12),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: _typeColor.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: _typeColor.withValues(alpha: 0.3))),
            child: Row(children: [
              Icon(Icons.link_rounded, color: _typeColor, size: 16),
              const SizedBox(width: 8),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Invite Code', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
                Text(_trip.inviteCode, style: TextStyle(color: _typeColor, fontWeight: FontWeight.w800, fontSize: 13)),
              ])),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: _typeColor.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
                child: Text('Copy', style: TextStyle(color: _typeColor, fontSize: 11, fontWeight: FontWeight.w700))),
            ]))),
      if (_trip.proposedServices.isNotEmpty) _proposedVotingBanner(),
      Expanded(child: ListView.builder(
        controller: _scrollCtrl,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemCount: _trip.messages.length,
        itemBuilder: (_, i) => _messageItem(_trip.messages[i]))),
      _chatInput(),
    ]);
  }

  Widget _proposedVotingBanner() {
    // Count only vote-mode categories (not direct-book ones)
    int totalProposed = 0;
    for (final entry in _trip.proposedServices.entries) {
      final isVote = _votingModePerCategory[entry.key] ?? true;
      if (isVote) totalProposed += entry.value.length;
    }
    if (totalProposed == 0) return const SizedBox.shrink();
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: _typeColor.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _typeColor.withValues(alpha: 0.3))),
      child: Row(children: [
        Icon(Icons.how_to_vote_rounded, color: _typeColor, size: 18),
        const SizedBox(width: 8),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('$totalProposed services proposed for voting',
              style: TextStyle(color: _typeColor, fontWeight: FontWeight.w700, fontSize: 12)),
          const Text('Tap each category to vote on your preference',
              style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
        ])),
        GestureDetector(
          onTap: () => _showVotingSheet(),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(color: _typeColor, borderRadius: BorderRadius.circular(8)),
            child: const Text('Vote Now', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)))),
      ]));
  }

  void _showVotingSheet() {
    showModalBottomSheet(
      context: context, isScrollControlled: true,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => StatefulBuilder(builder: (ctx, setSheet) {
        return DraggableScrollableSheet(
          expand: false, initialChildSize: 0.75, maxChildSize: 0.92,
          builder: (_, ctrl) => Column(children: [
            const SizedBox(height: 12),
            Container(width: 40, height: 4,
              decoration: BoxDecoration(color: AppColors.cardBorder, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 12),
            Padding(padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(children: [
                Icon(Icons.how_to_vote_rounded, color: _typeColor, size: 20),
                const SizedBox(width: 8),
                Text('Vote on Services', style: TextStyle(color: _typeColor, fontWeight: FontWeight.w800, fontSize: 16)),
              ])),
            const SizedBox(height: 8),
            Expanded(child: ListView(controller: ctrl, padding: const EdgeInsets.all(16), children: [
              ..._trip.proposedServices.entries
                .where((entry) => (_votingModePerCategory[entry.key] ?? true))
                .map((entry) {
                final category = entry.key;
                final items = entry.value;
                return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  _categoryHeader(category),
                  const SizedBox(height: 8),
                  ...items.map((item) => _votingItemCard(item, setSheet)),
                  const SizedBox(height: 16),
                ]);
              }),
            ])),
          ]));
      }));
  }

  Widget _votingItemCard(ProposedServiceItem item, StateSetter setSheet) {
    final voted = item.votes['me'] ?? false;
    return GestureDetector(
      onTap: () {
        setSheet(() { setState(() { item.votes['me'] = !voted; }); });
        if (!voted) {
          setState(() {
            _trip.messages.add(ChatMessage(
              senderId: 'me', senderName: 'You', senderInitials: 'ME',
              text: '✅ Voted for ${item.name} (${item.category})',
              senderColor: AppColors.primary, time: DateTime.now()));
          });
        }
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: voted ? item.color.withValues(alpha: 0.08) : AppColors.bgCardMid,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: voted ? item.color.withValues(alpha: 0.5) : AppColors.cardBorder, width: voted ? 1.5 : 1)),
        child: Row(children: [
          Container(width: 40, height: 40,
            decoration: BoxDecoration(color: item.color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10)),
            child: Icon(item.icon, color: item.color, size: 20)),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(item.name, style: TextStyle(color: voted ? AppColors.textWhite : AppColors.textMuted,
                fontWeight: FontWeight.w700, fontSize: 13)),
            Text(item.location, style: const TextStyle(color: AppColors.textHint, fontSize: 10)),
            Text('XAF ${_fmt(item.price.toInt())}', style: TextStyle(color: item.color, fontWeight: FontWeight.w700, fontSize: 11)),
          ])),
          Column(children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: item.color.withValues(alpha: voted ? 0.2 : 0.08),
                borderRadius: BorderRadius.circular(8)),
              child: Text('${item.voteCount}', style: TextStyle(color: item.color, fontSize: 11, fontWeight: FontWeight.w700))),
            const SizedBox(height: 4),
            Container(width: 24, height: 24,
              decoration: BoxDecoration(
                color: voted ? item.color : Colors.transparent, shape: BoxShape.circle,
                border: Border.all(color: voted ? item.color : AppColors.cardBorder, width: 2)),
              child: voted ? const Icon(Icons.check, color: Colors.white, size: 14) : null),
          ]),
        ])));
  }

  // ── PROPOSED SERVICES TAB (Organizer only) ─────────────────────────────────
  Widget _proposedServicesTab() {
    final categories = ['Hotel', 'Restaurant', 'Guide & Experience', 'Event', 'Flight', 'Train', 'Boat'];
    return StatefulBuilder(builder: (ctx, setTab) {
      return ListView(padding: const EdgeInsets.all(16), children: [
        // ── Organizer header ────────────────────────────────────────────────
        Container(
          padding: const EdgeInsets.all(14), margin: const EdgeInsets.only(bottom: 14),
          decoration: BoxDecoration(
            color: _typeColor.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: _typeColor.withValues(alpha: 0.3))),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Icon(Icons.admin_panel_settings_rounded, color: _typeColor, size: 18),
              const SizedBox(width: 8),
              Text('Organizer — Propose Services', style: TextStyle(
                  color: _typeColor, fontWeight: FontWeight.w800, fontSize: 14)),
            ]),
            const SizedBox(height: 6),
            const Text('Tap a category to expand it. Search, filter, then select up to 3 options to vote on or book directly.',
                style: TextStyle(color: AppColors.textMuted, fontSize: 12, height: 1.4)),
          ])),
        // ── Category cards ──────────────────────────────────────────────────
        ...categories.map((cat) => _serviceCategoryCard(cat, setTab)),
      ]);
    });
  }

  Widget _serviceCategoryCard(String category, [StateSetter? setTab]) {
    final allItems = _allProposedItems[category] ?? [];
    final proposed = _trip.proposedServices[category] ?? [];
    final proposedCount = proposed.length;
    final categoryIcons = {
      'Hotel': Icons.hotel_rounded, 'Restaurant': Icons.restaurant_rounded,
      'Guide & Experience': Icons.tour_rounded,
      'Event': Icons.event_rounded, 'Flight': Icons.airplanemode_active_rounded,
      'Train': Icons.train_rounded, 'Boat': Icons.directions_boat_rounded,
    };
    final categoryColors = {
      'Hotel': const Color(0xFF00ACC1), 'Restaurant': const Color(0xFFE53935),
      'Guide & Experience': const Color(0xFF1DB954),
      'Event': const Color(0xFFF5A623), 'Flight': const Color(0xFF2196F3),
      'Train': const Color(0xFF9C27B0), 'Boat': const Color(0xFF00BCD4),
    };
    final color = categoryColors[category] ?? AppColors.primary;
    final icon = categoryIcons[category] ?? Icons.star_rounded;
    final isVoteMode = _votingModePerCategory[category] ?? true;
    final isExpanded = _catIsExpanded(category);

    // Per-category filtered items
    final filteredItems = allItems.where((item) {
      final q = _catQuery(category);
      final matchesSearch = q.isEmpty ||
          item.name.toLowerCase().contains(q.toLowerCase()) ||
          item.location.toLowerCase().contains(q.toLowerCase()) ||
          item.description.toLowerCase().contains(q.toLowerCase());
      final matchesLocation = _catLoc(category) == 'All' || item.location == _catLoc(category);
      final pr = _catPrice(category);
      final matchesPrice = item.price >= pr.start && item.price <= pr.end;
      return matchesSearch && matchesLocation && matchesPrice;
    }).toList();

    // All unique locations for THIS category
    final catLocations = <String>{'All'};
    for (final item in allItems) catLocations.add(item.location);
    final catLocationList = catLocations.toList()..sort();

    return StatefulBuilder(builder: (ctx2, setCard) {
      return AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: AppColors.bgCard, borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isExpanded
                ? color.withValues(alpha: 0.6)
                : proposedCount > 0
                    ? color.withValues(alpha: 0.4)
                    : AppColors.cardBorder,
            width: isExpanded ? 1.5 : 1)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [

          // ── Header row — always visible, tap to expand ─────────────────
          GestureDetector(
            onTap: () {
              setState(() => _catExpanded[category] = !isExpanded);
              setTab?.call(() {});
              setCard(() {});
            },
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(children: [
                Container(width: 38, height: 38,
                  decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10)),
                  child: Icon(icon, color: color, size: 20)),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(category, style: const TextStyle(color: AppColors.textWhite, fontWeight: FontWeight.w800, fontSize: 14)),
                  Text(
                    proposedCount > 0
                        ? '$proposedCount/3 selected · Tap to ${isExpanded ? 'collapse' : 'edit'}'
                        : 'Tap to browse & select',
                    style: TextStyle(
                        color: proposedCount > 0 ? color : AppColors.textMuted, fontSize: 11)),
                ])),
                if (proposedCount > 0)
                  Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(12)),
                    child: Text('$proposedCount/3', style: TextStyle(
                        color: color, fontSize: 11, fontWeight: FontWeight.w800))),
                Icon(
                  isExpanded ? Icons.expand_less_rounded : Icons.expand_more_rounded,
                  color: isExpanded ? color : AppColors.textMuted, size: 22),
              ]))),

          // ── Expanded section: search + filter + proposed items ──────────
          if (isExpanded) ...[
            const Divider(color: AppColors.cardBorder, height: 1),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [

                // Search bar
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.bgCardMid,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.cardBorder)),
                  child: Row(children: [
                    const SizedBox(width: 10),
                    Icon(Icons.search_rounded, color: color, size: 18),
                    const SizedBox(width: 8),
                    Expanded(child: TextField(
                      controller: _catCtrl(category),
                      style: const TextStyle(color: AppColors.textWhite, fontSize: 13),
                      decoration: InputDecoration(
                        hintText: 'Search $category options...',
                        hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(vertical: 10)),
                      onChanged: (v) {
                        setState(() => _catSearchQuery[category] = v);
                        setCard(() {});
                        setTab?.call(() {});
                      },
                    )),
                    GestureDetector(
                      onTap: () {
                        setState(() => _catShowFilters[category] = !_catFilters(category));
                        setCard(() {});
                      },
                      child: Container(
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                        decoration: BoxDecoration(
                          color: _catFilters(category) ? color : color.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(8)),
                        child: Row(mainAxisSize: MainAxisSize.min, children: [
                          Icon(Icons.tune_rounded,
                            color: _catFilters(category) ? Colors.white : color, size: 14),
                          const SizedBox(width: 3),
                          Text('Filter', style: TextStyle(
                            color: _catFilters(category) ? Colors.white : color,
                            fontSize: 10, fontWeight: FontWeight.w700)),
                        ]))),
                  ])),

                // Filter panel
                if (_catFilters(category)) ...[
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.bgCardMid,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: color.withValues(alpha: 0.3))),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      // Price range
                      Row(children: [
                        Icon(Icons.attach_money_rounded, color: color, size: 14),
                        const SizedBox(width: 4),
                        Text('Price Range', style: TextStyle(
                            color: color, fontWeight: FontWeight.w700, fontSize: 12)),
                        const Spacer(),
                        Text(
                          'XAF ${(_catPrice(category).start / 1000).toStringAsFixed(0)}K – ${(_catPrice(category).end / 1000).toStringAsFixed(0)}K',
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
                      ]),
                      RangeSlider(
                        values: _catPrice(category),
                        min: 0, max: 500000,
                        divisions: 50,
                        activeColor: color,
                        inactiveColor: AppColors.cardBorder,
                        onChanged: (r) {
                          setState(() => _catPriceRange[category] = r);
                          setCard(() {});
                        }),
                      const SizedBox(height: 6),
                      // Location
                      Row(children: [
                        Icon(Icons.location_on_rounded, color: color, size: 14),
                        const SizedBox(width: 4),
                        Text('Location', style: TextStyle(
                            color: color, fontWeight: FontWeight.w700, fontSize: 12)),
                      ]),
                      const SizedBox(height: 6),
                      Wrap(spacing: 6, runSpacing: 4, children: catLocationList.map((loc) {
                        final active = _catLoc(category) == loc;
                        return GestureDetector(
                          onTap: () {
                            setState(() => _catFilterLocation[category] = loc);
                            setCard(() {});
                          },
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 150),
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: active ? color : AppColors.bgCard,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: active ? color : AppColors.cardBorder)),
                            child: Text(loc, style: TextStyle(
                              color: active ? Colors.white : AppColors.textMuted,
                              fontSize: 10, fontWeight: active ? FontWeight.w700 : FontWeight.w500))));
                      }).toList()),
                      const SizedBox(height: 8),
                      GestureDetector(
                        onTap: () {
                          setState(() {
                            _catPriceRange[category] = const RangeValues(0, 500000);
                            _catFilterLocation[category] = 'All';
                            _catSearchQuery[category] = '';
                            _catSearchCtrls[category]?.clear();
                          });
                          setCard(() {});
                        },
                        child: Row(mainAxisSize: MainAxisSize.min, children: [
                          Icon(Icons.refresh_rounded, color: color, size: 12),
                          const SizedBox(width: 3),
                          Text('Reset', style: TextStyle(
                              color: color, fontSize: 10, fontWeight: FontWeight.w700)),
                        ])),
                    ])),
                ],

                const SizedBox(height: 10),

                // Select / confirm button (opens picker)
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () => _openCategoryPicker(category, filteredItems, color, icon),
                    icon: Icon(proposedCount == 0 ? Icons.add_rounded : Icons.edit_rounded,
                        color: Colors.white, size: 16),
                    label: Text(proposedCount == 0 ? 'Browse & Select' : 'Edit Selection ($proposedCount/3)',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: color,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(vertical: 12)))),

                const SizedBox(height: 10),
              ])),

            // ── Vote/Book mode toggle (only if items selected) ────────────
            if (proposedCount > 0) ...[
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 0, 12, 10),
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.bgCardMid,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.cardBorder)),
                  child: Row(children: [
                    Icon(isVoteMode ? Icons.how_to_vote_rounded : Icons.flash_on_rounded,
                      color: isVoteMode ? _typeColor : Colors.amber, size: 16),
                    const SizedBox(width: 8),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(isVoteMode ? 'Group Voting' : 'Direct Book',
                        style: TextStyle(color: isVoteMode ? _typeColor : Colors.amber,
                            fontWeight: FontWeight.w700, fontSize: 12)),
                      Text(isVoteMode ? 'Members vote — highest wins' : 'You pick & book directly — no voting',
                        style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
                    ])),
                    GestureDetector(
                      onTap: () {
                        setState(() => _votingModePerCategory[category] = !isVoteMode);
                        setTab?.call(() {});
                        setCard(() {});
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 220),
                        width: 48, height: 26,
                        decoration: BoxDecoration(
                          color: isVoteMode ? _typeColor : Colors.amber,
                          borderRadius: BorderRadius.circular(13)),
                        child: Stack(children: [
                          AnimatedPositioned(
                            duration: const Duration(milliseconds: 220),
                            left: isVoteMode ? 24 : 2, top: 2,
                            child: Container(width: 22, height: 22,
                              decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle))),
                        ]))),
                  ]))),
            ],
          ],

          // ── Proposed items summary (always visible when items selected) ─
          if (proposed.isNotEmpty) ...[
            const Divider(color: AppColors.cardBorder, height: 1),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(children: [
                ...proposed.map((item) => _proposedItemRow(item, color, isVoteMode)),
                const SizedBox(height: 8),
                if (isVoteMode) ...[
                  if (proposed.any((i) => i.voteCount > 0))
                    _bookHighestVotedButton(proposed, category, color, icon),
                ] else
                  _directBookPanel(proposed, category, color, icon),
              ])),
          ],
        ]));
    });
  }

  Widget _proposedItemRow(ProposedServiceItem item, Color color, [bool showVotes = true]) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.bgCardMid, borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.cardBorder)),
      child: Row(children: [
        Icon(item.icon, color: color, size: 14),
        const SizedBox(width: 8),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(item.name, style: const TextStyle(color: AppColors.textWhite, fontSize: 12, fontWeight: FontWeight.w600)),
          Row(children: [
            Icon(Icons.location_on_rounded, color: color, size: 10),
            const SizedBox(width: 2),
            Text(item.location, style: const TextStyle(color: AppColors.textHint, fontSize: 10)),
            const SizedBox(width: 8),
            Text('XAF ${_fmt(item.price.toInt())}', style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w600)),
          ]),
        ])),
        if (showVotes) Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(6)),
          child: Text('${item.voteCount} votes', style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w700))),
      ]));
  }

  Widget _directBookPanel(List<ProposedServiceItem> items, String category, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.amber.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.amber.withValues(alpha: 0.3))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Row(children: [
          Icon(Icons.flash_on_rounded, color: Colors.amber, size: 14),
          SizedBox(width: 6),
          Text('Select one to book directly for the group',
            style: TextStyle(color: Colors.amber, fontWeight: FontWeight.w700, fontSize: 12)),
        ]),
        const SizedBox(height: 10),
        ...items.map((item) {
          final alreadyBooked = _trip.bookedServiceIds.contains(item.id);
          return GestureDetector(
            onTap: alreadyBooked ? null : () => _bookForGroup(item, category, color, icon),
            child: Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: alreadyBooked ? AppColors.primary.withValues(alpha: 0.08) : AppColors.bgCardMid,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: alreadyBooked ? AppColors.primary.withValues(alpha: 0.4) : AppColors.cardBorder)),
              child: Row(children: [
                Icon(icon, color: alreadyBooked ? AppColors.primary : color, size: 16),
                const SizedBox(width: 10),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(item.name, style: TextStyle(
                    color: alreadyBooked ? AppColors.primary : AppColors.textWhite,
                    fontWeight: FontWeight.w700, fontSize: 12)),
                  Text('XAF ${_fmt(item.price.toInt())} × ${_trip.members.length} members',
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
                ])),
                if (alreadyBooked)
                  const Icon(Icons.check_circle_rounded, color: AppColors.primary, size: 18)
                else
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(8)),
                    child: const Text('Book', style: TextStyle(
                        color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700))),
              ])));
        }),
      ]));
  }

  Widget _bookHighestVotedButton(List<ProposedServiceItem> items, String category, Color color, IconData icon) {
    // Find item with most votes
    final sorted = List<ProposedServiceItem>.from(items)
      ..sort((a, b) => b.voteCount.compareTo(a.voteCount));
    final winner = sorted.first;
    if (winner.voteCount == 0) return const SizedBox();
    final alreadyBooked = _trip.bookedServiceIds.contains(winner.id);

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: alreadyBooked ? AppColors.primary.withValues(alpha: 0.08) : color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: alreadyBooked ? AppColors.primary.withValues(alpha: 0.3) : color.withValues(alpha: 0.3))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Icon(alreadyBooked ? Icons.check_circle_rounded : Icons.emoji_events_rounded,
              color: alreadyBooked ? AppColors.primary : color, size: 14),
          const SizedBox(width: 6),
          Text(alreadyBooked ? 'Booked for your group!' : 'Most Voted: ${winner.name}',
              style: TextStyle(color: alreadyBooked ? AppColors.primary : color,
                  fontWeight: FontWeight.w700, fontSize: 12)),
        ]),
        if (!alreadyBooked) ...[
          const SizedBox(height: 4),
          Text('${winner.voteCount} vote${winner.voteCount == 1 ? '' : 's'} · XAF ${_fmt(winner.price.toInt())} × ${_trip.members.length} members',
              style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
          const SizedBox(height: 8),
          SizedBox(width: double.infinity, height: 40,
            child: ElevatedButton.icon(
              onPressed: () => _bookForGroup(winner, category, color, icon),
              icon: Icon(icon, color: Colors.white, size: 16),
              label: Text('Book ${winner.name} for Group (${_trip.members.length} pax)',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 12)),
              style: ElevatedButton.styleFrom(backgroundColor: color,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))))),
        ] else ...[
          const SizedBox(height: 4),
          Text('${winner.name} booked for all ${_trip.members.length} members',
              style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
        ],
      ]));
  }

  void _openCategoryPicker(String category, List<ProposedServiceItem> items, Color color, IconData icon) {
    final current = List<String>.from((_trip.proposedServices[category] ?? []).map((i) => i.id));

    showModalBottomSheet(
      context: context, isScrollControlled: true,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => StatefulBuilder(builder: (ctx, setSheet) {
        return DraggableScrollableSheet(
          expand: false, initialChildSize: 0.7, maxChildSize: 0.9,
          builder: (_, ctrl) => Column(children: [
            const SizedBox(height: 12),
            Container(width: 40, height: 4,
              decoration: BoxDecoration(color: AppColors.cardBorder, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 12),
            Padding(padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(children: [
                Icon(icon, color: color, size: 20), const SizedBox(width: 8),
                Text('Choose up to 3 $category options', style: TextStyle(
                    color: color, fontWeight: FontWeight.w800, fontSize: 15)),
              ])),
            const SizedBox(height: 4),
            Padding(padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text('${current.length}/3 selected',
                  style: TextStyle(color: current.length == 3 ? color : AppColors.textMuted, fontSize: 12))),
            const SizedBox(height: 8),
            Expanded(child: ListView(controller: ctrl, padding: const EdgeInsets.all(16),
              children: items.map((item) {
                final isSelected = current.contains(item.id);
                return GestureDetector(
                  onTap: () {
                    setSheet(() {
                      if (isSelected) {
                        current.remove(item.id);
                      } else if (current.length < 3) {
                        current.add(item.id);
                      }
                    });
                  },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isSelected ? color.withValues(alpha: 0.08) : AppColors.bgCardMid,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: isSelected ? color.withValues(alpha: 0.5) : AppColors.cardBorder, width: isSelected ? 1.5 : 1)),
                    child: Row(children: [
                      Container(width: 44, height: 44,
                        decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(12)),
                        child: Icon(icon, color: color, size: 22)),
                      const SizedBox(width: 12),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(item.name, style: TextStyle(
                            color: isSelected ? AppColors.textWhite : AppColors.textMuted,
                            fontWeight: FontWeight.w700, fontSize: 14)),
                        Text(item.location, style: const TextStyle(color: AppColors.textHint, fontSize: 10)),
                        Text(item.description, style: const TextStyle(color: AppColors.textHint, fontSize: 11)),
                        const SizedBox(height: 2),
                        Text('XAF ${_fmt(item.price.toInt())}', style: TextStyle(
                            color: isSelected ? color : AppColors.textMuted,
                            fontWeight: FontWeight.w800, fontSize: 12)),
                      ])),
                      Container(width: 24, height: 24,
                        decoration: BoxDecoration(
                          color: isSelected ? color : Colors.transparent, shape: BoxShape.circle,
                          border: Border.all(color: isSelected ? color : AppColors.cardBorder, width: 2)),
                        child: isSelected ? const Icon(Icons.check, color: Colors.white, size: 14) : null),
                    ])));
              }).toList())),
            Padding(padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
              child: SizedBox(width: double.infinity, height: 50,
                child: ElevatedButton(
                  onPressed: () {
                    setState(() {
                      final selected = items.where((i) => current.contains(i.id)).toList();
                      _trip.proposedServices[category] = selected;
                      if (selected.isNotEmpty) {
                        _trip.messages.add(ChatMessage(
                          senderId: 'me', senderName: 'You', senderInitials: 'ME',
                          text: '📋 Organizer proposed ${selected.length} $category option${selected.length == 1 ? '' : 's'} for voting!',
                          senderColor: AppColors.primary, time: DateTime.now()));
                      }
                    });
                    Navigator.pop(ctx);
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: color,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                  child: const Text('Confirm Selection',
                      style: TextStyle(fontWeight: FontWeight.w800, color: Colors.white, fontSize: 15))))),
          ]));
      }));
  }

  void _bookForGroup(ProposedServiceItem item, String category, Color color, IconData icon) {
    final totalPrice = item.price * _trip.members.length;
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.bgCard,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Book for Group?', style: TextStyle(color: AppColors.textWhite, fontWeight: FontWeight.w800)),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(width: 56, height: 56,
            decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(14)),
            child: Icon(icon, color: color, size: 28)),
          const SizedBox(height: 12),
          Text(item.name, style: const TextStyle(color: AppColors.textWhite, fontWeight: FontWeight.w700, fontSize: 14), textAlign: TextAlign.center),
          const SizedBox(height: 8),
          Text('${_trip.members.length} members × XAF ${_fmt(item.price.toInt())}',
              style: const TextStyle(color: AppColors.textMuted, fontSize: 12), textAlign: TextAlign.center),
          const SizedBox(height: 4),
          Text('Total: XAF ${_fmt(totalPrice.toInt())}',
              style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 18), textAlign: TextAlign.center),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted))),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() {
                _trip.bookedServiceIds.add(item.id);
                // Remove from proposed so it never appears in voting again
                _trip.proposedServices.remove(category);
                // Add to global service bookings
                globalServiceBookings.insert(0, ServiceBooking(
                  id: 'grp_${item.id}_${DateTime.now().millisecondsSinceEpoch}',
                  type: category, name: item.name,
                  description: 'Group booking for ${_trip.title} (${_trip.members.length} members)',
                  destination: item.location, date: _trip.dates,
                  price: totalPrice, icon: icon, color: color));
                _trip.messages.add(ChatMessage(
                  senderId: 'me', senderName: 'You', senderInitials: 'ME',
                  text: 'Booked ${item.name} for all ${_trip.members.length} members! Total: XAF ${_fmt(totalPrice.toInt())}',
                  senderColor: AppColors.primary, time: DateTime.now()));
              });
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                content: Text('${item.name} booked for ${_trip.members.length} members!'),
                backgroundColor: AppColors.primary,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))));
            },
            style: ElevatedButton.styleFrom(backgroundColor: color,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
            child: const Text('Confirm Booking', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700))),
        ]));
  }

  // ── BOOKINGS TAB ──────────────────────────────────────────────────────────
  Widget _bookingsTab() {
    final confirmedServices = _trip.services.where((s) => s.selected).toList();

    return ListView(padding: const EdgeInsets.all(16), children: [
      Container(
        padding: const EdgeInsets.all(16), margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight,
              colors: [_typeColor.withValues(alpha: 0.12), AppColors.bgCard]),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: _typeColor.withValues(alpha: 0.25))),
        child: Column(children: [
          Row(children: [
            const Text('Trip Budget', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
            const Spacer(),
            Text('XAF ${_fmt(_trip.budget.toInt())}',
                style: TextStyle(color: _typeColor, fontWeight: FontWeight.w900, fontSize: 18)),
          ]),
          const SizedBox(height: 8),
          LinearProgressIndicator(
            value: confirmedServices.isEmpty ? 0 :
                (confirmedServices.fold<double>(0, (s, e) => s + e.price) / _trip.budget).clamp(0, 1),
            backgroundColor: AppColors.cardBorder,
            valueColor: AlwaysStoppedAnimation(_typeColor),
            borderRadius: BorderRadius.circular(4), minHeight: 6),
          const SizedBox(height: 4),
          Row(children: [
            Text('${confirmedServices.length} services booked',
                style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
            const Spacer(),
            Text(confirmedServices.isEmpty ? '0%' :
                '${(confirmedServices.fold<double>(0, (s, e) => s + e.price) / _trip.budget * 100).clamp(0, 100).toInt()}%',
                style: TextStyle(color: _typeColor, fontSize: 10, fontWeight: FontWeight.w700)),
          ]),
        ])),
      if (confirmedServices.isEmpty) ...[
        if (_isGroup) _groupBookingCTA()
        else Container(padding: const EdgeInsets.all(24), alignment: Alignment.center,
          child: Column(children: [
            Icon(Icons.book_online_rounded, color: AppColors.textMuted.withValues(alpha: 0.3), size: 48),
            const SizedBox(height: 12),
            const Text('No services booked yet', style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
          ])),
      ] else
        ...confirmedServices.map((s) => _serviceBookingCard(s)),
      const SizedBox(height: 16),
      const Text('All Proposed Services',
          style: TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.w600, fontSize: 12)),
      const SizedBox(height: 8),
      ...(_trip.services.isEmpty ? _defaultServices() : _trip.services).map((s) => _serviceListRow(s)),
    ]);
  }

  Widget _groupBookingCTA() => Container(
    padding: const EdgeInsets.all(18),
    decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder)),
    child: Column(children: [
      Icon(Icons.how_to_vote_rounded, color: _typeColor, size: 36),
      const SizedBox(height: 12),
      const Text('Vote first, then book!', style: TextStyle(color: AppColors.textWhite, fontWeight: FontWeight.w700, fontSize: 14)),
      const SizedBox(height: 6),
      const Text('Head to the Chat tab and vote on services.\nOnce voted, organizer can book confirmed ones.',
          style: TextStyle(color: AppColors.textMuted, fontSize: 12, height: 1.5), textAlign: TextAlign.center),
      const SizedBox(height: 14),
      ElevatedButton.icon(
        onPressed: () => _tab.animateTo(0),
        icon: const Icon(Icons.chat_rounded, size: 16),
        label: const Text('Go to Chat & Vote'),
        style: ElevatedButton.styleFrom(backgroundColor: _typeColor,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)))),
    ]));

  Widget _serviceBookingCard(TripService s) => Container(
    margin: const EdgeInsets.only(bottom: 10), padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(14),
        border: Border.all(color: s.color.withValues(alpha: 0.3))),
    child: Row(children: [
      Container(width: 40, height: 40,
        decoration: BoxDecoration(color: s.color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10)),
        child: Icon(s.icon, color: s.color, size: 20)),
      const SizedBox(width: 12),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(s.name, style: const TextStyle(color: AppColors.textWhite, fontWeight: FontWeight.w700, fontSize: 13)),
        Text(s.description, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
      ])),
      Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
        Text('XAF ${_fmt(s.price.toInt())}', style: TextStyle(color: s.color, fontWeight: FontWeight.w900, fontSize: 13)),
        const SizedBox(height: 2),
        Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
          child: const Text('Confirmed', style: TextStyle(color: AppColors.primary, fontSize: 9, fontWeight: FontWeight.w700))),
      ]),
    ]));

  Widget _serviceListRow(TripService s) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Row(children: [
      Icon(s.icon, color: s.color.withValues(alpha: 0.6), size: 14), const SizedBox(width: 8),
      Expanded(child: Text(s.name, style: const TextStyle(color: AppColors.textMuted, fontSize: 12))),
      Text('XAF ${_fmt(s.price.toInt())}',
          style: TextStyle(color: s.color.withValues(alpha: 0.7), fontSize: 11, fontWeight: FontWeight.w600)),
    ]));

  // ── ITINERARY TAB ─────────────────────────────────────────────────────────
  Widget _itineraryTab() {
    return ListView(padding: const EdgeInsets.all(16), children: [
      Container(height: 160,
        decoration: BoxDecoration(
          gradient: const LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight,
              colors: [Color(0xFF0D3020), Color(0xFF051A0E)]),
          borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.cardBorder)),
        child: Stack(children: [
          Center(child: Icon(Icons.map_rounded, color: AppColors.primary.withValues(alpha: 0.08), size: 80)),
          Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
            Icon(Icons.location_on_rounded, color: AppColors.primary, size: 32),
            const SizedBox(height: 6),
            Text(_trip.destination, style: const TextStyle(color: AppColors.textWhite, fontWeight: FontWeight.w700, fontSize: 14)),
            Text(_trip.dates, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
          ])),
        ])),
      const SizedBox(height: 20),
      ...List.generate(_trip.durationDays, (i) => _itineraryDayCard(i + 1, _trip.durationDays)),
    ]);
  }

  Widget _itineraryDayCard(int day, int totalDays) {
    final isFirst = day == 1; final isLast = day == totalDays;
    final items = [
      if (isFirst) ...[ _IItem('Arrival & Check-in', '10:00 AM', Icons.flight_land_rounded, const Color(0xFF3B82F6)),
        _IItem('Welcome Lunch', '1:00 PM', Icons.restaurant_rounded, const Color(0xFFF97316)),
        _IItem('Explore local area', '3:00 PM', Icons.explore_rounded, AppColors.primary) ]
      else if (isLast) ...[ _IItem('Morning stroll', '8:00 AM', Icons.directions_walk_rounded, AppColors.primary),
        _IItem('Farewell Lunch', '12:00 PM', Icons.restaurant_rounded, const Color(0xFFF97316)),
        _IItem('Departure', '4:00 PM', Icons.flight_takeoff_rounded, const Color(0xFF3B82F6)) ]
      else ...[ _IItem('Morning activity', '8:00 AM', Icons.terrain_rounded, const Color(0xFF10B981)),
        _IItem('Guide & Experience', '10:30 AM', Icons.tour_rounded, AppColors.primary),
        _IItem('Lunch break', '1:00 PM', Icons.restaurant_rounded, const Color(0xFFF97316)),
        _IItem('Afternoon adventure', '3:00 PM', Icons.explore_rounded, const Color(0xFF8B5CF6)),
        _IItem('Dinner & relax', '7:00 PM', Icons.nightlife_rounded, const Color(0xFF06B6D4)) ],
    ];
    return Container(margin: const EdgeInsets.only(bottom: 16),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Column(children: [
          Container(width: 36, height: 36,
            decoration: BoxDecoration(color: _typeColor.withValues(alpha: 0.12), shape: BoxShape.circle,
                border: Border.all(color: _typeColor.withValues(alpha: 0.4))),
            child: Center(child: Text('$day', style: TextStyle(color: _typeColor, fontWeight: FontWeight.w900, fontSize: 13)))),
          if (day < totalDays) Container(width: 2, height: items.length * 56.0, color: AppColors.cardBorder),
        ]),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Padding(padding: const EdgeInsets.only(bottom: 10, top: 6),
            child: Text('Day $day${isFirst ? ' — Arrival' : isLast ? ' — Departure' : ''}',
                style: const TextStyle(color: AppColors.textWhite, fontWeight: FontWeight.w700, fontSize: 13))),
          ...items.map((item) => Padding(padding: const EdgeInsets.only(bottom: 8),
            child: Container(padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: item.color.withValues(alpha: 0.2))),
              child: Row(children: [
                Container(width: 32, height: 32,
                  decoration: BoxDecoration(color: item.color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(8)),
                  child: Icon(item.icon, color: item.color, size: 16)),
                const SizedBox(width: 10),
                Expanded(child: Text(item.name, style: const TextStyle(color: AppColors.textWhite, fontSize: 12, fontWeight: FontWeight.w600))),
                Text(item.time, style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
              ])))),
        ])),
      ]));
  }

  // ── MEMBERS TAB ──────────────────────────────────────────────────────────
  Widget _membersTab() {
    return ListView(padding: const EdgeInsets.all(16), children: [
      if (_isGroup) ...[ _inviteCodeCard(), const SizedBox(height: 16) ],
      const Text('Trip Members', style: TextStyle(color: AppColors.textWhite, fontWeight: FontWeight.w700, fontSize: 14)),
      const SizedBox(height: 12),
      ..._trip.members.map((m) => _memberCard(m)),
      if (_isGroup) ...[ const SizedBox(height: 16), _addMemberButton() ],
    ]);
  }

  Widget _inviteCodeCard() => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      gradient: LinearGradient(colors: [_typeColor.withValues(alpha: 0.1), AppColors.bgCard]),
      borderRadius: BorderRadius.circular(16), border: Border.all(color: _typeColor.withValues(alpha: 0.3))),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [ Icon(Icons.qr_code_rounded, color: _typeColor, size: 18), const SizedBox(width: 8),
        Text('Invite Link', style: TextStyle(color: _typeColor, fontWeight: FontWeight.w700, fontSize: 13)) ]),
      const SizedBox(height: 10),
      Container(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(color: AppColors.bgCardMid, borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.cardBorder)),
        child: Row(children: [
          Expanded(child: Text(_trip.inviteCode, style: const TextStyle(color: AppColors.textWhite,
              fontWeight: FontWeight.w700, fontSize: 13, letterSpacing: 0.5))),
          GestureDetector(onTap: _copyInvite,
            child: Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(color: _typeColor.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
              child: Text('Copy', style: TextStyle(color: _typeColor, fontSize: 11, fontWeight: FontWeight.w700)))),
        ])),
      const SizedBox(height: 8),
      const Text('Share this code with friends to join your trip',
          style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
    ]));

  Widget _memberCard(TripMember m) => Container(
    margin: const EdgeInsets.only(bottom: 10), padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(14),
        border: Border.all(color: m.isOrganizer ? _typeColor.withValues(alpha: 0.3) : AppColors.cardBorder)),
    child: Row(children: [
      Container(width: 44, height: 44, decoration: BoxDecoration(color: m.color, shape: BoxShape.circle),
        child: Center(child: Text(m.initials, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 14)))),
      const SizedBox(width: 12),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(m.name, style: const TextStyle(color: AppColors.textWhite, fontWeight: FontWeight.w700, fontSize: 14)),
        Text(m.isOrganizer ? 'Organizer' : 'Member', style: TextStyle(
            color: m.isOrganizer ? _typeColor : AppColors.textMuted, fontSize: 11)),
      ])),
      if (m.isOrganizer) Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(color: _typeColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8),
            border: Border.all(color: _typeColor.withValues(alpha: 0.3))),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(Icons.star_rounded, color: _typeColor, size: 12), const SizedBox(width: 3),
          Text('Host', style: TextStyle(color: _typeColor, fontSize: 10, fontWeight: FontWeight.w700)),
        ])),
    ]));

  Widget _addMemberButton() => GestureDetector(
    onTap: _showAddMemberSheet,
    child: Container(padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.cardBorder)),
      child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
        Container(width: 36, height: 36,
          decoration: BoxDecoration(color: _typeColor.withValues(alpha: 0.1), shape: BoxShape.circle,
              border: Border.all(color: _typeColor.withValues(alpha: 0.3))),
          child: Icon(Icons.person_add_rounded, color: _typeColor, size: 18)),
        const SizedBox(width: 10),
        Text('Invite a Member', style: TextStyle(color: _typeColor, fontWeight: FontWeight.w700, fontSize: 13)),
      ])));

  // ── HELPERS ───────────────────────────────────────────────────────────────
  Widget _categoryHeader(String category) {
    final categoryColors = {
      'Hotel': const Color(0xFF00ACC1), 'Restaurant': const Color(0xFFE53935),
      'Guide & Experience': const Color(0xFF1DB954),
      'Event': const Color(0xFFF5A623), 'Flight': const Color(0xFF2196F3),
      'Train': const Color(0xFF9C27B0), 'Boat': const Color(0xFF00BCD4),
    };
    final color = categoryColors[category] ?? AppColors.primary;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
      child: Text(category, style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 13)));
  }

  void _sendMsg() {
    final text = _msgCtrl.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _trip.messages.add(ChatMessage(senderId: 'me', senderName: 'You', senderInitials: 'ME',
          text: text, senderColor: AppColors.primary, time: DateTime.now()));
      _msgCtrl.clear();
    });
    _scrollToBottom();
    if (_trip.members.length > 1) {
      Future.delayed(const Duration(seconds: 2), () {
        if (!mounted) return;
        final other = _trip.members.firstWhere((m) => m.id != 'me');
        setState(() {
          _trip.messages.add(ChatMessage(senderId: other.id, senderName: other.name,
              senderInitials: other.initials, senderColor: other.color,
              text: _autoReply(text), time: DateTime.now()));
        });
        _scrollToBottom();
      });
    }
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(_scrollCtrl.position.maxScrollExtent,
            duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
      }
    });
  }

  void _copyInvite() {
    Clipboard.setData(ClipboardData(text: _trip.inviteCode));
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: const Text('Invite code copied!'), backgroundColor: AppColors.primary,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))));
  }

  void _showAddMemberSheet() {
    showModalBottomSheet(context: context, backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => Padding(padding: const EdgeInsets.all(24),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(width: 40, height: 4, decoration: BoxDecoration(
              color: AppColors.cardBorder, borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 20),
          Icon(Icons.share_rounded, color: _typeColor, size: 36),
          const SizedBox(height: 12),
          const Text('Share Invite Code', style: TextStyle(color: AppColors.textWhite, fontWeight: FontWeight.w800, fontSize: 18)),
          const SizedBox(height: 8),
          const Text('Share this code with friends to let them join your trip.',
              style: TextStyle(color: AppColors.textMuted, fontSize: 13), textAlign: TextAlign.center),
          const SizedBox(height: 20),
          Container(padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: AppColors.bgCardMid, borderRadius: BorderRadius.circular(12),
                border: Border.all(color: _typeColor.withValues(alpha: 0.3))),
            child: Text(_trip.inviteCode, style: TextStyle(color: _typeColor, fontWeight: FontWeight.w900,
                fontSize: 16, letterSpacing: 1))),
          const SizedBox(height: 20),
          SizedBox(width: double.infinity, height: 50,
            child: ElevatedButton.icon(
              onPressed: () { _copyInvite(); Navigator.pop(context); },
              icon: const Icon(Icons.copy_rounded, size: 18, color: Colors.white),
              label: const Text('Copy Code', style: TextStyle(fontWeight: FontWeight.w800, color: Colors.white)),
              style: ElevatedButton.styleFrom(backgroundColor: _typeColor,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))))),
          const SizedBox(height: 8),
        ])));
  }

  Widget _messageItem(ChatMessage msg) {
    if (msg.isSystem) {
      return Container(margin: const EdgeInsets.symmetric(vertical: 6),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(10)),
        child: Text(msg.text, style: const TextStyle(color: AppColors.primary, fontSize: 11), textAlign: TextAlign.center));
    }
    final isMe = msg.senderId == 'me';
    return Padding(padding: const EdgeInsets.only(bottom: 10),
      child: Row(mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end, children: [
        if (!isMe) ...[
          Container(width: 28, height: 28,
            decoration: BoxDecoration(color: msg.senderColor, shape: BoxShape.circle),
            child: Center(child: Text(msg.senderInitials.substring(0, 1),
                style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800)))),
          const SizedBox(width: 8),
        ],
        Column(crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start, children: [
          if (!isMe) Padding(padding: const EdgeInsets.only(bottom: 3, left: 2),
            child: Text(msg.senderName, style: TextStyle(color: msg.senderColor, fontSize: 10, fontWeight: FontWeight.w700))),
          Container(
            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.65),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: isMe ? AppColors.primary.withValues(alpha: 0.15) : AppColors.bgCard,
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(14), topRight: const Radius.circular(14),
                bottomLeft: Radius.circular(isMe ? 14 : 4),
                bottomRight: Radius.circular(isMe ? 4 : 14))),
            child: Text(msg.text, style: const TextStyle(color: AppColors.textWhite, fontSize: 13))),
          Padding(padding: const EdgeInsets.only(top: 3),
            child: Text(_timeLabel(msg.time), style: const TextStyle(color: AppColors.textHint, fontSize: 9))),
        ]),
        if (isMe) const SizedBox(width: 8),
      ]));
  }

  Widget _chatInput() => Container(
    padding: EdgeInsets.fromLTRB(12, 8, 12, MediaQuery.of(context).viewInsets.bottom + 12),
    decoration: BoxDecoration(color: AppColors.bgCard, border: Border(top: BorderSide(color: AppColors.cardBorder))),
    child: Row(children: [
      Expanded(child: Container(
        decoration: BoxDecoration(color: AppColors.bgCardMid, borderRadius: BorderRadius.circular(22),
            border: Border.all(color: AppColors.cardBorder)),
        child: TextField(controller: _msgCtrl,
          style: const TextStyle(color: AppColors.textWhite, fontSize: 14),
          decoration: const InputDecoration(hintText: 'Type a message…',
            hintStyle: TextStyle(color: AppColors.textHint), border: InputBorder.none,
            contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 10), isDense: true),
          onSubmitted: (_) => _sendMsg()))),
      const SizedBox(width: 8),
      GestureDetector(onTap: _sendMsg,
        child: Container(width: 42, height: 42,
          decoration: BoxDecoration(color: _typeColor, shape: BoxShape.circle),
          child: const Icon(Icons.send_rounded, color: Colors.white, size: 18))),
    ]));

  String _timeLabel(DateTime t) {
    final now = DateTime.now();
    if (now.difference(t).inMinutes < 1) return 'Just now';
    if (now.difference(t).inHours < 1) return '${now.difference(t).inMinutes}m ago';
    return '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';
  }

  String _autoReply(String msg) {
    if (msg.toLowerCase().contains('hotel') || msg.toLowerCase().contains('stay'))
      return 'Great idea! I already voted for the hotel 🏨';
    if (msg.toLowerCase().contains('food') || msg.toLowerCase().contains('eat'))
      return 'I\'m down for the local seafood spots! 🦞';
    if (msg.toLowerCase().contains('flight') || msg.toLowerCase().contains('fly'))
      return 'Checked flights — looks good for those dates!';
    if (msg.toLowerCase().contains('vote'))
      return 'Voted! We should also include a tour guide 🧭';
    return 'Sounds great! Can\'t wait for this trip 🌍';
  }

  List<TripService> _defaultServices() => [
    TripService(id: 'd1', name: 'Flight', description: 'International & domestic flights',
        icon: Icons.airplanemode_active_rounded, color: Color(0xFF3B82F6), price: 150000),
    TripService(id: 'd2', name: 'Hotel', description: 'Accommodation & lodging',
        icon: Icons.hotel_rounded, color: Color(0xFF8B5CF6), price: 80000),
    TripService(id: 'd3', name: 'Tour Guide', description: 'Local expert guide service',
        icon: Icons.tour_rounded, color: AppColors.primary, price: 25000),
  ];

  String _fmt(int n) => n >= 1000000
      ? '${(n / 1000000).toStringAsFixed(1)}M'
      : n >= 1000 ? '${(n / 1000).toStringAsFixed(0)}K' : n.toString();
}

class _IItem {
  final String name, time;
  final IconData icon;
  final Color color;
  const _IItem(this.name, this.time, this.icon, this.color);
}
