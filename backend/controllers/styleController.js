import User from "../models/User.js";

/**
 * @desc    Save Style Profile (skinTone, stylePreference, favoriteColors, bodyType)
 * @route   POST /api/user/style-profile
 * @access  Private
 */
export const saveStyleProfile = async (req, res) => {
  try {
    const { bodyType, skinTone, stylePreference, favoriteColors } = req.body;

    // Validation
    if (skinTone && !["warm", "cool", "neutral"].includes(skinTone)) {
      return res.status(400).json({ message: "Invalid skin tone. Must be warm, cool, or neutral." });
    }

    if (stylePreference && !Array.isArray(stylePreference)) {
      return res.status(400).json({ message: "Style preference must be an array." });
    }

    if (favoriteColors && !Array.isArray(favoriteColors)) {
      return res.status(400).json({ message: "Favorite colors must be an array." });
    }

    const userId = req.user.id;

    const updateData = {};
    if (bodyType) updateData.bodyType = bodyType;
    if (skinTone) updateData.skinTone = skinTone;
    if (stylePreference) updateData.stylePreference = stylePreference;
    if (favoriteColors) updateData.favoriteColors = favoriteColors;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Style profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in saveStyleProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
