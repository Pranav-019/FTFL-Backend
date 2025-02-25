const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../cloudinary");
const Job = require("../models/Job");

// Middleware to parse JSON requests
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Multer storage for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// ✅ Create a New Job Listing
router.post("/post-job", async (req, res) => {
    try {
        const {
            jobTitle, jobDescription, experience, postDate, applyDeadline, 
            jobType, salary, qualification, openingType, jobDepartment, jobLocation,
            requirements, workEnvironment, benefits
        } = req.body;

        const job = new Job({
            jobTitle,
            jobDescription,
            experience,
            postDate: postDate || Date.now(),
            applyDeadline,
            jobType,
            salary,
            qualification,
            openingType,
            jobDepartment,
            jobLocation,
            requirements: {
                mustHave: requirements.mustHave || [],
                niceToHave: requirements.niceToHave || []
            },
            workEnvironment: workEnvironment || [],
            benefits: benefits || []
        });

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
        const { fullName, mobileNumber, email, workplaceType, employmentType, jobLocation, backgroundDescription } = req.body;

        if (!fullName || !mobileNumber || !email || !workplaceType || !employmentType || !jobLocation) {
            return res.status(400).json({ success: false, error: "All required fields must be filled." });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, error: "Job not found." });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, error: "Resume file is required." });
        }

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
            console.error("Error uploading resume:", uploadError);
            return res.status(500).json({ success: false, error: "Error uploading resume." });
        }

        job.applications.push({ fullName, mobileNumber, email, workplaceType, employmentType, jobLocation, resume: resumeUrl, backgroundDescription });
        await job.save();

        res.status(201).json({ success: true, message: "Application submitted successfully!", job });
    } catch (error) {
        console.error("Error applying for job:", error);
        res.status(500).json({ success: false, error: "Internal server error. Please try again later." });
    }
});

//update Job
router.put("/update-job/:jobId", async (req, res) => {
    try {
        const { jobId } = req.params;
        const updates = req.body;

        const job = await Job.findByIdAndUpdate(jobId, updates, { new: true, runValidators: true });
        
        if (!job) {
            return res.status(404).json({ success: false, error: "Job not found" });
        }

        res.status(200).json({ success: true, message: "Job updated successfully!", job });
    } catch (error) {
        console.error("Error updating job:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});


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

        job.applications.splice(applicationIndex, 1);
        await job.save();

        res.status(200).json({ success: true, message: "Application deleted successfully!" });
    } catch (error) {
        console.error("Error deleting application:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ Update Job Data
router.put("/update-job/:jobId", async (req, res) => {
    try {
        const { jobId } = req.params;
        const { requirements, workEnvironment, benefits, ...updates } = req.body;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, error: "Job not found" });
        }

        if (requirements) {
            job.requirements.mustHave = requirements.mustHave || job.requirements.mustHave;
            job.requirements.niceToHave = requirements.niceToHave || job.requirements.niceToHave;
        }

        if (workEnvironment) job.workEnvironment = workEnvironment;
        if (benefits) job.benefits = benefits;

        Object.assign(job, updates);
        await job.save();

        res.status(200).json({ success: true, message: "Job updated successfully!", job });
    } catch (error) {
        console.error("Error updating job:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
