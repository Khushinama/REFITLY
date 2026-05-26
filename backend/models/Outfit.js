import mongoose from "mongoose";

const outfitSchema = new mongoose.Schema(
  {
    items: {
      top: { type: Object, default: null },
      bottom: { type: Object, default: null },
      dress: { type: Object, default: null },
      layer: { type: Object, default: null },
      shoes: { type: Object, default: null },
    },
    score: { type: Number, default: 0 },
    matchBreakdown: {
      color: Number,
      body: Number,
      event: Number,
      style: Number,
    },
    reasons: [String],
    colorPalette: [String],
    signature: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Outfit", outfitSchema);
