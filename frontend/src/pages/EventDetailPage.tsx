import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Ticket, Star, Clock, ArrowLeft, Share2, Heart, Users, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatDate, formatPrice } from '@/lib/formatters'
import { useEvent, useBookEvent } from '@/hooks/useServices'
import { usePayWithWallet } from '@/hooks/useWallet'
import { useEventSpaces } from '@/hooks/useServiceItems'
import { adaptEvent } from '@/lib/adapters'
import { toast } from 'sonner'
import type { ApiServiceItem } from '@/lib/adapters'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'

export function EventDetailPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [isSaved, setIsSaved] = useState(false)
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null)
  const bookEvent = useBookEvent()
  const payWithWallet = usePayWithWallet()
  const { data: eventData, isLoading } = useEvent(eventId ?? '')
  const event = eventData ? adaptEvent(eventData as unknown as ApiServiceItem) : null
  const { data: spacesData, isLoading: spacesLoading } = useEventSpaces(eventId)
  const spaces = spacesData ?? []

  const handleBook = async () => {
    if (!event) return
    try {
      const res = await bookEvent.mutateAsync({ id: event.id, quantity, paymentMethod: 'wallet' })
      try {
        await payWithWallet.mutateAsync({ bookingId: res.bookingId })
      } catch (payErr: unknown) {
        toast.error(payErr instanceof Error ? payErr.message : 'Échec du paiement portefeuille')
        return
      }
      toast.success('Billets réservés et payés via votre portefeuille.')
      navigate(`/booking-confirmation/${res.bookingId}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur de réservation')
    }
  }

  if (isLoading) return <div className="container mx-auto px-4 py-16"><Skeleton className="h-96 w-full rounded-xl" /></div>
  if (!event) return <div className="container mx-auto px-4 py-8"><p>Événement non trouvé</p></div>

  const totalPrice = selectedSpace
    ? (spaces.find(s => s.id === selectedSpace)?.price ?? event.price) * quantity
    : event.price * quantity

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header Image */}
      <div className="relative h-96">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Back Button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 left-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setIsSaved(!isSaved)}
          >
            <Heart className={`h-5 w-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button variant="secondary" size="icon">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto max-w-5xl">
            <Badge className="mb-3 bg-primary/90">{event.category}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{event.location}, {event.country}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>4.8 (234 avis)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Info */}
            <Card>
              <CardHeader>
                <CardTitle>À propos de l'événement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{event.description}</p>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(event.startDate)}
                        {event.endDate !== event.startDate && ` - ${formatDate(event.endDate)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Lieu</p>
                      <p className="text-sm text-muted-foreground">
                        {event.location}, {event.country}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Ticket className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Billets disponibles</p>
                      <p className="text-sm text-muted-foreground">
                        {event.availableTickets} billets restants
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Durée</p>
                      <p className="text-sm text-muted-foreground">
                        {event.endDate === event.startDate ? '1 jour' : 
                          `${Math.ceil((new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) / (1000 * 60 * 60 * 24))} jours`}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Ce qui est inclus</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Accès à tous les concerts et spectacles</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Billet électronique avec QR code</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Confirmation instantanée</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Annulation gratuite jusqu'à 48h avant</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Event Spaces */}
            <Card>
              <CardHeader>
                <CardTitle>Espaces disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                {spacesLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : spaces.length === 0 ? (
                  <p className="text-muted-foreground">Aucun espace disponible pour le moment.</p>
                ) : (
                  <div className="space-y-4">
                    {spaces.map((space) => (
                      <Card
                        key={space.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedSpace === space.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedSpace(space.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {space.imageUrl && (
                              <img
                                src={space.imageUrl}
                                alt={space.name}
                                className="w-24 h-24 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-lg">{space.name}</h4>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span>Jusqu'à {space.capacity} personnes</span>
                                    <span>•</span>
                                    <Building2 className="h-4 w-4" />
                                    <span>{space.eventType}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-primary">
                                    {formatPrice(space.price, space.currency)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">par espace</div>
                                </div>
                              </div>
                              {space.description && (
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                  {space.description}
                                </p>
                              )}
                              {space.equipment && space.equipment.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {space.equipment.slice(0, 3).map((equip) => (
                                    <Badge key={equip} variant="secondary" className="text-xs">
                                      {equip}
                                    </Badge>
                                  ))}
                                  {space.equipment.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{space.equipment.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Avis des participants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    name: 'Marie Dubois',
                    rating: 5,
                    comment: 'Expérience incroyable ! L\'ambiance était exceptionnelle.',
                    date: '2024-01-15'
                  },
                  {
                    name: 'Jean Martin',
                    rating: 4,
                    comment: 'Très bon événement, organisation parfaite.',
                    date: '2024-01-10'
                  }
                ].map((review, index) => (
                  <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{review.name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(review.date)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  Voir tous les avis
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Réserver vos billets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    {selectedSpace ? (
                      <>
                        <span className="text-3xl font-bold text-primary">
                          {formatPrice(spaces.find(s => s.id === selectedSpace)?.price ?? event.price, event.currency)}
                        </span>
                        <span className="text-sm text-muted-foreground">/ espace</span>
                      </>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-primary">
                          {formatPrice(event.price, event.currency)}
                        </span>
                        <span className="text-sm text-muted-foreground">/ billet</span>
                      </>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {selectedSpace ? 'Nombre d\'espaces' : 'Nombre de billets'}
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </Button>
                    <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  {selectedSpace ? (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatPrice(spaces.find(s => s.id === selectedSpace)?.price ?? event.price, event.currency)} × {quantity}
                      </span>
                      <span className="font-medium">
                        {formatPrice((spaces.find(s => s.id === selectedSpace)?.price ?? event.price) * quantity, event.currency)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatPrice(event.price, event.currency)} × {quantity}
                      </span>
                      <span className="font-medium">
                        {formatPrice(event.price * quantity, event.currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Frais de service</span>
                    <span className="font-medium">{formatPrice(5, event.currency)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(totalPrice + 5, event.currency)}
                  </span>
                </div>

                {!selectedSpace && spaces.length > 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Sélectionnez un espace ci-dessus ou réservez des billets
                  </p>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleBook}
                  disabled={bookEvent.isPending || payWithWallet.isPending}
                >
                  {bookEvent.isPending || payWithWallet.isPending ? 'Réservation...' : 'Réserver maintenant'}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Confirmation instantanée • Annulation gratuite
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
