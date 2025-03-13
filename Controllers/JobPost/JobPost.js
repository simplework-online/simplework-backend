const Job = require("../../Models/JobPost");

const postajob = async (req, res, next) => {
  try {
    const newJob = await Job({
      ...req.body,
    });
    if (!newJob) {
      return res.status(400).json({ message: "Invalid job post" });
    }
    const job = await newJob.save();
    if (!job) {
      return res.status(500).json({ message: "Failed to post job" });
    }
    res.status(201).json({ message: "Job created successfully", job });
  } catch (error) {
    res.status(500).json({ message: "Failed to post job", error });
  }
};

const getJobDetail=async(req,res)=>{
  const {jobId}=req.params
  if(!jobId){
    return res.status(400).json({ message: "Job id missing" });
  }
  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "No jobs found" });
    }
    res.status(200).json({ message: "Job fetched successfully", job });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch job details", error });
  }
}
const getAllJobs = async (req, res) => {
  const { category, priceMin, priceMax, level } = req.query;
  const query = {};
  
  if (category) query["category.category_name"] = category;
  if (level) query.experience_level = level;

  // Handle price range
  const min = priceMin ? parseInt(priceMin, 10) : 0;
  const max = priceMax ? parseInt(priceMax, 10) : undefined;
  
  if (priceMax) {
    query["salary.min"] = { $gte: min };
    query["salary.max"] = { $lte: max };
  } else if (priceMin) {
    query["salary.min"] = { $gte: min };
  }
  try {
    const jobs = await Job.find(query);
    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ message: "No jobs found" });
    }
    res.status(200).json({ message: "Job fetched successfully", jobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch jobs", error });
  }
};


const applyForJob = async (req, res) => {
  const { jobId } = req.params;
  const { userId, coverLetter, attachments, paymentType, milestoneDetails } = req.body;

  if (!jobId || !userId) {
    return res.status(400).json({ message: "Job ID and User ID are required" });
  }

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.applicants?.some((applicant) => applicant.userId.toString() === userId)) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    job.applicants.push({
      userId,
      coverLetter,
      attachments,
      paymentType,
      milestoneDetails,
      appliedAt: new Date(),
    });

    await job.save();
    res.status(200).json({ message: "Job application submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to apply for job", error });
  }
};


module.exports = { postajob, getAllJobs,getJobDetail,applyForJob };
