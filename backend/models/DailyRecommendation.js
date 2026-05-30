import mongoose from "mongoose";

const dailyRecommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recommendation: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      top: { type: String, required: true },
      bottom: { type: String, required: true },
      footwear: { type: String, required: true },
      accessories: { type: [String], default: [] },
      whyItWorks: { type: [String], default: [] },
      images: {
        top: { type: String, default: null },
        bottom: { type: String, default: null },
        footwear: { type: String, default: null },
        accessories: { type: Map, of: String, default: {} },
      }
    },
    generatedForDate: {
      type: Date,
      required: true,
    },
    bodyType: {
      type: String,
      default: null,
    },
    stylePreferences: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Indexes for fast lookup
dailyRecommendationSchema.index({ userId: 1, generatedForDate: 1 });

export default mongoose.model("DailyRecommendation", dailyRecommendationSchema);
