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
    if (!video) return

    setHasStarted(true)

    try {
      await video.play()
    } catch {
      setHasStarted(false)
    }
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
              <img src={previousPiece.cover} alt="" loading="lazy" />
              <span aria-hidden="true">
                {previousPiece.number} · {previousPiece.title}
              </span>
            </button>
          )}

          <div
            className={`motion-reel-active ${hasStarted ? 'is-playing' : ''}`}
            key={activePiece.id}
          >
            <video
              ref={videoRef}
              className="motion-reel-video"
              controls={hasStarted}
              playsInline
              preload={preload}
              poster={activePiece.cover}
              aria-label={activePiece.title}
              onEnded={() => setHasStarted(false)}
            >
              <source src={activePiece.src} type="video/mp4" />
              Your browser does not support HTML video.
            </video>

            {!hasStarted && (
              <>
                <img
                  className="motion-reel-poster"
                  src={activePiece.cover}
                  alt=""
                  loading="eager"
                />
                <span className="motion-reel-film" aria-hidden="true" />
                <button
                  className="motion-reel-play"
                  type="button"
                  onClick={playVideo}
                  aria-label={`Play ${activePiece.title}`}
                >
                  <span className="motion-reel-play-icon" aria-hidden="true">
                    ▶
                  </span>
                  <span>Play reel</span>
                </button>
              </>
            )}
          </div>

          {nextPiece && (
            <button
              className="motion-reel-neighbor motion-reel-neighbor-next"
              type="button"
              onClick={() => stepReel(1)}
              aria-label={`Next reel: ${nextPiece.title}`}
            >
              <img src={nextPiece.cover} alt="" loading="lazy" />
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

        <button
          className="motion-reel-story-action"
          type="button"
          onClick={hasStarted ? stopVideo : playVideo}
        >
          <span>{hasStarted ? 'Back to poster' : 'Play reel'}</span>
          <span aria-hidden="true">{hasStarted ? '↙' : '↗'}</span>
        </button>
      </aside>
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

          <div className="motion-featured">
            {featuredMotion.map((piece, index) => (
              <article
                className={`motion-piece ${
                  index % 2 === 1 ? 'motion-piece-reverse' : ''
                } ${piece.latest ? 'motion-piece-latest' : ''}`.trim()}
                key={piece.id}
              >
                <div
                  className={`motion-piece-media ${
                    piece.layout === 'portrait' ? 'motion-piece-media-portrait' : ''
                  }`}
                >
                  <div className="motion-meta">
                    <span className="motion-index">{piece.number}</span>
                    <span>{piece.category}</span>
                  </div>

                  <MotionCutPlayer piece={piece} />
                </div>

                <div className="motion-piece-copy">
                  <span className="motion-piece-label">
                    {piece.latest
                      ? `Latest work · ${piece.dateLabel}`
                      : 'Behind the edit'}
                  </span>
                  <h3>{piece.title}</h3>
                  {piece.credit && (
                    <span className="motion-piece-credit">{piece.credit}</span>
                  )}
                  <p>{piece.reflection}</p>

                  {piece.creationNotes && (
                    <button
                      className="motion-notes-trigger"
                      type="button"
                      onClick={() => setSelectedNotesPiece(piece)}
                    >
                      Read creation notes <span aria-hidden="true">↗</span>
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <MotionNotesModal piece={selectedNotesPiece} onClose={closeNotes} />
    </>
  )
}

export default Motion