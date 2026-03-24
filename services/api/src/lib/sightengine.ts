import { prisma } from '../trpc/context.js'

const API_USER = process.env.SIGHTENGINE_API_USER || ''
const API_SECRET = process.env.SIGHTENGINE_API_SECRET || ''
const API_URL = 'https://api.sightengine.com/1.0/check.json'

interface SightengineResponse {
  status: string
  nudity?: {
    sexual_activity: number
    sexual_display: number
    erotica: number
    very_suggestive: number
    suggestive: number
    mildly_suggestive: number
    none: number
  }
  faces?: Array<{
    attributes?: {
      female?: number
      male?: number
    }
  }>
  type?: {
    photo: number
    illustration: number
    selfie?: number
  }
}

interface ClassificationTag {
  dimension: 'NUDITY' | 'BODY_PART' | 'ACTIVITY' | 'VIBE' | 'GENDER_PRESENTATION'
  value: string
  confidence: number
}

export async function classifyImage(imageUrl: string): Promise<ClassificationTag[]> {
  if (!API_USER || !API_SECRET) {
    console.warn('Sightengine API credentials not configured, skipping classification')
    return []
  }

  const params = new URLSearchParams({
    url: imageUrl,
    models: 'nudity-2.1,face-attributes-3.0,type-1.0',
    api_user: API_USER,
    api_secret: API_SECRET,
  })

  const response = await fetch(`${API_URL}?${params}`)
  if (!response.ok) {
    console.warn(`Sightengine API error: ${response.status}`)
    return []
  }

  const data = await response.json() as SightengineResponse
  if (data.status !== 'success') {
    console.warn('Sightengine API returned non-success status')
    return []
  }

  return mapToTags(data)
}

function mapToTags(data: SightengineResponse): ClassificationTag[] {
  const tags: ClassificationTag[] = []

  // Nudity dimension
  if (data.nudity) {
    const n = data.nudity
    if (n.sexual_activity > 0.5 || n.sexual_display > 0.5) {
      tags.push({ dimension: 'NUDITY', value: 'FULL', confidence: Math.max(n.sexual_activity, n.sexual_display) })
    } else if (n.erotica > 0.5 || n.very_suggestive > 0.5) {
      tags.push({ dimension: 'NUDITY', value: 'PARTIAL', confidence: Math.max(n.erotica, n.very_suggestive) })
    } else if (n.suggestive > 0.5 || n.mildly_suggestive > 0.5) {
      tags.push({ dimension: 'NUDITY', value: 'IMPLIED', confidence: Math.max(n.suggestive, n.mildly_suggestive) })
    } else {
      tags.push({ dimension: 'NUDITY', value: 'NONE', confidence: n.none })
    }
  }

  // Body part detection - infer from nudity scores
  if (data.nudity) {
    const n = data.nudity
    if (n.sexual_display > 0.3 || n.sexual_activity > 0.3) {
      tags.push({ dimension: 'BODY_PART', value: 'GENITALS', confidence: Math.max(n.sexual_display, n.sexual_activity) })
    }
    if (n.erotica > 0.3) {
      tags.push({ dimension: 'BODY_PART', value: 'CHEST', confidence: n.erotica })
    }
    if (n.very_suggestive > 0.3) {
      tags.push({ dimension: 'BODY_PART', value: 'BUTT', confidence: n.very_suggestive })
    }
  }

  // Face detection
  if (data.faces && data.faces.length > 0) {
    tags.push({ dimension: 'BODY_PART', value: 'FACE', confidence: 0.9 })
  }

  // Activity/type detection
  if (data.type) {
    if (data.type.selfie && data.type.selfie > 0.5) {
      tags.push({ dimension: 'ACTIVITY', value: 'SELFIE', confidence: data.type.selfie })
    } else if (data.type.photo > 0.5) {
      tags.push({ dimension: 'ACTIVITY', value: 'OUTDOOR', confidence: data.type.photo })
    }
    if (data.type.illustration > 0.5) {
      tags.push({ dimension: 'ACTIVITY', value: 'ARTISTIC', confidence: data.type.illustration })
    }
  }

  // Vibe - inferred from nudity + type combo
  if (data.nudity) {
    const n = data.nudity
    if (n.sexual_activity > 0.5) {
      tags.push({ dimension: 'VIBE', value: 'INTENSE', confidence: n.sexual_activity })
    } else if (n.erotica > 0.3 || n.very_suggestive > 0.3) {
      tags.push({ dimension: 'VIBE', value: 'SENSUAL', confidence: Math.max(n.erotica, n.very_suggestive) })
    } else if (n.suggestive > 0.3) {
      tags.push({ dimension: 'VIBE', value: 'PLAYFUL', confidence: n.suggestive })
    } else {
      tags.push({ dimension: 'VIBE', value: 'CASUAL', confidence: n.none })
    }
  }

  // Gender presentation from face attributes
  if (data.faces && data.faces.length > 0) {
    const face = data.faces[0]
    if (face.attributes) {
      const female = face.attributes.female ?? 0
      const male = face.attributes.male ?? 0
      if (female > 0.7) {
        tags.push({ dimension: 'GENDER_PRESENTATION', value: 'FEMININE', confidence: female })
      } else if (male > 0.7) {
        tags.push({ dimension: 'GENDER_PRESENTATION', value: 'MASCULINE', confidence: male })
      } else {
        tags.push({ dimension: 'GENDER_PRESENTATION', value: 'ANDROGYNOUS', confidence: 1 - Math.abs(female - male) })
      }
    }
  }

  return tags
}

export async function classifyAndTagMedia(postMediaId: string, imageUrl: string): Promise<void> {
  try {
    const tags = await classifyImage(imageUrl)
    if (tags.length === 0) return

    await prisma.contentTag.createMany({
      data: tags.map(tag => ({
        postMediaId,
        dimension: tag.dimension,
        value: tag.value,
        confidence: tag.confidence,
      })),
    })
  } catch (error) {
    console.warn('Failed to classify media:', error)
  }
}
