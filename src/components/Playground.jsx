import { useEffect, useState } from 'react'

const spriteAssets = {
  zhangi: '/images/playground/zhangi-sprites.png?v=source3',
  hanzo: '/images/playground/pixel-hanzo.png?v=source3',
}

const ZHANGI_FRAME_ROOT = "/images/playground/sprite-frames/zhang'i"
const HANZO_FRAME_ROOT = '/images/playground/sprite-frames/hanzo/HANZO'

const pieces = [
  {
    src: spriteAssets.hanzo,
    alt: 'Hanzo original pixel sprite sheet showing four directions with four frames each',
    label: 'Hanzo Sprite Sheet',
    spriteTemplate: true,
  },
  {
    src: '/images/playground/green-matcha-tea.png',
    alt: 'Green matcha tea pixel character artwork',
    wide: true,
  },
  {
    src: "/images/playground/pop-up-zhang'i.png",
    alt: 'Zhang’i pop-up battle character artwork',
  },
]

const characters = [
  {
    id: 'zhangi',
    label: 'Zhang’i',
    sheet: spriteAssets.zhangi,
    alt: 'Zhang’i purple-haired pixel character sprite sheet',
    frames: {
      down: [
        `${ZHANGI_FRAME_ROOT}/FRONT/1.png`,
        `${ZHANGI_FRAME_ROOT}/FRONT/2.png`,
        `${ZHANGI_FRAME_ROOT}/FRONT/3.png`,
        `${ZHANGI_FRAME_ROOT}/FRONT/4.png`,
      ],
      right: [
        `${ZHANGI_FRAME_ROOT}/RIGHT/1.png`,
        `${ZHANGI_FRAME_ROOT}/RIGHT/2.png`,
        `${ZHANGI_FRAME_ROOT}/RIGHT/2.2.png`,
        `${ZHANGI_FRAME_ROOT}/RIGHT/2.4.png`,
        `${ZHANGI_FRAME_ROOT}/RIGHT/3.png`,
        `${ZHANGI_FRAME_ROOT}/RIGHT/4.png`,
      ],
      left: [
        `${ZHANGI_FRAME_ROOT}/LEFT/1.png`,
        `${ZHANGI_FRAME_ROOT}/LEFT/2.png`,
        `${ZHANGI_FRAME_ROOT}/LEFT/2.2.png`,
        `${ZHANGI_FRAME_ROOT}/LEFT/2.4.png`,
        `${ZHANGI_FRAME_ROOT}/LEFT/3.png`,
        `${ZHANGI_FRAME_ROOT}/LEFT/4.png`,
      ],
      up: [
        `${ZHANGI_FRAME_ROOT}/BACK/1.png`,
        `${ZHANGI_FRAME_ROOT}/BACK/1 orig.png`,
        `${ZHANGI_FRAME_ROOT}/BACK/3.png`,
        `${ZHANGI_FRAME_ROOT}/BACK/4.png`,
      ],
    },
  },
  {
    id: 'hanzo',
    label: 'Hanzo',
    sheet: spriteAssets.hanzo,
    alt: 'Hanzo ninja pixel character sprite sheet',
    frames: {
      down: [1, 2, 3, 4].map((frame) => `${HANZO_FRAME_ROOT}/FRONT H/${frame}.png`),
      right: [1, 2, 3, 4].map((frame) => `${HANZO_FRAME_ROOT}/RIGHT H/${frame}.png`),
      left: [1, 2, 3, 4].map((frame) => `${HANZO_FRAME_ROOT}/LEFT H/${frame}.png`),
      up: [1, 2, 3, 4].map((frame) => `${HANZO_FRAME_ROOT}/BACK H/${frame}.png`),
    },
  },
]

const directions = [
  { id: 'down', glyph: '↓', label: 'Down' },
  { id: 'right', glyph: '→', label: 'Right' },
  { id: 'left', glyph: '←', label: 'Left' },
  { id: 'up', glyph: '↑', label: 'Up' },
]

function Playground() {
  const [character, setCharacter] = useState('zhangi')
  const [direction, setDirection] = useState('down')
  const [pace, setPace] = useState('walk')
  const [frameIndex, setFrameIndex] = useState(0)
  const [showFrames, setShowFrames] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  const activeCharacter = characters.find((item) => item.id === character) ?? characters[0]
  const activeFrames = activeCharacter.frames[direction] ?? activeCharacter.frames.down
  const safeFrameIndex = frameIndex % activeFrames.length
  const activeFrame = activeFrames[safeFrameIndex]

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncPreference = () => setReducedMotion(media.matches)

    syncPreference()
    media.addEventListener?.('change', syncPreference)

    return () => media.removeEventListener?.('change', syncPreference)
  }, [])

  useEffect(() => {
    const frameSources = characters.flatMap((item) => Object.values(item.frames).flat())

    frameSources.forEach((src) => {
      const image = new Image()
      image.src = src
    })
  }, [])

  useEffect(() => {
    setFrameIndex(0)

    if (reducedMotion) return undefined

    const frameDuration = pace === 'run' ? 105 : 190
    const timer = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % activeFrames.length)
    }, frameDuration)

    return () => window.clearInterval(timer)
  }, [character, direction, pace, reducedMotion, activeFrames.length])

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
            original sprite sheets available for comparison.
          </p>

          <dl className="playground-sprite-meta">
            <div>
              <dt>Character</dt>
              <dd>{activeCharacter.label}</dd>
            </div>
            <div>
              <dt>Preview</dt>
              <dd>{pace === 'walk' ? 'Walk' : 'Run'} · {direction} · {safeFrameIndex + 1}/{activeFrames.length}</dd>
            </div>
          </dl>
        </div>

        <div className="playground-sprite-console">
          <div className="playground-sprite-stage">
            <div className="playground-sprite-stage-head">
              <span>LIVE FRAME PREVIEW</span>
              <span>{activeCharacter.label} · {String(activeFrames.length).padStart(2, '0')} FRAMES</span>
            </div>

            <div className="playground-sprite-track" aria-hidden="true">
              <span className="playground-sprite-origin" />
              <div className="playground-sprite-window">
                <img
                  className="playground-sprite-frame"
                  key={activeFrame}
                  src={activeFrame}
                  alt=""
                  draggable="false"
                  style={{ objectFit: 'contain' }}
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
              <span>PROCESS VIEW · SOURCE TEMPLATES</span>
            </div>

            <div className="playground-original-sheets">
              {characters.map((item) => (
                <figure className={character === item.id ? 'is-active' : ''} key={item.id}>
                  <figcaption>
                    <span>{item.label}</span>
                    <span>ORIGINAL FRAME SHEET</span>
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
