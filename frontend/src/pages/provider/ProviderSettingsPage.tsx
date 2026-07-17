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
import { User, Building2, Shield, CreditCard, Save, Loader2, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'

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

  // Fetch earnings data
  const { data: earningsData, isLoading: earningsLoading } = useQuery({
    queryKey: ['provider-earnings'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: { totalRevenue: number; pendingPayments: number; avgBookingValue: number; commissionFees: number; currency: string } }>('/providers/earnings')
      return response.data
    },
  })

  // Fetch payout requests
  const { data: payoutsData, isLoading: payoutsLoading } = useQuery({
    queryKey: ['provider-payouts'],
    queryFn: async () => {
      const response = await apiClient.get<{ items: any[] }>('/providers/payouts')
      return response
    },
  })

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
              <CardTitle>Earnings Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {earningsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#44DBD4]" />
                </div>
              ) : earningsData ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-[#44DBD4]">
                      {(earningsData.totalRevenue / 100).toLocaleString()} {earningsData.currency}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Pending Payments</p>
                    <p className="text-2xl font-bold text-orange-500">
                      {(earningsData.pendingPayments / 100).toLocaleString()} {earningsData.currency}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Commission Fees</p>
                    <p className="text-2xl font-bold text-red-500">
                      {(earningsData.commissionFees / 100).toLocaleString()} {earningsData.currency}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Avg Booking Value</p>
                    <p className="text-2xl font-bold text-slate-700">
                      {(earningsData.avgBookingValue / 100).toLocaleString()} {earningsData.currency}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500">No earnings data available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payout Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {payoutsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#44DBD4]" />
                </div>
              ) : payoutsData?.items && payoutsData.items.length > 0 ? (
                <div className="space-y-3">
                  {payoutsData.items.map((payout: any) => (
                    <div
                      key={payout.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">Payout Request</p>
                        <p className="text-sm text-slate-500">
                          {new Date(payout.requestedAt).toLocaleDateString()} • {payout.bankDetails}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-semibold">{payout.amount.toLocaleString()} {payout.currency}</p>
                        <Badge
                          className={
                            payout.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-700'
                              : payout.status === 'PROCESSING'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }
                        >
                          {payout.status.toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No payout requests found</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Request Payout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="payoutAmount">Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="payoutAmount"
                    type="number"
                    className="pl-10"
                    placeholder="Enter amount"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bankDetails">Bank Details</Label>
                <Textarea
                  id="bankDetails"
                  rows={3}
                  placeholder="Enter your bank account details..."
                />
              </div>
              <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2]">
                Submit Payout Request
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
