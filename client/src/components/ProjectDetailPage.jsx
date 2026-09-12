import React, { useState, useEffect } from 'react';
import './ProjectDetailPage.css';
import { apiUrl } from '../utils/api';
import { 
  SiReact, 
  SiNodedotjs, 
  SiMysql, 
  SiJsonwebtokens, 
  SiHtml5, 
  SiCss, 
  SiExpress, 
  SiGit, 
  SiJavascript,
  SiTypescript,
  SiNextdotjs,
  SiTailwindcss,
  SiMongodb,
  SiPostgresql,
  SiPython,
  SiDocker,
  SiFirebase,
  SiBootstrap,
  SiVite
} from 'react-icons/si';
import { 
  FaGithub, 
  FaCheckCircle, 
  FaArrowLeft, 
  FaExternalLinkAlt, 
  FaJava, 
  FaCode, 
  FaDatabase, 
  FaServer, 
  FaRobot, 
  FaMicrophone,
  FaAws
} from 'react-icons/fa';
import { useSettings } from '../context/SettingsContext.jsx';

// Dynamic smart mapper for any technology name or icon identifier
const renderTechIcon = (techIdentifier, customColor) => {
  const size = 28;
  const str = String(techIdentifier || '').toLowerCase().trim();

  if (str.includes('next')) return <SiNextdotjs size={size} color={customColor || '#ffffff'} />;
  if (str.includes('react')) return <SiReact size={size} color={customColor || '#61dafb'} />;
  if (str.includes('typescript') || str === 'ts') return <SiTypescript size={size} color={customColor || '#3178c6'} />;
  if (str.includes('javascript') || str === 'js') return <SiJavascript size={size} color={customColor || '#f7df1e'} />;
  if (str.includes('node')) return <SiNodedotjs size={size} color={customColor || '#68a063'} />;
  if (str.includes('express')) return <SiExpress size={size} color={customColor || '#ffffff'} />;
  if (str.includes('mysql')) return <SiMysql size={size} color={customColor || '#4479a1'} />;
  if (str.includes('mongo')) return <SiMongodb size={size} color={customColor || '#47a248'} />;
  if (str.includes('postgres')) return <SiPostgresql size={size} color={customColor || '#4169e1'} />;
  if (str.includes('tailwind')) return <SiTailwindcss size={size} color={customColor || '#38bdf8'} />;
  if (str.includes('html')) return <SiHtml5 size={size} color={customColor || '#e34f26'} />;
  if (str.includes('css')) return <SiCss size={size} color={customColor || '#1572b6'} />;
  if (str.includes('jwt') || str.includes('token') || str.includes('auth')) return <SiJsonwebtokens size={size} color={customColor || '#d63aff'} />;
  if (str.includes('git') && !str.includes('github')) return <SiGit size={size} color={customColor || '#f05032'} />;
  if (str.includes('github')) return <FaGithub size={size} color={customColor || '#ffffff'} />;
  if (str.includes('python')) return <SiPython size={size} color={customColor || '#3776ab'} />;
  if (str.includes('java') && !str.includes('script')) return <FaJava size={size} color={customColor || '#f89820'} />;
  if (str.includes('docker')) return <SiDocker size={size} color={customColor || '#2496ed'} />;
  if (str.includes('firebase')) return <SiFirebase size={size} color={customColor || '#ffca28'} />;
  if (str.includes('openai') || str.includes('gpt') || str.includes('llm') || str.includes('ai')) return <FaRobot size={size} color={customColor || '#10a37f'} />;
  if (str.includes('voice') || str.includes('speech') || str.includes('audio')) return <FaMicrophone size={size} color={customColor || '#a855f7'} />;
  if (str.includes('bootstrap')) return <SiBootstrap size={size} color={customColor || '#7952b3'} />;
  if (str.includes('aws')) return <FaAws size={size} color={customColor || '#ff9900'} />;
  if (str.includes('vite')) return <SiVite size={size} color={customColor || '#bd34fe'} />;
  if (str.includes('database') || str.includes('db')) return <FaDatabase size={size} color={customColor || '#38bdf8'} />;
  if (str.includes('api') || str.includes('backend') || str.includes('server')) return <FaServer size={size} color={customColor || '#34d399'} />;

  return <FaCode size={size} color={customColor || '#38bdf8'} />;
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
        const res = await fetch(apiUrl(`/api/projects/${targetId}`));
        const data = await res.json();

        if (res.ok && data.success && data.data) {
          setProject(data.data);
          setActiveImage(data.data.image || (data.data.gallery && data.data.gallery[0]?.full) || '');
        } else {
          setError(data.message || 'Project not found');
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

  // Smart resolution for Tech Stack (handles empty arrays, tags fallback, string arrays)
  const resolveTechStack = () => {
    if (Array.isArray(project.techStack) && project.techStack.length > 0) {
      return project.techStack.map(item => {
        if (typeof item === 'string') {
          return { name: item, icon: item };
        }
        return {
          name: item.name || item.title || 'Tech',
          icon: item.icon || item.name || 'Tech',
          color: item.color
        };
      });
    }

    // Fallback: build from tags if techStack is empty
    if (Array.isArray(project.tags) && project.tags.length > 0) {
      return project.tags.map(tag => ({
        name: tag,
        icon: tag
      }));
    }

    // Default fallback
    return [
      { name: 'React', icon: 'React' },
      { name: 'Node.js', icon: 'Node.js' },
      { name: 'JavaScript', icon: 'JavaScript' },
      { name: 'REST APIs', icon: 'API' }
    ];
  };

  // Smart resolution for Key Features (handles empty arrays, auto-extracts highlights)
  const resolveFeatures = () => {
    if (Array.isArray(project.features) && project.features.length > 0) {
      return project.features;
    }

    // Check if description has bullet points or lines
    const desc = project.fullDescription || project.shortDescription || '';
    if (desc.includes('\n') || desc.includes('•') || desc.includes('- ')) {
      const lines = desc
        .split('\n')
        .map(l => l.trim().replace(/^[-*•\d.]+\s*/, ''))
        .filter(l => l.length > 15);
      if (lines.length >= 2) {
        return lines.slice(0, 6);
      }
    }

    // Split descriptive sentences
    const sentences = desc
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 20);

    if (sentences.length >= 2) {
      return sentences.slice(0, 5);
    }

    // Smart contextual fallbacks tailored to project
    const isAiOrVoice = (project.title + ' ' + desc).toLowerCase().includes('ai') || 
                        (project.title + ' ' + desc).toLowerCase().includes('voice');

    if (isAiOrVoice) {
      return [
        'AI-driven natural voice command interaction and intelligent response generation',
        'Real-time health telemetry & vitals tracking with responsive analytics',
        'Personalized smart recommendations and automated assistance workflows',
        'Modern responsive web client designed for accessibility and speed'
      ];
    }

    return [
      'Interactive, responsive user interface built with modern component architecture',
      'Optimized backend services with secure RESTful endpoints & data validation',
      'Reliable database persistence with structured relational modeling',
      'Clean modular codebase with high performance, scalability, and security'
    ];
  };

  const finalTechStack = resolveTechStack();
  const finalFeatures = resolveFeatures();

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
            {project.tags && project.tags.length > 0 && (
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
              {project.liveDemoUrl && (
                <a 
                  href={project.liveDemoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-live-demo"
                >
                  <span>Live Demo</span>
                  <span className="btn-arrow">&rarr;</span>
                </a>
              )}

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
              {finalFeatures.map((feat, idx) => (
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
              {finalTechStack.map((tech, idx) => (
                <div key={idx} className="tech-badge-item">
                  <div className="tech-badge-icon">
                    {renderTechIcon(tech.icon || tech.name, tech.color)}
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
