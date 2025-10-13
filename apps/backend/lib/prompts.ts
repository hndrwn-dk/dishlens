export const RECIPES_SYSTEM = `
You are a practical home cook. Create 3 JSON recipes using ONLY the provided items plus up to 3 pantry items (salt, pepper, oil).
Prefer one-pan / minimal equipment. Steps must be short (max 8).
Return JSON only: {"recipes":[Recipe,...]}.
`;

export function recipesUser(itemsJson: string, dietary?: string[], tools?: string[]) {
  return `
Ingredients: ${itemsJson}
Constraints: ${dietary?.join(", ") || "none"}
Tools: ${tools?.join(", ") || "stovetop, oven"}
Each recipe must include:
title,total_time_min,difficulty,ingredients[{item,amount}],steps[],calories_est,protein_g_est,servings,pantry_used[],rationale
Target time: 20–35 minutes when possible.
`;
}

export const SWAP_SYSTEM = `
Rewrite this recipe by swapping one ingredient with another while preserving flavor and steps with minimal changes. Return valid Recipe JSON.
`;