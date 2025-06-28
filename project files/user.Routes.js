import { Router } from "express";
const router = Router();

import {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  updateUser
} from "../controllers/user.controller.js";

import { isLoggedIn } from "../middlewares/auth.middlewares.js";

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Logout
router.post("/logout", logout);

// Profile
router.get("/me", isLoggedIn, getProfile);

// Reset password
router.post("/reset", forgotPassword);
router.post("/reset/:resetToken", resetPassword);

// Change password
router.post("/change-password", isLoggedIn, changePassword);

// Update user (without avatar)
router.put("/update", isLoggedIn, updateUser);

export default router;
