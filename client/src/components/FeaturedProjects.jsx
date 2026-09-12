import React, { useState, useEffect } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import './FeaturedProjects.css';

// Default initial/fallback projects data
const initialProjects = [
  {
    id: 'construction-management-system',
    numericId: 1,
    title: 'Construction Management System',
    description: 'Full-stack web application to manage projects, bids, clients and employees.',
    tags: ['React', 'Node.js', 'MySQL', 'JWT'],
    image: '/images/02_construction_project.png'
  },
  {
    id: 'taskflow',
    numericId: 2,
    title: 'TaskFlow',
    description: 'A productivity app to organize your tasks and stay on track.',
    tags: ['React', 'Express.js', 'MySQL'],
    image: '/images/project_taskflow.png'
  },
  {
    id: 'travel-explorer',
    numericId: 3,
    title: 'Travel Explorer',
    description: 'A travel website to discover and explore amazing destinations.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    image: '/images/project_travel.png'
  }
];

const FeaturedProjects = ({ onSelectProject }) => {
  const [projects, setProjects] = useState(initialProjects);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/projects');
        const data = await res.json();
        if (res.ok && data.success && data.data && data.data.length > 0) {
          setProjects(data.data);
        }
      } catch (err) {
        console.warn('Could not fetch projects via proxy, checking port 5000:', err);
        try {
          const fallbackRes = await fetch('http://localhost:5000/api/projects');
          const fallbackData = await fallbackRes.json();
          if (fallbackRes.ok && fallbackData.success && fallbackData.data) {
            setProjects(fallbackData.data);
          }
        } catch (fErr) {
          console.error('Failed to load projects from backend, using initial cache:', fErr);
        }
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
