const express = require('express');
const router = express.Router();

const {
  getOneOrder,
  getAllOrders,
  deleteOneOrder,
  acceptOrder,
  LateOrder,
  DeliveredOrder,
  INPROGRESSorder,
  CancelledOrder,
  createOrder,
  changeOrderStatus
} = require('../Controllers/BuyerOrder/BuyerOrder');
// const authenticate = require('../middleware/authenticate'); 
const upload = require("../Middlewares/upload");



router.post("/create", createOrder);

// router.get('/:orderId', authenticate, getOneOrder);

router.post("/change-status", changeOrderStatus);


router.get('/', getAllOrders);

// router.delete('/:orderId', authenticate, deleteOneOrder);

// router.patch('/:orderId/accept', authenticate, acceptOrder);

// router.patch('/:orderId/late', authenticate, LateOrder);

// router.patch('/:orderId/delivered', authenticate, DeliveredOrder);

// router.patch('/:orderId/inprogress', authenticate, INPROGRESSorder);

// router.patch('/:orderId/cancel', authenticate, CancelledOrder);

module.exports = router;
