const { boolean, required } = require('joi');
const mongoose = require('mongoose');
const CreateServiceSchema = new mongoose.Schema(
    {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: String,
        description: String,
        category: String,
        subcategory: String,
        metaData:{
            appTool:[String],
            designTool:[String],
            device:[String]
        },
        serviceTags: { type: [String], minlength: 1, maxlength: 5 },
        pricing: {
            basic: {
                packageName: String,
                packageDetails: String,
                delivery: String,
                totalScreen: Number,
                prototype: Boolean,
                revisions: Number,
                price: Number,
            },
            standard: {
                packageName: String,
                packageDetails: String,
                delivery: String,
                totalScreen: Number,
                prototype: Boolean,
                revisions: Number,
                price: Number,
            },
            premium: {
                packageName: String,
                packageDetails: String,
                delivery: String,
                totalScreen: Number,
                prototype: Boolean,
                revisions: Number,
                price: Number,
            },
        },
        textFormatting: {
            color: { type: String, default: false },
            bold: { type: Boolean, default: false },
            italic: { type: Boolean, default: false },
            underline: { type: Boolean, default: false }
        },
        questions: { type: [String], required: false },
        faqs: { type: [String], required: false },
        // serviceData has to be an array of objects and each object will have image and imageId and default empty array
        // servicesImages: { type: [String], default: [], maxlength: 3 },
        servicesImages: { type: [Object], required: false, default: [], maxlength: 3 },
        serviceDocuments: { type: [Object], required: false, default: [], maxlength: 3 },
        termsAndConditions: {
            type: Boolean,
        },
        serviceStatus: { type: String, default: 'pending' },
        sales: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
        impressions: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        isCompleted:{type:Boolean,default:false}
        

        // comments and reviews
        //  [{img:str,pid:str}]



    },
    { timestamps: true }
)
module.exports = mongoose.model("CreateService", CreateServiceSchema)