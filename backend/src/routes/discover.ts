import { Router, Request, Response } from 'express'
import { prisma } from '../db/prisma.js'
import { ok, getPagination, paginated } from '../types.js'

const router = Router()

// YouTube travel videos about Cameroon and Africa (fallback when DB has no videos)
const YOUTUBE_VIDEOS = [
  { id: 'yt1', title: 'Yaoundé – La Ville des Collines', videoUrl: 'https://www.youtube.com/embed/s2DYyO_pIBE', thumbnailUrl: 'https://img.youtube.com/vi/s2DYyO_pIBE/mqdefault.jpg', destination: 'Yaoundé', country: 'Cameroun', likes: 1240, views: 12400 },
  { id: 'yt2', title: 'Kribi Beach Paradise – Plages Camerounaises', videoUrl: 'https://www.youtube.com/embed/4RKg2d9KbQk', thumbnailUrl: 'https://img.youtube.com/vi/4RKg2d9KbQk/mqdefault.jpg', destination: 'Kribi', country: 'Cameroun', likes: 3200, views: 45000 },
  { id: 'yt3', title: 'Mount Cameroon – L\'Himalaya de l\'Afrique', videoUrl: 'https://www.youtube.com/embed/E5STwL3xGKg', thumbnailUrl: 'https://img.youtube.com/vi/E5STwL3xGKg/mqdefault.jpg', destination: 'Buea', country: 'Cameroun', likes: 890, views: 9800 },
  { id: 'yt4', title: 'Douala Night Life & Culture', videoUrl: 'https://www.youtube.com/embed/JkFzHx-T0lI', thumbnailUrl: 'https://img.youtube.com/vi/JkFzHx-T0lI/mqdefault.jpg', destination: 'Douala', country: 'Cameroun', likes: 2100, views: 28000 },
  { id: 'yt5', title: 'Waza National Park Safari', videoUrl: 'https://www.youtube.com/embed/RFwJuAb13-0', thumbnailUrl: 'https://img.youtube.com/vi/RFwJuAb13-0/mqdefault.jpg', destination: 'Waza', country: 'Cameroun', likes: 4500, views: 62000 },
  { id: 'yt6', title: 'Bafoussam – Cœur des Grassfields', videoUrl: 'https://www.youtube.com/embed/gXIXnexdKN4', thumbnailUrl: 'https://img.youtube.com/vi/gXIXnexdKN4/mqdefault.jpg', destination: 'Bafoussam', country: 'Cameroun', likes: 670, views: 7600 },
  { id: 'yt7', title: 'Limbe – Ville des Plages Volcaniques', videoUrl: 'https://www.youtube.com/embed/2BLxoLkLBJA', thumbnailUrl: 'https://img.youtube.com/vi/2BLxoLkLBJA/mqdefault.jpg', destination: 'Limbe', country: 'Cameroun', likes: 1800, views: 22000 },
  { id: 'yt8', title: 'Dakar – Capitale de l\'Afrique de l\'Ouest', videoUrl: 'https://www.youtube.com/embed/Ds_TYGrFDio', thumbnailUrl: 'https://img.youtube.com/vi/Ds_TYGrFDio/mqdefault.jpg', destination: 'Dakar', country: 'Sénégal', likes: 2600, views: 31000 },
  { id: 'yt9', title: 'Zanzibar – L\'Île aux Épices', videoUrl: 'https://www.youtube.com/embed/G1KS5tn6vxA', thumbnailUrl: 'https://img.youtube.com/vi/G1KS5tn6vxA/mqdefault.jpg', destination: 'Zanzibar', country: 'Tanzanie', likes: 3900, views: 54000 },
  { id: 'yt10', title: 'Marrakech – La Ville Rouge', videoUrl: 'https://www.youtube.com/embed/Tpbh9iXkFPA', thumbnailUrl: 'https://img.youtube.com/vi/Tpbh9iXkFPA/mqdefault.jpg', destination: 'Marrakech', country: 'Maroc', likes: 5100, views: 78000 },
]

// GET /discover — combined feed
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const [destinations, events, dbVideos] = await Promise.all([
      prisma.destination.findMany({ where: { isActive: true }, take: 5, orderBy: { popularityScore: 'desc' } }),
      prisma.service.findMany({ where: { type: 'EVENTS', isActive: true }, take: 6, orderBy: { rating: 'desc' } }),
      prisma.video.findMany({ where: { isActive: true }, take: limit, skip, orderBy: { createdAt: 'desc' } }),
    ])

    const totalVideos = await prisma.video.count({ where: { isActive: true } })

    // Merge DB videos with YouTube fallback videos
    const allVideos = dbVideos.length > 0
      ? dbVideos.map(v => ({
          id: v.id, title: v.title,
          videoUrl: v.videoUrl.includes('youtube') ? v.videoUrl : YOUTUBE_VIDEOS[0].videoUrl,
          thumbnailUrl: v.thumbnailUrl ?? getYtThumbnail(v.videoUrl),
          destination: v.destination ?? '',
          country: v.country ?? '',
          likes: v.likes, views: v.views,
        }))
      : YOUTUBE_VIDEOS.slice(skip, skip + limit)

    const total = totalVideos > 0 ? totalVideos : YOUTUBE_VIDEOS.length

    res.json({
      videos: { page, limit, total, items: allVideos },
      featuredDestinations: destinations,
      featuredEvents: events,
    })
  } catch (err) { next(err) }
})

// GET /discover/videos
router.get('/videos', async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const { country } = req.query as Record<string, string>

    const where = { isActive: true, ...(country && { country }) }
    const [total, items] = await Promise.all([
      prisma.video.count({ where }),
      prisma.video.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    ])

    const videos = items.length > 0
      ? items.map(v => ({
          ...v,
          destination: v.destination ?? '',
          country: v.country ?? '',
          videoUrl: v.videoUrl.includes('youtube') ? v.videoUrl : YOUTUBE_VIDEOS[0].videoUrl,
          thumbnailUrl: v.thumbnailUrl ?? getYtThumbnail(v.videoUrl),
        }))
      : YOUTUBE_VIDEOS.filter(v => !country || v.country.toLowerCase().includes(country.toLowerCase()))

    res.json(paginated(videos, total || videos.length, page, limit))
  } catch (err) { next(err) }
})

function getYtThumbnail(url: string): string {
  const match = url?.match(/(?:embed\/|watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : ''
}

export default router
