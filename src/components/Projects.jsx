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
