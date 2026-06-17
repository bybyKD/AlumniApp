# AlumniApp

Alumni management system — search, filter, and explore alumni data with AI-powered assistance.

## Features

- Alumni directory with search and filtering
- AI-powered assistant for alumni queries
- Dashboard with insights and analytics
- Data import from directory PDFs

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **AI:** Gemini API (optional for assistant features)
- **Database:** JSON-based data storage

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Create `.env.local` with your `GEMINI_API_KEY` (optional — the app works without it using fallback search)
3. Start the dev server:
   `npm run dev`