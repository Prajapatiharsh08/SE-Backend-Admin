"use client"

import { Link } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"
import { LazyImage } from "@/components/common/LazyImage"
import { Button } from "@/components/ui/button"
import { useProjectsAPI } from "@/hooks/useProjectsAPI"

const ProjectsShowcase = () => {
  const { projects: allProjects, loading, error } = useProjectsAPI()

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"

  const getImageURL = (imagePath) =>
    imagePath ? `${BASE_URL}${imagePath}` : "/placeholder.svg"

  // ✅ Limit to top few featured projects
  const projects = allProjects.slice(0, 9)

  if (loading) {
    return (
      <section className="py-24 md:py-32 container-fluid">
        <div className="text-center">
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-24 md:py-32 container-fluid">
        <div className="text-center">
          <p className="text-red-500 text-lg">Error loading projects: {error}</p>
        </div>
      </section>
    )
  }

  if (!projects.length) {
    return (
      <section className="py-24 md:py-32 container-fluid">
        <div className="text-center">
          <p className="text-muted-foreground">No projects available right now.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 md:py-32 container-fluid">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
        <div className="max-w-2xl">
          <p className="text-primary text-sm font-medium uppercase tracking-widest mb-4">
            Featured Work
          </p>
          <h2 className="text-4xl md:text-6xl font-bold leading-tight">
            Projects That Define Excellence
          </h2>
        </div>
        <Link
          to="/projects"
          className="text-sm font-medium text-primary hover:text-primary-glow transition-colors flex items-center gap-2 group"
        >
          View All Projects
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Link>
      </div>

      {/* ✅ Projects Grid (same design as Projects.jsx) */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 auto-rows-[300px] gap-6">
        {projects.map((project, index) => {
          // mimic random asymmetric spans
          const spans = [
            "col-span-1 row-span-2",
            "col-span-1 row-span-1",
            "col-span-1 row-span-1",
            "col-span-1 row-span-2",
            "col-span-1 row-span-1",
            "col-span-1 row-span-1",
          ]
          const spanClass = spans[index % spans.length]

          return (
            <Link
              key={project._id || project.id}
              to={`/projects/${project._id || project.id}`}
              className={`group relative overflow-hidden bg-muted ${spanClass}`}
              style={{
                animation: `fade-in-up 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              {/* Project Image */}
              <div className="absolute inset-0">
                <LazyImage
                  src={getImageURL(project.imagePath || project.image)}
                  alt={project.title}
                  className="w-full h-[630px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-0 inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              </div>

              {/* Project Info */}
              <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
                <p className="text-primary text-xs uppercase tracking-widest font-medium">
                  {project.category} • {project.location} • {project.year}
                </p>
                <h3 className="text-2xl md:text-3xl font-bold leading-tight group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
              </div>

              {/* Hover Arrow */}
              <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-primary/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bg-primary">
                <ArrowUpRight className="h-6 w-6 text-primary-foreground" />
              </div>

              {/* Bottom Accent Line */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-primary group-hover:w-full transition-all duration-700" />
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default ProjectsShowcase
