const paypal = require("../../Utils/paypal.config");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Wallet = require("../../Models/Wallet");
const paypalWithdraw = async (req, res) => {
  const userId = req.payload._id;

  const wallet = await Wallet.findOne({ userId });
  if (!wallet || wallet.balance < 0)
    return res.status(400).json({ error: "Insufficient balance" });

  const payoutJson = {
    sender_batch_header: {
      email_subject: "You have a payout!",
    },
    items: [
      {
        recipient_type: "EMAIL",
        amount: { value: wallet.balance.toFixed(2), currency: "USD" },
        receiver: wallet.paypalEmail,
        note: "Withdrawal from your earnings",
        sender_item_id: userId,
      },
    ],
  };

  paypal.payout.create(payoutJson, async (error, payout) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ error: "Withdrawal failed" });
    }

    wallet.balance = 0;
    await wallet.save();

    res.json({ success: "True", message: "Withdrawal successful!", payout });
  });
};

// Withdraw funds via Stripe
const stripeWithdraw = async (req, res) => {
  const userId = req.payload._id;

  const wallet = await Wallet.findOne({ userId });
  if (!wallet || wallet.balance < 0)
    return res.status(400).json({ error: "Insufficient balance" });

  try {
    const transfer = await stripe.transfers.create({
      amount: wallet.balance * 100,
      currency: "usd",
      destination: wallet.stripeAccountId,
      transfer_group: userId,
    });

    wallet.balance = 0;
    await wallet.save();

    res.json({ success: "True", message: "Withdrawal successful!", transfer });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Withdrawal failed", details: error });
  }
};

module.exports = { stripeWithdraw, paypalWithdraw };
