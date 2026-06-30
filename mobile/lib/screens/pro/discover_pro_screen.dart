import 'package:flutter/material.dart';
import '../../widgets/common_widgets.dart';
import '../../theme/app_theme.dart';
import 'notifications_screen.dart';
import 'settings_screen.dart';
import '../../models/destination.dart';
import '../discover/destination_detail_screen.dart';

class DiscoverProScreen extends StatefulWidget {
  const DiscoverProScreen({super.key});
  @override State<DiscoverProScreen> createState() => _State();
}

class _State extends State<DiscoverProScreen> {
  int _catIdx = 2;
  final Set<int> _liked = {};
  final _cats = const ['All','Flights','Hotels','Guides & Experiences','Restaurants'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: CustomScrollView(slivers:[
        SliverToBoxAdapter(child:_header()),
        SliverToBoxAdapter(child:_featured()),
        SliverToBoxAdapter(child:_cats_row()),
        SliverToBoxAdapter(child:_mediaRow()),
        SliverToBoxAdapter(child:_sectionTiles('Top Destinations')),
        SliverToBoxAdapter(child:_sectionTiles('Popular Now')),
        const SliverToBoxAdapter(child:SizedBox(height:20)),
      ]),
    );
  }

  Widget _header() => Container(
    color:AppColors.bgDark,
    child:SafeArea(bottom:false, child:Padding(
      padding:const EdgeInsets.fromLTRB(16,10,16,12),
      child:Row(children:[
        GestureDetector(
          onTap:()=>Navigator.push(context, MaterialPageRoute(builder:(_)=>const _SearchP())),
          child:Container(width:40, height:40,
            decoration:BoxDecoration(color:AppColors.bgCard,
              borderRadius:BorderRadius.circular(12), border:Border.all(color:AppColors.cardBorder)),
            child:const Icon(Icons.search_rounded, color:AppColors.primary, size:20))),
        const Spacer(),
        const TraveoLogoWidget(),
        const Spacer(),
        GestureDetector(
          onTap:()=>Navigator.push(context, MaterialPageRoute(builder:(_)=>const SettingsScreen())),
          child:Container(width:40, height:40,
            decoration:BoxDecoration(color:AppColors.bgCard, borderRadius:BorderRadius.circular(12),
              border:Border.all(color:AppColors.cardBorder)),
            child:const Icon(Icons.settings_rounded, color:AppColors.textGrey, size:20))),
        const SizedBox(width:8),
        GestureDetector(
          onTap:()=>Navigator.push(context, MaterialPageRoute(builder:(_)=>const NotificationsScreen())),
          child:Stack(children:[
            Container(width:40, height:40,
              decoration:BoxDecoration(color:AppColors.bgCard, borderRadius:BorderRadius.circular(12),
                border:Border.all(color:AppColors.cardBorder)),
              child:const Icon(Icons.notifications_rounded, color:AppColors.textGrey, size:20)),
            Positioned(top:2, right:2, child:Container(
              padding:const EdgeInsets.all(3),
              decoration:const BoxDecoration(color:Colors.orange, shape:BoxShape.circle),
              child:const Text('2', style:TextStyle(color:Colors.white, fontSize:8, fontWeight:FontWeight.bold)))),
          ])),
      ]))));

  Widget _featured() => SizedBox(height:220, child:PageView.builder(
    padEnds:false,
    controller:PageController(viewportFraction:0.88),
    itemCount:kDestinations.length,
    itemBuilder:(_,i){
      final d=kDestinations[i]; final liked=_liked.contains(i);
      return GestureDetector(
        onTap:()=>Navigator.push(context, MaterialPageRoute(builder:(_)=>DestinationDetailScreen(destination:d))),
        child:Container(
          margin:const EdgeInsets.fromLTRB(8,8,8,8),
          decoration:BoxDecoration(borderRadius:BorderRadius.circular(20), color:AppColors.bgCard,
            gradient:const LinearGradient(begin:Alignment.topLeft, end:Alignment.bottomRight,
              colors:[Color(0xFF1A5C80), AppColors.bgCard])),
          child:Stack(children:[
            ClipRRect(borderRadius:BorderRadius.circular(20),
              child:Container(width:double.infinity, height:double.infinity,
                color:const Color(0xFF0F3A50),
                child:Icon(d.icon, color:Colors.white24, size:80))),
            Container(decoration:BoxDecoration(borderRadius:BorderRadius.circular(20),
              gradient:LinearGradient(begin:Alignment.topCenter, end:Alignment.bottomCenter,
                colors:[Colors.transparent, Colors.black.withValues(alpha:0.7)]))),
            Positioned(bottom:12, left:14, right:14, child:Column(
              crossAxisAlignment:CrossAxisAlignment.start, mainAxisSize:MainAxisSize.min,
              children:[
                Row(children:List.generate(3,(_)=>const Icon(Icons.star_rounded, color:AppColors.amber, size:14))),
                const SizedBox(height:4),
                Text(d.name, style:const TextStyle(color:Colors.white, fontWeight:FontWeight.w800, fontSize:17)),
                Text(d.description, maxLines:2, overflow:TextOverflow.ellipsis,
                  style:TextStyle(color:Colors.white.withValues(alpha:0.8), fontSize:12)),
              ])),
            Positioned(bottom:14, right:14,
              child:GestureDetector(onTap:()=>setState(()=>liked?_liked.remove(i):_liked.add(i)),
                child:Icon(liked?Icons.favorite_rounded:Icons.favorite_border_rounded,
                  color:liked?Colors.red:Colors.white, size:28))),
          ])));
    }));

  Widget _cats_row() => Padding(
    padding:const EdgeInsets.fromLTRB(12,12,12,4),
    child:SingleChildScrollView(scrollDirection:Axis.horizontal,
      child:Row(children:_cats.asMap().entries.map((e){
        final active=e.key==_catIdx;
        return GestureDetector(onTap:()=>setState(()=>_catIdx=e.key),
          child:Container(margin:const EdgeInsets.only(right:10),
            padding:const EdgeInsets.symmetric(horizontal:18, vertical:9),
            decoration:BoxDecoration(
              color:active?AppColors.primary:Colors.transparent,
              borderRadius:BorderRadius.circular(30),
              border:Border.all(color:active?AppColors.primary:AppColors.cardBorder)),
            child:Text(e.value, style:TextStyle(
              color:active?Colors.white:AppColors.textGrey, fontWeight:FontWeight.w600, fontSize:13))));
      }).toList())));

  Widget _mediaRow() => Padding(
    padding:const EdgeInsets.fromLTRB(12,12,12,0),
    child:SizedBox(height:120,
      child:ListView.separated(
        scrollDirection:Axis.horizontal,
        itemCount:kDestinations.length,
        separatorBuilder:(_,__)=>const SizedBox(width:10),
        itemBuilder:(_,i){
          final d=kDestinations[i];
          return GestureDetector(
            onTap:()=>Navigator.push(context, MaterialPageRoute(builder:(_)=>DestinationDetailScreen(destination:d))),
            child:ClipRRect(borderRadius:BorderRadius.circular(16),
              child:Stack(children:[
                Container(width:110, height:120, color:const Color(0xFF0F3050),
                  child:Icon(d.icon, color:Colors.white38, size:40)),
                Container(width:110, height:120,
                  decoration:BoxDecoration(gradient:LinearGradient(begin:Alignment.topCenter, end:Alignment.bottomCenter,
                    colors:[Colors.transparent, Colors.black.withValues(alpha:0.7)]))),
                const Center(child:Icon(Icons.play_circle_outline_rounded, color:Colors.white54, size:32)),
                Positioned(bottom:6, left:6, right:6, child:Column(
                  crossAxisAlignment:CrossAxisAlignment.start, mainAxisSize:MainAxisSize.min,
                  children:[
                    Text(d.name, maxLines:1, overflow:TextOverflow.ellipsis,
                      style:const TextStyle(color:Colors.white, fontSize:10, fontWeight:FontWeight.w700)),
                    Text(d.category, maxLines:1, overflow:TextOverflow.ellipsis,
                      style:TextStyle(color:Colors.white.withValues(alpha:0.7), fontSize:9)),
                  ])),
              ])));
        })));

  Widget _sectionTiles(String title) => Padding(
    padding:const EdgeInsets.fromLTRB(12,20,12,0),
    child:Column(crossAxisAlignment:CrossAxisAlignment.start, children:[
      Padding(padding:const EdgeInsets.only(bottom:10),
        child:Row(children:[
          const Expanded(child:Divider(color:AppColors.cardBorder, thickness:0.5)),
          Padding(padding:const EdgeInsets.symmetric(horizontal:12),
            child:Text(title, style:const TextStyle(color:AppColors.primary, fontWeight:FontWeight.w700, fontSize:14))),
          const Expanded(child:Divider(color:AppColors.cardBorder, thickness:0.5)),
        ])),
      ...kDestinations.take(4).map((d)=>GestureDetector(
        onTap:()=>Navigator.push(context, MaterialPageRoute(builder:(_)=>DestinationDetailScreen(destination:d))),
        child:Container(
          margin:const EdgeInsets.only(bottom:10),
          padding:const EdgeInsets.symmetric(horizontal:14, vertical:12),
          decoration:BoxDecoration(color:AppColors.bgCard,
            borderRadius:BorderRadius.circular(14),
            border:Border.all(color:AppColors.cardBorder.withValues(alpha:0.4))),
          child:Row(children:[
            Container(width:48, height:48,
              decoration:BoxDecoration(color:AppColors.bgCardLight, borderRadius:BorderRadius.circular(12)),
              child:Icon(d.icon, color:AppColors.primary, size:24)),
            const SizedBox(width:12),
            Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start, children:[
              Text(d.name, style:const TextStyle(color:Colors.white, fontSize:13, fontWeight:FontWeight.w700)),
              const SizedBox(height:3),
              Text(d.description, maxLines:2, overflow:TextOverflow.ellipsis,
                style:const TextStyle(color:AppColors.textGrey, fontSize:11, height:1.3)),
            ])),
            const Icon(Icons.play_arrow_rounded, color:AppColors.textGrey, size:28),
          ])))).toList(),
    ]));
}

class _SearchP extends StatelessWidget {
  const _SearchP();
  @override Widget build(BuildContext ctx) => Scaffold(
    backgroundColor:AppColors.bgDark,
    appBar:AppBar(title:const Text('Search'), backgroundColor:AppColors.bgCard),
    body:const Padding(padding:EdgeInsets.all(16),
      child:TextField(autofocus:true,
        style:TextStyle(color:Colors.white),
        decoration:InputDecoration(hintText:'Search...',
          prefixIcon:Icon(Icons.search_rounded, color:AppColors.primary)))));
}
