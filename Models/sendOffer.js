const mongoose = require("mongoose")
const sendOfferSchema = new mongoose.Schema({

    description: { type: String},
    budget: { type: String},
    delivery_time: { type: String},
    revisions: { type: String},
    services: { type: String},
    
 }, {
        timestamps: true, // Enable timestamps
        createdAt: 'created_at', // Customize the createdAt field name
        updatedAt: 'updated_at' // Customize the updatedAt field name
     
})
module.exports = mongoose.model("SendOffer", sendOfferSchema)
