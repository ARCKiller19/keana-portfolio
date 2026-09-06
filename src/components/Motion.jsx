import { useCallback, useEffect, useRef, useState } from 'react'
import { automotiveMotion, featuredMotion } from '../data/videos.js'
import MotionNotesModal from './MotionNotesModal.jsx'
import '../motion.css'
import '../automotive-notes.css'
import '../automotive-story-overlay.css'

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

function AutomotiveStoryCard({ piece, total }) {
  const { videoRef, preload } = useDeferredVideoMetadata('1400px 240px')
  const [hasStarted, setHasStarted] = useState(false)

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

  return (
    <article
      className={`automotive-story-card ${hasStarted ? 'is-playing' : ''}`}
      role="listitem"
    >
      <div className="automotive-story-frame">
        <video
          ref={videoRef}
          className="motion-video automotive-story-video"
          controls={hasStarted}
          playsInline
          preload={preload}
          poster={piece.cover}
          aria-label={piece.title}
        >
          <source src={piece.src} type="video/mp4" />
          Your browser does not support HTML video.
        </video>

        {!hasStarted && (
          <>
            <img
              className="automotive-story-cover-image"
              src={piece.cover}
              alt=""
              loading="lazy"
            />
            <div className="automotive-story-cover-film" aria-hidden="true" />

            <div className="automotive-note-overlay" aria-hidden="true">
              <div className="automotive-note-meta">
                <span>Creation note</span>
                <span>
                  {piece.number} / {String(total).padStart(2, '0')}
                </span>
              </div>

              <div className="automotive-note-copy">
                <h4>{piece.title}</h4>
                <p>{piece.note}</p>
              </div>
            </div>

            <button
              className="automotive-story-play"
              type="button"
              onClick={playVideo}
              aria-label={`Play ${piece.title}`}
            >
              <span className="automotive-story-play-prompt">
                <span className="automotive-story-play-desktop">
                  Click to play video
                </span>
                <span className="automotive-story-play-touch">Play video</span>
                <span aria-hidden="true">↗</span>
              </span>
            </button>
          </>
        )}
      </div>
    </article>
  )
}

function Motion() {
  const [selectedNotesPiece, setSelectedNotesPiece] = useState(null)
  const closeNotes = useCallback(() => setSelectedNotesPiece(null), [])

  return (
    <>
      <section className="motion" id="motion" aria-label="Motion and video work">
        <div className="section-head">
          <h2>Motion &amp; Video</h2>
          <span className="count">03 Selected Works</span>
        </div>

        <p className="motion-intro">
          Animation, video edits, and commercial work.
        </p>

        <div className="motion-featured">
          {featuredMotion.map((piece, index) => (
            <article
              className={`motion-piece ${
                index % 2 === 1 ? 'motion-piece-reverse' : ''
              }`}
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

                <div
                  className={`motion-frame ${
                    piece.layout === 'portrait' ? 'motion-frame-portrait' : ''
                  }`}
                >
                  <VideoPlayer src={piece.src} title={piece.title} />
                </div>
              </div>

              <div className="motion-piece-copy">
                <span className="motion-piece-label">Behind the edit</span>
                <h3>{piece.title}</h3>
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

        <section
          className="automotive-showcase"
          aria-labelledby="automotive-showcase-title"
        >
          <div className="automotive-showcase-head">
            <div className="automotive-showcase-title-block">
              <span className="motion-index">03</span>
              <h3 id="automotive-showcase-title">Automotive Video Edits</h3>
            </div>

            <div className="automotive-showcase-copy">
              <span>
                Commercial · Social Media ·{' '}
                {String(automotiveMotion.length).padStart(2, '0')} Selected Pieces
              </span>
              <p>
                These edits were built around limitation: very short clips,
                repeated angles, mixed source quality, and the pressure to still
                make each car feel polished, premium, and complete.
              </p>
            </div>
          </div>

          <div
            className="automotive-process"
            aria-labelledby="automotive-process-title"
          >
            <div className="automotive-process-heading">
              <span className="automotive-process-kicker">Process note</span>
              <h4 id="automotive-process-title">There was never enough footage</h4>
            </div>

            <div className="automotive-process-content">
              <div
                className="automotive-evidence"
                aria-label="Automotive editing constraints"
              >
                <span className="automotive-evidence-label">
                  What I was actually working with
                </span>

                <dl className="automotive-process-grid">
                  <div>
                    <dt>01–02</dt>
                    <dd>
                      <strong>Short clips</strong>
                      <span>per vehicle</span>
                    </dd>
                  </div>

                  <div>
                    <dt>Few</dt>
                    <dd>
                      <strong>Usable angles</strong>
                      <span>often repeated</span>
                    </dd>
                  </div>

                  <div>
                    <dt>Mixed</dt>
                    <dd>
                      <strong>Source quality</strong>
                      <span>not always ideal</span>
                    </dd>
                  </div>
                </dl>
              </div>

              <p className="automotive-process-bridge">
                So I had to create the feeling of <strong>MORE</strong>.
              </p>
            </div>
          </div>

          <div
            className="automotive-reel"
            role="list"
            aria-label="Automotive story reel"
          >
            {automotiveMotion.map((piece) => (
              <AutomotiveStoryCard
                piece={piece}
                key={piece.id}
                total={automotiveMotion.length}
              />
            ))}
          </div>

          <blockquote className="automotive-process-quote">
            <p>
              I started treating each edit like a small experiment: how far could
              I push one or two clips before the repetition became noticeable?
            </p>
          </blockquote>
        </section>
      </section>

      <MotionNotesModal piece={selectedNotesPiece} onClose={closeNotes} />
    </>
  )
}

export default Motion
