import { v2 as cloudinary } from 'cloudinary'
import { config } from '../config/index.js'

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
})

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string,
  publicId?: string,
  resourceType: 'image' | 'raw' | 'video' | 'auto' = 'auto',
): Promise<{ url: string; publicId: string; resourceType: string }> {
  return await new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: resourceType },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'))
          return
        }
        resolve({ url: result.secure_url, publicId: result.public_id, resourceType: result.resource_type })
      },
    )
    upload.end(buffer)
  })
}

export async function deleteCloudinaryAsset(publicId: string, resourceType: 'image' | 'raw' | 'video' = 'image') {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
}
