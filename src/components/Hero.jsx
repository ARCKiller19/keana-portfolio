import { handleSectionNavigation } from '../utils/sectionNavigation.js'

function Hero() {
  return (
    <section className="hero" aria-label="Introduction">
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
        />

        <div className="hero-organic hero-organic-main">
          <img
            src="/images/hero/botanical-04.JPG"
            alt=""
            decoding="async"
            fetchPriority="high"
          />
        </div>

        <div className="hero-photo hero-photo-right">
          <img
            src="/images/hero/botanical-10.JPG"
            alt=""
            decoding="async"
            fetchPriority="low"
          />
        </div>

        <div className="hero-photo hero-photo-top">
          <img
            src="/images/hero/botanical-12.JPG"
            alt=""
            decoding="async"
            fetchPriority="low"
          />
        </div>

        <div className="hero-photo hero-photo-bottom">
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
        />
        <img
          className="hero-cutout hero-cutout-b"
          src="/images/hero/transparent-botanical-3.PNG"
          alt=""
          decoding="async"
          fetchPriority="low"
        />

        <svg className="hero-wiring" viewBox="0 0 760 620" role="presentation">
          <path d="M84 128H224L300 204" />
          <path d="M348 82V180" />
          <path d="M520 136H646V244" />
          <path d="M240 448H104V536H250" />
          <path d="M430 458H586V548" />
          <path d="M318 310H448" />
          <circle cx="224" cy="128" r="3" />
          <circle cx="520" cy="136" r="3" />
          <circle cx="240" cy="448" r="3" />
          <circle cx="430" cy="458" r="3" />
        </svg>

        <div className="hero-dot-field hero-dot-field-a" />
        <div className="hero-dot-field hero-dot-field-b" />
        <span className="hero-cross hero-cross-a">+</span>
        <span className="hero-cross hero-cross-b">+</span>
        <span className="hero-collage-label">Botanical systems · visual studies</span>
      </div>
    </section>
  )
}

export default Hero