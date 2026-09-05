import { useEffect, useRef, useState } from 'react'
import '../clickmate-instagram.css'

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

function CarouselMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="7" y="5" width="11" height="11" rx="1" />
      <path d="M5 8v10a1 1 0 0 0 1 1h10" />
    </svg>
  )
}

function InstagramShowcase({ instagram }) {
  const [activePost, setActivePost] = useState(instagram.posts[0])
  const [previewSlide, setPreviewSlide] = useState(0)
  const [loadedPosts, setLoadedPosts] = useState({})

  useEffect(() => {
    setActivePost(instagram.posts[0])
    setPreviewSlide(0)
    setLoadedPosts({})
  }, [instagram])

  const markLoaded = (id) => {
    setLoadedPosts((current) => ({ ...current, [id]: true }))
  }

  const selectPost = (post) => {
    setActivePost(post)
    setPreviewSlide(0)
  }

  const showContinuation = () => {
    if (activePost.carousel) setPreviewSlide(1)
  }

  const showCover = () => setPreviewSlide(0)

  return (
    <section
      className="instagram-showcase"
      aria-label="ClickMate Rentals Instagram showcase"
    >
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
          <a
            className="instagram-avatar"
            href={instagram.profileUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Open ClickMate Rentals Instagram profile"
          >
            <img
              src={instagram.profileImage}
              alt="ClickMate Rentals Instagram profile"
              loading="lazy"
              decoding="async"
            />
          </a>

          <div className="instagram-profile-copy">
            <div className="instagram-handle-row">
              <a href={instagram.profileUrl} target="_blank" rel="noreferrer">
                @{instagram.handle}
              </a>
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
          <div
            className="instagram-grid"
            role="list"
            aria-label="Instagram post grid"
          >
            {instagram.posts.map((post) => (
              <button
                className={`instagram-grid-item ${
                  activePost.id === post.id ? 'is-active' : ''
                }`}
                type="button"
                key={post.id}
                role="listitem"
                onMouseEnter={() => selectPost(post)}
                onFocus={() => selectPost(post)}
                onClick={() => selectPost(post)}
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
                {post.carousel && (
                  <span className="instagram-carousel-mark" aria-label="Carousel post">
                    <CarouselMark />
                  </span>
                )}
                <span className="instagram-grid-overlay" aria-hidden="true">
                  Preview
                </span>
              </button>
            ))}
          </div>

          <figure className="instagram-preview">
            <div
              className={`instagram-preview-frame ${
                previewSlide === 1 ? 'is-continuation' : ''
              }`}
            >
              {previewSlide === 0 ? (
                <>
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

                  {activePost.carousel && (
                    <button
                      className="instagram-preview-arrow instagram-preview-arrow-next"
                      type="button"
                      onClick={showContinuation}
                      aria-label="Continue this carousel"
                    >
                      <span aria-hidden="true">›</span>
                    </button>
                  )}
                </>
              ) : (
                <div className="instagram-continuation">
                  <span className="instagram-continuation-label">More on Instagram</span>
                  <a href={activePost.href} target="_blank" rel="noreferrer">
                    View on Instagram <span aria-hidden="true">↗</span>
                  </a>

                  <button
                    className="instagram-preview-arrow instagram-preview-arrow-back"
                    type="button"
                    onClick={showCover}
                    aria-label="Return to cover image"
                  >
                    <span aria-hidden="true">‹</span>
                  </button>
                </div>
              )}

              {activePost.carousel && (
                <div className="instagram-preview-dots" aria-label="Preview slides">
                  <button
                    type="button"
                    className={previewSlide === 0 ? 'is-active' : ''}
                    onClick={showCover}
                    aria-label="Show cover image"
                  />
                  <button
                    type="button"
                    className={previewSlide === 1 ? 'is-active' : ''}
                    onClick={showContinuation}
                    aria-label="Show Instagram continuation"
                  />
                </div>
              )}
            </div>

            <figcaption>
              <span>
                Selected post {String(activePost.id).padStart(2, '0')}
                {activePost.carousel ? ' · Carousel' : ''}
              </span>
              {!activePost.carousel && (
                <a href={activePost.href} target="_blank" rel="noreferrer">
                  View post <span aria-hidden="true">↗</span>
                </a>
              )}
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
                  <div className="project-live-link-wrap">
                    <a
                      className="project-live-link"
                      href={project.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {project.linkLabel ?? 'View Live'}
                      <span aria-hidden="true"> ↗</span>
                    </a>
                    {project.status && (
                      <span className="project-revamp-badge">{project.status}</span>
                    )}
                  </div>
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