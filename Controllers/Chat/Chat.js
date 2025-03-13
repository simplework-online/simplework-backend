const Joi = require("joi");
const { Chatlist, GroupChatList } = require("../../Models/Chatlist");
const { Message } = require("../../Models/Message");
const User = require("../../Models/User");
const addToChatlist = async (req, res) => {
    // get user id from payload and chat id from payload
    const userId = req.payload._id;
    const chatId = req.payload.chatlistId;
    console.log(userId, chatId)
    console.log(req.payload)
    const value = Joi.object({
        chatWith: Joi.string().required()
    }).validate(req.body)
    if (value.error) {
        return res.status(400).json({ message: value.error.details[0].message });
    }

    const { chatWith } = req.body;
    console.log(chatWith)
    try {
        // const ifUserExit = await Chatlist.findOne({ usersList: { $in: [chatWith] } })
        // const ifUserExit = await Chatlist.findOne({ _id: chatId }, { usersList: { $in: [chatWith] } })
        const ifUserExit = await Chatlist.findOne({ _id: chatId, usersList: { $in: [chatWith] } });
        if (ifUserExit) {
            return res.status(200).json({ message: "User already exist in chatlist" });
        }
        else {
            const userChatListId = await User.findOne({ _id: userId }, { chatlistId: 1, _id: 0 });

            // console.log('check ' + userId + " " + userChatListId.chatlistId)
            if (!userChatListId) {
                return res.status(500).json({ message: "User chatlist not found" });
            }
            const userChatlist = await Chatlist.findByIdAndUpdate(userChatListId.chatlistId, { $push: { usersList: chatWith } }, { new: true });
            if (!userChatlist) {
                return res.status(500).json({ message: "User chatlist not updated" });
            }

            const ChatWithListId = await User.findOne({ _id: chatWith }, { chatlistId: 1, _id: 0 });
            if (!ChatWithListId) {
                return res.status(500).json({ message: "Chat with chatlist not found" });
            }
            const ifUserAlreadyExit = await Chatlist.findOne({ _id: ChatWithListId.chatlistId, usersList: { $in: [userId] } });
            if (ifUserAlreadyExit) {
                return res.status(200).json({ message: "User added to chatlist" });
            }
            const chatWithChatList = await Chatlist.findByIdAndUpdate(ChatWithListId.chatlistId, { $push: { usersList: userId } }, { new: true });
            if (!chatWithChatList) {
                return res.status(500).json({ message: "Chat with chatlist not updated" })
            }
            return res.status(200).json({ message: "User added to chatlist" });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const deleteFromChatlist = async (req, res) => {

    const chatId = req.payload.chatlistId;
    const { chatWith } = req.body;
    try {
        const deleteChatWith = await Chatlist.findByIdAndUpdate(chatId, { $pull: { usersList: chatWith } }, { new: true });
        if (!deleteChatWith) {
            return res.status(500).json({ message: "Chat with not deleted" });
        }
        // TODO: delete all the chat messages between the two users
        return res.status(200).json({ message: "Chat with deleted successfully" });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error", error: err });
    }
}


// get chatlist of a user by id
const getChatlist = async (req, res) => {
    try {
        const chatlistObj = await Chatlist.findById(req.payload.chatlistId).populate('usersList');
        if (!chatlistObj) {
            console.log("Chatlist not found");
        }
        const chatlist = chatlistObj.usersList || [];

        const groupChatlistObj = await GroupChatList.findById(req.payload.groupChatListId).populate('groupChatList');
        if (!groupChatlistObj) {
            console.log("Group chatlist not found");
        }
        const groupChatlist = groupChatlistObj.groupChatList || [];

        const chatListPromises = chatlist.map(async user => {
            const lastMessage = await Message.find(
                {
                    $or: [{ senderId: req.payload._id, receiverId: user._id },
                    { senderId: user._id, receiverId: req.payload._id }]
                }).sort({ createdAt: -1 }).limit(1);

            return { ...user._doc, lastMessage };
        });

        const ChatListWithLastMsg = await Promise.all(chatListPromises);
        const sortedChatList = ChatListWithLastMsg.sort((a, b) => {
            if (!a.lastMessage[0] || !b.lastMessage[0]) {
                return 0; // or some other default value
            }
            return new Date(b.lastMessage[0].createdAt) - new Date(a.lastMessage[0].createdAt);
        });


        const groupChatListPromises = groupChatlist.map(async group => {
            const lastMessage = await Message.find(
                {
                    groupChat: group._id
                }
            ).sort({ createdAt: -1 }).limit(1);
            return { ...group._doc, lastMessage };
        });

        const groupChatListWithLastMsg = await Promise.all(groupChatListPromises);
        const sortedGroupChatList = groupChatListWithLastMsg.sort((a, b) => {
            return new Date(b.lastMessage[0].createdAt) - new Date(a.lastMessage[0].createdAt);
        });

        return res.status(200).json({ message: "Chatlist", data: { chatlist: sortedChatList, groupChatlist: sortedGroupChatList } });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error", error: err });
    }
}




module.exports = {
    addToChatlist,
    getChatlist,
    deleteFromChatlist
}