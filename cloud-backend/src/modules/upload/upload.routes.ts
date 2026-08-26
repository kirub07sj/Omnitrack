import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const isVercel = !!process.env.VERCEL;
const baseUploadDir = isVercel
  ? '/tmp/uploads'
  : (process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'));
const uploadDir = path.join(baseUploadDir, 'products');

try {
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
} catch (e) {
  console.warn('Could not create upload directory:', uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const fileUrl = `/uploads/products/${req.file.filename}`;
  res.status(200).json({ url: fileUrl });
});
export default router;
