import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../discover/discover_screen.dart';

// ── User Post model ────────────────────────────────────────────────────────
enum UserPostType { video, photoSlideshow }

class UserPost {
  final String id;
  final String title;
  final String location;
  final String caption;
  final String serviceTaken;    // which service the user took
  final String serviceCategory; // maps to TravelVideo category
  final UserPostType type;
  final int photoCount;         // for slideshows
  final String userName;
  final String userHandle;
  int likes;
  int views;
  bool liked;
  bool bookmarked;
  final DateTime postedAt;

  UserPost({
    required this.id,
    required this.title,
    required this.location,
    required this.caption,
    required this.serviceTaken,
    required this.serviceCategory,
    required this.type,
    this.photoCount = 1,
    required this.userName,
    required this.userHandle,
    this.likes = 0,
    this.views = 0,
    this.liked = false,
    this.bookmarked = false,
    required this.postedAt,
  });

  /// Convert to TravelVideo so it renders in the existing discover feed
  TravelVideo toTravelVideo() => TravelVideo(
    id: id,
    title: title,
    location: location,
    uploader: userName,
    uploaderHandle: userHandle,
    category: serviceCategory,
    likes: likes,
    comments: 0,
    views: views,
    rating: 0,
    liked: liked,
    bookmarked: bookmarked,
    isPro: false,
    bio: '',
    followers: 0,
    totalViews: 0,
    isPhotoSlideshow: type == UserPostType.photoSlideshow,
    photoCount: photoCount,
    experienceCaption: caption,
    serviceTaken: serviceTaken,
  );
}

// Global list — shared with discover feed
final List<UserPost> globalUserPosts = [];

// ── Service categories with icons ──────────────────────────────────────────
const _serviceOptions = [
  {'label': 'City Guide & Experience', 'category': 'City',       'icon': Icons.location_city_rounded,    'color': 0xFF1DB954},
  {'label': 'Beach & Water Experience','category': 'Beach',      'icon': Icons.beach_access_rounded,     'color': 0xFF2196F3},
  {'label': 'Wildlife Safari',         'category': 'Wildlife',   'icon': Icons.pets_rounded,              'color': 0xFFF59E0B},
  {'label': 'Cultural Experience',     'category': 'Culture',    'icon': Icons.museum_rounded,            'color': 0xFF8B5CF6},
  {'label': 'Adventure Trek',          'category': 'Adventure',  'icon': Icons.terrain_rounded,          'color': 0xFF10B981},
  {'label': 'Hotel Stay',              'category': 'Hotel',      'icon': Icons.hotel_rounded,             'color': 0xFF00ACC1},
  {'label': 'Restaurant & Food Tour',  'category': 'Restaurant', 'icon': Icons.restaurant_rounded,       'color': 0xFFE53935},
  {'label': 'Premium Event',           'category': 'City',       'icon': Icons.event_rounded,             'color': 0xFFF97316},
  {'label': 'Flight Experience',       'category': 'City',       'icon': Icons.flight_rounded,            'color': 0xFF3B82F6},
  {'label': 'Boat / River Cruise',     'category': 'Beach',      'icon': Icons.directions_boat_rounded,  'color': 0xFF06B6D4},
];

// ── Screen ──────────────────────────────────────────────────────────────────
class UserPostScreen extends StatefulWidget {
  const UserPostScreen({super.key});
  @override State<UserPostScreen> createState() => _UserPostScreenState();
}

class _UserPostScreenState extends State<UserPostScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tab;

  // shared form state
  int _postType = 0; // 0=video, 1=photos
  int? _selectedService;
  final _titleCtrl   = TextEditingController();
  final _locationCtrl = TextEditingController();
  final _captionCtrl  = TextEditingController();
  int _photoCount = 3; // simulated number of photos selected
  bool _fileSelected = false;
  bool _isPosting = false;

  @override
  void initState() { super.initState(); _tab = TabController(length: 2, vsync: this); }

  @override
  void dispose() {
    _tab.dispose();
    _titleCtrl.dispose(); _locationCtrl.dispose(); _captionCtrl.dispose();
    super.dispose();
  }

  void _reset() {
    setState(() {
      _postType = 0; _selectedService = null; _fileSelected = false; _isPosting = false;
      _titleCtrl.clear(); _locationCtrl.clear(); _captionCtrl.clear();
    });
  }

  Future<void> _post() async {
    if (_selectedService == null || _titleCtrl.text.isEmpty || !_fileSelected) return;
    setState(() => _isPosting = true);
    await Future.delayed(const Duration(seconds: 2));

    final svc = _serviceOptions[_selectedService!];
    final post = UserPost(
      id: 'up${DateTime.now().millisecondsSinceEpoch}',
      title: _titleCtrl.text.trim(),
      location: _locationCtrl.text.trim().isEmpty ? 'Cameroon' : _locationCtrl.text.trim(),
      caption: _captionCtrl.text.trim(),
      serviceTaken: svc['label'] as String,
      serviceCategory: svc['category'] as String,
      type: _postType == 0 ? UserPostType.video : UserPostType.photoSlideshow,
      photoCount: _postType == 1 ? _photoCount : 1,
      userName: 'You',
      userHandle: 'me',
      likes: 0,
      views: 0,
      postedAt: DateTime.now(),
    );

    globalUserPosts.insert(0, post);
    // Also push to the discover global feed
    globalUploadedVideos.insert(0, post.toTravelVideo());

    if (mounted) {
      setState(() => _isPosting = false);
      _tab.animateTo(0); // go to My Posts
      _reset();
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: const Row(children: [
          Icon(Icons.check_circle_rounded, color: Colors.white),
          SizedBox(width: 10),
          Text('Your experience has been shared!'),
        ]),
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ));
    }
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
            tabs: const [Tab(text: 'My Posts'), Tab(text: 'Share Experience')],
          ),
        ),
        Expanded(child: TabBarView(controller: _tab, children: [
          _myPostsTab(),
          _shareTab(),
        ])),
      ]),
    );
  }

  Widget _header() => Container(
    color: AppColors.bgDark,
    child: SafeArea(bottom: false, child: Padding(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
      child: Row(children: [
        Container(width: 36, height: 36,
          decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(10)),
          child: const Icon(Icons.auto_awesome_rounded, color: AppColors.primary, size: 20)),
        const SizedBox(width: 10),
        const Text('My Experiences', style: TextStyle(color: AppColors.textDark,
            fontWeight: FontWeight.w900, fontSize: 18)),
        const Spacer(),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.cardBorder)),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.people_rounded, color: AppColors.textGrey, size: 13),
            const SizedBox(width: 5),
            Text('${globalUserPosts.length} post${globalUserPosts.length == 1 ? '' : 's'}',
              style: const TextStyle(color: AppColors.textGrey, fontSize: 11, fontWeight: FontWeight.w600)),
          ])),
      ]))));

  // ── TAB 1: My Posts ────────────────────────────────────────────────────────
  Widget _myPostsTab() {
    if (globalUserPosts.isEmpty) {
      return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Container(width: 80, height: 80,
          decoration: BoxDecoration(color: AppColors.bgCard, shape: BoxShape.circle,
            border: Border.all(color: AppColors.cardBorder)),
          child: const Icon(Icons.photo_camera_rounded, color: AppColors.textGrey, size: 38)),
        const SizedBox(height: 16),
        const Text('No posts yet', style: TextStyle(color: AppColors.textDark,
            fontWeight: FontWeight.w700, fontSize: 16)),
        const SizedBox(height: 6),
        const Text('Share your travel experiences\nwith other travelers!',
          textAlign: TextAlign.center,
          style: TextStyle(color: AppColors.textGrey, fontSize: 13, height: 1.5)),
        const SizedBox(height: 24),
        ElevatedButton.icon(
          onPressed: () => _tab.animateTo(1),
          icon: const Icon(Icons.add_rounded, color: Colors.white),
          label: const Text('Share your first experience',
              style: TextStyle(fontWeight: FontWeight.w700, color: Colors.white)),
        ),
      ]));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: globalUserPosts.length,
      itemBuilder: (_, i) => _postCard(globalUserPosts[i]),
    );
  }

  Widget _postCard(UserPost p) {
    final svcIdx = _serviceOptions.indexWhere((s) => s['label'] == p.serviceTaken);
    final svc = svcIdx >= 0 ? _serviceOptions[svcIdx] : _serviceOptions[0];
    final color = Color(svc['color'] as int);

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.5))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // Banner
        ClipRRect(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
          child: Container(
            height: 130, width: double.infinity,
            decoration: BoxDecoration(gradient: LinearGradient(
              begin: Alignment.topLeft, end: Alignment.bottomRight,
              colors: [color.withValues(alpha: 0.7), color.withValues(alpha: 0.25)])),
            child: Stack(children: [
              Center(child: Icon(svc['icon'] as IconData,
                  color: Colors.white.withValues(alpha: 0.15), size: 70)),
              // Type badge
              Positioned(top: 10, left: 10,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: Colors.black45,
                    borderRadius: BorderRadius.circular(8)),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    Icon(p.type == UserPostType.video
                        ? Icons.videocam_rounded : Icons.photo_library_rounded,
                        color: Colors.white, size: 11),
                    const SizedBox(width: 4),
                    Text(p.type == UserPostType.video
                        ? 'Video' : '${p.photoCount} Photos',
                      style: const TextStyle(color: Colors.white,
                          fontSize: 10, fontWeight: FontWeight.w700)),
                  ]))),
              // Service badge
              Positioned(top: 10, right: 10,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: color.withValues(alpha: 0.85),
                    borderRadius: BorderRadius.circular(8)),
                  child: Text(p.serviceTaken, style: const TextStyle(color: Colors.white,
                      fontSize: 9, fontWeight: FontWeight.w700)))),
              // Play/slideshow icon
              Center(child: Container(
                width: 44, height: 44,
                decoration: BoxDecoration(color: Colors.black38, shape: BoxShape.circle,
                  border: Border.all(color: Colors.white54, width: 1.5)),
                child: Icon(
                  p.type == UserPostType.video
                      ? Icons.play_arrow_rounded : Icons.slideshow_rounded,
                  color: Colors.white, size: 26))),
            ])),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(p.title, style: const TextStyle(color: AppColors.textDark,
                fontWeight: FontWeight.w800, fontSize: 14)),
            const SizedBox(height: 4),
            Row(children: [
              const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 12),
              const SizedBox(width: 3),
              Text(p.location, style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
            ]),
            if (p.caption.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(p.caption, style: const TextStyle(color: AppColors.textMuted,
                  fontSize: 12, height: 1.4), maxLines: 2, overflow: TextOverflow.ellipsis),
            ],
            const SizedBox(height: 10),
            Row(children: [
              const Icon(Icons.visibility_rounded, color: AppColors.textGrey, size: 13),
              const SizedBox(width: 4),
              Text('${p.views}', style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
              const SizedBox(width: 14),
              const Icon(Icons.favorite_rounded, color: Colors.red, size: 13),
              const SizedBox(width: 4),
              Text('${p.likes}', style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
              const Spacer(),
              Text(_timeAgo(p.postedAt),
                style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
            ]),
          ]),
        ),
      ]),
    );
  }

  String _timeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }

  // ── TAB 2: Share Experience ────────────────────────────────────────────────
  Widget _shareTab() => StatefulBuilder(builder: (ctx, setLocal) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        // Info banner
        Container(
          padding: const EdgeInsets.all(14),
          margin: const EdgeInsets.only(bottom: 20),
          decoration: BoxDecoration(
            gradient: LinearGradient(colors: [
              AppColors.primary.withValues(alpha: 0.15),
              AppColors.info.withValues(alpha: 0.08),
            ]),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.primary.withValues(alpha: 0.3))),
          child: const Row(children: [
            Icon(Icons.travel_explore_rounded, color: AppColors.primary, size: 28),
            SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Share your travel experience', style: TextStyle(color: Colors.white,
                  fontWeight: FontWeight.w800, fontSize: 14)),
              SizedBox(height: 3),
              Text('Post videos or photo slideshows of your trips. Visible on the Discover page.',
                style: TextStyle(color: AppColors.textGrey, fontSize: 11, height: 1.4)),
            ])),
          ]),
        ),

        // 1. Post type
        _sectionLabel('What are you posting?'),
        const SizedBox(height: 10),
        Row(children: [
          _typeBtn(setLocal, 0, Icons.videocam_rounded, 'Video', AppColors.primary),
          const SizedBox(width: 12),
          _typeBtn(setLocal, 1, Icons.photo_library_rounded, 'Photo Slideshow', const Color(0xFF7C3AED)),
        ]),
        const SizedBox(height: 20),

        // 2. Service taken
        _sectionLabel('Which service did you take?'),
        const SizedBox(height: 10),
        _serviceGrid(setLocal),
        const SizedBox(height: 20),

        // 3. File picker simulation
        _sectionLabel(_postType == 0 ? 'Upload your video' : 'Select your photos'),
        const SizedBox(height: 10),
        _filePicker(setLocal),
        const SizedBox(height: 20),

        // 4. Details
        _sectionLabel('Title'),
        _textField('e.g. My amazing Kribi beach experience', _titleCtrl),
        const SizedBox(height: 14),
        _sectionLabel('Location'),
        _textField('e.g. Kribi, Cameroon', _locationCtrl),
        const SizedBox(height: 14),
        _sectionLabel(_postType == 0 ? 'Caption / Description' : 'Caption for your slideshow'),
        _multilineField(
          _postType == 0
              ? 'Tell others about what you experienced, what you liked, tips...'
              : 'Describe your photo experience, tips for other travelers...',
          _captionCtrl),
        const SizedBox(height: 24),

        // Post button
        _isPosting
          ? Column(children: [
              const LinearProgressIndicator(color: AppColors.primary, backgroundColor: AppColors.bgCard),
              const SizedBox(height: 12),
              const Text('Sharing your experience...', textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.textGrey, fontSize: 12)),
            ])
          : SizedBox(
              width: double.infinity, height: 52,
              child: ElevatedButton.icon(
                onPressed: (_selectedService != null && _titleCtrl.text.isNotEmpty && _fileSelected)
                    ? _post : null,
                icon: Icon(_postType == 0 ? Icons.videocam_rounded : Icons.slideshow_rounded,
                    color: Colors.white),
                label: Text(_postType == 0 ? 'Share Video Experience' : 'Share Photo Slideshow',
                    style: const TextStyle(fontWeight: FontWeight.w800, color: Colors.white, fontSize: 14)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: (_selectedService != null && _titleCtrl.text.isNotEmpty && _fileSelected)
                      ? AppColors.primary : Colors.white12,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
              )),

        if (_selectedService == null || _titleCtrl.text.isEmpty || !_fileSelected) ...[
          const SizedBox(height: 8),
          const Center(child: Text('Fill in all required fields to post',
            style: TextStyle(color: AppColors.textGrey, fontSize: 11))),
        ],
        const SizedBox(height: 32),
      ]),
    );
  });

  Widget _typeBtn(StateSetter setLocal, int type, IconData icon, String label, Color color) {
    final active = _postType == type;
    return Expanded(child: GestureDetector(
      onTap: () => setLocal(() { _postType = type; _fileSelected = false; }),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: active ? color.withValues(alpha: 0.14) : AppColors.bgCard,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: active ? color : AppColors.cardBorder, width: active ? 2 : 1)),
        child: Column(children: [
          Icon(icon, color: active ? color : AppColors.textGrey, size: 28),
          const SizedBox(height: 7),
          Text(label, textAlign: TextAlign.center,
            style: TextStyle(color: active ? color : AppColors.textGrey,
                fontWeight: FontWeight.w700, fontSize: 12)),
        ]))));
  }

  Widget _serviceGrid(StateSetter setLocal) => Wrap(
    spacing: 8, runSpacing: 8,
    children: List.generate(_serviceOptions.length, (i) {
      final s = _serviceOptions[i];
      final color = Color(s['color'] as int);
      final active = _selectedService == i;
      return GestureDetector(
        onTap: () => setLocal(() { _selectedService = i; setState(() {}); }),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 8),
          decoration: BoxDecoration(
            color: active ? color.withValues(alpha: 0.15) : AppColors.bgCard,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: active ? color : AppColors.cardBorder, width: active ? 1.5 : 1)),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            Icon(s['icon'] as IconData, color: active ? color : AppColors.textGrey, size: 14),
            const SizedBox(width: 6),
            Text(s['label'] as String, style: TextStyle(
              color: active ? color : AppColors.textGrey,
              fontSize: 11, fontWeight: active ? FontWeight.w700 : FontWeight.w500)),
            if (active) ...[
              const SizedBox(width: 4),
              Icon(Icons.check_circle_rounded, color: color, size: 12),
            ],
          ])));
    }),
  );

  Widget _filePicker(StateSetter setLocal) {
    final color = _postType == 0 ? AppColors.primary : const Color(0xFF7C3AED);
    return GestureDetector(
      onTap: () {
        setLocal(() {
          _fileSelected = true;
          if (_postType == 1) {
            _photoCount = 3 + globalUserPosts.length % 4;
          }
          setState(() {});
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 24),
        decoration: BoxDecoration(
          color: _fileSelected ? color.withValues(alpha: 0.08) : AppColors.bgCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: _fileSelected ? color : AppColors.cardBorder,
            style: _fileSelected ? BorderStyle.solid : BorderStyle.solid,
            width: _fileSelected ? 1.5 : 1),
        ),
        child: Column(children: [
          Icon(
            _fileSelected
                ? (_postType == 0 ? Icons.videocam_rounded : Icons.photo_library_rounded)
                : (_postType == 0 ? Icons.video_call_rounded : Icons.add_photo_alternate_rounded),
            color: _fileSelected ? color : AppColors.textGrey, size: 36),
          const SizedBox(height: 8),
          Text(
            _fileSelected
                ? (_postType == 0 ? 'Video selected ✓' : '$_photoCount photos selected ✓')
                : (_postType == 0 ? 'Tap to select video' : 'Tap to select photos'),
            style: TextStyle(
              color: _fileSelected ? color : AppColors.textGrey,
              fontWeight: FontWeight.w700, fontSize: 13)),
          if (!_fileSelected) ...[
            const SizedBox(height: 4),
            Text(
              _postType == 0 ? 'MP4, MOV · max 1:45 min' : 'JPG, PNG · up to 10 photos',
              style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
          ],
        ]),
      ),
    );
  }

  Widget _sectionLabel(String t) => Text(t, style: const TextStyle(
      color: AppColors.textDark, fontWeight: FontWeight.w700, fontSize: 13));

  Widget _textField(String hint, TextEditingController ctrl) => Container(
    decoration: BoxDecoration(color: AppColors.bgCard,
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: AppColors.cardBorder)),
    child: TextField(
      controller: ctrl,
      onChanged: (_) => setState(() {}),
      style: const TextStyle(color: Colors.white, fontSize: 13),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: AppColors.textGrey, fontSize: 12),
        border: InputBorder.none,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13))));

  Widget _multilineField(String hint, TextEditingController ctrl) => Container(
    decoration: BoxDecoration(color: AppColors.bgCard,
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: AppColors.cardBorder)),
    child: TextField(
      controller: ctrl, maxLines: 4,
      style: const TextStyle(color: Colors.white, fontSize: 13),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: AppColors.textGrey, fontSize: 12),
        border: InputBorder.none,
        contentPadding: const EdgeInsets.all(14))));
}
