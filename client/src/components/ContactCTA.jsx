import React from 'react';
import './ContactCTA.css';

const ContactCTA = ({ onNavigate }) => {
  const handleClick = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('contact');
    }
  };

  return (
    <section id="contact-cta-banner" className="contact-cta">
      <div className="contact-cta-overlay"></div>
      <div className="contact-cta-content">
        <button type="button" onClick={handleClick} className="contact-cta-button">
          GET IN TOUCH &rarr;
        </button>
      </div>
    </section>
  );
};

export default ContactCTA;
