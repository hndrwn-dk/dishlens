import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { SWAP_SYSTEM } from "@/lib/prompts";
import { scoreRecipe } from "@/lib/score";
import { withCORS } from "@/lib/cors";

export const runtime = "nodejs";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function OPTIONS() { return withCORS(NextResponse.json({ ok: true })); }

export async function POST(req: NextRequest) {
  const { recipe, swapOut, swapIn } = await req.json();
  const input = [
    { role: "system" as const, content: SWAP_SYSTEM },
    { role: "user" as const, content: `Original:\n${JSON.stringify(recipe)}\nSwap out: ${swapOut}\nSwap in: ${swapIn}` }
  ];
  const r = await openai.chat.completions.create({ model: "gpt-4o-mini", messages: input });
  const text = r.choices[0]?.message?.content || "{}";

  let out: any;
  try { out = JSON.parse(text); }
  catch { return withCORS(NextResponse.json({ error: "LLM JSON parse error", raw: text }, { status: 502 })); }

  return withCORS(NextResponse.json({ recipe: scoreRecipe(out) }));
}