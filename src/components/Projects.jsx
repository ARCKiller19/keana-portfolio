import { useState } from 'react'
import projects from '../data/projects.js'
import useReveal from '../hooks/useReveal.js'
import '../projects.css'
import ProjectCard from './ProjectCard.jsx'
import ProjectModal from './ProjectModal.jsx'

function Projects() {
  const [selectedProject, setSelectedProject] = useState(null)
  const headingRevealRef = useReveal()
  const gridRevealRef = useReveal()

  return (
    <>
      <section className="work" id="work" aria-label="Selected work">
        <div className="section-head reveal-pair" ref={headingRevealRef}>
          <h2>Selected Work</h2>
          <span className="count">
            {String(projects.length).padStart(2, '0')} Projects
          </span>
        </div>

        <div className="work-grid reveal-stagger" ref={gridRevealRef}>
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
