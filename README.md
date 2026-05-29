# Linkora

> A self-hosted, single-user "link in bio" application — your personal Linktree, built your way.

Linkora is a clean, fast, and fully customizable link-in-bio page built with Next.js 16. It features a private admin dashboard for managing links, viewing analytics, and personalizing your public profile — all backed by a serverless Postgres database and Cloudflare R2 for media storage.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Seed Data](#seed-data)
- [Media Upload Architecture](#media-upload-architecture)
- [Cloudflare R2 CORS Configuration](#cloudflare-r2-cors-configuration)
- [Development](#development)
- [Deployment](#deployment)
- [Architecture Decisions](#architecture-decisions)
- [Next.js 16 Notes](#nextjs-16-notes)
- [Code Conventions](#code-conventions)

---

## Features

**Admin Dashboard**
- Secure login (single admin account)
- Overview stats and recent link activity
- Link manager with drag-and-drop reordering
- Toggle links active/inactive individually
- Full appearance customization — themes, colors, fonts, backgrounds
- Profile editor — name, bio, avatar, banner, logo
- QR code generator with PNG and SVG download
- Live preview of the public page within the dashboard
- Dark/light mode toggle

**Public Profile Page**
- Fast, cached public page (`'use cache'` directive, Next.js 16)
- Click tracking per link (device, browser, country, referrer)
- Page view tracking
- QR code display (toggleable)
- Share button

**Analytics**
- Daily click chart
- Per-link stats table
- Date range filtering

**Media Uploads**
- Avatar, banner, background, thumbnail, logo, and custom icon uploads
- Server-side image processing via `sharp` (resize, crop, compress)
- Direct browser-to-R2 upload via presigned URLs (bypasses Vercel body limit)

---

## Tech Stack

| Category | Library | Version |
|---|---|---|
| Framework | [Next.js](https://nextjs.org/) | 16.x (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) | 5.x (strict mode) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) | v4 |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) | latest |
| Auth | [NextAuth.js](https://next-auth.js.org/) | v4 |
| Database | [PostgreSQL via Neon](https://neon.com/) | serverless |
| ORM | [Prisma](https://www.prisma.io/) | 5.x |
| File Storage | [Cloudflare R2](https://www.cloudflare.com/products/r2/) | S3-compatible |
| Image Processing | [sharp](https://github.com/lovell/sharp) | latest (server-side) |
| Drag & Drop | [@dnd-kit/core + sortable](@dnd-kit/core) | latest |
| State Management | [Zustand](https://zustand-demo.pmnd.rs/) | 4.x |
| Data Fetching | [React Query](https://tanstack.com/query/latest) | v5 |
| Forms | [React Hook Form](https://github.com/react-hook-form/react-hook-form) + [Zod](https://github.com/colinhacks/zod) | latest |
| Animation | [Motion](https://github.com/motiondivision/motion) | latest |
| Charts | [Recharts](https://github.com/Nick011/ReChart) | latest |
| QR Code | [qrcode.react](https://github.com/zpao/qrcode.react) | latest |
| Icons | [Phospor Icons](https://phosphoricons.com/) | latest |
| ID Generator | [nanoid](https://github.com/ai/nanoid) | latest |
| Linter & Formatter | [Biome](https://biomejs.dev/) | 2.x |

---

## Project Structure

```
linkora/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts                       # Creates the first admin account
├── public/
│   ├── logo.png
│   └── web-app-manifest-*.png
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/page.tsx        # Admin login page
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            # Sidebar + navbar layout
│   │   │   ├── dashboard/page.tsx    # Overview: stats summary, recent links
│   │   │   ├── links/page.tsx        # Drag & drop link manager
│   │   │   ├── analytics/page.tsx    # Click charts, per-link table, date filter
│   │   │   ├── design/page.tsx       # Theme, colors, background, font
│   │   │   └── settings/page.tsx     # Profile: name, bio, avatar, banner, QR code
│   │   ├── [username]/page.tsx       # Public profile page ('use cache')
│   │   └── api/
│   │       ├── auth/[...nextauth]/   # Auth.js handler
│   │       ├── links/                # CRUD + reorder
│   │       ├── analytics/            # Aggregated stats
│   │       ├── click/[id]/           # Click tracking
│   │       ├── upload/               # presign, confirm, process
│   │       ├── user/me/              # Current user data
│   │       └── view/[username]/      # Page view tracking
│   ├── components/
│   │   ├── dashboard/                # Dashboard-specific components
│   │   ├── public/                   # Public page components
│   │   ├── shared/                   # Reusable components (uploader, theme toggle)
│   │   └── ui/                       # shadcn/ui primitives (do not edit manually)
│   ├── hooks/                        # TanStack Query hooks
│   ├── lib/                          # Auth, DB, R2, image, utils
│   ├── providers/                    # App-level providers
│   ├── store/                        # Zustand stores
│   └── types/                        # Global TypeScript types
├── proxy.ts                          # Route protection (replaces middleware.ts in Next.js 16)
├── biome.json
├── next.config.ts
└── tsconfig.json
```

---

## Database Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id        String  @id @default(cuid())
  email     String  @unique
  password  String
  name      String
  username  String  @unique
  bio       String?
  avatarUrl String?
  bannerUrl String?

  // Profile display
  displayName String?

  // Header layout
  headerLayout String @default("classic") // "classic" | "hero" | "banner" | "shape"
  avatarShape  String @default("flower")  // "flower" | "oval" | "rounded" | "burst"

  // Theme
  theme String @default("default")

  // Wallpaper
  wallpaperStyle    String  @default("fill") // "fill" | "gradient" | "blur" | "pattern" | "image" | "video"
  wallpaperColor    String  @default("#0A0A0A")
  wallpaperGradient String  @default("linear-gradient(180deg,#667eea,#764ba2)")
  gradientDirection String  @default("linear-top") // "linear-top" | "linear-bottom" | "radial"
  gradientNoise     Boolean @default(false)
  wallpaperPattern  String  @default("grid") // "grid" | "morph" | "organic" | "matrix"
  wallpaperImageUrl String?
  wallpaperVideoUrl String?
  wallpaperBlur     Int     @default(10)

  // Image / Video effects
  imageEffect String @default("none")
  imageTint   Int    @default(10)
  videoTint   Int    @default(10)

  // Text
  pageFontFamily  String  @default("inter")
  pageTextColor   String  @default("#EAEAEA")
  altTitleFont    Boolean @default(false)
  titleFontFamily String  @default("inter")
  titleColor      String  @default("#FFFFFF")
  bioColor        String  @default("#AAAAAA")

  // Button
  buttonStyle       String @default("solid")  // "solid" | "glass" | "outline"
  buttonShadow      String @default("none")   // "none" | "soft" | "strong" | "hard"
  buttonCorner      String @default("medium") // "sharp" | "small" | "medium" | "large" | "pill"
  buttonColor       String @default("#2A2A2A")
  buttonTextColor   String @default("#EAEAEA")
  buttonShadowColor String @default("#000000")

  // Footer
  hideFooter       Boolean @default(false)
  customFooterText String  @default("Buat Linkora-mu")
  customFooterUrl  String  @default("https://linkora.heinz.id")

  createdAt DateTime @default(now())

  links Link[]
  views View[]
}

model Link {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  title String
  url   String
  icon  String?

  // TODO: PLANNED — Thumbnail untuk link card preview
  thumbnailUrl String?

  color String?

  // TODO: PLANNED — Tipe link (social embed, header separator, dll)
  type String @default("url")

  isActive Boolean @default(true)
  isPinned Boolean @default(false)
  order    Int     @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  clicks Click[]

  @@index([userId, order])
}

model Click {
  id     String @id @default(cuid())
  linkId String
  link   Link   @relation(fields: [linkId], references: [id], onDelete: Cascade)

  clickedAt DateTime @default(now())

  device   String?
  browser  String?
  os       String?
  country  String?
  city     String?
  referrer String?
  ipHash   String?

  @@index([linkId, clickedAt])
}

model View {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  viewedAt DateTime @default(now())

  device   String?
  browser  String?
  country  String?
  referrer String?

  @@index([userId, viewedAt])
}
```

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.x
- A [Neon](https://neon.tech/) PostgreSQL database
- A [Cloudflare R2](https://www.cloudflare.com/products/r2/) bucket
- A [Vercel](https://vercel.com/) account (for deployment)

### Installation

```bash
git clone https://github.com/demonicheinz/linkora.git
cd linkora
bun install
```

### Environment Variables

Create a `.env.local` file in the project root (do not commit this file):

```env
# Database (Neon serverless PostgreSQL)
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler-xxx.neon.tech/neondb?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require&channel_binding=require"

# Auth.js secret — generate with: openssl rand -base64 32
AUTH_SECRET="..."
NEXTAUTH_URL="https://yourdomain.com"         # change to domain during production

# Cloudflare R2
R2_ACCOUNT_ID="abc123"
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="linkora-media"
R2_PUBLIC_URL="https://pub-xxx.r2.dev"        # or your custom domain

# App
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXT_PUBLIC_USERNAME="yourusername"           # single-user public slug

# Seed
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-password"
ADMIN_NAME="Your Name"                        # optional, default: "Admin"
ADMIN_BIO="Your Short Bio"                    # optional, default: "Welcome to my link page!"
```

### Database Setup

```bash
# Generate the Prisma client
bunx prisma generate

# Run migrations
bunx prisma migrate dev --name init

# Seed the database (creates the first admin account)
bunx prisma db seed
```

### Seed Data

```typescript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const plainPassword = process.env.ADMIN_PASSWORD;
  const username = process.env.NEXT_PUBLIC_USERNAME; // becomes the public URL: /yourusername
  const name = process.env.ADMIN_NAME ?? "Admin";
  const bio = process.env.ADMIN_BIO ?? "Welcome to my link page!";

  if (!email)
    throw new Error("ADMIN_EMAIL is not set in environment variables");
  if (!plainPassword)
    throw new Error("ADMIN_PASSWORD is not set in environment variables");
  if (!username)
    throw new Error("NEXT_PUBLIC_USERNAME is not set in environment variables");

  const password = await bcrypt.hash(plainPassword, 12);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password,
      name,
      username,
      bio,
    },
  });

  console.log(`✓ Admin account seeded: ${email} (@${username})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## Media Upload Architecture

All uploads follow a presigned URL flow — no media passes through the Next.js server directly, avoiding Vercel's 4.5 MB body limit.

```
Browser → POST /api/upload/presign   →  Generates presigned URL for R2
        ← { presignedUrl, publicUrl, key }

Browser → PUT presignedUrl           →  Uploads directly to R2 (bypasses Vercel)
        ← 200 OK from R2

Browser → POST /api/upload/confirm   →  HeadObject verification only (no DB write)
        ← { success: true }

        Frontend then calls PUT /api/user/me (or PUT /api/links) to persist the URL.
```

**Exception:** Avatar and thumbnail uploads require server-side resizing via `sharp`. These are sent to `/api/upload/process` instead, processed on the server, then uploaded to R2. Keep files under 4 MB to stay within Next.js body limits.

### Upload configuration by type

| Type | Max Size | Formats | sharp processing |
|---|---|---|---|
| `avatar` | 2 MB | JPG, PNG, WebP | Resize 400×400, crop center |
| `background` | 5 MB | JPG, PNG, WebP | Resize max 1500px, compress |
| `banner` | 3 MB | JPG, PNG | Resize 1500×500, crop fill |
| `thumbnail` | 1 MB | JPG, PNG, WebP | Resize 300×200, crop fill |
| `logo` | 1 MB | PNG, SVG, WebP | No sharp processing |
| `icon` | 500 KB | PNG, SVG | No sharp processing |

---

## Cloudflare R2 CORS Configuration

Go to **Cloudflare Dashboard → R2 → Your Bucket → Settings → CORS Policy** and add:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://yourdomain.com"
    ],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["Content-Type", "Content-Length"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## Development

```bash
# Start the dev server (Turbopack is on by default in Next.js 16)
bun dev

# Lint, format, and auto-fix with Biome
bunx biome check --write .

# Format only
bunx biome format --write .

# Lint only
bunx biome lint .

# Type-check + build
bun run build

# Open Prisma Studio (database GUI)
bunx prisma studio

# Generate Prisma client after schema changes
bunx prisma generate

# Create a new migration
bunx prisma migrate dev --name migration-name

# Generate async params types (Next.js 16 helper)
bunx next typegen
```

---

## Deployment

1. Push the repository to GitHub.
2. Import the repo in [Vercel](https://vercel.com) and configure all environment variables.
3. Run database migrations:
   ```bash
   bunx prisma migrate deploy
   ```
4. Seed the database:
   ```bash
   bunx prisma db seed
   ```
5. Set a custom domain in Vercel and update `NEXT_PUBLIC_APP_URL`.
6. Set a custom domain on your R2 bucket in Cloudflare and update `R2_PUBLIC_URL`.

---

## Architecture Decisions

**Why single-user instead of multi-user?**
Linkora is designed for its owner — there is no public registration. If you ever want to go multi-user, add `userId` to all R2 key paths and remove the `NEXT_PUBLIC_USERNAME` hardcode.

**Why Cloudflare R2 instead of Vercel Blob?**
R2 has zero egress fees (no charge when visitors access files), a 10 GB/month free tier (vs. Vercel Blob's 500 MB), and an S3-compatible API. If you're already using Cloudflare for DNS, you get CDN for free.

**Why presigned URLs instead of uploading through the server?**
Files go directly from the browser to R2, bypassing Vercel's 4.5 MB body limit. Uploads are faster, and upload progress can be tracked via XHR.

**Why use `sharp` on the server for avatar/thumbnail?**
It guarantees consistent dimensions (all avatars are exactly 400×400 px), compresses files before they reach storage, and keeps long-term storage costs low.

**Why `'use cache'` for the public page?**
The public page is visited by many people but only changes when the admin updates something. Caching it reduces database load significantly. After any mutation, `revalidateTag("public-page", "max")` is called to mark the cache as stale and trigger a background revalidation (stale-while-revalidate semantics).

---

## Next.js 16 Notes

### `proxy.ts` replaces `middleware.ts`

Route protection now lives in `proxy.ts` (not `middleware.ts`), and the exported function is named `proxy`:

```typescript
// proxy.ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export function proxy(req: Request) {
  // ...
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png).*)"],
}
```

### `params` and `searchParams` must be awaited

Synchronous access to `params` and `searchParams` is removed in Next.js 16. All pages, layouts, and route handlers must treat them as Promises:

```typescript
// ✅ Correct — Next.js 16
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
}

// ❌ Wrong — Next.js 15 and below only
export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params
}
```

Run the official codemod to migrate existing code:

```bash
npx @next/codemod@canary upgrade latest
```

### Explicit caching with `'use cache'`

`export const revalidate = N` is no longer valid. Use the new directive and cache APIs:

```typescript
import { cacheLife, cacheTag } from 'next/cache'

// Apply 'use cache' at the data-fetching function level, not the page level.
// The username argument automatically becomes part of the cache key.
async function getPublicData(username: string) {
  'use cache'
  cacheTag('public-page')    // tag for manual invalidation
  cacheLife('minutes')       // presets: seconds | minutes | hours | days | weeks | max

  // Prisma / DB query here...
}

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getPublicData(slug)
  // ...
}
```

Invalidate after a mutation (use 2-arg form — single-arg is deprecated):

```typescript
import { revalidateTag } from 'next/cache'
revalidateTag('public-page', 'max')  // 'max' = stale-while-revalidate semantics
```

### Turbopack is enabled by default

No flags needed — Turbopack runs automatically with `bun dev` and `bun run build`. To opt out if a dependency is incompatible:

```bash
bun dev --no-turbopack
```

---

## Code Conventions

### Linter & Formatter — Biome

This project uses **Biome** (not ESLint or Prettier). Do not generate ESLint or Prettier config files. Rules applied via `biome.json`:

- Indent: 2 spaces
- JS/TS quotes: double (`"`)
- Imports auto-sorted (`organizeImports: on`) — do not sort manually
- Tailwind directives (`@tailwind`, `@apply`, `@layer`) are allowed
- `noUnknownAtRules` is disabled for Tailwind v4 compatibility

### Naming conventions

| Type                  | Convention                  | Example               |
|-----------------------|-----------------------------|-----------------------|
| Components            | PascalCase                  | `LinkCard.tsx`        |
| Hooks                 | camelCase with `use` prefix | `use-links.ts`        |
| API routes            | kebab-case folders          | `/api/upload/presign` |
| Variables & functions | camelCase                   | `getUserLinks`        |
| Constants             | UPPER_SNAKE_CASE            | `MAX_FILE_SIZE`       |
| TypeScript types      | PascalCase                  | `LinkWithClicks`      |

### Server vs Client Components

- Default to **Server Components** — add `"use client"` only when necessary.
- Components using hooks, state, or event handlers → Client Component.
- Data fetching in Server Components uses Prisma directly (not a fetch to the app's own API).
- Data fetching in Client Components uses TanStack Query and calls API routes.

### Error handling

- API routes always return `{ error: string }` for errors with the appropriate HTTP status code.
- Client components use `try/catch` with `sonner` toasts for user feedback.
- Input validation is always done on the server with Zod; client-side validation is a bonus, not a replacement.

### File upload validation

Always validate server-side in `/api/upload/presign`:
1. Verify auth session
2. Check `contentType` against an allowlist
3. Check `size` against `maxSize`
4. Generate the R2 key with `nanoid()` — never use the original filename from the user

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

Made with ☕ by [Heinz](https://github.com/demonicheinz)
