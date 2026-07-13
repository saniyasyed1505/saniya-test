# AI Image & Video Generation SaaS — Backend

A production-ready backend for an AI Image & Video Generation SaaS built with **NestJS**, **TypeScript**, **PostgreSQL**, **Prisma ORM**, **BullMQ**, and **JWT Authentication**.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (Node.js) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL + Prisma ORM |
| Queue | Redis + BullMQ |
| Authentication | JWT (Access + Refresh Token rotation) |
| Storage | AWS S3 / Cloudflare R2 (adapter pattern) |
| Documentation | Swagger / OpenAPI |
| Containerization | Docker + Docker Compose |

---

## 📁 Project Structure

```
src/
├── admin/                    # Admin-only endpoints (users, all generations)
│   ├── admin.controller.ts
│   ├── admin.module.ts
│   └── admin.service.ts
├── ai/                       # AI Provider abstraction layer
│   ├── providers/
│   │   ├── ai-provider.interface.ts   # Provider interface contract
│   │   ├── mock.provider.ts           # Mock provider (local dev)
│   │   └── openai.provider.ts         # OpenAI DALL-E provider
│   ├── ai.module.ts
│   └── ai.service.ts
├── auth/                     # JWT Authentication
│   ├── dto/
│   │   ├── login.dto.ts
│   │   ├── refresh.dto.ts
│   │   └── register.dto.ts
│   ├── strategies/
│   │   ├── jwt-refresh.strategy.ts
│   │   └── jwt.strategy.ts
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   └── auth.service.spec.ts
├── common/                   # Shared utilities and middleware
│   ├── decorators/
│   │   ├── get-user.decorator.ts
│   │   └── roles.decorator.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── jwt-refresh.guard.ts
│   │   └── roles.guard.ts
│   └── interceptors/
│       └── logging.interceptor.ts
├── config/
│   └── configuration.ts      # App config factory
├── generations/              # Image & Video generation lifecycle
│   ├── dto/
│   │   └── create-generation.dto.ts
│   ├── generations.controller.ts
│   ├── generations.module.ts
│   └── generations.service.ts
├── history/                  # User generation history
│   ├── history.controller.ts
│   ├── history.module.ts
│   └── history.service.ts
├── jobs/                     # BullMQ queues & workers
│   ├── processors/
│   │   ├── image.processor.ts
│   │   └── video.processor.ts
│   ├── jobs.module.ts
│   └── jobs.service.ts
├── prisma/                   # Prisma client module
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── storage/                  # Storage adapter layer
│   ├── adapters/
│   │   ├── local.adapter.ts
│   │   ├── s3.adapter.ts
│   │   └── storage-adapter.interface.ts
│   ├── storage.module.ts
│   ├── storage.service.ts
│   └── storage.service.spec.ts
├── users/                    # User module
│   ├── entities/
│   │   └── user.entity.ts
│   ├── users.controller.ts
│   ├── users.module.ts
│   └── users.service.ts
├── app.module.ts
└── main.ts
prisma/
├── schema.prisma             # Database schema
└── seed.ts                   # Default user seeding
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/ai_saas` |
| `JWT_SECRET` | Access token signing secret | *(set this in production)* |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | *(set this in production)* |
| `REDIS_HOST` | Redis hostname | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `STORAGE_PROVIDER` | `local` or `s3` | `local` |
| `S3_BUCKET` | S3/R2 bucket name | — |
| `S3_REGION` | S3/R2 region | — |
| `S3_ACCESS_KEY` | S3/R2 access key | — |
| `S3_SECRET_KEY` | S3/R2 secret key | — |
| `OPENAI_API_KEY` | OpenAI API key | `mock-key-for-local-testing` |

> **Note**: When `OPENAI_API_KEY` is `mock-key-for-local-testing` or empty, the backend automatically uses the `MockAIProvider` that simulates generation results without calling any external API.

---

## 🐳 Quick Start with Docker (Recommended)

The fastest way to get up and running with all services:

```bash
# 1. Clone/enter the project
cd saniya-test

# 2. Copy environment file
cp .env.example .env

# 3. Launch all services (PostgreSQL, Redis, API)
docker compose up --build

# 4. In a separate terminal, run Prisma migrations
docker exec -it ai_saas_api npx prisma migrate dev --name init

# 5. (Optional) Seed the database with sample users
docker exec -it ai_saas_api npx ts-node prisma/seed.ts
```

The API will be available at **http://localhost:3000**
Swagger docs will be at **http://localhost:3000/api/docs**

---

## 💻 Local Development (Without Docker)

### Prerequisites

- Node.js 18+
- PostgreSQL running locally
- Redis running locally

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment variables
cp .env.example .env
# Edit .env with your local database and Redis connection strings

# 3. Generate the Prisma client
npx prisma generate

# 4. Run database migrations
npx prisma migrate dev --name init

# 5. (Optional) Seed default admin and user accounts
npx ts-node prisma/seed.ts

# 6. Start the development server with hot reload
npm run start:dev
```

---

## 📖 API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | None | Register a new user |
| `POST` | `/auth/login` | None | Login and receive JWT tokens |
| `POST` | `/auth/refresh` | Refresh Token | Rotate access + refresh tokens |
| `POST` | `/auth/logout` | Access Token | Logout and invalidate refresh token |
| `GET` | `/auth/me` | Access Token | Get current user profile |

### Generations

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/generate/image` | Access Token | Queue an asynchronous image generation job |
| `POST` | `/generate/video` | Access Token | Queue an asynchronous video generation job |
| `GET` | `/generation/:id` | Access Token | Get generation status and details |
| `DELETE` | `/generation/:id` | Access Token | Delete a generation and clean up assets |
| `GET` | `/history` | Access Token | Get paginated generation history |

### Admin (ADMIN role required)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/admin/users` | Admin Token | List all registered users |
| `GET` | `/admin/generations` | Admin Token | List all generation requests |

---

### Request Schemas

**Register**
```json
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login**
```json
POST /auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Generate Image / Video**
```json
POST /generate/image
Authorization: Bearer <access_token>

{
  "prompt": "A futuristic cybernetic city at dusk",
  "model": "dall-e-3"
}
```

**Response (queued)**
```json
{
  "generationId": "uuid-of-the-generation"
}
```

---

## 🔄 Generation Lifecycle

```
Client → POST /generate/image
          ↓
        Save Generation (status: QUEUED)
          ↓
        Enqueue BullMQ Job (image-generation queue)
          ↓
        Return { generationId } immediately ← Client polls GET /generation/:id
          ↓
        [Background Worker]
          ↓
        Update status: PROCESSING
          ↓
        Call AI Provider (OpenAI / Mock)
          ↓
        Download generated media
          ↓
        Upload to Storage (S3 / R2 / Local)
          ↓
        Update status: COMPLETED + mediaUrl
```

On failure, the worker retries up to **3 times** with **exponential backoff** (5s → 10s → 20s), then marks the generation as `FAILED` with an error message.

---

## 🤖 AI Provider Abstraction

The AI layer uses an adapter pattern — all providers implement the same `AIProvider` interface:

```typescript
interface AIProvider {
  generateImage(prompt: string, model: string): Promise<AIProviderResult>;
  generateVideo(prompt: string, model: string): Promise<AIProviderResult>;
  checkStatus(providerJobId: string): Promise<AICheckStatusResult>;
}
```

**Available providers:**
- `MockAIProvider` — Used automatically when no real API key is set (local development)
- `OpenAIProvider` — Calls DALL-E 3 image generation API

**To add a new provider** (e.g., Runway, Fal, Replicate):
1. Create `src/ai/providers/runway.provider.ts` implementing `AIProvider`
2. Update `AIService.onModuleInit()` to select it based on a config key

---

## 💾 Storage Adapter

The storage layer uses the same adapter pattern:

```typescript
interface StorageAdapter {
  upload(file: Buffer, path: string, mimeType: string): Promise<string>;
  delete(path: string): Promise<void>;
  getUrl(path: string): Promise<string>;
}
```

- `STORAGE_PROVIDER=local` → Stores files in `public/uploads/` and serves via Express static
- `STORAGE_PROVIDER=s3` → Uploads to AWS S3 or Cloudflare R2 (S3-compatible)

For **Cloudflare R2**, set an additional `S3_ENDPOINT` env var pointing to your R2 endpoint URL.

---

## 🛡️ Security

- **Helmet** — Sets security-related HTTP headers
- **CORS** — Configurable cross-origin access
- **bcrypt** — Passwords hashed with cost factor 10
- **JWT Rotation** — Refresh tokens are hashed (bcrypt) in the database and rotated on each use
- **Role-Based Guards** — `RolesGuard` + `@Roles()` decorator protect admin routes
- **Input Validation** — `class-validator` with global `ValidationPipe` (whitelist + forbidNonWhitelisted)
- **No secrets in code** — All secrets via `.env` / environment variables

---

## 🗄️ Database Schema

```prisma
model User {
  id               String       @id @default(uuid())
  name             String
  email            String       @unique
  passwordHash     String
  role             Role         @default(USER)
  refreshTokenHash String?
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
  generations      Generation[]
}

model Generation {
  id           String           @id @default(uuid())
  userId       String
  type         GenerationType   // IMAGE | VIDEO
  prompt       String
  status       GenerationStatus // QUEUED | PROCESSING | COMPLETED | FAILED
  model        String
  mediaUrl     String?
  thumbnailUrl String?
  errorMessage String?
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
}

model Job {
  id            String     @id @default(uuid())
  generationId  String
  providerJobId String?
  provider      String
  status        String
  retries       Int        @default(0)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}
```

---

## 🧪 Testing

```bash
# Run all unit tests
npm run test

# Run with coverage report
npm run test:cov

# Watch mode
npm run test:watch
```

Test files:
- `src/auth/auth.service.spec.ts` — Auth registration, login, and credential validation
- `src/ai/ai.service.spec.ts` — AI provider routing and API fallback logic
- `src/storage/storage.service.spec.ts` — Local vs S3 adapter initialization

---

## 📚 API Documentation (Swagger)

When the server is running, visit:

**http://localhost:3000/api/docs**

The Swagger UI provides:
- Full request/response schemas for all endpoints
- Bearer token authentication support
- Live API testing via the browser

---

## 🔧 Available Scripts

| Script | Description |
|---|---|
| `npm run start:dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start:prod` | Run compiled production build |
| `npm run test` | Run unit tests |
| `npm run test:cov` | Run tests with coverage |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate` | Run migrations in dev mode |
| `npm run prisma:seed` | Seed the database |

---

## 🌱 Default Seed Users

After running `npm run prisma:seed`:

| Email | Password | Role |
|---|---|---|
| `admin@example.com` | `admin123` | ADMIN |
| `user@example.com` | `user123` | USER |

---

## 📦 Adding a New AI Provider

1. Create a new provider file:

```typescript
// src/ai/providers/runway.provider.ts
import { AIProvider, AIProviderResult, AICheckStatusResult } from './ai-provider.interface';

export class RunwayProvider implements AIProvider {
  async generateImage(prompt: string, model: string): Promise<AIProviderResult> { ... }
  async generateVideo(prompt: string, model: string): Promise<AIProviderResult> { ... }
  async checkStatus(providerJobId: string): Promise<AICheckStatusResult> { ... }
}
```

2. Register it in `AIService.onModuleInit()` based on a config key:

```typescript
const aiProvider = this.configService.get<string>('ai.provider');
if (aiProvider === 'runway') {
  this.provider = new RunwayProvider(apiKey);
}
```

3. Add `AI_PROVIDER=runway` to your `.env`.

No other changes needed — the workers and generation pipeline are provider-agnostic.
