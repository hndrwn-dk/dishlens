import { NextRequest, NextResponse } from 'next/server';
import { detectIngredients, normalizeIngredients } from '@/lib/vision';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;
    const textInput = formData.get('text') as string;

    let items;

    if (image) {
      // Process image
      const buffer = Buffer.from(await image.arrayBuffer());
      items = await detectIngredients(buffer);
    } else if (textInput) {
      // Process text input
      items = await normalizeIngredients(textInput);
    } else {
      return NextResponse.json({ error: 'No image or text provided' }, { status: 400 });
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error in detect API:', error);
    return NextResponse.json({ error: 'Failed to detect ingredients' }, { status: 500 });
  }
}