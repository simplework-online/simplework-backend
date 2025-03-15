const express = require("express");
const router = express.Router();
const adminController = require("../Controllers/Admin/adminController");

// router.get("/stats", adminController.getStats);
router.get("/users", adminController.getUsers);
router.delete("/users/:userId", adminController.deleteUser);
// router.get("/revenue", adminController.getRevenue);
// router.get("/popular-ads", adminController.getPopularAds);

module.exports = router;
