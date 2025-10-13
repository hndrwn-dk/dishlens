import 'dart:async';
import 'package:flutter/material.dart';
import '../../models.dart';

class CookScreen extends StatefulWidget {
  final Recipe recipe;
  const CookScreen({super.key, required this.recipe});
  @override State<CookScreen> createState() => _CookScreenState();
}

class _CookScreenState extends State<CookScreen> {
  int idx = 0;
  Timer? _timer;
  int remaining = 0;

  @override void dispose(){ _timer?.cancel(); super.dispose(); }

  void _maybeStartTimer(String step) {
    final reg = RegExp(r'(\d+)\s*(min|minutes)');
    final m = reg.firstMatch(step.toLowerCase());
    if (m != null) {
      remaining = int.parse(m.group(1)!) * 60;
      _timer?.cancel();
      _timer = Timer.periodic(const Duration(seconds: 1), (_) {
        if (remaining <= 0) { _timer?.cancel(); setState((){}); }
        else setState(()=>remaining--);
      });
    } else {
      _timer?.cancel(); remaining = 0;
    }
  }

  @override Widget build(BuildContext context) {
    final s = widget.recipe.steps[idx];
    return Scaffold(
      appBar: AppBar(title: Text(widget.recipe.title)),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Step ${idx+1}/${widget.recipe.steps.length}", style: const TextStyle(fontSize: 16)),
            const SizedBox(height: 12),
            Text(s, style: const TextStyle(fontSize: 22)),
            const Spacer(),
            if (remaining > 0) Text("Timer: ${remaining}s"),
            Row(children: [
              if (idx > 0)
                OutlinedButton(onPressed: (){
                  setState(()=>idx--); _maybeStartTimer(widget.recipe.steps[idx]);
                }, child: const Text("Back")),
              const SizedBox(width: 12),
              Expanded(child: ElevatedButton(onPressed: (){
                if (idx < widget.recipe.steps.length - 1) {
                  setState(()=>idx++); _maybeStartTimer(widget.recipe.steps[idx]);
                } else {
                  Navigator.of(context).pop();
                }
              }, child: Text(idx < widget.recipe.steps.length - 1 ? "Next" : "Finish")))
            ])
          ],
        ),
      ),
    );
  }
}
