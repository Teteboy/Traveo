import { useState, useEffect, useRef } from 'react'
import { Heart, Share2, Bookmark, MessageCircle, Play, VolumeX, Volume2, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { VideoItem } from './VideoCardCarousel'
import { getYouTubeId, getYouTubeThumbnail } from './VideoCardCarousel'

interface VideoSwiperProps {
  videos: VideoItem[]
  onVideoEnd?: (videoId: string) => void
  onLike?: (videoId: string) => void
  onSave?: (videoId: string) => void
}

export function VideoSwiper({ videos, onLike, onSave }: VideoSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [muted, setMuted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const minSwipeDistance = 50

  const currentVideo = videos[currentIndex]

  const ytId = currentVideo ? getYouTubeId(currentVideo.videoUrl) : null

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') handlePrevious()
      else if (e.key === 'ArrowDown') handleNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex])

  const handleNext = () => { if (currentIndex < videos.length - 1) setCurrentIndex(i => i + 1) }
  const handlePrevious = () => { if (currentIndex > 0) setCurrentIndex(i => i - 1) }

  const handleTouchStart = (e: React.TouchEvent) => { setTouchEnd(0); setTouchStart(e.targetTouches[0].clientY) }
  const handleTouchMove = (e: React.TouchEvent) => { setTouchEnd(e.targetTouches[0].clientY) }
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > minSwipeDistance) handleNext()
    else if (distance < -minSwipeDistance) handlePrevious()
  }
  const handleWheel = (e: React.WheelEvent) => { if (e.deltaY > 0) handleNext(); else handlePrevious() }

  const handleLike = () => {
    const s = new Set(liked)
    s.has(currentVideo.id) ? s.delete(currentVideo.id) : s.add(currentVideo.id)
    setLiked(s)
    onLike?.(currentVideo.id)
  }
  const handleSave = () => {
    const s = new Set(saved)
    s.has(currentVideo.id) ? s.delete(currentVideo.id) : s.add(currentVideo.id)
    setSaved(s)
    onSave?.(currentVideo.id)
  }

  const formatCount = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n)

  if (!currentVideo) return null

  const thumb = getYouTubeThumbnail(currentVideo.videoUrl, currentVideo.thumbnailUrl ?? currentVideo.thumbnail)

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* YouTube iframe or thumbnail */}
      <div className="absolute inset-0">
        {ytId ? (
          <iframe
            key={`${currentVideo.id}-${currentIndex}`}
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${ytId}&controls=0&rel=0&modestbranding=1&playsinline=1`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={currentVideo.title}
          />
        ) : (
          <div className="w-full h-full relative">
            {thumb && <img src={thumb} alt={currentVideo.title} className="w-full h-full object-cover" />}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Play className="h-20 w-20 text-white/80" fill="currentColor" />
            </div>
          </div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

      {/* Top Info */}
      <div className="absolute top-0 left-0 right-0 p-4 text-white z-10 pointer-events-none">
        <div className="flex items-center justify-between">
          <Badge className="bg-[#44DBD4]/80 backdrop-blur-sm text-white pointer-events-auto">
            {currentVideo.category ?? currentVideo.country ?? 'Voyage'}
          </Badge>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            <span>{currentVideo.destination ?? currentVideo.location ?? ''}</span>
          </div>
        </div>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-20 p-6 text-white z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full border-2 border-white bg-[#44DBD4] flex items-center justify-center text-white font-bold text-lg overflow-hidden">
            {currentVideo.creator?.avatar
              ? <img src={currentVideo.creator.avatar} alt="" className="w-full h-full object-cover" />
              : (currentVideo.creator?.name ?? currentVideo.destination ?? 'T').charAt(0)}
          </div>
          <div>
            <p className="font-semibold">{currentVideo.creator?.name ?? currentVideo.destination ?? 'Traveo'}</p>
            <p className="text-sm text-white/80">{formatCount(currentVideo.views)} vues</p>
          </div>
        </div>
        <h2 className="text-xl font-bold mb-2 line-clamp-2">{currentVideo.title}</h2>
        <p className="text-sm text-white/90 line-clamp-2 mb-2">{currentVideo.description ?? ''}</p>
      </div>

      {/* Right action buttons */}
      <div className="absolute bottom-0 right-0 p-6 flex flex-col gap-5 text-white z-10">
        <button className="flex flex-col items-center gap-1 group" onClick={handleLike}>
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-full group-hover:bg-white/20 transition-colors">
            <Heart className={`h-7 w-7 ${liked.has(currentVideo.id) ? 'fill-red-500 text-red-500' : ''}`} />
          </div>
          <span className="text-xs font-medium">{formatCount(currentVideo.likes + (liked.has(currentVideo.id) ? 1 : 0))}</span>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-full group-hover:bg-white/20 transition-colors">
            <MessageCircle className="h-7 w-7" />
          </div>
          <span className="text-xs font-medium">{formatCount(currentVideo.comments ?? 0)}</span>
        </button>

        <button className="flex flex-col items-center gap-1 group" onClick={handleSave}>
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-full group-hover:bg-white/20 transition-colors">
            <Bookmark className={`h-7 w-7 ${saved.has(currentVideo.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </div>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-full group-hover:bg-white/20 transition-colors">
            <Share2 className="h-7 w-7" />
          </div>
        </button>

        {ytId && (
          <button className="flex flex-col items-center gap-1 group" onClick={() => setMuted(m => !m)}>
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-full group-hover:bg-white/20 transition-colors">
              {muted ? <VolumeX className="h-7 w-7" /> : <Volume2 className="h-7 w-7" />}
            </div>
          </button>
        )}
      </div>

      {/* Navigation dots */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
        {videos.map((_, i) => (
          <button key={i} className={`w-1 h-8 rounded-full transition-colors ${i === currentIndex ? 'bg-white' : 'bg-white/30'}`} onClick={() => setCurrentIndex(i)} />
        ))}
      </div>

      {currentIndex === 0 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white/60 text-sm animate-pulse z-10 pointer-events-none">
          Glissez pour dÃ©couvrir plus â†‘
        </div>
      )}
    </div>
  )
}


