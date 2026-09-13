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
  const [sectionRevealed, setSectionRevealed] = useState(
    () => !canUseArchiveMotion(),
  )
  const stageRef = useRef(null)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )

    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      setArchiveMotionReady(false)
      setSectionRevealed(true)
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
        // Wait until the archive reaches the upper part of the viewport. This
        // lets the hero CTA finish most of its smooth travel before the side
        // specimens release, so the visitor can actually watch the sequence.
        rootMargin: '0px 0px -72% 0px',
      },
    )

    const handleMotionPreferenceChange = (event) => {
      if (!event.matches) return

      setArchiveMotionReady(false)
      setSectionRevealed(true)
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
