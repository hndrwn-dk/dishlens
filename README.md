# DishLens

DishLens turns the contents of your fridge into curated meal ideas. Snap a photo, let our AI detect ingredients, generate recipes, and guide you through cooking with a premium, one-handed experience.

## Core Features
- Smart ingredient detection powered by Google Vision with strict image-only upload validation
- Recipe generation that blends detected items with OpenAI culinary insights
- Guided “Start Cooking” mode designed for mobile, one-handed use with rich timers and progress tracking
- Ingredient intelligence including confidence scoring, icons, and swap suggestions
- Cross-platform support: Next.js web app + Flutter mobile client sharing the same AI back end

## Tech Stack
- **Web & API**: Next.js 14 (App Router), TypeScript, Tailwind CSS, OpenAI SDK, Google Cloud Vision
- **Mobile**: Flutter 3 with a modular feature structure ready for iOS, Android, and desktop targets
- **Tooling**: Node.js ≥ 18, npm, PostCSS, Lucide icons, shared utility libraries under `lib/`

## Monorepo Layout
- `app/` – Next.js app router pages, UI, and API routes (`app/api/*`)
- `lib/` – Shared TypeScript helpers (prompting, scoring, normalization, CORS, etc.)
- `apps/mobile/` – Flutter application with feature-first organization (`camera`, `detect`, `cook`, `recipes`)
- `public/` – Static assets for the web client

## Getting Started (Web)
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment** – create `.env.local` with the variables listed below
3. **Run the dev server**
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:3001` to explore the DishLens experience.

### Environment Variables
```
OPENAI_API_KEY=
# Choose one vision auth strategy:
GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account",...}'
GOOGLE_VISION_API_KEY=
ALLOWED_ORIGINS=https://dishlens-one.vercel.app,http://localhost:3000
```

## Getting Started (Mobile)
1. Install Flutter 3.22 or newer and run `flutter doctor`
2. From `apps/mobile/`, fetch packages with `flutter pub get`
3. Use `flutter run` (optionally `-d chrome`/`-d ios`/`-d android`) to launch the companion client that consumes the same API surface

## API Surface
| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/detect` | Accepts `multipart/form-data` with an `image` field; returns normalized `{ items: [{ name, confidence }] }` |
| `POST` | `/api/recipes` | JSON `{ items, dietary?, tools? }` → curated `recipes[]` with timing, difficulty, nutrition hints |
| `POST` | `/api/swap` | JSON `{ recipe, swapOut, swapIn }` → recipe variant recommendations |

## Contributing
We welcome collaborators who love great food experiences and delightful UX:
- Fork the repository, create a branch, and submit a pull request with context on the problem you are solving
- Add tests or manual verification notes when modifying AI prompts or cooking flows
- Share design or product ideas via issues—especially around ingredient detection, accessibility, or new cooking surfaces

## What’s Next
- Expand model-backed ingredient substitution and dietary filters
- Polish Flutter parity with the new cooking assistant and camera capture flows
- Integrate richer analytics on detection accuracy and recipe engagement

Let’s build the smartest, friendliest cooking companion together!🍳