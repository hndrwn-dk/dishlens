export type DetectedItem = {
  name: string;        // "egg", "spinach"
  confidence: number;  // 0..1
  qty_guess?: string;  // "2", "200g", "1 cup"
  form?: string;       // "fresh", "frozen", "cooked", "leftover"
};

export type Recipe = {
  title: string;
  total_time_min: number;
  difficulty: "easy" | "medium" | "hard";
  ingredients: { item: string; amount?: string }[];
  steps: string[];                  // 5–8 short lines
  calories_est?: number;            // per serving
  protein_g_est?: number;
  servings: number;
  pantry_used: string[];            // e.g., ["salt", "oil", "pepper"]
  rationale?: string;               // why this fits the inputs
  score: { ease: number; time: number; nutrition: number; total: number };
};

export type RecipeScore = {
  ease: number;
  time: number;
  nutrition: number;
  total: number;
};