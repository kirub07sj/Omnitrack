import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = Router();

// Store file in memory
const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit 
});

// Configure Cloudinary Client
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('☁️ Cloudinary Client Initialized');
} else {
  console.log('⚠️ Cloudinary is not configured. Falling back to base64 images.');
}

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // If Cloudinary is configured, upload there!
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      // Create a promise to handle the stream upload
      const uploadPromise = new Promise<{ secure_url: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'omnitrack_uploads' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as { secure_url: string });
          }
        );
        uploadStream.end(req.file!.buffer);
      });

      const result = await uploadPromise;
      return res.status(200).json({ url: result.secure_url });
    }

    // Fallback: Convert buffer to base64 Data URL
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
