import sharp from 'sharp'

export interface ThumbnailResult {
  original: Buffer
  small: Buffer    // 150x150
  medium: Buffer   // 400x400
  large: Buffer    // 800x800
}

export async function processImage(input: Buffer): Promise<ThumbnailResult> {
  const original = await sharp(input).webp({ quality: 85 }).toBuffer()
  const small = await sharp(input).resize(150, 150, { fit: 'cover' }).webp({ quality: 80 }).toBuffer()
  const medium = await sharp(input).resize(400, 400, { fit: 'cover' }).webp({ quality: 80 }).toBuffer()
  const large = await sharp(input).resize(800, 800, { fit: 'cover' }).webp({ quality: 85 }).toBuffer()

  return { original, small, medium, large }
}
