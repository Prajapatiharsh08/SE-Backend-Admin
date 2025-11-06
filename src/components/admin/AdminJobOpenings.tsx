"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"

interface JobOpening {
  _id: string
  title: string
  department: string
  location: string
  type: string
  salary: string
  description: string
  responsibilities: string[]
  qualifications: string[]
  benefits: string[]
}

const AdminJobOpenings = () => {
  const { token } = useSelector((state: RootState) => state.auth)
  const [jobs, setJobs] = useState<JobOpening[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    salary: "",
    description: "",
    responsibilities: "",
    qualifications: "",
    benefits: "",
  })

  useEffect(() => {
    fetchJobs()
  }, [token])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const res = await fetch("http://localhost:5000/api/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setJobs(data)
    } catch (error) {
      console.error("Error fetching jobs:", error)
      setError("Failed to load jobs")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.department) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setError("")
      setSuccess("")

      const payload = {
        ...formData,
        responsibilities: formData.responsibilities.split("\n").filter((r) => r.trim()),
        qualifications: formData.qualifications.split("\n").filter((q) => q.trim()),
        benefits: formData.benefits.split("\n").filter((b) => b.trim()),
      }

      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `http://localhost:5000/api/jobs/${editingId}` : "http://localhost:5000/api/jobs"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Failed to save job")

      setSuccess(editingId ? "Job updated successfully!" : "Job created successfully!")

      setTimeout(() => {
        setIsOpen(false)
        setFormData({
          title: "",
          department: "",
          location: "",
          type: "Full-time",
          salary: "",
          description: "",
          responsibilities: "",
          qualifications: "",
          benefits: "",
        })
        setEditingId(null)
        fetchJobs()
      }, 500)
    } catch (error) {
      console.error("Error saving job:", error)
      setError("Failed to save job. Please try again.")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this job opening?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/jobs/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Delete failed")
        setSuccess("Job deleted successfully!")
        fetchJobs()
      } catch (error) {
        console.error("Error deleting job:", error)
        setError("Failed to delete job")
      }
    }
  }

  const handleEdit = (job: JobOpening) => {
    setFormData({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      salary: job.salary,
      description: job.description,
      responsibilities: job.responsibilities.join("\n"),
      qualifications: job.qualifications.join("\n"),
      benefits: job.benefits.join("\n"),
    })
    setEditingId(job._id)
    setIsOpen(true)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setEditingId(null)
      setFormData({
        title: "",
        department: "",
        location: "",
        type: "Full-time",
        salary: "",
        description: "",
        responsibilities: "",
        qualifications: "",
        benefits: "",
      })
      setError("")
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-secondary">Job Openings</h2>
          <p className="text-muted-foreground">Manage career positions</p>
        </div>
        <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setEditingId(null)}
            >
              <Plus className="w-4 h-4" />
              Add Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
            <DialogHeader>
              <DialogTitle className="text-secondary">
                {editingId ? "Edit Job Opening" : "Add New Job Opening"}
              </DialogTitle>
            </DialogHeader>

            {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">{error}</div>}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">{success}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Job Title *"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="border-border"
                />
                <Input
                  placeholder="Department *"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                  className="border-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Location *"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="border-border"
                />
                <select
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <Input
                placeholder="Salary Range (e.g., $100k - $140k) *"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                required
                className="border-border"
              />

              <Textarea
                placeholder="Job Description *"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
                className="border-border"
              />

              <Textarea
                placeholder="Responsibilities (one per line)"
                value={formData.responsibilities}
                onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                rows={3}
                className="border-border"
              />

              <Textarea
                placeholder="Qualifications (one per line)"
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                rows={3}
                className="border-border"
              />

              <Textarea
                placeholder="Benefits (one per line)"
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                rows={3}
                className="border-border"
              />

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {editingId ? "Update Job" : "Create Job"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <Card key={job._id} className="p-4 hover:shadow-lg transition-shadow border-border bg-card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-secondary">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {job.department} • {job.location} • {job.type} • {job.salary}
                  </p>
                  <p className="text-sm mt-2 text-foreground">{job.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(job)}
                    className="gap-2 border-border hover:bg-primary/10"
                  >
                    <Edit2 className="w-4 h-4 text-primary" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(job._id)} className="gap-2">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">No jobs yet. Create your first job opening!</p>
        )}
      </div>
    </div>
  )
}

export default AdminJobOpenings
