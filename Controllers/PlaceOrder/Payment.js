const Joi = require("joi");
const Payment = require("../../Models/Payment");
const Service = require("../../Models/CreateService");
const Transaction = require("../../Models/Transaction");
const Stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const paypal = require("../../Utils/paypal.config");
const Order = require("../../Models/Order");
const axios = require("axios");
const Wallet = require("../../Models/Wallet");

const payment = async (req, res) => {
  const value = Joi.object({
    cardNumber: Joi.string().required(),
    cardHolderName: Joi.string().required(),
    cardExpiryDate: Joi.string().required(),

    cardCVV: Joi.string().required(),
    paymentMethod: Joi.string().required(),
    paymentAmount: Joi.number().required(),
  }).validate(req.body);
  if (value.error) {
    return res.status(400).send(value.error.details[0].message);
  }
  const {
    cardNumber,
    cardHolderName,
    cardExpiryDate,
    cardCVV,
    paymentMethod,
    paymentAmount,
  } = req.body;
  const payment = new Payment({
    userId: req.payload._id,
    cardNumber,
    cardHolderName,
    cardExpiryDate,
    cardCVV,
    paymentMethod,
    paymentAmount,
  });
  try {
    const result = await payment.save();
    res
      .status(200)
      .json({ message: "Payment Successfuliy save", data: result });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", err });
  }
};

const payWithPaypal = async (req, res) => {
  try {
    const { buyerId, serviceId, price, orderId } = req.body;

    // Fetch the package using async/await
    const serviceData = await Service.findById(serviceId);
    if (!serviceData) {
      return res.status(404).json({ error: "Package not found" });
    }
    const transaction = new Transaction({
      buyerId,
      sellerId: serviceData.user_id,
      serviceId,
      amount: price,
      paymentMethod: "PayPal",
      status: "Escrow",
    });
    await transaction.save();
    const createPaymentJson = {
      intent: "sale",
      payer: { payment_method: "paypal" },
      redirect_urls: {
        return_url: `${process.env.BASE_URL}${process.env.FRONTEND_PORT}/success?orderId=${orderId}&transactionId=${transaction._id}`,
        cancel_url: `${process.env.BASE_URL}${process.env.FRONTEND_PORT}/cancel?orderId=${orderId}&transactionId=${transaction._id}`,
      },
      transactions: [
        {
          amount: { currency: "USD", total: price },
          description: `Purchase of ${serviceData.title}`,
        },
      ],
    };

    // Create PayPal payment
    paypal.payment.create(createPaymentJson, async (error, payment) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: "Error processing payment" });
      }

      // Send the approval URL to the client
      const approvalUrl = payment.links.find(
        (link) => link.rel === "approval_url"
      );

      if (approvalUrl) {
        return res.json({
          url: `${approvalUrl.href}`,
        });
      }

      res.status(500).json({ error: "Approval URL not found" });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const payWithStripe = async (req, res) => {
  const { buyerId, serviceId, price, orderId } = req.body;

  Service.findById(serviceId, async (err, serviceData) => {
    if (err || !serviceData)
      return res.status(404).json({ error: "Package not found" });
    const transaction = new Transaction({
      buyerId,
      sellerId: serviceData.user_id,
      serviceId,
      amount: price,
      paymentMethod: "Stripe",
      status: "Escrow",
    });
    await transaction.save();
    const session = await Stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: serviceData.title },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.BASE_URL}${process.env.FRONTEND_PORT}/success?orderId=${orderId}&transactionId=${transaction._id}`,
      cancel_url: `${process.env.BASE_URL}${process.env.FRONTEND_PORT}/cancel?orderId=${orderId}&transactionId=${transaction._id}`,
      metadata: {
        transaction_id: transaction._id.toString(),
        buyer_id: buyerId,
        service_id: serviceId,
        seller_id: serviceData.user_id,
        orderId: orderId,
      },
    });

    res.json({ url: session.url });
  });
};
const paymentSuccess = async (req, res) => {
  const { paymentId, PayerID, orderId, transactionId } = req.query;

  if (!paymentId || !PayerID) {
    return res.status(400).json({ error: "Missing payment details" });
  }

  try {
    // Execute PayPal Payment
    paypal.payment.execute(
      paymentId,
      { payer_id: PayerID },
      async (error, payment) => {
        if (error) {
          console.error("PayPal Execution Error:", error.response);
          return res.status(500).json({ error: "Payment execution failed" });
        }

        if (payment.state !== "approved") {
          return res.status(400).json({ error: "Payment not approved" });
        }

        res.redirect(
          `${process.env.BASE_URL}${process.env.FRONTEND_PORT}/success?orderId=${orderId}&transactionId=${transactionId}`
        );
      }
    );
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//refund
const refundPaypalPayment = async (req, res) => {
  const { transactionId } = req.body;

  try {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction || transaction.paymentMethod !== "PayPal") {
      return res
        .status(404)
        .json({ error: "Transaction not found or invalid payment method" });
    }

    const saleId = transaction.paymentId; // PayPal sale ID
    paypal.sale.refund(saleId, {}, async (error, refund) => {
      if (error) {
        console.error("PayPal Refund Error:", error);
        return res.status(500).json({ error: "PayPal refund failed" });
      }

      transaction.status = "Refunded";
      await transaction.save();

      res
        .status(200)
        .json({ success: true, message: "PayPal refund successful", refund });
    });
  } catch (error) {
    console.error("PayPal Refund Error:", error);
    res.status(500).json({ error: "PayPal refund failed" });
  }
};

//refund
const refundStripePayment = async (req, res) => {
  const { transactionId } = req.body;

  try {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction || transaction.paymentMethod !== "Stripe") {
      return res
        .status(404)
        .json({ error: "Transaction not found or invalid payment method" });
    }

    const refund = await Stripe.refunds.create({
      payment_intent: transaction.paymentIntentId,
    });

    transaction.status = "Refunded";
    await transaction.save();

    res
      .status(200)
      .json({ success: true, message: "Stripe refund successful", refund });
  } catch (error) {
    console.error("Stripe Refund Error:", error);
    res.status(500).json({ error: "Stripe refund failed" });
  }
};

const updateOrderTransaction = async (req, res) => {
  const { orderId, transactionId } = req.body;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    order.transactionId = transactionId;
    await order.save();
    res.status(200).json({
      success: "True",
      message: "Order Placed Successfully",
      order,
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const transactionCancelled = async (req, res) => {
  const { transactionId, orderId } = req.body;

  try {
    const transaction = await Transaction.findByIdAndDelete(transactionId);

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    return res.status(200).json({ message: "Transaction  Cancelled" });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  payment,
  payWithPaypal,
  paymentSuccess,
  payWithStripe,
  updateOrderTransaction,

  transactionCancelled,
};
