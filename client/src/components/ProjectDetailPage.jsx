import React, { useState, useEffect } from 'react';
import './ProjectDetailPage.css';
import { 
  SiReact, SiNodedotjs, SiMysql, SiJsonwebtokens, 
  SiHtml5, SiCss, SiExpress, SiGit, SiJavascript 
} from 'react-icons/si';
import { FaGithub, FaCheckCircle, FaArrowLeft, FaExternalLinkAlt } from 'react-icons/fa';
import { useSettings } from '../context/SettingsContext.jsx';

// Map icon names from backend JSON to React components
const renderTechIcon = (iconName, color) => {
  const iconProps = { size: 28, color: color || '#60a5fa' };
  switch (iconName) {
    case 'SiReact':
      return <SiReact {...iconProps} />;
    case 'SiNodedotjs':
      return <SiNodedotjs {...iconProps} />;
    case 'SiMysql':
      return <SiMysql {...iconProps} />;
    case 'SiJsonwebtokens':
      return <SiJsonwebtokens {...iconProps} />;
    case 'SiHtml5':
      return <SiHtml5 {...iconProps} />;
    case 'SiCss':
      return <SiCss {...iconProps} />;
    case 'SiExpress':
      return <SiExpress {...iconProps} />;
    case 'SiGit':
      return <SiGit {...iconProps} />;
    case 'SiJavascript':
      return <SiJavascript {...iconProps} />;
    default:
      return <span style={{ color: color || '#38bdf8', fontWeight: 'bold' }}>&lt;/&gt;</span>;
  }
};

const ProjectDetailPage = ({ projectId, onNavigate }) => {
  const { settings } = useSettings();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);
      setError(null);
      const targetId = projectId || 'construction-management-system';

      try {
        const res = await fetch(`/api/projects/${targetId}`);
        const data = await res.json();

        if (res.ok && data.success && data.data) {
          setProject(data.data);
          setActiveImage(data.data.image || (data.data.gallery && data.data.gallery[0]?.full) || '');
        } else {
          // Fallback to direct port 5000 if needed
          const fallbackRes = await fetch(`http://localhost:5000/api/projects/${targetId}`);
          const fallbackData = await fallbackRes.json();
          if (fallbackRes.ok && fallbackData.success) {
            setProject(fallbackData.data);
            setActiveImage(fallbackData.data.image || '');
          } else {
            setError(data.message || 'Project not found');
          }
        }
      } catch (err) {
        console.error('Error loading project details:', err);
        setError('Failed to fetch project details from backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [projectId]);

  if (loading) {
    return (
      <div className="project-detail-page">
        <div className="project-detail-container">
          <div className="detail-loading-box">
            <div className="loading-spinner"></div>
            <p>// LOADING PROJECT DATA FROM BACKEND...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-detail-page">
        <div className="project-detail-container">
          <button 
            type="button" 
            className="back-to-projects-btn" 
            onClick={() => onNavigate('home', 'projects')}
          >
            <FaArrowLeft /> Back to Projects
          </button>
          <div className="detail-error-box">
            <h3>⚠ Project Not Found</h3>
            <p>{error || 'The requested project could not be retrieved.'}</p>
            <button 
              type="button" 
              className="error-return-btn" 
              onClick={() => onNavigate('home', 'projects')}
            >
              Return to Featured Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="project-detail-page">
      <div className="project-detail-container">
        
        {/* Top Back navigation */}
        <button 
          type="button" 
          className="back-to-projects-btn"
          onClick={() => onNavigate('home', 'projects')}
        >
          <FaArrowLeft className="back-arrow-icon" />
          <span>Back to Projects</span>
        </button>

        {/* TOP SECTION: Showcase Image (left) + Project Info (right) */}
        <div className="project-main-grid">
          
          {/* Left: Main Image Preview & Thumbnail Gallery */}
          <div className="project-gallery-col">
            <div className="main-preview-frame">
              <img 
                src={activeImage || project.image} 
                alt={project.title} 
                className="main-preview-img" 
              />
            </div>

            {project.gallery && project.gallery.length > 0 && (
              <div className="thumbnail-gallery-row">
                {project.gallery.map((item, index) => {
                  const isActive = (activeImage === item.full) || (!activeImage && index === 0);
                  return (
                    <button
                      key={item.id || index}
                      type="button"
                      className={`thumbnail-btn ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveImage(item.full)}
                      title={item.title || `Thumbnail ${index + 1}`}
                    >
                      <img 
                        src={item.thumb || item.full} 
                        alt={item.title || `Thumbnail ${index + 1}`} 
                        className="thumb-img" 
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Title, Description, Tags, Action Buttons */}
          <div className="project-summary-col">
            <h1 className="project-detail-title">{project.title}</h1>
            
            <p className="project-detail-desc">
              {project.fullDescription || project.shortDescription}
            </p>

            {/* Tags row */}
            {project.tags && (
              <div className="project-detail-tags">
                {project.tags.map((tag, i) => (
                  <span key={i} className="detail-tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons: Live Demo & View Code */}
            <div className="project-actions-row">
              <a 
                href={project.liveDemoUrl || '#'} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-live-demo"
              >
                <span>Live Demo</span>
                <span className="btn-arrow">&rarr;</span>
              </a>

              <a 
                href={project.githubUrl || settings.github_url || 'https://github.com'} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-view-code"
              >
                <FaGithub className="btn-github-icon" />
                <span>View Code</span>
                <span className="btn-arrow">&rarr;</span>
              </a>
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION: Key Features (left) + Tech Stack (right) */}
        <div className="project-specs-grid">
          
          {/* Left: Key Features */}
          <div className="key-features-card">
            <h2 className="specs-section-title">Key Features</h2>
            
            <ul className="features-checklist">
              {project.features && project.features.map((feat, idx) => (
                <li key={idx} className="feature-check-item">
                  <FaCheckCircle className="feature-check-icon" />
                  <span className="feature-check-text">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Tech Stack */}
          <div className="tech-stack-card">
            <h2 className="specs-section-title coral-title">Tech Stack</h2>
            
            <div className="tech-stack-grid">
              {project.techStack && project.techStack.map((tech, idx) => (
                <div key={idx} className="tech-badge-item">
                  <div className="tech-badge-icon">
                    {renderTechIcon(tech.icon, tech.color)}
                  </div>
                  <span className="tech-badge-name">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProjectDetailPage;
