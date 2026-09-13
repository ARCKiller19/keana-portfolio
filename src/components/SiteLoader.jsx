import { useEffect, useRef, useState } from 'react'

const INTRO_SESSION_KEY = 'keana-visual-archive-intro-seen'

function shouldSkipIntro() {
  if (typeof window === 'undefined') return false

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
  const [phase, setPhase] = useState(skipIntro ? 'done' : 'active')
  const onCompleteRef = useRef(onComplete)

  onCompleteRef.current = onComplete

  useEffect(() => {
    if (skipIntro) {
      const frameId = window.requestAnimationFrame(() => {
        onCompleteRef.current?.()
      })

      return () => window.cancelAnimationFrame(frameId)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const leaveTimer = window.setTimeout(() => {
      setPhase('leaving')
    }, 1050)

    const completeTimer = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(INTRO_SESSION_KEY, 'true')
      } catch {
        // The intro can still complete when session storage is unavailable.
      }

      document.body.style.overflow = previousOverflow
      setPhase('done')
      onCompleteRef.current?.()
    }, 1450)

    return () => {
      window.clearTimeout(leaveTimer)
      window.clearTimeout(completeTimer)
      document.body.style.overflow = previousOverflow
    }
  }, [skipIntro])

  if (phase === 'done') return null

  return (
    <div
      className={`site-loader ${phase === 'leaving' ? 'is-leaving' : ''}`}
      aria-hidden="true"
    >
      <div className="site-loader-shell">
        <span className="site-loader-kicker">Keana / Visual Archive</span>

        <div className="site-loader-mark">KEANA</div>

        <svg
          className="site-loader-stem"
          viewBox="0 0 120 220"
          role="presentation"
        >
          <path
            className="site-loader-stem-track"
            d="M60 8V54H79V104H47V155H66V212"
            pathLength="1"
          />
          <path
            className="site-loader-stem-growth"
            d="M60 8V54H79V104H47V155H66V212"
            pathLength="1"
          />
          <circle cx="60" cy="54" r="3" />
          <circle cx="47" cy="155" r="3" />
        </svg>

        <span className="site-loader-note">Botanical systems · 2026</span>
      </div>
    </div>
  )
}

export default SiteLoader
