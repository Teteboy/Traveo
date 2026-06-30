import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Utensils,
  MapPin,
  Camera,
  Music,
  Car,
  Home,
  Briefcase,
  FileText,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Star,
  DollarSign,
  Users,
  Globe,
  Phone,
  Mail,
  MapPin as LocationIcon,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
import { Textarea } from '@/components/ui/textarea'

const providerTypes = [
  {
    id: 'hotel',
    name: 'Hôtel / Hébergement',
    icon: Home,
    description: 'Hôtels, auberges, maisons d\'hôtes, ryokans',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    icon: Utensils,
    description: 'Restaurants, cafés, bars',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    id: 'guide',
    name: 'Guide Touristique',
    icon: MapPin,
    description: 'Guides locaux, visites privées',
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 'event',
    name: 'Organisateur d\'événements',
    icon: Music,
    description: 'Concerts, festivals, expositions',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    id: 'transfer',
    name: 'Service de transport',
    icon: Car,
    description: 'Transferts, taxis, locations',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'activity',
    name: 'Activités & Expériences',
    icon: Camera,
    description: 'Ateliers, sports, aventures',
    color: 'bg-cyan-100 text-cyan-600',
  },
]

const mockExistingApplications = [
  {
    id: '1',
    type: 'restaurant',
    businessName: 'Le Petit Bistro',
    status: 'pending',
    submittedAt: '2024-02-18',
    reviewDate: null,
  },
]

export function ProviderApplicationPage() {
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    capacity: '',
    priceRange: 'mid',
    openingHours: '',
    amenities: '',
    additionalInfo: '',
  })

  const handleStartApplication = (type: string) => {
    setSelectedType(type)
    setShowApplicationForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setSubmitted(true)
  }

  const selectedProvider = providerTypes.find(p => p.id === selectedType)

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Demande envoyée!</h2>
            <p className="text-slate-500 mb-6">
              Votre demande pour devenir prestataire a été soumise avec succès. 
              Notre équipe examinera votre demande dans les plus brefs délais.
            </p>
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-600">
                Vous recevrez une notification par email une fois votre demande traitée.
                Le délai de traitement est généralement de 2-3 jours ouvrables.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate('/profile')}>
                Retour au profil
              </Button>
              <Button className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => navigate('/')}>
                Accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#44DBD4] via-[#44DBD4]/90 to-[#3bc9c2] py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <Badge className="bg-white/20 text-white mb-4">Devenir partenaire</Badge>
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
                  <DollarSign className="h-5 w-5 text-green-600" />
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

      {/* Existing Applications */}
      {mockExistingApplications.length > 0 && (
        <div className="container mx-auto max-w-4xl px-4 mt-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Vos demandes en cours</h2>
          <div className="space-y-3">
            {mockExistingApplications.map((app) => (
              <Card key={app.id} className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-lg ${
                        app.type === 'restaurant' ? 'bg-orange-100' :
                        app.type === 'hotel' ? 'bg-purple-100' :
                        'bg-green-100'
                      } flex items-center justify-center`}>
                        {app.type === 'restaurant' && <Utensils className="h-5 w-5 text-orange-600" />}
                        {app.type === 'hotel' && <Home className="h-5 w-5 text-purple-600" />}
                        {app.type === 'guide' && <MapPin className="h-5 w-5 text-green-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{app.businessName}</p>
                        <p className="text-sm text-slate-500">Soumis le {new Date(app.submittedAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <Badge className={
                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      app.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }>
                      {app.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {app.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {app.status === 'rejected' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {app.status === 'pending' ? 'En attente' : app.status === 'approved' ? 'Approuvé' : 'Refusé'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Provider Types */}
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Quel type de prestataire êtes-vous?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providerTypes.map((type) => {
            const Icon = type.icon
            return (
              <Card
                key={type.id}
                className="border-slate-200 hover:border-[#44DBD4] hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => handleStartApplication(type.id)}
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

      {/* Application Form Dialog */}
      <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Demande de partenariat - {selectedProvider?.name}
            </DialogTitle>
            <DialogDescription>
              Remplissez le formulaire ci-dessous pour soumettre votre demande. 
              Tous les champs marqués d'un * sont obligatoires.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 py-4">
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
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Gamme de prix</label>
                  <Select
                    value={formData.priceRange}
                    onValueChange={(v) => setFormData({ ...formData, priceRange: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="budget">Économique</SelectItem>
                      <SelectItem value="mid">Moyen</SelectItem>
                      <SelectItem value="luxury">Luxe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Description *</label>
                <Textarea
                  placeholder="Décrivez votre établissement, vos services, ce qui vous rend unique..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
            </div>

            <Separator />

            {/* Location */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <LocationIcon className="h-4 w-4 text-[#44DBD4]" />
                Localisation
              </h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Adresse *</label>
                <Input
                  placeholder="123 Rue de la Paix"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Ville *</label>
                  <Input
                    placeholder="Paris"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Pays *</label>
                  <Input
                    placeholder="France"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#44DBD4]" />
                Contact
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Téléphone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="tel"
                      placeholder="+33 1 23 45 67 89"
                      className="pl-10"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email professionnel *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="contact@etablissement.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Site web</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="url"
                    placeholder="https://www.votre-site.com"
                    className="pl-10"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Documents */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#44DBD4]" />
                Documents
              </h3>
              
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
                <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-600 mb-2">
                  Glissez-déposez vos fichiers ici ou cliquez pour parcourir
                </p>
                <p className="text-xs text-slate-400">
                  Documents requis: Pièce d'identité, Registre de commerce, Assurance
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  Parcourir les fichiers
                </Button>
              </div>
            </div>

            <Separator />

            {/* Additional Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-[#44DBD4]" />
                Informations supplémentaires
              </h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Informations complémentaires</label>
                <Textarea
                  placeholder="Horaires d'ouverture, équipements disponibles, politiques particulières..."
                  rows={3}
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                />
              </div>
            </div>

            {/* Terms */}
            <div className="bg-slate-50 rounded-lg p-4">
              <label className="flex items-start gap-3 text-sm text-slate-600">
                <input type="checkbox" className="mt-1 rounded border-slate-300" required />
                <span>
                  J'accepte les <a href="#" className="text-[#44DBD4] hover:underline">conditions d'utilisation</a> et 
                  la <a href="#" className="text-[#44DBD4] hover:underline">politique de confidentialité</a> de Traveo. 
                  Je comprends que ma demande sera examinée par l'équipe d'administration.
                </span>
              </label>
            </div>

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
                    Envoi en cours...
                  </>
                ) : (
                  'Soumettre la demande'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
