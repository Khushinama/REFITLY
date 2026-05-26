import express from "express";
import protect from "../middleware/authMiddleware.js";
import { 
  saveBodyType, 
  getProfile, 
  updateProfile, 
  deleteAccount 
} from "../controllers/userController.js";
import { saveStyleProfile as saveStyleProfileNew } from "../controllers/styleController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/body-type", protect, saveBodyType);
router.post("/style-profile", protect, saveStyleProfileNew);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("image"), updateProfile);
router.delete("/", protect, deleteAccount);

export default router;