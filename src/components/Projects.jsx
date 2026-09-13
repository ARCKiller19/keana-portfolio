import { useState } from 'react'
import projects from '../data/projects.js'
import '../projects.css'
import '../selected-work-motion.css'
import ProjectModal from './ProjectModal.jsx'

function handleSpecimenImageError(event, project) {
  if (!project.fallbackImage) return

  event.currentTarget.onerror = null
  event.currentTarget.src = project.fallbackImage
}

function SpecimenCard({ project, index, side, isSelected, onSelect }) {
  return (
    <button
      className={`specimen-card specimen-card-${side} ${
        isSelected ? 'is-selected' : ''
      }`}
      type="button"
      onClick={() => onSelect(index)}
      aria-pressed={isSelected}
      aria-controls="work-inspection-panel"
      data-specimen-index={index}
    >
      <span className="specimen-card-image-wrap">
        <img
          className="specimen-card-image"
          src={project.cardImage ?? project.image}
          alt=""
          loading="lazy"
          decoding="async"
          onError={(event) => handleSpecimenImageError(event, project)}
          style={{
            objectFit: project.imageFit ?? 'cover',
            objectPosition: project.imagePosition ?? 'center top',
          }}
        />
      </span>

      <span className="specimen-card-copy">
        <span className="specimen-card-index">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="specimen-card-title">{project.title}</span>
        <span className="specimen-card-year">{project.year}</span>
      </span>

      <span className="specimen-card-node" aria-hidden="true" />
    </button>
  )
}

function Projects() {
  const [selectedProject, setSelectedProject] = useState(null)
  const [inspectedIndex, setInspectedIndex] = useState(null)

  const inspectedProject =
    inspectedIndex === null ? null : projects[inspectedIndex]
  const inspectionSide =
    inspectedIndex === null ? null : inspectedIndex < 3 ? 'left' : 'right'

  return (
    <>
      <section className="work work-motion" id="work" aria-label="Selected work">
        <div className="section-head specimen-section-head">
          <div>
            <p className="specimen-kicker">Specimen archive</p>
            <h2>Selected Work</h2>
          </div>
          <span className="count">
            {String(projects.length).padStart(2, '0')} Projects
          </span>
        </div>

        <div className="specimen-workbench">
          <aside className="specimen-rack specimen-rack-left" aria-label="Project specimens 1 to 3">
            <span className="specimen-rack-label" aria-hidden="true">
              Archive A
            </span>
            <span className="specimen-rack-rail" aria-hidden="true" />

            {projects.slice(0, 3).map((project, index) => (
              <SpecimenCard
                key={project.id}
                project={project}
                index={index}
                side="left"
                isSelected={inspectedIndex === index}
                onSelect={setInspectedIndex}
              />
            ))}
          </aside>

          <div
            className={`inspection-bench ${
              inspectedProject ? 'has-specimen' : 'is-empty'
            }`}
            id="work-inspection-panel"
          >
            <div className="inspection-bench-topline" aria-hidden="true">
              <span>Inspection plate</span>
              <span>{inspectedProject ? `0${inspectedIndex + 1}` : '—'}</span>
            </div>

            <div className="inspection-plate">
              <span className="inspection-ring inspection-ring-outer" aria-hidden="true" />
              <span className="inspection-ring inspection-ring-inner" aria-hidden="true" />
              <span className="inspection-axis inspection-axis-x" aria-hidden="true" />
              <span className="inspection-axis inspection-axis-y" aria-hidden="true" />
              <span className="inspection-plate-node" aria-hidden="true" />

              {inspectedProject ? (
                <div
                  key={inspectedProject.id}
                  className={`inspection-specimen inspection-specimen-from-${inspectionSide}`}
                >
                  <div className="inspection-slide">
                    <img
                      src={inspectedProject.cardImage ?? inspectedProject.image}
                      alt={inspectedProject.imageAlt ?? `${inspectedProject.title} preview`}
                      decoding="async"
                      onError={(event) =>
                        handleSpecimenImageError(event, inspectedProject)
                      }
                      style={{
                        objectFit: inspectedProject.imageFit ?? 'cover',
                        objectPosition:
                          inspectedProject.imagePosition ?? 'center top',
                      }}
                    />
                    <span className="inspection-slide-corner inspection-slide-corner-a" aria-hidden="true" />
                    <span className="inspection-slide-corner inspection-slide-corner-b" aria-hidden="true" />
                  </div>
                </div>
              ) : (
                <div className="inspection-empty-state">
                  <span className="inspection-empty-cross" aria-hidden="true">
                    +
                  </span>
                  <strong>Select a specimen</strong>
                  <span>Choose a project from either archive rack to inspect it here.</span>
                </div>
              )}
            </div>

            <div className="inspection-meta" aria-live="polite">
              {inspectedProject ? (
                <>
                  <div className="inspection-meta-heading">
                    <span className="inspection-meta-index">
                      {String(inspectedIndex + 1).padStart(2, '0')}
                    </span>
                    <span className="inspection-meta-year">
                      {inspectedProject.year}
                    </span>
                  </div>
                  <h3>{inspectedProject.title}</h3>
                  <p className="inspection-meta-category">
                    {inspectedProject.category}
                  </p>
                  <p className="inspection-meta-description">
                    {inspectedProject.description}
                  </p>
                  <button
                    className="inspection-open"
                    type="button"
                    onClick={() => setSelectedProject(inspectedProject)}
                  >
                    Open specimen file <span aria-hidden="true">↗</span>
                  </button>
                </>
              ) : (
                <p className="inspection-idle-note">
                  Hover to browse. Select a project to move it onto the inspection plate.
                </p>
              )}
            </div>
          </div>

          <aside className="specimen-rack specimen-rack-right" aria-label="Project specimens 4 to 6">
            <span className="specimen-rack-label" aria-hidden="true">
              Archive B
            </span>
            <span className="specimen-rack-rail" aria-hidden="true" />

            {projects.slice(3).map((project, localIndex) => {
              const index = localIndex + 3

              return (
                <SpecimenCard
                  key={project.id}
                  project={project}
                  index={index}
                  side="right"
                  isSelected={inspectedIndex === index}
                  onSelect={setInspectedIndex}
                />
              )
            })}
          </aside>
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
