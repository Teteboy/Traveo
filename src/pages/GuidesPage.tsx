import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Star, Languages, Award, Clock, Calendar, Users, CheckCircle, Loader2, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// Sheet removed - not used in GuidesPage
import { formatPrice } from '@/lib/formatters'
import { useGuides, useBookGuide } from '@/hooks/useServices'
import { adaptGuide } from '@/lib/adapters'
import { toast } from 'sonner'

const sortOptions = [
  { value: 'rating', label: 'Mieux notés' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
]

export function GuidesPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [selectedGuide, setSelectedGuide] = useState<ReturnType<typeof adaptGuide> | null>(null)
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [bookingReference, setBookingReference] = useState('')
  const [bookingData, setBookingData] = useState({ date: '', time: '09:00', duration: 2, guests: 2, notes: '' })

  const { data, isLoading } = useGuides({ page: 1, limit: 20, search: searchQuery || undefined })
  const bookGuide = useBookGuide()

  const guides = (data?.items ?? []).map(item => adaptGuide(item as unknown as import('@/lib/adapters').ApiServiceItem))
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.pricePerHour - b.pricePerHour
      if (sortBy === 'price_desc') return b.pricePerHour - a.pricePerHour
      return b.rating - a.rating
    })

  const handleOpenBooking = (guide: ReturnType<typeof adaptGuide>, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedGuide(guide)
    setShowBookingDialog(true)
    setBookingComplete(false)
    setBookingData({ date: '', time: '09:00', duration: 2, guests: 2, notes: '' })
  }

  const handleBooking = async () => {
    if (!selectedGuide || !bookingData.date) return
    try {
      const result = await bookGuide.mutateAsync({ id: selectedGuide.id, startDate: bookingData.date, endDate: bookingData.date, guests: bookingData.guests })
      setBookingReference(result.bookingId)
      setBookingComplete(true)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la réservation')
    }
  }

  const closeDialog = () => { setShowBookingDialog(false); setSelectedGuide(null); setBookingComplete(false) }
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']
  const durationOptions = [1, 2, 3, 4, 6, 8]

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-[#44DBD4] via-[#44DBD4]/90 to-[#3bc9c2] py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Guides Locaux</h1>
          <p className="text-white/90 mb-8">Découvrez vos destinations avec des experts locaux</p>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#44DBD4]" />
                  <Input placeholder="Rechercher un guide ou une destination..." className="pl-10"
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-[#010A09]">Guides disponibles</h2>
            <p className="text-slate-500">{isLoading ? '...' : `${guides.length} guides`}</p>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white">
              {sortOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader><div className="flex gap-4"><Skeleton className="h-16 w-16 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></div></div></CardHeader>
                <CardContent className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-8 w-full mt-4" /></CardContent>
              </Card>
            ))}
          </div>
        ) : guides.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Aucun guide trouvé</h3>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map(guide => (
              <Card key={guide.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate(`/guides/${guide.id}`)}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-[#44DBD4]">
                      <AvatarImage src={guide.imageUrl} />
                      <AvatarFallback>{guide.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1 text-[#010A09]">{guide.name}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-slate-500 mb-2">
                        <MapPin className="h-3 w-3 text-[#44DBD4]" />
                        <span>{guide.location}, {guide.country}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-1 bg-[#44DBD4] text-white px-2 py-0.5 rounded text-xs">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="font-semibold">{guide.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-xs text-slate-500">({guide.reviewCount} avis)</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-500 line-clamp-2">{guide.description}</p>
                  <div>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <Languages className="h-4 w-4 text-[#44DBD4]" />
                      <span className="font-medium text-slate-700">Langues</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {guide.languages.map(l => <Badge key={l} className="text-xs bg-slate-100 text-slate-600">{l}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <Award className="h-4 w-4 text-[#44DBD4]" />
                      <span className="font-medium text-slate-700">Spécialités</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {guide.specialties.map(s => <Badge key={s} variant="outline" className="text-xs border-[#44DBD4] text-[#44DBD4]">{s}</Badge>)}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-2xl font-bold text-[#44DBD4]">{formatPrice(guide.pricePerHour, guide.currency)}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3" /> par heure</div>
                      </div>
                    </div>
                    <Button className="w-full bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
                      onClick={e => handleOpenBooking(guide, e)}>Réserver une visite</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-md">
          {bookingComplete ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-green-600"><CheckCircle className="h-5 w-5" /> Réservation confirmée!</DialogTitle>
                <DialogDescription>Votre visite guidée a été réservée avec succès.</DialogDescription>
              </DialogHeader>
              <div className="py-6 text-center">
                <div className="bg-green-50 rounded-lg p-6 mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Référence</p>
                  <p className="text-2xl font-bold text-primary">{bookingReference.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={closeDialog}>Fermer</Button>
                <Button className="flex-1" onClick={() => navigate('/my-trips')}>Voir mes voyages</Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Réserver une visite guidée</DialogTitle>
                <DialogDescription>{selectedGuide?.name}</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="date" className="pl-10" value={bookingData.date}
                      onChange={e => setBookingData(p => ({ ...p, date: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Heure</label>
                    <Select value={bookingData.time} onValueChange={v => setBookingData(p => ({ ...p, time: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Durée (h)</label>
                    <Select value={bookingData.duration.toString()} onValueChange={v => setBookingData(p => ({ ...p, duration: parseInt(v) }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{durationOptions.map(d => <SelectItem key={d} value={d.toString()}>{d}h</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice((selectedGuide?.pricePerHour ?? 0) * bookingData.duration, selectedGuide?.currency ?? 'XAF')}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={closeDialog}>Annuler</Button>
                <Button className="flex-1" onClick={handleBooking} disabled={bookGuide.isPending || !bookingData.date}>
                  {bookGuide.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Traitement...</> : <><CreditCard className="h-4 w-4 mr-2" />Payer</>}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
