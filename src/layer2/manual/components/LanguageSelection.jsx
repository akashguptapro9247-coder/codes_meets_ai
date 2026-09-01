import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Code, Cpu } from 'lucide-react';
import { soundEngine } from '../../../shared/utils/SoundEngine';

export default function LanguageSelection({ onSelect, onBack }) {
  const [selectedLang, setSelectedLang] = useState(null);

  const languages = [
    { id: 'C', name: 'C', icon: <Cpu size={32} /> },
    { id: 'Java', name: 'Java', icon: <Code size={32} /> },
    { id: 'Python', name: 'Python', icon: <Terminal size={32} /> }
  ];

  const handleSelect = (langId) => {
    soundEngine.playClick();
    setSelectedLang(langId);
  };

  const handleConfirm = () => {
    if (selectedLang) {
      soundEngine.playBoot();
      onSelect(selectedLang);
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', padding: '20px'
    }}>
      <h2 style={{ fontFamily: 'var(--font-title)', color: 'var(--cyan-glow)', fontSize: '2rem', marginBottom: '10px' }}>
        SELECT YOUR LANGUAGE
      </h2>
      <p style={{ color: '#9ca3af', fontFamily: 'var(--font-mono)', marginBottom: '40px' }}>
        Choose carefully. This cannot be changed later.
      </p>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {languages.map((lang) => (
          <motion.div
            key={lang.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(lang.id)}
            style={{
              width: '160px',
              height: '180px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              background: selectedLang === lang.id ? 'rgba(0, 243, 255, 0.15)' : 'rgba(3, 7, 20, 0.8)',
              border: `2px solid ${selectedLang === lang.id ? 'var(--cyan-glow)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              color: selectedLang === lang.id ? 'var(--cyan-glow)' : '#ffffff',
              transition: 'all 0.2s ease',
              boxShadow: selectedLang === lang.id ? '0 0 20px rgba(0, 243, 255, 0.2)' : 'none'
            }}
          >
            {lang.icon}
            <span style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', letterSpacing: '0.1em' }}>
              {lang.name}
            </span>
          </motion.div>
        ))}
      </div>

      <div style={{ marginTop: '50px', display: 'flex', gap: '20px' }}>
        <button
          onClick={() => {
            soundEngine.playClick();
            if (onBack) onBack();
          }}
          className="cyber-btn"
          style={{ padding: '12px 24px', fontSize: '0.9rem', borderColor: '#ef4444', color: '#fca5a5' }}
        >
          BACK
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedLang}
          className="cyber-btn"
          style={{
            padding: '12px 32px',
            fontSize: '1rem',
            opacity: selectedLang ? 1 : 0.5,
            cursor: selectedLang ? 'pointer' : 'not-allowed',
            borderColor: selectedLang ? 'var(--lime-accent)' : '#9ca3af',
            color: selectedLang ? 'var(--lime-accent)' : '#9ca3af'
          }}
        >
          CONFIRM SELECTION
        </button>
      </div>
    </div>
  );
}
