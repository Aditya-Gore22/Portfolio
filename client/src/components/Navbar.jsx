import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import './Navbar.css';

const Navbar = ({ currentView = 'home', onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  const navLinks = [
    { id: 'home', name: 'Home', section: 'home' },
    { id: 'about', name: 'About', section: 'about' },
    { id: 'projects', name: 'Projects', section: 'projects' },
    { id: 'skills', name: 'Skills', section: 'about' },
    { id: 'experience', name: 'Experience', section: 'about' },
    { id: 'resume', name: 'Resume', section: 'resume' },
    { id: 'break', name: 'Take a Break', section: 'game' },
    { id: 'contact', name: 'Contact', section: 'contact' },
  ];

  const handleLinkClick = (e, link) => {
    e.preventDefault();
    closeMenu();
    if (link.id === 'contact') {
      if (onNavigate) onNavigate('contact');
    } else if (link.id === 'resume') {
      if (onNavigate) onNavigate('resume');
    } else if (link.id === 'break') {
      if (onNavigate) onNavigate('game');
    } else if (link.id === 'projects') {
      if (onNavigate) onNavigate('projects');
    } else {
      if (onNavigate) onNavigate('home', link.section);
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    closeMenu();
    if (onNavigate) onNavigate('home', 'home');
  };

  const handleConnectClick = (e) => {
    e.preventDefault();
    closeMenu();
    if (onNavigate) onNavigate('contact');
  };

  return (
    <header className={`navbar ${scrolled ? 'navbar-scrolled' : ''} ${currentView !== 'home' ? 'navbar-solid' : ''} ${isMobileMenuOpen ? 'navbar-open' : ''}`}>
      <div className="navbar-container">
        <a href="#home" onClick={handleLogoClick} className="logo-area">
          <div className="logo-icon-wrapper">
            <img src="/images/controller_icon.png" alt="Controller" className="gamepad-icon" />
          </div>
          <div className="logo-text">
            <span className="logo-title">ADITYA GORE</span>
            <span className="logo-subtitle">DEVELOPER × GAMER</span>
          </div>
        </a>

        <nav className="nav-center">
          <ul className="nav-links">
            {navLinks.map((link) => {
              const isActive = 
                currentView === 'contact' 
                  ? link.id === 'contact' 
                  : currentView === 'resume'
                    ? link.id === 'resume'
                    : currentView === 'game'
                      ? link.id === 'break'
                      : (currentView === 'projects' || currentView === 'project-detail')
                        ? link.id === 'projects'
                        : currentView === 'home' && link.id === 'home';
              return (
                <li key={link.name}>
                  <a 
                    href={`#${link.section}`}
                    onClick={(e) => handleLinkClick(e, link)}
                    className={isActive ? 'active' : ''}
                  >
                    {link.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="nav-right">
          <button 
            type="button" 
            className="nav-search-btn" 
            onClick={() => {
              if (onNavigate) onNavigate('projects');
            }}
            title="Search projects"
            aria-label="Search projects"
          >
            <FiSearch />
          </button>
          <a href="#contact" onClick={handleConnectClick} className="btn-connect">
            Let's Connect <span className="connect-arrow">↗</span>
          </a>
          <button className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`} onClick={toggleMenu} aria-label="Toggle menu">
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>
      </div>

      <nav className={`nav-mobile ${isMobileMenuOpen ? 'open' : ''}`}>
        <ul className="mobile-links">
          {navLinks.map((link) => {
            const isActive = 
              currentView === 'contact' 
                ? link.id === 'contact' 
                : currentView === 'resume'
                  ? link.id === 'resume'
                  : currentView === 'game'
                    ? link.id === 'break'
                    : (currentView === 'projects' || currentView === 'project-detail')
                      ? link.id === 'projects'
                      : currentView === 'home' && link.id === 'home';
            return (
              <li key={link.name}>
                <a 
                  href={`#${link.section}`}
                  onClick={(e) => handleLinkClick(e, link)}
                  className={isActive ? 'active' : ''}
                >
                  {link.name}
                </a>
              </li>
            );
          })}
          <li>
            <a href="#contact" onClick={handleConnectClick} className="btn-connect-mobile">
              Let's Connect ↗
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
