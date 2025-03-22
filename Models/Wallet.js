const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  balance: { type: Number },
  pendingBalance: { type: Number, required: true },
  paypalEmail: { type: String },
  stripeAccountId: { type: String },
});

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
