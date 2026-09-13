import { useEffect, useRef } from 'react'
import { handleSectionNavigation } from '../utils/sectionNavigation.js'

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function Hero({ motionReady = false }) {
  const heroRef = useRef(null)

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
      className={`hero hero-motion ${motionReady ? 'is-motion-ready' : ''}`}
      aria-label="Introduction"
    >
      <div className="hero-text">
        <p className="eyebrow">
          UI/UX Designer · Graphic Designer · Multimedia Creative
        </p>
        <h1 className="hero-mark">KEANA</h1>
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

        <div
          className="hero-dot-field hero-dot-field-a"
          data-parallax="16"
        />
        <div
          className="hero-dot-field hero-dot-field-b"
          data-parallax="11"
        />
        <span className="hero-cross hero-cross-a" data-parallax="20">+</span>
        <span className="hero-cross hero-cross-b" data-parallax="15">+</span>
        <span className="hero-collage-label" data-parallax="9">
          Botanical systems · visual studies
        </span>
      </div>
    </section>
  )
}

export default Hero