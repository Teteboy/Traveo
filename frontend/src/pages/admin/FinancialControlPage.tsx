import { useState, useEffect } from 'react'
import {
  Wallet,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Download,
  MoreHorizontal,
  Eye,
  RefreshCw,
  Ban,
  Users,
  Percent,
  FileText,
  Shield,
  Calendar,
  MessageSquare,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { PaginationControls } from '@/components/ui/pagination-controls'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useAdminFinancial, useAdminPayments, useAdminRefunds } from '@/hooks/useAdmin'

const FALLBACK_STATS = {
  totalBalance: 0,
  pendingSettlements: 0,
  monthlyRevenue: 0,
  monthlyExpenses: 0,
  activeWallets: 0,
  totalCommissions: 0,
  pendingRefunds: 0,
  flaggedTransactions: 0,
}

interface Refund {
  id: string
  bookingId: string
  userName: string
  amount: number
  currency: string
  reason: string
  status: string
  createdAt: string
  provider: string
  providerNotified?: boolean
  disputeReason?: string
  processedAt?: string | null
  requestedAt?: string
}

interface Transaction {
  id: string
  type: string
  description: string
  amount: number
  currency: string
  status: string
  userId: string
  userName: string
  createdAt: string
  paymentMethod: string
  commission?: number
  flagReason?: string
}

interface Dispute {
  id: string
  transactionId: string
  userName: string
  amount: number
  status: string
  priority: string
  createdAt: string
  assignedTo: string
  notes: string
}

interface Commission {
  service: string
  rate: number
  revenue: number
}

const initialDisputes: Dispute[] = [
  {
    id: 'DSP001',
    transactionId: 'TXN005',
    userName: 'Compte Suspicious',
    amount: 2500,
    status: 'investigating',
    priority: 'high',
    createdAt: '2024-02-19T14:00:00',
    assignedTo: 'Security Team',
    notes: 'Potential card fraud - multiple failed attempts',
  },
  {
    id: 'DSP002',
    transactionId: 'TXN002',
    userName: 'Marie Martin',
    amount: 320,
    status: 'open',
    priority: 'medium',
    createdAt: '2024-02-20T09:45:00',
    assignedTo: 'Support Team',
    notes: 'Customer claims hotel was not as described',
  },
]

const initialCommissions: Commission[] = [
  { service: 'Vols', rate: 5.5, revenue: 45000 },
  { service: 'Hôtels', rate: 12, revenue: 28000 },
  { service: 'Événements', rate: 8, revenue: 8500 },
  { service: 'Guides', rate: 15, revenue: 5200 },
  { service: 'Restaurants', rate: 10, revenue: 2300 },
]

const transactionTypes = {
  booking: { label: 'Réservation', color: 'bg-blue-100 text-blue-700' },
  refund: { label: 'Remboursement', color: 'bg-red-100 text-red-700' },
  payout: { label: 'Paiement', color: 'bg-orange-100 text-orange-700' },
  deposit: { label: 'Dépôt', color: 'bg-green-100 text-green-700' },
  fraud: { label: 'Fraude', color: 'bg-red-100 text-red-700' },
}

const transactionStatus = {
  completed: { label: 'Complété', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  processing: { label: 'En cours', color: 'bg-blue-100 text-blue-700', icon: RefreshCw },
  flagged: { label: 'Signalé', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  disputed: { label: 'Litige', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
}

export function FinancialControlPage() {
  const financialQuery = useAdminFinancial()
  const paymentsQuery = useAdminPayments({ page: 1, limit: 50 })
  const refundsQuery = useAdminRefunds({ page: 1, limit: 50 })

  const f = financialQuery.data?.data
  const financialStats = f ? {
    totalBalance: f.totalRevenue / 100,
    pendingSettlements: f.pendingSettlements / 100,
    monthlyRevenue: f.monthlyRevenue / 100,
    monthlyExpenses: 0,
    activeWallets: f.activeWallets,
    totalCommissions: f.totalCommissions / 100,
    pendingRefunds: f.pendingRefunds / 100,
    flaggedTransactions: f.pendingRefundCount,
  } : FALLBACK_STATS

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [disputes, setDisputes] = useState<Dispute[]>(initialDisputes)
  const [commissions, setCommissions] = useState<Commission[]>(initialCommissions)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null)
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null)

  useEffect(() => {
    if (paymentsQuery.data?.items) {
      setTransactions(paymentsQuery.data.items.map(p => ({
        id: p.id,
        type: 'booking',
        description: `Réservation ${p.bookingId}`,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        userId: p.userName || '',
        userName: p.userName || p.userEmail || 'Utilisateur',
        createdAt: p.createdAt,
        paymentMethod: 'card',
        commission: Math.round(p.amount * 0.05),
      })))
    }
  }, [paymentsQuery.data])

  useEffect(() => {
    if (refundsQuery.data?.items) {
      setRefunds(refundsQuery.data.items.map(r => ({
        id: r.id,
        bookingId: r.bookingId,
        amount: r.amount,
        currency: r.currency,
        reason: r.reason,
        status: r.status,
        createdAt: r.createdAt,
        requestedAt: r.createdAt,
        processedAt: r.completedDate,
        provider: 'N/A',
        userName: r.booking?.user ? `${r.booking.user.firstName} ${r.booking.user.lastName}` : 'Utilisateur',
      })))
    }
  }, [refundsQuery.data])
  const [showTransactionDetails, setShowTransactionDetails] = useState(false)
  const [showRefundDetails, setShowRefundDetails] = useState(false)
  const [showDisputeDetails, setShowDisputeDetails] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [activeTab, setActiveTab] = useState<'transactions' | 'refunds' | 'disputes' | 'commissions'>('transactions')
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: 'today',
  })

  // Dialog states
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showCommissionDialog, setShowCommissionDialog] = useState(false)
  const [showCalendarDialog, setShowCalendarDialog] = useState(false)
  const [showProcessPaymentsDialog, setShowProcessPaymentsDialog] = useState(false)
  const [showResolveDisputeDialog, setShowResolveDisputeDialog] = useState(false)
  const [showApproveTransactionDialog, setShowApproveTransactionDialog] = useState(false)
  const [showRejectTransactionDialog, setShowRejectTransactionDialog] = useState(false)
  const [showApproveRefundDialog, setShowApproveRefundDialog] = useState(false)
  const [showRejectRefundDialog, setShowRejectRefundDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Form states
  const [commissionForm, setCommissionForm] = useState({ service: '', rate: 0 })
  const [disputeResolution, setDisputeResolution] = useState('')
  const [transactionNote, setTransactionNote] = useState('')

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filters.type === 'all' || tx.type === filters.type
    const matchesStatus = filters.status === 'all' || tx.status === filters.status
    return matchesSearch && matchesType && matchesStatus
  })

  const totalPages = Math.ceil(filteredTransactions.length / pageSize)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Handlers
  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowTransactionDetails(true)
  }

  const handleViewRefund = (refund: Refund) => {
    setSelectedRefund(refund)
    setShowRefundDetails(true)
  }

  const handleViewDispute = (dispute: Dispute) => {
    setSelectedDispute(dispute)
    setShowDisputeDetails(true)
  }

  const handleExport = async () => {
    setIsExporting(true)
    toast.info('Export en cours...')
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const data = {
      transactions: transactions,
      refunds: refunds,
      disputes: disputes,
      commissions: commissions,
      stats: financialStats,
      exportedAt: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    setIsExporting(false)
    toast.success('Export terminé')
  }

  const handleGenerateReport = async () => {
    setIsProcessing(true)
    toast.info('Génération du rapport financier...')
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const report = {
      generatedAt: new Date().toISOString(),
      period: 'February 2024',
      summary: financialStats,
      transactions: transactions,
      refunds: refunds,
      disputes: disputes,
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `financial-report-full-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    setIsProcessing(false)
    setShowReportDialog(false)
    toast.success('Rapport financier généré avec succès')
  }

  const handleApproveTransaction = async () => {
    if (!selectedTransaction) return
    
    setIsProcessing(true)
    toast.info('Approbation en cours...')
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setTransactions(prev => prev.map(t => 
      t.id === selectedTransaction.id 
        ? { ...t, status: 'completed' }
        : t
    ))
    
    setIsProcessing(false)
    setShowApproveTransactionDialog(false)
    setShowTransactionDetails(false)
    toast.success(`Transaction ${selectedTransaction.id} approuvée`)
  }

  const handleRejectTransaction = async () => {
    if (!selectedTransaction) return
    
    setIsProcessing(true)
    toast.info('Rejet en cours...')
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setTransactions(prev => prev.map(t => 
      t.id === selectedTransaction.id 
        ? { ...t, status: 'disputed' }
        : t
    ))
    
    setIsProcessing(false)
    setShowRejectTransactionDialog(false)
    setShowTransactionDetails(false)
    toast.success(`Transaction ${selectedTransaction.id} rejetée`)
  }

  const handleApproveRefund = async () => {
    if (!selectedRefund) return
    
    setIsProcessing(true)
    toast.info('Approbation du remboursement...')
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setRefunds(prev => prev.map(r => 
      r.id === selectedRefund.id 
        ? { ...r, status: 'approved', processedAt: new Date().toISOString() }
        : r
    ))
    
    setIsProcessing(false)
    setShowApproveRefundDialog(false)
    setShowRefundDetails(false)
    toast.success(`Remboursement ${selectedRefund.id} approuvé`)
  }

  const handleRejectRefund = async () => {
    if (!selectedRefund) return
    
    setIsProcessing(true)
    toast.info('Rejet du remboursement...')
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setRefunds(prev => prev.filter(r => r.id !== selectedRefund.id))
    
    setIsProcessing(false)
    setShowRejectRefundDialog(false)
    setShowRefundDetails(false)
    toast.success(`Remboursement ${selectedRefund.id} rejeté`)
  }

  const handleResolveDispute = async () => {
    if (!selectedDispute || !disputeResolution) return
    
    setIsProcessing(true)
    toast.info('Résolution du litige...')
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setDisputes(prev => prev.filter(d => d.id !== selectedDispute.id))
    
    setIsProcessing(false)
    setShowResolveDisputeDialog(false)
    setShowDisputeDetails(false)
    setDisputeResolution('')
    toast.success(`Litige ${selectedDispute.id} résolu`)
  }

  const handleEditCommission = (commission: Commission) => {
    setSelectedCommission(commission)
    setCommissionForm({ service: commission.service, rate: commission.rate })
    setShowCommissionDialog(true)
  }

  const handleSaveCommission = async () => {
    if (!selectedCommission) return
    
    setCommissions(prev => prev.map(c => 
      c.service === selectedCommission.service 
        ? { ...c, rate: commissionForm.rate }
        : c
    ))
    
    setShowCommissionDialog(false)
    toast.success(`Commission ${selectedCommission.service} mise à jour à ${commissionForm.rate}%`)
  }

  const handleProcessPayments = async () => {
    setIsProcessing(true)
    toast.info('Traitement des paiements en cours...')
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setIsProcessing(false)
    setShowProcessPaymentsDialog(false)
    toast.success('Paiements traités avec succès')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contrôle financier & portefeuilles</h1>
          <p className="text-slate-500">Gestion des commissions, remboursements et surveillance des fraudes</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-200" onClick={handleExport} disabled={isExporting}>
            {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Exporter
          </Button>
          <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => setShowReportDialog(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Rapport financier
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{(financialStats.totalBalance / 1000).toFixed(0)}K FCFA</p>
                <p className="text-xs text-slate-500">Balance totale</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{(financialStats.monthlyRevenue / 1000).toFixed(0)}K FCFA</p>
                <p className="text-xs text-slate-500">Revenus mensuels</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{(financialStats.pendingSettlements / 1000).toFixed(0)}K FCFA</p>
                <p className="text-xs text-slate-500">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{financialStats.flaggedTransactions}</p>
                <p className="text-xs text-slate-500">Transactions signalées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600">Portefeuilles actifs</span>
              </div>
              <span className="font-semibold text-slate-900">{financialStats.activeWallets.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600">Commissions totales</span>
              </div>
              <span className="font-semibold text-slate-900">{(financialStats.totalCommissions / 1000).toFixed(1)}K FCFA</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600">Remboursements en attente</span>
              </div>
              <span className="font-semibold text-slate-900">{(financialStats.pendingRefunds / 1000).toFixed(1)}K FCFA</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600">Litiges ouverts</span>
              </div>
              <span className="font-semibold text-slate-900">{disputes.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'transactions'
              ? 'border-[#44DBD4] text-[#44DBD4]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'refunds'
              ? 'border-[#44DBD4] text-[#44DBD4]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('refunds')}
        >
          Remboursements
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'disputes'
              ? 'border-[#44DBD4] text-[#44DBD4]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('disputes')}
        >
          Litiges
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'commissions'
              ? 'border-[#44DBD4] text-[#44DBD4]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('commissions')}
        >
          Commissions
        </button>
      </div>

      {/* Search and Filters */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Rechercher une transaction..."
                className="pl-10 border-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
                <SelectTrigger className="w-[150px] border-slate-200">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="booking">Réservation</SelectItem>
                  <SelectItem value="refund">Remboursement</SelectItem>
                  <SelectItem value="payout">Paiement</SelectItem>
                  <SelectItem value="deposit">Dépôt</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                <SelectTrigger className="w-[150px] border-slate-200">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="completed">Complété</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="processing">En cours</SelectItem>
                  <SelectItem value="flagged">Signalé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      {activeTab === 'transactions' && (
        <Card className="border-slate-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">ID</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Type</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Description</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Utilisateur</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Montant</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Statut</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Date</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedTransactions.map((tx) => {
                    const typeInfo = transactionTypes[tx.type as keyof typeof transactionTypes]
                    const statusInfo = transactionStatus[tx.status as keyof typeof transactionStatus]
                    const StatusIcon = statusInfo.icon

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-mono text-sm text-slate-600">{tx.id}</td>
                        <td className="px-6 py-4">
                          <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-900 max-w-[200px] truncate">{tx.description}</td>
                        <td className="px-6 py-4 text-slate-600">{tx.userName}</td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.amount >= 0 ? '+' : ''}{tx.amount} FCFA
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`${statusInfo.color} flex items-center gap-1 w-fit`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm">
                          {new Date(tx.createdAt).toLocaleString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-5 w-5 text-slate-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white">
                              <DropdownMenuItem onClick={() => handleViewTransaction(tx)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir détails
                              </DropdownMenuItem>
                              {tx.status === 'flagged' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-green-600" onClick={() => {
                                    setSelectedTransaction(tx)
                                    setShowApproveTransactionDialog(true)
                                  }}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approuver
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600" onClick={() => {
                                    setSelectedTransaction(tx)
                                    setShowRejectTransactionDialog(true)
                                  }}>
                                    <Ban className="h-4 w-4 mr-2" />
                                    Rejeter
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            
            {filteredTransactions.length > pageSize && (
              <div className="border-t border-slate-200 p-4">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={filteredTransactions.length}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={[10, 25, 50, 100]}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Refunds Tab */}
      {activeTab === 'refunds' && (
        <Card className="border-slate-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">ID</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Client</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Montant</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Raison</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Prestataire</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Statut</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Date</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {refunds.map((refund) => (
                    <tr key={refund.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-sm text-slate-600">{refund.id}</td>
                      <td className="px-6 py-4 text-slate-900">{refund.userName}</td>
                      <td className="px-6 py-4 font-semibold text-red-600">-{refund.amount} FCFA</td>
                      <td className="px-6 py-4 text-slate-600">{refund.reason}</td>
                      <td className="px-6 py-4 text-slate-600">{refund.provider}</td>
                      <td className="px-6 py-4">
                        <Badge className={
                          refund.status === 'approved' ? 'bg-green-100 text-green-700' :
                          refund.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-orange-100 text-orange-700'
                        }>
                          {refund.status === 'approved' ? 'Approuvé' : 
                           refund.status === 'pending' ? 'En attente' : 'Litige'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {new Date(refund.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewRefund(refund)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disputes Tab */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <Card key={dispute.id} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      dispute.priority === 'high' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      <AlertTriangle className={`h-5 w-5 ${
                        dispute.priority === 'high' ? 'text-red-600' : 'text-yellow-600'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-slate-500">{dispute.id}</span>
                        <Badge className={
                          dispute.status === 'investigating' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }>
                          {dispute.status === 'investigating' ? 'En investigation' : 'Ouvert'}
                        </Badge>
                        <Badge className={
                          dispute.priority === 'high' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }>
                          {dispute.priority === 'high' ? 'Priorité haute' : 'Priorité moyenne'}
                        </Badge>
                      </div>
                      <p className="text-slate-900 font-medium">{dispute.userName}</p>
                      <p className="text-sm text-slate-500 mt-1">{dispute.notes}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>Montant: <strong className="text-slate-700">{dispute.amount} FCFA</strong></span>
                        <span>Assigné à: <strong className="text-slate-700">{dispute.assignedTo}</strong></span>
                        <span>Créé: {new Date(dispute.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewDispute(dispute)}>Voir détails</Button>
                    <Button size="sm" className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => {
                      setSelectedDispute(dispute)
                      setShowResolveDisputeDialog(true)
                    }}>
                      Résoudre
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Commissions Tab */}
      {activeTab === 'commissions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Taux de commission par service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {commissions.map((item) => (
                <div key={item.service} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{item.service}</p>
                    <p className="text-sm text-slate-500">Revenus: {item.revenue.toLocaleString()} FCFA</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#44DBD4]">{item.rate}%</p>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleEditCommission(item)}>Modifier</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Règlement & rapprochement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-700 mb-2">
                  <Clock className="h-5 w-5" />
                  <span className="font-semibold">Paiements en attente</span>
                </div>
                <p className="text-2xl font-bold text-yellow-800">{(financialStats.pendingSettlements / 1000).toFixed(0)}K FCFA</p>
                <p className="text-sm text-yellow-600 mt-1">12 prestataires en attente</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowCalendarDialog(true)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Voir calendrier
                </Button>
                <Button className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => setShowProcessPaymentsDialog(true)}>
                  Traiter les paiements
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transaction Details Sheet */}
      <Sheet open={showTransactionDetails} onOpenChange={setShowTransactionDetails}>
        <SheetContent className="w-full sm:max-w-lg bg-white overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Détails de la transaction</SheetTitle>
          </SheetHeader>
          
          {selectedTransaction && (
            <div className="py-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-lg text-slate-900">{selectedTransaction.id}</p>
                  <Badge className={transactionTypes[selectedTransaction.type as keyof typeof transactionTypes].color}>
                    {transactionTypes[selectedTransaction.type as keyof typeof transactionTypes].label}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${selectedTransaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedTransaction.amount >= 0 ? '+' : ''}{selectedTransaction.amount} FCFA
                  </p>
                  <Badge className={transactionStatus[selectedTransaction.status as keyof typeof transactionStatus].color}>
                    {transactionStatus[selectedTransaction.status as keyof typeof transactionStatus].label}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Description</p>
                  <p className="text-slate-900">{selectedTransaction.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Utilisateur</p>
                    <p className="text-slate-900">{selectedTransaction.userName}</p>
                    <p className="text-xs text-slate-400">{selectedTransaction.userId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Méthode de paiement</p>
                    <p className="text-slate-900 capitalize">{selectedTransaction.paymentMethod.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Date</p>
                    <p className="text-slate-900">{new Date(selectedTransaction.createdAt).toLocaleString('fr-FR')}</p>
                  </div>
                  {selectedTransaction.commission && (
                    <div>
                      <p className="text-sm text-slate-500">Commission</p>
                      <p className="text-slate-900">{selectedTransaction.commission} FCFA</p>
                    </div>
                  )}
                </div>
                {selectedTransaction.flagReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-red-700">Raison du signalement</p>
                    <p className="text-sm text-red-600">{selectedTransaction.flagReason}</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Actions */}
              {selectedTransaction.status === 'flagged' && (
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowRejectTransactionDialog(true)}>
                    <Ban className="h-4 w-4 mr-2" />
                    Rejeter
                  </Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowApproveTransactionDialog(true)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approuver
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Refund Details Sheet */}
      <Sheet open={showRefundDetails} onOpenChange={setShowRefundDetails}>
        <SheetContent className="w-full sm:max-w-lg bg-white overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Détails du remboursement</SheetTitle>
          </SheetHeader>
          
          {selectedRefund && (
            <div className="py-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-lg text-slate-900">{selectedRefund.id}</p>
                  <p className="text-sm text-slate-500">Booking: {selectedRefund.bookingId}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">-{selectedRefund.amount} FCFA</p>
                  <Badge className={
                    selectedRefund.status === 'approved' ? 'bg-green-100 text-green-700' :
                    selectedRefund.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-orange-100 text-orange-700'
                  }>
                    {selectedRefund.status === 'approved' ? 'Approuvé' : 
                     selectedRefund.status === 'pending' ? 'En attente' : 'Litige'}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Client</p>
                  <p className="text-slate-900">{selectedRefund.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Raison</p>
                  <p className="text-slate-900">{selectedRefund.reason}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Prestataire</p>
                  <p className="text-slate-900">{selectedRefund.provider}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Date de demande</p>
                  <p className="text-slate-900">{new Date(selectedRefund.createdAt).toLocaleString('fr-FR')}</p>
                </div>
                {selectedRefund.disputeReason && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-orange-700">Raison du litige</p>
                    <p className="text-sm text-orange-600">{selectedRefund.disputeReason}</p>
                  </div>
                )}
              </div>

              {selectedRefund.status === 'pending' && (
                <>
                  <Separator />
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setShowRejectRefundDialog(true)}>
                      <Ban className="h-4 w-4 mr-2" />
                      Rejeter
                    </Button>
                    <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowApproveRefundDialog(true)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approuver
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Dispute Details Sheet */}
      <Sheet open={showDisputeDetails} onOpenChange={setShowDisputeDetails}>
        <SheetContent className="w-full sm:max-w-lg bg-white overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Détails du litige</SheetTitle>
          </SheetHeader>
          
          {selectedDispute && (
            <div className="py-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-lg text-slate-900">{selectedDispute.id}</p>
                  <p className="text-sm text-slate-500">Transaction: {selectedDispute.transactionId}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">{selectedDispute.amount} FCFA</p>
                  <Badge className={
                    selectedDispute.priority === 'high' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }>
                    {selectedDispute.priority === 'high' ? 'Priorité haute' : 'Priorité moyenne'}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Utilisateur</p>
                  <p className="text-slate-900">{selectedDispute.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Notes</p>
                  <p className="text-slate-900">{selectedDispute.notes}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Assigné à</p>
                  <p className="text-slate-900">{selectedDispute.assignedTo}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Statut</p>
                  <Badge className={
                    selectedDispute.status === 'investigating' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }>
                    {selectedDispute.status === 'investigating' ? 'En investigation' : 'Ouvert'}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contacter
                </Button>
                <Button className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => setShowResolveDisputeDialog(true)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Résoudre
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Financial Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Générer un rapport financier</DialogTitle>
            <DialogDescription>Le rapport inclura toutes les transactions, remboursements et litiges</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Période: Février 2024</p>
                <p className="text-sm text-slate-600">Transactions: {transactions.length}</p>
                <p className="text-sm text-slate-600">Remboursements: {refunds.length}</p>
                <p className="text-sm text-slate-600">Litiges: {disputes.length}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>Annuler</Button>
            <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={handleGenerateReport} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Générer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Commission Edit Dialog */}
      <Dialog open={showCommissionDialog} onOpenChange={setShowCommissionDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Modifier la commission - {selectedCommission?.service}</DialogTitle>
            <DialogDescription>Ajustez le taux de commission pour ce service</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Taux de commission (%)</label>
                <Input type="number" value={commissionForm.rate} onChange={(e) => setCommissionForm({ ...commissionForm, rate: Number(e.target.value) })} step="0.1" min="0" max="100" />
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Revenus actuels: {selectedCommission?.revenue.toLocaleString()} FCFA</p>
                <p className="text-sm text-slate-600">Nouveaux revenus estimés: {Math.round((selectedCommission?.revenue || 0) * commissionForm.rate / (selectedCommission?.rate || 1)).toLocaleString()} FCFA</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCommissionDialog(false)}>Annuler</Button>
            <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={handleSaveCommission}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Calendar Dialog */}
      <Dialog open={showCalendarDialog} onOpenChange={setShowCalendarDialog}>
        <DialogContent className="bg-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Calendrier des règlements</DialogTitle>
            <DialogDescription>Prochains paiements aux prestataires</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3">
              {[
                { date: '25 Février 2024', provider: 'Air France', amount: 45000, status: 'scheduled' },
                { date: '28 Février 2024', provider: 'Guide Tokyo', amount: 12500, status: 'scheduled' },
                { date: '01 Mars 2024', provider: 'Event Organizer', amount: 8500, status: 'pending' },
                { date: '05 Mars 2024', provider: 'Hotel Dubai', amount: 32000, status: 'pending' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{item.provider}</p>
                    <p className="text-sm text-slate-500">{item.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{item.amount.toLocaleString()} FCFA</p>
                    <Badge className={item.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}>
                      {item.status === 'scheduled' ? 'Planifié' : 'En attente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCalendarDialog(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Payments Dialog */}
      <Dialog open={showProcessPaymentsDialog} onOpenChange={setShowProcessPaymentsDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Traiter les paiements</DialogTitle>
            <DialogDescription>12 prestataires en attente pour un total de {financialStats.pendingSettlements.toLocaleString()} FCFA</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">Cette action traitera tous les paiements en attente. Cette opération peut prendre quelques minutes.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProcessPaymentsDialog(false)}>Annuler</Button>
            <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={handleProcessPayments} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Traiter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dispute Dialog */}
      <Dialog open={showResolveDisputeDialog} onOpenChange={setShowResolveDisputeDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Résoudre le litige - {selectedDispute?.id}</DialogTitle>
            <DialogDescription>Indiquez la résolution du litige</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Résolution</label>
              <Select value={disputeResolution} onValueChange={setDisputeResolution}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="refund">Remboursement client</SelectItem>
                  <SelectItem value="partial">Remboursement partiel</SelectItem>
                  <SelectItem value="reject">Rejeter la demande</SelectItem>
                  <SelectItem value="investigate">Investigation supplémentaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Input value={transactionNote} onChange={(e) => setTransactionNote(e.target.value)} placeholder="Notes sur la résolution" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDisputeDialog(false)}>Annuler</Button>
            <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={handleResolveDispute} disabled={isProcessing || !disputeResolution}>
              {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Résoudre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Transaction Dialog */}
      <Dialog open={showApproveTransactionDialog} onOpenChange={setShowApproveTransactionDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Approuver la transaction</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir approuver la transaction {selectedTransaction?.id} ?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveTransactionDialog(false)}>Annuler</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleApproveTransaction} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Approuver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Transaction Dialog */}
      <Dialog open={showRejectTransactionDialog} onOpenChange={setShowRejectTransactionDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Rejeter la transaction</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir rejeter la transaction {selectedTransaction?.id} ?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Raison du rejet</label>
              <Input value={transactionNote} onChange={(e) => setTransactionNote(e.target.value)} placeholder="Indiquez la raison" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectTransactionDialog(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleRejectTransaction} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Refund Dialog */}
      <Dialog open={showApproveRefundDialog} onOpenChange={setShowApproveRefundDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Approuver le remboursement</DialogTitle>
            <DialogDescription>Approuver le remboursement de {selectedRefund?.amount} FCFA pour {selectedRefund?.userName} ?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveRefundDialog(false)}>Annuler</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleApproveRefund} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Approuver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Refund Dialog */}
      <Dialog open={showRejectRefundDialog} onOpenChange={setShowRejectRefundDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Rejeter le remboursement</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir rejeter le remboursement pour {selectedRefund?.userName} ?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectRefundDialog(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleRejectRefund} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
