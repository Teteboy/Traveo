import { useMemo, useState } from 'react'
import {
  Plane,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Activity,
  Globe,
  Download,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import {
  useAdminFlights,
  useAdminStats,
  useCreateAdminFlight,
  useUpdateAdminFlight,
  useDeleteAdminFlight,
} from '@/hooks/useAdmin'

type FlightForm = {
  airline: string
  flightNumber: string
  origin: string
  originCode: string
  destination: string
  destinationCode: string
  departAt: string
  arriveAt: string
  durationMinutes: number
  stops: number
  priceEconomy: number
  priceBusiness: number
  currency: string
  availableSeats: number
}

const defaultForm: FlightForm = {
  airline: '',
  flightNumber: '',
  origin: '',
  originCode: '',
  destination: '',
  destinationCode: '',
  departAt: '',
  arriveAt: '',
  durationMinutes: 120,
  stops: 0,
  priceEconomy: 50000,
  priceBusiness: 150000,
  currency: 'XAF',
  availableSeats: 100,
}

export function FlightManagementPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [activeTab, setActiveTab] = useState<'flights' | 'stats'>('flights')

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDetailSheet, setShowDetailSheet] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Duffel search state
  const [includeDuffel, setIncludeDuffel] = useState(false)
  const [duffelOrigin, setDuffelOrigin] = useState('')
  const [duffelDestination, setDuffelDestination] = useState('')
  const [duffelDepartDate, setDuffelDepartDate] = useState('')

  const [form, setForm] = useState<FlightForm>(defaultForm)

  const flightsQuery = useAdminFlights({ 
    page: currentPage, 
    limit: pageSize,
    includeDuffel,
    origin: includeDuffel ? duffelOrigin : undefined,
    destination: includeDuffel ? duffelDestination : undefined,
    departDate: includeDuffel ? duffelDepartDate : undefined,
  })
  const statsQuery = useAdminStats()
  const createMutation = useCreateAdminFlight()
  const updateMutation = useUpdateAdminFlight()
  const deleteMutation = useDeleteAdminFlight()

  const flights = flightsQuery.data?.items ?? []
  const totalFlights = flightsQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalFlights / pageSize))

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase()
    if (!q) return flights
    return flights.filter(
      (f) =>
        f.airline.toLowerCase().includes(q) ||
        f.flightNumber.toLowerCase().includes(q) ||
        f.origin.toLowerCase().includes(q) ||
        f.destination.toLowerCase().includes(q),
    )
  }, [flights, searchQuery])

  const selectedFlight = selectedId ? flights.find((f) => f.id === selectedId) ?? null : null

  const handleAdd = async () => {
    if (!form.airline || !form.flightNumber || !form.origin || !form.destination) {
      toast.error('Veuillez remplir les champs obligatoires')
      return
    }
    try {
      await createMutation.mutateAsync(form)
      setShowAddDialog(false)
      setForm(defaultForm)
      toast.success('Vol ajouté avec succès')
    } catch {
      toast.error('Erreur lors de la création du vol')
    }
  }

  const handleEdit = async () => {
    if (!selectedId) return
    try {
      await updateMutation.mutateAsync({ id: selectedId, payload: form })
      setShowEditDialog(false)
      setSelectedId(null)
      toast.success('Vol mis à jour')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async () => {
    if (!selectedId) return
    try {
      await deleteMutation.mutateAsync(selectedId)
      setShowDeleteDialog(false)
      setSelectedId(null)
      toast.success('Vol désactivé avec succès')
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const openEdit = (id: string) => {
    const f = flights.find((fl) => fl.id === id)
    if (!f) return
    setSelectedId(id)
    setForm({
      airline: f.airline,
      flightNumber: f.flightNumber,
      origin: f.origin,
      originCode: f.originCode,
      destination: f.destination,
      destinationCode: f.destinationCode,
      departAt: f.departAt ? new Date(f.departAt).toISOString().slice(0, 16) : '',
      arriveAt: f.arriveAt ? new Date(f.arriveAt).toISOString().slice(0, 16) : '',
      durationMinutes: f.durationMinutes,
      stops: f.stops,
      priceEconomy: f.priceEconomy,
      priceBusiness: f.priceBusiness ?? 0,
      currency: f.currency,
      availableSeats: f.availableSeats,
    })
    setShowEditDialog(true)
  }

  const handleExport = async () => {
    setIsExporting(true)
    const blob = new Blob([JSON.stringify({ flights, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flights-${new Date().toISOString().split('T')[0]}.json`
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
          <h1 className="text-2xl font-bold text-slate-900">Gestion du système de vols</h1>
          <p className="text-slate-500">Gestion des vols, compagnies aériennes et réservations</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-200" onClick={handleExport} disabled={isExporting}>
            {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Exporter
          </Button>
          <Button
            className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
            onClick={() => {
              setForm(defaultForm)
              setShowAddDialog(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un vol
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Plane className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{statsData?.activeFlights ?? totalFlights}</p>
                <p className="text-xs text-slate-500">Vols actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalFlights}</p>
                <p className="text-xs text-slate-500">Total vols</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{statsData?.bookings ?? '-'}</p>
                <p className="text-xs text-slate-500">Réservations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Globe className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {[...new Set(flights.map((f) => f.airline))].length}
                </p>
                <p className="text-xs text-slate-500">Compagnies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'flights' ? 'border-[#44DBD4] text-[#44DBD4]' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('flights')}
        >
          Vols
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'stats' ? 'border-[#44DBD4] text-[#44DBD4]' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('stats')}
        >
          Statistiques
        </button>
      </div>

      {activeTab === 'flights' && (
        <>
          <Card className="border-slate-200">
            <CardContent className="p-4 space-y-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Rechercher par compagnie, numéro, origine, destination..."
                  className="pl-10 border-slate-200"
                  value={searchQuery}
                  onChange={(e) => {
                    setCurrentPage(1)
                    setSearchQuery(e.target.value)
                  }}
                />
              </div>
              
              {/* Duffel Search Controls */}
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeDuffel}
                    onChange={(e) => {
                      setIncludeDuffel(e.target.checked)
                      setCurrentPage(1)
                    }}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-700">Inclure Duffel API</span>
                </label>
                
                {includeDuffel && (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      placeholder="Origine (ex: JFK)"
                      className="border-slate-200 flex-1"
                      value={duffelOrigin}
                      onChange={(e) => setDuffelOrigin(e.target.value.toUpperCase())}
                    />
                    <Input
                      placeholder="Destination (ex: LHR)"
                      className="border-slate-200 flex-1"
                      value={duffelDestination}
                      onChange={(e) => setDuffelDestination(e.target.value.toUpperCase())}
                    />
                    <Input
                      type="date"
                      className="border-slate-200 w-40"
                      value={duffelDepartDate}
                      onChange={(e) => setDuffelDepartDate(e.target.value)}
                    />
                    <Button
                      onClick={() => setCurrentPage(1)}
                      disabled={!duffelOrigin || !duffelDestination || !duffelDepartDate}
                      className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
                    >
                      Rechercher
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Vol</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Itinéraire</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Départ</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Prix éco</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Sièges</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Source</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {flightsQuery.isLoading && (
                      <tr><td className="px-6 py-6 text-slate-500" colSpan={7}>Chargement...</td></tr>
                    )}
                    {flightsQuery.isError && (
                      <tr><td className="px-6 py-6 text-red-600" colSpan={7}>Erreur de chargement</td></tr>
                    )}
                    {!flightsQuery.isLoading && !flightsQuery.isError && filtered.length === 0 && (
                      <tr><td className="px-6 py-6 text-slate-500" colSpan={7}>Aucun vol trouvé</td></tr>
                    )}
                    {filtered.map((flight) => (
                      <tr key={flight.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">{flight.airline}</p>
                            <p className="text-sm text-slate-500">{flight.flightNumber}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-700">{flight.originCode} → {flight.destinationCode}</p>
                          <p className="text-xs text-slate-500">{flight.origin} → {flight.destination}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(flight.departAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {flight.priceEconomy.toLocaleString()} {flight.currency}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{flight.availableSeats}</td>
                        <td className="px-6 py-4">
                          <Badge className={(flight as any).isDuffel ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>
                            {(flight as any).isDuffel ? 'Duffel' : 'Local'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-5 w-5 text-slate-400" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white">
                              <DropdownMenuItem onClick={() => { setSelectedId(flight.id); setShowDetailSheet(true) }}>
                                Voir détails
                              </DropdownMenuItem>
                              {!(flight as any).isDuffel && (
                                <>
                                  <DropdownMenuItem onClick={() => openEdit(flight.id)}>
                                    <Edit className="h-4 w-4 mr-2" />Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedId(flight.id); setShowDeleteDialog(true) }}>
                                    <Trash2 className="h-4 w-4 mr-2" />Désactiver
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-slate-200 p-4">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={totalFlights}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(size) => { setCurrentPage(1); setPageSize(size) }}
                  pageSizeOptions={[10, 25, 50]}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-200">
            <CardHeader><CardTitle className="text-lg">Compagnies aériennes</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[...new Map(flights.map((f) => [f.airline, f])).values()].map((f) => (
                <div key={f.airline} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Plane className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-slate-700">{f.airline}</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Actif</Badge>
                </div>
              ))}
              {flights.length === 0 && <p className="text-slate-500 text-sm">Aucune donnée disponible</p>}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader><CardTitle className="text-lg">Statut des API</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-slate-700">API Vols (backend)</span>
                <Badge className="ml-auto bg-green-100 text-green-700">Opérationnel</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-sm text-slate-700">Amadeus GDS</span>
                <Badge className="ml-auto bg-yellow-100 text-yellow-700">
                  <AlertTriangle className="h-3 w-3 mr-1" />À configurer
                </Badge>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-sm text-slate-700">Sabre GDS</span>
                <Badge className="ml-auto bg-yellow-100 text-yellow-700">
                  <AlertTriangle className="h-3 w-3 mr-1" />À configurer
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-2">Configurez les clés API GDS dans les variables d'environnement du serveur.</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Sheet open={showDetailSheet} onOpenChange={setShowDetailSheet}>
        <SheetContent className="w-full sm:max-w-lg bg-white overflow-y-auto">
          <SheetHeader><SheetTitle>Détails du vol</SheetTitle></SheetHeader>
          {selectedFlight && (
            <div className="py-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1"><p className="text-slate-500">Compagnie</p><p className="font-medium">{selectedFlight.airline}</p></div>
                <div className="space-y-1"><p className="text-slate-500">N° Vol</p><p className="font-medium">{selectedFlight.flightNumber}</p></div>
                <div className="space-y-1"><p className="text-slate-500">Origine</p><p className="font-medium">{selectedFlight.origin} ({selectedFlight.originCode})</p></div>
                <div className="space-y-1"><p className="text-slate-500">Destination</p><p className="font-medium">{selectedFlight.destination} ({selectedFlight.destinationCode})</p></div>
                <div className="space-y-1"><p className="text-slate-500">Départ</p><p className="font-medium">{new Date(selectedFlight.departAt).toLocaleString('fr-FR')}</p></div>
                <div className="space-y-1"><p className="text-slate-500">Arrivée</p><p className="font-medium">{new Date(selectedFlight.arriveAt).toLocaleString('fr-FR')}</p></div>
                <div className="space-y-1"><p className="text-slate-500">Durée</p><p className="font-medium">{Math.floor(selectedFlight.durationMinutes / 60)}h {selectedFlight.durationMinutes % 60}min</p></div>
                <div className="space-y-1"><p className="text-slate-500">Escales</p><p className="font-medium">{selectedFlight.stops}</p></div>
                <div className="space-y-1"><p className="text-slate-500">Prix éco</p><p className="font-medium">{selectedFlight.priceEconomy.toLocaleString()} {selectedFlight.currency}</p></div>
                <div className="space-y-1"><p className="text-slate-500">Prix business</p><p className="font-medium">{selectedFlight.priceBusiness?.toLocaleString() ?? '-'} {selectedFlight.currency}</p></div>
                <div className="space-y-1"><p className="text-slate-500">Sièges dispo</p><p className="font-medium">{selectedFlight.availableSeats}</p></div>
                <div className="space-y-1"><p className="text-slate-500">Statut</p><Badge className={selectedFlight.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}>{selectedFlight.isActive ? 'Actif' : 'Inactif'}</Badge></div>
              </div>
              <Separator />
              <div className="flex gap-3">
                <Button className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => { setShowDetailSheet(false); openEdit(selectedFlight.id) }}>Modifier</Button>
                <Button variant="destructive" className="flex-1" onClick={() => { setShowDetailSheet(false); setShowDeleteDialog(true) }}>Désactiver</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {(showAddDialog || showEditDialog) && (
        <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); setShowEditDialog(false) } }}>
          <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{showAddDialog ? 'Ajouter un vol' : 'Modifier le vol'}</DialogTitle>
              <DialogDescription>Renseignez les informations du vol.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              {([
                ['Compagnie aérienne*', 'airline', 'text'],
                ['N° de vol*', 'flightNumber', 'text'],
                ['Origine*', 'origin', 'text'],
                ['Code origine*', 'originCode', 'text'],
                ['Destination*', 'destination', 'text'],
                ['Code destination*', 'destinationCode', 'text'],
                ['Départ*', 'departAt', 'datetime-local'],
                ['Arrivée*', 'arriveAt', 'datetime-local'],
                ['Durée (min)', 'durationMinutes', 'number'],
                ['Escales', 'stops', 'number'],
                ['Prix éco (XAF)', 'priceEconomy', 'number'],
                ['Prix business (XAF)', 'priceBusiness', 'number'],
                ['Sièges disponibles', 'availableSeats', 'number'],
              ] as [string, keyof FlightForm, string][]).map(([label, field, type]) => (
                <div key={field} className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">{label}</label>
                  <input
                    type={type}
                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
                    value={String(form[field])}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowAddDialog(false); setShowEditDialog(false) }}>Annuler</Button>
              <Button
                className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
                onClick={showAddDialog ? handleAdd : handleEdit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {showAddDialog ? 'Ajouter' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Désactiver le vol</DialogTitle>
            <DialogDescription>Ce vol sera désactivé et ne sera plus proposé aux utilisateurs.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Désactiver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
