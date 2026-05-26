import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Plane,
  Hotel,
  Ticket,
  DollarSign,
  CheckCircle,
  Clock,
  ArrowUpRight,
  BarChart3,
  FileCheck,
  Wallet,
  Megaphone,
  Shield,
  Download,
  RefreshCw,
  Bell,
  ChevronRight,
  UserCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAdminStats, useAdminAnalytics } from '@/hooks/useAdmin'
import { formatPrice } from '@/lib/formatters'
import { apiClient } from '@/lib/apiClient'

const quickLinks = [
  { id: 'flights', label: 'Gestion des vols', icon: Plane, path: '/admin/flights', color: 'bg-blue-500' },
  { id: 'visa', label: 'Visa & Gouvernement', icon: FileCheck, path: '/admin/visa', color: 'bg-green-500' },
  { id: 'financial', label: 'Contrôle financier', icon: Wallet, path: '/admin/financial', color: 'bg-purple-500' },
  { id: 'events', label: 'Gouvernance événements', icon: Ticket, path: '/admin/events', color: 'bg-orange-500' },
  { id: 'analytics', label: 'Analytique', icon: BarChart3, path: '/admin/analytics', color: 'bg-cyan-500' },
  { id: 'growth', label: 'Croissance', icon: Megaphone, path: '/admin/growth', color: 'bg-pink-500' },
  { id: 'risks', label: 'Risques & Modération', icon: Shield, path: '/admin/risks', color: 'bg-red-500' },
  { id: 'users', label: 'Utilisateurs', icon: Users, path: '/admin/users', color: 'bg-indigo-500' },
]

export function AdminHomePage() {
  const navigate = useNavigate()
  const [refreshing, setRefreshing] = useState(false)
  const [pendingProviders, setPendingProviders] = useState<any[]>([])
  const [loadingProviders, setLoadingProviders] = useState(false)

  const statsQuery = useAdminStats()
  const analyticsQuery = useAdminAnalytics()

  const statsData = useMemo(() => {
    const s = statsQuery.data?.data
    const totalUsers = s?.users ?? 0
    const activeProviders = s?.providers ?? 0
    const totalBookings = s?.bookings ?? 0
    const totalRevenue = s?.totalRevenue ?? 0
    const activeFlights = s?.activeFlights ?? 0
    const visaApplications = s?.visaApplications ?? 0
    return {
      totalUsers,
      activeUsers: totalUsers,
      newUsersToday: 0,
      userGrowth: 0,
      totalBookings,
      bookingsToday: 0,
      bookingGrowth: 0,
      totalRevenue,
      revenueToday: 0,
      revenueGrowth: 0,
      pendingApprovals: visaApplications,
      openDisputes: 0,
      activeProviders,
      pendingProviders: pendingProviders.length,
      activeFlights,
      visaApplications,
    }
  }, [statsQuery.data?.data])

  const topDestinations = useMemo(() => {
    return (analyticsQuery.data?.data.topDestinations ?? []).map((d) => ({
      name: d.name,
      bookings: Math.round(d.popularityScore),
      growth: 0,
    }))
  }, [analyticsQuery.data?.data.topDestinations])

  const recentActivity = useMemo(() => {
    const byType = analyticsQuery.data?.data.bookingsByType ?? []
    return byType.slice(0, 6).map((item, idx) => ({
      id: idx + 1,
      type: 'booking',
      message: `Réservations ${item.serviceType.toLowerCase()}: ${item._count.id}`,
      time: 'Temps réel',
      icon: Ticket,
    }))
  }, [analyticsQuery.data?.data.bookingsByType])

  const pendingTasks = [
    { id: 1, title: `Traiter ${statsData.visaApplications} demandes visa`, priority: 'high', count: statsData.visaApplications, path: '/admin/visa' },
    { id: 2, title: 'Vérifier les prestataires', priority: 'medium', count: statsData.activeProviders, path: '/admin/users' },
    { id: 3, title: 'Surveiller les vols actifs', priority: 'low', count: statsData.activeFlights, path: '/admin/flights' },
  ]

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([statsQuery.refetch(), analyticsQuery.refetch(), loadPendingProviders()])
    setRefreshing(false)
  }

  const loadPendingProviders = async () => {
    setLoadingProviders(true)
    try {
      const res = await apiClient.get('/admin/providers?status=pending')
      setPendingProviders(res.data?.data?.providers || [])
    } catch (e) {
      setPendingProviders([])
    } finally {
      setLoadingProviders(false)
    }
  }

  const handleVerifyProvider = async (id: string, action: 'approve' | 'reject') => {
    try {
      await apiClient.patch(`/admin/providers/${id}/verify`, { action })
      await loadPendingProviders()
      await statsQuery.refetch()
    } catch (e) {
      console.error('Verification failed', e)
    }
  }

  useEffect(() => {
    loadPendingProviders()
  }, [])

  const handleExport = () => {
    const data = {
      generatedAt: new Date().toISOString(),
      stats: statsData,
      topDestinations,
      recentActivity,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin-dashboard-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord Super Admin</h1>
          <p className="text-slate-500">Bienvenue! Voici un aperçu de votre plateforme</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-200" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button variant="outline" className="border-slate-200" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
            {statsData.pendingApprovals > 0 && <Badge className="ml-2 bg-red-500 text-white text-xs">{statsData.pendingApprovals}</Badge>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Utilisateurs totaux</p><p className="text-2xl font-bold text-slate-900">{statsData.totalUsers.toLocaleString()}</p><div className="flex items-center mt-1 text-sm text-green-600"><ArrowUpRight className="h-4 w-4 mr-1" />+{statsData.userGrowth}% ce mois</div></div><div className="p-3 bg-blue-100 rounded-full"><Users className="h-6 w-6 text-blue-600" /></div></div></CardContent></Card>
        <Card className="border-slate-200"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Réservations totales</p><p className="text-2xl font-bold text-slate-900">{statsData.totalBookings.toLocaleString()}</p><div className="flex items-center mt-1 text-sm text-green-600"><ArrowUpRight className="h-4 w-4 mr-1" />+{statsData.bookingGrowth}% ce mois</div></div><div className="p-3 bg-green-100 rounded-full"><Ticket className="h-6 w-6 text-green-600" /></div></div></CardContent></Card>
        <Card className="border-slate-200"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Revenus</p><p className="text-2xl font-bold text-slate-900">{formatPrice(statsData.totalRevenue, 'XAF')}</p><div className="flex items-center mt-1 text-sm text-green-600"><ArrowUpRight className="h-4 w-4 mr-1" />+{statsData.revenueGrowth}% ce mois</div></div><div className="p-3 bg-purple-100 rounded-full"><DollarSign className="h-6 w-6 text-purple-600" /></div></div></CardContent></Card>
        <Card className="border-slate-200"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Prestataires actifs</p><p className="text-2xl font-bold text-slate-900">{statsData.activeProviders}</p><div className="flex items-center mt-1 text-sm text-orange-600"><Clock className="h-4 w-4 mr-1" />{statsData.pendingProviders} en attente</div></div><div className="p-3 bg-orange-100 rounded-full"><Hotel className="h-6 w-6 text-orange-600" /></div></div></CardContent></Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader><CardTitle className="text-lg">Accès rapide</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <button key={link.id} onClick={() => navigate(link.path)} className="flex flex-col items-center p-4 rounded-lg border border-slate-200 hover:border-[#44DBD4] hover:bg-[#44DBD4]/5 transition-colors">
                <div className={`p-3 ${link.color} rounded-lg mb-2`}><link.icon className="h-5 w-5 text-white" /></div>
                <span className="text-sm font-medium text-slate-700">{link.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-slate-200">
          <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-lg">Tâches en attente</CardTitle><Badge variant="secondary">{pendingTasks.length} tâches</Badge></div></CardHeader>
          <CardContent><div className="space-y-3">{pendingTasks.map((task) => (<button key={task.id} onClick={() => navigate(task.path)} className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-[#44DBD4] hover:bg-[#44DBD4]/5 transition-colors"><div className="flex items-center gap-3"><div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} /><span className="text-sm text-slate-700">{task.title}</span></div><div className="flex items-center gap-2"><Badge variant="secondary" className="text-xs">{task.count}</Badge><ChevronRight className="h-4 w-4 text-slate-400" /></div></button>))}</div></CardContent>
        </Card>

        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-lg flex items-center gap-2"><UserCheck className="h-5 w-5" /> Prestataires en attente de vérification</CardTitle><Badge variant="secondary">{pendingProviders.length}</Badge></div></CardHeader>
          <CardContent>
            {loadingProviders ? (
              <div className="text-sm text-slate-500">Chargement...</div>
            ) : pendingProviders.length === 0 ? (
              <div className="text-sm text-slate-500">Aucun prestataire en attente.</div>
            ) : (
              <div className="space-y-3">
                {pendingProviders.slice(0, 5).map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                    <div>
                      <div className="font-medium text-slate-900">{p.companyName}</div>
                      <div className="text-xs text-slate-500">{p.businessType} • {p.user?.email}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleVerifyProvider(p.id, 'approve')}>Approuver</Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleVerifyProvider(p.id, 'reject')}>Rejeter</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-lg">Activité récente</CardTitle><Button variant="ghost" size="sm" className="text-[#44DBD4]">Voir tout</Button></div></CardHeader>
          <CardContent><div className="space-y-3">{recentActivity.map((activity) => (<div key={activity.id} className="flex items-start gap-3 p-2"><div className="p-2 rounded-lg bg-blue-100"><activity.icon className="h-4 w-4 text-blue-600" /></div><div className="flex-1 min-w-0"><p className="text-sm text-slate-700 truncate">{activity.message}</p><p className="text-xs text-slate-400">{activity.time}</p></div></div>))}</div></CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-lg">Top destinations</CardTitle><Button variant="ghost" size="sm" className="text-[#44DBD4]" onClick={() => navigate('/admin/analytics')}>Détails</Button></div></CardHeader>
          <CardContent><div className="space-y-3">{topDestinations.map((dest, index) => (<div key={dest.name} className="flex items-center justify-between p-2"><div className="flex items-center gap-3"><span className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-full text-sm font-medium text-slate-600">{index + 1}</span><span className="text-sm font-medium text-slate-700">{dest.name}</span></div><div className="flex items-center gap-3"><span className="text-sm text-slate-500">{dest.bookings.toLocaleString()}</span><div className={`flex items-center text-xs ${dest.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>{dest.growth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}{Math.abs(dest.growth)}%</div></div></div>))}</div></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200 bg-gradient-to-br from-blue-50 to-white"><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 bg-blue-500 rounded-lg"><Users className="h-6 w-6 text-white" /></div><div><p className="text-sm text-slate-500">Nouveaux utilisateurs aujourd'hui</p><p className="text-2xl font-bold text-slate-900">{statsData.newUsersToday}</p></div></div></CardContent></Card>
        <Card className="border-slate-200 bg-gradient-to-br from-green-50 to-white"><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 bg-green-500 rounded-lg"><Ticket className="h-6 w-6 text-white" /></div><div><p className="text-sm text-slate-500">Réservations aujourd'hui</p><p className="text-2xl font-bold text-slate-900">{statsData.bookingsToday}</p></div></div></CardContent></Card>
        <Card className="border-slate-200 bg-gradient-to-br from-purple-50 to-white"><CardContent className="p-6"><div className="flex items-center gap-4"><div className="p-3 bg-purple-500 rounded-lg"><DollarSign className="h-6 w-6 text-white" /></div><div><p className="text-sm text-slate-500">Revenus aujourd'hui</p><p className="text-2xl font-bold text-slate-900">{formatPrice(statsData.revenueToday, 'XAF')}</p></div></div></CardContent></Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-lg">État du système</CardTitle><Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Tous les systèmes opérationnels</Badge></div></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><span className="text-sm text-slate-600">API Vols</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><span className="text-sm text-slate-600">API Hôtels</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><span className="text-sm text-slate-600">Paiements</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><span className="text-sm text-slate-600">Notifications</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><span className="text-sm text-slate-600">Base de données</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><span className="text-sm text-slate-600">CDN</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><span className="text-sm text-slate-600">Email</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><span className="text-sm text-slate-600">SMS</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
