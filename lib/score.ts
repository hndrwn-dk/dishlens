import { Recipe } from "@/lib/types";

type Score = {
  ease: number;
  time: number;
  nutrition: number;
  coverage: number;
  pantry: number;
  diet: number;
  total: number;
};

export function scoreRecipe(
  r: Recipe,
  detectedNames: string[] = [],
  diet?: string[]
) {
  const steps = r.steps?.length ?? 0;
  const easeBase = Math.max(0, 10 - steps);
  const diffBonus =
    r.difficulty === "easy" ? 3 :
    r.difficulty === "medium" ? 1 : 0;
  const ease = clamp(easeBase + diffBonus, 0, 12);

  const t = r.total_time_min ?? 30;
  const time =
    t <= 15 ? 10 :
    t <= 25 ? 9 :
    t <= 35 ? 7 :
    t <= 45 ? 4 : 1;

  let nutrition = 0;
  if (r.protein_g_est) {
    nutrition += r.protein_g_est >= 20 ? 8 : Math.min(8, r.protein_g_est / 3);
  }
  if (r.calories_est) {
    if (r.calories_est >= 350 && r.calories_est <= 700) nutrition += 4;
    else if (r.calories_est < 350) nutrition += 2;
    else nutrition += 1;
  }
  nutrition = clamp(nutrition, 0, 12);

  const recipeIng = (r.ingredients ?? [])
    .map(i => i.item?.toLowerCase().trim())
    .filter(Boolean) as string[];
  const det = Array.from(
    new Set(detectedNames.map(n => n.toLowerCase().trim()).filter(Boolean))
  );
  let used = 0;
  for (const d of det) {
    if (recipeIng.some(ri => ri === d || ri.includes(d) || d.includes(ri))) {
      used++;
    }
  }
  const coverage = det.length ? Math.round((used / det.length) * 10) : 5;

  const pantryUsed = r.pantry_used?.length ?? 0;
  const pantry =
    pantryUsed <= 2 ? 10 :
    pantryUsed === 3 ? 7 :
    pantryUsed === 4 ? 5 : 2;

  let dietScore = 5;
  if (diet && diet.length) {
    const recipeTags = (r as any).tags?.map((t: string) => t.toLowerCase()) ?? [];
    const wants = diet.map(d => d.toLowerCase());
    const matched = wants.filter(w => recipeTags.includes(w)).length;
    dietScore = matched === wants.length ? 10 : matched > 0 ? 7 : 3;
  }

  const totalRaw =
    ease * 0.25 +
    time * 0.15 +
    nutrition * 0.2 +
    coverage * 0.2 +
    pantry * 0.1 +
    dietScore * 0.1;

  const total = Math.round(totalRaw * 10) / 10;

  r.score = { ease, time, nutrition, coverage, pantry, diet: dietScore, total } as Score;
  return r;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}