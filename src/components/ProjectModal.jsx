import { useEffect, useRef } from 'react'

function ProjectModal({ project, onClose }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (project && !dialog.open) {
      dialog.showModal()
    }

    if (!project && dialog.open) {
      dialog.close()
    }
  }, [project])

  const closeDialog = () => {
    dialogRef.current?.close()
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      closeDialog()
    }
  }

  const handleImageError = (event) => {
    if (!project?.fallbackImage) return

    event.currentTarget.onerror = null
    event.currentTarget.src = project.fallbackImage
  }

  return (
    <dialog
      className="project-modal"
      ref={dialogRef}
      onClose={onClose}
      onClick={handleBackdropClick}
      aria-labelledby={project ? `${project.id}-modal-title` : undefined}
      aria-describedby={project ? `${project.id}-modal-description` : undefined}
    >
      {project && (
        <div className="project-modal-shell">
          <div className="project-modal-topline">
            <span className="project-modal-mark" aria-hidden="true">✦</span>
            <span>{project.category}</span>
            <button
              className="project-modal-close"
              type="button"
              onClick={closeDialog}
              autoFocus
            >
              Close <span aria-hidden="true">×</span>
            </button>
          </div>

          <div className="project-modal-grid">
            <figure
              className={`project-modal-visual ${
                project.modalImageFit === 'contain'
                  ? 'project-modal-visual-contain'
                  : ''
              }`}
            >
              <img
                src={project.image}
                alt={project.imageAlt ?? `${project.title} project preview`}
                decoding="async"
                onError={handleImageError}
              />
            </figure>

            <div className="project-modal-copy">
              <p className="project-modal-year">{project.year}</p>
              <h2 id={`${project.id}-modal-title`}>{project.title}</h2>
              <p
                className="project-modal-description"
                id={`${project.id}-modal-description`}
              >
                {project.description}
              </p>

              <dl className="project-modal-meta">
                {project.role && (
                  <div>
                    <dt>Contribution</dt>
                    <dd>{project.role}</dd>
                  </div>
                )}

                {project.tools?.length > 0 && (
                  <div>
                    <dt>Tools</dt>
                    <dd>{project.tools.join(' · ')}</dd>
                  </div>
                )}
              </dl>

              <div className="project-modal-action-row">
                {project.link ? (
                  <a
                    className="project-live-link"
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {project.linkLabel ?? 'View Live'}
                    <span aria-hidden="true"> ↗</span>
                  </a>
                ) : (
                  <p className="project-live-unavailable">
                    {project.liveStatus ?? 'No public build available yet.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </dialog>
  )
}

export default ProjectModal
