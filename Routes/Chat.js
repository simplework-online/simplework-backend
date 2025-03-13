const { addToChatlist, getChatlist, deleteFromChatlist } = require('../Controllers/Chat/Chat');
const { createGroupChat, sendGroupMessage, getGroupChat, deleteGroupFromUserGroupChatList } = require('../Controllers/Chat/groupChat');
const { sendMessage, getMessages } = require('../Controllers/Chat/Message');
const { sendOffer, getOffers, acceptOffer, requestModification } = require('../Controllers/Chat/Offer');
const { auth } = require('../Middlewares/auth');
// Middleware to handle file upload
const router = require('express').Router();
// TODO: test the routes
router.post('/add-to-chatlist', auth, addToChatlist);
router.get("/get-chatlist", auth, getChatlist);
router.delete('/delete-from-chatlist', auth, deleteFromChatlist);
router.post('/send-message', auth, sendMessage);
router.post('/create-group', auth, createGroupChat);
router.post('/send-group-message', auth, sendGroupMessage);
// TODO:  send message to the group chat route

// TODO: how to pass params in the url to
router.get('/get-messages', auth, getMessages);
router.get('/get-group-messages', auth, getGroupChat);
router.delete('/delete-user-from-group', auth, deleteGroupFromUserGroupChatList);

// offer routes
router.post('/send-offer', auth, sendOffer);
router.get('/get-offers', auth, getOffers);
router.post('/accept-offer', auth, acceptOffer);
router.post('/offer-modification-request', auth, requestModification);

module.exports = router;


