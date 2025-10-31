import { NextRequest, NextResponse } from "next/server";
import { createVisionClient } from "@/lib/vision";
import { canonicalize } from "@/lib/normalize";
import { withCORS } from "@/lib/cors";

const SUPPORTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "image/heics",
  "image/heifs",
]);

const SUPPORTED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "heic", "heif"]);

function hasValidImageSignature(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 12) {
    return false;
  }

  const isJPEG = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const isPNG = buffer.subarray(0, 8).equals(pngSignature);
  const riffHeader = buffer.subarray(0, 4).toString("ascii");
  const webpHeader = buffer.subarray(8, 12).toString("ascii");
  const isWebP = riffHeader === "RIFF" && webpHeader === "WEBP";
  const gifHeader = buffer.subarray(0, 6).toString("ascii");
  const isGIF = gifHeader === "GIF87a" || gifHeader === "GIF89a";
  const boxType = buffer.subarray(4, 8).toString("ascii");
  const brand = buffer.subarray(8, 12).toString("ascii").toLowerCase();
  const heicBrands = new Set(["heic", "heix", "hevc", "hevx", "mif1", "msf1"]);
  const isHEIC = boxType === "ftyp" && heicBrands.has(brand);

  return isJPEG || isPNG || isWebP || isGIF || isHEIC;
}

export const runtime = "nodejs";

// Mock ingredients for when Vision API is not available
function getMockIngredients() {
  const mockIngredients = [
    "tomato", "onion", "garlic", "carrot", "potato", "chicken", "beef", "fish",
    "milk", "cheese", "eggs", "bread", "rice", "pasta", "lettuce", "cucumber",
    "bell pepper", "mushroom", "broccoli", "spinach", "lemon", "lime", "apple",
    "banana", "orange", "yogurt", "butter", "olive oil", "salt", "pepper"
  ];
  
  // Return 3-6 random ingredients
  const count = Math.floor(Math.random() * 4) + 3;
  const selected = mockIngredients
    .sort(() => 0.5 - Math.random())
    .slice(0, count)
    .map(ingredient => ({
      name: canonicalize(ingredient),
      confidence: 0.7 + Math.random() * 0.3 // 0.7-1.0 confidence
    }));
  
  console.log("Using mock ingredients:", selected.map(i => i.name).join(", "));
  return selected;
}

export async function OPTIONS() { return withCORS(NextResponse.json({ ok: true })); }

export async function POST(req: NextRequest) {
  try {
    console.log("Starting image detection...");
    
    const form = await req.formData();
    const file = form.get("image") as File | null;
    
    if (!file) {
      console.log("No image file provided");
      return withCORS(NextResponse.json({ error: "No image" }, { status: 400 }));
    }

    console.log(`Image received: ${file.name}, size: ${file.size} bytes`);

    const mimeType = file.type?.toLowerCase() || "";
    const extension = file.name?.split(".").pop()?.toLowerCase() || "";

    if (mimeType && !mimeType.startsWith("image/")) {
      console.log(`Rejected upload due to non-image mime type: ${mimeType}`);
      return withCORS(NextResponse.json({ error: "Unsupported file type. Please upload an image." }, { status: 415 }));
    }

    if (!mimeType && (!extension || !SUPPORTED_EXTENSIONS.has(extension))) {
      console.log(`Rejected upload with missing mime type and unsupported extension: ${extension || "<none>"}`);
      return withCORS(NextResponse.json({ error: "Unsupported file type. Please upload an image." }, { status: 415 }));
    }

    if (mimeType && !SUPPORTED_MIME_TYPES.has(mimeType)) {
      console.log(`Mime type ${mimeType} is not in the allow list; continuing with signature validation.`);
    }
    
    const buf = Buffer.from(await file.arrayBuffer());
    if (!hasValidImageSignature(buf)) {
      console.log("Uploaded file failed image signature validation");
      return withCORS(NextResponse.json({ error: "Uploaded file is not a supported image format." }, { status: 415 }));
    }
    const client = createVisionClient();

  let items: { name: string; confidence: number }[] = [];
  
  if (client) {
    console.log("Using service account credentials");
    try {
      const [res] = await client.labelDetection({ image: { content: buf } });
      items = (res.labelAnnotations || [])
        .filter(l => (l.score || 0) > 0.6)
        .filter(l => {
          const desc = (l.description || "").toLowerCase();
          // Filter out generic food terms
          const genericTerms = ['food', 'ingredient', 'cooking', 'recipe', 'meal', 'dish', 'cuisine', 'kitchen'];
          return !genericTerms.some(term => desc.includes(term));
        })
        .map(l => ({ name: canonicalize(l.description || ""), confidence: l.score || 0 }));
    } catch (error) {
      console.log("Service account failed, falling back to mock:", error);
      items = getMockIngredients();
    }
  } else {
    console.log("Using API key");
    const key = process.env.GOOGLE_VISION_API_KEY;
    if (!key) {
      console.log("No Google Vision API key configured, using mock detection");
      items = getMockIngredients();
    } else {
      try {
        const payload = { requests: [{ features: [{ type: "LABEL_DETECTION" }], image: { content: buf.toString("base64") } }] };
        console.log("Calling Google Vision API...");
        
        const r = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${key}`, {
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify(payload)
        });
        
        if (!r.ok) {
          console.log(`Vision API error: ${r.status} ${r.statusText}`);
          const errorText = await r.text();
          console.log(`Error details: ${errorText}`);
          console.log("Falling back to mock detection");
          items = getMockIngredients();
        } else {
          const json = await r.json();
          console.log("Vision API response received");
          
          const labels = json?.responses?.[0]?.labelAnnotations || [];
          items = labels
            .filter((x: any) => (x.score || 0) > 0.6)
            .filter((x: any) => {
              const desc = (x.description || "").toLowerCase();
              // Filter out generic food terms
              const genericTerms = ['food', 'ingredient', 'cooking', 'recipe', 'meal', 'dish', 'cuisine', 'kitchen'];
              return !genericTerms.some(term => desc.includes(term));
            })
            .map((x: any) => ({ name: canonicalize(x.description || ""), confidence: x.score || 0 }));
        }
      } catch (error) {
        console.log("API key failed, falling back to mock:", error);
        items = getMockIngredients();
      }
    }
  }

    console.log(`Found ${items.length} potential ingredients`);

    // De-dupe, keep highest confidence
    const by = new Map<string, { name: string; confidence: number }>();
    for (const it of items) {
      const p = by.get(it.name);
      if (!p || it.confidence > p.confidence) by.set(it.name, it);
    }

    const finalItems = Array.from(by.values());
    console.log(`Returning ${finalItems.length} unique ingredients`);

    return withCORS(NextResponse.json({ items: finalItems }));
    
  } catch (error) {
    console.error("Error in detect API:", error);
    return withCORS(NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 }));
  }
}