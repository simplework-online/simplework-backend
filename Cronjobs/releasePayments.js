const cron = require("node-cron");
const Transaction = require("../Models/Transaction");
const Wallet = require("../Models/Wallet");

const releasePendingPayments = async () => {
  try {
    const now = new Date();

    // Find all transactions eligible for release
    const transactions = await Transaction.find({
      status: "Pending",
      releaseDate: { $lte: now },
    });

    if (transactions.length === 0) return;

    // Aggregate total earnings per seller
    const walletUpdates = {};
    transactions.forEach((transaction) => {
      const sellerId = transaction.sellerId.toString();
      if (!walletUpdates[sellerId]) {
        walletUpdates[sellerId] = { addToBalance: 0, subtractFromPending: 0 };
      }
      walletUpdates[sellerId].addToBalance += transaction.amount;
      walletUpdates[sellerId].subtractFromPending += transaction.amount;
    });

    // Use bulkWrite to update wallets efficiently
    const bulkOps = Object.keys(walletUpdates).map((sellerId) => ({
      updateOne: {
        filter: { userId: sellerId },
        update: {
          $inc: {
            balance: walletUpdates[sellerId].addToBalance,
            pendingBalance: -walletUpdates[sellerId].subtractFromPending,
          },
        },
      },
    }));

    await Wallet.bulkWrite(bulkOps);

    // Mark all transactions as "Released" in one go
    await Transaction.updateMany(
      { _id: { $in: transactions.map((t) => t._id) } },
      { $set: { status: "Released" } }
    );

    console.log(`✅ Released ${transactions.length} payments successfully.`);
  } catch (error) {
    console.error("❌ Error releasing payments:", error);
  }
};

cron.schedule("0 */6 * * *", releasePendingPayments);

module.exports = releasePendingPayments;
