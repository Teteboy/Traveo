import { useState } from 'react'
import { MapPin, Calendar, Users, Plane, Building, Clock, ChevronRight, Download, Share2, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SavedTrip {
  id: string
  name: string
  destination: string
  image: string
  startDate: string
  endDate: string
  travelers: number
  status: 'upcoming' | 'ongoing' | 'completed' | 'draft'
  elements: {
    flights: number
    hotels: number
    events: number
  }
}

const statusConfig = {
  upcoming: {
    label: 'À venir',
    color: 'bg-blue-100 text-blue-700'
  },
  ongoing: {
    label: 'En cours',
    color: 'bg-green-100 text-green-700'
  },
  completed: {
    label: 'Terminé',
    color: 'bg-gray-100 text-gray-700'
  },
  draft: {
    label: 'Brouillon',
    color: 'bg-yellow-100 text-yellow-700'
  }
}

export function SavedTrips() {
  const [trips, setTrips] = useState<SavedTrip[]>([])

  const handleDelete = (id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id))
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Mes Voyages Sauvegardés
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {trips.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun voyage sauvegardé</p>
            <Button className="mt-4">
              Planifier un voyage
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => {
              const config = statusConfig[trip.status]
              
              return (
                <div
                  key={trip.id}
                  className="group flex flex-col sm:flex-row gap-4 p-4 rounded-lg border hover:shadow-lg transition-all cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative w-full sm:w-48 h-32 sm:h-auto rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={trip.image}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className={cn("absolute top-2 left-2", config.color)}>
                      {config.label}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-lg mb-1">{trip.name}</h4>
                    <p className="text-muted-foreground flex items-center gap-1 mb-3">
                      <MapPin className="h-4 w-4" />
                      {trip.destination}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{trip.travelers} voyageurs</span>
                      </div>
                    </div>

                    {/* Trip Elements */}
                    <div className="flex items-center gap-3 mt-3">
                      {trip.elements.flights > 0 && (
                        <Badge variant="outline" className="gap-1">
                          <Plane className="h-3 w-3" />
                          {trip.elements.flights} vols
                        </Badge>
                      )}
                      {trip.elements.hotels > 0 && (
                        <Badge variant="outline" className="gap-1">
                          <Building className="h-3 w-3" />
                          {trip.elements.hotels} hôtels
                        </Badge>
                      )}
                      {trip.elements.events > 0 && (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {trip.elements.events} activités
                        </Badge>
                      )}
                      {trip.status === 'draft' && (
                        <span className="text-xs text-muted-foreground italic">
                          Planification en cours...
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center gap-2 sm:items-end justify-between">
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(trip.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Create New Trip */}
        <div className="mt-6 pt-4 border-t">
          <Button variant="outline" className="w-full">
            <MapPin className="h-4 w-4 mr-2" />
            Planifier un nouveau voyage
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}