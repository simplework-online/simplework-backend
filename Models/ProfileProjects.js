const mongoose = require("mongoose");
const User = require("./User");

const ProjectSchema = new mongoose.Schema({
    title: { type: String,  },
    image: { type: String,  },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});
module.exports = mongoose.model("ProfileProjects", ProjectSchema);