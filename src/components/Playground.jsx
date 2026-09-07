import '../playground-owner.css'

const pieces = [
  {
    src: '/images/playground/pixel-keana.png',
    alt: 'Pixel art portrait of Keana',
  },
  {
    src: '/images/playground/pixel-sprites.png',
    alt: 'Pixel art sprite experiments',
  },
  {
    src: '/images/playground/green-creature.png',
    alt: 'Green creature pixel artwork',
    wide: true,
  },
  {
    src: '/images/playground/other-art.png',
    alt: 'Additional visual experiment',
  },
]

function Playground() {
  return (
    <section className="playground" id="playground" aria-label="Playground">
      <div className="section-head">
        <h2>Playground</h2>
        <span className="count">Creative Archive</span>
      </div>

      <p className="playground-intro">
        Small visual experiments, pixel work, and things I make outside larger projects.
      </p>

      <div className="playground-grid">
        {pieces.map((piece, index) => (
          <figure
            className={`playground-tile ${piece.wide ? 'playground-tile-wide' : ''}`}
            key={piece.src}
          >
            <span className="tile-index">
              {String(index + 1).padStart(2, '0')}
            </span>

            <img
              src={piece.src}
              alt={piece.alt}
              loading="lazy"
              decoding="async"
            />
          </figure>
        ))}

        <div className="playground-owner-note">
          <svg
            className="playground-owner-arrow"
            viewBox="0 0 240 160"
            aria-hidden="true"
          >
            <path
              className="owner-arrow-echo"
              d="M218 132C174 130 150 112 125 87C96 58 70 46 34 36"
            />
            <path d="M218 132C174 130 150 112 125 87C96 58 70 46 34 36" />
            <path d="M34 36L50 30" />
            <path d="M34 36L45 51" />
          </svg>

          <span className="playground-owner-label">
            <span className="playground-owner-spark" aria-hidden="true">
              ✦
            </span>
            Owner
          </span>
        </div>
      </div>
    </section>
  )
}

export default Playground
