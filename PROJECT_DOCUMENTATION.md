# Traveo — Global Project Documentation (Web + Mobile) + Node.js Backend Proposal

> Version: 1.0 (generated from repository analysis)

## 1) What is Traveo?
Traveo is a travel booking platform that lets users discover and reserve multiple categories of travel services:
- Flights
- Hotels / accommodations
- Premium events (with ticketing)
- Guides / local experiences
- Restaurants
- Transfers
- e-Visa services
- Wallet & payments

The repository contains:
- **Traveo-master**: Web frontend (**React + TypeScript + Vite**)
- **Traveo-app-main**: Mobile app (**Flutter**) 

This document provides a **global, cross-platform** documentation and a **backend proposal in Node.js** (even if the repo currently does not include backend implementation).

---

## 2) Portals / Roles / Entry Points

### 2.1 User Portal (Traveler)
- Web entry: `/`
- Web flows: browse → search → reserve → pay → manage trips → download e-tickets → support
- Authentication: optional (guest browse, full features require login)

### 2.2 Provider Portal (Service Providers)
- Web entry: `/provider`
- Key capabilities:
  - Manage services (hotels, guides, transport, restaurants, events)
  - Manage provider bookings
  - View earnings
  - Manage reviews & respond
  - Messaging with guests
  - Verification & settings

### 2.3 Super Admin Portal
- Web entry: `/admin`
- Key capabilities:
  - Flight system configuration (airlines/routes/pricing)
  - Visa & government rules management
  - Financial control / wallet oversight
  - Event governance & moderation
  - Analytics & risk/legal controls
  - User & provider management

---

## 3) Cross-Platform Architecture Overview

### 3.1 Shared Domain (conceptual)
Both web and mobile apps should align on the same conceptual domain:
- **Identity & Auth**: users, providers, admins
- **Catalog**: services (flights/hotels/events/etc.)
- **Bookings**: reservations per service type
- **Payments / Wallet**: balances, transactions, refunds
- **e-Visa**: eligibility rules, applications, document storage, status
- **Tickets**: QR-based e-tickets for flights/events
- **Notifications**: reminders and booking/visa updates
- **Reviews & Messaging**: post-booking feedback and communication

### 3.2 Backend contract mindset
Apps should treat the backend as the system of record:
- Services: availability, pricing, rules
- Bookings: lifecycle, status transitions
- Wallet: atomic ledger, transaction history
- e-Visa: requirement definitions + application processing + status updates

---

## 4) Web Frontend Documentation (Traveo-master)

### 4.1 Tech stack
- React 19 + TypeScript
- Vite 7
- Tailwind CSS v4
- shadcn/ui (Radix UI primitives)
- lucide-react icons
- react-router-dom (declarative routes using `createBrowserRouter`)
- Zustand (state)
- TanStack Query (planned/integration-ready)

### 4.2 Repository structure (high level)
- `src/`
  - `pages/` : route-level pages (User/Provider/Admin)
  - `components/` : reusable UI components
  - `stores/` : Zustand stores (auth, booking, wallet, notifications, provider data)
  - `data/` : mock data
  - `routes.tsx` : router configuration
  - `types/` : shared TypeScript types
  - `lib/` : formatters/utilities

### 4.3 Routing (portals)
Web router includes:
- User routes: `/`, `/discover`, `/flights`, `/hotels`, `/events`, `/guides`, `/restaurants`, `/transfers`, `/visa`, `/wallet`, `/my-trips`, `/profile`, `/notifications`, `/booking-confirmation/:bookingId`, `/reviews`, `/support`, `become-provider`
- Provider routes:
  - `/provider/login`
  - `/provider` + children (dashboard, services, bookings, earnings, reviews, messages, verification, settings)
- Admin routes:
  - `/admin/login`
  - `/admin` + children (flight management, visa governance, financial control, events governance, analytics, growth, risks/legal, user management)

### 4.4 Key implemented features (as seen from code/docs)
- Flight discovery and reservation flow (with confirmation and QR-based e-ticket link)
- Event ticketing capabilities
- e-Visa eligibility + application form with document upload UX (document storage is a backend responsibility)
- Wallet UI (multi-currency UX)
- Booking dashboard (My Trips)
- Provider/admin management UIs (many parts currently use mock data)
- AI-powered chat support system (OpenAI integration for natural language responses)
- Real-time support chat with context awareness and user authentication

---

## 5) Mobile App Documentation (Traveo-app-main)

### 5.1 Tech stack (Flutter)
- Flutter app with:
  - `lib/` for Dart code
  - `lib/screens/` for route screens
  - `lib/widgets/` for reusable widgets
  - `lib/models/` for core models
  - `lib/theme/` for theme

### 5.2 Functional coverage
Based on repo structure and naming, the mobile app implements corresponding app features:
- Splash/auth/initialization screens
- Main navigation
- Flights, hotels, events, transfers, guides
- Wallet & profile
- e-Visa flow
- Booking reservations and trip history
- Notifications and privacy policy

---

## 6) Domain Model (Unified Conceptual Data)

### 6.1 Core entities
- **User**: profile, credentials, roles
- **Provider**: service owner/manager
- **Admin**: platform governance

- **Service** (polymorphic by type):
  - flights route/offer (with pricing model and availability)
  - hotel room/inventory
  - event offering (ticket quantities)
  - guide/experience offering
  - restaurant offering
  - transfer offering

- **Booking**:
  - references a user + a service (and potentially provider)
  - status lifecycle (pending/confirmed/cancelled/completed)
  - stores pricing, currency, payment reference(s)

- **Wallet / Ledger**:
  - balances per currency
  - transactions (credit/debit)
  - refunds

- **e-Visa Application**:
  - destination country
  - applicant info
  - document set
  - eligibility status
  - processing status and timeline

- **Ticket**:
  - QR payload and ticket validity
  - generation rules (flight tickets, event tickets)

- **Review** / **Message**:
  - user/provider communication and feedback

---

## 7) Backend Node.js Proposal (Express/NestJS) — Full Web App + Mobile Ready

The repo does not contain backend implementation, so this section defines a **complete proposed backend** aligned with the UI requirements and existing system docs (auth + multi-portal + flights/visa/payment/bookings).

### 7.1 Goals
- Provide stable REST APIs for web + mobile
- Support microservice evolution (optional), without blocking MVP
- Enforce auth/roles (user/provider/admin)
- Secure file uploads (visa documents)
- Provide ticket generation hooks (QR payload)
- Support real-time or near-real-time updates (notifications)
- Provide observability (logs, metrics, traces)
- Integrate AI services for enhanced user experience (chat support, personalization)

### 7.2 Recommended stack (Node.js)
Two valid options are supported by this documentation:

**Option A (recommended): NestJS + TypeScript**
- Structure (modules/controllers/services) maps naturally to microservices
- Strong guards/interceptors/validation

**Option B: Express + TypeScript**
- Lightweight approach
- Requires more manual structure (controllers/services/middlewares)

This proposal uses **NestJS terminology**; you can map 1:1 to Express.

Core libraries:
- **Framework**: NestJS (or Express)
- **Auth**: JWT access + refresh (cookies or Authorization header)
- **Validation**: class-validator / zod
- **DB**: PostgreSQL (recommended)
- **ORM**: Prisma (or TypeORM)
- **File storage**: S3-compatible (AWS S3 / Cloudflare R2 / MinIO)
- **Caching**: Redis (optional but recommended)
- **Async updates**: BullMQ/Redis or RabbitMQ (optional)
- **Email/SMS**: provider SDKs (SendGrid/Twilio/etc.)
- **Observability**: OpenTelemetry + pino/winston + Sentry

### 7.3 Architecture pattern

#### MVP (single deploy, modular)
- One Node.js app with modules:
  - AuthModule
  - CatalogModule (services)
  - BookingModule
  - PaymentModule
  - VisaModule
  - NotificationModule
  - TicketModule
  - ProviderAdminModule

#### Scalable evolution (microservices + gateway)
- API Gateway (Node) routes to services:
  - Auth Service
  - Flight Service
  - Booking Service
  - Visa Service
  - Payment Service
  - Notification Service

A gateway can be a NestJS app itself using routes to internal services.

### 7.4 API style
- REST JSON APIs
- Versioning: `/v1/...`
- Pagination standard: `?page=1&limit=20`
- Sorting standard: `sort=field:asc` or `sortBy=...&order=...`

### 7.5 Authentication & Authorization

#### Roles
- `user`
- `provider`
- `admin`

#### JWT model
- Access token: short lived (e.g., 15 min)
- Refresh token: longer lived (e.g., 7 days)
- Transport:
  - Recommended: HttpOnly secure cookies for web, Authorization header for mobile
- Guards:
  - Role-based access control on routes

#### Recommended endpoints
- `POST /v1/auth/login`
- `POST /v1/auth/register`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`
- `GET /v1/auth/me`

### 7.6 Core service APIs (proposed)

#### 7.6.1 Flights / Catalog
- `GET /v1/flights/search` (query params: origin, destination, date range, passengers, cabin)
- `GET /v1/flights/:flightId`
- `POST /v1/flights/book`

#### Flight ticket reservation provider: Duffel
When booking flight tickets, the backend will call **Duffel** (the upstream flight ticketing / fare + ticketing provider).

- Base URL (upstream): `https://api.duffel.com`
- Example upstream auth pattern (conceptual): use a Duffel API token stored in backend secrets.

Backend responsibilities around Duffel:
- Transform Traveo flight selection into Duffel booking payloads
- Handle Duffel availability/pricing changes between search and booking
- Persist Duffel references (e.g., offer/booking IDs) inside the local Booking record
- On success, generate/return Traveo ticket artifacts (QR payload metadata) tied to the local Booking ID
- On failure, return actionable error codes/messages to the web/mobile clients


Provider/admin management (admin portal):
- `GET /v1/admin/airlines`
- `POST /v1/admin/airlines`
- `PATCH /v1/admin/airlines/:airlineId`
- `POST /v1/admin/airlines/:airlineId/sync`
- `GET /v1/admin/routes`
- `POST /v1/admin/routes`
- `PATCH /v1/admin/routes/:routeId`

#### 7.6.2 Hotels / Accommodations
- `GET /v1/hotels/search`
- `GET /v1/hotels/:hotelId`
- `POST /v1/hotels/book`

#### 7.6.3 Events & Tickets
- `GET /v1/events`
- `GET /v1/events/:eventId`
- `POST /v1/events/book`
- `GET /v1/bookings/:bookingId/ticket` (returns ticket metadata + QR payload)

#### 7.6.4 Guides / Experiences
- `GET /v1/guides`
- `GET /v1/guides/:guideId`
- `POST /v1/guides/book`

#### 7.6.5 Transfers
- `GET /v1/transfers/search`
- `GET /v1/transfers/:transferId`
- `POST /v1/transfers/book`

#### 7.6.6 Restaurants
- `GET /v1/restaurants`
- `GET /v1/restaurants/:restaurantId`
- `POST /v1/restaurants/book`

#### 7.6.7 Booking lifecycle (unified)
- `GET /v1/bookings` (user scope)
- `GET /v1/bookings/:bookingId` 
- `PATCH /v1/bookings/:bookingId` (admin/provider actions allowed by role)
- `DELETE /v1/bookings/:bookingId` (cancel)

Provider portal:
- `GET /v1/provider/bookings`
- `PATCH /v1/provider/bookings/:bookingId/status`
- `GET /v1/provider/earnings`

Admin portal:
- `GET /v1/admin/bookings?status=...`
- `GET /v1/admin/users`
- `PATCH /v1/admin/users/:userId`

### 7.7 Payment & Wallet (critical)

Use an **accounting/ledger approach**:
- Never store money as floating-point; use integers for minor units (e.g., cents)
- One ledger entry per payment/refund

Proposed endpoints:
- `GET /v1/wallet/balance`
- `POST /v1/wallet/add-funds`
- `POST /v1/wallet/withdraw`
- `GET /v1/wallet/transactions`

Mobile money integration (recommended for Traveo):
- `POST /v1/payments/campay/initialize` (MTN Mobile Money, Orange Money)
- `POST /v1/payments/campay/webhooks` (provider callback)

Note: If you later integrate Stripe, add it as an additional payment method module, but it is not the primary one for this project.


Refunds:
- `POST /v1/refunds` (admin or user depending on policy)

### 7.8 e-Visa subsystem

Data model responsibilities:
- Eligibility rules per destination country
- Required documents definitions
- Application record lifecycle
- Document upload + storage + processing

Endpoints:
- `GET /v1/visa/destinations`
- `GET /v1/visa/:countryCode/requirements`
- `POST /v1/visa/applications` (creates application)
- `POST /v1/visa/applications/:applicationId/documents` (multipart upload or pre-signed URLs)
- `GET /v1/visa/applications/:applicationId`
- `GET /v1/visa/applications` (user scope)

Document storage:
- Use pre-signed URLs for direct upload to object storage (safer + scalable)

### 7.9 Notifications

Recommended transport:
- **MVP**: polling from `/v1/notifications`
- **Upgrade path**: SSE/WebSocket for real-time updates

Endpoints:
- `GET /v1/notifications`
- `PATCH /v1/notifications/:id/read`
- `POST /v1/notifications/test` (admin only)

### 7.10 Messaging & Reviews
- `POST /v1/messages`
- `GET /v1/messages/conversations`
- `POST /v1/reviews`
- `GET /v1/reviews?serviceType=...&serviceId=...`
- Provider replies (optional): `PATCH /v1/reviews/:id/provider-response`

### 7.11 AI Services Integration

#### Chat Support (OpenAI)
- **Endpoint**: `POST /v1/chat/message`
- **Purpose**: AI-powered customer support chat with context awareness
- **Features**:
  - Natural language processing for user queries
  - Context-aware responses based on user authentication and history
  - Integration with booking, wallet, and visa systems
  - Fallback to rule-based responses when AI unavailable
- **Implementation**: OpenAI GPT-3.5-turbo with custom system prompts
- **Data Storage**: ChatMessage table for conversation history

#### Future AI Integration Points
- **Personalized Recommendations**: AI-powered travel suggestions based on user history and preferences
- **Smart Search**: Natural language search across flights, hotels, and destinations
- **Dynamic Pricing**: AI-based price optimization and predictions
- **Content Generation**: AI-generated travel itineraries and tips
- **Fraud Detection**: ML models for payment and booking anomaly detection

#### AI Service Requirements
- **OpenAI API Key**: Required for chat functionality
- **Fallback Strategy**: Graceful degradation to rule-based responses
- **Rate Limiting**: API usage monitoring and cost control
- **Privacy**: User data handling compliant with privacy regulations

### 7.12 Tickets (QR)
Ticket QR payload design:
- Embed bookingId + ticketType + nonce + signature (HMAC/JWT)
- Validate signature on scan to prevent tampering

Endpoints:
- `GET /v1/bookings/:bookingId/ticket`

---

## 8) Security Requirements

### 8.1 OWASP essentials
- Input validation on all endpoints
- Output encoding (where relevant)
- Secure file uploads: virus scanning + size/type restrictions
- Rate limiting (auth, search, file upload)
- CSRF protection if cookies are used for auth

### 8.2 Secrets management
- Use environment variables for config
- Keep keys in secret manager (Vault/AWS Secrets Manager)

### 8.3 CORS
- Explicit allow-list for web domains

---

## 9) Performance & Reliability

### 9.1 Caching strategy
- Cache search results for short TTL (e.g., flights/hotels searches)
- Cache eligibility requirements for e-visa per country

### 9.2 Async jobs
- Sync external GDS/provider feeds
- Generate tickets
- Process visa document validation/workflows

### 9.3 Idempotency
- Use idempotency keys for payment and booking creation

---

## 10) Frontend ↔ Backend Mapping (What the UI needs)

### 10.1 User web/mobile needs
- Catalog search: flights/hotels/events/guides/restaurants/transfers
- Booking creation and booking confirmation
- Ticket rendering (QR)
- Wallet balance + transactions
- e-Visa application + document upload + status tracking
- Trip history: list bookings + statuses
- Notifications list
- Support & messaging

### 10.2 Provider portal needs
- Provider login
- Provider service management CRUD
- Provider bookings list + status update
- Earnings reporting
- Reviews management
- Verification documents

### 10.3 Admin portal needs
- Airline/route management + API sync controls
- Visa rules/governance
- Financial control
- Event governance/moderation
- Analytics dashboards
- User/provider management

---

## 11) Suggested Documentation Layout (for future backend implementation)
Create a backend docs folder in the future (recommended):
- `backend/docs/01-overview.md`
- `backend/docs/02-auth.md`
- `backend/docs/03-api-contract.md`
- `backend/docs/04-data-model.md`
- `backend/docs/05-e-visa.md`
- `backend/docs/06-payments-ledger.md`
- `backend/docs/07-notifications.md`
- `backend/docs/08-observability.md`

---

## 12) Appendix — Environment Variables (example)

**Common**
- `NODE_ENV=production`
- `PORT=8080`
- `CORS_ORIGINS=...`
- `DATABASE_URL=...`
- `REDIS_URL=...`

**AI Services**
- `OPENAI_API_KEY=...` (Required for chat support)

**Auth**
- `JWT_ACCESS_SECRET=...`
- `JWT_REFRESH_SECRET=...`

**File uploads**
- `OBJECT_STORAGE_ENDPOINT=...`
- `OBJECT_STORAGE_BUCKET=...`
- `OBJECT_STORAGE_ACCESS_KEY=...`
- `OBJECT_STORAGE_SECRET_KEY=...`

**Campay / Mobile Money (recommended)**
- `CAMPAY_API_KEY=...`
- `CAMPAY_MTN_MOMO_CLIENT_ID=...`
- `CAMPAY_ORANGE_MONEY_CLIENT_ID=...`
- `CAMPAY_WEBHOOK_SECRET=...`

**(Optional) Stripe**
- `STRIPE_SECRET_KEY=...`
- `STRIPE_WEBHOOK_SECRET=...`


---

## 13) Conclusion
This document unifies the Traveo system requirements across **web and mobile** and provides a full **Node.js backend blueprint** that supports:
- three portals (user/provider/admin)
- booking lifecycle + ticketing
- e-Visa document workflow
- wallet ledger & refunds
- notifications

When backend implementation starts, the next step is to generate an OpenAPI spec and implement the endpoints service-by-service, starting with Auth, Catalog search, Booking creation, Wallet ledger, and Visa requirements.

