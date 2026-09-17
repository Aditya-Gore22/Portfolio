import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedProjects from './components/FeaturedProjects';
import AboutSkillsAchievements from './components/AboutSkillsAchievements';
import ContactCTA from './components/ContactCTA';
import ContactPage from './components/ContactPage';
import ResumePage from './components/ResumePage';
import ProjectDetailPage from './components/ProjectDetailPage';
import AllProjectsPage from './components/AllProjectsPage';
import TakeABreakGame from './components/TakeABreakGame';
import AdminDashboard from './components/admin/AdminDashboard';
import Footer from './components/Footer';
import { apiUrl } from './utils/api';

function App() {
  const [currentView, setCurrentView] = useState(() => {
    const hash = window.location.hash;
    if (hash === '#admin') return 'admin';
    if (hash === '#contact') return 'contact';
    if (hash === '#resume') return 'resume';
    if (hash === '#game' || hash === '#take-a-break') return 'game';
    if (hash === '#projects' || hash === '#all-projects') return 'projects';
    if (hash.startsWith('#project/')) return 'project-detail';
    return 'home';
  });

  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#project/')) {
      return hash.replace('#project/', '');
    }
    return 'construction-management-system';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setCurrentView('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#contact') {
        setCurrentView('contact');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#resume') {
        setCurrentView('resume');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#game' || hash === '#take-a-break') {
        setCurrentView('game');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#projects' || hash === '#all-projects') {
        setCurrentView('projects');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash.startsWith('#project/')) {
        const id = hash.replace('#project/', '');
        setSelectedProjectId(id);
        setCurrentView('project-detail');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Dynamic visit tracking in MySQL
    fetch(apiUrl('/api/track-visit'), { method: 'POST' }).catch(() => {});

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (view, targetSection) => {
    if (view === 'admin') {
      setCurrentView('admin');
      window.location.hash = 'admin';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'contact') {
      setCurrentView('contact');
      window.location.hash = 'contact';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'resume') {
      setCurrentView('resume');
      window.location.hash = 'resume';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'game') {
      setCurrentView('game');
      window.location.hash = 'game';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'projects') {
      setCurrentView('projects');
      window.location.hash = 'projects';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'project-detail') {
      setCurrentView('project-detail');
      if (targetSection) {
        setSelectedProjectId(targetSection);
        window.location.hash = `project/${targetSection}`;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentView('home');
      if (targetSection) {
        window.location.hash = targetSection;
        setTimeout(() => {
          const el = document.getElementById(targetSection);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 50);
      } else {
        window.location.hash = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleSelectProject = (projectId) => {
    setSelectedProjectId(projectId);
    setCurrentView('project-detail');
    window.location.hash = `project/${projectId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dedicated full-screen layout for Portfolio Admin Panel
  if (currentView === 'admin') {
    return <AdminDashboard onNavigate={handleNavigate} />;
  }

  return (
    <div className="app">
      <Navbar currentView={currentView} onNavigate={handleNavigate} />
      
      {currentView === 'contact' ? (
        <main>
          <ContactPage onNavigate={handleNavigate} />
        </main>
      ) : currentView === 'resume' ? (
        <main>
          <ResumePage onNavigate={handleNavigate} />
        </main>
      ) : currentView === 'game' ? (
        <main>
          <TakeABreakGame onNavigate={handleNavigate} />
        </main>
      ) : currentView === 'projects' ? (
        <main>
          <AllProjectsPage 
            onSelectProject={handleSelectProject} 
            onNavigate={handleNavigate} 
          />
        </main>
      ) : currentView === 'project-detail' ? (
        <main>
          <ProjectDetailPage 
            projectId={selectedProjectId} 
            onNavigate={handleNavigate} 
          />
        </main>
      ) : (
        <main>
          <Hero onNavigate={handleNavigate} />
          <FeaturedProjects onSelectProject={handleSelectProject} onNavigate={handleNavigate} />
          <AboutSkillsAchievements />
          <ContactCTA onNavigate={handleNavigate} />
        </main>
      )}

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
