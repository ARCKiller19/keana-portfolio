import { useEffect, useRef, useState } from 'react'
import projects from '../data/projects.js'
import '../projects.css'
import '../selected-work-motion.css'
import ProjectCard from './ProjectCard.jsx'
import ProjectModal from './ProjectModal.jsx'

function Projects() {
  const [selectedProject, setSelectedProject] = useState(null)
  const [sectionRevealed, setSectionRevealed] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

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
        threshold: 0.12,
        rootMargin: '0px 0px -12% 0px',
      },
    )

    observer.observe(section)

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <section
        ref={sectionRef}
        className={`work work-motion ${sectionRevealed ? 'is-revealed' : ''}`}
        id="work"
        aria-label="Selected work"
      >
        <div className="section-head section-head-motion">
          <h2 className="section-title-motion">
            <span>Selected Work</span>
          </h2>
          <span className="count section-count-motion">
            {String(projects.length).padStart(2, '0')} Projects
          </span>
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
      </section>

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  )
}

export default Projects
