import express from "express"
import JobOpening from "../models/JobOpening.js"
import { verifyToken } from "./auth.js"

const router = express.Router()

// Get all job openings (public)
router.get("/", async (req, res) => {
  try {
    const jobs = await JobOpening.find().sort({ createdAt: -1 })
    res.json(jobs)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single job opening
router.get("/:id", async (req, res) => {
  try {
    const job = await JobOpening.findById(req.params.id)
    if (!job) return res.status(404).json({ error: "Job not found" })
    res.json(job)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create job opening (admin only)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, department, location, type, salary, description, responsibilities, qualifications, benefits } =
      req.body

    if (!title || !department || !location || !type || !salary || !description) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const job = new JobOpening({
      title,
      department,
      location,
      type,
      salary,
      description,
      responsibilities: responsibilities || [],
      qualifications: qualifications || [],
      benefits: benefits || [],
    })

    await job.save()
    res.json(job)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update job opening (admin only)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { title, department, location, type, salary, description, responsibilities, qualifications, benefits } =
      req.body

    const updateData = {
      title,
      department,
      location,
      type,
      salary,
      description,
      responsibilities: responsibilities || [],
      qualifications: qualifications || [],
      benefits: benefits || [],
      updatedAt: new Date(),
    }

    const job = await JobOpening.findByIdAndUpdate(req.params.id, updateData, { new: true })
    res.json(job)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete job opening (admin only)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await JobOpening.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: "Job deleted" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
