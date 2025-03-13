const mongoose = require('mongoose');
const ReviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'review is required']
        },
        rating: {
            type: Number,
            required: [true, 'rating is required']
        },
        // ServiceDelivery: {
        //     type: Number,
        //     required: [true, 'Service_delivery is required']
        // },
        // Communication: {
        //     type: Number,
        //     required: [true, 'Communication is required']
        // },
        // Recommend: {
        //     type: Number,
        //     required: [true, 'Recommend is required']
        // },
        // serviceId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'CreateService',
        //     required: [true, 'serviceId is required']
        // },
        // orderId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'Order',
        //     required: [true, 'orderId is required']
        // },
        // createdBy: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'User',
        // },
        // createdFor: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'User',
        //     required: [true, 'createdFor is required']

        // },
        createdForType: {
            type: String,
            required: [true, 'createdForType is required']
        },
        
    },
    { timestamps: true }
)
module.exports = mongoose.model("Review", ReviewSchema)