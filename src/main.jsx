import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { getSectionActivationLine } from './utils/sectionNavigation.js'
import './styles.css'
import './reference-polish.css'
import './navbar-panel.css'
import './floating-navbar.css'
import './hero-balance.css'
import './contact-balance.css'
import './contact-signal-bloom.css'
import './contact-signal-bloom-fixes.css'
import './interface-cues.css'
import './motion-signoffs.css'
import './responsive-guardrails.css'
import './botanical-motion.css'
import './intro-navbar-guard.css'
import './intro-vine-exit.css'
import './selected-work-arrival.css'
import './motion-reel-side-previews.css'
import './motion-reel-direct-play.css'
import './motion-cut-rail-polish.css'
import './motion-habitat-guidance.css'
import './motion-habitat-clarity.css'
import './motion-habitat-hierarchy.css'
import './motion-habitat-performance.css'
import './motion-habitat-line-glow.css'
import './motion-habitat-mobile.css'
import './interaction-stability.css'
import './playground-sprite-lab.css'
import './playground-sprite-frame-swap.css'
import './playground-archive-viewer.css'
import './motion-habitat-onboarding.js'
import './motion-reel-preview-prime.js'
import './playground-archive-viewer.js'
import App from './App.jsx'

const handleWordoriaPlaygroundJump = (event) => {
  const trigger = event.target.closest?.('.project-wordoria-motion-link[href="#playground"]')
  if (!trigger) return

  event.preventDefault()
  event.stopPropagation()

  const dialog = trigger.closest('dialog')
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

  const moveToPlayground = () => {
    requestAnimationFrame(() => {
      const target = document.querySelector('#playground .section-head')
      const focusTarget = target?.querySelector('h2')
      if (!target) return

      const landingLine = getSectionActivationLine() + 28
      const targetTop =
        window.scrollY + target.getBoundingClientRect().top - landingLine

      window.history.replaceState(null, '', '#playground')

      if (focusTarget) {
        focusTarget.tabIndex = -1
        focusTarget.focus({ preventScroll: true })
        focusTarget.addEventListener(
          'blur',
          () => focusTarget.removeAttribute('tabindex'),
          { once: true },
        )
      }

      window.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: reducedMotion ? 'auto' : 'smooth',
      })
    })
  }

  if (dialog?.open) {
    dialog.addEventListener('close', moveToPlayground, { once: true })
    dialog.close()
    return
  }

  moveToPlayground()
}

document.addEventListener('click', handleWordoriaPlaygroundJump, true)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
