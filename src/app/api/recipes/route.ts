import { NextRequest, NextResponse } from 'next/server';
import { generateRecipes } from '@/lib/llm';
import { scoreRecipe } from '@/lib/score';

export async function POST(req: NextRequest) {
  try {
    const { items, dietary, tools } = await req.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 });
    }

    const recipes = await generateRecipes(items, dietary, tools);
    
    // Score and sort recipes
    const scoredRecipes = recipes
      .map(recipe => ({ ...recipe, score: scoreRecipe(recipe) }))
      .sort((a, b) => b.score.total - a.score.total)
      .slice(0, 3);

    return NextResponse.json({ recipes: scoredRecipes });
  } catch (error) {
    console.error('Error in recipes API:', error);
    return NextResponse.json({ error: 'Failed to generate recipes' }, { status: 500 });
  }
}