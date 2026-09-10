import { useEffect, useRef } from 'react'

const bookingEmail = 'romapkrr3@gmail.com'
const bookingSubject = encodeURIComponent('Creative Project Call')
const bookingBody = encodeURIComponent(`Hi Keana,

I'd like to book a 30-minute creative project call.

Project / idea:
Preferred day or time:
Timezone:

Thank you!`)
const bookingHref = `mailto:${bookingEmail}?subject=${bookingSubject}&body=${bookingBody}`

function BookingModal({ isOpen, onClose }) {
  const dialogRef = useRef(null)
  const openerRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen && !dialog.open) {
      openerRef.current = document.activeElement
      dialog.showModal()
      return
    }

    if (!isOpen && dialog.open) {
      dialog.close()
      window.requestAnimationFrame(() => {
        if (openerRef.current instanceof HTMLElement) {
          openerRef.current.focus()
        }
      })
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const handleCancel = (event) => {
    event.preventDefault()
    onClose()
  }

  return (
    <dialog
      className="booking-dialog"
      ref={dialogRef}
      aria-labelledby="booking-title"
      aria-describedby="booking-description"
      onClick={handleBackdropClick}
      onCancel={handleCancel}
    >
      <div className="booking-card">
        <div className="booking-topline">
          <p className="booking-kicker">
            <span className="booking-status-dot" aria-hidden="true" />
            Available for creative work
          </p>
          <button
            className="booking-close"
            type="button"
            onClick={onClose}
            aria-label="Close booking dialog"
          >
            ×
          </button>
        </div>

        <div className="booking-copy">
          <p className="booking-index">Creative Project Call · 30 min</p>
          <h2 id="booking-title">Let&apos;s talk about what you&apos;re working on.</h2>
          <p id="booking-description">
            A short conversation about the idea, scope, and how I might help.
          </p>
        </div>

        <div className="booking-disciplines" aria-label="Creative services">
          <span>UI/UX</span>
          <span>Graphic Design</span>
          <span>Multimedia</span>
          <span>Creative Projects</span>
        </div>

        <div className="booking-note">
          <span className="booking-note-label">How it works</span>
          <p>
            Share a little about your project and preferred schedule. I&apos;ll reply
            so we can settle on a time that works.
          </p>
        </div>

        <div className="booking-actions">
          <a className="btn btn-primary booking-primary" href={bookingHref}>
            Request a time <span aria-hidden="true">↗</span>
          </a>
          <a className="booking-email" href={`mailto:${bookingEmail}`}>
            {bookingEmail}
          </a>
        </div>
      </div>
    </dialog>
  )
}

export default BookingModal
