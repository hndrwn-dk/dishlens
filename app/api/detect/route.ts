import { NextRequest, NextResponse } from "next/server";
import { createVisionClient } from "@/lib/vision";
import { canonicalize } from "@/lib/normalize";
import { withCORS } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS() { return withCORS(NextResponse.json({ ok: true })); }

export async function POST(req: NextRequest) {
  try {
    console.log("🔍 Starting image detection...");
    
    const form = await req.formData();
    const file = form.get("image") as File | null;
    
    if (!file) {
      console.log("❌ No image file provided");
      return withCORS(NextResponse.json({ error: "No image" }, { status: 400 }));
    }

    console.log(`📸 Image received: ${file.name}, size: ${file.size} bytes`);
    
    const buf = Buffer.from(await file.arrayBuffer());
    const client = createVisionClient();

    let items: { name: string; confidence: number }[] = [];
    
    if (client) {
      console.log("🔧 Using service account credentials");
      const [res] = await client.labelDetection({ image: { content: buf } });
      items = (res.labelAnnotations || [])
        .filter(l => (l.score || 0) > 0.6)
        .map(l => ({ name: canonicalize(l.description || ""), confidence: l.score || 0 }));
    } else {
      console.log("🔑 Using API key");
      const key = process.env.GOOGLE_VISION_API_KEY;
      if (!key) {
        console.log("❌ No Google Vision API key configured");
        return withCORS(NextResponse.json({ error: "Vision not configured" }, { status: 500 }));
      }
      
      const payload = { requests: [{ features: [{ type: "LABEL_DETECTION" }], image: { content: buf.toString("base64") } }] };
      console.log("🌐 Calling Google Vision API...");
      
      const r = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${key}`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload)
      });
      
      if (!r.ok) {
        console.log(`❌ Vision API error: ${r.status} ${r.statusText}`);
        const errorText = await r.text();
        console.log(`Error details: ${errorText}`);
        return withCORS(NextResponse.json({ error: "Vision API error", details: errorText }, { status: r.status }));
      }
      
      const json = await r.json();
      console.log("✅ Vision API response received");
      
      const labels = json?.responses?.[0]?.labelAnnotations || [];
      items = labels.filter((x: any) => (x.score || 0) > 0.6)
        .map((x: any) => ({ name: canonicalize(x.description || ""), confidence: x.score || 0 }));
    }

    console.log(`🎯 Found ${items.length} potential ingredients`);

    // De-dupe, keep highest confidence
    const by = new Map<string, { name: string; confidence: number }>();
    for (const it of items) {
      const p = by.get(it.name);
      if (!p || it.confidence > p.confidence) by.set(it.name, it);
    }

    const finalItems = Array.from(by.values());
    console.log(`✨ Returning ${finalItems.length} unique ingredients`);

    return withCORS(NextResponse.json({ items: finalItems }));
    
  } catch (error) {
    console.error("💥 Error in detect API:", error);
    return withCORS(NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 }));
  }
}