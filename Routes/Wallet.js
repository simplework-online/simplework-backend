const express = require("express");
const {
  fetchWallet,
  connectStripe,
  connectPayPal,
} = require("../Controllers/Wallet/Wallet");
const router = express.Router();
const { auth } = require("../Middlewares/auth");
router.get("/wallet", auth, fetchWallet);
router.post("/stripe/connect", auth, connectStripe);
router.post("/paypal/connect", auth, connectPayPal);

module.exports = router;
