function Navbar() {
    return (
      <header className="nav" id="top">
        <a className="nav-mark" href="#top">
          KEANA
        </a>
  
        <nav className="nav-links" aria-label="Primary">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#playground">Playground</a>
          <a href="#contact">Contact</a>
        </nav>
  
        <span className="nav-meta">Davao City, PH</span>
      </header>
    )
  }
  
  export default Navbar