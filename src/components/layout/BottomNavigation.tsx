import { NavLink } from 'react-router-dom'
import { Home, Compass, Plane, User, Wallet } from 'lucide-react'

const navItems = [
  { path: '/', icon: Home, label: 'Accueil' },
  { path: '/discover', icon: Compass, label: 'Découvrir' },
  { path: '/my-trips', icon: Plane, label: 'Voyages' },
  { path: '/wallet', icon: Wallet, label: 'Wallet' },
  { path: '/profile', icon: User, label: 'Profil' },
]

export function BottomNavigation() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-40">
      <div className="grid grid-cols-5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
