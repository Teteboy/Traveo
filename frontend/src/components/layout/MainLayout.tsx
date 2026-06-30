import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { BottomNavigation } from './BottomNavigation'
import { ChatBot } from '@/components/support/ChatBot'
import { useBootstrapAuth } from '@/hooks/useAuth'

export function MainLayout() {
  useBootstrapAuth()
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNavigation />
      <ChatBot />
    </div>
  )
}
