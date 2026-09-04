import { useEffect, useRef } from 'react'

const navItems = [
  { label: 'Work', href: '#work', number: '01' },
  { label: 'About', href: '#about', number: '02' },
  { label: 'Motion', href: '#motion', number: '03' },
  { label: 'Playground', href: '#playground', number: '04' },
  { label: 'Contact', href: '#contact', number: '05' },
]

function Navbar() {
  const progressRef = useRef(null)

  useEffect(() => {
    let frameId = 0

    const updateProgress = () => {
      const documentHeight = document.documentElement.scrollHeight
      const maxScroll = Math.max(documentHeight - window.innerHeight, 0)
      const progress = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0

      progressRef.current?.style.setProperty('--progress', `${progress * 100}%`)
      frameId = 0
    }

    const queueUpdate = () => {
      if (frameId === 0) {
        frameId = window.requestAnimationFrame(updateProgress)
      }
    }

    updateProgress()
    window.addEventListener('scroll', queueUpdate, { passive: true })
    window.addEventListener('resize', queueUpdate)

    return () => {
      window.removeEventListener('scroll', queueUpdate)
      window.removeEventListener('resize', queueUpdate)

      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [])

  return (
    <header className="nav" id="top">
      <div className="nav-inner">
        <a className="nav-brand" href="#top" aria-label="KEANA home">
          <span className="nav-symbol" aria-hidden="true">✦</span>
          <span className="nav-mark">KEANA</span>
        </a>

        <nav className="nav-links" aria-label="Primary">
          {navItems.map((item) => (
            <a className="nav-link" href={item.href} key={item.href}>
              <span>{item.label}</span>
              <span className="nav-number" aria-hidden="true">{item.number}</span>
            </a>
          ))}
        </nav>
      </div>

      <div className="nav-progress" aria-hidden="true">
        <span className="nav-progress-fill" ref={progressRef} />
      </div>
    </header>
  )
}

export default Navbar
