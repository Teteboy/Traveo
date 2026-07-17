import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { apiClient } from '@/lib/apiClient'
import { toast } from 'sonner'

type SponsoredContent = {
  id: string
  title: string
  type: string
  sponsor: string
  sponsorId: string
  placement: string
  status: string
  startDate: string
  endDate: string
  impressions: number
  clicks: number
  budget: number
  cost: number
  ctr: number
  imageUrl?: string
  videoUrl?: string
  contentUrl?: string
}

type Partnership = {
  id: string
  name: string
  type: string
  status: string
  tier: string
  revenue: number
  bookings: number
  commission: number
  startDate?: string
  contractEnd?: string
  benefits: string[]
  contactEmail?: string
  contactPhone?: string
  logoUrl?: string
}

type Promotion = {
  id: string
  code: string
  description: string
  discount: number
  discountType: string
  minPurchase: number
  maxDiscount?: number
  usageLimit?: number
  usedCount: number
  startDate: string
  endDate?: string
  status: string
  applicableTo: string[]
}

type PaginatedResponse<T> = {
  page: number
  limit: number
  total: number
  items: T[]
}

const contentTypeConfig = {
  article: { label: 'Article', color: 'bg-blue-100 text-blue-700', icon: FileText },
  banner: { label: 'Bannière', color: 'bg-purple-100 text-purple-700', icon: Image },
  video: { label: 'Vidéo', color: 'bg-pink-100 text-pink-700', icon: Video },
  featured: { label: 'Mis en avant', color: 'bg-orange-100 text-orange-700', icon: Star },
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: 'Brouillon', color: 'bg-slate-100 text-slate-600', icon: Clock },
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  active: { label: 'Actif', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  paused: { label: 'En pause', color: 'bg-orange-100 text-orange-700', icon: Clock },
  completed: { label: 'Terminé', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  expired: { label: 'Expiré', color: 'bg-slate-100 text-slate-600', icon: XCircle },
  disabled: { label: 'Désactivé', color: 'bg-slate-100 text-slate-600', icon: XCircle },
  investigating: { label: 'En investigation', color: 'bg-blue-100 text-blue-700', icon: Clock },
  resolved: { label: 'Résolu', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  escalated: { label: 'Escaladé', color: 'bg-red-100 text-red-700', icon: XCircle },
}

export function GrowthMonetizationPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContent, setSelectedContent] = useState<SponsoredContent | null>(null)
  const [showContentDetails, setShowContentDetails] = useState(false)
  const [showAddContent, setShowAddContent] = useState(false)
  const [showAddPartnership, setShowAddPartnership] = useState(false)
  const [showAddPromotion, setShowAddPromotion] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [activeTab, setActiveTab] = useState<'sponsored' | 'partnerships' | 'promotions'>('sponsored')
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
  })

  const [contentForm, setContentForm] = useState({
    title: '',
    type: 'banner' as 'article' | 'banner' | 'video' | 'featured',
    sponsor: '',
    sponsorId: '',
    placement: 'homepage',
    status: 'draft' as 'draft' | 'pending' | 'active' | 'paused',
    startDate: '',
    endDate: '',
    budget: 0,
    imageUrl: '',
    videoUrl: '',
    contentUrl: '',
  })

  const [partnershipForm, setPartnershipForm] = useState({
    name: '',
    type: 'affiliate' as 'affiliate' | 'corporate' | 'strategic',
    status: 'pending' as 'pending' | 'active' | 'suspended',
    tier: 'bronze' as 'bronze' | 'silver' | 'gold' | 'platinum',
    revenue: 0,
    commission: 10,
    contactEmail: '',
    contactPhone: '',
    benefits: [] as string[],
  })

  const [promotionForm, setPromotionForm] = useState({
    code: '',
    description: '',
    discount: 0,
    discountType: 'percentage' as 'percentage' | 'fixed',
    minPurchase: 0,
    maxDiscount: 0,
    usageLimit: 100,
    startDate: '',
    endDate: '',
    status: 'draft' as 'draft' | 'active' | 'expired' | 'disabled',
    applicableTo: [] as string[],
  })

  // Sponsored content query
  const { data: sponsoredData, isLoading: sponsoredLoading } = useQuery<PaginatedResponse<SponsoredContent>>({
    queryKey: ['admin-sponsored-content', currentPage, pageSize, filters.status, filters.type, searchQuery],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(pageSize),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(searchQuery && { search: searchQuery }),
      })
      return apiClient.get(`/admin/sponsored-content?${params}`)
    },
    staleTime: 30000,
  })

  // Partnerships query
  const { data: partnershipsData, isLoading: partnershipsLoading } = useQuery<PaginatedResponse<Partnership>>({
    queryKey: ['admin-partnerships', currentPage, pageSize, filters.status, filters.type, searchQuery],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(pageSize),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(searchQuery && { search: searchQuery }),
      })
      return apiClient.get(`/admin/partnerships?${params}`)
    },
    staleTime: 30000,
  })

  // Promotions query
  const { data: promotionsData, isLoading: promotionsLoading } = useQuery<PaginatedResponse<Promotion>>({
    queryKey: ['admin-promotions', currentPage, pageSize, filters.status, searchQuery],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(pageSize),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(searchQuery && { search: searchQuery }),
      })
      return apiClient.get(`/admin/promotions?${params}`)
    },
    staleTime: 30000,
  })

  // Delete mutations
  const deleteSponsoredMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/sponsored-content/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-sponsored-content'] }),
  })

  const deletePartnershipMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/partnerships/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-partnerships'] }),
  })

  const deletePromotionMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/promotions/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-promotions'] }),
  })

  // Create mutations
  const createSponsoredMutation = useMutation({
    mutationFn: (data: typeof contentForm) => apiClient.post('/admin/sponsored-content', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sponsored-content'] })
      setShowAddContent(false)
      setContentForm({
        title: '',
        type: 'banner',
        sponsor: '',
        sponsorId: '',
        placement: 'homepage',
        status: 'draft',
        startDate: '',
        endDate: '',
        budget: 0,
        imageUrl: '',
        videoUrl: '',
        contentUrl: '',
      })
      toast.success('Contenu sponsorisé créé avec succès')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création')
    },
  })

  const createPartnershipMutation = useMutation({
    mutationFn: (data: typeof partnershipForm) => apiClient.post('/admin/partnerships', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partnerships'] })
      setShowAddPartnership(false)
      setPartnershipForm({
        name: '',
        type: 'affiliate',
        status: 'pending',
        tier: 'bronze',
        revenue: 0,
        commission: 10,
        contactEmail: '',
        contactPhone: '',
        benefits: [],
      })
      toast.success('Partenariat créé avec succès')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création')
    },
  })

  const createPromotionMutation = useMutation({
    mutationFn: (data: typeof promotionForm) => apiClient.post('/admin/promotions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] })
      setShowAddPromotion(false)
      setPromotionForm({
        code: '',
        description: '',
        discount: 0,
        discountType: 'percentage',
        minPurchase: 0,
        maxDiscount: 0,
        usageLimit: 100,
        startDate: '',
        endDate: '',
        status: 'draft',
        applicableTo: [],
      })
      toast.success('Promotion créée avec succès')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création')
    },
  })

  const sponsoredContent = (sponsoredData?.items || []).map(c => ({
    ...c,
    ctr: c.impressions ? Math.round((c.clicks / c.impressions) * 1000) / 10 : 0,
  }))
  const partnerships = partnershipsData?.items || []
  const promotions = promotionsData?.items || []
  const total = activeTab === 'sponsored' ? sponsoredData?.total || 0 : activeTab === 'partnerships' ? partnershipsData?.total || 0 : promotionsData?.total || 0
  const totalPages = Math.ceil(total / pageSize)
  const isLoading = activeTab === 'sponsored' ? sponsoredLoading : activeTab === 'partnerships' ? partnershipsLoading : promotionsLoading

  const handleViewContent = (content: SponsoredContent) => {
    setSelectedContent(content)
    setShowContentDetails(true)
  }

  const stats = {
    activeCampaigns: sponsoredContent.filter(c => c.status === 'active').length,
    totalImpressions: sponsoredContent.reduce((sum, c) => sum + c.impressions, 0),
    totalClicks: sponsoredContent.reduce((sum, c) => sum + c.clicks, 0),
    totalRevenue: sponsoredContent.reduce((sum, c) => sum + c.cost, 0),
    activePartners: partnerships.filter(p => p.status === 'active').length,
    activePromos: promotions.filter(p => p.status === 'active').length,
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
          <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => {
            if (activeTab === 'sponsored') setShowAddContent(true)
            else if (activeTab === 'partnerships') setShowAddPartnership(true)
            else if (activeTab === 'promotions') setShowAddPromotion(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            {activeTab === 'sponsored' ? 'Nouveau contenu' : activeTab === 'partnerships' ? 'Nouveau partenariat' : 'Nouvelle promotion'}
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                      </td>
                    </tr>
                  ) : sponsoredContent.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                        Aucun contenu sponsorisé
                      </td>
                    </tr>
                  ) : sponsoredContent.map((content) => {
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
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => deleteSponsoredMutation.mutate(content.id)}
                              >
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
            
            {total > pageSize && (
              <div className="border-t border-slate-200 p-4">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={total}
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
          {isLoading ? (
            <div className="col-span-2 flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : partnerships.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-slate-500">
              Aucun partenariat
            </div>
          ) : partnerships.map((partner) => (
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
                  <Button 
                    size="sm" 
                    className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
                    onClick={() => deletePartnershipMutation.mutate(partner.id)}
                  >
                    Supprimer
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                      </td>
                    </tr>
                  ) : promotions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                        Aucune promotion
                      </td>
                    </tr>
                  ) : promotions.map((promo) => (
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
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deletePromotionMutation.mutate(promo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Add Sponsored Content Sheet */}
      <Sheet open={showAddContent} onOpenChange={setShowAddContent}>
        <SheetContent className="w-full sm:max-w-md bg-white overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nouveau contenu sponsorisé</SheetTitle>
            <SheetDescription>Créez une nouvelle campagne publicitaire</SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input id="title" value={contentForm.title} onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })} placeholder="Nom de la campagne" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={contentForm.type} onValueChange={(v: any) => setContentForm({ ...contentForm, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="banner">Bannière</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="video">Vidéo</SelectItem>
                  <SelectItem value="featured">Mis en avant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sponsor">Sponsor</Label>
              <Input id="sponsor" value={contentForm.sponsor} onChange={(e) => setContentForm({ ...contentForm, sponsor: e.target.value })} placeholder="Nom du sponsor" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="placement">Placement</Label>
              <Select value={contentForm.placement} onValueChange={(v) => setContentForm({ ...contentForm, placement: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="homepage">Page d'accueil</SelectItem>
                  <SelectItem value="search">Résultats de recherche</SelectItem>
                  <SelectItem value="sidebar">Barre latérale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début</Label>
                <Input id="startDate" type="date" value={contentForm.startDate} onChange={(e) => setContentForm({ ...contentForm, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin</Label>
                <Input id="endDate" type="date" value={contentForm.endDate} onChange={(e) => setContentForm({ ...contentForm, endDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (¥)</Label>
              <Input id="budget" type="number" value={contentForm.budget} onChange={(e) => setContentForm({ ...contentForm, budget: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL de l'image</Label>
              <Input id="imageUrl" value={contentForm.imageUrl} onChange={(e) => setContentForm({ ...contentForm, imageUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={contentForm.status} onValueChange={(v: any) => setContentForm({ ...contentForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="paused">En pause</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowAddContent(false)}>Annuler</Button>
            <Button className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2]" onClick={() => createSponsoredMutation.mutate(contentForm)} disabled={createSponsoredMutation.isPending}>
              {createSponsoredMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Créer
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Partnership Sheet */}
      <Sheet open={showAddPartnership} onOpenChange={setShowAddPartnership}>
        <SheetContent className="w-full sm:max-w-md bg-white overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nouveau partenariat</SheetTitle>
            <SheetDescription>Créez un nouveau partenariat commercial</SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du partenaire</Label>
              <Input id="name" value={partnershipForm.name} onChange={(e) => setPartnershipForm({ ...partnershipForm, name: e.target.value })} placeholder="Nom de l'entreprise" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type de partenariat</Label>
              <Select value={partnershipForm.type} onValueChange={(v: any) => setPartnershipForm({ ...partnershipForm, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="affiliate">Affiliation</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="strategic">Stratégique</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tier">Niveau</Label>
              <Select value={partnershipForm.tier} onValueChange={(v: any) => setPartnershipForm({ ...partnershipForm, tier: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="silver">Argent</SelectItem>
                  <SelectItem value="gold">Or</SelectItem>
                  <SelectItem value="platinum">Platine</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="commission">Commission (%)</Label>
              <Input id="commission" type="number" value={partnershipForm.commission} onChange={(e) => setPartnershipForm({ ...partnershipForm, commission: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email de contact</Label>
              <Input id="contactEmail" type="email" value={partnershipForm.contactEmail} onChange={(e) => setPartnershipForm({ ...partnershipForm, contactEmail: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Téléphone</Label>
              <Input id="contactPhone" value={partnershipForm.contactPhone} onChange={(e) => setPartnershipForm({ ...partnershipForm, contactPhone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={partnershipForm.status} onValueChange={(v: any) => setPartnershipForm({ ...partnershipForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="suspended">Suspendu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowAddPartnership(false)}>Annuler</Button>
            <Button className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2]" onClick={() => createPartnershipMutation.mutate(partnershipForm)} disabled={createPartnershipMutation.isPending}>
              {createPartnershipMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Créer
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Promotion Sheet */}
      <Sheet open={showAddPromotion} onOpenChange={setShowAddPromotion}>
        <SheetContent className="w-full sm:max-w-md bg-white overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nouvelle promotion</SheetTitle>
            <SheetDescription>Créez un nouveau code de promotion</SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" value={promotionForm.code} onChange={(e) => setPromotionForm({ ...promotionForm, code: e.target.value.toUpperCase() })} placeholder="PROMO2024" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={promotionForm.description} onChange={(e) => setPromotionForm({ ...promotionForm, description: e.target.value })} placeholder="Description de la promotion" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Type de réduction</Label>
                <Select value={promotionForm.discountType} onValueChange={(v: any) => setPromotionForm({ ...promotionForm, discountType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Pourcentage</SelectItem>
                    <SelectItem value="fixed">Montant fixe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Réduction</Label>
                <Input id="discount" type="number" value={promotionForm.discount} onChange={(e) => setPromotionForm({ ...promotionForm, discount: Number(e.target.value) })} placeholder={promotionForm.discountType === 'percentage' ? '10' : '1000'} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minPurchase">Achat minimum</Label>
                <Input id="minPurchase" type="number" value={promotionForm.minPurchase} onChange={(e) => setPromotionForm({ ...promotionForm, minPurchase: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usageLimit">Limite d'utilisation</Label>
                <Input id="usageLimit" type="number" value={promotionForm.usageLimit} onChange={(e) => setPromotionForm({ ...promotionForm, usageLimit: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début</Label>
                <Input id="startDate" type="date" value={promotionForm.startDate} onChange={(e) => setPromotionForm({ ...promotionForm, startDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin</Label>
                <Input id="endDate" type="date" value={promotionForm.endDate} onChange={(e) => setPromotionForm({ ...promotionForm, endDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select value={promotionForm.status} onValueChange={(v: any) => setPromotionForm({ ...promotionForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                  <SelectItem value="disabled">Désactivé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowAddPromotion(false)}>Annuler</Button>
            <Button className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2]" onClick={() => createPromotionMutation.mutate(promotionForm)} disabled={createPromotionMutation.isPending}>
              {createPromotionMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Créer
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}