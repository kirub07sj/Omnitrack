import { Router } from 'express';
import multer from 'multer';

const router = Router();

// Store file in memory
const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit 
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // If Cloudinary is configured, upload there!
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_UPLOAD_PRESET) {
      const base64Image = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;
      const dataUri = `data:${mimeType};base64,${base64Image}`;
      
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME.trim();
      const preset = process.env.CLOUDINARY_UPLOAD_PRESET.trim();
      
      const formData = new FormData();
      formData.append('file', dataUri);
      formData.append('upload_preset', preset);

      try {
        const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });

        const result = await cloudinaryRes.json();

        if (!cloudinaryRes.ok) {
          console.error('Cloudinary API Error:', result);
          return res.status(500).json({ message: 'Cloudinary API Error', error: result });
        }

        return res.status(200).json({ url: result.secure_url });
      } catch (fetchError: any) {
        console.error('Network Error to Cloudinary:', fetchError);
        return res.status(500).json({ message: 'Failed to connect to Cloudinary', error: fetchError.message || String(fetchError) });
      }
    }

    // Fallback: Convert buffer to base64 Data URL
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const fileUrl = `data:${mimeType};base64,${base64Image}`;
    
    res.status(200).json({ url: fileUrl });
  } catch (error: any) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Failed to process upload', error: error.message || String(error) });
  }
});

export default router;
