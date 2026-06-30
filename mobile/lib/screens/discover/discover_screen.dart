import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../theme/app_theme.dart';
import '../../widgets/common_widgets.dart';
import '../pro/notifications_screen.dart';
import '../wallet/wallet_screen.dart';

// ── Video model ──────────────────────────────────────────────────────────────
class TravelVideo {
  final String id, title, location, uploader, category, uploaderHandle;
  final int likes, comments, views;
  final double rating;
  final List<String> userRatings;
  final bool isPro;
  bool liked, bookmarked;
  // Pro profile fields
  final String bio;
  final int followers;
  final int totalViews;
  // User post fields
  final bool isPhotoSlideshow;
  final int photoCount;
  final String experienceCaption;
  final String serviceTaken;

  TravelVideo({
    required this.id, required this.title, required this.location,
    required this.uploader, required this.category,
    required this.likes, required this.comments, required this.views,
    required this.rating, this.liked = false, this.bookmarked = false,
    this.userRatings = const [], this.isPro = false, this.uploaderHandle = '',
    this.bio = '', this.followers = 0, this.totalViews = 0,
    this.isPhotoSlideshow = false,
    this.photoCount = 1,
    this.experienceCaption = '',
    this.serviceTaken = '',
  });
}

// Global list that pro uploads append to — shared with discover feed
final List<TravelVideo> globalUploadedVideos = [];

// Global follow state: handle -> isFollowing
final Map<String, bool> globalFollowState = {};

final List<TravelVideo> kVideos = [
  TravelVideo(id:'v1', title:'Yaoundé City Guide & Experience', location:'Yaoundé, Cameroon',
    uploader:'CamTours Pro', uploaderHandle:'camtours', category:'City',
    likes:1240, comments:89, views:12400, rating:4.5, isPro:true,
    bio:'🌍 Official city guide for Yaoundé & surroundings. 5+ years helping travelers discover the best of Cameroon\'s capital.',
    followers:3400, totalViews:87000,
    userRatings:['Great!','Amazing views']),
  TravelVideo(id:'v2', title:'Kribi Beach Paradise', location:'Kribi, Cameroon',
    uploader:'BeachLife Pro', uploaderHandle:'beachlife', category:'Beach',
    likes:3200, comments:214, views:45000, rating:5.0, isPro:true,
    bio:'🏖️ Kribi\'s #1 beach experience guide. Snorkeling, sunset walks, seafood tours. Book your perfect coastal getaway!',
    followers:8900, totalViews:210000,
    userRatings:['Beautiful!','Must visit']),
  TravelVideo(id:'v3', title:'Mount Cameroon Hike', location:'Buea, Cameroon',
    uploader:'Eugene Mefo', uploaderHandle:'eugenemefo', category:'Adventure',
    likes:890, comments:67, views:9800, rating:4.0, isPro:false,
    bio:'🏔️ Avid hiker and outdoor explorer from Buea. I document real travel experiences across Cameroon so you know what to expect.',
    userRatings:['Challenging but worth it']),
  TravelVideo(id:'v4', title:'Douala Night Life', location:'Douala, Cameroon',
    uploader:'CityVibe Pro', uploaderHandle:'cityvibe', category:'City',
    likes:2100, comments:156, views:28000, rating:4.2, isPro:true,
    bio:'🎶 Douala nightlife & culture expert. I show you where the real vibes are — local bars, concerts & street art scenes.',
    followers:5200, totalViews:130000,
    userRatings:['So vibrant!','Love the culture']),
  TravelVideo(id:'v5', title:'Waza National Park Safari', location:'Waza, Cameroon',
    uploader:'Safari Pro', uploaderHandle:'safaripro', category:'Wildlife',
    likes:4500, comments:320, views:62000, rating:4.8, isPro:true,
    bio:'🦁 Wildlife guide & safari expert. Waza & Lobéké specialist. UICN certified. Let\'s find Africa\'s big five together.',
    followers:14600, totalViews:390000,
    userRatings:['Incredible wildlife','Breathtaking']),
  TravelVideo(id:'v6', title:'Bafoussam Cultural Guide & Experience', location:'Bafoussam, Cameroon',
    uploader:'Amina Ngoh', uploaderHandle:'aminangoh', category:'Culture',
    likes:670, comments:45, views:7600, rating:4.3, isPro:false,
    bio:'🎭 Passionate about Cameroonian culture and traditions. Sharing my travel stories from the Western Highlands and beyond.',
    userRatings:['Rich culture','Very educational']),
  TravelVideo(id:'v7', title:'Hilton Yaoundé Experience', location:'Yaoundé, Cameroon',
    uploader:'LuxStays Pro', uploaderHandle:'luxstays', category:'Hotel',
    likes:1800, comments:102, views:22000, rating:4.7, isPro:true,
    bio:'🏨 Luxury hotel & accommodation specialist. Partnered with 20+ top hotels across Cameroon. Best rates guaranteed.',
    followers:6700, totalViews:145000,
    userRatings:['World class service','Stunning rooms']),
  TravelVideo(id:'v8', title:'Sawa Hotel Douala Experience', location:'Douala, Cameroon',
    uploader:'Marcel Essama', uploaderHandle:'marcessama', category:'Hotel',
    likes:1100, comments:74, views:14500, rating:4.4, isPro:false,
    bio:'🏨 Business traveller sharing honest hotel reviews from across Cameroon. No filters — just real stays, real opinions.',
    userRatings:['Amazing waterfront views','Great amenities']),
  TravelVideo(id:'v9', title:'La Terrasse Fine Dining', location:'Yaoundé, Cameroon',
    uploader:'FoodiesCam', uploaderHandle:'foodiescam', category:'Restaurant',
    likes:2600, comments:188, views:31000, rating:4.9, isPro:true,
    bio:'🍽️ Food critic & restaurant guide. From street food to 5-star dining — I cover it all across Cameroon. 10K+ meals reviewed.',
    followers:11200, totalViews:280000,
    userRatings:['Best food in Cameroon!','Must try the grilled fish']),
  TravelVideo(id:'v10', title:'Douala Street Food Guide & Experience', location:'Douala, Cameroon',
    uploader:'Diane Fotso', uploaderHandle:'dianefotso', category:'Restaurant',
    likes:3900, comments:265, views:54000, rating:4.6, isPro:false,
    bio:'🍜 Foodie from Douala documenting the best street food spots in Cameroon. Every plate tells a story — follow for tasty finds!',
    userRatings:['Authentic flavors','Super affordable']),
];

// ── Discover Screen (TikTok-style) ───────────────────────────────────────────
class DiscoverScreen extends StatefulWidget {
  const DiscoverScreen({super.key});
  @override State<DiscoverScreen> createState() => _DiscoverScreenState();
}

class _DiscoverScreenState extends State<DiscoverScreen> {
  int _catIdx = 0;
  int _currentPage = 0;
  late PageController _pageController;
  List<TravelVideo> _videos = [];

  final _cats = const ['All', 'City', 'Beach', 'Adventure', 'Wildlife', 'Culture', 'Hotel', 'Restaurant'];

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  void _refreshVideos() {
    setState(() {
      _videos = [...kVideos, ...globalUploadedVideos];
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _videos = [...kVideos, ...globalUploadedVideos];
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  List<TravelVideo> get _filtered => _catIdx == 0
      ? _videos
      : _videos.where((v) => v.category == _cats[_catIdx]).toList();

  void _onCatChanged(int idx) {
    setState(() {
      _catIdx = idx;
      _currentPage = 0;
    });
    _pageController.jumpToPage(0);
  }

  @override
  Widget build(BuildContext context) {
    // Full screen immersive — hide status bar
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ));

    final videos = _filtered;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(children: [
        // ── Full-screen vertical PageView ──────────────────────────────────
        videos.isEmpty
            ? const Center(child: Text('No videos', style: TextStyle(color: Colors.white)))
            : PageView.builder(
                controller: _pageController,
                scrollDirection: Axis.vertical,
                itemCount: videos.length,
                onPageChanged: (i) => setState(() => _currentPage = i),
                itemBuilder: (_, i) => _TikTokVideoPage(
                  key: ValueKey('${videos[i].id}_$i'),
                  video: videos[i],
                  isActive: i == _currentPage,
                  onLike: () => setState(() => _videos[_videos.indexOf(videos[i])].liked = !videos[i].liked),
                  onBookmark: () => setState(() => _videos[_videos.indexOf(videos[i])].bookmarked = !videos[i].bookmarked),
                  onComment: () => _showComments(videos[i]),
                  onProfile: () => Navigator.push(context,
                      MaterialPageRoute(builder: (_) => ProPublicProfileScreen(video: videos[i]))),
                )),

        // ── Top overlay: logo + category chips ────────────────────────────
        SafeArea(child: Column(mainAxisSize: MainAxisSize.min, children: [
          // Logo row
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
            child: Row(children: [
              GestureDetector(
                onTap: () => Navigator.push(context,
                    MaterialPageRoute(builder: (_) => _VideoSearchScreen(videos: kVideos))),
                child: Container(width: 38, height: 38,
                  decoration: BoxDecoration(color: Colors.black38,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white24)),
                  child: const Icon(Icons.search_rounded, color: Colors.white, size: 20))),
              const Spacer(),
              const TraveoLogoWidget(),
              const Spacer(),
              GestureDetector(
                onTap: () => Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const WalletScreen())),
                child: Container(width: 38, height: 38,
                  decoration: BoxDecoration(color: Colors.black38,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white24)),
                  child: const Icon(Icons.account_balance_wallet_rounded, color: Colors.white, size: 20))),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () => Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const NotificationsScreen())),
                child: Stack(children: [
                  Container(width: 38, height: 38,
                    decoration: BoxDecoration(color: Colors.black38,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.white24)),
                    child: const Icon(Icons.notifications_rounded, color: Colors.white, size: 20)),
                  Positioned(top: 2, right: 2, child: Container(
                    padding: const EdgeInsets.all(3),
                    decoration: const BoxDecoration(color: Colors.orange, shape: BoxShape.circle),
                    child: const Text('2', style: TextStyle(color: Colors.white,
                        fontSize: 7, fontWeight: FontWeight.bold)))),
                ])),
            ])),
          // Category chips
          const SizedBox(height: 8),
          SizedBox(
            height: 34,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: _cats.length,
              itemBuilder: (_, i) {
                final active = i == _catIdx;
                return GestureDetector(
                  onTap: () => _onCatChanged(i),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: active ? AppColors.primary : Colors.black45,
                      borderRadius: BorderRadius.circular(30),
                      border: Border.all(color: active ? AppColors.primary : Colors.white30)),
                    child: Text(_cats[i], style: TextStyle(
                        color: active ? Colors.white : Colors.white70,
                        fontWeight: active ? FontWeight.w700 : FontWeight.w500,
                        fontSize: 12))));
              })),
        ])),

      ]),
    );
  }

  void _showComments(TravelVideo v) {
    showModalBottomSheet(
      context: context, isScrollControlled: true,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => _CommentsSheet(video: v));
  }
}

// ── Single TikTok video page ─────────────────────────────────────────────────
class _TikTokVideoPage extends StatefulWidget {
  final TravelVideo video;
  final bool isActive;
  final VoidCallback onLike, onBookmark, onComment, onProfile;

  const _TikTokVideoPage({
    super.key,
    required this.video,
    required this.isActive,
    required this.onLike,
    required this.onBookmark,
    required this.onComment,
    required this.onProfile,
  });

  @override
  State<_TikTokVideoPage> createState() => _TikTokVideoPageState();
}

class _TikTokVideoPageState extends State<_TikTokVideoPage>
    with SingleTickerProviderStateMixin {
  bool _playing = false;
  late AnimationController _heartController;
  bool _showHeart = false;
  int _slideIdx = 0; // current photo in slideshow

  // Gradient per category
  List<Color> get _gradient {
    switch (widget.video.category) {
      case 'Beach':     return [const Color(0xFF006994), const Color(0xFF00C9A7)];
      case 'Adventure': return [const Color(0xFF064E3B), const Color(0xFF10B981)];
      case 'Wildlife':  return [const Color(0xFF78350F), const Color(0xFFF59E0B)];
      case 'Culture':   return [const Color(0xFF4C1D95), const Color(0xFF8B5CF6)];
      case 'City':       return [const Color(0xFF1E3A5F), const Color(0xFF4F46E5)];
      case 'Hotel':      return [const Color(0xFF1A3A4A), const Color(0xFF00ACC1)];
      case 'Restaurant': return [const Color(0xFF4A1A1A), const Color(0xFFE53935)];
      default:           return [const Color(0xFF111827), const Color(0xFF374151)];
    }
  }

  IconData get _catIcon {
    switch (widget.video.category) {
      case 'Beach':     return Icons.beach_access_rounded;
      case 'Adventure': return Icons.terrain_rounded;
      case 'Wildlife':  return Icons.pets_rounded;
      case 'Culture':   return Icons.museum_rounded;
      case 'City':        return Icons.location_city_rounded;
      case 'Hotel':       return Icons.hotel_rounded;
      case 'Restaurant':  return Icons.restaurant_rounded;
      default:            return Icons.travel_explore_rounded;
    }
  }

  @override
  void initState() {
    super.initState();
    _playing = widget.isActive;
    _heartController = AnimationController(
      vsync: this, duration: const Duration(milliseconds: 700));
    _heartController.addStatusListener((s) {
      if (s == AnimationStatus.completed) {
        setState(() => _showHeart = false);
        _heartController.reset();
      }
    });
    // Auto-advance slideshow when active
    if (widget.video.isPhotoSlideshow && widget.isActive) {
      _startSlideshow();
    }
  }

  void _startSlideshow() {
    Future.delayed(const Duration(seconds: 3), () {
      if (!mounted || !widget.video.isPhotoSlideshow) return;
      setState(() {
        _slideIdx = (_slideIdx + 1) % widget.video.photoCount;
      });
      _startSlideshow();
    });
  }

  @override
  void didUpdateWidget(_TikTokVideoPage old) {
    super.didUpdateWidget(old);
    if (widget.isActive != old.isActive) {
      setState(() => _playing = widget.isActive);
      if (widget.video.isPhotoSlideshow && widget.isActive) {
        _startSlideshow();
      }
    }
  }

  @override
  void dispose() {
    _heartController.dispose();
    super.dispose();
  }

  void _doubleTapLike() {
    if (!widget.video.liked) widget.onLike();
    setState(() => _showHeart = true);
    _heartController.forward();
  }

  // Advance slideshow on tap instead of play/pause
  void _onTap() {
    if (widget.video.isPhotoSlideshow) {
      setState(() => _slideIdx = (_slideIdx + 1) % widget.video.photoCount);
    } else {
      setState(() => _playing = !_playing);
    }
  }

  String _fmt(int n) => n >= 1000 ? '${(n / 1000).toStringAsFixed(1)}K' : n.toString();

  @override
  Widget build(BuildContext context) {
    final v = widget.video;
    final size = MediaQuery.of(context).size;
    final isSlideshow = v.isPhotoSlideshow;

    return GestureDetector(
      onTap: _onTap,
      onDoubleTap: _doubleTapLike,
      child: SizedBox(width: size.width, height: size.height,
        child: Stack(fit: StackFit.expand, children: [

          // ── Background gradient (simulates video/photo) ────────────────
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 600),
            child: Container(
              key: ValueKey(_slideIdx),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: isSlideshow
                      ? (Alignment(_slideIdx % 2 == 0 ? -1 : 1, -1))
                      : Alignment.topCenter,
                  end: isSlideshow
                      ? (Alignment(_slideIdx % 2 == 0 ? 1 : -1, 1))
                      : Alignment.bottomCenter,
                  colors: _gradient))),
          ),

          // Big category icon watermark
          Center(child: Icon(_catIcon,
              color: Colors.white.withValues(alpha: 0.08), size: 220)),

          // Bottom dark gradient for readability
          Align(alignment: Alignment.bottomCenter,
            child: Container(height: size.height * 0.55,
              decoration: BoxDecoration(gradient: LinearGradient(
                begin: Alignment.topCenter, end: Alignment.bottomCenter,
                colors: [Colors.transparent, Colors.black.withValues(alpha: 0.85)])))),

          // ── Slideshow: photo dots indicator + slide number ───────────────
          if (isSlideshow)
            Positioned(
              top: MediaQuery.of(context).padding.top + 60,
              left: 0, right: 0,
              child: Column(children: [
                // Progress bars (like Instagram stories)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: List.generate(v.photoCount, (i) => Expanded(
                      child: Container(
                        height: 2.5,
                        margin: const EdgeInsets.symmetric(horizontal: 1.5),
                        decoration: BoxDecoration(
                          color: i <= _slideIdx
                              ? Colors.white
                              : Colors.white30,
                          borderRadius: BorderRadius.circular(2)),
                      ),
                    )),
                  ),
                ),
                const SizedBox(height: 6),
                Text('${_slideIdx + 1} / ${v.photoCount}',
                  style: const TextStyle(color: Colors.white70, fontSize: 11,
                      fontWeight: FontWeight.w600,
                      shadows: [Shadow(blurRadius: 4, color: Colors.black54)])),
              ])),

          // Slideshow icon watermark (center)
          if (isSlideshow)
            Center(child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 400),
              child: Icon(Icons.image_rounded,
                key: ValueKey(_slideIdx),
                color: Colors.white.withValues(alpha: 0.12), size: 180))),

          // ── Play/Pause indicator (video only) ──────────────────────────
          if (!isSlideshow && !_playing)
            Center(child: AnimatedOpacity(
              opacity: _playing ? 0 : 1,
              duration: const Duration(milliseconds: 200),
              child: Container(
                width: 72, height: 72,
                decoration: BoxDecoration(
                  color: Colors.black45, shape: BoxShape.circle,
                  border: Border.all(color: Colors.white54, width: 2)),
                child: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 40)))),

          // ── Double-tap heart animation ──────────────────────────────────
          if (_showHeart)
            Center(child: ScaleTransition(
              scale: CurvedAnimation(parent: _heartController,
                  curve: Curves.elasticOut),
              child: FadeTransition(
                opacity: Tween(begin: 1.0, end: 0.0).animate(
                  CurvedAnimation(parent: _heartController,
                      curve: const Interval(0.6, 1.0))),
                child: const Icon(Icons.favorite_rounded,
                    color: Colors.red, size: 100)))),

          // ── Bottom left: title, location, uploader ──────────────────────
          Positioned(
            left: 16, right: 80, bottom: 32,
            child: Column(crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min, children: [
              // Uploader row
              Row(children: [
                GestureDetector(
                  onTap: widget.onProfile,
                  child: Container(width: 36, height: 36,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        colors: [AppColors.primary, AppColors.primary.withValues(alpha: 0.5)]),
                      border: Border.all(color: Colors.white, width: 1.5)),
                    child: Center(child: Text(v.uploader[0],
                      style: const TextStyle(color: Colors.white,
                          fontWeight: FontWeight.w900, fontSize: 15))))),
                const SizedBox(width: 8),
                Expanded(child: GestureDetector(
                  onTap: widget.onProfile,
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(children: [
                      Flexible(child: Text(
                        v.uploader,
                        maxLines: 1, overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                            color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13))),
                      if (v.isPro) ...[
                        const SizedBox(width: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                          decoration: BoxDecoration(color: AppColors.primary,
                              borderRadius: BorderRadius.circular(4)),
                          child: const Text('PRO', style: TextStyle(color: Colors.white,
                              fontSize: 8, fontWeight: FontWeight.w800))),
                      ],
                      // Inline follow button for normal users
                      if (!v.isPro) ...[
                        const SizedBox(width: 6),
                        StatefulBuilder(builder: (ctx, setBtn) {
                          final key = v.uploader;
                          final following = globalFollowState[key] ?? false;
                          return GestureDetector(
                            onTap: () => setBtn(() => globalFollowState[key] = !following),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                              decoration: BoxDecoration(
                                color: following
                                    ? Colors.white.withValues(alpha: 0.15)
                                    : AppColors.primary,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                    color: following ? Colors.white54 : AppColors.primary,
                                    width: 1.5)),
                              child: Text(following ? 'Following' : 'Follow',
                                style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 10, fontWeight: FontWeight.w700))));
                        }),
                      ],
                    ]),
                  ]))),
                const SizedBox(width: 8),
                // Follow button for PRO users only
                if (v.isPro)
                StatefulBuilder(builder: (ctx, setBtn) {
                  final key = v.uploaderHandle;
                  final following = globalFollowState[key] ?? false;
                  return GestureDetector(
                    onTap: () => setBtn(() => globalFollowState[key] = !following),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                      decoration: BoxDecoration(
                        color: following
                            ? Colors.white.withValues(alpha: 0.15)
                            : AppColors.primary,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: following ? Colors.white54 : AppColors.primary, width: 1.5)),
                      child: Text(following ? 'Following' : 'Follow',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11, fontWeight: FontWeight.w700))));
                }),
              ]),
              const SizedBox(height: 10),
              // Title
              Text(v.title, style: const TextStyle(color: Colors.white,
                  fontWeight: FontWeight.w800, fontSize: 18,
                  shadows: [Shadow(blurRadius: 8, color: Colors.black54)])),
              const SizedBox(height: 6),

              // Experience caption for user posts
              if (!v.isPro && v.experienceCaption.isNotEmpty) ...[
                Text(v.experienceCaption,
                  maxLines: 2, overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: Colors.white70, fontSize: 12, height: 1.4,
                      shadows: [Shadow(blurRadius: 6, color: Colors.black54)])),
                const SizedBox(height: 6),
              ],

              // Location
              Row(children: [
                const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 14),
                const SizedBox(width: 3),
                Text(v.location, style: const TextStyle(color: Colors.white70,
                    fontSize: 13, fontWeight: FontWeight.w500)),
              ]),
              const SizedBox(height: 8),
              // Views + category + service tag
              Row(children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: Colors.black38,
                      borderRadius: BorderRadius.circular(20)),
                  child: Row(children: [
                    const Icon(Icons.visibility_rounded, color: Colors.white70, size: 12),
                    const SizedBox(width: 4),
                    Text(_fmt(v.views), style: const TextStyle(color: Colors.white70, fontSize: 11)),
                  ])),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.8),
                    borderRadius: BorderRadius.circular(20)),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    if (isSlideshow) ...[
                      const Icon(Icons.photo_library_rounded, color: Colors.white, size: 10),
                      const SizedBox(width: 3),
                    ],
                    Text(v.category, style: const TextStyle(color: Colors.white,
                        fontSize: 11, fontWeight: FontWeight.w700)),
                  ])),
                if (!v.isPro && v.serviceTaken.isNotEmpty) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white24)),
                    child: Text(v.serviceTaken,
                      maxLines: 1, overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: Colors.white70,
                          fontSize: 9, fontWeight: FontWeight.w600))),
                ],
              ]),
            ])),

          // ── Right side action buttons (TikTok style) ───────────────────
          Positioned(
            right: 12, bottom: 40,
            child: Column(mainAxisSize: MainAxisSize.min, children: [

              // Like
              _SideAction(
                icon: v.liked ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                label: _fmt(v.likes + (v.liked ? 1 : 0)),
                color: v.liked ? Colors.red : Colors.white,
                onTap: widget.onLike),
              const SizedBox(height: 20),

              // Comment
              _SideAction(
                icon: Icons.chat_bubble_rounded,
                label: _fmt(v.comments),
                color: Colors.white,
                onTap: widget.onComment),
              const SizedBox(height: 20),

              // Bookmark
              _SideAction(
                icon: v.bookmarked ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
                label: 'Save',
                color: v.bookmarked ? AppColors.primary : Colors.white,
                onTap: widget.onBookmark),
              const SizedBox(height: 20),

              // Share
              _SideAction(
                icon: Icons.share_rounded,
                label: 'Share',
                color: Colors.white,
                onTap: () {}),
              const SizedBox(height: 20),

              // Rating stars (only for pro posts)
              if (v.isPro)
                Column(children: [
                  const Icon(Icons.star_rounded, color: Colors.amber, size: 28),
                  const SizedBox(height: 3),
                  Text(v.rating.toStringAsFixed(1),
                      style: const TextStyle(color: Colors.white,
                          fontSize: 12, fontWeight: FontWeight.w700)),
                ]),
            ])),
        ])),
    );
  }
}

// ── Side action button ────────────────────────────────────────────────────────
class _SideAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _SideAction({required this.icon, required this.label,
      required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Column(children: [
      Icon(icon, color: color, size: 32,
          shadows: const [Shadow(blurRadius: 6, color: Colors.black54)]),
      const SizedBox(height: 3),
      Text(label, style: TextStyle(color: color, fontSize: 11,
          fontWeight: FontWeight.w600,
          shadows: const [Shadow(blurRadius: 4, color: Colors.black87)])),
    ]));
}

// ── Pro Public Profile Screen (TikTok-style) ─────────────────────────────────
class ProPublicProfileScreen extends StatefulWidget {
  final TravelVideo video;
  const ProPublicProfileScreen({super.key, required this.video});
  @override State<ProPublicProfileScreen> createState() => _ProPublicProfileScreenState();
}

class _ProPublicProfileScreenState extends State<ProPublicProfileScreen> {
  late bool _following;

  static String _fmtNum(int n) => n >= 1000000
      ? '${(n / 1000000).toStringAsFixed(1)}M'
      : n >= 1000 ? '${(n / 1000).toStringAsFixed(1)}K' : n.toString();

  @override
  void initState() {
    super.initState();
    final v = widget.video;
    final key = v.isPro ? v.uploaderHandle : v.uploader;
    _following = globalFollowState[key] ?? false;
  }

  void _toggleFollow() {
    final v = widget.video;
    final key = v.isPro ? v.uploaderHandle : v.uploader;
    setState(() {
      _following = !_following;
      globalFollowState[key] = _following;
    });
  }

  // Services based on category
  List<Map<String, dynamic>> get _services {
    switch (widget.video.category) {
      case 'City':
        return [
          {'name': 'City Guide & Experience', 'icon': Icons.location_city_rounded, 'color': const Color(0xFF1DB954), 'price': 'FCFA 30/person'},
          {'name': 'Night Life Tour', 'icon': Icons.nightlife_rounded, 'color': const Color(0xFF8B5CF6), 'price': 'FCFA 20/person'},
        ];
      case 'Beach':
        return [
          {'name': 'Beach Guide & Experience', 'icon': Icons.beach_access_rounded, 'color': const Color(0xFF2196F3), 'price': 'FCFA 45/person'},
          {'name': 'Snorkeling Trip', 'icon': Icons.pool_rounded, 'color': const Color(0xFF00BCD4), 'price': 'FCFA 35/person'},
        ];
      case 'Wildlife':
        return [
          {'name': 'Safari Guide & Experience', 'icon': Icons.pets_rounded, 'color': const Color(0xFFF59E0B), 'price': 'FCFA 95/person'},
          {'name': 'Park Trek', 'icon': Icons.terrain_rounded, 'color': const Color(0xFF4CAF50), 'price': 'FCFA 60/person'},
        ];
      case 'Hotel':
        return [
          {'name': 'Luxury Stay Package', 'icon': Icons.hotel_rounded, 'color': const Color(0xFF00ACC1), 'price': 'FCFA 120/night'},
          {'name': 'Resort Experience', 'icon': Icons.spa_rounded, 'color': const Color(0xFFE91E63), 'price': 'FCFA 85/night'},
        ];
      case 'Restaurant':
        return [
          {'name': 'Fine Dining Experience', 'icon': Icons.restaurant_rounded, 'color': const Color(0xFFE53935), 'price': 'FCFA 25/person'},
          {'name': 'Food & Culture Tour', 'icon': Icons.dinner_dining_rounded, 'color': const Color(0xFFF5A623), 'price': 'FCFA 18/person'},
        ];
      default:
        return [
          {'name': 'Cultural Guide & Experience', 'icon': Icons.museum_rounded, 'color': const Color(0xFFF5A623), 'price': 'FCFA 35/person'},
          {'name': 'Adventure Trek', 'icon': Icons.terrain_rounded, 'color': const Color(0xFF4CAF50), 'price': 'FCFA 80/person'},
        ];
    }
  }

  @override
  Widget build(BuildContext context) {
    final v = widget.video;
    final followerCount = v.followers + (_following ? 1 : 0);
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: CustomScrollView(slivers: [
        SliverToBoxAdapter(child: _banner(context, v, followerCount)),
        if (v.bio.isNotEmpty) SliverToBoxAdapter(child: _bioSection(v)),
        SliverToBoxAdapter(child: _statsRow(v, followerCount)),
        if (v.isPro) SliverToBoxAdapter(child: _servicesSection()),
        SliverToBoxAdapter(child: _recentVideos(v)),
        const SliverToBoxAdapter(child: SizedBox(height: 40)),
      ]),
    );
  }

  Widget _banner(BuildContext context, TravelVideo v, int followerCount) {
    return Stack(children: [
      // Cover gradient
      Container(height: 230, width: double.infinity,
        decoration: BoxDecoration(gradient: LinearGradient(
            begin: Alignment.topLeft, end: Alignment.bottomRight,
            colors: [const Color(0xFF0D3A20), AppColors.primary.withValues(alpha: 0.7), const Color(0xFF1E3A5F)]))),
      // Pattern overlay
      Positioned.fill(child: Opacity(opacity: 0.07, child: GridView.builder(
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 8),
        itemCount: 80,
        itemBuilder: (_, __) => const Icon(Icons.travel_explore, color: Colors.white, size: 20)))),
      SafeArea(child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
        child: Row(children: [
          GestureDetector(onTap: () => Navigator.pop(context),
            child: Container(width: 36, height: 36,
              decoration: BoxDecoration(color: Colors.black38,
                  borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 18))),
          const Spacer(),
          if (v.isPro) Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.25),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.5))),
            child: const Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(Icons.verified_rounded, color: AppColors.primary, size: 13),
              SizedBox(width: 4),
              Text('PRO Creator', style: TextStyle(color: AppColors.primary,
                  fontWeight: FontWeight.w800, fontSize: 11)),
            ])),
        ]))),
      // Avatar + name row
      Positioned(bottom: 0, left: 0, right: 0,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
          child: Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Container(width: 80, height: 80,
              decoration: BoxDecoration(shape: BoxShape.circle,
                border: Border.all(color: AppColors.primary, width: 2.5),
                gradient: const LinearGradient(
                    colors: [Color(0xFF1DB954), Color(0xFF4F46E5)])),
              child: Center(child: Text(v.uploader[0],
                style: const TextStyle(color: Colors.white,
                    fontWeight: FontWeight.w900, fontSize: 32)))),
            const SizedBox(width: 14),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(v.uploader, style: const TextStyle(color: Colors.white,
                  fontWeight: FontWeight.w900, fontSize: 18,
                  shadows: [Shadow(blurRadius: 6, color: Colors.black54)])),
              if (v.isPro)
                Text('@${v.uploaderHandle}', style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.7), fontSize: 12))
              else
                Text(
                  v.bio.isNotEmpty ? v.bio : 'Traveo traveller sharing real experiences',
                  maxLines: 2, overflow: TextOverflow.ellipsis,
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 11, height: 1.4)),
            ])),
            // Follow / Following button
            GestureDetector(
              onTap: _toggleFollow,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 9),
                decoration: BoxDecoration(
                  color: _following ? Colors.white.withValues(alpha: 0.15) : AppColors.primary,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: _following ? Colors.white54 : AppColors.primary, width: 1.5)),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(_following ? Icons.check_rounded : Icons.add_rounded,
                    color: Colors.white, size: 14),
                  const SizedBox(width: 4),
                  Text(_following ? 'Following' : 'Follow',
                    style: const TextStyle(color: Colors.white,
                        fontWeight: FontWeight.w800, fontSize: 13)),
                ]))),
          ]))),
    ]);
  }

  Widget _bioSection(TravelVideo v) => Padding(
    padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
    child: Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.5))),
      child: Text(v.bio,
        style: const TextStyle(color: AppColors.textMuted, fontSize: 13, height: 1.5))));

  Widget _statsRow(TravelVideo v, int followerCount) {
    // Count how many posts in globalUploadedVideos have same uploader
    final postCount = globalUploadedVideos.where((p) =>
        p.uploader == v.uploader || p.uploaderHandle == v.uploaderHandle).length;
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      child: Row(children: [
        _statBox(_fmtNum(followerCount), 'Followers', Icons.people_rounded, AppColors.primary),
        const SizedBox(width: 10),
        _statBox(_fmtNum(v.totalViews > 0 ? v.totalViews : v.views), 'Total Views',
            Icons.visibility_rounded, const Color(0xFF8B5CF6)),
        const SizedBox(width: 10),
        if (v.isPro)
          _statBox(v.rating.toStringAsFixed(1), 'Rating', Icons.star_rounded, Colors.amber)
        else
          _statBox('$postCount', 'Posts', Icons.grid_on_rounded, AppColors.info),
      ]));
  }

  Widget _statBox(String value, String label, IconData icon, Color color) => Expanded(
    child: Container(
      padding: const EdgeInsets.symmetric(vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.25))),
      child: Column(children: [
        Icon(icon, color: color, size: 18),
        const SizedBox(height: 6),
        Text(value, style: TextStyle(color: color,
            fontWeight: FontWeight.w900, fontSize: 16)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
      ])));

  Widget _servicesSection() => Padding(
    padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Container(width: 3, height: 16,
          decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(2))),
        const SizedBox(width: 8),
        const Text('Services Offered', style: TextStyle(color: Colors.white,
            fontWeight: FontWeight.w800, fontSize: 15)),
      ]),
      const SizedBox(height: 12),
      ..._services.map((s) => Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: (s['color'] as Color).withValues(alpha: 0.3))),
        child: Row(children: [
          Container(width: 42, height: 42,
            decoration: BoxDecoration(
              color: (s['color'] as Color).withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(11)),
            child: Icon(s['icon'] as IconData, color: s['color'] as Color, size: 22)),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(s['name'] as String, style: const TextStyle(color: Colors.white,
                fontWeight: FontWeight.w700, fontSize: 13)),
            Text(s['price'] as String, style: TextStyle(
                color: s['color'] as Color, fontSize: 11, fontWeight: FontWeight.w600)),
          ])),
          GestureDetector(
            onTap: () => _showMessage(context),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: (s['color'] as Color).withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: (s['color'] as Color).withValues(alpha: 0.4))),
              child: Text('Book', style: TextStyle(
                  color: s['color'] as Color, fontSize: 11, fontWeight: FontWeight.w700)))),
        ]))),
    ]));

  Widget _recentVideos(TravelVideo v) => Padding(
    padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Container(width: 3, height: 16,
          decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(2))),
        const SizedBox(width: 8),
        const Text('Recent Videos', style: TextStyle(color: Colors.white,
            fontWeight: FontWeight.w800, fontSize: 15)),
      ]),
      const SizedBox(height: 12),
      Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
        child: Row(children: [
          Container(width: 60, height: 60,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [
                AppColors.primary.withValues(alpha: 0.4),
                AppColors.primary.withValues(alpha: 0.1)]),
              borderRadius: BorderRadius.circular(12)),
            child: const Icon(Icons.play_circle_rounded,
                color: AppColors.primary, size: 34)),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(v.title, style: const TextStyle(color: Colors.white,
                fontWeight: FontWeight.w700, fontSize: 13)),
            const SizedBox(height: 2),
            Text(v.location, style: const TextStyle(
                color: AppColors.textMuted, fontSize: 11)),
            const SizedBox(height: 6),
            Row(children: [
              const Icon(Icons.star_rounded, color: Colors.amber, size: 13),
              const SizedBox(width: 3),
              Text(v.rating.toStringAsFixed(1),
                style: const TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.w700)),
              const SizedBox(width: 12),
              const Icon(Icons.visibility_rounded, color: AppColors.textMuted, size: 13),
              const SizedBox(width: 3),
              Text('${v.views ~/ 1000}K views',
                style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
              const SizedBox(width: 12),
              const Icon(Icons.favorite_rounded, color: Colors.redAccent, size: 13),
              const SizedBox(width: 3),
              Text('${v.likes ~/ 1000}K',
                style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
            ]),
          ])),
        ])),
    ]));

  void _showMessage(BuildContext context) {
    final ctrl = TextEditingController();
    showModalBottomSheet(context: context, isScrollControlled: true,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Container(width: 40, height: 4, margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(color: AppColors.cardBorder,
                  borderRadius: BorderRadius.circular(2))),
            Text('Message ${widget.video.uploader}', style: const TextStyle(
                color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16)),
            const SizedBox(height: 4),
            const Text('Send an inquiry about their services',
              style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
            const SizedBox(height: 20),
            Container(
              decoration: BoxDecoration(color: AppColors.bgCardMid,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.cardBorder)),
              child: TextField(controller: ctrl, maxLines: 4,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  hintText: 'Hi! I\'m interested in your services...',
                  hintStyle: TextStyle(color: AppColors.textMuted),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.all(14)))),
            const SizedBox(height: 16),
            SizedBox(width: double.infinity, height: 48,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text('Message sent to ${widget.video.uploader}!'),
                    backgroundColor: AppColors.primary,
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))));
                },
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12))),
                child: const Text('Send Message',
                    style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: Colors.white)))),
            const SizedBox(height: 8),
          ]))));
  }
}

// ── Comments Sheet ────────────────────────────────────────────────────────────
class _CommentsSheet extends StatefulWidget {
  final TravelVideo video;
  const _CommentsSheet({required this.video});
  @override State<_CommentsSheet> createState() => _CommentsSheetState();
}
class _CommentsSheetState extends State<_CommentsSheet> {
  final _ctrl = TextEditingController();
  final List<Map<String, String>> _comments = [];
  @override
  void initState() {
    super.initState();
    _comments.addAll(widget.video.userRatings.map((r) => {'user': 'Traveler', 'text': r}));
    _comments.addAll([
      {'user': 'Explorer01', 'text': 'This place is absolutely stunning!'},
      {'user': 'TravelFan', 'text': 'Adding this to my bucket list right now!'},
      {'user': 'Nomad_Pierre', 'text': 'Visited last month, 100% recommend!'},
    ]);
  }
  @override void dispose() { _ctrl.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) => Padding(
    padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
    child: SizedBox(height: MediaQuery.of(context).size.height * 0.65,
      child: Column(children: [
        Container(margin: const EdgeInsets.only(top: 10, bottom: 4),
          width: 40, height: 4,
          decoration: BoxDecoration(color: AppColors.cardBorder,
              borderRadius: BorderRadius.circular(2))),
        Padding(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(children: [
            Text('Comments (${_comments.length})', style: const TextStyle(
                color: AppColors.textDark, fontWeight: FontWeight.w700, fontSize: 16)),
            const Spacer(),
            IconButton(icon: const Icon(Icons.close_rounded, color: AppColors.textGrey),
                onPressed: () => Navigator.pop(context)),
          ])),
        Expanded(child: ListView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          itemCount: _comments.length,
          itemBuilder: (_, i) {
            final c = _comments[i];
            return Padding(padding: const EdgeInsets.only(bottom: 14),
              child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                CircleAvatar(radius: 16,
                    backgroundColor: AppColors.primary.withValues(alpha: 0.2),
                    child: Text(c['user']![0], style: const TextStyle(
                        color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 12))),
                const SizedBox(width: 10),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(c['user']!, style: const TextStyle(color: AppColors.primary,
                      fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 3),
                  Text(c['text']!, style: const TextStyle(
                      color: AppColors.textDark, fontSize: 13)),
                ])),
              ]));
          })),
        Container(
          padding: const EdgeInsets.fromLTRB(12, 8, 12, 16),
          decoration: BoxDecoration(color: AppColors.bgCardLight,
            border: Border(top: BorderSide(
                color: AppColors.cardBorder.withValues(alpha: 0.4)))),
          child: Row(children: [
            Expanded(child: TextField(controller: _ctrl,
              style: const TextStyle(color: AppColors.textDark, fontSize: 13),
              decoration: const InputDecoration(
                hintText: 'Add a comment...',
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 8)))),
            GestureDetector(
              onTap: () {
                if (_ctrl.text.trim().isEmpty) return;
                setState(() {
                  _comments.add({'user': 'You', 'text': _ctrl.text.trim()});
                  _ctrl.clear();
                });
              },
              child: Container(width: 38, height: 38,
                decoration: BoxDecoration(color: AppColors.primary,
                    borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.send_rounded,
                    color: AppColors.textDark, size: 18))),
          ])),
      ])));
}

// ── Video Search ──────────────────────────────────────────────────────────────
class _VideoSearchScreen extends StatefulWidget {
  final List<TravelVideo> videos;
  const _VideoSearchScreen({required this.videos});
  @override State<_VideoSearchScreen> createState() => _VideoSearchScreenState();
}
class _VideoSearchScreenState extends State<_VideoSearchScreen> {
  final _ctrl = TextEditingController();
  String _q = '';
  @override void dispose() { _ctrl.dispose(); super.dispose(); }
  List<TravelVideo> get _res => widget.videos.where((v) =>
    v.title.toLowerCase().contains(_q.toLowerCase()) ||
    v.location.toLowerCase().contains(_q.toLowerCase()) ||
    v.category.toLowerCase().contains(_q.toLowerCase())).toList();
  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: AppColors.bgDark,
    body: SafeArea(child: Column(children: [
      Padding(padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
        child: Row(children: [
          GestureDetector(onTap: () => Navigator.pop(context),
            child: const Icon(Icons.arrow_back_rounded, color: AppColors.textDark)),
          const SizedBox(width: 12),
          Expanded(child: Container(
            decoration: BoxDecoration(color: AppColors.bgCard,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.cardBorder)),
            child: TextField(controller: _ctrl, autofocus: true,
              style: const TextStyle(color: AppColors.textDark),
              onChanged: (v) => setState(() => _q = v),
              decoration: const InputDecoration(
                hintText: 'Search videos, places...',
                prefixIcon: Icon(Icons.search_rounded, color: AppColors.primary),
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(vertical: 14))))),
        ])),
      Expanded(child: _q.isEmpty
        ? Center(child: Text('Search for travel videos',
            style: TextStyle(color: AppColors.textGrey)))
        : _res.isEmpty
          ? Center(child: Text('No results for "$_q"',
              style: const TextStyle(color: AppColors.textGrey)))
          : ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _res.length,
              itemBuilder: (_, i) {
                final v = _res[i];
                return GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(color: AppColors.bgCard,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.4))),
                    child: Row(children: [
                      Container(width: 48, height: 48,
                        decoration: BoxDecoration(color: AppColors.bgCardLight,
                          borderRadius: BorderRadius.circular(12)),
                        child: const Icon(Icons.play_circle_rounded,
                            color: AppColors.primary, size: 28)),
                      const SizedBox(width: 12),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(v.title, style: const TextStyle(color: AppColors.textDark,
                            fontSize: 13, fontWeight: FontWeight.w700)),
                        Text(v.location, style: const TextStyle(
                            color: AppColors.textGrey, fontSize: 11)),
                      ])),
                      Row(children: [
                        const Icon(Icons.star_rounded, color: AppColors.amber, size: 13),
                        Text(v.rating.toString(),
                          style: const TextStyle(color: AppColors.amber, fontSize: 11)),
                      ]),
                    ])));
              })),
    ])));
}
