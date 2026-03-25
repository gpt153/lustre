import crypto from 'node:crypto'
import { prisma } from '../trpc/context.js'

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------
const AWS_REGION = process.env.AWS_REGION || ''
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || ''
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || ''
const S3_RECORDINGS_BUCKET = process.env.S3_RECORDINGS_BUCKET || ''
const MEDIACONVERT_ENDPOINT = process.env.MEDIACONVERT_ENDPOINT || ''
const MEDIACONVERT_ROLE_ARN = process.env.MEDIACONVERT_ROLE_ARN || ''
const PALLYCON_SITE_ID = process.env.PALLYCON_SITE_ID || ''
const PALLYCON_SITE_KEY = process.env.PALLYCON_SITE_KEY || ''
const CLOUDFRONT_RECORDINGS_DOMAIN = process.env.CLOUDFRONT_RECORDINGS_DOMAIN || ''
const CLOUDFRONT_KEY_PAIR_ID = process.env.CLOUDFRONT_KEY_PAIR_ID || ''
const CLOUDFRONT_PRIVATE_KEY = process.env.CLOUDFRONT_PRIVATE_KEY || ''

// ---------------------------------------------------------------------------
// AWS Signature V4 helpers
// ---------------------------------------------------------------------------

function hmac(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest()
}

function sha256Hex(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex')
}

function getSigningKey(
  secretKey: string,
  dateStamp: string,
  region: string,
  service: string,
): Buffer {
  const kDate = hmac(`AWS4${secretKey}`, dateStamp)
  const kRegion = hmac(kDate, region)
  const kService = hmac(kRegion, service)
  return hmac(kService, 'aws4_request')
}

function utcNow(): Date {
  return new Date()
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, '')
}

function formatDateTime(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'
}

// ---------------------------------------------------------------------------
// 1. generateUploadPresignedUrl
// ---------------------------------------------------------------------------

/**
 * Creates an S3 presigned PUT URL for uploading a recording source file.
 * Expiry: 15 minutes. Implemented using AWS Signature V4 query-string signing.
 */
export async function generateUploadPresignedUrl(
  recordingId: string,
): Promise<{ uploadUrl: string; s3Key: string }> {
  const s3Key = `recordings/${recordingId}/source.mp4`
  const expiresIn = 15 * 60 // 900 seconds

  const now = utcNow()
  const dateStamp = formatDate(now)
  const amzDate = formatDateTime(now)
  const service = 's3'
  const host = `${S3_RECORDINGS_BUCKET}.s3.${AWS_REGION}.amazonaws.com`

  const credentialScope = `${dateStamp}/${AWS_REGION}/${service}/aws4_request`
  const credential = `${AWS_ACCESS_KEY_ID}/${credentialScope}`

  // Canonical query string (params must be sorted)
  const queryParams: Record<string, string> = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': credential,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': String(expiresIn),
    'X-Amz-SignedHeaders': 'host',
  }

  const sortedQueryString = Object.keys(queryParams)
    .sort()
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k]!)}`)
    .join('&')

  const canonicalUri = `/${encodeURIComponent(s3Key).replace(/%2F/g, '/')}`

  const canonicalRequest = [
    'PUT',
    canonicalUri,
    sortedQueryString,
    `host:${host}`,
    '',
    'host',
    'UNSIGNED-PAYLOAD',
  ].join('\n')

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n')

  const signingKey = getSigningKey(AWS_SECRET_ACCESS_KEY, dateStamp, AWS_REGION, service)
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign, 'utf8').digest('hex')

  const uploadUrl =
    `https://${host}${canonicalUri}?${sortedQueryString}&X-Amz-Signature=${signature}`

  return { uploadUrl, s3Key }
}

// ---------------------------------------------------------------------------
// 2. submitMediaConvertJob
// ---------------------------------------------------------------------------

interface MediaConvertJobPayload {
  Role: string
  Settings: {
    Inputs: Array<{
      FileInput: string
      AudioSelectors: Record<string, { DefaultSelection: string }>
      VideoSelector: Record<string, never>
    }>
    OutputGroups: Array<{
      Name: string
      OutputGroupSettings: {
        Type: string
        CmafGroupSettings: {
          Destination: string
          Encryption: {
            SpekeKeyProvider: {
              CertificateArn: string
              Url: string
              ResourceId: string
              SystemIds: string[]
            }
          }
        }
      }
      Outputs: Array<{
        NameModifier: string
        ContainerSettings: { Container: string }
        VideoDescription: {
          CodecSettings: {
            Codec: string
            H264Settings: { RateControlMode: string; MaxBitrate: number }
          }
        }
        AudioDescriptions: Array<{
          CodecSettings: {
            Codec: string
            AacSettings: { SampleRate: number; Bitrate: number; CodingMode: string }
          }
        }>
      }>
    }>
  }
}

/**
 * Signs and executes a request against the MediaConvert REST API.
 */
async function mediaConvertRequest(
  method: string,
  path: string,
  body: unknown,
): Promise<unknown> {
  const now = utcNow()
  const dateStamp = formatDate(now)
  const amzDate = formatDateTime(now)
  const service = 'mediaconvert'

  // Strip protocol from the endpoint to get the host
  const endpointUrl = new URL(MEDIACONVERT_ENDPOINT)
  const host = endpointUrl.host

  const bodyString = JSON.stringify(body)
  const payloadHash = sha256Hex(bodyString)

  const signedHeaders = 'content-type;host;x-amz-date'
  const canonicalHeaders =
    `content-type:application/json\nhost:${host}\nx-amz-date:${amzDate}\n`

  const canonicalRequest = [
    method.toUpperCase(),
    path,
    '', // no query string
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n')

  const credentialScope = `${dateStamp}/${AWS_REGION}/${service}/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n')

  const signingKey = getSigningKey(AWS_SECRET_ACCESS_KEY, dateStamp, AWS_REGION, service)
  const signature = crypto
    .createHmac('sha256', signingKey)
    .update(stringToSign, 'utf8')
    .digest('hex')

  const authorizationHeader =
    `AWS4-HMAC-SHA256 Credential=${AWS_ACCESS_KEY_ID}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`

  const response = await fetch(`${MEDIACONVERT_ENDPOINT}${path}`, {
    method: method.toUpperCase(),
    headers: {
      'Content-Type': 'application/json',
      Host: host,
      'X-Amz-Date': amzDate,
      Authorization: authorizationHeader,
    },
    body: bodyString,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`MediaConvert API error ${response.status}: ${text}`)
  }

  return response.json()
}

/**
 * Submits an AWS MediaConvert transcoding job with CMAF output and SPEKE DRM.
 */
export async function submitMediaConvertJob(
  recordingId: string,
  s3Key: string,
): Promise<{ jobId: string }> {
  const payload: MediaConvertJobPayload = {
    Role: MEDIACONVERT_ROLE_ARN,
    Settings: {
      Inputs: [
        {
          FileInput: `s3://${S3_RECORDINGS_BUCKET}/${s3Key}`,
          AudioSelectors: {
            'Audio Selector 1': { DefaultSelection: 'DEFAULT' },
          },
          VideoSelector: {},
        },
      ],
      OutputGroups: [
        {
          Name: 'CMAF',
          OutputGroupSettings: {
            Type: 'CMAF_GROUP_SETTINGS',
            CmafGroupSettings: {
              Destination: `s3://${S3_RECORDINGS_BUCKET}/recordings/${recordingId}/packaged/`,
              Encryption: {
                SpekeKeyProvider: {
                  CertificateArn: '',
                  Url: `https://kms.pallycon.com/v2/cpix/pallycon/getKey/${PALLYCON_SITE_ID}`,
                  ResourceId: recordingId,
                  SystemIds: [
                    '69f908af-4816-46ea-910c-cd5dcccebea0', // Widevine
                    '94ce86fb-07ff-4f43-adb8-93d2fa968ca2', // FairPlay
                  ],
                },
              },
            },
          },
          Outputs: [
            {
              NameModifier: '_video',
              ContainerSettings: { Container: 'CMAF' },
              VideoDescription: {
                CodecSettings: {
                  Codec: 'H_264',
                  H264Settings: {
                    RateControlMode: 'QVBR',
                    MaxBitrate: 5000000,
                  },
                },
              },
              AudioDescriptions: [
                {
                  CodecSettings: {
                    Codec: 'AAC',
                    AacSettings: {
                      SampleRate: 44100,
                      Bitrate: 96000,
                      CodingMode: 'CODING_MODE_2_0',
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  }

  const result = (await mediaConvertRequest('POST', '/2017-08-29/jobs', payload)) as {
    job: { id: string }
  }

  return { jobId: result.job.id }
}

// ---------------------------------------------------------------------------
// 3. generateDrmLicenseToken
// ---------------------------------------------------------------------------

/**
 * Generates a PallyCon license token using SHA-256 hash + base64 encoding.
 * This follows the PallyCon custom token format (not JWT).
 */
export async function generateDrmLicenseToken(
  userId: string,
  recordingId: string,
): Promise<string> {
  const timestamp = new Date().toISOString()

  const hashInput = PALLYCON_SITE_ID + userId + recordingId + timestamp + PALLYCON_SITE_KEY
  const hash = crypto.createHash('sha256').update(hashInput).digest('base64')

  const payload = {
    site_id: PALLYCON_SITE_ID,
    user_id: userId,
    content_id: recordingId,
    timestamp,
    hash,
  }

  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

// ---------------------------------------------------------------------------
// 4. generateStreamingUrl
// ---------------------------------------------------------------------------

/**
 * Creates a CloudFront signed URL for DASH playback with 24-hour expiry.
 * Uses RSA-SHA1 signing as required by CloudFront signed URL specification.
 */
export async function generateStreamingUrl(recordingId: string): Promise<string> {
  const resourceUrl = `https://${CLOUDFRONT_RECORDINGS_DOMAIN}/recordings/${recordingId}/packaged/stream.mpd`
  const expiresAt = Math.floor(Date.now() / 1000) + 24 * 60 * 60 // 24 hours from now

  // CloudFront canned policy
  const policy = JSON.stringify({
    Statement: [
      {
        Resource: resourceUrl,
        Condition: {
          DateLessThan: {
            'AWS:EpochTime': expiresAt,
          },
        },
      },
    ],
  })

  const policyBase64 = Buffer.from(policy)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/=/g, '_')
    .replace(/\//g, '~')

  // Sign with RSA-SHA1 (CloudFront requirement)
  const signer = crypto.createSign('RSA-SHA1')
  signer.update(policy)
  const signature = signer
    .sign(CLOUDFRONT_PRIVATE_KEY)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/=/g, '_')
    .replace(/\//g, '~')

  const signedUrl =
    `${resourceUrl}` +
    `?Expires=${expiresAt}` +
    `&Signature=${signature}` +
    `&Key-Pair-Id=${CLOUDFRONT_KEY_PAIR_ID}` +
    `&Policy=${policyBase64}`

  return signedUrl
}

// ---------------------------------------------------------------------------
// 5. handleMediaConvertComplete
// ---------------------------------------------------------------------------

/**
 * Called from the MediaConvert completion webhook.
 * Generates a CloudFront signed streaming URL and marks the Recording as READY.
 */
export async function handleMediaConvertComplete(
  recordingId: string,
  _outputKey: string,
): Promise<void> {
  const streamingUrl = await generateStreamingUrl(recordingId)

  await prisma.recording.update({
    where: { id: recordingId },
    data: {
      status: 'READY',
      drmUrl: streamingUrl,
    },
  })
}
