import { useEffect, useRef } from 'react'

const sectionIds = ['about', 'work', 'motion', 'playground', 'contact']

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function ScrollStem({ active }) {
  const stemRef = useRef(null)

  useEffect(() => {
    if (!active) return undefined

    const stem = stemRef.current
    if (!stem) return undefined

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )

    if (prefersReducedMotion.matches) return undefined

    const nodes = Array.from(stem.querySelectorAll('.scroll-stem-node'))
    let frameId = null

    const updateStem = () => {
      frameId = null

      const scrollRange = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      )
      const progress = clamp(window.scrollY / scrollRange, 0, 1)

      stem.style.setProperty('--stem-progress', progress.toFixed(4))

      sectionIds.forEach((id, index) => {
        const section = document.getElementById(id)
        const node = nodes[index]
        if (!section || !node) return

        const threshold = clamp(section.offsetTop / scrollRange - 0.025, 0, 1)
        node.classList.toggle('is-reached', progress >= threshold)
      })
    }

    const requestStemUpdate = () => {
      if (frameId !== null) return
      frameId = window.requestAnimationFrame(updateStem)
    }

    updateStem()
    window.addEventListener('scroll', requestStemUpdate, { passive: true })
    window.addEventListener('resize', requestStemUpdate)

    return () => {
      window.removeEventListener('scroll', requestStemUpdate)
      window.removeEventListener('resize', requestStemUpdate)

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [active])

  return (
    <div
      className={`scroll-stem ${active ? 'is-active' : ''}`}
      ref={stemRef}
      aria-hidden="true"
    >
      <span className="scroll-stem-caption">Archive / Scroll</span>

      <svg
        className="scroll-stem-svg"
        viewBox="0 0 40 1000"
        preserveAspectRatio="none"
        role="presentation"
      >
        <path
          className="scroll-stem-track"
          d="M18 0V120H29V265H12V420H26V580H10V735H27V875H18V1000"
          pathLength="1"
        />
        <path
          className="scroll-stem-growth"
          d="M18 0V120H29V265H12V420H26V580H10V735H27V875H18V1000"
          pathLength="1"
        />

        <circle className="scroll-stem-node" cx="29" cy="180" r="3.2" />
        <circle className="scroll-stem-node" cx="12" cy="350" r="3.2" />
        <circle className="scroll-stem-node" cx="26" cy="520" r="3.2" />
        <circle className="scroll-stem-node" cx="10" cy="700" r="3.2" />
        <circle className="scroll-stem-node" cx="18" cy="920" r="3.2" />
      </svg>
    </div>
  )
}

export default ScrollStem
