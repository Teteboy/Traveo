import { Router, Request, Response } from 'express'
import { prisma } from '../db/prisma.js'
import { authenticate } from '../middleware/auth.js'
import { createError } from '../middleware/error.js'
import { ok } from '../types.js'
import OpenAI from 'openai'

const router = Router()

// Initialize OpenAI client (only if API key is available)
let openai: OpenAI | null = null
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// Fallback responses when AI is not available
const fallbackResponses: Record<string, string> = {
  greeting: "Bonjour ! Je suis l'assistant virtuel Traveo. Comment puis-je vous aider aujourd'hui ?",
  thanks: "Je vous en prie ! Y a-t-il autre chose que je puisse faire pour vous ?",
  flight: "Pour les vols, je peux vous aider avec: réservation, modification, annulation, enregistrement en ligne, et informations sur les bagages. Que souhaitez-vous savoir?",
  hotel: "Pour les hôtels, je peux vous aider avec: réservation, modification de dates, demandes spéciales, et annulation. Que souhaitez-vous faire?",
  visa: "Pour les visas, je peux vous aider à vérifier l'éligibilité, suivre votre demande, et comprendre les documents requis. Pour quel pays souhaitez-vous des informations?",
  payment: "Pour les paiements, j'accepte les cartes bancaires, PayPal, et le solde de votre portefeuille Traveo. Les transactions sont sécurisées et cryptées.",
  cancel_booking: "Pour annuler une réservation, allez dans 'Mes Voyages', sélectionnez la réservation concernée et cliquez sur 'Annuler'. Les conditions d'annulation varient selon le type de réservation.",
  refund: "Les demandes de remboursement sont traitées sous 5-7 jours ouvrables. Pour initier une demande, rendez-vous dans votre portefeuille > Historique > Sélectionner la transaction.",
  contact_agent: "Un agent sera disponible sous peu. Nos horaires de service sont de 9h à 18h (GMT+1) du lundi au vendredi. Voulez-vous que je vous rappelle?",
  default: "Je suis là pour vous aider ! Posez-moi vos questions sur les réservations, vols, hôtels, visas ou tout autre service. Je ferai de mon mieux pour vous assister.",
}

function getFallbackResponse(message: string, user?: any): string {
  const lowerMessage = message.toLowerCase()

  // Basic greetings and thanks
  if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || lowerMessage.includes('hello')) {
    return fallbackResponses.greeting
  }
  if (lowerMessage.includes('merci') || lowerMessage.includes('thanks')) {
    return fallbackResponses.thanks
  }

  // Service-specific questions
  if (lowerMessage.includes('vol') || lowerMessage.includes('flight') || lowerMessage.includes('avion')) {
    return fallbackResponses.flight
  }
  if (lowerMessage.includes('hôtel') || lowerMessage.includes('hotel') || lowerMessage.includes('logement')) {
    return fallbackResponses.hotel
  }
  if (lowerMessage.includes('visa') || lowerMessage.includes('passeport')) {
    return fallbackResponses.visa
  }
  if (lowerMessage.includes('paiement') || lowerMessage.includes('payment') || lowerMessage.includes('carte')) {
    return fallbackResponses.payment
  }

  // Actions that require API calls
  if (lowerMessage.includes('annuler') || lowerMessage.includes('annulation')) {
    return fallbackResponses.cancel_booking
  }
  if (lowerMessage.includes('remboursement') || lowerMessage.includes('refund')) {
    return fallbackResponses.refund
  }
  if (lowerMessage.includes('agent') || lowerMessage.includes('humain') || lowerMessage.includes('conseiller')) {
    return fallbackResponses.contact_agent
  }

  return fallbackResponses.default
}

// POST /chat/message
router.post('/message', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { message, context } = req.body

    if (!message || typeof message !== 'string') {
      return next(createError('Message is required', 400))
    }

    // Get user context for personalized responses
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      }
    })

    // Build system prompt with context
    const systemPrompt = `You are Traveo, a helpful travel assistant for the Traveo travel booking platform.

Key capabilities:
- Help with flight bookings, hotel reservations, event tickets, restaurant bookings, transfers, and guides
- Assist with wallet balance inquiries and transaction history
- Provide visa application guidance and requirements
- Answer questions about bookings, cancellations, and refunds
- Handle general travel inquiries and support

Platform features:
- Multi-currency wallet system
- e-Visa applications with document upload
- QR-based e-tickets for flights and events
- Provider portal for service management
- Real-time booking confirmations

User context:
    ${user ? `- User: ${user.firstName} ${user.lastName}` : '- Guest user'}

${context ? `Additional context: ${JSON.stringify(context)}` : ''}

Always respond in a helpful, professional manner. If you cannot answer a question, suggest contacting human support at support@tripplanner.com or by phone at +33 1 23 45 67 89.

Keep responses concise but informative.`

    // Call OpenAI API or use fallback
    let aiResponse: string

    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 500,
          temperature: 0.7,
        })

        aiResponse = completion.choices[0]?.message?.content || 'Désolé, je n\'arrive pas à traiter votre demande pour le moment.'
      } catch (aiError) {
        console.error('OpenAI API error:', aiError)
        aiResponse = getFallbackResponse(message, user)
      }
    } else {
      aiResponse = getFallbackResponse(message, user)
    }

    // Store conversation in database (optional)
    try {
      await prisma.chatMessage.create({
        data: {
          userId: req.user!.userId,
          message,
          response: aiResponse,
          timestamp: new Date(),
        }
      })
    } catch (dbError) {
      // Log but don't fail the response
      console.error('Failed to store chat message:', dbError)
    }

    res.json(ok({
      response: aiResponse,
      timestamp: new Date().toISOString(),
    }))

  } catch (err) {
    console.error('Chat API error:', err)
    if (err instanceof Error && err.message.includes('OpenAI')) {
      return next(createError('AI service temporarily unavailable', 503))
    }
    next(err)
  }
})

// GET /chat/history
router.get('/history', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const [total, messages] = await Promise.all([
      prisma.chatMessage.count({ where: { userId: req.user!.userId } }),
      prisma.chatMessage.findMany({
        where: { userId: req.user!.userId },
        orderBy: { timestamp: 'desc' },
        skip,
        take: Number(limit),
      })
    ])

    const mapped = messages.reverse().map(m => ({
      id: m.id,
      message: m.message,
      response: m.response,
      timestamp: m.timestamp.toISOString(),
    }))

    res.json(ok({
      messages: mapped,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      }
    }))

  } catch (err) { next(err) }
})

// ─── Real Conversations (Provider <-> User) ────────────────────────────────

// GET /chat/conversations — list conversations for current user or provider
router.get('/conversations', authenticate, async (req: Request, res: Response, next) => {
  try {
    const userId = req.user!.userId
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { provider: true } })

    let conversations: any[] = []

    if (user?.provider) {
      // Provider view
      conversations = await prisma.conversation.findMany({
        where: { providerId: user.provider.id },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { updatedAt: 'desc' },
      })
    } else {
      // User view
      conversations = await prisma.conversation.findMany({
        where: { userId },
        include: {
          provider: { select: { id: true, companyName: true, user: { select: { avatar: true } } } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { updatedAt: 'desc' },
      })
    }

    const threads = conversations.map((c: any) => ({
      id: c.id,
      otherParty: user?.provider
        ? { name: `${c.user.firstName} ${c.user.lastName}`, avatar: c.user.avatar }
        : { name: c.provider.companyName, avatar: c.provider.user?.avatar },
      lastMessage: c.lastMessage || c.messages[0]?.text || '',
      lastMessageTime: c.lastMessageAt || c.messages[0]?.createdAt,
      unreadCount: 0, // TODO: compute unread
    }))

    res.json(ok({ conversations: threads }))
  } catch (err) {
    console.error('[Chat] conversations error:', err)
    // Return empty list instead of crashing when table is missing or other errors
    res.json(ok({ conversations: [] }))
  }
})

// GET /chat/conversations/:id/messages
router.get('/conversations/:id/messages', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
    })

    res.json(ok({ messages }))
  } catch (err) { next(err) }
})

// POST /chat/conversations/:id/messages — send message
router.post('/conversations/:id/messages', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params
    const { text } = req.body
    if (!text) return next(createError('Message text is required', 400))

    const userId = req.user!.userId
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { provider: true } })

    const senderType = user?.provider ? 'provider' : 'user'

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: userId,
        senderType,
        text,
      },
    })

    // Update conversation last message
    await prisma.conversation.update({
      where: { id },
      data: { lastMessage: text, lastMessageAt: new Date() },
    })

    res.json(ok({ message }))
  } catch (err) { next(err) }
})

// POST /chat/conversations — create or get existing conversation with a provider
router.post('/conversations', authenticate, async (req: Request, res: Response, next) => {
  try {
    const { providerId } = req.body
    if (!providerId) {
      return next(createError('providerId is required', 400))
    }

    const userId = req.user!.userId

    let conversation = await prisma.conversation.findFirst({
      where: { userId, providerId }
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { userId, providerId }
      })
    }

    res.json(ok({ conversation }))
  } catch (err) { next(err) }
})

export default router