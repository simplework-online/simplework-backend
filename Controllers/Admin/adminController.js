const User = require("../../Models/User");
const Order = require("../../Models/Order");
// const Advertisement = require("../../Models/Advertisement");

exports.getStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const stats = {
      newUsers: await User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
        role: "user",
      }),
      newSellers: await User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
        role: "seller",
      }),
      totalUsers: await User.countDocuments({ role: "user" }),
      totalSellers: await User.countDocuments({ role: "seller" }),
      totalRevenue: await Order.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      recentRevenue: await Order.aggregate([
        {
          $match: { createdAt: { $gte: thirtyDaysAgo } },
        },
        {
          $group: { _id: null, total: { $sum: "$amount" } },
        },
      ]),
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
