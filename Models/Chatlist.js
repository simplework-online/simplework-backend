const mongoose = require('mongoose');
const ChatlistSchema = new mongoose.Schema(
    {
        usersList: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }],
            default: [],
        }

    },
    { timestamps: true }
)

const GroupChatListSchema = new mongoose.Schema(
    {
        groupChatList: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'GroupChat'
            }],
            default: [],
        }

    },
    { timestamps: true }
)

const GroupChatList = mongoose.model("GroupChatList", GroupChatListSchema)
const Chatlist = mongoose.model("Chatlist", ChatlistSchema)
module.exports = { Chatlist, GroupChatList }