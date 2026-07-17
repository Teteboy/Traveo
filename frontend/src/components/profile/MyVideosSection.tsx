import { useState, useEffect } from 'react'
import { Video, Upload, Trash2, Play, Loader2, X, Plus, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { apiClient } from '@/lib/apiClient'
import { toast } from 'sonner'
import { getYouTubeId, getYouTubeThumbnail } from '@/components/discover/VideoCardCarousel'

interface VideoItem {
  id: string
  title: string
  videoUrl: string
  thumbnailUrl?: string
  destination?: string
  country?: string
  views: number
  likes: number
  isActive: boolean
  createdAt: string
}

const initialForm = {
  title: '',
  videoUrl: '',
  thumbnailUrl: '',
  destination: '',
  country: '',
}

export function MyVideosSection() {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewYt, setPreviewYt] = useState<string | null>(null)

  const loadVideos = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/videos/me')
      const items = (res as any).data?.data?.items || []
      setVideos(items)
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du chargement des vidéos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVideos()
  }, [])

  useEffect(() => {
    const ytId = getYouTubeId(form.videoUrl)
    setPreviewYt(ytId)
    if (ytId && !form.thumbnailUrl) {
      setForm(prev => ({ ...prev, thumbnailUrl: getYouTubeThumbnail(form.videoUrl) || '' }))
    }
  }, [form.videoUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.videoUrl.trim()) {
      toast.error('Le titre et le lien vidéo sont obligatoires')
      return
    }

    setIsSubmitting(true)
    try {
      await apiClient.post('/videos', {
        ...form,
        thumbnailUrl: form.thumbnailUrl || (previewYt ? getYouTubeThumbnail(form.videoUrl) : undefined),
      })
      toast.success('Vidéo publiée avec succès')
      setForm(initialForm)
      setShowUpload(false)
      await loadVideos()
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la publication')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette vidéo ?')) return
    try {
      await apiClient.delete(`/videos/${id}`)
      toast.success('Vidéo supprimée')
      await loadVideos()
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Mes vidéos</CardTitle>
            <CardDescription>Gérez vos vidéos partagées sur la plateforme</CardDescription>
          </div>
          <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => setShowUpload(true)}>
            <Video className="h-4 w-4 mr-2" />
            Ajouter une vidéo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#44DBD4]" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
            <div className="h-16 w-16 rounded-full bg-[#44DBD4]/10 flex items-center justify-center mx-auto mb-4">
              <Video className="h-8 w-8 text-[#44DBD4]" />
            </div>
            <h3 className="font-semibold mb-1">Aucune vidéo</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Partagez vos expériences de voyage avec la communauté Traveo.
            </p>
            <Button className="bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" onClick={() => setShowUpload(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une vidéo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => {
              const ytId = getYouTubeId(video.videoUrl)
              const thumb = video.thumbnailUrl || (ytId ? getYouTubeThumbnail(video.videoUrl) : '')
              return (
                <div key={video.id} className="group relative rounded-lg overflow-hidden border bg-card">
                  <div className="aspect-video relative">
                    {thumb ? (
                      <img src={thumb} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <Video className="h-12 w-12 text-slate-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        className="h-12 w-12 rounded-full bg-white/90 text-[#44DBD4] hover:bg-white"
                        onClick={() => window.open(video.videoUrl, '_blank')}
                      >
                        <Play className="h-6 w-6" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-10 w-10 rounded-full"
                        onClick={() => handleDelete(video.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">Publié</Badge>
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium truncate">{video.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span>{video.views.toLocaleString()} vues</span>
                      {video.destination && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {video.destination}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter une vidéo</DialogTitle>
            <DialogDescription>
              Partagez une vidéo de voyage (YouTube ou lien direct). Elle apparaîtra sur la page Découvrir.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                placeholder="ex: Safari au Parc de Waza"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Lien de la vidéo *</Label>
              <Input
                id="videoUrl"
                placeholder="https://youtube.com/watch?v=..."
                value={form.videoUrl}
                onChange={(e) => setForm(prev => ({ ...prev, videoUrl: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Lien de la miniature (optionnel)</Label>
              <Input
                id="thumbnailUrl"
                placeholder="https://..."
                value={form.thumbnailUrl}
                onChange={(e) => setForm(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  placeholder="ex: Kribi"
                  value={form.destination}
                  onChange={(e) => setForm(prev => ({ ...prev, destination: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  placeholder="ex: Cameroun"
                  value={form.country}
                  onChange={(e) => setForm(prev => ({ ...prev, country: e.target.value }))}
                />
              </div>
            </div>

            {previewYt && (
              <div className="rounded-lg overflow-hidden border aspect-video bg-slate-100">
                <img
                  src={getYouTubeThumbnail(form.videoUrl) || ''}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowUpload(false)}>
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button type="submit" className="flex-1 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Publier
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
