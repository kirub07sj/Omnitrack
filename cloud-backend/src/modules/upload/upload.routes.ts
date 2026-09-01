import { Router } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';

const router = Router();

// Store file in memory
const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit 
});

// Configure Cloudflare R2 Client
let s3Client: S3Client | null = null;
if (process.env.CLOUDFLARE_R2_ACCOUNT_ID && process.env.CLOUDFLARE_R2_ACCESS_KEY_ID && process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    }
  });
  console.log('☁️ Cloudflare R2 Client Initialized');
}

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // If Cloudflare R2 is configured, upload there!
    if (s3Client && process.env.CLOUDFLARE_R2_BUCKET_NAME && process.env.CLOUDFLARE_R2_PUBLIC_URL) {
      const ext = path.extname(req.file.originalname) || '.png';
      const fileName = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;

      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: fileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      }));

      // Return the public URL
      let baseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
      if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
      
      return res.status(200).json({ url: `${baseUrl}/${fileName}` });
    }

    // Fallback: Convert buffer to base64 Data URL (Good for local dev or if R2 not configured)
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const fileUrl = `data:${mimeType};base64,${base64Image}`;
    
    res.status(200).json({ url: fileUrl });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

export default router;
