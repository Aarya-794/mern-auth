import express from 'express';
import { getUserData } from '../controllers/userController.js';
import userAuth from '../middleware/userAuth.js'; // ✅ Middleware to check token

const userRouter = express.Router();

// ✅ Protected route - only accessible when logged in
userRouter.get('/data', userAuth, getUserData);

export default userRouter;
