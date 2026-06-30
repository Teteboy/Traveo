import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check, X, Eye, Search, Loader2, Users, Building2, Calendar, Trash2 } from 'lucide-react'

interface Provider {
  id: string
  companyName: string
  businessType: string
  description: string | null
  isVerified: boolean
  verificationProgress: number
  createdAt: string
  userName: string
  userEmail: string
  user?: {
    firstName: string
    lastName: string
    email: string
    phone: string | null
    country: string
  }
  status?: string
}

interface PaginatedResponse<T> {
  page: number
  limit: number
  total: number
  items: T[]
}

export function ProviderManagementPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified'>('all')
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  // Fetch providers
  const { data, isLoading, error } = useQuery<PaginatedResponse<Provider>>({
    queryKey: ['admin-providers', page, search, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      })
      return apiClient.get(`/admin/providers?${params}`)
    },
    staleTime: 30000,
  })

  // Verify/Approve mutation
  const verifyMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      apiClient.patch(`/admin/providers/${id}/verify`, { action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-providers'] })
      setShowDetailDialog(false)
      setSelectedProvider(null)
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: string }) =>
      apiClient.delete(`/admin/providers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-providers'] })
      setShowDetailDialog(false)
      setSelectedProvider(null)
    },
  })

  const providers = data?.items || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  const handleViewProvider = (provider: Provider) => {
    setSelectedProvider(provider)
    setShowDetailDialog(true)
  }

  const handleVerify = (action: 'approve' | 'reject') => {
    if (!selectedProvider) return
    
    verifyMutation.mutate({
      id: selectedProvider.id,
      action,
    })
  }

  const handleDelete = () => {
    if (!selectedProvider) return
    
    if (confirm('Êtes-vous sûr de vouloir supprimer définitivement cette demande de prestataire ?')) {
      deleteMutation.mutate({
        id: selectedProvider.id,
      })
    }
  }

  const getStatusBadge = (provider: Provider) => {
    if (provider.isVerified) {
      return <Badge className="bg-green-500">Vérifié</Badge>
    }
    if (provider.verificationProgress > 0) {
      return <Badge className="bg-yellow-500">En attente</Badge>
    }
    return <Badge variant="secondary">Incomplet</Badge>
  }

  const getBusinessTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      HOTEL: 'Hôtel',
      RESTAURANT: 'Restaurant',
      GUIDE: 'Guide',
      EVENTS: 'Événements',
      TRANSPORT: 'Transport',
    }
    return labels[type] || type
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Prestataires</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les demandes de compte prestataire et les prestataires vérifiés
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {total} prestataires
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom d'entreprise, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente de vérification</SelectItem>
                <SelectItem value="verified">Vérifiés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Providers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Prestataires</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              Erreur lors du chargement des prestataires
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucun prestataire trouvé
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{provider.companyName}</div>
                          {provider.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                              {provider.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getBusinessTypeLabel(provider.businessType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{provider.userName}</div>
                          <div className="text-sm text-muted-foreground">{provider.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(provider)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(provider.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewProvider(provider)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm('Supprimer définitivement cette demande ?')) {
                                deleteMutation.mutate({ id: provider.id })
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {page} sur {totalPages} ({total} résultats)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Provider Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du Prestataire</DialogTitle>
            <DialogDescription>
              Examinez les informations et gérez la vérification
            </DialogDescription>
          </DialogHeader>

          {selectedProvider && (
            <div className="space-y-6 py-4">
              {/* Company Info */}
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4" />
                  Informations de l'entreprise
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nom:</span>
                    <div className="font-medium mt-1">{selectedProvider.companyName}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <div className="mt-1">{getBusinessTypeLabel(selectedProvider.businessType)}</div>
                  </div>
                  {selectedProvider.description && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Description:</span>
                      <div className="mt-1 text-sm">{selectedProvider.description}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* User Info */}
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4" />
                  Informations du contact
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nom:</span>
                    <div className="font-medium mt-1">{selectedProvider.userName}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <div className="mt-1">{selectedProvider.userEmail}</div>
                  </div>
                  {selectedProvider.user?.phone && (
                    <div>
                      <span className="text-muted-foreground">Téléphone:</span>
                      <div className="mt-1">{selectedProvider.user.phone}</div>
                    </div>
                  )}
                  {selectedProvider.user?.country && (
                    <div>
                      <span className="text-muted-foreground">Pays:</span>
                      <div className="mt-1">{selectedProvider.user.country}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Verification Status */}
              <div>
                <h3 className="font-semibold mb-3">Statut de vérification</h3>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">
                      {selectedProvider.isVerified ? 'Vérifié' : 'Non vérifié'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Progression: {selectedProvider.verificationProgress}%
                    </div>
                  </div>
                  <div>{getStatusBadge(selectedProvider)}</div>
                </div>
              </div>

              {/* Actions */}
              {!selectedProvider.isVerified && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleVerify('reject')}
                    disabled={verifyMutation.isPending}
                  >
                    {verifyMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    Refuser la demande
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleVerify('approve')}
                    disabled={verifyMutation.isPending}
                  >
                    {verifyMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Approuver le prestataire
                  </Button>
                </div>
              )}

              {selectedProvider.isVerified && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg text-green-700">
                    <Check className="h-5 w-5 mr-2" />
                    Ce prestataire est vérifié et actif
                  </div>
                </div>
              )}

              {/* Delete Action - Available for all providers */}
              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending || verifyMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Supprimer définitivement la demande
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Cette action est irréversible et supprimera complètement le profil prestataire.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
