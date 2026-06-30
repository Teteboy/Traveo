import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../home/home_screen.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});
  @override State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final List<Map<String, dynamic>> _notifs = [
    {'icon':Icons.flight_rounded, 'title':'Flight Reminder', 'body':'Your Yaoundé→Paris flight departs in 2 hours.', 'time':'2m ago', 'read':false},
    {'icon':Icons.local_offer_rounded, 'title':'Special Offer', 'body':'50% off hotel bookings this weekend only!', 'time':'1h ago', 'read':false},
    {'icon':Icons.check_circle_rounded, 'title':'Booking Confirmed', 'body':'Your train reservation is confirmed.', 'time':'3h ago', 'read':true},
    {'icon':Icons.star_rounded, 'title':'Review Request', 'body':'How was your trip to Douala?', 'time':'1d ago', 'read':true},
    {'icon':Icons.info_rounded, 'title':'App Update', 'body':'New features are available. Update now.', 'time':'2d ago', 'read':true},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        backgroundColor: AppColors.bgCard,
        leading: IconButton(icon:const Icon(Icons.arrow_back_rounded, color:Colors.white),
            onPressed:()=>Navigator.pop(context)),
        title: const Text('Notifications'),
        actions:[
          TextButton(onPressed:()=>setState(()=>_notifs.forEach((n)=>n['read']=true)),
            child:const Text('Mark all read', style:TextStyle(color:AppColors.primary, fontSize:12))),
        ]),
      body: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          // ── Pro replies (from userInbox) ─────────────────
          if (userInbox.isNotEmpty) ...[
            const Padding(
              padding: EdgeInsets.only(bottom: 8),
              child: Text('Messages from Providers',
                style: TextStyle(color: AppColors.primary,
                    fontWeight: FontWeight.w700, fontSize: 13))),
            ...userInbox.map((msg) => GestureDetector(
              onTap: () {
                setState(() => msg.read = true);
                _openReply(context, msg);
              },
              child: Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                      color: msg.read
                          ? AppColors.cardBorder
                          : AppColors.primary.withValues(alpha: 0.4)),
                  boxShadow: [BoxShadow(color: AppColors.cardShadow,
                      blurRadius: 4, offset: const Offset(0,2))]),
                child: Row(children: [
                  Container(width: 44, height: 44,
                    decoration: BoxDecoration(
                        color: msg.color, shape: BoxShape.circle),
                    child: Center(child: Text(msg.initials,
                      style: const TextStyle(color: Colors.white,
                          fontSize: 13, fontWeight: FontWeight.w800)))),
                  const SizedBox(width: 12),
                  Expanded(child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(msg.proName,
                      style: const TextStyle(color: AppColors.textDark,
                          fontWeight: FontWeight.w700, fontSize: 13)),
                    const SizedBox(height: 2),
                    Text(msg.proReply, maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                          color: AppColors.textGrey, fontSize: 12)),
                  ])),
                  const SizedBox(width: 8),
                  Column(children: [
                    Text(msg.time,
                      style: const TextStyle(
                          color: AppColors.textGrey, fontSize: 10)),
                    if (!msg.read) ...[
                      const SizedBox(height: 6),
                      Container(width: 8, height: 8,
                        decoration: const BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle)),
                    ],
                  ]),
                ])))),
            const Divider(height: 20, color: AppColors.cardBorder),
          ],
          // ── System notifications ──────────────────────────
          ...List.generate(_notifs.length, (i) {
            final n = _notifs[i];
            return GestureDetector(
              onTap: () => setState(() => n['read'] = true),
            child: Container(
              margin:const EdgeInsets.only(bottom:10),
              padding:const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: n['read'] as bool
                  ? AppColors.bgCard.withValues(alpha:0.6)
                  : AppColors.bgCardLight,
                borderRadius:BorderRadius.circular(14),
                border:Border.all(color: n['read'] as bool
                  ? AppColors.cardBorder.withValues(alpha:0.3)
                  : AppColors.primary.withValues(alpha:0.4))),
              child: Row(children:[
                Container(width:44, height:44,
                  decoration:BoxDecoration(
                    color:AppColors.primary.withValues(alpha: n['read'] as bool ? 0.1 : 0.2),
                    borderRadius:BorderRadius.circular(12)),
                  child:Icon(n['icon'] as IconData,
                    color: n['read'] as bool ? AppColors.textGrey : AppColors.primary, size:22)),
                const SizedBox(width:12),
                Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start, children:[
                  Text(n['title'] as String,
                    style:TextStyle(color: n['read'] as bool ? AppColors.textGrey : Colors.white,
                      fontWeight:FontWeight.w700, fontSize:13)),
                  const SizedBox(height:3),
                  Text(n['body'] as String, maxLines:2, overflow:TextOverflow.ellipsis,
                    style:TextStyle(color:AppColors.textGrey.withValues(alpha:0.8), fontSize:12, height:1.3)),
                ])),
                const SizedBox(width:8),
                Column(children:[
                  Text(n['time'] as String, style:const TextStyle(color:AppColors.textGrey, fontSize:10)),
                  const SizedBox(height:6),
                  if (!(n['read'] as bool)) Container(width:8, height:8,
                    decoration:const BoxDecoration(color:AppColors.primary, shape:BoxShape.circle)),
                ]),
              ])));
          }),
        ],
      ),
    );
  }

  void _openReply(BuildContext context, UserInboxMessage msg) {
    final ctrl = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.bgCard,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => Padding(
        padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Container(width: 40, height: 4,
              decoration: BoxDecoration(color: AppColors.cardBorder,
                  borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 16),
            Row(children: [
              Container(width: 40, height: 40,
                decoration: BoxDecoration(color: msg.color, shape: BoxShape.circle),
                child: Center(child: Text(msg.initials,
                  style: const TextStyle(color: Colors.white,
                      fontSize: 13, fontWeight: FontWeight.w800)))),
              const SizedBox(width: 12),
              Expanded(child: Text(msg.proName,
                style: const TextStyle(color: AppColors.textDark,
                    fontWeight: FontWeight.w800, fontSize: 15))),
            ]),
            const SizedBox(height: 14),
            // Pro reply bubble
            Align(
              alignment: Alignment.centerLeft,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.bgCardMid,
                  borderRadius: BorderRadius.circular(14)),
                child: Text(msg.proReply,
                  style: const TextStyle(color: AppColors.textDark, fontSize: 13)))),
            const SizedBox(height: 16),
            // Reply input
            Row(children: [
              Expanded(child: Container(
                decoration: BoxDecoration(
                  color: AppColors.bgCardMid,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppColors.cardBorder)),
                child: TextField(
                  controller: ctrl,
                  style: const TextStyle(color: AppColors.textDark, fontSize: 14),
                  decoration: const InputDecoration(
                    hintText: 'Reply…',
                    hintStyle: TextStyle(color: AppColors.textGrey),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    isDense: true)))),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () {
                  if (ctrl.text.trim().isNotEmpty) Navigator.pop(context);
                },
                child: Container(
                  width: 44, height: 44,
                  decoration: const BoxDecoration(
                      color: AppColors.primary, shape: BoxShape.circle),
                  child: const Icon(Icons.send_rounded,
                      color: Colors.white, size: 20))),
            ]),
            const SizedBox(height: 8),
          ]))));
  }
}
