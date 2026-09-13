import { useEffect, useState } from 'react'
import {
  getSectionActivationLine,
  handleSectionNavigation,
} from '../utils/sectionNavigation.js'

const navItems = [
  { id: 'about', label: 'About', icon: 'leaf' },
  { id: 'work', label: 'Work', icon: 'frame' },
  { id: 'motion', label: 'Motion', icon: 'motion' },
  { id: 'playground', label: 'Playground', icon: 'bloom' },
  { id: 'contact', label: 'Contact', icon: 'phone' },
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
        <path d="M8.5 23.5C8.8 16.1 13 9.3 22.9 6.2C23 14.8 19 22 10.2 24.7C9.6 24.9 9 24.4 8.5 23.5Z" />
        <path d="M10 23.3C13.1 18.4 16.7 14.4 21.1 10.8" />
        <path d="M14.1 18.1C13.1 16.8 12.4 15.6 12.1 14.4" />
        <path d="M17.3 15.1C18.6 14.9 19.9 14.4 21 13.8" />
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
        <path d="M6.2 21.5C10.2 21.5 10.6 10.5 15.5 10.5C20.1 10.5 20.4 19.4 25.8 19.4" />
        <circle cx="6.2" cy="21.5" r="1.55" fill="currentColor" stroke="none" />
        <circle cx="25.8" cy="19.4" r="1.55" fill="currentColor" stroke="none" />
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

  if (type === 'phone') {
    return (
      <svg {...commonProps}>
        <path d="M10.2 6.7L13.4 11.1L11.1 13.4C12.8 16.9 15.1 19.2 18.6 20.9L20.9 18.6L25.3 21.8L23.8 25C23.4 25.9 22.4 26.4 21.4 26.2C13.5 24.8 7.2 18.5 5.8 10.6C5.6 9.6 6.1 8.6 7 8.2L10.2 6.7Z" />
      </svg>
    )
  }

  return null
}

function Navbar() {
  const [activeSection, setActiveSection] = useState(null)
  const [isCompact, setIsCompact] = useState(false)
  const [connectorProgress, setConnectorProgress] = useState(() =>
    navItems.slice(0, -1).map(() => 0),
  )

  useEffect(() => {
    const sections = navItems
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean)
    const hero = document.querySelector('.hero')

    let frameId = null

    const updateNavigationState = () => {
      frameId = null

      if (sections.length === 0) {
        setActiveSection(null)
        setIsCompact(false)
        setConnectorProgress(navItems.slice(0, -1).map(() => 0))
        return
      }

      const activationLine = getSectionActivationLine()
      const activationY = window.scrollY + activationLine
      const atPageEnd =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2
      const heroBottom = hero?.getBoundingClientRect().bottom ?? 0
      const compactThreshold = Math.max(
        activationLine + 120,
        window.innerHeight * 0.76,
      )

      // Compact while the visitor is leaving the hero, before About becomes
      // the active section. Section highlighting keeps its stricter boundary.
      setIsCompact(!hero || heroBottom <= compactThreshold)

      if (atPageEnd) {
        setActiveSection(navItems[navItems.length - 1].id)
        setIsCompact(true)
        setConnectorProgress(navItems.slice(0, -1).map(() => 1))
        return
      }

      if (hero && heroBottom > activationLine) {
        setActiveSection(null)
        setConnectorProgress(navItems.slice(0, -1).map(() => 0))
        return
      }

      let currentSection = sections[0].id

      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= activationLine + 1) {
          currentSection = section.id
        }
      })

      const nextConnectorProgress = navItems.slice(0, -1).map((_, index) => {
        const current = sections[index]
        const next = sections[index + 1]
        if (!current || !next) return 0

        const start = current.offsetTop
        const end = next.offsetTop
        if (end <= start) return activationY >= end ? 1 : 0

        return Math.min(Math.max((activationY - start) / (end - start), 0), 1)
      })

      setActiveSection(currentSection)
      setConnectorProgress(nextConnectorProgress)
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
    <header
      className={`nav nav-panel ${isCompact ? 'is-compact' : ''}`}
      id="top"
    >
      <a className="nav-brand" href="#top" onClick={handleSectionNavigation}>
        <span className="nav-mark">KEANA</span>
        <span className="nav-star" aria-hidden="true">✦</span>
      </a>

      <nav className="nav-links nav-tiles" aria-label="Primary">
        {navItems.map((item, index) => (
          <span className="nav-path-stop" key={item.id}>
            <a
              className="nav-tile"
              href={`#${item.id}`}
              onClick={handleSectionNavigation}
              aria-current={activeSection === item.id ? 'location' : undefined}
            >
              <span className="nav-tile-icon">
                <NavIcon type={item.icon} />
              </span>
              <span className="nav-tile-label">{item.label}</span>
            </a>

            {index < navItems.length - 1 && (
              <span
                className="nav-connector"
                aria-hidden="true"
                style={{ '--connector-progress': connectorProgress[index] ?? 0 }}
              >
                <span className="nav-connector-dot nav-connector-dot-start" />
                <span className="nav-connector-track">
                  <span className="nav-connector-fill" />
                </span>
                <span className="nav-connector-dot nav-connector-dot-end" />
              </span>
            )}
          </span>
        ))}
      </nav>

      <div className="nav-status" aria-label="Availability and location">
        <span className="nav-availability">
          <span className="nav-status-dot" aria-hidden="true" />
          Available
        </span>
        <span className="nav-location">Davao City, PH</span>
      </div>
    </header>
  )
}

export default Navbar
