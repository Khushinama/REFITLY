import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name:{type: String, required:true},
    email: { type: String, unique: true },
    password: String,
    isVerified: { type: Boolean, default: false },
    verificationOtp: String,
    verificationOtpExpiresAt: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    bodyType: {type: String,
      enum: ["Rectangle", "Pear", "Hourglass", "Inverted Triangle"],
      default: null,
    },
    profileImage: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Non-binary", "Other", "Prefer not to say"],
      default: "Prefer not to say",
    },
    preferences: {
      type: [String],
      default: [],
    },
    skinTone: {
      type: String,
      enum: ["warm", "cool", "neutral"],
      default: null,
    },
    stylePreference: {
      type: [String],
      default: [],
    },
    favoriteColors: {
      type: [String],
      default: [],
    },
    likedOutfits: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outfit'
    }],
    dislikedOutfits: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outfit'
    }],
    savedOutfits: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outfit'
    }],
    onboardingCompleted: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);