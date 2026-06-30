import { useNavigate } from 'react-router-dom'
import { Star, Heart, MapPin, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDestinations } from '@/hooks/useDestinations'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'

export function PopularDestinations() {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const { data, isLoading } = useDestinations({ page: 1, limit: 4 })
  const destinations = data?.items ?? []

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-[#010A09]">Destinations Populaires</h2>
            <p className="text-slate-500">Découvrez les destinations les plus prisées</p>
          </div>
          <Button variant="outline" className="border-[#44DBD4] text-[#44DBD4] hover:bg-[#44DBD4]/10" onClick={() => navigate('/discover')}>
            Voir tout <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((destination) => (
            <Card 
              key={destination.id} 
              className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100"
              onClick={() => navigate('/discover')}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={destination.imageUrl}
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                
                {/* Favorite Button */}
                <button
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm"
                  onClick={(e) => toggleFavorite(destination.id, e)}
                >
                  <Heart
                    className={`h-4 w-4 transition-colors ${
                      favorites.has(destination.id) ? 'fill-red-500 text-red-500' : 'text-slate-600'
                    }`}
                  />
                </button>

                {/* Country Badge */}
                <Badge className="absolute bottom-3 left-3 bg-[#44DBD4] text-white border-0">
                  <MapPin className="h-3 w-3 mr-1" />
                  {destination.country}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1 text-[#010A09]">{destination.name}</h3>
                <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                  {destination.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-[#FC960E] text-[#FC960E]" />
                      <span className="text-sm font-medium text-[#010A09]">{destination.rating}</span>
                    </div>
                    <span className="text-xs text-slate-400">
                      ({destination.reviewCount} avis)
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium text-[#44DBD4]">
                    <span>Explorer</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
      </div>
    </section>
  )
}
