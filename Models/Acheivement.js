const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    date: { type: Date, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});
module.exports = mongoose.model('Achievement', AchievementSchema);