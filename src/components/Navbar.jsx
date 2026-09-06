import { useEffect, useRef, useState } from 'react'
import {
  getSectionActivationLine,
  handleSectionNavigation,
} from '../utils/sectionNavigation.js'

const navItems = [
  { id: 'about', label: 'About', icon: 'leaf' },
  { id: 'work', label: 'Work', icon: 'frame' },
  { id: 'motion', label: 'Motion', icon: 'motion' },
  { id: 'playground', label: 'Playground', icon: 'bloom' },
  { id: 'contact', label: 'Contact', icon: 'branch' },
]

function NavIcon({ type }) {
  const commonProps = {
    viewBox: '0 0 32 32',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true,
  }

  if (type === 'leaf') {
    return (
      <svg {...commonProps}>
        <path d="M16 27C11 22.5 8.7 17.8 9.8 13.5C11 8.9 15.5 5.6 21.6 4.7C22.1 10.2 21.1 14.7 18.7 18.2C16.5 21.4 13.4 23.5 9.4 24.4" />
        <path d="M11.2 23.2C14.5 18.6 17.6 14.8 21.5 11.4" />
      </svg>
    )
  }

  if (type === 'frame') {
    return (
      <svg {...commonProps}>
        <rect x="7.5" y="7.5" width="17" height="17" />
        <path d="M11 21L21 11" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="20" cy="20" r="1.5" />
      </svg>
    )
  }

  if (type === 'motion') {
    return (
      <svg {...commonProps}>
        <path d="M5.5 22.5C10 22.5 10.2 10 15.3 10C19.8 10 20.4 18.5 26.5 18.5" />
        <path d="M22.3 14.7L26.5 18.5L22.4 22" />
        <circle cx="8" cy="22.5" r="1.5" />
      </svg>
    )
  }

  if (type === 'bloom') {
    return (
      <svg {...commonProps}>
        <path d="M16 6.5C18.2 9 18.2 11.8 16 14C13.8 11.8 13.8 9 16 6.5Z" />
        <path d="M25.5 16C23 18.2 20.2 18.2 18 16C20.2 13.8 23 13.8 25.5 16Z" />
        <path d="M16 25.5C13.8 23 13.8 20.2 16 18C18.2 20.2 18.2 23 16 25.5Z" />
        <path d="M6.5 16C9 13.8 11.8 13.8 14 16C11.8 18.2 9 18.2 6.5 16Z" />
        <circle cx="16" cy="16" r="2" />
      </svg>
    )
  }

  return (
    <svg {...commonProps}>
      <path d="M8 24C11 21 13.5 18.2 15 15C16.2 12.5 16.5 9.5 16.1 6" />
      <path d="M15.4 13.6C19 12.8 22.3 10.8 24.6 7.8C24.8 11.8 23.4 15.1 20.5 17.3C18.7 18.6 16.6 19.2 14.4 19.2" />
      <path d="M12.6 18.8C10.1 17.9 8.3 16.2 7.2 13.6C10 13.5 12.4 14.3 14.3 16" />
    </svg>
  )
}

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
    <header className="nav nav-panel" id="top">
      <a className="nav-brand" href="#top" onClick={handleSectionNavigation}>
        <span className="nav-mark">KEANA</span>
        <span className="nav-star" aria-hidden="true">✦</span>
      </a>

      <nav className="nav-links nav-tiles" aria-label="Primary">
        {navItems.map((item) => (
          <a
            className="nav-tile"
            href={`#${item.id}`}
            key={item.id}
            onClick={handleSectionNavigation}
            aria-current={activeSection === item.id ? 'location' : undefined}
          >
            <span className="nav-tile-icon">
              <NavIcon type={item.icon} />
            </span>
            <span className="nav-tile-label">{item.label}</span>
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
