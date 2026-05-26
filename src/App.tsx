import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { HeroSection } from './components/home/HeroSection'
import { PopularDestinations } from './components/home/PopularDestinations'
import { FeaturedEvents } from './components/home/FeaturedEvents'
import { QuickActions } from './components/home/QuickActions'
import { useBootstrapAuth } from './hooks/useAuth'

function App() {
  useBootstrapAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <QuickActions />
        <PopularDestinations />
        <FeaturedEvents />
      </main>
      <Footer />
    </div>
  )
}

export default App
