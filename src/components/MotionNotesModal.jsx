import { useEffect, useRef, useState } from 'react'
import '../motion-notes.css'
import '../motion-notes-companion.css'

function MotionNotesModal({ piece, onClose }) {
  const dialogRef = useRef(null)
  const [activeSection, setActiveSection] = useState(0)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !piece) return undefined

    if (!dialog.open) dialog.showModal()

    const handleClose = () => onClose()
    dialog.addEventListener('close', handleClose)

    return () => dialog.removeEventListener('close', handleClose)
  }, [piece, onClose])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !piece?.creationNotes) return undefined

    const sections = Array.from(
      dialog.querySelectorAll('.motion-note-section'),
    )

    if (!sections.length) return undefined

    let frameId = null

    const updateActiveSection = () => {
      frameId = null

      const dialogRect = dialog.getBoundingClientRect()
      const activationLine = dialogRect.top + dialog.clientHeight * 0.34
      let nextIndex = 0

      sections.forEach((section, index) => {
        if (section.getBoundingClientRect().top <= activationLine) {
          nextIndex = index
        }
      })

      setActiveSection((currentIndex) =>
        currentIndex === nextIndex ? currentIndex : nextIndex,
      )
    }

    const handleScroll = () => {
      if (frameId !== null) return
      frameId = window.requestAnimationFrame(updateActiveSection)
    }

    updateActiveSection()
    dialog.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      dialog.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (frameId !== null) window.cancelAnimationFrame(frameId)
    }
  }, [piece])

  if (!piece?.creationNotes) return null

  const notes = piece.creationNotes
  const mediaLayoutClass =
    piece.layout === 'portrait'
      ? 'motion-notes-media-portrait'
      : 'motion-notes-media-landscape'

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      dialogRef.current?.close()
    }
  }

  return (
    <dialog
      className="motion-notes-dialog"
      ref={dialogRef}
      onClick={handleBackdropClick}
      aria-labelledby="motion-notes-title"
    >
      <div className="motion-notes-shell">
        <header className="motion-notes-header">
          <div className="motion-notes-mark" aria-hidden="true">
            <span />
          </div>
          <div className="motion-notes-meta">
            <span>{piece.number}</span>
            <span>{piece.category}</span>
          </div>
          <button
            className="motion-notes-close"
            type="button"
            onClick={() => dialogRef.current?.close()}
          >
            Close ×
          </button>
        </header>

        <div className="motion-notes-intro">
          <div className="motion-notes-title-block">
            <p>Creation notes</p>
            <h2 id="motion-notes-title">{piece.title}</h2>
            <p className="motion-notes-lede">{notes.lede}</p>
          </div>

          <div className={`motion-notes-media ${mediaLayoutClass}`}>
            <video
              controls
              playsInline
              preload="metadata"
              aria-label={`${piece.title} full edit`}
            >
              <source src={piece.src} type="video/mp4" />
              Your browser does not support HTML video.
            </video>
          </div>
        </div>

        {notes.chapters?.length > 0 && (
          <div className="motion-notes-chapters" aria-label="Story chapters">
            {notes.chapters.map((chapter) => (
              <div key={chapter.number}>
                <span>{chapter.number}</span>
                <strong>{chapter.title}</strong>
                <small>{chapter.meaning}</small>
              </div>
            ))}
          </div>
        )}

        <div className="motion-notes-body">
          <div className="motion-notes-rail">
            <aside className="motion-notes-aside">
              <span>How it came together</span>
              <p>
                A look at the memories, references, symbols, and editing choices
                behind the finished piece.
              </p>
            </aside>

            <div
              className="motion-notes-companion"
              aria-label={`Video companion for section ${activeSection + 1}`}
            >
              <div className={`motion-notes-companion-media ${mediaLayoutClass}`}>
                <video
                  controls
                  playsInline
                  preload="none"
                  aria-label={`${piece.title} companion video`}
                >
                  <source src={piece.src} type="video/mp4" />
                  Your browser does not support HTML video.
                </video>
              </div>
              <div className="motion-notes-companion-meta" aria-live="polite">
                <span>{String(activeSection + 1).padStart(2, '0')}</span>
                <span>{notes.sections[activeSection]?.title}</span>
              </div>
            </div>
          </div>

          <div className="motion-notes-sections">
            {notes.sections.map((section, index) => (
              <section
                className={`motion-note-section ${
                  activeSection === index ? 'is-active' : ''
                }`}
                key={section.title}
              >
                <div className="motion-note-index">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div>
                  <h3>{section.title}</h3>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <footer className="motion-notes-reflection">
          <span>Looking back</span>
          <blockquote>
            <p>{notes.closing}</p>
          </blockquote>
        </footer>
      </div>
    </dialog>
  )
}

export default MotionNotesModal
