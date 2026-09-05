import { useEffect, useRef, useState } from 'react'
import {
  getSectionActivationLine,
  handleSectionNavigation,
} from '../utils/sectionNavigation.js'

const navItems = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'motion', label: 'Motion' },
  { id: 'playground', label: 'Playground' },
  { id: 'contact', label: 'Contact' },
]

function Navbar() {
  const progressRef = useRef(null)
  const [activeSection, setActiveSection] = useState(null)

  useEffect(() => {
    const progressBar = progressRef.current
    if (!progressBar) return undefined

    const sections = navItems
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean)
    const hero = document.querySelector('.hero')

    let frameId = null

    const updateNavigationState = () => {
      frameId = null

      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const progress =
        scrollableHeight > 0
          ? Math.min(Math.max(window.scrollY / scrollableHeight, 0), 1)
          : 0

      progressBar.style.transform = `scaleX(${progress})`

      if (sections.length === 0) {
        setActiveSection(null)
        return
      }

      const activationLine = getSectionActivationLine()
      const atPageEnd =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2

      if (atPageEnd) {
        setActiveSection(navItems[navItems.length - 1].id)
        return
      }

      if (hero && hero.getBoundingClientRect().bottom > activationLine) {
        setActiveSection(null)
        return
      }

      let currentSection = sections[0].id

      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= activationLine + 1) {
          currentSection = section.id
        }
      })

      setActiveSection(currentSection)
    }

    const requestNavigationUpdate = () => {
      if (frameId !== null) return
      frameId = window.requestAnimationFrame(updateNavigationState)
    }

    updateNavigationState()
    window.addEventListener('scroll', requestNavigationUpdate, { passive: true })
    window.addEventListener('resize', requestNavigationUpdate)

    return () => {
      window.removeEventListener('scroll', requestNavigationUpdate)
      window.removeEventListener('resize', requestNavigationUpdate)

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [])

  return (
    <header className="nav" id="top">
      <a className="nav-brand" href="#top" onClick={handleSectionNavigation}>
        <span className="nav-mark">KEANA</span>
        <span className="nav-star" aria-hidden="true">✦</span>
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

      <div className="nav-status" aria-label="Availability and location">
        <span className="nav-availability">
          <span className="nav-status-dot" aria-hidden="true" />
          Available
        </span>
        <span className="nav-location">Davao City, PH</span>
      </div>

      <div className="nav-progress" aria-hidden="true">
        <div className="nav-progress-bar" ref={progressRef} />
      </div>
    </header>
  )
}

export default Navbar
