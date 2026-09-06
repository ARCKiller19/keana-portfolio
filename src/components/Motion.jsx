import { useCallback, useEffect, useRef, useState } from 'react'
import { automotiveMotion, featuredMotion } from '../data/videos.js'
import MotionNotesModal from './MotionNotesModal.jsx'
import '../motion.css'
import '../automotive-notes.css'

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

function AutomotiveReelCard({ piece, index }) {
  const { videoRef, preload } = useDeferredVideoMetadata('1400px 200px')
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
    <article className="automotive-reel-card" role="listitem">
      <div className="motion-meta automotive-reel-meta">
        <span className="motion-index">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span>Automotive · Video Edit</span>
      </div>

      <div className={`automotive-reel-frame ${hasStarted ? 'is-playing' : ''}`}>
        <video
          ref={videoRef}
          className="motion-video automotive-reel-video"
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
          <button
            className="automotive-cover"
            type="button"
            onClick={playVideo}
            aria-label={`Play ${piece.title}`}
          >
            <span className="automotive-play" aria-hidden="true">
              <span>▶</span>
            </span>
          </button>
        )}
      </div>

      <h4>{piece.title}</h4>
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
                These social edits focus on quick pacing, strong openings, and
                giving each car its own presence within a short vertical format.
              </p>
            </div>
          </div>

          <div
            className="automotive-reel"
            role="list"
            aria-label="Automotive video reel"
          >
            {automotiveMotion.map((piece, index) => (
              <AutomotiveReelCard piece={piece} index={index} key={piece.id} />
            ))}
          </div>

          <div
            className="automotive-process"
            aria-labelledby="automotive-process-title"
          >
            <div className="automotive-process-heading">
              <span className="automotive-process-kicker">Process note</span>
              <h4 id="automotive-process-title">Working with limited footage</h4>
            </div>

            <div className="automotive-process-story">
              <p>
                Most of these reels began with very little material. I was often
                given only one or two short clips of the vehicle being featured
                that day, with very few angles and sometimes difficult
                resolutions. The challenge was to make that small amount of
                footage feel complete, polished, and exciting without hiding it
                under unnecessary effects.
              </p>
              <p>
                Music became one of my most useful editing tools. Upbeat tracks
                gave me more places to recut the same footage, change the timing,
                swap repeated angles, and make limited material feel more
                dynamic. Beat drops were especially valuable. I would often
                place a cut milliseconds before the drop so the next shot or
                transition landed with an immediate kick.
              </p>
              <p>
                For cooler or more relaxed tracks, I leaned on softer fades.
                Faster tracks gave me room for sharper cuts and more energetic
                transitions. Even with a limited free transition library, I kept
                the finish controlled so the cars still felt grand, clean, and
                premium rather than cluttered.
              </p>
              <p>
                The results surprised people around the client, too. Coworkers
                complimented the edits and asked about having similar content
                made for them.
              </p>

              <blockquote className="automotive-process-quote">
                <p>
                  I started treating each edit like a small experiment: how far
                  could I push one or two clips before the repetition became
                  noticeable?
                </p>
              </blockquote>
            </div>

            <dl className="automotive-process-grid">
              <div>
                <dt>Limited source</dt>
                <dd>
                  <span>Usually 1 to 2 short clips</span>
                  <span>Very few usable angles</span>
                  <span>Mixed or challenging resolution</span>
                </dd>
              </div>
              <div>
                <dt>Editing response</dt>
                <dd>
                  <span>Music-led pacing</span>
                  <span>Rhythmic recutting and controlled reuse</span>
                  <span>Beat-drop cuts, fades, and transitions</span>
                </dd>
              </div>
              <div>
                <dt>Intent and result</dt>
                <dd>
                  <span>Short and eye-catching reels</span>
                  <span>Premium finish without visual clutter</span>
                  <span>Coworkers asked for similar content</span>
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </section>

      <MotionNotesModal piece={selectedNotesPiece} onClose={closeNotes} />
    </>
  )
}

export default Motion
