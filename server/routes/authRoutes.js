import express from "express";
import {
  register,
  login,
  logout,
  isAuthenticated,
  sendVerifyOtp,
  verifyEmail,
  sendResetOtp,
  resetPassword,
} from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";

const authRouter = express.Router();

// Register a new user
authRouter.post("/register", register);

// User login
authRouter.post("/login", login);

// User logout
authRouter.post("/logout", logout);

// Check if user is authenticated
authRouter.get("/is-auth", userAuth, isAuthenticated);

// Send OTP for email verification (requires login)
authRouter.post("/send-verify-otp", userAuth, sendVerifyOtp);

// Verify email using OTP (requires login)
authRouter.post("/verify-account", userAuth, verifyEmail);

// Send OTP for password reset
authRouter.post("/send-reset-otp", sendResetOtp);

// Reset password using OTP
authRouter.post("/reset-password", resetPassword);

export default authRouter;

