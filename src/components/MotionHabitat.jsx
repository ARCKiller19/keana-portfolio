import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motionAlternateCuts } from '../data/motion-cuts.js'
import useDeferredVideoMetadata from '../hooks/useDeferredVideoMetadata.js'
import '../motion-habitat.css'

const DESKTOP_LAYOUT = {
  width: 1000,
  height: 560,
  start: { x: 500, y: 395 },
  projection: { x: 500, y: 212 },
  dock: { x: 500, y: 395 },
}

const COMPACT_LAYOUT = {
  width: 420,
  projection: { x: 210, y: 340 },
  dock: { x: 210, y: 340 },
}

const STATION_PRESETS = {
  'roast-live-action': {
    slug: 'roast',
    system: 'LIVE / CAFE',
    accent: 'warm',
    rgb: '184, 180, 168',
  },
  kove: {
    slug: 'kove',
    system: 'LIVE / CAFE / FRIENDS',
    accent: 'ambient',
    rgb: '208, 138, 75',
  },
  'cover-animation': {
    slug: 'special',
    system: 'MOTION / RHYTHM',
    accent: 'pulse',
    rgb: '168, 188, 99',
  },
  'first-love': {
    slug: 'first-love',
    system: 'MEMORY / COLOR',
    accent: 'chapters',
    rgb: '142, 120, 166',
  },
}

const MANUAL_SPEED = 260
const AUTO_SPEED = 620
const ENERGY_RADIUS = 225
const WAKE_RADIUS = ENERGY_RADIUS
const ACTIVATE_RADIUS = 76
const CENTER_PERCH_RADIUS = 34

function resolveHabitatGroup(piece) {
  if (
    piece.habitatGroup === 'live-action' ||
    piece.habitatGroup === 'animation-motion'
  ) {
    return piece.habitatGroup
  }

  const category = piece.category?.toLowerCase() ?? ''
  return category.includes('animation') || category.includes('motion design')
    ? 'animation-motion'
    : 'live-action'
}

function getStationMeta(piece) {
  const preset = STATION_PRESETS[piece.id]
  if (preset) return preset

  const group = resolveHabitatGroup(piece)
  return {
    slug: piece.id.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase(),
    system: group === 'live-action' ? 'LIVE / ARCHIVE' : 'MOTION / ARCHIVE',
    accent: 'signal',
    rgb: group === 'live-action' ? '184, 180, 168' : '168, 188, 99',
  }
}

function buildDesktopLayout(pieces) {
  const stations = new Array(pieces.length)
  const groups = {
    'live-action': [],
    'animation-motion': [],
  }

  pieces.forEach((piece, index) => {
    const group = resolveHabitatGroup(piece)
    ;(groups[group] ?? groups['animation-motion']).push(index)
  })

  const placeGroup = (indices, side) => {
    const count = indices.length
    if (!count) return

    const edgeX = count <= 2 ? 190 : count === 3 ? 160 : 135
    const span = 1000 - edgeX * 2

    indices.forEach((pieceIndex, order) => {
      const progress = count === 1 ? 0.5 : order / (count - 1)
      const x = edgeX + span * progress
      const normalized = Math.abs((x - 500) / Math.max(1, 500 - edgeX))
      const arcDepth = (1 - Math.min(1, normalized ** 2)) * 74
      const y = side === 'top' ? 155 - arcDepth : 405 + arcDepth
      const inwardX = x + (500 - x) * 0.23
      const standY = side === 'top' ? y + 78 : y - 78
      const nodeWidth = count <= 2 ? 354 : count === 3 ? 282 : 250

      stations[pieceIndex] = {
        x,
        y,
        standX: inwardX,
        standY,
        nodeWidth,
        group: side === 'top' ? 'live-action' : 'animation-motion',
        groupCount: count,
      }
    })
  }

  placeGroup(groups['live-action'], 'top')
  placeGroup(groups['animation-motion'], 'bottom')

  return {
    ...DESKTOP_LAYOUT,
    stations,
  }
}

function buildCompactLayout(pieces) {
  const verticalStep = 148
  const extraStations = Math.max(0, pieces.length - 4)
  const height = 680 + extraStations * verticalStep
  const stations = pieces.map((piece, index) => {
    const y = 82 + index * verticalStep
    return {
      x: 210,
      y,
      standX: 210,
      standY: y + 68,
      nodeWidth: 300,
      group: resolveHabitatGroup(piece),
      groupCount: 1,
    }
  })

  return {
    ...COMPACT_LAYOUT,
    height,
    start: { x: 210, y: 650 + extraStations * verticalStep },
    worldHeight: extraStations > 0 ? 570 + extraStations * 124 : null,
    stations,
  }
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    const sync = () => setMatches(media.matches)

    sync()
    media.addEventListener?.('change', sync)

    return () => media.removeEventListener?.('change', sync)
  }, [query])

  return matches
}

function HabitatVideoPlayer({ src, title }) {
  const { videoRef, preload } = useDeferredVideoMetadata('1600px 220px')

  return (
    <video
      ref={videoRef}
      className="motion-video"
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

function HabitatCutPlayer({ piece }) {
  const alternateCuts = motionAlternateCuts[piece.id] ?? []
  const fullCut = { id: 'full', label: 'Full edit', src: piece.src }
  const roastShortCut =
    piece.id === 'roast-live-action'
      ? alternateCuts.find((cut) => cut.id === 'short')
      : null
  const cuts = roastShortCut
    ? [roastShortCut, fullCut, ...alternateCuts.filter((cut) => cut.id !== 'short')]
    : [fullCut, ...alternateCuts]
  const [activeCutId, setActiveCutId] = useState(roastShortCut ? 'short' : 'full')
  const activeCut = cuts.find((cut) => cut.id === activeCutId) ?? cuts[0]

  return (
    <>
      <div
        className={`motion-frame ${
          piece.layout === 'portrait' ? 'motion-frame-portrait' : ''
        }`}
      >
        <HabitatVideoPlayer
          key={activeCut.src}
          src={activeCut.src}
          title={`${piece.title} ${activeCut.label}`}
        />
      </div>

      {cuts.length > 1 && (
        <div className="motion-cut-switcher">
          <span className="motion-cut-switcher-label">Available cuts</span>
          <div
            className="motion-cut-options"
            role="group"
            aria-label={`Choose ${piece.title} cut`}
          >
            {cuts.map((cut) => {
              const isActive = cut.id === activeCut.id

              return (
                <button
                  className={`motion-cut-option ${isActive ? 'is-active' : ''}`}
                  type="button"
                  key={cut.id}
                  aria-pressed={isActive}
                  onClick={() => setActiveCutId(cut.id)}
                >
                  {cut.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

function HabitatHologramPreview({ piece, meta, anchor, onPlay, emitterRef }) {
  const videoRef = useRef(null)
  const [isReady, setIsReady] = useState(Boolean(piece.previewImage))

  useEffect(() => {
    const video = videoRef.current

    return () => {
      video?.pause()
    }
  }, [])

  const prepareThumbnail = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    const duration = Number.isFinite(video.duration) ? video.duration : 0
    const maxFrameTime = Math.max(0, duration - 0.2)
    const frameTime = clamp(piece.previewStart ?? 0, 0, maxFrameTime)

    video.muted = true
    video.pause()

    try {
      if (Math.abs(video.currentTime - frameTime) > 0.05) {
        video.currentTime = frameTime
      }
    } catch {
      // If seeking is deferred, the browser will still show the available frame.
    }

    setIsReady(true)
  }, [piece.previewStart])

  return (
    <button
      className={`motion-habitat-hologram station-${meta.slug} ${
        piece.layout === 'portrait' ? 'is-portrait' : 'is-landscape'
      } ${isReady ? 'is-ready' : 'is-loading'}`}
      type="button"
      style={{
        '--hologram-x': `${anchor.x}%`,
        '--hologram-y': `${anchor.y}%`,
        '--hologram-aspect': piece.layout === 'portrait' ? '9 / 16' : '16 / 9',
        '--station-rgb': meta.rgb,
      }}
      aria-label={`Play full ${piece.title}`}
      onClick={onPlay}
    >
      <span className="motion-habitat-hologram-title" aria-hidden="true">
        {piece.habitatLabel ?? 'SIGNAL PREVIEW'}
      </span>
      <span className="motion-habitat-hologram-beam" aria-hidden="true" />
      <span
        ref={emitterRef}
        className="motion-habitat-hologram-emitter"
        aria-hidden="true"
      />

      <span className="motion-habitat-hologram-shell">
        {piece.previewImage ? (
          <img
            className="motion-habitat-hologram-image"
            src={piece.previewImage}
            alt=""
            aria-hidden="true"
            onLoad={() => setIsReady(true)}
            onError={() => setIsReady(true)}
          />
        ) : (
          <video
            ref={videoRef}
            className="motion-habitat-hologram-video"
            src={piece.src}
            muted
            playsInline
            preload="metadata"
            tabIndex={-1}
            onLoadedMetadata={prepareThumbnail}
            onSeeked={() => {
              videoRef.current?.pause()
              setIsReady(true)
            }}
            onError={() => setIsReady(true)}
          />
        )}

        <span className="motion-habitat-hologram-scan" />
        <span className="motion-habitat-hologram-noise" />

        <span className="motion-habitat-hologram-meta">
          SIGNAL {piece.number} · PREVIEW
        </span>

        <span className="motion-habitat-hologram-cta">
          <strong>{isReady ? 'CLICK TO PLAY' : 'ACQUIRING SIGNAL'}</strong>
          <small>{piece.title}</small>
        </span>
      </span>
    </button>
  )
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function normalizeKey(key) {
  const lower = key.toLowerCase()

  if (lower === 'w' || key === 'ArrowUp') return 'up'
  if (lower === 's' || key === 'ArrowDown') return 'down'
  if (lower === 'a' || key === 'ArrowLeft') return 'left'
  if (lower === 'd' || key === 'ArrowRight') return 'right'
  return null
}

function createProjectorSignalPath(start, end) {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const approachDirection = dx >= 0 ? 1 : -1

  const controlOne = {
    x: start.x + dx * 0.34,
    y: start.y + dy * 0.18,
  }
  const controlTwo = {
    x: end.x - approachDirection * Math.min(56, Math.max(30, Math.abs(dx) * 0.16)),
    y: end.y,
  }

  return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} C ${controlOne.x.toFixed(1)} ${controlOne.y.toFixed(1)} ${controlTwo.x.toFixed(1)} ${controlTwo.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`
}

function createEnergyPath(start, end, time) {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.hypot(dx, dy)
  if (length < 1) return ''

  const normalX = -dy / length
  const normalY = dx / length
  const phase = time * 0.0022
  const amplitude = Math.min(10, Math.max(4, length * 0.035))
  const stops = [0, 0.16, 0.32, 0.48, 0.64, 0.8, 1]

  const points = stops.map((progress) => {
    const envelope = Math.sin(Math.PI * progress)
    const primaryWave =
      Math.sin(phase + progress * Math.PI * 2.2) * amplitude * envelope
    const secondaryWave =
      Math.sin(phase * 0.62 - progress * Math.PI * 3.2) *
      amplitude *
      0.32 *
      envelope
    const offset = primaryWave + secondaryWave

    return {
      x: start.x + dx * progress + normalX * offset,
      y: start.y + dy * progress + normalY * offset,
    }
  })

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`

  for (let index = 1; index < points.length - 1; index += 1) {
    const point = points[index]
    const nextPoint = points[index + 1]
    const midX = (point.x + nextPoint.x) / 2
    const midY = (point.y + nextPoint.y) / 2

    path += ` Q ${point.x.toFixed(1)} ${point.y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`
  }

  const penultimate = points[points.length - 2]
  const last = points[points.length - 1]
  path += ` Q ${penultimate.x.toFixed(1)} ${penultimate.y.toFixed(1)} ${last.x.toFixed(1)} ${last.y.toFixed(1)}`

  return path
}

function MotionHabitat({ pieces, onOpenNotes }) {
  const roomRef = useRef(null)
  const worldRef = useRef(null)
  const characterRef = useRef(null)
  const energyPathRef = useRef(null)
  const energyPulseRef = useRef(null)
  const projectorEmitterRef = useRef(null)
  const signalPathRefs = useRef([])
  const joystickPadRef = useRef(null)
  const joystickKnobRef = useRef(null)
  const joystickPointerRef = useRef(null)
  const joystickVectorRef = useRef({ x: 0, y: 0 })
  const joystickGeometryRef = useRef(null)
  const energyRenderTimeRef = useRef(0)
  const positionRef = useRef({ ...DESKTOP_LAYOUT.start })
  const pressedKeysRef = useRef(new Set())
  const targetRef = useRef(null)
  const openIndexRef = useRef(null)
  const awakeIndexRef = useRef(null)
  const walkingRef = useRef(false)
  const centerPerchedRef = useRef(false)
  const energyIndexRef = useRef(null)
  const perchDirectionRef = useRef('right')
  const facingRef = useRef('right')
  const fallbackTimerRef = useRef(null)
  const suppressedStationRef = useRef(null)

  const isCompact = useMediaQuery('(max-width: 720px)')
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const layout = useMemo(
    () => (isCompact ? buildCompactLayout(pieces) : buildDesktopLayout(pieces)),
    [isCompact, pieces],
  )
  const stationMeta = useMemo(() => pieces.map(getStationMeta), [pieces])
  const groupCounts = useMemo(
    () =>
      pieces.reduce(
        (counts, piece) => {
          const group = resolveHabitatGroup(piece)
          counts[group] = (counts[group] ?? 0) + 1
          return counts
        },
        { 'live-action': 0, 'animation-motion': 0 },
      ),
    [pieces],
  )

  const [isOnline, setIsOnline] = useState(false)
  const [openIndex, setOpenIndex] = useState(null)
  const [awakeIndex, setAwakeIndex] = useState(null)
  const [targetedIndex, setTargetedIndex] = useState(null)
  const [isWalking, setIsWalking] = useState(false)
  const [isCenterPerched, setIsCenterPerched] = useState(false)
  const [energyIndex, setEnergyIndex] = useState(null)
  const [isJoystickEnabled, setIsJoystickEnabled] = useState(false)
  const [perchDirection, setPerchDirection] = useState('right')
  const [facing, setFacing] = useState('right')
  const [statusMessage, setStatusMessage] = useState(
    'Motion Habitat ready. Choose a station or move through the room.',
  )

  const activePiece = openIndex === null ? null : pieces[openIndex]
  const activeMeta = openIndex === null ? null : stationMeta[openIndex]
  const energyMeta = energyIndex === null ? null : stationMeta[energyIndex]

  const syncCharacter = useCallback(
    (position) => {
      const character = characterRef.current
      if (!character) return

      character.style.left = `${(position.x / layout.width) * 100}%`
      character.style.top = `${(position.y / layout.height) * 100}%`
    },
    [layout],
  )

  const setWalkingState = useCallback((nextWalking) => {
    if (walkingRef.current === nextWalking) return
    walkingRef.current = nextWalking
    setIsWalking(nextWalking)
  }, [])

  const setCenterPerchedState = useCallback((nextPerched) => {
    if (centerPerchedRef.current === nextPerched) return
    centerPerchedRef.current = nextPerched
    setIsCenterPerched(nextPerched)
  }, [])

  const setEnergyIndexState = useCallback((nextIndex) => {
    if (energyIndexRef.current === nextIndex) return
    energyIndexRef.current = nextIndex
    setEnergyIndex(nextIndex)
  }, [])

  const setPerchDirectionState = useCallback((nextDirection) => {
    if (perchDirectionRef.current === nextDirection) return
    perchDirectionRef.current = nextDirection
    setPerchDirection(nextDirection)
  }, [])

  const setFacingState = useCallback((nextFacing) => {
    if (facingRef.current === nextFacing) return
    facingRef.current = nextFacing
    setFacing(nextFacing)
  }, [])

  const resetJoystick = useCallback(() => {
    joystickPointerRef.current = null
    joystickVectorRef.current = { x: 0, y: 0 }
    joystickGeometryRef.current = null

    joystickPadRef.current?.classList.remove('is-engaged')
    worldRef.current?.classList.remove('is-joystick-dragging')

    const knob = joystickKnobRef.current
    if (knob) knob.style.transform = 'translate(-50%, -50%)'
  }, [])

  const focusWorldAfterPaint = useCallback(() => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        worldRef.current?.focus({ preventScroll: true })
      })
    })
  }, [])

  const updateJoystick = useCallback(
    (event) => {
      const pad = joystickPadRef.current
      const knob = joystickKnobRef.current
      if (!pad || !knob) return

      const geometry =
        joystickGeometryRef.current ??
        (() => {
          const rect = pad.getBoundingClientRect()
          const measured = {
            centerX: rect.left + rect.width / 2,
            centerY: rect.top + rect.height / 2,
            maxRadius: Math.max(
              28,
              Math.min(rect.width, rect.height) * 0.32,
            ),
          }
          joystickGeometryRef.current = measured
          return measured
        })()

      const { centerX, centerY, maxRadius } = geometry
      const rawX = event.clientX - centerX
      const rawY = event.clientY - centerY
      const rawDistance = Math.hypot(rawX, rawY)
      const scale = rawDistance > maxRadius ? maxRadius / rawDistance : 1
      const clampedX = rawX * scale
      const clampedY = rawY * scale
      const normalizedX = clampedX / maxRadius
      const normalizedY = clampedY / maxRadius
      const magnitude = Math.hypot(normalizedX, normalizedY)

      joystickVectorRef.current =
        magnitude < 0.08 ? { x: 0, y: 0 } : { x: normalizedX, y: normalizedY }

      knob.style.transform =
        `translate(calc(-50% + ${clampedX.toFixed(1)}px), calc(-50% + ${clampedY.toFixed(1)}px))`
    },
    [],
  )

  const activateStation = useCallback(
    (index) => {
      if (index < 0 || index >= pieces.length) return

      openIndexRef.current = index
      awakeIndexRef.current = index
      targetRef.current = null
      pressedKeysRef.current.clear()
      suppressedStationRef.current = null

      setOpenIndex(index)
      setAwakeIndex(index)
      setTargetedIndex(null)
      setWalkingState(false)
      setStatusMessage(`${pieces[index].title} station active. Viewing panel deployed.`)

      if (fallbackTimerRef.current) {
        window.clearTimeout(fallbackTimerRef.current)
        fallbackTimerRef.current = null
      }
    },
    [pieces, setWalkingState],
  )

  const arriveAtStation = useCallback(
    (index) => {
      if (index < 0 || index >= pieces.length) return

      targetRef.current = null
      pressedKeysRef.current.clear()
      awakeIndexRef.current = index
      suppressedStationRef.current = null

      setAwakeIndex(index)
      setTargetedIndex(null)
      setWalkingState(false)
      setStatusMessage(
        `${pieces[index].title} signal detected. Hologram preview ready.`,
      )

      if (fallbackTimerRef.current) {
        window.clearTimeout(fallbackTimerRef.current)
        fallbackTimerRef.current = null
      }
    },
    [pieces, setWalkingState],
  )

  const beginAutoWalk = useCallback(
    (index) => {
      if (index < 0 || index >= pieces.length) return

      suppressedStationRef.current = null

      if (reducedMotion) {
        activateStation(index)
        return
      }

      const previousOpenIndex = openIndexRef.current
      if (previousOpenIndex === index) return

      if (isCompact && previousOpenIndex !== null) {
        openIndexRef.current = null
        setOpenIndex(null)
      }

      const activeLayout = layout
      const station = activeLayout.stations[index]

      pressedKeysRef.current.clear()
      targetRef.current = {
        x: station.standX,
        y: station.standY,
        stationIndex: index,
      }

      setTargetedIndex(index)
      setStatusMessage(
        isCompact && previousOpenIndex !== null
          ? `Leaving ${pieces[previousOpenIndex].title}. Moving toward ${pieces[index].title}.`
          : `Moving toward ${pieces[index].title}.`,
      )
      setWalkingState(true)

      if (fallbackTimerRef.current) {
        window.clearTimeout(fallbackTimerRef.current)
      }

      fallbackTimerRef.current = window.setTimeout(
        () => {
          if (isCompact) activateStation(index)
          else arriveAtStation(index)
        },
        isCompact ? 900 : 1250,
      )
    },
    [
      activateStation,
      arriveAtStation,
      isCompact,
      layout,
      pieces,
      reducedMotion,
      setWalkingState,
    ],
  )

  useEffect(() => {
    const nextLayout = layout
    positionRef.current = { ...nextLayout.start }
    targetRef.current = null
    pressedKeysRef.current.clear()
    suppressedStationRef.current = null
    resetJoystick()
    setIsJoystickEnabled(false)
    setTargetedIndex(null)
    setWalkingState(false)
    setCenterPerchedState(false)
    setEnergyIndexState(null)
    energyPathRef.current?.removeAttribute('d')
    energyPulseRef.current?.removeAttribute('d')
    setPerchDirectionState('right')
    syncCharacter(positionRef.current)
  }, [
    layout,
    resetJoystick,
    setCenterPerchedState,
    setEnergyIndexState,
    setPerchDirectionState,
    setWalkingState,
    syncCharacter,
  ])

  useEffect(() => {
    const room = roomRef.current
    if (!room) return undefined

    if (!('IntersectionObserver' in window)) {
      setIsOnline(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setIsOnline(true)
        observer.disconnect()
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(room)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      setWalkingState(false)
      setCenterPerchedState(false)
      setEnergyIndexState(null)
      energyPathRef.current?.removeAttribute('d')
    energyPulseRef.current?.removeAttribute('d')
      targetRef.current = null
      pressedKeysRef.current.clear()
      resetJoystick()
      return undefined
    }

    const room = roomRef.current
    if (!room) return undefined

    let frameId = 0
    let lastTime = 0
    let running = false

    const frame = (time) => {
      if (!running) return

      const activeLayout = layout
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.04) : 0
      lastTime = time

      const current = positionRef.current
      let next = current
      let moving = false
      let dx = 0
      let dy = 0

      const target = targetRef.current

      if (target) {
        const remainingX = target.x - current.x
        const remainingY = target.y - current.y
        const remaining = Math.hypot(remainingX, remainingY)

        if (remaining <= 7) {
          next = { x: target.x, y: target.y }
          positionRef.current = next
          syncCharacter(next)

          if (isCompact) activateStation(target.stationIndex)
          else arriveAtStation(target.stationIndex)
        } else if (delta > 0) {
          const step = Math.min(AUTO_SPEED * delta, remaining)
          dx = (remainingX / remaining) * step
          dy = (remainingY / remaining) * step
          moving = true
        }
      } else if (!isCompact) {
        const joystick = joystickVectorRef.current
        const joystickMagnitude = Math.hypot(joystick.x, joystick.y)

        if (joystickMagnitude > 0.01) {
          dx = joystick.x * MANUAL_SPEED * delta
          dy = joystick.y * MANUAL_SPEED * delta
          moving = true
        } else {
          const keys = pressedKeysRef.current
          dx = (keys.has('right') ? 1 : 0) - (keys.has('left') ? 1 : 0)
          dy = (keys.has('down') ? 1 : 0) - (keys.has('up') ? 1 : 0)

          if (dx || dy) {
            const magnitude = Math.hypot(dx, dy)
            dx = (dx / magnitude) * MANUAL_SPEED * delta
            dy = (dy / magnitude) * MANUAL_SPEED * delta
            moving = true
          }
        }
      }

      if (moving) {
        next = {
          x: Math.min(activeLayout.width - 34, Math.max(34, current.x + dx)),
          y: Math.min(activeLayout.height - 36, Math.max(36, current.y + dy)),
        }
        positionRef.current = next
        syncCharacter(next)

        if (Math.abs(dx) > 0.01) {
          setFacingState(dx > 0 ? 'right' : 'left')
        }

        if (Math.abs(dy) > Math.abs(dx)) {
          setPerchDirectionState(dy < 0 ? 'up' : 'down')
        } else if (Math.abs(dx) > 0.01) {
          setPerchDirectionState(dx > 0 ? 'right' : 'left')
        }
      }

      setWalkingState(moving)

      const shouldPerchOnCenter =
        !isCompact &&
        distance(next, activeLayout.dock) <= CENTER_PERCH_RADIUS
      setCenterPerchedState(shouldPerchOnCenter)

      let nearestIndex = -1
      let nearestDistance = Number.POSITIVE_INFINITY
      let nearestSignalIndex = -1
      let nearestSignalDistance = Number.POSITIVE_INFINITY

      activeLayout.stations.forEach((station, index) => {
        const stationDistance = distance(next, station)
        if (stationDistance < nearestDistance) {
          nearestDistance = stationDistance
          nearestIndex = index
        }

        const approachDistance = distance(next, {
          x: station.standX,
          y: station.standY,
        })
        const signalDistance = Math.min(stationDistance, approachDistance)

        if (signalDistance < nearestSignalDistance) {
          nearestSignalDistance = signalDistance
          nearestSignalIndex = index
        }
      })

      if (suppressedStationRef.current !== null) {
        const suppressedStation = activeLayout.stations[suppressedStationRef.current]
        if (distance(next, suppressedStation) > WAKE_RADIUS) {
          suppressedStationRef.current = null
        }
      }

      const nextAwake =
        nearestSignalDistance <= WAKE_RADIUS &&
        suppressedStationRef.current !== nearestSignalIndex
          ? nearestSignalIndex
          : null
      if (awakeIndexRef.current !== nextAwake) {
        awakeIndexRef.current = nextAwake
        setAwakeIndex(nextAwake)

        if (openIndexRef.current === null) {
          setStatusMessage(
            nextAwake === null
              ? 'Signal lost. Continue exploring the Motion Habitat.'
              : `${pieces[nextAwake].title} signal detected. Hologram preview ready.`,
          )
        }
      }

      const nextEnergyIndex =
        !isCompact &&
        nearestSignalDistance <= ENERGY_RADIUS &&
        suppressedStationRef.current !== nearestSignalIndex
          ? nearestSignalIndex
          : null
      setEnergyIndexState(nextEnergyIndex)

      const energyPath = energyPathRef.current
      const energyPulse = energyPulseRef.current

      if (energyPath && nextEnergyIndex !== null) {
        const shouldRefreshEnergyPath =
          !energyPath.hasAttribute('d') ||
          time - energyRenderTimeRef.current >= 32

        if (shouldRefreshEnergyPath) {
          energyRenderTimeRef.current = time
          const energyStation = activeLayout.stations[nextEnergyIndex]
          const bodyCenter = {
            x: next.x,
            y: next.y - (shouldPerchOnCenter ? 10 : 15),
          }
          const signalX = energyStation.x - bodyCenter.x
          const signalY = energyStation.y - bodyCenter.y
          const signalLength = Math.max(1, Math.hypot(signalX, signalY))

          // With no drawn arm, let the signal meet the torso itself. Offset the
          // endpoint only slightly toward the station so the glowing line appears
          // to touch the body's outline instead of passing through its center.
          const connectionPoint = {
            x: bodyCenter.x + (signalX / signalLength) * 4.5,
            y: bodyCenter.y + (signalY / signalLength) * 4.5,
          }

          const energyD = createEnergyPath(energyStation, connectionPoint, time)
          energyPath.setAttribute('d', energyD)
          energyPulse?.setAttribute('d', energyD)
        }
      } else {
        energyRenderTimeRef.current = 0
        energyPath?.removeAttribute('d')
        energyPulse?.removeAttribute('d')
      }

      if (
        isCompact &&
        nearestIndex >= 0 &&
        nearestDistance <= ACTIVATE_RADIUS &&
        openIndexRef.current !== nearestIndex &&
        suppressedStationRef.current !== nearestIndex
      ) {
        activateStation(nearestIndex)
      }

      frameId = window.requestAnimationFrame(frame)
    }

    const start = () => {
      if (running) return
      running = true
      lastTime = 0
      frameId = window.requestAnimationFrame(frame)
    }

    const stop = () => {
      running = false
      if (frameId) window.cancelAnimationFrame(frameId)
      frameId = 0
      lastTime = 0
      setWalkingState(false)
      setCenterPerchedState(false)
      setEnergyIndexState(null)
      resetJoystick()
      energyPathRef.current?.removeAttribute('d')
      energyPulseRef.current?.removeAttribute('d')
    }

    if (!('IntersectionObserver' in window)) {
      start()
      return stop
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start()
        else stop()
      },
      { rootMargin: '220px 0px' },
    )

    observer.observe(room)

    return () => {
      observer.disconnect()
      stop()
    }
  }, [
    activateStation,
    arriveAtStation,
    isCompact,
    layout,
    pieces,
    reducedMotion,
    resetJoystick,
    setCenterPerchedState,
    setEnergyIndexState,
    setPerchDirectionState,
    setFacingState,
    setWalkingState,
    syncCharacter,
  ])

  useEffect(() => {
    if (
      isCompact ||
      reducedMotion ||
      awakeIndex === null ||
      openIndex !== null
    ) {
      signalPathRefs.current.forEach((path) => {
        path?.removeAttribute('data-projector-linked')
      })
      return undefined
    }

    const signalPath = signalPathRefs.current[awakeIndex]
    const emitter = projectorEmitterRef.current
    const world = worldRef.current
    const station = layout.stations[awakeIndex]

    if (!signalPath || !emitter || !world || !station) return undefined

    let frameId = 0
    let settledFrames = 0
    const startedAt = performance.now()

    const syncSignalToEmitter = (time) => {
      const worldRect = world.getBoundingClientRect()
      const emitterRect = emitter.getBoundingClientRect()

      if (worldRect.width <= 0 || worldRect.height <= 0) return

      const enterFromLeft = station.x < layout.width / 2
      const emitterClientX = enterFromLeft
        ? emitterRect.left + emitterRect.width * 0.16
        : emitterRect.right - emitterRect.width * 0.16
      const emitterClientY = emitterRect.top + emitterRect.height * 0.5

      const emitterPoint = {
        x: ((emitterClientX - worldRect.left) / worldRect.width) * layout.width,
        y: ((emitterClientY - worldRect.top) / worldRect.height) * layout.height,
      }

      signalPath.setAttribute(
        'd',
        createProjectorSignalPath(station, emitterPoint),
      )
      signalPath.setAttribute('data-projector-linked', 'true')

      const hologram = emitter.closest('.motion-habitat-hologram')
      const bloomStillRunning = hologram
        ?.getAnimations()
        .some((animation) => animation.playState === 'running')

      if (bloomStillRunning || time - startedAt < 520) {
        settledFrames = 0
        frameId = window.requestAnimationFrame(syncSignalToEmitter)
        return
      }

      // Two final frames keep the endpoint locked after compositing settles.
      if (settledFrames < 2) {
        settledFrames += 1
        frameId = window.requestAnimationFrame(syncSignalToEmitter)
      }
    }

    frameId = window.requestAnimationFrame(syncSignalToEmitter)

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
      signalPath.removeAttribute('data-projector-linked')
    }
  }, [awakeIndex, isCompact, layout, openIndex, reducedMotion])

  useEffect(
    () => () => {
      if (fallbackTimerRef.current) {
        window.clearTimeout(fallbackTimerRef.current)
      }
    },
    [],
  )

  const handleKeyDown = (event) => {
    if (isCompact || reducedMotion) return
    if (event.target !== event.currentTarget) return

    const direction = normalizeKey(event.key)
    if (!direction) return

    event.preventDefault()
    targetRef.current = null
    setTargetedIndex(null)

    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }

    pressedKeysRef.current.add(direction)
    setWalkingState(true)
  }

  const handleKeyUp = (event) => {
    if (isCompact || reducedMotion) return
    if (event.target !== event.currentTarget) return

    const direction = normalizeKey(event.key)
    if (!direction) return

    event.preventDefault()
    pressedKeysRef.current.delete(direction)
    if (!pressedKeysRef.current.size) setWalkingState(false)
  }

  const handleWorldBlur = (event) => {
    if (event.target !== event.currentTarget) return
    pressedKeysRef.current.clear()
    setWalkingState(false)
    setCenterPerchedState(false)
  }

  const handleWorldPointerDown = (event) => {
    if (event.target.closest('button, video, a')) return
    focusWorldAfterPaint()
  }

  const handleJoystickPointerDown = (event) => {
    event.preventDefault()
    event.stopPropagation()

    targetRef.current = null
    setTargetedIndex(null)
    pressedKeysRef.current.clear()

    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }

    joystickPointerRef.current = event.pointerId
    event.currentTarget.classList.add('is-engaged')
    worldRef.current?.classList.add('is-joystick-dragging')
    event.currentTarget.setPointerCapture?.(event.pointerId)

    const rect = event.currentTarget.getBoundingClientRect()
    joystickGeometryRef.current = {
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      maxRadius: Math.max(28, Math.min(rect.width, rect.height) * 0.32),
    }

    updateJoystick(event)
    focusWorldAfterPaint()
  }

  const handleJoystickPointerMove = (event) => {
    if (joystickPointerRef.current !== event.pointerId) return
    event.preventDefault()
    event.stopPropagation()
    updateJoystick(event)
  }

  const handleJoystickPointerEnd = (event) => {
    if (joystickPointerRef.current !== event.pointerId) return
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    resetJoystick()

    if (!pressedKeysRef.current.size) setWalkingState(false)
  }

  const toggleJoystick = () => {
    setIsJoystickEnabled((enabled) => {
      const nextEnabled = !enabled
      if (!nextEnabled) {
        resetJoystick()
        if (!pressedKeysRef.current.size) setWalkingState(false)
      }
      return nextEnabled
    })
  }

  const closePanel = () => {
    const closingIndex = openIndexRef.current
    if (closingIndex !== null) suppressedStationRef.current = closingIndex

    openIndexRef.current = null
    setOpenIndex(null)
    setTargetedIndex(null)
    setStatusMessage('Viewing panel closed. Continue exploring the Motion Habitat.')

    if (!isCompact && !reducedMotion) {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          worldRef.current?.focus({ preventScroll: true })
        })
      })
    }
  }

  const projection = layout.projection ?? layout.dock
  const paths = layout.stations.map((station, index) => {
    const bendX = (station.x + projection.x) / 2
    const bendY = station.y < projection.y ? station.y + 70 : station.y - 70

    return {
      index,
      d: `M ${station.x} ${station.y} Q ${bendX} ${bendY} ${projection.x} ${projection.y}`,
    }
  })

  return (
    <section
      ref={roomRef}
      className={`motion-habitat ${isOnline ? 'is-online' : ''} ${
        reducedMotion ? 'is-reduced' : ''
      } ${activePiece ? 'has-open-panel' : ''} ${
        awakeIndex !== null || targetedIndex !== null || openIndex !== null
          ? 'has-active-station'
          : ''
      }`}
      aria-label="Motion Habitat interactive project archive"
    >
      <header className="motion-habitat-header">
        <div>
          <span className="motion-habitat-kicker">
            Motion Habitat · {String(pieces.length).padStart(2, '0')} Signal Stations
          </span>
          <p>
            {isCompact
              ? reducedMotion
                ? 'Tap a station to open its video below.'
                : 'Tap a station and Keana will walk there. The selected video opens below.'
              : 'A quiet cyber-botanical lab for Keana\'s motion work.'}
          </p>
        </div>
        <div className="motion-habitat-header-actions">
          <span className="motion-habitat-system" aria-hidden="true">
            GRID 07-B · SIGNAL READY
          </span>
          {!isCompact && !reducedMotion && (
            <button
              className={`motion-habitat-joystick-toggle ${
                isJoystickEnabled ? 'is-active' : ''
              }`}
              type="button"
              aria-pressed={isJoystickEnabled}
              aria-controls="motion-habitat-joystick"
              onClick={toggleJoystick}
            >
              <span aria-hidden="true">◉</span>
              {isJoystickEnabled ? 'JOYSTICK ON' : 'JOYSTICK'}
            </button>
          )}
        </div>
      </header>

      <div
        ref={worldRef}
        className="motion-habitat-world"
        tabIndex={isCompact || reducedMotion ? -1 : 0}
        role="group"
        aria-label={
          reducedMotion
            ? 'Choose a motion station to open its video.'
            : isCompact
              ? 'Tap a motion station to move Keana toward it and open its video below.'
              : 'Use W A S D or arrow keys while this habitat is focused, or choose any station directly.'
        }
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onBlur={handleWorldBlur}
        onPointerDown={isCompact || reducedMotion ? undefined : handleWorldPointerDown}
        style={
          isCompact && layout.worldHeight
            ? { minHeight: `${layout.worldHeight}px`, height: `${layout.worldHeight}px` }
            : undefined
        }
      >
        <div className="motion-habitat-grid" aria-hidden="true" />

        {!isCompact && (
          <>
            <div
              className="motion-habitat-sector-label is-live-action"
              aria-hidden="true"
            >
              <span>LIVE ACTION</span>
              <small>{String(groupCounts['live-action']).padStart(2, '0')} SIGNALS</small>
            </div>

            <div
              className="motion-habitat-sector-label is-animation"
              aria-hidden="true"
            >
              <span>ANIMATION / MOTION</span>
              <small>{String(groupCounts['animation-motion']).padStart(2, '0')} SIGNALS</small>
            </div>

            <div
              className={`motion-habitat-projection-field ${
                awakeIndex !== null && openIndex === null ? 'is-active' : ''
              }`}
              aria-hidden="true"
              style={{
                '--projection-x': `${(projection.x / layout.width) * 100}%`,
                '--projection-y': `${(projection.y / layout.height) * 100}%`,
              }}
            >
              <span>
                PROJECTION FIELD //{' '}
                {awakeIndex !== null && openIndex === null ? 'SIGNAL' : 'STANDBY'}
              </span>
            </div>
          </>
        )}

        {!isCompact && (
          <img
            className="motion-habitat-center-flower"
            src="/images/motion-habitat/center-flower.png"
            alt=""
            aria-hidden="true"
            style={{
              '--dock-x': `${(layout.dock.x / layout.width) * 100}%`,
              '--dock-y': `${(layout.dock.y / layout.height) * 100}%`,
            }}
          />
        )}

        <svg
          className="motion-habitat-signals"
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {!isCompact && (
            <>
              <path
                className="motion-habitat-archive-rail is-live-action"
                d="M 135 158 Q 500 62 865 158"
              />
              <path
                className="motion-habitat-archive-rail is-animation-motion"
                d="M 135 407 Q 500 500 865 407"
              />
            </>
          )}

          {paths.map(({ index, d }) => {
            const isProjectorFeed =
              awakeIndex === index && openIndex === null && !isCompact

            return (
              <path
                key={pieces[index].id}
                ref={(node) => {
                  signalPathRefs.current[index] = node
                }}
                className={`motion-habitat-signal ${
                  isProjectorFeed ? 'is-live is-projector-feed' : ''
                }`}
                style={{
                  '--signal-rgb': stationMeta[index]?.rgb ?? '168, 188, 99',
                }}
                d={d}
              />
            )
          })}
          <circle
            className={`motion-habitat-dock ${activePiece ? 'is-live' : ''}`}
            cx={projection.x}
            cy={projection.y}
            r="8"
          />
          <path
            ref={energyPathRef}
            className={`motion-habitat-energy ${energyMeta ? 'is-live' : ''}`}
            style={{
              '--energy-rgb': energyMeta?.rgb ?? '168, 188, 99',
            }}
          />
          <path
            ref={energyPulseRef}
            className={`motion-habitat-energy-pulse ${energyMeta ? 'is-live' : ''}`}
            style={{
              '--energy-rgb': energyMeta?.rgb ?? '168, 188, 99',
            }}
          />
        </svg>

        {pieces.map((piece, index) => {
          const station = layout.stations[index]
          const meta = stationMeta[index]
          const isAwake = awakeIndex === index
          const isTargeted = targetedIndex === index
          const isOpen = openIndex === index
          const habitatGroup = resolveHabitatGroup(piece)

          return (
            <button
              className={`motion-habitat-station station-${meta.slug} ${
                isAwake ? 'is-awake' : ''
              } ${isTargeted ? 'is-targeted' : ''} ${isOpen ? 'is-open' : ''}`}
              data-habitat-group={habitatGroup}
              type="button"
              key={piece.id}
              style={{
                '--station-x': `${(station.x / layout.width) * 100}%`,
                '--station-y': `${(station.y / layout.height) * 100}%`,
                '--station-rgb': meta.rgb,
                '--node-width': `${station.nodeWidth ?? 176}px`,
                '--group-count': station.groupCount ?? 1,
              }}
              aria-pressed={isOpen}
              aria-label={
                isAwake
                  ? `Play full ${piece.title}`
                  : `Approach ${piece.title}`
              }
              onClick={() =>
                isAwake ? activateStation(index) : beginAutoWalk(index)
              }
            >
              <span className="motion-habitat-station-number">{piece.number}</span>
              <span className="motion-habitat-machine" aria-hidden="true">
                <span className="motion-habitat-machine-screen">
                  {meta.accent === 'chapters' && (
                    <span className="motion-habitat-memory-slides">
                      {['red', 'purple', 'yellow', 'red', 'purple', 'yellow'].map(
                        (chapter, slideIndex) => (
                          <span
                            className={`motion-habitat-memory-slide chapter-${chapter}`}
                            key={`${chapter}-${slideIndex}`}
                          >
                            <b>{chapter === 'red' ? 'R' : chapter === 'purple' ? 'P' : 'Y'}</b>
                            <i />
                          </span>
                        ),
                      )}
                    </span>
                  )}
                </span>
                <span className="motion-habitat-machine-node" />
                <span className={`motion-habitat-machine-accent accent-${meta.accent}`}>
                  {meta.accent === 'chapters' && (
                    <>
                      <i className="chapter-red" />
                      <i className="chapter-purple" />
                      <i className="chapter-yellow" />
                    </>
                  )}
                </span>
              </span>

              <span className="motion-habitat-station-copy">
                <span>{meta.system}</span>
                <strong>{piece.title}</strong>
                <small>{piece.category}</small>
                <em>
                  {isOpen
                    ? 'VIEWING PANEL OPEN'
                    : isAwake
                      ? 'SIGNAL DETECTED'
                      : isTargeted
                        ? 'APPROACHING'
                        : isCompact
                          ? reducedMotion
                            ? 'TAP TO OPEN'
                            : 'TAP TO EXPLORE'
                          : 'DORMANT'}
                </em>
              </span>
            </button>
          )
        })}

        {!isCompact &&
          !reducedMotion &&
          awakeIndex !== null &&
          openIndex === null &&
          pieces[awakeIndex] &&
          stationMeta[awakeIndex] && (
            <HabitatHologramPreview
              key={pieces[awakeIndex].id}
              piece={pieces[awakeIndex]}
              meta={stationMeta[awakeIndex]}
              anchor={{
                x: (projection.x / layout.width) * 100,
                y: (projection.y / layout.height) * 100,
              }}
              onPlay={() => activateStation(awakeIndex)}
              emitterRef={projectorEmitterRef}
            />
          )}

        <div
          ref={characterRef}
          className={`motion-habitat-character ${isWalking ? 'is-walking' : ''} ${
            isCenterPerched ? 'is-center-perched' : ''
          } ${energyMeta ? 'has-station-energy' : ''}`}
          style={energyMeta ? { '--energy-rgb': energyMeta.rgb } : undefined}
          data-facing={facing}
          data-perch-direction={perchDirection}
          aria-hidden="true"
        >
          <span className="motion-habitat-character-head" />
          <span className="motion-habitat-character-body" />
          <span className="motion-habitat-character-leg leg-one" />
          <span className="motion-habitat-character-leg leg-two" />
        </div>

        {!isCompact && !reducedMotion && (
          <div className="motion-habitat-controls" aria-hidden="true">
            <span className="motion-habitat-keys">
              <b>W</b>
              <b>A</b>
              <b>S</b>
              <b>D</b>
            </span>
            <span>MOVE · ARROWS ALSO WORK</span>
          </div>
        )}

        {!isCompact && isJoystickEnabled && !reducedMotion && (
          <div
            ref={joystickPadRef}
            id="motion-habitat-joystick"
            className="motion-habitat-joystick"
            role="group"
            aria-label="Touch joystick. Drag in any direction to move Keana."
            onPointerDown={handleJoystickPointerDown}
            onPointerMove={handleJoystickPointerMove}
            onPointerUp={handleJoystickPointerEnd}
            onPointerCancel={handleJoystickPointerEnd}
          >
            <span className="motion-habitat-joystick-ring" aria-hidden="true" />
            <span
              ref={joystickKnobRef}
              className="motion-habitat-joystick-knob"
              aria-hidden="true"
            />
          </div>
        )}

        <div className="motion-habitat-coordinate" aria-hidden="true">
          X 47.0 · Y 81.5 · NODE SCAN
        </div>
      </div>

      {activePiece && (
        <article
          className={`motion-habitat-panel ${
            activePiece.layout === 'portrait' ? 'is-portrait' : ''
          } ${motionAlternateCuts[activePiece.id] ? 'has-cuts' : ''}`}
          key={activePiece.id}
          aria-label={`${activePiece.title} viewing panel`}
        >
          <header className="motion-habitat-panel-head">
            <div>
              <span>
                SIGNAL {activePiece.number} · {activeMeta?.system}
              </span>
              <strong>{activePiece.title}</strong>
            </div>
            <button type="button" onClick={closePanel} aria-label="Close viewing panel">
              Close <span aria-hidden="true">×</span>
            </button>
          </header>

          <div className="motion-habitat-panel-body">
            <div className="motion-screening-media motion-habitat-panel-media">
              <HabitatCutPlayer key={activePiece.id} piece={activePiece} />
            </div>

            <div className="motion-habitat-panel-copy">
              <span className="motion-habitat-panel-category">{activePiece.category}</span>
              {activePiece.latest && activePiece.dateLabel && (
                <span className="motion-habitat-panel-date">Latest work · {activePiece.dateLabel}</span>
              )}
              {activePiece.credit && (
                <span className="motion-habitat-panel-credit">{activePiece.credit}</span>
              )}
              <p>{activePiece.reflection}</p>

              {activePiece.creationNotes && (
                <button
                  className="motion-habitat-notes"
                  type="button"
                  onClick={() => onOpenNotes(activePiece)}
                >
                  Read creation notes <span aria-hidden="true">↗</span>
                </button>
              )}
            </div>
          </div>
        </article>
      )}

      <p className="motion-habitat-status" role="status" aria-live="polite">
        {statusMessage}
      </p>
    </section>
  )
}

export default MotionHabitat
