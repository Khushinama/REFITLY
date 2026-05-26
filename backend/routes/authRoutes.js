import express from "express";
import {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logoutUser,
} from "../controllers/authController.js";

const router = express.Router();

// register
router.post("/register", registerUser);

// login
router.post("/login", loginUser);

// email verify
router.get("/verify/:token", verifyEmail);

// forgot password
router.post("/forgot-password", forgotPassword);

// reset password
router.put("/reset-password/:token", resetPassword);

//LOGOUT
router.post("/logout",logoutUser);

export default router;