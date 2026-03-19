# SyncSpace 🚀

> Real-time collaborative workspace for modern teams — powered by Next.js, Supabase, and Socket.IO.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 **Authentication** | Email/password + Google OAuth via NextAuth v5 |
| 🏠 **Workspaces** | Create, join, and manage team workspaces with color/emoji |
| 💬 **Real-time Chat** | Instant messaging, message grouping, timestamps |
| ✏️ **Typing Indicators** | See who's typing in real time |
| 👥 **Live Presence** | Online/offline status with animated indicators |
| 🎨 **Collaborative Whiteboard** | Multi-user canvas with pen, eraser, colors, undo, download |
| 🖱️ **Live Cursors** | See teammate cursor positions with name labels |
| ⚡ **Activity Feed** | Real-time timeline of all workspace events |
| 📊 **Dashboard** | Workspace overview with stats and recent messages |
| 📧 **Invite System** | Invite teammates by email with shareable links |
| ⚙️ **Workspace Settings** | Rename, recolor, delete, manage members |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + CSS custom properties |
| **Database** | PostgreSQL via [Supabase](https://supabase.com) |
| **ORM** | Prisma 5 |
| **Real-time** | Socket.IO 4 (custom Node.js server) |
| **Auth** | NextAuth v5 (JWT + Prisma adapter) |
| **State** | Zustand |
| **Fonts** | Clash Display + Satoshi (local) |
| **Deploy** | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- A [Google Cloud](https://console.cloud.google.com) project (for OAuth)

### 1. Clone & install

```bash
git clone https://github.com/yourname/syncspace.git
cd syncspace
npm install
```

### 2. Set up fonts

Download and place these fonts in `public/fonts/`:
- **Clash Display**: https://www.fontshare.com/fonts/clash-display
  - `ClashDisplay-Regular.woff2`, `ClashDisplay-Medium.woff2`, `ClashDisplay-Semibold.woff2`, `ClashDisplay-Bold.woff2`
- **Satoshi**: https://www.fontshare.com/fonts/satoshi
  - `Satoshi-Regular.woff2`, `Satoshi-Medium.woff2`, `Satoshi-Bold.woff2`

> These fonts are free for commercial use from Fontshare.

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Supabase — from Project Settings → Database → Connection String
DATABASE_URL="postgresql://postgres.xxxx:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxx:PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (console.cloud.google.com)
GOOGLE_CLIENT_ID="xxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxx"

# Public
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Set up Supabase database

In your Supabase dashboard:
1. Go to **Project Settings → Database**
2. Copy the **Transaction** pooler URL → `DATABASE_URL`
3. Copy the **Session** pooler URL → `DIRECT_URL`

Then push the schema:

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to Supabase
```

### 5. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Secret to `.env.local`

### 6. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
syncspace/
├── prisma/
│   └── schema.prisma              # All DB models
├── public/
│   └── fonts/                     # Clash Display + Satoshi
├── server.js                      # Custom Socket.IO + Next.js server
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/              # NextAuth handlers + register
│   │   │   ├── workspaces/        # CRUD for workspaces
│   │   │   ├── messages/          # Chat messages
│   │   │   ├── activities/        # Activity feed
│   │   │   └── invites/           # Invite system
│   │   ├── auth/                  # Login, register, error pages
│   │   ├── dashboard/             # Main dashboard
│   │   ├── workspace/[slug]/      # Workspace page
│   │   ├── invite/[token]/        # Invite acceptance
│   │   ├── layout.tsx             # Root layout with fonts
│   │   ├── page.tsx               # Landing page
│   │   └── globals.css            # Design tokens + animations
│   ├── components/
│   │   ├── activity/              # Activity feed panel
│   │   ├── chat/                  # Chat panel with typing indicators
│   │   ├── dashboard/             # Create workspace modal
│   │   ├── presence/              # Online users list + live cursors
│   │   ├── sidebar/               # Navigation sidebar
│   │   ├── ui/                    # Shared: providers
│   │   └── workspace/             # Shell, settings modal
│   ├── hooks/
│   │   └── use-socket.ts          # All Socket.IO logic
│   ├── lib/
│   │   ├── auth.ts                # NextAuth config
│   │   ├── prisma.ts              # Prisma singleton
│   │   ├── supabase.ts            # Supabase client
│   │   └── utils.ts               # Helpers
│   ├── middleware.ts              # Route protection
│   ├── store/
│   │   └── workspace-store.ts     # Zustand global state
│   └── types/
│       └── index.ts               # TypeScript types
└── vercel.json
```

---

## 🔌 Socket.IO Events Reference

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `workspace:join` | `{ workspaceId, user }` | Join a workspace room |
| `workspace:leave` | `{ workspaceId }` | Leave a workspace room |
| `chat:message` | `ChatMessage` | Broadcast a chat message |
| `chat:typing:start` | `{ workspaceId, user }` | Start typing indicator |
| `chat:typing:stop` | `{ workspaceId, user }` | Stop typing indicator |
| `cursor:move` | `{ workspaceId, x, y }` | Cursor position update (%) |
| `cursor:leave` | `{ workspaceId }` | Cursor left canvas |
| `wb:stroke:begin` | `{ workspaceId, stroke }` | Start a whiteboard stroke |
| `wb:stroke:point` | `{ workspaceId, strokeId, point }` | Add point to stroke |
| `wb:stroke:end` | `{ workspaceId, strokeId }` | Finish stroke |
| `wb:stroke:undo` | `{ workspaceId, strokeId }` | Undo a stroke |
| `wb:clear` | `{ workspaceId }` | Clear whiteboard |
| `activity:push` | `{ workspaceId, activity }` | Push activity to feed |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `presence:sync` | `WorkspaceUser[]` | Full presence list |
| `presence:joined` | `{ user }` | User joined notification |
| `presence:left` | `{ user }` | User left notification |
| `chat:message` | `ChatMessage` | Incoming chat message |
| `chat:typing` | `{ userId, name, isTyping }` | Typing state change |
| `cursor:update` | `{ userId, name, color, x, y }` | Cursor moved |
| `cursor:remove` | `{ userId }` | Cursor removed |
| `wb:stroke:begin/point/end/undo` | stroke data | Whiteboard events |
| `wb:clear` | — | Whiteboard cleared |
| `activity:new` | `ActivityItem` | New activity event |

---

## 🗄️ Database Schema Overview

```
User ─────────────── WorkspaceMember ─── Workspace
  │                                          │
  ├── Message ─────────────────────────────→ │
  │                                          │
  ├── Activity ────────────────────────────→ │
  │                                          │
  └── WhiteboardStroke ── WhiteboardSession →┘
```

**Enums**: `Role` (OWNER, ADMIN, MEMBER, GUEST), `InviteStatus` (PENDING, ACCEPTED, DECLINED, EXPIRED), `ActivityType` (12 types)

---

## 🚢 Production Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add all environment variables
4. Deploy

> **Important**: Socket.IO needs a persistent server. For production scale, use a separate Socket.IO service deployed on Railway, Render, or Fly.io, or replace with a managed solution like [Ably](https://ably.com) or [Pusher](https://pusher.com).

### Environment variables for production

```env
DATABASE_URL=<supabase-transaction-pooler-url>
DIRECT_URL=<supabase-session-pooler-url>
NEXTAUTH_SECRET=<32-char-random-string>
NEXTAUTH_URL=https://your-domain.com
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## 📄 License

MIT — free to use, modify, and distribute.
