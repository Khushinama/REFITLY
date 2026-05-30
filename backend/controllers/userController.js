import User from "../models/User.js";
import Wardrobe from "../models/Wardrobe.js";
import DailyRecommendation from "../models/DailyRecommendation.js";
import cloudinary from "../config/cloudinary.js";

// Helper function to extract public_id from cloudinary URL
const getPublicId = (url) => {
  if (!url) return null;
  // Format: https://res.cloudinary.com/cloud_name/image/upload/v12345/folder/subfolder/public_id.jpg
  // We want: folder/subfolder/public_id
  try {
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;
    
    // Everything after v.../ and before the extension
    const afterUpload = parts.slice(uploadIndex + 2).join("/"); // skip "upload" and "v1234..."
    return afterUpload.split(".")[0];
  } catch (error) {
    console.error("Error extracting public_id:", error);
    return null;
  }
};

// @desc Get user profile
// @route GET /api/user/profile
// @access Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update user profile
// @route PUT /api/user/profile
// @access Private
export const updateProfile = async (req, res) => {
  try {
    // console.log("Profile Update Request Body:", req.body);
    // console.log("Profile Update File:", req.file ? req.file.originalname : "No file");

    const { name, gender, preferences, removeImage } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update basic fields
    if (name) user.name = name;
    if (gender) user.gender = gender;
    if (preferences) {
      user.preferences = typeof preferences === 'string' ? JSON.parse(preferences) : preferences;
    }

    // HANDLE PHOTO REMOVAL OR REPLACEMENT
    const shouldRemove = removeImage === 'true' || removeImage === true;
    const hasNewFile = !!req.file;

    if (shouldRemove || hasNewFile) {
      // If there's an existing image, destroy it in Cloudinary
      if (user.profileImage) {
        const publicId = getPublicId(user.profileImage);
        if (publicId) {
          // console.log("Destroying old profile image from Cloudinary:", publicId);
          await cloudinary.uploader.destroy(publicId);
        }
      }
      
      if (shouldRemove && !hasNewFile) {
        user.profileImage = null;
        // console.log("Profile image cleared in DB");
      }
    }

    // Handle new profile image upload
    if (hasNewFile) {
      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "refitly/profiles",
              transformation: [{ width: 500, height: 500, crop: "fill", quality: "auto", fetch_format: "auto" }],
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });
      };

      const cloudinaryResult = await uploadToCloudinary();
      user.profileImage = cloudinaryResult.secure_url;
      // console.log("New profile image uploaded:", user.profileImage);
    }

    const updatedUser = await user.save();

    // Invalidate cache if style preferences were updated
    if (preferences) {
      await DailyRecommendation.deleteMany({ userId: updatedUser._id });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        gender: updatedUser.gender,
        preferences: updatedUser.preferences,
        profileImage: updatedUser.profileImage,
        bodyType: updatedUser.bodyType,
      },
    });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete user account
// @route DELETE /api/user
// @access Private
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Delete associated wardrobe items
    await Wardrobe.deleteMany({ user: userId });

    // Clean up user image if exists
    if (user && user.profileImage) {
      const publicId = getPublicId(user.profileImage);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const saveBodyType = async (req, res) => {
  try {
    const { answers } = req.body;

    const score = {
      Rectangle: 0,
      Pear: 0,
      Hourglass: 0,
      "Inverted Triangle": 0,
    };

    answers.forEach((ans) => {
      if (ans === "A") score.Rectangle++;
      if (ans === "B") score.Pear++;
      if (ans === "C") score.Hourglass++;
      if (ans === "D") score["Inverted Triangle"]++;
    });

    const bodyType = Object.keys(score).reduce((a, b) =>
      score[a] > score[b] ? a : b
    );

    const user = await User.findById(req.user._id);
    user.bodyType = bodyType;
    await user.save();

    // Invalidate cached recommendations since body type changed
    await DailyRecommendation.deleteMany({ userId: user._id });

    res.status(200).json({
      message: "Body type saved successfully",
      bodyType,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};