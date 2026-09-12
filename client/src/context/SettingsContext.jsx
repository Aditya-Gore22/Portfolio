import React, { createContext, useContext, useState, useEffect } from 'react';

const defaultSettings = {
  site_title: 'Aditya Gore | Full Stack Developer Portfolio',
  admin_name: 'Aditya Gore',
  admin_tagline: 'Developer × Gamer',
  admin_quote: 'Build. Improve. Repeat.',
  contact_email: 'aditya.gore@example.com',
  linkedin_url: 'https://www.linkedin.com/in/aditya-gore-b37233266/',
  github_url: 'https://github.com/Aditya-Gore22',
  portfolio_url: 'https://aditya-gore.dev'
};

const SettingsContext = createContext({
  settings: defaultSettings,
  refreshSettings: async () => {},
  updateSettings: () => {}
});

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(prev => ({
          ...prev,
          ...data.settings
        }));
      }
    } catch (err) {
      console.warn('Could not fetch site settings, using defaults:', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = (newSettings) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings: fetchSettings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    return {
      settings: defaultSettings,
      refreshSettings: async () => {},
      updateSettings: () => {}
    };
  }
  return context;
};

export default SettingsContext;
