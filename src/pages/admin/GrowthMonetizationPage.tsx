import { useState } from 'react'
import { useAdminAnalytics } from '@/hooks/useAdmin'
import {
  Megaphone,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  DollarSign,
  Star,
  Building2,
  Image,
  Video,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Gift,
  Target,
  BarChart3,
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

// Mock sponsored content
const mockSponsoredContent = [
  {
    id: '1',
    title: 'Découvrez Tokyo - Guide Premium',
    type: 'article',
    sponsor: 'Japan Tourism Board',
    sponsorId: 'SPN001',
    placement: 'home_hero',
    status: 'active',
    startDate: '2024-02-01',
    endDate: '2024-03-31',
    impressions: 125000,
    clicks: 4500,
    ctr: 3.6,
    cost: 5000,
    budget: 10000,
  },
  {
    id: '2',
    title: 'Offre Spéciale Emirates - Paris Dubai',
    type: 'banner',
    sponsor: 'Emirates Airlines',
    sponsorId: 'SPN002',
    placement: 'flights_sidebar',
    status: 'active',
    startDate: '2024-02-15',
    endDate: '2024-04-15',
    impressions: 85000,
    clicks: 2100,
    ctr: 2.5,
    cost: 3500,
    budget: 8000,
  },
  {
    id: '3',
    title: 'Festival Hanami 2024',
    type: 'video',
    sponsor: 'Kyoto Tourism',
    sponsorId: 'SPN003',
    placement: 'discover_feed',
    status: 'pending',
    startDate: '2024-03-01',
    endDate: '2024-04-30',
    impressions: 0,
    clicks: 0,
    ctr: 0,
    cost: 0,
    budget: 12000,
  },
  {
    id: '4',
    title: 'Hôtel Grand Palace Paris',
    type: 'featured',
    sponsor: 'Grand Palace Hotels',
    sponsorId: 'SPN004',
    placement: 'hotels_top',
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2024-02-28',
    impressions: 45000,
    clicks: 890,
    ctr: 2.0,
    cost: 2200,
    budget: 5000,
  },
]

const mockPartnerships = [
  {
    id: '1',
    name: 'Japan Airlines',
    type: 'airline',
    status: 'active',
    tier: 'premium',
    revenue: 125000,
    bookings: 4500,
    commission: 5.5,
    startDate: '2023-01-01',
    contractEnd: '2025-12-31',
    benefits: ['Commission réduite', 'API prioritaire', 'Support dédié'],
  },
  {
    id: '2',
    name: 'Marriott International',
    type: 'hotel_chain',
    status: 'active',
    tier: 'premium',
    revenue: 89000,
    bookings: 2100,
    commission: 12,
    startDate: '2023-03-15',
    contractEnd: '2025-03-14',
    benefits: ['Tarifs préférentiels', 'Programme fidélité', 'Support dédié'],
  },
  {
    id: '3',
    name: 'Tokyo Metro',
    type: 'transport',
    status: 'active',
    tier: 'standard',
    revenue: 15000,
    bookings: 8500,
    commission: 8,
    startDate: '2023-06-01',
    contractEnd: '2024-05-31',
    benefits: ['Intégration billets', 'Promotions communes'],
  },
  {
    id: '4',
    name: 'GetYourGuide',
    type: 'activities',
    status: 'pending',
    tier: 'standard',
    revenue: 0,
    bookings: 0,
    commission: 15,
    startDate: null,
    contractEnd: null,
    benefits: ['Catalogue activités', 'API intégration'],
  },
]

const mockPromotions = [
  {
    id: '1',
    code: 'TOKYO2024',
    description: '20% sur les vols vers Tokyo',
    discount: 20,
    discountType: 'percentage',
    minPurchase: 500,
    maxDiscount: 100,
    usageLimit: 1000,
    usedCount: 456,
    startDate: '2024-02-01',
    endDate: '2024-03-31',
    status: 'active',
    applicableTo: ['flights'],
  },
  {
    id: '2',
    code: 'HOTEL50',
    description: '50¥ de réduction sur les hôtels',
    discount: 50,
    discountType: 'fixed',
    minPurchase: 200,
    maxDiscount: 50,
    usageLimit: 500,
    usedCount: 500,
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    status: 'expired',
    applicableTo: ['hotels'],
  },
  {
    id: '3',
    code: 'NEWUSER',
    description: 'Bienvenue - 15% première réservation',
    discount: 15,
    discountType: 'percentage',
    minPurchase: 100,
    maxDiscount: 50,
    usageLimit: null,
    usedCount: 2340,
    startDate: '2023-01-01',
    endDate: null,
    status: 'active',
    applicableTo: ['flights', 'hotels', 'events', 'guides'],
  },
]

const contentTypeConfig = {
  article: { label: 'Article', color: 'bg-blue-100 text-blue-700', icon: FileText },
  banner: { label: 'Bannière', color: 'bg-purple-100 text-purple-700', icon: Image },
  video: { label: 'Vidéo', color: 'bg-pink-100 text-pink-700', icon: Video },
  featured: { label: 'Mis en avant', color: 'bg-orange-100 text-orange-700', icon: Star },
}

const statusConfig = {
  active: { label: 'Actif', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  expired: { label: 'Expiré', color: 'bg-slate-100 text-slate-600', icon: XCircle },
}

export function GrowthMonetizationPage() {
  const analyticsQuery = useAdminAnalytics()
  const analytics = analyticsQuery.data?.data

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContent, setSelectedContent] = useState<typeof mockSponsoredContent[0] | null>(null)
  const [showContentDetails, setShowContentDetails] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [activeTab, setActiveTab] = useState<'sponsored' | 'partnerships' | 'promotions'>('sponsored')
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
  })

  const filteredContent = mockSponsoredContent.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.sponsor.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filters.status === 'all' || content.status === filters.status
    const matchesType = filters.type === 'all' || content.type === filters.type
    return matchesSearch && matchesStatus && matchesType
  })

  const totalPages = Math.ceil(filteredContent.length / pageSize)
  const paginatedContent = filteredContent.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleViewContent = (content: typeof mockSponsoredContent[0]) => {
    setSelectedContent(content)
    setShowContentDetails(true)
  }

  const stats = {
    activeCampaigns: mockSponsoredContent.filter(c => c.status === 'active').length,
    totalImpressions: mockSponsoredContent.reduce((sum, c) => sum + c.impressions, 0),
    totalClicks: mockSponsoredContent.reduce((sum, c) => sum + c.clicks, 0),
    totalRevenue: mockSponsoredContent.reduce((sum, c) => sum + c.cost, 0),
    activePartners: mockPartnerships.filter(p => p.status === 'active').length,
    activePromos: mockPromotions.filter(p => p.status === 'active').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Croissance & Monétisation</h1>
          <p className="text-slate-500">Gestion des contenus sponsorisés et partenariats</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-200">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle campagne
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.activeCampaigns}</p>
                <p className="text-xs text-slate-500">Campagnes actives</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{(stats.totalImpressions / 1000).toFixed(0)}K</p>
                <p className="text-xs text-slate-500">Impressions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.totalClicks.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Clics</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{(stats.totalRevenue / 1000).toFixed(1)}K¥</p>
                <p className="text-xs text-slate-500">Revenus pub</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.activePartners}</p>
                <p className="text-xs text-slate-500">Partenaires</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-pink-100 flex items-center justify-center">
                <Gift className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.activePromos}</p>
                <p className="text-xs text-slate-500">Promos actives</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'sponsored'
              ? 'border-[#44DBD4] text-[#44DBD4]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('sponsored')}
        >
          Contenus sponsorisés
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'partnerships'
              ? 'border-[#44DBD4] text-[#44DBD4]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('partnerships')}
        >
          Partenariats
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'promotions'
              ? 'border-[#44DBD4] text-[#44DBD4]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('promotions')}
        >
          Promotions
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
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
                <SelectTrigger className="w-[150px] border-slate-200">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="banner">Bannière</SelectItem>
                  <SelectItem value="video">Vidéo</SelectItem>
                  <SelectItem value="featured">Mis en avant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sponsored Content Table */}
      {activeTab === 'sponsored' && (
        <Card className="border-slate-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Contenu</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Sponsor</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Type</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Impressions</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">CTR</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Budget</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Statut</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedContent.map((content) => {
                    const typeInfo = contentTypeConfig[content.type as keyof typeof contentTypeConfig]
                    const statusInfo = statusConfig[content.status as keyof typeof statusConfig]
                    const TypeIcon = typeInfo.icon

                    return (
                      <tr key={content.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">{content.title}</p>
                          <p className="text-xs text-slate-500">{content.placement}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{content.sponsor}</td>
                        <td className="px-6 py-4">
                          <Badge className={typeInfo.color}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {typeInfo.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{content.impressions.toLocaleString()}</td>
                        <td className="px-6 py-4 text-slate-600">{content.ctr}%</td>
                        <td className="px-6 py-4">
                          <div className="text-slate-600">
                            {content.cost} / {content.budget} ¥
                          </div>
                          <div className="h-1.5 w-20 bg-slate-200 rounded-full mt-1">
                            <div 
                              className="h-full bg-[#44DBD4] rounded-full"
                              style={{ width: `${(content.cost / content.budget) * 100}%` }}
                            />
                          </div>
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
                              <DropdownMenuItem onClick={() => handleViewContent(content)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
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
            
            {filteredContent.length > pageSize && (
              <div className="border-t border-slate-200 p-4">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={filteredContent.length}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={[10, 25, 50]}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Partnerships Tab */}
      {activeTab === 'partnerships' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockPartnerships.map((partner) => (
            <Card key={partner.id} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-medium text-slate-900">{partner.name}</p>
                    <p className="text-sm text-slate-500 capitalize">{partner.type.replace('_', ' ')}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={
                      partner.tier === 'premium' ? 'bg-purple-100 text-purple-700' :
                      'bg-slate-100 text-slate-600'
                    }>
                      {partner.tier}
                    </Badge>
                    <Badge className={
                      partner.status === 'active' ? 'bg-green-100 text-green-700' :
                      'bg-yellow-100 text-yellow-700'
                    }>
                      {partner.status === 'active' ? 'Actif' : 'En attente'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-2 bg-slate-50 rounded">
                    <p className="text-lg font-semibold text-slate-900">{(partner.revenue / 1000).toFixed(0)}K¥</p>
                    <p className="text-xs text-slate-500">Revenus</p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 rounded">
                    <p className="text-lg font-semibold text-slate-900">{partner.bookings}</p>
                    <p className="text-xs text-slate-500">Réservations</p>
                  </div>
                  <div className="text-center p-2 bg-slate-50 rounded">
                    <p className="text-lg font-semibold text-slate-900">{partner.commission}%</p>
                    <p className="text-xs text-slate-500">Commission</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Avantages</p>
                  <div className="flex flex-wrap gap-1">
                    {partner.benefits.map((benefit) => (
                      <Badge key={benefit} variant="outline" className="text-xs border-slate-200">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>

                {partner.startDate && (
                  <div className="text-xs text-slate-500 mb-4">
                    Contrat: {new Date(partner.startDate).toLocaleDateString('fr-FR')} - {partner.contractEnd ? new Date(partner.contractEnd).toLocaleDateString('fr-FR') : 'En cours'}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Voir contrat
                  </Button>
                  <Button size="sm" className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white">
                    Gérer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Promotions Tab */}
      {activeTab === 'promotions' && (
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Codes promotionnels</CardTitle>
            <Button size="sm" className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau code
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Code</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Description</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Réduction</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Utilisations</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Validité</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Statut</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {mockPromotions.map((promo) => (
                    <tr key={promo.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono font-medium text-[#44DBD4]">{promo.code}</td>
                      <td className="px-6 py-4 text-slate-600">{promo.description}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="border-green-200 text-green-700">
                          {promo.discountType === 'percentage' ? `${promo.discount}%` : `${promo.discount}¥`}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {promo.usedCount}{promo.usageLimit ? ` / ${promo.usageLimit}` : ''}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {new Date(promo.startDate).toLocaleDateString('fr-FR')} - {promo.endDate ? new Date(promo.endDate).toLocaleDateString('fr-FR') : 'Illimitée'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={statusConfig[promo.status as keyof typeof statusConfig].color}>
                          {statusConfig[promo.status as keyof typeof statusConfig].label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Details Sheet */}
      <Sheet open={showContentDetails} onOpenChange={setShowContentDetails}>
        <SheetContent className="w-full sm:max-w-lg bg-white overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Détails de la campagne</SheetTitle>
          </SheetHeader>
          
          {selectedContent && (
            <div className="py-6 space-y-6">
              {/* Header */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{selectedContent.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={contentTypeConfig[selectedContent.type as keyof typeof contentTypeConfig].color}>
                    {contentTypeConfig[selectedContent.type as keyof typeof contentTypeConfig].label}
                  </Badge>
                  <Badge className={statusConfig[selectedContent.status as keyof typeof statusConfig].color}>
                    {statusConfig[selectedContent.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-slate-900">{selectedContent.impressions.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">Impressions</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-slate-900">{selectedContent.clicks.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">Clics</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-slate-900">{selectedContent.ctr}%</p>
                  <p className="text-xs text-slate-500">Taux de clic</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-slate-900">{selectedContent.cost}¥</p>
                  <p className="text-xs text-slate-500">Dépense</p>
                </div>
              </div>

              <Separator />

              {/* Details */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Sponsor</span>
                  <span className="text-slate-900">{selectedContent.sponsor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Placement</span>
                  <span className="text-slate-900">{selectedContent.placement}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Budget total</span>
                  <span className="text-slate-900">{selectedContent.budget}¥</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date début</span>
                  <span className="text-slate-900">{new Date(selectedContent.startDate).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date fin</span>
                  <span className="text-slate-900">{new Date(selectedContent.endDate).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              {/* Budget Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Budget consommé</span>
                  <span className="text-slate-900">{((selectedContent.cost / selectedContent.budget) * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full">
                  <div 
                    className="h-full bg-[#44DBD4] rounded-full"
                    style={{ width: `${(selectedContent.cost / selectedContent.budget) * 100}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
                <Button className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Statistiques
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}