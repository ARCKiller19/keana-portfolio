import { useState } from 'react'

const pieces = [
  {
    src: '/images/playground/pixel-keana.png',
    alt: 'Pixel art portrait of Keana',
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

const directions = [
  { id: 'down', glyph: '↓', label: 'Down' },
  { id: 'right', glyph: '→', label: 'Right' },
  { id: 'left', glyph: '←', label: 'Left' },
  { id: 'up', glyph: '↑', label: 'Up' },
]

function Playground() {
  const [direction, setDirection] = useState('down')
  const [pace, setPace] = useState('walk')
  const [showFrames, setShowFrames] = useState(false)

  return (
    <section className="playground" id="playground" aria-label="Playground">
      <div className="section-head">
        <h2>Playground</h2>
        <span className="count">Creative Archive</span>
      </div>

      <p className="playground-intro">
        Small visual experiments, pixel work, and things I make outside larger projects.
      </p>

      <article className="playground-sprite-lab" aria-labelledby="sprite-lab-title">
        <div className="playground-sprite-copy">
          <span className="playground-sprite-kicker">PIXEL STUDY · 01</span>
          <h3 id="sprite-lab-title">Keana Walk Cycle</h3>
          <p>
            A directional character study shown as movement first, with the original
            frame sheet available underneath.
          </p>

          <dl className="playground-sprite-meta">
            <div>
              <dt>Source</dt>
              <dd>4 × 4 sprite sheet</dd>
            </div>
            <div>
              <dt>Preview</dt>
              <dd>{pace === 'walk' ? 'Walk' : 'Run'} · {direction}</dd>
            </div>
          </dl>
        </div>

        <div className="playground-sprite-console">
          <div className="playground-sprite-stage">
            <div className="playground-sprite-stage-head">
              <span>LIVE SPRITE PREVIEW</span>
              <span>16 FRAMES / 04 DIRECTIONS</span>
            </div>

            <div className="playground-sprite-track" aria-hidden="true">
              <span className="playground-sprite-origin" />
              <div
                className={`playground-sprite-window is-${direction} is-${pace}`}
              >
                <img
                  src="/images/playground/pixel-sprites.png"
                  alt=""
                  decoding="async"
                />
              </div>
              <span className="playground-sprite-ground" />
            </div>
          </div>

          <div className="playground-sprite-controls">
            <div className="playground-control-group" role="group" aria-label="Sprite direction">
              <span className="playground-control-label">DIRECTION</span>
              <div className="playground-direction-buttons">
                {directions.map((item) => (
                  <button
                    type="button"
                    className={direction === item.id ? 'is-active' : ''}
                    aria-pressed={direction === item.id}
                    onClick={() => setDirection(item.id)}
                    key={item.id}
                  >
                    <span aria-hidden="true">{item.glyph}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="playground-control-group" role="group" aria-label="Sprite playback speed">
              <span className="playground-control-label">PACE</span>
              <div className="playground-pace-buttons">
                <button
                  type="button"
                  className={pace === 'walk' ? 'is-active' : ''}
                  aria-pressed={pace === 'walk'}
                  onClick={() => setPace('walk')}
                >
                  Walk
                </button>
                <button
                  type="button"
                  className={pace === 'run' ? 'is-active' : ''}
                  aria-pressed={pace === 'run'}
                  onClick={() => setPace('run')}
                >
                  Run
                </button>
              </div>
            </div>

            <button
              type="button"
              className="playground-frames-toggle"
              aria-expanded={showFrames}
              aria-controls="playground-sprite-frames"
              onClick={() => setShowFrames((current) => !current)}
            >
              {showFrames ? 'Hide frames' : 'View frames'}
              <span aria-hidden="true">{showFrames ? '−' : '+'}</span>
            </button>
          </div>
        </div>

        {showFrames && (
          <figure className="playground-sprite-frames" id="playground-sprite-frames">
            <figcaption>
              <span>ORIGINAL FRAME SHEET</span>
              <span>PROCESS VIEW · 4 DIRECTIONS × 4 FRAMES</span>
            </figcaption>
            <img
              src="/images/playground/pixel-sprites.png"
              alt="Keana pixel sprite sheet showing four directional movement frames"
              loading="lazy"
              decoding="async"
            />
          </figure>
        )}
      </article>

      <div className="playground-grid playground-grid-secondary">
        {pieces.map((piece, index) => (
          <figure
            className={`playground-tile ${piece.wide ? 'playground-tile-wide' : ''}`}
            key={piece.src}
          >
            <span className="tile-index">
              {String(index + 2).padStart(2, '0')}
            </span>

            <img
              src={piece.src}
              alt={piece.alt}
              loading="lazy"
              decoding="async"
            />
          </figure>
        ))}
      </div>
    </section>
  )
}

export default Playground
