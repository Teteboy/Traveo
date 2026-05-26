import { useNavigate } from 'react-router-dom'
import { Sparkles, TrendingUp, Clock, MapPin, Star, Heart, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { usePersonalizedRecommendations } from '@/hooks/useRecommendations'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/hooks/useAuth'
import { AuthGuard } from '@/components/ui/auth-guard'
import { toast } from 'sonner'

export function PersonalizedRecommendations() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const navigate = useNavigate()
  const user = useCurrentUser()
  const { data, isLoading } = usePersonalizedRecommendations(user?.id)

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'destination':
        return <MapPin className="h-4 w-4" />
      case 'flight':
        return <TrendingUp className="h-4 w-4" />
      case 'hotel':
        return <Star className="h-4 w-4" />
      case 'event':
        return <Clock className="h-4 w-4" />
      default:
        return <Sparkles className="h-4 w-4" />
    }
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-[#44DBD4]/5 to-white">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#44DBD4]/10 rounded-xl">
              <Sparkles className="h-6 w-6 text-[#44DBD4]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#010A09]">Recommandé pour vous</h2>
              <p className="text-slate-500 text-sm">
                Sélections personnalisées basées sur vos préférences
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="hidden md:flex border-[#44DBD4] text-[#44DBD4] hover:bg-[#44DBD4]/10"
            onClick={() => navigate('/discover')}
          >
            Voir tout
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 rounded-none" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data?.recommendations?.map((item) => (
            <Card
              key={item.id}
              className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 bg-white cursor-pointer"
              onClick={() => {
                switch (item.type) {
                  case 'destination':
                    navigate('/discover')
                    break
                  case 'flight':
                    navigate('/flights')
                    break
                  case 'hotel':
                    navigate('/hotels')
                    break
                  case 'event':
                    navigate('/events')
                    break
                }
              }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Favorite Button */}
                <AuthGuard
                  showDialog={false}
                  onAuthRequired={() => {
                    toast.error('Veuillez vous connecter pour ajouter aux favoris')
                    navigate('/login')
                  }}
                >
                  <button
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm"
                    onClick={(e) => toggleFavorite(item.id, e)}
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors ${
                        favorites.has(item.id) ? 'fill-red-500 text-red-500' : 'text-slate-600'
                      }`}
                    />
                  </button>
                </AuthGuard>

                {/* Type Badge */}
                <Badge className="absolute top-3 left-3 bg-[#44DBD4] text-white border-0">
                  {getTypeIcon(item.type)}
                  <span className="ml-1 capitalize">{item.type}</span>
                </Badge>

                {/* Price */}
                {item.price && (
                  <div className="absolute bottom-3 left-3">
                    <p className="text-white font-bold text-xl">
                      {item.price} {item.currency}
                    </p>
                    {item.type === 'hotel' && (
                      <p className="text-white/80 text-xs">par nuit</p>
                    )}
                  </div>
                )}

                {/* Rating */}
                {item.rating && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full">
                    <Star className="h-3 w-3 fill-[#FC960E] text-[#FC960E]" />
                    <span className="text-xs font-medium text-[#010A09]">{item.rating}</span>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-1 line-clamp-1 text-[#010A09]">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 mb-3 line-clamp-1">
                  {item.subtitle}
                </p>

                {/* Reason */}
                <div className="flex items-center gap-1 text-xs text-[#44DBD4] mb-3">
                  <Sparkles className="h-3 w-3" />
                  <span>{item.reason}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}

        {/* Mobile View All */}
        <div className="mt-6 text-center md:hidden">
          <Button 
            variant="outline" 
            className="border-[#44DBD4] text-[#44DBD4] hover:bg-[#44DBD4]/10"
            onClick={() => navigate('/discover')}
          >
            Voir toutes les recommandations
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
