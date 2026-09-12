import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero-section" id="home">
      <div className="hero-overlay"></div>
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="block">SAME</span>
            <span className="block">PASSION.</span>
            <span className="block">DIFFERENT</span>
            <span className="block highlight">LEVEL.<span className="cursor">_</span></span>
          </h1>
          <p className="hero-subtitle">
            A developer who loves building things<br />
            and playing games.
          </p>
          <a href="#work" className="hero-btn">
            VIEW MY WORK &rarr;
          </a>
          <div className="hero-breadcrumb">
            Code <span className="separator">&gt;</span> Create <span className="separator">&gt;</span> Play <span className="separator">&gt;</span> Repeat
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
