const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const dbConnect = require('./Config/mongo');
const { sendMessage } = require('./Controllers/Chat/Message');
const notificationRoutes = require('./Routes/notification');
const notificationController = require('./Controllers/Notification/notification');
const orderRoutes = require('./Routes/Order');
const SendOffer = require('./Routes/sendOffer');
const UpdateProfile = require('./Routes/updateProfile');

// const PORT = process.env.PORT || 3000;

// Allowed Origins
const allowedOrigins = [
    'http://145.223.101.250:3003',
    'http://145.223.101.250:3002',
    'http://145.223.101.250:3001',
    'http://145.223.101.250:3000',
    'http://145.223.101.250',
    'https://simplework.online',
    'http://simplework.online',
    'https://64d0e60e759c686d7b0305fd--grand-tanuki-76c5f9.netlify.app'
];

// Proper CORS Middleware
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS Not Allowed'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(cookieParser());
app.use(fileUpload({ useTempFiles: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// WebSocket Setup
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    },
});

// Export the io object for use in routes
module.exports.io = io;

const socketIdMap = notificationController.socketIdMap;

// WebSocket Connection
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
        for (const [userId, socketId] of socketIdMap.entries()) {
            if (socketId === socket.id) {
                socketIdMap.delete(userId);
                console.log(`User with ID ${userId} disconnected.`);
                break;
            }
        }
    });
});

// Routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/', require('./Routes/RootRoute'));
app.use(UpdateProfile);
app.use('/api/orders', orderRoutes);
app.use(SendOffer);

// Error Handling Middleware
app.use((err, req, res, next) => {
    const errorStatus = err.status || 500;
    const errorMessage = err.message || 'Something went wrong!';
    return res.status(errorStatus).json({ success: false, error: errorMessage });
});

// Connect to Database
dbConnect();

// Start Server
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
