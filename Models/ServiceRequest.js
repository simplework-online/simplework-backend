const mongoose = require("mongoose")
// TODO: after posting service it shows on posted request page clicking on view request have no routing

const ServiceRequestSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    talentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "CreateService" },
    title: { type: String, required: true },
    details: { type: String, required: true },
    attachments: { type: [Object], required: false, default: [], maxlength: 3 },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    DeliveryTime: { type: Date, required: true },
    budget: { type: Number, required: true },
    orderStatus: { type: String, default: "active" },
    isAccepted: { type: Boolean, default: false },

}
    ,
    { timestamps: true })

//TODO: Review payment 


module.exports = mongoose.model("ServiceRequest", ServiceRequestSchema)

