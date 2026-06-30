import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../widgets/common_widgets.dart';

class AnalyseScreen extends StatelessWidget {
  const AnalyseScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: AppTheme.bgBlack,
        body: DarkBg(child: SafeArea(child: Column(children: [
          Padding(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(children: [
              const Icon(Icons.search, color: AppTheme.primaryGreen, size: 26),
              const Spacer(),
              Row(mainAxisSize: MainAxisSize.min, children: [
                const Icon(Icons.flight_takeoff, color: AppTheme.primaryGreen, size: 20),
                const SizedBox(width: 6),
                Text('Traveo', style: AppTheme.ts(size: 18, weight: FontWeight.bold, color: AppTheme.primaryGreen)),
              ]),
              const Spacer(),
              const Icon(Icons.settings, color: AppTheme.primaryGreen, size: 24),
              const SizedBox(width: 8),
              const NotifBell(),
              const SizedBox(width: 6),
            ])),
          Expanded(child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(children: [
              // Card 1: pie chart right, text+btn left
              _card1(),
              const SizedBox(height: 14),
              // Card 2: bar chart right, text left
              _card2(),
              const SizedBox(height: 14),
              // Card 3: chart icon left, text right
              _card3(),
              const SizedBox(height: 14),
              // Card 4: percentage left, chart icon right
              _card4(),
              const SizedBox(height: 16),
            ]),
          )),
        ]))),
      );

  Widget _card1() => Container(
      padding: const EdgeInsets.all(16),
      decoration: _deco(),
      child: Row(children: [
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Analyse de nom de la fontion', style: AppTheme.ts(size: 13, weight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text("Service de reservatio des billets d'avion", style: AppTheme.ts(size: 11, color: AppTheme.textGrey)),
          const SizedBox(height: 12),
          Row(children: [
            SizedBox(height: 36, child: ElevatedButton(onPressed: () {},
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
              child: Text('Observez', style: AppTheme.ts(size: 12, weight: FontWeight.bold)))),
            const SizedBox(width: 12),
            Text('25.14 %', style: AppTheme.ts(size: 14, weight: FontWeight.bold)),
          ]),
        ])),
        const SizedBox(width: 12),
        CustomPaint(size: const Size(70, 70), painter: _PiePainter()),
      ]));

  Widget _card2() => Container(
      padding: const EdgeInsets.all(16),
      decoration: _deco(),
      child: Row(children: [
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Titre', style: AppTheme.ts(size: 18, weight: FontWeight.bold)),
          const SizedBox(height: 6),
          Text("Service de reservatio des billets d'avion Service de reservatio des billets d'avion", style: AppTheme.ts(size: 11, color: AppTheme.textGrey)),
          const SizedBox(height: 10),
          Text('50%', style: AppTheme.ts(size: 22, weight: FontWeight.bold, color: AppTheme.primaryGreen)),
        ])),
        const SizedBox(width: 12),
        Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Container(width: 120, height: 90,
            decoration: BoxDecoration(color: AppTheme.bgMid, borderRadius: BorderRadius.circular(10)),
            child: CustomPaint(size: const Size(120, 90), painter: _BarPainter())),
          const SizedBox(height: 8),
          SizedBox(height: 34, child: ElevatedButton(onPressed: () {},
            style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
            child: Text('Observez', style: AppTheme.ts(size: 12, weight: FontWeight.bold)))),
        ]),
      ]));

  Widget _card3() => Container(
      padding: const EdgeInsets.all(16),
      decoration: _deco(),
      child: Row(children: [
        Container(width: 130, height: 100, decoration: BoxDecoration(color: AppTheme.bgMid, borderRadius: BorderRadius.circular(10)),
          child: Stack(alignment: Alignment.center, children: [
            CustomPaint(size: const Size(70, 70), painter: _PiePainter()),
            Positioned(bottom: 10, right: 10, child: Text('50%', style: AppTheme.ts(size: 13, weight: FontWeight.bold, color: AppTheme.primaryGreen))),
          ])),
        const SizedBox(width: 16),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Titre', style: AppTheme.ts(size: 18, weight: FontWeight.bold)),
          const SizedBox(height: 6),
          Text("Service de reservatio des billets d'avion Service de reservatio des billets d'avion", style: AppTheme.ts(size: 11, color: AppTheme.textGrey)),
          const SizedBox(height: 10),
          SizedBox(height: 34, child: OutlinedButton(onPressed: () {},
            style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 16), side: const BorderSide(color: AppTheme.primaryGreen), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
            child: Text('Observez', style: AppTheme.ts(size: 12, weight: FontWeight.bold, color: AppTheme.primaryGreen)))),
        ])),
      ]));

  Widget _card4() => Container(
      padding: const EdgeInsets.all(16),
      decoration: _deco(),
      child: Row(children: [
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('25.14 %', style: AppTheme.ts(size: 22, weight: FontWeight.bold)),
          const SizedBox(height: 6),
          Text("Service de reservatio des billets d'avion Service de reservatio des billets d'avion", style: AppTheme.ts(size: 11, color: AppTheme.textGrey)),
          const SizedBox(height: 12),
          SizedBox(height: 36, child: ElevatedButton(onPressed: () {},
            style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
            child: Text('Observez', style: AppTheme.ts(size: 12, weight: FontWeight.bold)))),
        ])),
        const SizedBox(width: 12),
        CustomPaint(size: const Size(80, 80), painter: _ChartPainter()),
      ]));

  BoxDecoration _deco() => BoxDecoration(
      color: AppTheme.bgCard, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppTheme.cardBorder));
}

class _PiePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size s) {
    final p = Paint()..color = AppTheme.primaryGreen..style = PaintingStyle.stroke..strokeWidth = 8;
    final bg = Paint()..color = AppTheme.primaryGreen.withValues(alpha: 0.15)..style = PaintingStyle.stroke..strokeWidth = 8;
    final c = Offset(s.width/2, s.height/2); final r = s.width/2 - 6;
    canvas.drawCircle(c, r, bg);
    canvas.drawArc(Rect.fromCircle(center: c, radius: r), -1.5708, 4.0, false, p);
    // Bar icon inside
    final bp = Paint()..color = AppTheme.primaryGreen..style = PaintingStyle.fill;
    for (int i = 0; i < 3; i++) {
      final h = (i == 1 ? 20.0 : 12.0);
      canvas.drawRect(Rect.fromLTWH(c.dx - 12 + i * 10, c.dy - h/2, 7, h), bp);
    }
  }
  @override bool shouldRepaint(_) => false;
}

class _BarPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size s) {
    final p = Paint()..color = AppTheme.primaryGreen..style = PaintingStyle.fill;
    final heights = [40.0, 70.0, 50.0, 30.0];
    final w = s.width / (heights.length * 2);
    for (int i = 0; i < heights.length; i++) {
      canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(i * w * 2 + 8, s.height - heights[i] - 8, w - 4, heights[i]), const Radius.circular(3)), p);
    }
  }
  @override bool shouldRepaint(_) => false;
}

class _ChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size s) {
    final p = Paint()..color = AppTheme.primaryGreen..style = PaintingStyle.stroke..strokeWidth = 2.5..strokeCap = StrokeCap.round;
    // Pie arc
    canvas.drawArc(Rect.fromLTWH(0, 0, s.width * 0.5, s.height * 0.5), -1.5708, 3.8, false, p);
    canvas.drawLine(Offset(s.width*0.25, s.height*0.25), Offset(s.width*0.5, s.height*0.5), p);
    // Bar chart below
    final bp = Paint()..color = AppTheme.primaryGreen..style = PaintingStyle.fill;
    final heights = [s.height*0.3, s.height*0.5, s.height*0.4];
    for (int i = 0; i < heights.length; i++) {
      canvas.drawRect(Rect.fromLTWH(s.width*0.55 + i*8, s.height - heights[i], 6, heights[i]), bp);
    }
  }
  @override bool shouldRepaint(_) => false;
}
