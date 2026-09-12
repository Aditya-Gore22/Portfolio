import React, { useState } from 'react';
import './ContactPage.css';
import { FiUser, FiMail, FiList, FiMessageSquare, FiSend, FiBriefcase, FiUsers } from 'react-icons/fi';
import { FaLinkedinIn, FaGithub } from 'react-icons/fa';
import { useSettings } from '../context/SettingsContext.jsx';

const ContactPage = ({ onNavigate }) => {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Job Opportunity',
    message: ''
  });

  const [status, setStatus] = useState({
    submitting: false,
    success: false,
    error: null,
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'message' && value.length > 500) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectTopic = (topic) => {
    setFormData(prev => ({ ...prev, subject: topic }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus({
        submitting: false,
        success: false,
        error: 'Please fill out all required fields.',
        message: ''
      });
      return;
    }

    setStatus({ submitting: true, success: false, error: null, message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus({
          submitting: false,
          success: true,
          error: null,
          message: data.message || 'Transmission received! I will respond to your quest shortly.'
        });
        setFormData({
          name: '',
          email: '',
          subject: 'Job Opportunity',
          message: ''
        });
      } else {
        setStatus({
          submitting: false,
          success: false,
          error: data.message || 'Failed to transmit message. Please try again.',
          message: ''
        });
      }
    } catch (err) {
      console.error('Submission error:', err);
      // Fallback: if server endpoint unreachable via proxy, try direct port 5000
      try {
        const fallbackRes = await fetch('http://localhost:5000/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok && fallbackData.success) {
          setStatus({
            submitting: false,
            success: true,
            error: null,
            message: fallbackData.message || 'Transmission received!'
          });
          setFormData({ name: '', email: '', subject: 'Job Opportunity', message: '' });
          return;
        }
      } catch (fallbackErr) {
        console.error('Fallback error:', fallbackErr);
      }

      setStatus({
        submitting: false,
        success: false,
        error: 'Network connection failed. Please check if the server is active.',
        message: ''
      });
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        
        {/* TOP SECTION: 3 Columns (Info, Gamer Room, Form) */}
        <div className="contact-hero-grid">
          
          {/* Column 1: Intro & Opportunities */}
          <div className="contact-info-col">
            <span className="contact-system-tag">// CONTACT.SYS</span>
            
            <h1 className="contact-main-heading">
              <span className="contact-heading-white">LET'S</span>
              <span className="contact-heading-blue">
                CONNECT.<span className="contact-cursor">_</span>
              </span>
            </h1>

            <p className="contact-main-desc">
              New opportunities are always a good quest. Let's build something amazing together!
            </p>

            <div className="contact-features-list">
              <div 
                className={`contact-feature-card ${formData.subject === 'Job Opportunity' ? 'active' : ''}`}
                onClick={() => handleSelectTopic('Job Opportunity')}
              >
                <div className="contact-feature-icon-box cyan-box">
                  <FiBriefcase className="feature-icon" />
                </div>
                <div className="contact-feature-text">
                  <h3>Job Opportunities</h3>
                  <p>Let's create impact together</p>
                </div>
              </div>

              <div 
                className={`contact-feature-card ${formData.subject === 'Collaboration' ? 'active' : ''}`}
                onClick={() => handleSelectTopic('Collaboration')}
              >
                <div className="contact-feature-icon-box purple-box">
                  <FiUsers className="feature-icon" />
                </div>
                <div className="contact-feature-text">
                  <h3>Collaborations</h3>
                  <p>Open to exciting ideas</p>
                </div>
              </div>

              <div 
                className={`contact-feature-card ${formData.subject === 'Friendly Hi' ? 'active' : ''}`}
                onClick={() => handleSelectTopic('Friendly Hi')}
              >
                <div className="contact-feature-icon-box magenta-box">
                  <img src="/images/controller_icon.png" alt="Controller" className="feature-controller-icon" />
                </div>
                <div className="contact-feature-text">
                  <h3>Just a Friendly Hi</h3>
                  <p>Gamers always connect!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Gamer Room Image Artwork */}
          <div className="contact-room-col">
            <div className="contact-room-frame">
              <img 
                src="/images/contact_room.png" 
                alt="Aditya's Gaming & Coding Setup" 
                className="contact-room-image" 
              />
            </div>
          </div>

          {/* Column 3: Glowing Form Card */}
          <div className="contact-form-col">
            <div className="contact-form-card">
              <div className="form-card-header">
                <span className="form-code-tag">// SEND_MESSAGE.EXE</span>
                <h2 className="form-pixel-title">
                  <img src="/images/controller_icon.png" alt="" className="form-header-icon" />
                  START A CONVERSATION
                </h2>
                <p className="form-subtitle">
                  Fill out the form below and I'll get back to you soon!
                </p>
              </div>

              {status.success ? (
                <div className="form-success-banner">
                  <div className="success-icon">✓</div>
                  <h3>QUEST COMPLETED!</h3>
                  <p>{status.message}</p>
                  <button 
                    type="button" 
                    className="form-reset-btn"
                    onClick={() => setStatus({ submitting: false, success: false, error: null, message: '' })}
                  >
                    SEND ANOTHER MESSAGE
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  {status.error && (
                    <div className="form-error-banner">
                      <span>⚠ {status.error}</span>
                    </div>
                  )}

                  <div className="form-row-two-col">
                    <div className="form-group">
                      <label htmlFor="name">Your Name</label>
                      <div className="input-wrapper">
                        <FiUser className="input-icon" />
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your name..."
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Your Email</label>
                      <div className="input-wrapper">
                        <FiMail className="input-icon" />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">
                      <FiList className="label-icon" /> Subject
                    </label>
                    <div className="select-wrapper">
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                      >
                        <option value="Job Opportunity">Job Opportunity</option>
                        <option value="Collaboration">Collaboration / Project</option>
                        <option value="Freelance Quest">Freelance Quest</option>
                        <option value="Friendly Hi">Just a Friendly Hi</option>
                        <option value="Other">Other Query</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">
                      <FiMessageSquare className="label-icon" /> Message
                    </label>
                    <div className="textarea-wrapper">
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell me about your project, opportunity or just say hi..."
                        rows="4"
                        required
                      ></textarea>
                      <span className="character-count">{formData.message.length}/500</span>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="form-submit-btn" 
                    disabled={status.submitting}
                  >
                    <FiSend className="btn-send-icon" />
                    <span>{status.submitting ? 'TRANSMITTING...' : 'SEND MESSAGE \u2192'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* MIDDLE SECTION: Other Ways To Reach Me */}
        <div className="other-ways-section">
          <div className="section-title-line">
            <h2 className="pixel-section-title">OTHER WAYS TO REACH ME</h2>
            <div className="title-divider-line"></div>
          </div>

          <div className="reach-bottom-grid">
            
            {/* Contact cards */}
            <div className="reach-cards-col">
              {(() => {
                const contactEmail = settings.contact_email || 'aditya.gore@example.com';
                const linkedinUrl = settings.linkedin_url || 'https://www.linkedin.com/in/aditya-gore-b37233266/';
                const linkedinDisplay = linkedinUrl.replace(/^https?:\/\/(www\.)?/, '');
                const githubUrl = settings.github_url || 'https://github.com/Aditya-Gore22';
                const githubDisplay = githubUrl.replace(/^https?:\/\/(www\.)?/, '');

                return (
                  <>
                    <a href={`mailto:${contactEmail}`} className="reach-card">
                      <div className="reach-icon-box cyan-glow">
                        <FiMail className="reach-icon" />
                      </div>
                      <div className="reach-card-info">
                        <h4>Email Me</h4>
                        <span className="reach-value">{contactEmail}</span>
                        <span className="reach-status">
                          <span className="status-dot green"></span> Usually reply within 24 hours
                        </span>
                      </div>
                    </a>

                    <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="reach-card">
                      <div className="reach-icon-box blue-glow">
                        <FaLinkedinIn className="reach-icon" />
                      </div>
                      <div className="reach-card-info">
                        <h4>LinkedIn</h4>
                        <span className="reach-value">{linkedinDisplay}</span>
                        <span className="reach-status">
                          <span className="status-dot blue"></span> Let's connect professionally
                        </span>
                      </div>
                    </a>

                    <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="reach-card">
                      <div className="reach-icon-box dark-glow">
                        <FaGithub className="reach-icon" />
                      </div>
                      <div className="reach-card-info">
                        <h4>GitHub</h4>
                        <span className="reach-value">{githubDisplay}</span>
                        <span className="reach-status">
                          <span className="status-dot purple"></span> Check out my code
                        </span>
                      </div>
                    </a>
                  </>
                );
              })()}
            </div>

            {/* Pixel Character & Signpost Scene */}
            <div className="reach-pixel-scene-col">
              <div className="pixel-scene-frame">
                <img 
                  src="/images/contact_pixel_scene.png" 
                  alt="Great things happen when great minds connect! - Same Player Different World" 
                  className="pixel-scene-img" 
                />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* BOTTOM SUNSET BANNER */}
      <div className="contact-footer-banner-wrapper">
        <img 
          src="/images/contact_footer_banner.png" 
          alt="Until the next adventure... New people, new ideas, new levels. Let's build the next one together. - Aditya Gore" 
          className="contact-footer-banner-img" 
        />
      </div>

    </div>
  );
};

export default ContactPage;
