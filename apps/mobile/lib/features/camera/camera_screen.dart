import 'dart:io';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';

class CameraScreen extends StatefulWidget {
  final List<CameraDescription> cameras;
  const CameraScreen({super.key, required this.cameras});
  @override State<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen> {
  late CameraController _ctrl;
  bool _busy = true;
  XFile? _shot;

  @override void initState() {
    super.initState();
    _ctrl = CameraController(widget.cameras.first, ResolutionPreset.medium, enableAudio:false);
    _ctrl.initialize().then((_) => setState(()=>_busy=false));
  }
  @override void dispose(){ _ctrl.dispose(); super.dispose(); }

  @override Widget build(BuildContext context) {
    if (_busy) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    return Scaffold(
      body: _shot == null ? Stack(children: [
        CameraPreview(_ctrl),
        Positioned(
          bottom: 40, left: 0, right: 0,
          child: Center(
            child: FloatingActionButton(
              onPressed: () async { final x = await _ctrl.takePicture(); setState(()=>_shot=x); },
              child: const Icon(Icons.camera_alt),
            ),
          ),
        )
      ]) : _Preview(path: _shot!.path, onRetake: ()=>setState(()=>_shot=null)),
    );
  }
}

class _Preview extends StatelessWidget {
  final String path; final VoidCallback onRetake;
  const _Preview({required this.path, required this.onRetake, super.key});
  @override Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Preview"), actions: [
        TextButton(onPressed: onRetake, child: const Text("Retake"))
      ]),
      body: Column(children: [
        Expanded(child: Image.file(File(path), fit: BoxFit.cover)),
        Padding(
          padding: const EdgeInsets.all(12),
          child: ElevatedButton(
            onPressed: ()=> Navigator.of(context).pushNamed("/detect", arguments: path),
            child: const Text("Detect items"),
          ),
        )
      ])
    );
  }
}