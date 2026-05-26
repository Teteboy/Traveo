import { useState } from 'react'
import { MapPin, Search, TrendingUp, Sparkles, Filter, SlidersHorizontal, ArrowRight, LogIn, Info, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { VideoCardCarousel } from '@/components/discover/VideoCardCarousel'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDiscover } from '@/hooks/useDiscover'
import { Skeleton } from '@/components/ui/skeleton'
import { adaptEvent } from '@/lib/adapters'
import { useAuthStore } from '@/stores/authStore'
import { useCurrentUser } from '@/hooks/useAuth'
import { toast } from 'sonner'
import type { ApiServiceItem } from '@/lib/adapters'

export function DiscoverPage() {
  const navigate = useNavigate()
  const { login, register, isLoading: authLoading, error: authError, clearError } = useAuthStore()

  const [selectedCategory, setSelectedCategory] = useState('Tous')
  const [searchQuery, setSearchQuery] = useState('')
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set())
  const [savedVideos, setSavedVideos] = useState<Set<string>>(new Set())
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showInfoDialog, setShowInfoDialog] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    country: 'CM'
  })

  const { data, isLoading } = useDiscover(1)
  useCurrentUser()

  const categories = ['Tous', 'Ville', 'Plage', 'Nature', 'Culture', 'Aventure', 'Gastronomie', 'Festival']

  const filteredVideos = (data?.videos?.items ?? []).filter(video =>
    searchQuery === '' || video.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleLike = (id: string) => setLikedVideos(p => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s })
  const toggleSave = (id: string) => setSavedVideos(p => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s })
  const handleShare = (_id: string) => {}
  const handleComment = (_id: string) => {}

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginForm.email || !loginForm.password) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    clearError()
    try {
      await login(loginForm.email, loginForm.password)
      toast.success('Connexion réussie !')
      setShowLoginDialog(false)
      setLoginForm({ email: '', password: '' })
      // Navigate to profile or stay on discover
      navigate('/discover')
    } catch (err) {
      // Error is already handled in the store and displayed in the form
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!registerForm.email || !registerForm.password || !registerForm.firstName || !registerForm.lastName) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    if (registerForm.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    clearError()
    try {
      await register({
        email: registerForm.email,
        password: registerForm.password,
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
        phone: registerForm.phone || undefined,
        country: registerForm.country,
      })
      toast.success('Compte créé avec succès !')
      setShowLoginDialog(false)
      setRegisterForm({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        country: 'CM'
      })
      // Navigate to profile or stay on discover
      navigate('/discover')
    } catch (err) {
      // Error is already handled in the store and displayed in the form
    }
  }

  const trendingDestinations = data?.featuredDestinations ?? []
  const upcomingEvents = (data?.featuredEvents ?? []).map((e: unknown) => adaptEvent(e as ApiServiceItem))

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#44DBD4] via-[#44DBD4]/90 to-[#3bc9c2] py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Découvrir
              </h1>
              <p className="text-white/90">
                Explorez le monde à travers des vidéos et découvrez de nouvelles destinations
              </p>
            </div>
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-white text-[#44DBD4] hover:bg-white/90"
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              Tendances
            </Button>
          </div>

          {/* Search Bar */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#44DBD4]" />
                  <Input
                    placeholder="Rechercher des vidéos, destinations, événements..."
                    className="pl-10 border-slate-200 focus:border-[#44DBD4]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="border-[#44DBD4] text-[#44DBD4] hover:bg-[#44DBD4]/10">
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Category Filters */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto scrollbar-hidden pb-2">
          <Filter className="h-5 w-5 text-slate-400 flex-shrink-0" />
          {categories.map((category) => (
            <Badge
              key={category}
              className={`cursor-pointer whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-[#44DBD4] text-white hover:bg-[#3bc9c2]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Video Carousel */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#010A09]">Vidéos populaires</h2>
            <p className="text-slate-500">{isLoading ? '...' : `${filteredVideos.length} vidÃ©o(s)`}</p>
          </div>

          {isLoading ? (
            <div className="flex gap-4 overflow-hidden">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-96 w-72 flex-shrink-0 rounded-xl" />)}</div>
          ) : (
          <VideoCardCarousel
            videos={filteredVideos}
            onLike={toggleLike}
            onSave={toggleSave}
            onShare={handleShare}
            onComment={handleComment}
            likedVideos={likedVideos}
            savedVideos={savedVideos}
          />
          )}
        </div>

        {/* Trending Destinations */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-[#44DBD4]" />
              <h2 className="text-2xl font-bold text-[#010A09]">Destinations Tendance</h2>
            </div>
            <Button 
              variant="ghost" 
              className="text-[#44DBD4] hover:bg-[#44DBD4]/10"
              onClick={() => navigate('/discover')}
            >
              Voir tout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingDestinations.map((dest) => (
              <Card
                key={dest.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-slate-100"
                onClick={() => navigate('/discover')}
              >
                <div className="relative h-56">
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-bold mb-1">{dest.name}</h3>
                    <p className="text-sm text-white/90 mb-2">{dest.country}</p>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-[#FC960E]">⭐</span>
                        <span>{dest.rating}</span>
                      </div>
                      <span className="text-white/70">•</span>
                      <span className="text-white/90">{dest.reviewCount} avis</span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-slate-500 line-clamp-2">
                    {dest.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-[#44DBD4]" />
              <h2 className="text-2xl font-bold text-[#010A09]">Événements à venir</h2>
            </div>
            <Button 
              variant="ghost" 
              className="text-[#44DBD4] hover:bg-[#44DBD4]/10"
              onClick={() => navigate('/events')}
            >
              Voir tout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Card
                key={event.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-slate-100"
                onClick={() => navigate('/events')}
              >
                <div className="relative h-48">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-3 right-3 bg-[#44DBD4] text-white border-0">
                    {event.category}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-[#010A09]">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                    <MapPin className="h-4 w-4 text-[#44DBD4]" />
                    <span className="line-clamp-1">
                      {event.location}, {event.country}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#44DBD4]">
                      {event.price} {event.currency}
                    </span>
                    <Button 
                      size="sm"
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
              </Card>
            ))}
          </div>
        </div>

        {/* Personalized Recommendations */}
        <div className="bg-gradient-to-br from-[#44DBD4]/10 to-[#FC960E]/5 rounded-2xl p-8 text-center border border-[#44DBD4]/20">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-[#44DBD4]" />
            <h2 className="text-2xl font-bold text-[#010A09]">Recommandations personnalisées</h2>
          </div>
            <p className="text-slate-500 mb-6 max-w-2xl mx-auto">
              Connectez-vous pour recevoir des suggestions basées sur vos préférences de voyage et découvrir des expériences uniques adaptées à vos goûts.
            </p>
          <div className="flex items-center justify-center gap-4">
            <Button 
              size="lg"
              className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
              onClick={() => setShowLoginDialog(true)}
            >
              <LogIn className="mr-2 h-5 w-5" />
              Se connecter
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-[#44DBD4] text-[#44DBD4] hover:bg-[#44DBD4]/10"
              onClick={() => setShowInfoDialog(true)}
            >
              <Info className="mr-2 h-5 w-5" />
              En savoir plus
            </Button>
          </div>
        </div>
      </div>

      {/* Auth Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={(open) => {
        setShowLoginDialog(open)
        if (!open) {
          clearError()
          setAuthMode('login')
          setLoginForm({ email: '', password: '' })
          setRegisterForm({
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            phone: '',
            country: 'CM'
          })
        }
      }}>
        <DialogContent className="bg-white border-slate-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#010A09]">
              {authMode === 'login' ? 'Se connecter' : 'Créer un compte'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              {authMode === 'login'
                ? 'Connectez-vous à votre compte Traveo pour accéder à toutes les fonctionnalités.'
                : 'Créez votre compte Traveo pour commencer votre voyage.'
              }
            </DialogDescription>
          </DialogHeader>

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  className="border-slate-200 focus:border-[#44DBD4]"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  disabled={authLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Mot de passe</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="border-slate-200 focus:border-[#44DBD4] pr-10"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    disabled={authLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{authError}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
                disabled={authLoading}
              >
                {authLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-slate-500">
                  Pas encore de compte?{' '}
                  <button
                    type="button"
                    className="text-[#44DBD4] font-medium hover:underline"
                    onClick={() => {
                      setAuthMode('register')
                      clearError()
                    }}
                  >
                    S'inscrire
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 py-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Prénom *</label>
                  <Input
                    type="text"
                    placeholder="Jean"
                    className="border-slate-200 focus:border-[#44DBD4]"
                    value={registerForm.firstName}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, firstName: e.target.value }))}
                    disabled={authLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nom *</label>
                  <Input
                    type="text"
                    placeholder="Dupont"
                    className="border-slate-200 focus:border-[#44DBD4]"
                    value={registerForm.lastName}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, lastName: e.target.value }))}
                    disabled={authLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email *</label>
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  className="border-slate-200 focus:border-[#44DBD4]"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                  disabled={authLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Téléphone</label>
                <Input
                  type="tel"
                  placeholder="+237 6XX XXX XXX"
                  className="border-slate-200 focus:border-[#44DBD4]"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={authLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Pays</label>
                <Select
                  value={registerForm.country}
                  onValueChange={(value) => setRegisterForm(prev => ({ ...prev, country: value }))}
                  disabled={authLoading}
                >
                  <SelectTrigger className="border-slate-200 focus:border-[#44DBD4]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CM">Cameroun</SelectItem>
                    <SelectItem value="FR">France</SelectItem>
                    <SelectItem value="US">États-Unis</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="GB">Royaume-Uni</SelectItem>
                    <SelectItem value="DE">Allemagne</SelectItem>
                    <SelectItem value="IT">Italie</SelectItem>
                    <SelectItem value="ES">Espagne</SelectItem>
                    <SelectItem value="NL">Pays-Bas</SelectItem>
                    <SelectItem value="BE">Belgique</SelectItem>
                    <SelectItem value="CH">Suisse</SelectItem>
                    <SelectItem value="AT">Autriche</SelectItem>
                    <SelectItem value="SE">Suède</SelectItem>
                    <SelectItem value="NO">Norvège</SelectItem>
                    <SelectItem value="DK">Danemark</SelectItem>
                    <SelectItem value="FI">Finlande</SelectItem>
                    <SelectItem value="PT">Portugal</SelectItem>
                    <SelectItem value="IE">Irlande</SelectItem>
                    <SelectItem value="LU">Luxembourg</SelectItem>
                    <SelectItem value="MT">Malte</SelectItem>
                    <SelectItem value="CY">Chypre</SelectItem>
                    <SelectItem value="SI">Slovénie</SelectItem>
                    <SelectItem value="EE">Estonie</SelectItem>
                    <SelectItem value="LV">Lettonie</SelectItem>
                    <SelectItem value="LT">Lituanie</SelectItem>
                    <SelectItem value="CZ">République tchèque</SelectItem>
                    <SelectItem value="SK">Slovaquie</SelectItem>
                    <SelectItem value="HU">Hongrie</SelectItem>
                    <SelectItem value="PL">Pologne</SelectItem>
                    <SelectItem value="HR">Croatie</SelectItem>
                    <SelectItem value="RO">Roumanie</SelectItem>
                    <SelectItem value="BG">Bulgarie</SelectItem>
                    <SelectItem value="GR">Grèce</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Mot de passe *</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="border-slate-200 focus:border-[#44DBD4] pr-10"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                    disabled={authLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Confirmer le mot de passe *</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="border-slate-200 focus:border-[#44DBD4]"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  disabled={authLoading}
                />
              </div>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{authError}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
                disabled={authLoading}
              >
                {authLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Créer mon compte'
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-slate-500">
                  Déjà un compte?{' '}
                  <button
                    type="button"
                    className="text-[#44DBD4] font-medium hover:underline"
                    onClick={() => {
                      setAuthMode('login')
                      clearError()
                    }}
                  >
                    Se connecter
                  </button>
                </p>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Info Dialog */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent className="bg-white border-slate-200 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#010A09]">Recommandations personnalisées</DialogTitle>
            <DialogDescription className="text-slate-500">
              Découvrez comment Traveo personnalise vos suggestions de voyage.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#44DBD4]/10 rounded-lg">
                <Sparkles className="h-5 w-5 text-[#44DBD4]" />
              </div>
              <div>
                <h4 className="font-medium text-[#010A09]">Analyse de vos préférences</h4>
                <p className="text-sm text-slate-500">Notre IA analyse vos recherches et réservations pour comprendre vos goûts.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#44DBD4]/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-[#44DBD4]" />
              </div>
              <div>
                <h4 className="font-medium text-[#010A09]">Tendances adaptées</h4>
                <p className="text-sm text-slate-500">Recevez des suggestions basées sur les destinations populaires parmi les voyageurs similaires.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#44DBD4]/10 rounded-lg">
                <MapPin className="h-5 w-5 text-[#44DBD4]" />
              </div>
              <div>
                <h4 className="font-medium text-[#010A09]">Offres exclusives</h4>
                <p className="text-sm text-slate-500">Accédez à des offres spéciales et des réductions sur les destinations qui vous correspondent.</p>
              </div>
            </div>
            <Button 
              className="w-full bg-[#44DBD4] hover:bg-[#3bc9c2] text-white mt-4"
              onClick={() => {
                setShowInfoDialog(false)
                setShowLoginDialog(true)
              }}
            >
              Commencer maintenant
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
