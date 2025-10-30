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
    
    console.log('🍳 Generating recipes for items:', JSON.stringify(items));

    const input = [
      { role: "system" as const, content: RECIPES_SYSTEM },
      { role: "user" as const, content: recipesUser(JSON.stringify(items), dietary, tools) }
    ];

    console.log('📤 Calling OpenAI API...');
    const r = await openai.chat.completions.create({ 
      model: "gpt-4o-mini", 
      messages: input,
      temperature: 0.7
    });
    
    const text = r.choices[0]?.message?.content || "{}";
    console.log('📥 OpenAI response:', text.substring(0, 200) + '...');

    let parsed: any;
    try { 
      parsed = JSON.parse(text); 
    } catch (e) { 
      console.error('❌ JSON parse error:', e);
      return withCORS(NextResponse.json({ error: "LLM JSON parse error", raw: text }, { status: 502 })); 
    }

    if (!parsed.recipes || parsed.recipes.length === 0) {
      console.warn('⚠️ No recipes generated');
      return withCORS(NextResponse.json({ error: "No recipes generated", raw: text }, { status: 502 }));
    }

    const top3 = (parsed.recipes || [])
      .map((recipe: any) => {
        // Add fallback image URL if not provided
        if (!recipe.image_url) {
          const keywords = recipe.title.toLowerCase().replace(/\s+/g, '-');
          recipe.image_url = `https://source.unsplash.com/featured/400x300/?${keywords},food`;
        }
        return scoreRecipe(recipe);
      })
      .sort((a: any, b: any) => b.score.total - a.score.total)
      .slice(0, 3);

    console.log('✅ Returning', top3.length, 'recipes');
    return withCORS(NextResponse.json({ recipes: top3 }));
    
  } catch (error) {
    console.error('💥 Recipe generation error:', error);
    return withCORS(NextResponse.json({ 
      error: "Recipe generation failed", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 }));
  }
}