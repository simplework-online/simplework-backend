const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
     
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CreateService",
      required: [true, "Service ID is required"],
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order ID is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // The user who wrote the review
      required: [true, "Reviewer (createdBy) is required"],
    },
    createdFor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // The user who is receiving the review
      required: [true, "Review recipient (createdFor) is required"],
    },
    createdForType: {
      type: String,
      enum: ["Seller", "Buyer"], // Specify if it's for a seller or buyer
      required: [true, "createdForType is required"],
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

const Review = mongoose.model("Review", ReviewSchema);

module.exports = Review;
