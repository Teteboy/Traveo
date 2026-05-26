import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Star, Clock, Users, ArrowLeft, Share2, Heart, Calendar, Phone, Mail, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatPrice } from '@/lib/formatters'
import { useRestaurant, useBookRestaurant } from '@/hooks/useServices'
import { usePayWithWallet } from '@/hooks/useWallet'
import { adaptRestaurant } from '@/lib/adapters'
import type { ApiServiceItem } from '@/lib/adapters'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useState } from 'react'
import { apiClient } from '@/lib/apiClient'

export function RestaurantDetailPage() {
  const { restaurantId } = useParams()
  const navigate = useNavigate()
  const [guests, setGuests] = useState(2)
  const [isSaved, setIsSaved] = useState(false)
  const bookRestaurant = useBookRestaurant()
  const payWithWallet = usePayWithWallet()
  const { data: restaurantData, isLoading } = useRestaurant(restaurantId ?? '')
  const restaurant = restaurantData ? adaptRestaurant(restaurantData as unknown as ApiServiceItem) : null

  const handleBook = async () => {
    if (!restaurant) return
    try {
      const res = await bookRestaurant.mutateAsync({
        id: restaurant.id,
        guests,
        startDate: new Date().toISOString(),
        paymentMethod: 'wallet',
      })
      try {
        await payWithWallet.mutateAsync({ bookingId: res.bookingId })
      } catch (payErr: unknown) {
        toast.error(payErr instanceof Error ? payErr.message : 'Échec du paiement portefeuille')
        return
      }
      toast.success('Table réservée et payée via votre portefeuille.')
      navigate(`/booking-confirmation/${res.bookingId}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur de réservation')
    }
  }

  if (isLoading) return <div className="container mx-auto px-4 py-16"><Skeleton className="h-96 w-full rounded-xl" /></div>
  if (!restaurant) return <div className="container mx-auto px-4 py-8"><p>Restaurant non trouvé</p></div>

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header Image */}
      <div className="relative h-96">
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
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
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary/90">{restaurant.cuisine}</Badge>
              <Badge variant="secondary">{restaurant.priceRange}</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{restaurant.name}</h1>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{restaurant.location}, {restaurant.country}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{restaurant.rating} ({restaurant.reviewCount} avis)</span>
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
            {/* Restaurant Info */}
            <Card>
              <CardHeader>
                <CardTitle>À propos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{restaurant.description}</p>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Adresse</p>
                      <p className="text-sm text-muted-foreground">
                        {restaurant.location}, {restaurant.country}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Horaires</p>
                      <p className="text-sm text-muted-foreground">
                        Lun-Dim: 12h00 - 23h00
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Téléphone</p>
                      <p className="text-sm text-muted-foreground">
                        +33 1 23 45 67 89
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        contact@restaurant.com
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Spécialités</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Cuisine {restaurant.cuisine} authentique</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Ingrédients frais et locaux</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Chef étoilé</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>Cave à vins sélectionnée</span>
                    </li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Informations pratiques</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Wi-Fi gratuit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Terrasse</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Parking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Accessible PMR</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Menu Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Menu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { name: 'Entrées', items: ['Salade César', 'Carpaccio de bœuf', 'Soupe du jour'] },
                    { name: 'Plats', items: ['Steak frites', 'Poisson du jour', 'Risotto aux champignons'] },
                    { name: 'Desserts', items: ['Tarte tatin', 'Crème brûlée', 'Fondant au chocolat'] }
                  ].map((section) => (
                    <div key={section.name} className="border-b last:border-0 pb-3 last:pb-0">
                      <h4 className="font-semibold mb-2">{section.name}</h4>
                      <ul className="space-y-1">
                        {section.items.map((item) => (
                          <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full">
                  Voir le menu complet
                </Button>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Avis des clients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    name: 'Antoine Leroy',
                    rating: 5,
                    comment: 'Excellente cuisine, service impeccable. À recommander !',
                    date: '2024-02-15',
                    avatar: 'https://i.pravatar.cc/40?u=rest1'
                  },
                  {
                    name: 'Isabelle Moreau',
                    rating: 5,
                    comment: 'Cadre magnifique et plats délicieux. Une belle découverte.',
                    date: '2024-02-10',
                    avatar: 'https://i.pravatar.cc/40?u=rest2'
                  },
                  {
                    name: 'Pierre Dubois',
                    rating: 4,
                    comment: 'Très bon restaurant, rapport qualité-prix correct.',
                    date: '2024-02-05',
                    avatar: 'https://i.pravatar.cc/40?u=rest3'
                  }
                ].map((review, index) => (
                  <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.avatar} />
                        <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium">{review.name}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
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
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  Voir tous les avis ({restaurant.reviewCount})
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Réserver une table</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(restaurant.averagePrice, restaurant.currency)}
                    </span>
                    <span className="text-sm text-muted-foreground">/ personne (moy.)</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-3 py-2 border rounded-lg"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Heure</label>
                  <Select defaultValue="19:00">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12:00">12:00</SelectItem>
                      <SelectItem value="12:30">12:30</SelectItem>
                      <SelectItem value="13:00">13:00</SelectItem>
                      <SelectItem value="13:30">13:30</SelectItem>
                      <SelectItem value="19:00">19:00</SelectItem>
                      <SelectItem value="19:30">19:30</SelectItem>
                      <SelectItem value="20:00">20:00</SelectItem>
                      <SelectItem value="20:30">20:30</SelectItem>
                      <SelectItem value="21:00">21:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre de personnes</label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                    >
                      -
                    </Button>
                    <span className="text-lg font-semibold w-12 text-center">{guests}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setGuests(Math.min(20, guests + 1))}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <Separator />

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleBook}
                  disabled={bookRestaurant.isPending || payWithWallet.isPending}
                >
                  {bookRestaurant.isPending || payWithWallet.isPending ? 'Réservation...' : 'Réserver maintenant'}
                </Button>

                <div className="space-y-2 pt-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Confirmation instantanée
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    Modification gratuite jusqu'à 2h avant
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
