import { Router, Request, Response } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.js'
import { createError } from '../middleware/error.js'
import { ok, getPagination, paginated } from '../types.js'
import multer from 'multer'
import { uploadBufferToCloudinary } from '../services/cloudinary.js'

const router = Router()

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

// Static visa destinations
const VISA_DESTINATIONS = [
  { countryCode: 'CM', countryName: 'Cameroun' },
  { countryCode: 'FR', countryName: 'France' },
  { countryCode: 'MA', countryName: 'Maroc' },
  { countryCode: 'SN', countryName: 'Sénégal' },
  { countryCode: 'ZA', countryName: 'Afrique du Sud' },
  { countryCode: 'NG', countryName: 'Nigeria' },
  { countryCode: 'GH', countryName: 'Ghana' },
  { countryCode: 'TZ', countryName: 'Tanzanie' },
  { countryCode: 'GE', countryName: 'Géorgie' },
  { countryCode: 'RU', countryName: 'Russie' },
  { countryCode: 'UA', countryName: 'Ukraine' },
  { countryCode: 'CA', countryName: 'Canada' },
  { countryCode: 'US', countryName: 'États-Unis' },
  { countryCode: 'AU', countryName: 'Australie' },
  { countryCode: 'NZ', countryName: 'Nouvelle-Zélande' },
  { countryCode: 'SA', countryName: 'Arabie Saoudite' },
  { countryCode: 'AZ', countryName: 'Azerbaïdjan' },
  { countryCode: 'KH', countryName: 'Cambodge' },
  { countryCode: 'IN', countryName: 'Inde' },
  { countryCode: 'MM', countryName: 'Myanmar' },
  { countryCode: 'OM', countryName: 'Oman' },
  { countryCode: 'LK', countryName: 'Sri Lanka' },
  { countryCode: 'TH', countryName: 'Thaïlande' },
  { countryCode: 'TR', countryName: 'Turquie' },
  { countryCode: 'DE', countryName: 'Allemagne' },
  { countryCode: 'CN', countryName: 'Chine' },
  { countryCode: 'AE', countryName: 'Émirats arabes unis' },
  { countryCode: 'GB', countryName: 'Royaume-Uni' },
]

// Country-specific visa fees and processing times
const COUNTRY_VISA_CONFIG: Record<string, { feeXAF: number; feeEUR: number; processingDays: number; requiresInvitation: boolean; visaRequired: boolean; eVisaAvailable: boolean }> = {
  GE: { feeXAF: 60000, feeEUR: 92, processingDays: 7, requiresInvitation: false, visaRequired: true, eVisaAvailable: true },
  RU: { feeXAF: 55000, feeEUR: 84, processingDays: 10, requiresInvitation: false, visaRequired: true, eVisaAvailable: true },
  UA: { feeXAF: 50000, feeEUR: 77, processingDays: 5, requiresInvitation: false, visaRequired: true, eVisaAvailable: true },
  CA: { feeXAF: 120000, feeEUR: 184, processingDays: 14, requiresInvitation: false, visaRequired: true, eVisaAvailable: true },
  US: { feeXAF: 150000, feeEUR: 230, processingDays: 15, requiresInvitation: false, visaRequired: true, eVisaAvailable: true },
  AU: { feeXAF: 110000, feeEUR: 169, processingDays: 12, requiresInvitation: false, visaRequired: true, eVisaAvailable: true },
  NZ: { feeXAF: 100000, feeEUR: 154, processingDays: 10, requiresInvitation: false, visaRequired: true, eVisaAvailable: true },
  SA: { feeXAF: 80000, feeEUR: 123, processingDays: 8, requiresInvitation: true, visaRequired: true, eVisaAvailable: true },
  AZ: { feeXAF: 45000, feeEUR: 69, processingDays: 5, requiresInvitation: false, visaRequired: true, eVisaAvailable: true },
  KH: { feeXAF: 35000, feeEUR: 54, processingDays: 4, requiresInvitation: false, visaRequired: true, eVisaAvailable: true },
  IN: { feeXAF: 45000, feeEUR: 69, processingDays: 7, requiresInvitation: false, visaRequired: true, eVisaAvailable: true },
  MM: { feeXAF: 40000, feeEUR: 62, processingDays: 5, requiresInvitation: false, visaRequired: true, eVisaAvailable: true },
  OM: { feeXAF: 70000, feeEUR: 107, processingDays: 6, requiresInvitation: true, visaRequired: true, eVisaAvailable: true },
  LK: { feeXAF: 40000, feeEUR: 62, processingDays: 4, requiresInvitation: false, visaRequired: true, eVisaAvailable: true },
  TH: { feeXAF: 45000, feeEUR: 69, processingDays: 4, requiresInvitation: false, visaRequired: true, eVisaAvailable: true },
  TR: { feeXAF: 50000, feeEUR: 77, processingDays: 5, requiresInvitation: false, visaRequired: true, eVisaAvailable: true },
  FR: { feeXAF: 50000, feeEUR: 77, processingDays: 3, requiresInvitation: false, visaRequired: false, eVisaAvailable: false },
  GB: { feeXAF: 90000, feeEUR: 138, processingDays: 10, requiresInvitation: false, visaRequired: true, eVisaAvailable: true },
  DE: { feeXAF: 85000, feeEUR: 131, processingDays: 7, requiresInvitation: false, visaRequired: true, eVisaAvailable: true },
  CN: { feeXAF: 50000, feeEUR: 77, processingDays: 8, requiresInvitation: false, visaRequired: true, eVisaAvailable: true },
  AE: { feeXAF: 80000, feeEUR: 123, processingDays: 5, requiresInvitation: true, eVisaAvailable: true, visaRequired: true },
  MA: { feeXAF: 40000, feeEUR: 62, processingDays: 4, requiresInvitation: false, eVisaAvailable: false, visaRequired: false },
}

// Visa requirements per country
interface VisaDocRequirement {
  documentType: string;
  label: string;
  required: boolean;
  acceptedFormats: string[];
  maxSizeBytes: number;
}

const VISA_REQUIREMENTS: Record<string, VisaDocRequirement[]> = {
  default: [
    { documentType: 'passport', label: 'Passeport (pages de données)', required: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeBytes: 5242880 },
    { documentType: 'photo', label: 'Photo d\'identité récente', required: true, acceptedFormats: ['jpg', 'png'], maxSizeBytes: 2097152 },
    { documentType: 'proof_of_funds', label: 'Justificatif de fonds', required: true, acceptedFormats: ['pdf'], maxSizeBytes: 5242880 },
    { documentType: 'invitation_letter', label: 'Lettre d\'invitation (si applicable)', required: false, acceptedFormats: ['pdf'], maxSizeBytes: 5242880 },
  ],
  SA: [
    { documentType: 'passport', label: 'Passeport (pages de données)', required: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeBytes: 5242880 },
    { documentType: 'photo', label: 'Photo d\'identité récente', required: true, acceptedFormats: ['jpg', 'png'], maxSizeBytes: 2097152 },
    { documentType: 'proof_of_funds', label: 'Justificatif de fonds', required: true, acceptedFormats: ['pdf'], maxSizeBytes: 5242880 },
    { documentType: 'invitation_letter', label: 'Lettre d\'invitation (obligatoire)', required: true, acceptedFormats: ['pdf'], maxSizeBytes: 5242880 },
    { documentType: 'vaccination_cert', label: 'Certificat de vaccination', required: true, acceptedFormats: ['pdf'], maxSizeBytes: 2097152 },
  ],
  OM: [
    { documentType: 'passport', label: 'Passeport (pages de données)', required: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeBytes: 5242880 },
    { documentType: 'photo', label: 'Photo d\'identité récente', required: true, acceptedFormats: ['jpg', 'png'], maxSizeBytes: 2097152 },
    { documentType: 'proof_of_funds', label: 'Justificatif de fonds', required: true, acceptedFormats: ['pdf'], maxSizeBytes: 5242880 },
    { documentType: 'invitation_letter', label: 'Lettre d\'invitation (obligatoire)', required: true, acceptedFormats: ['pdf'], maxSizeBytes: 5242880 },
    { documentType: 'hotel_reservation', label: 'Réservation d\'hôtel', required: true, acceptedFormats: ['pdf'], maxSizeBytes: 2097152 },
  ],
  AE: [
    { documentType: 'passport', label: 'Passeport (pages de données)', required: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeBytes: 5242880 },
    { documentType: 'photo', label: 'Photo d\'identité récente', required: true, acceptedFormats: ['jpg', 'png'], maxSizeBytes: 2097152 },
    { documentType: 'proof_of_funds', label: 'Justificatif de fonds', required: true, acceptedFormats: ['pdf'], maxSizeBytes: 5242880 },
    { documentType: 'invitation_letter', label: 'Lettre d\'invitation (recommandée)', required: false, acceptedFormats: ['pdf'], maxSizeBytes: 5242880 },
    { documentType: 'vaccination_cert', label: 'Certificat de vaccination', required: true, acceptedFormats: ['pdf'], maxSizeBytes: 2097152 },
  ],
  US: [
    { documentType: 'passport', label: 'Passeport (pages de données)', required: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeBytes: 5242880 },
    { documentType: 'photo', label: 'Photo d\'identité récente', required: true, acceptedFormats: ['jpg', 'png'], maxSizeBytes: 2097152 },
    { documentType: 'proof_of_funds', label: 'Justificatif de fonds', required: true, acceptedFormats: ['pdf'], maxSizeBytes: 5242880 },
    { documentType: 'flight_itinerary', label: 'Itinéraire de vol', required: true, acceptedFormats: ['pdf'], maxSizeBytes: 2097152 },
    { documentType: 'hotel_reservation', label: 'Réservation d\'hôtel', required: true, acceptedFormats: ['pdf'], maxSizeBytes: 2097152 },
  ],
  CA: [
    { documentType: 'passport', label: 'Passeport (pages de données)', required: true, acceptedFormats: ['pdf', 'jpg', 'png'], maxSizeBytes: 5242880 },
    { documentType: 'photo', label: 'Photo d\'identité récente', required: true, acceptedFormats: ['jpg', 'png'], maxSizeBytes: 2097152 },
    { documentType: 'proof_of_funds', label: 'Justificatif de fonds', required: true, acceptedFormats: ['pdf'], maxSizeBytes: 5242880 },
    { documentType: 'flight_itinerary', label: 'Itinéraire de vol', required: true, acceptedFormats: ['pdf'], maxSizeBytes: 2097152 },
    { documentType: 'letter_of_employment', label: 'Lettre d\'emploi (si applicable)', required: false, acceptedFormats: ['pdf'], maxSizeBytes: 5242880 },
  ],
}

// GET /visa/destinations
router.get('/destinations', async (_req: Request, res: Response, next) => {
  try {
    const destinationsWithConfig = VISA_DESTINATIONS.map(dest => {
      const config = COUNTRY_VISA_CONFIG[dest.countryCode]
      return {
        countryCode: dest.countryCode,
        countryName: dest.countryName,
        visaRequired: config?.visaRequired ?? true,
        eVisaAvailable: config?.eVisaAvailable ?? false,
        processingFee: config?.feeXAF ?? 50000,
        processingDays: config?.processingDays ?? 10,
      }
    })
    res.json(ok(destinationsWithConfig))
  } catch (err) { next(err) }
})

// GET /visa/:countryCode/requirements
router.get('/:countryCode/requirements', async (req: Request, res: Response, next) => {
  try {
    const { countryCode } = req.params as { countryCode: string }
    const normalizedCountryCode = countryCode.toUpperCase()
    const dest = VISA_DESTINATIONS.find(d => d.countryCode === normalizedCountryCode)
    const config = COUNTRY_VISA_CONFIG[normalizedCountryCode]
    const requirements = VISA_REQUIREMENTS[normalizedCountryCode] ?? VISA_REQUIREMENTS.default

    if (!dest) {
      throw createError('Country not found', 404, 'NOT_FOUND')
    }

    res.json(ok({
      countryCode: normalizedCountryCode,
      countryName: dest.countryName,
      eligible: config?.eVisaAvailable ?? false,
      visaRequired: config?.visaRequired ?? true,
      eVisaAvailable: config?.eVisaAvailable ?? false,
      requiresInvitation: config?.requiresInvitation ?? false,
      fee: config ? { xaf: config.feeXAF } : null,
      processingDays: config?.processingDays ?? 10,
      requirements
    }))
  } catch (err) { next(err) }
})

// GET /visa/applications
router.get('/applications', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const [total, items] = await Promise.all([
      prisma.visaApplication.count({ where: { userId: req.user!.userId } }),
      prisma.visaApplication.findMany({ where: { userId: req.user!.userId }, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { documents: true } }),
    ])
    const mapped = items.map(a => ({ ...a, status: a.status.toLowerCase() }))
    res.json(paginated(mapped, total, page, limit))
  } catch (err) { next(err) }
})

// POST /visa/applications
router.post('/applications', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { countryCode, travelDates, applicant } = req.body
    if (!countryCode || !applicant) throw createError('countryCode and applicant required', 400)

    const dest = VISA_DESTINATIONS.find(d => d.countryCode === countryCode.toUpperCase())
    const app = await prisma.visaApplication.create({
      data: {
        userId: req.user!.userId,
        countryCode: countryCode.toUpperCase(),
        countryName: dest?.countryName ?? countryCode,
        status: 'DRAFT',
        applicantData: applicant,
        travelDates: travelDates ?? null,
        processingFee: 50000,
      },
    })

    await prisma.notification.create({
      data: {
        userId: req.user!.userId,
        type: 'visa',
        title: 'Demande de visa créée',
        message: `Votre demande de visa pour ${dest?.countryName ?? countryCode} a été créée.`,
        metadata: { applicationId: app.id },
      },
    })

    res.status(201).json(ok({ application: { ...app, status: app.status.toLowerCase() } }))
  } catch (err) { next(err) }
})

// GET /visa/applications/:id
router.get('/applications/:id', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const app = await prisma.visaApplication.findUnique({ where: { id }, include: { documents: true } })
    if (!app) throw createError('Application not found', 404, 'NOT_FOUND')
    if (app.userId !== req.user!.userId && req.user!.role !== 'ADMIN') throw createError('Forbidden', 403, 'FORBIDDEN')
    res.json(ok({ ...app, status: app.status.toLowerCase() }))
  } catch (err) { next(err) }
})

// POST /visa/applications/:id/documents — upload document
router.post('/applications/:id/documents', authenticate, upload.single('file'), async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params as { id: string }
    const app = await prisma.visaApplication.findUnique({ where: { id } })
    if (!app) throw createError('Application not found', 404, 'NOT_FOUND')
    if (app.userId !== req.user!.userId) throw createError('Forbidden', 403, 'FORBIDDEN')

    const { documentType } = req.body
    const file = req.file
    if (!documentType) throw createError('documentType required', 400)

    let uploadedUrl: string | undefined
    if (file?.buffer) {
      const uploaded = await uploadBufferToCloudinary(file.buffer, 'traveo/visa-documents', `${app.id}_${Date.now()}`)
      uploadedUrl = uploaded.url
    }

    const doc = await prisma.visaDocument.create({
      data: {
        applicationId: app.id,
        documentType: documentType ?? 'other',
        fileName: file?.originalname ?? req.body.fileName ?? 'document',
        fileUrl: uploadedUrl ?? req.body.fileUrl,
      },
    })

    // If all required docs uploaded, submit application
    const docs = await prisma.visaDocument.findMany({ where: { applicationId: app.id } })
    if (docs.length >= 2 && app.status === 'DRAFT') {
      await prisma.visaApplication.update({ where: { id: app.id }, data: { status: 'SUBMITTED' } })
    }

    res.json(ok({ document: doc, url: doc.fileUrl, expiresAt: new Date(Date.now() + 3600 * 1000).toISOString() }))
  } catch (err) { next(err) }
})

// GET /visa/documents — list visa-related documents for the current user
router.get('/documents', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const category = req.query.category as string

    // Find all visa applications for this user, then their documents
    const applications = await prisma.visaApplication.findMany({
      where: { userId: req.user!.userId },
      select: { id: true },
    })
    const applicationIds = applications.map(a => a.id)

    const where: any = { applicationId: { in: applicationIds } }
    const [total, items] = await Promise.all([
      prisma.visaDocument.count({ where }),
      prisma.visaDocument.findMany({
        where,
        skip,
        take: limit,
        orderBy: { uploadedAt: 'desc' },
      }),
    ])

    const mapped = items.map(doc => {
      const ext = doc.fileName.split('.').pop()?.toUpperCase() || 'FILE'
      return {
        id: doc.id,
        name: doc.fileName,
        type: ext,
        size: '—',
        uploadDate: doc.uploadedAt.toISOString().split('T')[0],
        category: doc.documentType,
        fileUrl: doc.fileUrl,
      }
    })

    res.json(paginated(mapped, total, page, limit))
  } catch (err) { next(err) }
})

export default router
