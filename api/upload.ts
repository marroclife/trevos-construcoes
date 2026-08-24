import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

interface UploadBody {
  image: string;
  folder?: string;
  filename?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image, folder = 'frio-costa-verde/products', filename } = req.body as UploadBody;

  if (!image || typeof image !== 'string') {
    return res.status(400).json({ error: 'Missing image field' });
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return res.status(503).json({ error: 'Cloudinary not configured' });
  }

  try {
    const publicId = filename
      ? `fcv_${filename.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60)}_${Date.now()}`
      : `fcv_product_${Date.now()}`;

    const result = await cloudinary.uploader.upload(image, {
      folder,
      public_id: publicId,
      overwrite: true,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 900, crop: 'limit' },
        { quality: 'auto:good', fetch_format: 'auto' },
      ],
    });

    return res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ error: 'Image upload failed' });
  }
}
