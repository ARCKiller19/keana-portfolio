const socialLinks = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/patricia-keana-roma/',
    icon: 'linkedin',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/ARCKiller19',
    icon: 'github',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/mel.aur.green',
    icon: 'instagram',
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/greengreengreenery/',
    icon: 'facebook',
  },
]

function SocialIcon({ name }) {
  const commonProps = {
    viewBox: '0 0 24 24',
    width: '18',
    height: '18',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.6',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  if (name === 'linkedin') {
    return (
      <svg {...commonProps}>
        <path d="M7 9v8" />
        <path d="M7 6.5v.1" />
        <path d="M11 17v-4.6c0-2.2 3-2.4 3 0V17" />
        <path d="M11 9v8" />
        <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" />
      </svg>
    )
  }

  if (name === 'github') {
    return (
      <svg {...commonProps}>
        <path d="M9 19c-4 1.2-4-2-5-2.5" />
        <path d="M15 19v-3.2c0-.9.3-1.6.8-2.1 2.6-.3 5.2-1.3 5.2-5.7A4.4 4.4 0 0 0 19.8 5c.1-.9-.1-2-.5-2.8 0 0-1-.3-3.3 1.2a11.5 11.5 0 0 0-6 0C7.7 1.9 6.7 2.2 6.7 2.2A4.8 4.8 0 0 0 6.2 5 4.4 4.4 0 0 0 5 8c0 4.4 2.6 5.4 5.2 5.7.5.5.8 1.2.8 2.1V19" />
      </svg>
    )
  }

  if (name === 'instagram') {
    return (
      <svg {...commonProps}>
        <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
        <circle cx="12" cy="12" r="3.6" />
        <circle cx="17.2" cy="6.8" r=".65" fill="currentColor" stroke="none" />
      </svg>
    )
  }

  return (
    <svg {...commonProps}>
      <path d="M14.5 8H17V4.5h-2.6c-3 0-4.4 1.8-4.4 4.7V12H7v3.5h3V21h4v-5.5h3l.6-3.5H14V9.4c0-1 .3-1.4.5-1.4Z" />
    </svg>
  )
}

function Footer() {
  return (
    <footer className="footer" id="contact" aria-label="Contact">
      <div className="footer-kicker">
        <span>Contact</span>
        <span>Available for collaborations</span>
      </div>

      <div className="footer-top">
        <div className="footer-message">
          <p className="footer-eyebrow">Have something in mind?</p>
          <h2>Let's make something thoughtful.</h2>
        </div>

        <div className="footer-contact-panel">
          <a className="footer-email" href="mailto:romapkrr3@gmail.com">
            <span>romapkrr3@gmail.com</span>
            <span aria-hidden="true">↗</span>
          </a>

          <nav className="footer-links" aria-label="Social links">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                <span className="footer-link-icon">
                  <SocialIcon name={link.icon} />
                </span>
                <span className="footer-link-label">{link.label}</span>
                <span className="footer-link-arrow" aria-hidden="true">↗</span>
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Patricia Keana Roma</span>
        <span>Davao City, Philippines</span>
      </div>
    </footer>
  )
}

export default Footer