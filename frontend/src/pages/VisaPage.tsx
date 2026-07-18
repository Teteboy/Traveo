import { useState, useEffect } from 'react'
import {
  FileText,
  Check,
  Clock,
  X,
  Upload,
  Plus,
  Download,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatDate, formatPrice, getStatusLabel } from '@/lib/formatters'
import { DocumentStorage } from '@/components/visa/DocumentStorage'
import { apiClient, uploadFile } from '@/lib/apiClient'
import { useCurrentUser, useRequireAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'

interface VisaApplication {
  id: string
  countryCode: string
  countryName: string
  status: 'draft' | 'submitted' | 'processing' | 'approved' | 'rejected'
  applicantData: any
  travelDates?: any
  processingFee: number
  createdAt: string
  updatedAt: string
  documents: Array<{
    id: string
    documentType: string
    fileName: string
    fileUrl?: string
    uploadedAt: string
  }>
}

interface VisaDestination {
  countryCode: string;
  countryName: string;
  visaRequired: boolean;
  eVisaAvailable: boolean;
  processingFee: number;
  processingDays: number;
}

interface VisaRequirements {
  countryCode: string;
  countryName: string;
  eligible: boolean;
  visaRequired: boolean;
  eVisaAvailable: boolean;
  requiresInvitation: boolean;
  fee: {
    xaf: number;
  } | null;
  processingDays: number;
  requirements: Array<{
    documentType: string;
    label: string;
    required: boolean;
    acceptedFormats: string[];
    maxSizeBytes: number;
  }>;
}

interface VisaDestination {
  countryCode: string;
  countryName: string;
}

// Remove hardcoded countries - will be fetched from API

export function VisaPage() {
  const isAuthenticated = useRequireAuth('/login')
  const user = useCurrentUser()
  const { isAuthenticated: authStoreIsAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  // Prevent any auth-dependent API calls until auth has been validated.
  if (!isAuthenticated || !authStoreIsAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Authentification requise</h1>
          <p className="text-muted-foreground mb-4">
            Vous devez être connecté pour accéder aux services de visa.
          </p>
          <Button onClick={() => navigate('/login')} className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white">
            Se connecter
          </Button>
        </div>
      </div>
    )
  }
  const [selectedCountry, setSelectedCountry] = useState('')
  const [applications, setApplications] = useState<VisaApplication[]>([])
  const [destinations, setDestinations] = useState<VisaDestination[]>([])
  const [requirements, setRequirements] = useState<VisaRequirements | null>(null)
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Fetch destinations on mount
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await apiClient.get<{ data: VisaDestination[] }>('/visa/destinations')
        setDestinations(response.data || [])
      } catch (error) {
        console.error('Failed to fetch destinations:', error)
      }
    }
    fetchDestinations()
  }, [])

  // Fetch user's applications on mount
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await apiClient.get<{ items: VisaApplication[]; total: number; page: number; limit: number }>('/visa/applications')
        setApplications(response.items || [])
      } catch (error: any) {
        console.error('Failed to fetch applications:', error)
        setAuthError('Erreur lors du chargement des demandes. Veuillez réessayer.')
        setApplications([])
      }
    }
    fetchApplications()
  }, [])

  // Fetch requirements when country changes
  useEffect(() => {
    if (!selectedCountry) {
      setRequirements(null)
      return
    }

    const fetchRequirements = async () => {
      setLoading(true)
      try {
        const response = await apiClient.get<{ data: VisaRequirements }>(`/visa/${selectedCountry}/requirements`)
        setRequirements(response.data)
      } catch (error) {
        console.error('Failed to fetch requirements:', error)
        setRequirements(null)
      } finally {
        setLoading(false)
      }
    }
    fetchRequirements()
  }, [selectedCountry])

  // Application form state
  const [applicationForm, setApplicationForm] = useState({
    destinationCountry: '',
    firstName: '',
    lastName: '',
    passportNumber: '',
    passportExpiry: '',
    documents: {
      passport: null as File | null,
      photo: null as File | null,
      proofOfFunds: null as File | null,
    },
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState('check')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="h-5 w-5 text-green-600" />
      case 'rejected':
        return <X className="h-5 w-5 text-red-600" />
      case 'processing':
        return <Clock className="h-5 w-5 text-primary" />
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default'
      case 'rejected':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const handleFileUpload = (docType: 'passport' | 'photo' | 'proofOfFunds') => {
    // Create a file input and trigger click
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = docType === 'photo' ? 'image/*' : '.pdf,image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setApplicationForm(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            [docType]: file
          }
        }))
      }
    }
    input.click()
  }

  const handleSubmitApplication = async () => {
    if (!applicationForm.destinationCountry || !applicationForm.firstName ||
        !applicationForm.lastName || !applicationForm.passportNumber || !applicationForm.passportExpiry) {
      return
    }

    if (!user) {
      alert('Veuillez vous connecter pour soumettre une demande de visa.')
      return
    }

    setIsSubmitting(true)

    try {
      // Create visa application
      const applicant = {
        firstName: applicationForm.firstName,
        lastName: applicationForm.lastName,
        passportNumber: applicationForm.passportNumber,
        passportExpiry: applicationForm.passportExpiry,
        email: user.email,
        phone: user.phone,
      }

      const response = await apiClient.post('/visa/applications', {
        countryCode: applicationForm.destinationCountry,
        applicant,
        travelDates: applicationForm.passportExpiry ? {
          departAt: new Date().toISOString(),
          returnAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        } : null,
      })

      console.log('POST /visa/applications response:', response)

      // Unwrap the { data: { application: ... } } envelope from ok()
      const responseData = (response as any)?.data ?? response
      const newApplication = responseData.application ?? responseData
      console.log('newApplication:', newApplication)
      if (!newApplication?.id) {
        console.error('Unexpected API response — full body:', JSON.stringify(response))
        throw new Error('Réponse invalide du serveur')
      }

      // Upload documents if provided
      const uploadPromises = []
      if (applicationForm.documents.passport) {
        uploadPromises.push(uploadDocument(newApplication.id, 'passport', applicationForm.documents.passport))
      }
      if (applicationForm.documents.photo) {
        uploadPromises.push(uploadDocument(newApplication.id, 'photo', applicationForm.documents.photo))
      }
      if (applicationForm.documents.proofOfFunds) {
        uploadPromises.push(uploadDocument(newApplication.id, 'proof_of_funds', applicationForm.documents.proofOfFunds))
      }

      await Promise.all(uploadPromises)

      // Refresh applications list
      const applicationsResponse = await apiClient.get<{ items: VisaApplication[]; total: number; page: number; limit: number }>('/visa/applications')
      setApplications(applicationsResponse.items || [])

      setShowSuccess(true)

      // Reset form
      setApplicationForm({
        destinationCountry: '',
        firstName: '',
        lastName: '',
        passportNumber: '',
        passportExpiry: '',
        documents: { passport: null, photo: null, proofOfFunds: null },
      })

    } catch (error: any) {
      const status = error?.status ?? (error?.response?.status ?? '?')
      const body = error?.message ?? JSON.stringify(error?.response?.data ?? error)
      console.error(`Failed to submit application [HTTP ${status}]:`, body)
      alert(`Erreur lors de la soumission [${status}]: ${typeof body === 'string' ? body : JSON.stringify(body)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const uploadDocument = async (applicationId: string, documentType: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentType', documentType)

    try {
      await uploadFile(`/visa/applications/${applicationId}/documents`, formData)
    } catch (error) {
      console.error(`Failed to upload ${documentType}:`, error)
      throw error
    }
  }

  const handleDownloadVisa = (application: VisaApplication) => {
    // Simulate download
    const link = document.createElement('a')
    link.href = '#'
    link.download = `visa_${application.countryName}_${application.id}.pdf`
    // In real app, would download actual file
    alert(`Téléchargement du visa pour ${application.countryName}`)
  }

  const handleDownloadVisaDoc = (doc: VisaApplication['documents'][number]) => {
    if (!doc.fileUrl) {
      alert('Aucun fichier disponible pour ce document')
      return
    }
    // Open in a new tab — Cloudinary CDN URLs are public and can be opened directly
    window.open(doc.fileUrl, '_blank', 'noopener,noreferrer')
  }

  const handleRequestVisa = (countryCode: string) => {
    setApplicationForm(prev => ({ ...prev, destinationCountry: countryCode }))
    setActiveTab('apply')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">e-Visa</h1>
        <p className="text-muted-foreground">
          Vérifiez l'éligibilité et demandez votre visa en ligne
        </p>
      </div>

      {authError && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-800 font-medium">{authError}</p>
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Se connecter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-[#44DBD4]/10">
          <TabsTrigger value="check" className="data-[state=active]:bg-[#44DBD4] data-[state=active]:text-white">Vérifier éligibilité</TabsTrigger>
          <TabsTrigger value="apply" className="data-[state=active]:bg-[#44DBD4] data-[state=active]:text-white">Nouvelle demande</TabsTrigger>
          <TabsTrigger value="applications" className="data-[state=active]:bg-[#44DBD4] data-[state=active]:text-white">Mes demandes</TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-[#44DBD4] data-[state=active]:text-white">Mes documents</TabsTrigger>
        </TabsList>

        {/* Check Eligibility */}
        <TabsContent value="check" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vérifier l'éligibilité au visa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pays de destination</label>
                <Select onValueChange={setSelectedCountry} value={selectedCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un pays" />
                  </SelectTrigger>
                  <SelectContent>
                    {(destinations || []).map((country) => (
                      <SelectItem key={country.countryCode} value={country.countryCode}>
                        {country.countryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCountry && (
                <div className="border rounded-lg p-6 space-y-4 bg-muted/30">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Chargement...</span>
                    </div>
                  ) : requirements ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">
                            e-Visa disponible
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Les citoyens français peuvent demander un e-Visa pour {requirements.countryName}
                          </p>
                        </div>
                        
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Frais et délai:</span><br/>
                            {requirements.fee ? formatPrice(requirements.fee.xaf, 'XAF') : 'Variable'}<br/>
                            Délai: {requirements.processingDays} jours ouvrés
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Frais de e-Visa
                          </div>
                          <div className="text-2xl font-bold text-[#44DBD4]">
                            {requirements.fee ? formatPrice(requirements.fee.xaf, 'XAF') : 'Variable'}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Délai de traitement: {requirements.processingDays} jours ouvrés
                          </div>
                        </div>
                        <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => handleRequestVisa(selectedCountry)}>
                          Demander un e-Visa
                          <Plus className="ml-2 h-4 w-4" />
                        </Button>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-sm mb-2 text-blue-900">
                          Documents requis
                        </h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          {requirements.requirements.map((req, index) => (
                            <li key={index}>· {req.label} {req.required ? '(requis)' : '(optionnel)'}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Informations non disponibles pour ce pays
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Application */}
        <TabsContent value="apply" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nouvelle demande de e-Visa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pays de destination</label>
                   <Select
                     value={applicationForm.destinationCountry}
                     onValueChange={(value) => setApplicationForm(prev => ({ ...prev, destinationCountry: value }))}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Sélectionnez un pays" />
                     </SelectTrigger>
                      <SelectContent>
                        {destinations.map((country) => (
                          <SelectItem key={country.countryCode} value={country.countryCode}>
                            {country.countryName} - {formatPrice(country.processingFee, 'XAF')}
                          </SelectItem>
                        ))}
                     </SelectContent>
                   </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Prénom</label>
                    <Input 
                      placeholder="Votre prénom" 
                      value={applicationForm.firstName}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nom</label>
                    <Input 
                      placeholder="Votre nom" 
                      value={applicationForm.lastName}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Numéro de passeport</label>
                    <Input 
                      placeholder="Ex: 12AB34567" 
                      value={applicationForm.passportNumber}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, passportNumber: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Date d'expiration du passeport
                    </label>
                    <Input 
                      type="date" 
                      value={applicationForm.passportExpiry}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, passportExpiry: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold">Documents requis</h3>
                  
                  <div className="space-y-3">
                    {/* Passport Document */}
                    <div className={`border rounded-lg p-4 ${applicationForm.documents.passport ? 'bg-green-50 border-green-200' : 'hover:bg-muted/50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {applicationForm.documents.passport ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div>
                            <div className="font-medium">Copie du passeport</div>
                            <div className="text-sm text-muted-foreground">
                              {applicationForm.documents.passport?.name || 'PDF, JPG ou PNG (max 5MB)'}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleFileUpload('passport')}>
                          <Upload className="h-4 w-4 mr-2" />
                          {applicationForm.documents.passport ? 'Modifier' : 'Uploader'}
                        </Button>
                      </div>
                    </div>

                    {/* Photo Document */}
                    <div className={`border rounded-lg p-4 ${applicationForm.documents.photo ? 'bg-green-50 border-green-200' : 'hover:bg-muted/50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {applicationForm.documents.photo ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div>
                            <div className="font-medium">Photo d'identité</div>
                            <div className="text-sm text-muted-foreground">
                              {applicationForm.documents.photo?.name || 'JPG ou PNG (max 2MB)'}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleFileUpload('photo')}>
                          <Upload className="h-4 w-4 mr-2" />
                          {applicationForm.documents.photo ? 'Modifier' : 'Uploader'}
                        </Button>
                      </div>
                    </div>

                    {/* Proof of Funds */}
                    <div className={`border rounded-lg p-4 ${applicationForm.documents.proofOfFunds ? 'bg-green-50 border-green-200' : 'hover:bg-muted/50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {applicationForm.documents.proofOfFunds ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div>
                            <div className="font-medium">Justificatif de fonds</div>
                            <div className="text-sm text-muted-foreground">
                              {applicationForm.documents.proofOfFunds?.name || 'Relevé bancaire (PDF)'}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleFileUpload('proofOfFunds')}>
                          <Upload className="h-4 w-4 mr-2" />
                          {applicationForm.documents.proofOfFunds ? 'Modifier' : 'Uploader'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fee Summary */}
                {applicationForm.destinationCountry && destinations.find(c => c.countryCode === applicationForm.destinationCountry) && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Frais de traitement</span>
                      <span className="text-xl font-bold text-[#44DBD4]">
                        {formatPrice(
                          destinations.find(c => c.countryCode === applicationForm.destinationCountry)?.processingFee || 50,
                          'XAF'
                        )}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button 
                    className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" 
                    size="lg"
                    onClick={handleSubmitApplication}
                    disabled={isSubmitting || !applicationForm.destinationCountry || !applicationForm.firstName}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Soumission en cours...
                      </>
                    ) : (
                      'Soumettre la demande'
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => {
                      setApplicationForm({
                        destinationCountry: '',
                        firstName: '',
                        lastName: '',
                        passportNumber: '',
                        passportExpiry: '',
                        documents: { passport: null, photo: null, proofOfFunds: null },
                      })
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Applications */}
        <TabsContent value="applications" className="space-y-4">
          {applications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">Aucune demande</h3>
                <p className="text-muted-foreground mb-4">
                  Vous n'avez pas encore soumis de demande de visa
                </p>
                <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => setActiveTab('apply')}>Nouvelle demande</Button>
              </CardContent>
            </Card>
          ) : (
            applications.map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(application.status)}
                        e-Visa pour {application.countryName}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground">
                        Demande #{application.id}
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(application.status)}>
                      {getStatusLabel(application.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress */}
                  {application.status === 'processing' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Traitement en cours...</span>
                        <span>5 jours restants</span>
                      </div>
                      <Progress value={60} />
                    </div>
                  )}

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Date de soumission</div>
                      <div className="font-semibold">
                        {formatDate(application.createdAt)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Frais de traitement</div>
                      <div className="font-semibold">
                        {formatPrice(application.processingFee || 50, 'XAF')}
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Documents soumis ({application.documents.length})</h4>
                    <div className="space-y-2">
                      {application.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium truncate max-w-[200px]">{doc.fileName}</span>
                              <span className="text-xs text-muted-foreground">{formatDate(doc.uploadedAt)}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadVisaDoc(doc)}
                            disabled={!doc.fileUrl}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {application.documents.length === 0 && (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          Aucun document soumis
                        </div>
                      )}
                    </div>
                  </div>

                  {application.status === 'approved' && (
                    <div className="flex gap-3 pt-4 border-t">
                      <Button className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => handleDownloadVisa(application)}>
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger le visa
                      </Button>
                      <Button variant="outline">Détails</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* My Documents */}
        <TabsContent value="documents" className="space-y-4">
          <DocumentStorage />
        </TabsContent>
      </Tabs>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Demande soumise avec succès
            </DialogTitle>
            <DialogDescription>
              Votre demande de e-Visa a été soumise. Vous recevrez une notification dès qu'elle sera traitée.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => {
              setShowSuccess(false)
              setActiveTab('applications')
            }}>
              Voir mes demandes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
