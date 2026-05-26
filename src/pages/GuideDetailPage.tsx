import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Star, Languages, Award, Clock, ArrowLeft, Share2, Heart, Calendar, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatPrice } from '@/lib/formatters'
import { useGuide, useBookGuide } from '@/hooks/useServices'
import { usePayWithWallet } from '@/hooks/useWallet'
import { adaptGuide } from '@/lib/adapters'
import type { ApiServiceItem } from '@/lib/adapters'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useState } from 'react'
import { apiClient } from '@/lib/apiClient'

export function GuideDetailPage() {
  const { guideId } = useParams()
  const navigate = useNavigate()
  const [hours, setHours] = useState(4)
  const [isSaved, setIsSaved] = useState(false)
  const bookGuide = useBookGuide()
  const payWithWallet = usePayWithWallet()
  const { data: guideData, isLoading } = useGuide(guideId ?? '')
  const guide = guideData ? adaptGuide(guideData as unknown as ApiServiceItem) : null

  const handleBook = async () => {
    if (!guide) return
    try {
      const res = await bookGuide.mutateAsync({
        id: guide.id,
        hours,
        startDate: new Date().toISOString(),
        paymentMethod: 'wallet',
      })
      try {
        await payWithWallet.mutateAsync({ bookingId: res.bookingId })
      } catch (payErr: unknown) {
        toast.error(payErr instanceof Error ? payErr.message : 'Échec du paiement portefeuille')
        return
      }
      toast.success('Guide réservé et payé via votre portefeuille.')
      navigate(`/booking-confirmation/${res.bookingId}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur de réservation')
    }
  }

  const handleContactProvider = async () => {
    if (!guide?.providerId) {
      navigate('/messages')
      return
    }
    try {
      const res = await apiClient.post('/chat/conversations', { providerId: guide.providerId })
      const conversationId = res.data?.data?.conversation?.id
      if (conversationId) {
        navigate(`/messages?conversationId=${conversationId}`)
      } else {
        navigate('/messages')
      }
    } catch {
      navigate('/messages')
    }
  }

  if (isLoading) return <div className="container mx-auto px-4 py-16"><Skeleton className="h-96 w-full rounded-xl" /></div>
  if (!guide) return <div className="container mx-auto px-4 py-8"><p>Guide non trouvé</p></div>

  const totalPrice = guide.pricePerHour * hours

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-accent py-8 px-4">
        <div className="container mx-auto max-w-5xl">
          <Button
            variant="secondary"
            size="sm"
            className="mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-4 pb-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guide Profile */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <Avatar className="h-32 w-32 border-4 border-primary">
                    <AvatarImage src={guide.imageUrl} alt={guide.name} />
                    <AvatarFallback>{guide.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-2xl font-bold mb-1">{guide.name}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{guide.location}, {guide.country}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{guide.rating}</span>
                            <span className="text-sm text-muted-foreground">
                              ({guide.reviewCount} avis)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setIsSaved(!isSaved)}
                        >
                          <Heart className={`h-5 w-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Share2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-muted-foreground">{guide.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {guide.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Languages & Expertise */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Languages className="h-5 w-5 text-primary" />
                    Langues parlées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {guide.languages.map((language) => (
                      <Badge key={language}>{language}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="h-5 w-5 text-primary" />
                    Spécialités
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {guide.specialties.map((specialty) => (
                      <li key={specialty} className="flex items-center gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{specialty}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Services Offered */}
            <Card>
              <CardHeader>
                <CardTitle>Services proposés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="font-medium">Visites guidées personnalisées</p>
                      <p className="text-sm text-muted-foreground">
                        Découvrez les lieux incontournables avec un guide expert
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="font-medium">Expériences culturelles</p>
                      <p className="text-sm text-muted-foreground">
                        Immersion dans la culture locale et les traditions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="font-medium">Conseils et recommandations</p>
                      <p className="text-sm text-muted-foreground">
                        Les meilleurs restaurants, boutiques et lieux cachés
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Avis des voyageurs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    name: 'Sophie Laurent',
                    rating: 5,
                    comment: 'Guide exceptionnel ! Très professionnel et passionné.',
                    date: '2024-02-10',
                    avatar: 'https://i.pravatar.cc/40?u=user1'
                  },
                  {
                    name: 'Marc Dubois',
                    rating: 5,
                    comment: 'Une expérience inoubliable. Je recommande vivement !',
                    date: '2024-01-28',
                    avatar: 'https://i.pravatar.cc/40?u=user2'
                  },
                  {
                    name: 'Claire Martin',
                    rating: 4,
                    comment: 'Très bonne visite, guide très cultivé et sympathique.',
                    date: '2024-01-15',
                    avatar: 'https://i.pravatar.cc/40?u=user3'
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
                  Voir tous les avis ({guide.reviewCount})
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Réserver ce guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(guide.pricePerHour, guide.currency)}
                    </span>
                    <span className="text-sm text-muted-foreground">/ heure</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date de la visite</label>
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
                  <label className="text-sm font-medium">Durée (heures)</label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setHours(Math.max(1, hours - 1))}
                    >
                      -
                    </Button>
                    <span className="text-lg font-semibold w-12 text-center">{hours}h</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setHours(Math.min(12, hours + 1))}
                    >
                      +
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Durée minimale: 2 heures
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatPrice(guide.pricePerHour, guide.currency)} × {hours}h
                    </span>
                    <span className="font-medium">
                      {formatPrice(totalPrice, guide.currency)}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(totalPrice, guide.currency)}
                  </span>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleContactProvider}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contacter
                  </Button>
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={handleBook}
                    disabled={bookGuide.isPending || payWithWallet.isPending}
                  >
                    {bookGuide.isPending || payWithWallet.isPending ? 'Réservation...' : 'Réserver maintenant'}
                  </Button>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Confirmation dans les 24h
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Award className="h-3 w-3" />
                    Guide certifié et vérifié
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
