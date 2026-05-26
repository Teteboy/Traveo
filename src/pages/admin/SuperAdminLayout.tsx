import { useState } from 'react'
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import {
  Plane,
  FileCheck,
  Wallet,
  Ticket,
  BarChart3,
  Megaphone,
  Shield,
  Users,
  MessageSquare,
  Menu,
  X,
  Home,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAdminAuthStore } from '@/stores/adminAuthStore'

const navigationItems = [
  {
    id: 'home',
    label: 'Accueil',
    icon: Home,
    path: '/admin',
    description: 'Tableau de bord principal',
  },
  {
    id: 'flights',
    label: 'Gestion des vols',
    icon: Plane,
    path: '/admin/flights',
    description: 'Configuration compagnies, routes, prix',
  },
  {
    id: 'visa',
    label: 'Visa & Relations gouvernementales',
    icon: FileCheck,
    path: '/admin/visa',
    description: 'Règles visa, partenaires gouvernementaux',
  },
  {
    id: 'financial',
    label: 'Contrôle financier & portefeuilles',
    icon: Wallet,
    path: '/admin/financial',
    description: 'Commissions, remboursements, fraudes',
  },
  {
    id: 'events',
    label: 'Gouvernance événements',
    icon: Ticket,
    path: '/admin/events',
    description: 'Approbation, vérification organisateurs',
  },
  {
    id: 'analytics',
    label: 'Analytique & Intelligence',
    icon: BarChart3,
    path: '/admin/analytics',
    description: 'Tableaux de bord, analyses',
  },
  {
    id: 'growth',
    label: 'Croissance & Monétisation',
    icon: Megaphone,
    path: '/admin/growth',
    description: 'Contenus sponsorisés, partenariats',
  },
  {
    id: 'risks',
    label: 'Risques & Modération',
    icon: Shield,
    path: '/admin/risks',
    description: 'Signalements, modération, légal',
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageSquare,
    path: '/admin/messages',
    description: 'Conversations avec utilisateurs et prestataires',
  },
  {
    id: 'users',
    label: 'Gestion des utilisateurs',
    icon: Users,
    path: '/admin/users',
    description: 'Utilisateurs, prestataires, rôles',
  },
  {
    id: 'providers',
    label: 'Gestion des prestataires',
    icon: Users,
    path: '/admin/providers',
    description: 'Demandes de compte prestataire, vérification',
  },
]

export function SuperAdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { admin, isAdminAuthenticated, adminLogout } = useAdminAuthStore()

  const currentPath = location.pathname

  // Redirect to login if not authenticated
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  const handleLogout = () => {
    adminLogout()
    navigate('/admin/login')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <div className="flex items-center gap-2">
            <img 
              src="/assets/images/logo.png" 
              alt="Traveo" 
              className="h-8 w-8 object-contain"
            />
            <span className="font-bold text-lg text-[#44DBD4]">Traveo</span>
            <Badge className="bg-[#44DBD4] text-white text-xs ml-1">Admin</Badge>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[#44DBD4] text-white text-xs">
              {admin?.name ? getInitials(admin.name) : 'AD'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full bg-white border-r border-slate-200 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img 
              src="/assets/images/logo.png" 
              alt="Traveo" 
              className="h-10 w-10 object-contain"
            />
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg text-[#44DBD4]">Traveo</h1>
                <p className="text-xs text-slate-500">Super Admin</p>
              </div>
            )}
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {navigationItems.map((item) => {
            const isActive = currentPath === item.path || (item.path !== '/admin' && currentPath.startsWith(item.path + '/'))
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path)
                  setMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#44DBD4]/10 text-[#44DBD4] border-l-4 border-[#44DBD4]'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-[#44DBD4]' : ''}`} />
                {sidebarOpen && (
                  <div className="text-left">
                    <span className="block text-sm font-medium">{item.label}</span>
                    {isActive && (
                      <span className="block text-xs text-slate-500 truncate">{item.description}</span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-200 bg-white">
          <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={admin?.avatar} />
              <AvatarFallback className="bg-[#44DBD4] text-white text-sm">
                {admin?.name ? getInitials(admin.name) : 'AD'}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{admin?.name || 'Admin'}</p>
                  <p className="text-xs text-slate-500 truncate">{admin?.email || 'admin@tripplanner.com'}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="flex-shrink-0"
                  onClick={handleLogout}
                  title="Déconnexion"
                >
                  <LogOut className="h-4 w-4 text-slate-500" />
                </Button>
              </>
            )}
            {!sidebarOpen && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                title="Déconnexion"
              >
                <LogOut className="h-4 w-4 text-slate-500" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} pt-16 lg:pt-0`}>
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-slate-600"
            >
              <Home className="h-4 w-4 mr-2" />
              Retour au site
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-slate-600" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                3
              </Badge>
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5 text-slate-600" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
