const Joi = require('joi')
const { GroupChatList } = require('../../Models/Chatlist')
const mongoose = require('mongoose');

const { GroupChat, GroupMessage } = require('../../Models/Message')
const User = require('../../Models/User')
const { uploadDocuments } = require('../../Utils/cloudinaryImgFunctions');
const File = require('../../Models/File');
const createGroupChat = async (req, res) => {
    const value = Joi.object({
        name: Joi.string().required(),
        members: Joi.array().items(Joi.string()).required(),
    }).validate(req.body)
    if (value.error) {
        return res.status(400).json({ success: false, error: value.error.details[0].message })
    }
    try {
        const { name, members } = req.body
        // create mongodb id for messagesList
        const messagesList = new mongoose.Types.ObjectId();
        const groupChat = new GroupChat({
            name,
            members,
            admin: req.payload.userData._id,
            messagesList,
        })
        const savedGroupChat = await groupChat.save()
        if (savedGroupChat) {
            // get the id of the group chat and save it in the members array of the group chat in the database
            const groupChatId = savedGroupChat._id
            // get the grup chat list of the members and push the group chat id in the group chat list of the members
            const getMembersGroupChatIds = await User.find({ _id: { $in: members } }, { groupChatListId: 1 })
            if (!getMembersGroupChatIds) {
                return res.status(500).json({ success: false, message: "Cannot fetch users from members list" })
            }

            const membersGroupChatIds = getMembersGroupChatIds.map((member) => member.groupChatListId)
            console.log(membersGroupChatIds)

            // update the group chat list of the members
            const updateGroupChatList = await GroupChatList.updateMany(
                {
                    _id: { $in: membersGroupChatIds }
                },
                {
                    $push: { groupChatList: groupChatId }
                })
            if (!updateGroupChatList) {
                return res.status(500).json({ success: false, message: "Cannot update group chat list" })
            }
            return res.status(200).json({ success: true, message: "Group chat created successfully" })
        }
        else {
            // delete the group chat if any of the above steps fail
            const deleteGroupChat = await GroupChat.deleteOne({ _id: savedGroupChat._id })
            if (!deleteGroupChat) {
                return res.status(500).json({ success: false, message: "Group chat not deleted!" })
            }
            return res.status(500).json({ success: false, message: "Group chat not created" })

        }
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, error: err.message })
    }
}

// TODO:  send message to the group chat

const sendGroupMessage = async (req, res) => {
    const value = Joi.object({
        message: Joi.string().required(),
        groupChatId: Joi.string().required(),
    }).validate(req.body)
    if (value.error) {
        return res.status(400).json({ success: false, error: value.error.details[0].message })
    }
    try {
        const { message, groupChatId } = req.body
        // get the group chat
        if (!req.file) {

            const groupMessage = new GroupMessage({
                sender: req.payload.userData._id,
                groupChat: groupChatId,
                message,
            })
            const savedGroupMessage = await groupMessage.save()
            if (!savedGroupMessage) {
                return res.status(500).json({ success: false, message: "Cannot save group message" })
            }
            const updateGroupChat = await GroupChat.updateOne(
                { _id: groupChatId },
                {
                    $push: { messagesList: savedGroupMessage._id }
                }
            )
            if (!updateGroupChat) {
                return res.status(500).json({ success: false, message: "Cannot update group chat" })
            }
            return res.status(200).json({ success: true, message: "Message sent successfully" })
        }
        else {
            const docsUrl = await uploadDocuments(req.file.files, 'chatDocuments');
            if (!docsUrl) {
                return res.status(500).json({ success: false, message: "Cannot upload documents" })
            }

            const MsgFiles = new File({
                filesUrl: docsUrl,
            })
            const savedMsgFiles = await MsgFiles.save()
            if (!savedMsgFiles) {
                return res.status(500).json({ success: false, message: "Cannot save files" })
            }
            const groupMessage = new GroupMessage({
                sender: req.payload.userData._id,
                groupChat: groupChatId,
                message,
                files: savedMsgFiles._id,
            })
            const savedGroupMessage = await groupMessage.save()
            if (!savedGroupMessage) {
                return res.status(500).json({ success: false, message: "Cannot save group message" })
            }
            const updateGroupChat = await GroupChat.updateOne(
                { _id: groupChatId },
                {
                    $push: { messagesList: savedGroupMessage._id }
                }
            )
            if (!updateGroupChat) {
                return res.status(500).json({ success: false, message: "Cannot update group chat" })

            }
            return res.status(200).json({ success: true, message: "Message sent successfully" })
        }
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, error: err.message })
    }
}

const getGroupChat = async (req, res) => {
    const value = Joi.object({
        groupChatId: Joi.string().required(),
    }).validate(req.body)
    if (value.error) {
        return res.status(400).json({ success: false, error: value.error.details[0].message })
    }
    try {
        const { groupChatId } = req.body
        const groupChat = await GroupChat.findOne({ _id: groupChatId })
        if (!groupChat) {
            return res.status(500).json({ success: false, message: "Cannot fetch group chat" })
        }
        const fetchGroupMessages = await GroupMessage.find({ _id: { $in: groupChat.messagesList } })
        if (!fetchGroupMessages) {
            return res.status(500).json({ success: false, message: "Cannot fetch group messages" })
        }
        return res.status(200).json({ success: true, message: "Group chat fetched successfully", groupChat, fetchGroupMessages })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, error: err.message })
    }
}

const deleteGroupFromUserGroupChatList = async (req, res) => {
    const value = Joi.object({
        groupChatId: Joi.string().required(),
    }).validate(req.body)
    if (value.error) {
        return res.status(400).json({ success: false, error: value.error.details[0].message })
    }
    try {
        const { groupChatId } = req.body
        //  remove the group chat id from the group chat list of the current member
        const updateGroupChatList = await GroupChatList.updateOne(
            { _id: req.payload.userData.groupChatListId },
            { $pull: { groupChatList: groupChatId } },
            { new: true }
        )
        if (!updateGroupChatList) {
            return res.status(500).json({ success: false, message: "Cannot update group chat list" })
        }
        // find the group chat id in the group chat list of the other all users


        const groupChatInGroupChatListCount = await GroupChatList.find({ $in: { groupChatList: groupChatId } }).countDocuments();
        if (!groupChatInGroupChatListCount) {
            return res.status(500).json({ success: false, message: "Cannot find group chat in group chat list" })
        }
        //  if the group chat id is not found in the group chat list of the other all users then delete the group chat
        if (groupChatInGroupChatListCount === 1) {
            const deleteGroupChat = await GroupChat.deleteOne({ _id: groupChatId })
            if (!deleteGroupChat) {
                return res.status(500).json({ success: false, message: "Cannot delete group chat" })
            }
            // delete the group messages 
            const deleteGroupMessages = await GroupMessage.deleteMany({ groupChat: groupChatId })
            if (!deleteGroupMessages) {
                return res.status(500).json({ success: false, message: "Cannot delete group messages" })
            }
            return res.status(200).json({ success: true, message: "Group chat deleted successfully" })
        }
        // if the group chat id is found in the group chat list of the other all users then just delete the group chat id from the group chat list of the current user
        else {
            return res.status(200).json({ success: true, message: "Group chat deleted successfully" })
        }
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, error: err.message })
    }
}



module.exports = { createGroupChat, sendGroupMessage, getGroupChat, deleteGroupFromUserGroupChatList }

