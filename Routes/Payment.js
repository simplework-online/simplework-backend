const express = require("express");
const router = express.Router();
const {
  payWithPaypal,
  paymentSuccess,
  payWithStripe,
  updateOrderTransaction,
  connectPayPal,
  connectStripe,
  refundPayment,
  transactionCancelled,
} = require("../Controllers/PlaceOrder/Payment");
const { auth } = require("../Middlewares/auth");
router.post("/pay/paypal", auth, payWithPaypal);
router.post("/pay/stripe", auth, payWithStripe);
router.get("/success", paymentSuccess);
router.post("/transaction-success", updateOrderTransaction);
router.post("/refund", refundPayment);
router.post("/transaction-cancel", transactionCancelled);
module.exports = router;
