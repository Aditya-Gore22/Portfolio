import React, { useState, useEffect } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import './FeaturedProjects.css';
import { apiUrl } from '../utils/api';

const FeaturedProjects = ({ onSelectProject }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await fetch(apiUrl('/api/projects'));
        const data = await res.json();
        if (res.ok && data.success && data.data && data.data.length > 0) {
          setProjects(data.data);
        }
      } catch (err) {
        console.error('Error loading projects from backend:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleCardClick = (projectId) => {
    if (onSelectProject) {
      onSelectProject(projectId);
    }
  };

  return (
    <section id="projects" className="featured-projects-section">
      <div className="projects-container">
        <div className="projects-header-wrapper">
          <div className="projects-header-left">
            <h2 className="projects-title">
              <img src="/images/controller_icon.png" alt="" className="gamepad-icon" />
              FEATURED PROJECTS
            </h2>
            <p className="projects-subtitle">Some of the games (well, websites) I've built on my journey.</p>
          </div>
          <button 
            type="button" 
            className="view-all-link"
            onClick={() => handleCardClick(projects[0]?.id || 'construction-management-system')}
          >
            View All Projects &rarr;
          </button>
        </div>

        <div className="projects-grid">
          {projects.length === 0 && !loading && (
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 0', gridColumn: '1 / -1', fontFamily: 'var(--font-mono, monospace)' }}>
              No projects published yet.
            </div>
          )}
          {projects.map((project) => (
            <div 
              className="project-card" 
              key={project.id}
              onClick={() => handleCardClick(project.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCardClick(project.id); }}
            >
              <div className="project-image-container">
                <img 
                  src={project.image || '/images/02_construction_project.png'} 
                  alt={project.title} 
                  className="project-image" 
                />
              </div>

              <div className="project-content">
                <div className="project-title-row">
                  <h3 className="project-card-title">{project.title}</h3>
                  <span className="project-external-link" title="View Project Details">
                    <FiExternalLink />
                  </span>
                </div>
                <p className="project-description">
                  {project.shortDescription || project.description}
                </p>
                <div className="project-tags">
                  {project.tags && project.tags.map((tag, index) => (
                    <span key={index} className="project-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
