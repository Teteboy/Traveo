import { Plane, Hotel, Calendar, Ticket, Download, Share2, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface EticketCardProps {
  booking: {
    id: string
    type: 'flight' | 'hotel' | 'event' | 'transfer'
    status: 'confirmed' | 'pending' | 'cancelled'
    bookingDate: string
    details: Record<string, unknown>
  }
  onDownload?: () => void
  onShare?: () => void
}

export function EticketCard({ booking, onDownload, onShare }: EticketCardProps) {
  const getTypeIcon = () => {
    switch (booking.type) {
      case 'flight':
        return <Plane className="h-5 w-5" />
      case 'hotel':
        return <Hotel className="h-5 w-5" />
      case 'event':
        return <Ticket className="h-5 w-5" />
      default:
        return <Calendar className="h-5 w-5" />
    }
  }

  const getTypeLabel = () => {
    switch (booking.type) {
      case 'flight':
        return 'Vol'
      case 'hotel':
        return 'Hôtel'
      case 'event':
        return 'Événement'
      case 'transfer':
        return 'Transfert'
      default:
        return 'Réservation'
    }
  }

  const getStatusColor = () => {
    switch (booking.status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const generateQRCode = (id: string) => {
    // Simple QR code placeholder - in production, use a real QR library
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(id)}`
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              {getTypeIcon()}
            </div>
            <div>
              <CardTitle className="text-lg">{getTypeLabel()}</CardTitle>
              <p className="text-sm text-muted-foreground">Réf: {booking.id}</p>
            </div>
          </div>
          <Badge className={getStatusColor()}>
            {booking.status === 'confirmed' ? 'Confirmé' : booking.status === 'pending' ? 'En attente' : 'Annulé'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Flight Details */}
        {booking.type === 'flight' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-2xl font-bold">{booking.details.departureCode as string}</p>
                <p className="text-sm text-muted-foreground">{booking.details.departureCity as string}</p>
              </div>
              <div className="flex-1 px-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <Plane className="h-4 w-4 text-primary" />
                  <div className="h-px flex-1 bg-border" />
                </div>
                <p className="text-xs text-center text-muted-foreground mt-1">
                  {booking.details.duration as string}
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{booking.details.arrivalCode as string}</p>
                <p className="text-sm text-muted-foreground">{booking.details.arrivalCity as string}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Départ</p>
                <p className="font-medium">{booking.details.departureTime as string}</p>
                <p className="text-xs text-muted-foreground">{booking.details.departureDate as string}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Arrivée</p>
                <p className="font-medium">{booking.details.arrivalTime as string}</p>
                <p className="text-xs text-muted-foreground">{booking.details.arrivalDate as string}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Compagnie</p>
                <p className="font-medium">{booking.details.airline as string}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Classe</p>
                <p className="font-medium">{booking.details.class as string}</p>
              </div>
            </div>
          </div>
        )}

        {/* Hotel Details */}
        {booking.type === 'hotel' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg">{booking.details.hotelName as string}</h4>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4" />
                <span>{booking.details.location as string}</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Arrivée</p>
                <p className="font-medium">{booking.details.checkIn as string}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Départ</p>
                <p className="font-medium">{booking.details.checkOut as string}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Chambre</p>
                <p className="font-medium">{booking.details.roomType as string}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Nuits</p>
                <p className="font-medium">{booking.details.nights as number}</p>
              </div>
            </div>
          </div>
        )}

        {/* Event Details */}
        {booking.type === 'event' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg">{booking.details.eventName as string}</h4>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4" />
                <span>{booking.details.venue as string}</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">{booking.details.eventDate as string}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Heure</p>
                <p className="font-medium">{booking.details.eventTime as string}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Billets</p>
                <p className="font-medium">{booking.details.tickets as number}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Catégorie</p>
                <p className="font-medium">{booking.details.category as string}</p>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Section */}
        <div className="mt-6 flex flex-col items-center">
          <div className="p-3 bg-white rounded-lg border shadow-sm">
            <img 
              src={generateQRCode(booking.id)} 
              alt="QR Code" 
              className="w-32 h-32"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Présentez ce QR code lors de l'enregistrement
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <Button className="flex-1" onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
          <Button variant="outline" className="flex-1" onClick={onShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Partager
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
