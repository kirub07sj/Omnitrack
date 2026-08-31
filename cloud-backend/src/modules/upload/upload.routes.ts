import { Router } from 'express';
import multer from 'multer';

const router = Router();

// Store file in memory to convert to Base64 (Perfect for Vercel Serverless where /tmp is ephemeral)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit 
});

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  
  // Convert buffer to base64 Data URL
  const base64Image = req.file.buffer.toString('base64');
  const mimeType = req.file.mimetype;
  const fileUrl = `data:${mimeType};base64,${base64Image}`;
  
  res.status(200).json({ url: fileUrl });
});

export default router;