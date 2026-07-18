import { useState } from 'react'
import { RotateCcw, Clock, CheckCircle, XCircle, ChevronRight, Filter, Plus, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import { cn } from '@/lib/utils'
import { useRefundRequests, useCreateRefund } from '@/hooks/useWallet'
import { formatPrice } from '@/lib/formatters'


const statusConfig = {
  pending: {
    label: 'En attente',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    description: 'Votre demande est en cours d\'examen'
  },
  processing: {
    label: 'En traitement',
    icon: RotateCcw,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    description: 'Votre remboursement est en cours de traitement'
  },
  approved: {
    label: 'Approuvé',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-700 border-green-200',
    description: 'Votre remboursement a été approuvé'
  },
  rejected: {
    label: 'Rejeté',
    icon: XCircle,
    color: 'bg-red-100 text-red-700 border-red-200',
    description: 'Votre demande a été rejetée'
  },
  completed: {
    label: 'Complété',
    icon: CheckCircle,
    color: 'bg-primary/10 text-primary border-primary/20',
    description: 'Le remboursement a été effectué'
  }
}

export function RefundManagement() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showNewRefundDialog, setShowNewRefundDialog] = useState(false)
  const [newRefund, setNewRefund] = useState({
    bookingId: '',
    bookingType: 'flight',
    amount: '',
    reason: ''
  })

  // Fetch refunds from backend
  const { data: refundsData, isLoading, error } = useRefundRequests({ status: selectedStatus === 'all' ? undefined : selectedStatus })
  const createRefund = useCreateRefund()

  const refunds = refundsData?.items ?? []
  const totalRefunds = refundsData?.total ?? 0

  const getBookingTypeLabel = (type: string) => {
    switch (type) {
      case 'flight': return 'Vol'
      case 'hotel': return 'Hôtel'
      case 'event': return 'Événement'
      case 'transfer': return 'Transfert'
      default: return type
    }
  }

  const totalPending = refunds
    .filter(r => r.status === 'pending' || r.status === 'processing')
    .reduce((sum, r) => sum + r.amount, 0)

  const handleSubmitRefund = async () => {
    if (!newRefund.bookingId || !newRefund.amount || !newRefund.reason) return

    try {
      await createRefund.mutateAsync({
        bookingId: newRefund.bookingId,
        amount: parseFloat(newRefund.amount),
        reason: newRefund.reason,
      })

      setShowNewRefundDialog(false)
      setNewRefund({ bookingId: '', bookingType: 'flight', amount: '', reason: '' })
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  // Calculate monthly refunded amount
  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  const monthlyRefunded = refunds
    .filter(r => r.status === 'completed' && r.completedDate)
    .filter(r => {
      const completedDate = new Date(r.completedDate!)
      return completedDate.getMonth() === thisMonth && completedDate.getFullYear() === thisYear
    })
    .reduce((sum, r) => sum + r.amount, 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-xl font-bold">
                  {isLoading ? '...' : formatPrice(totalPending, 'XAF')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remboursé ce mois</p>
                <p className="text-xl font-bold">
                  {isLoading ? '...' : formatPrice(monthlyRefunded, 'XAF')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <RotateCcw className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Demandes totales</p>
                <p className="text-xl font-bold">{isLoading ? '...' : totalRefunds}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive text-sm">{error.message}</p>
        </div>
      )}

      {/* Refunds List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-primary" />
              Demandes de remboursement
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  className="text-sm border rounded-md px-2 py-1"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="processing">En traitement</option>
                  <option value="approved">Approuvé</option>
                  <option value="completed">Complété</option>
                  <option value="rejected">Rejeté</option>
                </select>
              </div>
              <Button size="sm" onClick={() => setShowNewRefundDialog(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Nouvelle demande
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 rounded-lg border">
                  <div className="animate-pulse">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-6 w-16 bg-muted rounded" />
                      <div className="h-6 w-20 bg-muted rounded" />
                    </div>
                    <div className="h-6 w-24 bg-muted rounded mb-2" />
                    <div className="h-4 w-full bg-muted rounded mb-2" />
                    <div className="h-3 w-48 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : refunds.length === 0 ? (
            <div className="text-center py-12">
              <RotateCcw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune demande de remboursement</p>
            </div>
          ) : (
            <div className="space-y-4">
              {refunds.map((refund) => {
                const config = statusConfig[refund.status as keyof typeof statusConfig]
                const StatusIcon = config.icon

                return (
                  <div
                    key={refund.id}
                    className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{getBookingTypeLabel(refund.bookingType)}</Badge>
                          <Badge className={cn("border", config.color)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>

                        <p className="font-semibold text-lg mb-1">
                          {formatPrice(refund.amount, refund.currency)}
                        </p>

                        <p className="text-sm text-muted-foreground mb-2">
                          {refund.reason}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Réservation: {refund.bookingId.slice(0, 8).toUpperCase()}</span>
                          <span>•</span>
                          <span>Demandé le {refund.requestDate}</span>
                        </div>

                        {refund.status === 'processing' && refund.estimatedDate && (
                          <div className="mt-3 p-2 bg-blue-50 rounded-md text-sm text-blue-700">
                            <Clock className="h-4 w-4 inline mr-1" />
                            Date estimée: {refund.estimatedDate}
                          </div>
                        )}

                        {refund.status === 'completed' && refund.completedDate && (
                          <div className="mt-3 p-2 bg-green-50 rounded-md text-sm text-green-700">
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            Effectué le {refund.completedDate}
                          </div>
                        )}
                      </div>

                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Refund Request Dialog */}
      <Dialog open={showNewRefundDialog} onOpenChange={setShowNewRefundDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle demande de remboursement</DialogTitle>
            <DialogDescription>
              Soumettez une demande de remboursement pour une réservation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Numéro de réservation</label>
              <Input
                placeholder="Ex: BK001"
                value={newRefund.bookingId}
                onChange={(e) => setNewRefund(prev => ({ ...prev, bookingId: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type de réservation</label>
              <Select 
                value={newRefund.bookingType}
                onValueChange={(value) => setNewRefund(prev => ({ ...prev, bookingType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flight">Vol</SelectItem>
                  <SelectItem value="hotel">Hôtel</SelectItem>
                  <SelectItem value="event">Événement</SelectItem>
                  <SelectItem value="transfer">Transfert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Montant (FCFA)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={newRefund.amount}
                onChange={(e) => setNewRefund(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Raison</label>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm min-h-[80px]"
                placeholder="Expliquez la raison de votre demande..."
                value={newRefund.reason}
                onChange={(e) => setNewRefund(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowNewRefundDialog(false)}>
              Annuler
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmitRefund}
              disabled={createRefund.isPending || !newRefund.bookingId || !newRefund.amount || !newRefund.reason}
            >
              {createRefund.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Soumettre
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
