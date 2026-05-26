# 🌐 Traveo - System Integration Guide

## Overview

Traveo is a comprehensive travel platform with three distinct portals:

1. **User Portal** - Travelers can book flights, hotels, events, guides, restaurants, transfers, and apply for e-visas
2. **Provider Portal** - Service providers manage their offerings, bookings, earnings, reviews, and messages
3. **Super Admin Portal** - Platform administrators control flights, visa systems, finances, events, analytics, and moderation

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Traveo Platform                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │   USER      │    │   PROVIDER   │    │  SUPER ADMIN     │   │
│  │   PORTAL    │◄──►│   PORTAL     │◄──►│  PORTAL          │   │
│  │             │    │              │    │                  │   │
│  │ - Browse    │    │ - Dashboard  │    │ - Flight Mgmt    │   │
│  │ - Book      │    │ - Services   │    │ - Visa Rules     │   │
│  │ - Pay       │    │ - Bookings   │    │ - Financial      │   │
│  │ - Review    │    │ - Earnings   │    │ - Analytics      │   │
│  │ - e-Visa    │    │ - Reviews    │    │ - Moderation     │   │
│  │ - Wallet    │    │ - Messages   │    │ - User Mgmt      │   │
│  └─────────────┘    └──────────────┘    └──────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
         │                      │                      │
         ▼                      ▼                      ▼
    ┌─────────┐          ┌─────────┐           ┌─────────┐
    │ Auth    │          │Provider │           │ Admin   │
    │ Store   │          │Auth Str │           │Auth Str │
    └─────────┘          └─────────┘           └─────────┘
         │                      │                      │
         └──────────────────────┴──────────────────────┘
                                 │
                                 ▼
                       ┌───────────────────┐
                       │ Shared Data Layer │
                       │  (Future API)     │
                       └───────────────────┘
```

## Portal Access Points

### User Portal
- **Route**: `/` (default)
- **Authentication**: Optional (guest browsing allowed)
- **Key Features**:
  - Flight search & booking
  - Hotel reservations
  - Event tickets
  - Guide & experience booking
  - Restaurant reservations
  - Transfer services
  - e-Visa applications
  - Wallet management
  - Trip history & reviews

### Provider Portal
- **Route**: `/provider`
- **Login**: `/provider/login`
- **Authentication**: Required
- **Demo Credentials**:
  - Email: `ephraim@grandvista.com`
  - Password: `provider123`
- **Key Features**:
  - Service management (Hotels, Guides, Transport, Restaurants, Events)
  - Booking management with status tracking
  - Revenue & earnings dashboard
  - Guest review management
  - Direct messaging with guests
  - Verification center
  - Account settings

### Super Admin Portal
- **Route**: `/admin`
- **Login**: `/admin/login`
- **Authentication**: Required
- **Demo Credentials**:
  - Email: `admin@tripplanner.com`
  - Password: `admin123`
- **Key Features**:
  - Flight system configuration (Airlines, Routes, Pricing)
  - Visa & government relations management
  - Financial control & wallet oversight
  - Event governance & approval
  - Analytics & intelligence dashboards
  - Growth & monetization tools
  - Risk management & legal compliance
  - User & provider management

## Data Flow & Communication

### User → Provider
- **Booking Creation**: User books a service → Provider receives booking notification
- **Messages**: User sends query → Provider responds via messaging system
- **Reviews**: User submits review → Provider can respond

### Provider → Admin
- **Service Submission**: Provider creates service → Admin approves/moderates
- **Verification Requests**: Provider submits documents → Admin verifies
- **Payout Requests**: Provider requests payout → Admin processes

### Admin → System
- **Configuration**: Admin sets commission rates, visa rules, flight availability
- **Moderation**: Admin moderates users, providers, and content
- **Analytics**: Admin monitors platform performance and user behavior

## Technical Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Router**: React Router v7 (Declarative Mode)
- **State Management**: Zustand
- **UI Components**: shadcn/ui (Tailwind v4)
- **Forms**: React Hook Form (future)
- **Data Fetching**: TanStack Query (configured for future use)

### Key Libraries
- `lucide-react` - Icons
- `date-fns` - Date formatting
- `qrcode.react` - QR code generation
- `sonner` - Toast notifications

### Styling
- **CSS Framework**: Tailwind CSS v4
- **Design System**: Custom theme with primary color #44DBD4 (Teal/Cyan)
- **Dark Mode**: Supported via next-themes

## File Structure

```
src/
├── components/
│   ├── layout/          # Shared layouts (Navbar, Footer, MainLayout)
│   └── ui/              # shadcn components (Button, Card, Table, etc.)
├── pages/
│   ├── admin/           # Super Admin pages
│   │   ├── AdminLoginPage.tsx
│   │   ├── SuperAdminLayout.tsx
│   │   ├── FlightManagementPage.tsx
│   │   ├── VisaGovernmentPage.tsx
│   │   ├── FinancialControlPage.tsx
│   │   ├── EventsGovernancePage.tsx
│   │   ├── AnalyticsDashboardPage.tsx
│   │   ├── GrowthMonetizationPage.tsx
│   │   ├── RisksLegalPage.tsx
│   │   └── UserManagementPage.tsx
│   ├── provider/        # Provider pages (NEW)
│   │   ├── ProviderLoginPage.tsx
│   │   ├── ProviderLayout.tsx
│   │   ├── ProviderDashboardPage.tsx
│   │   ├── ProviderServicesPage.tsx
│   │   ├── ProviderBookingsPage.tsx
│   │   ├── ProviderEarningsPage.tsx
│   │   ├── ProviderReviewsPage.tsx
│   │   ├── ProviderMessagesPage.tsx
│   │   ├── ProviderVerificationPage.tsx
│   │   └── ProviderSettingsPage.tsx
│   └── ...              # User pages (HomePage, FlightsPage, etc.)
├── stores/
│   ├── authStore.ts           # User authentication
│   ├── adminAuthStore.ts      # Admin authentication
│   ├── providerAuthStore.ts   # Provider authentication (NEW)
│   └── providerDataStore.ts   # Provider data management (NEW)
├── types/
│   ├── enums.ts         # Shared enums
│   ├── schema.ts        # User-facing types
│   └── provider.ts      # Provider-specific types (NEW)
└── routes.tsx           # Route configuration
```

## Authentication Flow

### User Authentication
```typescript
import { useAuthStore } from '@/stores/authStore'

const { user, isAuthenticated, login, logout } = useAuthStore()
```

### Provider Authentication
```typescript
import { useProviderAuthStore } from '@/stores/providerAuthStore'

const { 
  provider, 
  isProviderAuthenticated, 
  currentServiceType,
  providerLogin, 
  providerLogout,
  switchServiceType 
} = useProviderAuthStore()
```

### Admin Authentication
```typescript
import { useAdminAuthStore } from '@/stores/adminAuthStore'

const { admin, isAdminAuthenticated, adminLogin, adminLogout } = useAdminAuthStore()
```

## Provider Service Types

Providers can manage multiple service types:

| Type | Icon | Label | Description |
|------|------|-------|-------------|
| `hotel` | Bed | Hotels | Room types & amenities |
| `guide` | MapPin | Guides & Experiences | Tours & adventures |
| `transport` | Car | Transport | Vehicles & transfers |
| `restaurant` | Utensils | Restaurants | Dining options |
| `events` | CalendarStar | Premium Events | Event spaces & packages |

## Future API Integration

Currently, the system uses mock data stores. For production:

1. **Replace Mock Data** in:
   - `src/stores/providerDataStore.ts` - Provider data
   - `src/data/mockData.ts` - User-facing data
   - Admin pages - Static data

2. **Add API Layer**:
   ```typescript
   // Example using TanStack Query
   import { useQuery, useMutation } from '@tanstack/react-query'
   
   // Provider bookings
   const { data: bookings } = useQuery({
     queryKey: ['provider-bookings'],
     queryFn: fetchProviderBookings
   })
   
   // Update booking status
   const updateBooking = useMutation({
     mutationFn: updateBookingStatus,
     onSuccess: () => queryClient.invalidateQueries(['provider-bookings'])
   })
   ```

3. **Cross-Portal Communication**:
   - Implement real-time notifications (WebSocket/SSE)
   - Add event bus for inter-portal updates
   - Sync user actions with provider/admin views

## Testing

### Test Accounts

**Provider Portal**:
- Email: `ephraim@grandvista.com`
- Password: `provider123`
- Type: Hotel Manager

**Admin Portal**:
- Email: `admin@tripplanner.com`
- Password: `admin123`
- Role: Super Admin

### Test Scenarios

1. **Provider Workflow**:
   - Login → View Dashboard → Manage Services → Check Bookings → Respond to Reviews

2. **User → Provider Flow**:
   - User books hotel → Provider sees booking → Provider checks in guest → Guest reviews → Provider responds

3. **Admin Oversight**:
   - Monitor all bookings → Review financial transactions → Moderate content → Approve providers

## Deployment Checklist

- [ ] Replace all mock data with real API calls
- [ ] Implement authentication backend (JWT recommended)
- [ ] Set up WebSocket for real-time updates
- [ ] Configure payment gateway integration
- [ ] Add email notification service
- [ ] Implement file upload for verification documents
- [ ] Set up analytics tracking
- [ ] Configure error logging (Sentry recommended)
- [ ] Add rate limiting and security headers
- [ ] Set up CI/CD pipeline
- [ ] Configure production environment variables
- [ ] Implement data backup strategy

## Development Notes

- All portals use the same design system for consistency
- Colors are configured in `src/index.css` using Tailwind v4 theme
- Components follow shadcn patterns for maintainability
- Routes are centralized in `src/routes.tsx`
- State is managed locally per portal to avoid conflicts

## Support & Documentation

For questions or issues:
- Technical documentation: See component-specific files
- Design guidelines: See shadcn documentation
- API integration: TanStack Query docs
- State management: Zustand docs

---

**Last Updated**: 2026-02-26
**Version**: 1.0.0
