import { useCallback, useEffect, useRef, useState } from 'react'
import { motionAlternateCuts } from '../data/motion-cuts.js'
import useDeferredVideoMetadata from '../hooks/useDeferredVideoMetadata.js'
import '../motion-habitat.css'

const DESKTOP_LAYOUT = {
  width: 1000,
  height: 560,
  start: { x: 470, y: 462 },
  dock: { x: 500, y: 282 },
  stations: [
    { x: 176, y: 210, standX: 286, standY: 238 },
    { x: 806, y: 158, standX: 690, standY: 224 },
    { x: 792, y: 398, standX: 676, standY: 392 },
  ],
}

const COMPACT_LAYOUT = {
  width: 420,
  height: 680,
  start: { x: 210, y: 610 },
  dock: { x: 210, y: 340 },
  stations: [
    { x: 210, y: 112, standX: 210, standY: 192 },
    { x: 210, y: 300, standX: 210, standY: 378 },
    { x: 210, y: 492, standX: 210, standY: 570 },
  ],
}

const STATION_META = [
  { slug: 'roast', system: 'LIVE / CAFE', accent: 'warm' },
  { slug: 'special', system: 'MOTION / RHYTHM', accent: 'pulse' },
  { slug: 'first-love', system: 'MEMORY / COLOR', accent: 'chapters' },
]

const MANUAL_SPEED = 260
const AUTO_SPEED = 620
const WAKE_RADIUS = 145
const ACTIVATE_RADIUS = 82

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
  const cuts = [
    ...alternateCuts,
    { id: 'full', label: 'Full edit', src: piece.src },
  ]
  const [activeCutId, setActiveCutId] = useState(alternateCuts[0]?.id ?? 'full')
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

function MotionHabitat({ pieces, onOpenNotes }) {
  const roomRef = useRef(null)
  const worldRef = useRef(null)
  const characterRef = useRef(null)
  const positionRef = useRef({ ...DESKTOP_LAYOUT.start })
  const pressedKeysRef = useRef(new Set())
  const targetRef = useRef(null)
  const openIndexRef = useRef(null)
  const awakeIndexRef = useRef(null)
  const walkingRef = useRef(false)
  const facingRef = useRef('right')
  const fallbackTimerRef = useRef(null)
  const suppressedStationRef = useRef(null)

  const isCompact = useMediaQuery('(max-width: 720px)')
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const layout = isCompact ? COMPACT_LAYOUT : DESKTOP_LAYOUT

  const [isOnline, setIsOnline] = useState(false)
  const [openIndex, setOpenIndex] = useState(null)
  const [awakeIndex, setAwakeIndex] = useState(null)
  const [targetedIndex, setTargetedIndex] = useState(null)
  const [isWalking, setIsWalking] = useState(false)
  const [facing, setFacing] = useState('right')
  const [statusMessage, setStatusMessage] = useState(
    'Motion Habitat ready. Choose a station or move through the room.',
  )

  const activePiece = openIndex === null ? null : pieces[openIndex]
  const activeMeta = openIndex === null ? null : STATION_META[openIndex]

  const syncCharacter = useCallback((position) => {
    const character = characterRef.current
    if (!character) return

    const activeLayout = isCompact ? COMPACT_LAYOUT : DESKTOP_LAYOUT
    character.style.left = `${(position.x / activeLayout.width) * 100}%`
    character.style.top = `${(position.y / activeLayout.height) * 100}%`
  }, [isCompact])

  const setWalkingState = useCallback((nextWalking) => {
    if (walkingRef.current === nextWalking) return
    walkingRef.current = nextWalking
    setIsWalking(nextWalking)
  }, [])

  const setFacingState = useCallback((nextFacing) => {
    if (facingRef.current === nextFacing) return
    facingRef.current = nextFacing
    setFacing(nextFacing)
  }, [])

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

      const activeLayout = isCompact ? COMPACT_LAYOUT : DESKTOP_LAYOUT
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
        () => activateStation(index),
        isCompact ? 900 : 1250,
      )
    },
    [activateStation, isCompact, pieces, reducedMotion, setWalkingState],
  )

  useEffect(() => {
    const nextLayout = isCompact ? COMPACT_LAYOUT : DESKTOP_LAYOUT
    positionRef.current = { ...nextLayout.start }
    targetRef.current = null
    pressedKeysRef.current.clear()
    suppressedStationRef.current = null
    setTargetedIndex(null)
    setWalkingState(false)
    syncCharacter(positionRef.current)
  }, [isCompact, setWalkingState, syncCharacter])

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
      targetRef.current = null
      pressedKeysRef.current.clear()
      return undefined
    }

    const room = roomRef.current
    if (!room) return undefined

    let frameId = 0
    let lastTime = 0
    let running = false

    const frame = (time) => {
      if (!running) return

      const activeLayout = isCompact ? COMPACT_LAYOUT : DESKTOP_LAYOUT
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
          activateStation(target.stationIndex)
        } else if (delta > 0) {
          const step = Math.min(AUTO_SPEED * delta, remaining)
          dx = (remainingX / remaining) * step
          dy = (remainingY / remaining) * step
          moving = true
        }
      } else if (!isCompact) {
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
      }

      setWalkingState(moving)

      let nearestIndex = -1
      let nearestDistance = Number.POSITIVE_INFINITY

      activeLayout.stations.forEach((station, index) => {
        const stationDistance = distance(next, station)
        if (stationDistance < nearestDistance) {
          nearestDistance = stationDistance
          nearestIndex = index
        }
      })

      if (suppressedStationRef.current !== null) {
        const suppressedStation = activeLayout.stations[suppressedStationRef.current]
        if (distance(next, suppressedStation) > WAKE_RADIUS) {
          suppressedStationRef.current = null
        }
      }

      const nextAwake = nearestDistance <= WAKE_RADIUS ? nearestIndex : null
      if (awakeIndexRef.current !== nextAwake) {
        awakeIndexRef.current = nextAwake
        setAwakeIndex(nextAwake)
      }

      if (
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
  }, [activateStation, isCompact, reducedMotion, setFacingState, setWalkingState, syncCharacter])

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
  }

  const handleWorldPointerDown = (event) => {
    if (event.target.closest('button, video, a')) return
    worldRef.current?.focus({ preventScroll: true })
  }

  const closePanel = () => {
    const closingIndex = openIndexRef.current
    openIndexRef.current = null
    targetRef.current = null
    pressedKeysRef.current.clear()
    suppressedStationRef.current = closingIndex

    setOpenIndex(null)
    setTargetedIndex(null)
    setWalkingState(false)
    setStatusMessage('Panel closed. Choose another signal station.')

    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }
  }

  return (
    <div
      className={`motion-habitat ${isOnline ? 'is-online' : ''} ${
        isCompact ? 'is-compact' : ''
      }`}
      ref={roomRef}
    >
      <div className="motion-habitat-status" aria-hidden="true">
        <span>Motion habitat · 03 signal stations</span>
        <span>Grid 07-B · {isOnline ? 'signal ready' : 'initializing'}</span>
      </div>

      <div
        className="motion-habitat-world"
        ref={worldRef}
        tabIndex={isCompact || reducedMotion ? -1 : 0}
        aria-label="Interactive motion habitat. Use WASD or arrow keys to move, or choose a signal station."
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onBlur={handleWorldBlur}
        onPointerDown={handleWorldPointerDown}
      >
        <div className="motion-habitat-grid" aria-hidden="true" />
        <div className="motion-habitat-rail" aria-hidden="true" />
        <div className="motion-habitat-dock" aria-hidden="true" />

        <div
          className={`motion-habitat-character ${isWalking ? 'is-walking' : ''} is-facing-${facing}`}
          ref={characterRef}
          style={{
            left: `${(layout.start.x / layout.width) * 100}%`,
            top: `${(layout.start.y / layout.height) * 100}%`,
          }}
          aria-hidden="true"
        >
          <span className="motion-character-head" />
          <span className="motion-character-body" />
          <span className="motion-character-leg motion-character-leg-left" />
          <span className="motion-character-leg motion-character-leg-right" />
        </div>

        {pieces.map((piece, index) => {
          const station = layout.stations[index]
          const meta = STATION_META[index]
          const isAwake = awakeIndex === index || openIndex === index
          const isTargeted = targetedIndex === index

          return (
            <button
              className={`motion-habitat-station motion-habitat-station-${meta.accent} ${
                isAwake ? 'is-awake' : ''
              } ${isTargeted ? 'is-targeted' : ''}`}
              type="button"
              key={piece.id}
              style={{
                left: `${(station.x / layout.width) * 100}%`,
                top: `${(station.y / layout.height) * 100}%`,
              }}
              onClick={() => beginAutoWalk(index)}
              aria-label={`Open ${piece.title}`}
            >
              <span className="motion-station-index">0{index + 1}</span>
              <span className="motion-station-preview" aria-hidden="true">
                <span className="motion-station-preview-frame" />
              </span>
              <span className="motion-station-system">{meta.system}</span>
              <span className="motion-station-title">{piece.title}</span>
              <span className="motion-station-signal" aria-hidden="true" />
            </button>
          )
        })}

        <div
          className={`motion-habitat-panel ${activePiece ? 'is-open' : ''}`}
          aria-hidden={!activePiece}
        >
          {activePiece && (
            <>
              <div className="motion-panel-head">
                <div>
                  <span>
                    Signal 0{openIndex + 1} · {activeMeta.system}
                  </span>
                  <h3>{activePiece.title}</h3>
                </div>
                <button type="button" onClick={closePanel}>
                  Close ×
                </button>
              </div>

              <div className="motion-panel-body">
                <div className="motion-panel-media">
                  <HabitatCutPlayer piece={activePiece} />
                </div>

                <div className="motion-panel-story">
                  <div className="motion-panel-meta">
                    <span>{activePiece.category}</span>
                    <span>Latest work · Sep 2026</span>
                    <span>Filmed &amp; edited by Patricia Keana Roma</span>
                  </div>
                  <p>{activePiece.note}</p>
                  <button
                    className="motion-notes-button"
                    type="button"
                    onClick={() => onOpenNotes(activePiece)}
                  >
                    Read creation notes ↗
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="motion-habitat-controls" aria-hidden="true">
          <span>W</span>
          <span>A</span>
          <span>S</span>
          <span>D</span>
          <small>or</small>
          <span>←</span>
          <span>↓</span>
          <span>↑</span>
          <span>→</span>
          <small>move · click station · auto-walk</small>
        </div>

        <p className="sr-only" aria-live="polite">
          {statusMessage}
        </p>
      </div>
    </div>
  )
}

export default MotionHabitat
