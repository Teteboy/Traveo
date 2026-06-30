import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  DialogFooter,
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
import { Wallet, Check, X, Loader2, Search, Clock, CheckCircle, XCircle } from 'lucide-react'
import { apiClient } from '@/lib/apiClient'
import { formatPrice } from '@/lib/formatters'

type PayoutRequest = {
  id: string
  amount: number
  currency: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED'
  requestedAt: string
  processedAt: string | null
  rejectionReason: string | null
  providerName: string
  providerEmail: string
  bankDetails: any
}

type PaginatedResponse<T> = {
  page: number
  limit: number
  total: number
  items: T[]
}

export function AdminPayoutsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'rejected'>('all')
  const [search, setSearch] = useState('')
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null)
  const [showProcessDialog, setShowProcessDialog] = useState(false)
  const [processAction, setProcessAction] = useState<'PROCESSING' | 'COMPLETED' | 'REJECTED' | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const { data, isLoading, error } = useQuery<PaginatedResponse<PayoutRequest>>({
    queryKey: ['admin-payouts', page, statusFilter, search],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(search && { search }),
      })
      return apiClient.get(`/admin/payouts?${params}`)
    },
    staleTime: 30000,
  })

  const processMutation = useMutation({
    mutationFn: ({ id, status, rejectionReason }: { id: string; status: string; rejectionReason?: string }) =>
      apiClient.patch(`/admin/payouts/${id}`, { status, rejectionReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] })
      setShowProcessDialog(false)
      setSelectedPayout(null)
      setRejectionReason('')
      setProcessAction(null)
    },
  })

  const payouts = data?.items || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  const handleProcessPayout = (payout: PayoutRequest, action: 'PROCESSING' | 'COMPLETED' | 'REJECTED') => {
    setSelectedPayout(payout)
    setProcessAction(action)
    setShowProcessDialog(true)
  }

  const handleSubmitProcess = () => {
    if (!selectedPayout || !processAction) return
    if (processAction === 'REJECTED' && !rejectionReason.trim()) {
      alert('Veuillez fournir une raison pour le rejet')
      return
    }
    processMutation.mutate({
      id: selectedPayout.id,
      status: processAction,
      rejectionReason: processAction === 'REJECTED' ? rejectionReason : undefined,
    })
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      PROCESSING: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
    }
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      PROCESSING: 'En cours',
      COMPLETED: 'Payé',
      REJECTED: 'Rejeté',
    }
    const icons: Record<string, any> = {
      PENDING: Clock,
      PROCESSING: Loader2,
      COMPLETED: CheckCircle,
      REJECTED: XCircle,
    }
    const Icon = icons[status] || Clock
    return { style: styles[status] || 'bg-slate-100 text-slate-700', label: labels[status] || status, Icon }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Paiements</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les demandes de paiement des prestataires
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Wallet className="h-3 w-3" />
            {total} demandes
          </Badge>
        </div>
      </div>

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
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="processing">En cours</SelectItem>
                <SelectItem value="completed">Payés</SelectItem>
                <SelectItem value="rejected">Rejetés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Demandes de Paiement</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              Erreur lors du chargement des demandes de paiement
            </div>
          ) : payouts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucune demande de paiement trouvée
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Prestataire</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Détails bancaires</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => {
                    const { style, label, Icon } = getStatusBadge(payout.status)
                    return (
                      <TableRow key={payout.id}>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(payout.requestedAt).toLocaleDateString('fr-FR')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payout.providerName}</div>
                            <div className="text-sm text-muted-foreground">{payout.providerEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{formatPrice(payout.amount, payout.currency)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{payout.bankDetails?.bankName || '-'}</div>
                            <div className="text-muted-foreground">{payout.bankDetails?.accountNumber || '-'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={style}>
                            <Icon className="h-3 w-3 mr-1" />
                            {label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {payout.status === 'PENDING' && (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() => handleProcessPayout(payout, 'PROCESSING')}
                              >
                                <Loader2 className="h-4 w-4 mr-1" />
                                Traiter
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleProcessPayout(payout, 'COMPLETED')}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Payer
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleProcessPayout(payout, 'REJECTED')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {payout.status === 'PROCESSING' && (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleProcessPayout(payout, 'COMPLETED')}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Marquer payé
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleProcessPayout(payout, 'REJECTED')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {payout.status === 'COMPLETED' && (
                            <span className="text-sm text-green-600">Payé le {payout.processedAt ? new Date(payout.processedAt).toLocaleDateString('fr-FR') : '-'}</span>
                          )}
                          {payout.status === 'REJECTED' && (
                            <span className="text-sm text-red-600">{payout.rejectionReason || 'Rejeté'}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

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

      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {processAction === 'PROCESSING' && 'Marquer comme en cours de traitement'}
              {processAction === 'COMPLETED' && 'Confirmer le paiement'}
              {processAction === 'REJECTED' && 'Rejeter la demande'}
            </DialogTitle>
            <DialogDescription>
              {selectedPayout && (
                <span>
                  Demande de {formatPrice(selectedPayout.amount, selectedPayout.currency)} par {selectedPayout.providerName}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {processAction === 'REJECTED' && (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Raison du rejet</label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Expliquez pourquoi cette demande est rejetée..."
                  rows={3}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProcessDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmitProcess}
              disabled={processMutation.isPending || (processAction === 'REJECTED' && !rejectionReason.trim())}
              className={processAction === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' : processAction === 'COMPLETED' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
            >
              {processMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : processAction === 'PROCESSING' ? (
                'Marquer en cours'
              ) : processAction === 'COMPLETED' ? (
                'Confirmer paiement'
              ) : (
                'Rejeter'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
