const mongoose = require("mongoose");
const User = require("./User");
const CreateService = require("./CreateService");

const orderSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: User, required: false },
    talentId: { type: String, required: false },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: CreateService, required: false },
    title: { type: String, required: false },
    details: { type: String },
    category: { type: String, required: false },
    subcategory: { type: String },
    status: {
        type: String,
        enum: ["Pending", "In Progress", "Delivered", "Completed", "Cancelled", "Active"],
        default: "Pending"
      },
    DeliveryTime: { type: String, required: false },
    package: { type: String, required: false },
    TermsAndConditions: { type: Boolean, required: false },
    paymentStatus: { type: Boolean, default: false },
    paymentIntentId: { type: String },
    requirementImage: {
        type: String,
        default: ""
    },
    gigImage: {
        type: String,
        default: ""
    },
  },
  { timestamps: true } 
);

module.exports = mongoose.model("Order", orderSchema);
