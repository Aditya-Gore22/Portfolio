import React, { useState } from 'react';
import './ResumePage.css';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  ZoomIn, 
  ZoomOut, 
  GraduationCap, 
  Briefcase, 
  Compass, 
  MapPin, 
  Gamepad2, 
  Info, 
  Star, 
  Users, 
  Zap, 
  Calendar, 
  HardDrive, 
  GitBranch, 
  Printer, 
  Maximize2, 
  Minimize2,
  FileCheck
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';

const ResumePage = ({ onNavigate }) => {
  const { settings } = useSettings();
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Dynamic values from backend site_settings
  const resumeUrl = settings.resume_url || '/Aditya_Gore_Resume.pdf';
  const resumeFilename = settings.resume_filename || 'Aditya_Gore_Resume.pdf';
  const resumeFilesize = settings.resume_filesize || '46.2 KB';
  const resumeUpdatedAt = settings.resume_updated_at || '12 Sep 2026';
  const resumeVersion = settings.resume_version || '2.1';

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 10, 150));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 10, 70));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.download = resumeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenExternal = () => {
    window.open(resumeUrl, '_blank');
  };

  const handlePrint = () => {
    const printWindow = window.open(resumeUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`resume-page ${isFullscreen ? 'resume-page-fullscreen' : ''}`}>
      {/* Gamer room ambient backdrop */}
      <div className="resume-bg-backdrop"></div>
      <div className="resume-ambient-glow glow-cyan"></div>
      <div className="resume-ambient-glow glow-purple"></div>

      <div className="resume-container">
        {/* Top Header & Gamer Quote */}
        <div className="resume-header-row">
          <div className="resume-title-block">
            <div className="resume-tag">
              <span className="tag-prefix">// CAREER</span>
              <span className="tag-suffix">RESUME</span>
            </div>
            <h1 className="resume-main-title">
              MY <span className="text-gradient-neon">RESUME</span>
            </h1>
            <p className="resume-description">
              A detailed look at my skills, experience, and journey.
              <br />
              Download my resume or view it online.
            </p>
          </div>

          {/* Top Right Gamer Quote Card */}
          <div className="resume-top-quote-card">
            <div className="quote-corner top-left"></div>
            <div className="quote-corner top-right"></div>
            <div className="quote-corner bottom-left"></div>
            <div className="quote-corner bottom-right"></div>
            <div className="top-quote-content">
              <p className="quote-body-text">
                &ldquo;Same passion.<br />
                Different level.&rdquo;
              </p>
              <div className="quote-author-row">
                <span className="quote-author">&ndash; Aditya Gore</span>
                <Gamepad2 className="quote-gamepad-icon" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid: Left Document + Right Sidebar */}
        <div className="resume-grid">
          {/* LEFT COLUMN: Viewer & Stats */}
          <div className="resume-left-col">
            {/* Interactive PDF Document Viewer */}
            <div className="pdf-viewer-card">
              {/* Viewer Control Bar */}
              <div className="viewer-toolbar">
                <div className="toolbar-left">
                  <div className="file-badge">
                    <FileText size={16} className="file-icon" />
                  </div>
                  <span className="filename-text" title={resumeFilename}>
                    {resumeFilename}
                  </span>
                </div>

                <div className="toolbar-center">
                  <div className="pdf-live-indicator">
                    <span className="pulse-dot"></span>
                    <span>Live PDF Document</span>
                  </div>

                  <div className="zoom-controls">
                    <button onClick={handleZoomOut} className="zoom-btn" title="Zoom Out" aria-label="Zoom Out">
                      <ZoomOut size={15} />
                    </button>
                    <button onClick={handleResetZoom} className="zoom-value" title="Reset Zoom">
                      {zoomLevel}%
                    </button>
                    <button onClick={handleZoomIn} className="zoom-btn" title="Zoom In" aria-label="Zoom In">
                      <ZoomIn size={15} />
                    </button>
                  </div>
                </div>

                <div className="toolbar-right">
                  <button onClick={handleDownload} className="tool-action-btn" title="Download PDF" aria-label="Download PDF">
                    <Download size={16} />
                  </button>
                  <button onClick={handleOpenExternal} className="tool-action-btn" title="Open in New Tab" aria-label="Open in New Tab">
                    <ExternalLink size={16} />
                  </button>
                  <button onClick={handlePrint} className="tool-action-btn" title="Print Resume" aria-label="Print Resume">
                    <Printer size={16} />
                  </button>
                  <button onClick={toggleFullscreen} className="tool-action-btn" title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} aria-label="Fullscreen">
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                </div>
              </div>

              {/* Document Sheet Canvas - Pure PDF View */}
              <div className="viewer-canvas">
                <div 
                  className="pdf-iframe-container" 
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                >
                  <object
                    data={`${resumeUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                    type="application/pdf"
                    className="resume-pdf-frame"
                    title="Aditya Gore Resume PDF"
                  >
                    {/* Fallback iframe */}
                    <iframe
                      src={`${resumeUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                      className="resume-pdf-frame"
                      title="Aditya Gore Resume Document"
                    >
                      <div className="pdf-fallback-notice">
                        <FileText size={48} className="pdf-fallback-icon" />
                        <h4>Resume PDF Ready</h4>
                        <p>Your browser is unable to display the PDF directly.</p>
                        <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="btn-primary-download">
                          <Download size={16} />
                          Open / Download PDF
                        </a>
                      </div>
                    </iframe>
                  </object>
                </div>
              </div>
            </div>

            {/* Bottom 4 Stat Cards */}
            <div className="resume-stats-row">
              <div className="stat-card">
                <div className="stat-icon-wrapper pink-glow">
                  <Star size={20} className="stat-icon pink" />
                </div>
                <div className="stat-info">
                  <div className="stat-value">3+</div>
                  <div className="stat-label">Projects Completed</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper cyan-glow">
                  <Users size={20} className="stat-icon cyan" />
                </div>
                <div className="stat-info">
                  <div className="stat-value">Open</div>
                  <div className="stat-label">For Opportunities</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper amber-glow">
                  <Zap size={20} className="stat-icon amber" />
                </div>
                <div className="stat-info">
                  <div className="stat-value">Always</div>
                  <div className="stat-label">Learning</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper purple-glow">
                  <Gamepad2 size={20} className="stat-icon purple" />
                </div>
                <div className="stat-info">
                  <div className="stat-value">Gamer</div>
                  <div className="stat-label">At Heart</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar Cards */}
          <div className="resume-right-col">
            {/* Download Resume Card */}
            <div className="sidebar-card download-card">
              <div className="card-header-with-icon">
                <Download size={22} className="card-title-icon purple-accent" />
                <h3 className="card-main-title">DOWNLOAD RESUME</h3>
              </div>
              <p className="card-subtitle">Get a PDF copy of my latest resume.</p>

              <div className="download-btn-group">
                <button onClick={handleDownload} className="btn-primary-download">
                  <Download size={18} />
                  <span>Download Resume</span>
                </button>
                <button onClick={handlePrint} className="btn-icon-secondary" title="Print Resume" aria-label="Print Resume">
                  <FileText size={18} />
                </button>
              </div>

              <div className="resume-meta-list">
                <div className="meta-row">
                  <div className="meta-label">
                    <FileText size={15} className="meta-icon" />
                    <span>File Name</span>
                  </div>
                  <span className="meta-value" title={resumeFilename}>
                    {resumeFilename.length > 20 ? resumeFilename.substring(0, 18) + '...' : resumeFilename}
                  </span>
                </div>

                <div className="meta-row">
                  <div className="meta-label">
                    <Calendar size={15} className="meta-icon" />
                    <span>Last Updated</span>
                  </div>
                  <span className="meta-value">{resumeUpdatedAt}</span>
                </div>

                <div className="meta-row">
                  <div className="meta-label">
                    <HardDrive size={15} className="meta-icon" />
                    <span>File Size</span>
                  </div>
                  <span className="meta-value">{resumeFilesize}</span>
                </div>

                <div className="meta-row">
                  <div className="meta-label">
                    <GitBranch size={15} className="meta-icon" />
                    <span>Version</span>
                  </div>
                  <span className="meta-value">{resumeVersion}</span>
                </div>
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="sidebar-card quick-info-card">
              <div className="card-header-with-icon">
                <div className="info-icon-badge">
                  <Info size={16} />
                </div>
                <h3 className="card-main-title">QUICK INFO</h3>
              </div>

              <ul className="quick-info-list">
                <li className="quick-info-item">
                  <div className="quick-icon-wrap">
                    <GraduationCap size={17} />
                  </div>
                  <span>MCA Graduate</span>
                </li>
                <li className="quick-info-item">
                  <div className="quick-icon-wrap">
                    <Briefcase size={17} />
                  </div>
                  <span>Full Stack Developer</span>
                </li>
                <li className="quick-info-item">
                  <div className="quick-icon-wrap">
                    <Compass size={17} />
                  </div>
                  <span>Open to opportunities</span>
                </li>
                <li className="quick-info-item">
                  <div className="quick-icon-wrap">
                    <MapPin size={17} />
                  </div>
                  <span>Based in India</span>
                </li>
                <li className="quick-info-item">
                  <div className="quick-icon-wrap">
                    <Gamepad2 size={17} />
                  </div>
                  <span>Passionate about building and gaming</span>
                </li>
              </ul>
            </div>

            {/* Bottom Gamer Quote Card */}
            <div className="sidebar-quote-card">
              <div className="quote-corner top-left"></div>
              <div className="quote-corner top-right"></div>
              <div className="quote-corner bottom-left"></div>
              <div className="quote-corner bottom-right"></div>

              <div className="sidebar-quote-inner">
                <p className="sidebar-quote-text">
                  &ldquo;A resume tells what I&apos;ve done,
                  <br />
                  but my work shows what I can do.&rdquo;
                </p>
                <div className="sidebar-quote-icon">
                  <Gamepad2 size={26} className="quote-gamepad-glow" />
                </div>
              </div>
            </div>

            {/* Let's Connect Mini Banner */}
            <div className="sidebar-connect-card" onClick={() => onNavigate && onNavigate('contact')}>
              <div className="connect-card-text">
                <strong>Interested in collaborating?</strong>
                <span>Let's talk about projects, games, or work!</span>
              </div>
              <div className="connect-arrow-btn">
                &rarr;
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePage;
