const Order = require("../../Models/Order");
const CreateService = require("../../Models/CreateService");
const Transaction = require("../../Models/Transaction");
const Wallet = require("../../Models/Wallet");
const cloudinary = require("cloudinary").v2;

const createOrder = async (req, res) => {
  try {
    const {
      buyerId,
      talentId,
      serviceId,
      title,
      details,
      attachments,
      category,
      subcategory,
      DeliveryTime,
      package: selectedPackage,
      TermsAndConditions,
      paymentStatus,
      paymentIntentId,
      gigImage,
    } = req.body;

    const newOrder = new Order({
      buyerId,
      talentId,
      serviceId,
      title,
      details,
      attachments,
      category,
      subcategory,
      DeliveryTime,
      package: selectedPackage,
      TermsAndContitions: TermsAndConditions,
      paymentStatus,
      paymentIntentId,
      gigImage,
    });

    if (req.files && req.files.file) {
      const filePath = req.files.file.tempFilePath;

      try {
        const result = await cloudinary.uploader.upload(filePath, {
          folder: "user_profiles",
          public_id: `profile_${buyerId}`,
          overwrite: true,
        });

        newOrder.requirementImage = result.secure_url;
        fs.unlinkSync(filePath);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
      }
    }

    await newOrder.save();

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create order. Please try again.",
    });
  }
};
const getAllOrders = async (req, res) => {
  try {
    const { userId, isSeller, isUser } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Fetch all orders with populated fields
    const orders = await Order.find()
      .populate({
        path: "buyerId",
        select: "email username profileImage",
      })
      .populate({
        path: "serviceId",
        select: "title category description user_id",
      });

    let filteredOrders = [];

    if (isSeller === "true") {
      // Seller should see orders related to their services
      filteredOrders = orders.filter(
        (order) => order.serviceId?.user_id?.toString() === userId
      );
    } else if (isUser === "true") {
      // User should see their own orders
      filteredOrders = orders.filter(
        (order) => order.buyerId?._id?.toString() === userId
      );
    } else {
      // Default: return all orders (for admin or debugging)
      filteredOrders = orders;
    }

    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: filteredOrders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders. Please try again.",
    });
  }
};

const getOneOrder = async (req, res) => {
  try {
    console.log("req.params.orderId:", req.params.orderId);
    console.log("req.payload:", req.payload);

    const order = await Order.findById({
      _id: req.params.orderId,
      buyerId: req.payload._id,
    })
      .populate("buyerId", "username email location status")
      .populate("talentId", "username email")
      .populate("serviceId", "title category");

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
//accept order
const acceptOrderAndTransferAmount = async (req, res) => {
  console.log("here");
  try {
    const order = await Order.findByIdAndUpdate(
      {
        _id: req.params.orderId,
        buyerId: req.payload._id,
      },
      { status: "Completed" },
      { new: true }
    );

    const service = await CreateService.findById(order.serviceId);

    const orderPackage = JSON.parse(order.package);
    const escrowPeriod = 7 * 24 * 60 * 60 * 1000;
    const transaction = await Transaction.findByIdAndUpdate(
      { _id: order.transactionId },
      {
        status: "Pending",
        releaseDate: new Date(Date.now() + escrowPeriod),
      },
      { new: true }
    );
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    await Wallet.findOneAndUpdate(
      { userId: service.user_id },
      { $inc: { pendingBalance: orderPackage.price } },
      { upsert: true }
    );

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const changeOrderStatus = async (req, res) => {
  const { orderId, newStatus, userId } = req.body;

  try {
    if (!orderId || !newStatus || !userId) {
      return res.status(400).json({
        success: false,
        message: "Order ID, new status, and user ID are required",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const service = await CreateService.findById(order.serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Identify the user role
    const isBuyer = order.buyerId.toString() === userId;
    const isSeller = service.user_id.toString() === userId; // Get seller from service
    console.log(isBuyer, userId);
    // Handle order cancellation
    if (newStatus === "Cancelled") {
      if (
        isBuyer &&
        (order.status === "Pending" || order.status === "Active")
      ) {
        order.status = "Cancelled";
      } else if (isSeller && order.status === "Pending") {
        order.status = "Cancelled";
      } else {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to cancel this order",
        });
      }
    } else {
      if (order.status === "Completed" || order.status === "Cancelled") {
        return res.status(400).json({
          success: false,
          message: "Cannot change status of a completed or cancelled order",
        });
      }

      order.status = newStatus;
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${order.status}`,
      data: order,
    });
  } catch (error) {
    console.error("Error changing order status:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update order status. Please try again.",
    });
  }
};

const deleteOneOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete({
      _id: req.params.orderId,
      buyerId: req.payload.userData._id,
    });
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const acceptOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      {
        _id: req.params.orderId,
        buyerId: req.payload._id,
      },
      { orderStatus: "completed" },
      { new: true }
    );
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
const LateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      {
        _id: req.params.orderId,
        buyerId: req.payload._id,
      },
      { orderStatus: "Late" },
      { new: true }
    );
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
const DeliveredOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      {
        _id: req.params.orderId,
        buyerId: req.payload._id,
      },
      { orderStatus: "Delivered" },
      { new: true }
    );
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
const INPROGRESSorder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      {
        _id: req.params.orderId,
        buyerId: req.payload._id,
      },
      { orderStatus: "INPROGRESS" },
      { new: true }
    );
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
const CancelledOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      {
        _id: req.params.orderId,
        buyerId: req.payload._id,
      },
      { orderStatus: "Cancelled" },
      { new: true }
    );
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOneOrder,
  getAllOrders,
  deleteOneOrder,
  acceptOrder,
  changeOrderStatus,
  LateOrder,
  DeliveredOrder,
  INPROGRESSorder,
  CancelledOrder,
  createOrder,
  acceptOrderAndTransferAmount,
};
