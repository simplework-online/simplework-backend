const Notification = require("../../Models/notification");
const mongoose = require('mongoose');

const { Server } = require('socket.io');
const io = new Server(); // We'll export the io instance so that we can use it in other parts of the application.

// In-memory map to store the mapping of user IDs to their respective Socket.IO IDs.
const socketIdMap = new Map();

// Define a function to send real-time notifications to clients using Socket.IO
const sendNotificationToClient = (receiverSocketId, notificationData) => {
  io.to(receiverSocketId).emit('newNotification', notificationData);
};

// Define the controller function to create a new notification
const createNotification = async (req, res) => {
    try {
        const { type, sender, receiver, message } = req.body;
      const senderId = mongoose.Types.ObjectId(sender);
      const receiverId = mongoose.Types.ObjectId(receiver);
  
      // Create a new notification and save it to the database
      const newNotification = new Notification({
        type: type,
        sender: senderId,
        receiver: receiverId,
        message: message,
        timestamp: new Date(),
      });
  
      const savedNotification = await newNotification.save();
  
      console.log('Notification saved:', savedNotification);
  
      // Fetch the receiver's Socket.IO ID from the map.
      const receiverSocketId = socketIdMap.get(receiverId);
  
      if (receiverSocketId) {
        // Send real-time notification to the receiver
        sendNotificationToClient(receiverSocketId, newNotification);
      } else {
        console.log(`Receiver with ID ${receiverId} is not connected to Socket.IO.`);
        // Optionally, you can store the notification in a database and send it to the receiver later when they connect.
      }
  
      console.log('Notification saved and sent successfully:', newNotification);
      res.json({ success: true, message: 'Notification sent successfully', newNotification: newNotification });
    } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({ success: false, message: 'Error sending notification' });
    }
  };
  const getNotifications = async (req, res) => {
    try {
      const data = await Notification.find();
      res.status(200).json({
        data,
      });
    } catch (error) {
      res.status(401).json({
        status: "failed",
        error: error.message,
      });
    }
  };
  
  

module.exports = {
  createNotification,
  getNotifications,
  io, // Export the Socket.IO instance to use it in the main app.js file.
  socketIdMap, // Export the socketIdMap for managing the Socket.IO IDs of connected users.
};


