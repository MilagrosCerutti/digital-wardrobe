# Digital Wardrobe

A digital wardrobe and personal styling assistant. See [PROJECT_SPECIFICATION.md](./PROJECT_SPECIFICATION.md), [ARCHITECTURE.md](./ARCHITECTURE.md), and [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for the product, technical, and workflow sources of truth.

## Project Structure

```
backend/    Express + TypeScript API (layered architecture)
frontend/   React + Vite + TypeScript client (feature-based architecture)
```

## Prerequisites

- Node.js 20+
- A Supabase project (PostgreSQL + Storage)

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in SUPABASE_URL, SUPABASE_KEY, JWT_SECRET
npm run dev             # start the API in watch mode on http://localhost:4000
```

Other backend scripts: `npm run build`, `npm start`, `npm test`, `npm run lint`.

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL if different from the default
npm run dev             # start the Vite dev server on http://localhost:5173
```

Other frontend scripts: `npm run build`, `npm test`, `npm run lint`.

## Testing

- Backend: Jest + Supertest (`backend/tests/unit`, `backend/tests/integration`).
- Frontend: Vitest + React Testing Library.
