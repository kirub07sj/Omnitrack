import { Router } from 'express';
import { register, login, getProfile } from './account.controller';
import { validate } from '../../middleware/validate';
import { registerSchema, loginSchema } from '../../schemas/account.schema';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', (req, res) => {
  res.clearCookie('token', { sameSite: process.env.NODE_ENV === 'production' || process.env.VERCEL ? 'none' : 'lax', secure: process.env.VERCEL ? true : false });
  res.json({ success: true, message: 'Logged out successfully' });
});
router.get('/profile', getProfile);

export default router;
