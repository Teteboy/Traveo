import { useState } from 'react'
import { Bell, Check, Plane, CreditCard, FileCheck, Calendar, Clock, Settings, X, Loader2, RefreshCcw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useNavigate } from 'react-router-dom'
import { useNotifications, useMarkNotificationRead, useMarkAllRead, useDeleteNotification } from '@/hooks/useNotifications'
import { formatDateTime } from '@/lib/formatters'
import { toast } from 'sonner'

type NotificationCategory = 'all' | 'booking' | 'payment' | 'visa' | 'system' | 'promotion'

export function NotificationsPage() {
  const navigate = useNavigate()
  const [categoryFilter, setCategoryFilter] = useState<NotificationCategory>('all')
  const [readFilter, setReadFilter] = useState<'all' | 'unread'>('all')

  const { data, isLoading, refetch } = useNotifications({ limit: 50 })
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllRead()
  const deleteNotif = useDeleteNotification()

  const notifications = data?.items ?? []
  const unreadCount = data?.total ?? notifications.filter(n => !n.read).length

  const filtered = notifications.filter(n => {
    if (readFilter === 'unread' && n.read) return false
    if (categoryFilter !== 'all' && n.type !== categoryFilter) return false
    return true
  })

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Bell className="h-5 w-5" />
      case 'payment': return <CreditCard className="h-5 w-5" />
      case 'visa': return <FileCheck className="h-5 w-5" />
      case 'reminder': return <Clock className="h-5 w-5" />
      case 'system': return <Settings className="h-5 w-5" />
      case 'promotion': return <Calendar className="h-5 w-5" />
      default: return <Bell className="h-5 w-5" />
    }
  }

  const getNotifStyle = (type: string, read: boolean) => {
    const base = 'h-10 w-10 rounded-full p-2 flex items-center justify-center'
    if (read) return `${base} bg-muted text-muted-foreground`
    switch (type) {
      case 'booking': return `${base} bg-blue-100 text-blue-600`
      case 'payment': return `${base} bg-green-100 text-green-600`
      case 'visa': return `${base} bg-purple-100 text-purple-600`
      case 'system': return `${base} bg-slate-100 text-slate-600`
      default: return `${base} bg-primary/10 text-primary`
    }
  }

  const getCategoryLabel = (cat: string) => {
    const map: Record<string, string> = { all: 'Toutes', booking: 'RÃ©servations', payment: 'Paiements', visa: 'Visa', system: 'SystÃ¨me', promotion: 'Offres' }
    return map[cat] ?? cat
  }

  const handleMarkRead = async (id: string) => {
    try { await markRead.mutateAsync(id) } catch { /* silent */ }
  }

  const handleMarkAllRead = async () => {
    try { await markAllRead.mutateAsync(); toast.success('Toutes les notifications marquÃ©es comme lues') } catch { toast.error('Erreur') }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try { await deleteNotif.mutateAsync(id) } catch { /* silent */ }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-gradient-to-br from-[#44DBD4] via-[#44DBD4]/90 to-[#3bc9c2] py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Notifications</h1>
              <p className="text-white/90">
                {isLoading ? '...' : unreadCount > 0
                  ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
                  : 'Toutes lues'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={handleMarkAllRead} disabled={markAllRead.isPending}>
                {markAllRead.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                Tout marquer comme lu
              </Button>
              <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" onClick={() => refetch()}>
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Category filter pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'booking', 'payment', 'visa', 'system', 'promotion'] as NotificationCategory[]).map(cat => (
            <Button key={cat} variant={categoryFilter === cat ? 'default' : 'outline'} size="sm"
              className={`shrink-0 ${categoryFilter === cat ? 'bg-[#44DBD4] hover:bg-[#3bc9c2] text-white' : ''}`}
              onClick={() => setCategoryFilter(cat)}>
              {getCategoryIcon(cat)}
              <span className="ml-2">{getCategoryLabel(cat)}</span>
            </Button>
          ))}
        </div>

        {/* Read filter tabs */}
        <div className="flex gap-2 mb-6">
          <Button variant={readFilter === 'all' ? 'default' : 'outline'} size="sm"
            className={readFilter === 'all' ? 'bg-[#44DBD4] hover:bg-[#3bc9c2] text-white' : ''}
            onClick={() => setReadFilter('all')}>
            Toutes {notifications.length > 0 && <Badge variant="secondary" className="ml-2">{notifications.length}</Badge>}
          </Button>
          <Button variant={readFilter === 'unread' ? 'default' : 'outline'} size="sm"
            className={readFilter === 'unread' ? 'bg-[#44DBD4] hover:bg-[#3bc9c2] text-white' : ''}
            onClick={() => setReadFilter('unread')}>
            Non lues {unreadCount > 0 && <Badge className="ml-2 bg-red-500">{unreadCount}</Badge>}
          </Button>
        </div>

        {isLoading ? (
          <Card><CardContent className="p-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </CardContent></Card>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Aucune notification</h3>
            <p className="text-muted-foreground">Vous n'avez pas de notifications dans cette catÃ©gorie</p>
          </CardContent></Card>
        ) : (
          <Card><CardContent className="p-0">
            {filtered.map((notif: any, idx: number) => (
              <div key={notif.id}>
                <div
                  className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${!notif.read ? 'bg-[#44DBD4]/5 border-l-4 border-l-[#44DBD4]' : ''}`}
                  onClick={() => {
                    handleMarkRead(notif.id)
                    if (notif.metadata?.bookingId) navigate('/my-trips')
                    else if (notif.type === 'payment') navigate('/wallet')
                    else if (notif.type === 'visa') navigate('/visa')
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className={getNotifStyle(notif.type, notif.read)}>{getCategoryIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{notif.title}</h3>
                          <Badge variant="outline" className="text-xs">{getCategoryLabel(notif.type)}</Badge>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!notif.read && <Badge className="bg-[#44DBD4] text-white text-xs">Nouveau</Badge>}
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => handleDelete(e, notif.id)}>
                            <X className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notif.message}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(notif.createdAt)}</p>
                    </div>
                  </div>
                </div>
                {idx < filtered.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent></Card>
        )}

        {/* Preferences card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />PrÃ©fÃ©rences de notification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: Plane, label: 'Alertes vols', desc: 'Retards, annulations, changements' },
                { icon: Clock, label: 'Rappels', desc: 'Enregistrement, check-out' },
                { icon: CreditCard, label: 'Paiements', desc: 'Confirmations, remboursements' },
                { icon: FileCheck, label: 'Visa', desc: 'Mises Ã  jour de statut' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div><p className="font-medium">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
                  </div>
                  <Badge className="bg-[#44DBD4] text-white">ActivÃ©</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

