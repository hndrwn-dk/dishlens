import { Recipe } from "./types";

export function scoreRecipe(r: Recipe) {
  const ease = Math.max(0, 10 - (r.steps?.length ?? 0)) + (r.difficulty === "easy" ? 3 : r.difficulty === "medium" ? 1 : 0);
  const time = r.total_time_min <= 15 ? 10 : r.total_time_min <= 30 ? 7 : r.total_time_min <= 45 ? 4 : 1;
  let nutrition = 0;
  if (r.protein_g_est) nutrition += Math.min(10, r.protein_g_est / 10);
  if (r.calories_est)  nutrition += (r.calories_est >= 300 && r.calories_est <= 650) ? 4 : (r.calories_est < 300 ? 2 : 1);
  r.score = { ease, time, nutrition, total: Math.round((ease * 0.4 + time * 0.3 + nutrition * 0.3) * 10) / 10 };
  return r;
}