const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  jobDescription: { type: String, required: true },
  requirements: {
    mustHave: [{ type: String, required: true }],
    niceToHave: [{ type: String }]
  },
  workEnvironment: [{ type: String, required: true }],
  experience: { type: String, required: true },
  benefits: [{ type: String }],
  postDate: { type: Date, default: Date.now },
  applyDeadline: { type: Date, required: true },
  jobType: { type: String, required: true }, // e.g., Full-time, Part-time
  salary: { type: String, required: true },
  qualification: { type: String, required: true },
  openingType: { type: String, required: true }, // e.g., Internship, Permanent
  jobDepartment: { type: String }, // New field
  jobLocation: { type: String }, // New field

  applications: [{
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    email: { type: String, required: true },
    workplaceType: { type: String, required: true }, // Remote, Hybrid, On-site
    employmentType: { type: String, required: true }, // e.g., Internship, Contract
    jobLocation: { type: String },
    resume: { type: String, required: true }, // URL to uploaded resume
    backgroundDescription: { type: String }
  }]
});

module.exports = mongoose.model("Job", jobSchema);
