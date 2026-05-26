import mongoose from "mongoose";

const wardrobeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["top", "bottom", "dress", "layer", "footwear", "accessory"],
      required: true,
    },

    color: {
      type: String,
      required: true,
    },

    season: {
      type: String,
      enum: ["Summer", "Winter", "All"],
      default: "All",
    },

    event: {
      type: mongoose.Schema.Types.Mixed, // Supports both String and Array
      required: true,
    },
    colorFamily: {
      type: String,
      enum: ["warm", "cool", "neutral", "bright"],
      default: null,
    },
    fit: {
      type: String,
      default: null,
    },
    pattern: {
      type: String,
      default: null,
    },
    styleTags: {
      type: [String],
      default: [],
    },
    type: {
      type: String, // e.g., "jacket", "blazer", "hoodie", "shrug"
      default: null,
    },

    vibe: {
      type: String, // e.g., "casual", "professional", "elegant", "streetwear", "sporty"
      default: null,
    },

    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Optimize querying for user items
wardrobeSchema.index({ user: 1, category: 1 });

export default mongoose.model("Wardrobe", wardrobeSchema);