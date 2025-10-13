# DishLens Backend (Vercel)

## Endpoints
- POST /api/detect  (multipart: image=<file>) -> { items: [{name,confidence}] }
- POST /api/recipes (json: {items, dietary?, tools?}) -> { recipes: [...] }
- POST /api/swap    (json: {recipe, swapOut, swapIn}) -> { recipe }

## Env
OPENAI_API_KEY=...
# EITHER:
GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account",...}'
# OR:
GOOGLE_VISION_API_KEY=...
ALLOWED_ORIGINS=https://dishlens-one.vercel.app,http://localhost:3000