const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../cloudinary");
const Job = require("../models/Job");
const { body, validationResult } = require("express-validator");

// Middleware to parse JSON requests properly
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Multer memory storage for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: multer.memoryStorage(), // Store file in memory for Cloudinary upload
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
  });



// ✅ Create a New Job Listing
router.post("/post-job", async (req, res) => {
    try {
        const job = new Job(req.body);
        await job.save();
        res.status(201).json({ message: "Job posted successfully!", job });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ✅ Fetch All Job Listings
router.get("/all-jobs", async (req, res) => {
    try {
        const jobs = await Job.find();
        res.status(200).json({ success: true, jobs });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ Fetch All Applications for a Specific Job
router.get("/applications/:jobId", async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({ success: false, error: "Job not found" });
        }

        res.status(200).json({ success: true, applications: job.applications });
    } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ Apply for a Job with Resume Upload
router.post("/apply/:jobId", upload.single("resume"), async (req, res) => {
    try {
      const { jobId } = req.params;
      const {
        fullName,
        mobileNumber,
        email,
        workplaceType,
        employmentType,
        jobLocation,
        backgroundDescription,
      } = req.body;
  
      // Validate required fields
      if (!fullName || !mobileNumber || !email || !workplaceType || !employmentType || !jobLocation) {
        return res.status(400).json({ success: false, error: "All required fields must be filled." });
      }
  
      // Check if the job exists
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ success: false, error: "Job not found." });
      }
  
      // Validate file upload
      if (!req.file) {
        return res.status(400).json({ success: false, error: "Resume file is required." });
      }
  
      // Upload resume to Cloudinary
      let resumeUrl;
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "raw" },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          stream.end(req.file.buffer);
        });
        resumeUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Error uploading resume to Cloudinary:", uploadError);
        return res.status(500).json({ success: false, error: "Error uploading resume." });
      }
  
      // Add application to the job
      job.applications.push({
        fullName,
        mobileNumber,
        email,
        workplaceType,
        employmentType,
        jobLocation,
        resume: resumeUrl,
        backgroundDescription,
      });
  
      // Save the updated job
      await job.save();
  
      // Return success response
      res.status(201).json({ success: true, message: "Application submitted successfully!", job });
    } catch (error) {
      console.error("Error applying for job:", error);
      res.status(500).json({ success: false, error: "Internal server error. Please try again later." });
    }
  });
  
  module.exports = router;
// ✅ Delete Job
router.delete("/delete-job/:jobId", async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await Job.findByIdAndDelete(jobId);

        if (!job) {
            return res.status(404).json({ success: false, error: "Job not found" });
        }

        res.status(200).json({ success: true, message: "Job deleted successfully!" });
    } catch (error) {
        console.error("Error deleting job:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ Delete Job Application
router.delete("/delete-application/:jobId/:appId", async (req, res) => {
    try {
        const { jobId, appId } = req.params;
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({ success: false, error: "Job not found" });
        }

        const applicationIndex = job.applications.findIndex(app => app._id.toString() === appId);
        if (applicationIndex === -1) {
            return res.status(404).json({ success: false, error: "Application not found" });
        }

        // Remove application from job applications array
        job.applications.splice(applicationIndex, 1);
        await job.save();

        res.status(200).json({ success: true, message: "Application deleted successfully!" });
    } catch (error) {
        console.error("Error deleting application:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;