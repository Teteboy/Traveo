import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useProviderAuthStore } from '@/stores/providerAuthStore'
import { apiClient } from '@/lib/apiClient'
import { User, Building2, Shield, CreditCard, Save, Edit, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function ProviderSettingsPage() {
  const { provider, updateProviderProfile } = useProviderAuthStore()
  const [activeTab, setActiveTab] = useState('profile')

  const [first, last] = (provider?.name ?? '').split(' ')
  const [profileForm, setProfileForm] = useState({
    firstName: first ?? '', lastName: last ?? '', email: provider?.email ?? '', phone: provider?.phone ?? '',
  })
  const [businessForm, setBusinessForm] = useState({
    companyName: provider?.businessName ?? '', description: '',
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingBusiness, setSavingBusiness] = useState(false)
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })
  const [savingPwd, setSavingPwd] = useState(false)

  const saveProfile = async () => {
    setSavingProfile(true)
    try {
      await apiClient.patch('/auth/me', {
        firstName: profileForm.firstName, lastName: profileForm.lastName, phone: profileForm.phone,
      })
      updateProviderProfile({ name: `${profileForm.firstName} ${profileForm.lastName}`, phone: profileForm.phone })
      toast.success('Profil enregistré')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Échec')
    } finally { setSavingProfile(false) }
  }

  const saveBusiness = async () => {
    setSavingBusiness(true)
    try {
      await apiClient.patch('/providers/me', { companyName: businessForm.companyName, description: businessForm.description })
      updateProviderProfile({ businessName: businessForm.companyName })
      toast.success('Détails de l\'entreprise enregistrés')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Échec')
    } finally { setSavingBusiness(false) }
  }

  const changePassword = async () => {
    if (!pwd.current || !pwd.next) return toast.error('Renseignez les champs')
    if (pwd.next !== pwd.confirm) return toast.error('Les mots de passe ne correspondent pas')
    setSavingPwd(true)
    try {
      await apiClient.patch('/auth/password', { currentPassword: pwd.current, newPassword: pwd.next })
      setPwd({ current: '', next: '', confirm: '' })
      toast.success('Mot de passe mis à jour')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Échec')
    } finally { setSavingPwd(false) }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="property">
            <Building2 className="h-4 w-4 mr-2" />
            Property
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="h-4 w-4 mr-2" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={profileForm.firstName} onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={profileForm.lastName} onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })} />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={profileForm.email} disabled />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
              </div>
              <Button onClick={saveProfile} disabled={savingProfile} className="bg-[#44DBD4] hover:bg-[#3bc9c2]">
                {savingProfile ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Property Tab */}
        <TabsContent value="property" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" value={businessForm.companyName} onChange={e => setBusinessForm({ ...businessForm, companyName: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="businessType">Business Type</Label>
                <Input id="businessType" defaultValue={provider?.businessType} disabled />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Describe your business..."
                  value={businessForm.description}
                  onChange={e => setBusinessForm({ ...businessForm, description: e.target.value })}
                />
              </div>
              <Button onClick={saveBusiness} disabled={savingBusiness} className="bg-[#44DBD4] hover:bg-[#3bc9c2]">
                {savingBusiness ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" value={pwd.current} onChange={e => setPwd({ ...pwd, current: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" value={pwd.next} onChange={e => setPwd({ ...pwd, next: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" value={pwd.confirm} onChange={e => setPwd({ ...pwd, confirm: e.target.value })} />
              </div>
              <Button onClick={changePassword} disabled={savingPwd} className="bg-[#44DBD4] hover:bg-[#3bc9c2]">
                {savingPwd && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Update Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium">2FA Status</p>
                  <p className="text-sm text-slate-500">Add an extra layer of security</p>
                </div>
                <Badge className="bg-red-100 text-red-700">Disabled</Badge>
              </div>
              <Button variant="outline">Enable 2FA</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Windows PC • Chrome</p>
                  <p className="text-xs text-slate-500">New York, USA • Last active: Now</p>
                </div>
                <Badge className="bg-green-100 text-green-700">Current</Badge>
              </div>
              <Button variant="outline" size="sm">Sign out of all devices</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <Badge className="bg-[#44DBD4] text-white mb-2">PRO</Badge>
                  <h3 className="text-2xl font-bold">Pro Plan</h3>
                  <p className="text-slate-600">
                    $99 <span className="text-sm">/ month</span>
                  </p>
                </div>
                <Button variant="outline">Upgrade</Button>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600">Next Billing Date</p>
                  <p className="font-semibold">March 1, 2026</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-slate-400" />
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-slate-500">Visa • Expires 09/27</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { period: 'February 2026', date: 'Feb 1, 2026', amount: 99 },
                  { period: 'January 2026', date: 'Jan 1, 2026', amount: 99 },
                  { period: 'December 2025', date: 'Dec 1, 2025', amount: 99 },
                ].map((invoice, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">Pro Plan — {invoice.period}</p>
                      <p className="text-sm text-slate-500">{invoice.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold">${invoice.amount}.00</p>
                      <Badge className="bg-green-100 text-green-700">Paid</Badge>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Invoices
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
