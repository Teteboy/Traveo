import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../widgets/common_widgets.dart';
import '../pro/notifications_screen.dart';
import '../pro/settings_screen.dart';
import '../discover/discover_screen.dart';

// ── Pro video model ────────────────────────────────────────────────────────
class ProVideo {
  final String id, category, date;
  String title, location;
  int likes, views;
  double rating;
  String status; // 'Published' | 'Draft' | 'Processing' | 'Rejected'
  ProVideo({required this.id, required this.title, required this.location,
    required this.category, required this.date, required this.likes,
    required this.views, required this.rating, required this.status});
}

// ── Pro photo model ────────────────────────────────────────────────────────
class ProPhoto {
  final String id, category, date;
  String title, location, caption;
  int likes, views;
  String status;
  ProPhoto({required this.id, required this.title, required this.location,
    required this.caption, required this.category, required this.date,
    required this.likes, required this.views, required this.status});
}

// ── Screen ─────────────────────────────────────────────────────────────────
class VideoUploadScreen extends StatefulWidget {
  const VideoUploadScreen({super.key});
  @override State<VideoUploadScreen> createState() => _VideoUploadScreenState();
}

class _VideoUploadScreenState extends State<VideoUploadScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tab;
  int _mediaType = 0; // 0=video, 1=photo, 2=live

  final List<ProVideo> _myVideos = [
    ProVideo(id:'pv1', title:'Kribi Beach Sunset Guide & Experience', location:'Kribi, Cameroon',
      category:'Beach', date:'Feb 28, 2026', likes:3200, views:45000,
      rating:5.0, status:'Published'),
    ProVideo(id:'pv2', title:'Mount Cameroon Trek Day 1', location:'Buea, Cameroon',
      category:'Restaurant', date:'Mar 1, 2026', likes:890, views:9800,
      rating:4.0, status:'Published'),
    ProVideo(id:'pv3', title:'Yaoundé Street Food Guide', location:'Yaoundé, Cameroon',
      category:'Culture', date:'Mar 3, 2026', likes:0, views:0,
      rating:0.0, status:'Draft'),
  ];

  final List<ProPhoto> _myPhotos = [
    ProPhoto(id:'pp1', title:'Kribi Golden Hour', location:'Kribi, Cameroon',
      caption:'Golden hour at Kribi beach — one of Cameroon\'s most beautiful sunsets 🌅',
      category:'Beach', date:'Mar 5, 2026', likes:1800, views:22000, status:'Published'),
    ProPhoto(id:'pp2', title:'Yaoundé Skyline', location:'Yaoundé, Cameroon',
      caption:'The capital city from above — breathtaking!',
      category:'City', date:'Mar 8, 2026', likes:940, views:11000, status:'Published'),
  ];

  final _titleCtrl    = TextEditingController();
  final _locationCtrl = TextEditingController();
  final _descCtrl     = TextEditingController();
  final _captionCtrl  = TextEditingController();
  final _liveTitleCtrl = TextEditingController();
  final _liveLocCtrl   = TextEditingController();
  String _selectedCategory = 'City';
  bool   _isUploading  = false;
  double _uploadProgress = 0;
  bool   _isLive = false;
  int    _liveSeconds = 0;
  bool   _fileSelected  = false;
  String _fileName      = '';
  String _fileDuration  = '';
  String _fileSize      = '';
  bool   _fileError     = false;
  String _fileErrorMsg  = '';

  final _categories = ['City', 'Beach', 'Restaurant', 'Wildlife', 'Culture', 'Hotel', 'Fine Dining'];

  @override
  void initState() { super.initState(); _tab = TabController(length: 2, vsync: this); }

  @override
  void dispose() {
    _tab.dispose(); _titleCtrl.dispose(); _locationCtrl.dispose();
    _descCtrl.dispose(); _captionCtrl.dispose();
    _liveTitleCtrl.dispose(); _liveLocCtrl.dispose();
    super.dispose();
  }

  void _pickVideo(StateSetter setLocal) {
    final scenarios = [
      {'name':'beach_tour.mp4',   'duration':'1:32','sizeMB':48.0,  'ok':true},
      {'name':'kribi_sunset.mp4', 'duration':'1:45','sizeMB':62.0,  'ok':true},
      {'name':'long_doc.mp4',     'duration':'3:12','sizeMB':210.0, 'ok':false,
       'err':'Video exceeds 1:45. Please trim to under 1 minute 45 seconds.'},
    ];
    final pick = scenarios[_myVideos.length % scenarios.length];
    final ok = pick['ok'] as bool;
    setLocal(() {
      _fileSelected=true; _fileName=pick['name'] as String;
      _fileDuration=pick['duration'] as String;
      _fileSize='${(pick['sizeMB'] as double).toStringAsFixed(1)} MB';
      _fileError=!ok; _fileErrorMsg=ok?'':(pick['err'] as String);
    });
  }

  void _pickPhoto(StateSetter setLocal) {
    final demos = ['kribi_beach.jpg','yaoundé_skyline.jpg','douala_market.jpg'];
    final name = demos[_myPhotos.length % demos.length];
    setLocal(() {
      _fileSelected=true; _fileName=name; _fileDuration='';
      _fileSize='${(1.8 + _myPhotos.length * 0.4).toStringAsFixed(1)} MB';
      _fileError=false; _fileErrorMsg='';
    });
  }

  void _clearFile(StateSetter setLocal) => setLocal(() {
    _fileSelected=false; _fileName=''; _fileDuration='';
    _fileSize=''; _fileError=false; _fileErrorMsg='';
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Column(children: [
        _header(),
        Container(color: AppColors.bgCard,
          child: TabBar(controller: _tab,
            indicatorColor: AppColors.primary, indicatorWeight: 3,
            labelColor: AppColors.primary, unselectedLabelColor: AppColors.textGrey,
            labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
            tabs: const [Tab(text: 'My Media'), Tab(text: 'Upload / Go Live')])),
        Expanded(child: TabBarView(controller: _tab, children: [
          _myMediaTab(),
          _uploadTab(),
        ])),
      ]),
    );
  }

  Widget _header() => Container(
    color: AppColors.bgDark,
    child: SafeArea(bottom: false, child: Padding(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
      child: Row(children: [
        const TraveoLogoWidget(),
        const Spacer(),
        GestureDetector(onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SettingsScreen())),
          child: Container(width: 40, height: 40,
            decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.cardBorder)),
            child: const Icon(Icons.settings_rounded, color: AppColors.textGrey, size: 20))),
        const SizedBox(width: 8),
        GestureDetector(onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen())),
          child: Stack(children: [
            Container(width: 40, height: 40,
              decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.cardBorder)),
              child: const Icon(Icons.notifications_rounded, color: AppColors.textGrey, size: 20)),
            Positioned(top: 2, right: 2, child: Container(padding: const EdgeInsets.all(3),
              decoration: const BoxDecoration(color: Colors.orange, shape: BoxShape.circle),
              child: const Text('2', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)))),
          ])),
      ]))));

  // ── TAB 1: My Media ───────────────────────────────────────────────────────
  Widget _myMediaTab() {
    return DefaultTabController(
      length: 2,
      child: Column(children: [
        Container(color: AppColors.bgCard,
          child: const TabBar(
            indicatorColor: Color(0xFF7C3AED),
            labelColor: Color(0xFF7C3AED),
            unselectedLabelColor: AppColors.textGrey,
            labelStyle: TextStyle(fontWeight: FontWeight.w700, fontSize: 12),
            tabs: [Tab(text: 'Videos'), Tab(text: 'Photos')])),
        Expanded(child: TabBarView(children: [
          _videosSubTab(),
          _photosSubTab(),
        ])),
      ]));
  }

  Widget _videosSubTab() {
    final published  = _myVideos.where((v) => v.status == 'Published').length;
    final draft      = _myVideos.where((v) => v.status == 'Draft').length;
    final processing = _myVideos.where((v) => v.status == 'Processing').length;
    return ListView(padding: const EdgeInsets.all(16), children: [
      Row(children: [
        _statChip('Published', published, AppColors.primary),
        const SizedBox(width: 8),
        _statChip('Draft', draft, Colors.orange),
        const SizedBox(width: 8),
        _statChip('Processing', processing, Colors.blue),
      ]),
      const SizedBox(height: 16),
      Container(padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [Color(0xFF0D3B22), Color(0xFF1A5C38)]),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.primary.withValues(alpha: 0.3))),
        child: Row(children: [
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Total Views', style: TextStyle(color: AppColors.textGrey, fontSize: 12)),
            const SizedBox(height: 4),
            Text(_fmt(_myVideos.fold(0, (s, v) => s + v.views)),
              style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w900, fontSize: 28)),
          ]),
          const Spacer(),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text(_fmt(_myVideos.fold(0, (s, v) => s + v.likes)),
              style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w900, fontSize: 22)),
            const Text('total likes', style: TextStyle(color: AppColors.textGrey, fontSize: 11)),
          ]),
        ])),
      const SizedBox(height: 16),
      ..._myVideos.map((v) => _videoTile(v)),
    ]);
  }

  Widget _photosSubTab() {
    return ListView(padding: const EdgeInsets.all(16), children: [
      Container(padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [Color(0xFF1A1A3D), Color(0xFF2D1B69)]),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFF7C3AED).withValues(alpha: 0.3))),
        child: Row(children: [
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Total Photos', style: TextStyle(color: AppColors.textGrey, fontSize: 12)),
            const SizedBox(height: 4),
            Text('${_myPhotos.length}', style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w900, fontSize: 28)),
          ]),
          const Spacer(),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text(_fmt(_myPhotos.fold(0, (s, p) => s + p.likes)),
              style: const TextStyle(color: Color(0xFF7C3AED), fontWeight: FontWeight.w900, fontSize: 22)),
            const Text('total likes', style: TextStyle(color: AppColors.textGrey, fontSize: 11)),
          ]),
        ])),
      const SizedBox(height: 16),
      ..._myPhotos.map((p) => _photoTile(p)),
    ]);
  }

  Widget _photoTile(ProPhoto p) => Container(
    margin: const EdgeInsets.only(bottom: 12),
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(16),
      border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.5))),
    child: Column(children: [
      Row(children: [
        Container(width: 70, height: 52,
          decoration: BoxDecoration(color: const Color(0xFF7C3AED).withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(10)),
          child: const Icon(Icons.photo_rounded, color: Color(0xFF7C3AED), size: 28)),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(p.title, style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w700, fontSize: 13),
            maxLines: 1, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 3),
          Row(children: [
            const Icon(Icons.location_on_rounded, color: AppColors.textGrey, size: 11),
            const SizedBox(width: 2),
            Text(p.location, style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
          ]),
        ])),
        Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(20)),
          child: Text(p.status, style: const TextStyle(color: AppColors.primary, fontSize: 10, fontWeight: FontWeight.w700))),
      ]),
      const SizedBox(height: 8),
      Container(width: double.infinity, padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(color: AppColors.bgDark, borderRadius: BorderRadius.circular(10),
          border: Border.all(color: const Color(0xFF7C3AED).withValues(alpha: 0.2))),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Caption:', style: TextStyle(color: Color(0xFF7C3AED), fontSize: 10, fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Text(p.caption, style: const TextStyle(color: AppColors.textGrey, fontSize: 12, height: 1.4),
            maxLines: 2, overflow: TextOverflow.ellipsis),
        ])),
      const SizedBox(height: 8),
      Row(children: [
        _sr(Icons.visibility_rounded, _fmt(p.views)),
        const SizedBox(width: 16),
        _sr(Icons.favorite_rounded, _fmt(p.likes), color: Colors.red),
        const Spacer(),
        _pill('Edit', const Color(0xFF7C3AED), () {}),
        const SizedBox(width: 8),
        _pill('Delete', Colors.red, () => setState(() => _myPhotos.removeWhere((x) => x.id == p.id))),
      ]),
    ]));

  // ── TAB 2: Upload / Live ──────────────────────────────────────────────────
  Widget _uploadTab() => StatefulBuilder(builder: (ctx, setLocal) {
    return SingleChildScrollView(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      _label('What would you like to post?'),
      Row(children: [
        _mediaTypeBtn(setLocal, 0, Icons.video_call_rounded, 'Video', AppColors.primary),
        const SizedBox(width: 10),
        _mediaTypeBtn(setLocal, 1, Icons.photo_camera_rounded, 'Photo', const Color(0xFF7C3AED)),
        const SizedBox(width: 10),
        _mediaTypeBtn(setLocal, 2, Icons.live_tv_rounded, 'Go Live', Colors.red),
      ]),
      const SizedBox(height: 20),
      if (_mediaType == 0) _videoUploadForm(setLocal),
      if (_mediaType == 1) _photoUploadForm(setLocal),
      if (_mediaType == 2) _liveSection(setLocal),
    ]));
  });

  Widget _mediaTypeBtn(StateSetter setLocal, int type, IconData icon, String label, Color color) {
    final active = _mediaType == type;
    return Expanded(child: GestureDetector(
      onTap: () => setLocal(() { _mediaType = type; _clearFile(setLocal); }),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: active ? color.withValues(alpha: 0.15) : AppColors.bgCard,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: active ? color : AppColors.cardBorder, width: active ? 2 : 1)),
        child: Column(children: [
          Icon(icon, color: active ? color : AppColors.textGrey, size: 26),
          const SizedBox(height: 6),
          Text(label, style: TextStyle(color: active ? color : AppColors.textGrey,
            fontWeight: FontWeight.w700, fontSize: 12)),
        ]))));
  }

  Widget _videoUploadForm(StateSetter setLocal) => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    Container(padding: const EdgeInsets.all(14), margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.25))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Row(children: [
          Icon(Icons.info_outline_rounded, color: AppColors.primary, size: 16),
          SizedBox(width: 8),
          Text('Video Requirements', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 13)),
        ]),
        const SizedBox(height: 10),
        _reqRow(Icons.timer_rounded, 'Max duration: 1 min 45 sec'),
        _reqRow(Icons.sd_card_rounded, 'Formats: MP4, MOV'),
        _reqRow(Icons.photo_camera_rounded, 'Min resolution: 720p'),
      ])),
    _filePicker(setLocal, isVideo: true),
    const SizedBox(height: 16),
    _label('Video Title'),
    _formField('e.g. Kribi Beach Sunset Guide & Experience', _titleCtrl),
    _label('Location'),
    _formField('e.g. Kribi, Cameroon', _locationCtrl),
    _label('Description'),
    _multilineField('Tell viewers what this video is about...', _descCtrl),
    _label('Category'),
    _categoriesRow(setLocal),
    const SizedBox(height: 20),
    if (_isUploading) _progressBar(),
    _actionButtons(setLocal, isVideo: true),
    const SizedBox(height: 24),
  ]);

  Widget _photoUploadForm(StateSetter setLocal) => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    _filePicker(setLocal, isVideo: false),
    const SizedBox(height: 16),
    _label('Photo Title'),
    _formField('e.g. Kribi Golden Hour', _titleCtrl),
    _label('Location'),
    _formField('e.g. Kribi, Cameroon', _locationCtrl),
    _label('Caption'),
    _multilineField('Write a caption for your photo... (shown to all viewers)', _captionCtrl),
    _label('Category'),
    _categoriesRow(setLocal),
    const SizedBox(height: 20),
    if (_isUploading) _progressBar(),
    _actionButtons(setLocal, isVideo: false),
    const SizedBox(height: 24),
  ]);

  Widget _liveSection(StateSetter setLocal) => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
    Container(padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [
          Colors.red.withValues(alpha: 0.3),
          const Color(0xFF1A0000)]),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.red.withValues(alpha: 0.5))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          const Icon(Icons.live_tv_rounded, color: Colors.red, size: 22),
          const SizedBox(width: 8),
          const Text('Live Video', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16)),
          const Spacer(),
          if (_isLive)
            Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(20)),
              child: Row(children: [
                Container(width: 7, height: 7, decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle)),
                const SizedBox(width: 5),
                const Text('LIVE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 11)),
              ])),
        ]),
        const SizedBox(height: 8),
        const Text('Record and stream live to your audience. When you stop, the video is automatically posted under your services.',
          style: TextStyle(color: Colors.white60, fontSize: 12, height: 1.5)),
        if (_isLive) ...[
          const SizedBox(height: 14),
          Container(padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: Colors.black45, borderRadius: BorderRadius.circular(12)),
            child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
              const Icon(Icons.videocam_rounded, color: Colors.red, size: 18),
              const SizedBox(width: 10),
              Text(_fmtDuration(_liveSeconds),
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 26, letterSpacing: 3)),
            ])),
        ],
      ])),
    const SizedBox(height: 20),
    if (!_isLive) ...[
      _label('Live Title'),
      _formField('e.g. Live Tour of Kribi Beach', _liveTitleCtrl),
      _label('Location'),
      _formField('e.g. Kribi, Cameroon', _liveLocCtrl),
      _label('Category'),
      _categoriesRow(setLocal),
      const SizedBox(height: 20),
    ],
    SizedBox(width: double.infinity, height: 52,
      child: ElevatedButton(
        onPressed: () => setLocal(() {
          if (!_isLive) {
            _isLive = true;
            _simulateLive(setLocal);
          } else {
            _isLive = false;
            final secs = _liveSeconds;
            _liveSeconds = 0;
            final title = _liveTitleCtrl.text.isEmpty ? 'Live Stream' : _liveTitleCtrl.text;
            setState(() => _myVideos.add(ProVideo(
              id: 'pv${DateTime.now().millisecondsSinceEpoch}',
              title: title, location: _liveLocCtrl.text.isEmpty ? 'Cameroon' : _liveLocCtrl.text,
              category: _selectedCategory, date: 'Mar ${11 + secs % 10}, 2026',
              likes: 0, views: 0, rating: 0.0, status: 'Published')));
            _tab.animateTo(0);
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
              content: Text('"$title" saved & posted!'),
              backgroundColor: AppColors.bgCard));
          }
        }),
        style: ElevatedButton.styleFrom(
          backgroundColor: _isLive ? const Color(0xFF8B0000) : Colors.red,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(_isLive ? Icons.stop_rounded : Icons.fiber_manual_record_rounded, color: Colors.white, size: 22),
          const SizedBox(width: 10),
          Text(_isLive ? 'Stop & Post Live Video' : 'Start Live Recording',
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: Colors.white)),
        ]))),
    const SizedBox(height: 24),
  ]);

  void _simulateLive(StateSetter setLocal) async {
    while (_isLive && mounted) {
      await Future.delayed(const Duration(seconds: 1));
      if (mounted && _isLive) setLocal(() => _liveSeconds++);
    }
  }

  String _fmtDuration(int secs) {
    final m = (secs ~/ 60).toString().padLeft(2, '0');
    final s = (secs % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  Widget _filePicker(StateSetter setLocal, {required bool isVideo}) {
    final color = isVideo ? AppColors.primary : const Color(0xFF7C3AED);
    return GestureDetector(
      onTap: _fileSelected ? null : () => isVideo ? _pickVideo(setLocal) : _pickPhoto(setLocal),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        height: _fileSelected ? null : 150,
        width: double.infinity,
        padding: _fileSelected ? const EdgeInsets.all(16) : EdgeInsets.zero,
        decoration: BoxDecoration(
          color: _fileError ? Colors.red.withValues(alpha: 0.06)
            : _fileSelected ? color.withValues(alpha: 0.06)
            : AppColors.bgCard,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: _fileError ? Colors.red.withValues(alpha: 0.5)
            : _fileSelected ? color.withValues(alpha: 0.5)
            : color.withValues(alpha: 0.4), width: 2)),
        child: _fileSelected
          ? _selectedFileCard(setLocal, isVideo: isVideo)
          : Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Container(width: 52, height: 52,
                decoration: BoxDecoration(color: color.withValues(alpha: 0.12), shape: BoxShape.circle),
                child: Icon(isVideo ? Icons.video_call_rounded : Icons.add_photo_alternate_rounded,
                  color: color, size: 30)),
              const SizedBox(height: 10),
              Text('Tap to select ${isVideo ? "video" : "photo"}',
                style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w700, fontSize: 14)),
              const SizedBox(height: 4),
              Text(isVideo ? 'Max 1 min 45 sec · MP4 or MOV' : 'JPG, PNG · Max 10 MB',
                style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
            ])));
  }

  Widget _selectedFileCard(StateSetter setLocal, {required bool isVideo}) {
    final color = isVideo ? AppColors.primary : const Color(0xFF7C3AED);
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Container(width: 52, height: 52,
          decoration: BoxDecoration(color: (_fileError ? Colors.red : color).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
          child: Icon(_fileError ? Icons.error_rounded : (isVideo ? Icons.videocam_rounded : Icons.photo_rounded),
            color: _fileError ? Colors.red : color, size: 28)),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(_fileName, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13),
            maxLines: 1, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 4),
          Row(children: [
            if (_fileDuration.isNotEmpty) ...[
              _tagChip(Icons.timer_rounded, _fileDuration, _fileError ? Colors.red : color),
              const SizedBox(width: 8),
            ],
            _tagChip(Icons.sd_card_rounded, _fileSize, AppColors.textGrey),
          ]),
        ])),
        GestureDetector(onTap: () => _clearFile(setLocal),
          child: const Icon(Icons.close_rounded, color: AppColors.textGrey, size: 22)),
      ]),
      if (_fileError) ...[
        const SizedBox(height: 10),
        Container(padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(color: Colors.red.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: Colors.red.withValues(alpha: 0.3))),
          child: Row(children: [
            const Icon(Icons.warning_rounded, color: Colors.red, size: 16),
            const SizedBox(width: 8),
            Expanded(child: Text(_fileErrorMsg, style: const TextStyle(color: Colors.red, fontSize: 12))),
          ])),
      ] else ...[
        const SizedBox(height: 10),
        Container(padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(color: color.withValues(alpha: 0.07), borderRadius: BorderRadius.circular(10)),
          child: Row(children: [
            Icon(Icons.check_circle_rounded, color: color, size: 15),
            const SizedBox(width: 8),
            Text('${isVideo ? "Video" : "Photo"} ready to upload',
              style: TextStyle(color: color, fontSize: 12)),
          ])),
      ],
    ]);
  }

  Widget _categoriesRow(StateSetter setLocal) => Padding(
    padding: const EdgeInsets.only(bottom: 4),
    child: SingleChildScrollView(scrollDirection: Axis.horizontal,
      child: Row(children: _categories.map((cat) {
        final active = cat == _selectedCategory;
        return GestureDetector(onTap: () => setLocal(() => _selectedCategory = cat),
          child: Container(margin: const EdgeInsets.only(right: 10),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: active ? AppColors.primary : Colors.transparent,
              borderRadius: BorderRadius.circular(30),
              border: Border.all(color: active ? AppColors.primary : AppColors.cardBorder)),
            child: Text(cat, style: TextStyle(color: active ? Colors.white : AppColors.textGrey,
              fontWeight: FontWeight.w600, fontSize: 13))));
      }).toList())));

  Widget _progressBar() => Container(
    margin: const EdgeInsets.only(bottom: 16),
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(14)),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        const Icon(Icons.upload_rounded, color: AppColors.primary, size: 18),
        const SizedBox(width: 8),
        Text('Uploading... ${(_uploadProgress * 100).toInt()}%',
          style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w600)),
        const Spacer(),
        Text(_fileName, style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
      ]),
      const SizedBox(height: 10),
      ClipRRect(borderRadius: BorderRadius.circular(10),
        child: LinearProgressIndicator(value: _uploadProgress,
          backgroundColor: AppColors.bgCardLight,
          valueColor: const AlwaysStoppedAnimation(AppColors.primary), minHeight: 8)),
    ]));

  Widget _actionButtons(StateSetter setLocal, {required bool isVideo}) => Row(children: [
    Expanded(child: OutlinedButton(
      onPressed: _isUploading ? null : () {
        setState(() => _myVideos.add(ProVideo(
          id: 'pv${DateTime.now().millisecondsSinceEpoch}',
          title: _titleCtrl.text.isEmpty ? 'Untitled Draft' : _titleCtrl.text,
          location: _locationCtrl.text.isEmpty ? 'Unknown' : _locationCtrl.text,
          category: _selectedCategory, date: 'Mar 11, 2026',
          likes: 0, views: 0, rating: 0.0, status: 'Draft')));
        _tab.animateTo(0);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Saved as draft'), backgroundColor: AppColors.bgCard));
      },
      style: OutlinedButton.styleFrom(side: const BorderSide(color: AppColors.cardBorder),
        foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
      child: const Text('Save Draft', style: TextStyle(fontWeight: FontWeight.w700)))),
    const SizedBox(width: 12),
    Expanded(child: ElevatedButton(
      onPressed: (_isUploading || _fileError) ? null : () async {
        if (!_fileSelected) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text('Please select a ${isVideo ? "video" : "photo"} first'),
            backgroundColor: Colors.red)); return;
        }
        if (_titleCtrl.text.isEmpty || _locationCtrl.text.isEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Please fill in title and location'), backgroundColor: Colors.red)); return;
        }
        setLocal(() { _isUploading = true; _uploadProgress = 0; });
        for (int i = 1; i <= 20; i++) {
          await Future.delayed(const Duration(milliseconds: 150));
          if (mounted) setLocal(() => _uploadProgress = i / 20);
        }
        if (!mounted) return;
        if (isVideo) {
          globalUploadedVideos.add(TravelVideo(
            id: 'pv${DateTime.now().millisecondsSinceEpoch}',
            title: _titleCtrl.text, location: _locationCtrl.text,
            uploader: 'Horizon Travel Agency', uploaderHandle: 'horizontravel',
            category: _selectedCategory, likes: 0, comments: 0, views: 0,
            rating: 0.0, isPro: true));
          setState(() => _myVideos.add(ProVideo(
            id: 'pv${DateTime.now().millisecondsSinceEpoch}',
            title: _titleCtrl.text, location: _locationCtrl.text,
            category: _selectedCategory, date: 'Mar 11, 2026',
            likes: 0, views: 0, rating: 0.0, status: 'Processing')));
        } else {
          setState(() => _myPhotos.add(ProPhoto(
            id: 'pp${DateTime.now().millisecondsSinceEpoch}',
            title: _titleCtrl.text, location: _locationCtrl.text,
            caption: _captionCtrl.text.isEmpty ? 'No caption added' : _captionCtrl.text,
            category: _selectedCategory, date: 'Mar 11, 2026',
            likes: 0, views: 0, status: 'Published')));
        }
        setLocal(() { _isUploading = false; _uploadProgress = 0; _fileSelected = false; _fileName = ''; });
        _titleCtrl.clear(); _locationCtrl.clear(); _descCtrl.clear(); _captionCtrl.clear();
        _tab.animateTo(0);
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('${isVideo ? "Video" : "Photo"} uploaded successfully!'),
          backgroundColor: AppColors.bgCard));
      },
      style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary,
        padding: const EdgeInsets.symmetric(vertical: 14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
      child: Text('Publish ${isVideo ? "Video" : "Photo"}',
        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)))),
  ]);

  Widget _statChip(String label, int count, Color color) => Expanded(child: Container(
    padding: const EdgeInsets.symmetric(vertical: 10),
    decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12),
      border: Border.all(color: color.withValues(alpha: 0.3))),
    child: Column(children: [
      Text('$count', style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 20)),
      Text(label, style: const TextStyle(color: AppColors.textGrey, fontSize: 10)),
    ])));

  Widget _videoTile(ProVideo v) {
    final statusColor = v.status == 'Published' ? AppColors.primary
        : v.status == 'Processing' ? Colors.blue
        : v.status == 'Rejected' ? Colors.red : Colors.orange;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.5))),
      child: Column(children: [
        Row(children: [
          Container(width: 70, height: 52,
            decoration: BoxDecoration(color: AppColors.bgCardLight, borderRadius: BorderRadius.circular(10),
              gradient: LinearGradient(colors: _catGradient(v.category))),
            child: Icon(_catIcon(v.category), color: AppColors.textDark.withValues(alpha: 0.3), size: 28)),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(v.title, style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w700, fontSize: 13),
              maxLines: 1, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 3),
            Row(children: [
              const Icon(Icons.location_on_rounded, color: AppColors.textGrey, size: 11),
              const SizedBox(width: 2),
              Text(v.location, style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
            ]),
          ])),
          Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(20)),
            child: Text(v.status, style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.w700))),
        ]),
        if (v.status == 'Published') ...[
          const SizedBox(height: 10),
          Row(children: [
            _sr(Icons.visibility_rounded, _fmt(v.views)),
            const SizedBox(width: 16),
            _sr(Icons.favorite_rounded, _fmt(v.likes), color: Colors.red),
            const Spacer(),
            _pill('Edit', AppColors.primary, () {}),
            const SizedBox(width: 8),
            _pill('Delete', Colors.red, () => setState(() => _myVideos.removeWhere((x) => x.id == v.id))),
          ]),
        ],
        if (v.status == 'Draft') ...[
          const SizedBox(height: 10),
          Row(children: [
            Text('Saved ${v.date}', style: const TextStyle(color: AppColors.textGrey, fontSize: 11)),
            const Spacer(),
            _pill('Continue', AppColors.primary, () => _tab.animateTo(1)),
            const SizedBox(width: 8),
            _pill('Delete', Colors.red, () => setState(() => _myVideos.removeWhere((x) => x.id == v.id))),
          ]),
        ],
        if (v.status == 'Processing') ...[
          const SizedBox(height: 10),
          Row(children: [
            const Icon(Icons.hourglass_top_rounded, color: Colors.blue, size: 13),
            const SizedBox(width: 4),
            const Text('Processing...', style: TextStyle(color: Colors.blue, fontSize: 11)),
            const Spacer(),
            _pill('Delete', Colors.red, () => setState(() => _myVideos.removeWhere((x) => x.id == v.id))),
          ]),
        ],
      ]));
  }

  Widget _tagChip(IconData icon, String label, Color color) => Row(mainAxisSize: MainAxisSize.min, children: [
    Icon(icon, color: color, size: 12), const SizedBox(width: 3),
    Text(label, style: TextStyle(color: color, fontSize: 11)),
  ]);

  Widget _reqRow(IconData icon, String text) => Padding(padding: const EdgeInsets.only(bottom: 6),
    child: Row(children: [
      Icon(icon, color: AppColors.primary.withValues(alpha: 0.7), size: 14),
      const SizedBox(width: 8),
      Text(text, style: const TextStyle(color: AppColors.textGrey, fontSize: 12)),
    ]));

  Widget _label(String text) => Padding(padding: const EdgeInsets.only(bottom: 8, top: 4),
    child: Text(text, style: const TextStyle(color: AppColors.textDark, fontWeight: FontWeight.w700, fontSize: 13)));

  Widget _formField(String hint, TextEditingController ctrl) => Container(
    margin: const EdgeInsets.only(bottom: 14),
    decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(14),
      border: Border.all(color: AppColors.cardBorder)),
    child: TextField(controller: ctrl,
      style: const TextStyle(color: AppColors.textDark, fontSize: 13),
      decoration: InputDecoration(hintText: hint, hintStyle: const TextStyle(color: AppColors.textGrey),
        border: InputBorder.none, contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13))));

  Widget _multilineField(String hint, TextEditingController ctrl) => Container(
    margin: const EdgeInsets.only(bottom: 14),
    decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(14),
      border: Border.all(color: AppColors.cardBorder)),
    child: TextField(controller: ctrl, maxLines: 3,
      style: const TextStyle(color: AppColors.textDark, fontSize: 13),
      decoration: InputDecoration(hintText: hint, hintStyle: const TextStyle(color: AppColors.textGrey),
        border: InputBorder.none, contentPadding: const EdgeInsets.all(14))));

  Widget _sr(IconData icon, String val, {Color color = AppColors.textGrey}) =>
    Row(mainAxisSize: MainAxisSize.min, children: [
      Icon(icon, color: color, size: 13), const SizedBox(width: 3),
      Text(val, style: TextStyle(color: color, fontSize: 12)),
    ]);

  Widget _pill(String label, Color color, VoidCallback onTap) =>
    GestureDetector(onTap: onTap,
      child: Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withValues(alpha: 0.3))),
        child: Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600))));

  List<Color> _catGradient(String cat) {
    switch (cat) {
      case 'Beach':     return [const Color(0xFF006994), const Color(0xFF00C9A7)];
      case 'Restaurant': return [const Color(0xFFE53935), const Color(0xFFEF5350)];
      case 'Wildlife':  return [const Color(0xFFF59E0B), const Color(0xFFFEF3C7)];
      case 'Culture':   return [const Color(0xFF7C3AED), const Color(0xFF8B5CF6)];
      default:          return [const Color(0xFF4F46E5), const Color(0xFFEEF2FF)];
    }
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

  String _fmt(int n) => n >= 1000 ? '${(n / 1000).toStringAsFixed(1)}K' : '$n';
}
