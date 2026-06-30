import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import 'chatbot_screen.dart';

class MenuIaScreen extends StatelessWidget {
  const MenuIaScreen({super.key});

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
            stops: [0.0, 0.4],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Notification icon only top-right
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
                  child: Align(
                    alignment: Alignment.centerRight,
                    child: Stack(clipBehavior: Clip.none, children: [
                      const Icon(Icons.notifications,
                          color: AppTheme.primaryGreen, size: 28),
                      Positioned(
                        top: -4, right: -4,
                        child: Container(
                          width: 18, height: 18,
                          decoration: const BoxDecoration(
                              color: Colors.red, shape: BoxShape.circle),
                          child: const Center(
                            child: Text('02',
                                style: TextStyle(
                                    color: AppColors.textDark,
                                    fontSize: 8,
                                    fontWeight: FontWeight.bold)),
                          ),
                        ),
                      ),
                    ]),
                  ),
                ),

                // Hero image
                Padding(
                  padding: const EdgeInsets.fromLTRB(14, 8, 14, 0),
                  child: Container(
                    height: 220,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(18),
                      color: const Color(0xFF051A2E),
                      border: Border.all(color: AppTheme.cardBorder),
                    ),
                    child: Stack(children: [
                      Center(
                        child: Icon(Icons.flight,
                            size: 120,
                            color: AppTheme.primaryGreen.withValues(alpha: 0.07)),
                      ),
                      Positioned(
                        top: 12, right: 14,
                        child: Stack(clipBehavior: Clip.none, children: [
                          const Icon(Icons.notifications,
                              color: AppTheme.primaryGreen, size: 24),
                          Positioned(
                            top: -3, right: -3,
                            child: Container(
                              width: 14, height: 14,
                              decoration: const BoxDecoration(
                                  color: Colors.red, shape: BoxShape.circle),
                              child: const Center(
                                child: Text('02',
                                    style: TextStyle(
                                        color: AppColors.textDark,
                                        fontSize: 7,
                                        fontWeight: FontWeight.bold)),
                              ),
                            ),
                          ),
                        ]),
                      ),
                    ]),
                  ),
                ),

                // Agency info
                Padding(
                  padding: const EdgeInsets.fromLTRB(18, 16, 18, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("Ile nom de l'age",
                          style: AppTheme.display(size: 22)),
                      const SizedBox(height: 8),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Text(
                              'Discover the best travel experiences tailored for your clients. Let AI assist you with itinerary planning, pricing, and customer queries.',
                              style: AppTheme.label(size: 12),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Row(children: [
                                Text('yaoundé, Cameroun',
                                    style: AppTheme.label(
                                        color: AppTheme.primaryGreen, size: 12)),
                                const SizedBox(width: 4),
                                const Icon(Icons.location_on,
                                    color: AppTheme.primaryGreen, size: 16),
                              ]),
                              const SizedBox(height: 6),
                              Row(children: [
                                Text('+234 566 9887 663',
                                    style: AppTheme.label(
                                        color: AppTheme.primaryGreen, size: 12)),
                                const SizedBox(width: 4),
                                const Icon(Icons.phone,
                                    color: AppTheme.primaryGreen, size: 16),
                              ]),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 22),

                // Action grid row 1
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _actionTile(Icons.chat_bubble_outline, 'Action'),
                      _actionTile(Icons.directions_bus, 'Action'),
                      _actionTile(Icons.grid_view, 'Action'),
                      _actionTile(Icons.lightbulb_outline, 'Action'),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // Action grid row 2
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _actionTile(Icons.chat_bubble_outline, 'Action'),
                      _actionTile(Icons.directions_bus, 'Action'),
                      _actionTile(Icons.grid_view, 'Action'),
                      _actionTile(Icons.lightbulb_outline, 'Action'),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Chatbot bubble
                GestureDetector(
                  onTap: () => Navigator.push(context,
                      MaterialPageRoute(builder: (_) => const ChatbotScreen())),
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(14, 0, 14, 20),
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppTheme.bgCard,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppTheme.cardBorder),
                      ),
                      child: Row(
                        children: [
                          // Robot icon
                          Container(
                            width: 58, height: 58,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppTheme.bgMid,
                              border: Border.all(color: AppTheme.primaryGreen),
                            ),
                            child: const Icon(Icons.smart_toy,
                                color: AppTheme.primaryGreen, size: 32),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Text(
                              'Discover the best travel experiences tailored for your clients. Let AI assist you with itinerary planning, pricing, and customer queries.\nOur smart tools help you manage bookings, respond to clients, and grow your travel business efficiently.',
                              style: AppTheme.body(size: 12)
                                  .copyWith(height: 1.6),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _actionTile(IconData icon, String label) {
    return Column(
      children: [
        Container(
          width: 72, height: 72,
          decoration: BoxDecoration(
            color: AppTheme.bgCard,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppTheme.cardBorder),
          ),
          child: Icon(icon, color: AppTheme.primaryGreen, size: 34),
        ),
        const SizedBox(height: 5),
        Text(label, style: AppTheme.label(size: 11)),
      ],
    );
  }
}
