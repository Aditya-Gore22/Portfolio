import React from 'react';
import './AboutSkillsAchievements.css';
import { FaHeart, FaCog, FaTrophy, FaJava, FaProjectDiagram, FaCode, FaPuzzlePiece, FaGraduationCap, FaBook, FaGamepad } from 'react-icons/fa';
import { SiJavascript, SiReact, SiNodedotjs, SiExpress, SiMysql, SiHtml5, SiCss, SiGit } from 'react-icons/si';

const AboutSkillsAchievements = () => {
  return (
    <section id="about" className="asa-section">
      <div className="asa-container">
        <div className="asa-grid">
          
          {/* Column 1: About Me */}
          <div className="asa-col">
            <div className="asa-header">
              <img src="/images/05_pixel_character.png" alt="Pixel Character" className="asa-pixel-char" />
              <h2 className="asa-title">ABOUT ME</h2>
              <div className="asa-hearts">
                <FaHeart />
                <FaHeart />
                <FaHeart />
              </div>
            </div>
            <div className="asa-card">
              <h3 className="asa-greeting">Hi, I'm Aditya Gore!</h3>
              <p className="asa-bio">
                I am a passionate software developer with a strong foundation in modern web technologies. I love building intuitive, dynamic user experiences and robust backend systems. Let's create something amazing together!
              </p>
              <div className="asa-quote-box">
                <p className="asa-quote-text">
                  "Good games make you think.<br/>Great software does the same."
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: Skills */}
          <div className="asa-col">
            <div className="asa-header">
              <FaCog className="asa-icon-red" />
              <h2 className="asa-title">SKILLS</h2>
              <div className="asa-level">
                <span className="asa-level-text">LEVEL</span>
                <span className="asa-level-squares">■■■■■■■■■■</span>
              </div>
            </div>
            <div className="asa-card">
              <div className="asa-skills-grid">
                <div className="asa-skill-item">
                  <SiJavascript color="#f7df1e" size={32} />
                  <span>JavaScript</span>
                </div>
                <div className="asa-skill-item">
                  <SiReact color="#61dafb" size={32} />
                  <span>React</span>
                </div>
                <div className="asa-skill-item">
                  <SiNodedotjs color="#68a063" size={32} />
                  <span>Node.js</span>
                </div>
                <div className="asa-skill-item">
                  <SiExpress color="white" size={32} />
                  <span>Express.js</span>
                </div>
                <div className="asa-skill-item">
                  <SiMysql color="#4479a1" size={32} />
                  <span>MySQL</span>
                </div>
                <div className="asa-skill-item">
                  <FaJava color="#f89820" size={32} />
                  <span>Java</span>
                </div>
                <div className="asa-skill-item">
                  <SiHtml5 color="#e34f26" size={32} />
                  <span>HTML5</span>
                </div>
                <div className="asa-skill-item">
                  <SiCss color="#1572b6" size={32} />
                  <span>CSS3</span>
                </div>
                <div className="asa-skill-item">
                  <SiGit color="#f05032" size={32} />
                  <span>Git</span>
                </div>
                <div className="asa-skill-item">
                  <FaProjectDiagram color="#9333ea" size={32} />
                  <span>DSA</span>
                </div>
                <div className="asa-skill-item">
                  <FaCode color="#0ea5e9" size={32} />
                  <span>OOP</span>
                </div>
                <div className="asa-skill-item">
                  <FaPuzzlePiece color="#f59e0b" size={32} />
                  <span>Problem Solving</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Achievements */}
          <div className="asa-col">
            <div className="asa-header">
              <FaTrophy className="asa-icon-red" />
              <h2 className="asa-title">ACHIEVEMENTS</h2>
            </div>
            <div className="asa-card asa-achievements-card">
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
