// Simple content filtering service for profanity and spam detection
// In production, you might want to use a more sophisticated service like:
// - Google Cloud Natural Language API
// - AWS Comprehend
// - OpenAI Moderation API
// - Custom ML models

const PROFANITY_LIST = [
  // Add profanity words here (this is a placeholder - in production use a comprehensive list)
  'badword1', 'badword2', 'badword3',
  // French profanity
  'mot1', 'mot2', 'mot3',
]

const SPAM_PATTERNS = [
  /buy\s+now/i,
  /click\s+here/i,
  /free\s+money/i,
  /winner/i,
  /congratulations/i,
  /act\s+now/i,
  /limited\s+time/i,
  /100%\s+free/i,
  /no\s+risk/i,
  /guaranteed/i,
  /viagra/i,
  /casino/i,
  /lottery/i,
  /bitcoin/i,
  /crypto/i,
  /investment/i,
  /earn\s+money/i,
  /work\s+from\s+home/i,
  // Email patterns
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // URL patterns
  /https?:\/\/[^\s]+/g,
  // Phone number patterns
  /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g,
]

const SUSPICIOUS_PATTERNS = [
  // Excessive capitalization
  /^[A-Z\s]{20,}$/,
  // Excessive punctuation
  /[!?]{5,}/,
  // Repeated characters
  /(.)\1{5,}/,
  // Numbers only
  /^\d+$/,
]

export interface ContentFilterResult {
  isProfane: boolean
  isSpam: boolean
  isSuspicious: boolean
  confidence: number
  flaggedWords: string[]
  reasons: string[]
}

export function filterContent(text: string): ContentFilterResult {
  const result: ContentFilterResult = {
    isProfane: false,
    isSpam: false,
    isSuspicious: false,
    confidence: 0,
    flaggedWords: [],
    reasons: [],
  }

  const lowerText = text.toLowerCase()

  // Check for profanity
  for (const word of PROFANITY_LIST) {
    if (lowerText.includes(word)) {
      result.isProfane = true
      result.flaggedWords.push(word)
      result.reasons.push('Profanity detected')
    }
  }

  // Check for spam patterns
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      result.isSpam = true
      result.reasons.push('Spam pattern detected')
    }
  }

  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(text)) {
      result.isSuspicious = true
      result.reasons.push('Suspicious pattern detected')
    }
  }

  // Calculate confidence
  let confidence = 0
  if (result.isProfane) confidence += 0.4
  if (result.isSpam) confidence += 0.4
  if (result.isSuspicious) confidence += 0.2
  result.confidence = Math.min(confidence, 1)

  return result
}

export function shouldAutoModerate(result: ContentFilterResult): boolean {
  // Auto-moderate if high confidence or profanity detected
  return result.confidence > 0.7 || result.isProfane
}

export function getModerationPriority(result: ContentFilterResult): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (result.isProfane) return 'HIGH'
  if (result.isSpam && result.confidence > 0.5) return 'HIGH'
  if (result.isSuspicious) return 'MEDIUM'
  return 'LOW'
}

// Auto-moderate content and create moderation item if needed
export async function autoModerateContent(
  content: string,
  authorId: string,
  authorName: string,
  targetType: string,
  targetId: string,
  targetName: string
): Promise<{ shouldBlock: boolean; moderationId?: string }> {
  const filterResult = filterContent(content)

  if (shouldAutoModerate(filterResult)) {
    // Create moderation item
    const moderation = await import('../db/prisma.js').then(({ prisma }) =>
      prisma.moderationItem.create({
        data: {
          type: 'CONTENT',
          content,
          authorId,
          authorName,
          targetType,
          targetId,
          targetName,
          status: 'PENDING',
          priority: getModerationPriority(filterResult),
          reason: filterResult.reasons.join(', '),
          reports: 0,
        },
      })
    )

    return {
      shouldBlock: filterResult.isProfane || filterResult.confidence > 0.8,
      moderationId: moderation.id,
    }
  }

  return { shouldBlock: false }
}
