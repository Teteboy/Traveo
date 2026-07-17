import { MyVideosSection } from '@/components/profile/MyVideosSection'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Video } from 'lucide-react'

export function ProviderVideosPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Video className="h-6 w-6 text-[#44DBD4]" />
          Mes vidéos
        </h1>
        <p className="text-muted-foreground">Gérez et publiez des vidéos pour promouvoir vos services sur Traveo.</p>
      </div>
      <MyVideosSection />
    </div>
  )
}
