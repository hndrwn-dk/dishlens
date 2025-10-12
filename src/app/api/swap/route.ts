import { NextRequest, NextResponse } from 'next/server';
import { swapIngredient } from '@/lib/llm';
import { scoreRecipe } from '@/lib/score';

export async function POST(req: NextRequest) {
  try {
    const { recipe, swapOut, swapIn } = await req.json();

    if (!recipe || !swapOut || !swapIn) {
      return NextResponse.json({ error: 'Recipe, swapOut, and swapIn are required' }, { status: 400 });
    }

    const updatedRecipe = await swapIngredient(recipe, swapOut, swapIn);
    
    // Re-score the updated recipe
    const scoredRecipe = { ...updatedRecipe, score: scoreRecipe(updatedRecipe) };

    return NextResponse.json({ recipe: scoredRecipe });
  } catch (error) {
    console.error('Error in swap API:', error);
    return NextResponse.json({ error: 'Failed to swap ingredient' }, { status: 500 });
  }
}