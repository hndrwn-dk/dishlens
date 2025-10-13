class DetectedItem {
  final String name;
  final double confidence;
  DetectedItem({required this.name, required this.confidence});
  Map<String, dynamic> toJson() => {"name": name, "confidence": confidence};
  static DetectedItem fromJson(Map<String,dynamic> j) =>
    DetectedItem(name: j["name"], confidence: (j["confidence"] as num).toDouble());
}

class Recipe {
  final String title;
  final int totalTimeMin;
  final String difficulty;
  final List<Map<String,dynamic>> ingredients;
  final List<String> steps;
  final double? calories;
  final double? protein;
  final int servings;
  final List<String> pantry;
  final Map<String,dynamic>? score;
  Recipe({
    required this.title, required this.totalTimeMin, required this.difficulty,
    required this.ingredients, required this.steps, this.calories, this.protein,
    required this.servings, required this.pantry, this.score
  });
  static Recipe fromJson(Map<String,dynamic> j) => Recipe(
    title: j["title"], totalTimeMin: j["total_time_min"], difficulty: j["difficulty"],
    ingredients: List<Map<String,dynamic>>.from(j["ingredients"] ?? []),
    steps: List<String>.from(j["steps"] ?? []),
    calories: (j["calories_est"] as num?)?.toDouble(),
    protein: (j["protein_g_est"] as num?)?.toDouble(),
    servings: j["servings"] ?? 2,
    pantry: List<String>.from(j["pantry_used"] ?? []),
    score: j["score"] as Map<String,dynamic>?
  );
}