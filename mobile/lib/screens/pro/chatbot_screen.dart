import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class ChatbotScreen extends StatefulWidget {
  const ChatbotScreen({super.key});

  @override
  State<ChatbotScreen> createState() => _ChatbotScreenState();
}

class _ChatbotScreenState extends State<ChatbotScreen> {
  final _ctrl = TextEditingController();
  final _scroll = ScrollController();

  final List<_Msg> _msgs = [
    _Msg(false, 'Bonjour! Je suis votre assistant IA Traveo. Comment puis-je vous aider avec votre voyage aujourd\'hui?'),
    _Msg(true, 'Je cherche un vol Paris-Yaoundé pour le 15 mars.'),
    _Msg(false, 'Bien sûr! Je vais chercher les meilleures offres de vols Paris-Yaoundé pour le 15 mars. Avez-vous une préférence pour l\'heure de départ ou une compagnie aérienne?'),
  ];

  @override
  void dispose() {
    _ctrl.dispose();
    _scroll.dispose();
    super.dispose();
  }

  void _send() {
    final text = _ctrl.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _msgs.add(_Msg(true, text));
      _ctrl.clear();
    });
    Future.delayed(const Duration(milliseconds: 800), () {
      if (mounted) {
        setState(() {
          _msgs.add(_Msg(false,
              'Je comprends votre demande. Permettez-moi de vous aider avec ça. Laissez-moi rechercher les meilleures options disponibles pour vous.'));
        });
        Future.delayed(const Duration(milliseconds: 100), () {
          _scroll.animateTo(_scroll.position.maxScrollExtent,
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeOut);
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgBlack,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [AppTheme.bgMid, AppTheme.bgBlack],
            stops: [0.0, 0.35],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // App bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                child: Row(children: [
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: const Icon(Icons.arrow_back,
                        color: AppTheme.primaryGreen, size: 26),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    width: 40, height: 40,
                    decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppTheme.bgCard,
                        border: Border.all(color: AppTheme.primaryGreen)),
                    child: const Icon(Icons.smart_toy,
                        color: AppTheme.primaryGreen, size: 22),
                  ),
                  const SizedBox(width: 10),
                  Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Assistant IA',
                        style: AppTheme.body(
                            fontWeight: FontWeight.bold, size: 15)),
                    Text('En ligne',
                        style: AppTheme.label(
                            color: AppTheme.primaryGreen, size: 11)),
                  ]),
                ]),
              ),

              // Messages
              Expanded(
                child: ListView.builder(
                  controller: _scroll,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  itemCount: _msgs.length,
                  itemBuilder: (_, i) => _bubble(_msgs[i]),
                ),
              ),

              // Input bar
              Container(
                margin: const EdgeInsets.all(12),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                decoration: BoxDecoration(
                  color: AppTheme.bgCard,
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(color: AppTheme.cardBorder),
                ),
                child: Row(children: [
                  Expanded(
                    child: TextField(
                      controller: _ctrl,
                      style: AppTheme.body(size: 14),
                      decoration: const InputDecoration(
                        hintText: 'Écrivez un message...',
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        contentPadding: EdgeInsets.zero,
                      ),
                      onSubmitted: (_) => _send(),
                    ),
                  ),
                  GestureDetector(
                    onTap: _send,
                    child: Container(
                      width: 38, height: 38,
                      decoration: const BoxDecoration(
                          color: AppTheme.primaryGreen, shape: BoxShape.circle),
                      child: const Icon(Icons.send, color: AppColors.textDark, size: 18),
                    ),
                  ),
                ]),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _bubble(_Msg msg) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment:
            msg.isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!msg.isUser) ...[
            Container(
              width: 32, height: 32,
              decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.bgCard,
                  border: Border.all(color: AppTheme.primaryGreen)),
              child: const Icon(Icons.smart_toy,
                  color: AppTheme.primaryGreen, size: 18),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: msg.isUser
                    ? AppTheme.primaryGreen
                    : AppTheme.bgCard,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(18),
                  topRight: const Radius.circular(18),
                  bottomLeft: Radius.circular(msg.isUser ? 18 : 4),
                  bottomRight: Radius.circular(msg.isUser ? 4 : 18),
                ),
                border: Border.all(
                    color: msg.isUser
                        ? AppTheme.primaryGreen
                        : AppTheme.cardBorder),
              ),
              child: Text(msg.text, style: AppTheme.body(size: 13)),
            ),
          ),
          if (msg.isUser) const SizedBox(width: 8),
        ],
      ),
    );
  }
}

class _Msg {
  final bool isUser;
  final String text;
  _Msg(this.isUser, this.text);
}
