import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  addItem,
  getItems,
  updateItem,
  deleteItem,
} from "../controllers/wardrobeController.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", protect, upload.single("image"), addItem);
router.get("/", protect, getItems);
router.put("/:id", protect, upload.single("image"), updateItem);
router.delete("/:id", protect, deleteItem);

export default router;