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
        <a className="btn" href="#work">
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

      <div className="hero-frames" aria-hidden="true">
        <div className="frame frame-a">
          <img
            src="/images/hero/botanical-01.jpg"
            alt=""
            decoding="async"
            fetchPriority="high"
          />
        </div>
        <div className="frame frame-b">
          <img
            src="/images/hero/botanical-02.jpg"
            alt=""
            decoding="async"
            fetchPriority="low"
          />
        </div>
        <div className="frame frame-c">
          <img
            src="/images/hero/botanical-03.jpg"
            alt=""
            decoding="async"
            fetchPriority="low"
          />
        </div>
      </div>
    </section>
  )
}

export default Hero
