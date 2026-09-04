const socialLinks = [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/patricia-keana-roma/' },
    { label: 'GitHub', href: 'https://github.com/ARCKiller19' },
    { label: 'Instagram', href: 'https://www.instagram.com/mel.aur.green' },
    { label: 'Facebook', href: 'https://www.facebook.com/greengreengreenery/' },
  ]
  
  function Footer() {
    return (
      <footer className="footer" id="contact" aria-label="Contact">
        <div className="footer-top">
          <h2>Let's work together</h2>
          <a className="btn" href="mailto:romapkrr3@gmail.com">
            romapkrr3@gmail.com <span aria-hidden="true">↗</span>
          </a>
        </div>
  
        <nav className="footer-links" aria-label="Social links">
          {socialLinks.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </nav>
  
        <div className="footer-bottom">
          <span>© 2026 Patricia Keana Roma</span>
          <span>Davao City, Philippines</span>
        </div>
      </footer>
    )
  }
  
  export default Footer