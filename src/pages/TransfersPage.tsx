import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, Users, ArrowRight, Check, Loader2, Car } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { formatPrice } from '@/lib/formatters'
import { useTransfers, useBookTransfer } from '@/hooks/useServices'
import { usePayWithWallet } from '@/hooks/useWallet'
import { adaptTransfer } from '@/lib/adapters'
import { toast } from 'sonner'

export function TransfersPage() {
  const navigate = useNavigate()
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<ReturnType<typeof adaptTransfer> | null>(null)
  const [isBookingComplete, setIsBookingComplete] = useState(false)
  const [bookingReference, setBookingReference] = useState('')
  const [bookingForm, setBookingForm] = useState({
    date: undefined as Date | undefined, time: '09:00', passengers: '1',
    pickupAddress: '', dropoffAddress: '', contactName: '', contactPhone: '', contactEmail: '',
  })

  const { data, isLoading } = useTransfers({ page: 1, limit: 20 })
  const bookTransfer = useBookTransfer()
  const payWithWallet = usePayWithWallet()

  const transfers = (data?.items ?? []).map(item => adaptTransfer(item as unknown as import('@/lib/adapters').ApiServiceItem))

  const handleOpenBooking = (t: ReturnType<typeof adaptTransfer>) => {
    setSelectedTransfer(t)
    setBookingForm(p => ({ ...p, pickupAddress: t.from, dropoffAddress: t.to }))
    setIsBookingDialogOpen(true)
    setIsBookingComplete(false)
  }

  const handleConfirmBooking = async () => {
    if (!bookingForm.date || !bookingForm.contactName || !bookingForm.contactPhone || !selectedTransfer) return
    try {
      const res = await bookTransfer.mutateAsync({
        id: selectedTransfer.id,
        startDate: bookingForm.date.toISOString(),
        guests: parseInt(bookingForm.passengers),
        paymentMethod: 'wallet',
      })
      try {
        await payWithWallet.mutateAsync({ bookingId: res.bookingId })
      } catch (payErr: unknown) {
        toast.error(payErr instanceof Error ? payErr.message : 'Échec du paiement portefeuille')
        return
      }
      setBookingReference(res.bookingId)
      setIsBookingComplete(true)
      toast.success('Transfert réservé et payé via votre portefeuille.')
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Erreur') }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-gradient-to-br from-[#44DBD4] via-[#44DBD4] to-[#3bc9c2] py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Transferts & Transports</h1>
          <p className="text-white/90 mb-8">Réservez vos transferts et moyens de transport</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">Options disponibles</h2>
          <p className="text-muted-foreground">{isLoading ? '...' : `${transfers.length} résultats`}</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <Card key={i} className="overflow-hidden"><div className="md:flex"><Skeleton className="md:w-2/5 h-48" /><div className="md:w-3/5 p-6 space-y-3"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></div></div></Card>)}
          </div>
        ) : transfers.length === 0 ? (
          <Card className="p-8 text-center"><Car className="h-16 w-16 text-slate-300 mx-auto mb-4" /><h3 className="text-xl font-semibold text-slate-700 mb-2">Aucun transfert disponible</h3></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {transfers.map(t => (
              <Card key={t.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="md:flex">
                  <div className="md:w-2/5 h-48 md:h-auto">
                    <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="md:w-3/5">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="text-lg">{t.name}</CardTitle>
                        <Badge variant="secondary">Transfert</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{t.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="line-clamp-1">{t.from} → {t.to}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1"><Clock className="h-4 w-4 text-muted-foreground" /><span>{t.duration}</span></div>
                        <div className="flex items-center gap-1"><Users className="h-4 w-4 text-muted-foreground" /><span>{t.capacity} pers.</span></div>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-2xl font-bold text-[#44DBD4]">{formatPrice(t.price, t.currency)}</span>
                        <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => handleOpenBooking(t)}>
                          Réserver <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-lg bg-white overflow-y-auto">
          {!isBookingComplete ? (
            <>
              <DialogHeader>
                <DialogTitle>Réserver un transfert</DialogTitle>
                <DialogDescription>Complétez les informations ci-dessous</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date *</label>
                    <DatePicker date={bookingForm.date} onDateChange={d => setBookingForm(p => ({ ...p, date: d }))} placeholder="Sélectionner" minDate={new Date()} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Passagers</label>
                    <Select value={bookingForm.passengers} onValueChange={v => setBookingForm(p => ({ ...p, passengers: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{[1,2,3,4,5,6,7,8].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Adresse de prise en charge *</label>
                  <Input placeholder="Adresse complète" value={bookingForm.pickupAddress}
                    onChange={e => setBookingForm(p => ({ ...p, pickupAddress: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom complet *</label>
                  <Input placeholder="Votre nom" value={bookingForm.contactName}
                    onChange={e => setBookingForm(p => ({ ...p, contactName: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Téléphone *</label>
                  <Input placeholder="+237..." value={bookingForm.contactPhone}
                    onChange={e => setBookingForm(p => ({ ...p, contactPhone: e.target.value }))} />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)} disabled={bookTransfer.isPending}>Annuler</Button>
                <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={handleConfirmBooking}
                  disabled={bookTransfer.isPending || !bookingForm.date || !bookingForm.contactName || !bookingForm.contactPhone}>
                  {bookTransfer.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Réservation...</> : <>Confirmer <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-8 text-center">
              <div className="w-20 h-20 bg-[#44DBD4]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-[#44DBD4]" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Réservation confirmée!</h2>
              <div className="bg-[#44DBD4]/5 rounded-lg p-4 my-4">
                <p className="text-sm text-slate-600 mb-1">Référence</p>
                <p className="text-xl font-bold text-[#44DBD4]">{bookingReference.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>Fermer</Button>
                <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => navigate('/my-trips')}>Voir mes réservations</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
