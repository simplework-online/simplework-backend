const express = require("express");
const { postajob, getAllJobs, getJobDetail, applyForJob } = require("../Controllers/JobPost/JobPost");
const { auth } = require("../Middlewares/auth");

const router = express.Router();

router.post("/postajob", auth, postajob);
router.get("/getAllJobs", auth, getAllJobs);
router.get("/getJobDetail/:jobId", auth, getJobDetail);
router.post("/apply/:jobId", auth, applyForJob);


module.exports = router;
