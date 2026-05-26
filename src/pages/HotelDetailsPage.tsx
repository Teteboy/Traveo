import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Star,
  MapPin,
  Wifi,
  Coffee,
  UtensilsCrossed,
  Waves,
  Dumbbell,
  Users,
  CheckCircle,
  Loader2,
  CreditCard,
  ShieldCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DateRangePicker } from '@/components/ui/date-picker'
import { formatPrice } from '@/lib/formatters'
import { useHotel, useBookHotel } from '@/hooks/useServices'
import { usePayWithWallet } from '@/hooks/useWallet'
import { adaptHotel } from '@/lib/adapters'
import type { ApiServiceItem } from '@/lib/adapters'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const amenityIcons: Record<string, any> = {
  'Wi-Fi': Wifi,
  Piscine: Waves,
  Restaurant: UtensilsCrossed,
  'Petit-déjeuner': Coffee,
  'Salle de sport': Dumbbell,
}

export function HotelDetailsPage() {
  const { hotelId } = useParams()
  const navigate = useNavigate()
  const { data: hotelData, isLoading } = useHotel(hotelId ?? '')
  const hotel = hotelData ? adaptHotel(hotelData as unknown as ApiServiceItem) : null
  const bookHotel = useBookHotel()
  const payWithWallet = usePayWithWallet()

  const [checkInDate, setCheckInDate] = useState<Date | undefined>()
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>()
  const [guests, setGuests] = useState(2)
  const [rooms, setRooms] = useState(1)
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [bookingReference, setBookingReference] = useState('')

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0
    const diff = checkOutDate.getTime() - checkInDate.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const calculateTotal = () => {
    const nights = calculateNights()
    return nights * hotel!.price * rooms
  }

  const handleBooking = async () => {
    if (!checkInDate || !checkOutDate || !hotel) return
    setIsProcessing(true)
    try {
      const res = await bookHotel.mutateAsync({
        id: hotel.id,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        guests,
        paymentMethod: 'wallet',
      })
      // Settle payment from wallet immediately for non-flight services
      try {
        await payWithWallet.mutateAsync({ bookingId: res.bookingId })
      } catch (payErr: unknown) {
        toast.error(payErr instanceof Error ? payErr.message : 'Échec du paiement portefeuille')
        return
      }
      setBookingReference(res.bookingId)
      setBookingComplete(true)
      toast.success('Réservation confirmée et payée via votre portefeuille.')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur de réservation')
    } finally {
      setIsProcessing(false)
    }
  }

  const closeDialog = () => {
    setShowBookingDialog(false)
    setBookingComplete(false)
  }

  if (isLoading) return <div className="container mx-auto px-4 py-16 text-center"><Skeleton className="h-96 w-full rounded-xl" /></div>
  if (!hotel) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card><CardContent className="py-12 text-center"><h2 className="text-2xl font-bold mb-2">Hôtel non trouvé</h2><Button onClick={() => navigate('/hotels')}>Retour aux hôtels</Button></CardContent></Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/hotels')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux résultats
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hotel Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <div className="relative h-96 rounded-lg overflow-hidden">
              <img
                src={hotel.imageUrl}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-4 left-4 bg-[#44DBD4]/90">
                {hotel.starRating} étoiles
              </Badge>
            </div>

            {/* Hotel Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{hotel.name}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>{hotel.location}, {hotel.country}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-[#44DBD4] text-white px-3 py-1.5 rounded">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-semibold">{hotel.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Excellent ({hotel.reviewCount} avis)
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">{hotel.description}</p>

                <Separator />

                {/* Amenities */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Équipements et services</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {hotel.amenities.map((amenity) => {
                      const Icon = amenityIcons[amenity] || CheckCircle
                      return (
                        <div
                          key={amenity}
                          className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                        >
                          <Icon className="h-5 w-5 text-[#44DBD4]" />
                          <span className="text-sm font-medium">{amenity}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <Separator />

                {/* Policies */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Informations importantes</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-semibold">Arrivée / Départ</div>
                        <div className="text-muted-foreground">
                          Check-in : 14h00 / Check-out : 12h00
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-semibold">Annulation gratuite</div>
                        <div className="text-muted-foreground">
                          Jusqu'à 48h avant l'arrivée
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Card */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Réservez votre chambre</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    À partir de
                  </div>
                  <div className="text-4xl font-bold text-[#44DBD4]">
                    {formatPrice(hotel.price, hotel.currency)}
                  </div>
                  <div className="text-sm text-muted-foreground">par nuit</div>
                </div>

                <Separator />

                {/* Dates */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dates de séjour</label>
                    <DateRangePicker
                      fromDate={checkInDate}
                      toDate={checkOutDate}
                      onFromDateChange={setCheckInDate}
                      onToDateChange={setCheckOutDate}
                      fromPlaceholder="Date d'arrivée"
                      toPlaceholder="Date de départ"
                      minDate={new Date()}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Voyageurs</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="number" 
                        min="1" 
                        className="pl-10 border-slate-200" 
                        value={guests}
                        onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Chambres</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="number" 
                        min="1" 
                        max={hotel.availableRooms}
                        className="pl-10 border-slate-200" 
                        value={rooms}
                        onChange={(e) => setRooms(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Price Summary */}
                {checkInDate && checkOutDate && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{formatPrice(hotel.price, hotel.currency)} x {calculateNights()} nuits x {rooms} chambre(s)</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base">
                      <span>Total</span>
                      <span className="text-[#44DBD4]">{formatPrice(calculateTotal(), hotel.currency)}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chambres disponibles</span>
                    <span className="font-medium">{hotel.availableRooms}</span>
                  </div>
                  {hotel.availableRooms <= 5 && (
                    <Badge variant="destructive" className="w-full justify-center">
                      Plus que {hotel.availableRooms} chambres disponibles !
                    </Badge>
                  )}
                </div>

                <Button 
                  className="w-full bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" 
                  size="lg"
                  onClick={() => setShowBookingDialog(true)}
                  disabled={!checkInDate || !checkOutDate}
                >
                  Réserver maintenant
                </Button>

                <div className="text-xs text-muted-foreground text-center">
                  Réservation sans frais supplémentaires
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-md bg-white">
          {bookingComplete ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Réservation confirmée!
                </DialogTitle>
                <DialogDescription>
                  Votre réservation a été effectuée avec succès.
                </DialogDescription>
              </DialogHeader>
              <div className="py-6 text-center">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Référence de réservation</p>
                  <p className="text-2xl font-bold text-[#44DBD4]">{bookingReference}</p>
                </div>
                <div className="text-left space-y-2 text-sm">
                  <p><strong>Hôtel:</strong> {hotel.name}</p>
                  <p><strong>Arrivée:</strong> {checkInDate?.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p><strong>Départ:</strong> {checkOutDate?.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p><strong>Voyageurs:</strong> {guests}</p>
                  <p><strong>Chambres:</strong> {rooms}</p>
                  <p><strong>Total:</strong> {formatPrice(calculateTotal(), hotel.currency)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={closeDialog}>
                  Fermer
                </Button>
                <Button className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => navigate('/my-trips')}>
                  Voir mes voyages
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Confirmer la réservation</DialogTitle>
                <DialogDescription>
                  Vérifiez les détails de votre réservation
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <p className="font-semibold mb-2">{hotel.name}</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p> {hotel.location}, {hotel.country}</p>
                    <p> {checkInDate?.toLocaleDateString('fr-FR')} - {checkOutDate?.toLocaleDateString('fr-FR')}</p>
                    <p> {guests} voyageur(s)  {rooms} chambre(s)</p>
                    <p> {calculateNights()} nuit(s)</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{formatPrice(hotel.price, hotel.currency)} x {calculateNights()} nuits</span>
                    <span>{formatPrice(hotel.price * calculateNights(), hotel.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{rooms} chambre(s)</span>
                    <span>{formatPrice(hotel.price * calculateNights() * rooms, hotel.currency)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-[#44DBD4]">{formatPrice(calculateTotal(), hotel.currency)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  <span>Paiement sécurisé</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowBookingDialog(false)}>
                  Annuler
                </Button>
                <Button 
                  className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" 
                  onClick={handleBooking}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Payer {formatPrice(calculateTotal(), hotel.currency)}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
