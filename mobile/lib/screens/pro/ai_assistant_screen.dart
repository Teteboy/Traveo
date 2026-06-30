import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../theme/app_theme.dart';

class AIAssistantScreen extends StatefulWidget {
  const AIAssistantScreen({super.key});
  @override State<AIAssistantScreen> createState() => _AIAssistantScreenState();
}

class _AIAssistantScreenState extends State<AIAssistantScreen> {

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Column(children: [
        _header(),
        const Expanded(child: _AIChatTab()),
      ]),
    );
  }

  Widget _header() => Container(
    color: AppColors.bgCard,
    child: SafeArea(bottom: false, child: Padding(
      padding: const EdgeInsets.fromLTRB(12, 10, 16, 12),
      child: Row(children: [
        GestureDetector(
          onTap: () => Navigator.pop(context),
          child: Container(width: 38, height: 38,
            decoration: BoxDecoration(color: AppColors.bgMid,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.cardBorder)),
            child: const Icon(Icons.arrow_back_rounded, color: AppColors.textDark, size: 20))),
        const SizedBox(width: 12),
        Container(width: 34, height: 34,
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(10)),
          child: const Icon(Icons.smart_toy_rounded, color: AppColors.primary, size: 20)),
        const SizedBox(width: 10),
        const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Traveo AI', style: TextStyle(color: AppColors.textDark,
              fontWeight: FontWeight.w800, fontSize: 16)),
          Text('Your smart travel companion', style: TextStyle(
              color: AppColors.textGrey, fontSize: 10)),
        ]),
      ]))));

}

// ═══════════════════════════════════════════════════════════════════════════
// AI CHAT TAB
// ═══════════════════════════════════════════════════════════════════════════

class _AIChatTab extends StatefulWidget {
  const _AIChatTab();
  @override State<_AIChatTab> createState() => _AIChatTabState();
}

class _AIChatTabState extends State<_AIChatTab> {
  final _ctrl   = TextEditingController();
  final _scroll = ScrollController();
  final List<Map<String, String>> _messages = [];
  bool _loading = false;

  static const _systemPrompt =
    'You are Traveo AI, a friendly and knowledgeable travel assistant. '
    'Help users plan trips, find destinations, book services, and get travel advice. '
    'Keep responses concise and helpful. You specialise in travel in Africa and worldwide.';

  @override
  void dispose() { _ctrl.dispose(); _scroll.dispose(); super.dispose(); }

  Future<void> _send() async {
    final text = _ctrl.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _messages.add({'role': 'user', 'content': text});
      _loading = true;
    });
    _ctrl.clear();
    _scrollDown();
    try {
      final resp = await http.post(
        Uri.parse('https://api.anthropic.com/v1/messages'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'model': 'claude-sonnet-4-20250514', 'max_tokens': 600,
          'system': _systemPrompt,
          'messages': _messages.map((m) => {'role': m['role'], 'content': m['content']}).toList(),
        }));
      if (resp.statusCode == 200) {
        final data = jsonDecode(resp.body);
        final reply = (data['content'] as List).firstWhere(
            (b) => b['type'] == 'text', orElse: () => {'text': '...'})['text'] as String;
        setState(() => _messages.add({'role': 'assistant', 'content': reply}));
      } else {
        setState(() => _messages.add({'role': 'assistant', 'content': 'Sorry, I could not process that right now.'}));
      }
    } catch (_) {
      setState(() => _messages.add({'role': 'assistant', 'content': 'Network error. Please check your connection.'}));
    }
    setState(() => _loading = false);
    _scrollDown();
  }

  void _scrollDown() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) _scroll.animateTo(
          _scroll.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Expanded(child: _messages.isEmpty ? _emptyState() :
        ListView.builder(
          controller: _scroll,
          padding: const EdgeInsets.all(16),
          itemCount: _messages.length + (_loading ? 1 : 0),
          itemBuilder: (_, i) {
            if (i == _messages.length) return _typingIndicator();
            return _bubble(_messages[i]);
          })),
      _inputBar(),
    ]);
  }

  Widget _emptyState() => Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
    Container(width: 80, height: 80,
      decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(24)),
      child: const Icon(Icons.smart_toy_rounded, color: AppColors.primary, size: 44)),
    const SizedBox(height: 16),
    const Text('Traveo AI Assistant', style: TextStyle(color: Colors.white,
        fontWeight: FontWeight.w800, fontSize: 18)),
    const SizedBox(height: 8),
    const Text('Ask me anything about travel!',
        textAlign: TextAlign.center,
        style: TextStyle(color: AppColors.textGrey, fontSize: 13)),
    const SizedBox(height: 24),
    ...['Best places in Cameroon?', 'Plan a 3-day trip to Douala', 'How to book a flight?']
        .map((hint) => GestureDetector(
          onTap: () { _ctrl.text = hint; _send(); },
          child: Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(color: AppColors.bgCard,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.cardBorder)),
            child: Text(hint, style: const TextStyle(color: AppColors.primary, fontSize: 13))))),
  ]));

  Widget _bubble(Map<String, String> msg) {
    final isUser = msg['role'] == 'user';
    return Padding(
      padding: EdgeInsets.only(top: 6, bottom: 6,
          left: isUser ? 60 : 0, right: isUser ? 0 : 60),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isUser) Container(
            width: 32, height: 32, margin: const EdgeInsets.only(right: 8, top: 2),
            decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(10)),
            child: const Icon(Icons.smart_toy_rounded, color: AppColors.primary, size: 18)),
          Flexible(child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: isUser ? AppColors.primary : AppColors.bgCard,
              borderRadius: BorderRadius.circular(16).copyWith(
                bottomRight: isUser ? const Radius.circular(4) : null,
                bottomLeft: !isUser ? const Radius.circular(4) : null)),
            child: Text(msg['content']!,
              style: TextStyle(
                color: isUser ? Colors.white : Colors.white.withValues(alpha: 0.9),
                fontSize: 13, height: 1.5)))),
        ]));
  }

  Widget _typingIndicator() => Padding(
    padding: const EdgeInsets.only(top: 6, bottom: 6, right: 60),
    child: Row(children: [
      Container(width: 32, height: 32,
        decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.2),
          borderRadius: BorderRadius.circular(10)),
        child: const Icon(Icons.smart_toy_rounded, color: AppColors.primary, size: 18)),
      const SizedBox(width: 8),
      Container(padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: AppColors.bgCard, borderRadius: BorderRadius.circular(16)),
        child: SizedBox(width: 40, height: 16,
          child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            _dot(), const SizedBox(width: 4),
            _dot(), const SizedBox(width: 4),
            _dot(),
          ]))),
    ]));

  Widget _dot() => Container(
    width: 7, height: 7,
    decoration: BoxDecoration(
      color: AppColors.primary.withValues(alpha: 0.6),
      shape: BoxShape.circle));

  Widget _inputBar() => Container(
    padding: const EdgeInsets.fromLTRB(12, 8, 12, 16),
    decoration: BoxDecoration(color: AppColors.bgCard,
      border: Border(top: BorderSide(color: AppColors.cardBorder.withValues(alpha: 0.5)))),
    child: Row(children: [
      Expanded(child: TextField(
        controller: _ctrl,
        style: const TextStyle(color: Colors.white, fontSize: 14),
        decoration: const InputDecoration(hintText: 'Ask anything about travel...',
          border: InputBorder.none, contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10)),
        onSubmitted: (_) => _send())),
      GestureDetector(
        onTap: _send,
        child: Container(width: 44, height: 44,
          decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(13)),
          child: const Icon(Icons.send_rounded, color: Colors.white, size: 20))),
    ]));
}
