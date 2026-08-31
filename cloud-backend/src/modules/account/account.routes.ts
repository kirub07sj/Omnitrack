import { Router } from 'express';
import { register, login, getProfile } from './account.controller';
import { validate } from '../../middleware/validate';
import { registerSchema, loginSchema } from '../../schemas/account.schema';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/profile', getProfile);

export default router;
