import User from "../models/User.js";

export const getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // future ready structure
    const dashboardData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bodyType: user.bodyType,
        profileImage: user.profileImage,
      },

      stats: {
        totalOutfits: 0,     // future
        wardrobeItems: 0,    // future
        reuseCount: 0,       // future
      },

      recentActivity: [], // future
    };

    res.status(200).json(dashboardData);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};