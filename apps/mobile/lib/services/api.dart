import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../config.dart';
import '../models.dart';

Future<List<DetectedItem>> detectItems(String imagePath) async {
  final uri = Uri.parse("$kApiBase/api/detect");
  final req = http.MultipartRequest("POST", uri);
  req.files.add(await http.MultipartFile.fromPath("image", imagePath));
  final res = await req.send();
  final body = await res.stream.bytesToString();
  if (res.statusCode != 200) { throw Exception("Detect failed: $body"); }
  final data = jsonDecode(body) as Map<String, dynamic>;
  return (data["items"] as List).map((e) => DetectedItem.fromJson(e)).toList();
}

Future<List<Recipe>> generateRecipes(List<DetectedItem> items) async {
  final uri = Uri.parse("$kApiBase/api/recipes");
  final res = await http.post(uri,
    headers: {"Content-Type":"application/json"},
    body: jsonEncode({"items": items.map((e)=>e.toJson()).toList()}));
  if (res.statusCode != 200) { throw Exception("Recipes failed: ${res.body}"); }
  final data = jsonDecode(res.body) as Map<String,dynamic>;
  return (data["recipes"] as List).map((e)=>Recipe.fromJson(e)).toList();
}