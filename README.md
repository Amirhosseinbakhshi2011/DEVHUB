# DEVHUB

**Professional Developer Social Network**

DEVHUB is a production-oriented social platform built for developers. It brings together the strongest ideas from GitHub (profiles & activity), LinkedIn (professional identity & opportunities), and Stack Overflow (structured Q&A) into one coherent product.

This is not a marketing landing page or a UI demo. The goal is a real, maintainable, secure application that can grow into a serious product.

---

## Vision

Developers already scatter their professional identity across multiple platforms:

- Code lives on GitHub
- Career history lives on LinkedIn
- Technical questions live on Stack Overflow
- Informal discussion lives on Twitter / Discord

DEVHUB aims to give developers a single place where they can:

- Maintain a rich technical profile
- Publish posts, articles, and code
- Ask and answer questions with proper reputation
- Discover jobs and collaboration opportunities
- Build reputation based on meaningful activity

---

## Current Status

| Area | Status |
|------|--------|
| Project foundation (Next.js 15, TypeScript, Tailwind) | Done |
| Database schema (Prisma + PostgreSQL) | Designed |
| Design system & landing page | Done |
| Authentication (credentials + OAuth) | In progress |
| Developer profiles | Planned |
| Social feed | Planned |
| Articles | Planned |
| Q&A system | Planned |
| Jobs & collaboration | Planned |
| Messaging & communities | Planned |
| Reputation & rankings | Planned |
| Admin dashboard | Planned |
| Real-time notifications | Planned |
| GitHub integration | Planned |
| Tests & CI | Planned |

Features marked as planned are part of the architecture and schema but are not yet fully implemented.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| UI primitives | Custom components + Lucide icons |
| State | Zustand + TanStack Query |
| Forms | React Hook Form + Zod |
| Auth | NextAuth.js / Auth.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Cache | Redis (planned) |
| File storage | S3-compatible (planned) |
| Deployment | Vercel-compatible + Docker |

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+

### 1. Clone

```bash
git clone https://github.com/Amirhosseinbakhshi2011/DEVHUB.git
cd DEVHUB
```

### 2. Install

```bash
npm install
```

### 3. Environment

```bash
cp .env.example .env
```

Set `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`.

### 4. Database

```bash
npx prisma generate
npx prisma db push
```

### 5. Run

```bash
npm run dev
```

Open http://localhost:3000

---

## Roadmap

1. Foundation — Next.js, Prisma, design system, landing (done)
2. Authentication — Registration, login, OAuth, sessions
3. Profiles — Public developer profiles + edit flow
4. Social feed — Posts, likes, comments
5. Articles — Markdown editor + publishing
6. Q&A — Questions, answers, voting, reputation
7. Jobs — Listings + applications
8. Messaging & communities
9. Admin & moderation
10. Polish — Tests, performance, accessibility, deployment

---

## Author

**Amirhossein Bakhshi**  
https://github.com/Amirhosseinbakhshi2011

Built with care by Amirhossein Bakhshi.
