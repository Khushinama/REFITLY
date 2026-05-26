import express from "express";
import { addOutfitHistory, getOutfitHistory, getOutfitHistoryByDate, getOutfitHistoryCalendar } from "../controllers/historyController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/wear", protect, addOutfitHistory);
router.get("/", protect, getOutfitHistory);
router.get("/calendar", protect, getOutfitHistoryCalendar);
router.get("/:date", protect, getOutfitHistoryByDate);

export default router;
