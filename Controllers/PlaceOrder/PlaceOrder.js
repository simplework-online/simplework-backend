const Joi = require("joi")
const Order = require("../../Models/Order")
const { default: mongoose } = require("mongoose")
const Stripe = require("stripe")
const cloudinary = require("../../Utils/cloudinary.config")
const { uploadImages } = require("../../Utils/cloudinaryImgFunctions")
const placeOrder = async (req, res) => {
    const value = Joi.object({
        title: Joi.string().required(),
        details: Joi.string().required(),
        orderId: Joi.any().required(),
        paymentIntentId: Joi.string().required(),
        attachments: Joi.any(),

    }).validate(req.body)
    if (value.error) {
        return res.status(400).send(value.error.details[0].message)
    }
    const { title,
        details,
        orderId,
        paymentIntentId,
    } = req.body

    let uploadAttachments = [];
    console.log(req.files)
    console.log("req.files.attachments")
    console.log(req.file)

    if (req.files) {
        console.log(req.files)
        uploadAttachments = await uploadImages(req.files.attachments)
    }
    console.log(uploadAttachments)
    const orderData = {
        title,
        details,
        paymentIntentId,
        paymentStatus: true,
    }
    if (uploadAttachments.length > 0) {
        orderData.attachments = uploadAttachments
    }
    console.log(orderData)

    // find the order by orderId and update the order
    try {
        const updateOrder = await Order.findByIdAndUpdate(orderId, {
            $set: orderData
        }, { new: true })
        return res.status(200).send({ message: "Order updated successfully", updateOrder })
    } catch (err) {
        return res.status(500).send(err.message)
    }


}

const intent = async (req, res, next) => {

    const value = Joi.object({

        DeliveryTime: Joi.date().required(),
        package: Joi.string().required(),
        TermsAndContitions: Joi.boolean().valid(true).required(),
        talentId: Joi.any().required(),
        serviceId: Joi.any().required(),
        category: Joi.string().required(),
        subcategory: Joi.string().required(),
    }).validate(req.body)
    if (value.error) {
        return res.status(400).send(value.error.details[0].message)
    }
    const {

        category,
        subcategory,
        DeliveryTime,
        package,
        TermsAndContitions,

    } = req.body

    function isValidObjectId(id) {
        return /^[0-9a-fA-F]{24}$/.test(id);
    }

    const { talentId, serviceId } = req.body;

    if (!isValidObjectId(talentId) || !isValidObjectId(serviceId)) {
        return res.status(400).send("Invalid talentId or serviceId");
    }

    let talentObjectId = mongoose.Types.ObjectId(talentId);
    let serviceObjectId = mongoose.Types.ObjectId(serviceId);



    const order = new Order({
        buyerId: req.payload._id,
        talentObjectId,
        serviceObjectId,
        category,
        subcategory,
        DeliveryTime,
        package,
        TermsAndContitions,
    })
    try {
        const result = await order.save()
        console.log(result)
        console.log("order saved successfully")

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        // const gig = await Gig.findById(req.params.id);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: 100 * 100,
            currency: "usd",
            automatic_payment_methods: {
                enabled: true,
            },
        });
        
        res.status(200).send({
            clientSecret: paymentIntent.client_secret,
            orderId: result._id,
        });
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Internal Server Error", err })
    }

};



module.exports = {
    placeOrder,
    intent
}