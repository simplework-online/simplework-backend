const express = require("express");
const app = express();
require("dotenv").config();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const dbConnect = require("./Config/mongo");
const { sendMessage } = require("./Controllers/Chat/Message");
const notificationRoutes = require("./Routes/notification");
const notificationController = require("./Controllers/Notification/notification");
const orderRoutes = require("./Routes/Order");
const SendOffer = require("./Routes/sendOffer");
const UpdateProfile = require("./Routes/updateProfile");
const Transaction = require("./Models/Transaction");
const Stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const releasePendingPayments = require("./Cronjobs/releasePayments");
const user = require("./Models/User");

const PORT = process.env.PORT || 3000;

// Allowed Origins
const allowedOrigins = [
  "http://145.223.101.250:3003",
  "http://145.223.101.250:3002",
  "http://145.223.101.250:3001",
  "http://145.223.101.250:3000",
  "http://145.223.101.250",
  "https://simplework.online",
  "http://simplework.online",
  "https://64d0e60e759c686d7b0305fd--grand-tanuki-76c5f9.netlify.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://3259-119-73-99-41.ngrok-free.app",
  "*",
];

// Proper CORS Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS Not Allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
  })
);

app.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event;

    try {
      event = Stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"],
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const transactionId = session.metadata.transaction_id;

      try {
        await Transaction.findByIdAndUpdate(transactionId, {
          paymentIntentId: session.payment_intent,
        });

        console.log(`Transaction ${transactionId} marked as Completed`);
      } catch (err) {
        console.error("Transaction update error:", err);
        return res.status(500).send("Transaction update failed");
      }
    }

    res.sendStatus(200);
  }
);
// app.post("/paypal-webhook", express.json(), async (req, res) => {
//   const event = req.body;
//   console.log(
//     "🔔 PayPal Webhook Event Received:",
//     JSON.stringify(event, null, 2)
//   );

//   if (event.event_type === "PAYMENT.SALE.COMPLETED") {
//     console.log("✅ Payment completed successfully!");

//     const saleId = event.resource.id;
//     const transactionId = event.resource.parent_payment;

//     console.log("💰 Sale ID:", saleId);
//     console.log("💳 Transaction ID:", transactionId);

//     await Transaction.findOneAndUpdate(
//       { _id: transactionId }, // Ensure this matches your database field
//       { paypalSaleId: saleId },
//       { new: true }
//     );

//     return res.status(200).send("Payment confirmed and updated.");
//   }

//   res.status(200).send("Webhook received but not a sale completion event.");
// });

app.use(cookieParser());
app.use(fileUpload({ useTempFiles: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/test", (req, res) => {
  return res.status(200).json({ message: "Hi" });
});
// WebSocket Setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

// Export the io object for use in routes
module.exports.io = io;

const socketIdMap = notificationController.socketIdMap;

// WebSocket Connection
io.on("connection", (socket) => {
  console.log("A user connected with socket ID:", socket.id);
  socket.emit("connected", { message: "User connected" });
  socket.on("setUserId", (userId) => {
    socketIdMap.set(userId, socket.id);
    console.log(`User with ID ${userId} connected with socket ID ${socket.id}`);
    //update user status to online
    user.findByIdAndUpdate(userId, { onlineStatus: true }, (err, user) => {
      if (err) {
        console.log("Error updating user status:", err);
      } else {
        console.log("User status updated:", user);
      }
    });
  });

  socket.on("chatMessage", (message, callback) => {
    sendMessage(message, (response) => {
      if (response.success) {
        io.emit("message", response.message);
      }
      if (callback && typeof callback === "function") {
        callback(response);
      }
    });
  });

  socket.on("sendNotification", (data) => {
    const { sender, receiver, type, message } = data;
    console.log("Notification data:", data);
    fetch("http://145.223.101.250:3000/notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        senderId: sender,
        receiverId: receiver,
        message,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("Notification sent successfully:", data.message);
        } else {
          console.error("Error sending notification:", data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of socketIdMap.entries()) {
      if (socketId === socket.id) {
        user.findByIdAndUpdate(userId, { onlineStatus: false }, (err, user) => {
          if (err) {
            console.log("Error updating user status:", err);
          } else {
            console.log("User status updated:", user);
          }
        });
        socketIdMap.delete(userId);
        console.log(`User with ID ${userId} disconnected.`);
        break;
      }
    }
  });
});

// Routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/", require("./Routes/RootRoute"));
app.use(UpdateProfile);
app.use("/api/orders", orderRoutes);
app.use(SendOffer);

// Error Handling Middleware
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  return res.status(errorStatus).json({ success: false, error: errorMessage });
});

// Connect to Database
dbConnet();
releasePendingPayments();
// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
