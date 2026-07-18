import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import {
  Building2,
  Utensils,
  MapPin,
  Music,
  Car,
  Home,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Star,
  Banknote,
  Users,
  Upload,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { apiClient } from '@/lib/apiClient'

const providerTypes = [
  {
    id: 'hotel',
    name: 'Hôtel / Hébergement',
    icon: Home,
    description: 'Hôtels, auberges, maisons d\'hôtes, ryokans',
    color: 'bg-purple-100 text-purple-600',
    serviceType: 'HOTEL' as const
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    icon: Utensils,
    description: 'Restaurants, cafés, bars',
    color: 'bg-orange-100 text-orange-600',
    serviceType: 'RESTAURANT' as const
  },
  {
    id: 'guide',
    name: 'Guide Touristique',
    icon: MapPin,
    description: 'Guides locaux, visites privées',
    color: 'bg-green-100 text-green-600',
    serviceType: 'GUIDE' as const
  },
  {
    id: 'event',
    name: 'Organisateur d\'événements',
    icon: Music,
    description: 'Concerts, festivals, expositions',
    color: 'bg-pink-100 text-pink-600',
    serviceType: 'EVENTS' as const
  },
  {
    id: 'transfer',
    name: 'Service de transport',
    icon: Car,
    description: 'Transferts, taxis, locations',
    color: 'bg-blue-100 text-blue-600',
    serviceType: 'TRANSPORT' as const
  },
]

export function BecomeProviderPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, updateUser } = useAuthStore()
  const [selectedType, setSelectedType] = useState<typeof providerTypes[0] | null>(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [providerStatus, setProviderStatus] = useState<{ isProvider: boolean; provider: any } | null>(null)
  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
  })
  const [showDocumentUpload, setShowDocumentUpload] = useState(false)
  const [verificationDocuments, setVerificationDocuments] = useState<Array<{type: string; url: string}>>([])
  const [documentType, setDocumentType] = useState<string>('')
  const [documentUrl, setDocumentUrl] = useState<string>('')

  // Check provider status on load and when user changes
  const checkProviderStatus = async () => {
    if (!isAuthenticated || !user) return
    
    try {
      const response = await apiClient.get('/auth/provider-status')
      setProviderStatus((response as any).data.data)
    } catch (error) {
      console.error('Failed to check provider status:', error)
    }
  }

  // Handle becoming a provider
  const handleBecomeProvider = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated || !user) return
    
    setIsSubmitting(true)
    try {
      const response = await apiClient.post('/auth/become-provider', {
        companyName: formData.companyName,
        businessType: selectedType?.serviceType,
        description: formData.description,
      })
      
      const data = (response as any).data.data
      
      // Update user role in auth store
      if (data.user) {
        updateUser(data.user)
      } else {
        updateUser({ ...user, role: 'provider' as any })
      }
      
      // Update tokens if new ones were provided
      if (data.tokens) {
        localStorage.setItem('traveo_access_token', data.tokens.accessToken)
        localStorage.setItem('traveo_refresh_token', data.tokens.refreshToken)
      }
      
      setProviderStatus({ isProvider: true, provider: data.provider })
      setShowApplicationForm(false)
      setIsSubmitting(false)
      
      // Show success message with instructions
      alert(
        'Félicitations ! Votre compte prestataire a été créé avec succès.\n\n' +
        'Vous pouvez maintenant vous connecter en tant que prestataire.\n' +
        'Utilisez vos identifiants habituels sur la page de connexion prestataire.'
      )
      
      // Optionally redirect to provider dashboard or login page
      // navigate('/provider/login')
    } catch (error: any) {
      setIsSubmitting(false)
      const message = error.response?.data?.message || error.message || 'Erreur lors de la soumission de la demande'
      console.error('Become provider error:', error.response?.data)
      alert(message)
    }
  }

  // Handle provider profile update
  const handleUpdateProviderProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated || !user) return
    
    setIsSubmitting(true)
    try {
      const response = await apiClient.patch('/auth/provider-profile', {
        companyName: formData.companyName,
        businessType: selectedType?.serviceType,
        description: formData.description,
      })
      
      setProviderStatus((response as any).data.data)
      setShowApplicationForm(false)
      setIsSubmitting(false)
      
      alert('Profil mis à jour avec succès!')
    } catch (error: any) {
      setIsSubmitting(false)
      alert(error.response?.data?.message || 'Erreur lors de la mise à jour du profil')
    }
  }

  // Handle document upload
  const handleUploadDocument = async () => {
    if (!documentType || !documentUrl) {
      alert('Veuillez remplir tous les champs')
      return
    }
    
    setIsSubmitting(true)
    try {
      const response = await apiClient.post('/auth/provider-verification-documents', {
        documentType,
        documentUrl,
      })
      
      setVerificationDocuments(prev => [...prev, { type: documentType, url: documentUrl }])
      setProviderStatus((response as any).data.data)
      setShowDocumentUpload(false)
      setIsSubmitting(false)
      setDocumentType('')
      setDocumentUrl('')
      
      alert('Document téléchargé avec succès!')
    } catch (error: any) {
      setIsSubmitting(false)
      alert(error.response?.data?.message || 'Erreur lors du téléchargement du document')
    }
  }

  // Handle becoming provider button click
  const handleStartApplication = () => {
    if (!isAuthenticated || !user) {
      navigate('/login')
      return
    }
    
    if (providerStatus?.isProvider) {
      // User is already a provider, show profile update form
      setFormData({
        companyName: providerStatus.provider?.companyName || '',
        description: providerStatus.provider?.description || '',
      })
      setSelectedType(providerTypes.find(t => t.serviceType === providerStatus.provider?.businessType) || null)
      setShowApplicationForm(true)
    } else {
      // User is not a provider yet, show application form
      setShowApplicationForm(true)
    }
  }

  // Initial load - check if user already has a provider profile
  useEffect(() => {
    if (isAuthenticated && user) {
      checkProviderStatus()
    }
  }, [isAuthenticated, user])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#44DBD4] via-[#44DBD4]/90 to-[#3bc9c2] py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <Badge className="bg-white/20 text-white mb-4">Devenir prestataire</Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Proposez vos services sur Traveo
            </h1>
            <p className="text-white/90 max-w-2xl mx-auto">
              Rejoignez notre réseau de prestataires de confiance et atteignez des milliers de voyageurs du monde entier.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="container mx-auto max-w-4xl px-4 -mt-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Banknote className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Revenus attractifs</h3>
                  <p className="text-sm text-slate-500">Commission compétitive et paiements rapides</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Large audience</h3>
                  <p className="text-sm text-slate-500">Accédez à des milliers de voyageurs</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Visibilité accrue</h3>
                  <p className="text-sm text-slate-500">Mettez en avant vos services</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provider Status */}
      {providerStatus && (
        <div className="container mx-auto max-w-4xl px-4 py-6">
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                {providerStatus.isProvider ? 'Votre statut de prestataire' : 'Devenir prestataire'}
              </h2>
              
              {providerStatus.isProvider ? (
                <>
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                    <h3 className="font-semibold text-green-800 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Statut: Prestataire vérifié
                    </h3>
                    <p className="text-sm text-green-600 mt-2">
                      Félicitations! Vous êtes maintenant un prestataire vérifié sur Traveo.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nom de l'entreprise</label>
                      <p className="text-slate-600">{providerStatus.provider?.companyName || 'Non spécifié'}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Type de service</label>
                      <p className="text-slate-600">
                        {providerStatus.provider?.businessType === 'HOTEL' && 'Hôtel / Hébergement'}
                        {providerStatus.provider?.businessType === 'RESTAURANT' && 'Restaurant'}
                        {providerStatus.provider?.businessType === 'GUIDE' && 'Guide Touristique'}
                        {providerStatus.provider?.businessType === 'EVENTS' && 'Organisateur d\'événements'}
                        {providerStatus.provider?.businessType === 'TRANSPORT' && 'Service de transport'}
                        {providerStatus.provider?.businessType === 'USER' && 'Non spécifié'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Progression de vérification</label>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div className={`bg-[#44DBD4] h-2.5 rounded-full`} 
                             style={{ width: `${providerStatus.provider?.verificationProgress || 0}%` }}></div>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {providerStatus.provider?.verificationProgress || 0}% complet
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                  <h3 className="font-semibold text-yellow-800 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Vous n'êtes pas encore prestataire
                  </h3>
                  <p className="text-sm text-yellow-600 mt-2">
                    Commencez votre demande pour devenir prestataire et proposer vos services sur notre plateforme.
                  </p>
                </div>
              )}
              
              <div className="mt-6">
                <Button 
                  className="w-full bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
                  onClick={handleStartApplication}
                >
                  {providerStatus.isProvider ? 'Mettre à jour mon profil' : 'Commencer ma demande'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Provider Types */}
      {!providerStatus?.isProvider && (
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Quel type de prestataire êtes-vous?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providerTypes.map((type) => {
              const Icon = type.icon
              return (
                <Card
                  key={type.id}
                  className="border-slate-200 hover:border-[#44DBD4] hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => {
                    setSelectedType(type)
                    setShowApplicationForm(true)
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-xl ${type.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{type.name}</h3>
                        <p className="text-sm text-slate-500">{type.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-[#44DBD4] transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Application Form Dialog */}
      <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {providerStatus?.isProvider 
                ? 'Mettre à jour mon profil de prestataire' 
                : `Demande de partenariat - ${selectedType?.name}`}
            </DialogTitle>
            <DialogDescription>
              {providerStatus?.isProvider 
                ? 'Mettez à jour vos informations de prestataire existentes' 
                : 'Remplissez le formulaire ci-dessous pour soumettre votre demande de prestataire.'}
              Tous les champs marqués d'un * sont obligatoires.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={providerStatus?.isProvider ? handleUpdateProviderProfile : handleBecomeProvider} 
                className="space-y-6 py-4">
            {/* Business Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#44DBD4]" />
                Informations sur l'établissement
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nom de l'établissement *</label>
                  <Input
                    placeholder="Ex: Le Petit Bistro"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <Textarea
                    placeholder="Décrivez votre établissement, vos services, ce qui vous rend unique..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Document Upload Section (for existing providers) */}
            {providerStatus?.isProvider && (
              <>
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Upload className="h-4 w-4 text-[#44DBD4]" />
                    Documents de vérification
                  </h3>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">
                      Téléchargez vos documents pour compléter votre vérification de prestataire.
                      Plus vous fournissez de documents, plus votre profil sera vérifié rapidement.
                    </p>
                  </div>
                  
                  {verificationDocuments.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-slate-900 mb-2">Documents téléchargés:</h4>
                      <div className="space-y-2">
                        {verificationDocuments.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                            <span className="text-sm text-slate-600">{doc.type}</span>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                // In a real app, you would delete the document
                                setVerificationDocuments(verificationDocuments.filter((_, i) => i !== index))
                              }}
                            >
                              Supprimer
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowDocumentUpload(true)}
                    >
                      Télécharger un document
                    </Button>
                  </div>
                </div>
                
                <Separator />
              </>
            )}
            
            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowApplicationForm(false)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin mr-2" />
                    {providerStatus?.isProvider ? 'Mise à jour en cours...' : 'Envoi en cours...'}
                  </>
                ) : (
                  providerStatus?.isProvider ? 'Mettre à jour le profil' : 'Soumettre la demande'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Document Upload Dialog */}
      <Dialog open={showDocumentUpload} onOpenChange={setShowDocumentUpload}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Télécharger un document de vérification</DialogTitle>
            <DialogDescription>
              Sélectionnez le type de document et fournissez l'URL ou les informations du document.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type de document *</label>
              <Select
                value={documentType}
                onValueChange={(value) => setDocumentType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id_card">Pièce d'identité</SelectItem>
                  <SelectItem value="business_license">Licence commerciale</SelectItem>
                  <SelectItem value="insurance">Assurance</SelectItem>
                  <SelectItem value="tax_doc">Document fiscal</SelectItem>
                  <SelectItem value="certification">Certification professionnelle</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL ou référence du document *</label>
              <Input
                placeholder="Ex: https://example.com/document.pdf ou REF123456"
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowDocumentUpload(false)}>
              Annuler
            </Button>
            <Button className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={handleUploadDocument} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Télécharger
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Import Loader2 and Check icons for the upload dialog
import { Loader2, Check } from 'lucide-react'