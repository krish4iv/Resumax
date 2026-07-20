import express from "express";
import authController from "../controllers/auth.controller.js";
// In auth.routes.js
import authMiddleware from '../middleware/auth.middleware.js'
const authRouter = express.Router();

authRouter.get('/me', authMiddleware, authController.getMe)

authRouter.post('/register', authController.register);


authRouter.post('/login', authController.login);

authRouter.put('/profile', authMiddleware, authController.updateProfile)

authRouter.put('/onboarding', authMiddleware, authController.completeOnboarding)


export default authRouter;