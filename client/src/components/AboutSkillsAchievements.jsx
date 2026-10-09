import React, { useState, useEffect } from 'react';
import './AboutSkillsAchievements.css';
import { FaHeart, FaCog, FaTrophy, FaJava, FaProjectDiagram, FaCode, FaPuzzlePiece, FaGraduationCap, FaBook, FaGamepad, FaLock } from 'react-icons/fa';
import { SiJavascript, SiReact, SiNodedotjs, SiExpress, SiMysql, SiHtml5, SiCss, SiGit } from 'react-icons/si';
import { apiUrl } from '../utils/api';

const PixelHeart = () => (
  <svg 
    width="20" 
    height="18" 
    viewBox="0 0 10 9" 
    className="asa-pixel-heart"
    style={{ imageRendering: 'pixelated', display: 'inline-block' }}
    aria-hidden="true"
  >
    <rect x="1" y="0" width="3" height="2" fill="#ff3b60" />
    <rect x="6" y="0" width="3" height="2" fill="#ff3b60" />
    <rect x="0" y="2" width="10" height="3" fill="#ff3b60" />
    <rect x="1" y="5" width="8" height="1" fill="#ff3b60" />
    <rect x="2" y="6" width="6" height="1" fill="#ff3b60" />
    <rect x="3" y="7" width="4" height="1" fill="#ff3b60" />
    <rect x="4" y="8" width="2" height="1" fill="#ff3b60" />
  </svg>
);

const DEFAULT_SKILLS = [
  { name: 'JavaScript', icon: 'SiJavascript', color: '#f7df1e' },
  { name: 'React', icon: 'SiReact', color: '#61dafb' },
  { name: 'Node.js', icon: 'SiNodedotjs', color: '#68a063' },
  { name: 'Express.js', icon: 'SiExpress', color: 'white' },
  { name: 'MySQL', icon: 'SiMysql', color: '#4479a1' },
  { name: 'Java', icon: 'FaJava', color: '#f89820' },
  { name: 'HTML5', icon: 'SiHtml5', color: '#e34f26' },
  { name: 'CSS3', icon: 'SiCss', color: '#1572b6' },
  { name: 'Git', icon: 'SiGit', color: '#f05032' },
  { name: 'DSA', icon: 'FaProjectDiagram', color: '#9333ea' },
  { name: 'OOP', icon: 'FaCode', color: '#0ea5e9' },
  { name: 'Problem Solving', icon: 'FaPuzzlePiece', color: '#f59e0b' }
];

const DEFAULT_ACHIEVEMENTS = [
  {
    title: 'MCA Graduate',
    description: 'Completed Masters in Computer Applications',
    icon: 'FaGraduationCap'
  },
  {
    title: 'Built 3+ Full Stack Projects',
    description: 'From idea to deployment',
    icon: 'FaCode'
  },
  {
    title: 'Continuous Learner',
    description: 'Always exploring new technologies',
    icon: 'FaBook'
  },
  {
    title: 'Gamer at Heart',
    description: 'Believer that games make life better',
    icon: 'FaGamepad'
  }
];

const renderSkillIcon = (iconName, skillName) => {
  const s = String(skillName || '').toLowerCase();
  const ic = String(iconName || '').toLowerCase();
  if (ic.includes('javascript') || s.includes('javascript') || s === 'js') return <SiJavascript color="#f7df1e" size={28} />;
  if (ic.includes('react') || s.includes('react')) return <SiReact color="#61dafb" size={28} />;
  if (ic.includes('node') || s.includes('node')) return <SiNodedotjs color="#68a063" size={28} />;
  if (ic.includes('express') || s.includes('express')) return <SiExpress color="white" size={28} />;
  if (ic.includes('mysql') || s.includes('mysql') || s.includes('sql')) return <SiMysql color="#4479a1" size={28} />;
  if (ic.includes('java') && !ic.includes('javascript') || s.includes('java') && !s.includes('javascript')) return <FaJava color="#f89820" size={28} />;
  if (ic.includes('html') || s.includes('html')) return <SiHtml5 color="#e34f26" size={28} />;
  if (ic.includes('css') || s.includes('css')) return <SiCss color="#1572b6" size={28} />;
  if (ic.includes('git') || s.includes('git')) return <SiGit color="#f05032" size={28} />;
  if (ic.includes('project') || s.includes('dsa') || s.includes('api')) return <FaProjectDiagram color="#9333ea" size={28} />;
  if (ic.includes('lock') || s.includes('jwt') || s.includes('auth')) return <FaLock color="#ec4899" size={28} />;
  if (ic.includes('puzzle') || s.includes('problem')) return <FaPuzzlePiece color="#f59e0b" size={28} />;
  return <FaCode color="#0ea5e9" size={28} />;
};

const renderAchievementIcon = (iconName, title) => {
  const t = String(title || '').toLowerCase();
  const ic = String(iconName || '').toLowerCase();
  if (ic.includes('grad') || t.includes('mca') || t.includes('graduate') || t.includes('degree')) return <FaGraduationCap />;
  if (ic.includes('code') || t.includes('project') || t.includes('built')) return <FaCode />;
  if (ic.includes('book') || t.includes('learn')) return <FaBook />;
  if (ic.includes('game') || t.includes('gamer')) return <FaGamepad />;
  return <FaTrophy />;
};

const AboutSkillsAchievements = () => {
  const [skills, setSkills] = useState(DEFAULT_SKILLS);
  const [achievements, setAchievements] = useState(DEFAULT_ACHIEVEMENTS);

  useEffect(() => {
    // Dynamic fetch from MySQL backend
    fetch(apiUrl('/api/skills'))
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setSkills(data.data);
        }
      })
      .catch(() => {});

    fetch(apiUrl('/api/achievements'))
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setAchievements(data.data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="about" className="asa-section">
      <div className="asa-container">
        <div className="asa-grid">
          
          {/* Card 1: About Me */}
          <div className="asa-card-panel asa-about-card">
            <div className="asa-card-header">
              <h2 className="asa-card-title">ABOUT ME</h2>
              <div className="asa-about-hearts">
                <PixelHeart />
                <PixelHeart />
                <PixelHeart />
              </div>
            </div>

            <div className="asa-about-body">
              <div className="asa-about-char-col">
                <img 
                  src="/images/05_pixel_character.png" 
                  alt="Aditya Gore Pixel Art Character" 
                  className="asa-about-char" 
                />
              </div>

              <div className="asa-about-content-col">
                <h3 className="asa-about-greeting">Hi, I'm Aditya Gore!</h3>
                <p className="asa-about-text">
                  I'm an MCA graduate and a Full Stack Developer who loves both coding and gaming. Games have always inspired me &mdash; the creativity, logic, and problem solving in games are the same things I enjoy in software development.
                </p>
                <p className="asa-about-text">
                  When I'm not coding, you'll probably find me exploring a new game, watching football, or planning my next big adventure.
                </p>
              </div>
            </div>

            <div className="asa-about-quote-box">
              <p className="asa-about-quote-text">
                "Good games make you think.<br />
                &nbsp;Great software does the same."
              </p>
            </div>
          </div>

          {/* Card 2: Skills */}
          <div className="asa-card-panel asa-skills-card">
            <div className="asa-card-header">
              <div className="asa-header-left">
                <FaCog className="asa-header-icon asa-icon-cog" />
                <h2 className="asa-card-title">SKILLS</h2>
              </div>
              <div className="asa-level">
                <span className="asa-level-text">LEVEL</span>
                <span className="asa-level-squares">■■■■■■■■■■</span>
              </div>
            </div>

            <div className="asa-skills-body">
              <div className="asa-skills-grid">
                {skills.map((skill, index) => (
                  <div key={skill.id || index} className="asa-skill-item">
                    {renderSkillIcon(skill.icon, skill.name)}
                    <span>{skill.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Achievements */}
          <div className="asa-card-panel asa-achievements-card">
            <div className="asa-card-header">
              <div className="asa-header-left">
                <FaTrophy className="asa-header-icon asa-icon-trophy" />
                <h2 className="asa-card-title">ACHIEVEMENTS</h2>
              </div>
              <div className="asa-ach-status">
                <span className="asa-status-text">UNLOCKED</span>
                <span className="asa-status-badge">{achievements.length}/4</span>
              </div>
            </div>

            <div className="asa-ach-body">
              {achievements.map((ach, index) => (
                <div key={ach.id || index} className="asa-ach-item">
                  <div className="asa-ach-icon">
                    {renderAchievementIcon(ach.icon, ach.title)}
                  </div>
                  <div className="asa-ach-text">
                    <h4>{ach.title}</h4>
                    <p>{ach.description || ach.organization || ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSkillsAchievements;
