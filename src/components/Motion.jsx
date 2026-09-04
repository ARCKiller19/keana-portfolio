import { automotiveMotion, featuredMotion } from '../data/videos.js'
import '../motion.css'

function VideoPlayer({ src, title }) {
  return (
    <video
      className="motion-video"
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
              piece.layout === 'portrait'
                ? 'motion-piece-portrait'
                : index % 2 === 1
                  ? 'motion-piece-offset'
                  : ''
            }`}
            key={piece.id}
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

            <h3>{piece.title}</h3>
          </article>
        ))}
      </div>

      <details className="motion-collection">
        <summary className="motion-collection-summary">
          <span className="motion-index">03</span>
          <span className="motion-collection-title">Automotive Video Edits</span>
          <span className="motion-collection-meta">
            Commercial · Social Media · {String(automotiveMotion.length).padStart(2, '0')} Selected Pieces
          </span>
          <span className="motion-collection-action">View Collection ↓</span>
        </summary>

        <div className="automotive-grid">
          {automotiveMotion.map((piece, index) => (
            <article className="automotive-piece" key={piece.id}>
              <div className="motion-meta">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span>Automotive · Video Edit</span>
              </div>

              <div className="motion-frame motion-frame-small">
                <VideoPlayer src={piece.src} title={piece.title} />
              </div>

              <h3>{piece.title}</h3>
            </article>
          ))}
        </div>
      </details>
    </section>
  )
}

export default Motion
