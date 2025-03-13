const Joi = require("joi")
const Payment = require("../../Models/Payment")


const payment = async (req, res) => {
    const value = Joi.object({
        cardNumber: Joi.string().required(),
        cardHolderName: Joi.string().required(),
        cardExpiryDate: Joi.string().required(),

        cardCVV: Joi.string().required(),
        paymentMethod: Joi.string().required(),
        paymentAmount: Joi.number().required(),
    }).validate(req.body)
    if (value.error) {
        return res.status(400).send(value.error.details[0].message)
    }
    const { cardNumber, cardHolderName, cardExpiryDate, cardCVV, paymentMethod, paymentAmount } = req.body
    const payment = new Payment({
        userId: req.payload._id,
        cardNumber,
        cardHolderName,
        cardExpiryDate,
        cardCVV,
        paymentMethod,
        paymentAmount,
        

    })
    try {
        const result = await payment.save()
        res.status(200).json({ message: "Payment Successfuliy save", data: result })


    }
    catch (err) {
        res.status(500).json({ message: "Internal Server Error", err })
    }
}
module.exports = payment