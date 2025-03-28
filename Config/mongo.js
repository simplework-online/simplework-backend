const mongoose = require("mongoose");
require("dotenv").config();
const MONGO_URL = process.env.MONGO_URL;
mongoose.set("strictQuery", false);
if (!MONGO_URL) {
  throw new Error(
    "Please define the MONGO_URL environment variable inside .env.local"
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      // bufferCommands: false, default false
    };

    cached.promise = mongoose
      .connect(`${MONGO_URL}simplework`, opts)
      .then((mongoose) => {
        console.log("Connected to MongoDB");
        return mongoose;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = dbConnect;
