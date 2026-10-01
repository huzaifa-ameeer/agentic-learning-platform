<div align="center">

# Mentaura

**Stop getting cooked by boring lectures.**

A full-stack AI mentor platform. Pick a specialist agent, open a session, and
talk to a model that has its own system prompt, its own icon, and no gatekeeping.

`Next.js 16` · `React 19` · `Express 5` · `MongoDB` · `Gemini`

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Data Model](#data-model)
- [API Reference](#api-reference)
- [Authentication & Authorization](#authentication--authorization)
- [AI Integration](#ai-integration)
- [Design System](#design-system)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Security Notes](#security-notes)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Credits](#credits)

---

## Overview

Mentaura is a two-repo-in-one monorepo (no root workspace tool — two
independent `package.json` files):

| Folder  | Role        | Stack                       | Dev URL                  |
| ------- | ----------- | --------------------------- | ------------------------ |
| `client` | Web frontend | Next.js 16 App Router + TS  | `http://localhost:3000`  |
| `server` | REST API     | Express 5 + Mongoose        | `http://localhost:3001`  |

The frontend is a client-rendered React app that talks to the API with
`fetch` and `credentials: "include"`. Auth state lives entirely in an
`httpOnly` cookie, so there is no token in `localStorage` and nothing for
client-side JavaScript to steal.

The backend owns four concerns: **identity**, **agent catalogue**, **session
bookkeeping**, and **message generation**. Gemini is called server-side only,
so the API key never reaches the browser.

---

## Features

### For learners

- **AI mentor catalogue** — browse every active agent as a card with an icon,
  slug, and description.
- **Persistent sessions** — every conversation is stored, listed per agent, and
  resumable at any time. Rename inline, delete with a confirmation step.
- **Typewriter-style replies** — agent responses reveal progressively with a
  blinking caret instead of dumping a wall of text.
- **Streaming-safe markdown** — partial markdown is repaired mid-reveal so code
  fences and bold markers never flicker while the answer is still typing out.
- **Smart auto-scroll** — the view follows new messages only while you are
  already at the bottom; scroll up and a `scroll to bottom` pill appears.
- **Optimistic sends** — your message appears instantly and reconciles with the
  server response, or is rolled back with your text restored if the send fails.
- **Session locking** — completed sessions are read-only and reject new messages
  at both the UI and the API layer.

### For the operator

- **Admin console** (`/admin`) — create, edit, activate/deactivate, and delete
  agents. Gated behind a single-account email allowlist.
- **System-prompt-first design** — an agent *is* its prompt; nothing else about
  it is hard-coded.
- **Slug auto-fill** — the slug is derived from the name until you touch it, then
  normalised to lowercase/dash form.
- **Type-to-confirm deletes** — you must type `/slug` to delete an agent.
  Deliberate friction for destructive actions.
- **AI-picked icons** — every new agent gets a glyph chosen by Gemini from a
  fixed icon set, upgraded in the background after the response is already sent.

---

## Tech Stack

### Frontend — `client/`

| Dependency           | Version   | Purpose                                     |
| -------------------- | --------- | ------------------------------------------- |
| `next`               | 16.3.7    | App Router, routing, build                  |
| `react` / `react-dom`| 19.2.8    | UI runtime                                  |
| `typescript`         | ^5        | Strict-mode typing throughout               |
| `tailwindcss`        | ^4        | Utility CSS + theme tokens                  |
| `react-markdown`     | ^10.1.0   | Renders agent markdown replies              |
| `remark-gfm`         | ^4.0.1    | Tables, strikethrough, task lists            |
| `eslint-config-next` | 16.3.7    | Linting                                    |
| `geist`, `roboto-mono` (via `next/font`) | latest | Typography |

### Backend — `server/`

| Dependency     | Version  | Purpose                                       |
| -------------- | -------- | --------------------------------------------- |
| `express`      | ^5.2.1   | HTTP server, routing, middleware chain        |
| `mongoose`     | ^9.10.2  | MongoDB ODM                                   |
| `@google/genai`| ^2.24.0  | Gemini chat + icon generation                 |
| `jsonwebtoken` | ^9.0.3   | Stateless JWT signing/verification             |
| `bcryptjs`     | ^3.0.3   | Password hashing (10 rounds)                  |
| `cookie-parser`| ^1.4.7   | Reads the auth cookie server-side             |
| `cors`         | ^2.8.6   | Explicit origin allowlist with credentials    |
| `dotenv`       | ^18.0.4  | `.env` loading                                |
| `nodemon`      | ^3.1.14  | Dev reload (devDependency only)               |

**Runtime requirement:** Node.js **>= 20** (pinned via `engines` in both
`package.json` files).

---

## Architecture

```
┌─────────────────────────────┐         ┌──────────────────────────────────┐
│  client  (Next.js 16, TS)   │         │  server  (Express 5, ESM)        │
│                             │         │                                  │
│  app/          routes       │  HTTPS  │  index.js        bootstrap       │
│  components/   UI           │ ──────► │  routes/         route table     │
│  lib/api.ts    typed fetch  │  cookie │  middlewares/    auth, admin,    │
│  lib/useTypewriter.ts       │  + JSON │                  id validation   │
│                             │         │  controllers/    request logic   │
│  SessionProvider            │         │  models/         Mongoose schemas│
│   └─ GET /auth/get-me       │         │  services/       ai, cache, icon │
└─────────────────────────────┘         │  config/         db, cors, cookie│
                                          └───────────────┬──────────────────┘
                                                          │
                                              ┌───────────┴────────────┐
                                              ▼                        ▼
                                    ┌──────────────────┐      ┌────────────────────┐
                                    │  MongoDB / Atlas │      │  Google Gemini API │
                                    └──────────────────┘      └────────────────────┘
```

### Request lifecycle

1. Browser calls `apiRequest()` (`client/src/lib/api.ts`) with
   `credentials: "include"`.
2. CORS middleware checks the `Origin` against `CORS_ORIGINS`.
3. `isAuth` reads the `token` cookie and verifies the JWT, attaching
   `req.userId` and `req.userRole`.
4. `validateObjectId` / `validateBodyObjectId` reject malformed Mongo IDs
   *before* any query runs.
5. The controller executes, returns `{ success, ... }`, and the client's
   `apiRequest` throws an `ApiError` carrying `status` + `message` on non-2xx.
6. The browser always receives the same JSON contract, success or failure.

### Design decisions worth knowing

- **Single-page auth resolution.** `SessionProvider` fires `getMe()` once per
  load and dedupes concurrent callers behind one in-flight promise. Guards
  (`AuthGuard`, `AdminGate`, `ProtectedLink`) read that shared state instead of
  re-checking on every navigation.
- **One admin account, by design.** `ADMIN_EMAIL` is the only account that can
  ever reach `/admin`. The role is granted on register/login if the email
  matches, so no admin-seed script is needed.
- **In-memory message cache.** A bounded `Map` with a 60 s TTL (500 entries,
  FIFO eviction) in front of Mongo for message reads. Invalidated on every
  write. It is intentionally per-process — no Redis, no shared state.
- **Cross-site cookies by default in production.** `SameSite=None; Secure` when
  `NODE_ENV=production` because the client (`vercel.app`) and the API
  (`onrender.com`) are different registrable domains.
- **Icon generation is fire-and-forget.** Agent creation returns immediately
  with a fallback glyph, then a background job upgrades the icon once Gemini
  replies (hard 8 s deadline).

---

## Project Structure

```
.
├── client/                        # Next.js frontend (Vercel)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx         # root layout: fonts, Navbar, Footer, SessionProvider
│   │   │   ├── page.tsx           # landing page (Hero + HowItWorks + About)
│   │   │   ├── globals.css        # Tailwind import + CRT theme tokens
│   │   │   ├── not-found.tsx      # themed 404
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── play-area/page.tsx        # agent picker
│   │   │   ├── sessions/page.tsx         # ?agent=id  session list
│   │   │   ├── sessions/new/page.tsx     # ?agent=id  name a session
│   │   │   ├── sessions/[id]/page.tsx    # the chat itself
│   │   │   ├── admin/page.tsx            # AdminGate + AdminPanel
│   │   │   └── admin/login/page.tsx
│   │   ├── components/            # 21 components (Navbar, AdminPanel, ChatMessage, ...)
│   │   └── lib/
│   │       ├── api.ts             # typed API client + ApiError
│   │       └── useTypewriter.ts   # progressive text reveal hook
│   ├── public/
│   └── .env.example
│
└── server/                        # Express API (Render)
    ├── index.js                   # app bootstrap, mounts routes, connects DB
    └── src/
        ├── config/                # db.js, cors.js, cookie.js
        ├── models/                # user, agent, learningSession, message
        ├── routes/                # auth, agent, session, message
        ├── controllers/           # request/response logic
        ├── middlewares/           # auth, admin, validate
        └── services/              # ai.service, cache.service, icon.service
```

---

## Getting Started

### Prerequisites

- **Node.js 20+** (`node -v`)
- **npm 10+**
- A **MongoDB** instance — local, Docker, or a free
  [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- A **Google AI Studio** API key — <https://aistudio.google.com/apikey>

### 1. Clone

```bash
git clone <your-repo-url>
cd agentic-learning-platform
```

### 2. Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:

```bash
PORT=3001
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/mentaura
JWT_SECRET=<generate me>
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=<your google ai studio key>
ADMIN_EMAIL=you@example.com
CORS_ORIGINS=http://localhost:3000
```

Generate a strong JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Start it:

```bash
npm run dev     # nodemon, watches for changes
```

Verify:

```bash
curl http://localhost:3001
# -> Agentic Learning API is running
```

### 3. Frontend

In a second terminal:

```bash
cd client
npm install
cp .env.example .env.local
```

Edit `client/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start it:

```bash
npm run dev
```

Open <http://localhost:3000>.

> `NEXT_PUBLIC_*` variables are **inlined at build time**. If you change the API
> URL, restart `next dev` (or redeploy) — a hot reload will not pick it up.

### 4. Become the admin

`ADMIN_EMAIL` is the single account allowed into `/admin`. That account must
exist in the database first:

1. Go to `/signup` and register with the exact `ADMIN_EMAIL` address. The
   `role` is set to `admin` automatically at registration.
2. Go to `/admin` (or `/admin/login` to re-authenticate).
3. Create your first agent — it appears in the play area once `isActive` is
   true (the default).

### 5. Learn

1. Sign up at `/signup` (signup auto-logs you in).
2. Click **play area** and pick a mentor.
3. Open or create a session and start talking.

---

## Environment Variables

### `server/.env`

| Variable                  | Required | Default                                                     | Notes                                                              |
| ------------------------- | -------- | ----------------------------------------------------------- | ------------------------------------------------------------------ |
| `PORT`                    | No       | `3001`                                                      | Local fallback only; Render injects its own `PORT`.                |
| `NODE_ENV`                | Yes      | `development`                                               | `production` flips cookies to `Secure` + `SameSite=None`.           |
| `MONGO_URI`               | Yes      | —                                                           | Atlas or local connection string.                                   |
| `JWT_SECRET`              | Yes      | —                                                           | Long random string. Rotating it invalidates every active session.   |
| `JWT_EXPIRES_IN`          | Yes      | `7d`                                                        | Token lifetime.                                                     |
| `GEMINI_API_KEY`          | Yes      | —                                                           | Server-side only. Never expose to the browser.                     |
| `ADMIN_EMAIL`             | Yes      | —                                                           | Lowercased on load; the one account allowed into `/admin`.          |
| `CORS_ORIGINS`            | Yes      | `http://localhost:3000,http://localhost:3001,http://localhost:5173` | Comma-separated, **no trailing slashes**. Must include your frontend origin in production. |
| `MESSAGE_CACHE_TTL_MS`    | No       | `60000`                                                     | Undocumented in `.env.example`; tunes the message cache TTL.       |

### `client/.env.local`

| Variable              | Required | Default                 | Notes                                                     |
| --------------------- | -------- | ----------------------- | --------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Yes      | `http://localhost:3001`  | Base URL of the API. Inlined at build time, no trailing `/`. |

> Both folders ship an `.env.example` and gitignore real `.env` files. Never
> commit secrets.

---

## Data Model

### `User` — `users`

| Field      | Type     | Notes                                                        |
| ---------- | -------- | ------------------------------------------------------------ |
| `name`     | String   | Required, trimmed                                             |
| `email`    | String   | Required, unique, lowercased, trimmed                        |
| `password` | String   | bcrypt hash, `select: false` (never leaves the model by default) |
| `role`     | String   | `user` \| `admin`, defaults to `user`                         |
| `createdAt` / `updatedAt` | Date | Automatic via `timestamps: true`       |

### `Agent` — `agents`

| Field          | Type   | Notes                                                              |
| -------------- | ------ | ------------------------------------------------------------------ |
| `name`         | String | Required                                                           |
| `slug`         | String | Required, unique, lowercased; derived from `name` when blank       |
| `description`  | String | Required; shown on the card                                        |
| `systemPrompt` | String | Required; **stripped from responses for non-admins**               |
| `isActive`     | Boolean| Defaults `true`; `false` hides the agent from the play area         |
| `icon`         | String | Glyph key, defaults to `code`                                      |
| `iconAccent`   | String | `blue` \| `green`, defaults to `blue`                              |
| `iconSource`   | String | `ai` \| `fallback`                                                 |

### `LearningSession` — `learningsessions`

| Field      | Type     | Notes                                                       |
| ---------- | -------- | ----------------------------------------------------------- |
| `user`     | ObjectId | Ref → `User`, required (ownership boundary)                  |
| `agent`    | ObjectId | Ref → `Agent`, required                                      |
| `title`    | String   | Required, defaults to `New Learning Session`                 |
| `status`   | String   | `active` \| `completed`, defaults to `active`                |
| `createdAt` / `updatedAt` | Date | Automatic                                   |

### `Message` — `messages`

| Field      | Type     | Notes                                                  |
| ---------- | -------- | ------------------------------------------------------ |
| `session`  | ObjectId | Ref → `LearningSession`, required                      |
| `sender`   | String   | `user` \| `agent`, required                            |
| `content`  | String   | Required, trimmed; markdown for agent messages         |
| `createdAt` / `updatedAt` | Date | Automatic                               |

Messages are **not** deleted when a session is deleted — they are orphaned by
design of the current schema and are cleaned up only when their agent is
removed. See [Roadmap](#roadmap).

---

## API Reference

Base URL: `http://localhost:3001` in development.
All endpoints are prefixed `/api`. Responses are JSON; success is signalled by
`success: true` alongside a human-readable `message`.

**Guard legend:** 🔒 = requires `isAuth` · 🛡️ = requires `isAuth` + `isAdmin` ·
🔎 = ObjectId validation applied.

### Auth — `/api/auth`

| Method | Endpoint       | Guard | Body                  | Success |
| ------ | -------------- | ----- | --------------------- | ------- |
| `POST` | `/register`    | —     | `name`,`email`,`password` | `201` — creates the user (no session) |
| `POST` | `/login`       | —     | `email`,`password`    | `200` — sets the `token` cookie       |
| `POST` | `/admin-login` | —     | `email`,`password`    | `200` — `403` unless the email matches `ADMIN_EMAIL` |
| `POST` | `/logout`      | —     | —                     | `200` — clears the cookie             |
| `GET`  | `/get-me`      | 🔒    | —                     | `200` — current user, password excluded |

### Agents — `/api/agent`

| Method   | Endpoint            | Guard | Body                                     | Notes |
| -------- | ------------------- | ----- | ---------------------------------------- | ----- |
| `POST`   | `/create`           | 🛡️   | `name`,`description`,`systemPrompt`,`slug?` | `201`; slug derived when blank; icon upgraded in the background |
| `GET`    | `/get-all`          | 🔒    | —                                        | Active agents only, newest first; `systemPrompt` omitted unless admin |
| `GET`    | `/get-single/:id`   | 🔒🔎  | —                                        | Same `systemPrompt` visibility rule |
| `PUT`    | `/update/:id`       | 🛡️🔎  | any of `name`,`slug`,`description`,`systemPrompt`,`isActive` | Partial update |
| `DELETE` | `/delete/:id`       | 🛡️🔎  | —                                        | **Cascades**: also deletes every session for that agent, returns `deletedSessions` |

### Sessions — `/api/session`

| Method   | Endpoint          | Guard | Body / Query                | Notes |
| -------- | ----------------- | ----- | --------------------------- | ----- |
| `POST`   | `/create`         | 🔒🔎  | `agentId`, `title?`         | `404` if the agent is missing or inactive |
| `GET`    | `/get-all`        | 🔒    | `?page=&limit=&agent=`      | Own sessions only, sorted by `updatedAt` desc; returns a `pagination` block (`currentPage`, `limit`, `totalSessions`, `totalPages`, `hasNextPage`, `hasPreviousPage`) |
| `GET`    | `/get-single/:id` | 🔒🔎  | —                           | Own session with `agent` populated |
| `PATCH`  | `/complete/:id`   | 🔒🔎  | —                           | Flips to `completed`; `400` if already completed |
| `PATCH`  | `/rename/:id`     | 🔒🔎  | `title`                     | Trims and saves |
| `DELETE` | `/delete/:id`     | 🔒🔎  | —                           | Removes the session row |

### Messages — `/api/message`

| Method | Endpoint        | Guard | Body                       | Notes |
| ------ | --------------- | ----- | -------------------------- | ----- |
| `POST` | `/`             | 🔒🔎  | `sessionId`, `content`     | `201` → `data: { agent, userMessage, agentMessage }`; `400` if the session is completed; `503` if Gemini is unreachable |
| `GET`  | `/:sessionId`   | 🔒🔎  | —                          | `200` → `messages` + `cached: true|false` |

**`POST /api/message` is the write path** and runs in this order:

1. Verify the session belongs to the caller and is still `active`.
2. Load the agent; reject if missing or `isActive: false`.
3. Persist the user message.
4. Invalidate the message cache for this session.
5. Load the full thread, mapped to Gemini's `user`/`model` roles.
6. Call Gemini with the agent's `systemPrompt` + formatting rules.
7. Persist the agent message, invalidate the cache again, return both rows.

### Status codes

| Code | Meaning                                                       |
| ---- | ------------------------------------------------------------- |
| `200`/`201` | Success                                              |
| `400` | Validation failure (missing fields, empty title, completed session) |
| `401` | Missing, invalid, or expired token                              |
| `403` | Authenticated but not an admin / wrong account for `/admin/login` |
| `404` | Resource not found, or not visible to this caller              |
| `409` | Conflict — duplicate email or duplicate slug                    |
| `500` | Unhandled server error                                         |
| `503` | AI provider unavailable                                        |

---

## Authentication & Authorization

**Registration →** `POST /api/auth/register` hashes the password with bcrypt
(10 rounds), stores it with `select: false`, and assigns `role: "admin"` if the
email matches `ADMIN_EMAIL`.

**Login →** `POST /api/auth/login` (or `/admin-login`) verifies the password and
issues a JWT containing `{ userId, role }` with `JWT_EXPIRES_IN` lifetime. The
token is set as a cookie, never returned in the body.

**Cookie attributes** (`server/src/config/cookie.js`):

| Attribute   | `development` | `production`                          |
| ----------- | ------------- | ------------------------------------- |
| `httpOnly`  | `true`        | `true`                                |
| `secure`    | `false`       | `true`                                |
| `sameSite`  | `lax`         | `none` (requires `secure` — always paired) |
| `maxAge`    | 7 days        | 7 days                                |

`logout` clears the cookie with **matching** attributes, otherwise browsers
silently ignore the `clear-cookie`.

**Request verification** — `isAuth` reads `req.cookies.token`, verifies it with
`JWT_SECRET`, and attaches `req.userId` and `req.userRole`. `isAdmin` then
compares `req.userRole` to `admin`. Route order matters: `isAuth` always
precedes `isAdmin`.

**Client side** — `SessionProvider` resolves the session once per page load;
`AuthGuard` bounces unauthenticated users to `/login`, `AdminGate` bounces
non-admins to `/admin/login`, and `ProtectedLink` redirects protected CTAs
without a network round trip.

**Ownership** — every session query filters on `user: req.userId`, so one user
can never read or delete another user's conversation.

---

## AI Integration

Implemented in `server/src/services/ai.service.js`.

### Model strategy

```js
const MODELS = ["gemini-3.5-flash", "gemini-flash-lite-latest"];
```

Both chat generation and icon generation iterate the list and move to the next
model only on failure or an empty response. If all fail, the chat path returns
`503`; the icon path silently falls back.

### System prompt composition

The agent's stored `systemPrompt` is **not** the whole instruction. The service
appends a formatting contract (`FORMATTING_RULES`) so replies render well in the
chat UI:

```
<agent system prompt>

Output formatting rules (follow these):
- Reply in markdown. never output raw markdown syntax as plain text.
- Use ## headings to break the answer into scannable sections.
- Use **bold** for key terms and the single most important takeaway.
- Use - for bullet lists and 1. for ordered steps.
- Put all code inside fenced code blocks tagged with a language.
- Keep paragraphs short (2-3 sentences max). no walls of text.
```

### History mapping

`Message.sender` is translated to Gemini roles: `user` → `user`,
`agent` → `model`. The whole thread is resent on every turn — simple, correct,
and cheap enough at this scale. (No server-side conversation memory yet.)

### Icon generation

On agent create, the API returns instantly with `icon: "code"`, `iconAccent:
"blue"`, `iconSource: "fallback"`, then a background job:

1. Ask Gemini for raw JSON (`responseMimeType: "application/json"`) of the form
   `{ "glyph": "...", "accent": "blue|green" }`.
2. Validate against the allowlists in `icon.service.js`.
3. `updateOne` the agent with the result and `iconSource: "ai"`.

An `ICON_DEADLINE_MS = 8000` budget is shared across both model attempts; the
admin panel re-fetches after 4 s to pick up the upgrade. 22 glyphs and 2 accents
are available: `code`, `terminal`, `math`, `sigma`, `atom`, `dna`, `book`, `pen`,
`globe`, `palette`, `music`, `shield`, `cpu`, `chart`, `rocket`, `robot`, `lock`,
`key`, `puzzle`, `lightbulb`, `scale`.

### Graceful degradation

- Gemini down → `503`, the UI keeps your draft and restores the input text.
- Icon generation down → the agent keeps the `code`/`blue` fallback; nothing
  breaks visually.
- Every unknown glyph resolves to `code` on both server and client.

---

## Design System

The visual language is a retro CRT terminal: monospace everywhere, hard 2px
borders, offset solid shadows (`4px 4px 0 0 #000`), and buttons that "press" by
translating into their own shadow.

Tokens live in `client/src/app/globals.css` under Tailwind v4's `@theme`:

| Token            | Value     | Role                            |
| ---------------- | --------- | ------------------------------- |
| `--color-crt-bg`   | `#f2efe4` | Page background (warm paper)   |
| `--color-crt-panel`| `#ffffff` | Card / window background       |
| `--color-crt-ink`  | `#1a1a1a` | Primary text                    |
| `--color-crt-blue` | `#2563eb` | Primary accent / user messages  |
| `--color-crt-green`| `#15803d` | Agent messages / success        |
| `--color-crt-red`  | `#dc2626` | Destructive actions             |
| `--color-crt-dim`  | `#57534a` | Secondary text                  |
| `--color-crt-line` | `#000000` | Every border and shadow         |

Typography: **Geist** for the interface, **Roboto Mono** for the terminal voice,
both loaded through `next/font`.

Micro-interactions worth knowing about: the typewriter reveal
(`useTypewriter`), the thinking spinner, the nav burger, the admin drawer, the
`scroll to bottom` pill, and a themed 404 that keeps the terminal fiction
(`404_not_found.exe`).

---

## Available Scripts

### `client/`

| Command         | Does                                              |
| --------------- | ------------------------------------------------- |
| `npm run dev`   | `next dev` on port 3000                          |
| `npm run build` | Production build                                 |
| `npm start`     | Serve the production build                       |
| `npm run lint`  | ESLint (`core-web-vitals` + TypeScript rules)     |

### `server/`

| Command       | Does                                        |
| ------------- | ------------------------------------------- |
| `npm run dev` | `nodemon index.js` with reload on change    |
| `npm start`   | `node index.js`                             |

> There is no automated test suite yet — see [Roadmap](#roadmap).

---

## Deployment

The two halves deploy independently: the API to **Render**, the frontend to
**Vercel**. The commit history reflects exactly this split.

### 1. API on Render

- Root directory: `server`
- Build command: `npm ci`
- Start command: `npm start`
- Node version: **20** (or newer)
- Health check path: `/`

Environment variables (set them in the Render dashboard — do **not** commit a
`.env`):

```
NODE_ENV=production
MONGO_URI=…
JWT_SECRET=…
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=…
ADMIN_EMAIL=you@example.com
CORS_ORIGINS=https://your-app.vercel.app
```

Render injects `PORT` automatically. Because Render terminates TLS and forwards
the request, `app.set("trust proxy", 1)` is enabled so `secure` cookies are
emitted over the proxied connection.

### 2. Client on Vercel

- Root directory: `client`
- Framework preset: Next.js (auto-detected)
- Build command: `npm run build` (default)
- Node version: **20** (or newer)

Environment variables:

```
NEXT_PUBLIC_API_URL=https://your-api.onrender.com
```

Must be set **before** the build — `NEXT_PUBLIC_*` values are baked into the
bundle at build time, so changing it in the dashboard requires a redeploy.

### Cross-domain checklist

Because the client and API live on different registrable domains in production:

- [ ] Both are served over **HTTPS**.
- [ ] `NODE_ENV=production` on Render (triggers `Secure` + `SameSite=None`).
- [ ] `CORS_ORIGINS` is the exact frontend origin, **no trailing slash**.
- [ ] `CORS_ORIGINS` and `NEXT_PUBLIC_API_URL` use `https://`, not `http://`.
- [ ] `CREDENTIALS` are enabled end to end (`credentials: "include"` in the
      client, `credentials: true` in the CORS options) — done.

---

## Security Notes

Implemented:

- Passwords hashed with bcrypt (10 rounds) and excluded from queries by default
  (`select: false`).
- The JWT lives in an `httpOnly` cookie — unreachable from client-side JS, so
  XSS cannot exfiltrate it directly.
- `Secure` + `SameSite=None` in production so the cookie works cross-site but
  not over plain HTTP.
- `SameSite=Lax` locally, so development stays CSRF-resistant too.
- Every route that touches Mongo validates ObjectId shapes in middleware, which
  turns malformed input into a clean `400` instead of a cast error.
- Session and message reads are scoped to the authenticated user.
- `systemPrompt` is stripped from agent responses for non-admin callers.
- Admin routes require both a valid token **and** the `admin` role.
- Destructive admin deletes require typing the exact slug, and cascade deletion
  reports how many sessions were removed.
- `.env` is gitignored in both folders; `.env.example` files are committed.
- Passwords live only in `bcryptjs` hashes — never logged, never returned.

Worth adding before this faces the open internet:

- Rate limiting on `/api/auth/*` and `/api/message`.
- Refresh-token rotation or shorter-lived access tokens with revocation.
- Request payload size limits on `express.json()`.
- Cascade message deletion when a session is deleted.
- Server-side conversation memory instead of resending the full thread.

> **Note:** your working copy's `server/.env` currently holds live Atlas,
> JWT, and Gemini credentials. It is correctly gitignored, but rotate those
> credentials if the file was ever shared, screenshotted, or committed
> elsewhere.

---

## Troubleshooting

**`cannot reach the server, is the backend running?`**
The browser could not reach the API. Start `server`, and confirm
`NEXT_PUBLIC_API_URL` matches the port the server printed. Remember the value
is baked in at build time — restart `next dev` after editing it.

**CORS error in the console**
Add the exact browser origin to `CORS_ORIGINS` (comma-separated, no trailing
slash, no path). Restart the server — CORS options are built once at startup.

**`this account cannot access the admin panel` (403)**
The submitted email does not match `ADMIN_EMAIL`. Comparison is
case-insensitive but otherwise exact. If the account does not exist yet,
register it first.

**Admin panel shows nothing / play area says "no agents available"**
No agents exist yet. Create one at `/admin` and make sure `isActive` is
checked — inactive agents are excluded from `GET /api/agent/get-all`.

**`AI service is currently unavailable` (503)**
`GEMINI_API_KEY` is missing, invalid, or out of quota. Check the server logs for
the per-model error from `ai.service.js`. Your message is saved; retry once the
key works.

**Agent icon stuck on `< >`**
Icon generation failed and the fallback was kept. `iconSource: "fallback"` tells
you which happened. This is cosmetic — the agent works regardless.

**Signed out immediately in production**
The API is not running over HTTPS, or `NODE_ENV` is not `production` on the
server. Browsers reject `SameSite=None` cookies without `Secure`.

**`DB connection failed`**
`MONGO_URI` is wrong, Atlas IP access does not include your host, or nothing is
listening on `27017`. The server keeps booting but every route will error.

---

## Roadmap

- [ ] Automated tests (Vitest for the server, Playwright for the client flows)
- [ ] Rate limiting and request size limits
- [ ] Refresh-token rotation / token revocation
- [ ] Server-side conversation memory with token-budget trimming
- [ ] True streaming replies via SSE instead of typewriter replay
- [ ] Client-side session pagination UI (the API already returns the metadata)
- [ ] Cascade message deletion when a session is removed
- [ ] Agent analytics: message volume, last-used, active/completed counts
- [ ] Multiple admin accounts with roles instead of a single allowlist
- [ ] Export a session as Markdown
- [ ] Dark mode

---

## Contributing

1. Fork the repository and branch off `main`.
2. Keep the two packages independent — do not add a root workspace tool unless
   it is needed.
3. Match the existing commit style (**Conventional Commits**):
   `feat:`, `fix:`, `chore:`, `docs:`, `perf:`, `refactor:`.
4. Run `npm run lint` in `client/` before opening a pull request.
5. Match the surrounding code style — the codebase is deliberately explicit:
   early returns, no clever abstractions, comments that explain *why*.
6. Never commit `.env`, keys, or credentials.

---

## Credits

- **[Google Gemini](https://ai.google.dev/)** — the model behind every mentor,
  via `@google/genai`.
- **[Next.js](https://nextjs.org)** · **[React](https://react.dev)** ·
  **[Tailwind CSS](https://tailwindcss.com)** · **[Express](https://expressjs.com)**
  · **[MongoDB](https://www.mongodb.com)** · **[Vercel](https://vercel.com)** ·
  **[Render](https://render.com)**.

Built end to end — backend, frontend, and all of it — by
**Huzaifa Ameer** · [GitHub](https://www.github.com/huzaifa-ameeer/) ·
[LinkedIn](https://www.linkedin.com/in/muhammad-huzaifa-ameer-2107aa342/).

---

<div align="center">

*`built with next.js + express + gemini`*

</div>