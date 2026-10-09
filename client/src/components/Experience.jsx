import React, { useState, useEffect } from 'react';
import './Experience.css';
import { FaCalendarAlt, FaUser, FaLayerGroup, FaCode } from 'react-icons/fa';
import { SiReact, SiNodedotjs, SiMysql, SiJavascript, SiTypescript, SiPython, SiGit } from 'react-icons/si';
import { apiUrl } from '../utils/api';

// Pixel Briefcase SVG Icon matching the design exactly
const PixelBriefcase = () => (
  <svg 
    width="28" 
    height="24" 
    viewBox="0 0 14 12" 
    fill="none" 
    className="pixel-briefcase-svg"
    style={{ imageRendering: 'pixelated' }}
    aria-hidden="true"
  >
    {/* Handle */}
    <rect x="5" y="0" width="4" height="2" fill="#00f3ff" />
    <rect x="6" y="1" width="2" height="1" fill="#030712" />
    {/* Body */}
    <rect x="1" y="2" width="12" height="9" fill="#00f3ff" />
    <rect x="0" y="3" width="14" height="7" fill="#00f3ff" />
    {/* Highlight band */}
    <rect x="1" y="4" width="12" height="2" fill="#00c8e0" />
    {/* Lock */}
    <rect x="6" y="5" width="2" height="2" fill="#030712" />
    <rect x="6" y="6" width="2" height="1" fill="#ffffff" />
  </svg>
);

// Diamond 4-point star for the quest badge
const DiamondStar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#00f3ff" className="diamond-star-svg" aria-hidden="true">
    <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z" />
  </svg>
);

// Custom Express circle "ex" icon matching the image
const ExpressCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="tech-pill-svg" aria-hidden="true">
    <circle cx="10" cy="10" r="8.5" stroke="#f472b6" strokeWidth="1.6" />
    <text x="10" y="13.5" textAnchor="middle" fill="#f472b6" fontSize="9" fontWeight="bold" fontFamily="system-ui, -apple-system, sans-serif">ex</text>
  </svg>
);

// Custom REST APIs pill icon matching the image
const RestApiIcon = () => (
  <svg width="19" height="16" viewBox="0 0 24 20" fill="none" className="tech-pill-svg" aria-hidden="true">
    <rect x="2" y="3" width="20" height="14" rx="4" stroke="#c084fc" strokeWidth="1.6" />
    <circle cx="12" cy="1" r="1.2" fill="#c084fc" />
    <circle cx="12" cy="19" r="1.2" fill="#c084fc" />
    <text x="12" y="13.5" textAnchor="middle" fill="#c084fc" fontSize="9" fontWeight="bold" fontFamily="monospace">API</text>
  </svg>
);

// Dolphin icon for MySQL matching the design
const DolphinIcon = () => (
  <svg width="20" height="16" viewBox="0 0 24 20" fill="none" className="tech-pill-svg" aria-hidden="true">
    <path d="M2 13C4 9.5 7.5 6.5 13 6.5C17.5 6.5 20.5 8.5 22.5 12.5C20.5 14 17.5 14 15 12C14 15 11.5 16.5 8.5 15.5C5.5 16.5 3.5 15 2 13Z" stroke="#38bdf8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.5 6.5C12.5 3.5 14.5 2.5 15.5 1.5C15.5 4.5 14.5 5.5 12.5 6.5Z" fill="#38bdf8" />
    <circle cx="6" cy="10.5" r="1" fill="#38bdf8" />
  </svg>
);

// Helper to configure each skill pill with icon and border color matching design
const getTechConfig = (techName) => {
  const t = String(techName || '').toLowerCase().trim();

  if (t.includes('react')) {
    return {
      name: techName,
      icon: <SiReact size={17} color="#00f3ff" />,
      color: '#00f3ff',
      borderColor: 'rgba(0, 243, 255, 0.75)',
      bgColor: 'rgba(0, 243, 255, 0.06)'
    };
  }
  if (t.includes('node')) {
    return {
      name: techName,
      icon: <SiNodedotjs size={17} color="#22c55e" />,
      color: '#22c55e',
      borderColor: 'rgba(34, 197, 94, 0.75)',
      bgColor: 'rgba(34, 197, 94, 0.06)'
    };
  }
  if (t.includes('express')) {
    return {
      name: techName,
      icon: <ExpressCircleIcon />,
      color: '#f472b6',
      borderColor: 'rgba(236, 72, 153, 0.75)',
      bgColor: 'rgba(236, 72, 153, 0.06)'
    };
  }
  if (t.includes('mysql') || t.includes('sql')) {
    return {
      name: techName,
      icon: <DolphinIcon />,
      color: '#38bdf8',
      borderColor: 'rgba(56, 189, 248, 0.75)',
      bgColor: 'rgba(56, 189, 248, 0.06)'
    };
  }
  if (t.includes('api') || t.includes('rest')) {
    return {
      name: techName,
      icon: <RestApiIcon />,
      color: '#c084fc',
      borderColor: 'rgba(168, 85, 247, 0.75)',
      bgColor: 'rgba(168, 85, 247, 0.06)'
    };
  }
  if (t.includes('javascript') || t === 'js') {
    return {
      name: techName,
      icon: <SiJavascript size={16} color="#facc15" />,
      color: '#facc15',
      borderColor: 'rgba(250, 204, 21, 0.75)',
      bgColor: 'rgba(250, 204, 21, 0.06)'
    };
  }
  if (t.includes('typescript') || t === 'ts') {
    return {
      name: techName,
      icon: <SiTypescript size={16} color="#60a5fa" />,
      color: '#60a5fa',
      borderColor: 'rgba(96, 165, 250, 0.75)',
      bgColor: 'rgba(96, 165, 250, 0.06)'
    };
  }
  if (t.includes('python')) {
    return {
      name: techName,
      icon: <SiPython size={16} color="#38bdf8" />,
      color: '#38bdf8',
      borderColor: 'rgba(56, 189, 248, 0.75)',
      bgColor: 'rgba(56, 189, 248, 0.06)'
    };
  }
  if (t.includes('git')) {
    return {
      name: techName,
      icon: <SiGit size={16} color="#fb923c" />,
      color: '#fb923c',
      borderColor: 'rgba(251, 146, 60, 0.75)',
      bgColor: 'rgba(251, 146, 60, 0.06)'
    };
  }

  return {
    name: techName,
    icon: <FaCode size={15} color="#38bdf8" />,
    color: '#38bdf8',
    borderColor: 'rgba(56, 189, 248, 0.75)',
    bgColor: 'rgba(56, 189, 248, 0.06)'
  };
};

const Experience = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true);
        const res = await fetch(apiUrl('/api/experiences'));
        const json = await res.json();
        if (res.ok && json.success && Array.isArray(json.data) && json.data.length > 0) {
          setExperiences(json.data);
        } else {
          // Fallback starter experience matching the reference design
          setExperiences([
            {
              id: 'exp-aditya-1',
              role: 'Full Stack Developer',
              company: 'Freelance / Personal Projects',
              period: '2024 - Present',
              description: 'Developed and maintained full-stack web applications using React, Node.js, Express.js, MySQL and REST APIs. Implemented user authentication and designed efficient database schemas for scalable and maintainable systems.',
              skills: ['React', 'Node.js', 'Express.js', 'MySQL', 'REST APIs']
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching experiences:', err);
        setExperiences([
          {
            id: 'exp-aditya-1',
            role: 'Full Stack Developer',
            company: 'Freelance / Personal Projects',
            period: '2024 - Present',
            description: 'Developed and maintained full-stack web applications using React, Node.js, Express.js, MySQL and REST APIs. Implemented user authentication and designed efficient database schemas for scalable and maintainable systems.',
            skills: ['React', 'Node.js', 'Express.js', 'MySQL', 'REST APIs']
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  const totalQuests = experiences.length;

  return (
    <section id="experience" className="exp-cyber-section">
      <div className="exp-cyber-container">

        {/* ── TOP HEADER ─────────────────────────────────────────────────── */}
        <div className="exp-cyber-header">
          <div className="exp-header-left">
            <div className="exp-category-row">
              <PixelBriefcase />
              <span className="exp-category-title">CAREER QUESTS</span>
              <span className="exp-dashed-line">─────</span>
            </div>
            <h2 className="exp-main-title">
              <span className="title-white">WORK </span>
              <span className="title-gradient">EXPERIENCE</span>
            </h2>
            <p className="exp-main-subtitle">
              Real projects. Practical skills. Building the future, one line at a time.
            </p>
          </div>

          <div className="exp-header-right">
            <div className="quest-completed-badge">
              <div className="badge-corner corner-tl"></div>
              <div className="badge-corner corner-tr"></div>
              <div className="badge-corner corner-bl"></div>
              <div className="badge-corner corner-br"></div>
              <DiamondStar />
              <span className="quest-completed-text">
                {totalQuests} QUEST{totalQuests === 1 ? '' : 'S'} COMPLETED
              </span>
            </div>
          </div>
        </div>

        {/* ── TIMELINE + CARDS LIST ────────────────────────────────────────── */}
        <div className="exp-timeline-list">
          {experiences.map((exp, index) => {
            const rawSkills = Array.isArray(exp.skills)
              ? exp.skills
              : (typeof exp.skills === 'string'
                  ? exp.skills.split(',').map(s => s.trim()).filter(Boolean)
                  : []);

            const isPresent = String(exp.period || '').toLowerCase().includes('present');

            return (
              <div key={exp.id || index} className="exp-timeline-row">
                
                {/* Vertical Cyber Track & Glowing Node (Left Side) */}
                <div className="exp-track-column">
                  <div className="exp-track-top-line"></div>
                  <div className="exp-glowing-node">
                    <div className="node-inner-circle">
                      <div className="node-center-dot"></div>
                    </div>
                  </div>
                  <div className="exp-track-bottom-line">
                    <div className="exp-track-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>

                {/* Cyberpunk Beveled Card (Right Side) */}
                <div className="exp-card-outer">
                  <div className="exp-card-inner">

                    {/* Top Row: Role, Company, Date, and Progress */}
                    <div className="exp-card-top-row">
                      
                      {/* Left: Octagon Icon + Title + Company */}
                      <div className="exp-title-group">
                        <div className="exp-code-badge-octagon">
                          <span className="exp-code-glyph">&lt;/&gt;</span>
                        </div>

                        <div className="exp-titles-col">
                          <h3 className="exp-role-heading">{exp.role}</h3>
                          <div className="exp-company-subrow">
                            <FaUser className="exp-user-glyph" />
                            <span className="exp-company-label">{exp.company}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Date Pill + Level Quest Bar */}
                      <div className="exp-meta-group">
                        <div className="exp-date-pill">
                          <FaCalendarAlt className="exp-calendar-glyph" />
                          <span>{exp.period || '2024 - Present'}</span>
                        </div>

                        <div className="exp-quest-progress-box">
                          <div className="exp-quest-label-row">
                            <span className="quest-lvl-label">
                              LEVEL {index + 1} &nbsp;/&nbsp; {totalQuests} QUEST
                            </span>
                            <span className="quest-pct-label">100%</span>
                          </div>
                          <div className="quest-bar-track">
                            <div className="quest-bar-fill" style={{ width: '100%' }}></div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Description Paragraph */}
                    <p className="exp-card-description">
                      {exp.description}
                    </p>

                    {/* Bottom Row: Tech Stack Pills & In-Progress Status */}
                    <div className="exp-card-bottom-row">
                      
                      <div className="exp-tech-stack-area">
                        <div className="exp-tech-stack-label">
                          <FaLayerGroup className="exp-layer-glyph" />
                          <span>TECH STACK</span>
                        </div>

                        <div className="exp-tech-pills-wrap">
                          {rawSkills.map((tech, tIdx) => {
                            const config = getTechConfig(tech);
                            return (
                              <div
                                key={tIdx}
                                className="exp-tech-pill"
                                style={{
                                  borderColor: config.borderColor,
                                  backgroundColor: config.bgColor,
                                  color: config.color
                                }}
                              >
                                {config.icon}
                                <span className="tech-pill-name">{config.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* In Progress / Completed Badge */}
                      <div className="exp-status-pill-badge">
                        <span className={`exp-pulse-dot ${isPresent ? 'dot-green' : 'dot-cyan'}`}></span>
                        <span className="exp-status-text">
                          {isPresent ? 'IN PROGRESS' : 'COMPLETED'}
                        </span>
                      </div>

                    </div>

                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* ── BOTTOM CORNER ACCENTS ───────────────────────────────────────── */}
        <div className="exp-footer-accents">
          <div className="exp-slashes-accent">
            <span>/</span><span>/</span><span>/</span>
          </div>
          <div className="exp-pixels-accent">
            <span className="pixel-sq sq-dark"></span>
            <span className="pixel-sq sq-blue"></span>
            <span className="pixel-sq sq-cyan"></span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Experience;
