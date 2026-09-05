import { useEffect, useRef, useState } from 'react'

function LeafMark() {
  return (
    <svg
      className="project-modal-leaf"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M4.5 18.5c6.1-.7 10.6-4.1 13.7-10.8-5.7.2-10.2 2.7-12.3 7.1-1 2.1-1.4 3.7-1.4 3.7Z" />
      <path d="M6.1 17.1c3.2-2 6-4.2 8.6-6.9" />
    </svg>
  )
}

function InstagramShowcase({ instagram }) {
  const [activePost, setActivePost] = useState(instagram.posts[0])
  const [loadedPosts, setLoadedPosts] = useState({})

  useEffect(() => {
    setActivePost(instagram.posts[0])
    setLoadedPosts({})
  }, [instagram])

  const markLoaded = (id) => {
    setLoadedPosts((current) => ({ ...current, [id]: true }))
  }

  return (
    <section className="instagram-showcase" aria-label="ClickMate Rentals Instagram showcase">
      <div className="instagram-showcase-head">
        <div>
          <p className="instagram-kicker">Social branding · Instagram</p>
          <h3>Inside @clickmate__rentals</h3>
        </div>
        <a href={instagram.profileUrl} target="_blank" rel="noreferrer">
          Open Instagram <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div className="instagram-dashboard">
        <div className="instagram-profile">
          <div className="instagram-avatar" aria-hidden="true">CK</div>

          <div className="instagram-profile-copy">
            <div className="instagram-handle-row">
              <strong>@{instagram.handle}</strong>
              <span className="instagram-status-dot" aria-hidden="true" />
            </div>
            <span>{instagram.name}</span>
            <p>{instagram.bio}</p>
            <p className="instagram-location">{instagram.location}</p>
          </div>

          <dl className="instagram-stats">
            {instagram.stats.map((stat) => (
              <div key={stat.label}>
                <dt>{stat.value}</dt>
                <dd>{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="instagram-content">
          <div className="instagram-grid" role="list" aria-label="Instagram post grid">
            {instagram.posts.map((post) => (
              <button
                className={`instagram-grid-item ${activePost.id === post.id ? 'is-active' : ''}`}
                type="button"
                key={post.id}
                role="listitem"
                onMouseEnter={() => setActivePost(post)}
                onFocus={() => setActivePost(post)}
                onClick={() => setActivePost(post)}
                aria-label={`Preview ${post.alt}`}
              >
                <span className="instagram-post-fallback" aria-hidden="true">
                  {String(post.id).padStart(2, '0')}
                </span>
                <img
                  src={post.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className={loadedPosts[post.id] ? 'is-loaded' : ''}
                  onLoad={() => markLoaded(post.id)}
                />
                <span className="instagram-grid-overlay" aria-hidden="true">
                  Preview ↗
                </span>
              </button>
            ))}
          </div>

          <figure className="instagram-preview">
            <div className="instagram-preview-frame">
              <span className="instagram-post-fallback" aria-hidden="true">
                {String(activePost.id).padStart(2, '0')}
              </span>
              <img
                src={activePost.src}
                alt={activePost.alt}
                loading="lazy"
                decoding="async"
                className={loadedPosts[activePost.id] ? 'is-loaded' : ''}
                onLoad={() => markLoaded(activePost.id)}
              />
            </div>
            <figcaption>
              <span>Selected post</span>
              <strong>{String(activePost.id).padStart(2, '0')} / {String(instagram.posts.length).padStart(2, '0')}</strong>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}

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
            <span className="project-modal-mark">
              <LeafMark />
            </span>
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
              <div className="project-modal-year-row">
                <p className="project-modal-year">{project.year}</p>
                {project.status && (
                  <span className="project-status">{project.status}</span>
                )}
              </div>
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

          {project.instagram && (
            <InstagramShowcase instagram={project.instagram} />
          )}
        </div>
      )}
    </dialog>
  )
}

export default ProjectModal
