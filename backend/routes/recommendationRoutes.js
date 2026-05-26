import express from "express";
import { getRecommendations, saveFeedback, getSavedOutfits } from "../controllers/recommendationController.js";
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

export default router;
