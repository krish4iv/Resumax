import express from "express";
import authController from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.get('/me', authController.getMe)
authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.put('/profile', authController.updateProfile)
authRouter.put('/onboarding', authController.completeOnboarding)


export default authRouter;