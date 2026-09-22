import { useEffect, useRef } from 'react'
import { getSectionActivationLine } from '../utils/sectionNavigation.js'

const sectionStops = [
  { id: 'about' },
  { id: 'work' },
  {
    id: 'motion',
    selector: '#motion .motion-featured-section',
    progressStartSelector: '#motion .automotive-showcase-first',
  },
  { id: 'playground' },
  { id: 'contact' },
]

const growthSegments = [
  'M18 0V120H29V180',
  'M29 180V265H12V350',
  'M12 350V420H26V520',
  'M26 520V580H10V700',
  'M10 700V735H27V875H18V920',
]

const LINE_PACING_CURVE = 3
const LINE_FOLLOW_SPEED = 3.3

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function moveToward(value, target, maxDelta) {
  if (Math.abs(target - value) <= maxDelta) return target
  return value + Math.sign(target - value) * maxDelta
}

function ScrollStem({ active }) {
  const stemRef = useRef(null)

  useEffect(() => {
    if (!active) return undefined

    const stem = stemRef.current
    if (!stem) return undefined

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )

    if (prefersReducedMotion.matches) return undefined

    const nodes = Array.from(stem.querySelectorAll('.scroll-stem-node'))
    const segments = Array.from(
      stem.querySelectorAll('.scroll-stem-growth-segment'),
    )
    const tail = stem.querySelector('.scroll-stem-growth-tail')

    const visualProgress = growthSegments.map(() => 0)
    const targetProgress = growthSegments.map(() => 0)
    const visitedNodes = new Set()
    let tailVisualProgress = 0
    let tailTargetProgress = 0
    let currentIndex = -1
    let targetFrameId = null
    let animationFrameId = null
    let lastAnimationTime = null

    const rangeProgress = (value, start, end) => {
      const span = Math.max(end - start, 1)
      return clamp((value - start) / span, 0, 1)
    }

    const paceProgress = (progress) =>
      Math.pow(progress, LINE_PACING_CURVE)

    const resolveStopElement = (stop) =>
      (stop.selector ? document.querySelector(stop.selector) : null) ??
      document.getElementById(stop.id)

    const updateNodeState = () => {
      nodes.forEach((node, index) => {
        const isReached = visitedNodes.has(index)
        node.classList.toggle('is-reached', isReached)
        node.classList.toggle(
          'is-current',
          isReached && index === currentIndex,
        )
      })
    }

    const animateLine = (time) => {
      animationFrameId = null

      const deltaSeconds =
        lastAnimationTime === null
          ? 1 / 60
          : Math.min((time - lastAnimationTime) / 1000, 0.05)
      lastAnimationTime = time

      const maxDelta = LINE_FOLLOW_SPEED * deltaSeconds
      let needsAnotherFrame = false

      segments.forEach((segment, index) => {
        visualProgress[index] = moveToward(
          visualProgress[index],
          targetProgress[index],
          maxDelta,
        )

        if (
          Math.abs(visualProgress[index] - targetProgress[index]) >
          0.0001
        ) {
          needsAnotherFrame = true
        }

        if (visualProgress[index] >= 0.9999) {
          visitedNodes.add(index)
        }

        segment.style.setProperty(
          '--segment-progress',
          visualProgress[index].toFixed(4),
        )
      })

      tailVisualProgress = moveToward(
        tailVisualProgress,
        tailTargetProgress,
        maxDelta,
      )

      if (Math.abs(tailVisualProgress - tailTargetProgress) > 0.0001) {
        needsAnotherFrame = true
      }

      tail?.style.setProperty(
        '--segment-progress',
        tailVisualProgress.toFixed(4),
      )

      updateNodeState()

      if (needsAnotherFrame) {
        animationFrameId = window.requestAnimationFrame(animateLine)
      } else {
        lastAnimationTime = null
      }
    }

    const ensureLineAnimation = () => {
      if (animationFrameId !== null) return
      animationFrameId = window.requestAnimationFrame(animateLine)
    }

    const updateTargets = () => {
      targetFrameId = null

      const stops = sectionStops
        .map((stop) => ({
          ...stop,
          element: resolveStopElement(stop),
        }))
        .filter((stop) => stop.element)

      if (stops.length !== sectionStops.length) return

      const scrollY = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight
      const scrollRange = Math.max(scrollHeight - window.innerHeight, 1)
      const activationLine = Math.max(
        getSectionActivationLine() + 24,
        window.innerHeight * 0.42,
      )
      const atPageEnd =
        scrollY + window.innerHeight >= scrollHeight - 2

      const activationScrolls = stops.map(({ element }) => {
        const elementTop =
          scrollY + element.getBoundingClientRect().top

        return Math.min(
          Math.max(elementTop - activationLine, 0),
          scrollRange,
        )
      })

      currentIndex = -1
      activationScrolls.forEach((activationScroll, index) => {
        if (scrollY + 1 >= activationScroll) currentIndex = index
      })

      if (atPageEnd) currentIndex = stops.length - 1

      stops.forEach((_, index) => {
        if (index <= currentIndex) visitedNodes.add(index)
      })

      targetProgress.forEach((_, index) => {
        let start =
          index === 0
            ? 0
            : activationScrolls[index - 1] ?? scrollRange

        const customStartSelector =
          sectionStops[index]?.progressStartSelector

        if (customStartSelector) {
          const startElement = document.querySelector(customStartSelector)

          if (startElement) {
            const startTop =
              scrollY + startElement.getBoundingClientRect().top
            start = Math.min(
              Math.max(startTop - activationLine, 0),
              scrollRange,
            )
          }
        }

        const end = activationScrolls[index] ?? scrollRange
        const rawProgress = rangeProgress(scrollY, start, end)

        targetProgress[index] = paceProgress(rawProgress)
      })

      const lastIndex = stops.length - 1
      const lastActivation =
        activationScrolls[lastIndex] ?? scrollRange

      tailTargetProgress =
        currentIndex < lastIndex
          ? 0
          : atPageEnd
            ? 1
            : paceProgress(
                rangeProgress(scrollY, lastActivation, scrollRange),
              )

      updateNodeState()
      ensureLineAnimation()
    }

    const requestTargetUpdate = () => {
      if (targetFrameId !== null) return
      targetFrameId = window.requestAnimationFrame(updateTargets)
    }

    updateTargets()
    window.addEventListener('scroll', requestTargetUpdate, { passive: true })
    window.addEventListener('resize', requestTargetUpdate)

    return () => {
      window.removeEventListener('scroll', requestTargetUpdate)
      window.removeEventListener('resize', requestTargetUpdate)

      if (targetFrameId !== null) {
        window.cancelAnimationFrame(targetFrameId)
      }

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId)
      }
    }
  }, [active])

  return (
    <div
      className={`scroll-stem ${active ? 'is-active' : ''}`}
      ref={stemRef}
      aria-hidden="true"
    >
      <span className="scroll-stem-caption">Archive / Scroll</span>

      <svg
        className="scroll-stem-svg"
        viewBox="0 0 40 1000"
        preserveAspectRatio="none"
        role="presentation"
      >
        <path
          className="scroll-stem-track"
          d="M18 0V120H29V265H12V420H26V580H10V735H27V875H18V1000"
        />

        {growthSegments.map((d, index) => (
          <path
            className="scroll-stem-growth-segment"
            d={d}
            pathLength="1"
            key={d}
            data-segment-index={index}
          />
        ))}

        <path
          className="scroll-stem-growth-tail"
          d="M18 920V1000"
          pathLength="1"
        />

        <circle className="scroll-stem-node" cx="29" cy="180" r="3.2" />
        <circle className="scroll-stem-node" cx="12" cy="350" r="3.2" />
        <circle className="scroll-stem-node" cx="26" cy="520" r="3.2" />
        <circle className="scroll-stem-node" cx="10" cy="700" r="3.2" />
        <circle className="scroll-stem-node" cx="18" cy="920" r="3.2" />
      </svg>
    </div>
  )
}

export default ScrollStem
