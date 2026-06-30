import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});
  @override State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notifs = true, _promo = false, _dark = true, _location = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      appBar: AppBar(
        backgroundColor: AppColors.bgCard,
        leading: IconButton(icon:const Icon(Icons.arrow_back_rounded, color:Colors.white),
            onPressed:()=>Navigator.pop(context)),
        title: const Text('Settings')),
      body: ListView(padding:const EdgeInsets.all(16), children:[
        _sectionTitle('Notifications'),
        _toggle('Push Notifications', _notifs, (v)=>setState(()=>_notifs=v)),
        _toggle('Promotional Emails', _promo, (v)=>setState(()=>_promo=v)),
        const SizedBox(height:16),
        _sectionTitle('Appearance'),
        _toggle('Dark Mode', _dark, (v)=>setState(()=>_dark=v)),
        const SizedBox(height:16),
        _sectionTitle('Privacy'),
        _toggle('Location Services', _location, (v)=>setState(()=>_location=v)),
        const SizedBox(height:16),
        _sectionTitle('Account'),
        _tile('Change Password', Icons.lock_rounded, (){}),
        _tile('Language', Icons.language_rounded, (){}),
        _tile('Help & Support', Icons.help_outline_rounded, (){}),
        _tile('About Traveo', Icons.info_outline_rounded, (){}),
        const SizedBox(height:16),
        SizedBox(width:double.infinity, height:50,
          child: OutlinedButton(
            onPressed:()=>Navigator.of(context).pushNamedAndRemoveUntil('/', (_)=>false),
            style:OutlinedButton.styleFrom(
              side:const BorderSide(color:AppColors.danger),
              foregroundColor:AppColors.danger,
              shape:RoundedRectangleBorder(borderRadius:BorderRadius.circular(14))),
            child:const Text('Sign Out', style:TextStyle(fontWeight:FontWeight.w700)))),
      ]),
    );
  }

  Widget _sectionTitle(String t) => Padding(
    padding:const EdgeInsets.only(bottom:8),
    child:Text(t, style:const TextStyle(color:AppColors.primary,
        fontWeight:FontWeight.w700, fontSize:13)));

  Widget _toggle(String label, bool val, ValueChanged<bool> onChange) =>
    Container(margin:const EdgeInsets.only(bottom:8),
      padding:const EdgeInsets.symmetric(horizontal:16, vertical:4),
      decoration:BoxDecoration(color:AppColors.bgCard,
        borderRadius:BorderRadius.circular(12),
        border:Border.all(color:AppColors.cardBorder.withValues(alpha:0.4))),
      child:Row(children:[
        Expanded(child:Text(label, style:const TextStyle(color:Colors.white, fontSize:14))),
        Switch(value:val, onChanged:onChange)
      ]));

  Widget _tile(String label, IconData icon, VoidCallback onTap) =>
    GestureDetector(onTap:onTap,
      child:Container(margin:const EdgeInsets.only(bottom:8),
        padding:const EdgeInsets.symmetric(horizontal:16, vertical:14),
        decoration:BoxDecoration(color:AppColors.bgCard,
          borderRadius:BorderRadius.circular(12),
          border:Border.all(color:AppColors.cardBorder.withValues(alpha:0.4))),
        child:Row(children:[
          Icon(icon, color:AppColors.primary, size:20),
          const SizedBox(width:12),
          Expanded(child:Text(label, style:const TextStyle(color:Colors.white, fontSize:14))),
          const Icon(Icons.chevron_right_rounded, color:AppColors.textGrey, size:20),
        ])));
}
