import { useState } from 'react'
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import {
  Home,
  Briefcase,
  Calendar,
  BarChart3,
  Star,
  MessageSquare,
  CheckCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Crown,
  Bed,
  MapPin,
  Car,
  Utensils,
  User,
  Building2,
  Shield,
  CreditCard,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { useProviderAuthStore } from '@/stores/providerAuthStore'
import { useProviderDataStore } from '@/stores/providerDataStore'
import type { ServiceType } from '@/types/provider'

const navigationItems = [
  {
    section: 'Main Menu',
    items: [
      { id: 'dashboard', label: 'Home', icon: Home, path: '/provider' },
      { id: 'services', label: 'Services', icon: Briefcase, path: '/provider/services' },
      { id: 'bookings', label: 'Bookings', icon: Calendar, path: '/provider/bookings' },
      { id: 'earnings', label: 'Earnings', icon: BarChart3, path: '/provider/earnings' },
    ],
  },
  {
    section: 'Communications',
    items: [
      { id: 'reviews', label: 'Reviews', icon: Star, path: '/provider/reviews' },
      { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/provider/messages' },
    ],
  },
  {
    section: 'Account',
    items: [
      { id: 'verification', label: 'Verification', icon: CheckCircle, path: '/provider/verification' },
      { id: 'settings', label: 'Settings', icon: Settings, path: '/provider/settings' },
    ],
  },
]

// Service types will be filtered based on the provider's registered businessType
const allServiceTypes: Array<{
  type: ServiceType
  icon: typeof Bed
  label: string
  description: string
}> = [
  { type: 'hotel', icon: Bed, label: 'Hotels', description: 'Rooms & amenities' },
  { type: 'guide', icon: MapPin, label: 'Guides & Experiences', description: 'Tours & adventures' },
  { type: 'transport', icon: Car, label: 'Transport', description: 'Vehicles & transfers' },
  { type: 'restaurant', icon: Utensils, label: 'Restaurants', description: 'Dining options' },
  { type: 'events', icon: Calendar, label: 'Premium Events', description: 'Spaces & packages' },
]

export function ProviderLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { provider, isProviderAuthenticated, providerLogout, currentServiceType, switchServiceType } =
    useProviderAuthStore()

  // Only show service types that match the provider's registered businessType
  const serviceTypes = provider?.businessType 
    ? allServiceTypes.filter(s => s.type === provider.businessType.toLowerCase())
    : allServiceTypes
  const { notifications, unreadNotificationCount, markNotificationAsRead, markAllNotificationsAsRead } =
    useProviderDataStore()

  const currentPath = location.pathname

  // Redirect to login if not authenticated
  if (!isProviderAuthenticated) {
    return <Navigate to="/provider/login" replace />
  }

  // Note: We no longer force redirect to verification.
  // Unverified providers can now access the dashboard and other pages.
  // They will see their verification status in the sidebar and on the Verification page.

  const handleLogout = () => {
    providerLogout()
    navigate('/provider/login')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const currentServiceConfig = serviceTypes.find((s) => s.type === currentServiceType)
  const CurrentServiceIcon = currentServiceConfig?.icon || Bed

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Verification Status Banner (only for unverified providers) */}
      {provider && !provider.isVerified && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-yellow-800">
            <AlertCircle className="h-4 w-4" />
            <span>
              Votre compte est en attente de vérification.{' '}
              <a href="/provider/verification" className="underline font-medium hover:text-yellow-900">
                Compléter la vérification
              </a>{' '}
              pour activer toutes les fonctionnalités.
            </span>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <div className="flex items-center gap-2">
            <img
              src="/assets/images/logo.png"
              alt="Traveo"
              className="h-8 w-8 object-contain"
            />
            <span className="font-bold text-lg text-[#44DBD4]">Traveo</span>
            {provider?.businessType && (
              <Badge variant="secondary" className="text-xs capitalize">
                {provider.businessType.toLowerCase()}
              </Badge>
            )}
          </div>
          <Avatar className="h-8 w-8">
            {provider?.avatar && <AvatarImage src={provider?.avatar} />}
            <AvatarFallback className="bg-[#44DBD4] text-white text-xs">
              {provider?.name ? getInitials(provider.name) : 'PR'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full bg-white border-r border-slate-200 w-64 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo & Profile */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/assets/images/logo.png"
              alt="Traveo"
              className="h-10 w-10 object-contain"
            />
            <div>
              <h1 className="font-bold text-lg text-[#44DBD4]">Traveo</h1>
              <p className="text-xs text-slate-500">Provider Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Avatar className="h-10 w-10">
              {provider?.avatar && <AvatarImage src={provider?.avatar} />}
              <AvatarFallback className="bg-[#44DBD4] text-white">
                {provider?.name ? getInitials(provider.name) : 'PR'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{provider?.name}</p>
              <p className="text-xs text-slate-500 truncate">{provider?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-6 overflow-y-auto h-[calc(100vh-13rem)]">
          {navigationItems.map((section) => (
            <div key={section.section}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-3">
                {section.section}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = currentPath === item.path
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(item.path)
                        setSidebarOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                        isActive
                          ? 'bg-[#44DBD4] text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-200 bg-white">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Log Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between px-6 py-3">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search..."
                  className="pl-10 bg-slate-50 border-slate-200"
                />
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              {/* Service Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CurrentServiceIcon className="h-4 w-4" />
                    <span className="hidden md:inline">{currentServiceConfig?.label}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {serviceTypes.map((service) => {
                    const ServiceIcon = service.icon
                    return (
                      <DropdownMenuItem
                        key={service.type}
                        onClick={() => switchServiceType(service.type)}
                        className={service.type === currentServiceType ? 'bg-slate-100' : ''}
                      >
                        <ServiceIcon className="h-5 w-5 mr-3 text-[#44DBD4]" />
                        <div>
                          <p className="font-medium">{service.label}</p>
                          <p className="text-xs text-slate-500">{service.description}</p>
                        </div>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadNotificationCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                        {unreadNotificationCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-4 border-b flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Notifications</h4>
                      <p className="text-xs text-slate-500">{currentServiceConfig?.label}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllNotificationsAsRead}
                      className="text-xs"
                    >
                      Mark all read
                    </Button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-500">
                        <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => markNotificationAsRead(notif.id)}
                          className={`w-full p-4 text-left border-b hover:bg-slate-50 transition-colors ${
                            !notif.isRead ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <p className="font-medium text-sm">{notif.title}</p>
                          <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="p-3 border-t">
                    <Button variant="ghost" size="sm" className="w-full">
                      View all messages
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative gap-2 pl-2">
                    <Avatar className="h-8 w-8">
                      {provider?.avatar && <AvatarImage src={provider?.avatar} />}
                      <AvatarFallback className="bg-[#44DBD4] text-white text-xs">
                        {provider?.name ? getInitials(provider.name) : 'PR'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="h-2 w-2 bg-green-500 rounded-full absolute top-2 left-8 border-2 border-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="relative">
                        <Avatar className="h-14 w-14">
                          {provider?.avatar && <AvatarImage src={provider?.avatar} />}
                          <AvatarFallback className="bg-[#44DBD4] text-white">
                            {provider?.name ? getInitials(provider.name) : 'PR'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="h-3 w-3 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{provider?.name}</h4>
                        <p className="text-sm text-slate-500">{provider?.email}</p>
                        <Badge className="mt-1 bg-[#44DBD4] text-white">
                          <Crown className="h-3 w-3 mr-1" />
                          {provider?.role}
                        </Badge>
                      </div>
                    </div>

                    {!provider?.isVerified && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-orange-900">
                              {provider?.verificationProgress}% Complete
                            </p>
                            <p className="text-xs text-orange-700 mt-1">1 step remaining</p>
                          </div>
                          <Button
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                            onClick={() => navigate('/provider/verification')}
                          >
                            Complete
                          </Button>
                        </div>
                        <Progress value={provider?.verificationProgress} className="mt-2 h-2" />
                      </div>
                    )}
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => navigate('/provider/settings')}>
                    <User className="h-4 w-4 mr-3 text-blue-500" />
                    <div>
                      <p className="font-medium">Profile Info</p>
                      <p className="text-xs text-slate-500">Edit your personal details</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate('/provider/settings?tab=property')}>
                    <Building2 className="h-4 w-4 mr-3 text-[#44DBD4]" />
                    <div>
                      <p className="font-medium">Property Details</p>
                      <p className="text-xs text-slate-500">{provider?.businessName}</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate('/provider/verification')}>
                    <Shield className="h-4 w-4 mr-3 text-orange-500" />
                    <div>
                      <p className="font-medium">Verification</p>
                      <p className="text-xs text-orange-600">1 step pending</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate('/provider/settings?tab=security')}>
                    <Shield className="h-4 w-4 mr-3 text-purple-500" />
                    <div>
                      <p className="font-medium">Security</p>
                      <p className="text-xs text-slate-500">Password & 2FA</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate('/provider/settings?tab=billing')}>
                    <CreditCard className="h-4 w-4 mr-3 text-green-500" />
                    <div>
                      <p className="font-medium">Billing & Plan</p>
                      <p className="text-xs text-slate-500">Pro Plan • $99/mo</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-3" />
                    <span className="font-medium">Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
