import { Router, Request, Response } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.js'
import { createError } from '../middleware/error.js'
import { ok, getPagination, paginated } from '../types.js'
import multer from 'multer'
import { uploadBufferToCloudinary } from '../services/cloudinary.js'

const router = Router()

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

// GET /documents - get user's documents
router.get('/', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const category = req.query.category as string

    const where: any = { userId: req.user!.userId }
    if (category && category !== 'all') {
      where.category = category
    }

    const [total, items] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { uploadedAt: 'desc' }
      }),
    ])

    const mapped = items.map(doc => ({
      id: doc.id,
      name: doc.fileName,
      type: doc.fileName.split('.').pop()?.toUpperCase() || 'FILE',
      size: `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB`,
      uploadDate: doc.uploadedAt.toISOString().split('T')[0],
      category: doc.category,
      fileUrl: doc.fileUrl,
    }))

    res.json(paginated(mapped, total, page, limit))
  } catch (err) { next(err) }
})

// POST /documents - upload document
router.post('/', authenticate, upload.single('file'), async (req: Request, res: Response, next) => {
  try {
    const { category } = req.body
    const file = req.file

    if (!file) throw createError('File is required', 400)
    if (!category) throw createError('Category is required', 400)

    let uploadedUrl: string | undefined
    if (file.buffer) {
      const uploaded = await uploadBufferToCloudinary(file.buffer, 'traveo/user-documents', `user_${req.user!.userId}_${Date.now()}`)
      uploadedUrl = uploaded.url
    }

    const doc = await prisma.document.create({
      data: {
        userId: req.user!.userId,
        fileName: file.originalname,
        fileUrl: uploadedUrl,
        fileSize: file.size,
        category: category,
      },
    })

    res.status(201).json(ok({
      document: {
        id: doc.id,
        name: doc.fileName,
        type: doc.fileName.split('.').pop()?.toUpperCase() || 'FILE',
        size: `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB`,
        uploadDate: doc.uploadedAt.toISOString().split('T')[0],
        category: doc.category,
        fileUrl: doc.fileUrl,
      }
    }))
  } catch (err) { next(err) }
})

// DELETE /documents/:id - delete document
router.delete('/:id', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }

    const doc = await prisma.document.findUnique({ where: { id } })
    if (!doc) throw createError('Document not found', 404)
    if (doc.userId !== req.user!.userId) throw createError('Forbidden', 403)

    await prisma.document.delete({ where: { id } })

    res.json(ok({ message: 'Document deleted successfully' }))
  } catch (err) { next(err) }
})

// GET /documents/stats - get storage stats
router.get('/stats', authenticate, async (req: Request, res: Response, next) => {
  try {
    const documents = await prisma.document.findMany({
      where: { userId: req.user!.userId },
      select: { fileSize: true }
    })

    const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0)
    const totalFiles = documents.length

    res.json(ok({
      totalFiles,
      totalSize,
      totalSizeFormatted: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
      usagePercentage: Math.min((totalSize / (50 * 1024 * 1024)) * 100, 100), // Assuming 50MB limit
    }))
  } catch (err) { next(err) }
})

export default router