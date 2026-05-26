import Wardrobe from "../models/Wardrobe.js";
import cloudinary from "../config/cloudinary.js";
import { extractColorData } from "../utils/colorExtractor.js";
import { normalizeWardrobeItem } from "../utils/normalizeWardrobeItem.js";

export const getItems = async (req, res) => {
  try {
    const items = await Wardrobe.find({ user: req.user._id });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addItem = async (req, res) => {
  try {
    const { name, category, color, season, event, detectedColorHex } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    // 1. Start Cloudinary Upload (Async)
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "refitly/wardrobe",
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
    };

    // 2. Parallel Processing: Upload + Metadata Extraction
    const [cloudinaryResult, finalDetected] = await Promise.all([
      uploadToCloudinary(),
      (async () => {
        if (!detectedColorHex && color === 'Auto-Detect') {
          // Backend detection using memory buffer (Parallel with upload)
          return await extractColorData(req.file.buffer);
        } else if (detectedColorHex) {
          // Use frontend provided HEX to get name/family
          const { getClosestColor } = await import("../utils/colorExtractor.js"); 
          const closest = getClosestColor(detectedColorHex);
          return { name: closest.name, family: closest.family };
        }
        return null;
      })()
    ]);
    
    // Normalize Data
    const normalizedData = normalizeWardrobeItem({
      name,
      category,
      color: (color && color !== 'Auto-Detect') ? color : (finalDetected ? finalDetected.name : color),
      colorFamily: finalDetected ? finalDetected.family : 'neutral',
      season,
      event,
      fit: req.body.fit || null,
      pattern: req.body.pattern || null,
      styleTags: req.body.styleTags || []
    });

    const item = await Wardrobe.create({
      user: req.user._id,
      ...normalizedData,
      image: cloudinaryResult.secure_url,
    });

    res.status(201).json({
      message: "Item added successfully",
      item,
      detectedColor: finalDetected ? finalDetected.name : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const updateItem = async (req, res) => {
  try {
    const { name, category, color, season, event, fit, pattern, styleTags } = req.body;
    let item = await Wardrobe.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    let imageUrl = item.image;
    let detectedColorData = null;

    // If new image is uploaded
    if (req.file) {
      // Parallel Upload and Analysis
      const [cloudinaryResult, detectedData] = await Promise.all([
        uploadToCloudinary(),
        extractColorData(req.file.buffer)
      ]);
      
      imageUrl = cloudinaryResult.secure_url;
      detectedColorData = detectedData;
    }

    // Normalize updated fields
    const normalizedUpdate = normalizeWardrobeItem({
      name: name || item.name,
      category: category || item.category,
      color: (color && color !== 'Auto-Detect') ? color : (detectedColorData ? detectedColorData.name : item.color),
      colorFamily: detectedColorData ? detectedColorData.family : item.colorFamily,
      season: season || item.season,
      event: event || item.event,
      fit: fit || item.fit,
      pattern: pattern || item.pattern,
      styleTags: styleTags !== undefined ? styleTags : item.styleTags,
    });

    const updateData = {
      ...normalizedUpdate,
      image: imageUrl,
    };

    const updatedItem = await Wardrobe.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      message: "Item updated successfully",
      item: updatedItem,
      detectedColor: detectedColorData ? detectedColorData.name : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteItem = async (req, res) => {
  try {
    const item = await Wardrobe.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await item.deleteOne();

    res.status(200).json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};