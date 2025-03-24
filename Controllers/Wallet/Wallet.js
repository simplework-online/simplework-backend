const Wallet = require("../../Models/Wallet");
const User = require("../../Models/User");
const Stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const axios = require("axios");
const fetchWallet = async (req, res) => {
  try {
    const userId = req.payload._id;
    let wallet = await Wallet.findOne({ userId });

    // If wallet doesn't exist, return default values
    if (!wallet) {
      wallet = {
        balance: 0,
        pendingBalance: 0,
        stripeAccountId: null,
        paypalEmail: null,
      };
    }

    return res.status(200).json(wallet);
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const connectStripe = async (req, res) => {
  try {
    const userId = req.payload._id;
    const { code, state } = req.body;
    console.log(code, process.env.STRIPE_SECRET_KEY);

    const response = await Stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    });
    console.log(response);
    const stripeUserId = response.stripe_user_id;

    let wallet = await Wallet.findOne({ userId: userId });

    if (wallet) {
      wallet.stripeAccountId = stripeUserId;
      await wallet.save();
    } else {
      // Create a new wallet for the user
      wallet = new Wallet({
        userId: userId,
        stripeAccountId: stripeUserId,
        pendingBalance: 0,
        balance: 0,
      });
      await wallet.save();
    }

    res.json({ success: true, message: "Stripe account connected!", wallet });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to connect Stripe" });
  }
};

const connectStripeNew = async (req, res) => {
  try {
    const STRIPE_CLIENT_ID = process.env.STRIPE_CLIENT_ID;
    const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
    const { code, state } = req.query;
    const userId = state;

    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    // Exchange code for access token
    const { data } = await axios.post(
      "https://connect.stripe.com/oauth/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: STRIPE_CLIENT_ID,
        client_secret: STRIPE_SECRET,
        code,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const stripeUserId = data.stripe_user_id;
    const accessToken = data.access_token;

    // Fetch account details
    const accountDetails = await axios.get(
      `https://api.stripe.com/v1/accounts/${stripeUserId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const stripeAccountId = accountDetails.data.id;

    // Store Stripe email in the database

    let wallet = await Wallet.findOne({ userId });

    if (wallet) {
      wallet.stripeAccountId = stripeAccountId;
      await wallet.save();
    } else {
      wallet = new Wallet({
        userId,
        stripeAccountId,
        pendingBalance: 0,
        balance: 0,
      });
      await wallet.save();
    }

    res.redirect(`${process.env.FRONTEND_URL}/success`);
  } catch (error) {
    console.error("Stripe OAuth Error:", error);
    res.status(500).json({ error: "Failed to connect Stripe" });
  }
};
const connectPayPal = async (req, res) => {
  const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
  const PAYPAL_SECRET = process.env.PAYPAL_CLIENT_SECRET;

  // Get authorization code from frontend
  const { code, state } = req.body;
  console.log(code);
  const userId = req.payload._id;

  if (!code) {
    return res.status(400).json({ error: "Authorization code is required" });
  }

  try {
    // Exchange code for access token
    const { data } = await axios.post(
      "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      new URLSearchParams({ grant_type: "authorization_code", code }),
      {
        auth: { username: PAYPAL_CLIENT_ID, password: PAYPAL_SECRET },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const accessToken = data.access_token;

    // Fetch user info
    const userInfo = await axios.get(
      "https://api-m.sandbox.paypal.com/v1/identity/oauth2/userinfo?schema=paypalv1.1",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const emails = userInfo.data.emails;
    const primaryEmail = emails.find(
      (email) => email.primary && email.confirmed
    );

    let wallet = await Wallet.findOne({ userId });

    if (wallet) {
      wallet.paypalEmail = primaryEmail.value;
      await wallet.save();
    } else {
      // Create a new wallet for the user
      wallet = new Wallet({
        userId,
        paypalEmail: primaryEmail.value,
        pendingBalance: 0,
        balance: 0,
      });
      await wallet.save();
    }

    res.json({ success: true, message: "PayPal account connected!", wallet });
  } catch (error) {
    console.error("PayPal OAuth Error:", error);
    res.status(500).json({ error: "Failed to connect PayPal" });
  }
};

module.exports = {
  fetchWallet,
  connectStripe,
  connectPayPal,
  connectStripeNew,
};
