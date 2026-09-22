import { useEffect, useRef, useState } from 'react'
import { handleSectionNavigation } from '../utils/sectionNavigation.js'

const INTRO_SESSION_KEY = 'keana-botanical-intro-v6-seen'

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
            d="M18 105C104 64 195 53 283 65C367 76 433 79 514 61C598 42 671 51 742 88"
          />
          <path
            className="intro-vine intro-vine-b"
            pathLength="1"
            d="M24 211C116 180 210 188 294 207C381 227 472 224 557 203C626 186 684 180 741 193"
          />
          <path
            className="intro-vine intro-vine-c"
            pathLength="1"
            d="M126 170C88 156 69 129 77 103C84 80 108 70 133 82C151 91 159 107 156 124"
          />
          <path
            className="intro-vine intro-vine-extension"
            pathLength="1"
            d="M635 101C660 78 694 78 716 95C738 112 738 139 719 156C704 169 684 173 667 164"
          />
        </g>

        <path
          className="intro-leaf intro-leaf-a"
          d="M112 83C126 66 144 68 151 80C140 92 126 97 112 83Z"
        />
        <path
          className="intro-leaf intro-leaf-b"
          d="M276 64C289 47 306 49 313 61C302 73 289 77 276 64Z"
        />
        <path
          className="intro-leaf intro-leaf-c"
          d="M421 214C434 196 452 198 459 211C448 224 433 228 421 214Z"
        />
        <path
          className="intro-leaf intro-leaf-d"
          d="M557 61C570 44 588 46 595 58C584 71 570 75 557 61Z"
        />
        <path
          className="intro-leaf intro-leaf-e"
          d="M651 184C664 166 681 169 688 181C677 194 663 198 651 184Z"
        />
        <path
          className="intro-leaf intro-leaf-f"
          d="M161 201C149 183 133 185 126 197C136 210 150 214 161 201Z"
        />

        <g className="intro-particles">
          <circle className="intro-particle intro-particle-a" cx="172" cy="91" r="1.5" />
          <circle className="intro-particle intro-particle-b" cx="246" cy="201" r="1.2" />
          <circle className="intro-particle intro-particle-c" cx="351" cy="57" r="1.4" />
          <circle className="intro-particle intro-particle-d" cx="407" cy="214" r="1.1" />
          <circle className="intro-particle intro-particle-e" cx="520" cy="75" r="1.35" />
          <circle className="intro-particle intro-particle-f" cx="681" cy="151" r="1.15" />
          <circle className="intro-particle intro-particle-g" cx="558" cy="193" r="1.6" />
          <circle className="intro-particle intro-particle-h" cx="213" cy="132" r="1" />
        </g>

        <circle className="intro-node intro-node-a" cx="328" cy="174" r="2.6" />
        <circle className="intro-node intro-node-b" cx="612" cy="119" r="2.6" />
        <circle className="intro-tip-glow intro-tip-glow-a" cx="731" cy="101" r="3.2" />
        <circle className="intro-tip-glow intro-tip-glow-b" cx="734" cy="191" r="2.7" />
        <path className="intro-cross" d="M704 62V78M696 70H712" />
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
