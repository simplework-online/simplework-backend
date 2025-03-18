const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const dbConnect = require('./Config/mongo');
const cookieParser = require('cookie-parser');
const { sendMessage } = require('./Controllers/Chat/Message');
const notificationRoutes = require('./Routes/notification');
const notificationController = require('./Controllers/Notification/notification');
const orderRoutes = require('./Routes/Order')

app.use(cookieParser());
const ios = notificationController.io;
const socketIdMap = notificationController.socketIdMap;
// const allowedOrigins = [
//     'http://145.223.101.250:3000',
//     'http://145.223.101.250:5173',
//     'http://145.223.101.250:3000',
//     'https://simplework.online',
//     'http://simplework.online',
//     'https://64d0e60e759c686d7b0305fd--grand-tanuki-76c5f9.netlify.app'
// ];

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'CREATE'],
        credentials: true,
    },
});

// export the io object so that it can be used in the root route
module.exports.io = io;

app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE','CREATE'],
        credentials: true,
    })
);


app.use(
    fileUpload({
        useTempFiles: true,
    })
);
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

const SendOffer = require('./Routes/sendOffer');
const UpdateProfile = require('./Routes/updateProfile');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/', require('./Routes/RootRoute'));
app.use(UpdateProfile);
app.use('/api/orders', orderRoutes);

// Set up a WebSocket connection with the frontend
// io.on('connection', (socket) => {
//     console.log('New WebSocket connection');

//     // Listen for chatMessage event from client
//     socket.on('chatMessage', (message, callback) => {
//       // Import sendMessage from route file

//       // Call sendMessage
//       sendMessage(message, (response) => {
//         // Emit event to client with the message status
//         if (response.success) {
//           io.emit('message', response.message); // Emit the saved message to all clients
//         }
//         if (callback && typeof callback === "function") {
//           callback(response);
//         }
//       });
//     });
//   });

io.on('connection', (socket) => {
    console.log('A user connected with socket ID:', socket.id);
  
    socket.on('setUserId', (userId) => {
      socketIdMap.set(userId, socket.id);
    });
  
    socket.on('chatMessage', (message, callback) => {
      sendMessage(message, (response) => {
        if (response.success) {
          io.emit('message', response.message);
        }
        if (callback && typeof callback === "function") {
          callback(response);
        }
      });
    });
  
    socket.on('sendNotification', (data) => {
      const { sender, receiver, type, message } = data;
  
      // Make a POST request to the backend to create a new notification
      fetch('http://145.223.101.250:3000/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, senderId: sender, receiverId: receiver, message }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Notification sent successfully
            console.log('Notification sent successfully:', data.message);
          } else {
            console.error('Error sending notification:', data.message);
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    });
  
    socket.on('disconnect', () => {
      // Remove the user's entry from the socketIdMap when they disconnect.
      for (const [userId, socketId] of socketIdMap.entries()) {
        if (socketId === socket.id) {
          socketIdMap.delete(userId);
          console.log(`User with ID ${userId} disconnected.`);
          break;
        }
      }
    });
  });
  

app.get('/error', (req, res, next) => {
    const err = new Error('This is an error');
    err.status = 400;
    next(err);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/home.html');
});

dbConnect();

app.use((err, req, res, next) => {
    const errorStatus = err.status || 500;
    const errorMessage = err.message || 'Something went wrong!';

    return res.status(errorStatus).json({ success: false, error: errorMessage });
});

app.use(SendOffer);




// Change app.listen to server.listen
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

