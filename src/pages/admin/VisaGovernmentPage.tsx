import { useMemo, useState } from 'react'
import {
  FileCheck,
  Search,
  Eye,
  Download,
  Globe,
  Building2,
  CheckCircle,
  RefreshCw,
  Loader2,
  Clock,
  XCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { PaginationControls } from '@/components/ui/pagination-controls'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useAdminVisaApplications, useUpdateAdminVisaStatus, useAdminStats } from '@/hooks/useAdmin'

type VisaApplicantData = {
  fullName?: string
  passportNumber?: string
  nationality?: string
  phone?: string
  email?: string
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  draft: { label: 'Brouillon', color: 'bg-slate-100 text-slate-700', icon: Clock },
  submitted: { label: 'Soumis', color: 'bg-blue-100 text-blue-700', icon: Clock },
  processing: { label: 'En traitement', color: 'bg-yellow-100 text-yellow-700', icon: RefreshCw },
  approved: { label: 'Approuvé', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Refusé', color: 'bg-red-100 text-red-700', icon: XCircle },
}

export function VisaGovernmentPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [activeTab, setActiveTab] = useState<'applications' | 'partners'>('applications')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const visaQuery = useAdminVisaApplications({ page: currentPage, limit: pageSize, status: statusFilter })
  const statsQuery = useAdminStats()
  const updateStatus = useUpdateAdminVisaStatus()

  const applications = visaQuery.data?.items ?? []
  const total = visaQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase()
    if (!q) return applications
    return applications.filter((a) => {
      const appData = a.applicantData as VisaApplicantData | null
      return (
        a.countryName.toLowerCase().includes(q) ||
        (appData?.fullName ?? '').toLowerCase().includes(q) ||
        a.user.email.toLowerCase().includes(q)
      )
    })
  }, [applications, searchQuery])

  const selectedApp = selectedId ? applications.find((a) => a.id === selectedId) ?? null : null

  const handleUpdateStatus = async () => {
    if (!selectedId || !newStatus) return
    try {
      await updateStatus.mutateAsync({ id: selectedId, status: newStatus })
      setShowStatusDialog(false)
      toast.success(`Statut mis à jour: ${statusConfig[newStatus]?.label ?? newStatus}`)
    } catch {
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    const blob = new Blob([JSON.stringify({ applications, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `visa-applications-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setIsExporting(false)
    toast.success('Export terminé')
  }

  const statsData = statsQuery.data?.data

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visa & Relations gouvernementales</h1>
          <p className="text-slate-500">Gestion des demandes de visa et intégrations gouvernementales</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-200" onClick={handleExport} disabled={isExporting}>
            {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Exporter
          </Button>
          <Button variant="outline" className="border-slate-200" onClick={() => visaQuery.refetch()} disabled={visaQuery.isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${visaQuery.isFetching ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center"><FileCheck className="h-5 w-5 text-blue-600" /></div><div><p className="text-2xl font-bold text-slate-900">{statsData?.visaApplications ?? total}</p><p className="text-xs text-slate-500">Total demandes</p></div></div></CardContent></Card>
        <Card className="border-slate-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center"><Clock className="h-5 w-5 text-yellow-600" /></div><div><p className="text-2xl font-bold text-slate-900">{applications.filter(a => a.status === 'submitted' || a.status === 'processing').length}</p><p className="text-xs text-slate-500">En attente</p></div></div></CardContent></Card>
        <Card className="border-slate-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center"><CheckCircle className="h-5 w-5 text-green-600" /></div><div><p className="text-2xl font-bold text-slate-900">{applications.filter(a => a.status === 'approved').length}</p><p className="text-xs text-slate-500">Approuvées</p></div></div></CardContent></Card>
        <Card className="border-slate-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center"><Building2 className="h-5 w-5 text-purple-600" /></div><div><p className="text-2xl font-bold text-slate-900">3</p><p className="text-xs text-slate-500">Partenaires actifs</p></div></div></CardContent></Card>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'applications' ? 'border-[#44DBD4] text-[#44DBD4]' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('applications')}
        >
          Demandes de visa
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'partners' ? 'border-[#44DBD4] text-[#44DBD4]' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('partners')}
        >
          Partenaires gouvernementaux
        </button>
      </div>

      {activeTab === 'applications' && (
        <>
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Rechercher par pays, nom, email..."
                    className="pl-10 border-slate-200"
                    value={searchQuery}
                    onChange={(e) => { setCurrentPage(1); setSearchQuery(e.target.value) }}
                  />
                </div>
                <Select value={statusFilter} onValueChange={(v) => { setCurrentPage(1); setStatusFilter(v) }}>
                  <SelectTrigger className="w-[180px] border-slate-200"><SelectValue placeholder="Statut" /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="submitted">Soumis</SelectItem>
                    <SelectItem value="processing">En traitement</SelectItem>
                    <SelectItem value="approved">Approuvé</SelectItem>
                    <SelectItem value="rejected">Refusé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Demandeur</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Destination</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Statut</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Date</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {visaQuery.isLoading && <tr><td className="px-6 py-6 text-slate-500" colSpan={5}>Chargement...</td></tr>}
                    {visaQuery.isError && <tr><td className="px-6 py-6 text-red-600" colSpan={5}>Erreur de chargement</td></tr>}
                    {!visaQuery.isLoading && !visaQuery.isError && filtered.length === 0 && <tr><td className="px-6 py-6 text-slate-500" colSpan={5}>Aucune demande trouvée</td></tr>}
                    {filtered.map((app) => {
                      const appData = app.applicantData as VisaApplicantData | null
                      const cfg = statusConfig[app.status] ?? { label: app.status, color: 'bg-slate-100 text-slate-700', icon: Clock }
                      const Ic = cfg.icon
                      return (
                        <tr key={app.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-900">{appData?.fullName ?? `${app.user.firstName} ${app.user.lastName}`}</p>
                            <p className="text-sm text-slate-500">{app.user.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-slate-400" />
                              <span className="text-sm text-slate-700">{app.countryName} ({app.countryCode})</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={`${cfg.color} flex items-center gap-1 w-fit`}>
                              <Ic className="h-3 w-3" />{cfg.label}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setSelectedId(app.id); setShowDetail(true) }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
                                onClick={() => { setSelectedId(app.id); setNewStatus(app.status); setShowStatusDialog(true) }}
                              >
                                Modifier statut
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-slate-200 p-4">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={total}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(size) => { setCurrentPage(1); setPageSize(size) }}
                  pageSizeOptions={[10, 25, 50]}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'partners' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Ministère des Affaires étrangères - France', country: 'France', status: 'active', services: ['Vérification passeport', 'Authentification'] },
            { name: 'Immigration Bureau - Japan', country: 'Japon', status: 'active', services: ['Visa status check', 'Entry permission'] },
            { name: 'USCIS - United States', country: 'États-Unis', status: 'active', services: ['ESTA verification', 'Visa status'] },
            { name: 'Visa Processing Center - China', country: 'Chine', status: 'pending', services: ['Visa application processing'] },
          ].map((partner) => (
            <Card key={partner.name} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{partner.name}</p>
                    <p className="text-sm text-slate-500">{partner.country}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {partner.services.map((s) => (<Badge key={s} variant="secondary" className="text-xs">{s}</Badge>))}
                    </div>
                  </div>
                  <Badge className={partner.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                    {partner.status === 'active' ? 'Actif' : 'En attente'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={showDetail} onOpenChange={setShowDetail}>
        <SheetContent className="w-full sm:max-w-lg bg-white overflow-y-auto">
          <SheetHeader><SheetTitle>Détails de la demande</SheetTitle></SheetHeader>
          {selectedApp && (() => {
            const appData = selectedApp.applicantData as VisaApplicantData | null
            const cfg = statusConfig[selectedApp.status] ?? { label: selectedApp.status, color: 'bg-slate-100 text-slate-700', icon: Clock }
            const Ic = cfg.icon
            return (
              <div className="py-6 space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Nom</span><span className="font-medium">{appData?.fullName ?? `${selectedApp.user.firstName} ${selectedApp.user.lastName}`}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-medium">{selectedApp.user.email}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Passeport</span><span className="font-medium">{appData?.passportNumber ?? '-'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Nationalité</span><span className="font-medium">{appData?.nationality ?? '-'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Destination</span><span className="font-medium">{selectedApp.countryName}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Statut</span><Badge className={`${cfg.color} flex items-center gap-1 w-fit`}><Ic className="h-3 w-3" />{cfg.label}</Badge></div>
                  <div className="flex justify-between"><span className="text-slate-500">Date de soumission</span><span className="font-medium">{new Date(selectedApp.createdAt).toLocaleDateString('fr-FR')}</span></div>
                </div>
                <Separator />
                <Button
                  className="w-full bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
                  onClick={() => { setShowDetail(false); setNewStatus(selectedApp.status); setShowStatusDialog(true) }}
                >
                  Modifier le statut
                </Button>
              </div>
            )
          })()}
        </SheetContent>
      </Sheet>

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Modifier le statut</DialogTitle>
            <DialogDescription>Sélectionnez le nouveau statut pour cette demande de visa.</DialogDescription>
          </DialogHeader>
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger className="border-slate-200"><SelectValue placeholder="Nouveau statut" /></SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="submitted">Soumis</SelectItem>
              <SelectItem value="processing">En traitement</SelectItem>
              <SelectItem value="approved">Approuvé</SelectItem>
              <SelectItem value="rejected">Refusé</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>Annuler</Button>
            <Button
              className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
              onClick={handleUpdateStatus}
              disabled={updateStatus.isPending || !newStatus}
            >
              {updateStatus.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
