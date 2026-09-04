import { useEffect, useRef, useState } from 'react'
import { handleSectionNavigation } from '../utils/sectionNavigation.js'

const navItems = [
  { label: 'Work', id: 'work' },
  { label: 'Motion', id: 'motion' },
  { label: 'About', id: 'about' },
  { label: 'Playground', id: 'playground' },
  { label: 'Contact', id: 'contact' },
]

function Navbar() {
  const [activeSection, setActiveSection] = useState(null)
  const progressRef = useRef(null)

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined

    const sections = navItems
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean)

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting)
        if (visibleEntry) {
          setActiveSection(visibleEntry.target.id)
        }
      },
      {
        rootMargin: '-20% 0px -65% 0px',
        threshold: 0,
      },
    )

    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const progressBar = progressRef.current
    if (!progressBar) return undefined

    let frameId = null

    const updateProgress = () => {
      frameId = null
      const scrollableHeight = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      )
      const progress = Math.min(1, Math.max(0, window.scrollY / scrollableHeight))

      progressBar.style.transform = `scaleX(${progress})`
    }

    const scheduleUpdate = () => {
      if (frameId !== null) return
      frameId = window.requestAnimationFrame(updateProgress)
    }

    updateProgress()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)

    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      if (frameId !== null) window.cancelAnimationFrame(frameId)
    }
  }, [])

  return (
    <header className="nav" id="top">
      <a className="nav-mark" href="#top" onClick={handleSectionNavigation}>
        KEANA
      </a>

      <nav className="nav-links" aria-label="Primary">
        {navItems.map(({ label, id }) => (
          <a
            href={`#${id}`}
            onClick={handleSectionNavigation}
            aria-current={activeSection === id ? 'location' : undefined}
            key={id}
          >
            {label}
          </a>
        ))}
      </nav>

      <span className="nav-meta">Davao City, PH</span>

      <span className="nav-progress" aria-hidden="true">
        <span className="nav-progress-bar" ref={progressRef} />
      </span>
    </header>
  )
}

export default Navbar
