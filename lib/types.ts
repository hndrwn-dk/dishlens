export type DetectedItem = {
  name: string;
  confidence: number;
  qty_guess?: string;
  form?: string;
};

export type IngredientEntry = { item: string; amount?: string };

export type Recipe = {
  title: string;
  total_time_min: number;
  difficulty: "easy" | "medium" | "hard";
  ingredients: IngredientEntry[];
  steps: string[];
  calories_est?: number;
  protein_g_est?: number;
  servings: number;
  pantry_used: string[];
  rationale?: string;
  score?: {
    ease: number;
    time: number;
    nutrition: number;
    coverage: number;
    pantry: number;
    diet: number;
    total: number;
  };
  image_url?: string;
};