import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Plane,
  Calendar,
  Users,
  Briefcase,
  Coffee,
  Wifi,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatPrice } from '@/lib/formatters'
import { useFlight, useBookFlight } from '@/hooks/useFlights'
import { adaptFlight } from '@/lib/adapters'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { PaymentModal } from '@/components/booking/PaymentModal'
import { useAuthStore } from '@/stores/authStore'

export function FlightDetailsPage() {
  const { flightId } = useParams()
  const navigate = useNavigate()
  const { data: flightData, isLoading } = useFlight(flightId ?? '')
  const bookFlightMutation = useBookFlight()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const flight = flightData ? adaptFlight(flightData as unknown as import('@/lib/adapters').ApiFlightItem) : null

  const [passengers, setPassengers] = useState(1)
  const [travelClass, setTravelClass] = useState<'economy' | 'business' | 'first'>('economy')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [, setIsProcessing] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [bookingReference, setBookingReference] = useState('')

  // Ensure auth is available before attempting any booking.
  // The backend requires a valid JWT; otherwise /flights/book returns 401.
  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <Card>
          <CardContent className="py-12">
            <h2 className="text-2xl font-bold mb-2">Veuillez vous connecter</h2>
            <p className="text-muted-foreground mb-6">Session expirée ou manquante. Connectez-vous pour réserver.</p>
            <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => navigate('/login')}>
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getPrice = () => {
    if (!flight) return 0
    switch (travelClass) {
      case 'business': return flight.price.business || flight.price.economy * 2
      case 'first': return flight.price.economy * 3
      default: return flight.price.economy
    }
  }

  const calculateTotal = () => {
    return getPrice() * passengers
  }



  const handleBooking = () => {
    setShowPaymentModal(true)
  }

   const handlePaymentComplete = async (_paymentData: any) => {
     if (!flight) return

     if (!isAuthenticated || !user) {
       toast.error('Veuillez vous connecter pour réserver un vol')
       return
     }

     // Check if user has required flight booking information
     if (!user.title || !user.dateOfBirth || !user.gender || !user.phone) {
       toast.error('Veuillez compléter votre profil avec titre, date de naissance, genre et numéro de téléphone avant de réserver un vol')
       navigate('/profile')
       return
     }

     setIsProcessing(true)
     setShowPaymentModal(false)

      try {
        // Book through our backend (which proxies to Duffel and uses Duffel balance for payment)
        const res = await bookFlightMutation.mutateAsync({
          offerId: flight.id,
          cabin: travelClass,
          passenger: {
            fullName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
            email: user.email,
            phone: user.phone,
          },
          paymentMethod: {
            type: 'balance',
          },
        })

        setBookingReference(res.duffelOrderId || res.bookingReference || res.bookingId)
        setBookingComplete(true)
        toast.success('Réservation confirmée avec succès!')
      } catch (err: unknown) {
      console.error('Booking error:', err)

      if (err instanceof Error) {
        if (err.message.includes('déjà été réservée') || err.message.includes('already been booked')) {
          toast.error('Cette offre a déjà été réservée. Redirection vers la recherche...')
          setTimeout(() => navigate('/'), 2000) // Redirect to home/search after 2 seconds
        } else {
          toast.error(err.message)
        }
      } else {
        toast.error('Erreur de réservation')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) return <div className="container mx-auto px-4 py-16"><Skeleton className="h-96 w-full rounded-xl" /></div>
  if (!flight) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card><CardContent className="py-12 text-center"><h2 className="text-2xl font-bold mb-2">Vol non trouvé</h2><Button onClick={() => navigate('/flights')}>Retour aux vols</Button></CardContent></Card>
      </div>
    )
  }

  const amenities = [
    { icon: Wifi, label: 'Wi-Fi gratuit' },
    { icon: Coffee, label: 'Repas inclus' },
    { icon: Briefcase, label: '1 bagage cabine' },
    { icon: Users, label: 'Choix du siège' },
  ]

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/flights')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux résultats
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Flight Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Détails du vol</CardTitle>
                  <Badge>{flight.stops === 0 ? 'Direct' : `${flight.stops} escale(s)`}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Airline */}
                <div className="flex items-center gap-4">
                  <img
                    src={flight.airlineLogo}
                    alt={flight.airline}
                    className="h-12 w-24 object-contain"
                  />
                  <div>
                    <div className="font-semibold text-lg">{flight.airline}</div>
                    <div className="text-sm text-muted-foreground">
                      Vol {flight.flightNumber}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Route */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="text-3xl font-bold">
                        {flight.departure.time}
                      </div>
                      <div className="text-sm font-medium">
                        {flight.departure.airport}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {flight.departure.code}
                      </div>
                    </div>

                    <div className="flex flex-col items-center px-4">
                      <div className="text-sm text-muted-foreground mb-2">
                        {flight.duration}
                      </div>
                      <div className="w-24 h-px bg-border relative">
                        <Plane className="h-5 w-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary bg-background px-1" />
                      </div>
                    </div>

                    <div className="flex-1 text-right">
                      <div className="text-3xl font-bold">
                        {flight.arrival.time}
                      </div>
                      <div className="text-sm font-medium">
                        {flight.arrival.airport}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {flight.arrival.code}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{flight.departure.date}</span>
                  </div>
                </div>

                <Separator />

                {/* Amenities */}
                <div>
                  <h3 className="font-semibold mb-3">Services inclus</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {amenities.map((amenity) => (
                      <div
                        key={amenity.label}
                        className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg"
                      >
                        <amenity.icon className="h-5 w-5 text-primary" />
                        <span className="text-sm">{amenity.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Baggage Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informations bagages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-semibold">Bagage cabine</div>
                    <div className="text-sm text-muted-foreground">
                      1 bagage (8kg max)
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-semibold">Bagage en soute</div>
                    <div className="text-sm text-muted-foreground">
                      1 bagage (23kg max) - Inclus
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
                <CardTitle>Réservation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Prix par personne
                  </div>
                  <div className="text-4xl font-bold text-primary">
                    {formatPrice(getPrice(), flight.currency)}
                  </div>
                </div>

                <Separator />

                {/* Class Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Classe de voyage</label>
                  <Select value={travelClass} onValueChange={(v: any) => setTravelClass(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">Économique - {formatPrice(flight.price.economy, flight.currency)}</SelectItem>
                      <SelectItem value="business">Business - {formatPrice(flight.price.business || flight.price.economy * 2, flight.currency)}</SelectItem>
                      <SelectItem value="first">Première - {formatPrice(flight.price.economy * 3, flight.currency)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Passengers */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Passagers</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="number" 
                      min="1" 
                      max={flight.availableSeats}
                      className="pl-10" 
                      value={passengers}
                      onChange={(e) => setPassengers(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sièges disponibles</span>
                    <span className="font-medium">{flight.availableSeats}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{formatPrice(getPrice(), flight.currency)} x {passengers} passager(s)</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatPrice(calculateTotal(), flight.currency)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Taxes et frais inclus
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={handleBooking}>
                  Continuer la réservation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <div className="text-xs text-muted-foreground text-center">
                  Prix garanti pendant 10 minutes
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentComplete={handlePaymentComplete}
        amount={calculateTotal()}
        currency={flight.currency}
        bookingDetails={{
          from: flight.departure.code,
          to: flight.arrival.code,
          date: flight.departure.date,
          airline: flight.airline,
          passengers: passengers
        }}
      />

      {/* Booking Success Dialog */}
      <Dialog open={bookingComplete} onOpenChange={() => setBookingComplete(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Réservation confirmée!
            </DialogTitle>
            <DialogDescription>
              Votre billet d'avion a été réservé avec succès via Duffel.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 mb-4">
              <p className="text-sm text-muted-foreground mb-2">Référence de réservation</p>
              <p className="text-2xl font-bold text-primary">{bookingReference}</p>
              {bookingReference && bookingReference.startsWith('ord_') && (
                <p className="text-xs text-muted-foreground mt-1">Commande Duffel confirmée</p>
              )}
            </div>
            <div className="text-left space-y-2 text-sm">
              <p><strong>Vol:</strong> {flight.airline} {flight.flightNumber}</p>
              <p><strong>De:</strong> {flight.departure.airport} ({flight.departure.code})</p>
              <p><strong>À:</strong> {flight.arrival.airport} ({flight.arrival.code})</p>
              <p><strong>Date:</strong> {flight.departure.date}</p>
              <p><strong>Départ:</strong> {flight.departure.time}</p>
              <p><strong>Passagers:</strong> {passengers}</p>
              <p><strong>Classe:</strong> {travelClass === 'economy' ? 'Économique' : travelClass === 'business' ? 'Business' : 'Première'}</p>
              <p><strong>Total:</strong> {formatPrice(calculateTotal(), flight.currency)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setBookingComplete(false)}>
              Fermer
            </Button>
            <Button className="flex-1" onClick={() => navigate('/my-trips')}>
              Voir mes voyages
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
