const Joi = require("joi")
const { Offer } = require("../../Models/Message")

const sendOffer = async (req, res) => {
    const value = Joi.object({
        description: Joi.string(),
        price: Joi.number().required(),
        revision: Joi.number().required(),
        deliveryTime: Joi.date().required(),
        offerExpireIn: Joi.date(),
        serviceId: Joi.string().required(),
    }).validate(req.body)
    if (value.error) {
        return res.status(400).send({
           error:  value.error.details[0].message,
            message: "errrrrorrrr"
        })
    }
    try {

        // recieverId is the id of the user to whom the offer is to be sent
        const { description, price, revision, deliveryTime, offerExpireIn, serviceId } = req.body
        const offer = new Offer({
            sender: req.payload.userData._id,
            receiver: "64594885bce07ea69021228a",
            serviceId,
            description,
            price,
            revision,
            deliveryTime,
            offerExpireIn,
        })
        const result = await offer.save()
        if (!result) {
            return res.status(500).json({ success: false, message: "Offer not sent" })
        }

        return res.status(200).json({ success: true, message: "Offer sent successfully" })
    }
    catch (err) {
        return res.status(500).json({ success: false, error: "message" })
    }
}

const getOffers = async (req, res) => {
    // get the conversation between two users only
    // get the messages between the logged in user and the user whose id is passed in the query
    // vlaidate the query params
    // query will be like this /messages?to=123
    const value = Joi.object({
        to: Joi.string().required()
    }).validate(req.query)
    if (value.error) {
        return res.status(400).json({ success: false, error: value.error.details[0].message })
    }
    try {
        const { to } = req.query
        const offers = await Offer.find({
            $or: [
                { sender: req.payload.userData._id, receiver: to },
                { sender: to, receiver: req.payload.userData._id }
            ]
        })
        if (offers) {
            return res.status(200).json({ success: true, offers })
        }
        else {
            return res.status(500).json({ success: false, message: "No offers found" })
        }
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, error: err.message })
    }
}
const acceptOffer = async (req, res) => {
    const value = Joi.object({
        offerId: Joi.string().required(),
    }).validate(req.body)

    if (value.error) {
        return res.status(400).send(value.error.details[0].message)
    }
    try {
        const { offerId } = req.body
        const updateOffer = await Offer.findByIdAndUpdate(offerId, { status: "accepted" })
        if (!updateOffer) {
            return res.status(500).json({ success: false, message: "Offer not accepted" })
        }
        return res.status(200).json({ success: true, message: "Offer accepted successfully" })

    }
    catch (err) {
        return res.status(500).json({ success: false, error: err.message })
    }
}

const requestModification = async (req, res) => {
    const value = Joi.object({
        offerId: Joi.string().required(),
    }).validate(req.body)

    if (value.error) {
        return res.status(400).send(value.error.details[0].message)
    }
    try {
        const { offerId } = req.body
        const updateOffer = await Offer.findByIdAndUpdate(offerId, { modificationRequest: true })
        if (!updateOffer) {
            return res.status(500).json({ success: false, message: "Update failed" })

        }
        return res.status(200).json({ success: true, message: "Modification set to true" })

    }
    catch (err) {
        return res.status(500).json({ success: false, error: err.message })
    }
}

module.exports = { sendOffer, getOffers, acceptOffer, requestModification }
