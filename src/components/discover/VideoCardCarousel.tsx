import { useState, useRef, useEffect } from 'react'
import { Heart, Share2, Bookmark, MessageCircle, Play, MapPin, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export interface VideoItem {
  id: string
  title: string
  videoUrl: string
  thumbnailUrl?: string
  thumbnail?: string
  destination?: string
  country?: string
  category?: string
  location?: string
  description?: string
  likes: number
  views: number
  comments?: number
  creator?: { name: string; avatar?: string }
}

/** Extract YouTube video ID from any YouTube URL */
export function getYouTubeId(url: string): string | null {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match?.[1] ?? null
}

export function getYouTubeThumbnail(videoUrl: string, thumbnailUrl?: string): string {
  if (thumbnailUrl) return thumbnailUrl
  const id = getYouTubeId(videoUrl)
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : ''
}

interface VideoCardCarouselProps {
  videos: VideoItem[]
  onLike?: (videoId: string) => void
  onSave?: (videoId: string) => void
  onShare?: (videoId: string) => void
  onComment?: (videoId: string) => void
  likedVideos?: Set<string>
  savedVideos?: Set<string>
}

export function VideoCardCarousel({
  videos,
  onLike,
  onSave,
  onShare,
  onComment,
  likedVideos = new Set(),
  savedVideos = new Set()
}: VideoCardCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScrollButtons()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollButtons)
      return () => container.removeEventListener('scroll', checkScrollButtons)
    }
  }, [videos])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -340 : 340, behavior: 'smooth' })
    }
  }

  const formatCount = (count: number): string => {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`
    return count.toString()
  }

  if (!videos.length) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm rounded-xl bg-slate-100">
        Aucune vidéo disponible
      </div>
    )
  }

  return (
    <div className="relative group">
      {canScrollLeft && (
        <button onClick={() => scroll('left')} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white" aria-label="Scroll left">
          <ChevronLeft className="h-6 w-6 text-foreground" />
        </button>
      )}
      {canScrollRight && (
        <button onClick={() => scroll('right')} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white" aria-label="Scroll right">
          <ChevronRight className="h-6 w-6 text-foreground" />
        </button>
      )}

      <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto scrollbar-hidden pb-4 scroll-smooth" style={{ scrollSnapType: 'x mandatory' }}>
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} onLike={onLike} onSave={onSave} onShare={onShare} onComment={onComment} isLiked={likedVideos.has(video.id)} isSaved={savedVideos.has(video.id)} formatCount={formatCount} />
        ))}
      </div>

      <div className="flex justify-center gap-1 mt-2">
        {videos.slice(0, Math.min(videos.length, 8)).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
        ))}
      </div>
    </div>
  )
}

interface VideoCardProps {
  video: VideoItem
  onLike?: (id: string) => void
  onSave?: (id: string) => void
  onShare?: (id: string) => void
  onComment?: (id: string) => void
  isLiked?: boolean
  isSaved?: boolean
  formatCount: (n: number) => string
}

function VideoCard({ video, onLike, onSave, onShare, onComment, isLiked = false, isSaved = false, formatCount }: VideoCardProps) {
  const ytId = getYouTubeId(video.videoUrl)
  const isCloudinaryVideo = video.videoUrl.includes('cloudinary.com') && video.videoUrl.includes('/video/upload/')
  const thumb = getYouTubeThumbnail(video.videoUrl, video.thumbnailUrl ?? video.thumbnail)
  const creatorName = video.creator?.name ?? video.destination ?? 'Traveo'
  const category = video.category ?? video.country ?? 'Voyage'
  const location = video.location ?? video.destination ?? video.country ?? ''
  const comments = video.comments ?? 0
  const [showEmbed, setShowEmbed] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const openVideo = () => {
    if (ytId) setShowEmbed(true)
    else if (isCloudinaryVideo) setIsPlaying(true)
    else if (video.videoUrl) window.open(video.videoUrl, '_blank')
  }

  return (
    <div className="flex-shrink-0 w-[320px] bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border/50" style={{ scrollSnapAlign: 'start' }}>
      {/* Video / Thumbnail Section */}
      <div className="relative bg-black aspect-[9/12] cursor-pointer" onClick={!showEmbed && !isPlaying ? openVideo : undefined}>
        {showEmbed && ytId ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
          />
        ) : isPlaying && isCloudinaryVideo ? (
          <video
            src={video.videoUrl}
            className="w-full h-full object-cover"
            controls
            autoPlay
            onLoadedData={() => setIsPlaying(true)}
            onError={() => {
              setIsPlaying(false)
              window.open(video.videoUrl, '_blank')
            }}
          />
        ) : (
          <>
            {thumb ? (
              <img src={thumb} alt={video.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                <Play className="h-16 w-16 text-slate-600" />
              </div>
            )}
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40">
              <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between">
                <Badge className="bg-[#44DBD4]/90 backdrop-blur-sm text-xs text-white">{category}</Badge>
                {location && (
                  <div className="flex items-center gap-1 text-white text-xs">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-[100px]">{location}</span>
                  </div>
                )}
              </div>
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="h-14 w-14 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-transform hover:scale-105 shadow-lg" onClick={openVideo}>
                  {isCloudinaryVideo ? <Play className="h-7 w-7 text-[#44DBD4]" fill="currentColor" style={{ marginLeft: 3 }} /> : ytId ? <Play className="h-7 w-7 text-[#44DBD4]" fill="currentColor" style={{ marginLeft: 3 }} /> : <ExternalLink className="h-7 w-7 text-[#44DBD4]" />}
                </button>
              </div>
              <div className="absolute bottom-3 right-3">
                <span className="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded-full">
                  {formatCount(video.views)} vues
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={video.creator?.avatar} />
            <AvatarFallback>{creatorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <p className="font-medium text-sm truncate flex-1">{creatorName}</p>
          <Button size="sm" className="h-7 text-xs px-2 bg-[#44DBD4] hover:bg-[#3bc9c2] text-white">Suivre</Button>
        </div>
        <h3 className="font-semibold text-sm mb-2 line-clamp-2 leading-tight">{video.title}</h3>
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <button className={`flex items-center gap-1 text-xs transition-colors ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => onLike?.(video.id)}>
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{formatCount(video.likes)}</span>
          </button>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors" onClick={() => onComment?.(video.id)}>
            <MessageCircle className="h-4 w-4" />
            <span>{formatCount(comments)}</span>
          </button>
          <button className={`flex items-center gap-1 text-xs transition-colors ${isSaved ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => onSave?.(video.id)}>
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors" onClick={() => onShare?.(video.id)}>
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
