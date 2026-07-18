import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Star, Banknote, SlidersHorizontal, Users, CheckCircle, Loader2, Filter, Utensils, UtensilsCrossed } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { DatePicker } from '@/components/ui/date-picker'
import { formatPrice } from '@/lib/formatters'
import { useRestaurants, useBookRestaurant } from '@/hooks/useServices'
import { adaptRestaurant } from '@/lib/adapters'
import { toast } from 'sonner'
import { useQueries } from '@tanstack/react-query'

const priceRanges = [
  { value: 'all', label: 'Tous les prix' },
  { value: '0-30', label: '0 - 30 FCFA' },
  { value: '30-60', label: '30 - 60 FCFA' },
  { value: '60-100', label: '60 - 100 FCFA' },
  { value: '100+', label: 'Plus de 100 FCFA' },
]

const ratingFilters = [
  { value: 'all', label: 'Toutes les notes' },
  { value: '4.5', label: '4.5+ étoiles' },
  { value: '4.0', label: '4.0+ étoiles' },
  { value: '3.5', label: '3.5+ étoiles' },
]

const cuisineTypes = [
  'Japonaise', 'Chinoise', 'Italienne', 'Française', 'Internationale', 'Fusion', 'Traditionnelle'
]

const sortOptions = [
  { value: 'rating', label: 'Mieux notés' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'reviews', label: 'Plus d\'avis' },
]

export function RestaurantsPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const { data, isLoading } = useRestaurants({ page: 1, limit: 20, search: searchQuery || undefined })
  const bookRestaurantMutation = useBookRestaurant()
  type RestaurantItem = ReturnType<typeof adaptRestaurant>
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantItem | null>(null)
  const [showReservationDialog, setShowReservationDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [reservationComplete, setReservationComplete] = useState(false)
  const [reservationReference, setReservationReference] = useState('')
  const [reservationData, setReservationData] = useState({
    date: undefined as Date | undefined,
    time: '19:00',
    guests: 2,
    specialRequests: '',
  })

  // Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    priceRange: 'all',
    rating: 'all',
    cuisines: [] as string[],
    sortBy: 'rating',
  })
  const [appliedFilters, setAppliedFilters] = useState({
    priceRange: 'all',
    rating: 'all',
    cuisines: [] as string[],
    sortBy: 'rating',
  })

  const handleOpenReservation = (restaurant: RestaurantItem, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedRestaurant(restaurant)
    setShowReservationDialog(true)
    setReservationComplete(false)
    setReservationData({ date: undefined, time: '19:00', guests: 2, specialRequests: '' })
  }

  const handleReservation = async () => {
    if (!selectedRestaurant || !reservationData.date) return
    setIsProcessing(true)
    try {
      const res = await bookRestaurantMutation.mutateAsync({ id: selectedRestaurant.id, reservationDate: reservationData.date.toISOString(), covers: reservationData.guests })
      setReservationReference(res.bookingId.slice(0,8).toUpperCase())
      setReservationComplete(true)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur de réservation')
    } finally {
      setIsProcessing(false)
    }
  }

  const closeDialog = () => {
    setShowReservationDialog(false)
    setSelectedRestaurant(null)
    setReservationComplete(false)
  }

  const timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
  ]

  const filterByPriceRange = (price: number, range: string): boolean => {
    switch (range) {
      case '0-30':
        return price >= 0 && price <= 30
      case '30-60':
        return price > 30 && price <= 60
      case '60-100':
        return price > 60 && price <= 100
      case '100+':
        return price > 100
      default:
        return true
    }
  }

  const filterByRating = (rating: number, filter: string): boolean => {
    if (filter === 'all') return true
    return rating >= parseFloat(filter)
  }

  const filterByCuisines = (cuisine: string, selectedCuisines: string[]): boolean => {
    if (selectedCuisines.length === 0) return true
    return selectedCuisines.includes(cuisine)
  }

  const toggleCuisine = (cuisine: string) => {
    setFilters(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter(c => c !== cuisine)
        : [...prev.cuisines, cuisine]
    }))
  }

  const filteredRestaurants = (data?.items ?? []).map(item => adaptRestaurant(item as unknown as import('@/lib/adapters').ApiServiceItem))
    .filter(restaurant => {
      const matchesPrice = filterByPriceRange(restaurant.averagePrice, appliedFilters.priceRange)
      const matchesRating = filterByRating(restaurant.rating, appliedFilters.rating)
      const matchesCuisine = filterByCuisines(restaurant.cuisine, appliedFilters.cuisines)
      return matchesPrice && matchesRating && matchesCuisine
    })
    .sort((a, b) => {
      switch (appliedFilters.sortBy) {
        case 'rating': return b.rating - a.rating
        case 'price_asc': return a.averagePrice - b.averagePrice
        case 'price_desc': return b.averagePrice - a.averagePrice
        case 'reviews': return b.reviewCount - a.reviewCount
        default: return 0
      }
    })

  // Fetch menu items for each restaurant using useQueries
  const restaurantIds = filteredRestaurants.map(r => r.id)
  const menuItemsQueries = useQueries({
    queries: restaurantIds.map(id => ({
      queryKey: ['menu-items', id],
      queryFn: async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/service-items/restaurants/${id}/menu-items`)
        const data = await response.json()
        return data.data || data
      },
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    }))
  })
  const menuItemsCountMap = new Map(restaurantIds.map((id, i) => [id, (menuItemsQueries[i].data ?? []).length]))

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters })
    setIsFilterOpen(false)
  }

  const handleClearFilters = () => {
    const defaultFilters = {
      priceRange: 'all',
      rating: 'all',
      cuisines: [],
      sortBy: 'rating',
    }
    setFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
    setIsFilterOpen(false)
  }

  const activeFilterCount = Object.entries(appliedFilters).filter(([key, value]) => {
    if (key === 'priceRange') return value !== 'all'
    if (key === 'rating') return value !== 'all'
    if (key === 'cuisines') return (value as string[]).length > 0
    if (key === 'sortBy') return value !== 'rating'
    return false
  }).length

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#44DBD4] via-[#44DBD4] to-[#3bc9c2] py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Restaurants & Gastronomie
          </h1>
          <p className="text-white/90 mb-8">
            Découvrez les meilleurs restaurants de vos destinations
          </p>

          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un restaurant ou une cuisine..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button 
                  variant="outline" 
                  className="relative"
                  onClick={() => setIsFilterOpen(true)}
                >
                  <SlidersHorizontal className="h-5 w-5" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-[#44DBD4] text-white text-xs rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Restaurants disponibles</h2>
          <p className="text-muted-foreground">
              {isLoading ? '...' : `${filteredRestaurants.length} établissements trouvés`}
            </p>
          </div>
          <Select value={appliedFilters.sortBy} onValueChange={(value) => {
            setFilters({ ...filters, sortBy: value })
            setAppliedFilters({ ...appliedFilters, sortBy: value })
          }}>
            <SelectTrigger className="w-[180px] border-slate-200">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredRestaurants.length === 0 ? (
          <Card className="p-8 text-center">
            <Utensils className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Aucun restaurant trouvé</h3>
            <p className="text-slate-500 mb-4">Essayez de modifier vos critères de recherche ou vos filtres</p>
            <Button variant="outline" onClick={handleClearFilters}>
              Réinitialiser les filtres
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <Card
                key={restaurant.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/restaurants/${restaurant.id}`)}
              >
                <div className="relative h-48">
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-3 left-3 bg-[#44DBD4]/90">
                    {restaurant.cuisine}
                  </Badge>
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 px-2 py-1 rounded">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{restaurant.rating}</span>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2">
                    <span>{restaurant.name}</span>
                    <span className="text-lg font-normal text-muted-foreground">
                      {restaurant.priceRange}
                    </span>
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{restaurant.location}, {restaurant.country}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {restaurant.description}
                  </p>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{restaurant.rating}</span>
                    </div>
                    <span className="text-muted-foreground">
                      ({restaurant.reviewCount} avis)
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Prix moyen
                      </div>
                      <div className="text-2xl font-bold text-[#44DBD4] flex items-center gap-1">
                        <Banknote className="h-5 w-5" />
                        {formatPrice(restaurant.averagePrice, restaurant.currency)}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <UtensilsCrossed className="h-3 w-3" />
                        <span>{menuItemsCountMap.get(restaurant.id) || 0} articles</span>
                      </div>
                    </div>
                    <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={(e) => handleOpenReservation(restaurant, e)}>
                      Réserver une table
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Filter Sheet */}
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent className="w-full sm:max-w-md bg-white overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold text-slate-900">Filtres</SheetTitle>
            <SheetDescription className="text-slate-600">
              Affinez votre recherche de restaurants
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            {/* Price Range */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Banknote className="h-4 w-4 text-[#44DBD4]" />
                Prix moyen
              </label>
              <Select 
                value={filters.priceRange} 
                onValueChange={(value) => setFilters({ ...filters, priceRange: value })}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Sélectionner une gamme" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {priceRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rating Filter */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Star className="h-4 w-4 text-[#44DBD4]" />
                Note minimum
              </label>
              <Select 
                value={filters.rating} 
                onValueChange={(value) => setFilters({ ...filters, rating: value })}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {ratingFilters.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cuisine Types */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Utensils className="h-4 w-4 text-[#44DBD4]" />
                Type de cuisine
              </label>
              <div className="flex flex-wrap gap-2">
                {cuisineTypes.map((cuisine) => (
                  <Button
                    key={cuisine}
                    type="button"
                    variant={filters.cuisines.includes(cuisine) ? "default" : "outline"}
                    size="sm"
                    className={filters.cuisines.includes(cuisine) 
                      ? "bg-[#44DBD4] hover:bg-[#3bc9c2] text-white border-[#44DBD4]" 
                      : "border-slate-200 text-slate-600 hover:border-[#44DBD4] hover:text-[#44DBD4]"
                    }
                    onClick={() => toggleCuisine(cuisine)}
                  >
                    {cuisine}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#44DBD4]" />
                Trier par
              </label>
              <Select 
                value={filters.sortBy} 
                onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter className="flex-col gap-2 sm:flex-col">
            <div className="flex gap-3 w-full">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleClearFilters}
              >
                Réinitialiser
              </Button>
              <Button 
                className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
                onClick={handleApplyFilters}
              >
                Appliquer
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Reservation Dialog */}
      <Dialog open={showReservationDialog} onOpenChange={setShowReservationDialog}>
        <DialogContent className="sm:max-w-md bg-white">
          {reservationComplete ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Réservation confirmée!
                </DialogTitle>
                <DialogDescription>
                  Votre table a été réservée avec succès.
                </DialogDescription>
              </DialogHeader>
              <div className="py-6 text-center">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Référence de réservation</p>
                  <p className="text-2xl font-bold text-[#44DBD4]">{reservationReference}</p>
                </div>
                {selectedRestaurant && (
                  <div className="text-left space-y-2 text-sm">
                    <p><strong>Restaurant:</strong> {selectedRestaurant.name}</p>
                    <p><strong>Date:</strong> {reservationData.date?.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p><strong>Heure:</strong> {reservationData.time}</p>
                    <p><strong>Convives:</strong> {reservationData.guests}</p>
                    {reservationData.specialRequests && (
                      <p><strong>Demandes spéciales:</strong> {reservationData.specialRequests}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={closeDialog}>
                  Fermer
                </Button>
                <Button className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => navigate('/my-trips')}>
                  Voir mes voyages
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Réserver une table</DialogTitle>
                <DialogDescription>
                  {selectedRestaurant?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                {selectedRestaurant && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <img 
                      src={selectedRestaurant.imageUrl} 
                      alt={selectedRestaurant.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-semibold">{selectedRestaurant.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedRestaurant.cuisine}</p>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{selectedRestaurant.rating}</span>
                        <span className="text-muted-foreground">({selectedRestaurant.reviewCount} avis)</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <DatePicker
                      date={reservationData.date}
                      onDateChange={(date) => setReservationData(prev => ({ ...prev, date }))}
                      placeholder="Sélectionner une date"
                      minDate={new Date()}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Heure</label>
                    <Select 
                      value={reservationData.time} 
                      onValueChange={(v) => setReservationData(prev => ({ ...prev, time: v }))}
                    >
                      <SelectTrigger className="border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {timeSlots.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre de convives</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="number" 
                        min="1" 
                        max="20"
                        className="pl-10 border-slate-200"
                        value={reservationData.guests}
                        onChange={(e) => setReservationData(prev => ({ ...prev, guests: parseInt(e.target.value) || 1 }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Demandes spéciales (optionnel)</label>
                    <textarea
                      className="w-full border rounded-md px-3 py-2 text-sm min-h-[80px] border-slate-200"
                      placeholder="Allergies, préférences de table, occasion spéciale..."
                      value={reservationData.specialRequests}
                      onChange={(e) => setReservationData(prev => ({ ...prev, specialRequests: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={closeDialog}>
                  Annuler
                </Button>
                <Button 
                  className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" 
                  onClick={handleReservation}
                  disabled={isProcessing || !reservationData.date}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Traitement...
                    </>
                  ) : (
                    'Confirmer la réservation'
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
