const { required } = require('joi');
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            unique: true
        },
        password: {
            type: String,
        },
        username: {
            type: String,
            required: true,
            unique: true
        },
        profileImage: {
            type: String,
            default: ""
        },
        token: {
            type: String
        },
        location: {
            type: String,
            default: "Pakistan"
        },
        status: {
            type: String,
            default: '(Level 2)'
        },
        languages: {
            type: String,
            default: 'English'
        },
        description: {
            type: String,
            
        },
        servicesExperties: {
            type: String,
            
        },
        education: {
            type: String,
        },
        certificate: {
            type: String,
        },
        // chatlistId references the Chatlist model. ChatList model is used to store the list of chats of a user.
        chatlistId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chatlist',
            required: true
        },
        // groupChatListId references the GroupChatList model. GroupChatList model is used to store the list of group chats of a user.
        groupChatListId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GroupChatList'
        },

        favouriteGigs: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'CreateService',
                default: []
            }
        ],
    },
    { timestamps: true }
)
module.exports = mongoose.model("User", UserSchema)
