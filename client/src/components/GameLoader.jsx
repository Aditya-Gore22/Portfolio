import React, { useState, useEffect } from 'react';
import './GameLoader.css';

const GAMER_TIPS = [
  "Tip: Always commit your code before the boss fight.",
  "Fetching mission items & stats from MySQL database...",
  "Compiling shaders, drinking coffee, squashing bugs...",
  "Tip: Use semicolons wisely to avoid fatal game crashes.",
  "Equipping +10 Full-Stack Dev Armor...",
  "Establishing low-latency neural link to backend server...",
  "Tip: A developer's best weapon is clean, readable code.",
  "Buffing database queries for 60 FPS performance..."
];

const GameLoader = ({ 
  message = "LOADING DATABASE ASSETS...", 
  subtitle = "Establishing secure link to MySQL...",
  minHeight = "360px",
  fullPage = false 
}) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [dots, setDots] = useState('');

  // Cycle gamer tips every 3 seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % GAMER_TIPS.length);
    }, 2800);

    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 450);

    return () => {
      clearInterval(tipInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div 
      className={`game-loader-container ${fullPage ? 'game-loader-fullpage' : ''}`}
      style={{ minHeight: fullPage ? '100vh' : minHeight }}
      role="status"
      aria-live="polite"
    >
      {/* Sci-Fi HUD Bracket Frame */}
      <div className="game-loader-hud-frame">
        <span className="hud-corner top-left"></span>
        <span className="hud-corner top-right"></span>
        <span className="hud-corner bottom-left"></span>
        <span className="hud-corner bottom-right"></span>

        {/* Scanlines Effect */}
        <div className="game-loader-scanlines"></div>

        {/* Central Levitating Controller with Pulse Rings */}
        <div className="game-loader-visual">
          <div className="pulse-ring ring-1"></div>
          <div className="pulse-ring ring-2"></div>
          <div className="pulse-ring ring-3"></div>
          
          <div className="controller-glow-wrap">
            <img 
              src="/images/controller_icon.png" 
              alt="Loading" 
              className="loader-gamepad-icon" 
            />
          </div>

          <div className="orbiting-particle particle-cyan"></div>
          <div className="orbiting-particle particle-purple"></div>
        </div>

        {/* Gaming Status / HUD Header */}
        <div className="game-loader-status">
          <div className="hud-prefix-row">
            <span className="status-badge-live">LIVE LINK</span>
            <span className="hud-system-text">// PORTFOLIO_SYS_V2.6</span>
          </div>

          <h3 className="loader-pixel-title">
            {message}
            <span className="blinking-cursor">_</span>
          </h3>

          <p className="loader-subtitle">{subtitle}</p>

          {/* Retro Segmented HP / XP Bar */}
          <div className="cyber-progress-wrapper">
            <div className="cyber-progress-header">
              <span className="progress-label">BUFFERING DATA</span>
              <span className="progress-value">SYNCING{dots}</span>
            </div>
            
            <div className="cyber-progress-track">
              <div className="cyber-progress-bar">
                <div className="progress-shimmer"></div>
              </div>
            </div>

            {/* Segmented Block Indicators */}
            <div className="cyber-progress-segments">
              {[...Array(12)].map((_, i) => (
                <span key={i} className="segment-block" style={{ animationDelay: `${i * 0.12}s` }}></span>
              ))}
            </div>
          </div>

          {/* Gamer Tip / Dialogue Box */}
          <div className="gamer-tip-box">
            <span className="tip-badge">GAMER TIP</span>
            <p className="tip-content">{GAMER_TIPS[tipIndex]}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GameLoader;
