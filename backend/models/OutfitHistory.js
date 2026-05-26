import mongoose from "mongoose";

const outfitHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    outfitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outfit",
      required: true,
    },
    wornDate: {
      type: Date,
      required: true,
      index: true,
    },
    event: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    style: {
      type: String,
      default: "",
    },
    mood: {
      type: String,
      default: "",
    },
    season: {
      type: String,
      default: "",
    },
    reasons: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Compound unique index on user, outfitId, and wornDate to enforce one entry per outfit per day per user.
outfitHistorySchema.index({ user: 1, outfitId: 1, wornDate: 1 }, { unique: true });

export default mongoose.model("OutfitHistory", outfitHistorySchema);
