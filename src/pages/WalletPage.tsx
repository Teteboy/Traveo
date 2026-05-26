import { useState } from 'react'
import { Wallet, Plus, Send, TrendingUp, Banknote, ArrowUpRight, ArrowDownLeft, RotateCcw, Check, Loader2, Phone, AlertCircle, RefreshCcw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatPrice, formatDateTime } from '@/lib/formatters'
import { useWalletBalance, useWalletTransactions, useAddFunds, useWithdraw } from '@/hooks/useWallet'
import { RefundManagement } from '@/components/wallet/RefundManagement'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'

type DialogType = 'none' | 'recharge' | 'transfer' | 'withdraw'

export function WalletPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const [activeDialog, setActiveDialog] = useState<DialogType>('none')
  const [amount, setAmount] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [mobileProvider, setMobileProvider] = useState<'mtn_momo' | 'orange_money'>('mtn_momo')
  const [filter, setFilter] = useState('all')

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <Wallet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connectez-vous pour accéder au portefeuille</h2>
        <p className="text-muted-foreground mb-6">
          Gérez votre solde, consultez vos transactions et effectuez des paiements en toute sécurité.
        </p>
        <div className="space-y-3">
          <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => navigate('/login')}>
            Se connecter
          </Button>
          <div className="text-sm text-muted-foreground">
            Pas encore de compte?{' '}
            <Button variant="link" className="p-0 h-auto text-[#44DBD4]" onClick={() => navigate('/register')}>
              Créer un compte
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Only call hooks when authenticated to avoid 401 errors
  const { data: balanceData, isLoading: balanceLoading, error: balanceError, refetch: refetchBalance } = useWalletBalance()
  const { data: txData, isLoading: txLoading } = useWalletTransactions({ limit: 30 })
  const addFunds = useAddFunds()
  const withdrawFunds = useWithdraw()

  // Show loading state while fetching wallet data
  if (balanceLoading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="flex items-center justify-center mb-8">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error messages if wallet data fails to load
  if (balanceError) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Erreur de chargement</h2>
        <p className="text-muted-foreground mb-6">{balanceError.message}</p>
        <Button onClick={() => refetchBalance()} className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </div>
    )
  }

  // Parse balance
  const balance = (balanceData as any)?.balance ?? (balanceData as any)?.data?.balance ?? 0
  const currency = (balanceData as any)?.currency ?? 'XAF'
  const transactions = txData?.items ?? (txData as any)?.transactions ?? []

  const filteredTransactions = filter === 'all' ? transactions : transactions.filter((t: any) => t.type === filter)

  const handleRecharge = async () => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    if (!phoneNumber) { toast.error('Veuillez entrer un numÃ©ro de tÃ©lÃ©phone'); return }
    try {
      await addFunds.mutateAsync({ amount: amt, currency, provider: mobileProvider, phone: phoneNumber })
      toast.success(`${formatPrice(amt, currency)} rechargÃ© avec succÃ¨s`)
      setActiveDialog('none'); setAmount(''); setPhoneNumber('')
      refetchBalance()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors du rechargement')
    }
  }

  const handleWithdraw = async () => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    if (!phoneNumber) { toast.error('Veuillez entrer un numÃ©ro de tÃ©lÃ©phone'); return }
    if (amt > balance) { toast.error('Solde insuffisant'); return }
    try {
      await withdrawFunds.mutateAsync({ amount: amt, currency, provider: mobileProvider, phone: phoneNumber })
      toast.success(`Retrait de ${formatPrice(amt, currency)} effectuÃ©`)
      setActiveDialog('none'); setAmount(''); setPhoneNumber('')
      refetchBalance()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors du retrait')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mon Portefeuille</h1>
        <p className="text-muted-foreground">GÃ©rez vos fonds et transactions</p>
      </div>

      {/* Balance Card */}
      <Card className="mb-8 bg-gradient-to-br from-[#44DBD4] to-[#3bc9c2] text-white border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-6 w-6" />
              <span className="font-medium opacity-90">Solde disponible</span>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => refetchBalance()}>
              <RefreshCcw className="h-5 w-5" />
            </Button>
          </div>
          {balanceLoading ? (
            <Skeleton className="h-14 w-48 bg-white/20" />
          ) : balanceError ? (
            <div className="flex items-center gap-2 text-white/80"><AlertCircle className="h-5 w-5" /><span>Impossible de charger le solde</span></div>
          ) : (
            <div className="text-5xl font-bold mb-1">{formatPrice(balance, currency)}</div>
          )}
          <p className="text-white/80 text-sm mt-1">{currency} â€” Portefeuille Traveo</p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Button size="lg" className="h-auto py-6 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => setActiveDialog('recharge')}>
          <div className="flex flex-col items-center gap-2">
            <Plus className="h-6 w-6" />
            <span>Recharger</span>
          </div>
        </Button>
        <Button size="lg" variant="outline" className="h-auto py-6 border-[#44DBD4] text-[#44DBD4] hover:bg-[#44DBD4]/10" onClick={() => setActiveDialog('withdraw')}>
          <div className="flex flex-col items-center gap-2">
            <Send className="h-6 w-6" />
            <span>Retirer</span>
          </div>
        </Button>
        <Button size="lg" variant="outline" className="h-auto py-6" onClick={() => navigate('/my-trips')}>
          <div className="flex flex-col items-center gap-2">
            <RotateCcw className="h-6 w-6" />
            <span>Mes voyages</span>
          </div>
        </Button>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="refunds">Remboursements</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Historique des transactions</CardTitle>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="credit">CrÃ©dits</SelectItem>
                    <SelectItem value="debit">DÃ©bits</SelectItem>
                    <SelectItem value="refund">Remboursements</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {txLoading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg mb-3" />)
              ) : filteredTransactions.length === 0 ? (
                <div className="py-12 text-center">
                  <Banknote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Aucune transaction</h3>
                  <p className="text-muted-foreground">Vos transactions apparaÃ®tront ici</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTransactions.map((tx: any) => (
                    <div key={tx.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-full ${tx.type === 'credit' || tx.type === 'refund' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {tx.type === 'credit' || tx.type === 'refund' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                          </div>
                          <div>
                            <div className="font-semibold">{tx.description ?? tx.label ?? tx.type}</div>
                            <div className="text-sm text-muted-foreground">{formatDateTime(tx.createdAt ?? tx.date ?? new Date().toISOString())}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${tx.type === 'credit' || tx.type === 'refund' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type === 'credit' || tx.type === 'refund' ? '+' : '-'}
                            {formatPrice(Math.abs(tx.amount ?? 0), tx.currency ?? currency)}
                          </div>
                          <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                            {tx.status ?? 'completed'}
                          </Badge>
                        </div>
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunds">
          <RefundManagement />
        </TabsContent>
      </Tabs>

      {/* Recharge Dialog */}
      <Dialog open={activeDialog === 'recharge'} onOpenChange={() => setActiveDialog('none')}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recharger via Mobile Money</DialogTitle>
            <DialogDescription>Ajoutez des fonds via MTN MoMo ou Orange Money</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              {[5000, 10000, 25000, 50000].map((p) => (
                <Button key={p} variant="outline" size="sm" onClick={() => setAmount(String(p))} className={amount === String(p) ? 'border-[#44DBD4] text-[#44DBD4]' : ''}>
                  {formatPrice(p, currency)}
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Montant (XAF)</label>
              <Input type="number" placeholder="Ex: 10000" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">OpÃ©rateur</label>
              <Select value={mobileProvider} onValueChange={v => setMobileProvider(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mtn_momo">MTN Mobile Money</SelectItem>
                  <SelectItem value="orange_money">Orange Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">NumÃ©ro de tÃ©lÃ©phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="+237 6XX XXX XXX" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setActiveDialog('none')}>Annuler</Button>
            <Button className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={handleRecharge} disabled={addFunds.isPending}>
              {addFunds.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
              Recharger
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={activeDialog === 'withdraw'} onOpenChange={() => setActiveDialog('none')}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Retirer des fonds</DialogTitle>
            <DialogDescription>TransfÃ©rez vers votre Mobile Money</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Solde disponible</p>
              <p className="text-2xl font-bold text-[#44DBD4]">{formatPrice(balance, currency)}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Montant Ã  retirer</label>
              <Input type="number" placeholder="Ex: 10000" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">OpÃ©rateur</label>
              <Select value={mobileProvider} onValueChange={v => setMobileProvider(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mtn_momo">MTN Mobile Money</SelectItem>
                  <SelectItem value="orange_money">Orange Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">NumÃ©ro de rÃ©ception</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="+237 6XX XXX XXX" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setActiveDialog('none')}>Annuler</Button>
            <Button className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={handleWithdraw} disabled={withdrawFunds.isPending}>
              {withdrawFunds.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TrendingUp className="h-4 w-4 mr-2" />}
              Retirer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

