import { useEffect, useRef } from 'react'
import { getSectionActivationLine } from '../utils/sectionNavigation.js'

const sectionIds = ['about', 'work', 'motion', 'playground', 'contact']
const nodeProgress = [0.176, 0.349, 0.518, 0.699, 0.926]

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

      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean)

      if (!sections.length) return

      const scrollY = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight
      const scrollRange = Math.max(scrollHeight - window.innerHeight, 1)
      const activationLine = Math.max(
        getSectionActivationLine() + 24,
        window.innerHeight * 0.42,
      )
      const atPageEnd =
        scrollY + window.innerHeight >= scrollHeight - 2

      const activationScrolls = sections.map((section) =>
        Math.max(
          0,
          scrollY + section.getBoundingClientRect().top - activationLine,
        ),
      )

      let currentIndex = -1

      activationScrolls.forEach((activationScroll, index) => {
        if (scrollY + 1 >= activationScroll) currentIndex = index
      })

      if (atPageEnd) currentIndex = sections.length - 1

      nodes.forEach((node, index) => {
        const isReached = index <= currentIndex
        const isCurrent = index === currentIndex

        node.classList.toggle('is-reached', isReached)
        node.classList.toggle('is-current', isCurrent)
      })

      let progress = 0

      if (currentIndex >= 0) {
        progress =
          currentIndex === sections.length - 1
            ? 1
            : nodeProgress[currentIndex]
      }

      stem.style.setProperty(
        '--stem-progress',
        clamp(progress, 0, 1).toFixed(4),
      )
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
