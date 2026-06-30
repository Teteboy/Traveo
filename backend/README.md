# Traveo Backend API

Node.js + Express + TypeScript + PostgreSQL REST API for the Traveo travel platform.

## Stack
- **Runtime**: Node.js + TypeScript (tsx)
- **Framework**: Express 4
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: JWT (access + refresh tokens)
- **Payments**: Campay Mobile Money (MTN/Orange)

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env — set DATABASE_URL with your PostgreSQL credentials
```

### 3. Set up Cloudinary (for avatar uploads)
1. Create a free account at [https://cloudinary.com](https://cloudinary.com)
2. Go to your Dashboard → Account Details
3. Copy your Cloud name, API Key, and API Secret
4. Update `.env`:
   ```
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```
5. Avatar uploads will now use Cloudinary for storage

### 3. Create database & migrate
```bash
# Ensure PostgreSQL is running and "traveo" DB exists
npx prisma migrate dev --name init
```

### 4. Seed with demo data
```bash
npx tsx prisma/seed.ts
```

### 5. Run development server
```bash
npm run dev
# → http://localhost:3001
```

## Demo Credentials
| Role     | Email                  | Password     |
|----------|------------------------|--------------|
| Admin    | admin@traveo.cm        | admin123     |
| User     | user@traveo.cm         | user1234     |
| Provider | provider@traveo.cm     | provider123  |

## API Base URL
`http://localhost:3001/v1`

## Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login → tokens |
| GET | `/auth/me` | Current user |
| GET | `/destinations` | List destinations |
| GET | `/flights/search` | Search flights |
| POST | `/flights/book` | Book a flight |
| GET | `/hotels` | List hotels |
| POST | `/hotels/:id/book` | Book hotel |
| GET | `/events` | List events |
| GET | `/guides` | List guides |
| GET | `/restaurants` | List restaurants |
| GET | `/bookings` | My bookings |
| GET | `/wallet/balance` | Wallet balance |
| POST | `/wallet/add-funds` | Top up wallet |
| POST | `/payments/campay/initialize` | Init payment |
| GET | `/visa/destinations` | Visa countries |
| POST | `/visa/applications` | Apply for visa |
| GET | `/notifications` | Notifications |
| GET | `/discover` | Discover feed |
| GET | `/admin/stats` | Platform stats (admin) |
| GET | `/providers/dashboard` | Provider stats |

## Health Check
```
GET http://localhost:3001/health
```
