import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { SWAP_SYSTEM } from "@/lib/prompts";
import { scoreRecipe } from "@/lib/score";
import { withCORS } from "@/lib/cors";

export const runtime = "nodejs";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function OPTIONS() {
  return withCORS(NextResponse.json({ ok: true }));
}

export async function POST(req: NextRequest) {
  try {
    const { recipe, swapOut, swapIn, detected, dietary } = await req.json();

    if (!recipe || !swapOut || !swapIn) {
      return withCORS(
        NextResponse.json({ error: "recipe, swapOut, and swapIn are required" }, { status: 400 })
      );
    }

    const dietList = Array.isArray(dietary)
      ? dietary
      : typeof dietary === "string" && dietary
      ? [dietary]
      : undefined;

    const input = [
      { role: "system" as const, content: SWAP_SYSTEM },
      {
        role: "user" as const,
        content: JSON.stringify({
          original: recipe,
          swap_out: swapOut,
          swap_in: swapIn,
          detected_ingredients: detected || [],
          dietary_constraints: dietList || []
        })
      }
    ];

    const r = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: input,
      temperature: 0.4
    });

    let text = r.choices[0]?.message?.content || "{}";
    text = text.trim();

    if (text.startsWith("```")) {
      const lines = text.split("\n");
      lines.shift();
      if (lines[lines.length - 1].trim() === "```") lines.pop();
      text = lines.join("\n").trim();
    }

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      return withCORS(
        NextResponse.json({ error: "LLM JSON parse error", raw: text }, { status: 502 })
      );
    }

    const swapped = parsed.recipe ?? parsed;

    if (!swapped.image_url && recipe.image_url) {
      swapped.image_url = recipe.image_url;
    }

    const detectedNames: string[] = Array.isArray(detected)
      ? detected.map((d: any) => (typeof d === "string" ? d : d?.name)).filter(Boolean)
      : [];

    const scored = scoreRecipe(swapped, detectedNames, dietList);

    return withCORS(NextResponse.json({ recipe: scored }));
  } catch (err: any) {
    return withCORS(
      NextResponse.json(
        { error: "Swap failed", details: err?.message ?? "Unknown error" },
        { status: 500 }
      )
    );
  }
}