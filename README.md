# Indian Culture Explorer — 28 States Edition

A responsive React + Vite college-project interface for exploring India's cultural diversity.

## Run
```bash
npm install
npm run dev
```

## Highlights
- All 28 Indian states included in the States section.
- Search by state, region, language, food, art, dance, etc.
- Regional filters.
- Click any state for a full cultural profile modal.
- Each state has a dedicated image URL and diversity fields.
- Gallery, quiz, cultural layers, unity-in-diversity section and sources area.

Images are loaded from public image URLs so the project stays lightweight. An internet connection is recommended for images and Google Fonts.

## Bharat AI (optional backend)

The Bharat AI workspace is available from the main navigation or at `/bharat-ai`. It includes cultural chat, recommendations, image identification, AI quizzes, multilingual explanations, a cultural journey planner, comparisons, and story generation. The API key is used only by the backend. If it is not configured, AI actions show a setup message instead of returning a mock answer.

1. Copy `.env.example` to `.env` and set `AI_API_KEY`, `AI_MODEL`, `JWT_SECRET` (at least 32 random characters), and `MONGO_URI` if you want account and activity persistence. `AI_BASE_URL` supports OpenAI-compatible chat-completions providers. Do not use a `VITE_` prefix for secrets.
2. For inline Google web/image result cards, also set `GOOGLE_SEARCH_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID`. Without these, search prompts still get a direct Google results link in the chat. Google currently limits Custom Search JSON API access to existing customers; see [Google's API availability and migration notice](https://developers.google.com/custom-search/v1/overview).
3. Install packages with `npm install`.
4. Start the API with `npm run server` in one terminal, and the frontend with `npm run dev` in a second terminal.

Guest chat history is kept in the browser. Sign-in and account persistence require MongoDB and `JWT_SECRET`. AI tools require a configured provider key. The API exposes `POST /api/ai/chat`, `POST /api/ai/search`, `GET /api/ai/recommendations`, `POST /api/ai/analyze-image`, `POST /api/ai/generate-quiz`, `POST /api/ai/quiz/submit`, `POST /api/ai/explain`, `POST /api/ai/journey/start`, `POST /api/ai/journey/next`, `POST /api/ai/journey/explore`, `GET /api/ai/journey`, `POST /api/ai/compare`, and `POST /api/ai/story`. Authenticated conversation history is available at `/api/ai/conversations`. Image uploads are limited to 5 MB and JPG/PNG/WEBP. AI routes are rate-limited. In production, set `VITE_API_BASE_URL` to the deployed backend origin.
