import { useEffect, useRef, useState } from 'react'
import { handleSectionNavigation } from '../utils/sectionNavigation.js'

const navItems = [
  { id: 'work', label: 'Work' },
  { id: 'motion', label: 'Motion' },
  { id: 'about', label: 'About' },
  { id: 'playground', label: 'Playground' },
  { id: 'contact', label: 'Contact' },
]

function Navbar() {
  const progressRef = useRef(null)
  const [activeSection, setActiveSection] = useState(null)

  useEffect(() => {
    const progressBar = progressRef.current
    if (!progressBar) return undefined

    let frameId = null

    const updateProgress = () => {
      frameId = null

      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const progress =
        scrollableHeight > 0
          ? Math.min(Math.max(window.scrollY / scrollableHeight, 0), 1)
          : 0

      progressBar.style.transform = `scaleX(${progress})`
    }

    const requestProgressUpdate = () => {
      if (frameId !== null) return
      frameId = window.requestAnimationFrame(updateProgress)
    }

    updateProgress()
    window.addEventListener('scroll', requestProgressUpdate, { passive: true })
    window.addEventListener('resize', requestProgressUpdate)

    return () => {
      window.removeEventListener('scroll', requestProgressUpdate)
      window.removeEventListener('resize', requestProgressUpdate)

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [])

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined

    const sections = navItems
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean)

    if (sections.length === 0) return undefined

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

  return (
    <header className="nav" id="top">
      <a className="nav-mark" href="#top" onClick={handleSectionNavigation}>
        KEANA
      </a>

      <nav className="nav-links" aria-label="Primary">
        {navItems.map((item) => (
          <a
            href={`#${item.id}`}
            key={item.id}
            onClick={handleSectionNavigation}
            aria-current={activeSection === item.id ? 'location' : undefined}
          >
            {item.label}
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
