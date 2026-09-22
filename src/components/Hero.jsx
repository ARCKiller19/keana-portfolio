import { useEffect, useRef, useState } from 'react'
import { handleSectionNavigation } from '../utils/sectionNavigation.js'

const INTRO_SESSION_KEY = 'keana-botanical-intro-v7-seen'

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function shouldSkipIntro() {
  if (typeof window === 'undefined') return false

  const params = new URLSearchParams(window.location.search)
  if (params.get('intro') === '1') return false

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return true
  }

  try {
    return window.sessionStorage.getItem(INTRO_SESSION_KEY) === 'true'
  } catch {
    return false
  }
}

function Hero({ motionReady = false, onIntroComplete }) {
  const heroRef = useRef(null)
  const markRef = useRef(null)
  const onIntroCompleteRef = useRef(onIntroComplete)
  const [skipIntro] = useState(shouldSkipIntro)
  const [introPhase, setIntroPhase] = useState(skipIntro ? 'ready' : 'waiting')

  onIntroCompleteRef.current = onIntroComplete

  useEffect(() => {
    if (skipIntro) {
      const frameId = window.requestAnimationFrame(() => {
        onIntroCompleteRef.current?.()
      })

      return () => window.cancelAnimationFrame(frameId)
    }

    const hero = heroRef.current
    const mark = markRef.current
    if (!hero || !mark) return undefined

    const body = document.body
    let cancelled = false
    let scrollLocked = false
    const timers = []
    const blockedScrollKeys = new Set([
      'ArrowUp',
      'ArrowDown',
      'PageUp',
      'PageDown',
      'Home',
      'End',
      ' ',
    ])

    const preventScroll = (event) => {
      event.preventDefault()
    }

    const preventScrollKey = (event) => {
      if (blockedScrollKeys.has(event.key)) {
        event.preventDefault()
      }
    }

    const lockScrollWithoutReflow = () => {
      if (scrollLocked) return
      scrollLocked = true
      window.addEventListener('wheel', preventScroll, { passive: false })
      window.addEventListener('touchmove', preventScroll, { passive: false })
      window.addEventListener('keydown', preventScrollKey)
    }

    const releaseScrollLock = () => {
      if (!scrollLocked) return
      scrollLocked = false
      window.removeEventListener('wheel', preventScroll)
      window.removeEventListener('touchmove', preventScroll)
      window.removeEventListener('keydown', preventScrollKey)
    }

    const measureIntro = () => {
      const markRect = mark.getBoundingClientRect()
      const markCenterX = markRect.left + markRect.width / 2
      const markCenterY = markRect.top + markRect.height / 2
      const viewportCenterX = window.innerWidth / 2
      const viewportCenterY = window.innerHeight / 2
      const deltaX = viewportCenterX - markCenterX
      const deltaY = viewportCenterY - markCenterY

      hero.style.setProperty('--intro-x', `${deltaX.toFixed(2)}px`)
      hero.style.setProperty('--intro-y', `${deltaY.toFixed(2)}px`)
      hero.style.setProperty('--intro-vine-x', `${(-deltaX).toFixed(2)}px`)
      hero.style.setProperty('--intro-vine-y', `${(-deltaY).toFixed(2)}px`)
    }

    const startIntro = async () => {
      body.classList.add('botanical-intro-active')
      lockScrollWithoutReflow()

      if (window.scrollY !== 0 || window.scrollX !== 0) {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      }

      try {
        if (document.fonts) {
          await Promise.all([
            document.fonts.load('300 156px "Cormorant Garamond"'),
            document.fonts.ready,
          ])
        }
      } catch {
        // The choreography can still run if the Font Loading API is unavailable.
      }

      if (cancelled) return

      measureIntro()
      setIntroPhase('holding')

      timers.push(
        window.setTimeout(() => setIntroPhase('vining'), 300),
        window.setTimeout(() => {
          setIntroPhase('unfurling')
        }, 1700),
        window.setTimeout(() => {
          body.classList.add('botanical-intro-settling')
          setIntroPhase('settling')
          onIntroCompleteRef.current?.()
        }, 2550),
        window.setTimeout(() => {
          try {
            window.sessionStorage.setItem(INTRO_SESSION_KEY, 'true')
          } catch {
            // The intro can finish even when session storage is unavailable.
          }

          body.classList.remove(
            'botanical-intro-active',
            'botanical-intro-settling',
          )
          releaseScrollLock()
          setIntroPhase('ready')
        }, 3350),
      )
    }

    startIntro()
    window.addEventListener('resize', measureIntro)

    return () => {
      cancelled = true
      timers.forEach((timer) => window.clearTimeout(timer))
      window.removeEventListener('resize', measureIntro)
      releaseScrollLock()
      body.classList.remove(
        'botanical-intro-active',
        'botanical-intro-settling',
      )
    }
  }, [skipIntro])

  useEffect(() => {
    if (!motionReady) return undefined

    const hero = heroRef.current
    if (!hero) return undefined

    const parallaxItems = Array.from(hero.querySelectorAll('[data-parallax]'))
    const motionMedia = window.matchMedia(
      '(min-width: 721px) and (prefers-reduced-motion: no-preference)',
    )
    let frameId = null

    const resetParallax = () => {
      parallaxItems.forEach((item) => {
        item.style.removeProperty('--parallax-y')
      })
    }

    const updateParallax = () => {
      frameId = null

      if (!motionMedia.matches) {
        resetParallax()
        return
      }

      const rect = hero.getBoundingClientRect()
      const travel = window.innerHeight + rect.height
      const progress = clamp((window.innerHeight - rect.top) / travel, 0, 1)
      const centeredProgress = (progress - 0.5) * 2

      parallaxItems.forEach((item) => {
        const depth = Number(item.dataset.parallax ?? 0)
        const offset = centeredProgress * depth
        item.style.setProperty('--parallax-y', `${offset.toFixed(2)}px`)
      })
    }

    const requestParallaxUpdate = () => {
      if (frameId !== null) return
      frameId = window.requestAnimationFrame(updateParallax)
    }

    updateParallax()
    window.addEventListener('scroll', requestParallaxUpdate, { passive: true })
    window.addEventListener('resize', requestParallaxUpdate)
    motionMedia.addEventListener('change', requestParallaxUpdate)

    return () => {
      window.removeEventListener('scroll', requestParallaxUpdate)
      window.removeEventListener('resize', requestParallaxUpdate)
      motionMedia.removeEventListener('change', requestParallaxUpdate)
      resetParallax()

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [motionReady])

  return (
    <section
      ref={heroRef}
      className={`hero hero-motion intro-${introPhase} ${
        motionReady ? 'is-motion-ready' : ''
      }`}
      aria-label="Introduction"
    >
      <svg
        className="hero-intro-botanical"
        viewBox="0 0 760 280"
        role="presentation"
        aria-hidden="true"
      >
        <g className="hero-intro-vine-lines">
          <path
            className="intro-vine intro-vine-a"
            pathLength="1"
            d="M380 58C326 43 273 43 220 53C154 66 96 65 28 96"
          />
          <path
            className="intro-vine intro-vine-b"
            pathLength="1"
            d="M380 58C434 43 487 43 540 53C606 66 664 65 732 96"
          />
          <path
            className="intro-vine intro-vine-c"
            pathLength="1"
            d="M380 222C326 237 273 237 220 227C154 214 96 215 28 184"
          />
          <path
            className="intro-vine intro-vine-extension"
            pathLength="1"
            d="M380 222C434 237 487 237 540 227C606 214 664 215 732 184"
          />
        </g>

        <path
          className="intro-leaf intro-leaf-a"
          d="M112 70C126 53 144 55 151 67C140 79 126 84 112 70Z"
        />
        <path
          className="intro-leaf intro-leaf-b"
          d="M628 68C642 51 660 53 667 65C656 77 642 82 628 68Z"
        />
        <path
          className="intro-leaf intro-leaf-c"
          d="M132 212C119 194 102 196 95 208C106 221 120 225 132 212Z"
        />
        <path
          className="intro-leaf intro-leaf-d"
          d="M610 213C623 195 640 197 647 209C636 222 622 226 610 213Z"
        />

        <g className="intro-particles">
          <circle className="intro-particle intro-particle-a" cx="184" cy="62" r="1.3" />
          <circle className="intro-particle intro-particle-b" cx="575" cy="61" r="1.2" />
          <circle className="intro-particle intro-particle-c" cx="193" cy="222" r="1.1" />
          <circle className="intro-particle intro-particle-d" cx="566" cy="220" r="1.25" />
        </g>

        <circle className="intro-node intro-node-a" cx="380" cy="58" r="2.3" />
        <circle className="intro-node intro-node-b" cx="380" cy="222" r="2.3" />
        <circle className="intro-tip-glow intro-tip-glow-a" cx="28" cy="96" r="2.8" />
        <circle className="intro-tip-glow intro-tip-glow-b" cx="732" cy="96" r="2.8" />
      </svg>

      <div className="hero-text">
        <p className="eyebrow">
          UI/UX Designer · Graphic Designer · Multimedia Creative
        </p>
        <h1 className="hero-mark" ref={markRef}>
          KEANA
        </h1>
        <p className="hero-tagline">
          Multidisciplinary designer working across UI/UX, graphic design,
          multimedia, and digital experience.
        </p>
        <a className="btn" href="#work" onClick={handleSectionNavigation}>
          View Selected Work <span aria-hidden="true">↗</span>
        </a>

        <dl className="hero-meta">
          <div>
            <dt>Based in</dt>
            <dd>Davao City, Philippines</dd>
          </div>
          <div>
            <dt>Currently</dt>
            <dd>Head of UI/UX, MadePoies Creative-Tech Studio</dd>
          </div>
        </dl>
      </div>

      <div className="hero-collage" aria-hidden="true">
        <img
          className="hero-typewriter"
          src="/images/hero/typewrite-1.PNG"
          alt=""
          decoding="async"
          fetchPriority="low"
          data-parallax="-10"
        />

        <div className="hero-organic hero-organic-main" data-parallax="13">
          <img
            src="/images/hero/botanical-04.JPG"
            alt=""
            decoding="async"
            fetchPriority="high"
          />
        </div>

        <div className="hero-photo hero-photo-right" data-parallax="24">
          <img
            src="/images/hero/botanical-10.JPG"
            alt=""
            decoding="async"
            fetchPriority="low"
          />
        </div>

        <div className="hero-photo hero-photo-top" data-parallax="30">
          <img
            src="/images/hero/botanical-12.JPG"
            alt=""
            decoding="async"
            fetchPriority="low"
          />
        </div>

        <div className="hero-photo hero-photo-bottom" data-parallax="18">
          <img
            src="/images/hero/botanical-15.JPG"
            alt=""
            decoding="async"
            fetchPriority="low"
          />
        </div>

        <img
          className="hero-cutout hero-cutout-a"
          src="/images/hero/transparent-botanical-1.PNG"
          alt=""
          decoding="async"
          fetchPriority="low"
          data-parallax="38"
        />
        <img
          className="hero-cutout hero-cutout-b"
          src="/images/hero/transparent-botanical-3.PNG"
          alt=""
          decoding="async"
          fetchPriority="low"
          data-parallax="27"
        />

        <svg
          className="hero-wiring"
          viewBox="0 0 760 620"
          role="presentation"
          data-parallax="7"
        >
          <path d="M84 128H224L300 204" pathLength="1" />
          <path d="M348 82V180" pathLength="1" />
          <path d="M520 136H646V244" pathLength="1" />
          <path d="M240 448H104V536H250" pathLength="1" />
          <path d="M430 458H586V548" pathLength="1" />
          <path d="M318 310H448" pathLength="1" />
          <circle cx="224" cy="128" r="3" />
          <circle cx="520" cy="136" r="3" />
          <circle cx="240" cy="448" r="3" />
          <circle cx="430" cy="458" r="3" />
        </svg>

        <div className="hero-dot-field hero-dot-field-a" data-parallax="16" />
        <div className="hero-dot-field hero-dot-field-b" data-parallax="11" />
        <span className="hero-cross hero-cross-a" data-parallax="20">
          +
        </span>
        <span className="hero-cross hero-cross-b" data-parallax="15">
          +
        </span>
        <span className="hero-collage-label" data-parallax="9">
          Botanical systems · visual studies
        </span>
      </div>
    </section>
  )
}

export default Hero
