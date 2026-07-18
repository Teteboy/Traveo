import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Banknote, Clock, TrendingUp, Receipt, Wallet, Eye } from 'lucide-react'
import { apiClient } from '@/lib/apiClient'
import { formatPrice } from '@/lib/formatters'

type ProviderEarningsResponse = {
  data: {
    totalRevenue: number
    pendingPayments: number
    avgBookingValue: number
    commissionFees: number
    currency: string
  }
}

type ProviderBookingsResponse = {
  items: Array<{
    id: string
    serviceName: string
    guestName: string
    createdAt: string
    totalAmount: number
    currency: string
    status: string
    metadata?: Record<string, unknown> | null
  }>
}

type EarningItem = {
  id: string
  serviceName: string
  guestName: string
  createdAt: string
  totalAmount: number
  currency: string
  status: string
  metadata?: Record<string, unknown> | null
}

export function ProviderEarningsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('this-month')
  const [selectedEarning, setSelectedEarning] = useState<EarningItem | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const periods = [
    { id: 'this-month', label: 'This Month' },
    { id: 'last-month', label: 'Last Month' },
    { id: 'last-3-months', label: 'Last 3 Months' },
    { id: 'custom', label: 'Custom' },
  ]

  const earningsQuery = useQuery<ProviderEarningsResponse>({
    queryKey: ['provider-earnings'],
    queryFn: () => apiClient.get<ProviderEarningsResponse>('/providers/earnings'),
  })

  const breakdownQuery = useQuery<ProviderBookingsResponse>({
    queryKey: ['provider-earnings-breakdown', selectedPeriod],
    queryFn: () => apiClient.get<ProviderBookingsResponse>('/providers/bookings?limit=20'),
  })

  const totals = earningsQuery.data?.data
  const currency = totals?.currency ?? 'XAF'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Revenue & Earnings</h1>
          <p className="text-slate-500 mt-1">Track your financial performance</p>
        </div>
        <div className="flex gap-2">
          {periods.map((period) => (
            <Button
              key={period.id}
              variant={selectedPeriod === period.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period.id)}
              className={selectedPeriod === period.id ? 'bg-[#44DBD4] hover:bg-[#3bc9c2]' : ''}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Total Revenue</h3>
              <Banknote className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold mb-2">{formatPrice(totals?.totalRevenue ?? 0, currency)}</p>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>Live backend data</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Current totals</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Pending Payments</h3>
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-600 mb-2">{formatPrice(totals?.pendingPayments ?? 0, currency)}</p>
            <p className="text-sm text-slate-600">Awaiting settlement</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Avg. Booking Value</h3>
              <TrendingUp className="h-5 w-5 text-[#44DBD4]" />
            </div>
            <p className="text-2xl font-bold mb-2">{formatPrice(totals?.avgBookingValue ?? 0, currency)}</p>
            <p className="text-sm text-slate-600">Per booking</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Commission Fees</h3>
              <Receipt className="h-5 w-5 text-slate-600" />
            </div>
            <p className="text-2xl font-bold mb-2">{formatPrice(totals?.commissionFees ?? 0, currency)}</p>
            <p className="text-sm text-slate-600">Platform fee</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Revenue Breakdown</CardTitle>
          <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2]" disabled>
            <Wallet className="h-4 w-4 mr-2" />
            Request Payout
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Service</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Guest</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Date</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600">Amount</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600">Commission</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-600">Net</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-600">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {breakdownQuery.isLoading && (
                  <tr>
                    <td className="py-6 px-4 text-slate-500" colSpan={8}>Loading revenue breakdown...</td>
                  </tr>
                )}
                {breakdownQuery.isError && (
                  <tr>
                    <td className="py-6 px-4 text-red-600" colSpan={8}>Failed to load revenue breakdown</td>
                  </tr>
                )}
                {!breakdownQuery.isLoading && !breakdownQuery.isError && (breakdownQuery.data?.items?.length ?? 0) === 0 && (
                  <tr>
                    <td className="py-6 px-4 text-slate-500" colSpan={8}>No booking revenue yet</td>
                  </tr>
                )}
                {(breakdownQuery.data?.items ?? []).map((item) => {
                  const commission = item.totalAmount * 0.1
                  const net = item.totalAmount - commission
                  const normalizedStatus = item.status.toLowerCase()
                  const paid = normalizedStatus === 'confirmed' || normalizedStatus === 'completed'
                  return (
                    <tr key={item.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{item.serviceName}</td>
                      <td className="py-3 px-4">{item.guestName}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">{formatPrice(item.totalAmount, item.currency || currency)}</td>
                      <td className="py-3 px-4 text-right text-red-600">-{formatPrice(commission, item.currency || currency)}</td>
                      <td className="py-3 px-4 text-right font-semibold">{formatPrice(net, item.currency || currency)}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                          {paid ? 'paid' : 'pending'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Voir les détails"
                          onClick={() => {
                            setSelectedEarning(item)
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
        </CardContent>
      </Card>

      {/* Earning Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Détails du revenu</DialogTitle>
            <DialogDescription>
              Informations complètes sur cette transaction
            </DialogDescription>
          </DialogHeader>
          {selectedEarning && (
            <div className="space-y-4 py-4">
              <div className="pb-4 border-b">
                <p className="text-sm text-slate-500">Service</p>
                <p className="font-medium">{selectedEarning.serviceName}</p>
              </div>

              <div className="pb-4 border-b">
                <p className="text-sm text-slate-500">Client</p>
                <p className="font-medium">{selectedEarning.guestName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-slate-500">Date</p>
                  <p className="font-medium">{new Date(selectedEarning.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Statut</p>
                  <Badge className={
                    (selectedEarning.status.toLowerCase() === 'confirmed' || selectedEarning.status.toLowerCase() === 'completed')
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }>
                    {selectedEarning.status.toLowerCase() === 'confirmed' || selectedEarning.status.toLowerCase() === 'completed' ? 'paid' : 'pending'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 pb-4 border-b">
                <div className="flex justify-between">
                  <p className="text-sm text-slate-500">Montant total</p>
                  <p className="font-medium">{formatPrice(selectedEarning.totalAmount, selectedEarning.currency || currency)}</p>
                </div>
                <div className="flex justify-between text-red-600">
                  <p className="text-sm">Commission (10%)</p>
                  <p className="font-medium">-{formatPrice(selectedEarning.totalAmount * 0.1, selectedEarning.currency || currency)}</p>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <p>Net</p>
                  <p>{formatPrice(selectedEarning.totalAmount * 0.9, selectedEarning.currency || currency)}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-slate-500 mb-2">ID de transaction</p>
                <p className="text-xs font-mono bg-slate-100 p-2 rounded">{selectedEarning.id}</p>
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
