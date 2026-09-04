function Hero() {
  return (
    <section className="hero" aria-label="Introduction">
      <div className="hero-copy">
        <p className="hero-kicker">
          UI/UX Designer · Graphic Designer · Multimedia Creative
        </p>

        <h1 className="hero-mark">KEANA</h1>

        <p className="hero-statement">
          Design that <em>grows</em>
          <br />
          with meaning.
        </p>

        <div className="hero-details">
          <p className="hero-summary">
            Thoughtful visual worlds across interfaces, identity, motion, and
            digital experiences.
          </p>

          <dl className="hero-facts">
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
      </div>

      <div className="hero-art" aria-hidden="true">
        <figure className="hero-botanical">
          <img src="/images/hero/botanical-01.jpg" alt="" />
        </figure>

        <div className="hero-annotation hero-annotation-growth">
          <span className="hero-annotation-label">Growth</span>
          <span className="hero-annotation-line" />
          <span className="hero-annotation-dot" />
        </div>

        <div className="hero-annotation hero-annotation-structure">
          <span className="hero-annotation-label">Structure</span>
          <span className="hero-annotation-line" />
          <span className="hero-annotation-dot" />
        </div>

        <div className="hero-annotation hero-annotation-essence">
          <span className="hero-annotation-label">Essence</span>
          <span className="hero-annotation-line" />
          <span className="hero-annotation-dot" />
        </div>
      </div>
    </section>
  )
}

export default Hero
