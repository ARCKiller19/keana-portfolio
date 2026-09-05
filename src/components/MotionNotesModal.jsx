import { useEffect, useRef } from 'react'
import '../motion-notes.css'

function MotionNotesModal({ piece, onClose }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !piece) return undefined

    if (!dialog.open) dialog.showModal()

    const handleClose = () => onClose()
    dialog.addEventListener('close', handleClose)

    return () => dialog.removeEventListener('close', handleClose)
  }, [piece, onClose])

  if (!piece?.creationNotes) return null

  const notes = piece.creationNotes

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

          <div className="motion-notes-media">
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
          <aside className="motion-notes-aside">
            <span>How it came together</span>
            <p>
              A look at the memories, references, symbols, and editing choices
              behind the finished piece.
            </p>
          </aside>

          <div className="motion-notes-sections">
            {notes.sections.map((section, index) => (
              <section className="motion-note-section" key={section.title}>
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
          <p>{notes.closing}</p>
        </footer>
      </div>
    </dialog>
  )
}

export default MotionNotesModal
