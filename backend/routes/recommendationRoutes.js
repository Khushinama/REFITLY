import express from "express";
import { getRecommendations, saveFeedback, getSavedOutfits, getTodayRecommendation, getAccessoryImage } from "../controllers/recommendationController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   GET /api/recommendations/outfits
 * @desc    Get personalized outfit recommendations
 * @access  Private
 */
router.get("/outfits", protect, getRecommendations);

/**
 * @route   POST /api/recommendations/feedback
 * @desc    Submit feedback on an outfit recommendation
 * @access  Private
 */
router.post("/feedback", protect, saveFeedback);

/**
 * @route   GET /api/recommendations/saved
 * @desc    Get user's saved outfits
 * @access  Private
 */
router.get("/saved", protect, getSavedOutfits);

/**
 * @route   GET /api/recommendations/today
 * @desc    Get today's AI powered outfit recommendation
 * @access  Private
 */
router.get("/today", protect, getTodayRecommendation);

/**
 * @route   GET /api/recommendations/image
 * @desc    Get an image for an accessory
 * @access  Private
 */
router.get("/image", protect, getAccessoryImage);

export default router;
