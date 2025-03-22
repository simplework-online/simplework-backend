const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  buyerId: String,
  sellerId: String,
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CreateService",
    required: true,
  },
  amount: Number,
  paymentMethod: String,
  status: {
    type: String,
    enum: ["Pending", "Escrow", "Released", "Refunded"],
    default: "Escrow",
  },

  releaseDate: Date,
  paymentIntentId: { type: String },
  paymentId: { type: String },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
