import { useEffect, useRef, useState } from 'react'
import { handleSectionNavigation } from '../utils/sectionNavigation.js'

const INTRO_SESSION_KEY = 'keana-botanical-intro-v4-seen'

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
        window.setTimeout(() => setIntroPhase('vining'), 260),
        window.setTimeout(() => {
          body.classList.add('botanical-intro-settling')
          setIntroPhase('settling')
          onIntroCompleteRef.current?.()
        }, 1080),
        window.setTimeout(() => {
          setIntroPhase('furling')
        }, 1900),
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
        }, 2600),
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
            d="M82 188C142 224 218 222 295 205C383 186 445 205 522 204C592 203 647 176 676 129"
          />
          <path
            className="intro-vine intro-vine-b"
            pathLength="1"
            d="M126 116C157 82 205 72 244 91C275 106 276 135 251 157C235 171 218 178 197 180"
          />
          <path
            className="intro-vine intro-vine-c"
            pathLength="1"
            d="M604 90C640 60 687 72 701 106C712 133 694 159 667 171C650 178 635 184 623 198"
          />
          <path
            className="intro-vine intro-vine-extension"
            pathLength="1"
            d="M522 204C608 213 679 226 742 207"
          />
        </g>

        <path
          className="intro-leaf intro-leaf-a"
          d="M151 209C165 194 181 196 187 208C174 217 160 220 151 209Z"
        />
        <path
          className="intro-leaf intro-leaf-b"
          d="M244 92C256 77 270 80 276 91C266 101 254 105 244 92Z"
        />
        <path
          className="intro-leaf intro-leaf-c"
          d="M649 163C660 147 676 149 683 160C673 171 660 176 649 163Z"
        />
        <path
          className="intro-leaf intro-leaf-d"
          d="M588 211C600 196 615 199 621 211C610 220 597 223 588 211Z"
        />
        <path
          className="intro-leaf intro-leaf-e"
          d="M211 178C200 164 187 167 182 178C191 187 203 190 211 178Z"
        />

        <circle className="intro-node intro-node-a" cx="295" cy="205" r="3" />
        <circle className="intro-node intro-node-b" cx="667" cy="171" r="3" />
        <path className="intro-cross" d="M704 72V88M696 80H712" />
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
