import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DollarSign, Clock, Wallet, Plus, Eye } from 'lucide-react'
import { apiClient } from '@/lib/apiClient'
import { formatPrice } from '@/lib/formatters'
import { toast } from 'sonner'

type PayoutRequest = {
  id: string
  amount: number
  currency: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED'
  requestedAt: string
  processedAt: string | null
  rejectionReason: string | null
}

type PayoutsResponse = {
  page: number
  limit: number
  total: number
  items: PayoutRequest[]
}

type EarningsResponse = {
  data: {
    totalRevenue: number
    pendingPayments: number
    currency: string
  }
}

export function ProviderPayoutsPage() {
  const qc = useQueryClient()
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [requestForm, setRequestForm] = useState({ amount: '', bankName: '', accountNumber: '', accountHolder: '' })
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const payoutsQuery = useQuery<PayoutsResponse>({
    queryKey: ['provider-payouts'],
    queryFn: () => apiClient.get<PayoutsResponse>('/providers/payouts'),
  })

  const earningsQuery = useQuery<EarningsResponse>({
    queryKey: ['provider-earnings'],
    queryFn: () => apiClient.get<EarningsResponse>('/providers/earnings'),
  })

  const requestMutation = useMutation({
    mutationFn: (data: { amount: number; bankDetails: Record<string, string> }) =>
      apiClient.post('/providers/payouts/request', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider-payouts'] })
      qc.invalidateQueries({ queryKey: ['provider-earnings'] })
      setShowRequestDialog(false)
      setRequestForm({ amount: '', bankName: '', accountNumber: '', accountHolder: '' })
      toast.success('Demande de paiement soumise')
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Échec de la demande'),
  })

  const payouts = payoutsQuery.data?.items ?? []
  const earnings = earningsQuery.data?.data
  const availableBalance = earnings?.totalRevenue ?? 0

  const pendingPayouts = payouts.filter(p => p.status === 'PENDING' || p.status === 'PROCESSING')
  const pendingAmount = pendingPayouts.reduce((sum, p) => sum + p.amount, 0)
  const availableForPayout = availableBalance - pendingAmount

  const handleRequestPayout = () => {
    const amount = Number(requestForm.amount)
    if (!amount || amount <= 0) return toast.error('Montant invalide')
    if (amount > availableForPayout) return toast.error(`Solde insuffisant. Disponible: ${formatPrice(availableForPayout, 'XAF')}`)
    if (!requestForm.bankName || !requestForm.accountNumber || !requestForm.accountHolder) {
      return toast.error('Veuillez remplir tous les champs bancaires')
    }

    requestMutation.mutate({
      amount,
      bankDetails: {
        bankName: requestForm.bankName,
        accountNumber: requestForm.accountNumber,
        accountHolder: requestForm.accountHolder,
      },
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
    return { style: styles[status] || 'bg-slate-100 text-slate-700', label: labels[status] || status }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Paiements & Revenus</h1>
          <p className="text-slate-500 mt-1">Gérez vos demandes de paiement et suivez vos revenus</p>
        </div>
        <Button
          onClick={() => setShowRequestDialog(true)}
          className="bg-[#44DBD4] hover:bg-[#3bc9c2]"
          disabled={availableForPayout <= 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Demander un paiement
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Revenu total</h3>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold mb-2">{formatPrice(availableBalance, 'XAF')}</p>
            <p className="text-sm text-slate-500">Revenus confirmés</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Paiements en attente</h3>
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-600 mb-2">{formatPrice(pendingAmount, 'XAF')}</p>
            <p className="text-sm text-slate-500">{pendingPayouts.length} demande(s)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Disponible pour retrait</h3>
              <Wallet className="h-5 w-5 text-[#44DBD4]" />
            </div>
            <p className="text-2xl font-bold mb-2">{formatPrice(availableForPayout, 'XAF')}</p>
            <p className="text-sm text-slate-600">Solde disponible</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des paiements</CardTitle>
        </CardHeader>
        <CardContent>
          {payoutsQuery.isLoading ? (
            <div className="text-center py-8 text-slate-500">Chargement...</div>
          ) : payouts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">Aucune demande de paiement</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Montant</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Statut</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Notes</th>
                    <th className="text-center py-3 px-4 font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => {
                    const { style, label } = getStatusBadge(payout.status)
                    return (
                      <tr key={payout.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4 text-sm">
                          {new Date(payout.requestedAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3 px-4 font-medium">{formatPrice(payout.amount, payout.currency)}</td>
                        <td className="py-3 px-4">
                          <Badge className={style}>{label}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {payout.rejectionReason || (payout.processedAt ? `Traité le ${new Date(payout.processedAt).toLocaleDateString('fr-FR')}` : '-')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Voir les détails"
                            onClick={() => {
                              setSelectedPayout(payout)
                              setShowDetailsDialog(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demander un paiement</DialogTitle>
            <DialogDescription>
              Soumettez une demande de retrait de vos revenus
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="amount">Montant (XAF)</Label>
              <Input
                id="amount"
                type="number"
                value={requestForm.amount}
                onChange={(e) => setRequestForm({ ...requestForm, amount: e.target.value })}
                placeholder="50000"
                max={availableForPayout}
              />
              <p className="text-xs text-slate-500 mt-1">Maximum disponible: {formatPrice(availableForPayout, 'XAF')}</p>
            </div>
            <div>
              <Label htmlFor="bankName">Nom de la banque</Label>
              <Input
                id="bankName"
                value={requestForm.bankName}
                onChange={(e) => setRequestForm({ ...requestForm, bankName: e.target.value })}
                placeholder="Ex: MTN Cameroon, Orange Money, Société Générale"
              />
            </div>
            <div>
              <Label htmlFor="accountNumber">Numéro de compte</Label>
              <Input
                id="accountNumber"
                value={requestForm.accountNumber}
                onChange={(e) => setRequestForm({ ...requestForm, accountNumber: e.target.value })}
                placeholder="Ex: 600123456789"
              />
            </div>
            <div>
              <Label htmlFor="accountHolder">Titulaire du compte</Label>
              <Input
                id="accountHolder"
                value={requestForm.accountHolder}
                onChange={(e) => setRequestForm({ ...requestForm, accountHolder: e.target.value })}
                placeholder="Votre nom complet"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>Annuler</Button>
            <Button
              onClick={handleRequestPayout}
              className="bg-[#44DBD4] hover:bg-[#3bc9c2]"
              disabled={requestMutation.isPending}
            >
              {requestMutation.isPending ? 'Traitement...' : 'Soumettre la demande'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payout Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Détails du paiement</DialogTitle>
            <DialogDescription>
              Informations complètes sur cette demande de paiement
            </DialogDescription>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-4 py-4">
              <div className="pb-4 border-b">
                <p className="text-sm text-slate-500">Montant demandé</p>
                <p className="text-2xl font-bold">{formatPrice(selectedPayout.amount, selectedPayout.currency)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-slate-500">Date de demande</p>
                  <p className="font-medium">{new Date(selectedPayout.requestedAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Statut</p>
                  <Badge className={getStatusBadge(selectedPayout.status).style}>
                    {getStatusBadge(selectedPayout.status).label}
                  </Badge>
                </div>
              </div>

              {selectedPayout.processedAt && (
                <div className="pb-4 border-b">
                  <p className="text-sm text-slate-500">Date de traitement</p>
                  <p className="font-medium">{new Date(selectedPayout.processedAt).toLocaleDateString('fr-FR')}</p>
                </div>
              )}

              {selectedPayout.rejectionReason && (
                <div className="pb-4 border-b">
                  <p className="text-sm text-slate-500">Raison du rejet</p>
                  <p className="font-medium text-red-600">{selectedPayout.rejectionReason}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-slate-500 mb-2">ID de demande</p>
                <p className="text-xs font-mono bg-slate-100 p-2 rounded">{selectedPayout.id}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
