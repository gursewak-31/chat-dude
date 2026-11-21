# Chat-Dude

Chat-Dude is a full-stack, one-to-one chat application. Create an account, find other users, start a conversation, and exchange messages in real time. The client is built with React and TypeScript, while an Express and PostgreSQL server handles accounts, conversations, and message storage.

## Features

- Sign up and log in with email and password
- Password hashing with bcrypt
- Short-lived JWT access tokens and HTTP-only refresh-token cookies
- Hashed refresh tokens stored in PostgreSQL, with rotation on refresh and revocation on logout
- Request body validation for signup and login with Zod
- Browse users and start a one-to-one conversation
- Load saved conversation history from PostgreSQL
- Send and receive persisted messages over an authenticated WebSocket connection
- Login rate limiting (up to five attempts per minute)
- Responsive chat interface with connection and user lists

## Tech stack

| Area | Technologies |
| --- | --- |
| Client | React 19, TypeScript, Vite, Tailwind CSS, React Router |
| Server | Node.js, Express 5, TypeScript, WebSocket (`ws`) |
| Database | PostgreSQL (`pg`) |
| Authentication and validation | JWT, bcrypt, HTTP-only cookies, Zod |

## Project structure

```text
Chat-Dude/
├── client/   # React/Vite frontend
└── server/   # Express API, WebSocket server, and database access
```

## Prerequisites

- Node.js and npm
- A PostgreSQL server and database

## Getting started

### 1. Configure the environment files

Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env`. Update the example values for your machine. The server file contains PostgreSQL credentials, the access-token secret, the API port, and the allowed frontend origin. The client file contains the API URL (`VITE_API_URL`) and WebSocket URL (`VITE_WS_URL`).

`PORT` and `CLIENT_ORIGIN` are required. The server validates `PORT` at startup and uses `CLIENT_ORIGIN` for credentialed API CORS. Keep both `.env` files private; they are ignored by Git. The `.env.example` files are safe templates to commit.

The application expects a PostgreSQL schema containing these tables and columns:

- `users`: `id`, `name`, `email`, `password`, `created_at`
- `conversations`: `id`, `created_by`
- `conversation_members`: `conversation_id`, `user_id`
- `messages`: `id`, `msg`, `sender_id`, `conversation_id`, `created_at`
- `refresh_tokens`: `id`, `user_id`, `token`, `created_at`, `expire_at`, `revoked_at`

The repository does not currently include a schema or migration file, so create the database and tables before starting the server. Use integer-compatible IDs for users and conversations; message and conversation membership queries rely on these relationships.

For local development, the templates use the client origin `http://localhost:5173` and server port `3001`. Set `VITE_API_URL` to the server's HTTP origin and `VITE_WS_URL` to its WebSocket origin. If you change the server host or port, update both client values to match. The access-token secret is `JWT_ACCESS_SECRET`; refresh tokens are random values stored hashed in the database, so there is no separate refresh-token signing secret.

### 2. Install dependencies

From the project root, install each package set:

```bash
cd server
npm install
cd ../client
npm install
```

### 3. Run the app

Open two terminals from the project root. Start the API and WebSocket server:

```bash
cd server
npm run dev
```

Start the frontend in the other terminal:

```bash
cd client
npm run dev
```

Open the Vite URL shown in the client terminal (by default, `http://localhost:5173`).

## Available scripts

### Client (`client/`)

- `npm run dev` — start the Vite development server
- `npm run build` — build the production client bundle
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint

### Server (`server/`)

- `npm run dev` — run the server in watch mode
- `npm run build` — compile TypeScript into `server/dist/`
- `npm start` — run the compiled server

## API overview

All endpoints are served from the server origin configured by `PORT` (for example, `http://localhost:3001`). Protected routes require a valid access token.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/auth/signup` | Create an account |
| `POST` | `/auth/login` | Sign in (rate limited) |
| `GET` | `/auth/user` | Get the signed-in user |
| `GET` | `/auth/refresh` | Refresh the access token using the refresh cookie |
| `GET` | `/auth/logout` | Revoke the refresh token and log out |
| `GET` | `/app/connections` | List conversations |
| `GET` | `/app/users` | Find users not already connected |
| `POST` | `/app/new-connection` | Start a conversation |
| `GET` | `/app/conversation/:conversationId` | Load conversation messages |

The WebSocket endpoint is configured by `VITE_WS_URL` (for example, `ws://localhost:3001`). Clients authenticate with an `AUTH` frame containing their access token and send messages with a `MESSAGE` frame. Messages are persisted before delivery to online members of the conversation.

## Current limitations

- The sample environment is configured for local development. The server port and allowed client origin are configurable; set the client API and WebSocket URLs to match your deployment.
- Conversations are one-to-one; group chats, file uploads, and deployment configuration are not included.
- Database setup is manual because schema migrations are not included yet.

