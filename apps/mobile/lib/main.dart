import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'features/camera/camera_screen.dart';
import 'features/detect/detect_screen.dart';
import 'features/recipes/recipes_screen.dart';
import 'models.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final cameras = await availableCameras();
  runApp(App(cameras: cameras));
}

class App extends StatelessWidget {
  final List<CameraDescription> cameras;
  const App({super.key, required this.cameras});

  @override Widget build(BuildContext context) {
    return MaterialApp(
      title: "DishLens",
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: const Color(0xFF08a88a)),
      routes: {
        "/": (_) => CameraScreen(cameras: cameras),
      },
      onGenerateRoute: (settings) {
        if (settings.name == "/detect") {
          final path = settings.arguments as String;
          return MaterialPageRoute(builder: (_) => DetectScreen(imagePath: path));
        }
        if (settings.name == "/recipes") {
          final items = (settings.arguments as List).cast<DetectedItem>();
          return MaterialPageRoute(builder: (_) => RecipesScreen(items: items));
        }
        return null;
      },
    );
  }
}
