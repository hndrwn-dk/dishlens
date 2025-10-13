import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { RECIPES_SYSTEM, recipesUser } from "../../lib/prompts";
import { scoreRecipe } from "../../lib/score";
import { withCORS } from "../../lib/cors";

export const runtime = "nodejs";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function OPTIONS() { return withCORS(NextResponse.json({ ok: true })); }

export async function POST(req: NextRequest) {
  const { items, dietary, tools } = await req.json();

  const input = [
    { role: "system" as const, content: RECIPES_SYSTEM },
    { role: "user" as const, content: recipesUser(JSON.stringify(items), dietary, tools) }
  ];

  const r = await openai.chat.completions.create({ model: "gpt-4o-mini", messages: input });
  const text = r.choices[0]?.message?.content || "{}";

  let parsed: any;
  try { parsed = JSON.parse(text); }
  catch { return withCORS(NextResponse.json({ error: "LLM JSON parse error", raw: text }, { status: 502 })); }

  const top3 = (parsed.recipes || [])
    .map(scoreRecipe)
    .sort((a: any, b: any) => b.score.total - a.score.total)
    .slice(0, 3);

  return withCORS(NextResponse.json({ recipes: top3 }));
}