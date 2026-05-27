import express from "express";
import {
  registerUser,
  loginUser,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  logoutUser,
} from "../controllers/authController.js";

const router = express.Router();

// register
router.post("/register", registerUser);

// login
router.post("/login", loginUser);

// verify otp
router.post("/verify-otp", verifyOtp);

// resend otp
router.post("/resend-otp", resendOtp);

// forgot password
router.post("/forgot-password", forgotPassword);

// reset password
router.put("/reset-password/:token", resetPassword);

//LOGOUT
router.post("/logout",logoutUser);

export default router;