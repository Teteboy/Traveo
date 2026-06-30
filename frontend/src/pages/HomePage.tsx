import { HeroSection } from '@/components/home/HeroSection'
import { PopularDestinations } from '@/components/home/PopularDestinations'
import { FeaturedEvents } from '@/components/home/FeaturedEvents'
import { QuickActions } from '@/components/home/QuickActions'
import { PersonalizedRecommendations } from '@/components/home/PersonalizedRecommendations'
import { PromotionsSection } from '@/components/home/PromotionsSection'
import { ChatBot } from '@/components/support/ChatBot'

export function HomePage() {
  return (
    <>
      <HeroSection />
      <QuickActions />
      <PersonalizedRecommendations />
      <PromotionsSection />
      <PopularDestinations />
      <FeaturedEvents />
      <ChatBot />
    </>
  )
}
