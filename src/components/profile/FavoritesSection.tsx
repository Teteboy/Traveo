import { useState } from 'react'
import { Heart, MapPin, Plane, Building, Calendar, Star, Trash2, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface Favorite {
  id: string
  type: 'destination' | 'flight' | 'hotel' | 'event'
  name: string
  subtitle?: string
  image?: string
  rating?: number
  price?: number
  currency?: string
  savedDate: string
}

const mockFavorites: Favorite[] = [
  {
    id: 'fav1',
    type: 'destination',
    name: 'Zanzibar, Tanzanie',
    subtitle: 'Plages paradisiaques',
    image: 'https://images.unsplash.com/photo-1519659528533-284347c5f1f0?w=400',
    rating: 4.8,
    savedDate: '2024-02-01'
  },
  {
    id: 'fav2',
    type: 'flight',
    name: 'Paris CDG - Tokyo NRT',
    subtitle: 'À partir de 650',
    savedDate: '2024-01-28'
  },
  {
    id: 'fav3',
    type: 'hotel',
    name: 'Hôtel Royal Beach',
    subtitle: 'Zanzibar, Tanzanie',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
    rating: 4.6,
    price: 180,
    currency: 'TND',
    savedDate: '2024-01-25'
  },
  {
    id: 'fav4',
    type: 'event',
    name: 'Festival de la Musique',
    subtitle: 'Paris, France - 15 Mars 2024',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf529c15b?w=400',
    rating: 4.9,
    price: 45,
    currency: 'TND',
    savedDate: '2024-01-20'
  },
  {
    id: 'fav5',
    type: 'destination',
    name: 'Bali, Indonésie',
    subtitle: 'Culture et nature',
    image: 'https://images.unsplash.com/photo-1537996193727-0a7e0f2d4b6b?w=400',
    rating: 4.7,
    savedDate: '2024-01-15'
  }
]

const typeConfig = {
  destination: {
    label: 'Destination',
    icon: MapPin,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100'
  },
  flight: {
    label: 'Vol',
    icon: Plane,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100'
  },
  hotel: {
    label: 'Hôtel',
    icon: Building,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100'
  },
  event: {
    label: 'Événement',
    icon: Calendar,
    color: 'text-green-500',
    bgColor: 'bg-green-100'
  }
}

export function FavoritesSection() {
  const [favorites, setFavorites] = useState<Favorite[]>(mockFavorites)
  const [activeTab, setActiveTab] = useState<string>('all')

  const filteredFavorites = activeTab === 'all'
    ? favorites
    : favorites.filter(f => f.type === activeTab)

  const handleRemove = (id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id))
  }

  const countByType = (type: string) => {
    if (type === 'all') return favorites.length
    return favorites.filter(f => f.type === type).length
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Mes Favoris
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="all" className="text-sm">
              Tous ({countByType('all')})
            </TabsTrigger>
            {Object.entries(typeConfig).map(([key, config]) => (
              <TabsTrigger key={key} value={key} className="text-sm">
                <config.icon className="h-3 w-3 mr-1" />
                {config.label} ({countByType(key)})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {filteredFavorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun favori dans cette catégorie</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFavorites.map((favorite) => {
                  const config = typeConfig[favorite.type]
                  const TypeIcon = config.icon
                  
                  return (
                    <div
                      key={favorite.id}
                      className="group relative rounded-lg border overflow-hidden hover:shadow-lg transition-all"
                    >
                      {/* Image */}
                      {favorite.image ? (
                        <div className="aspect-video relative overflow-hidden">
                          <img
                            src={favorite.image}
                            alt={favorite.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2">
                            <Badge className={cn(config.bgColor, config.color)}>
                              <TypeIcon className="h-3 w-3 mr-1" />
                              {config.label}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className={cn("aspect-video flex items-center justify-center", config.bgColor)}>
                          <TypeIcon className={cn("h-12 w-12", config.color)} />
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-3">
                        <h4 className="font-semibold truncate">{favorite.name}</h4>
                        {favorite.subtitle && (
                          <p className="text-sm text-muted-foreground truncate">{favorite.subtitle}</p>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          {favorite.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{favorite.rating}</span>
                            </div>
                          )}
                          {favorite.price && (
                            <span className="text-sm font-bold text-primary">
                              {favorite.price} {favorite.currency}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          <span className="text-xs text-muted-foreground">
                            Sauvegardé le {favorite.savedDate}
                          </span>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleRemove(favorite.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}