import { useParams, Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, Download, Share2, Calendar, Home, Users, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function BookingConfirmationPage() {
  const { bookingId } = useParams()
  const [searchParams] = useSearchParams()

  // Read booking details from URL
  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  const guests = searchParams.get('guests')
  const roomId = searchParams.get('roomId')
  const hotelName = searchParams.get('hotelName') || 'Votre hôtel'

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const nights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24)))
    : null

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-[#44DBD4] to-[#3bc9c2] p-8 text-white text-center">
          <CheckCircle className="h-20 w-20 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Réservation confirmée !</h1>
          <p className="text-white/90 text-lg">
            Votre réservation a été effectuée avec succès
          </p>
        </div>

        <CardContent className="p-8 space-y-8">
          {/* Booking Reference */}
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Numéro de réservation</div>
            <div className="text-3xl font-bold font-mono tracking-wider text-[#44DBD4]">{bookingId}</div>
          </div>

          {/* Booking Summary */}
          {(checkIn || checkOut || guests) && (
            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#44DBD4]" />
                Détails de la réservation
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hotelName && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Hôtel</div>
                      <div className="font-medium">{hotelName}</div>
                    </div>
                  </div>
                )}

                {checkIn && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Arrivée</div>
                      <div className="font-medium">{formatDate(checkIn)}</div>
                    </div>
                  </div>
                )}

                {checkOut && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Départ</div>
                      <div className="font-medium">{formatDate(checkOut)}</div>
                    </div>
                  </div>
                )}

                {guests && (
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Voyageurs</div>
                      <div className="font-medium">{guests} personne{Number(guests) > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                )}

                {roomId && (
                  <div className="md:col-span-2">
                    <Badge variant="secondary" className="mt-2">Chambre sélectionnée : {roomId}</Badge>
                  </div>
                )}

                {nights && (
                  <div className="md:col-span-2 pt-2 border-t text-sm text-muted-foreground">
                    Durée du séjour : <span className="font-medium text-foreground">{nights} nuit{nights > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Confirmation Message */}
          <div className="text-center">
            <p className="text-muted-foreground">
              Un email de confirmation a été envoyé à votre adresse avec tous les détails de votre réservation.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2]" asChild>
              <Link to="/my-trips">
                <Calendar className="mr-2 h-4 w-4" />
                Voir mes voyages
              </Link>
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Télécharger le reçu
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="mr-2 h-4 w-4" />
              Partager
            </Button>
          </div>

          <div className="text-center">
            <Button variant="link" asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
