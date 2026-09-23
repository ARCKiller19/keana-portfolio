import { useEffect, useRef, useState } from 'react'
import { handleSectionNavigation } from '../utils/sectionNavigation.js'

const INTRO_SESSION_KEY = 'keana-botanical-intro-v8-seen'

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
  const introCompleteNotifiedRef = useRef(false)
  const [skipIntro] = useState(shouldSkipIntro)
  const [introPhase, setIntroPhase] = useState(skipIntro ? 'ready' : 'waiting')

  onIntroCompleteRef.current = onIntroComplete

  const notifyIntroComplete = () => {
    if (introCompleteNotifiedRef.current) return
    introCompleteNotifiedRef.current = true
    onIntroCompleteRef.current?.()
  }

  useEffect(() => {
    if (skipIntro) {
      const frameId = window.requestAnimationFrame(() => {
        notifyIntroComplete()
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
      // Claim this session before the choreography starts. If the Hero is ever
      // remounted or the page is refreshed mid-intro, it must not replay.
      try {
        window.sessionStorage.setItem(INTRO_SESSION_KEY, 'true')
      } catch {
        // The intro can still run when session storage is unavailable.
      }

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
          notifyIntroComplete()
        }, 2550),
        window.setTimeout(() => {
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
            d="M380 62C357 41 329 41 314 57C301 72 311 88 330 84C348 80 352 61 339 49C317 29 281 37 254 52C222 70 203 82 174 77C143 72 126 52 99 58C71 64 49 84 28 105"
          />
          <path
            className="intro-vine intro-vine-b"
            pathLength="1"
            d="M380 62C403 41 431 41 446 57C459 72 449 88 430 84C412 80 408 61 421 49C443 29 479 37 506 52C538 70 557 82 586 77C617 72 634 52 661 58C689 64 711 84 732 105"
          />
          <path
            className="intro-vine intro-vine-c"
            pathLength="1"
            d="M380 218C357 239 329 239 314 223C301 208 311 192 330 196C348 200 352 219 339 231C317 251 281 243 254 228C222 210 203 198 174 203C143 208 126 228 99 222C71 216 49 196 28 175"
          />
          <path
            className="intro-vine intro-vine-extension"
            pathLength="1"
            d="M380 218C403 239 431 239 446 223C459 208 449 192 430 196C412 200 408 219 421 231C443 251 479 243 506 228C538 210 557 198 586 203C617 208 634 228 661 222C689 216 711 196 732 175"
          />
        </g>

        <g transform="translate(295 48) rotate(155)">
          <path className="intro-leaf intro-leaf-a" d="M0 0C9 -8 17 -6 19 1C12 8 5 9 0 0Z" />
        </g>
        <g transform="translate(154 66) rotate(188)">
          <path className="intro-leaf intro-leaf-b" d="M0 0C9 -8 17 -6 19 1C12 8 5 9 0 0Z" />
        </g>
        <g transform="translate(465 48) rotate(25)">
          <path className="intro-leaf intro-leaf-c" d="M0 0C9 -8 17 -6 19 1C12 8 5 9 0 0Z" />
        </g>
        <g transform="translate(606 66) rotate(-8)">
          <path className="intro-leaf intro-leaf-d" d="M0 0C9 -8 17 -6 19 1C12 8 5 9 0 0Z" />
        </g>
        <g transform="translate(295 232) rotate(205)">
          <path className="intro-leaf intro-leaf-e" d="M0 0C9 -8 17 -6 19 1C12 8 5 9 0 0Z" />
        </g>
        <g transform="translate(154 214) rotate(172)">
          <path className="intro-leaf intro-leaf-f" d="M0 0C9 -8 17 -6 19 1C12 8 5 9 0 0Z" />
        </g>
        <g transform="translate(465 232) rotate(-25)">
          <path className="intro-leaf intro-leaf-g" d="M0 0C9 -8 17 -6 19 1C12 8 5 9 0 0Z" />
        </g>
        <g transform="translate(606 214) rotate(8)">
          <path className="intro-leaf intro-leaf-h" d="M0 0C9 -8 17 -6 19 1C12 8 5 9 0 0Z" />
        </g>

        <g className="intro-particles">
          <circle className="intro-particle intro-particle-a" cx="255" cy="47" r="1.25" />
          <circle className="intro-particle intro-particle-b" cx="505" cy="47" r="1.2" />
          <circle className="intro-particle intro-particle-c" cx="194" cy="80" r="1.05" />
          <circle className="intro-particle intro-particle-d" cx="566" cy="80" r="1.1" />
          <circle className="intro-particle intro-particle-e" cx="255" cy="233" r="1.15" />
          <circle className="intro-particle intro-particle-f" cx="505" cy="233" r="1.2" />
        </g>

        <circle className="intro-node intro-node-a" cx="380" cy="62" r="2.3" />
        <circle className="intro-node intro-node-b" cx="380" cy="218" r="2.3" />
        <circle className="intro-tip-glow intro-tip-glow-a" cx="28" cy="105" r="2.8" />
        <circle className="intro-tip-glow intro-tip-glow-b" cx="732" cy="105" r="2.8" />
        <circle className="intro-tip-glow intro-tip-glow-c" cx="28" cy="175" r="2.5" />
        <circle className="intro-tip-glow intro-tip-glow-d" cx="732" cy="175" r="2.5" />
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
