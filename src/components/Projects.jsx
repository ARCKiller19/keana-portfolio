import { useEffect, useRef, useState } from 'react'
import projects from '../data/projects.js'
import '../projects.css'
import '../selected-work-side-archive.css'
import ProjectCard from './ProjectCard.jsx'
import ProjectModal from './ProjectModal.jsx'

function canUseArchiveMotion() {
  if (typeof window === 'undefined') return false

  return (
    'IntersectionObserver' in window &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function Projects() {
  const [selectedProject, setSelectedProject] = useState(null)
  const [archiveMotionReady, setArchiveMotionReady] = useState(() =>
    canUseArchiveMotion(),
  )
  const [sectionRevealed, setSectionRevealed] = useState(false)
  const stageRef = useRef(null)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )

    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      setArchiveMotionReady(false)
      setSectionRevealed(false)
      return undefined
    }

    setArchiveMotionReady(true)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return

        setSectionRevealed(true)
        observer.disconnect()
      },
      {
        threshold: 0.01,
        // Trigger as the stage reaches the upper 40% of the viewport. The
        // hero CTA is nearly finished by then, while the entire side-mounted
        // composition is still visible for the release into the grid.
        rootMargin: '0px 0px -60% 0px',
      },
    )

    const handleMotionPreferenceChange = (event) => {
      if (!event.matches) return

      setArchiveMotionReady(false)
      setSectionRevealed(false)
      observer.disconnect()
    }

    observer.observe(stage)
    reducedMotion.addEventListener('change', handleMotionPreferenceChange)

    return () => {
      observer.disconnect()
      reducedMotion.removeEventListener('change', handleMotionPreferenceChange)
    }
  }, [])

  return (
    <>
      <section
        className={`work work-side-archive ${
          archiveMotionReady ? 'is-archive-motion-ready' : ''
        } ${sectionRevealed ? 'is-revealed' : ''}`}
        id="work"
        aria-label="Selected work"
      >
        <div className="section-head archive-section-head">
          <h2>Selected Work</h2>
          <span className="count">
            {String(projects.length).padStart(2, '0')} Projects
          </span>
        </div>

        <div ref={stageRef} className="archive-side-stage">
          <div
            className="archive-side-rail archive-side-rail-left"
            aria-hidden="true"
          >
            <span className="archive-side-rail-node" />
            <span className="archive-side-rail-node" />
            <span className="archive-side-rail-node" />
          </div>

          <div className="archive-inspection-field" aria-hidden="true">
            <span className="archive-inspection-cross">+</span>
            <span className="archive-inspection-index">
              Project index · 01—{String(projects.length).padStart(2, '0')}
            </span>
          </div>

          <div
            className="archive-side-rail archive-side-rail-right"
            aria-hidden="true"
          >
            <span className="archive-side-rail-node" />
            <span className="archive-side-rail-node" />
            <span className="archive-side-rail-node" />
          </div>

          <span className="archive-catalogue-rule" aria-hidden="true" />

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
