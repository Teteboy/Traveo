import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Receipt,
  DollarSign,
  Bed,
  UserCheck,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  X,
  Crown,
} from 'lucide-react'
import { useProviderAuthStore } from '@/stores/providerAuthStore'
import { useProviderDataStore } from '@/stores/providerDataStore'
import { loadProviderDashboardData } from '@/stores/providerDataStore'
import { formatPrice } from '@/lib/formatters'

export function ProviderDashboardPage() {
  const navigate = useNavigate()
  const { provider, currentServiceType } = useProviderAuthStore()
  const { dashboardStats, recentBookings, isLoading: isDashboardLoading } = useProviderDataStore()
  const isVerified = provider?.isVerified ?? false

  const businessType = (provider?.businessType || 'HOTEL').toUpperCase() as 
    'HOTEL' | 'RESTAURANT' | 'GUIDE' | 'TRANSPORT' | 'EVENTS'

  const serviceConfig = {
    HOTEL: {
      label: 'Hôtel',
      icon: Bed,
      welcome: 'Votre hôtel',
      stats: ['Chambres', 'Réservations', 'Revenus'],
    },
    RESTAURANT: {
      label: 'Restaurant',
      icon: Bed,
      welcome: 'Votre restaurant',
      stats: ['Plats', 'Réservations', 'Revenus'],
    },
    GUIDE: {
      label: 'Guide',
      icon: Bed,
      welcome: 'Vos circuits',
      stats: ['Tours', 'Groupes', 'Revenus'],
    },
    TRANSPORT: {
      label: 'Transport',
      icon: Bed,
      welcome: 'Vos véhicules',
      stats: ['Trajets', 'Réservations', 'Revenus'],
    },
    EVENTS: {
      label: 'Événements',
      icon: Bed,
      welcome: 'Vos espaces',
      stats: ['Événements', 'Réservations', 'Revenus'],
    },
  }

  const config = serviceConfig[businessType] || serviceConfig.HOTEL

  useEffect(() => {
    // Load real data from backend
    loadProviderDashboardData(currentServiceType)
  }, [currentServiceType])

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Bienvenue, {provider?.name?.split(' ')[0]}
        </h1>
        <p className="text-slate-500 mt-1">
          Voici ce qui se passe aujourd’hui à {provider?.businessName} ({config.welcome})
        </p>
      </div>

      {/* Verification Status Banner */}
      {!isVerified && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <div className="font-semibold text-yellow-800">Vérification en attente</div>
              <p className="text-sm text-yellow-700 mt-1">
                Votre compte prestataire est en cours d’examen. Complétez les étapes de vérification pour activer toutes les fonctionnalités.
              </p>
            </div>
            <Button onClick={() => navigate('/provider/verification')} className="bg-yellow-600 hover:bg-yellow-700">
              Commencer la vérification
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions based on Business Type */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Actions rapides — {config.label}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-1"
            onClick={() => navigate('/provider/services')}
          >
            <Bed className="h-5 w-5" />
            <span className="text-sm">Gérer mes services</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-1"
            onClick={() => navigate('/provider/bookings')}
          >
            <Receipt className="h-5 w-5" />
            <span className="text-sm">Voir les réservations</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-1"
            onClick={() => navigate('/provider/verification')}
          >
            <UserCheck className="h-5 w-5" />
            <span className="text-sm">Vérification</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-1"
            onClick={() => navigate('/provider/settings')}
          >
            <Crown className="h-5 w-5" />
            <span className="text-sm">Paramètres</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards - Dynamic based on Business Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Dynamic Primary Stat */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">
                {businessType === 'HOTEL' && 'Total Bookings'}
                {businessType === 'RESTAURANT' && 'Total Bookings'}
                {businessType === 'GUIDE' && 'Total Bookings'}
                {businessType === 'TRANSPORT' && 'Total Bookings'}
                {businessType === 'EVENTS' && 'Total Bookings'}
              </h3>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Receipt className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mb-2">
              {dashboardStats?.totalBookings?.count ?? 0}
            </p>
            <div className="text-sm text-muted-foreground">
              Réservations totales
            </div>
          </CardContent>
        </Card>

        {/* Revenue / Performance Stat */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">
                {businessType === 'HOTEL' && 'Revenus ce mois'}
                {businessType === 'RESTAURANT' && 'Revenus ce mois'}
                {businessType === 'GUIDE' && 'Revenus ce mois'}
                {businessType === 'TRANSPORT' && 'Revenus ce mois'}
                {businessType === 'EVENTS' && 'Revenus ce mois'}
              </h3>
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mb-2">
              {formatPrice(dashboardStats?.totalRevenue?.amount || 0, 'XAF')}
            </p>
            {dashboardStats?.totalRevenue.trend && (
              <div className="flex items-center gap-1 text-sm">
                {dashboardStats.totalRevenue.trend.direction === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={
                    dashboardStats.totalRevenue.trend.direction === 'up'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {dashboardStats.totalRevenue.trend.percentage}% vs last month
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Rooms/Services */}
        {dashboardStats?.activeRooms ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-600">Active Rooms</h3>
                <div className="p-2 bg-[#44DBD4]/10 rounded-lg">
                  <Bed className="h-5 w-5 text-[#44DBD4]" />
                </div>
              </div>
              <p className="text-2xl font-bold mb-2">
                {dashboardStats.activeRooms.occupied}/{dashboardStats.activeRooms.total} occupied
              </p>
              <p className="text-sm text-slate-600">
                {dashboardStats.activeRooms.occupancyRate}% occupancy rate
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-600">Active Services</h3>
                <div className="p-2 bg-[#44DBD4]/10 rounded-lg">
                  <Bed className="h-5 w-5 text-[#44DBD4]" />
                </div>
              </div>
              <p className="text-2xl font-bold mb-2">24 Active</p>
              <p className="text-sm text-slate-600">85% utilization rate</p>
            </CardContent>
          </Card>
        )}

        {/* Check-ins Today */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Check-ins Today</h3>
              <div className="p-2 bg-purple-50 rounded-lg">
                <UserCheck className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mb-2">
              {dashboardStats?.checkinsToday.count || 0} Guests
            </p>
            <div className="flex items-center gap-1 text-sm text-orange-600">
              <Crown className="h-4 w-4" />
              <span>{dashboardStats?.checkinsToday.vipCount || 0} VIP arrivals</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Bookings</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/provider/bookings')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {isDashboardLoading ? (
                <div className="text-center py-12 text-slate-500">
                  <p>Loading real data...</p>
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Receipt className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No recent bookings yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{booking.guestName}</p>
                        <p className="text-sm text-slate-500">{booking.serviceName}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(booking.checkInDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${booking.totalPrice}</p>
                        <Badge
                          className={
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-slate-100 text-slate-700'
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Verification Status */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
              <p className="text-sm text-slate-500">Complete all verification steps</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Business License Verified</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Email Verified</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Phone Verified</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-50 rounded-full">
                  <X className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Payment Gateway Setup</p>
                  <p className="text-xs text-red-600">incomplete</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Profile completion</p>
                  <span className="text-sm font-semibold">{provider?.verificationProgress}%</span>
                </div>
                <Progress value={provider?.verificationProgress} className="h-2 mb-4" />
                <Button
                  className="w-full bg-[#44DBD4] hover:bg-[#3bc9c2]"
                  onClick={() => navigate('/provider/verification')}
                >
                  Complete Verification
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
