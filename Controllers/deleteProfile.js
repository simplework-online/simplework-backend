const User = require("../Models/User"); // Assuming you have a User model

const deleteProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user by ID and update deleteStatus to true
    const user = await User.findByIdAndUpdate(
      userId,
      { deleteStatus: true, onlineStatus: false, deletedAt: new Date() },

      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Profile soft deleted successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = deleteProfile;
