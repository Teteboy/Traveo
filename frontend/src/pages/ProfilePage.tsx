import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  Settings,
  Heart,
  Star,
  LogOut,
  Shield,
  Bell,
  Globe,
  ChevronRight,
  Camera,
  HelpCircle,
  MapPin,
  Clock,
  Check,
  Loader2,
  X,
  Lock,
  Smartphone,
  Eye,
  EyeOff,
  Trash2,
  Briefcase,
  Video,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { useAuthStore } from '@/stores/authStore'
import { useRequireAuth } from '@/hooks/useAuth'
import { FavoritesSection } from '@/components/profile/FavoritesSection'
import { SavedTrips } from '@/components/profile/SavedTrips'
import { ReviewHistory } from '@/components/profile/ReviewHistory'
import { MyVideosSection } from '@/components/profile/MyVideosSection'

export function ProfilePage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)

  // Require authentication to access this page
  useRequireAuth('/login')

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '+33 6 12 34 56 78',
    country: user?.country || 'France',
    city: 'Paris',
    address: '123 Rue de la Paix',
    birthDate: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '1990-05-15',
    title: user?.title || '',
    gender: user?.gender || '',
  })

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)

  // Tab state
  const [activeTab, setActiveTab] = useState('overview')

  // Dialog states
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAvatarDialog, setShowAvatarDialog] = useState(false)
  const [showLanguageDialog, setShowLanguageDialog] = useState(false)
  const [showSecurityDialog, setShowSecurityDialog] = useState(false)
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false)

  // Loading state
  const [isSaving, setIsSaving] = useState(false)

  // Language & Region state
  const [languageForm, setLanguageForm] = useState({
    language: 'fr',
    region: 'FR',
    currency: 'EUR',
    timezone: 'Europe/Paris',
  })

  // Security state
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const stats = [
    { label: 'Voyages', value: 12 },
    { label: 'Avis', value: 8 },
    { label: 'Favoris', value: 24 },
  ]

  const menuItems = [
    {
      icon: User,
      label: 'Informations personnelles',
      action: () => setShowEditDialog(true),
    },
    {
      icon: Heart,
      label: 'Mes favoris',
      action: () => setActiveTab('favorites'),
      badge: '24',
    },
    {
      icon: Star,
      label: 'Mes avis',
      action: () => setActiveTab('reviews'),
      badge: '8',
    },
    {
      icon: Briefcase,
      label: 'Devenir prestataire',
      action: () => navigate('/become-provider'),
      highlight: true,
    },
    {
      icon: Video,
      label: 'Mes vidéos',
      action: () => setActiveTab('videos'),
      badge: '3',
    },
    {
      icon: HelpCircle,
      label: 'Centre d\'aide & Support',
      action: () => navigate('/support'),
    },
    {
      icon: Settings,
      label: 'Paramètres',
      action: () => navigate('/profile/settings'),
    },
    {
      icon: Bell,
      label: 'Notifications',
      action: () => navigate('/notifications'),
    },
    {
      icon: Globe,
      label: 'Langue & Région',
      action: () => setShowLanguageDialog(true),
    },
    {
      icon: Shield,
      label: 'Confidentialité et sécurité',
      action: () => setShowSecurityDialog(true),
    },
  ]

  const updateProfile = useAuthStore((state) => state.updateProfile)
  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      await updateProfile({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone,
        country: editForm.country,
        title: editForm.title,
        dateOfBirth: editForm.birthDate,
        gender: editForm.gender,
      })
      setShowEditDialog(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur de mise à jour'
      alert(msg)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('La taille du fichier ne doit pas dépasser 5MB')
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          setAvatarPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)

        // Store the file for upload
        setSelectedAvatarFile(file)
      }
    }
    input.click()
  }

  const handleSaveAvatar = async () => {
    if (!selectedAvatarFile) return

    // Check authentication before proceeding
    if (!isAuthenticated || !user) {
      alert('Vous devez être connecté pour modifier votre avatar')
      navigate('/login')
      return
    }

    const token = localStorage.getItem('traveo_access_token')
    if (!token) {
      alert('Session expirée. Veuillez vous reconnecter.')
      logout()
      navigate('/login')
      return
    }

    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedAvatarFile)

      // Use fetch with the correct backend URL since apiClient doesn't handle FormData
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me/avatar`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 401) {
          alert('Session expirée. Veuillez vous reconnecter.')
          logout()
          navigate('/login')
          return
        }
        throw new Error(errorData.message || 'Erreur lors du téléchargement de l\'avatar')
      }

      const data = await response.json()
      // Update the user in the store
      useAuthStore.getState().updateUser(data.data.user)
      setShowAvatarDialog(false)
      setAvatarPreview(null)
      setSelectedAvatarFile(null)
      alert('Avatar mis à jour avec succès!')
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveLanguage = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setShowLanguageDialog(false)
    // In real app, would update preferences in store
  }

  const handleChangePassword = async () => {
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      alert('Les mots de passe ne correspondent pas')
      return
    }
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSaving(false)
    setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '', twoFactorEnabled: securityForm.twoFactorEnabled })
    // In real app, would call API to change password
    alert('Mot de passe modifié avec succès')
  }

  const handleToggleTwoFactor = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSecurityForm(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))
    setIsSaving(false)
  }

  const handleDeleteAccount = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSaving(false)
    setShowDeleteAccountDialog(false)
    logout()
    // In real app, would call API to delete account
  }

  const handleMenuItemClick = (item: typeof menuItems[0]) => {
    if (item.action) {
      item.action()
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Profile Header */}
      <Card className="mb-8 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#44DBD4] to-[#3bc9c2]" />
        <CardContent className="pt-0 -mt-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={avatarPreview || user?.avatar} />
                <AvatarFallback className="bg-[#44DBD4] text-white">
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
                onClick={() => setShowAvatarDialog(true)}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-1">
                {editForm.firstName} {editForm.lastName}
              </h2>
              <p className="text-muted-foreground mb-4">{editForm.email}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge variant="secondary">
                  <Globe className="h-3 w-3 mr-1" />
                  {editForm.country}
                </Badge>
                <Badge variant="secondary">Membre depuis 2023</Badge>
                <Badge className="bg-[#44DBD4] hover:bg-[#3bc9c2]">Voyageur vérifié</Badge>
              </div>
            </div>
            <Button 
              className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
              onClick={() => setShowEditDialog(true)}
            >
              Modifier le profil
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-[#44DBD4]">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-5 bg-[#44DBD4]/10">
          <TabsTrigger value="overview" className="gap-1 data-[state=active]:bg-[#44DBD4] data-[state=active]:text-white">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Aperçu</span>
          </TabsTrigger>
          <TabsTrigger value="trips" className="gap-1 data-[state=active]:bg-[#44DBD4] data-[state=active]:text-white">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Voyages</span>
          </TabsTrigger>
          <TabsTrigger value="favorites" className="gap-1 data-[state=active]:bg-[#44DBD4] data-[state=active]:text-white">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Favoris</span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-1 data-[state=active]:bg-[#44DBD4] data-[state=active]:text-white">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Avis</span>
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-1 data-[state=active]:bg-[#44DBD4] data-[state=active]:text-white">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Vidéos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {/* Menu Items */}
          <Card>
            <CardContent className="p-0">
              {menuItems.map((item, index) => (
                <div key={item.label}>
                  <div
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleMenuItemClick(item)}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <Badge variant="secondary">{item.badge}</Badge>
                      )}
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  {index < menuItems.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#44DBD4]/10 rounded-lg">
                  <Clock className="h-5 w-5 text-[#44DBD4]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prochain voyage</p>
                  <p className="font-semibold">Zanzibar - 15 Juillet</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FC960E]/10 rounded-lg">
                  <Star className="h-5 w-5 text-[#FC960E]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Points fidélité</p>
                  <p className="font-semibold">2,450 points</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trips" className="mt-6">
          <SavedTrips />
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          <FavoritesSection />
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <ReviewHistory />
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          <MyVideosSection />
        </TabsContent>
      </Tabs>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full text-destructive hover:text-destructive"
        onClick={() => logout()}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Se déconnecter
      </Button>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
            <DialogDescription>
              Mettez à jour vos informations personnelles
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Prénom</label>
                <Input
                  value={editForm.firstName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom</label>
                <Input
                  value={editForm.lastName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Téléphone</label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pays</label>
                <Select
                  value={editForm.country}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, country: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="Belgique">Belgique</SelectItem>
                    <SelectItem value="Suisse">Suisse</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Maroc">Maroc</SelectItem>
                    <SelectItem value="Tunisie">Tunisie</SelectItem>
                    <SelectItem value="CM">Cameroun</SelectItem>
                    <SelectItem value="US">États-Unis</SelectItem>
                    <SelectItem value="GB">Royaume-Uni</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ville</label>
                <Input
                  value={editForm.city}
                  onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Titre</label>
                <Select
                  value={editForm.title}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, title: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mr">M.</SelectItem>
                    <SelectItem value="mrs">Mme</SelectItem>
                    <SelectItem value="ms">Mlle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Genre</label>
                <Select
                  value={editForm.gender}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="m">Masculin</SelectItem>
                    <SelectItem value="f">Féminin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de naissance</label>
                <Input
                  type="date"
                  value={editForm.birthDate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, birthDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Adresse</label>
              <Input
                value={editForm.address}
                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date de naissance</label>
              <Input
                type="date"
                value={editForm.birthDate}
                onChange={(e) => setEditForm(prev => ({ ...prev, birthDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Avatar Upload Dialog */}
      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Photo de profil</DialogTitle>
            <DialogDescription>
              Changez votre photo de profil
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={avatarPreview || user?.avatar} />
              <AvatarFallback>
                <User className="h-16 w-16" />
              </AvatarFallback>
            </Avatar>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleAvatarUpload}>
                <Camera className="h-4 w-4 mr-2" />
                Choisir une image
              </Button>
              {avatarPreview && (
                <Button variant="outline" onClick={() => setAvatarPreview(null)}>
                  <X className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Formats acceptés: JPG, PNG, GIF. Taille max: 5MB
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowAvatarDialog(false)}>
              Annuler
            </Button>
            <Button className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={handleSaveAvatar} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Language & Region Dialog */}
      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Langue & Région</DialogTitle>
            <DialogDescription>
              Configurez vos préférences de langue et de région
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Langue</label>
              <Select 
                value={languageForm.language} 
                onValueChange={(value) => setLanguageForm(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Région</label>
              <Select 
                value={languageForm.region} 
                onValueChange={(value) => setLanguageForm(prev => ({ ...prev, region: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="BE">Belgique</SelectItem>
                  <SelectItem value="CH">Suisse</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="MA">Maroc</SelectItem>
                  <SelectItem value="TN">Tunisie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Devise</label>
              <Select 
                value={languageForm.currency} 
                onValueChange={(value) => setLanguageForm(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="USD">Dollar US ($)</SelectItem>
                  <SelectItem value="GBP">Livre sterling (£)</SelectItem>
                  <SelectItem value="MAD">Dirham marocain (MAD)</SelectItem>
                  <SelectItem value="TND">Dinar tunisien (TND)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fuseau horaire</label>
              <Select 
                value={languageForm.timezone} 
                onValueChange={(value) => setLanguageForm(prev => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Paris">Paris (GMT+1)</SelectItem>
                  <SelectItem value="Europe/London">Londres (GMT)</SelectItem>
                  <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                  <SelectItem value="Africa/Casablanca">Casablanca (GMT+1)</SelectItem>
                  <SelectItem value="Africa/Tunis">Tunis (GMT+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowLanguageDialog(false)}>
              Annuler
            </Button>
            <Button className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={handleSaveLanguage} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Security Dialog */}
      <Dialog open={showSecurityDialog} onOpenChange={setShowSecurityDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Confidentialité et sécurité</DialogTitle>
            <DialogDescription>
              Gérez vos paramètres de sécurité
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Change Password Section */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Changer le mot de passe
              </h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mot de passe actuel</label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="••••••••"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nouveau mot de passe</label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={securityForm.newPassword}
                      onChange={(e) => setSecurityForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="••••••••"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirmer le mot de passe</label>
                  <Input
                    type="password"
                    value={securityForm.confirmPassword}
                    onChange={(e) => setSecurityForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
                <Button 
                  className="w-full bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
                  onClick={handleChangePassword}
                  disabled={!securityForm.currentPassword || !securityForm.newPassword || isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Changer le mot de passe
                </Button>
              </div>
            </div>

            <Separator />

            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-semibold flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Authentification à deux facteurs
                </h4>
                <p className="text-sm text-muted-foreground">
                  Ajoutez une couche de sécurité supplémentaire à votre compte
                </p>
              </div>
              <Button
                variant={securityForm.twoFactorEnabled ? "default" : "outline"}
                className={securityForm.twoFactorEnabled ? "bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" : ""}
                onClick={handleToggleTwoFactor}
                disabled={isSaving}
              >
                {securityForm.twoFactorEnabled ? 'Activé' : 'Activer'}
              </Button>
            </div>

            <Separator />

            {/* Delete Account */}
            <div className="space-y-3">
              <h4 className="font-semibold text-destructive flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Zone dangereuse
              </h4>
              <p className="text-sm text-muted-foreground">
                La suppression de votre compte est irréversible. Toutes vos données seront perdues.
              </p>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowDeleteAccountDialog(true)}
              >
                Supprimer mon compte
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowSecurityDialog(false)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Supprimer le compte</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Toutes vos données seront définitivement supprimées, y compris :
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mb-4">
              <li>• Vos réservations et voyages</li>
              <li>• Vos favoris et avis</li>
              <li>• Votre portefeuille et points de fidélité</li>
              <li>• Vos documents et informations personnelles</li>
            </ul>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowDeleteAccountDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleDeleteAccount} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Supprimer définitivement
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
