import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/apiClient'
import { formatPrice } from '@/lib/formatters'
import {
  Star,
  MapPin,
  Calendar,
  Users,
  Clock,
  Wifi,
  Car,
  Coffee,
  UtensilsCrossed,
  Dumbbell,
  Waves,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react'

interface HotelDetail {
  id: string
  name: string
  description: string
  imageUrl: string
  location: string
  country: string
  rating: number
  reviewCount: number
  price: number
  currency: string
  metadata: {
    amenities?: string[]
    rooms?: Array<{
      id: string
      type: string
      name: string
      price: number
      currency: string
      available: number
      maxGuests: number
      amenities: string[]
    }>
  }
}

export function HotelDetailPage() {
  const { hotelId } = useParams<{ hotelId: string }>()
  const navigate = useNavigate()

  // Booking form state
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery<{ data: HotelDetail }>({
    queryKey: ['hotel-detail', hotelId],
    queryFn: () => apiClient.get(`/hotels/${hotelId}`),
    enabled: !!hotelId,
  })

  const hotel = data?.data

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-slate-200 rounded" />
          <div className="h-96 bg-slate-200 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-200 rounded" />
            <div className="h-64 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !hotel) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Hôtel introuvable</h1>
        <Button onClick={() => navigate('/hotels')}>Retour aux hôtels</Button>
      </div>
    )
  }

  const rooms = hotel.metadata?.rooms || []
  const amenities = hotel.metadata?.amenities || ['WiFi', 'Parking', 'Restaurant']

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Button>

      {/* Hero Section */}
      <div className="relative h-[400px] rounded-2xl overflow-hidden">
        <img
          src={hotel.imageUrl}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Badge className="bg-white/20 text-white border-white/30">
              {hotel.country}
            </Badge>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{hotel.rating}</span>
              <span className="text-white/70">({hotel.reviewCount} avis)</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">{hotel.name}</h1>
          <div className="flex items-center gap-2 text-lg text-white/90">
            <MapPin className="h-5 w-5" />
            {hotel.location}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>À propos de cet hôtel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 leading-relaxed">{hotel.description}</p>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Équipements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    {amenity.toLowerCase().includes('wifi') && <Wifi className="h-5 w-5 text-[#44DBD4]" />}
                    {amenity.toLowerCase().includes('parking') && <Car className="h-5 w-5 text-[#44DBD4]" />}
                    {amenity.toLowerCase().includes('restaurant') && <Coffee className="h-5 w-5 text-[#44DBD4]" />}
                    <span className="text-sm font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Rooms */}
          <Card>
            <CardHeader>
              <CardTitle>Chambres disponibles</CardTitle>
              <p className="text-sm text-muted-foreground">
                Choisissez la chambre qui vous convient
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
               {rooms.length > 0 ? (
                 rooms.map((room) => (
                   <div
                     key={room.id}
                     className={`border rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all ${selectedRoomId === room.id ? 'border-[#44DBD4] bg-[#44DBD4]/5' : 'hover:border-[#44DBD4]'}`}
                   >
                    <div>
                      <div className="font-semibold text-lg">{room.name}</div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" /> {room.maxGuests} personnes
                        </span>
                        <span>{room.available} disponibles</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {room.amenities.map((a, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {a}
                          </Badge>
                        ))}
                      </div>
                    </div>

                     <div className="text-right">
                       <div className="text-2xl font-bold text-[#44DBD4]">
                         {formatPrice(room.price, room.currency)}
                       </div>
                       <div className="text-sm text-muted-foreground">par nuit</div>
                       <div className="text-xs text-green-600 mt-1">
                         {room.available} chambres disponibles
                       </div>
                       <Button
                         className={`mt-3 ${selectedRoomId === room.id ? 'bg-green-600' : 'bg-[#44DBD4] hover:bg-[#3bc9c2]'}`}
                         onClick={() => {
                           setSelectedRoomId(room.id)
                           if (checkIn && checkOut) {
                             const params = new URLSearchParams({ checkIn, checkOut, guests: String(guests), roomId: room.id })
                             navigate(`/booking-confirmation/${hotel.id}?${params.toString()}`)
                           }
                         }}
                       >
                         {selectedRoomId === room.id ? 'Chambre sélectionnée' : 'Choisir cette chambre'}
                       </Button>
                     </div>
                  </div>
                ))
               ) : (
                 <div className="text-center py-8 text-muted-foreground border rounded-xl">
                   <p>Aucune chambre configurée pour cet hôtel.</p>
                   <p className="text-xs mt-1">Le prestataire peut ajouter des chambres depuis son tableau de bord.</p>
                 </div>
               )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Booking Widget */}
        <div className="lg:sticky lg:top-6 h-fit">
          <Card className="border-[#44DBD4]/20 shadow-lg">
            <CardContent className="p-6 space-y-5">
              <div>
                <div className="text-3xl font-bold">
                  {formatPrice(hotel.price, hotel.currency)}
                  <span className="text-base font-normal text-muted-foreground"> / nuit</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{hotel.rating}</span>
                  <span className="text-sm text-muted-foreground">({hotel.reviewCount} avis)</span>
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Date d'arrivée</label>
                  <Input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Date de départ</label>
                  <Input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Voyageurs</label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                    >
                      −
                    </Button>
                    <div className="flex-1 text-center font-medium">
                      {guests} {guests > 1 ? 'voyageurs' : 'voyageur'}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setGuests(Math.min(8, guests + 1))}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              {checkIn && checkOut && (
                <div className="bg-slate-50 p-4 rounded-lg text-sm">
                  <div className="flex justify-between mb-1">
                    <span>Prix par nuit</span>
                    <span>{formatPrice(hotel.price, hotel.currency)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base pt-2 border-t">
                    <span>Total</span>
                    <span>
                      {formatPrice(
                        hotel.price * Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24))),
                        hotel.currency
                      )}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => navigate('/messages')}
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Contacter le prestataire
                </Button>

                <Button
                  size="lg"
                  className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-lg py-6"
                  disabled={!checkIn || !checkOut}
                  onClick={() => {
                    const params = new URLSearchParams({
                      checkIn,
                      checkOut,
                      guests: String(guests),
                      ...(selectedRoomId && { roomId: selectedRoomId }),
                    })
                    navigate(`/booking-confirmation/${hotel.id}?${params.toString()}`)
                  }}
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Réserver maintenant
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Annulation gratuite jusqu'à 48h avant l'arrivée
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
