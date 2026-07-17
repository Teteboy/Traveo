import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Calendar, Plane, Hotel, Utensils, Car, Calendar as CalendarIcon, AlertCircle } from 'lucide-react'

interface GuestBookingFormProps {
  serviceType: 'flight' | 'hotel' | 'guide' | 'restaurant' | 'events' | 'transport'
  serviceData?: any
  amount: number
  currency: string
  onSubmit: (bookingData: any) => void
  isSubmitting?: boolean
}

export function GuestBookingForm({
  serviceType,
  serviceData,
  amount,
  currency,
  onSubmit,
  isSubmitting = false
}: GuestBookingFormProps) {
  const [formData, setFormData] = useState({
    // Common guest info
    guestEmail: '',
    guestPhone: '',
    guestName: '',
    guestCountry: 'CM',
    // Flight-specific (Duffel requirements)
    guestTitle: '',
    guestDateOfBirth: '',
    guestGender: '',
    // Auto-registration
    createAccount: false,
    password: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Common validations
    if (!formData.guestEmail) newErrors.guestEmail = 'Email requis'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guestEmail)) newErrors.guestEmail = 'Email invalide'
    
    if (!formData.guestName) newErrors.guestName = 'Nom complet requis'
    
    if (!formData.guestPhone) newErrors.guestPhone = 'Téléphone requis'

    // Flight-specific validations (Duffel requirements)
    if (serviceType === 'flight') {
      if (!formData.guestTitle) newErrors.guestTitle = 'Titre requis (Mr, Mrs, Ms)'
      if (!formData.guestDateOfBirth) newErrors.guestDateOfBirth = 'Date de naissance requise'
      if (!formData.guestGender) newErrors.guestGender = 'Genre requis'
    }

    // Password validation if creating account
    if (formData.createAccount && !formData.password) {
      newErrors.password = 'Mot de passe requis'
    } else if (formData.createAccount && formData.password.length < 6) {
      newErrors.password = 'Mot de passe minimum 6 caractères'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit({
        ...formData,
        serviceType,
        serviceId: serviceData?.id,
        providerId: serviceData?.providerId,
        flightId: serviceData?.flightId,
        totalAmount: amount,
        currency,
        metadata: serviceData?.metadata || {},
      })
    }
  }

  const renderFlightFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="guestTitle">Titre *</Label>
          <Select
            value={formData.guestTitle}
            onValueChange={(value) => setFormData({ ...formData, guestTitle: value })}
          >
            <SelectTrigger id="guestTitle">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mr">Mr</SelectItem>
              <SelectItem value="mrs">Mrs</SelectItem>
              <SelectItem value="ms">Ms</SelectItem>
              <SelectItem value="miss">Miss</SelectItem>
              <SelectItem value="dr">Dr</SelectItem>
            </SelectContent>
          </Select>
          {errors.guestTitle && <p className="text-sm text-red-500">{errors.guestTitle}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="guestGender">Genre *</Label>
          <Select
            value={formData.guestGender}
            onValueChange={(value) => setFormData({ ...formData, guestGender: value })}
          >
            <SelectTrigger id="guestGender">
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="m">Masculin</SelectItem>
              <SelectItem value="f">Féminin</SelectItem>
              <SelectItem value="x">Non spécifié</SelectItem>
            </SelectContent>
          </Select>
          {errors.guestGender && <p className="text-sm text-red-500">{errors.guestGender}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="guestDateOfBirth">Date de naissance *</Label>
        <Input
          id="guestDateOfBirth"
          type="date"
          value={formData.guestDateOfBirth}
          onChange={(e) => setFormData({ ...formData, guestDateOfBirth: e.target.value })}
          max={new Date().toISOString().split('T')[0]}
        />
        {errors.guestDateOfBirth && <p className="text-sm text-red-500">{errors.guestDateOfBirth}</p>}
      </div>
    </div>
  )

  const getServiceIcon = () => {
    switch (serviceType) {
      case 'flight': return <Plane className="h-5 w-5" />
      case 'hotel': return <Hotel className="h-5 w-5" />
      case 'guide': return <User className="h-5 w-5" />
      case 'restaurant': return <Utensils className="h-5 w-5" />
      case 'events': return <CalendarIcon className="h-5 w-5" />
      case 'transport': return <Car className="h-5 w-5" />
      default: return <Calendar className="h-5 w-5" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getServiceIcon()}
          Informations du voyageur
        </CardTitle>
        <CardDescription>
          {serviceType === 'flight' 
            ? 'Remplissez vos informations pour le vol (conforme aux exigences Duffel)'
            : 'Remplissez vos informations pour la réservation'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Common Guest Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guestName">Nom complet *</Label>
              <Input
                id="guestName"
                placeholder="Jean Dupont"
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
              />
              {errors.guestName && <p className="text-sm text-red-500">{errors.guestName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestEmail">Email *</Label>
              <Input
                id="guestEmail"
                type="email"
                placeholder="jean@example.com"
                value={formData.guestEmail}
                onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
              />
              {errors.guestEmail && <p className="text-sm text-red-500">{errors.guestEmail}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestPhone">Téléphone *</Label>
              <Input
                id="guestPhone"
                type="tel"
                placeholder="+237 600 000 000"
                value={formData.guestPhone}
                onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
              />
              {errors.guestPhone && <p className="text-sm text-red-500">{errors.guestPhone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestCountry">Pays</Label>
              <Select
                value={formData.guestCountry}
                onValueChange={(value) => setFormData({ ...formData, guestCountry: value })}
              >
                <SelectTrigger id="guestCountry">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CM">Cameroun</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="US">États-Unis</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="GB">Royaume-Uni</SelectItem>
                  <SelectItem value="DE">Allemagne</SelectItem>
                  <SelectItem value="SN">Sénégal</SelectItem>
                  <SelectItem value="CI">Côte d'Ivoire</SelectItem>
                  <SelectItem value="NG">Nigeria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Flight-specific fields */}
          {serviceType === 'flight' && renderFlightFields()}

          {/* Auto-registration option */}
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="createAccount"
                checked={formData.createAccount}
                onCheckedChange={(checked: boolean | 'indeterminate') => setFormData({ ...formData, createAccount: checked === true })}
              />
              <div className="space-y-1">
                <Label htmlFor="createAccount" className="font-medium cursor-pointer">
                  Créer un compte Traveo
                </Label>
                <p className="text-sm text-muted-foreground">
                  Recevez vos réservations, gagnez des points de fidélité et accédez à des offres exclusives.
                </p>
              </div>
            </div>

            {formData.createAccount && (
              <div className="space-y-2 ml-7">
                <Label htmlFor="password">Mot de passe temporaire *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 caractères"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                <p className="text-xs text-muted-foreground">
                  Vous pourrez modifier ce mot de passe après votre première connexion.
                </p>
              </div>
            )}
          </div>

          {/* Booking Summary */}
          <div className="p-4 bg-slate-50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service:</span>
              <span className="font-medium capitalize">{serviceType}</span>
            </div>
            {serviceData?.name && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{serviceType === 'flight' ? 'Vol' : 'Service'}:</span>
                <span className="font-medium">{serviceData.name}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Total:</span>
              <span className="text-[#44DBD4]">{amount.toLocaleString()} {currency}</span>
            </div>
          </div>

          {/* Info alert for guests */}
          {!formData.createAccount && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-800">
                Sans compte, vous ne pourrez pas suivre cette réservation en ligne. 
                Nous vous recommandons de créer un compte.
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Traitement en cours...' : 'Continuer vers le paiement'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
