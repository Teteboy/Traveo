import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  CheckCircle,
  Clock,
  XCircle,
  Upload,
  FileText,
  Building2,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { apiClient } from '@/lib/apiClient'
import { useProviderAuthStore } from '@/stores/providerAuthStore'

interface ProviderProfile {
  id: string
  companyName: string
  businessType: string
  description: string | null
  isVerified: boolean
  verificationProgress: number
  createdAt: string
}

interface VerificationStep {
  id: string
  name: string
  description: string
  status: 'verified' | 'pending' | 'incomplete' | 'not_started'
  icon: React.ElementType
}

export function ProviderVerificationPage() {
  const { provider, updateProviderProfile } = useProviderAuthStore()
  
  console.log('[VerificationPage] Component mounted. Provider from store:', provider)
  
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedStep, setSelectedStep] = useState<string | null>(null)
  const [documentType, setDocumentType] = useState('')
  const [documentUrl, setDocumentUrl] = useState('')

  // Fetch provider profile on mount
  useEffect(() => {
    fetchProviderProfile()
  }, [])

  const fetchProviderProfile = async () => {
    try {
      setError(null)
      console.log('[VerificationPage] Fetching provider profile...')
      const response = await apiClient.get<{ data: ProviderProfile }>('/providers/me')
      console.log('[VerificationPage] Response:', response)
      
      const profileData = response.data?.data || response.data
      console.log('[VerificationPage] Profile data:', profileData)
      
      if (profileData) {
        setProviderProfile(profileData)
        updateProviderProfile({
          isVerified: profileData.isVerified,
          verificationProgress: profileData.verificationProgress,
        })
      } else {
        setError('Aucun profil prestataire trouvé')
      }
    } catch (err: any) {
      console.error('[VerificationPage] Fetch error:', err)
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement du profil')
    } finally {
      setIsLoading(false)
    }
  }

  // Define verification steps based on progress
  const getVerificationSteps = (): VerificationStep[] => {
    const progress = providerProfile?.verificationProgress || 0
    const isVerified = providerProfile?.isVerified || false

    return [
      {
        id: '1',
        name: 'Profil soumis',
        description: 'Informations de base de votre entreprise',
        status: isVerified || progress >= 10 ? 'verified' : 'not_started',
        icon: FileText,
      },
      {
        id: '2',
        name: 'Pièce d\'identité',
        description: 'Téléchargez votre pièce d\'identité ou passeport',
        status: progress >= 30 ? 'verified' : progress > 10 ? 'pending' : 'not_started',
        icon: CheckCircle,
      },
      {
        id: '3',
        name: 'Licence commerciale',
        description: 'Registre de commerce ou licence d\'entreprise',
        status: progress >= 50 ? 'verified' : progress > 30 ? 'pending' : 'not_started',
        icon: FileText,
      },
      {
        id: '4',
        name: 'Assurance',
        description: 'Attestation d\'assurance professionnelle',
        status: progress >= 70 ? 'verified' : progress > 50 ? 'pending' : 'not_started',
        icon: CheckCircle,
      },
      {
        id: '5',
        name: 'Vérification finale',
        description: 'Examen par notre équipe administrative',
        status: isVerified ? 'verified' : progress >= 90 ? 'pending' : 'not_started',
        icon: Clock,
      },
    ]
  }

  const verificationSteps = getVerificationSteps()
  const completedSteps = verificationSteps.filter((s) => s.status === 'verified').length
  const totalSteps = verificationSteps.length
  const progress = providerProfile?.verificationProgress || Math.round((completedSteps / totalSteps) * 100)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'incomplete':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-slate-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-700">Complété</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">En cours</Badge>
      case 'incomplete':
        return <Badge className="bg-red-100 text-red-700">Incomplet</Badge>
      default:
        return <Badge variant="secondary">À faire</Badge>
    }
  }

  const getBusinessTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      HOTEL: 'Hôtel / Hébergement',
      RESTAURANT: 'Restaurant',
      GUIDE: 'Guide Touristique',
      EVENTS: 'Organisateur d\'événements',
      TRANSPORT: 'Service de transport',
    }
    return labels[type] || type
  }

  const handleStartUpload = (stepId: string) => {
    setSelectedStep(stepId)
    setShowUploadDialog(true)
    setDocumentType('')
    setDocumentUrl('')
  }

  const handleUploadDocument = async () => {
    if (!documentType || !documentUrl) {
      alert('Veuillez remplir tous les champs')
      return
    }

    setIsUploading(true)
    try {
      await apiClient.post('/auth/provider-verification-documents', {
        documentType,
        documentUrl,
      })

      // Refresh provider profile to get updated progress
      await fetchProviderProfile()

      setShowUploadDialog(false)
      setSelectedStep(null)
      alert('Document téléchargé avec succès !')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors du téléchargement')
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Chargement de votre profil...</p>
        </div>
      </div>
    )
  }

  // Show error with debug info
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Erreur de chargement</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="bg-red-50 p-4 rounded text-left text-sm mb-4">
              <p className="font-mono">Détails techniques :</p>
              <p>Essayez de vous déconnecter et reconnecter en tant que prestataire.</p>
            </div>
            <Button onClick={fetchProviderProfile} variant="outline">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If no provider profile found, show welcome message
  if (!providerProfile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-16 w-16 mx-auto text-[#44DBD4] mb-4" />
            <h1 className="text-2xl font-bold mb-2">Bienvenue sur le portail prestataire !</h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Votre demande de compte prestataire a été soumise avec succès. 
              Notre équipe l'examinera dans les plus brefs délais.
            </p>
            <div className="bg-[#44DBD4]/10 rounded-lg p-4 max-w-sm mx-auto">
              <p className="text-sm">
                En attendant, vous pouvez explorer les fonctionnalités disponibles 
                et préparer vos documents de vérification.
              </p>
            </div>
            <Button onClick={fetchProviderProfile} className="mt-4">
              Actualiser le statut
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Centre de Vérification</h1>
        <p className="text-slate-500 mt-1">
          Complétez toutes les étapes pour être vérifié et commencer à accepter des réservations
        </p>
      </div>

      {/* Company Info Card */}
      {providerProfile && (
        <Card className="border-[#44DBD4]/20 bg-[#44DBD4]/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#44DBD4]" />
              Votre Entreprise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nom de l'entreprise</p>
                <p className="font-semibold text-lg">{providerProfile.companyName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type d'activité</p>
                <p className="font-semibold">{getBusinessTypeLabel(providerProfile.businessType)}</p>
              </div>
              {providerProfile.description && (
                <div className="col-span-1 md:col-span-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm mt-1">{providerProfile.description}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Date de soumission</p>
                <p className="font-medium">
                  {new Date(providerProfile.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Statut</p>
                <div className="mt-1">
                  {providerProfile.isVerified ? (
                    <Badge className="bg-green-500">✓ Vérifié</Badge>
                  ) : (
                    <Badge variant="secondary">En attente de vérification</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Progression Globale</h3>
              <p className="text-sm text-slate-500">
                {completedSteps} sur {totalSteps} étapes complétées
              </p>
            </div>
            <div className="text-3xl font-bold text-[#44DBD4]">{progress}%</div>
          </div>
          <Progress value={progress} className="h-3" />
          {providerProfile && !providerProfile.isVerified && (
            <p className="text-sm text-muted-foreground mt-2">
              Votre demande est en cours d'examen. Complétez les étapes ci-dessous pour accélérer le processus.
            </p>
          )}
          {providerProfile?.isVerified && (
            <div className="flex items-center gap-2 text-green-600 mt-2">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Félicitations ! Votre compte est vérifié.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Steps */}
      <div className="space-y-4">
        {verificationSteps.map((step) => (
          <Card key={step.id} className={step.status === 'verified' ? 'border-green-200' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">{getStatusIcon(step.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{step.name}</h3>
                    {getStatusBadge(step.status)}
                  </div>
                  <p className="text-slate-600 mb-4">{step.description}</p>

                  {step.status === 'verified' ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      <span>Complété avec succès</span>
                    </div>
                  ) : (
                    <Button
                      variant={step.status === 'incomplete' ? 'default' : 'outline'}
                      className={step.status === 'incomplete' ? 'bg-[#44DBD4] hover:bg-[#3bc9c2]' : ''}
                      onClick={() => handleStartUpload(step.id)}
                      disabled={step.status === 'verified'}
                    >
                      {step.status === 'incomplete' ? 'Compléter maintenant' : 'Commencer la vérification'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Help Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Besoin d'aide ?
          </h3>
          <p className="text-sm text-slate-700">
            Si vous rencontrez des difficultés avec la vérification, veuillez contacter notre équipe support à{' '}
            <a href="mailto:support@traveo.com" className="text-[#44DBD4] hover:underline">
              support@traveo.com
            </a>
          </p>
        </CardContent>
      </Card>

      {/* Document Upload Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Télécharger un document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Type de document</label>
                <select
                  className="w-full mt-1 p-2 border rounded-md"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                >
                  <option value="">Sélectionner un type...</option>
                  <option value="id_card">Pièce d'identité</option>
                  <option value="business_license">Licence commerciale</option>
                  <option value="insurance">Attestation d'assurance</option>
                  <option value="tax_certificate">Attestation fiscale</option>
                  <option value="other">Autre document</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">URL du document ou référence</label>
                <Input
                  placeholder="https://example.com/document.pdf ou REF-12345"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Vous pouvez fournir une URL ou un numéro de référence
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowUploadDialog(false)
                    setSelectedStep(null)
                  }}
                  disabled={isUploading}
                >
                  Annuler
                </Button>
                <Button
                  className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2]"
                  onClick={handleUploadDocument}
                  disabled={isUploading || !documentType || !documentUrl}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Télécharger
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
