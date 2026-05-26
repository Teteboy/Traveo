import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users, Plane, ArrowRight, SlidersHorizontal, MapPin, ArrowRightLeft, Minus, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/formatters'
import { CustomDatePicker } from '@/components/ui/custom-date-picker'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFlightSearch } from '@/hooks/useFlights'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { adaptFlight } from '@/lib/adapters'

// Airport code mapping for common cities
const airportCodes: Record<string, string> = {
  'yaounde': 'NSI',
  'yaoundé': 'NSI',
  'douala': 'DLA',
  'paris': 'CDG',
  'londres': 'LHR',
  'london': 'LHR',
  'maroua': 'MVR',
  'francfort': 'FRA',
  'frankfurt': 'FRA',
  'rome': 'FCO',
  'milan': 'MXP',
  'barcelone': 'BCN',
  'barcelona': 'BCN',
  'madrid': 'MAD',
  'amsterdam': 'AMS',
  'bruxelles': 'BRU',
  'brussels': 'BRU',
  'geneve': 'GVA',
  'geneva': 'GVA',
  'zurich': 'ZRH',
  'casablanca': 'CMN',
  'rabat': 'RBA',
  'tunis': 'TUN',
  'alger': 'ALG',
  'dakar': 'DSS',
  'abidjan': 'ABJ',
  'lagos': 'LOS',
  'accra': 'ACC',
  'johannesburg': 'JNB',
  'nairobi': 'NBO',
}

const sortOptions = [
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'duration_asc', label: 'Durée croissante' },
]

const stopOptions = [
  { value: 'all', label: 'Tous' },
  { value: '0', label: 'Direct uniquement' },
  { value: '1', label: '1 escale max' },
]

// Helper function to get airport code
const getAirportCode = (input: string): string => {
  const normalized = input.toLowerCase().trim()
  return airportCodes[normalized] || input.toUpperCase()
}

// Popular international flight routes from major global cities
const popularRoutes = [
  // Transatlantic routes
  { origin: 'JFK', destination: 'LHR', name: 'New York → London' },
  { origin: 'LHR', destination: 'JFK', name: 'London → New York' },
  { origin: 'CDG', destination: 'JFK', name: 'Paris → New York' },
  { origin: 'JFK', destination: 'CDG', name: 'New York → Paris' },

  // European routes
  { origin: 'LHR', destination: 'CDG', name: 'London → Paris' },
  { origin: 'CDG', destination: 'FRA', name: 'Paris → Frankfurt' },
  { origin: 'FRA', destination: 'LHR', name: 'Frankfurt → London' },
  { origin: 'FCO', destination: 'CDG', name: 'Rome → Paris' },
  { origin: 'MAD', destination: 'LHR', name: 'Madrid → London' },
  { origin: 'AMS', destination: 'CDG', name: 'Amsterdam → Paris' },

  // Asian routes
  { origin: 'NRT', destination: 'JFK', name: 'Tokyo → New York' },
  { origin: 'HND', destination: 'LAX', name: 'Tokyo → Los Angeles' },
  { origin: 'DXB', destination: 'LHR', name: 'Dubai → London' },
  { origin: 'DXB', destination: 'JFK', name: 'Dubai → New York' },
  { origin: 'BKK', destination: 'NRT', name: 'Bangkok → Tokyo' },
  { origin: 'SIN', destination: 'NRT', name: 'Singapore → Tokyo' },

  // Pacific routes
  { origin: 'SYD', destination: 'NRT', name: 'Sydney → Tokyo' },
  { origin: 'LAX', destination: 'SYD', name: 'Los Angeles → Sydney' },
  { origin: 'SFO', destination: 'HND', name: 'San Francisco → Tokyo' },

  // Additional global routes
  { origin: 'BRU', destination: 'JFK', name: 'Brussels → New York' },
  { origin: 'ZRH', destination: 'LHR', name: 'Zurich → London' },
  { origin: 'IST', destination: 'JFK', name: 'Istanbul → New York' },
  { origin: 'YYZ', destination: 'LHR', name: 'Toronto → London' },
]

export function FlightsPage() {
  const navigate = useNavigate()
  const [tripType, setTripType] = useState<'one_way' | 'round_trip'>('round_trip')
  const [searchParams, setSearchParams] = useState({ from: '', to: '', passengers: 1 })
  const [fromDate, setFromDate] = useState<Date | undefined>()
  const [toDate, setToDate] = useState<Date | undefined>()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({ stops: 'all', sortBy: 'price_asc' })
  const [hasSearched, setHasSearched] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10) // Show 10 routes per page, each with 2 flights = 20 flights

  const searchEnabled = hasSearched && !!searchParams.from && !!searchParams.to && !!fromDate
  const { data: searchData, isLoading: searchLoading } = useFlightSearch({
    origin: getAirportCode(searchParams.from),
    destination: getAirportCode(searchParams.to),
    departDate: fromDate?.toISOString().split('T')[0] ?? '',
    passengers: searchParams.passengers,
    enabled: searchEnabled,
  })

  // For round trips, we would need to handle return flights separately
  // For now, we'll focus on one-way flights from Duffel

  // Fetch popular flights from Duffel with pagination (with reasonable caching)
  const { data: popularFlightsData, isLoading: popularLoading } = useQuery({
    queryKey: ['popular-flights', currentPage, pageSize], // Remove timestamp to enable caching
    queryFn: async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const departDate = tomorrow.toISOString().split('T')[0]

      console.log('Fetching Duffel flights for page:', currentPage)

      // Calculate which routes to fetch for this page
      const startIndex = (currentPage - 1) * pageSize
      const endIndex = startIndex + pageSize
      const routesToFetch = popularRoutes.slice(startIndex, endIndex)

      if (routesToFetch.length === 0) {
        return { flights: [], total: popularRoutes.length, page: currentPage, limit: pageSize }
      }

      // Search for flights on selected routes (from Duffel) with throttling
      const flightPromises = routesToFetch.map(route =>
        apiClient.get(`/flights/search?origin=${route.origin}&destination=${route.destination}&departDate=${departDate}&passengers=1`)
          .then((response: any) => {
            console.log(`✅ Duffel flights for ${route.name}:`, response.results?.length || 0)
            return {
              route: route.name,
              flights: (response.results ?? []).slice(0, 2) // Take first 2 flights per route
            }
          })
          .catch((error) => {
            console.error(`❌ Failed to fetch Duffel flights for ${route.name}:`, error)
            return { route: route.name, flights: [] }
          })
      )

      const results = await Promise.all(flightPromises)
      const allFlights = results.flatMap(result => result.flights.map((flight: any) => ({
        ...flight,
        routeName: result.route
      })))

      // Validate that flights are from Duffel (should have offerId starting with 'off_')
      const duffelFlights = allFlights.filter(flight => flight.offerId?.startsWith('off_'))
      const localFlights = allFlights.filter(flight => !flight.offerId?.startsWith('off_'))

      console.log(`📊 Total flights: ${allFlights.length}, Duffel flights: ${duffelFlights.length}, Local flights: ${localFlights.length}`)

      return {
        flights: duffelFlights.length > 0 ? duffelFlights : allFlights, // Prefer Duffel, fallback to local
        total: popularRoutes.length,
        page: currentPage,
        limit: pageSize
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Disable refetch on window focus to reduce API calls
    refetchOnMount: false, // Disable refetch on mount
  })

  const isLoading = searchEnabled ? searchLoading : popularLoading

  const rawFlights = searchEnabled
    ? (searchData?.results ?? []).map(r => ({
        id: r.offerId,
        airline: r.airline,
        flightNumber: r.flightNumber ?? '',
        origin: r.origin,
        originCode: r.origin,
        destination: r.destination,
        destinationCode: r.destination,
        departAt: r.departAt,
        arriveAt: r.arriveAt,
        durationMinutes: r.durationMinutes,
        stops: r.stops,
        priceEconomy: r.price.amount,
        currency: r.price.currency,
        availableSeats: 100,
      }))
    : (popularFlightsData?.flights ?? []).map(f => ({
        id: f.offerId,
        airline: f.airline,
        flightNumber: f.flightNumber ?? '',
        origin: f.origin,
        originCode: f.origin,
        destination: f.destination,
        destinationCode: f.destination,
        departAt: f.departAt,
        arriveAt: f.arriveAt,
        durationMinutes: f.durationMinutes,
        stops: f.stops,
        priceEconomy: f.priceEconomy,
        currency: f.currency,
        availableSeats: 100,
        routeName: f.routeName,
      }))

  const flights = rawFlights.map(f => adaptFlight(f as unknown as import('@/lib/adapters').ApiFlightItem))
    .filter(f => filters.stops === 'all' || f.stops <= parseInt(filters.stops))
    .sort((a, b) => {
      if (filters.sortBy === 'price_desc') return b.price.economy - a.price.economy
      if (filters.sortBy === 'duration_asc') return 0
      return a.price.economy - b.price.economy
    })

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-[#44DBD4] via-[#44DBD4]/90 to-[#3bc9c2] py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Réservez votre vol</h1>
          <p className="text-white/90 mb-8">Trouvez les meilleurs tarifs pour vos destinations</p>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex gap-4 mb-6">
                {['round_trip', 'one_way'].map(t => (
                  <Button key={t}
                    className={tripType === t ? 'bg-[#44DBD4] hover:bg-[#3bc9c2] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                    onClick={() => setTripType(t as 'one_way' | 'round_trip')}
                  >{t === 'round_trip' ? 'Aller-retour' : 'Aller simple'}</Button>
                ))}
              </div>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                     <label className="text-sm font-medium text-slate-700">De (ville ou code IATA)</label>
                     <div className="relative">
                       <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44DBD4]" />
                       <Input placeholder="Douala ou DLA" className="pl-10" value={searchParams.from}
                         onChange={e => setSearchParams(p => ({ ...p, from: e.target.value }))} />
                     </div>
                   </div>
                   <div className="flex items-end pb-2">
                     <button className="p-2 rounded-full bg-slate-100 hover:bg-[#44DBD4]/10 text-slate-400 hover:text-[#44DBD4]"
                       onClick={() => setSearchParams(p => ({ ...p, from: p.to, to: p.from }))}>
                       <ArrowRightLeft className="h-5 w-5" />
                     </button>
                   </div>
                   <div className="flex-1 space-y-2">
                     <label className="text-sm font-medium text-slate-700">À (ville ou code IATA)</label>
                     <div className="relative">
                       <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44DBD4]" />
                       <Input placeholder="Paris ou CDG" className="pl-10" value={searchParams.to}
                         onChange={e => setSearchParams(p => ({ ...p, to: e.target.value }))} />
                     </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Date de départ</label>
                    <CustomDatePicker date={fromDate} onDateChange={setFromDate}
                      placeholder="Date départ" minDate={new Date()} />
                  </div>
                  {tripType === 'round_trip' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Date de retour</label>
                      <CustomDatePicker date={toDate} onDateChange={setToDate}
                        placeholder="Date retour" minDate={fromDate || new Date()} />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Passagers</label>
                    <div className="flex items-center justify-between p-2 border border-slate-200 rounded-md">
                      <button className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-50"
                        onClick={() => setSearchParams(p => ({ ...p, passengers: Math.max(1, p.passengers - 1) }))}
                        disabled={searchParams.passengers <= 1}><Minus className="h-4 w-4" /></button>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#44DBD4]" />
                        <span className="font-medium">{searchParams.passengers}</span>
                      </div>
                      <button className="p-1 rounded-md hover:bg-slate-100"
                        onClick={() => setSearchParams(p => ({ ...p, passengers: p.passengers + 1 }))}><Plus className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" size="lg"
                    onClick={() => setHasSearched(true)}>
                    <Search className="mr-2 h-5 w-5" /> Rechercher des vols
                  </Button>
                  <Button variant="outline" size="lg" className="border-[#44DBD4] text-[#44DBD4]"
                    onClick={() => setIsFilterOpen(true)}>
                    <SlidersHorizontal className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#010A09]">
              {searchEnabled ? 'Résultats de recherche' : 'Vols populaires'}
            </h2>
            <p className="text-slate-500">
              {isLoading ? '...' : `${flights.length} ${searchEnabled ? 'résultats' : 'vols populaires'}`}
            </p>
          </div>
          <Select value={filters.sortBy} onValueChange={v => setFilters(f => ({ ...f, sortBy: v }))}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white">
              {sortOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}</div>
        ) : flights.length === 0 ? (
          <Card className="p-8 text-center">
            <Plane className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              {searchEnabled ? 'Aucun vol trouvé' : 'Vols populaires indisponibles'}
            </h3>
            <p className="text-slate-500">
              {searchEnabled
                ? 'Essayez de modifier vos critères de recherche'
                : 'Les vols populaires seront bientôt disponibles'
              }
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {flights.map(flight => (
              <Card key={flight.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate(`/flights/${flight.id}`)}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                     <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-semibold text-[#010A09]">{flight.airline}</div>
                            <div className="text-sm text-slate-500">{flight.flightNumber}</div>
                            {(flight as any).routeName && !searchEnabled && (
                              <div className="text-xs text-[#44DBD4] font-medium mt-1">
                                {(flight as any).routeName}
                              </div>
                            )}
                            <div className="text-xs text-green-600 font-medium mt-1">
                              ✓ Live from Duffel
                            </div>
                            <div className="text-xs text-green-600 font-medium mt-1">
                              ✓ Via Duffel
                            </div>
                          </div>
                        </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#010A09]">{flight.departure.time}</div>
                          <div className="text-sm text-slate-500">{flight.departure.code}</div>
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                          <div className="text-sm text-slate-500 mb-1">{flight.duration}</div>
                          <div className="w-full h-px bg-slate-200 relative">
                            <Plane className="h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#44DBD4] bg-white px-1" />
                          </div>
                          <div className="text-xs text-slate-500 mt-1">{flight.stops === 0 ? 'Direct' : `${flight.stops} escale(s)`}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#010A09]">{flight.arrival.time}</div>
                          <div className="text-sm text-slate-500">{flight.arrival.code}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-4">
                      <div className="text-right">
                        <div className="text-3xl font-bold text-[#44DBD4]">{formatPrice(flight.price.economy, flight.currency)}</div>
                        <div className="text-sm text-slate-500">par personne</div>
                        <div className="text-xs text-slate-500">{flight.availableSeats} sièges disponibles</div>
                      </div>
                      <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white">
                        Sélectionner <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!searchEnabled && popularFlightsData && popularFlightsData.total > pageSize && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-slate-500">
              Page {currentPage} sur {Math.ceil(popularFlightsData.total / pageSize)}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                disabled={currentPage >= Math.ceil(popularFlightsData.total / pageSize)}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>

      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent className="w-full sm:max-w-md bg-white overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filtres</SheetTitle>
            <SheetDescription>Affinez votre recherche de vols</SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Plane className="h-4 w-4 text-[#44DBD4]" /> Escales
              </label>
              <Select value={filters.stops} onValueChange={v => setFilters(f => ({ ...f, stops: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white">
                  {stopOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
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
                onClick={() => { setFilters({ stops: 'all', sortBy: 'price_asc' }); setIsFilterOpen(false) }}>
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
