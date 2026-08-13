import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Ensure upload directory exists relative to process.cwd() (backend root)
const baseUploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const uploadDir = path.join(baseUploadDir, 'products');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
     res.status(400).json({ message: 'No file uploaded' });
     return;
  }
  
  // Return the public URL path
  const fileUrl = `/uploads/products/${req.file.filename}`;
  res.status(200).json({ url: fileUrl });
});

export default router;
