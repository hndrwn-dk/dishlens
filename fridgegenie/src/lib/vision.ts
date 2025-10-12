import { DetectedItem } from '@/types';

// Simple ingredient normalization mapping (for future use)
// const INGREDIENT_MAP: Record<string, string> = {
//   'bell pepper': 'capsicum',
//   'spring onion': 'scallion',
//   'courgette': 'zucchini',
//   'aubergine': 'eggplant',
//   'rocket': 'arugula',
//   'coriander': 'cilantro',
//   'beetroot': 'beet',
//   'sweet potato': 'sweet potato',
//   'red pepper': 'red bell pepper',
//   'green pepper': 'green bell pepper',
//   'yellow pepper': 'yellow bell pepper',
// };

export async function detectIngredients(_imageBuffer: Buffer): Promise<DetectedItem[]> {
  // For MVP, we'll use a mock implementation
  // In production, this would integrate with Google Vision API
  return mockDetectIngredients();
}

function mockDetectIngredients(): DetectedItem[] {
  // Mock data for demo purposes
  return [
    { name: 'chicken breast', confidence: 0.9, qty_guess: '2 pieces', form: 'fresh' },
    { name: 'broccoli', confidence: 0.8, qty_guess: '1 head', form: 'fresh' },
    { name: 'carrot', confidence: 0.85, qty_guess: '3 medium', form: 'fresh' },
    { name: 'onion', confidence: 0.9, qty_guess: '1 large', form: 'fresh' },
    { name: 'garlic', confidence: 0.7, qty_guess: '3 cloves', form: 'fresh' },
  ];
}

export async function normalizeIngredients(rawText: string): Promise<DetectedItem[]> {
  const prompt = `You clean noisy grocery terms into canonical ingredient names, with rough amounts.
Return JSON only: { "items": [{ "name": "", "qty_guess": "", "form": "", "confidence": 0-1 }] }.
Use singular, lowercase names. If amount unknown, omit.

Raw: ${rawText}

Pantry allowed by default: salt, pepper, oil. Do not invent items.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You clean noisy grocery terms into canonical ingredient names, with rough amounts.
Return JSON only: { "items": [{ "name": "", "qty_guess": "", "form": "", "confidence": 0-1 }] }.
Use singular, lowercase names. If amount unknown, omit.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);
    return parsed.items || [];
  } catch (error) {
    console.error('Error normalizing ingredients:', error);
    return [];
  }
}