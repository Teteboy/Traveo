import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Search, Bell, User, Menu, Wallet, HelpCircle, X, Plane, Hotel, Calendar, MapPin, Utensils, Car, FileText, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'

export function Navbar() {
  const user = useAuthStore((state) => state.user)
  const unreadCount = useNotificationStore((state) => state.getUnreadCount())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const navItems = [
    { to: '/discover', label: 'Découvrir', icon: Compass },
    { to: '/flights', label: 'Vols', icon: Plane },
    { to: '/hotels', label: 'Hôtels', icon: Hotel },
    { to: '/events', label: 'Événements', icon: Calendar },
    { to: '/guides', label: 'Guides', icon: MapPin },
    { to: '/restaurants', label: 'Restaurants', icon: Utensils },
    { to: '/transfers', label: 'Transferts', icon: Car },
    { to: '/visa', label: 'e-Visa', icon: FileText },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/assets/images/logo.png" alt="Traveo" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            Traveo
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  isActive 
                    ? 'text-[#44DBD4] bg-[#44DBD4]/10' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#44DBD4] hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden lg:flex text-slate-600 dark:text-slate-300 hover:text-[#44DBD4] hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            asChild 
            className="hidden lg:flex text-slate-600 dark:text-slate-300 hover:text-[#44DBD4] hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Link to="/support">
              <HelpCircle className="h-5 w-5" />
            </Link>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            asChild
            className="text-slate-600 dark:text-slate-300 hover:text-[#44DBD4] hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Link to="/wallet">
              <Wallet className="h-5 w-5" />
            </Link>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-slate-600 dark:text-slate-300 hover:text-[#44DBD4] hover:bg-slate-100 dark:hover:bg-slate-800" 
            asChild
          >
            <Link to="/notifications">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-[#44DBD4] text-white border-0">
                  {unreadCount}
                </Badge>
              )}
            </Link>
          </Button>
          
          {user ? (
            <Link to="/profile" className="hidden lg:block">
              <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-[#44DBD4] transition-all">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-[#44DBD4]/10 text-[#44DBD4]">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <Button variant="ghost" asChild className="text-slate-600 dark:text-slate-300 hover:text-[#44DBD4]">
                <Link to="/login">Connexion</Link>
              </Button>
              <Button asChild className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white">
                <Link to="/register">S'inscrire</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden text-slate-600 dark:text-slate-300"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <img src="/assets/images/logo.png" alt="Traveo" className="h-12 w-12 object-contain" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Trip<span className="text-[#44DBD4]">Planner</span></p>
                      <p className="text-xs text-slate-500">Votre assistant de voyage</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Search */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="Rechercher..." 
                      className="pl-10 bg-slate-50 dark:bg-slate-800"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 overflow-y-auto p-2">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          isActive 
                            ? 'text-[#44DBD4] bg-[#44DBD4]/10' 
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </NavLink>
                  ))}
                </nav>

                {/* Mobile Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  {user ? (
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className="bg-[#44DBD4]/10 text-[#44DBD4]">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{`${user.firstName} ${user.lastName}`}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </Link>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        asChild
                        variant="outline"
                        className="w-full border-[#44DBD4] text-[#44DBD4] hover:bg-[#44DBD4]/10"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link to="/login">Connexion</Link>
                      </Button>
                      <Button
                        asChild
                        className="w-full bg-[#44DBD4] hover:bg-[#3bc9c2] text-white"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link to="/register">S'inscrire</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 shadow-lg">
          <div className="container mx-auto max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  placeholder="Rechercher des vols, hôtels, événements..." 
                  className="pl-10 h-12 text-lg"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
