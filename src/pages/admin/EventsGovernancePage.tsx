import { useEffect, useState } from 'react'
import { useAdminServices, useUpdateAdminService, useDeleteAdminService } from '@/hooks/useAdmin'
import {
  Ticket,
  Search,
  MoreHorizontal,
  Trash2,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Shield,
  FileText,
  UserCheck,
  Loader2,
  Ban,
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

// Event interface
interface Event {
  id: string
  title: string
  organizer: string
  organizerId: string
  organizerVerified: boolean
  category: string
  date: string
  location: string
  price: number
  capacity: number
  ticketsSold: number
  status: 'pending' | 'approved' | 'rejected' | 'flagged'
  submittedAt: string
  description: string
  fraudScore: number
  approvedAt?: string
  flagReason?: string
}

// Organizer interface
interface Organizer {
  id: string
  name: string
  type: string
  verified: boolean
  eventsCount: number
  totalTickets: number
  rating: number
  status: 'active' | 'pending' | 'suspended'
  createdAt: string
  documents: string[]
  flagReason?: string
}

// Fraud rule interface
interface FraudRule {
  rule: string
  score: number
  enabled: boolean
}

// Mock events for approval
const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Concert J-Pop Festival Tokyo',
    organizer: 'Tokyo Events Co.',
    organizerId: 'ORG001',
    organizerVerified: true,
    category: 'Musique',
    date: '2024-03-15',
    location: 'Tokyo Dome, Japon',
    price: 85,
    capacity: 5000,
    ticketsSold: 0,
    status: 'pending',
    submittedAt: '2024-02-20T10:00:00',
    description: 'Festival de musique J-Pop avec les plus grands artistes',
    fraudScore: 0,
  },
  {
    id: '2',
    title: 'Tournoi de Sumo Professionnel',
    organizer: 'Japan Sports Association',
    organizerId: 'ORG002',
    organizerVerified: true,
    category: 'Sport',
    date: '2024-03-20',
    location: 'Ryogoku Kokugikan, Tokyo',
    price: 120,
    capacity: 8000,
    ticketsSold: 0,
    status: 'pending',
    submittedAt: '2024-02-19T15:30:00',
    description: 'Tournoi officiel de sumo avec les meilleurs lutteurs',
    fraudScore: 0,
  },
  {
    id: '3',
    title: 'Atelier Cuisine Sushi Premium',
    organizer: 'Chef Tanaka',
    organizerId: 'ORG003',
    organizerVerified: false,
    category: 'Gastronomie',
    date: '2024-03-10',
    location: 'Shibuya, Tokyo',
    price: 150,
    capacity: 20,
    ticketsSold: 0,
    status: 'pending',
    submittedAt: '2024-02-18T09:00:00',
    description: 'Apprenez à préparer des sushis avec un maître',
    fraudScore: 15,
  },
  {
    id: '4',
    title: 'Visite Guidée Temples Kyoto',
    organizer: 'Kyoto Tours',
    organizerId: 'ORG004',
    organizerVerified: true,
    category: 'Culture',
    date: '2024-03-05',
    location: 'Kyoto, Japon',
    price: 45,
    capacity: 30,
    ticketsSold: 25,
    status: 'approved',
    submittedAt: '2024-02-15T14:00:00',
    approvedAt: '2024-02-16T10:00:00',
    description: 'Visite des plus beaux temples de Kyoto',
    fraudScore: 0,
  },
  {
    id: '5',
    title: 'Concert Suspect - Événement Test',
    organizer: 'Unknown Organizer',
    organizerId: 'ORG999',
    organizerVerified: false,
    category: 'Musique',
    date: '2024-03-25',
    location: 'Lieu non confirmé',
    price: 500,
    capacity: 10000,
    ticketsSold: 0,
    status: 'flagged',
    submittedAt: '2024-02-20T08:00:00',
    description: 'Description vague et suspecte',
    fraudScore: 85,
    flagReason: 'Organisateur non vérifié, prix anormal, lieu non confirmé',
  },
]

const initialOrganizers: Organizer[] = [
  {
    id: 'ORG001',
    name: 'Tokyo Events Co.',
    type: 'company',
    verified: true,
    eventsCount: 45,
    totalTickets: 125000,
    rating: 4.8,
    status: 'active',
    createdAt: '2022-05-15',
    documents: ['Registre commerce', 'Assurance', 'Licence événements'],
  },
  {
    id: 'ORG002',
    name: 'Japan Sports Association',
    type: 'organization',
    verified: true,
    eventsCount: 120,
    totalTickets: 500000,
    rating: 4.9,
    status: 'active',
    createdAt: '2020-01-10',
    documents: ['Agrément officiel', 'Assurance', 'Certification'],
  },
  {
    id: 'ORG003',
    name: 'Chef Tanaka',
    type: 'individual',
    verified: false,
    eventsCount: 3,
    totalTickets: 45,
    rating: 4.5,
    status: 'pending',
    createdAt: '2024-01-20',
    documents: ['Pièce d\'identité'],
  },
  {
    id: 'ORG999',
    name: 'Unknown Organizer',
    type: 'individual',
    verified: false,
    eventsCount: 0,
    totalTickets: 0,
    rating: 0,
    status: 'suspended',
    createdAt: '2024-02-20',
    documents: [],
    flagReason: 'Activité suspecte détectée',
  },
]

const initialFraudRules: FraudRule[] = [
  { rule: 'Organisateur non vérifié', score: 20, enabled: true },
  { rule: 'Prix anormalement élevé', score: 15, enabled: true },
  { rule: 'Lieu non confirmé', score: 25, enabled: true },
  { rule: 'Nouvel organisateur', score: 10, enabled: true },
  { rule: 'Capacité très élevée sans historique', score: 20, enabled: true },
  { rule: 'Description suspecte', score: 15, enabled: false },
]

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  approved: { label: 'Approuvé', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-700', icon: XCircle },
  flagged: { label: 'Signalé', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
}

export function EventsGovernancePage() {
  const servicesQuery = useAdminServices({ page: 1, limit: 100, type: 'EVENTS' })
  const updateService = useUpdateAdminService()
  const deleteService = useDeleteAdminService()
  const [events, setEvents] = useState(initialEvents)
  const [organizers, setOrganizers] = useState(initialOrganizers)

  useEffect(() => {
    const items = servicesQuery.data?.items
    if (!items) return
    const mapped: Event[] = items.map(s => ({
      id: s.id,
      title: s.name,
      organizer: s.provider?.companyName ?? 'N/A',
      organizerId: s.provider?.id ?? '',
      organizerVerified: s.provider?.isVerified ?? false,
      category: 'Événement',
      date: s.createdAt,
      location: s.location,
      price: s.price,
      capacity: 0,
      ticketsSold: s.reviewCount,
      status: s.isActive ? 'approved' : 'rejected',
      submittedAt: s.createdAt,
      description: s.description,
      fraudScore: 0,
    }))
    if (mapped.length > 0) setEvents(mapped)
  }, [servicesQuery.data])

  const [fraudRules, setFraudRules] = useState(initialFraudRules)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(null)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [showOrganizerDetails, setShowOrganizerDetails] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [activeTab, setActiveTab] = useState<'events' | 'organizers' | 'fraud'>('events')
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
  })

  // Dialog states
  const [showApproveEventDialog, setShowApproveEventDialog] = useState(false)
  const [showRejectEventDialog, setShowRejectEventDialog] = useState(false)
  const [showDeleteEventDialog, setShowDeleteEventDialog] = useState(false)
  const [showUnflagEventDialog, setShowUnflagEventDialog] = useState(false)
  const [showVerifyOrganizerDialog, setShowVerifyOrganizerDialog] = useState(false)
  const [showSuspendOrganizerDialog, setShowSuspendOrganizerDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filters.status === 'all' || event.status === filters.status
    const matchesCategory = filters.category === 'all' || event.category === filters.category
    return matchesSearch && matchesStatus && matchesCategory
  })

  const totalPages = Math.ceil(filteredEvents.length / pageSize)
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Handlers
  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event)
    setShowEventDetails(true)
  }

  const handleViewOrganizer = (organizer: Organizer) => {
    setSelectedOrganizer(organizer)
    setShowOrganizerDetails(true)
  }

  const handleExport = async () => {
    setIsExporting(true)
    toast.info('Export en cours...')
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const data = {
      events: events,
      organizers: organizers,
      fraudRules: fraudRules,
      exportedAt: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `events-governance-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    setIsExporting(false)
    toast.success('Export terminé')
  }

  const handleApproveEvent = async () => {
    if (!selectedEvent) return
    setIsProcessing(true)
    try {
      await updateService.mutateAsync({ id: selectedEvent.id, isActive: true })
      setEvents(prev => prev.map(e =>
        e.id === selectedEvent.id
          ? { ...e, status: 'approved' as const, approvedAt: new Date().toISOString() }
          : e
      ))
      toast.success(`Événement "${selectedEvent.title}" approuvé`)
    } catch {
      toast.error("Échec de l'approbation")
    } finally {
      setIsProcessing(false)
      setShowApproveEventDialog(false)
      setShowEventDetails(false)
    }
  }

  const handleRejectEvent = async () => {
    if (!selectedEvent) return
    setIsProcessing(true)
    try {
      await updateService.mutateAsync({ id: selectedEvent.id, isActive: false })
      setEvents(prev => prev.map(e =>
        e.id === selectedEvent.id ? { ...e, status: 'rejected' as const } : e
      ))
      toast.success(`Événement "${selectedEvent.title}" rejeté`)
    } catch {
      toast.error('Échec du rejet')
    } finally {
      setIsProcessing(false)
      setShowRejectEventDialog(false)
      setShowEventDetails(false)
      setRejectionReason('')
    }
  }

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return
    setIsProcessing(true)
    try {
      await deleteService.mutateAsync(selectedEvent.id)
      setEvents(prev => prev.filter(e => e.id !== selectedEvent.id))
      toast.success(`Événement "${selectedEvent.title}" supprimé`)
    } catch {
      toast.error('Échec de la suppression')
    } finally {
      setIsProcessing(false)
      setShowDeleteEventDialog(false)
      setShowEventDetails(false)
    }
  }

  const handleUnflagEvent = async () => {
    if (!selectedEvent) return
    
    setIsProcessing(true)
    toast.info('Levée du signalement...')
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setEvents(prev => prev.map(e => 
      e.id === selectedEvent.id 
        ? { ...e, status: 'pending' as const, fraudScore: 0, flagReason: undefined }
        : e
    ))
    
    setIsProcessing(false)
    setShowUnflagEventDialog(false)
    setShowEventDetails(false)
    toast.success(`Signalement levé pour "${selectedEvent.title}"`)
  }

  const handleVerifyOrganizer = async () => {
    if (!selectedOrganizer) return
    
    setIsProcessing(true)
    toast.info('Vérification en cours...')
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setOrganizers(prev => prev.map(o => 
      o.id === selectedOrganizer.id 
        ? { ...o, verified: true, status: 'active' as const }
        : o
    ))
    
    // Also update events from this organizer
    setEvents(prev => prev.map(e => 
      e.organizerId === selectedOrganizer.id 
        ? { ...e, organizerVerified: true }
        : e
    ))
    
    setIsProcessing(false)
    setShowVerifyOrganizerDialog(false)
    setShowOrganizerDetails(false)
    toast.success(`Organisateur "${selectedOrganizer.name}" vérifié`)
  }

  const handleSuspendOrganizer = async () => {
    if (!selectedOrganizer) return
    
    setIsProcessing(true)
    toast.info('Suspension en cours...')
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setOrganizers(prev => prev.map(o => 
      o.id === selectedOrganizer.id 
        ? { ...o, status: 'suspended' as const }
        : o
    ))
    
    setIsProcessing(false)
    setShowSuspendOrganizerDialog(false)
    setShowOrganizerDetails(false)
    toast.success(`Organisateur "${selectedOrganizer.name}" suspendu`)
  }

  const handleToggleFraudRule = (index: number) => {
    setFraudRules(prev => prev.map((rule, i) => 
      i === index ? { ...rule, enabled: !rule.enabled } : rule
    ))
    toast.success(`Règle ${fraudRules[index].enabled ? 'désactivée' : 'activée'}`)
  }

  const stats = {
    totalEvents: events.length,
    pendingApproval: events.filter(e => e.status === 'pending').length,
    approved: events.filter(e => e.status === 'approved').length,
    flagged: events.filter(e => e.status === 'flagged').length,
    verifiedOrganizers: organizers.filter(o => o.verified).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gouvernance des événements</h1>
          <p className="text-slate-500">Approbation des événements et vérification des organisateurs</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-200" onClick={handleExport} disabled={isExporting}>
            {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Ticket className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.totalEvents}</p>
                <p className="text-xs text-slate-500">Total événements</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.pendingApproval}</p>
                <p className="text-xs text-slate-500">En attente</p>
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
                <p className="text-2xl font-bold text-slate-900">{stats.approved}</p>
                <p className="text-xs text-slate-500">Approuvés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.flagged}</p>
                <p className="text-xs text-slate-500">Signalés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.verifiedOrganizers}</p>
                <p className="text-xs text-slate-500">Org. vérifiés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'events'
              ? 'border-[#44DBD4] text-[#44DBD4]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('events')}
        >
          Événements
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'organizers'
              ? 'border-[#44DBD4] text-[#44DBD4]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('organizers')}
        >
          Organisateurs
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'fraud'
              ? 'border-[#44DBD4] text-[#44DBD4]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('fraud')}
        >
          Prévention fraude
        </button>
      </div>

      {/* Search and Filters */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Rechercher un événement..."
                className="pl-10 border-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                <SelectTrigger className="w-[150px] border-slate-200">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvé</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                  <SelectItem value="flagged">Signalé</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.category} onValueChange={(v) => setFilters({ ...filters, category: v })}>
                <SelectTrigger className="w-[150px] border-slate-200">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="Musique">Musique</SelectItem>
                  <SelectItem value="Sport">Sport</SelectItem>
                  <SelectItem value="Culture">Culture</SelectItem>
                  <SelectItem value="Gastronomie">Gastronomie</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      {activeTab === 'events' && (
        <Card className="border-slate-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Événement</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Organisateur</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Prix</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Statut</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Score fraude</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedEvents.map((event) => {
                    const statusInfo = statusConfig[event.status]
                    const StatusIcon = statusInfo.icon

                    return (
                      <tr key={event.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">{event.title}</p>
                            <p className="text-sm text-slate-500">{event.category}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600">{event.organizer}</span>
                            {event.organizerVerified && (
                              <Badge className="bg-blue-100 text-blue-700 text-xs">Vérifié</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(event.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{event.price} ¥</td>
                        <td className="px-6 py-4">
                          <Badge className={`${statusInfo.color} flex items-center gap-1 w-fit`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-16 rounded-full ${
                              event.fraudScore < 30 ? 'bg-green-200' :
                              event.fraudScore < 60 ? 'bg-yellow-200' :
                              'bg-red-200'
                            }`}>
                              <div 
                                className={`h-full rounded-full ${
                                  event.fraudScore < 30 ? 'bg-green-500' :
                                  event.fraudScore < 60 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${event.fraudScore}%` }}
                              />
                            </div>
                            <span className={`text-sm ${
                              event.fraudScore < 30 ? 'text-green-600' :
                              event.fraudScore < 60 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {event.fraudScore}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-5 w-5 text-slate-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white">
                              <DropdownMenuItem onClick={() => handleViewEvent(event)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir détails
                              </DropdownMenuItem>
                              {event.status === 'pending' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-green-600" onClick={() => {
                                    setSelectedEvent(event)
                                    setShowApproveEventDialog(true)
                                  }}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approuver
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600" onClick={() => {
                                    setSelectedEvent(event)
                                    setShowRejectEventDialog(true)
                                  }}>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Rejeter
                                  </DropdownMenuItem>
                                </>
                              )}
                              {event.status === 'flagged' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-green-600" onClick={() => {
                                    setSelectedEvent(event)
                                    setShowUnflagEventDialog(true)
                                  }}>
                                    <Shield className="h-4 w-4 mr-2" />
                                    Lever le signalement
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600" onClick={() => {
                                    setSelectedEvent(event)
                                    setShowDeleteEventDialog(true)
                                  }}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            
            {filteredEvents.length > pageSize && (
              <div className="border-t border-slate-200 p-4">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={filteredEvents.length}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={[10, 25, 50]}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Organizers Tab */}
      {activeTab === 'organizers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {organizers.map((organizer) => (
            <Card key={organizer.id} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{organizer.name}</p>
                      {organizer.verified && (
                        <Badge className="bg-blue-100 text-blue-700 text-xs">Vérifié</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 capitalize">{organizer.type}</p>
                  </div>
                  <Badge className={
                    organizer.status === 'active' ? 'bg-green-100 text-green-700' :
                    organizer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }>
                    {organizer.status === 'active' ? 'Actif' : organizer.status === 'pending' ? 'En attente' : 'Suspendu'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-2 bg-slate-50 rounded">
                    <p className="text-lg font-semibold text-slate-900">{organizer.eventsCount}</p>
                    <p className="text-xs text-slate-500">Événements</p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 rounded">
                    <p className="text-lg font-semibold text-slate-900">{(organizer.totalTickets / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-slate-500">Billets</p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 rounded">
                    <p className="text-lg font-semibold text-slate-900">{organizer.rating || '-'}</p>
                    <p className="text-xs text-slate-500">Note</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Documents fournis</p>
                  <div className="flex flex-wrap gap-1">
                    {organizer.documents.length > 0 ? (
                      organizer.documents.map((doc) => (
                        <Badge key={doc} variant="outline" className="text-xs border-green-200 text-green-700">
                          <FileText className="h-3 w-3 mr-1" />
                          {doc}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">Aucun document</span>
                    )}
                  </div>
                </div>

                {organizer.flagReason && (
                  <div className="bg-red-50 border border-red-200 rounded p-2 mb-4">
                    <p className="text-xs text-red-600">{organizer.flagReason}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewOrganizer(organizer)}>
                    Voir profil
                  </Button>
                  {!organizer.verified && organizer.status === 'pending' && (
                    <Button size="sm" className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => {
                      setSelectedOrganizer(organizer)
                      setShowVerifyOrganizerDialog(true)
                    }}>
                      Vérifier
                    </Button>
                  )}
                  {organizer.status === 'active' && (
                    <Button variant="destructive" size="sm" className="flex-1" onClick={() => {
                      setSelectedOrganizer(organizer)
                      setShowSuspendOrganizerDialog(true)
                    }}>
                      Suspendre
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Fraud Prevention Tab */}
      {activeTab === 'fraud' && (
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Règles de détection de fraude</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fraudRules.map((rule, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${rule.enabled ? 'bg-green-500' : 'bg-slate-300'}`} />
                    <span className="text-slate-700">{rule.rule}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">+{rule.score} points</Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleToggleFraudRule(index)}>
                      {rule.enabled ? 'Désactiver' : 'Activer'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Seuils d'alerte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">0-30%</p>
                  <p className="text-sm text-green-700">Faible risque</p>
                  <p className="text-xs text-green-600 mt-1">Approbation automatique</p>
                </div>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-600">30-60%</p>
                  <p className="text-sm text-yellow-700">Risque moyen</p>
                  <p className="text-xs text-yellow-600 mt-1">Révision manuelle</p>
                </div>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">60%+</p>
                  <p className="text-sm text-red-700">Risque élevé</p>
                  <p className="text-xs text-red-600 mt-1">Signalement automatique</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Event Details Sheet */}
      <Sheet open={showEventDetails} onOpenChange={setShowEventDetails}>
        <SheetContent className="w-full sm:max-w-lg bg-white overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Détails de l'événement</SheetTitle>
          </SheetHeader>
          
          {selectedEvent && (
            <div className="py-6 space-y-6">
              {/* Header */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{selectedEvent.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={statusConfig[selectedEvent.status].color}>
                    {statusConfig[selectedEvent.status].label}
                  </Badge>
                  <Badge variant="outline">{selectedEvent.category}</Badge>
                </div>
              </div>

              <Separator />

              {/* Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{new Date(selectedEvent.date).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{selectedEvent.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">Capacité: {selectedEvent.capacity} | Vendus: {selectedEvent.ticketsSold}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{selectedEvent.price} ¥ par billet</span>
                </div>
              </div>

              <Separator />

              {/* Organizer */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Organisateur</h4>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{selectedEvent.organizer}</p>
                    <p className="text-xs text-slate-500">{selectedEvent.organizerId}</p>
                  </div>
                  {selectedEvent.organizerVerified ? (
                    <Badge className="bg-blue-100 text-blue-700">Vérifié</Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-700">Non vérifié</Badge>
                  )}
                </div>
              </div>

              {/* Fraud Score */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Score de fraude</h4>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Score</span>
                    <span className={`font-semibold ${
                      selectedEvent.fraudScore < 30 ? 'text-green-600' :
                      selectedEvent.fraudScore < 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {selectedEvent.fraudScore}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full">
                    <div 
                      className={`h-full rounded-full ${
                        selectedEvent.fraudScore < 30 ? 'bg-green-500' :
                        selectedEvent.fraudScore < 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${selectedEvent.fraudScore}%` }}
                    />
                  </div>
                </div>
                {selectedEvent.flagReason && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                    {selectedEvent.flagReason}
                  </div>
                )}
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Description</h4>
                <p className="text-sm text-slate-600">{selectedEvent.description}</p>
              </div>

              {/* Actions */}
              {selectedEvent.status === 'pending' && (
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowRejectEventDialog(true)}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeter
                  </Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowApproveEventDialog(true)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approuver
                  </Button>
                </div>
              )}
              {selectedEvent.status === 'flagged' && (
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowDeleteEventDialog(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                  <Button className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => setShowUnflagEventDialog(true)}>
                    <Shield className="h-4 w-4 mr-2" />
                    Lever signalement
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Organizer Details Sheet */}
      <Sheet open={showOrganizerDetails} onOpenChange={setShowOrganizerDetails}>
        <SheetContent className="w-full sm:max-w-lg bg-white overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Profil de l'organisateur</SheetTitle>
          </SheetHeader>
          
          {selectedOrganizer && (
            <div className="py-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{selectedOrganizer.name}</h3>
                  <p className="text-sm text-slate-500 capitalize">{selectedOrganizer.type}</p>
                </div>
                <Badge className={
                  selectedOrganizer.status === 'active' ? 'bg-green-100 text-green-700' :
                  selectedOrganizer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }>
                  {selectedOrganizer.status === 'active' ? 'Actif' : selectedOrganizer.status === 'pending' ? 'En attente' : 'Suspendu'}
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-xl font-bold text-slate-900">{selectedOrganizer.eventsCount}</p>
                  <p className="text-xs text-slate-500">Événements</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-xl font-bold text-slate-900">{(selectedOrganizer.totalTickets / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-slate-500">Billets</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-xl font-bold text-slate-900">{selectedOrganizer.rating || '-'}</p>
                  <p className="text-xs text-slate-500">Note</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Documents</h4>
                <div className="space-y-2">
                  {selectedOrganizer.documents.length > 0 ? (
                    selectedOrganizer.documents.map((doc) => (
                      <div key={doc} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-700">{doc}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">Aucun document fourni</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Membre depuis</h4>
                <p className="text-sm text-slate-600">{new Date(selectedOrganizer.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>

              {selectedOrganizer.flagReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-700">Raison du signalement</p>
                  <p className="text-sm text-red-600">{selectedOrganizer.flagReason}</p>
                </div>
              )}

              <Separator />

              <div className="flex gap-3">
                {!selectedOrganizer.verified && selectedOrganizer.status === 'pending' && (
                  <Button className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => setShowVerifyOrganizerDialog(true)}>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Vérifier
                  </Button>
                )}
                {selectedOrganizer.status === 'active' && (
                  <Button variant="destructive" className="flex-1" onClick={() => setShowSuspendOrganizerDialog(true)}>
                    <Ban className="h-4 w-4 mr-2" />
                    Suspendre
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Approve Event Dialog */}
      <Dialog open={showApproveEventDialog} onOpenChange={setShowApproveEventDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Approuver l'événement</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir approuver "{selectedEvent?.title}" ?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveEventDialog(false)}>Annuler</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleApproveEvent} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Approuver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Event Dialog */}
      <Dialog open={showRejectEventDialog} onOpenChange={setShowRejectEventDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Rejeter l'événement</DialogTitle>
            <DialogDescription>Indiquez la raison du rejet de "{selectedEvent?.title}"</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Raison du rejet</label>
              <Input value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Raison du rejet" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectEventDialog(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleRejectEvent} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Event Dialog */}
      <Dialog open={showDeleteEventDialog} onOpenChange={setShowDeleteEventDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Supprimer l'événement</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir supprimer "{selectedEvent?.title}" ? Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteEventDialog(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDeleteEvent} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unflag Event Dialog */}
      <Dialog open={showUnflagEventDialog} onOpenChange={setShowUnflagEventDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Lever le signalement</DialogTitle>
            <DialogDescription>Voulez-vous lever le signalement de "{selectedEvent?.title}" et le remettre en attente d'approbation ?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnflagEventDialog(false)}>Annuler</Button>
            <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={handleUnflagEvent} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Lever le signalement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Organizer Dialog */}
      <Dialog open={showVerifyOrganizerDialog} onOpenChange={setShowVerifyOrganizerDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Vérifier l'organisateur</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir vérifier "{selectedOrganizer?.name}" ?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerifyOrganizerDialog(false)}>Annuler</Button>
            <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={handleVerifyOrganizer} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Vérifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Organizer Dialog */}
      <Dialog open={showSuspendOrganizerDialog} onOpenChange={setShowSuspendOrganizerDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Suspendre l'organisateur</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir suspendre "{selectedOrganizer?.name}" ? Ses événements seront également suspendus.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendOrganizerDialog(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleSuspendOrganizer} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Suspendre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
