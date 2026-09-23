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
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    window.matchMedia('(max-width: 720px)').matches,
  )
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navRef = useRef(null)

  useEffect(() => {
    const sections = navItems
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean)
    const hero = document.querySelector('.hero')
    const aboutSection = sections.find((section) => section.id === 'about')

    let frameId = null

    const writeConnectorProgress = (values) => {
      const connectors = navRef.current?.querySelectorAll('.nav-connector')
      if (!connectors) return

      connectors.forEach((connector, index) => {
        const nextValue = values[index] ?? 0
        const previousValue = Number(
          connector.style.getPropertyValue('--connector-progress'),
        )

        if (
          !Number.isFinite(previousValue) ||
          Math.abs(previousValue - nextValue) > 0.002
        ) {
          connector.style.setProperty(
            '--connector-progress',
            nextValue.toFixed(4),
          )
        }
      })
    }

    const updateNavigationState = () => {
      frameId = null

      if (sections.length === 0) {
        setActiveSection(null)
        setIsCompact(false)
        writeConnectorProgress(navItems.slice(0, -1).map(() => 0))
        return
      }

      const sectionRects = sections.map((section) =>
        section.getBoundingClientRect(),
      )
      const activationLine = getSectionActivationLine()
      const activationY = window.scrollY + activationLine
      const atPageEnd =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2
      const heroBottom = hero?.getBoundingClientRect().bottom ?? 0
      const aboutIndex = aboutSection ? sections.indexOf(aboutSection) : -1
      const aboutTop =
        aboutIndex >= 0 ? sectionRects[aboutIndex].top : Infinity
      const aboutActivationThreshold = Math.max(
        activationLine + 96,
        window.innerHeight * 0.32,
      )
      const aboutHasArrived = !hero || (
        aboutSection
          ? aboutTop <= aboutActivationThreshold
          : heroBottom <= activationLine
      )

      // Keep the full navbar through the hero. Compact at the exact same
      // transition that activates About so the two visual states stay in sync.
      setIsCompact(aboutHasArrived)

      if (atPageEnd) {
        setActiveSection(navItems[navItems.length - 1].id)
        setIsCompact(true)
        writeConnectorProgress(navItems.slice(0, -1).map(() => 1))
        return
      }

      if (
        hero &&
        ((aboutSection && aboutTop > aboutActivationThreshold) ||
          (!aboutSection && heroBottom > activationLine))
      ) {
        setActiveSection(null)
        writeConnectorProgress(navItems.slice(0, -1).map(() => 0))
        return
      }

      let currentSection = sections[0].id

      sections.forEach((section, index) => {
        if (sectionRects[index].top <= activationLine + 1) {
          currentSection = section.id
        }
      })

      const nextConnectorProgress = navItems.slice(0, -1).map((_, index) => {
        const currentRect = sectionRects[index]
        const nextRect = sectionRects[index + 1]
        if (!currentRect || !nextRect) return 0

        const start = window.scrollY + currentRect.top
        const end = window.scrollY + nextRect.top
        if (end <= start) return activationY >= end ? 1 : 0

        return Math.min(Math.max((activationY - start) / (end - start), 0), 1)
      })

      setActiveSection(currentSection)
      writeConnectorProgress(nextConnectorProgress)
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

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 720px)')

    const closeMobileMenuOutside = (event) => {
      if (
        mobileQuery.matches &&
        isMobileMenuOpen &&
        !navRef.current?.contains(event.target)
      ) {
        setIsMobileMenuOpen(false)
      }
    }

    const closeMobileMenuWithKeyboard = (event) => {
      if (mobileQuery.matches && isMobileMenuOpen && event.key === 'Escape') {
        setIsMobileMenuOpen(false)
        navRef.current?.querySelector('.mobile-menu-toggle')?.focus()
      }
    }

    const closeMobileMenuAboveBreakpoint = (event) => {
      setIsMobileViewport(event.matches)
      if (!event.matches) setIsMobileMenuOpen(false)
    }

    document.addEventListener('pointerdown', closeMobileMenuOutside)
    document.addEventListener('keydown', closeMobileMenuWithKeyboard)

    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener('change', closeMobileMenuAboveBreakpoint)
    } else {
      mobileQuery.addListener(closeMobileMenuAboveBreakpoint)
    }

    return () => {
      document.removeEventListener('pointerdown', closeMobileMenuOutside)
      document.removeEventListener('keydown', closeMobileMenuWithKeyboard)

      if (mobileQuery.removeEventListener) {
        mobileQuery.removeEventListener('change', closeMobileMenuAboveBreakpoint)
      } else {
        mobileQuery.removeListener(closeMobileMenuAboveBreakpoint)
      }
    }
  }, [isMobileMenuOpen])

  const handleNavigation = (event) => {
    const mobileQuery = window.matchMedia('(max-width: 720px)')

    if (!mobileQuery.matches || !isMobileMenuOpen) {
      handleSectionNavigation(event)
      return
    }

    event.preventDefault()
    const target = event.currentTarget
    setIsMobileMenuOpen(false)

    window.requestAnimationFrame(() => {
      navRef.current?.querySelector('.mobile-menu-toggle')?.focus({
        preventScroll: true,
      })
      handleSectionNavigation({
        currentTarget: target,
        preventDefault() {},
      })
    })
  }

  const activeLabel =
    navItems.find((item) => item.id === activeSection)?.label ?? 'Portfolio'

  return (
    <header
      className={`nav nav-panel ${isCompact ? 'is-compact' : ''}`}
      id="top"
      ref={navRef}
      data-mobile-open={isMobileMenuOpen ? 'true' : 'false'}
    >
      <a className="nav-brand" href="#top" onClick={handleNavigation}>
        <span className="nav-mark">KEANA</span>
        <span className="nav-star" aria-hidden="true">✦</span>
      </a>

      {isMobileViewport && (
        <>
          <span className="mobile-nav-current" aria-hidden="true">
            {activeLabel}
          </span>

          <button
            className="mobile-menu-toggle"
            type="button"
            aria-expanded={isMobileMenuOpen}
            aria-controls="primary-navigation"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            <span className="mobile-menu-toggle-icon" aria-hidden="true">
              <NavIcon type="leaf" />
            </span>
            <span>{isMobileMenuOpen ? 'Close' : 'Index'}</span>
          </button>
        </>
      )}

      <nav
        className="nav-links nav-tiles"
        id="primary-navigation"
        aria-label="Primary"
      >
        {navItems.map((item, index) => (
          <span className="nav-path-stop" key={item.id}>
            <a
              className="nav-tile"
              href={`#${item.id}`}
              onClick={handleNavigation}
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
