import express from "express"
import Project from "../models/Project.js"
import { verifyToken } from "./auth.js"
import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"

const router = express.Router()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads")
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const uploadMultiple = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
})

// Get all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 })
    res.json(projects)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single project
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ error: "Project not found" })
    res.json(project)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create project (admin only)
router.post(
  "/",
  verifyToken,
  uploadMultiple.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 20 },
  ]),
  async (req, res) => {
    try {
      const {
        title,
        category,
        location,
        year,
        description,
        client,
        area,
        span,
        engineeringChallenges,
        technicalSolutions,
        results,
      } = req.body

      if (
        !title ||
        !category ||
        !location ||
        !year ||
        !engineeringChallenges ||
        !technicalSolutions ||
        !results ||
        !req.files?.image
      ) {
        return res.status(400).json({ error: "Missing required fields" })
      }

      const galleryPaths = req.files.gallery ? req.files.gallery.map((file) => `/uploads/${file.filename}`) : []

      const project = new Project({
        title,
        category,
        location,
        year,
        imagePath: `/uploads/${req.files.image[0].filename}`,
        gallery: galleryPaths,
        description,
        client,
        area,
        span,
        engineeringChallenges,
        technicalSolutions,
        results,
      })

      await project.save()
      res.json(project)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },
)

// Update project (admin only)
router.put(
  "/:id",
  verifyToken,
  uploadMultiple.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 20 },
  ]),
  async (req, res) => {
    try {
      const {
        title,
        category,
        location,
        year,
        description,
        client,
        area,
        span,
        engineeringChallenges,
        technicalSolutions,
        results,
      } = req.body

      const updateData = {
        title,
        category,
        location,
        year,
        description,
        client,
        area,
        span,
        engineeringChallenges,
        technicalSolutions,
        results,
        updatedAt: new Date(),
      }

      if (req.files?.image) {
        updateData.imagePath = `/uploads/${req.files.image[0].filename}`
      }

      if (req.files?.gallery) {
        updateData.gallery = req.files.gallery.map((file) => `/uploads/${file.filename}`)
      }

      const project = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true })
      res.json(project)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },
)

// Delete project (admin only)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: "Project deleted" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
