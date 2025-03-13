const Joi = require("joi")
const { uploadDocuments } = require("../../Utils/cloudinaryImgFunctions")
const File = require("../../Models/File")
const { Message } = require("../../Models/Message")




const getMessages = async (req, res) => {
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
        const messages = await Message.find({
            $or: [
                { sender: req.payload._id, receiver: to },
                { sender: to, receiver: req.payload._id }
            ]
        })
        if (messages) {
            return res.status(200).json({ success: true, messages })
        }
        else {
            return res.status(500).json({ success: false, message: "No messages found" })
        }
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, error: err.message })
    }
}


// const sendMessage = async (message, callback) => {
//     console.log("Inside sendMessage");

//     const value = Joi.object({
//         to: Joi.string().required(),  // to is the id of the user to whom the message is to be sent
//         text: Joi.string().required(),
//         sender: Joi.object({
//             _id: Joi.string().required()
//         }).required()
//     }).validate(message)

//     if (value.error) {
//         console.error("Validation failed", value.error);
//         return callback({ success: false, error: value.error.details[0].message })
//     }

//     try {
//         const { to, text, sender } = message
//         if (!to || !sender._id) {
//             console.error("Receiver or sender id is null");
//             return callback({ success: false, error: "Receiver or sender id is null" })
//         }

//         console.log("Creating new message instance");
//         const messageData = new Message({
//             receiver: to,
//             sender: sender._id, // Assuming the sender's id is in the message
//             message: text
//         })

//         console.log("Saving message");
//         const savedMessage = await messageData.save()
//         console.log("Saved message", savedMessage);

//         if (savedMessage) {
//             console.log("Emitting message" + savedMessage);
//             callback({ success: true, message: savedMessage }) // Return the saved message
//         } else {
//             console.error("Message not sent");
//             callback({ success: false, message: "Message not sent" })
//         }

//     } catch (err) {
//         console.error("Caught error", err);
//         console.log("error", err);
//         callback({ success: false, error: err.message })

//     }
// }


const sendMessage = async (message, callback) => {
    const value = Joi.object({
        to: Joi.string().required(),
        text: Joi.string().required(),
        sender: Joi.object({
            _id: Joi.string().required()
        }).required()
    }).validate(message)

    if (value.error)
        return callback({ success: false, error: value.error.details[0].message })

    try {
        const { to, text, sender } = message
        if (!to || !sender._id) {
            return callback({ success: false, error: "Receiver or sender id is null" })
        }

        const messageData = new Message({
            receiver: to,
            sender: sender._id,
            message: text
        })

        const savedMessage = await messageData.save()

        if (savedMessage) {
            callback({ success: true, message: savedMessage })
        } else {
            callback({ success: false, message: "Message not sent" })
        }

    } catch (err) {
        callback({ success: false, error: err.message })
    }
}


module.exports = {
    sendMessage,
    getMessages
}