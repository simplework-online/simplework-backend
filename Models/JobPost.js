const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: false },
  description: { type: String, required: false },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  experience_level: { type: String, required: false },
  salary: {
    min: { type: Number, required: false },
    max: { type: Number, required: false }
  },
  jobStatus: { type: String, default: "pending" },
  category: {
    category_name: { type: String, required: false },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: false },
  },
  job_timeline: { type: String, required: false },
  // is_immediate: { type: Boolean, required: false },
  profileImage: { type: String, default: "" },
  applicants: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
      coverLetter: { type: String, required: false },
      attachments: [{ type: String, required: false }],
      paymentType: { type: String, enum: ["single", "milestone"], required: false },
      milestoneDetails: { type: Object, required: false },
      appliedAt: { type: Date, default: Date.now }
    }
  ]
},
{
  timestamps: true  
}
);

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
