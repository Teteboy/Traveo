import { useMemo, useState } from 'react'
import {
  Search,
  Filter,
  MoreHorizontal,
  UserPlus,
  Download,
  Upload,
  UserCheck,
  Mail,
  Ban,
  Trash2,
  Eye,
  Users,
  Building2,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { useAdminUsers, useDeleteAdminUser } from '@/hooks/useAdmin'

type ManagementUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  status: 'active' | 'pending' | 'suspended'
  createdAt: string
  lastLogin: string | null
  bookings: number
  totalSpent: number
  country: string
  avatar: string | null
  phone: string | null
  kycStatus: 'verified' | 'pending' | 'rejected'
  walletBalance: number
}

const roleLabels: Record<string, { label: string; color: string }> = {
  user: { label: 'Utilisateur', color: 'bg-blue-100 text-blue-700' },
  provider: { label: 'Prestataire', color: 'bg-purple-100 text-purple-700' },
  admin: { label: 'Admin', color: 'bg-red-100 text-red-700' },
}

const statusLabels: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  active: { label: 'Actif', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  suspended: { label: 'Suspendu', color: 'bg-red-100 text-red-700', icon: Ban },
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
}

const kycLabels: Record<string, { label: string; color: string }> = {
  verified: { label: 'Vérifié', color: 'bg-green-100 text-green-700' },
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-700' },
}

export function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<ManagementUser | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState({ role: 'all', status: 'all', kycStatus: 'all' })

  const usersQuery = useAdminUsers({
    page: currentPage,
    limit: pageSize,
    role: filters.role,
    search: searchQuery,
  })
  const deleteUserMutation = useDeleteAdminUser()

  const mappedUsers = useMemo<ManagementUser[]>(() => {
    return (usersQuery.data?.items ?? []).map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      status: 'active',
      createdAt: u.createdAt,
      lastLogin: null,
      bookings: 0,
      totalSpent: 0,
      country: u.country,
      avatar: null,
      phone: u.phone,
      kycStatus: 'verified',
      walletBalance: 0,
    }))
  }, [usersQuery.data?.items])

  const filteredUsers = mappedUsers.filter((user) => {
    const matchesStatus = filters.status === 'all' || user.status === filters.status
    const matchesKyc = filters.kycStatus === 'all' || user.kycStatus === filters.kycStatus
    return matchesStatus && matchesKyc
  })

  const stats = {
    total: usersQuery.data?.total ?? 0,
    active: filteredUsers.filter((u) => u.status === 'active').length,
    suspended: filteredUsers.filter((u) => u.status === 'suspended').length,
    pending: filteredUsers.filter((u) => u.status === 'pending').length,
    providers: filteredUsers.filter((u) => u.role === 'provider').length,
  }

  const handleViewUser = (user: ManagementUser) => {
    setSelectedUser(user)
    setShowUserDetails(true)
  }

  const handleDeleteUser = async (id: string) => {
    await deleteUserMutation.mutateAsync(id)
    if (selectedUser?.id === id) {
      setShowUserDetails(false)
      setSelectedUser(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil((usersQuery.data?.total ?? 0) / pageSize))

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des utilisateurs</h1>
          <p className="text-slate-500">Gérez les utilisateurs, prestataires et partenaires de la plateforme</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-200" disabled>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" className="border-slate-200" disabled>
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
          <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" disabled>
            <UserPlus className="h-4 w-4 mr-2" />
            Nouvel utilisateur
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-slate-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center"><Users className="h-5 w-5 text-slate-600" /></div><div><p className="text-2xl font-bold text-slate-900">{stats.total}</p><p className="text-xs text-slate-500">Total</p></div></div></CardContent></Card>
        <Card className="border-slate-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center"><UserCheck className="h-5 w-5 text-green-600" /></div><div><p className="text-2xl font-bold text-slate-900">{stats.active}</p><p className="text-xs text-slate-500">Actifs</p></div></div></CardContent></Card>
        <Card className="border-slate-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center"><Ban className="h-5 w-5 text-red-600" /></div><div><p className="text-2xl font-bold text-slate-900">{stats.suspended}</p><p className="text-xs text-slate-500">Suspendus</p></div></div></CardContent></Card>
        <Card className="border-slate-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center"><Clock className="h-5 w-5 text-yellow-600" /></div><div><p className="text-2xl font-bold text-slate-900">{stats.pending}</p><p className="text-xs text-slate-500">En attente</p></div></div></CardContent></Card>
        <Card className="border-slate-200"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center"><Building2 className="h-5 w-5 text-purple-600" /></div><div><p className="text-2xl font-bold text-slate-900">{stats.providers}</p><p className="text-xs text-slate-500">Prestataires</p></div></div></CardContent></Card>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input placeholder="Rechercher par nom, email..." className="pl-10 border-slate-200" value={searchQuery} onChange={(e) => { setCurrentPage(1); setSearchQuery(e.target.value) }} />
            </div>
            <div className="flex gap-3">
              <Select value={filters.role} onValueChange={(v) => { setCurrentPage(1); setFilters({ ...filters, role: v }) }}>
                <SelectTrigger className="w-[150px] border-slate-200"><SelectValue placeholder="Rôle" /></SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="user">Utilisateurs</SelectItem>
                  <SelectItem value="provider">Prestataires</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                <SelectTrigger className="w-[150px] border-slate-200"><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="suspended">Suspendu</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="border-slate-200" onClick={() => setFilterOpen(true)}><Filter className="h-4 w-4 mr-2" />Plus de filtres</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Rôle</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">KYC</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Pays</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Inscription</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {usersQuery.isLoading && <tr><td className="px-6 py-6 text-slate-500" colSpan={7}>Chargement...</td></tr>}
                {usersQuery.isError && <tr><td className="px-6 py-6 text-red-600" colSpan={7}>Erreur de chargement</td></tr>}
                {!usersQuery.isLoading && !usersQuery.isError && filteredUsers.length === 0 && <tr><td className="px-6 py-6 text-slate-500" colSpan={7}>Aucun utilisateur</td></tr>}
                {filteredUsers.map((user) => {
                  const roleInfo = roleLabels[user.role] ?? { label: user.role, color: 'bg-slate-100 text-slate-700' }
                  const statusInfo = statusLabels[user.status]
                  const kycInfo = kycLabels[user.kycStatus]
                  const StatusIcon = statusInfo.icon
                  return (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4"><div className="flex items-center gap-3"><Avatar className="h-10 w-10"><AvatarImage src={user.avatar || undefined} /><AvatarFallback className="bg-[#44DBD4]/20 text-[#44DBD4]">{user.firstName[0]}{user.lastName[0]}</AvatarFallback></Avatar><div><p className="font-medium text-slate-900">{user.firstName} {user.lastName}</p><p className="text-sm text-slate-500">{user.email}</p></div></div></td>
                      <td className="px-6 py-4"><Badge className={roleInfo.color}>{roleInfo.label}</Badge></td>
                      <td className="px-6 py-4"><Badge className={`${statusInfo.color} flex items-center gap-1 w-fit`}><StatusIcon className="h-3 w-3" />{statusInfo.label}</Badge></td>
                      <td className="px-6 py-4"><Badge className={kycInfo.color}>{kycInfo.label}</Badge></td>
                      <td className="px-6 py-4 text-slate-600">{user.country}</td>
                      <td className="px-6 py-4 text-slate-600 text-sm">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td className="px-6 py-4 text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-5 w-5 text-slate-400" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="bg-white"><DropdownMenuItem onClick={() => handleViewUser(user)}><Eye className="h-4 w-4 mr-2" />Voir détails</DropdownMenuItem><DropdownMenuItem><Mail className="h-4 w-4 mr-2" />Envoyer un email</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.id)}><Trash2 className="h-4 w-4 mr-2" />Supprimer</DropdownMenuItem></DropdownMenuContent></DropdownMenu></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 p-4">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={usersQuery.data?.total ?? 0}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => { setCurrentPage(1); setPageSize(size) }}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </div>
        </CardContent>
      </Card>

      <Sheet open={showUserDetails} onOpenChange={setShowUserDetails}>
        <SheetContent className="w-full sm:max-w-lg bg-white overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Détails de l'utilisateur</SheetTitle>
          </SheetHeader>
          {selectedUser && (
            <div className="py-6 space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16"><AvatarImage src={selectedUser.avatar || undefined} /><AvatarFallback className="bg-[#44DBD4]/20 text-[#44DBD4] text-xl">{selectedUser.firstName[0]}{selectedUser.lastName[0]}</AvatarFallback></Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <p className="text-slate-500">{selectedUser.email}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Téléphone</span><span className="text-slate-900">{selectedUser.phone || '-'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Pays</span><span className="text-slate-900">{selectedUser.country}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Date d'inscription</span><span className="text-slate-900">{new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}</span></div>
              </div>
              <Separator />
              <Button variant="destructive" className="w-full" onClick={() => handleDeleteUser(selectedUser.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer cet utilisateur
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent className="w-full sm:max-w-md bg-white">
          <SheetHeader>
            <SheetTitle>Filtres avancés</SheetTitle>
            <SheetDescription>Affinez votre recherche d'utilisateurs</SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Statut KYC</label>
              <Select value={filters.kycStatus} onValueChange={(v) => setFilters({ ...filters, kycStatus: v })}>
                <SelectTrigger className="border-slate-200"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="verified">Vérifié</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setFilters({ role: 'all', status: 'all', kycStatus: 'all' })}>Réinitialiser</Button>
            <Button className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => setFilterOpen(false)}>Appliquer</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
