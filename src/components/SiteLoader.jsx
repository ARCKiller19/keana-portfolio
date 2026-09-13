import { useEffect, useRef, useState } from 'react'

const INTRO_SESSION_KEY = 'keana-visual-archive-intro-v2-seen'

function shouldSkipIntro() {
  if (typeof window === 'undefined') return false

  const params = new URLSearchParams(window.location.search)
  if (params.get('intro') === '1') return false

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

  if (prefersReducedMotion) return true

  try {
    return window.sessionStorage.getItem(INTRO_SESSION_KEY) === 'true'
  } catch {
    return false
  }
}

function SiteLoader({ onComplete }) {
  const [skipIntro] = useState(shouldSkipIntro)
  const [phase, setPhase] = useState(skipIntro ? 'done' : 'holding')
  const markAnchorRef = useRef(null)
  const onCompleteRef = useRef(onComplete)

  onCompleteRef.current = onComplete

  useEffect(() => {
    if (skipIntro) {
      const frameId = window.requestAnimationFrame(() => {
        onCompleteRef.current?.()
      })

      return () => window.cancelAnimationFrame(frameId)
    }

    const body = document.body
    const previousOverflow = body.style.overflow
    const previousPaddingRight = body.style.paddingRight
    const scrollbarWidth = Math.max(
      window.innerWidth - document.documentElement.clientWidth,
      0,
    )
    const bodyPaddingRight = Number.parseFloat(
      window.getComputedStyle(body).paddingRight,
    ) || 0

    body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${bodyPaddingRight + scrollbarWidth}px`
    }

    const assembleTimer = window.setTimeout(() => {
      const markAnchor = markAnchorRef.current
      const heroMark = document.querySelector('.hero-mark')

      if (markAnchor && heroMark) {
        const markRect = markAnchor.getBoundingClientRect()
        const targetRect = heroMark.getBoundingClientRect()
        const markCenterX = markRect.left + markRect.width / 2
        const markCenterY = markRect.top + markRect.height / 2
        const targetCenterX = targetRect.left + targetRect.width / 2
        const targetCenterY = targetRect.top + targetRect.height / 2

        markAnchor.style.setProperty(
          '--intro-target-x',
          `${targetCenterX - markCenterX}px`,
        )
        markAnchor.style.setProperty(
          '--intro-target-y',
          `${targetCenterY - markCenterY}px`,
        )
        markAnchor.style.setProperty(
          '--intro-target-scale-x',
          String(targetRect.width / Math.max(markRect.width, 1)),
        )
        markAnchor.style.setProperty(
          '--intro-target-scale-y',
          String(targetRect.height / Math.max(markRect.height, 1)),
        )
      }

      setPhase('assembling')
    }, 680)

    const handoffTimer = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(INTRO_SESSION_KEY, 'true')
      } catch {
        // The intro can still complete when session storage is unavailable.
      }

      setPhase('leaving')
      onCompleteRef.current?.()
    }, 1400)

    const completeTimer = window.setTimeout(() => {
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPaddingRight
      setPhase('done')
    }, 1690)

    return () => {
      window.clearTimeout(assembleTimer)
      window.clearTimeout(handoffTimer)
      window.clearTimeout(completeTimer)
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPaddingRight
    }
  }, [skipIntro])

  if (phase === 'done') return null

  return (
    <div className={`site-loader is-${phase}`} aria-hidden="true">
      <div className="site-loader-mark-anchor" ref={markAnchorRef}>
        <span className="site-loader-mark">KEANA</span>
      </div>
    </div>
  )
}

export default SiteLoader
