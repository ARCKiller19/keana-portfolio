import useReveal from '../hooks/useReveal.js'

const focusAreas = [
  'Brand Identity',
  'UI/UX Design',
  'Web Design',
  'Prototyping',
  'Visual Direction',
  'Editorial Design',
]

function About() {
  const revealRef = useReveal()

  return (
    <section
      className="about reveal-stagger"
      id="about"
      aria-label="About"
      ref={revealRef}
    >
      <div className="about-portrait">
        <img
          src="/images/about/portrait.jpg"
          alt="Portrait of Patricia Keana Roma"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="about-copy">
        <h2>About</h2>
        <p>
          I'm Patricia Keana Roma, a multidisciplinary designer working
          across UI/UX, graphic design, multimedia, and digital experiences.
          My background in Psychology influences how I think about people,
          behavior, communication, and how experiences are understood.
        </p>

        <dl className="about-roles">
          <div>
            <dt>Head of UI/UX</dt>
            <dd>MadePoies Creative-Tech Studio</dd>
          </div>
          <div>
            <dt>Founder &amp; Owner</dt>
            <dd>ClickMate Rentals</dd>
          </div>
        </dl>
      </div>

      <div className="about-focus">
        <p className="label">Focus Areas</p>
        <ul>
          {focusAreas.map((area) => (
            <li key={area}>{area}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default About
