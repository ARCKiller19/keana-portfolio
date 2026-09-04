import { useEffect, useRef } from 'react'
import { automotiveMotion, featuredMotion } from '../data/videos.js'
import '../motion.css'

function VideoPlayer({ src, title, className = '' }) {
  return (
    <video
      className={`motion-video ${className}`.trim()}
      controls
      playsInline
      preload="metadata"
      aria-label={title}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support HTML video.
    </video>
  )
}

function AutomotiveReelCard({ piece, index }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.45 },
    )

    observer.observe(video)

    return () => observer.disconnect()
  }, [])

  return (
    <article className="automotive-reel-card" role="listitem">
      <div className="motion-meta automotive-reel-meta">
        <span className="motion-index">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span>Automotive · Video Edit</span>
      </div>

      <div className="automotive-reel-frame">
        <video
          ref={videoRef}
          className="motion-video automotive-reel-video"
          autoPlay
          muted
          loop
          controls
          playsInline
          preload="metadata"
          poster={piece.cover}
          aria-label={piece.title}
        >
          <source src={piece.src} type="video/mp4" />
          Your browser does not support HTML video.
        </video>
      </div>

      <h4>{piece.title}</h4>
    </article>
  )
}

function Motion() {
  const reelRef = useRef(null)

  useEffect(() => {
    const reel = reelRef.current
    if (!reel) return undefined

    const handleWheel = (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return

      const maxScrollLeft = reel.scrollWidth - reel.clientWidth
      if (maxScrollLeft <= 0) return

      const atStart = reel.scrollLeft <= 1
      const atEnd = reel.scrollLeft >= maxScrollLeft - 1
      const movingBackward = event.deltaY < 0
      const movingForward = event.deltaY > 0

      if ((movingBackward && atStart) || (movingForward && atEnd)) return

      event.preventDefault()
      reel.scrollLeft += event.deltaY
    }

    reel.addEventListener('wheel', handleWheel, { passive: false })

    return () => reel.removeEventListener('wheel', handleWheel)
  }, [])

  return (
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
            <p>
              These social edits focus on quick pacing, strong openings, and
              giving each car its own presence within a short vertical format.
            </p>
            <span>
              Commercial · Social Media · {String(automotiveMotion.length).padStart(2, '0')} Selected Pieces
            </span>
          </div>
        </div>

        <div
          className="automotive-reel"
          ref={reelRef}
          role="list"
          aria-label="Automotive video reel"
        >
          {automotiveMotion.map((piece, index) => (
            <AutomotiveReelCard piece={piece} index={index} key={piece.id} />
          ))}
        </div>
      </section>
    </section>
  )
}

export default Motion
