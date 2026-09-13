import { useEffect, useRef, useState } from 'react'
import projects from '../data/projects.js'
import '../projects.css'
import '../selected-work-motion.css'
import ProjectCard from './ProjectCard.jsx'
import ProjectModal from './ProjectModal.jsx'

function Projects() {
  const [selectedProject, setSelectedProject] = useState(null)
  const [sectionRevealed, setSectionRevealed] = useState(false)
  const archiveTriggerRef = useRef(null)

  useEffect(() => {
    const trigger = archiveTriggerRef.current
    if (!trigger) return undefined

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )

    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      setSectionRevealed(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setSectionRevealed(true)
        observer.disconnect()
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -28% 0px',
      },
    )

    observer.observe(trigger)

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <section
        className={`work work-motion ${sectionRevealed ? 'is-revealed' : ''}`}
        id="work"
        aria-label="Selected work"
      >
        <div ref={archiveTriggerRef} className="work-archive-entry">
          <div className="section-head section-head-motion">
            <h2 className="section-title-motion">
              <span>Selected Work</span>
            </h2>
            <span className="count section-count-motion">
              {String(projects.length).padStart(2, '0')} Projects
            </span>
          </div>

          <div className="archive-register" aria-hidden="true">
            <span className="archive-register-node" />
            <span className="archive-register-line" />
            <span className="archive-register-lock archive-register-lock-a" />
            <span className="archive-register-lock archive-register-lock-b" />
            <span className="archive-register-lock archive-register-lock-c" />
          </div>
        </div>

        <div className="work-archive">
          <div className="archive-press-rail" aria-hidden="true">
            <span />
          </div>

          <div className="archive-tracing-sheet" aria-hidden="true">
            <svg
              className="archive-tracing-art"
              viewBox="0 0 1200 620"
              preserveAspectRatio="xMidYMid slice"
              role="presentation"
            >
              <path
                className="archive-trace-stem"
                d="M62 470C164 420 232 334 296 252C350 184 424 142 514 158C606 174 645 260 733 274C829 289 902 226 964 155C1005 108 1054 83 1136 96"
              />
              <path
                className="archive-trace-branch"
                d="M300 252C246 228 203 191 176 146"
              />
              <path
                className="archive-trace-branch"
                d="M735 274C790 321 846 344 914 340"
              />
              <path
                className="archive-trace-leaf"
                d="M194 160C212 138 239 137 256 154C238 173 214 178 194 160Z"
              />
              <path
                className="archive-trace-leaf"
                d="M490 160C507 134 535 136 551 155C533 176 510 180 490 160Z"
              />
              <path
                className="archive-trace-leaf"
                d="M872 334C892 310 920 313 935 332C917 350 891 354 872 334Z"
              />
              <path className="archive-trace-guide" d="M72 88H356" />
              <path className="archive-trace-guide" d="M846 512H1134" />
              <circle className="archive-trace-node" cx="296" cy="252" r="4" />
              <circle className="archive-trace-node" cx="733" cy="274" r="4" />
              <path className="archive-trace-cross" d="M1084 220V244M1072 232H1096" />
            </svg>
          </div>

          <span className="archive-scan-line" aria-hidden="true" />

          <div className="work-grid">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                onOpen={setSelectedProject}
              />
            ))}
          </div>
        </div>
      </section>

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  )
}

export default Projects
