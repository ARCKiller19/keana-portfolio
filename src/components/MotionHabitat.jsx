import { useCallback, useEffect, useRef, useState } from 'react'
import { motionAlternateCuts } from '../data/motion-cuts.js'
import useDeferredVideoMetadata from '../hooks/useDeferredVideoMetadata.js'
import '../motion-habitat.css'

const DESKTOP_LAYOUT = {
  width: 1000,
  height: 560,
  start: { x: 500, y: 282 },
  dock: { x: 500, y: 282 },
  stations: [
    { x: 190, y: 150, standX: 340, standY: 220 },
    { x: 790, y: 150, standX: 660, standY: 220 },
    { x: 210, y: 400, standX: 340, standY: 392 },
    { x: 790, y: 400, standX: 660, standY: 392 },
  ],
}

const COMPACT_LAYOUT = {
  width: 420,
  height: 680,
  start: { x: 210, y: 650 },
  dock: { x: 210, y: 340 },
  stations: [
    { x: 210, y: 82, standX: 210, standY: 150 },
    { x: 210, y: 230, standX: 210, standY: 298 },
    { x: 210, y: 378, standX: 210, standY: 446 },
    { x: 210, y: 526, standX: 210, standY: 594 },
  ],
}

const STATION_META = [
  { slug: 'roast', system: 'LIVE / CAFE', accent: 'warm', rgb: '184, 180, 168' },
  { slug: 'kove', system: 'LIVE / CAFE / FRIENDS', accent: 'ambient', rgb: '208, 138, 75' },
  { slug: 'special', system: 'MOTION / RHYTHM', accent: 'pulse', rgb: '168, 188, 99' },
  { slug: 'first-love', system: 'MEMORY / COLOR', accent: 'chapters', rgb: '142, 120, 166' },
]

const MANUAL_SPEED = 260
const AUTO_SPEED = 620
const WAKE_RADIUS = 150
const ACTIVATE_RADIUS = 82
const CENTER_PERCH_RADIUS = 34

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
  const joystickPadRef = useRef(null)
  const joystickKnobRef = useRef(null)
  const joystickPointerRef = useRef(null)
  const joystickVectorRef = useRef({ x: 0, y: 0 })
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
  const layout = isCompact ? COMPACT_LAYOUT : DESKTOP_LAYOUT

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
  const activeMeta = openIndex === null ? null : STATION_META[openIndex]
  const energyMeta = energyIndex === null ? null : STATION_META[energyIndex]

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

    joystickPadRef.current?.classList.remove('is-engaged')
    worldRef.current?.classList.remove('is-joystick-dragging')

    const knob = joystickKnobRef.current
    if (knob) knob.style.transform = 'translate(-50%, -50%)'
  }, [])

  const updateJoystick = useCallback(
    (event) => {
      const pad = joystickPadRef.current
      const knob = joystickKnobRef.current
      if (!pad || !knob) return

      const rect = pad.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const maxRadius = Math.max(28, Math.min(rect.width, rect.height) * 0.32)
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
    isCompact,
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
        nearestSignalDistance <= WAKE_RADIUS ? nearestSignalIndex : null
      if (awakeIndexRef.current !== nextAwake) {
        awakeIndexRef.current = nextAwake
        setAwakeIndex(nextAwake)
      }

      const nextEnergyIndex = !isCompact ? nextAwake : null
      setEnergyIndexState(nextEnergyIndex)

      const energyPath = energyPathRef.current
      const energyPulse = energyPulseRef.current
      const character = characterRef.current

      if (energyPath && nextEnergyIndex !== null) {
        const energyStation = activeLayout.stations[nextEnergyIndex]
        const perchDirection = perchDirectionRef.current
        const connectToBody =
          shouldPerchOnCenter &&
          (perchDirection === 'up' || perchDirection === 'down')

        let connectionPoint

        if (connectToBody) {
          // Up/down seated poses intentionally have no visible arm. End the
          // signal on the torso instead of leaving it attached to an invisible hand.
          connectionPoint = {
            x: next.x,
            y: next.y - 10,
          }

          if (character) {
            character.style.removeProperty('--energy-arm-rotation')
            delete character.dataset.energySide
          }
        } else {
          // Treat the arm as free rather than a fixed diagonal. Its shoulder side,
          // angle, and signal endpoint all follow the incoming station direction.
          const armSide = energyStation.x >= next.x ? 'right' : 'left'
          const sideSign = armSide === 'right' ? 1 : -1
          const armOrigin = {
            x: next.x + sideSign * 5,
            y: next.y - (shouldPerchOnCenter ? 10 : 17),
          }
          const signalX = energyStation.x - armOrigin.x
          const signalY = energyStation.y - armOrigin.y
          const signalLength = Math.max(1, Math.hypot(signalX, signalY))
          const unitX = signalX / signalLength
          const unitY = signalY / signalLength
          const globalAngle = (Math.atan2(signalY, signalX) * 180) / Math.PI
          const rawRotation =
            armSide === 'right' ? globalAngle : globalAngle - 180
          const armRotation = ((rawRotation + 180) % 360 + 360) % 360 - 180

          connectionPoint = {
            x: armOrigin.x + unitX * 1.5,
            y: armOrigin.y + unitY * 1.5,
          }

          if (character) {
            character.dataset.energySide = armSide
            character.style.setProperty(
              '--energy-arm-rotation',
              `${armRotation.toFixed(1)}deg`,
            )
          }
        }

        const energyD = createEnergyPath(energyStation, connectionPoint, time)
        energyPath.setAttribute('d', energyD)
        energyPulse?.setAttribute('d', energyD)
      } else {
        energyPath?.removeAttribute('d')
        energyPulse?.removeAttribute('d')

        if (character) {
          character.style.removeProperty('--energy-arm-rotation')
          delete character.dataset.energySide
        }
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
      setCenterPerchedState(false)
      setEnergyIndexState(null)
      resetJoystick()
      energyPathRef.current?.removeAttribute('d')
      energyPulseRef.current?.removeAttribute('d')
      characterRef.current?.style.removeProperty('--energy-arm-rotation')
      if (characterRef.current) delete characterRef.current.dataset.energySide
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
    isCompact,
    reducedMotion,
    resetJoystick,
    setCenterPerchedState,
    setEnergyIndexState,
    setPerchDirectionState,
    setFacingState,
    setWalkingState,
    syncCharacter,
  ])

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
    worldRef.current?.focus({ preventScroll: true })
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
    window.getSelection?.()?.removeAllRanges()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    updateJoystick(event)
    worldRef.current?.focus({ preventScroll: true })
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
        worldRef.current?.focus({ preventScroll: true })
      })
    }
  }

  const paths = layout.stations.map((station, index) => {
    const bendX = (station.x + layout.dock.x) / 2
    const bendY = station.y < layout.dock.y ? station.y + 70 : station.y - 70

    return {
      index,
      d: `M ${station.x} ${station.y} Q ${bendX} ${bendY} ${layout.dock.x} ${layout.dock.y}`,
    }
  })

  return (
    <section
      ref={roomRef}
      className={`motion-habitat ${isOnline ? 'is-online' : ''} ${
        reducedMotion ? 'is-reduced' : ''
      } ${activePiece ? 'has-open-panel' : ''}`}
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
      >
        <div className="motion-habitat-grid" aria-hidden="true" />

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
          {paths.map(({ index, d }) => (
            <path
              key={pieces[index].id}
              className={`motion-habitat-signal ${
                awakeIndex === index || targetedIndex === index || openIndex === index
                  ? 'is-live'
                  : ''
              } ${openIndex === index ? 'is-open' : ''}`}
              d={d}
            />
          ))}
          <circle
            className={`motion-habitat-dock ${activePiece ? 'is-live' : ''}`}
            cx={layout.dock.x}
            cy={layout.dock.y}
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
          const meta = STATION_META[index]
          const isAwake = awakeIndex === index
          const isTargeted = targetedIndex === index
          const isOpen = openIndex === index

          return (
            <button
              className={`motion-habitat-station station-${meta.slug} ${
                isAwake ? 'is-awake' : ''
              } ${isTargeted ? 'is-targeted' : ''} ${isOpen ? 'is-open' : ''}`}
              type="button"
              key={piece.id}
              style={{
                '--station-x': `${(station.x / layout.width) * 100}%`,
                '--station-y': `${(station.y / layout.height) * 100}%`,
                '--station-rgb': meta.rgb,
              }}
              aria-pressed={isOpen}
              aria-label={`Open ${piece.title}`}
              onClick={() => beginAutoWalk(index)}
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
