import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { loginSchema, signupSchema, socialLoginSchema } from '../validators/auth.validator';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);
router.post('/signup', validate(signupSchema), AuthController.signup);
router.post('/social-login', validate(socialLoginSchema), AuthController.socialLogin);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
router.get('/me', authenticate, AuthController.me);
router.get('/users', authenticate, AuthController.getUsers);

export default router;
