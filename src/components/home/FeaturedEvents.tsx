import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, ArrowRight, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatPrice } from '@/lib/formatters'
import { useEvents } from '@/hooks/useServices'
import { adaptEvent } from '@/lib/adapters'
import { Skeleton } from '@/components/ui/skeleton'

export function FeaturedEvents() {
  const navigate = useNavigate()
  const { data, isLoading } = useEvents({ page: 1, limit: 4 })
  const events = (data?.items ?? []).map((item: unknown) => adaptEvent(item as import('@/lib/adapters').ApiServiceItem))

  return (
    <section className="py-16 px-4 bg-slate-50">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-[#010A09]">Événements Premium</h2>
            <p className="text-slate-500">
              Réservez vos billets pour les meilleurs événements
            </p>
          </div>
          <Button 
            variant="outline" 
            className="border-[#44DBD4] text-[#44DBD4] hover:bg-[#44DBD4]/10"
            onClick={() => navigate('/events')}
          >
            Voir tout
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="overflow-hidden"><div className="md:flex"><Skeleton className="md:w-1/3 h-48" /><div className="md:w-2/3 p-6 space-y-3"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div></div></Card>
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <Card 
              key={event.id} 
              className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 bg-white cursor-pointer"
              onClick={() => navigate('/events')}
            >
              <div className="md:flex">
                <div className="md:w-1/3 h-48 md:h-auto relative">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 md:bg-gradient-to-b md:from-transparent md:to-black/30" />
                  <Badge className="absolute top-3 left-3 bg-[#44DBD4] text-white border-0">
                    {event.category}
                  </Badge>
                </div>
                <div className="md:w-2/3">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl text-[#010A09]">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4 text-[#44DBD4]" />
                      <span>{event.location}, {event.country}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#44DBD4]" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#44DBD4]" />
                        <span>19:00</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-2xl font-bold text-[#010A09]">
                          {formatPrice(event.price, event.currency)}
                        </span>
                        <span className="text-sm text-slate-500 ml-1">/ billet</span>
                      </div>
                      <Button 
                        className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate('/events')
                        }}
                      >
                        Réserver
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
        )}
      </div>
    </section>
  )
}
