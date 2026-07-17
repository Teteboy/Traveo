import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { HomePage } from './pages/HomePage'
import { DiscoverPage } from './pages/DiscoverPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { FlightsPage } from './pages/FlightsPage'
import { HotelsPage } from './pages/HotelsPage'
import { EventsPage } from './pages/EventsPage'
import { GuidesPage } from './pages/GuidesPage'
import { RestaurantsPage } from './pages/RestaurantsPage'
import { VisaPage } from './pages/VisaPage'
import { WalletPage } from './pages/WalletPage'
import { MyTripsPage } from './pages/MyTripsPage'
import { ProfilePage } from './pages/ProfilePage'
import { NotificationsPage } from './pages/NotificationsPage'
import { FlightDetailsPage } from './pages/FlightDetailsPage'
import { HotelDetailsPage } from './pages/HotelDetailsPage'
import { BookingConfirmationPage } from './pages/BookingConfirmationPage'
import { TransfersPage } from './pages/TransfersPage'
import { EventDetailPage } from './pages/EventDetailPage'
import { GuideDetailPage } from './pages/GuideDetailPage'
import { RestaurantDetailPage } from './pages/RestaurantDetailPage'
import { ReviewsPage } from './pages/ReviewsPage'
import { SupportPage } from './pages/SupportPage'
import { BecomeProviderPage } from './pages/BecomeProviderPage'
import { SettingsPage } from './pages/SettingsPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

// Admin imports
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { SuperAdminLayout } from './pages/admin/SuperAdminLayout'
import { AdminHomePage } from './pages/admin/AdminHomePage'
import { FlightManagementPage } from './pages/admin/FlightManagementPage'
import { VisaGovernmentPage } from './pages/admin/VisaGovernmentPage'
import { FinancialControlPage } from './pages/admin/FinancialControlPage'
import { EventsGovernancePage } from './pages/admin/EventsGovernancePage'
import { AnalyticsDashboardPage } from './pages/admin/AnalyticsDashboardPage'
import { GrowthMonetizationPage } from './pages/admin/GrowthMonetizationPage'
import { RisksLegalPage } from './pages/admin/RisksLegalPage'
import { UserManagementPage } from './pages/admin/UserManagementPage'
import { ProviderManagementPage } from './pages/admin/ProviderManagementPage'
import { AdminPayoutsPage } from './pages/admin/AdminPayoutsPage'
import { AdminDocumentsPage } from './pages/admin/AdminDocumentsPage'
import { AdminMessagesPage } from './pages/admin/AdminMessagesPage'

// Provider imports
import { ProviderLoginPage } from './pages/provider/ProviderLoginPage'
import { ProviderLayout } from './pages/provider/ProviderLayout'
import { ProviderDashboardPage } from './pages/provider/ProviderDashboardPage'
import { ProviderServicesPage } from './pages/provider/ProviderServicesPage'
import { ProviderBookingsPage } from './pages/provider/ProviderBookingsPage'
import { ProviderEarningsPage } from './pages/provider/ProviderEarningsPage'
import { ProviderPayoutsPage } from './pages/provider/ProviderPayoutsPage'
import { ProviderReviewsPage } from './pages/provider/ProviderReviewsPage'
import { ProviderMessagesPage } from './pages/provider/ProviderMessagesPage'
import { ProviderVerificationPage } from './pages/provider/ProviderVerificationPage'
import { ProviderVideosPage } from './pages/provider/ProviderVideosPage'
import { MessagesPage } from './pages/MessagesPage'
import { ProviderSettingsPage } from './pages/provider/ProviderSettingsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'discover',
        element: <DiscoverPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'flights',
        element: <FlightsPage />,
      },
      {
        path: 'flights/:flightId',
        element: <FlightDetailsPage />,
      },
      {
        path: 'hotels',
        element: <HotelsPage />,
      },
      {
        path: 'hotels/:hotelId',
        element: <HotelDetailsPage />,
      },
      {
        path: 'events',
        element: <EventsPage />,
      },
      {
        path: 'events/:eventId',
        element: <EventDetailPage />,
      },
      {
        path: 'guides',
        element: <GuidesPage />,
      },
      {
        path: 'guides/:guideId',
        element: <GuideDetailPage />,
      },
      {
        path: 'restaurants',
        element: <RestaurantsPage />,
      },
      {
        path: 'restaurants/:restaurantId',
        element: <RestaurantDetailPage />,
      },
      {
        path: 'transfers',
        element: <TransfersPage />,
      },
      {
        path: 'visa',
        element: <VisaPage />,
      },
      {
        path: 'wallet',
        element: <ProtectedRoute><WalletPage /></ProtectedRoute>,
      },
      {
        path: 'my-trips',
        element: <ProtectedRoute><MyTripsPage /></ProtectedRoute>,
      },
      {
        path: 'profile',
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
      },
      {
        path: 'profile/settings',
        element: <ProtectedRoute><SettingsPage /></ProtectedRoute>,
      },
      {
        path: 'notifications',
        element: <ProtectedRoute><NotificationsPage /></ProtectedRoute>,
      },
      {
        path: 'booking-confirmation/:bookingId',
        element: <ProtectedRoute><BookingConfirmationPage /></ProtectedRoute>,
      },
      {
        path: 'reviews',
        element: <ProtectedRoute><ReviewsPage /></ProtectedRoute>,
      },
      {
        path: 'support',
        element: <SupportPage />,
      },
      {
        path: 'messages',
        element: <ProtectedRoute><MessagesPage /></ProtectedRoute>,
      },
       {
         path: 'become-provider',
         element: <ProtectedRoute><BecomeProviderPage /></ProtectedRoute>,
       },
    ],
  },
  // Provider Login Route
  {
    path: '/provider/login',
    element: <ProviderLoginPage />,
  },
  // Provider Routes
  {
    path: '/provider',
    element: <ProviderLayout />,
    children: [
      {
        index: true,
        element: <ProviderDashboardPage />,
      },
      {
        path: 'services',
        element: <ProviderServicesPage />,
      },
      {
        path: 'bookings',
        element: <ProviderBookingsPage />,
      },
      {
        path: 'earnings',
        element: <ProviderEarningsPage />,
      },
      {
        path: 'payouts',
        element: <ProviderPayoutsPage />,
      },
      {
        path: 'reviews',
        element: <ProviderReviewsPage />,
      },
      {
        path: 'messages',
        element: <ProviderMessagesPage />,
      },
      {
        path: 'videos',
        element: <ProviderVideosPage />,
      },
      {
        path: 'verification',
        element: <ProviderVerificationPage />,
      },
      {
        path: 'settings',
        element: <ProviderSettingsPage />,
      },
    ],
  },
  // Admin Login Route
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  // Super Admin Routes
  {
    path: '/admin',
    element: <SuperAdminLayout />,
    children: [
      {
        index: true,
        element: <AdminHomePage />,
      },
      {
        path: 'flights',
        element: <FlightManagementPage />,
      },
      {
        path: 'visa',
        element: <VisaGovernmentPage />,
      },
      {
        path: 'financial',
        element: <FinancialControlPage />,
      },
      {
        path: 'events',
        element: <EventsGovernancePage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsDashboardPage />,
      },
      {
        path: 'growth',
        element: <GrowthMonetizationPage />,
      },
      {
        path: 'risks',
        element: <RisksLegalPage />,
      },
      {
        path: 'users',
        element: <UserManagementPage />,
      },
      {
        path: 'providers',
        element: <ProviderManagementPage />,
      },
      {
        path: 'payouts',
        element: <AdminPayoutsPage />,
      },
      {
        path: 'documents',
        element: <AdminDocumentsPage />,
      },
      {
        path: 'messages',
        element: <AdminMessagesPage />,
      },
    ],
  },
])
