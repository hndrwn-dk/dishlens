import { DetectedItem, Recipe } from '@/types';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function generateRecipes(
  items: DetectedItem[], 
  dietary?: string[], 
  tools?: string[]
): Promise<Recipe[]> {
  const prompt = buildRecipePrompt(items, dietary, tools);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a practical home cook. Create 3 recipes using ONLY the provided ingredients plus at most 3 pantry items (salt, pepper, oil).
Prioritize: minimal steps, one-pan options, realistic techniques. No fancy appliances unless provided in "tools".
Return JSON only: { "recipes": Recipe[] } with short steps (max 8).

Each recipe must:
- fit 20–35 minutes (MVP),
- clearly list ingredients with approximate amounts,
- include servings and per-serving calories/protein ESTIMATES (rough).`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);
    return parsed.recipes || [];
  } catch (error) {
    console.error('Error generating recipes:', error);
    return [];
  }
}

export async function swapIngredient(
  recipe: Recipe, 
  swapOut: string, 
  swapIn: string
): Promise<Recipe> {
  const prompt = `Original: ${JSON.stringify(recipe)}
Swap out: ${swapOut}; Swap in: ${swapIn}.
Adjust amounts, steps, and time if needed.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are rewriting a given recipe by swapping one ingredient with another while preserving flavor and steps with minimal changes.
Return valid Recipe JSON.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Error swapping ingredient:', error);
    return recipe;
  }
}

function buildRecipePrompt(items: DetectedItem[], dietary?: string[], tools?: string[]): string {
  return `Ingredients (canonical): ${JSON.stringify(items)}
Constraints: ${dietary || "none"}
Tools: ${tools || "stovetop, oven"}`;
}