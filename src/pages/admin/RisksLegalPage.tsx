import { useState } from 'react'
import {
  Shield,
  Search,
  MoreHorizontal,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  FileText,
  Lock,
  Gavel,
  Ban,
  MessageSquare,
  Activity,
  Building2,
  Mail,
  FileWarning,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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

// Mock moderation items
const mockModerationItems = [
  {
    id: '1',
    type: 'review',
    content: 'Commentaire inapproprié sur un hôtel...',
    author: 'User123',
    authorId: 'USR123',
    targetType: 'hotel',
    targetName: 'Grand Hotel Paris',
    status: 'pending',
    priority: 'medium',
    reason: 'Contenu signalé par les utilisateurs',
    createdAt: '2024-02-20T10:30:00',
    reports: 3,
  },
  {
    id: '2',
    type: 'user',
    content: 'Activité suspecte - multiples comptes',
    author: 'SuspiciousUser',
    authorId: 'USR999',
    targetType: 'user',
    targetName: 'SuspiciousUser',
    status: 'investigating',
    priority: 'high',
    reason: 'Détection automatique: IP partagée',
    createdAt: '2024-02-20T09:00:00',
    reports: 0,
  },
  {
    id: '3',
    type: 'provider',
    content: 'Plaintes répétées sur la qualité du service',
    author: 'Guide Tokyo Pro',
    authorId: 'PRV456',
    targetType: 'guide',
    targetName: 'Guide Tokyo Pro',
    status: 'pending',
    priority: 'high',
    reason: '5 plaintes en 30 jours',
    createdAt: '2024-02-19T15:00:00',
    reports: 5,
  },
  {
    id: '4',
    type: 'content',
    content: 'Photo inappropriée dans la galerie',
    author: 'User456',
    authorId: 'USR456',
    targetType: 'event',
    targetName: 'Festival Tokyo 2024',
    status: 'resolved',
    priority: 'low',
    reason: 'Contenu signalé',
    createdAt: '2024-02-18T14:00:00',
    reports: 2,
    resolution: 'Contenu supprimé',
  },
]

const mockLegalCases = [
  {
    id: '1',
    type: 'gdpr',
    title: 'Demande de suppression de données',
    user: 'Jean Dupont',
    userId: 'USR789',
    status: 'pending',
    priority: 'high',
    createdAt: '2024-02-19T10:00:00',
    deadline: '2024-03-21',
    description: 'L\'utilisateur demande la suppression de toutes ses données personnelles.',
  },
  {
    id: '2',
    type: 'refund_dispute',
    title: 'Litige de remboursement - Vol annulé',
    user: 'Marie Martin',
    userId: 'USR456',
    status: 'investigating',
    priority: 'medium',
    createdAt: '2024-02-18T09:00:00',
    deadline: '2024-02-28',
    description: 'Le client conteste le refus de remboursement pour un vol annulé par la compagnie.',
    amount: 850,
  },
  {
    id: '3',
    type: 'terms_violation',
    title: 'Violation des conditions d\'utilisation',
    user: 'Compte Banni',
    userId: 'USR999',
    status: 'resolved',
    priority: 'high',
    createdAt: '2024-02-15T08:00:00',
    deadline: null,
    description: 'Utilisateur banni pour activité frauduleuse.',
    resolution: 'Compte suspendu définitivement',
  },
]

const mockSecurityAlerts = [
  {
    id: '1',
    type: 'login_attempt',
    severity: 'high',
    message: 'Tentatives de connexion multiples échouées',
    ip: '192.168.1.100',
    location: 'Unknown',
    timestamp: '2024-02-20T10:45:00',
    status: 'new',
    affectedUser: 'admin@tripplanner.com',
  },
  {
    id: '2',
    type: 'api_abuse',
    severity: 'medium',
    message: 'Utilisation anormale de l\'API détectée',
    ip: '10.0.0.50',
    location: 'Tokyo, Japan',
    timestamp: '2024-02-20T09:30:00',
    status: 'investigating',
    affectedUser: 'API Key: xxx123',
  },
  {
    id: '3',
    type: 'data_breach',
    severity: 'critical',
    message: 'Accès non autorisé à des données sensibles',
    ip: '172.16.0.1',
    location: 'Unknown',
    timestamp: '2024-02-20T08:00:00',
    status: 'resolved',
    affectedUser: 'Multiple users',
    resolution: 'Accès bloqué, investigation terminée',
  },
]

const moderationTypeConfig = {
  review: { label: 'Avis', color: 'bg-blue-100 text-blue-700', icon: MessageSquare },
  user: { label: 'Utilisateur', color: 'bg-purple-100 text-purple-700', icon: Users },
  provider: { label: 'Prestataire', color: 'bg-orange-100 text-orange-700', icon: Building2 },
  content: { label: 'Contenu', color: 'bg-pink-100 text-pink-700', icon: FileText },
}

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  investigating: { label: 'En investigation', color: 'bg-blue-100 text-blue-700', icon: Activity },
  resolved: { label: 'Résolu', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  escalated: { label: 'Escaladé', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
}

const severityConfig = {
  low: { label: 'Faible', color: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Moyen', color: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'Élevé', color: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Critique', color: 'bg-red-100 text-red-700' },
}

export function RisksLegalPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<typeof mockModerationItems[0] | null>(null)
  const [showItemDetails, setShowItemDetails] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [activeTab, setActiveTab] = useState<'moderation' | 'legal' | 'security'>('moderation')
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    priority: 'all',
  })

  const filteredItems = mockModerationItems.filter(item => {
    const matchesSearch = item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.targetName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filters.status === 'all' || item.status === filters.status
    const matchesType = filters.type === 'all' || item.type === filters.type
    return matchesSearch && matchesStatus && matchesType
  })

  const totalPages = Math.ceil(filteredItems.length / pageSize)
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleViewItem = (item: typeof mockModerationItems[0]) => {
    setSelectedItem(item)
    setShowItemDetails(true)
  }

  const stats = {
    pendingModeration: mockModerationItems.filter(i => i.status === 'pending').length,
    investigating: mockModerationItems.filter(i => i.status === 'investigating').length,
    legalCases: mockLegalCases.filter(c => c.status === 'pending' || c.status === 'investigating').length,
    securityAlerts: mockSecurityAlerts.filter(a => a.status === 'new').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Risques, Légal & Modération</h1>
          <p className="text-slate-500">Modération, conformité et sécurité de la plateforme</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-200">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.pendingModeration}</p>
                <p className="text-xs text-slate-500">En attente modération</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.investigating}</p>
                <p className="text-xs text-slate-500">En investigation</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Gavel className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.legalCases}</p>
                <p className="text-xs text-slate-500">Cas légaux ouverts</p>
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
                <p className="text-2xl font-bold text-slate-900">{stats.securityAlerts}</p>
                <p className="text-xs text-slate-500">Alertes sécurité</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'moderation'
              ? 'border-[#44DBD4] text-[#44DBD4]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('moderation')}
        >
          Modération
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'legal'
              ? 'border-[#44DBD4] text-[#44DBD4]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('legal')}
        >
          Légal & Conformité
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'security'
              ? 'border-[#44DBD4] text-[#44DBD4]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('security')}
        >
          Sécurité
        </button>
      </div>

      {/* Search and Filters */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Rechercher..."
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
                  <SelectItem value="investigating">En investigation</SelectItem>
                  <SelectItem value="resolved">Résolu</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
                <SelectTrigger className="w-[150px] border-slate-200">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="review">Avis</SelectItem>
                  <SelectItem value="user">Utilisateur</SelectItem>
                  <SelectItem value="provider">Prestataire</SelectItem>
                  <SelectItem value="content">Contenu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Moderation Tab */}
      {activeTab === 'moderation' && (
        <Card className="border-slate-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Type</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Auteur</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Cible</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Raison</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Priorité</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Statut</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedItems.map((item) => {
                    const typeInfo = moderationTypeConfig[item.type as keyof typeof moderationTypeConfig]
                    const statusInfo = statusConfig[item.status as keyof typeof statusConfig]
                    const TypeIcon = typeInfo.icon

                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <Badge className={typeInfo.color}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {typeInfo.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-slate-100">{item.author[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-slate-600">{item.author}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{item.targetName}</td>
                        <td className="px-6 py-4 text-slate-600 max-w-[200px] truncate">{item.reason}</td>
                        <td className="px-6 py-4">
                          <Badge className={severityConfig[item.priority as keyof typeof severityConfig].color}>
                            {severityConfig[item.priority as keyof typeof severityConfig].label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-5 w-5 text-slate-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white">
                              <DropdownMenuItem onClick={() => handleViewItem(item)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-green-600">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approuver
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <XCircle className="h-4 w-4 mr-2" />
                                Rejeter
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-orange-600">
                                <Ban className="h-4 w-4 mr-2" />
                                Suspendre utilisateur
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            
            {filteredItems.length > pageSize && (
              <div className="border-t border-slate-200 p-4">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={filteredItems.length}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={[10, 25, 50]}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Legal Tab */}
      {activeTab === 'legal' && (
        <div className="space-y-4">
          {mockLegalCases.map((case_) => (
            <Card key={case_.id} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      case_.type === 'gdpr' ? 'bg-purple-100' :
                      case_.type === 'refund_dispute' ? 'bg-orange-100' :
                      'bg-red-100'
                    }`}>
                      {case_.type === 'gdpr' && <Lock className="h-5 w-5 text-purple-600" />}
                      {case_.type === 'refund_dispute' && <FileWarning className="h-5 w-5 text-orange-600" />}
                      {case_.type === 'terms_violation' && <Gavel className="h-5 w-5 text-red-600" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900">{case_.title}</span>
                        <Badge className={statusConfig[case_.status as keyof typeof statusConfig].color}>
                          {statusConfig[case_.status as keyof typeof statusConfig].label}
                        </Badge>
                        <Badge className={severityConfig[case_.priority as keyof typeof severityConfig].color}>
                          {severityConfig[case_.priority as keyof typeof severityConfig].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">{case_.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>Utilisateur: <strong className="text-slate-700">{case_.user}</strong></span>
                        <span>Créé: {new Date(case_.createdAt).toLocaleDateString('fr-FR')}</span>
                        {case_.deadline && (
                          <span className="text-orange-600">Échéance: {new Date(case_.deadline).toLocaleDateString('fr-FR')}</span>
                        )}
                        {case_.amount && (
                          <span>Montant: <strong className="text-slate-700">{case_.amount}¥</strong></span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Voir détails</Button>
                    {case_.status !== 'resolved' && (
                      <Button size="sm" className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white">
                        Traiter
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          {mockSecurityAlerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${
              alert.severity === 'critical' ? 'border-l-red-500' :
              alert.severity === 'high' ? 'border-l-orange-500' :
              alert.severity === 'medium' ? 'border-l-yellow-500' :
              'border-l-slate-300'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      alert.severity === 'critical' ? 'bg-red-100' :
                      alert.severity === 'high' ? 'bg-orange-100' :
                      alert.severity === 'medium' ? 'bg-yellow-100' :
                      'bg-slate-100'
                    }`}>
                      <Shield className={`h-5 w-5 ${
                        alert.severity === 'critical' ? 'text-red-600' :
                        alert.severity === 'high' ? 'text-orange-600' :
                        alert.severity === 'medium' ? 'text-yellow-600' :
                        'text-slate-600'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900">{alert.message}</span>
                        <Badge className={severityConfig[alert.severity as keyof typeof severityConfig].color}>
                          {severityConfig[alert.severity as keyof typeof severityConfig].label}
                        </Badge>
                        <Badge className={
                          alert.status === 'new' ? 'bg-red-100 text-red-700' :
                          alert.status === 'investigating' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }>
                          {alert.status === 'new' ? 'Nouveau' : alert.status === 'investigating' ? 'En investigation' : 'Résolu'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>IP: <strong className="text-slate-700">{alert.ip}</strong></span>
                        <span>Localisation: {alert.location}</span>
                        <span>Utilisateur: <strong className="text-slate-700">{alert.affectedUser}</strong></span>
                        <span>{new Date(alert.timestamp).toLocaleString('fr-FR')}</span>
                      </div>
                      {alert.resolution && (
                        <p className="text-sm text-green-600 mt-2">✓ {alert.resolution}</p>
                      )}
                    </div>
                  </div>
                  {alert.status !== 'resolved' && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Investiguer</Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        Résoudre
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Item Details Sheet */}
      <Sheet open={showItemDetails} onOpenChange={setShowItemDetails}>
        <SheetContent className="w-full sm:max-w-lg bg-white overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Détails de l'élément</SheetTitle>
          </SheetHeader>
          
          {selectedItem && (
            <div className="py-6 space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-slate-100">{selectedItem.author[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-slate-900">{selectedItem.author}</p>
                  <p className="text-sm text-slate-500">{selectedItem.authorId}</p>
                </div>
              </div>

              <Separator />

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Type</p>
                  <Badge className={moderationTypeConfig[selectedItem.type as keyof typeof moderationTypeConfig].color}>
                    {moderationTypeConfig[selectedItem.type as keyof typeof moderationTypeConfig].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Cible</p>
                  <p className="text-slate-900">{selectedItem.targetName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Raison</p>
                  <p className="text-slate-900">{selectedItem.reason}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Contenu</p>
                  <p className="text-slate-900 bg-slate-50 p-3 rounded-lg">{selectedItem.content}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Signalements</p>
                    <p className="text-slate-900">{selectedItem.reports}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Priorité</p>
                    <Badge className={severityConfig[selectedItem.priority as keyof typeof severityConfig].color}>
                      {severityConfig[selectedItem.priority as keyof typeof severityConfig].label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Date de création</p>
                  <p className="text-slate-900">{new Date(selectedItem.createdAt).toLocaleString('fr-FR')}</p>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-3">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approuver le contenu
                </Button>
                <Button variant="outline" className="w-full text-red-600 border-red-200">
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeter et supprimer
                </Button>
                <Button variant="outline" className="w-full text-orange-600 border-orange-200">
                  <Ban className="h-4 w-4 mr-2" />
                  Suspendre l'utilisateur
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Contacter l'utilisateur
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
