import { generateOutfits } from "../services/recommendationEngine.js";
import { getTodayRecommendationData } from "../services/recommendationService.js";
import { fetchPexelsImage } from "../services/pexelsService.js";
import User from "../models/User.js";
import Outfit from "../models/Outfit.js";

/**
 * Get an image for an accessory via Pexels
 */
export const getAccessoryImage = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ success: false, message: "Query parameter is required" });
        }
        const imageUrl = await fetchPexelsImage(query);
        res.status(200).json({ success: true, imageUrl });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

/**
 * Controller to handle recommendation requests
 */
export const getRecommendations = async (req, res) => {
    try {
        const {
            event = "casual",
            style = "",
            season = "all",
            page = 1,
            limit = 6,
            excludeItemIds = [],
            includeLayer = "auto"
        } = req.query;

        // Convert query params to correct types
        const options = {
            event: event ? event.split(',').map(e => e.trim().toLowerCase()) : ['casual'],
            style: style ? style.split(',').map(s => s.trim().toLowerCase()) : [],
            season: season.toLowerCase(),
            page: parseInt(page),
            limit: parseInt(limit),
            excludeItemIds: Array.isArray(excludeItemIds) ? excludeItemIds : (excludeItemIds ? excludeItemIds.split(',') : []),
            includeLayer
        };

        const result = await generateOutfits(req.user._id, options);

        if (result.error) {
            return res.status(400).json({
                success: false,
                error: result.error,
                message: result.message
            });
        }

        // Mark outfits as liked/saved based on user data
        const user = await User.findById(req.user._id).populate('likedOutfits savedOutfits');
        if (user && result.data?.outfits) {
            const likedIds = user.likedOutfits.filter(Boolean).map(o => o.signature || o.id || o.toString());
            const savedIds = user.savedOutfits.filter(Boolean).map(o => o.signature || o.id || o.toString());
            
            result.data.outfits = result.data.outfits.map(outfit => ({
                ...outfit,
                isLiked: likedIds.includes(outfit.id),
                isSaved: savedIds.includes(outfit.id)
            }));
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

/**
 * Placeholder for feedback feedback (for future ML upgrade)
 */
export const saveFeedback = async (req, res) => {
    try {
        const { outfitId, feedback, outfit } = req.body;
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let updatedOutfit = { ...outfit, id: outfitId };

        // 1. Create or Find the Outfit document
        let outfitDoc = await Outfit.findOne({ signature: outfitId });
        
        if (!outfitDoc && feedback !== 'dislike') {
            outfitDoc = await Outfit.create({
                ...outfit,
                signature: outfitId,
                userId: user._id
            });
        }

        if (feedback === 'like') {
            const index = user.likedOutfits.findIndex(id => id.toString() === outfitDoc._id.toString());
            if (index > -1) {
                user.likedOutfits.splice(index, 1);
                updatedOutfit.isLiked = false;
            } else {
                user.likedOutfits.push(outfitDoc._id);
                updatedOutfit.isLiked = true;
            }
        } else if (feedback === 'save') {
            const index = user.savedOutfits.findIndex(id => id.toString() === outfitDoc._id.toString());
            if (index > -1) {
                user.savedOutfits.splice(index, 1);
                updatedOutfit.isSaved = false;
            } else {
                user.savedOutfits.push(outfitDoc._id);
                updatedOutfit.isSaved = true;
            }
        } else if (feedback === 'dislike') {
            // For dislike, we don't necessarily need to create an Outfit doc if it doesn't exist,
            // but we should remove it from liked/saved if it's there.
            if (outfitDoc) {
                user.likedOutfits = user.likedOutfits.filter(id => !id.equals(outfitDoc._id));
                user.savedOutfits = user.savedOutfits.filter(id => !id.equals(outfitDoc._id));
                user.dislikedOutfits.push(outfitDoc._id);
            }
            updatedOutfit.isLiked = false;
            updatedOutfit.isSaved = false;
        }

        await user.save();
        console.log(`Successfully updated ${feedback} for user ${user.email}. Saved outfits count: ${user.savedOutfits.length}`);

        res.status(200).json({
            success: true,
            message: `Feedback ${feedback} saved successfully`,
            data: { outfit: updatedOutfit }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get all outfits saved by the user
 */
export const getSavedOutfits = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('savedOutfits');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const outfits = user.savedOutfits.map(o => ({
            ...o.toObject(),
            id: o.signature, // Map signature back to id for frontend consistency
            isSaved: true
        }));

        res.status(200).json({
            success: true,
            data: {
                outfits: outfits || []
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

/**
 * Get today's recommendation (Phase 2 AI Foundation)
 */
export const getTodayRecommendation = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const result = await getTodayRecommendationData(req.user._id);
        
        res.status(200).json({
            success: true,
            message: result.source === "cache" ? "Recommendation fetched successfully" : "Recommendation generated successfully",
            source: result.source,
            data: result.data
        });
    } catch (error) {
        if (error.message === "User profile not found") {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};
