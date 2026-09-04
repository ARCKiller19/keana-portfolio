function ProjectCard({ project, index }) {
    return (
      <article className="project-card">
        <span className="project-index">
          {String(index + 1).padStart(2, '0')}
        </span>
  
        <a
          className="project-frame"
          href={project.link}
          target="_blank"
          rel="noreferrer"
        >
          <img src={project.image} alt={`${project.title} preview`} />
        </a>
  
        <div className="project-info">
          <h3>{project.title}</h3>
  
          <p className="project-category">
            {project.category}
          </p>
  
          <div className="project-foot">
            <span className="project-year">
              {project.year}
            </span>
  
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
            >
              {project.linkLabel}
              <span aria-hidden="true"> ↗</span>
            </a>
          </div>
        </div>
      </article>
    )
  }
  
  export default ProjectCard