function ProjectCard({ project, index, onOpen }) {
  const openProject = () => onOpen(project)
  const imageClassName = project.imageFit === 'contain'
    ? 'project-image project-image-contain'
    : 'project-image'

  const handleImageError = (event) => {
    if (!project.fallbackImage) return

    event.currentTarget.onerror = null
    event.currentTarget.src = project.fallbackImage
  }

  return (
    <article className="project-card">
      <span className="project-index">
        {String(index + 1).padStart(2, '0')}
      </span>

      <button
        className="project-frame project-trigger"
        type="button"
        onClick={openProject}
        aria-label={`Open ${project.title} project details`}
      >
        <img
          className={imageClassName}
          src={project.image}
          alt={project.imageAlt ?? `${project.title} preview`}
          onError={handleImageError}
        />
        <span className="project-frame-hint" aria-hidden="true">
          View details
        </span>
      </button>

      <div className="project-info">
        <h3>{project.title}</h3>

        <p className="project-category">{project.category}</p>

        <div className="project-foot">
          <span className="project-year">{project.year}</span>

          <button
            className="project-details-link"
            type="button"
            onClick={openProject}
          >
            View details
            <span aria-hidden="true"> ↗</span>
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProjectCard
