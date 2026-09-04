import { useRef, useState } from 'react'
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
          preload="metadata"
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
            <span>
              Commercial · Social Media · {String(automotiveMotion.length).padStart(2, '0')} Selected Pieces
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
      </section>
    </section>
  )
}

export default Motion
