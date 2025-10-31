import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { RECIPES_SYSTEM, recipesUser } from "@/lib/prompts";
import { scoreRecipe } from "@/lib/score";
import { withCORS } from "@/lib/cors";

export const runtime = "nodejs";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

function normalizeDetected(raw: Array<{ name: string; confidence?: number }> = []) {
  const RICE = new Set(["rice", "white rice", "cooked rice", "jasmine rice", "basmati", "steamed rice"]);
  const CHICKEN = new Set(["chicken", "meat", "roast chicken", "fried chicken", "grilled chicken"]);
  let hasRice = false;
  let hasChicken = false;
  const out: string[] = [];

  for (const r of raw) {
    const n = r.name?.toLowerCase().trim();
    if (!n) continue;
    if (RICE.has(n)) { hasRice = true; continue; }
    if (CHICKEN.has(n)) { hasChicken = true; continue; }
    if (n === "food" || n === "dish") continue;
    out.push(n);
  }
  if (hasRice) out.push("rice");
  if (hasChicken) out.push("chicken");

  return Array.from(new Set(out));
}

export async function OPTIONS() {
  return withCORS(NextResponse.json({ ok: true }));
}

export async function POST(req: NextRequest) {
  try {
    const { items = [], dietary, tools, locale } = await req.json();

    const dietList = Array.isArray(dietary)
      ? dietary
      : typeof dietary === "string" && dietary
      ? [dietary]
      : undefined;

    const cleanedNames = normalizeDetected(items);
    console.log("Generating recipes for:", cleanedNames);

    const messages = [
      { role: "system" as const, content: RECIPES_SYSTEM },
      {
        role: "user" as const,
        content: recipesUser(JSON.stringify(cleanedNames), dietList, tools, locale)
      }
    ];

    const r = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7
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
    } catch (e) {
      return withCORS(
        NextResponse.json({ error: "LLM JSON parse error", raw: text }, { status: 502 })
      );
    }

    if (!parsed.recipes || !Array.isArray(parsed.recipes) || parsed.recipes.length === 0) {
      return withCORS(
        NextResponse.json({ error: "No recipes generated", raw: text }, { status: 502 })
      );
    }

    const scored = (parsed.recipes as any[])
      .map((recipe, index) => {
        if (!recipe.image_url) {
          const titleLower = (recipe.title || "").toLowerCase();
          let photoIds: string[] = [];

          if (titleLower.includes("soup") || titleLower.includes("stew") || titleLower.includes("broth")) {
            photoIds = ["539451", "1703272", "2098085"];
          } else if (titleLower.includes("salad") || titleLower.includes("green")) {
            photoIds = ["1211887", "1640770", "2097090"];
          } else if (titleLower.includes("pasta") || titleLower.includes("spaghetti") || titleLower.includes("noodle")) {
            photoIds = ["1438672", "1279330", "1640772"];
          } else if (titleLower.includes("rice") || titleLower.includes("fried rice") || titleLower.includes("biryani")) {
            photoIds = ["2456435", "2456435", "1893555"];
          } else if (titleLower.includes("chicken") || titleLower.includes("poultry")) {
            photoIds = ["2338407", "60616", "616404"];
          } else if (titleLower.includes("beef") || titleLower.includes("meat") || titleLower.includes("rendang")) {
            photoIds = ["1279330", "769289", "410648"];
          } else if (titleLower.includes("fish") || titleLower.includes("seafood") || titleLower.includes("salmon")) {
            photoIds = ["1437590", "725991", "1683545"];
          } else if (titleLower.includes("curry") || titleLower.includes("spicy")) {
            photoIds = ["2474661", "2474658", "2703468"];
          } else if (titleLower.includes("stir") || titleLower.includes("fry")) {
            photoIds = ["2456435", "2456435", "1410235"];
          } else if (titleLower.includes("sandwich") || titleLower.includes("burger")) {
            photoIds = ["1639557", "1639562", "1633578"];
          } else {
            photoIds = ["1640777", "1279330", "1640772"];
          }

          const photoId = photoIds[index % photoIds.length];
          recipe.image_url = `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop`;
        }

        return scoreRecipe(recipe, cleanedNames, dietList);
      })
      .sort((a: any, b: any) => (b.score?.total ?? 0) - (a.score?.total ?? 0))
      .slice(0, 3);

    return withCORS(NextResponse.json({ recipes: scored }));
  } catch (error: any) {
    console.error("Recipe generation error:", error);
    return withCORS(
      NextResponse.json(
        { error: "Recipe generation failed", details: error?.message ?? "Unknown error" },
        { status: 500 }
      )
    );
  }
}