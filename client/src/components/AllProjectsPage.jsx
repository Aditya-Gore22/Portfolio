import React, { useState, useEffect, useMemo, useRef } from 'react';
import './AllProjectsPage.css';
import GameLoader from './GameLoader';
import { apiUrl, resolveImageUrl } from '../utils/api';
import { useSettings } from '../context/SettingsContext.jsx';
import { 
  FiSearch, 
  FiExternalLink, 
  FiChevronLeft, 
  FiChevronRight, 
  FiArrowRight, 
  FiSliders,
  FiX
} from 'react-icons/fi';
import { FaGithub } from 'react-icons/fa';

// Smart tag style mapper for distinct badge colors matching the design
const getTagStyle = (tag) => {
  const t = String(tag || '').toLowerCase().trim();
  
  if (t.includes('react')) {
    return { bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.35)', color: '#38bdf8' };
  }
  if (t.includes('node')) {
    return { bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.35)', color: '#4ade80' };
  }
  if (t.includes('express')) {
    return { bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.35)', color: '#cbd5e1' };
  }
  if (t.includes('mysql')) {
    return { bg: 'rgba(14, 165, 233, 0.12)', border: 'rgba(14, 165, 233, 0.35)', color: '#38bdf8' };
  }
  if (t.includes('html')) {
    return { bg: 'rgba(249, 115, 22, 0.12)', border: 'rgba(249, 115, 22, 0.35)', color: '#fb923c' };
  }
  if (t.includes('css')) {
    return { bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.35)', color: '#60a5fa' };
  }
  if (t.includes('javascript') || t === 'js') {
    return { bg: 'rgba(234, 179, 8, 0.12)', border: 'rgba(234, 179, 8, 0.35)', color: '#facc15' };
  }
  if (t.includes('typescript') || t === 'ts') {
    return { bg: 'rgba(96, 165, 250, 0.12)', border: 'rgba(96, 165, 250, 0.35)', color: '#93c5fd' };
  }
  if (t.includes('next')) {
    return { bg: 'rgba(20, 184, 166, 0.12)', border: 'rgba(20, 184, 166, 0.35)', color: '#2dd4bf' };
  }
  if (t.includes('postgres')) {
    return { bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.35)', color: '#818cf8' };
  }
  if (t.includes('gemini') || t.includes('ai') || t.includes('gpt')) {
    return { bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.35)', color: '#c084fc' };
  }
  if (t.includes('php')) {
    return { bg: 'rgba(129, 140, 248, 0.12)', border: 'rgba(129, 140, 248, 0.35)', color: '#a5b4fc' };
  }
  if (t.includes('tailwind')) {
    return { bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.35)', color: '#22d3ee' };
  }
  if (t.includes('framer') || t.includes('motion')) {
    return { bg: 'rgba(236, 72, 153, 0.12)', border: 'rgba(236, 72, 153, 0.35)', color: '#f472b6' };
  }
  if (t.includes('python')) {
    return { bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.35)', color: '#38bdf8' };
  }
  if (t.includes('jwt') || t.includes('auth')) {
    return { bg: 'rgba(217, 70, 239, 0.12)', border: 'rgba(217, 70, 239, 0.35)', color: '#e879f9' };
  }

  // Fallback for any other technology
  return { bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.25)', color: '#94a3b8' };
};

const ITEMS_PER_PAGE = 6;

const AllProjectsPage = ({ onSelectProject, onNavigate }) => {
  const { settings } = useSettings();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Controls state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const sortDropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fetch projects from the database via /api/projects
  useEffect(() => {
    const fetchDbProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(apiUrl('/api/projects'));
        const json = await res.json();
        
        if (res.ok && json.success && Array.isArray(json.data)) {
          setProjects(json.data);
        } else {
          setError(json.message || 'Failed to load projects from database.');
        }
      } catch (err) {
        console.error('Error fetching projects from database:', err);
        setError('Could not connect to database server.');
      } finally {
        setLoading(false);
      }
    };

    fetchDbProjects();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter and sort database projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const titleMatch = (p.title || '').toLowerCase().includes(q);
        const descMatch = (p.shortDescription || p.fullDescription || '').toLowerCase().includes(q);
        const catMatch = (p.category || '').toLowerCase().includes(q);
        const tagsMatch = Array.isArray(p.tags) && p.tags.some(t => String(t).toLowerCase().includes(q));
        const techMatch = Array.isArray(p.techStack) && p.techStack.some(t => {
          const name = typeof t === 'string' ? t : (t?.name || '');
          return name.toLowerCase().includes(q);
        });
        return titleMatch || descMatch || catMatch || tagsMatch || techMatch;
      });
    }

    // Sort projects
    result.sort((a, b) => {
      if (sortBy === 'latest') {
        const idA = a.numericId || 0;
        const idB = b.numericId || 0;
        return idB - idA;
      }
      if (sortBy === 'oldest') {
        const idA = a.numericId || 0;
        const idB = b.numericId || 0;
        return idA - idB;
      }
      if (sortBy === 'alpha-asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'alpha-desc') {
        return (b.title || '').localeCompare(a.title || '');
      }
      return 0;
    });

    return result;
  }, [projects, searchQuery, sortBy]);

  // Reset page when search query or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE));
  const displayedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const handleProjectClick = (projectId) => {
    if (onSelectProject) {
      onSelectProject(projectId);
    } else if (onNavigate) {
      onNavigate('project-detail', projectId);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      const grid = document.getElementById('projects-grid-anchor');
      if (grid) {
        grid.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const sortLabels = {
    'latest': 'Latest First',
    'oldest': 'Oldest First',
    'alpha-asc': 'Name (A – Z)',
    'alpha-desc': 'Name (Z – A)',
  };

  const adminName = settings.admin_name || 'Aditya Gore';
  const adminQuote = settings.admin_quote || 'Build. Break. Learn. Repeat.';

  return (
    <div className="all-projects-page">
      {/* Mobile Ambient Background Backdrop */}
      <div className="all-projects-bg-backdrop" aria-hidden="true"></div>

      {/* Hero Header Section */}
      <section className="all-projects-hero">
        <div className="hero-bg-overlay"></div>
        <div className="hero-bg-art"></div>

        <div className="all-projects-hero-container">
          <div className="hero-left-content">
            <span className="hero-tag-prefix">// PROJECTS</span>
            <h1 className="hero-pixel-title">ALL PROJECTS</h1>
            <p className="hero-subtitle">
              A collection of ideas, experiments, and real-world applications built with passion and curiosity.
            </p>
          </div>

          <div className="hero-right-quote-card">
            <div className="quote-glow-border"></div>
            <div className="quote-card-content">
              <span className="quote-mark">“</span>
              <p className="quote-text">
                “{adminQuote.replace(/^[“"]|[”"]$/g, '')}”
              </p>
              <div className="quote-author-row">
                <span className="quote-author">— {adminName}</span>
                <img 
                  src="/images/controller_icon.png" 
                  alt="Gamer" 
                  className="quote-controller-icon" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Grid */}
      <main className="all-projects-main">
        <div className="all-projects-container" id="projects-grid-anchor">
          
          {/* Controls Bar: Search & Sort */}
          <div className="projects-controls-bar">
            <div className="search-box-wrapper">
              <FiSearch className="search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="search-input"
                placeholder="Search projects (e.g. React, AI)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className="search-clear-btn" 
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>

            <div className="sort-dropdown-wrapper" ref={sortDropdownRef}>
              <button
                type="button"
                className={`sort-trigger-btn ${isSortOpen ? 'open' : ''}`}
                onClick={() => setIsSortOpen(!isSortOpen)}
                aria-haspopup="listbox"
                aria-expanded={isSortOpen}
              >
                <FiSliders className="sort-icon" />
                <span className="sort-label">{sortLabels[sortBy]}</span>
                <span className="sort-arrow">▾</span>
              </button>

              {isSortOpen && (
                <div className="sort-menu" role="listbox">
                  {Object.entries(sortLabels).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className={`sort-menu-item ${sortBy === key ? 'active' : ''}`}
                      onClick={() => {
                        setSortBy(key);
                        setIsSortOpen(false);
                      }}
                      role="option"
                      aria-selected={sortBy === key}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <GameLoader 
              message="RETRIEVING DATABASE PROJECTS..." 
              subtitle="Querying mission records, tech tags, and case studies..." 
              minHeight="380px"
            />
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="projects-error-state">
              <p className="error-title">⚠ DATABASE CONNECTION ISSUE</p>
              <p className="error-desc">{error}</p>
            </div>
          )}

          {/* Empty Search / Filter State */}
          {!loading && !error && filteredProjects.length === 0 && (
            <div className="projects-empty-state">
              <img src="/images/controller_icon.png" alt="" className="empty-gamepad" />
              <h3>NO PROJECTS FOUND</h3>
              <p>
                {searchQuery 
                  ? `No database projects match "${searchQuery}".` 
                  : 'No projects are currently published in the database.'}
              </p>
              {searchQuery && (
                <button 
                  type="button" 
                  className="reset-search-btn"
                  onClick={() => setSearchQuery('')}
                >
                  Reset Filter
                </button>
              )}
            </div>
          )}

          {/* Projects Grid */}
          {!loading && !error && displayedProjects.length > 0 && (
            <div className="projects-card-grid">
              {displayedProjects.map((project) => {
                const tags = Array.isArray(project.tags) ? project.tags : [];
                const projectId = project.slug || project.id;
                
                return (
                  <article 
                    key={project.id || project.slug} 
                    className="project-grid-card"
                  >
                    {/* Thumbnail Image */}
                    <div 
                      className="card-image-wrap"
                      onClick={() => handleProjectClick(projectId)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleProjectClick(projectId); }}
                    >
                      <img
                        src={resolveImageUrl(project.image)}
                        alt={project.title}
                        className="card-thumbnail"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/02_construction_project.png';
                        }}
                      />
                      <div className="card-image-overlay"></div>
                    </div>

                    {/* Card Body */}
                    <div className="card-body">
                      {/* Title & External Link */}
                      <div className="card-title-row">
                        <h2 
                          className="card-title"
                          onClick={() => handleProjectClick(projectId)}
                          title={project.title}
                        >
                          {project.title}
                        </h2>
                        <button
                          type="button"
                          className="card-header-link"
                          onClick={() => handleProjectClick(projectId)}
                          title="View project details"
                          aria-label="View project details"
                        >
                          <FiExternalLink />
                        </button>
                      </div>

                      {/* Description */}
                      <p className="card-description">
                        {project.shortDescription || project.fullDescription || 'No description provided.'}
                      </p>

                      {/* Tech Stack Tags */}
                      {tags.length > 0 && (
                        <div className="card-tags-list">
                          {tags.map((tag, idx) => {
                            const style = getTagStyle(tag);
                            return (
                              <span
                                key={idx}
                                className="tag-pill"
                                style={{
                                  backgroundColor: style.bg,
                                  borderColor: style.border,
                                  color: style.color
                                }}
                              >
                                {tag}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Code, Live Demo, Details Arrow */}
                    <div className="card-footer">
                      <div className="card-footer-links">
                        {project.githubUrl ? (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="card-action-link"
                            title="View source code on GitHub"
                          >
                            <FaGithub className="link-icon" />
                            <span>Code</span>
                          </a>
                        ) : (
                          <span className="card-action-link disabled" title="Code not public">
                            <FaGithub className="link-icon" />
                            <span>Code</span>
                          </span>
                        )}

                        {project.liveDemoUrl ? (
                          <a
                            href={project.liveDemoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="card-action-link live-link"
                            title="Open live demonstration"
                          >
                            <FiExternalLink className="link-icon" />
                            <span>Live Demo</span>
                          </a>
                        ) : (
                          <button
                            type="button"
                            className="card-action-link live-link"
                            onClick={() => handleProjectClick(projectId)}
                            title="View project details"
                          >
                            <FiExternalLink className="link-icon" />
                            <span>Live Demo</span>
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        className="card-detail-arrow"
                        onClick={() => handleProjectClick(projectId)}
                        title="View Full Case Study"
                        aria-label="View Full Case Study"
                      >
                        <FiArrowRight />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && !error && totalPages > 1 && (
            <nav className="pagination-bar" aria-label="Projects pagination">
              <button
                type="button"
                className="pagination-btn arrow-btn"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                aria-label="Previous page"
              >
                <FiChevronLeft />
              </button>

              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`pagination-btn page-num ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                    aria-current={currentPage === pageNum ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="pagination-btn arrow-btn"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                aria-label="Next page"
              >
                <FiChevronRight />
              </button>
            </nav>
          )}

        </div>
      </main>
    </div>
  );
};

export default AllProjectsPage;
