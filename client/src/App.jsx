import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedProjects from './components/FeaturedProjects';
import AboutSkillsAchievements from './components/AboutSkillsAchievements';
import Experience from './components/Experience';
import ContactCTA from './components/ContactCTA';
import ContactPage from './components/ContactPage';
import ResumePage from './components/ResumePage';
import ProjectDetailPage from './components/ProjectDetailPage';
import AllProjectsPage from './components/AllProjectsPage';
import TakeABreakGame from './components/TakeABreakGame';
import AdminDashboard from './components/admin/AdminDashboard';
import ResetPasswordPage from './components/ResetPasswordPage';
import Footer from './components/Footer';
import { apiUrl } from './utils/api';

// Detect reset-password token from URL hash on initial load
function getInitialState() {
  const hash = window.location.hash;
  if (hash === '#admin') return { view: 'admin', resetToken: null, projectId: 'construction-management-system' };
  if (hash === '#contact') return { view: 'contact', resetToken: null, projectId: 'construction-management-system' };
  if (hash === '#resume') return { view: 'resume', resetToken: null, projectId: 'construction-management-system' };
  if (hash === '#game' || hash === '#take-a-break') return { view: 'game', resetToken: null, projectId: 'construction-management-system' };
  if (hash === '#projects' || hash === '#all-projects') return { view: 'projects', resetToken: null, projectId: 'construction-management-system' };
  if (hash.startsWith('#project/')) return { view: 'project-detail', resetToken: null, projectId: hash.replace('#project/', '') };
  if (hash.startsWith('#reset-password/')) {
    const token = hash.replace('#reset-password/', '');
    return { view: 'reset-password', resetToken: token, projectId: 'construction-management-system' };
  }
  return { view: 'home', resetToken: null, projectId: 'construction-management-system' };
}

function App() {
  const initial = getInitialState();
  const [currentView, setCurrentView] = useState(initial.view);
  const [selectedProjectId, setSelectedProjectId] = useState(initial.projectId);
  const [resetToken, setResetToken] = useState(initial.resetToken);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setCurrentView('admin'); window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#contact') {
        setCurrentView('contact'); window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#resume') {
        setCurrentView('resume'); window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#game' || hash === '#take-a-break') {
        setCurrentView('game'); window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#projects' || hash === '#all-projects') {
        setCurrentView('projects'); window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash.startsWith('#project/')) {
        const id = hash.replace('#project/', '');
        setSelectedProjectId(id); setCurrentView('project-detail'); window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash.startsWith('#reset-password/')) {
        const token = hash.replace('#reset-password/', '');
        setResetToken(token); setCurrentView('reset-password'); window.scrollTo({ top: 0, behavior: 'smooth' });
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
      setCurrentView('admin'); window.location.hash = 'admin'; window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'contact') {
      setCurrentView('contact'); window.location.hash = 'contact'; window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'resume') {
      setCurrentView('resume'); window.location.hash = 'resume'; window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'game') {
      setCurrentView('game'); window.location.hash = 'game'; window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'projects') {
      setCurrentView('projects'); window.location.hash = 'projects'; window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'project-detail') {
      setCurrentView('project-detail');
      if (targetSection) { setSelectedProjectId(targetSection); window.location.hash = `project/${targetSection}`; }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentView('home');
      if (targetSection) {
        window.location.hash = targetSection;
        setTimeout(() => {
          const el = document.getElementById(targetSection);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          else window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Reset-password page (full-screen, no navbar/footer)
  if (currentView === 'reset-password') {
    return <ResetPasswordPage token={resetToken} onNavigate={handleNavigate} />;
  }

  // Admin panel (full-screen)
  if (currentView === 'admin') {
    return <AdminDashboard onNavigate={handleNavigate} />;
  }

  return (
    <div className="app">
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      {currentView === 'contact' ? (
        <main><ContactPage onNavigate={handleNavigate} /></main>
      ) : currentView === 'resume' ? (
        <main><ResumePage onNavigate={handleNavigate} /></main>
      ) : currentView === 'game' ? (
        <main><TakeABreakGame onNavigate={handleNavigate} /></main>
      ) : currentView === 'projects' ? (
        <main>
          <AllProjectsPage onSelectProject={handleSelectProject} onNavigate={handleNavigate} />
        </main>
      ) : currentView === 'project-detail' ? (
        <main>
          <ProjectDetailPage projectId={selectedProjectId} onNavigate={handleNavigate} />
        </main>
      ) : (
        <main>
          <Hero onNavigate={handleNavigate} />
          <FeaturedProjects onSelectProject={handleSelectProject} onNavigate={handleNavigate} />
          <AboutSkillsAchievements />
          <Experience />
          <ContactCTA onNavigate={handleNavigate} />
        </main>
      )}

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
