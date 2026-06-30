import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class PrivacyPolicyScreen extends StatefulWidget {
  const PrivacyPolicyScreen({super.key});
  @override State<PrivacyPolicyScreen> createState() => _PrivacyPolicyScreenState();
}

class _PrivacyPolicyScreenState extends State<PrivacyPolicyScreen> {
  bool _accepted = false;
  bool _refused  = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.gradientRadial),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.bgCard.withValues(alpha: 0.85),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.cardBorder.withValues(alpha: 0.5))),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Privacy Policy',
                      style: TextStyle(color: AppColors.primary,
                          fontWeight: FontWeight.w800, fontSize: 20)),
                  const SizedBox(height: 20),
                  const Text(
                    'By creating an account, you agree to our Terms of Service and Privacy Policy. '
                    'We collect information such as your name, email, and location to provide travel services. '
                    'Your data is never sold to third parties. We use cookies and analytics to improve your experience. '
                    'You may delete your account and data at any time by contacting privacy@traveo.app.\n\n'
                    'We implement industry-standard security measures to protect your information. '
                    'All data is encrypted in transit and at rest.\n\n'
                    'By tapping "Accept" below, you confirm that you have read and agree to our terms.',
                    style: TextStyle(color: AppColors.textDark, fontSize: 14, height: 1.7),
                    textAlign: TextAlign.justify,
                  ),
                  const SizedBox(height: 28),
                  Row(mainAxisAlignment: MainAxisAlignment.end, children: [
                    // Accept checkbox
                    GestureDetector(
                      onTap: () {
                        setState(() { _accepted = true; _refused = false; });
                        Future.delayed(const Duration(milliseconds: 400), () {
                          if (mounted) Navigator.of(context).pushNamedAndRemoveUntil('/home', (_)=>false);
                        });
                      },
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        Container(width:18, height:18,
                          decoration: BoxDecoration(
                            color: _accepted ? AppColors.primary : Colors.white,
                            borderRadius: BorderRadius.circular(3)),
                          child: _accepted ? const Icon(Icons.check, color:Colors.white, size:14) : null),
                        const SizedBox(width: 8),
                        const Text('Accept', style: TextStyle(color: AppColors.primary,
                            fontWeight: FontWeight.w700, fontSize: 15)),
                      ]),
                    ),
                    const SizedBox(width: 24),
                    // Refuse checkbox
                    GestureDetector(
                      onTap: () {
                        setState(() { _refused = true; _accepted = false; });
                        Future.delayed(const Duration(milliseconds: 400), () {
                          if (mounted) Navigator.of(context).pop();
                        });
                      },
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        Container(width:18, height:18,
                          decoration: BoxDecoration(
                            color: _refused ? AppColors.primary : AppColors.primary,
                            borderRadius: BorderRadius.circular(3))),
                        const SizedBox(width: 8),
                        const Text('Decline', style: TextStyle(color: AppColors.primary,
                            fontWeight: FontWeight.w700, fontSize: 15)),
                      ]),
                    ),
                  ]),
                ]),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
