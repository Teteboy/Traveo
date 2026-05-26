import { useState, useEffect } from 'react'
import { Plane, MapPin, Download, Share2, QrCode, Building, Bus, Ticket, Clock, Plus, Loader2, AlertCircle, RefreshCcw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import { formatDate, formatPrice } from '@/lib/formatters'
import { EticketCard } from '@/components/booking/EticketCard'
import { useBookings, useCancelBooking, useBookingTicket, useUpdateBooking } from '@/hooks/useBookings'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

function getTypeIcon(type: string) {
  switch (type) {
    case 'flight': return <Plane className="h-5 w-5" />
    case 'hotel': return <Building className="h-5 w-5" />
    case 'events': return <Ticket className="h-5 w-5" />
    default: return <Bus className="h-5 w-5" />
  }
}

function getTypeLabel(type: string) {
  const map: Record<string, string> = { flight: 'Vol', hotel: 'HÃ´tel', guide: 'Guide', restaurant: 'Restaurant', transport: 'Transfert', events: 'Ã‰vÃ©nement' }
  return map[type] ?? type
}

function getTypeColor(type: string) {
  const map: Record<string, string> = {
    flight: 'bg-purple-100 text-purple-600',
    hotel: 'bg-orange-100 text-orange-600',
    events: 'bg-green-100 text-green-600',
    transport: 'bg-blue-100 text-blue-600',
    guide: 'bg-teal-100 text-teal-600',
    restaurant: 'bg-red-100 text-red-600',
  }
  return map[type] ?? 'bg-slate-100 text-slate-600'
}

export function MyTripsPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [showQR, setShowQR] = useState(false)
  const [page] = useState(1)
  const [limit] = useState(20)

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connectez-vous pour voir vos voyages</h2>
        <p className="text-muted-foreground mb-6">Gérez vos réservations et billets électroniques en vous connectant.</p>
        <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => navigate('/login')}>
          Se connecter
        </Button>
      </div>
    )
  }

  // Only call hooks when authenticated
  const { data, isLoading, error, refetch } = useBookings({ limit, page })
  const cancelBooking = useCancelBooking()
  const updateBooking = useUpdateBooking()

  // booking ticket query runs when selectedBookingId is set
  const bookingTicketQuery = useBookingTicket(selectedBookingId ?? '', !!selectedBookingId)

  const openTicket = (id: string) => {
    setSelectedBookingId(id)
    // ensure ticket query runs
    // useBookingTicket will run because enabled depends on selectedBookingId
    setShowQR(true)
  }

  // Handle ticket query errors
  useEffect(() => {
    if (bookingTicketQuery.error && showQR) {
      toast.error('Le ticket n\'est pas disponible pour ce billet. Le billet doit être confirmé.')
    }
  }, [bookingTicketQuery.error, showQR])

  // Show error state if bookings fail to load
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Erreur de chargement</h2>
        <p className="text-muted-foreground mb-6">{error.message}</p>
        <Button onClick={() => refetch()} className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </div>
    )
  }

  // Show loading state while fetching bookings
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="flex items-center justify-center mb-8">
          <Skeleton className="h-8 w-48" />
        </div>
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </TabsList>
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Tabs>
      </div>
    )
  }

  const bookings = data?.items ?? []
  const upcoming = bookings.filter(b => ['pending', 'pending_payment', 'confirmed'].includes(b.status))
  const past = bookings.filter(b => b.status === 'completed')
  const cancelled = bookings.filter(b => b.status === 'cancelled')
  const selectedBooking = bookings.find(b => b.id === selectedBookingId)
  const totalBookings = data?.total ?? bookings.length

  const handleCancel = async (id: string) => {
    try {
      await cancelBooking.mutateAsync(id)
      toast.success('Réservation annulée')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de l\'annulation')
    }
  }

  const handleConfirm = async (id: string) => {
    try {
      await updateBooking.mutateAsync({ id, status: 'confirmed' })
      toast.success('Réservation confirmée')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la confirmation')
    }
  }

  // Stats
  const flightCount = bookings.filter(b => b.serviceType === 'flight').length
  const hotelCount = bookings.filter(b => b.serviceType === 'hotel').length
  const eventCount = bookings.filter(b => b.serviceType === 'events').length
  const otherCount = bookings.filter(b => !['flight', 'hotel', 'events'].includes(b.serviceType)).length

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mes Voyages</h1>
        <p className="text-muted-foreground">GÃ©rez vos rÃ©servations et billets Ã©lectroniques</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { count: flightCount, label: 'Vols', icon: <Plane className="h-5 w-5 text-purple-600" />, bg: 'bg-purple-100' },
          { count: hotelCount, label: 'HÃ´tels', icon: <Building className="h-5 w-5 text-orange-600" />, bg: 'bg-orange-100' },
          { count: eventCount, label: 'Ã‰vÃ©nements', icon: <Ticket className="h-5 w-5 text-green-600" />, bg: 'bg-green-100' },
          { count: otherCount, label: 'Autres', icon: <Bus className="h-5 w-5 text-blue-600" />, bg: 'bg-blue-100' },
        ].map(({ count, label, icon, bg }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${bg} rounded-lg`}>{icon}</div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? 'â€“' : count}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Ã€ venir {upcoming.length > 0 && <Badge variant="secondary" className="ml-2">{upcoming.length}</Badge>}</TabsTrigger>
          <TabsTrigger value="tickets">E-Billets</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        {/* Upcoming */}
        <TabsContent value="upcoming" className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
          ) : upcoming.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">Aucun voyage Ã  venir</h3>
                <p className="text-muted-foreground mb-4">Commencez Ã  planifier votre prochaine aventure</p>
                <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => navigate('/')}>Explorer les destinations</Button>
              </CardContent>
            </Card>
          ) : (
            upcoming.map((booking) => (
              <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${getTypeColor(booking.serviceType)}`}>
                      {getTypeIcon(booking.serviceType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">{getTypeLabel(booking.serviceType)}</Badge>
                        <Badge className={booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                          {booking.status === 'confirmed' ? 'ConfirmÃ©' : booking.status === 'pending_payment' ? 'En attente de paiement' : 'En attente'}
                        </Badge>
                      </div>
                      <p className="font-semibold mt-1">{booking.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(booking.createdAt)} Â· {formatPrice(booking.total.amount / 100, booking.total.currency)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {booking.status === 'confirmed' && (
                        <Button variant="outline" size="sm" onClick={() => openTicket(booking.id)}>
                          <QrCode className="h-4 w-4" />
                        </Button>
                      )}
                      {['pending', 'pending_payment'].includes(booking.status) && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                            onClick={() => handleConfirm(booking.id)}
                            disabled={updateBooking.isPending}
                          >
                            {updateBooking.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmer'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancelBooking.isPending}
                          >
                            {cancelBooking.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Annuler'}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
      {/* New Trip CTA */}
           <Card className="border-dashed">
             <CardContent className="py-8 text-center">
               <Plus className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
               <h3 className="font-semibold mb-2">Planifier un nouveau voyage</h3>
               <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => navigate('/') }>
                 <Plus className="h-4 w-4 mr-2" />Explorer
               </Button>
             </CardContent>
           </Card>

           {/* Pagination for bookings */}
           {totalBookings > limit && (
             <div className="flex items-center justify-between mt-6">
               <div className="text-sm text-slate-500">Page {page} sur {Math.ceil(totalBookings / limit)}</div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowQR(false)}>Fermer</Button>
            {bookingTicketQuery.data?.data?.qrPayload && (
              <Button variant="outline" className="flex-1" onClick={() => {
                if (bookingTicketQuery.data?.data?.qrPayload) {
                  // download QR as PNG
                  const canvas = document.createElement('canvas')
                  const size = 220
                  canvas.width = size
                  canvas.height = size
                  const ctx = canvas.getContext('2d')!
                  const img = new Image()
                  img.onload = () => {
                    ctx.drawImage(img, 0, 0)
                    const a = document.createElement('a')
                    a.href = canvas.toDataURL('image/png')
                    a.download = `${selectedBookingId}-ticket.png`
                    a.click()
                  }
                  img.crossOrigin = 'anonymous'
                  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(bookingTicketQuery.data.data.qrPayload)}`
                }
              }}><Download className="h-4 w-4 mr-2" />Télécharger</Button>
            )}
          </div>
             </div>
           )}
        </TabsContent>

        {/* E-Tickets */}
        <TabsContent value="tickets" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
            </div>
          ) : upcoming.filter(b => b.status === 'confirmed').length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Aucun e-billet disponible</p></CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcoming.filter(b => b.status === 'confirmed').map((b) => (
                <EticketCard
                  key={b.id}
                  booking={{
                    id: b.id,
                    type: (b as any).serviceType as 'flight' | 'hotel' | 'event' | 'transfer',
                    status: 'confirmed',
                    bookingDate: b.createdAt,
                    details: (b as any).metadata ?? {},
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="space-y-4">
          <Tabs defaultValue="past">
            <TabsList className="mb-4">
              <TabsTrigger value="past">TerminÃ©s ({past.length})</TabsTrigger>
              <TabsTrigger value="cancelled">AnnulÃ©s ({cancelled.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="past" className="space-y-3">
              {past.length === 0 ? (
                <Card><CardContent className="py-12 text-center"><Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Aucun voyage terminÃ©</p></CardContent></Card>
              ) : past.map((b) => (
                <Card key={b.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${getTypeColor(b.serviceType)}`}>{getTypeIcon(b.serviceType)}</div>
                      <div className="flex-1">
                        <Badge variant="outline">{getTypeLabel(b.serviceType)}</Badge>
                        <p className="font-semibold mt-1">{b.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(b.createdAt)} Â· {formatPrice(b.total.amount / 100, b.total.currency)}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">TerminÃ©</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="cancelled" className="space-y-3">
              {cancelled.length === 0 ? (
                <Card><CardContent className="py-12 text-center"><Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Aucune rÃ©servation annulÃ©e</p></CardContent></Card>
              ) : cancelled.map((b) => (
                <Card key={b.id} className="hover:shadow-md transition-shadow opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${getTypeColor(b.serviceType)}`}>{getTypeIcon(b.serviceType)}</div>
                      <div className="flex-1">
                        <Badge variant="outline">{getTypeLabel(b.serviceType)}</Badge>
                        <p className="font-semibold mt-1">{b.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(b.createdAt)} Â· {formatPrice(b.total.amount / 100, b.total.currency)}</p>
                      </div>
                      <Badge variant="destructive">AnnulÃ©</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>E-Ticket – QR Code</DialogTitle>
              <DialogDescription>Présentez ce QR code lors de votre enregistrement</DialogDescription>
            </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {bookingTicketQuery.isLoading ? (
              <div className="py-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#44DBD4]" />
                <p className="text-muted-foreground">Chargement du ticket...</p>
              </div>
            ) : selectedBookingId && bookingTicketQuery.data?.data?.qrPayload ? (
              <>
                <div className="p-4 bg-white rounded-lg shadow-inner">
                  <QRCode value={bookingTicketQuery.data.data.qrPayload} size={220} level="H" />
                </div>
                <div className="text-center">
                  <p className="font-mono text-sm text-muted-foreground">{selectedBookingId}</p>
                  <Badge className="mt-2 bg-[#44DBD4] text-white">
                    {getTypeLabel(selectedBooking?.serviceType ?? '')}
                  </Badge>
                </div>
              </>
            ) : (
              <div className="py-8">
                <p className="text-muted-foreground">
                  {bookingTicketQuery.error
                    ? "Erreur lors du chargement du ticket"
                    : "Le ticket n'est pas disponible pour ce billet."
                  }
                </p>
                {bookingTicketQuery.error && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Le billet doit être confirmé pour générer un ticket.
                  </p>
                )}
                {!bookingTicketQuery.error && !bookingTicketQuery.isLoading && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Assurez-vous que votre réservation est confirmée.
                  </p>
                )}
              </div>
            )}
          </div>
            <div className="flex gap-2">
              {bookingTicketQuery.data?.data?.qrPayload ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      if (bookingTicketQuery.data?.data?.qrPayload) {
                        // download QR as PNG
                        const canvas = document.createElement('canvas')
                        const size = 220
                        canvas.width = size
                        canvas.height = size
                        const ctx = canvas.getContext('2d')!
                        const img = new Image()
                        img.onload = () => {
                          ctx.drawImage(img, 0, 0)
                          const a = document.createElement('a')
                          a.href = canvas.toDataURL('image/png')
                          a.download = `${selectedBookingId}-ticket.png`
                          a.click()
                        }
                        img.crossOrigin = 'anonymous'
                        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(bookingTicketQuery.data.data.qrPayload)}`
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>

                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      if (bookingTicketQuery.data?.data?.qrPayload) {
                        const url = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(bookingTicketQuery.data.data.qrPayload)}`
                        navigator.share?.({ title: 'E-Ticket', text: selectedBookingId ?? '', url })
                      }
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                </>
              ) : (
                <Button variant="outline" className="w-full" onClick={() => setShowQR(false)}>
                  Fermer
                </Button>
              )}
            </div>
          </DialogContent>
      </Dialog>
    </div>
  )
}


