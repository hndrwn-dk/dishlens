import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { RECIPES_SYSTEM, recipesUser } from "@/lib/prompts";
import { scoreRecipe } from "@/lib/score";
import { withCORS } from "@/lib/cors";

export const runtime = "nodejs";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function OPTIONS() { return withCORS(NextResponse.json({ ok: true })); }

export async function POST(req: NextRequest) {
  try {
    const { items, dietary, tools } = await req.json();
    
    console.log('Generating recipes for items:', JSON.stringify(items));

    const input = [
      { role: "system" as const, content: RECIPES_SYSTEM },
      { role: "user" as const, content: recipesUser(JSON.stringify(items), dietary, tools) }
    ];

    console.log('Calling OpenAI API...');
    const r = await openai.chat.completions.create({ 
      model: "gpt-4o-mini", 
      messages: input,
      temperature: 0.7
    });
    
    let text = r.choices[0]?.message?.content || "{}";
    console.log('OpenAI response:', text.substring(0, 200) + '...');

    // Strip markdown code blocks if present
    text = text.trim();
    if (text.startsWith('```')) {
      const lines = text.split('\n');
      // Remove first line (```json or ```)
      lines.shift();
      // Remove last line (```)
      if (lines[lines.length - 1].trim() === '```') {
        lines.pop();
      }
      text = lines.join('\n').trim();
    }

    let parsed: any;
    try { 
      parsed = JSON.parse(text); 
    } catch (e) { 
      console.error('JSON parse error:', e);
      return withCORS(NextResponse.json({ error: "LLM JSON parse error", raw: text }, { status: 502 })); 
    }

    if (!parsed.recipes || parsed.recipes.length === 0) {
      console.warn('No recipes generated');
      return withCORS(NextResponse.json({ error: "No recipes generated", raw: text }, { status: 502 }));
    }

    const top3 = (parsed.recipes || [])
      .map((recipe: any, index: number) => {
        // Add fallback image URL if not provided
        if (!recipe.image_url) {
          // Map recipe types to appropriate food images from Pexels
          const titleLower = recipe.title.toLowerCase();
          let photoId = '1640777'; // default general dish
          
          if (titleLower.includes('soup') || titleLower.includes('stew') || titleLower.includes('broth')) {
            photoId = '539451';
          } else if (titleLower.includes('salad') || titleLower.includes('green')) {
            photoId = '1211887';
          } else if (titleLower.includes('pasta') || titleLower.includes('spaghetti') || titleLower.includes('noodle')) {
            photoId = '1438672';
          } else if (titleLower.includes('rice') || titleLower.includes('fried rice') || titleLower.includes('biryani')) {
            photoId = '2456435';
          } else if (titleLower.includes('chicken') || titleLower.includes('poultry')) {
            photoId = '2338407';
          } else if (titleLower.includes('beef') || titleLower.includes('steak') || titleLower.includes('meat')) {
            photoId = '1279330';
          } else if (titleLower.includes('fish') || titleLower.includes('seafood') || titleLower.includes('salmon')) {
            photoId = '1437590';
          } else if (titleLower.includes('curry') || titleLower.includes('spicy')) {
            photoId = '2474661';
          } else if (titleLower.includes('stir') || titleLower.includes('fry')) {
            photoId = '2456435';
          } else if (titleLower.includes('sandwich') || titleLower.includes('burger')) {
            photoId = '1639557';
          }
          
          recipe.image_url = `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop`;
        }
        return scoreRecipe(recipe);
      })
      .sort((a: any, b: any) => b.score.total - a.score.total)
      .slice(0, 3);

    console.log('Returning', top3.length, 'recipes');
    return withCORS(NextResponse.json({ recipes: top3 }));
    
  } catch (error) {
    console.error('Recipe generation error:', error);
    return withCORS(NextResponse.json({ 
      error: "Recipe generation failed", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 }));
  }
}