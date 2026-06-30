import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

// ── Data model ────────────────────────────────────────────────────────────
class _Conversation {
  final String id;
  final String userName;
  final String avatarInitials;
  final Color avatarColor;
  final List<_Msg> messages;
  bool hasUnread;

  _Conversation({
    required this.id,
    required this.userName,
    required this.avatarInitials,
    required this.avatarColor,
    required this.messages,
    this.hasUnread = true,
  });

  _Msg get lastMsg => messages.last;
}

class _Msg {
  final bool fromUser; // true = normal user sent it
  final String text;
  final String time;
  _Msg(this.fromUser, this.text, this.time);
}

// ── Sample data ───────────────────────────────────────────────────────────
final List<_Conversation> _sampleConversations = [
  _Conversation(
    id: '1',
    userName: 'Sarah M.',
    avatarInitials: 'SM',
    avatarColor: const Color(0xFF6D28D9),
    hasUnread: true,
    messages: [
      _Msg(true,  'Hi! I\'m interested in the Kribi Beach tour for next week.', '10:32 AM'),
      _Msg(false, 'Hello Sarah! Great choice. We have slots on Sat & Sun. How many people?', '10:35 AM'),
      _Msg(true,  'It\'s for 3 people. What\'s included in the package?', '10:38 AM'),
      _Msg(false, 'The package includes transport, guide, lunch, and a boat ride. Total is FCFA 120 per person.', '10:40 AM'),
      _Msg(true,  'Sounds perfect! Can I book for Saturday?', '10:42 AM'),
    ],
  ),
  _Conversation(
    id: '2',
    userName: 'James K.',
    avatarInitials: 'JK',
    avatarColor: const Color(0xFF0369A1),
    hasUnread: true,
    messages: [
      _Msg(true,  'Do you organize trips to Mount Cameroon?', '9:15 AM'),
      _Msg(false, 'Yes we do! We offer 1-day and 3-day hiking packages with certified guides.', '9:20 AM'),
      _Msg(true,  'What\'s the difficulty level? I\'m a beginner.', '9:22 AM'),
    ],
  ),
  _Conversation(
    id: '3',
    userName: 'Amina T.',
    avatarInitials: 'AT',
    avatarColor: const Color(0xFF065F46),
    hasUnread: false,
    messages: [
      _Msg(true,  'I\'d like to book the Yaoundé city tour for this Friday.', 'Yesterday'),
      _Msg(false, 'Hi Amina! Friday is available. The tour starts at 9 AM from Place du Gouvernement.', 'Yesterday'),
      _Msg(true,  'Perfect, I\'ll take 2 spots please.', 'Yesterday'),
      _Msg(false, 'Booked! I\'ll send you the confirmation details shortly. See you Friday!', 'Yesterday'),
    ],
  ),
  _Conversation(
    id: '4',
    userName: 'Paul N.',
    avatarInitials: 'PN',
    avatarColor: const Color(0xFF92400E),
    hasUnread: false,
    messages: [
      _Msg(true,  'Are group discounts available for 10+ people?', '2d ago'),
      _Msg(false, 'Yes! Groups of 10 or more get 15% off any package. Would you like a quote?', '2d ago'),
      _Msg(true,  'That\'d be great, we\'re a team of 12.', '2d ago'),
    ],
  ),
  _Conversation(
    id: '5',
    userName: 'Celine B.',
    avatarInitials: 'CB',
    avatarColor: const Color(0xFF7C3AED),
    hasUnread: false,
    messages: [
      _Msg(true,  'Can you arrange hotel + tour packages?', '3d ago'),
      _Msg(false, 'Absolutely! We have all-inclusive packages starting from FCFA 180. Which destination?', '3d ago'),
    ],
  ),
];

// ── Inbox list screen ─────────────────────────────────────────────────────
class UserMessagesScreen extends StatefulWidget {
  const UserMessagesScreen({super.key});
  @override State<UserMessagesScreen> createState() => _UserMessagesScreenState();
}

class _UserMessagesScreenState extends State<UserMessagesScreen> {
  final List<_Conversation> _convos = List.from(_sampleConversations);

  int get _unreadCount => _convos.where((c) => c.hasUnread).length;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Column(children: [
        _header(),
        if (_unreadCount > 0)
          Container(
            margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.primary.withValues(alpha: 0.3))),
            child: Row(children: [
              const Icon(Icons.mark_chat_unread_rounded, color: AppColors.primary, size: 18),
              const SizedBox(width: 10),
              Text('$_unreadCount unread message${_unreadCount > 1 ? 's' : ''}',
                style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 13)),
              const Spacer(),
              GestureDetector(
                onTap: () => setState(() { for (var c in _convos) c.hasUnread = false; }),
                child: const Text('Mark all read',
                  style: TextStyle(color: AppColors.textGrey, fontSize: 11))),
            ])),
        Expanded(
          child: _convos.isEmpty
            ? _emptyState()
            : ListView.builder(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
                itemCount: _convos.length,
                itemBuilder: (_, i) => _convoTile(_convos[i]))),
      ]),
    );
  }

  Widget _header() => Container(
    color: AppColors.bgDark,
    child: SafeArea(bottom: false, child: Padding(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
      child: Row(children: [
        GestureDetector(
          onTap: () => Navigator.pop(context),
          child: Container(width: 40, height: 40,
            decoration: BoxDecoration(color: AppColors.bgCard,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder)),
            child: const Icon(Icons.arrow_back_rounded, color: AppColors.textDark, size: 20))),
        const SizedBox(width: 12),
        const Text('Customer Messages', style: TextStyle(color: AppColors.textDark,
            fontWeight: FontWeight.w800, fontSize: 18)),
        const Spacer(),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.primary.withValues(alpha: 0.3))),
          child: Row(children: [
            const Icon(Icons.people_rounded, color: AppColors.primary, size: 14),
            const SizedBox(width: 4),
            Text('${_convos.length}', style: const TextStyle(color: AppColors.primary,
                fontWeight: FontWeight.w800, fontSize: 11)),
          ])),
      ]))));

  Widget _convoTile(_Conversation c) {
    return GestureDetector(
      onTap: () {
        setState(() => c.hasUnread = false);
        Navigator.push(context,
          MaterialPageRoute(builder: (_) => _ChatScreen(conversation: c)));
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: c.hasUnread
            ? AppColors.bgCard
            : AppColors.bgCard.withValues(alpha: 0.6),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: c.hasUnread
              ? AppColors.primary.withValues(alpha: 0.35)
              : AppColors.cardBorder.withValues(alpha: 0.3))),
        child: Row(children: [
          // Avatar
          Container(
            width: 48, height: 48,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: c.avatarColor.withValues(alpha: 0.8)),
            child: Center(child: Text(c.avatarInitials,
              style: const TextStyle(color: Colors.white,
                  fontWeight: FontWeight.w800, fontSize: 14)))),
          const SizedBox(width: 12),
          // Name + last message
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(c.userName, style: TextStyle(
              color: c.hasUnread ? AppColors.textDark : AppColors.textGrey,
              fontWeight: c.hasUnread ? FontWeight.w700 : FontWeight.w500,
              fontSize: 14)),
            const SizedBox(height: 3),
            Row(children: [
              if (!c.lastMsg.fromUser)
                const Text('You: ', style: TextStyle(color: AppColors.textGrey, fontSize: 11)),
              Expanded(child: Text(c.lastMsg.text,
                maxLines: 1, overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: c.hasUnread ? AppColors.textGrey : AppColors.textGrey.withValues(alpha: 0.6),
                  fontSize: 12,
                  fontWeight: c.hasUnread && c.lastMsg.fromUser ? FontWeight.w600 : FontWeight.normal))),
            ]),
          ])),
          // Time + unread dot
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text(c.lastMsg.time, style: const TextStyle(color: AppColors.textGrey, fontSize: 10)),
            const SizedBox(height: 6),
            if (c.hasUnread)
              Container(width: 10, height: 10,
                decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle))
            else
              const SizedBox(height: 10),
          ]),
        ])),
    );
  }

  Widget _emptyState() => Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
    Icon(Icons.chat_bubble_outline_rounded, color: AppColors.textGrey.withValues(alpha: 0.3), size: 72),
    const SizedBox(height: 16),
    const Text('No messages yet', style: TextStyle(color: AppColors.textGrey, fontSize: 16)),
    const SizedBox(height: 8),
    const Text('Messages from users will appear here',
      style: TextStyle(color: AppColors.textGrey, fontSize: 12)),
  ]));
}

// ── Individual chat screen ────────────────────────────────────────────────
class _ChatScreen extends StatefulWidget {
  final _Conversation conversation;
  const _ChatScreen({required this.conversation});
  @override State<_ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<_ChatScreen> {
  final _ctrl = TextEditingController();
  final _scroll = ScrollController();
  late List<_Msg> _msgs;

  @override
  void initState() {
    super.initState();
    _msgs = List.from(widget.conversation.messages);
    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
  }

  void _scrollToBottom() {
    if (_scroll.hasClients) {
      _scroll.animateTo(_scroll.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
    }
  }

  void _send() {
    final text = _ctrl.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _msgs.add(_Msg(false, text, _timeNow()));
      widget.conversation.messages.add(_Msg(false, text, _timeNow()));
      _ctrl.clear();
    });
    Future.delayed(const Duration(milliseconds: 100), _scrollToBottom);
  }

  String _timeNow() {
    final now = DateTime.now();
    final h = now.hour;
    final m = now.minute.toString().padLeft(2, '0');
    final period = h >= 12 ? 'PM' : 'AM';
    final hour = h > 12 ? h - 12 : (h == 0 ? 12 : h);
    return '$hour:$m $period';
  }

  @override
  void dispose() { _ctrl.dispose(); _scroll.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Column(children: [
        _header(),
        Expanded(child: ListView.builder(
          controller: _scroll,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          itemCount: _msgs.length,
          itemBuilder: (_, i) => _bubble(_msgs[i]))),
        _inputBar(),
      ]),
    );
  }

  Widget _header() => Container(
    color: AppColors.bgDark,
    child: SafeArea(bottom: false, child: Padding(
      padding: const EdgeInsets.fromLTRB(12, 10, 16, 12),
      child: Row(children: [
        GestureDetector(
          onTap: () => Navigator.pop(context),
          child: Container(width: 40, height: 40,
            decoration: BoxDecoration(color: AppColors.bgCard,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.cardBorder)),
            child: const Icon(Icons.arrow_back_rounded, color: AppColors.textDark, size: 20))),
        const SizedBox(width: 12),
        Container(width: 40, height: 40,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: widget.conversation.avatarColor.withValues(alpha: 0.8)),
          child: Center(child: Text(widget.conversation.avatarInitials,
            style: const TextStyle(color: Colors.white,
                fontWeight: FontWeight.w800, fontSize: 13)))),
        const SizedBox(width: 10),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(widget.conversation.userName, style: const TextStyle(
              color: AppColors.textDark, fontWeight: FontWeight.w800, fontSize: 15)),
          const Text('Customer', style: TextStyle(color: AppColors.textGrey, fontSize: 11)),
        ])),
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: AppColors.bgCard,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.cardBorder)),
          child: const Icon(Icons.phone_rounded, color: AppColors.primary, size: 18)),
      ]))));

  Widget _bubble(_Msg msg) {
    // fromUser = true means the normal user sent it (left side)
    // fromUser = false means the pro/agency replied (right side)
    final isMe = !msg.fromUser;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isMe) ...[
            Container(width: 32, height: 32,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: widget.conversation.avatarColor.withValues(alpha: 0.8)),
              child: Center(child: Text(widget.conversation.avatarInitials[0],
                style: const TextStyle(color: Colors.white,
                    fontWeight: FontWeight.w700, fontSize: 12)))),
            const SizedBox(width: 8),
          ],
          Flexible(child: Column(
            crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: isMe ? AppColors.primary : AppColors.bgCard,
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(18),
                    topRight: const Radius.circular(18),
                    bottomLeft: Radius.circular(isMe ? 18 : 4),
                    bottomRight: Radius.circular(isMe ? 4 : 18)),
                  border: Border.all(
                    color: isMe
                      ? AppColors.primary
                      : AppColors.cardBorder.withValues(alpha: 0.5))),
                child: Text(msg.text,
                  style: TextStyle(
                    color: isMe ? Colors.white : AppColors.textDark,
                    fontSize: 13))),
              const SizedBox(height: 3),
              Text(msg.time,
                style: const TextStyle(color: AppColors.textGrey, fontSize: 9)),
            ])),
          if (isMe) const SizedBox(width: 8),
        ]));
  }

  Widget _inputBar() => Container(
    margin: const EdgeInsets.all(12),
    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
    decoration: BoxDecoration(
      color: AppColors.bgCard,
      borderRadius: BorderRadius.circular(28),
      border: Border.all(color: AppColors.cardBorder)),
    child: Row(children: [
      Expanded(child: TextField(
        controller: _ctrl,
        style: const TextStyle(color: AppColors.textDark, fontSize: 14),
        decoration: const InputDecoration(
          hintText: 'Reply to customer...',
          hintStyle: TextStyle(color: AppColors.textGrey),
          border: InputBorder.none,
          contentPadding: EdgeInsets.zero),
        onSubmitted: (_) => _send())),
      GestureDetector(
        onTap: _send,
        child: Container(width: 38, height: 38,
          decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
          child: const Icon(Icons.send_rounded, color: Colors.white, size: 18))),
    ]));
}
