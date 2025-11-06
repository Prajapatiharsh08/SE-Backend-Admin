import mongoose from "mongoose"

const jobOpeningSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true, enum: ["Full-time", "Part-time", "Internship", "Contract"] },
  salary: { type: String, required: true },
  description: { type: String, required: true },
  responsibilities: [String],
  qualifications: [String],
  benefits: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export default mongoose.model("JobOpening", jobOpeningSchema)
