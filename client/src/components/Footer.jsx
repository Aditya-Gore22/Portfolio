import React from 'react';
import './Footer.css';
import { FaLinkedinIn, FaGithub } from 'react-icons/fa';
import { useSettings } from '../context/SettingsContext.jsx';

const Footer = ({ onNavigate }) => {
  const { settings } = useSettings();

  const handleNav = (e, section) => {
    e.preventDefault();
    if (section === 'contact') {
      if (onNavigate) onNavigate('contact');
    } else if (section === 'resume') {
      if (onNavigate) onNavigate('resume');
    } else {
      if (onNavigate) onNavigate('home', section);
    }
  };

  const linkedinUrl = settings.linkedin_url || 'https://www.linkedin.com/in/aditya-gore-b37233266/';
  const githubUrl = settings.github_url || 'https://github.com/Aditya-Gore22';
  const adminName = settings.admin_name || 'ADITYA GORE';
  const adminTagline = settings.admin_tagline || 'Developer × Gamer';

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <h3 className="footer-name">{adminName.toUpperCase()}</h3>
          <span className="footer-title">{adminTagline}</span>
        </div>
        
        <div className="footer-center">
          <nav className="footer-nav">
            <a href="#home" onClick={(e) => handleNav(e, 'home')}>Home</a>
            <a href="#about" onClick={(e) => handleNav(e, 'about')}>About</a>
            <a href="#projects" onClick={(e) => handleNav(e, 'projects')}>Projects</a>
            <a href="#skills" onClick={(e) => handleNav(e, 'about')}>Skills</a>
            <a href="#experience" onClick={(e) => handleNav(e, 'about')}>Experience</a>
            <a href="#resume" onClick={(e) => handleNav(e, 'resume')}>Resume</a>
            <a href="#game" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('game'); }}>Take a Break</a>
            <a href="#contact" onClick={(e) => handleNav(e, 'contact')}>Contact</a>
            <a href="#admin" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('admin'); }} style={{ color: '#38bdf8' }}>Admin</a>
          </nav>
        </div>
        
        <div className="footer-right">
          <div className="footer-socials">
            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedinIn />
            </a>
            <a href={githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <FaGithub />
            </a>
            <a href="#contact" onClick={(e) => handleNav(e, 'contact')} aria-label="Gaming">
              <img src="/images/controller_icon.png" alt="Gaming" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
            </a>
          </div>
          <p className="footer-tagline">Play. Learn. Build. Repeat.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
