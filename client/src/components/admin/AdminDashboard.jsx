import React, { useState, useEffect, useRef } from 'react';
import './AdminDashboard.css';
import {
  FaFolder,
  FaEnvelope,
  FaTrophy,
  FaBriefcase,
  FaCode,
  FaGamepad,
  FaUser,
  FaCog,
  FaExternalLinkAlt,
  FaPlus,
  FaSearch,
  FaBell,
  FaChevronDown,
  FaEllipsisH,
  FaTrash,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTimes,
  FaReply,
  FaSyncAlt,
  FaArrowRight,
  FaUpload,
  FaSignOutAlt,
  FaSpinner,
  FaLock,
  FaShieldAlt,
  FaKey,
  FaQuoteLeft,
  FaSave
} from 'react-icons/fa';
import { MdDashboard, MdOutlineMarkEmailRead } from 'react-icons/md';
import { useSettings } from '../../context/SettingsContext.jsx';

const AdminDashboard = ({ onNavigate }) => {
  const { updateSettings: updateContextSettings, refreshSettings } = useSettings();

  // Authentication state (JWT)
  const [token, setToken] = useState(() => localStorage.getItem('portfolio_admin_token') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('portfolio_admin_token')));
  const [loginForm, setLoginForm] = useState({
    email: localStorage.getItem('portfolio_remembered_email') || 'adityagore@example.com',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem('portfolio_remembered_email')));
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Change Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Navigation tabs
  const [activeTab, setActiveTab] = useState('dashboard');

  // Stats & Core Data
  const [stats, setStats] = useState({
    totalProjects: 0,
    projectsDelta: '+0',
    totalMessages: 0,
    unreadMessages: 0,
    messagesDelta: '+0',
    totalViews: 0,
    viewsFormatted: '0',
    viewsDelta: '+0',
    totalAchievements: 0,
    achievementsDelta: '+0',
    siteStatus: {
      website: '',
      database: 'Connecting to MySQL...',
      contactForm: 'Ready',
      security: 'JWT Protected',
      isOnline: true
    }
  });

  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [skills, setSkills] = useState([]);
  const [gamingStats, setGamingStats] = useState({
    totalPlays: 0,
    totalBugsSquashed: 0,
    bestTimeSeconds: 48,
    bestTimeFormatted: '00:48',
    favoriteHero: 'Aditya',
    recentScores: []
  });
  const [adminProfile, setAdminProfile] = useState({
    id: '',
    username: 'aditya',
    full_name: 'Aditya Gore',
    email: 'adityagore@example.com',
    linkedin_url: 'https://www.linkedin.com/in/aditya-gore-b37233266/',
    github_url: 'https://github.com/Aditya-Gore22',
    role: 'admin'
  });
  const [profileStatus, setProfileStatus] = useState({ type: '', message: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [healthData, setHealthData] = useState({
    status: 'Healthy',
    database: 'MySQL 9.5 (portfolio_db)',
    dbLatencyMs: 1,
    uptimeSeconds: 0,
    memoryUsageMb: 35
  });

  const [settings, setSettings] = useState({
    site_title: 'Aditya Gore - Full Stack Developer',
    admin_quote: 'Build. Improve. Repeat.',
    admin_name: 'Aditya Gore',
    admin_role: 'Admin & Lead Developer',
    contact_email: 'adityagore@example.com',
    portfolio_url: 'https://aditya-gore.dev',
    github_url: 'https://github.com/adityagore',
    linkedin_url: 'https://linkedin.com/in/adityagore'
  });

  const [loading, setLoading] = useState(true);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  // Modals
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isAddAchievementModalOpen, setIsAddAchievementModalOpen] = useState(false);
  const [isAddExperienceModalOpen, setIsAddExperienceModalOpen] = useState(false);
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visitorTimeRange, setVisitorTimeRange] = useState('30');
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Image upload state (Multipart with UUID)
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // Form states
  const [projectForm, setProjectForm] = useState({
    title: '',
    shortDescription: '',
    fullDescription: '',
    category: 'Full Stack',
    image: '/images/02_construction_project.png',
    tags: 'React, Node.js, MySQL',
    liveDemoUrl: '',
    githubUrl: '',
    published: true
  });

  const [skillForm, setSkillForm] = useState({
    name: '',
    category: 'Frontend',
    proficiency: 85
  });

  const [achievementForm, setAchievementForm] = useState({
    title: '',
    organization: '',
    year: '2024',
    description: ''
  });

  const [experienceForm, setExperienceForm] = useState({
    role: '',
    company: '',
    period: '2024 - Present',
    description: '',
    skills: 'React, Node.js, MySQL'
  });

  // Authenticated fetch helper
  const authFetch = async (url, options = {}) => {
    const currentToken = token || localStorage.getItem('portfolio_admin_token');
    const headers = {
      ...(options.headers || {}),
      ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {})
    };

    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      localStorage.removeItem('portfolio_admin_token');
      setToken('');
      setIsAuthenticated(false);
    }
    return res;
  };

  // Fetch all initial data dynamically from MySQL backend
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, projectsRes, messagesRes, visitorsRes, skillsRes, gameRes, healthRes] = await Promise.all([
        fetch('/api/admin/stats').then(r => r.json()).catch(() => null),
        fetch('/api/projects?all=true').then(r => r.json()).catch(() => null),
        fetch('/api/messages').then(r => r.json()).catch(() => null),
        fetch(`/api/admin/visitors?days=${visitorTimeRange}`).then(r => r.json()).catch(() => null),
        fetch('/api/skills').then(r => r.json()).catch(() => null),
        fetch('/api/game/stats').then(r => r.json()).catch(() => null),
        fetch('/api/admin/health').then(r => r.json()).catch(() => null)
      ]);

      if (statsRes && statsRes.success) setStats(statsRes.stats);
      if (projectsRes && projectsRes.success) setProjects(projectsRes.data);
      if (messagesRes && messagesRes.success) setMessages(messagesRes.messages);
      if (visitorsRes && visitorsRes.success) setVisitors(visitorsRes.data);
      if (skillsRes && skillsRes.success) setSkills(skillsRes.data);
      if (gameRes && gameRes.success) setGamingStats(gameRes.stats);
      if (healthRes && healthRes.success) setHealthData(healthRes);

      fetch('/api/achievements').then(r => r.json()).then(d => d.success && setAchievements(d.data)).catch(() => {});
      fetch('/api/experiences').then(r => r.json()).then(d => d.success && setExperiences(d.data)).catch(() => {});
      fetch('/api/settings').then(r => r.json()).then(d => d.success && setSettings(d.settings)).catch(() => {});

      // Load logged-in admin profile
      authFetch('/api/auth/me').then(r => r.json()).then(d => {
        if (d && d.success && d.user) {
          setAdminProfile(d.user);
        }
      }).catch(() => {});
    } catch (e) {
      console.error('Error loading dynamic dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch visitors when time range changes
  useEffect(() => {
    if (isAuthenticated) {
      fetch(`/api/admin/visitors?days=${visitorTimeRange}`)
        .then(r => r.json())
        .then(d => d.success && setVisitors(d.data))
        .catch(() => {});
    }
  }, [visitorTimeRange, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  // Global Ctrl + K search shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchModalOpen(false);
        setSelectedMessage(null);
        setIsAddProjectModalOpen(false);
        setIsAddAchievementModalOpen(false);
        setIsAddExperienceModalOpen(false);
        setActionMenuOpen(null);
        setProfileDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActionMenuOpen(null);
      setNotificationOpen(false);
      setProfileDropdownOpen(false);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Format relative time helper
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'recently';
    const now = new Date();
    const past = new Date(timestamp);
    const diffHours = Math.floor((now - past) / (1000 * 60 * 60));
    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get sender initials for avatar badge
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // ================= AUTH ACTIONS (JWT) =================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      if (rememberMe) {
        localStorage.setItem('portfolio_remembered_email', loginForm.email);
      } else {
        localStorage.removeItem('portfolio_remembered_email');
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginForm.email,
          username: loginForm.email,
          password: loginForm.password
        })
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('portfolio_admin_token', data.token);
        setToken(data.token);
        setIsAuthenticated(true);
        setLoginForm(prev => ({ ...prev, password: '' }));
      } else {
        setLoginError(data.message || 'Invalid credentials. Access denied.');
      }
    } catch (err) {
      setLoginError('Server connection error. Please make sure the backend is running.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('portfolio_admin_token');
    setToken('');
    setIsAuthenticated(false);
    setProfileDropdownOpen(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus({ type: '', message: '' });

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'All fields are required.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New password and confirm password do not match.' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await authFetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setPasswordStatus({
          type: 'success',
          message: data.message || 'Password updated successfully! Only you can log in now.'
        });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordStatus({
          type: 'error',
          message: data.message || 'Failed to update password.'
        });
      }
    } catch (err) {
      setPasswordStatus({
        type: 'error',
        message: 'Server error while updating password.'
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ================= MULTIPART IMAGE UPLOAD =================
  const handleImageFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploadingImage(true);
    setUploadError('');

    try {
      const res = await authFetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setProjectForm(prev => ({ ...prev, image: data.imageUrl }));
      } else {
        setUploadError(data.message || 'Image upload failed.');
      }
    } catch (err) {
      setUploadError('Failed to upload image. Please check image format.');
    } finally {
      setUploadingImage(false);
    }
  };

  // ================= PROJECT ACTIONS =================
  const handleOpenAddProject = () => {
    setEditingProject(null);
    setUploadError('');
    setProjectForm({
      title: '',
      shortDescription: '',
      fullDescription: '',
      category: 'Full Stack',
      image: '/images/02_construction_project.png',
      tags: 'React, Node.js, MySQL',
      liveDemoUrl: '',
      githubUrl: '',
      published: true
    });
    setIsAddProjectModalOpen(true);
  };

  const handleOpenEditProject = (project) => {
    setEditingProject(project);
    setUploadError('');
    setProjectForm({
      title: project.title,
      shortDescription: project.shortDescription || '',
      fullDescription: project.fullDescription || project.shortDescription || '',
      category: project.category || 'Full Stack',
      image: project.image || '/images/02_construction_project.png',
      tags: Array.isArray(project.tags) ? project.tags.join(', ') : (project.tags || ''),
      liveDemoUrl: project.liveDemoUrl || '',
      githubUrl: project.githubUrl || '',
      published: project.published !== undefined ? project.published : true
    });
    setIsAddProjectModalOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...projectForm,
        tags: projectForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      let res;
      if (editingProject) {
        res = await authFetch(`/api/projects/${editingProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await authFetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const json = await res.json();
      if (json.success) {
        setIsAddProjectModalOpen(false);
        loadDashboardData();
      } else {
        alert(json.message || 'Error saving project');
      }
    } catch (err) {
      console.error(err);
      alert('Network error saving project');
    }
  };

  const handleDeleteProject = async (id, e) => {
    e && e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await authFetch(`/api/projects/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        loadDashboardData();
      } else {
        alert(json.message || 'Error deleting project');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ================= MESSAGE ACTIONS =================
  const handleToggleMessageRead = async (id, currentStatus, e) => {
    e && e.stopPropagation();
    try {
      const res = await authFetch(`/api/messages/${id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: !currentStatus })
      });
      const json = await res.json();
      if (json.success) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: !currentStatus ? 1 : 0 } : m));
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(prev => ({ ...prev, is_read: !currentStatus ? 1 : 0 }));
        }
        setStats(prev => ({
          ...prev,
          unreadMessages: Math.max(0, prev.unreadMessages + (!currentStatus ? -1 : 1))
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMessage = async (id, e) => {
    e && e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      const res = await authFetch(`/api/messages/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setMessages(prev => prev.filter(m => m.id !== id));
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(null);
        }
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ================= ACHIEVEMENTS ACTIONS =================
  const handleSaveAchievement = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(achievementForm)
      });
      const json = await res.json();
      if (json.success) {
        setIsAddAchievementModalOpen(false);
        setAchievementForm({ title: '', organization: '', year: '2024', description: '' });
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAchievement = async (id) => {
    if (!window.confirm('Delete this achievement?')) return;
    try {
      await authFetch(`/api/achievements/${id}`, { method: 'DELETE' });
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  // ================= EXPERIENCE ACTIONS =================
  const handleSaveExperience = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...experienceForm,
          skills: experienceForm.skills.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      const json = await res.json();
      if (json.success) {
        setIsAddExperienceModalOpen(false);
        setExperienceForm({ role: '', company: '', period: '2024 - Present', description: '', skills: 'React, Node.js, MySQL' });
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExperience = async (id) => {
    if (!window.confirm('Delete this experience?')) return;
    try {
      await authFetch(`/api/experiences/${id}`, { method: 'DELETE' });
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  // ================= SKILLS ACTIONS (DYNAMIC MYSQL) =================
  const handleOpenAddSkill = () => {
    setSkillForm({ name: '', category: 'Frontend', proficiency: 85 });
    setIsAddSkillModalOpen(true);
  };

  const handleSaveSkill = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skillForm)
      });
      const data = await res.json();
      if (data.success) {
        setIsAddSkillModalOpen(false);
        loadDashboardData();
      } else {
        alert(data.message || 'Failed to add skill.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill from MySQL?')) return;
    try {
      await authFetch(`/api/skills/${id}`, { method: 'DELETE' });
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  // ================= PROFILE & SETTINGS ACTIONS =================
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileStatus({ type: '', message: '' });
    setIsSavingProfile(true);
    try {
      const res = await authFetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminProfile)
      });
      const data = await res.json();
      if (data.success) {
        setProfileStatus({ type: 'success', message: data.message || 'Profile & social links saved in MySQL!' });
        if (data.user) {
          setAdminProfile(data.user);
        }
        // Update global context so Footer, Contact, etc. update immediately across the entire site
        updateContextSettings({
          contact_email: adminProfile.email,
          admin_name: adminProfile.full_name,
          linkedin_url: adminProfile.linkedin_url,
          github_url: adminProfile.github_url
        });
        setSettings(prev => ({
          ...prev,
          contact_email: adminProfile.email,
          admin_name: adminProfile.full_name,
          linkedin_url: adminProfile.linkedin_url,
          github_url: adminProfile.github_url
        }));
        refreshSettings();
      } else {
        setProfileStatus({ type: 'error', message: data.message || 'Failed to update profile.' });
      }
    } catch (err) {
      setProfileStatus({ type: 'error', message: 'Error saving profile to MySQL.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        alert('Site Settings successfully saved to MySQL! Applied everywhere across the portfolio.');
        // Update global context
        updateContextSettings(settings);
        setAdminProfile(prev => ({
          ...prev,
          full_name: settings.admin_name || prev.full_name,
          email: settings.contact_email || prev.email,
          linkedin_url: settings.linkedin_url || prev.linkedin_url,
          github_url: settings.github_url || prev.github_url
        }));
        refreshSettings();
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered search list
  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const filteredMessages = messages.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.subject && m.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Fallback visitor data if needed
  const displayVisitors = visitors.length > 0 ? visitors : [
    { label: 'Aug 15', views: 22 },
    { label: 'Aug 18', views: 35 },
    { label: 'Aug 20', views: 42 },
    { label: 'Aug 25', views: 28 },
    { label: 'Aug 30', views: 65 },
    { label: 'Sep 04', views: 120 },
    { label: 'Sep 09', views: 88 },
    { label: 'Sep 12', views: 60 }
  ];

  const maxViews = Math.max(...displayVisitors.map(v => v.views || 0), 150);

  // ====================================================
  // RENDER LOGIN SCREEN IF NOT AUTHENTICATED
  // ====================================================
  if (!isAuthenticated) {
    return (
      <div className="admin-login-screen-split">
        {/* TOP BAR */}
        <header className="login-top-navbar">
          <div className="login-nav-brand">
            <div className="login-brand-icon">
              <img src="/images/controller_icon.png" alt="Controller" className="login-brand-controller-img" />
            </div>
            <div className="login-brand-text">
              <span className="login-brand-title">PORTFOLIO ADMIN</span>
              <span className="login-brand-subtitle">Manage &bull; Create &bull; Grow</span>
            </div>
          </div>
          <div className="login-nav-right">
            <span className="login-nav-secure">Secure Access</span>
            <span className="login-nav-better">To A Better Tomorrow</span>
          </div>
        </header>

        {/* 2-COLUMN SPLIT CONTAINER */}
        <div className="login-split-body">
          {/* LEFT: GAMER ROOM STAGE WITH QUOTE */}
          <div className="login-left-stage">
            <div 
              className="login-stage-backdrop"
              style={{ backgroundImage: `url('/images/gamer_room_bg.jpg')` }}
            >
              <div className="login-stage-overlay"></div>
            </div>

            {/* Bottom Quote Banner */}
            <div className="login-quote-card">
              <div className="login-quote-body">
                <p className="login-quote-text">
                  &ldquo;Behind every great portfolio is a creator who never stops playing.&rdquo;
                </p>
                <span className="login-quote-author">&mdash; Aditya Gore</span>
              </div>
            </div>
          </div>

          {/* RIGHT: GLOWING GLASS LOGIN CARD */}
          <div className="login-right-stage">
            <div className="admin-login-card-v2">
              <div className="login-icon-badge">
                <img src="/images/controller_icon.png" alt="Controller" className="login-card-controller-img" />
              </div>

              <h1 className="login-card-title">ADMIN LOGIN</h1>
              <p className="login-card-subtitle">Welcome back! Manage your portfolio.</p>

              <form className="login-form-v2" onSubmit={handleLogin}>
                {loginError && (
                  <div className="login-error-alert">
                    <FaTimes /> <span>{loginError}</span>
                  </div>
                )}

                {/* Email Address Field */}
                <div className="login-field-group">
                  <label className="login-field-label">
                    <FaEnvelope className="field-label-icon" />
                    <span>Email Address</span>
                  </label>
                  <div className="login-input-wrap">
                    <input 
                      type="text" 
                      required 
                      autoFocus
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="login-input-field"
                    />
                  </div>
                </div>

                {/* Password Field with Eye Toggle */}
                <div className="login-field-group">
                  <label className="login-field-label">
                    <FaLock className="field-label-icon" />
                    <span>Password</span>
                  </label>
                  <div className="login-input-wrap">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      required 
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="login-input-field has-eye-btn"
                    />
                    <button 
                      type="button" 
                      className="login-eye-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex="-1"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="login-options-row">
                  <label className="remember-me-checkbox">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                    />
                    <span>Remember me</span>
                  </label>
                  <button 
                    type="button" 
                    className="forgot-pwd-btn"
                    onClick={() => setShowForgotModal(true)}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <button type="submit" disabled={isLoggingIn} className="login-submit-btn-v2">
                  {isLoggingIn ? (
                    <>
                      <FaSpinner className="spinning" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>&rarr; Login to Dashboard</span>
                    </>
                  )}
                </button>

                {/* OR Divider */}
                <div className="login-or-divider">
                  <span className="or-line"></span>
                  <span className="or-text">OR</span>
                  <span className="or-line"></span>
                </div>

                {/* Security Badge */}
                <div className="login-security-notice">
                  <FaShieldAlt className="security-shield-icon" />
                  <span>Authorized access only. Keep your portfolio secure.</span>
                </div>

                {/* Back to Public Portfolio */}
                <button 
                  type="button" 
                  onClick={() => onNavigate('home')} 
                  className="login-return-btn-v2"
                >
                  &larr; Return to Public Portfolio
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="admin-modal-overlay" onClick={() => setShowForgotModal(false)}>
            <div className="admin-modal-card forgot-modal-card" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Admin Password Recovery</h3>
                <button type="button" className="modal-close-btn" onClick={() => setShowForgotModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body forgot-modal-body">
                <div className="forgot-icon-wrap">
                  <FaShieldAlt />
                </div>
                <p className="forgot-text-main">
                  For maximum security, this admin dashboard does not expose automated public password resets.
                </p>
                <div className="forgot-instructions">
                  <p><strong>To update your password:</strong></p>
                  <ul>
                    <li>Log in using your administrator credentials.</li>
                    <li>Navigate to <strong>Profile &rarr; Change Admin Password</strong> to securely update it in MySQL.</li>
                    <li>If you have lost your credentials, run a password reset query directly in your local MySQL database.</li>
                  </ul>
                </div>
                <button type="button" className="modal-btn-submit" onClick={() => setShowForgotModal(false)}>
                  Got it, return to login
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ====================================================
  // MAIN AUTHENTICATED ADMIN DASHBOARD
  // ====================================================
  return (
    <div className="portfolio-admin-root">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-brand" onClick={() => setActiveTab('dashboard')}>
          <img src="/images/controller_icon.png" alt="Gamepad" className="brand-gamepad-icon" />
          <div className="brand-text-col">
            <h1 className="brand-title">PORTFOLIO ADMIN</h1>
            <span className="brand-subtitle">Manage &bull; Create &bull; Grow</span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="admin-nav">
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <MdDashboard className="nav-icon" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <FaFolder className="nav-icon" />
            <span>Projects</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <FaEnvelope className="nav-icon" />
            <span>Messages</span>
            {stats.unreadMessages > 0 && (
              <span className="nav-badge-pill">{stats.unreadMessages}</span>
            )}
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            <FaTrophy className="nav-icon" />
            <span>Achievements</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'experience' ? 'active' : ''}`}
            onClick={() => setActiveTab('experience')}
          >
            <FaBriefcase className="nav-icon" />
            <span>Experience</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            <FaCode className="nav-icon" />
            <span>Skills</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'gaming' ? 'active' : ''}`}
            onClick={() => setActiveTab('gaming')}
          >
            <FaGamepad className="nav-icon" />
            <span>Gaming</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser className="nav-icon" />
            <span>Profile</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FaCog className="nav-icon" />
            <span>Site Settings</span>
          </button>
        </nav>

        {/* View Portfolio Return Link */}
        <div className="admin-return-link" onClick={() => onNavigate('home')}>
          <span>View Portfolio</span>
          <FaExternalLinkAlt className="return-icon" />
        </div>

        {/* Bottom Pixel Art Illustration Card */}
        <div className="sidebar-pixel-card">
          <div className="pixel-art-backdrop">
            <div className="pixel-sun"></div>
            <div className="pixel-skyline"></div>
            <div className="pixel-silhouette-hero"></div>
          </div>
          <div className="pixel-slogan-box">
            <span className="pixel-slogan-line">SAME PASSION</span>
            <span className="pixel-slogan-line">DIFFERENT LEVEL</span>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="admin-main-wrapper">
        
        {/* TOP HEADER */}
        <header className="admin-top-header">
          {/* Global Search Bar */}
          <div className="admin-search-bar" onClick={() => setIsSearchModalOpen(true)}>
            <FaSearch className="search-icon" />
            <span className="search-placeholder">Search anything...</span>
            <kbd className="search-shortcut">Ctrl K</kbd>
          </div>

          {/* Right Header Actions */}
          <div className="admin-header-right">
            
            {/* Notifications */}
            <div className="header-action-wrapper" onClick={(e) => { e.stopPropagation(); setNotificationOpen(!notificationOpen); }}>
              <button type="button" className="header-icon-btn" title="Notifications">
                <FaBell />
                {stats.unreadMessages > 0 && <span className="notification-red-dot"></span>}
              </button>

              {notificationOpen && (
                <div className="notification-dropdown-menu" onClick={e => e.stopPropagation()}>
                  <div className="notification-dropdown-header">
                    <h4>Notifications</h4>
                    <span className="badge">{stats.unreadMessages} New</span>
                  </div>
                  <div className="notification-list">
                    {messages.filter(m => !m.is_read).slice(0, 4).map(m => (
                      <div 
                        key={m.id} 
                        className="notification-item"
                        onClick={() => { setSelectedMessage(m); setNotificationOpen(false); }}
                      >
                        <span className="notif-sender">{m.name}</span>
                        <p className="notif-msg">{m.message.slice(0, 60)}...</p>
                        <span className="notif-time">{getRelativeTime(m.created_at)}</span>
                      </div>
                    ))}
                    {messages.filter(m => !m.is_read).length === 0 && (
                      <p className="no-notifs">No unread notifications.</p>
                    )}
                  </div>
                  <div className="notification-footer" onClick={() => { setActiveTab('messages'); setNotificationOpen(false); }}>
                    View All Messages &rarr;
                  </div>
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button 
              type="button" 
              className="header-icon-btn refresh-btn" 
              onClick={loadDashboardData}
              title="Refresh from MySQL"
            >
              <FaSyncAlt className={loading ? 'spinning' : ''} />
            </button>

            {/* User Profile Badge with Logout Dropdown */}
            <div className="profile-action-wrapper" onClick={(e) => { e.stopPropagation(); setProfileDropdownOpen(!profileDropdownOpen); }}>
              <div className="admin-profile-badge">
                <div className="admin-avatar-circle">
                  <span>{getInitials(adminProfile.full_name || 'Aditya Gore')}</span>
                </div>
                <div className="admin-user-info">
                  <span className="admin-name">{adminProfile.full_name || 'Aditya Gore'}</span>
                  <span className="admin-role">Admin</span>
                </div>
                <FaChevronDown className="dropdown-caret" />
              </div>

              {profileDropdownOpen && (
                <div className="profile-dropdown-menu" onClick={e => e.stopPropagation()}>
                  <div className="profile-dropdown-header">
                    <span className="user-label">LOGGED IN AS</span>
                    <strong className="user-username">{adminProfile.username || 'aditya'}</strong>
                    <span className="user-email" style={{ fontSize: '11px', color: 'var(--admin-text-secondary)', display: 'block', margin: '2px 0 6px' }}>
                      {adminProfile.email || 'adityagore@example.com'}
                    </span>
                    <span className="user-badge">JWT Authenticated</span>
                  </div>
                  <div className="profile-dropdown-actions">
                    <button type="button" onClick={() => { setActiveTab('profile'); setProfileDropdownOpen(false); }}>
                      <FaUser /> Profile Details
                    </button>
                    <button type="button" onClick={() => { setActiveTab('profile'); setProfileDropdownOpen(false); }}>
                      <FaKey /> Change Password
                    </button>
                    <button type="button" onClick={() => { setActiveTab('settings'); setProfileDropdownOpen(false); }}>
                      <FaCog /> Site Settings
                    </button>
                    <button type="button" className="logout-btn" onClick={handleLogout}>
                      <FaSignOutAlt /> Sign Out (Logout)
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* 3. TAB CONTENT */}
        <main className="admin-content-scroll">
          
          {/* ==================================================== */}
          {/* TAB 1: MAIN DASHBOARD OVERVIEW                       */}
          {/* ==================================================== */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-view-content">
              
              {/* Welcome Banner */}
              <section className="welcome-banner-row">
                <div className="welcome-text-col">
                  <h2 className="welcome-title">Welcome Back, {adminProfile.full_name || settings.admin_name || 'Aditya'}!</h2>
                  <p className="welcome-subtitle">
                    Manage your portfolio, track progress and keep building your story.
                  </p>
                </div>

                <div className="admin-quote-card">
                  <div className="quote-body">
                    <span className="quote-mark open">&ldquo;</span>
                    <span className="quote-text">{settings.admin_quote || 'Build. Improve. Repeat.'}</span>
                    <span className="quote-mark close">&rdquo;</span>
                  </div>
                  <span className="quote-author">&mdash; {adminProfile.full_name || settings.admin_name || 'Aditya Gore'}</span>
                  <div className="quote-controller-watermark">
                    <FaGamepad />
                  </div>
                </div>
              </section>

              {/* 4 Top Metric Cards */}
              <section className="stat-cards-grid">
                
                {/* Total Projects */}
                <div className="stat-card stat-projects">
                  <div className="stat-card-header">
                    <div className="stat-icon-wrap icon-blue">
                      <FaFolder />
                    </div>
                    <div className="stat-info-col">
                      <span className="stat-label">Total Projects</span>
                      <div className="stat-value-row">
                        <span className="stat-num">{stats.totalProjects}</span>
                        <span className="delta-badge delta-green">&uarr; {stats.projectsDelta}</span>
                      </div>
                    </div>
                  </div>
                  <div className="stat-progress-bar">
                    <div className="progress-fill fill-blue" style={{ width: '75%' }}></div>
                  </div>
                  <span className="stat-micro-text">Keep adding amazing work!</span>
                </div>

                {/* Total Messages */}
                <div className="stat-card stat-messages">
                  <div className="stat-card-header">
                    <div className="stat-icon-wrap icon-purple">
                      <FaEnvelope />
                    </div>
                    <div className="stat-info-col">
                      <span className="stat-label">Total Messages</span>
                      <div className="stat-value-row">
                        <span className="stat-num">{stats.totalMessages}</span>
                        <span className="delta-badge delta-green">&uarr; {stats.messagesDelta}</span>
                      </div>
                    </div>
                  </div>
                  <div className="stat-progress-bar">
                    <div className="progress-fill fill-purple" style={{ width: '60%' }}></div>
                  </div>
                  <span className="stat-micro-text">People are reaching out!</span>
                </div>

                {/* Total Views */}
                <div className="stat-card stat-views">
                  <div className="stat-card-header">
                    <div className="stat-icon-wrap icon-magenta">
                      <FaEye />
                    </div>
                    <div className="stat-info-col">
                      <span className="stat-label">Total Views</span>
                      <div className="stat-value-row">
                        <span className="stat-num">{stats.viewsFormatted ?? '0'}</span>
                        <span className="delta-badge delta-green">&uarr; {stats.viewsDelta}</span>
                      </div>
                    </div>
                  </div>
                  <div className="stat-progress-bar">
                    <div className="progress-fill fill-magenta" style={{ width: '85%' }}></div>
                  </div>
                  <span className="stat-micro-text">Your portfolio is getting noticed!</span>
                </div>

                {/* Achievements */}
                <div className="stat-card stat-achievements">
                  <div className="stat-card-header">
                    <div className="stat-icon-wrap icon-amber">
                      <FaTrophy />
                    </div>
                    <div className="stat-info-col">
                      <span className="stat-label">Achievements</span>
                      <div className="stat-value-row">
                        <span className="stat-num">{stats.totalAchievements}</span>
                        <span className="delta-badge delta-green">&uarr; {stats.achievementsDelta}</span>
                      </div>
                    </div>
                  </div>
                  <div className="stat-progress-bar">
                    <div className="progress-fill fill-amber" style={{ width: '70%' }}></div>
                  </div>
                  <span className="stat-micro-text">Keep going!</span>
                </div>

              </section>

              {/* Middle 3-Column Section: Recent Messages, Recent Projects, Quick Actions */}
              <section className="dashboard-middle-grid">
                
                {/* 1. Recent Messages */}
                <div className="dashboard-panel-card recent-messages-panel">
                  <div className="panel-header">
                    <h3 className="panel-title">Recent Messages</h3>
                    <button 
                      type="button" 
                      className="view-all-link-btn"
                      onClick={() => setActiveTab('messages')}
                    >
                      View All &rarr;
                    </button>
                  </div>

                  <div className="recent-messages-list">
                    {messages.slice(0, 5).map(msg => {
                      const initials = getInitials(msg.name);
                      return (
                        <div 
                          key={msg.id} 
                          className={`recent-msg-item ${!msg.is_read ? 'unread' : ''}`}
                          onClick={() => setSelectedMessage(msg)}
                        >
                          <div className={`avatar-initials color-${msg.name.charCodeAt(0) % 5}`}>
                            {initials}
                          </div>

                          <div className="msg-content-preview">
                            <div className="msg-preview-header">
                              <span className="msg-sender-name">{msg.name}</span>
                              <div className="msg-time-badge">
                                <span className="time-text">{getRelativeTime(msg.created_at)}</span>
                                {!msg.is_read && <span className="unread-dot"></span>}
                              </div>
                            </div>
                            <p className="msg-snippet-text">{msg.message}</p>
                          </div>
                        </div>
                      );
                    })}

                    {messages.length === 0 && (
                      <p className="empty-panel-text">No incoming messages yet.</p>
                    )}
                  </div>
                </div>

                {/* 2. Recent Projects */}
                <div className="dashboard-panel-card recent-projects-panel">
                  <div className="panel-header">
                    <h3 className="panel-title">Recent Projects</h3>
                    <button 
                      type="button" 
                      className="view-all-link-btn"
                      onClick={() => setActiveTab('projects')}
                    >
                      View All &rarr;
                    </button>
                  </div>

                  <div className="recent-projects-list">
                    {projects.slice(0, 3).map(proj => (
                      <div key={proj.id} className="recent-project-item">
                        <img 
                          src={proj.image || '/images/02_construction_project.png'} 
                          alt={proj.title} 
                          className="project-thumb-img" 
                        />
                        <div className="project-summary-col">
                          <div className="project-title-row">
                            <h4 className="project-item-title">{proj.title}</h4>
                            <div className="actions-menu-relative" onClick={(e) => e.stopPropagation()}>
                              <button 
                                type="button" 
                                className="three-dots-btn"
                                onClick={() => setActionMenuOpen(actionMenuOpen === proj.id ? null : proj.id)}
                              >
                                <FaEllipsisH />
                              </button>
                              {actionMenuOpen === proj.id && (
                                <div className="project-dropdown-actions">
                                  <button type="button" onClick={() => { handleOpenEditProject(proj); setActionMenuOpen(null); }}>
                                    <FaEdit /> Edit Project
                                  </button>
                                  <button type="button" onClick={() => onNavigate('project-detail', proj.slug || proj.id)}>
                                    <FaEye /> View in Portfolio
                                  </button>
                                  <button type="button" className="danger-text" onClick={(e) => { handleDeleteProject(proj.id, e); setActionMenuOpen(null); }}>
                                    <FaTrash /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="project-tags-row">
                            {Array.isArray(proj.tags) && proj.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="mini-tag-badge">{tag}</span>
                            ))}
                          </div>

                          <div className="project-published-status">
                            <span className="status-dot-green"></span>
                            <span className="status-text">{proj.published ? 'Published' : 'Draft'}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {projects.length === 0 && (
                      <p className="empty-panel-text">No projects added yet.</p>
                    )}
                  </div>
                </div>

                {/* 3. Quick Actions Column */}
                <div className="dashboard-panel-card quick-actions-panel">
                  <div className="panel-header">
                    <h3 className="panel-title">Quick Actions</h3>
                  </div>

                  <div className="quick-actions-col">
                    <button 
                      type="button" 
                      className="quick-action-btn btn-add-project"
                      onClick={handleOpenAddProject}
                    >
                      <FaPlus className="btn-icon" />
                      <span>Add New Project</span>
                    </button>

                    <button 
                      type="button" 
                      className="quick-action-btn btn-view-messages"
                      onClick={() => setActiveTab('messages')}
                    >
                      <FaEnvelope className="btn-icon" />
                      <span>View Messages</span>
                    </button>

                    <button 
                      type="button" 
                      className="quick-action-btn btn-add-achievement"
                      onClick={() => setIsAddAchievementModalOpen(true)}
                    >
                      <FaTrophy className="btn-icon" />
                      <span>Add Achievement</span>
                    </button>

                    <button 
                      type="button" 
                      className="quick-action-btn btn-update-experience"
                      onClick={() => setIsAddExperienceModalOpen(true)}
                    >
                      <FaBriefcase className="btn-icon" />
                      <span>Update Experience</span>
                    </button>

                    <button 
                      type="button" 
                      className="quick-action-btn btn-site-settings"
                      onClick={() => setActiveTab('settings')}
                    >
                      <FaCog className="btn-icon" />
                      <span>Site Settings</span>
                    </button>
                  </div>
                </div>

              </section>

              {/* Bottom Row: Visitors Overview (Bar Chart) & Site Status */}
              <section className="dashboard-bottom-grid">
                
                {/* Visitors Overview Chart */}
                <div className="dashboard-panel-card visitors-chart-panel">
                  <div className="panel-header">
                    <h3 className="panel-title">Visitors Overview</h3>
                    <div className="chart-dropdown-wrap">
                      <select 
                        value={visitorTimeRange} 
                        onChange={(e) => setVisitorTimeRange(e.target.value)}
                        className="chart-time-select"
                      >
                        <option value="30">Last 30 Days</option>
                        <option value="14">Last 14 Days</option>
                        <option value="7">Last 7 Days</option>
                      </select>
                    </div>
                  </div>

                  {/* Visual Bar Chart */}
                  <div className="chart-container">
                    <div className="chart-y-axis">
                      <span>150</span>
                      <span>100</span>
                      <span>50</span>
                      <span>0</span>
                    </div>

                    <div className="chart-bars-track">
                      {displayVisitors.map((item, idx) => {
                        const heightPct = Math.min(100, Math.max(8, (item.views / maxViews) * 100));
                        return (
                          <div key={idx} className="chart-bar-col" title={`${item.label}: ${item.views} visitors`}>
                            <div className="chart-bar-fill-wrap">
                              <div 
                                className="chart-bar-glow-fill" 
                                style={{ height: `${heightPct}%` }}
                              ></div>
                            </div>
                            {(idx % 4 === 0 || idx === displayVisitors.length - 1) && (
                              <span className="bar-date-label">{item.label}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Site Status Card */}
                <div className="dashboard-panel-card site-status-panel">
                  <div className="panel-header">
                    <h3 className="panel-title">Site Status</h3>
                    <span className="online-tag-badge">
                      <span className="status-dot-green"></span> Live Online
                    </span>
                  </div>

                  <div className="status-rows-list">
                    <div className="status-row-item">
                      <div className="status-left">
                        <span className="status-icon-emoji">🌐</span>
                        <span className="status-name">Portfolio Website</span>
                      </div>
                      <a 
                        href={settings.portfolio_url || 'https://adityagore.dev'} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="status-value-link"
                      >
                        {settings.portfolio_url || 'https://adityagore.dev'} <FaExternalLinkAlt className="inline-ext" />
                      </a>
                    </div>

                    <div className="status-row-item">
                      <div className="status-left">
                        <span className="status-icon-emoji">🗄️</span>
                        <span className="status-name">Database</span>
                      </div>
                      <span className="status-badge-val green-text">
                        <span className="status-dot-green"></span> {healthData.database || 'MySQL 9.5 Connected'} {healthData.dbLatencyMs ? `(${healthData.dbLatencyMs}ms)` : '(Active)'}
                      </span>
                    </div>

                    <div className="status-row-item">
                      <div className="status-left">
                        <span className="status-icon-emoji">✉️</span>
                        <span className="status-name">Contact Form</span>
                      </div>
                      <span className="status-badge-val green-text">
                        <span className="status-dot-green"></span> {stats.totalMessages || messages.length} Messages in DB
                      </span>
                    </div>

                    <div className="status-row-item">
                      <div className="status-left">
                        <span className="status-icon-emoji">🛡️</span>
                        <span className="status-name">Security</span>
                      </div>
                      <span className="status-badge-val green-text">
                        <span className="status-dot-green"></span> JWT Protected {healthData.uptimeSeconds ? `(${Math.floor(healthData.uptimeSeconds / 60)}m uptime)` : ''}
                      </span>
                    </div>

                    <div className="status-row-item">
                      <div className="status-left">
                        <span className="status-icon-emoji">⚡</span>
                        <span className="status-name">Server Memory</span>
                      </div>
                      <span className="status-badge-val green-text">
                        <span className="status-dot-green"></span> {healthData.memoryUsageMb || '28'}MB Node RAM &bull; {stats.totalProjects} Projects
                      </span>
                    </div>
                  </div>
                </div>

              </section>

            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: PROJECTS MANAGEMENT                           */}
          {/* ==================================================== */}
          {activeTab === 'projects' && (
            <div className="admin-subview-content">
              <div className="subview-header">
                <div>
                  <h2 className="subview-title">Projects Management</h2>
                  <p className="subview-desc">Add, edit, publish, or delete projects stored with UUIDs in MySQL.</p>
                </div>
                <button type="button" className="subview-action-btn primary" onClick={handleOpenAddProject}>
                  <FaPlus /> Add New Project
                </button>
              </div>

              <div className="projects-grid-manage">
                {projects.map(proj => (
                  <div key={proj.id} className="project-manage-card">
                    <img src={proj.image || '/images/02_construction_project.png'} alt={proj.title} className="manage-card-img" />
                    <div className="manage-card-body">
                      <div className="card-top-status">
                        <span className={`pill-badge ${proj.published ? 'published' : 'draft'}`}>
                          {proj.published ? 'Published' : 'Draft'}
                        </span>
                        <span className="card-category">{proj.category || 'Full Stack'}</span>
                      </div>
                      <h3 className="manage-project-title">{proj.title}</h3>
                      <p className="manage-project-desc">{proj.shortDescription}</p>
                      <div className="manage-tags-row">
                        {Array.isArray(proj.tags) && proj.tags.map((t, i) => (
                          <span key={i} className="mini-tag-badge">{t}</span>
                        ))}
                      </div>
                      <div className="manage-card-actions">
                        <button type="button" className="btn-icon-action" onClick={() => handleOpenEditProject(proj)} title="Edit Project">
                          <FaEdit /> Edit
                        </button>
                        <button type="button" className="btn-icon-action" onClick={() => onNavigate('project-detail', proj.slug || proj.id)} title="View in Portfolio">
                          <FaEye /> Preview
                        </button>
                        <button type="button" className="btn-icon-action danger" onClick={(e) => handleDeleteProject(proj.id, e)} title="Delete Project">
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: MESSAGES INBOX                                */}
          {/* ==================================================== */}
          {activeTab === 'messages' && (
            <div className="admin-subview-content">
              <div className="subview-header">
                <div>
                  <h2 className="subview-title">Contact Messages ({messages.length})</h2>
                  <p className="subview-desc">Read and manage transmissions sent via the portfolio contact form.</p>
                </div>
                <div className="subview-filter-chips">
                  <span className="filter-stat">Unread: <strong>{stats.unreadMessages}</strong></span>
                </div>
              </div>

              <div className="messages-full-list">
                {messages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`message-full-row ${!msg.is_read ? 'unread' : 'read'}`}
                    onClick={() => setSelectedMessage(msg)}
                  >
                    <div className="msg-row-initials">{getInitials(msg.name)}</div>
                    <div className="msg-row-details">
                      <div className="msg-row-sender-line">
                        <span className="msg-row-name">{msg.name}</span>
                        <span className="msg-row-email">&lt;{msg.email}&gt;</span>
                        <span className="msg-row-time">{getRelativeTime(msg.created_at)}</span>
                        {!msg.is_read && <span className="unread-dot"></span>}
                      </div>
                      <div className="msg-row-subject">{msg.subject || 'General Inquiry'}</div>
                      <p className="msg-row-body">{msg.message}</p>
                    </div>
                    <div className="msg-row-actions" onClick={e => e.stopPropagation()}>
                      <button 
                        type="button" 
                        className="msg-action-btn" 
                        onClick={(e) => handleToggleMessageRead(msg.id, msg.is_read, e)}
                        title={msg.is_read ? "Mark as Unread" : "Mark as Read"}
                      >
                        <MdOutlineMarkEmailRead />
                      </button>
                      <button 
                        type="button" 
                        className="msg-action-btn danger" 
                        onClick={(e) => handleDeleteMessage(msg.id, e)}
                        title="Delete Message"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}

                {messages.length === 0 && (
                  <div className="empty-subview-box">
                    <FaEnvelope className="empty-icon" />
                    <p>No messages received yet. Submit a message via the Contact page to test!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: ACHIEVEMENTS                                  */}
          {/* ==================================================== */}
          {activeTab === 'achievements' && (
            <div className="admin-subview-content">
              <div className="subview-header">
                <div>
                  <h2 className="subview-title">Achievements &amp; Certifications</h2>
                  <p className="subview-desc">Manage verified credentials, awards, and milestones (UUID keys).</p>
                </div>
                <button type="button" className="subview-action-btn primary" onClick={() => setIsAddAchievementModalOpen(true)}>
                  <FaPlus /> Add Achievement
                </button>
              </div>

              <div className="achievements-admin-list">
                {achievements.map(ach => (
                  <div key={ach.id} className="achievement-admin-card">
                    <div className="achievement-icon-circle">
                      <FaTrophy />
                    </div>
                    <div className="achievement-body">
                      <div className="achievement-header-row">
                        <h4 className="achievement-title">{ach.title}</h4>
                        <span className="achievement-year">{ach.year}</span>
                      </div>
                      <span className="achievement-org">{ach.organization}</span>
                      <p className="achievement-desc">{ach.description}</p>
                    </div>
                    <button 
                      type="button" 
                      className="card-delete-btn" 
                      onClick={() => handleDeleteAchievement(ach.id)}
                      title="Delete Achievement"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 5: EXPERIENCE                                    */}
          {/* ==================================================== */}
          {activeTab === 'experience' && (
            <div className="admin-subview-content">
              <div className="subview-header">
                <div>
                  <h2 className="subview-title">Work Experience &amp; Timeline</h2>
                  <p className="subview-desc">Manage internships, developer roles, and projects (UUID keys).</p>
                </div>
                <button type="button" className="subview-action-btn primary" onClick={() => setIsAddExperienceModalOpen(true)}>
                  <FaPlus /> Add Experience
                </button>
              </div>

              <div className="experience-admin-list">
                {experiences.map(exp => (
                  <div key={exp.id} className="experience-admin-card">
                    <div className="exp-icon-circle">
                      <FaBriefcase />
                    </div>
                    <div className="exp-body">
                      <div className="exp-header-row">
                        <h4 className="exp-role">{exp.role}</h4>
                        <span className="exp-period">{exp.period}</span>
                      </div>
                      <span className="exp-company">{exp.company}</span>
                      <p className="exp-desc">{exp.description}</p>
                      <div className="exp-skills-row">
                        {Array.isArray(exp.skills) && exp.skills.map((s, idx) => (
                          <span key={idx} className="mini-tag-badge">{s}</span>
                        ))}
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="card-delete-btn" 
                      onClick={() => handleDeleteExperience(exp.id)}
                      title="Delete Experience"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 6: GAMING / BREAK STATS                          */}
          {/* ==================================================== */}
          {activeTab === 'gaming' && (
            <div className="admin-subview-content">
              <div className="subview-header">
                <div>
                  <h2 className="subview-title">Take A Break - Game Center</h2>
                  <p className="subview-desc">Live player telemetry and scores recorded dynamically in MySQL.</p>
                </div>
                <button type="button" className="subview-action-btn primary" onClick={() => onNavigate('game')}>
                  <FaGamepad /> Play Game Now
                </button>
              </div>

              <div className="gaming-stats-grid">
                <div className="stat-card">
                  <span className="stat-label">Total Plays Recorded</span>
                  <div className="stat-value-row">
                    <span className="stat-num">{gamingStats.totalPlays || 0}</span>
                    <span className="delta-badge delta-green">&uarr; Runs</span>
                  </div>
                  <span className="stat-micro-text">Zero external libraries &bull; HTML5 Canvas</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Total Bugs Squashed</span>
                  <div className="stat-value-row">
                    <span className="stat-num">{gamingStats.totalBugsSquashed || 0}</span>
                    <span className="delta-badge delta-green">&uarr; Bugs</span>
                  </div>
                  <span className="stat-micro-text">Red Bug Spiders &amp; Green Glitch Flies</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Fastest Victory Run</span>
                  <div className="stat-value-row">
                    <span className="stat-num">{gamingStats.bestTimeFormatted || '--:--'}</span>
                    <span className="delta-badge delta-green">&uarr; Record</span>
                  </div>
                  <span className="stat-micro-text">Accurate Frozen Victory Clock</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Most Played Hero</span>
                  <div className="stat-value-row">
                    <span className="stat-num">{gamingStats.favoriteHero || 'Aditya'}</span>
                    <span className="delta-badge delta-green">Hero Pick</span>
                  </div>
                  <span className="stat-micro-text">HD 128x128 Pixel Art Characters</span>
                </div>
              </div>

              {/* Recent Scores Leaderboard Panel */}
              <div className="dashboard-panel-card gaming-scores-panel" style={{ marginTop: '24px' }}>
                <div className="panel-header">
                  <h3 className="panel-title">Recent Game Runs (MySQL Telemetry)</h3>
                  <span className="badge">{gamingStats.recentScores?.length || 0} Logged</span>
                </div>
                <div className="table-responsive-wrapper">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Hero</th>
                        <th>Player</th>
                        <th>Outcome</th>
                        <th>Time Elapsed</th>
                        <th>Bugs Squashed</th>
                        <th>Recorded At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gamingStats.recentScores && gamingStats.recentScores.length > 0 ? (
                        gamingStats.recentScores.map((run) => (
                          <tr key={run.id}>
                            <td>
                              <span className="hero-badge">{run.character_chosen}</span>
                            </td>
                            <td><strong>{run.player_name}</strong></td>
                            <td>
                              <span className={`outcome-pill ${run.outcome === 'VICTORY' ? 'win' : 'loss'}`}>
                                {run.outcome}
                              </span>
                            </td>
                            <td>{run.time_seconds}s</td>
                            <td>{run.bugs_squashed}</td>
                            <td>{getRelativeTime(run.created_at)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--admin-text-muted)' }}>
                            No game scores logged yet. Play the mini-game to record scores!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 7: PROFILE & SECURITY                            */}
          {/* ==================================================== */}
          {activeTab === 'profile' && (
            <div className="admin-subview-content">
              <div className="subview-header">
                <div>
                  <h2 className="subview-title">Admin Profile &amp; Security</h2>
                  <p className="subview-desc">Manage administrative details and credentials securely in MySQL.</p>
                </div>
              </div>

              {/* Profile Details Card */}
              <div className="profile-edit-card">
                <div className="profile-banner-top">
                  <div className="profile-avatar-large">
                    <span>{getInitials(adminProfile.full_name || 'Aditya Gore')}</span>
                  </div>
                  <div className="profile-banner-text">
                    <h3>{adminProfile.full_name || 'Aditya Gore'}</h3>
                    <p>{settings.admin_tagline || 'Full Stack Web Developer • Database Administrator'}</p>
                  </div>
                </div>

                {profileStatus.message && (
                  <div className={`password-status-banner ${profileStatus.type}`} style={{ marginBottom: '18px' }}>
                    {profileStatus.type === 'success' ? <FaCheckCircle /> : <FaTimes />}
                    <span>{profileStatus.message}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile}>
                  <div className="profile-details-grid">
                    <div className="profile-field">
                      <label>Full Name *</label>
                      <input 
                        type="text" 
                        required 
                        value={adminProfile.full_name || ''} 
                        onChange={(e) => setAdminProfile({ ...adminProfile, full_name: e.target.value })}
                        className="admin-input" 
                        placeholder="Aditya Gore"
                      />
                    </div>
                    <div className="profile-field">
                      <label>Admin Username *</label>
                      <input 
                        type="text" 
                        required 
                        value={adminProfile.username || ''} 
                        onChange={(e) => setAdminProfile({ ...adminProfile, username: e.target.value })}
                        className="admin-input" 
                        placeholder="aditya"
                      />
                    </div>
                    <div className="profile-field">
                      <label>Contact Email *</label>
                      <input 
                        type="email" 
                        required 
                        value={adminProfile.email || ''} 
                        onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                        className="admin-input" 
                        placeholder="adityagore@example.com"
                      />
                    </div>
                    <div className="profile-field">
                      <label>LinkedIn Profile URL</label>
                      <input 
                        type="text" 
                        value={adminProfile.linkedin_url || ''} 
                        onChange={(e) => setAdminProfile({ ...adminProfile, linkedin_url: e.target.value })}
                        className="admin-input" 
                        placeholder="https://www.linkedin.com/in/aditya-gore-b37233266/"
                      />
                    </div>
                    <div className="profile-field">
                      <label>GitHub Profile URL</label>
                      <input 
                        type="text" 
                        value={adminProfile.github_url || ''} 
                        onChange={(e) => setAdminProfile({ ...adminProfile, github_url: e.target.value })}
                        className="admin-input" 
                        placeholder="https://github.com/Aditya-Gore22"
                      />
                    </div>
                    <div className="profile-field">
                      <label>Database Security &amp; Keys</label>
                      <input 
                        type="text" 
                        readOnly 
                        value="MySQL 9.5 • bcrypt Salt 10 • UUID v4" 
                        className="admin-input read-only" 
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" disabled={isSavingProfile} className="subview-action-btn primary">
                      {isSavingProfile ? (
                        <>
                          <FaSpinner className="spinning" />
                          <span>Saving Profile to MySQL...</span>
                        </>
                      ) : (
                        <>
                          <FaSave />
                          <span>Save Profile Details</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* CHANGE PASSWORD & SECURITY SECTION */}
              <div className="profile-security-card">
                <div className="profile-card-header">
                  <div className="card-header-icon-wrap">
                    <FaKey className="card-header-icon" />
                  </div>
                  <div>
                    <h3 className="profile-section-title">Change Admin Password</h3>
                    <p className="profile-section-subtitle">
                      Update your administrator password in the MySQL database. Once changed, only you with this new password will be able to log in.
                    </p>
                  </div>
                </div>

                {passwordStatus.message && (
                  <div className={`password-status-banner ${passwordStatus.type}`}>
                    {passwordStatus.type === 'success' ? <FaCheckCircle /> : <FaTimes />}
                    <span>{passwordStatus.message}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="change-password-form">
                  <div className="form-group">
                    <label>Current Password *</label>
                    <div className="input-with-eye-wrap">
                      <input 
                        type={showCurrentPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter current password"
                        className="admin-input"
                        value={passwordForm.currentPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      />
                      <button 
                        type="button" 
                        className="field-eye-btn"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        title={showCurrentPassword ? 'Hide password' : 'Show password'}
                        tabIndex="-1"
                      >
                        {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="password-dual-row">
                    <div className="form-group">
                      <label>New Password * (Min 6 characters)</label>
                      <div className="input-with-eye-wrap">
                        <input 
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          placeholder="Enter new password"
                          className="admin-input"
                          value={passwordForm.newPassword}
                          onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        />
                        <button 
                          type="button" 
                          className="field-eye-btn"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          title={showNewPassword ? 'Hide password' : 'Show password'}
                          tabIndex="-1"
                        >
                          {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Confirm New Password *</label>
                      <div className="input-with-eye-wrap">
                        <input 
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          placeholder="Confirm new password"
                          className="admin-input"
                          value={passwordForm.confirmPassword}
                          onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        />
                        <button 
                          type="button" 
                          className="field-eye-btn"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          title={showConfirmPassword ? 'Hide password' : 'Show password'}
                          tabIndex="-1"
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="password-actions-row">
                    <button 
                      type="submit" 
                      disabled={isChangingPassword} 
                      className="subview-action-btn primary"
                    >
                      {isChangingPassword ? (
                        <>
                          <FaSpinner className="spinning" />
                          <span>Updating in MySQL Database...</span>
                        </>
                      ) : (
                        <>
                          <FaKey />
                          <span>Update Password in Database</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 8: SITE SETTINGS                                 */}
          {/* ==================================================== */}
          {activeTab === 'settings' && (
            <div className="admin-subview-content">
              <div className="subview-header">
                <div>
                  <h2 className="subview-title">Site Settings</h2>
                  <p className="subview-desc">Configure portfolio metadata, quote, and database sync.</p>
                </div>
              </div>

              <form className="settings-form-card" onSubmit={handleSaveSettings}>
                <div className="settings-field">
                  <label>Portfolio Site Title</label>
                  <input 
                    type="text" 
                    className="admin-input"
                    value={settings.site_title || ''}
                    onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                    placeholder="Aditya Gore | Full Stack Developer Portfolio"
                  />
                </div>

                <div className="settings-field">
                  <label>Admin Display Name</label>
                  <input 
                    type="text" 
                    className="admin-input"
                    value={settings.admin_name || ''}
                    onChange={(e) => setSettings({ ...settings, admin_name: e.target.value })}
                    placeholder="Aditya Gore"
                  />
                </div>

                <div className="settings-field">
                  <label>Admin Tagline / Role</label>
                  <input 
                    type="text" 
                    className="admin-input"
                    value={settings.admin_tagline || ''}
                    onChange={(e) => setSettings({ ...settings, admin_tagline: e.target.value })}
                    placeholder="Full Stack Web Developer &bull; Database Administrator"
                  />
                </div>

                <div className="settings-field">
                  <label>Welcome Quote / Motto</label>
                  <input 
                    type="text" 
                    className="admin-input"
                    value={settings.admin_quote || ''}
                    onChange={(e) => setSettings({ ...settings, admin_quote: e.target.value })}
                    placeholder="Build. Improve. Repeat."
                  />
                </div>

                <div className="settings-field">
                  <label>Portfolio Website URL</label>
                  <input 
                    type="text" 
                    className="admin-input"
                    value={settings.portfolio_url || ''}
                    onChange={(e) => setSettings({ ...settings, portfolio_url: e.target.value })}
                    placeholder="https://adityagore.dev"
                  />
                </div>

                <div className="settings-field">
                  <label>Contact Email Address</label>
                  <input 
                    type="email" 
                    className="admin-input"
                    value={settings.contact_email || ''}
                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                    placeholder="adityagore@example.com"
                  />
                </div>

                <div className="settings-field">
                  <label>GitHub Profile URL</label>
                  <input 
                    type="text" 
                    className="admin-input"
                    value={settings.github_url || ''}
                    onChange={(e) => setSettings({ ...settings, github_url: e.target.value })}
                    placeholder="https://github.com/adityagore"
                  />
                </div>

                <div className="settings-field">
                  <label>LinkedIn Profile URL</label>
                  <input 
                    type="text" 
                    className="admin-input"
                    value={settings.linkedin_url || ''}
                    onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/adityagore"
                  />
                </div>

                <button type="submit" className="subview-action-btn primary" style={{ marginTop: '10px' }}>
                  <FaSave /> Save Changes to MySQL Database
                </button>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 9: SKILLS (DYNAMIC MYSQL)                        */}
          {/* ==================================================== */}
          {activeTab === 'skills' && (
            <div className="admin-subview-content">
              <div className="subview-header">
                <div>
                  <h2 className="subview-title">Skills &amp; Technologies</h2>
                  <p className="subview-desc">Tech stack stored dynamically in MySQL with UUID primary keys.</p>
                </div>
                <button type="button" className="subview-action-btn primary" onClick={handleOpenAddSkill}>
                  <FaPlus /> Add New Skill
                </button>
              </div>

              <div className="skills-cards-grid">
                {skills && skills.length > 0 ? (
                  skills.map((s) => (
                    <div key={s.id} className="skill-card-dynamic">
                      <div className="skill-card-top">
                        <div className="skill-card-meta">
                          <FaCode className="skill-icon" />
                          <span className="skill-name">{s.name}</span>
                        </div>
                        <span className="skill-cat-badge">{s.category || 'Tech'}</span>
                      </div>
                      
                      <div className="skill-prof-row">
                        <span className="prof-label">Proficiency</span>
                        <span className="prof-val">{s.proficiency || 80}%</span>
                      </div>
                      <div className="skill-progress-bar">
                        <div 
                          className="skill-progress-fill" 
                          style={{ width: `${s.proficiency || 80}%` }}
                        ></div>
                      </div>

                      <div className="skill-card-actions">
                        <button 
                          type="button" 
                          className="skill-delete-btn" 
                          onClick={() => handleDeleteSkill(s.id)}
                          title="Delete skill from MySQL"
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-panel-text">No skills in database yet. Click &quot;Add New Skill&quot; to create one!</p>
                )}
              </div>
            </div>
          )}

        </main>

        {/* 4. FOOTER */}
        <footer className="admin-footer">
          <span className="footer-copyright">
            &copy; {new Date().getFullYear()} Aditya Gore. Admin Panel. Keep Building!
          </span>
          <div className="footer-tagline">
            <span>Play. Learn. Build. Repeat.</span>
            <img src="/images/controller_icon.png" alt="Gamepad" className="footer-gamepad-icon" />
          </div>
        </footer>

      </div>

      {/* ==================================================== */}
      {/* MODAL 1: ADD / EDIT PROJECT (MULTIPART UPLOAD WITH UUID) */}
      {/* ==================================================== */}
      {isAddProjectModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsAddProjectModalOpen(false)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setIsAddProjectModalOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSaveProject}>
              <div className="form-group">
                <label>Project Title *</label>
                <input 
                  type="text" 
                  required 
                  className="admin-input" 
                  placeholder="e.g. Construction Management System"
                  value={projectForm.title}
                  onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Short Description *</label>
                <textarea 
                  required 
                  rows="2" 
                  className="admin-input"
                  placeholder="Brief 1-2 sentence overview"
                  value={projectForm.shortDescription}
                  onChange={e => setProjectForm({ ...projectForm, shortDescription: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input 
                  type="text" 
                  className="admin-input"
                  placeholder="Full Stack / Frontend / Mobile"
                  value={projectForm.category}
                  onChange={e => setProjectForm({ ...projectForm, category: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Technologies / Tags (comma separated)</label>
                <input 
                  type="text" 
                  className="admin-input"
                  placeholder="React, Node.js, MySQL, Express"
                  value={projectForm.tags}
                  onChange={e => setProjectForm({ ...projectForm, tags: e.target.value })}
                />
              </div>

              {/* MULTIPART PHOTO UPLOAD SECTION */}
              <div className="form-group upload-form-group">
                <label>Project Image (Multipart Upload / Random UUID Renamed)</label>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  onChange={handleImageFileChange} 
                  style={{ display: 'none' }} 
                />

                <div className="upload-interactive-area">
                  <div className="upload-preview-box">
                    {projectForm.image ? (
                      <img src={projectForm.image} alt="Preview" className="upload-thumb-preview" />
                    ) : (
                      <div className="upload-empty-placeholder">No Image</div>
                    )}
                  </div>

                  <div className="upload-actions-box">
                    <button 
                      type="button" 
                      className="upload-browse-btn"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <>
                          <FaSpinner className="spinning" />
                          <span>Uploading &amp; Renaming...</span>
                        </>
                      ) : (
                        <>
                          <FaUpload />
                          <span>Upload New Photo (Multipart)</span>
                        </>
                      )}
                    </button>
                    <span className="upload-help-text">
                      Files are renamed with a unique random UUID on the server to prevent duplicates.
                    </span>
                    {uploadError && <span className="upload-error-text">{uploadError}</span>}
                  </div>
                </div>

                {/* Direct URL alternative */}
                <div className="manual-url-wrap">
                  <label className="sub-label">Or Image Path / URL:</label>
                  <input 
                    type="text" 
                    className="admin-input"
                    placeholder="/uploads/... or /images/..."
                    value={projectForm.image}
                    onChange={e => setProjectForm({ ...projectForm, image: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Live Demo URL</label>
                  <input 
                    type="url" 
                    className="admin-input"
                    placeholder="https://demo.example.com"
                    value={projectForm.liveDemoUrl}
                    onChange={e => setProjectForm({ ...projectForm, liveDemoUrl: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>GitHub Repository URL</label>
                  <input 
                    type="url" 
                    className="admin-input"
                    placeholder="https://github.com/..."
                    value={projectForm.githubUrl}
                    onChange={e => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-checkbox-row">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={projectForm.published}
                    onChange={e => setProjectForm({ ...projectForm, published: e.target.checked })}
                  />
                  <span>Published &bull; Show on public portfolio</span>
                </label>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="modal-btn-cancel" onClick={() => setIsAddProjectModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-btn-submit">
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: MESSAGE DETAIL VIEWER                       */}
      {/* ==================================================== */}
      {selectedMessage && (
        <div className="admin-modal-overlay" onClick={() => setSelectedMessage(null)}>
          <div className="admin-modal-card message-reader-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="message-modal-sender">
                <div className="avatar-initials color-2">{getInitials(selectedMessage.name)}</div>
                <div>
                  <h3 className="modal-title">{selectedMessage.name}</h3>
                  <span className="sender-email">&lt;{selectedMessage.email}&gt;</span>
                </div>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setSelectedMessage(null)}>
                <FaTimes />
              </button>
            </div>

            <div className="message-meta-bar">
              <span className="msg-subject-tag">Subject: <strong>{selectedMessage.subject || 'General Inquiry'}</strong></span>
              <span className="msg-date-tag">{new Date(selectedMessage.created_at).toLocaleString()}</span>
            </div>

            <div className="message-full-body">
              <p>{selectedMessage.message}</p>
            </div>

            <div className="modal-footer-actions space-between">
              <div className="left-actions">
                <button 
                  type="button" 
                  className="modal-btn-cancel danger-btn"
                  onClick={(e) => handleDeleteMessage(selectedMessage.id, e)}
                >
                  <FaTrash /> Delete
                </button>
                <button 
                  type="button" 
                  className="modal-btn-cancel"
                  onClick={(e) => handleToggleMessageRead(selectedMessage.id, selectedMessage.is_read, e)}
                >
                  {selectedMessage.is_read ? 'Mark as Unread' : 'Mark as Read'}
                </button>
              </div>
              <a 
                href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || 'Portfolio Inquiry')}`}
                className="modal-btn-submit reply-link"
              >
                <FaReply /> Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: ADD ACHIEVEMENT                            */}
      {/* ==================================================== */}
      {isAddAchievementModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsAddAchievementModalOpen(false)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Achievement</h3>
              <button type="button" className="modal-close-btn" onClick={() => setIsAddAchievementModalOpen(false)}>
                <FaTimes />
              </button>
            </div>
            <form className="modal-form" onSubmit={handleSaveAchievement}>
              <div className="form-group">
                <label>Title *</label>
                <input 
                  type="text" 
                  required 
                  className="admin-input"
                  placeholder="e.g. Full Stack Web Development Certification"
                  value={achievementForm.title}
                  onChange={e => setAchievementForm({ ...achievementForm, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Organization</label>
                <input 
                  type="text" 
                  className="admin-input"
                  placeholder="e.g. Meta / Coursera"
                  value={achievementForm.organization}
                  onChange={e => setAchievementForm({ ...achievementForm, organization: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Year</label>
                <input 
                  type="text" 
                  className="admin-input"
                  placeholder="2024"
                  value={achievementForm.year}
                  onChange={e => setAchievementForm({ ...achievementForm, year: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  rows="2" 
                  className="admin-input"
                  placeholder="Key highlight or accomplishment..."
                  value={achievementForm.description}
                  onChange={e => setAchievementForm({ ...achievementForm, description: e.target.value })}
                />
              </div>
              <div className="modal-footer-actions">
                <button type="button" className="modal-btn-cancel" onClick={() => setIsAddAchievementModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-btn-submit">
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: ADD EXPERIENCE                             */}
      {/* ==================================================== */}
      {isAddExperienceModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsAddExperienceModalOpen(false)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Work Experience</h3>
              <button type="button" className="modal-close-btn" onClick={() => setIsAddExperienceModalOpen(false)}>
                <FaTimes />
              </button>
            </div>
            <form className="modal-form" onSubmit={handleSaveExperience}>
              <div className="form-group">
                <label>Role / Position *</label>
                <input 
                  type="text" 
                  required 
                  className="admin-input"
                  placeholder="e.g. Full Stack Developer Intern"
                  value={experienceForm.role}
                  onChange={e => setExperienceForm({ ...experienceForm, role: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Company / Organization *</label>
                <input 
                  type="text" 
                  required 
                  className="admin-input"
                  placeholder="e.g. TechCorp Solutions"
                  value={experienceForm.company}
                  onChange={e => setExperienceForm({ ...experienceForm, company: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Time Period</label>
                <input 
                  type="text" 
                  className="admin-input"
                  placeholder="e.g. Jan 2024 - Present"
                  value={experienceForm.period}
                  onChange={e => setExperienceForm({ ...experienceForm, period: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Skills Used (comma separated)</label>
                <input 
                  type="text" 
                  className="admin-input"
                  placeholder="React, Node.js, MySQL, REST API"
                  value={experienceForm.skills}
                  onChange={e => setExperienceForm({ ...experienceForm, skills: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Job Description</label>
                <textarea 
                  rows="2" 
                  className="admin-input"
                  placeholder="What you built, maintained, or improved..."
                  value={experienceForm.description}
                  onChange={e => setExperienceForm({ ...experienceForm, description: e.target.value })}
                />
              </div>
              <div className="modal-footer-actions">
                <button type="button" className="modal-btn-cancel" onClick={() => setIsAddExperienceModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-btn-submit">
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 5: GLOBAL SEARCH (CTRL + K)                   */}
      {/* ==================================================== */}
      {isSearchModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsSearchModalOpen(false)}>
          <div className="admin-search-modal" onClick={e => e.stopPropagation()}>
            <div className="search-modal-header">
              <FaSearch className="modal-search-icon" />
              <input 
                type="text" 
                autoFocus 
                className="search-modal-input" 
                placeholder="Search projects, messages, sections... (Press ESC to exit)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button type="button" className="modal-close-btn" onClick={() => setIsSearchModalOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="search-modal-results">
              {searchQuery.trim() === '' ? (
                <div className="search-quick-links">
                  <span className="search-group-title">Navigation</span>
                  <div className="search-result-item" onClick={() => { setActiveTab('dashboard'); setIsSearchModalOpen(false); }}>
                    <MdDashboard className="res-icon" /> Dashboard Overview
                  </div>
                  <div className="search-result-item" onClick={() => { setActiveTab('projects'); setIsSearchModalOpen(false); }}>
                    <FaFolder className="res-icon" /> Projects Manager
                  </div>
                  <div className="search-result-item" onClick={() => { setActiveTab('messages'); setIsSearchModalOpen(false); }}>
                    <FaEnvelope className="res-icon" /> Messages Inbox
                  </div>
                  <div className="search-result-item" onClick={() => { handleOpenAddProject(); setIsSearchModalOpen(false); }}>
                    <FaPlus className="res-icon" /> Create New Project
                  </div>
                </div>
              ) : (
                <div className="search-results-list">
                  <span className="search-group-title">Matching Projects ({filteredProjects.length})</span>
                  {filteredProjects.map(p => (
                    <div 
                      key={p.id} 
                      className="search-result-item"
                      onClick={() => {
                        setActiveTab('projects');
                        setIsSearchModalOpen(false);
                      }}
                    >
                      <FaFolder className="res-icon" />
                      <div className="res-text">
                        <span className="res-title">{p.title}</span>
                        <span className="res-desc">{p.shortDescription}</span>
                      </div>
                    </div>
                  ))}

                  <span className="search-group-title">Matching Messages ({filteredMessages.length})</span>
                  {filteredMessages.map(m => (
                    <div 
                      key={m.id} 
                      className="search-result-item"
                      onClick={() => {
                        setSelectedMessage(m);
                        setIsSearchModalOpen(false);
                      }}
                    >
                      <FaEnvelope className="res-icon" />
                      <div className="res-text">
                        <span className="res-title">{m.name}</span>
                        <span className="res-desc">{m.message}</span>
                      </div>
                    </div>
                  ))}

                  {filteredProjects.length === 0 && filteredMessages.length === 0 && (
                    <p className="no-search-results">No results found for &ldquo;{searchQuery}&rdquo;</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 6: ADD NEW SKILL (DYNAMIC MYSQL + UUID)        */}
      {/* ==================================================== */}
      {isAddSkillModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsAddSkillModalOpen(false)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Tech Skill to MySQL</h3>
              <button type="button" className="modal-close-btn" onClick={() => setIsAddSkillModalOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSaveSkill}>
              <div className="form-group">
                <label>Skill Name *</label>
                <input 
                  type="text" 
                  required 
                  className="admin-input" 
                  placeholder="e.g. Next.js, Docker, Tailwind CSS"
                  value={skillForm.name}
                  onChange={e => setSkillForm({ ...skillForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select 
                  className="admin-input"
                  value={skillForm.category}
                  onChange={e => setSkillForm({ ...skillForm, category: e.target.value })}
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Database">Database</option>
                  <option value="Tools">Tools &amp; DevOps</option>
                  <option value="Languages">Languages</option>
                </select>
              </div>

              <div className="form-group">
                <label>Proficiency: {skillForm.proficiency}%</label>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  step="5"
                  className="admin-slider"
                  value={skillForm.proficiency}
                  onChange={e => setSkillForm({ ...skillForm, proficiency: parseInt(e.target.value, 10) })}
                />
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="modal-btn-cancel" onClick={() => setIsAddSkillModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-btn-submit">
                  Save Skill in Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
