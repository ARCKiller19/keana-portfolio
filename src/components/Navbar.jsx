import { handleSectionNavigation } from '../utils/sectionNavigation.js'

function Navbar() {
  return (
    <header className="nav" id="top">
      <a className="nav-mark" href="#top" onClick={handleSectionNavigation}>
        KEANA
      </a>

      <nav className="nav-links" aria-label="Primary">
        <a href="#work" onClick={handleSectionNavigation}>Work</a>
        <a href="#motion" onClick={handleSectionNavigation}>Motion</a>
        <a href="#about" onClick={handleSectionNavigation}>About</a>
        <a href="#playground" onClick={handleSectionNavigation}>Playground</a>
        <a href="#contact" onClick={handleSectionNavigation}>Contact</a>
      </nav>

      <span className="nav-meta">Davao City, PH</span>
    </header>
  )
}

export default Navbar
