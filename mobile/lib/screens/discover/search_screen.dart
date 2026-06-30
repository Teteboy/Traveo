import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../models/destination.dart';
import 'destination_detail_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});
  @override State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _ctrl = TextEditingController();
  String _query = '';

  List<Destination> get _results => kDestinations.where((d) =>
    d.name.toLowerCase().contains(_query.toLowerCase()) ||
    d.description.toLowerCase().contains(_query.toLowerCase()) ||
    d.category.toLowerCase().contains(_query.toLowerCase())).toList();

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: SafeArea(child: Column(children:[
        // Search bar
        Padding(
          padding: const EdgeInsets.fromLTRB(16,12,16,12),
          child: Row(children:[
            GestureDetector(
              onTap:()=>Navigator.pop(context),
              child:const Icon(Icons.arrow_back_rounded, color:Colors.white)),
            const SizedBox(width:12),
            Expanded(child: Container(
              decoration:BoxDecoration(color:AppColors.bgCard,
                borderRadius:BorderRadius.circular(14),
                border:Border.all(color:AppColors.cardBorder)),
              child:TextField(
                controller:_ctrl, autofocus:true,
                style:const TextStyle(color:Colors.white),
                onChanged:(v)=>setState(()=>_query=v),
                decoration:const InputDecoration(
                  hintText:'Search destinations, agencies...',
                  prefixIcon:Icon(Icons.search_rounded, color:AppColors.primary),
                  border:InputBorder.none,
                  contentPadding:EdgeInsets.symmetric(vertical:14))))),
          ])),

        if (_query.isEmpty)
          Expanded(child:_suggestions())
        else
          Expanded(child:_resultsView()),
      ])),
    );
  }

  Widget _suggestions() => ListView(padding:const EdgeInsets.all(16), children:[
    const Text('Popular Searches', style:TextStyle(color:AppColors.primary,
        fontWeight:FontWeight.w700, fontSize:14)),
    const SizedBox(height:12),
    ...['Yaoundé', 'Douala', 'Paris', 'Dubai', 'South Africa'].map((s)=>
      ListTile(
        onTap:()=>setState((){_query=s; _ctrl.text=s;}),
        leading:const Icon(Icons.trending_up_rounded, color:AppColors.primary),
        title:Text(s, style:const TextStyle(color:Colors.white)),
        trailing:const Icon(Icons.north_east_rounded, color:AppColors.textGrey, size:16))),
  ]);

  Widget _resultsView() {
    final res = _results;
    if (res.isEmpty) return Center(child:Column(mainAxisAlignment:MainAxisAlignment.center, children:[
      const Icon(Icons.search_off_rounded, color:AppColors.textGrey, size:56),
      const SizedBox(height:16),
      Text('No results for "$_query"',
          style:const TextStyle(color:AppColors.textGrey, fontSize:14)),
    ]));
    return ListView.builder(
      padding:const EdgeInsets.all(16),
      itemCount:res.length,
      itemBuilder:(_,i){
        final d=res[i];
        return GestureDetector(
          onTap:()=>Navigator.push(context,
              MaterialPageRoute(builder:(_)=>DestinationDetailScreen(destination:d))),
          child:Container(
            margin:const EdgeInsets.only(bottom:10),
            padding:const EdgeInsets.all(14),
            decoration:BoxDecoration(color:AppColors.bgCard, borderRadius:BorderRadius.circular(14),
              border:Border.all(color:AppColors.cardBorder.withValues(alpha:0.4))),
            child:Row(children:[
              Container(width:48, height:48,
                decoration:BoxDecoration(color:AppColors.bgCardLight, borderRadius:BorderRadius.circular(12)),
                child:const Icon(Icons.location_on_rounded, color:AppColors.primary, size:24)),
              const SizedBox(width:12),
              Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start, children:[
                Text(d.name, style:const TextStyle(color:Colors.white,
                    fontSize:14, fontWeight:FontWeight.w700)),
                Text(d.description, maxLines:1, overflow:TextOverflow.ellipsis,
                    style:const TextStyle(color:AppColors.textGrey, fontSize:12)),
              ])),
              const Icon(Icons.chevron_right_rounded, color:AppColors.textGrey),
            ])));
      });
  }
}
