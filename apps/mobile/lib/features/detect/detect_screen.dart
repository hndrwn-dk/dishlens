import 'dart:io';
import 'package:flutter/material.dart';
import '../../models.dart';
import '../../services/api.dart';

class DetectScreen extends StatefulWidget {
  final String imagePath;
  const DetectScreen({super.key, required this.imagePath});
  @override State<DetectScreen> createState() => _DetectScreenState();
}

class _DetectScreenState extends State<DetectScreen> {
  bool loading = true;
  List<DetectedItem> items = [];

  @override void initState() { super.initState(); _run(); }
  Future<void> _run() async {
    try { final out = await detectItems(widget.imagePath); setState(()=>items=out); }
    finally { setState(()=>loading=false); }
  }

  @override Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Detected items")),
      body: loading ? const Center(child: CircularProgressIndicator())
        : Column(children: [
            Image.file(File(widget.imagePath), height: 180, fit: BoxFit.cover),
            Wrap(spacing: 8, children: items.map((e) =>
              Chip(label: Text("${e.name} (${(e.confidence*100).round()}%)"))
            ).toList()),
            const Spacer(),
            Padding(
              padding: const EdgeInsets.all(12),
              child: ElevatedButton(
                onPressed: ()=> Navigator.of(context).pushNamed("/recipes", arguments: items),
                child: const Text("Generate recipes"),
              ),
            )
          ]),
    );
  }
}