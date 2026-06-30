import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Hotel, Star, MapPin, Wifi, SlidersHorizontal, Heart, Bed } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-picker'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { formatPrice } from '@/lib/formatters'
import { useHotels, useDuffelHotels } from '@/hooks/useServices'
import { useHotelRooms } from '@/hooks/useServiceItems'
import { adaptHotel } from '@/lib/adapters'
import { useQueries } from '@tanstack/react-query'

const sortOptions = [
  { value: 'recommended', label: 'Recommandés' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'rating_desc', label: 'Mieux notés' },
]

const starRatings = [
  { value: 'all', label: 'Toutes catégories' },
  { value: '5', label: '5 étoiles' },
  { value: '4', label: '4 étoiles et plus' },
  { value: '3', label: '3 étoiles et plus' },
]

export function HotelsPage() {
  const navigate = useNavigate()
  const [destination, setDestination] = useState('')
  const [checkInDate, setCheckInDate] = useState<Date | undefined>()
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>()
  const [_guests, _setGuests] = useState(2)
  const [savedHotels, setSavedHotels] = useState<Set<string>>(new Set())
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({ sortBy: 'recommended', starRating: 'all' })
  const [search, setSearch] = useState('')
  const [duffelEnabled, setDuffelEnabled] = useState(false)

  const { data, isLoading } = useHotels({ page: 1, limit: 20, search: search || undefined })
  const { data: duffelData, isLoading: duffelLoading } = useDuffelHotels({
    location: duffelEnabled ? destination : undefined,
    checkInDate: duffelEnabled && checkInDate ? checkInDate.toISOString().split('T')[0] : undefined,
    checkOutDate: duffelEnabled && checkOutDate ? checkOutDate.toISOString().split('T')[0] : undefined,
    guests: 2,
    rooms: 1,
    enabled: duffelEnabled,
  })

  const hotels = (data?.items ?? []).map(item => adaptHotel(item as unknown as import('@/lib/adapters').ApiServiceItem))
    .filter(h => {
      if (filters.starRating === 'all') return true
      return h.starRating >= parseInt(filters.starRating)
    })
    .sort((a, b) => {
      if (filters.sortBy === 'price_asc') return a.price - b.price
      if (filters.sortBy === 'price_desc') return b.price - a.price
      if (filters.sortBy === 'rating_desc') return b.rating - a.rating
      return 0
    })

  // Fetch rooms for each hotel using useQueries
  const hotelIds = hotels.map(h => h.id)
  const roomsQueries = useQueries({
    queries: hotelIds.map(id => ({
      queryKey: ['hotel-rooms', id],
      queryFn: async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/service-items/hotels/${id}/rooms`)
        const data = await response.json()
        return data.data || data
      },
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    }))
  })
  const roomsCountMap = new Map(hotelIds.map((id, i) => [id, (roomsQueries[i].data ?? []).length]))

  const toggleSave = (id: string) => {
    setSavedHotels(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-gradient-to-br from-[#44DBD4] via-[#44DBD4] to-[#3bc9c2] py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Hôtels & Hébergements</h1>
          <p className="text-white/90 mb-8">Trouvez le logement parfait pour votre séjour</p>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Destination ou nom</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Yaoundé, Douala..." className="pl-10" value={destination}
                      onChange={e => setDestination(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dates de séjour</label>
                  <DateRangePicker fromDate={checkInDate} toDate={checkOutDate}
                    onFromDateChange={setCheckInDate} onToDateChange={setCheckOutDate}
                    fromPlaceholder="Date d'arrivée" toPlaceholder="Date de départ" minDate={new Date()} />
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" size="lg"
                    onClick={() => { setSearch(destination); setDuffelEnabled(Boolean(destination && checkInDate && checkOutDate)) }}>
                    <Search className="mr-2 h-5 w-5" /> Rechercher des hôtels
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => setIsFilterOpen(true)}>
                    <SlidersHorizontal className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Hôtels disponibles</h2>
            <p className="text-muted-foreground">{isLoading ? '...' : `${hotels.length} hébergements`}</p>
          </div>
          <Select value={filters.sortBy} onValueChange={v => setFilters(f => ({ ...f, sortBy: v }))}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white">
              {sortOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {duffelEnabled && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Hotel className="h-5 w-5 text-[#44DBD4]" />
                Résultats Duffel
                {duffelLoading && <span className="text-sm text-muted-foreground">(chargement...)</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(duffelData?.results ?? []).length === 0 && !duffelLoading ? (
                <p className="text-sm text-muted-foreground">Aucun résultat Duffel pour cette recherche.</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {(duffelData?.results ?? []).slice(0, 8).map(r => (
                    <div key={r.offerId} className="flex gap-3 p-3 border rounded-lg">
                      {r.imageUrl && <img src={r.imageUrl} alt={r.name} className="w-24 h-24 object-cover rounded" />}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{r.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{r.location}, {r.country}</div>
                        <div className="mt-1 text-[#44DBD4] font-bold">{formatPrice(r.price, r.currency)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="md:flex">
                <Skeleton className="md:w-1/3 h-64" />
                <div className="md:w-2/3 p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </Card>
          ))}</div>
        ) : hotels.length === 0 ? (
          <Card className="p-8 text-center">
            <Hotel className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Aucun hôtel trouvé</h3>
            <p className="text-slate-500">Essayez de modifier votre recherche</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {hotels.map(hotel => (
              <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/hotels/${hotel.id}`)}>
                <div className="md:flex">
                  <div className="md:w-1/3 h-64 md:h-auto relative">
                    <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover" />
                    <Button variant="ghost" size="icon" className="absolute top-3 right-3 bg-white/90 hover:bg-white"
                      onClick={e => { e.stopPropagation(); toggleSave(hotel.id) }}>
                      <Heart className={`h-5 w-5 ${savedHotels.has(hotel.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Badge className="absolute bottom-3 left-3 bg-[#44DBD4]/90">{hotel.starRating} étoiles</Badge>
                  </div>
                  <div className="md:w-2/3 flex flex-col">
                    <CardHeader className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{hotel.name}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <MapPin className="h-4 w-4" />
                            <span>{hotel.location}, {hotel.country}</span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{hotel.description}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {(hotel.amenities ?? []).slice(0, 4).map(a => (
                              <Badge key={a} variant="secondary" className="text-xs">
                                <Wifi className="h-3 w-3 mr-1" />{a}
                              </Badge>
                            ))}
                            {(hotel.amenities?.length ?? 0) > 4 && (
                              <Badge variant="secondary" className="text-xs">+{hotel.amenities.length - 4} autres</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 bg-[#44DBD4] text-white px-2 py-1 rounded">
                              <Star className="h-3 w-3 fill-current" />
                              <span className="text-sm font-semibold">{hotel.rating.toFixed(1)}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">({hotel.reviewCount} avis)</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground mb-1">À partir de</div>
                            <div className="text-3xl font-bold text-[#44DBD4]">{formatPrice(hotel.price, hotel.currency)}</div>
                            <div className="text-xs text-muted-foreground">par nuit</div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Bed className="h-4 w-4" />
                            <span>{roomsCountMap.get(hotel.id) || 0} chambres</span>
                          </div>
                          <Button className="w-full bg-[#44DBD4] hover:bg-[#3bc9c2] text-white">Voir les chambres</Button>
                        </div>
                      </div>
                    </CardHeader>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent className="w-full sm:max-w-md bg-white overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filtres</SheetTitle>
            <SheetDescription>Affinez votre recherche d'hôtels</SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Star className="h-4 w-4 text-[#44DBD4]" /> Catégorie
              </label>
              <Select value={filters.starRating} onValueChange={v => setFilters(f => ({ ...f, starRating: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white">
                  {starRatings.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#44DBD4]" /> Trier par
              </label>
              <Select value={filters.sortBy} onValueChange={v => setFilters(f => ({ ...f, sortBy: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white">
                  {sortOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter>
            <div className="flex gap-3 w-full">
              <Button variant="outline" className="flex-1"
                onClick={() => { setFilters({ sortBy: 'recommended', starRating: 'all' }); setIsFilterOpen(false) }}>
                Réinitialiser
              </Button>
              <Button className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
                onClick={() => setIsFilterOpen(false)}>Appliquer</Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
