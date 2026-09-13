import { useEffect, useState } from 'react'
import projects from '../data/projects.js'
import '../projects.css'
import '../selected-work-motion.css'
import '../selected-work-inspection-polish.css'
import '../selected-work-specimen-record.css'
import ProjectModal from './ProjectModal.jsx'

function handleSpecimenImageError(event, project) {
  if (!project.fallbackImage) return

  event.currentTarget.onerror = null
  event.currentTarget.src = project.fallbackImage
}

function SpecimenCard({ project, index, side, isSelected, onSelect }) {
  const projectNumber = String(index + 1).padStart(2, '0')
  const inspectLabel = side === 'left' ? 'Inspect →' : '← Inspect'

  return (
    <button
      className={`specimen-card specimen-card-${side} ${
        isSelected ? 'is-selected' : ''
      }`}
      type="button"
      onClick={() => onSelect(index)}
      aria-label={`Inspect ${projectNumber} ${project.title}`}
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
            objectFit: 'cover',
            objectPosition: project.imagePosition ?? 'center top',
          }}
        />
      </span>

      <span className="specimen-card-copy">
        <span className="specimen-card-index">{projectNumber}</span>
        <span className="specimen-card-title">{project.title}</span>
        <span className="specimen-card-year">{project.year}</span>
        <span className="specimen-card-action" aria-hidden="true">
          {inspectLabel}
        </span>
      </span>

      <span className="specimen-card-node" aria-hidden="true" />
    </button>
  )
}

function InspectionPreview({ project }) {
  const inspectionObjectFit =
    project.id === 'orange-engineers' ? 'cover' : project.imageFit ?? 'cover'

  const slide = (
    <div className="inspection-slide">
      <img
        src={project.cardImage ?? project.image}
        alt={project.imageAlt ?? `${project.title} preview`}
        decoding="async"
        onError={(event) => handleSpecimenImageError(event, project)}
        style={{
          objectFit: inspectionObjectFit,
          objectPosition:
            project.id === 'orange-engineers'
              ? 'center center'
              : project.imagePosition ?? 'center top',
        }}
      />
      <span
        className="inspection-slide-corner inspection-slide-corner-a"
        aria-hidden="true"
      />
      <span
        className="inspection-slide-corner inspection-slide-corner-b"
        aria-hidden="true"
      />
      {project.link && (
        <span className="inspection-live-preview-cue" aria-hidden="true">
          {project.linkLabel ?? 'View live'} <span>↗</span>
        </span>
      )}
    </div>
  )

  if (!project.link) return slide

  return (
    <a
      className="inspection-live-preview"
      href={project.link}
      target="_blank"
      rel="noreferrer"
      aria-label={`${project.linkLabel ?? 'Open live project'}: ${project.title} (opens in a new tab)`}
    >
      {slide}
    </a>
  )
}

function Projects() {
  const [selectedProject, setSelectedProject] = useState(null)
  const [inspectedIndex, setInspectedIndex] = useState(null)

  useEffect(() => {
    const resetInspection = () => {
      setInspectedIndex(null)
      setSelectedProject(null)
    }

    window.addEventListener('keana:work-arrival', resetInspection)

    return () => {
      window.removeEventListener('keana:work-arrival', resetInspection)
    }
  }, [])

  const inspectedProject =
    inspectedIndex === null ? null : projects[inspectedIndex]
  const inspectionSide =
    inspectedIndex === null ? null : inspectedIndex < 3 ? 'left' : 'right'
  const inspectionNumber =
    inspectedIndex === null ? null : String(inspectedIndex + 1).padStart(2, '0')

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
          <aside
            className="specimen-rack specimen-rack-left"
            aria-label="Project specimens 1 to 3"
          >
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
              <span>
                {inspectionNumber
                  ? `${inspectionNumber} / selected specimen`
                  : 'Awaiting specimen'}
              </span>
            </div>

            <div className="inspection-plate">
              <span
                className="inspection-ring inspection-ring-outer"
                aria-hidden="true"
              />
              <span
                className="inspection-ring inspection-ring-inner"
                aria-hidden="true"
              />
              <span
                className="inspection-axis inspection-axis-x"
                aria-hidden="true"
              />
              <span
                className="inspection-axis inspection-axis-y"
                aria-hidden="true"
              />
              <span className="inspection-plate-node" aria-hidden="true" />

              {inspectedProject ? (
                <div
                  key={inspectedProject.id}
                  className={`inspection-record inspection-record-from-${inspectionSide}`}
                  aria-live="polite"
                >
                  <header className="inspection-record-head">
                    <h3>{inspectedProject.title}</h3>
                    <span className="inspection-record-year">
                      {inspectedProject.year}
                    </span>
                  </header>

                  <div
                    className={`inspection-specimen inspection-specimen-from-${inspectionSide}`}
                  >
                    <InspectionPreview project={inspectedProject} />
                  </div>

                  <div className="inspection-record-body">
                    <p className="inspection-meta-category">
                      {inspectedProject.category}
                    </p>

                    <div className="inspection-actions">
                      {inspectedProject.link && (
                        <a
                          className="inspection-action inspection-action-live"
                          href={inspectedProject.link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {inspectedProject.linkLabel ?? 'View live'}
                          <span aria-hidden="true">↗</span>
                        </a>
                      )}

                      <button
                        className="inspection-action inspection-action-details"
                        type="button"
                        onClick={() => setSelectedProject(inspectedProject)}
                      >
                        Inspect details <span aria-hidden="true">+</span>
                      </button>
                    </div>

                    {!inspectedProject.link && (
                      <p className="inspection-unavailable">
                        {inspectedProject.liveStatus ??
                          'No public build available yet.'}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="inspection-empty-state">
                  <span className="inspection-empty-cross" aria-hidden="true">
                    +
                  </span>
                  <strong>Select a specimen</strong>
                  <span>
                    Choose a project from either archive rack to inspect it here.
                  </span>
                </div>
              )}
            </div>
          </div>

          <aside
            className="specimen-rack specimen-rack-right"
            aria-label="Project specimens 4 to 6"
          >
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
