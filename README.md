# Enebahw — Local Development

A simple full-stack React + Express project. This README shows how to run the frontend and backend locally.

Prerequisites
- Node.js 18+ and npm

Development
1. Start backend
   - Open a terminal:
     ```bash
     cd backend
     npm install
     # create a .env file with DB credentials and optional PORT (see "Environment")
     node src/server.js
     ```
2. Start frontend (dev server)
   - In a second terminal:
     ```bash
     cd frontend
     npm install
     npm run dev
     ```
   - Open the URL shown by Vite (typically http://localhost:5173)

Production (serve built frontend from backend)
1. Build the frontend
   ```bash
   cd frontend
   npm run build
   ```
2. Start backend (serves files from `frontend/dist`)
   ```bash
   cd backend
   npm install
   node src/server.js
   ```
   - Open `http://localhost:4000` (or the `PORT` in your `.env`)

Environment
- Create `backend/.env` with the following variables as needed:
  - `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`
  - `PORT` (optional, defaults to 4000)
  - `RAWG_KEY` (optional for seeding scripts)

Notes
- The backend server is `src/server.js` and serves the frontend build from `frontend/dist`.
- For local development run frontend and backend separately as shown above.

If you want, I can add scripts to `backend/package.json` to simplify starting the server. Thank you.
