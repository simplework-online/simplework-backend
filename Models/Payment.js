const mongoose = require("mongoose")
const PaymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cardNumber: { type: String, required: true },
    cardHolderName: { type: String, required: true },
    cardExpiryDate: { type: String, required: true },
    cardCVV: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    paymentAmount: { type: Number, required: true },
})
module.exports = mongoose.model("Payment", PaymentSchema)
