const paypal = require("paypal-rest-sdk");
const paypalConfig = {
  mode: "sandbox", // Use "live" for production
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
};

paypal.configure(paypalConfig);

module.exports = paypal;
