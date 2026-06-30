import 'package:flutter/material.dart';
import '../../widgets/common_widgets.dart';
import '../../theme/app_theme.dart';
import '../discover/discover_screen.dart';
import '../discover/search_screen.dart';
import '../pro/notifications_screen.dart';
import '../wallet/wallet_screen.dart';
import '../pro/ai_assistant_screen.dart';
import '../services/evisa_screen.dart';

class HomeScreen extends StatefulWidget {
  /// Called when a service category chip is tapped.
  /// The int is the index matching ServicesScreen._svcs order:
  /// 0=Tour, 1=Restaurant, 2=Hotel, 3=Premium Event, 4=Transportation
  final void Function(int serviceIndex)? onServiceTap;
  const HomeScreen({super.key, this.onServiceTap});
  @override State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int? _playingIdx;
  int _selectedServiceIdx = 0;

  // Each entry maps to the index in ServicesScreen._svcs:
  // 0=Tour, 1=Restaurant, 2=Hotel, 3=Premium Event, 4=Transportation
  static const _serviceCategories = [
    {'name': 'Restaurant', 'icon': Icons.restaurant_rounded,             'color': Color(0xFF10B981), 'serviceIdx': 1},
    {'name': 'Hotel',     'icon': Icons.hotel_rounded,               'color': Color(0xFF3B82F6), 'serviceIdx': 2},
    {'name': 'Transportation', 'icon': Icons.airplanemode_active_rounded, 'color': Color(0xFF8B5CF6), 'serviceIdx': 4},
    {'name': 'Guide & Experience', 'icon': Icons.tour_rounded,                 'color': Color(0xFFF59E0B), 'serviceIdx': 0},
    {'name': 'Events',    'icon': Icons.event_rounded,               'color': Color(0xFFF97316), 'serviceIdx': 3},
    {'name': 'Traveo AI', 'icon': Icons.auto_awesome_rounded,        'color': Color(0xFF1DB954), 'serviceIdx': -1},
    {'name': 'E-Visa',   'icon': Icons.document_scanner_rounded,    'color': Color(0xFF0EA5E9), 'serviceIdx': -2},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: CustomScrollView(slivers: [
        SliverToBoxAdapter(child: _header()),
        SliverToBoxAdapter(child: _featuredVideosSection()),
        SliverToBoxAdapter(child: _serviceSection()),
        SliverToBoxAdapter(child: _listingsSection()),
        const SliverToBoxAdapter(child: SizedBox(height: 20)),
      ]),
    );
  }

  Widget _header() => Container(
    color: AppColors.bgCard,
    child: SafeArea(bottom: false, child: Padding(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
      child: Row(children: [
        GestureDetector(
          onTap: () => Navigator.push(context,
              MaterialPageRoute(builder: (_) => const SearchScreen())),
          child: Container(width: 40, height: 40,
            decoration: BoxDecoration(color: AppColors.bgMid,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder)),
            child: const Icon(Icons.search_rounded, color: AppColors.primary, size: 20))),
        const Spacer(),
        const TraveoLogoWidget(),
        const Spacer(),
        GestureDetector(
          onTap: () => Navigator.push(context,
              MaterialPageRoute(builder: (_) => const WalletScreen())),
          child: Container(width: 40, height: 40,
            decoration: BoxDecoration(color: AppColors.bgMid,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder)),
            child: const Icon(Icons.account_balance_wallet_rounded, color: AppColors.primary, size: 20))),
        const SizedBox(width: 8),
        GestureDetector(
          onTap: () => Navigator.push(context,
              MaterialPageRoute(builder: (_) => const NotificationsScreen())),
          child: Stack(children: [
            Container(width: 40, height: 40,
              decoration: BoxDecoration(color: AppColors.bgMid,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.cardBorder)),
              child: const Icon(Icons.notifications_rounded,
                  color: AppColors.textGrey, size: 20)),
            Positioned(top: 2, right: 2,
              child: Container(
                padding: const EdgeInsets.all(3),
                decoration: const BoxDecoration(color: AppColors.alert, shape: BoxShape.circle),
                child: const Text('2', style: TextStyle(color: Colors.white,
                    fontSize: 8, fontWeight: FontWeight.bold)))),
          ])),
      ]))));

  Widget _featuredVideosSection() {
    final filtered = kVideos;

    return Container(
      color: AppColors.bgCard,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 0, 16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Padding(
            padding: const EdgeInsets.only(right: 16, bottom: 12),
            child: Row(children: [
              const Text('Featured Destinations',
                style: TextStyle(color: AppColors.textDark,
                    fontWeight: FontWeight.w800, fontSize: 16)),
              const Spacer(),
              GestureDetector(
                onTap: () => Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const DiscoverScreen())),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(20)),
                  child: const Text('View All', style: TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w700, fontSize: 12)))),
            ])),
          SizedBox(
            height: 220,
            child: filtered.isEmpty
                ? Center(child: Text('No videos in this category',
                    style: TextStyle(color: AppColors.textGrey)))
                : ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: filtered.length,
                    itemBuilder: (_, i) => _featuredVideoCard(filtered[i], i))),
        ])));
  }

  Widget _featuredVideoCard(TravelVideo v, int idx) {
    final isPlaying = _playingIdx == idx;
    final gradients = {
      'Beach':     [const Color(0xFF3B82F6), const Color(0xFF06B6D4)],
      'Restaurant': [const Color(0xFF10B981), const Color(0xFF059669)],
      'Wildlife':  [const Color(0xFFF59E0B), const Color(0xFFF97316)],
      'Culture':   [const Color(0xFF8B5CF6), const Color(0xFF7C3AED)],
    };
    final colors = gradients[v.category] ??
        [const Color(0xFF4F46E5), const Color(0xFF8B5CF6)];

    return GestureDetector(
      onTap: () => setState(() => _playingIdx = isPlaying ? null : idx),
      child: Container(
        width: 200,
        margin: const EdgeInsets.only(right: 12),
        decoration: BoxDecoration(borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: AppColors.cardShadow, blurRadius: 8,
              offset: const Offset(0, 2))]),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Stack(fit: StackFit.expand, children: [
            Container(decoration: BoxDecoration(gradient: LinearGradient(
              begin: Alignment.topLeft, end: Alignment.bottomRight,
              colors: colors))),
            Center(child: Icon(_catIcon(v.category),
                color: Colors.white.withValues(alpha: 0.15), size: 80)),
            Container(decoration: BoxDecoration(gradient: LinearGradient(
              begin: Alignment.topCenter, end: Alignment.bottomCenter,
              colors: [Colors.transparent, Colors.black.withValues(alpha: 0.5)]))),
            Positioned(top: 10, left: 10,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(8)),
                child: Text(v.category, style: const TextStyle(color: Colors.white,
                    fontSize: 9, fontWeight: FontWeight.w700)))),
            Positioned(top: 10, right: 10,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                decoration: BoxDecoration(color: Colors.black38,
                  borderRadius: BorderRadius.circular(8)),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  const Icon(Icons.visibility_rounded, color: Colors.white70, size: 10),
                  const SizedBox(width: 3),
                  Text(_fmt(v.views), style: const TextStyle(color: Colors.white, fontSize: 9)),
                ]))),
            Center(child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              child: isPlaying
                  ? Container(key: const ValueKey('p'), width: 44, height: 44,
                      decoration: BoxDecoration(color: Colors.black38, shape: BoxShape.circle,
                        border: Border.all(color: Colors.white54, width: 2)),
                      child: const Icon(Icons.pause_rounded, color: Colors.white, size: 24))
                  : Container(key: const ValueKey('pl'), width: 44, height: 44,
                      decoration: BoxDecoration(color: Colors.black26, shape: BoxShape.circle),
                      child: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 28)))),
            Positioned(bottom: 10, left: 10, right: 10,
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(v.title, maxLines: 1, overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: Colors.white,
                      fontWeight: FontWeight.w800, fontSize: 12)),
                const SizedBox(height: 2),
                Row(children: [
                  const Icon(Icons.location_on_rounded, color: Colors.white70, size: 11),
                  const SizedBox(width: 2),
                  Expanded(child: Text(v.location, maxLines: 1, overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.white70, fontSize: 10))),
                ]),
              ])),
          ]))));
  }

  Widget _serviceSection() => Container(
    color: AppColors.bgDark,
    padding: const EdgeInsets.fromLTRB(16, 20, 0, 8),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Padding(
        padding: EdgeInsets.only(right: 16, bottom: 14),
        child: Text('Browse by Service',
          style: TextStyle(color: AppColors.textDark,
              fontWeight: FontWeight.w800, fontSize: 16))),
      SizedBox(
        height: 96,
        child: ListView.builder(
          scrollDirection: Axis.horizontal,
          itemCount: _serviceCategories.length,
          itemBuilder: (_, i) {
            final s = _serviceCategories[i];
            final active = i == _selectedServiceIdx;
            final col = s['color'] as Color;
            return GestureDetector(
              onTap: () {
                setState(() => _selectedServiceIdx = i);
                final serviceIdx = s['serviceIdx'] as int;
                if (serviceIdx == -1) {
                  Navigator.push(context,
                      MaterialPageRoute(builder: (_) => const AIAssistantScreen()));
                } else if (serviceIdx == -2) {
                  Navigator.push(context,
                      MaterialPageRoute(builder: (_) => const EVisaScreen()));
                } else {
                  widget.onServiceTap?.call(serviceIdx);
                }
              },
              child: Container(
                width: 72, margin: const EdgeInsets.only(right: 10),
                child: Column(children: [
                  Container(width: 56, height: 56,
                    decoration: BoxDecoration(
                      color: active ? col.withValues(alpha: 0.12) : AppColors.bgCard,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                          color: active ? col : AppColors.cardBorder,
                          width: active ? 1.5 : 1)),
                    child: Icon(s['icon'] as IconData,
                        color: active ? col : AppColors.textLight, size: 26)),
                  const SizedBox(height: 6),
                  Text(s['name'] as String, textAlign: TextAlign.center,
                    style: TextStyle(color: active ? col : AppColors.textLight,
                        fontSize: 10,
                        fontWeight: active ? FontWeight.w700 : FontWeight.w500)),
                ])));
          })),
    ]));

  // ── 3 Category listing sections ─────────────────────────────
  // Pro users who posted each service
  static const _proUsers = [
    {'initials': 'KT', 'name': 'Kamga Tours',   'color': Color(0xFF6D28D9)},
    {'initials': 'AF', 'name': 'Africa Wild',   'color': Color(0xFF0369A1)},
    {'initials': 'CM', 'name': 'Cam Explore',   'color': Color(0xFF059669)},
    {'initials': 'LS', 'name': 'Lake Safari',   'color': Color(0xFFB45309)},
  ];

  static const _catListings = <String, List<Map<String, dynamic>>>{
    'Restaurant': [
      {'name': 'La Terrasse Fine Dining',  'location': 'Yaoundé',       'price': 'XAF 25,000',  'rating': 4.9, 'tag': 'Fine Dining', 'color': Color(0xFF10B981), 'icon': Icons.restaurant_rounded,     'proIdx': 0},
      {'name': 'Douala Street Food Tour',  'location': 'Douala',        'price': 'XAF 8,000',   'rating': 4.8, 'tag': 'Street Food', 'color': Color(0xFF10B981), 'icon': Icons.fastfood_rounded,       'proIdx': 1},
      {'name': 'Le Wouri Seafood Grill',   'location': 'Douala',        'price': 'XAF 35,000',  'rating': 4.7, 'tag': 'Seafood',     'color': Color(0xFF10B981), 'icon': Icons.set_meal_rounded,       'proIdx': 2},
      {'name': 'Kribi Beach Restaurant',   'location': 'Kribi',         'price': 'XAF 20,000',  'rating': 4.6, 'tag': 'Beachfront',  'color': Color(0xFF10B981), 'icon': Icons.dining_rounded,         'proIdx': 3},
    ],
    'Hotel': [
      {'name': 'Hilton Yaoundé',       'location': 'Bastos, Yaoundé',    'price': 'XAF 120,000', 'rating': 4.8, 'tag': 'Luxury',   'color': Color(0xFF3B82F6), 'icon': Icons.hotel_rounded,          'proIdx': 0},
      {'name': 'Résidence La Falaise', 'location': 'Bonanjo, Douala',    'price': 'XAF 85,000',  'rating': 4.5, 'tag': 'Business', 'color': Color(0xFF3B82F6), 'icon': Icons.business_center_rounded, 'proIdx': 1},
      {'name': 'Hotel Akwa Palace',    'location': 'Akwa, Douala',       'price': 'XAF 95,000',  'rating': 4.6, 'tag': 'Classic',  'color': Color(0xFF3B82F6), 'icon': Icons.hotel_rounded,          'proIdx': 2},
      {'name': 'Mont Fébé Hotel',      'location': 'Mont Fébé, Yaoundé', 'price': 'XAF 110,000', 'rating': 4.7, 'tag': 'Resort',   'color': Color(0xFF3B82F6), 'icon': Icons.villa_rounded,          'proIdx': 3},
    ],
    'Events': [
      {'name': 'Yaoundé Jazz Festival','location': 'Hilton, Yaoundé',     'price': 'XAF 25,000',  'rating': 4.9, 'tag': 'Music',   'color': Color(0xFFF97316), 'icon': Icons.music_note_rounded,     'proIdx': 0},
      {'name': 'Ngondo Festival',      'location': 'Wouri, Douala',       'price': 'XAF 15,000',  'rating': 4.8, 'tag': 'Culture', 'color': Color(0xFFF97316), 'icon': Icons.celebration_rounded,    'proIdx': 1},
      {'name': 'FESPACO Screening',    'location': 'Omnisports, Yaoundé', 'price': 'XAF 10,000',  'rating': 4.5, 'tag': 'Film',    'color': Color(0xFFF97316), 'icon': Icons.movie_rounded,          'proIdx': 2},
      {'name': 'Kribi Beach Party',    'location': 'Kribi',               'price': 'XAF 20,000',  'rating': 4.7, 'tag': 'Beach',   'color': Color(0xFFF97316), 'icon': Icons.beach_access_rounded,   'proIdx': 3},
    ],
  };

  Widget _listingsSection() => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _catBlock('Restaurant', const Color(0xFF10B981), 1),
      _catBlock('Hotel',     const Color(0xFF3B82F6), 2),
      _catBlock('Events',    const Color(0xFFF97316), 3),
    ]);

  Widget _catBlock(String category, Color color, int serviceIdx) {
    final items = _catListings[category]!;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(
        padding: const EdgeInsets.fromLTRB(16, 20, 16, 12),
        child: Row(children: [
          Container(width: 4, height: 20,
            decoration: BoxDecoration(color: color,
                borderRadius: BorderRadius.circular(2))),
          const SizedBox(width: 10),
          Text(category, style: const TextStyle(color: AppColors.textDark,
              fontWeight: FontWeight.w800, fontSize: 16)),
          const Spacer(),
          GestureDetector(
            onTap: () => widget.onServiceTap?.call(serviceIdx),
            child: Text('See all', style: TextStyle(
                color: color, fontSize: 12, fontWeight: FontWeight.w600))),
        ])),
      SizedBox(
        height: 192,
        child: ListView.builder(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.only(left: 16),
          itemCount: items.length,
          itemBuilder: (_, i) => _listingCard(items[i], color, serviceIdx))),
      const SizedBox(height: 4),
    ]);
  }

  Widget _listingCard(Map<String, dynamic> item, Color color, int serviceIdx) {
    final proIdx = item['proIdx'] as int;
    final pro = _proUsers[proIdx];
    final proColor = pro['color'] as Color;
    final proInitials = pro['initials'] as String;
    final proName = pro['name'] as String;
    return GestureDetector(
      onTap: () => widget.onServiceTap?.call(serviceIdx),
      child: Container(
        width: 175,
        margin: const EdgeInsets.only(right: 12),
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cardBorder),
          boxShadow: [BoxShadow(color: AppColors.cardShadow,
              blurRadius: 6, offset: const Offset(0, 2))]),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Image/banner with pro avatar overlaid
          SizedBox(
            height: 88,
            child: Stack(children: [
              Container(
                decoration: BoxDecoration(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                  gradient: LinearGradient(
                    begin: Alignment.topLeft, end: Alignment.bottomRight,
                    colors: [color.withValues(alpha: 0.7), color.withValues(alpha: 0.25)])),
                child: Center(child: Icon(item['icon'] as IconData,
                    color: Colors.white.withValues(alpha: 0.5), size: 36))),
              Positioned(top: 8, right: 8,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.45),
                    borderRadius: BorderRadius.circular(8)),
                  child: Text(item['tag'] as String,
                    style: const TextStyle(color: Colors.white,
                        fontSize: 9, fontWeight: FontWeight.w700)))),
              // Pro avatar bottom-left
              Positioned(bottom: 8, left: 8,
                child: GestureDetector(
                  onTap: () => _openProMessage(proName, proInitials, proColor),
                  child: Row(children: [
                    Container(
                      width: 26, height: 26,
                      decoration: BoxDecoration(
                        color: proColor,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 1.5)),
                      child: Center(child: Text(proInitials,
                        style: const TextStyle(color: Colors.white,
                            fontSize: 8, fontWeight: FontWeight.w800)))),
                    const SizedBox(width: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.55),
                        borderRadius: BorderRadius.circular(6)),
                      child: Text(proName, style: const TextStyle(
                          color: Colors.white, fontSize: 8,
                          fontWeight: FontWeight.w600))),
                  ]))),
            ])),
          Padding(
            padding: const EdgeInsets.fromLTRB(10, 8, 10, 0),
            child: Text(item['name'] as String,
              maxLines: 1, overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: AppColors.textDark,
                  fontWeight: FontWeight.w700, fontSize: 12))),
          Padding(
            padding: const EdgeInsets.fromLTRB(10, 3, 10, 0),
            child: Row(children: [
              Icon(Icons.location_on_rounded, color: color, size: 10),
              const SizedBox(width: 2),
              Expanded(child: Text(item['location'] as String,
                maxLines: 1, overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: AppColors.textGrey, fontSize: 10))),
            ])),
          Padding(
            padding: const EdgeInsets.fromLTRB(10, 6, 10, 10),
            child: Row(children: [
              Icon(Icons.star_rounded, color: color, size: 12),
              const SizedBox(width: 2),
              Text((item['rating']).toString(), style: TextStyle(
                  color: color, fontSize: 10, fontWeight: FontWeight.w700)),
              const Spacer(),
              Text(item['price'] as String, style: TextStyle(
                  color: color, fontWeight: FontWeight.w900, fontSize: 11)),
            ])),
        ])));
  }

  void _openProMessage(String proName, String initials, Color color) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => _ProMessageSheet(
          proName: proName, initials: initials, color: color));
  }

  IconData _catIcon(String cat) {
    switch (cat) {
      case 'Beach':     return Icons.beach_access_rounded;
      case 'Restaurant': return Icons.restaurant_rounded;
      case 'Wildlife':  return Icons.pets_rounded;
      case 'Culture':   return Icons.museum_rounded;
      default:          return Icons.location_city_rounded;
    }
  }
  String _fmt(int n) => n >= 1000 ? '${(n / 1000).toStringAsFixed(1)}K' : n.toString();
}

// ── Global inbox for normal user (replies from pro users) ─────────────────
class UserInboxMessage {
  final String proName, initials, proReply, time;
  final Color color;
  bool read;
  UserInboxMessage({
    required this.proName, required this.initials,
    required this.proReply, required this.time,
    required this.color, this.read = false,
  });
}
final List<UserInboxMessage> userInbox = [];

// ── Pro Message Sheet — opened when user taps a pro avatar ────────────────
class _ProMessageSheet extends StatefulWidget {
  final String proName, initials;
  final Color color;
  const _ProMessageSheet({
      required this.proName, required this.initials, required this.color});
  @override State<_ProMessageSheet> createState() => _ProMessageSheetState();
}

class _ProMessageSheetState extends State<_ProMessageSheet> {
  final _ctrl = TextEditingController();
  final List<Map<String, dynamic>> _msgs = [];
  bool _sent = false;

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  void _send() {
    final text = _ctrl.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _msgs.add({'from': 'user', 'text': text,
          'time': _nowTime()});
      _ctrl.clear();
      _sent = true;
    });
    // Simulate pro reply after 1.5s and add to userInbox as notification
    Future.delayed(const Duration(milliseconds: 1500), () {
      if (!mounted) return;
      final reply = 'Thanks for reaching out! '
          'We will get back to you shortly regarding your enquiry.';
      setState(() {
        _msgs.add({'from': 'pro', 'text': reply, 'time': _nowTime()});
      });
      userInbox.insert(0, UserInboxMessage(
        proName: widget.proName,
        initials: widget.initials,
        proReply: reply,
        time: 'Just now',
        color: widget.color,
      ));
    });
  }

  String _nowTime() {
    final now = DateTime.now();
    final h = now.hour.toString().padLeft(2, '0');
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
          // Handle
          Container(width: 40, height: 4,
            decoration: BoxDecoration(color: AppColors.cardBorder,
                borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 16),
          // Pro header
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
          // Messages
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
                        maxWidth: MediaQuery.of(context).size.width * 0.7),
                    decoration: BoxDecoration(
                      color: isUser
                          ? AppColors.primary.withValues(alpha: 0.15)
                          : AppColors.bgCardMid,
                      borderRadius: BorderRadius.circular(14)),
                    child: Column(
                      crossAxisAlignment: isUser
                          ? CrossAxisAlignment.end : CrossAxisAlignment.start,
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
                'Send a message to FCFA {widget.proName} about their service',
                style: const TextStyle(color: AppColors.textGrey, fontSize: 12),
                textAlign: TextAlign.center)),
          // Input row
          Row(children: [
            Expanded(child: Container(
              decoration: BoxDecoration(
                color: AppColors.bgCardMid,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppColors.cardBorder)),
              child: TextField(
                controller: _ctrl,
                style: const TextStyle(color: AppColors.textDark, fontSize: 14),
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
                decoration: BoxDecoration(
                  color: AppColors.primary, shape: BoxShape.circle),
                child: const Icon(Icons.send_rounded,
                    color: Colors.white, size: 20))),
          ]),
        ])));
  }
}
