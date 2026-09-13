import { useCallback, useEffect, useRef, useState } from 'react'
import { automotiveMotion, featuredMotion } from '../data/videos.js'
import { motionAlternateCuts } from '../data/motion-cuts.js'
import MotionNotesModal from './MotionNotesModal.jsx'
import '../motion.css'
import '../automotive-notes.css'
import '../automotive-story-overlay.css'
import '../motion-section-order.css'
import '../latest-motion.css'
import '../motion-cuts.css'
import '../motion-reel-station.css'
import '../motion-screening-room.css'

function useDeferredVideoMetadata(rootMargin = '1400px 200px') {
  const videoRef = useRef(null)
  const [shouldPreload, setShouldPreload] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    if (!('IntersectionObserver' in window)) {
      setShouldPreload(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return

        setShouldPreload(true)
        observer.disconnect()
      },
      { rootMargin },
    )

    observer.observe(video)

    return () => observer.disconnect()
  }, [rootMargin])

  useEffect(() => {
    if (shouldPreload) {
      videoRef.current?.load()
    }
  }, [shouldPreload])

  return {
    videoRef,
    preload: shouldPreload ? 'metadata' : 'none',
  }
}

function VideoPlayer({ src, title, className = '' }) {
  const { videoRef, preload } = useDeferredVideoMetadata('2200px 260px')

  return (
    <video
      ref={videoRef}
      className={`motion-video ${className}`.trim()}
      controls
      playsInline
      preload={preload}
      aria-label={title}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support HTML video.
    </video>
  )
}

function MotionCutPlayer({ piece }) {
  const cuts = [
    { id: 'full', label: 'Full edit', src: piece.src },
    ...(motionAlternateCuts[piece.id] ?? []),
  ]
  const [activeCutId, setActiveCutId] = useState('full')
  const activeCut = cuts.find((cut) => cut.id === activeCutId) ?? cuts[0]

  return (
    <>
      <div
        className={`motion-frame ${
          piece.layout === 'portrait' ? 'motion-frame-portrait' : ''
        }`}
      >
        <VideoPlayer
          key={activeCut.src}
          src={activeCut.src}
          title={`${piece.title} ${activeCut.label}`}
        />
      </div>

      {cuts.length > 1 && (
        <div className="motion-cut-switcher">
          <span className="motion-cut-switcher-label">Available cuts</span>
          <div
            className="motion-cut-options"
            role="group"
            aria-label={`Choose ${piece.title} cut`}
          >
            {cuts.map((cut) => {
              const isActive = cut.id === activeCut.id

              return (
                <button
                  className={`motion-cut-option ${isActive ? 'is-active' : ''}`}
                  type="button"
                  key={cut.id}
                  aria-pressed={isActive}
                  onClick={() => setActiveCutId(cut.id)}
                >
                  {cut.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

function ReelSourcePreview({ piece, className = '' }) {
  return (
    <video
      className={className}
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src={piece.src} type="video/mp4" />
    </video>
  )
}

function AutomotiveReelStation({ pieces }) {
  const { videoRef, preload } = useDeferredVideoMetadata('1600px 260px')
  const [activeIndex, setActiveIndex] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  const activePiece = pieces[activeIndex]
  const previousPiece = activeIndex > 0 ? pieces[activeIndex - 1] : null
  const nextPiece = activeIndex < pieces.length - 1 ? pieces[activeIndex + 1] : null
  const total = String(pieces.length).padStart(2, '0')

  const stopVideo = useCallback(() => {
    const video = videoRef.current

    if (video) {
      video.pause()
      video.currentTime = 0
    }

    setHasStarted(false)
  }, [videoRef])

  const selectPiece = (index) => {
    if (index === activeIndex) return
    stopVideo()
    setActiveIndex(index)
  }

  const playVideo = async () => {
    const video = videoRef.current
    if (!video || hasStarted) return

    setHasStarted(true)

    try {
      await video.play()
    } catch {
      setHasStarted(false)
    }
  }

  const handleActiveKeyDown = (event) => {
    if (hasStarted || (event.key !== 'Enter' && event.key !== ' ')) return

    event.preventDefault()
    playVideo()
  }

  const stepReel = (direction) => {
    const nextIndex = activeIndex + direction
    if (nextIndex < 0 || nextIndex >= pieces.length) return
    selectPiece(nextIndex)
  }

  return (
    <div className="motion-reel-station">
      <nav className="motion-reel-index" aria-label="Choose automotive video edit">
        <span className="motion-reel-index-label">Reel index</span>
        <div className="motion-reel-index-track" aria-hidden="true" />

        {pieces.map((piece, index) => {
          const isActive = index === activeIndex

          return (
            <button
              className={`motion-reel-index-item ${isActive ? 'is-active' : ''}`}
              type="button"
              key={piece.id}
              aria-pressed={isActive}
              onClick={() => selectPiece(index)}
            >
              <span className="motion-reel-index-number">{piece.number}</span>
              <span className="motion-reel-index-title">{piece.title}</span>
              <span className="motion-reel-index-node" aria-hidden="true" />
            </button>
          )
        })}
      </nav>

      <div className="motion-reel-projector">
        <div className="motion-reel-projector-meta" aria-hidden="true">
          <span>Moving image</span>
          <span>
            {activePiece.number} / {total}
          </span>
        </div>

        <div className="motion-reel-stack">
          <span className="motion-reel-spine" aria-hidden="true" />

          {previousPiece && (
            <button
              className="motion-reel-neighbor motion-reel-neighbor-prev"
              type="button"
              onClick={() => stepReel(-1)}
              aria-label={`Previous reel: ${previousPiece.title}`}
            >
              <ReelSourcePreview
                piece={previousPiece}
                className="motion-reel-neighbor-video"
              />
              <span aria-hidden="true">
                {previousPiece.number} · {previousPiece.title}
              </span>
            </button>
          )}

          <div
            className={`motion-reel-active ${hasStarted ? 'is-playing' : ''}`}
            key={activePiece.id}
            role={hasStarted ? undefined : 'button'}
            tabIndex={hasStarted ? -1 : 0}
            aria-label={hasStarted ? undefined : `Play ${activePiece.title}`}
            onClick={playVideo}
            onKeyDown={handleActiveKeyDown}
          >
            <video
              ref={videoRef}
              className="motion-reel-video"
              controls={hasStarted}
              playsInline
              preload={preload}
              aria-label={activePiece.title}
              onEnded={() => {
                if (videoRef.current) videoRef.current.currentTime = 0
                setHasStarted(false)
              }}
            >
              <source src={activePiece.src} type="video/mp4" />
              Your browser does not support HTML video.
            </video>
          </div>

          {nextPiece && (
            <button
              className="motion-reel-neighbor motion-reel-neighbor-next"
              type="button"
              onClick={() => stepReel(1)}
              aria-label={`Next reel: ${nextPiece.title}`}
            >
              <ReelSourcePreview
                piece={nextPiece}
                className="motion-reel-neighbor-video"
              />
              <span aria-hidden="true">
                {nextPiece.number} · {nextPiece.title}
              </span>
            </button>
          )}
        </div>

        <div className="motion-reel-step-controls" aria-label="Reel navigation">
          <button
            type="button"
            onClick={() => stepReel(-1)}
            disabled={!previousPiece}
          >
            <span aria-hidden="true">↑</span> Previous
          </button>
          <span aria-hidden="true">{activePiece.number}</span>
          <button
            type="button"
            onClick={() => stepReel(1)}
            disabled={!nextPiece}
          >
            Next <span aria-hidden="true">↓</span>
          </button>
        </div>
      </div>

      <aside className="motion-reel-story" aria-live="polite">
        <div className="motion-reel-story-meta">
          <span>Creation note</span>
          <span>
            {activePiece.number} / {total}
          </span>
        </div>
        <span className="motion-reel-story-category">{activePiece.category}</span>
        <h3>{activePiece.title}</h3>
        <p>{activePiece.note}</p>
      </aside>
    </div>
  )
}

function ScreeningSourcePreview({ piece }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    const seekPreview = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return
      video.currentTime = Math.min(0.18, Math.max(0, video.duration - 0.01))
    }

    video.addEventListener('loadedmetadata', seekPreview, { once: true })
    video.load()

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      seekPreview()
    }

    return () => video.removeEventListener('loadedmetadata', seekPreview)
  }, [piece.src])

  return (
    <video
      ref={videoRef}
      src={piece.src}
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
    />
  )
}

function MotionScreeningRoom({ pieces, onOpenNotes }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activePiece = pieces[activeIndex]
  const total = String(pieces.length).padStart(2, '0')

  return (
    <div className="motion-screening-room">
      <div
        className="motion-screening-selector"
        role="group"
        aria-label="Choose a motion piece to screen"
      >
        {pieces.map((piece, index) => {
          const isActive = index === activeIndex

          return (
            <button
              className={`motion-screening-choice ${isActive ? 'is-active' : ''}`}
              type="button"
              key={piece.id}
              aria-pressed={isActive}
              onClick={() => setActiveIndex(index)}
            >
              <span className="motion-screening-thumb" aria-hidden="true">
                <ScreeningSourcePreview piece={piece} />
                <span className="motion-screening-choice-number">{piece.number}</span>
              </span>

              <span className="motion-screening-choice-copy">
                <span className="motion-screening-choice-state">
                  {isActive ? 'Now screening' : 'Select film'}
                </span>
                <span className="motion-screening-choice-title">{piece.title}</span>
                <span className="motion-screening-choice-category">{piece.category}</span>
              </span>
            </button>
          )
        })}
      </div>

      <article className="motion-screening-stage" key={activePiece.id}>
        <div
          className={`motion-screening-media ${
            activePiece.layout === 'portrait' ? 'is-portrait' : ''
          }`}
        >
          <div className="motion-screening-media-meta">
            <span>Current screening</span>
            <span>
              {activePiece.number} / {total}
            </span>
          </div>

          <MotionCutPlayer key={activePiece.id} piece={activePiece} />
        </div>

        <div className="motion-screening-copy" aria-live="polite">
          <div className="motion-screening-label">
            <span>
              {activePiece.latest
                ? `Latest work · ${activePiece.dateLabel}`
                : 'Motion study'}
            </span>
            <span>{activePiece.category}</span>
          </div>

          <h3>{activePiece.title}</h3>

          {activePiece.credit && (
            <span className="motion-screening-credit">{activePiece.credit}</span>
          )}

          <p>{activePiece.reflection}</p>

          {activePiece.creationNotes && (
            <button
              className="motion-screening-notes"
              type="button"
              onClick={() => onOpenNotes(activePiece)}
            >
              Read creation notes <span aria-hidden="true">↗</span>
            </button>
          )}
        </div>
      </article>
    </div>
  )
}

function Motion() {
  const [selectedNotesPiece, setSelectedNotesPiece] = useState(null)
  const closeNotes = useCallback(() => setSelectedNotesPiece(null), [])

  return (
    <>
      <section className="motion" id="motion" aria-label="Motion and video work">
        <section
          className="automotive-showcase automotive-showcase-first"
          aria-labelledby="automotive-showcase-title"
        >
          <div className="automotive-showcase-head">
            <div className="automotive-showcase-title-block">
              <span className="motion-index">03</span>
              <h2
                className="automotive-showcase-title"
                id="automotive-showcase-title"
              >
                Automotive Video Edits
              </h2>
            </div>

            <div className="automotive-showcase-copy">
              <span>
                Commercial · Social Media ·{' '}
                {String(automotiveMotion.length).padStart(2, '0')} Selected Pieces
              </span>

              <dl
                className="automotive-process-grid automotive-process-grid-compact"
                aria-label="Automotive editing constraints"
              >
                <div>
                  <dt>Just 1–2 clips</dt>
                  <dd>per vehicle</dd>
                </div>

                <div>
                  <dt>Very few angles</dt>
                  <dd>often repeated</dd>
                </div>

                <div>
                  <dt>Mixed quality</dt>
                  <dd>not always ideal</dd>
                </div>
              </dl>

              <p>
                These edits were built around limitation: very short clips,
                repeated angles, mixed source quality, and the pressure to still
                make each car feel polished, premium, and complete.
              </p>
            </div>
          </div>

          <AutomotiveReelStation pieces={automotiveMotion} />

          <blockquote className="automotive-process-quote">
            <p>
              I started treating each edit like a small experiment: how far could
              I push one or two clips before the repetition became noticeable?
            </p>
          </blockquote>
        </section>

        <div
          className="motion-featured-section"
          aria-labelledby="motion-featured-title"
        >
          <div className="section-head">
            <h2 id="motion-featured-title">Motion &amp; Video</h2>
            <span className="count">
              {String(featuredMotion.length).padStart(2, '0')} Selected Works
            </span>
          </div>

          <p className="motion-intro">
            Filmmaking, animation, video editing, and commercial work.
          </p>

          <MotionScreeningRoom
            pieces={featuredMotion}
            onOpenNotes={setSelectedNotesPiece}
          />
        </div>
      </section>

      <MotionNotesModal piece={selectedNotesPiece} onClose={closeNotes} />
    </>
  )
}

export default Motion
