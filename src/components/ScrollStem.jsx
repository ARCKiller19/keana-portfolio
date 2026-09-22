import { useEffect, useRef } from 'react'
import { getSectionActivationLine } from '../utils/sectionNavigation.js'

const sectionIds = ['about', 'work', 'motion', 'playground', 'contact']

const growthSegments = [
  'M18 0V120H29V180',
  'M29 180V265H12V350',
  'M12 350V420H26V520',
  'M26 520V580H10V700',
  'M10 700V735H27V875H18V920',
]

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
    const segments = Array.from(
      stem.querySelectorAll('.scroll-stem-growth-segment'),
    )
    const tail = stem.querySelector('.scroll-stem-growth-tail')
    let frameId = null

    const updateStem = () => {
      frameId = null

      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean)

      if (!sections.length) return

      const scrollY = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight
      const activationLine = Math.max(
        getSectionActivationLine() + 24,
        window.innerHeight * 0.42,
      )
      const atPageEnd =
        scrollY + window.innerHeight >= scrollHeight - 2

      let currentIndex = -1

      sections.forEach((section, index) => {
        const sectionTop =
          scrollY + section.getBoundingClientRect().top - activationLine

        if (scrollY + 1 >= Math.max(sectionTop, 0)) {
          currentIndex = index
        }
      })

      if (atPageEnd) currentIndex = sections.length - 1

      nodes.forEach((node, index) => {
        node.classList.toggle('is-reached', index <= currentIndex)
        node.classList.toggle('is-current', index === currentIndex)
      })

      segments.forEach((segment, index) => {
        segment.classList.toggle('is-reached', index <= currentIndex)
      })

      tail?.classList.toggle(
        'is-reached',
        currentIndex === sections.length - 1,
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
        />

        {growthSegments.map((d, index) => (
          <path
            className="scroll-stem-growth-segment"
            d={d}
            pathLength="1"
            key={d}
            data-segment-index={index}
          />
        ))}

        <path
          className="scroll-stem-growth-tail"
          d="M18 920V1000"
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
