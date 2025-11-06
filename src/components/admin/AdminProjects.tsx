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
import { Plus, Edit2, Trash2, ImageIcon } from "lucide-react"
import { LoadingSpinner } from "@/components/common/LoadingSpinner"

interface Project {
  _id: string
  title: string
  category: string
  location: string
  year: string
  imagePath: string
  description?: string
  client?: string
  area?: string
  engineeringChallenges: string
  technicalSolutions: string
  results: string
  galleryImages?: string[]
}

const AdminProjects = () => {
  const { token } = useSelector((state: RootState) => state.auth)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    category: "Commercial",
    location: "",
    year: new Date().getFullYear().toString(),
    description: "",
    client: "",
    area: "",
    engineeringChallenges: "",
    technicalSolutions: "",
    results: "",
    image: null as File | null,
    galleryImages: [] as File[],
  })

  useEffect(() => {
    fetchProjects()
  }, [token])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const res = await fetch("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setProjects(data)
    } catch (error) {
      console.error("Error fetching projects:", error)
      setError("Failed to load projects")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.engineeringChallenges) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setError("")
      setSuccess("")

      const formDataToSend = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "image" && key !== "galleryImages" && value) {
          formDataToSend.append(key, value as string)
        }
      })

      if (formData.image) {
        formDataToSend.append("image", formData.image)
      }

      formData.galleryImages.forEach((file) => {
        formDataToSend.append("gallery", file)
      })

      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `http://localhost:5000/api/projects/${editingId}` : "http://localhost:5000/api/projects"

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      setSuccess(editingId ? "Project updated successfully!" : "Project created successfully!")

      setTimeout(() => {
        setIsOpen(false)
        setFormData({
          title: "",
          category: "Commercial",
          location: "",
          year: new Date().getFullYear().toString(),
          description: "",
          client: "",
          area: "",
          engineeringChallenges: "",
          technicalSolutions: "",
          results: "",
          image: null,
          galleryImages: [],
        })
        setEditingId(null)
        fetchProjects()
      }, 500)
    } catch (error) {
      console.error("Error saving project:", error)
      setError("Failed to save project. Please try again.")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Delete failed")
        setSuccess("Project deleted successfully!")
        fetchProjects()
      } catch (error) {
        console.error("Error deleting project:", error)
        setError("Failed to delete project")
      }
    }
  }

  const handleEdit = (project: Project) => {
    setFormData({
      title: project.title,
      category: project.category,
      location: project.location,
      year: project.year,
      description: project.description || "",
      client: project.client || "",
      area: project.area || "",
      engineeringChallenges: project.engineeringChallenges,
      technicalSolutions: project.technicalSolutions,
      results: project.results,
      image: null,
      galleryImages: [],
    })
    setEditingId(project._id)
    setIsOpen(true)
  }

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData({
      ...formData,
      galleryImages: files,
    })
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setEditingId(null)
      setFormData({
        title: "",
        category: "Commercial",
        location: "",
        year: new Date().getFullYear().toString(),
        description: "",
        client: "",
        area: "",
        engineeringChallenges: "",
        technicalSolutions: "",
        results: "",
        image: null,
        galleryImages: [],
      })
      setError("")
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-secondary">Projects</h2>
          <p className="text-muted-foreground">Manage your portfolio projects</p>
        </div>
        <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setEditingId(null)}
            >
              <Plus className="w-4 h-4" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
            <DialogHeader>
              <DialogTitle className="text-secondary">{editingId ? "Edit Project" : "Add New Project"}</DialogTitle>
            </DialogHeader>

            {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">{error}</div>}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">{success}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Project Title *"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="border-border"
                />

                <select
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Residential">Residential</option>
                  <option value="Spiritual">Spiritual</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Location *"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="border-border"
                />
                <Input
                  placeholder="Year *"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  required
                  className="border-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Client"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="border-border"
                />
                <Input
                  placeholder="Area"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="border-border"
                />
              </div>

              <Textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="border-border"
              />

              <Textarea
                placeholder="Engineering Challenges *"
                value={formData.engineeringChallenges}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    engineeringChallenges: e.target.value,
                  })
                }
                rows={3}
                required
                className="border-border"
              />

              <Textarea
                placeholder="Technical Solutions *"
                value={formData.technicalSolutions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    technicalSolutions: e.target.value,
                  })
                }
                rows={3}
                required
                className="border-border"
              />

              <Textarea
                placeholder="Results *"
                value={formData.results}
                onChange={(e) => setFormData({ ...formData, results: e.target.value })}
                rows={3}
                required
                className="border-border"
              />

              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      image: e.target.files?.[0] || null,
                    })
                  }
                  className="flex-1"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  Project Gallery Images
                </label>
                <input type="file" accept="image/*" multiple onChange={handleGalleryChange} className="flex-1 w-full" />
                <p className="text-xs text-muted-foreground">
                  Upload multiple images for the project gallery (display 4-8 images in 4-column grid)
                </p>
                {formData.galleryImages.length > 0 && (
                  <p className="text-sm text-primary font-semibold">{formData.galleryImages.length} images selected</p>
                )}
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {editingId ? "Update Project" : "Create Project"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {projects.length > 0 ? (
          projects.map((project) => (
            <Card key={project._id} className="p-4 hover:shadow-lg transition-shadow border-border bg-card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-secondary">{project.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {project.category} • {project.location} • {project.year}
                  </p>
                  <p className="text-sm mt-2 text-foreground">{project.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(project)}
                    className="gap-2 border-border hover:bg-primary/10"
                  >
                    <Edit2 className="w-4 h-4 text-primary" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(project._id)} className="gap-2">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">No projects yet. Create your first project!</p>
        )}
      </div>
    </div>
  )
}

export default AdminProjects
