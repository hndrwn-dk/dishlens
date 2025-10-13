import 'package:flutter/material.dart';
import '../../models.dart';
import '../../services/api.dart';
import '../cook/cook_screen.dart';

class RecipesScreen extends StatefulWidget {
  final List<DetectedItem> items;
  const RecipesScreen({super.key, required this.items});
  @override State<RecipesScreen> createState() => _RecipesScreenState();
}

class _RecipesScreenState extends State<RecipesScreen> {
  bool loading = true;
  List<Recipe> recipes = [];

  @override void initState(){ super.initState(); _run(); }
  Future<void> _run() async {
    try { final out = await generateRecipes(widget.items); setState(()=>recipes=out); }
    finally { setState(()=>loading=false); }
  }

  @override Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Recipes")),
      body: loading ? const Center(child: CircularProgressIndicator()) :
        ListView.builder(
          itemCount: recipes.length,
          itemBuilder: (_, i) {
            final r = recipes[i];
            return Card(
              margin: const EdgeInsets.all(12),
              child: ListTile(
                title: Text(r.title),
                subtitle: Text("${r.totalTimeMin} min • ${r.difficulty} • Score: ${r.score?["total"] ?? "-"}"),
                onTap: ()=> Navigator.of(context).push(MaterialPageRoute(
                  builder: (_) => CookScreen(recipe: r)
                )),
              ),
            );
          }),
    );
  }
}
