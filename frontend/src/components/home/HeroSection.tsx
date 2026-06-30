import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plane, Hotel, Compass, Users, Search, MapPin, ArrowRightLeft, Minus, Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DatePicker, DateRangePicker } from '@/components/ui/date-picker'
import { useFlightSearch } from '@/hooks/useFlights'
import { useHotels } from '@/hooks/useServices'
import { toast } from 'sonner'

type SearchTab = 'flights' | 'hotels' | 'experiences'

export function HeroSection() {
  const [activeTab, setActiveTab] = useState<SearchTab>('flights')
  const [fromDate, setFromDate] = useState<Date | undefined>()
  const [toDate, setToDate] = useState<Date | undefined>()
  const [passengers, setPassengers] = useState(1)
  const [rooms, setRooms] = useState(1)
  const [guests, setGuests] = useState(2)
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [hotelLocation, setHotelLocation] = useState('')
  const [experienceType, setExperienceType] = useState('')
  const navigate = useNavigate()

  // Flight search
  const { data: flightResults, isLoading: flightsLoading } = useFlightSearch({
    origin: origin || undefined,
    destination: destination || undefined,
    departDate: fromDate?.toISOString().split('T')[0],
    returnDate: toDate?.toISOString().split('T')[0],
    passengers,
    cabin: 'economy',
    enabled: activeTab === 'flights' && !!(origin && destination && fromDate),
  })

  // Hotel search
  const { data: hotelResults, isLoading: hotelsLoading } = useHotels({
    location: hotelLocation || undefined,
    checkInDate: fromDate?.toISOString().split('T')[0],
    checkOutDate: toDate?.toISOString().split('T')[0],
    guests: rooms * 2, // Approximate guests per room
    enabled: activeTab === 'hotels' && !!(hotelLocation && fromDate && toDate),
  })

  const handleSearch = () => {
    switch (activeTab) {
      case 'flights':
        if (!origin || !destination || !fromDate) {
          toast.error('Veuillez remplir tous les champs pour la recherche de vols')
          return
        }
        navigate('/flights', {
          state: {
            searchParams: {
              origin,
              destination,
              departDate: fromDate?.toISOString().split('T')[0],
              returnDate: toDate?.toISOString().split('T')[0],
              passengers,
              cabin: 'economy'
            }
          }
        })
        break
      case 'hotels':
        if (!hotelLocation || !fromDate || !toDate) {
          toast.error('Veuillez remplir tous les champs pour la recherche d\'hôtels')
          return
        }
        navigate('/hotels', {
          state: {
            searchParams: {
              location: hotelLocation,
              checkInDate: fromDate?.toISOString().split('T')[0],
              checkOutDate: toDate?.toISOString().split('T')[0],
              rooms,
              guests
            }
          }
        })
        break
      case 'experiences':
        navigate('/discover', {
          state: {
            searchParams: {
              type: experienceType,
              date: fromDate?.toISOString().split('T')[0]
            }
          }
        })
        break
    }
  }

  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/assets/images/hero-bg.jpeg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#010A09]/90 via-[#010A09]/70 to-[#010A09]/50" />
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-16 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Hero Title */}
          <div className="text-white">
            <div className="flex items-center gap-3 mb-6">
              <img src="/assets/images/logo.png" alt="Traveo" className="h-16 w-16 object-contain" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Planifiez Votre
              <span className="block text-[#44DBD4]">Prochaine Aventure</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg">
              Vols, hôtels, visas et expériences - tout en un seul endroit pour des voyages inoubliables.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white px-8"
                onClick={() => navigate('/discover')}
              >
                <Compass className="mr-2 h-5 w-5" />
                Découvrir
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 px-8"
                onClick={() => navigate('/my-trips')}
              >
                Mes Voyages
              </Button>
            </div>
          </div>

          {/* Search Card */}
          <Card className="overflow-hidden shadow-2xl bg-white border-0 rounded-2xl">
            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              <button
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-all relative ${
                  activeTab === 'flights'
                    ? 'text-[#44DBD4]'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
                onClick={() => setActiveTab('flights')}
              >
                <Plane className="h-5 w-5" />
                Vols
                {activeTab === 'flights' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#44DBD4]" />
                )}
              </button>
              <button
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-all relative ${
                  activeTab === 'hotels'
                    ? 'text-[#44DBD4]'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
                onClick={() => setActiveTab('hotels')}
              >
                <Hotel className="h-5 w-5" />
                Hôtels
                {activeTab === 'hotels' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#44DBD4]" />
                )}
              </button>
              <button
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-all relative ${
                  activeTab === 'experiences'
                    ? 'text-[#44DBD4]'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
                onClick={() => setActiveTab('experiences')}
              >
                <Compass className="h-5 w-5" />
                Expériences
                {activeTab === 'experiences' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#44DBD4]" />
                )}
              </button>
            </div>

            <div className="p-6">

            {/* Flight Search Form */}
            {activeTab === 'flights' && (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium text-slate-700">De</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44DBD4]" />
                      <Input
                        placeholder="Ville ou aéroport de départ"
                        className="pl-10 border-slate-200 focus:border-[#44DBD4]"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-end pb-2">
                    <button
                      className="p-2 rounded-full bg-slate-100 hover:bg-[#44DBD4]/10 text-slate-400 hover:text-[#44DBD4] transition-colors"
                      onClick={() => {
                        const temp = origin
                        setOrigin(destination)
                        setDestination(temp)
                      }}
                    >
                      <ArrowRightLeft className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium text-slate-700">À</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44DBD4]" />
                      <Input
                        placeholder="Ville ou aéroport d'arrivée"
                        className="pl-10 border-slate-200 focus:border-[#44DBD4]"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Dates</label>
                    <DateRangePicker
                      fromDate={fromDate}
                      toDate={toDate}
                      onFromDateChange={setFromDate}
                      onToDateChange={setToDate}
                      fromPlaceholder="Départ"
                      toPlaceholder="Retour"
                      minDate={new Date()}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Passagers</label>
                    <div className="flex items-center justify-between p-2 border border-slate-200 rounded-md hover:border-[#44DBD4] transition-colors">
                      <button
                        className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-[#44DBD4] disabled:opacity-50"
                        onClick={() => setPassengers(Math.max(1, passengers - 1))}
                        disabled={passengers <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#44DBD4]" />
                        <span className="font-medium text-slate-900">{passengers}</span>
                      </div>
                      <button
                        className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-[#44DBD4]"
                        onClick={() => setPassengers(passengers + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
                  size="lg"
                  onClick={handleSearch}
                  disabled={flightsLoading}
                >
                  {flightsLoading ? (
                    <>Recherche en cours...</>
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" />
                      Rechercher des vols
                    </>
                  )}
                </Button>

                {/* Show search results preview if available */}
                {flightResults && flightResults.results && flightResults.results.length > 0 && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">
                      {flightResults.results.length} vol(s) trouvé(s). Cliquez pour voir tous les résultats.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Hotel Search Form */}
            {activeTab === 'hotels' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44DBD4]" />
                    <Input
                      placeholder="Ville, région ou hôtel"
                      className="pl-10 border-slate-200 focus:border-[#44DBD4]"
                      value={hotelLocation}
                      onChange={(e) => setHotelLocation(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Dates de séjour</label>
                  <DateRangePicker
                    fromDate={fromDate}
                    toDate={toDate}
                    onFromDateChange={setFromDate}
                    onToDateChange={setToDate}
                    fromPlaceholder="Arrivée"
                    toPlaceholder="Départ"
                    minDate={new Date()}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Chambres</label>
                    <div className="flex items-center justify-between p-2 border border-slate-200 rounded-md hover:border-[#44DBD4] transition-colors">
                      <button
                        className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-[#44DBD4] disabled:opacity-50"
                        onClick={() => setRooms(Math.max(1, rooms - 1))}
                        disabled={rooms <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-medium text-slate-900">{rooms}</span>
                      <button
                        className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-[#44DBD4]"
                        onClick={() => setRooms(rooms + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Invités</label>
                    <div className="flex items-center justify-between p-2 border border-slate-200 rounded-md hover:border-[#44DBD4] transition-colors">
                      <button
                        className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-[#44DBD4] disabled:opacity-50"
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        disabled={guests <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#44DBD4]" />
                        <span className="font-medium text-slate-900">{guests}</span>
                      </div>
                      <button
                        className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-[#44DBD4]"
                        onClick={() => setGuests(guests + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
                  size="lg"
                  onClick={handleSearch}
                  disabled={hotelsLoading}
                >
                  {hotelsLoading ? (
                    <>Recherche en cours...</>
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" />
                      Rechercher des hôtels
                    </>
                  )}
                </Button>

                {/* Show search results preview if available */}
                {hotelResults && hotelResults.items && hotelResults.items.length > 0 && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">
                      {hotelResults.items.length} hôtel(s) trouvé(s). Cliquez pour voir tous les résultats.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Experiences Search Form */}
            {activeTab === 'experiences' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#44DBD4]" />
                    <Input
                      placeholder="Où souhaitez-vous aller?"
                      className="pl-10 border-slate-200 focus:border-[#44DBD4]"
                      value={hotelLocation}
                      onChange={(e) => setHotelLocation(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Date</label>
                  <DatePicker
                    date={fromDate}
                    onDateChange={setFromDate}
                    placeholder="Sélectionner une date"
                    minDate={new Date()}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Type d'activité</label>
                  <Input
                    placeholder="Restaurants, guides, événements..."
                    className="border-slate-200 focus:border-[#44DBD4]"
                    value={experienceType}
                    onChange={(e) => setExperienceType(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
                  size="lg"
                  onClick={handleSearch}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Découvrir des expériences
                </Button>
              </div>
            )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
