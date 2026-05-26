import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, User, Shield, Bell, Globe, HelpCircle, LogOut,
  Trash2, ChevronRight, Briefcase, CreditCard, Lock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'

export function SettingsPage() {
  const navigate = useNavigate()
  const logout = useAuthStore(s => s.logout)
  const user = useAuthStore(s => s.user)

  const [language, setLanguage] = useState('fr')
  const [currency, setCurrency] = useState('XAF')
  const [timezone, setTimezone] = useState('Africa/Douala')
  const [emailNotif, setEmailNotif] = useState(true)
  const [pushNotif, setPushNotif] = useState(true)
  const [smsNotif, setSmsNotif] = useState(false)
  const [marketingNotif, setMarketingNotif] = useState(false)
  const [twoFA, setTwoFA] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleSavePreferences = () => {
    toast.success('Préférences enregistrées')
  }

  const handleSaveNotifications = () => {
    toast.success('Préférences de notifications mises à jour')
  }

  const handleDeleteAccount = () => {
    toast.error('La suppression de compte sera disponible prochainement')
    setShowDeleteDialog(false)
  }

  const sections = [
    { id: 'account', icon: User, title: 'Compte', desc: 'Informations personnelles, mot de passe', action: () => navigate('/profile') },
    { id: 'security', icon: Shield, title: 'Sécurité & confidentialité', desc: 'Mot de passe, sessions, 2FA', action: () => navigate('/profile') },
    { id: 'wallet', icon: CreditCard, title: 'Portefeuille & paiements', desc: 'Recharges, retraits, historique', action: () => navigate('/wallet') },
    { id: 'provider', icon: Briefcase, title: 'Devenir prestataire', desc: 'Proposer vos services sur Traveo', action: () => navigate('/become-provider') },
    { id: 'help', icon: HelpCircle, title: 'Centre d\'aide & support', desc: 'FAQ, contact, signalement', action: () => navigate('/support') },
  ]

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate('/profile')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour au profil
        </Button>

        <h1 className="text-3xl font-bold mb-2">Paramètres</h1>
        <p className="text-muted-foreground mb-6">Gérez votre compte, vos préférences et vos notifications</p>

        <Card className="mb-6">
          <CardContent className="p-0">
            {sections.map((s, i) => (
              <div key={s.id}>
                <button onClick={s.action} className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left">
                  <div className="p-2 rounded-lg bg-[#44DBD4]/10"><s.icon className="h-5 w-5 text-[#44DBD4]" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{s.title}</div>
                    <div className="text-sm text-muted-foreground truncate">{s.desc}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
                {i < sections.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notifications</CardTitle>
            <CardDescription>Choisissez comment Traveo vous contacte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: 'email', label: 'Email', desc: 'Confirmations, reçus et mises à jour', val: emailNotif, set: setEmailNotif },
              { id: 'push', label: 'Push', desc: 'Notifications dans le navigateur', val: pushNotif, set: setPushNotif },
              { id: 'sms', label: 'SMS', desc: 'Alertes critiques (vol, paiement)', val: smsNotif, set: setSmsNotif },
              { id: 'marketing', label: 'Offres marketing', desc: 'Promotions et nouveautés', val: marketingNotif, set: setMarketingNotif },
            ].map(n => (
              <div key={n.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{n.label}</div>
                  <div className="text-sm text-muted-foreground">{n.desc}</div>
                </div>
                <Switch checked={n.val} onCheckedChange={n.set} />
              </div>
            ))}
            <Button onClick={handleSaveNotifications} className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white">Enregistrer</Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Langue & région</CardTitle>
            <CardDescription>Personnalisez l'affichage de Traveo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Langue</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="fr">Français</SelectItem><SelectItem value="en">English</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Devise</label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="XAF">FCFA (XAF)</SelectItem><SelectItem value="EUR">Euro (EUR)</SelectItem><SelectItem value="USD">Dollar (USD)</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Fuseau horaire</label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Africa/Douala">Afrique/Douala</SelectItem><SelectItem value="Europe/Paris">Europe/Paris</SelectItem><SelectItem value="UTC">UTC</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSavePreferences} className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white">Enregistrer</Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Sécurité avancée</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Authentification à deux facteurs</div>
                <div className="text-sm text-muted-foreground">Code envoyé par SMS à chaque connexion</div>
              </div>
              <Switch checked={twoFA} onCheckedChange={setTwoFA} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive">Zone dangereuse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" onClick={() => { logout(); navigate('/login') }} className="w-full justify-start">
              <LogOut className="h-4 w-4 mr-2" /> Se déconnecter {user?.email ? `(${user.email})` : ''}
            </Button>
            <Button variant="outline" onClick={() => setShowDeleteDialog(true)} className="w-full justify-start text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" /> Supprimer mon compte
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le compte</DialogTitle>
            <DialogDescription>Cette action est irréversible. Toutes vos réservations et données seront perdues.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>Supprimer définitivement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
