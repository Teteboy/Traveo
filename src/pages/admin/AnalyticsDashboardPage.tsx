import { useMemo, useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Ticket,
  DollarSign,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Star,
  Clock,
  Loader2,
  FileText,
  BarChart3,
  PieChart,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useAdminStats, useAdminAnalytics } from '@/hooks/useAdmin'

export function AnalyticsDashboardPage() {
  const [period, setPeriod] = useState('month')
  const [isExporting, setIsExporting] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [exportFormat, setExportFormat] = useState('json')

  const statsQuery = useAdminStats()
  const analyticsQuery = useAdminAnalytics()

  const overviewStats = useMemo(() => {
    const stats = statsQuery.data?.data
    return {
      totalBookings: stats?.bookings ?? 0,
      bookingsGrowth: 0,
      totalRevenue: stats?.totalRevenue ?? 0,
      revenueGrowth: 0,
      activeUsers: stats?.users ?? 0,
      usersGrowth: 0,
      avgOrderValue: stats && stats.bookings > 0 ? Math.round(stats.totalRevenue / stats.bookings) : 0,
      aovGrowth: 0,
    }
  }, [statsQuery.data?.data])

  const bookingByType = useMemo(() => {
    const rows = analyticsQuery.data?.data.bookingsByType ?? []
    const total = rows.reduce((sum, r) => sum + r._count.id, 0)
    const labels: Record<string, string> = {
      flight: 'Vols',
      hotel: 'Hôtels',
      event: 'Événements',
      restaurant: 'Restaurants',
      guide: 'Guides',
      transfer: 'Transferts',
    }
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500']
    return rows.map((r, idx) => ({
      type: labels[r.serviceType.toLowerCase()] ?? r.serviceType,
      count: r._count.id,
      percentage: total > 0 ? (r._count.id / total) * 100 : 0,
      revenue: Number(r._sum.totalAmount ?? 0),
      color: colors[idx % colors.length],
    }))
  }, [analyticsQuery.data?.data.bookingsByType])

  const topDestinations = useMemo(() => {
    return (analyticsQuery.data?.data.topDestinations ?? []).map((d) => ({
      city: d.name,
      country: '-',
      bookings: Math.round(d.popularityScore),
      revenue: 0,
      growth: 0,
    }))
  }, [analyticsQuery.data?.data.topDestinations])

  const monthlyTrend = useMemo(() => {
    return (analyticsQuery.data?.data.revenueByMonth ?? []).map((m) => ({
      month: new Date(String(m.month)).toLocaleDateString('fr-FR', { month: 'short' }),
      bookings: Number(m.count),
      revenue: Number(m.revenue),
    }))
  }, [analyticsQuery.data?.data.revenueByMonth])

  const recentActivity = useMemo(() => {
    return bookingByType.slice(0, 6).map((b, idx) => ({
      id: idx + 1,
      type: 'booking',
      description: `Réservations ${b.type.toLowerCase()}: ${b.count}`,
      amount: b.revenue,
      time: 'Temps réel',
    }))
  }, [bookingByType])

  const handleExport = async () => {
    setIsExporting(true)
    toast.info('Export en cours...')

    const data = {
      period,
      overviewStats,
      bookingByType,
      topDestinations,
      monthlyTrend,
      exportedAt: new Date().toISOString(),
    }

    if (exportFormat === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const dateStr = new Date().toISOString().split('T')[0]
      a.download = 'analytics-' + period + '-' + dateStr + '.json'
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const csvLines = [
        'Metric,Value',
        'Total Bookings,' + overviewStats.totalBookings,
        'Total Revenue,' + overviewStats.totalRevenue,
        'Active Users,' + overviewStats.activeUsers,
        'Avg Order Value,' + overviewStats.avgOrderValue,
        '',
        'Booking Type,Count,Percentage,Revenue',
      ]
      bookingByType.forEach((b) => {
        csvLines.push(b.type + ',' + b.count + ',' + b.percentage.toFixed(2) + '%,' + b.revenue)
      })

      const csvContent = csvLines.join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const dateStr = new Date().toISOString().split('T')[0]
      a.download = 'analytics-' + period + '-' + dateStr + '.csv'
      a.click()
      URL.revokeObjectURL(url)
    }

    setIsExporting(false)
    setShowExportDialog(false)
    toast.success('Export terminé')
  }

  const handleGenerateReport = async () => {
    setIsExporting(true)
    toast.info('Génération du rapport...')

    const report = {
      title: 'Rapport Analytique - Traveo',
      generatedAt: new Date().toISOString(),
      period,
      summary: {
        totalBookings: overviewStats.totalBookings,
        totalRevenue: overviewStats.totalRevenue,
        activeUsers: overviewStats.activeUsers,
      },
      bookingsByType: bookingByType,
      topDestinations,
      monthlyTrend,
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const dateStr = new Date().toISOString().split('T')[0]
    a.download = 'analytics-report-' + dateStr + '.json'
    a.click()
    URL.revokeObjectURL(url)

    setIsExporting(false)
    setShowReportDialog(false)
    toast.success('Rapport généré avec succès')
  }

  const loading = statsQuery.isLoading || analyticsQuery.isLoading
  const hasError = statsQuery.isError || analyticsQuery.isError

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytique & Intelligence</h1>
          <p className="text-slate-500">Tableaux de bord et analyses de la plateforme</p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px] border-slate-200">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-slate-200" onClick={() => setShowExportDialog(true)}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => setShowReportDialog(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Générer rapport
          </Button>
        </div>
      </div>

      {loading && <Card><CardContent className="p-8 text-center text-slate-500">Chargement des analytics...</CardContent></Card>}
      {hasError && <Card><CardContent className="p-8 text-center text-red-600">Erreur de chargement des analytics</CardContent></Card>}

      {!loading && !hasError && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200"><CardContent className="p-4"><div className="flex items-start justify-between"><div><p className="text-sm text-slate-500 mb-1">Total Réservations</p><p className="text-2xl font-bold text-slate-900">{overviewStats.totalBookings.toLocaleString()}</p></div><div className={'flex items-center gap-1 text-sm ' + (overviewStats.bookingsGrowth >= 0 ? 'text-green-600' : 'text-red-600')}>{overviewStats.bookingsGrowth >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}{Math.abs(overviewStats.bookingsGrowth)}%</div></div><div className="mt-3 flex items-center gap-2"><Ticket className="h-4 w-4 text-slate-400" /><span className="text-xs text-slate-500">vs. période précédente</span></div></CardContent></Card>
            <Card className="border-slate-200"><CardContent className="p-4"><div className="flex items-start justify-between"><div><p className="text-sm text-slate-500 mb-1">Revenus Totaux</p><p className="text-2xl font-bold text-slate-900">{(overviewStats.totalRevenue / 1000).toFixed(0)}K XAF</p></div><div className={'flex items-center gap-1 text-sm ' + (overviewStats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600')}>{overviewStats.revenueGrowth >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}{Math.abs(overviewStats.revenueGrowth)}%</div></div><div className="mt-3 flex items-center gap-2"><DollarSign className="h-4 w-4 text-slate-400" /><span className="text-xs text-slate-500">vs. période précédente</span></div></CardContent></Card>
            <Card className="border-slate-200"><CardContent className="p-4"><div className="flex items-start justify-between"><div><p className="text-sm text-slate-500 mb-1">Utilisateurs Actifs</p><p className="text-2xl font-bold text-slate-900">{overviewStats.activeUsers.toLocaleString()}</p></div><div className={'flex items-center gap-1 text-sm ' + (overviewStats.usersGrowth >= 0 ? 'text-green-600' : 'text-red-600')}>{overviewStats.usersGrowth >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}{Math.abs(overviewStats.usersGrowth)}%</div></div><div className="mt-3 flex items-center gap-2"><Users className="h-4 w-4 text-slate-400" /><span className="text-xs text-slate-500">vs. période précédente</span></div></CardContent></Card>
            <Card className="border-slate-200"><CardContent className="p-4"><div className="flex items-start justify-between"><div><p className="text-sm text-slate-500 mb-1">Valeur Moyenne Commande</p><p className="text-2xl font-bold text-slate-900">{overviewStats.avgOrderValue} XAF</p></div><div className={'flex items-center gap-1 text-sm ' + (overviewStats.aovGrowth >= 0 ? 'text-green-600' : 'text-red-600')}>{overviewStats.aovGrowth >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}{Math.abs(overviewStats.aovGrowth)}%</div></div><div className="mt-3 flex items-center gap-2"><Activity className="h-4 w-4 text-slate-400" /><span className="text-xs text-slate-500">vs. période précédente</span></div></CardContent></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Réservations par type</CardTitle>
                <Button variant="ghost" size="sm"><PieChart className="h-4 w-4 mr-2" />Détails</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {bookingByType.map((item) => (
                  <div key={item.type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm"><span className="text-slate-700 font-medium">{item.type}</span><span className="text-slate-500">{item.count.toLocaleString()} ({item.percentage.toFixed(1)}%)</span></div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={'h-full ' + item.color + ' rounded-full'} style={{ width: item.percentage + '%' }} /></div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Tendance mensuelle</CardTitle>
                <Button variant="ghost" size="sm"><BarChart3 className="h-4 w-4 mr-2" />Détails</Button>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-48">
                  {monthlyTrend.map((item) => {
                    const maxRevenue = Math.max(...monthlyTrend.map((m) => m.revenue), 1)
                    const height = (item.revenue / maxRevenue) * 100
                    return (
                      <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex flex-col items-center"><span className="text-xs text-slate-500 mb-1">{(item.revenue / 1000).toFixed(0)}K</span><div className="w-full bg-[#44DBD4] rounded-t-sm" style={{ height: height * 1.5 + 'px' }} /></div>
                        <span className="text-xs text-slate-600">{item.month}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-slate-200 lg:col-span-2">
              <CardHeader><CardTitle className="text-lg">Destinations populaires</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto"><table className="w-full"><thead className="bg-slate-50 border-b border-slate-200"><tr><th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Destination</th><th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Réservations</th><th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Revenus</th><th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Croissance</th></tr></thead><tbody className="divide-y divide-slate-200">{topDestinations.map((dest, index) => (<tr key={dest.city} className="hover:bg-slate-50"><td className="px-6 py-4"><div className="flex items-center gap-3"><span className="text-sm font-medium text-slate-400">#{index + 1}</span><div><p className="font-medium text-slate-900">{dest.city}</p><p className="text-sm text-slate-500">{dest.country}</p></div></div></td><td className="px-6 py-4 text-slate-600">{dest.bookings.toLocaleString()}</td><td className="px-6 py-4 text-slate-600">{(dest.revenue / 1000).toFixed(0)}K XAF</td><td className="px-6 py-4"><div className={'flex items-center gap-1 ' + (dest.growth >= 0 ? 'text-green-600' : 'text-red-600')}>{dest.growth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}<span className="text-sm">{Math.abs(dest.growth)}%</span></div></td></tr>))}</tbody></table></div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader><CardTitle className="text-lg">Activité récente</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100"><Ticket className="h-4 w-4 text-blue-600" /></div>
                    <div className="flex-1 min-w-0"><p className="text-sm text-slate-900 truncate">{activity.description}</p><div className="flex items-center justify-between mt-1"><span className="text-xs text-slate-500">{activity.time}</span>{activity.amount > 0 && <span className="text-sm font-medium text-green-600">+{activity.amount} XAF</span>}</div></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-slate-200"><CardHeader><CardTitle className="text-lg">Comportement utilisateur</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-slate-500" /><span className="text-sm text-slate-600">Temps moyen sur site</span></div><span className="font-semibold text-slate-900">-</span></div><div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><div className="flex items-center gap-2"><Activity className="h-4 w-4 text-slate-500" /><span className="text-sm text-slate-600">Pages par session</span></div><span className="font-semibold text-slate-900">-</span></div><div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><div className="flex items-center gap-2"><Star className="h-4 w-4 text-slate-500" /><span className="text-sm text-slate-600">Note moyenne</span></div><span className="font-semibold text-slate-900">-</span></div></CardContent></Card>
            <Card className="border-slate-200"><CardHeader><CardTitle className="text-lg">Source de trafic</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><div className="flex items-center justify-between text-sm"><span className="text-slate-600">Recherche organique</span><span className="text-slate-900 font-medium">-</span></div><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: '0%' }} /></div></div><div className="space-y-2"><div className="flex items-center justify-between text-sm"><span className="text-slate-600">Direct</span><span className="text-slate-900 font-medium">-</span></div><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{ width: '0%' }} /></div></div></CardContent></Card>
            <Card className="border-slate-200"><CardHeader><CardTitle className="text-lg">Appareils</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span className="text-sm text-slate-600">Mobile</span><span className="font-semibold text-slate-900">-</span></div><div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span className="text-sm text-slate-600">Desktop</span><span className="font-semibold text-slate-900">-</span></div></CardContent></Card>
          </div>
        </>
      )}

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Exporter les analytics</DialogTitle>
            <DialogDescription>Sélectionnez le format d'export.</DialogDescription>
          </DialogHeader>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger className="border-slate-200"><SelectValue placeholder="Format" /></SelectTrigger>
            <SelectContent className="bg-white"><SelectItem value="json">JSON</SelectItem><SelectItem value="csv">CSV</SelectItem></SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>Annuler</Button>
            <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={handleExport} disabled={isExporting}>{isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}Exporter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Générer un rapport</DialogTitle>
            <DialogDescription>Un rapport consolidé sera généré à partir des données backend.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>Annuler</Button>
            <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={handleGenerateReport} disabled={isExporting}>{isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}Générer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
