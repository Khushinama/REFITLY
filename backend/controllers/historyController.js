import OutfitHistory from "../models/OutfitHistory.js";
import Outfit from "../models/Outfit.js";
import User from "../models/User.js";
import { generateHistoryNotes } from "../utils/helpers/generateHistoryNotes.js";
import { generateOutfitReasons } from "../utils/helpers/generateOutfitReasons.js";

/**
 * @desc    Mark an outfit as worn today
 * @route   POST /api/history/wear
 * @access  Private
 */
export const addOutfitHistory = async (req, res) => {
    try {
        const { outfitId, outfit, event, notes, style, mood, season, reasons } = req.body;

        if (!outfitId) {
            return res.status(400).json({
                success: false,
                message: "outfitId (signature) is required"
            });
        }

        // 1. Get or create the Outfit document
        let outfitDoc = await Outfit.findOne({ signature: outfitId });
        if (!outfitDoc) {
            if (!outfit) {
                return res.status(400).json({
                    success: false,
                    message: "Outfit details are required to create outfit reference"
                });
            }
            outfitDoc = await Outfit.create({
                ...outfit,
                signature: outfitId,
                userId: req.user._id
            });
        } else if (outfit && outfit.accessories && outfit.accessories.length > 0) {
            // Update existing outfit doc with new accessories/suggestions if provided
            let isUpdated = false;
            if (!outfitDoc.accessories || outfitDoc.accessories.length === 0 || outfit.accessories.length > 0) {
                outfitDoc.accessories = outfit.accessories;
                isUpdated = true;
            }
            if (outfit.enhancementSuggestions) {
                outfitDoc.enhancementSuggestions = outfit.enhancementSuggestions;
                isUpdated = true;
            }
            if (isUpdated) {
                await outfitDoc.save();
            }
        }

        // 2. Normalize today's date to UTC midnight
        const today = new Date();
        const wornDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

        // 3. Create the history entry
        try {
            const finalEvent = event || "casual";
            const finalStyle = style || "minimal";
            const finalMood = mood || "Casual Comfort";
            const finalSeason = season || "all";
            const finalNotes = notes || generateHistoryNotes(outfitDoc, {
                event: finalEvent,
                style: finalStyle,
                mood: finalMood,
                season: finalSeason
            });

            let finalReasons = reasons;
            if (!finalReasons || !finalReasons.length) {
                finalReasons = generateOutfitReasons({
                    outfit: {
                        items: {
                            top: outfitDoc.items?.top || null,
                            bottom: outfitDoc.items?.bottom || null,
                            dress: outfitDoc.items?.dress || null,
                            layer: outfitDoc.items?.layer || null,
                            shoes: outfitDoc.items?.shoes || null
                        },
                        mood: { dominantMood: finalMood },
                        score: outfitDoc.score || 100,
                        colorPalette: outfitDoc.colorPalette || []
                    },
                    selectedEvent: finalEvent,
                    selectedStyle: finalStyle,
                    selectedSeason: finalSeason,
                    selectedGender: req.user.gender
                });
            }

            const historyEntry = await OutfitHistory.create({
                user: req.user._id,
                outfitId: outfitDoc._id,
                wornDate,
                event: finalEvent,
                style: finalStyle,
                mood: finalMood,
                season: finalSeason,
                notes: finalNotes,
                reasons: finalReasons
            });

            // Populate outfitId to return complete outfit details
            const populatedEntry = await OutfitHistory.findById(historyEntry._id).populate("outfitId");
            const outfitObj = populatedEntry.outfitId.toObject();

            res.status(201).json({
                success: true,
                message: "Outfit marked as worn today",
                data: {
                    ...populatedEntry.toObject(),
                    outfit: {
                        ...outfitObj,
                        id: outfitObj.signature
                    }
                }
            });
        } catch (error) {
            // Check for MongoDB unique key duplicate error code
            if (error.code === 11000) {
                return res.status(200).json({
                    success: true,
                    message: "Already added today",
                    alreadyWorn: true
                });
            }
            throw error;
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

/**
 * @desc    Get user's outfit history
 * @route   GET /api/history
 * @access  Private
 */
export const getOutfitHistory = async (req, res) => {
    try {
        const history = await OutfitHistory.find({ user: req.user._id })
            .sort({ wornDate: -1 })
            .populate("outfitId");

        const formattedHistory = history.map(item => {
            if (!item.outfitId) return item.toObject();
            const outfitObj = item.outfitId.toObject();
            return {
                ...item.toObject(),
                outfit: {
                    ...outfitObj,
                    id: outfitObj.signature
                }
            };
        });

        res.status(200).json({
            success: true,
            data: formattedHistory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

/**
 * @desc    Get outfit history by specific date (YYYY-MM-DD)
 * @route   GET /api/history/:date
 * @access  Private
 */
export const getOutfitHistoryByDate = async (req, res) => {
    try {
        const { date } = req.params;
        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Date parameter is required"
            });
        }

        // Parse YYYY-MM-DD date and set range for full day in UTC
        const startDate = new Date(date + "T00:00:00.000Z");
        const endDate = new Date(date + "T23:59:59.999Z");

        if (isNaN(startDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format. Use YYYY-MM-DD"
            });
        }

        const history = await OutfitHistory.find({
            user: req.user._id,
            wornDate: { $gte: startDate, $lte: endDate }
        }).populate("outfitId");

        const formattedHistory = history.map(item => {
            if (!item.outfitId) return item.toObject();
            const outfitObj = item.outfitId.toObject();
            return {
                ...item.toObject(),
                outfit: {
                    ...outfitObj,
                    id: outfitObj.signature
                }
            };
        });

        res.status(200).json({
            success: true,
            data: formattedHistory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

/**
 * @desc    Get outfit history grouped by date for a specific month and year
 * @route   GET /api/history/calendar
 * @access  Private
 */
export const getOutfitHistoryCalendar = async (req, res) => {
    try {
        const { month, year } = req.query;
        
        const now = new Date();
        const queryMonth = month ? parseInt(month, 10) : now.getMonth() + 1; // 1-indexed
        const queryYear = year ? parseInt(year, 10) : now.getFullYear();

        if (isNaN(queryMonth) || queryMonth < 1 || queryMonth > 12 || isNaN(queryYear)) {
            return res.status(400).json({
                success: false,
                message: "Invalid month or year parameters"
            });
        }

        // Start and end dates of the month in UTC
        const startOfMonth = new Date(Date.UTC(queryYear, queryMonth - 1, 1, 0, 0, 0, 0));
        const endOfMonth = new Date(Date.UTC(queryYear, queryMonth, 0, 23, 59, 59, 999));

        const history = await OutfitHistory.find({
            user: req.user._id,
            wornDate: { $gte: startOfMonth, $lte: endOfMonth }
        }).sort({ wornDate: 1 }).populate("outfitId");

        const grouped = {};
        history.forEach(item => {
            if (!item.wornDate) return;
            const dateKey = item.wornDate.toISOString().split('T')[0];
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            
            if (item.outfitId) {
                const outfitObj = item.outfitId.toObject();
                grouped[dateKey].push({
                    ...item.toObject(),
                    outfit: {
                        ...outfitObj,
                        id: outfitObj.signature
                    }
                });
            } else {
                grouped[dateKey].push(item.toObject());
            }
        });

        res.status(200).json({
            success: true,
            data: grouped
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

/**
 * @desc    Delete outfit history entry
 * @route   DELETE /api/history/:id
 * @access  Private
 */
export const deleteOutfitHistory = async (req, res) => {
    try {
        const historyEntry = await OutfitHistory.findById(req.params.id);
        if (!historyEntry) {
            return res.status(404).json({ success: false, message: 'History entry not found' });
        }
        if (historyEntry.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        await historyEntry.deleteOne();
        res.status(200).json({ success: true, message: 'History entry removed' });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};
