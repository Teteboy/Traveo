import { useState } from 'react'
import { Heart, Share2, Bookmark, MessageCircle, MapPin, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import type { VideoItem as VideoContent } from '@/components/discover/VideoCardCarousel'
import { getYouTubeId, getYouTubeThumbnail } from '@/components/discover/VideoCardCarousel'

interface VideoPlayerProps {
  video: VideoContent
  onLike?: (videoId: string) => void
  onSave?: (videoId: string) => void
  onShare?: (videoId: string) => void
  onComment?: (videoId: string) => void
  isLiked?: boolean
  isSaved?: boolean
}

export function VideoPlayer({ video, onLike, onSave, onShare, onComment, isLiked = false, isSaved = false }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false)

  const ytId = getYouTubeId(video.videoUrl)
  const thumb = getYouTubeThumbnail(video.videoUrl, video.thumbnailUrl ?? video.thumbnail)
  const creatorName = video.creator?.name ?? video.destination ?? 'Traveo'
  const location = video.location ?? video.destination ?? video.country ?? ''

  const formatCount = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n)

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Video Section */}
          <div className="lg:col-span-2 relative bg-black aspect-video lg:aspect-auto lg:min-h-[320px]">
            {playing && ytId ? (
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={video.title}
              />
            ) : (
              <div className="relative w-full h-full cursor-pointer" onClick={() => ytId ? setPlaying(true) : video.videoUrl && window.open(video.videoUrl, '_blank')}>
                {thumb ? (
                  <img src={thumb} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center min-h-[200px]">
                    <ExternalLink className="h-16 w-16 text-slate-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 flex items-center justify-center">
                  <button className="h-16 w-16 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all hover:scale-110 shadow-xl">
                    {ytId
                      ? <svg className="w-8 h-8 text-[#44DBD4]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      : <ExternalLink className="h-8 w-8 text-[#44DBD4]" />}
                  </button>
                </div>
                {location && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 text-white text-xs bg-black/50 px-2 py-1 rounded-full">
                    <MapPin className="h-3 w-3" />{location}
                  </div>
                )}
                <div className="absolute bottom-3 right-3">
                  <span className="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded-full">
                    {formatCount(video.views)} vues
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="lg:col-span-1 p-6 flex flex-col">
            {/* Creator Info */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={video.creator?.avatar} />
                <AvatarFallback>{(video.creator?.name ?? 'T').charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{creatorName}</p>
                <p className="text-sm text-muted-foreground">{formatCount(video.views)} vues</p>
              </div>
              <Button variant="outline" size="sm">Suivre</Button>
            </div>

            {/* Category Badge */}
            {(video.category ?? video.country) && (
              <Badge className="w-fit mb-3 bg-[#44DBD4]/10 text-[#44DBD4] hover:bg-[#44DBD4]/20">
                {video.category ?? video.country}
              </Badge>
            )}

            {/* Title & Description */}
            <div className="mb-4 flex-1">
              <h3 className="font-bold text-lg mb-2">{video.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3">{video.description ?? ''}</p>
            </div>

            {/* Actions */}
            <div className="space-y-2 border-t pt-4">
              <Button
                variant={isLiked ? 'default' : 'outline'}
                className={`w-full justify-start ${isLiked ? 'bg-[#44DBD4] hover:bg-[#3bc9c2]' : ''}`}
                onClick={() => onLike?.(video.id)}
              >
                <Heart className={`mr-2 h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                J'aime ({formatCount(video.likes)})
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => onComment?.(video.id)}>
                <MessageCircle className="mr-2 h-5 w-5" />
                Commenter ({formatCount(video.comments ?? 0)})
              </Button>
              <div className="flex gap-2">
                <Button
                  variant={isSaved ? 'default' : 'outline'}
                  className={`flex-1 justify-start ${isSaved ? 'bg-[#44DBD4] hover:bg-[#3bc9c2]' : ''}`}
                  onClick={() => onSave?.(video.id)}
                >
                  <Bookmark className={`mr-2 h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                  Sauvegarder
                </Button>
                <Button variant="outline" size="icon" onClick={() => onShare?.(video.id)}>
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
