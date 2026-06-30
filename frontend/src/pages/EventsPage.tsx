import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Search, Ticket, Users, CheckCircle, Loader2, CreditCard, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate, formatPrice } from '@/lib/formatters'
import { useEvents, useBookEvent } from '@/hooks/useServices'
import { adaptEvent } from '@/lib/adapters'
import { toast } from 'sonner'
import { useQueries } from '@tanstack/react-query'

const categories = ['Tous', 'Musique', 'Sport', 'Culture', 'Gastronomie', 'Festival', 'Business']
const sortOptions = [
  { value: 'date_asc', label: 'Date la plus proche' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
]

export function EventsPage() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('Tous')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date_asc')
  const [selectedEvent, setSelectedEvent] = useState<ReturnType<typeof adaptEvent> | null>(null)
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [bookingReference, setBookingReference] = useState('')
  const [ticketQuantity, setTicketQuantity] = useState(1)

  const { data, isLoading } = useEvents({ page: 1, limit: 30 })
  const bookEvent = useBookEvent()

  const events = (data?.items ?? []).map(item => adaptEvent(item as unknown as import('@/lib/adapters').ApiServiceItem))
    .filter(e => {
      const matchesCategory = selectedCategory === 'Tous' || e.category === selectedCategory
      const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.location.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price
      if (sortBy === 'price_desc') return b.price - a.price
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    })

  // Fetch event spaces for each event using useQueries
  const eventIds = events.map(e => e.id)
  const spacesQueries = useQueries({
    queries: eventIds.map(id => ({
      queryKey: ['event-spaces', id],
      queryFn: async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/service-items/events/${id}/spaces`)
        const data = await response.json()
        return data.data || data
      },
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    }))
  })
  const spacesCountMap = new Map(eventIds.map((id, i) => [id, (spacesQueries[i].data ?? []).length]))

  const handleOpenBooking = (event: ReturnType<typeof adaptEvent>, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedEvent(event)
    setShowBookingDialog(true)
    setBookingComplete(false)
    setTicketQuantity(1)
  }

  const handleBooking = async () => {
    if (!selectedEvent) return
    try {
      const result = await bookEvent.mutateAsync({ id: selectedEvent.id, guests: ticketQuantity })
      setBookingReference(result.bookingId)
      setBookingComplete(true)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la réservation')
    }
  }

  const closeDialog = () => { setShowBookingDialog(false); setSelectedEvent(null); setBookingComplete(false) }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-[#44DBD4] via-[#44DBD4]/90 to-[#3bc9c2] py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Événements Premium</h1>
          <p className="text-white/90 mb-8">Réservez vos billets pour les meilleurs événements</p>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#44DBD4]" />
                  <Input placeholder="Rechercher un événement..." className="pl-10"
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hidden pb-2">
          {categories.map(c => (
            <Badge key={c} className={`cursor-pointer whitespace-nowrap transition-all ${selectedCategory === c ? 'bg-[#44DBD4] text-white hover:bg-[#3bc9c2]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              onClick={() => setSelectedCategory(c)}>{c}</Badge>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Événements disponibles</h2>
            <p className="text-muted-foreground">{isLoading ? '...' : `${events.length} événements`}</p>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white">
              {sortOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden"><Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></CardContent>
              </Card>
            ))}
          </div>
        ) : events.length === 0 ? (
          <Card className="p-8 text-center">
            <Ticket className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Aucun événement trouvé</h3>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map(event => (
              <Card key={event.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate(`/events/${event.id}`)}>
                <div className="md:flex">
                  <div className="md:w-1/3 h-48 md:h-auto relative">
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                    <Badge className="absolute top-3 left-3 bg-[#44DBD4] text-white border-0">{event.category}</Badge>
                  </div>
                  <div className="md:w-2/3">
                    <CardHeader>
                      <CardTitle className="text-xl text-[#010A09]">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-slate-500 line-clamp-2">{event.description}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4 text-[#44DBD4]" />
                        <span>{event.location}, {event.country}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4 text-[#44DBD4]" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <span className="text-2xl font-bold text-[#44DBD4]">{formatPrice(event.price, event.currency)}</span>
                          <span className="text-sm text-slate-500 ml-1">/ billet</span>
                          <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                            <Building2 className="h-3 w-3" />
                            <span>{spacesCountMap.get(event.id) || 0} espaces</span>
                          </div>
                        </div>
                        <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
                          onClick={e => handleOpenBooking(event, e)}>Réserver</Button>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-md">
          {bookingComplete ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" /> Réservation confirmée!
                </DialogTitle>
                <DialogDescription>Vos billets ont été réservés avec succès.</DialogDescription>
              </DialogHeader>
              <div className="py-6 text-center">
                <div className="bg-green-50 rounded-lg p-6 mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Référence de réservation</p>
                  <p className="text-2xl font-bold text-primary">{bookingReference.slice(0, 8).toUpperCase()}</p>
                </div>
                {selectedEvent && (
                  <div className="text-left space-y-2 text-sm">
                    <p><strong>Événement:</strong> {selectedEvent.title}</p>
                    <p><strong>Date:</strong> {formatDate(selectedEvent.startDate)}</p>
                    <p><strong>Billets:</strong> {ticketQuantity}</p>
                    <p><strong>Total:</strong> {formatPrice(selectedEvent.price * ticketQuantity, selectedEvent.currency)}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={closeDialog}>Fermer</Button>
                <Button className="flex-1" onClick={() => navigate('/my-trips')}>Voir mes voyages</Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Réserver des billets</DialogTitle>
                <DialogDescription>{selectedEvent?.title}</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                {selectedEvent && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="w-20 h-20 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold">{selectedEvent.title}</p>
                      <p className="text-sm text-muted-foreground">{selectedEvent.category}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(selectedEvent.startDate)}</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre de billets</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="number" min="1" max={selectedEvent?.availableTickets || 10} className="pl-10"
                      value={ticketQuantity} onChange={e => setTicketQuantity(parseInt(e.target.value) || 1)} />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice((selectedEvent?.price ?? 0) * ticketQuantity, selectedEvent?.currency ?? 'XAF')}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={closeDialog}>Annuler</Button>
                <Button className="flex-1" onClick={handleBooking} disabled={bookEvent.isPending}>
                  {bookEvent.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Traitement...</> : <><CreditCard className="h-4 w-4 mr-2" />Payer</>}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
