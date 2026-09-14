import { useEffect, useState } from 'react'

const spriteAssets = {
  zhangi: '/images/playground/zhangi-sprites.png?v=2846824',
  hanzo: '/images/playground/pixel-sprites.png?v=aa0894f',
}

const pieces = [
  {
    src: spriteAssets.zhangi,
    alt: 'Zhang’i original pixel sprite sheet showing four directions with four frames each',
    label: 'Zhang’i Sprite Sheet',
    spriteTemplate: true,
  },
  {
    src: spriteAssets.hanzo,
    alt: 'Hanzo original pixel sprite sheet showing four directions with four frames each',
    label: 'Hanzo Sprite Sheet',
    spriteTemplate: true,
  },
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

const characters = [
  {
    id: 'zhangi',
    label: 'Zhang’i',
    sheet: spriteAssets.zhangi,
    alt: 'Zhang’i purple-haired pixel character sprite sheet',
  },
  {
    id: 'hanzo',
    label: 'Hanzo',
    sheet: spriteAssets.hanzo,
    alt: 'Hanzo ninja pixel character sprite sheet',
  },
]

const directions = [
  { id: 'down', glyph: '↓', label: 'Down', row: 0 },
  { id: 'right', glyph: '→', label: 'Right', row: 2 },
  { id: 'left', glyph: '←', label: 'Left', row: 1 },
  { id: 'up', glyph: '↑', label: 'Up', row: 3 },
]

const FRAME_COUNT = 4
const FRAME_STEP = 100 / (FRAME_COUNT - 1)

function Playground() {
  const [character, setCharacter] = useState('zhangi')
  const [direction, setDirection] = useState('down')
  const [pace, setPace] = useState('walk')
  const [frameIndex, setFrameIndex] = useState(0)
  const [showFrames, setShowFrames] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncPreference = () => setReducedMotion(media.matches)

    syncPreference()
    media.addEventListener?.('change', syncPreference)

    return () => media.removeEventListener?.('change', syncPreference)
  }, [])

  useEffect(() => {
    setFrameIndex(0)

    if (reducedMotion) return undefined

    const frameDuration = pace === 'run' ? 105 : 190
    const timer = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % FRAME_COUNT)
    }, frameDuration)

    return () => window.clearInterval(timer)
  }, [character, direction, pace, reducedMotion])

  const activeCharacter = characters.find((item) => item.id === character) ?? characters[0]
  const activeDirection = directions.find((item) => item.id === direction) ?? directions[0]
  const backgroundPosition = `${frameIndex * FRAME_STEP}% ${activeDirection.row * FRAME_STEP}%`

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
          <h3 id="sprite-lab-title">Character Walk Cycles</h3>
          <p>
            Directional sprite studies shown as live frame-by-frame movement, with both
            original 4 × 4 sheets available for comparison.
          </p>

          <dl className="playground-sprite-meta">
            <div>
              <dt>Character</dt>
              <dd>{activeCharacter.label}</dd>
            </div>
            <div>
              <dt>Preview</dt>
              <dd>{pace === 'walk' ? 'Walk' : 'Run'} · {direction} · {frameIndex + 1}/4</dd>
            </div>
          </dl>
        </div>

        <div className="playground-sprite-console">
          <div className="playground-sprite-stage">
            <div className="playground-sprite-stage-head">
              <span>LIVE FRAME PREVIEW</span>
              <span>{activeCharacter.label} · 04 FRAMES</span>
            </div>

            <div className="playground-sprite-track" aria-hidden="true">
              <span className="playground-sprite-origin" />
              <div className="playground-sprite-window">
                <span
                  className="playground-sprite-frame"
                  style={{
                    backgroundImage: `url(${activeCharacter.sheet})`,
                    backgroundPosition,
                  }}
                />
              </div>
              <span className="playground-sprite-ground" />
            </div>
          </div>

          <div className="playground-sprite-controls">
            <div className="playground-control-group playground-character-group" role="group" aria-label="Sprite character">
              <span className="playground-control-label">CHARACTER</span>
              <div className="playground-character-buttons">
                {characters.map((item) => (
                  <button
                    type="button"
                    className={character === item.id ? 'is-active' : ''}
                    aria-pressed={character === item.id}
                    onClick={() => setCharacter(item.id)}
                    key={item.id}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

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
              {showFrames ? 'Hide original sheets' : 'View original sheets'}
              <span aria-hidden="true">{showFrames ? '−' : '+'}</span>
            </button>
          </div>
        </div>

        {showFrames && (
          <div className="playground-sprite-frames" id="playground-sprite-frames">
            <div className="playground-sprite-frames-heading">
              <span>ORIGINAL SPRITE SHEETS</span>
              <span>PROCESS VIEW · BOTH 4 × 4 TEMPLATES</span>
            </div>

            <div className="playground-original-sheets">
              {characters.map((item) => (
                <figure className={character === item.id ? 'is-active' : ''} key={item.id}>
                  <figcaption>
                    <span>{item.label}</span>
                    <span>04 DIRECTIONS × 04 FRAMES</span>
                  </figcaption>
                  <img
                    src={item.sheet}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
              ))}
            </div>
          </div>
        )}
      </article>

      <div className="playground-grid playground-grid-secondary">
        {pieces.map((piece, index) => (
          <figure
            className={`playground-tile ${piece.wide ? 'playground-tile-wide' : ''} ${piece.spriteTemplate ? 'playground-template-tile' : ''}`}
            key={`${piece.src}-${piece.label ?? index}`}
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

            {piece.label && (
              <figcaption className="playground-template-caption">
                <span>{piece.label}</span>
                <span>Original 4 × 4 sheet</span>
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  )
}

export default Playground
