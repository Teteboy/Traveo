import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Crown, Check, X, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useProviderAuthStore } from '@/stores/providerAuthStore'
import { apiClient } from '@/lib/apiClient'
import { formatPrice } from '@/lib/formatters'
import type { ProviderBookingStatus } from '@/types/provider'

type ProviderBookingsResponse = {
  page: number
  limit: number
  total: number
  items: Array<{
    id: string
    status: string
    totalAmount: number
    currency: string
    createdAt: string
    metadata?: Record<string, unknown> | null
    guestName: string
    serviceName: string
  }>
}

type BookingRow = {
  id: string
  guestName: string
  guestInitials: string
  serviceName: string
  checkIn: string
  checkOut: string
  guests: number
  status: ProviderBookingStatus
  totalPrice: number
  currency: string
  isVIP: boolean
}

export function ProviderBookingsPage() {
  const { currentServiceType, provider } = useProviderAuthStore()
  const isVerified = provider?.isVerified ?? false
  const qc = useQueryClient()

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all')

  const { data, isLoading, isError } = useQuery<ProviderBookingsResponse>({
    queryKey: ['provider-bookings', statusFilter],
    queryFn: () =>
      apiClient.get<ProviderBookingsResponse>(
        `/providers/bookings?limit=50${statusFilter === 'all' ? '' : `&status=${statusFilter}`}`
      ),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' }) =>
      apiClient.patch(`/providers/bookings/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider-bookings'] })
      toast.success('Statut mis à jour')
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Échec de la mise à jour'),
  })

  const bookings: BookingRow[] = (data?.items ?? []).map((item) => {
    const fullName = item.guestName || 'Guest'
    const initials = fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() ?? '')
      .join('')

    const metadata = (item.metadata ?? {}) as Record<string, unknown>
    const checkInDate =
      typeof metadata.checkInDate === 'string'
        ? metadata.checkInDate
        : typeof metadata.startDate === 'string'
          ? metadata.startDate
          : item.createdAt
    const checkOutDate =
      typeof metadata.checkOutDate === 'string'
        ? metadata.checkOutDate
        : typeof metadata.endDate === 'string'
          ? metadata.endDate
          : checkInDate
    const guests =
      typeof metadata.guests === 'number'
        ? metadata.guests
        : typeof metadata.passengers === 'number'
          ? metadata.passengers
          : 1

    const rawStatus = item.status.toLowerCase()
    const mappedStatus: ProviderBookingStatus =
      rawStatus === 'completed'
        ? 'checkedout'
        : rawStatus === 'pending_payment'
          ? 'pending'
          : rawStatus === 'confirmed' || rawStatus === 'pending' || rawStatus === 'cancelled'
            ? rawStatus
            : 'pending'

    return {
      id: item.id,
      guestName: fullName,
      guestInitials: initials || 'GU',
      serviceName: item.serviceName,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      status: mappedStatus,
      totalPrice: item.totalAmount,
      currency: item.currency || 'XAF',
      isVIP: guests >= 4,
    }
  })

  const getStatusBadge = (status: ProviderBookingStatus) => {
    const styles: Record<ProviderBookingStatus, string> = {
      confirmed: 'bg-blue-100 text-blue-700',
      checkedin: 'bg-green-100 text-green-700',
      checkedout: 'bg-slate-100 text-slate-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
    }
    return styles[status] || 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="space-y-6">
      {!isVerified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
          Votre compte n’est pas encore vérifié. Vous ne pouvez pas accepter de nouvelles réservations tant que la vérification n’est pas terminée.
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Réservations</h1>
          <p className="text-slate-500 mt-1">Gérez vos réservations et leur statut</p>
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ProviderBookingStatus | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="checkedin">Checked In</SelectItem>
            <SelectItem value="checkedout">Checked Out</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left py-4 px-6 font-medium text-slate-600">Guest</th>
                  <th className="text-left py-4 px-6 font-medium text-slate-600">Service</th>
                  <th className="text-left py-4 px-6 font-medium text-slate-600">Check-in</th>
                  <th className="text-left py-4 px-6 font-medium text-slate-600">Check-out</th>
                  <th className="text-left py-4 px-6 font-medium text-slate-600">Guests</th>
                  <th className="text-left py-4 px-6 font-medium text-slate-600">Status</th>
                  <th className="text-right py-4 px-6 font-medium text-slate-600">Total</th>
                  <th className="text-right py-4 px-6 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td className="py-6 px-6 text-slate-500" colSpan={8}>Loading bookings...</td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td className="py-6 px-6 text-red-600" colSpan={8}>Failed to load bookings</td>
                  </tr>
                )}
                {!isLoading && !isError && bookings.length === 0 && (
                  <tr>
                    <td className="py-6 px-6 text-slate-500" colSpan={8}>No bookings found</td>
                  </tr>
                )}
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-[#44DBD4] text-white">
                            {booking.guestInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {booking.guestName}
                            {booking.isVIP && <Crown className="h-4 w-4 text-[#FC960E]" />}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium">{booking.serviceName}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm">{new Date(booking.checkIn).toLocaleDateString()}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm">{new Date(booking.checkOut).toLocaleDateString()}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm">{booking.guests}</p>
                    </td>
                    <td className="py-4 px-6">
                      <Badge className={getStatusBadge(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <p className="font-semibold">{formatPrice(booking.totalPrice, booking.currency)}</p>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {booking.status === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-blue-600" 
                            title={isVerified ? "Confirmer" : "Vérification requise"} 
                            disabled={!isVerified || statusMutation.isPending} 
                            onClick={() => statusMutation.mutate({ id: booking.id, status: 'CONFIRMED' })}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {booking.status === 'confirmed' && (
                          <Button size="sm" variant="ghost" className="text-green-600" title="Marquer comme terminée" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate({ id: booking.id, status: 'COMPLETED' })}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <Button size="sm" variant="ghost" className="text-red-600" title="Annuler" disabled={statusMutation.isPending} onClick={() => { if (confirm('Annuler cette réservation ?')) statusMutation.mutate({ id: booking.id, status: 'CANCELLED' }) }}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
