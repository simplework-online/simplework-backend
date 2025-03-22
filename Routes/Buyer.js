const express = require("express");
const {
  getOneOrder,
  getAllOrders,
  deleteOneOrder,
  acceptOrder,
  LateOrder,
  DeliveredOrder,
  INPROGRESSorder,
  CancelledOrder,
  acceptOrderAndTransferAmount,
} = require("../Controllers/BuyerOrder/BuyerOrder");
const { payment } = require("../Controllers/PlaceOrder/Payment");
const { placeOrder, intent } = require("../Controllers/PlaceOrder/PlaceOrder");
const { auth } = require("../Middlewares/auth");
const router = express.Router();
router.post("/place-order/payment", auth, payment);
router.post("/place-order", auth, placeOrder);
router.post("/get-client-secret", auth, intent);
router.get("/get-one-order/:orderId", auth, getOneOrder);
router.get("/get-all-orders", auth, getAllOrders);
router.delete("/delete-one-order/:orderId", auth, deleteOneOrder);
router.patch("/accept-order/:orderId", auth, acceptOrderAndTransferAmount);
router.patch("/late-order/:orderId", auth, LateOrder);
router.patch("/delivered-order/:orderId", auth, DeliveredOrder);
router.patch("/inprogress-order/:orderId", auth, INPROGRESSorder);
router.patch("/cancelled-order/:orderId", auth, CancelledOrder);

module.exports = router;
