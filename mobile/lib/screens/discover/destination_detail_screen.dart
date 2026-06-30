import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../models/destination.dart';
import '../pro/notifications_screen.dart';

class DestinationDetailScreen extends StatefulWidget {
  final Destination? destination;
  const DestinationDetailScreen({super.key, this.destination});
  @override State<DestinationDetailScreen> createState() => _State();
}

class _State extends State<DestinationDetailScreen> {
  int _liked = 0; int _disliked = 0; bool _subscribed = false;

  @override
  Widget build(BuildContext context) {
    final d = widget.destination;
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Stack(children: [
        // Full-screen image / gradient bg
        Positioned.fill(child: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(begin:Alignment.topCenter, end:Alignment.bottomCenter,
              colors:[Color(0xFF4F46E5), AppColors.bgDark])))),
        const Positioned.fill(child: Center(
          child: Icon(Icons.landscape_rounded, color:Colors.white12, size:140))),

        // Top bar
        SafeArea(child: Padding(
          padding: const EdgeInsets.symmetric(horizontal:16, vertical:10),
          child: Row(children:[
            GestureDetector(onTap:()=>Navigator.pop(context),
              child: Container(width:36, height:36,
                decoration: BoxDecoration(color:Colors.black26,
                  borderRadius:BorderRadius.circular(12)),
                child: const Icon(Icons.arrow_back_rounded, color:Colors.white, size:20))),
            const Spacer(),
            Stack(children:[
              GestureDetector(
                onTap:()=>Navigator.push(context,
                    MaterialPageRoute(builder:(_)=>const NotificationsScreen())),
                child: Container(width:36, height:36,
                  decoration: BoxDecoration(color:Colors.black26,
                    borderRadius:BorderRadius.circular(12)),
                  child: const Icon(Icons.notifications_rounded, color:Colors.white, size:20))),
              Positioned(top:2, right:2, child: Container(
                padding:const EdgeInsets.all(3),
                decoration:const BoxDecoration(color:Colors.orange, shape:BoxShape.circle),
                child:const Text('2', style:TextStyle(color:Colors.white, fontSize:7, fontWeight:FontWeight.bold)))),
            ]),
          ]))),

        // Right actions panel
        Positioned(right:0, top:120, child: Container(
          padding: const EdgeInsets.symmetric(vertical:8),
          decoration: BoxDecoration(
            color: AppColors.bgCard.withValues(alpha:0.9),
            borderRadius: const BorderRadius.horizontal(left:Radius.circular(16)),
            border: Border.all(color:AppColors.cardBorder)),
          child: Column(mainAxisSize:MainAxisSize.min, children:[
            _actionBtn(Icons.thumb_up_rounded, '${_liked}', ()=>setState(()=>_liked++)),
            _divider(),
            _actionBtn(Icons.thumb_down_rounded, '${_disliked}', ()=>setState(()=>_disliked++)),
            _divider(),
            _actionBtn(Icons.chat_bubble_outline_rounded, '', (){}),
            _divider(),
            _actionBtn(_subscribed ? Icons.notifications_active_rounded
                : Icons.add_alert_rounded,
                '', ()=>setState(()=>_subscribed=!_subscribed),
                color: _subscribed ? AppColors.primary : null),
            _divider(),
            _actionBtn(Icons.bookmark_border_rounded, '', (){}),
            _divider(),
            _actionBtn(Icons.camera_alt_rounded, '', (){}),
          ]))),

        // Bottom info
        Positioned(bottom:0, left:0, right:0, child: Container(
          padding: const EdgeInsets.fromLTRB(20,20,20,32),
          decoration: BoxDecoration(
            gradient: LinearGradient(begin:Alignment.topCenter, end:Alignment.bottomCenter,
              colors:[Colors.transparent, Colors.black.withValues(alpha:0.85)])),
          child: Column(crossAxisAlignment:CrossAxisAlignment.start, mainAxisSize:MainAxisSize.min, children:[
            Row(children:[
              Expanded(child: Text(d?.name ?? 'Agency Name',
                style:const TextStyle(color:Colors.white, fontWeight:FontWeight.w900, fontSize:24))),
              Column(crossAxisAlignment:CrossAxisAlignment.end, children:[
                const Text('3.0 Pts', style:TextStyle(color:Colors.white,
                    fontWeight:FontWeight.w800, fontSize:16)),
                Row(mainAxisSize:MainAxisSize.min,
                  children:List.generate(3,(i)=>const Icon(Icons.star_rounded,
                      color:AppColors.amber, size:14))),
              ]),
            ]),
            const SizedBox(height:8),
            Text(d?.description ?? 'Experience breathtaking landscapes and rich culture with our expert-guided tours and curated travel packages.',
              maxLines:3, overflow:TextOverflow.ellipsis,
              style:TextStyle(color:Colors.white.withValues(alpha:0.85), fontSize:13, height:1.4)),
          ]))),
      ]),
    );
  }

  Widget _actionBtn(IconData icon, String label, VoidCallback onTap, {Color? color}) =>
    GestureDetector(onTap:onTap, child: Container(
      width:48, height:44, alignment:Alignment.center,
      child: Column(mainAxisSize:MainAxisSize.min, children:[
        Icon(icon, color:color??AppColors.primary, size:22),
        if (label.isNotEmpty) Text(label, style:TextStyle(
            color:color??AppColors.textGrey, fontSize:9)),
      ])));

  Widget _divider() => Divider(height:1, color:AppColors.cardBorder.withValues(alpha:0.5), indent:8, endIndent:8);
}
