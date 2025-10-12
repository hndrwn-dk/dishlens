import { Recipe, RecipeScore } from '@/types';

export function scoreRecipe(r: Recipe): RecipeScore {
  // Ease: fewer steps + "easy" difficulty
  const ease = Math.max(0, 10 - r.steps.length) + (r.difficulty === "easy" ? 3 : r.difficulty === "medium" ? 1 : 0);
  
  // Time: shorter is better; assume <=15 = 10, 30 = 6, 45 = 3
  const time = r.total_time_min <= 15 ? 10 : r.total_time_min <= 30 ? 7 : r.total_time_min <= 45 ? 4 : 1;
  
  // Nutrition: higher protein, moderate calories (300–650 per serving)
  let nutrition = 0;
  if (r.protein_g_est) nutrition += Math.min(10, r.protein_g_est / 10); // 30g -> 3 pts, cap 10
  if (r.calories_est) {
    const c = r.calories_est;
    nutrition += (c >= 300 && c <= 650) ? 4 : (c < 300 ? 2 : 1);
  }
  
  const total = ease * 0.4 + time * 0.3 + nutrition * 0.3;
  return { ease, time, nutrition, total: Math.round(total * 10) / 10 };
}