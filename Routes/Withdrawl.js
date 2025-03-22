const express = require("express");
const {
  stripeWithdraw,
  paypalWithdraw,
} = require("../Controllers/Withdrawl/Withdrawl");
const router = express.Router();
const { auth } = require("../Middlewares/auth");
router.post("/withdraw/stripe", auth, stripeWithdraw);
router.post("/withdraw/paypal", auth, paypalWithdraw);

module.exports = router;
