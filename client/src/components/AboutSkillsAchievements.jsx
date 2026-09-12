import React from 'react';
import './AboutSkillsAchievements.css';
import { FaHeart, FaCog, FaTrophy, FaJava, FaProjectDiagram, FaCode, FaPuzzlePiece, FaGraduationCap, FaBook, FaGamepad } from 'react-icons/fa';
import { SiJavascript, SiReact, SiNodedotjs, SiExpress, SiMysql, SiHtml5, SiCss, SiGit } from 'react-icons/si';

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

const AboutSkillsAchievements = () => {
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
                <div className="asa-skill-item">
                  <SiJavascript color="#f7df1e" size={28} />
                  <span>JavaScript</span>
                </div>
                <div className="asa-skill-item">
                  <SiReact color="#61dafb" size={28} />
                  <span>React</span>
                </div>
                <div className="asa-skill-item">
                  <SiNodedotjs color="#68a063" size={28} />
                  <span>Node.js</span>
                </div>
                <div className="asa-skill-item">
                  <SiExpress color="white" size={28} />
                  <span>Express.js</span>
                </div>
                <div className="asa-skill-item">
                  <SiMysql color="#4479a1" size={28} />
                  <span>MySQL</span>
                </div>
                <div className="asa-skill-item">
                  <FaJava color="#f89820" size={28} />
                  <span>Java</span>
                </div>
                <div className="asa-skill-item">
                  <SiHtml5 color="#e34f26" size={28} />
                  <span>HTML5</span>
                </div>
                <div className="asa-skill-item">
                  <SiCss color="#1572b6" size={28} />
                  <span>CSS3</span>
                </div>
                <div className="asa-skill-item">
                  <SiGit color="#f05032" size={28} />
                  <span>Git</span>
                </div>
                <div className="asa-skill-item">
                  <FaProjectDiagram color="#9333ea" size={28} />
                  <span>DSA</span>
                </div>
                <div className="asa-skill-item">
                  <FaCode color="#0ea5e9" size={28} />
                  <span>OOP</span>
                </div>
                <div className="asa-skill-item">
                  <FaPuzzlePiece color="#f59e0b" size={28} />
                  <span>Problem Solving</span>
                </div>
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
                <span className="asa-status-badge">4/4</span>
              </div>
            </div>

            <div className="asa-ach-body">
              <div className="asa-ach-item">
                <div className="asa-ach-icon">
                  <FaGraduationCap />
                </div>
                <div className="asa-ach-text">
                  <h4>MCA Graduate</h4>
                  <p>Completed Masters in Computer Applications</p>
                </div>
              </div>
              <div className="asa-ach-item">
                <div className="asa-ach-icon">
                  <FaCode />
                </div>
                <div className="asa-ach-text">
                  <h4>Built 3+ Full Stack Projects</h4>
                  <p>From idea to deployment</p>
                </div>
              </div>
              <div className="asa-ach-item">
                <div className="asa-ach-icon">
                  <FaBook />
                </div>
                <div className="asa-ach-text">
                  <h4>Continuous Learner</h4>
                  <p>Always exploring new technologies</p>
                </div>
              </div>
              <div className="asa-ach-item">
                <div className="asa-ach-icon">
                  <FaGamepad />
                </div>
                <div className="asa-ach-text">
                  <h4>Gamer at Heart</h4>
                  <p>Believer that games make life better</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSkillsAchievements;
