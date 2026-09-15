import { useEffect, useState } from 'react'

const spriteAssets = {
  zhangi: '/images/playground/zhangi-sprites.png?v=source4',
  hanzo: '/images/playground/pixel-hanzo.png?v=source4',
}

const ZHANGI_FRAME_ROOT = "/images/playground/sprite-frames/zhang'i"
const HANZO_FRAME_ROOT = '/images/playground/sprite-frames/hanzo/HANZO'
const POPUP_FRAME_ROOT = "/images/playground/sprite-frames/zhang'i-pop-up/zhang'i POP UP"
const WALK_FRAME_DURATION = 200
const RUN_FRAME_DURATION = 105

const characters = [
  {
    id: 'zhangi',
    label: 'Zhang’i',
    sheet: spriteAssets.zhangi,
    alt: 'Zhang’i original pixel sprite sheet',
    frames: {
      down: [1, 2, 3, 4].map((frame) => `${ZHANGI_FRAME_ROOT}/FRONT/${frame}.png`),
      right: ['2.2', '1', '2.4', '3'].map(
        (frame) => `${ZHANGI_FRAME_ROOT}/RIGHT/${frame}.png`,
      ),
      left: ['2.2', '1', '2.4', '3'].map(
        (frame) => `${ZHANGI_FRAME_ROOT}/LEFT/${frame}.png`,
      ),
      up: [
        `${ZHANGI_FRAME_ROOT}/BACK/1 orig.png`,
        `${ZHANGI_FRAME_ROOT}/BACK/4.png`,
        `${ZHANGI_FRAME_ROOT}/BACK/3.png`,
        `${ZHANGI_FRAME_ROOT}/BACK/1.png`,
      ],
    },
  },
  {
    id: 'hanzo',
    label: 'Hanzo',
    sheet: spriteAssets.hanzo,
    alt: 'Hanzo original pixel sprite sheet',
    frames: {
      down: [1, 2, 3, 4].map((frame) => `${HANZO_FRAME_ROOT}/FRONT H/${frame}.png`),
      right: ['2', '3', '4', '3'].map(
        (frame) => `${HANZO_FRAME_ROOT}/RIGHT H/${frame}.png`,
      ),
      left: ['2', '3', '4', '3'].map(
        (frame) => `${HANZO_FRAME_ROOT}/LEFT H/${frame}.png`,
      ),
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

const popupSequences = {
  walk: [1, 2, 3, 4].map((frame) => `${POPUP_FRAME_ROOT}/WALK TOWARDS RIGHT/${frame}.png`),
  jump: [1, 2, 3, 4].map((frame) => `${POPUP_FRAME_ROOT}/POP UP JUMP/RIGHT JUMP ${frame}.png`),
}

const fairyPieces = [
  { src: '/images/playground/green-fairy.png', alt: 'Green fairy pixel artwork' },
  { src: '/images/playground/green-fairy-circle.png', alt: 'Green fairy circle pixel artwork' },
  { src: '/images/playground/red-evil-fairy.png', alt: 'Red evil fairy pixel artwork' },
]

const orbPieces = [
  ['BLUE ORB.png', 'Blue orb'],
  ['CRYSTAL ORB.png', 'Crystal orb'],
  ['GREEN ORB.png', 'Green orb'],
  ['ORANGE ORB.png', 'Orange orb'],
  ['RED ORB.png', 'Red orb'],
  ['SUSPICIOUS ORB.png', 'Suspicious orb'],
  ['YELLOW ORB.png', 'Yellow orb'],
]

const archivePieces = [
  {
    src: spriteAssets.zhangi,
    alt: 'Zhang’i complete directional sprite sheet',
    label: 'Zhang’i Sprite Sheet',
    meta: '16 × 16 sprites · directional template',
    template: true,
  },
  {
    src: spriteAssets.hanzo,
    alt: 'Hanzo complete directional sprite sheet',
    label: 'Hanzo Sprite Sheet',
    meta: '16 × 16 sprites · directional template',
    template: true,
  },
  {
    src: "/images/playground/pixel-zhang'i.png",
    alt: 'Zhang’i pixel art process capture in the sprite editor',
    label: 'Zhang’i Process Capture',
    meta: 'Sprite editor · process view',
  },
  {
    src: "/images/playground/pop-up-zhang'i.png",
    alt: 'Zhang’i pop-up battle sprite process capture',
    label: 'Pop-up Battle Frames',
    meta: 'Alternate character style · process view',
  },
  {
    src: '/images/playground/green-matcha-tea.png',
    alt: 'Green Matcha Tea pixel character process capture',
    label: 'Green Matcha Character',
    meta: 'Character study · process view',
    wide: true,
  },
  {
    src: '/images/playground/green-matcha-tea-frames.PNG',
    alt: 'Green Matcha Tea two-frame idle animation sheet',
    label: 'Green Matcha Idle Frames',
    meta: 'Two-frame source sheet',
  },
]

function Playground() {
  const [character, setCharacter] = useState('zhangi')
  const [direction, setDirection] = useState('down')
  const [pace, setPace] = useState('walk')
  const [frameIndex, setFrameIndex] = useState(0)
  const [showFrames, setShowFrames] = useState(false)
  const [popupMode, setPopupMode] = useState('walk')
  const [popupFrameIndex, setPopupFrameIndex] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  const activeCharacter = characters.find((item) => item.id === character) ?? characters[0]
  const activeFrames = activeCharacter.frames[direction] ?? activeCharacter.frames.down
  const safeFrameIndex = frameIndex % activeFrames.length
  const activeFrame = activeFrames[safeFrameIndex]
  const activeFrameDuration = pace === 'run' ? RUN_FRAME_DURATION : WALK_FRAME_DURATION
  const popupFrames = popupSequences[popupMode]
  const popupFrame = popupFrames[popupFrameIndex % popupFrames.length]

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncPreference = () => setReducedMotion(media.matches)

    syncPreference()
    media.addEventListener?.('change', syncPreference)

    return () => media.removeEventListener?.('change', syncPreference)
  }, [])

  useEffect(() => {
    const frameSources = [
      ...characters.flatMap((item) => Object.values(item.frames).flat()),
      ...Object.values(popupSequences).flat(),
    ]

    frameSources.forEach((src) => {
      const image = new Image()
      image.src = src
    })
  }, [])

  useEffect(() => {
    setFrameIndex(0)

    if (reducedMotion) return undefined

    const timer = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % activeFrames.length)
    }, activeFrameDuration)

    return () => window.clearInterval(timer)
  }, [character, direction, pace, reducedMotion, activeFrames.length, activeFrameDuration])

  useEffect(() => {
    setPopupFrameIndex(0)

    if (reducedMotion) return undefined

    const frameDuration = popupMode === 'jump' ? 135 : 185
    const timer = window.setInterval(() => {
      setPopupFrameIndex((current) => (current + 1) % popupFrames.length)
    }, frameDuration)

    return () => window.clearInterval(timer)
  }, [popupMode, reducedMotion, popupFrames.length])

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
            Zhang’i and Hanzo shown through their original 16 × 16 animation frames,
            switched one PNG at a time instead of sliding a sprite sheet.
          </p>

          <dl className="playground-sprite-meta">
            <div>
              <dt>Character</dt>
              <dd>{activeCharacter.label}</dd>
            </div>
            <div>
              <dt>Preview</dt>
              <dd>{pace === 'walk' ? 'Walk' : 'Run'} · {direction} · {safeFrameIndex + 1}/{activeFrames.length} · {activeFrameDuration} ms</dd>
            </div>
          </dl>
        </div>

        <div className="playground-sprite-console">
          <div className="playground-sprite-stage">
            <div className="playground-sprite-stage-head">
              <span>LIVE FRAME PREVIEW</span>
              <span>
                {activeCharacter.label} · 16 × 16 · {String(activeFrames.length).padStart(2, '0')} FRAMES · {activeFrameDuration} MS EACH
              </span>
            </div>

            <div className="playground-sprite-track" aria-hidden="true">
              <span className="playground-sprite-origin" />
              <div className="playground-sprite-window">
                <img
                  className="playground-sprite-frame"
                  src={activeFrame}
                  alt=""
                  draggable="false"
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

      <div className="playground-study-stack">
        <article className="playground-feature-study playground-pop-up-study" aria-labelledby="popup-study-title">
          <div className="playground-study-copy">
            <span className="playground-sprite-kicker">PIXEL STUDY · 02</span>
            <h3 id="popup-study-title">Pop-up Battle Study</h3>
            <p>
              Zhang’i in the alternate close-up style used for Wordoria’s battle pop-up scene.
              Switch between the walk-in and jump motion studies.
            </p>

            <div className="playground-study-controls" role="group" aria-label="Pop-up animation sequence">
              <button
                type="button"
                className={popupMode === 'walk' ? 'is-active' : ''}
                aria-pressed={popupMode === 'walk'}
                onClick={() => setPopupMode('walk')}
              >
                Walk in
              </button>
              <button
                type="button"
                className={popupMode === 'jump' ? 'is-active' : ''}
                aria-pressed={popupMode === 'jump'}
                onClick={() => setPopupMode('jump')}
              >
                Jump
              </button>
            </div>
          </div>

          <div className="playground-study-stage playground-pop-up-stage">
            <span className="playground-study-label">LIVE FRAME PREVIEW · {popupMode.toUpperCase()}</span>
            <div className="playground-pop-up-frame" aria-hidden="true">
              <img src={popupFrame} alt="" draggable="false" />
            </div>
            <span className="playground-study-ground" />
          </div>
        </article>

        <article className="playground-feature-study playground-matcha-study" aria-labelledby="matcha-study-title">
          <div className="playground-study-copy">
            <span className="playground-sprite-kicker">PIXEL STUDY · 03</span>
            <h3 id="matcha-study-title">Green Matcha Idle Study</h3>
            <p>
              A small breathing and bounce loop for the matcha character. The original two-frame
              sheet stays visible beside the motion reference.
            </p>
          </div>

          <div className="playground-matcha-media">
            <figure className="playground-matcha-preview">
              <figcaption>ANIMATION PREVIEW</figcaption>
              {reducedMotion ? (
                <img src="/images/playground/green-matcha-tea.png" alt="Green Matcha Tea pixel character" />
              ) : (
                <video
                  src="/images/playground/green-matcha-tea-animation.mp4"
                  poster="/images/playground/green-matcha-tea.png"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  preload="metadata"
                  aria-label="Green Matcha Tea idle breathing animation"
                />
              )}
            </figure>

            <figure className="playground-matcha-frames">
              <figcaption>TWO-FRAME SOURCE SHEET</figcaption>
              <img
                src="/images/playground/green-matcha-tea-frames.PNG"
                alt="Two source frames for the Green Matcha Tea idle animation"
                loading="lazy"
                decoding="async"
              />
            </figure>
          </div>
        </article>
      </div>

      <div className="playground-archive-head">
        <div>
          <span className="playground-sprite-kicker">VISUAL ARCHIVE</span>
          <h3>Pixel Works & Process</h3>
        </div>
        <span>SPRITES · CHARACTERS · STUDIES</span>
      </div>

      <div className="playground-grid playground-grid-secondary playground-archive-grid">
        {archivePieces.map((piece, index) => (
          <figure
            className={`playground-tile playground-archive-tile ${piece.wide ? 'playground-tile-wide' : ''} ${piece.template ? 'playground-template-tile' : ''}`}
            key={`${piece.src}-${piece.label}`}
          >
            <span className="tile-index">{String(index + 4).padStart(2, '0')}</span>
            <img src={piece.src} alt={piece.alt} loading="lazy" decoding="async" />
            <figcaption className="playground-template-caption">
              <span>{piece.label}</span>
              <span>{piece.meta}</span>
            </figcaption>
          </figure>
        ))}

        <figure className="playground-tile playground-archive-tile playground-collection-tile playground-fairy-collection">
          <span className="tile-index">{String(archivePieces.length + 4).padStart(2, '0')}</span>
          <div className="playground-fairy-grid">
            {fairyPieces.map((piece) => (
              <img src={piece.src} alt={piece.alt} loading="lazy" decoding="async" key={piece.src} />
            ))}
          </div>
          <figcaption className="playground-template-caption">
            <span>Fairy Studies</span>
            <span>Character variations</span>
          </figcaption>
        </figure>

        <figure className="playground-tile playground-archive-tile playground-collection-tile playground-orb-collection playground-tile-wide">
          <span className="tile-index">{String(archivePieces.length + 5).padStart(2, '0')}</span>
          <div className="playground-orb-grid">
            {orbPieces.map(([fileName, alt]) => (
              <img
                src={`/images/playground/ORBS/${fileName}`}
                alt={alt}
                loading="lazy"
                decoding="async"
                key={fileName}
              />
            ))}
          </div>
          <figcaption className="playground-template-caption">
            <span>Orb Studies</span>
            <span>Seven pixel object variations</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

export default Playground