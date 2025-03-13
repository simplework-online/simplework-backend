const mongoose = require('mongoose');
const FileSchema = new mongoose.Schema({
    filesUrl: { type: [Object], required: true, },
    // fileSize: {
    //     type: Number,
    // },
}
    , { timestamps: true }
)
module.exports = mongoose.model("File", FileSchema)

