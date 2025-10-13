import { NextRequest, NextResponse } from "next/server";
import { createVisionClient } from "../../lib/vision";
import { canonicalize } from "../../lib/normalize";
import { withCORS } from "../../lib/cors";

export const runtime = "nodejs";

export async function OPTIONS() { return withCORS(NextResponse.json({ ok: true })); }

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("image") as File | null;
  if (!file) return withCORS(NextResponse.json({ error: "No image" }, { status: 400 }));

  const buf = Buffer.from(await file.arrayBuffer());
  const client = createVisionClient();

  let items: { name: string; confidence: number }[] = [];
  if (client) {
    const [res] = await client.labelDetection({ image: { content: buf } });
    items = (res.labelAnnotations || [])
      .filter(l => (l.score || 0) > 0.6)
      .map(l => ({ name: canonicalize(l.description || ""), confidence: l.score || 0 }));
  } else {
    const key = process.env.GOOGLE_VISION_API_KEY;
    if (!key) return withCORS(NextResponse.json({ error: "Vision not configured" }, { status: 500 }));
    const payload = { requests: [{ features: [{ type: "LABEL_DETECTION" }], image: { content: buf.toString("base64") } }] };
    const r = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${key}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
    });
    const json = await r.json();
    const labels = json?.responses?.[0]?.labelAnnotations || [];
    items = labels.filter((x: any) => (x.score || 0) > 0.6)
      .map((x: any) => ({ name: canonicalize(x.description || ""), confidence: x.score || 0 }));
  }

  // De-dupe, keep highest confidence
  const by = new Map<string, { name: string; confidence: number }>();
  for (const it of items) {
    const p = by.get(it.name);
    if (!p || it.confidence > p.confidence) by.set(it.name, it);
  }

  return withCORS(NextResponse.json({ items: Array.from(by.values()) }));
}