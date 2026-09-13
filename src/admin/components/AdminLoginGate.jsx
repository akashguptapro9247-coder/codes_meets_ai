import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, Key, ArrowRight, AlertCircle } from 'lucide-react';
import { soundEngine } from '../../shared/utils/SoundEngine';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';
const ADMIN_PASS_HASH = import.meta.env.VITE_ADMIN_PASS_HASH || '';

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function AdminLoginGate({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    soundEngine.playClick();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const passHash = await sha256(password);
      const emailMatch = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const passMatch = passHash === ADMIN_PASS_HASH;

      if (emailMatch && passMatch) {
        soundEngine.playBoot();
        sessionStorage.setItem('cma_admin_auth', 'true');
        sessionStorage.setItem('cma_admin_email', email.trim().toLowerCase());
        setIsLoading(false);
        onLoginSuccess();
      } else {
        soundEngine.playClick();
        setErrorMsg('Invalid admin credentials.');
        setIsLoading(false);
      }
    } catch {
      setErrorMsg('Authentication error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        backgroundColor: '#020612',
        backgroundImage: 'radial-gradient(circle at center, rgba(4, 18, 48, 0.9) 0%, #020612 85%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        color: '#ffffff',
        fontFamily: 'var(--font-mono)'
      }}
    >
      {/* Background Animated Energy Field */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(0, 243, 255, 0.04) 0%, rgba(224, 38, 255, 0.04) 100%)',
          pointerEvents: 'none'
        }}
      />

      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="cyber-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '36px 32px',
          background: 'rgba(5, 12, 32, 0.95)',
          backdropFilter: 'blur(20px)',
          borderColor: 'var(--magenta-glow)',
          boxShadow: '0 0 50px rgba(224, 38, 255, 0.25), inset 0 0 20px rgba(0, 243, 255, 0.1)',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Corner Brackets */}
        <div className="hud-corner hud-top-left" style={{ width: '14px', height: '14px' }} />
        <div className="hud-corner hud-top-right" style={{ width: '14px', height: '14px' }} />
        <div className="hud-corner hud-bottom-left" style={{ width: '14px', height: '14px' }} />
        <div className="hud-corner hud-bottom-right" style={{ width: '14px', height: '14px' }} />

        {/* Header Badge */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '52px',
              height: '52px',
              borderRadius: '4px',
              background: 'rgba(224, 38, 255, 0.15)',
              border: '1px solid var(--magenta-glow)',
              color: 'var(--magenta-glow)',
              marginBottom: '12px',
              boxShadow: '0 0 20px rgba(224, 38, 255, 0.4)'
            }}
          >
            <Shield size={26} />
          </div>

          <div
            style={{
              fontSize: '0.68rem',
              color: 'var(--cyan-glow)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              marginBottom: '4px'
            }}
          >
            SECURITY PROTOCOL // LEVEL 04
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '1.3rem',
              margin: 0,
              color: '#ffffff',
              letterSpacing: '0.12em',
              textShadow: '0 0 16px var(--magenta-glow)'
            }}
          >
            ADMIN MISSION CONTROL
          </h2>

          <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '6px', margin: 0 }}>
            Enter authorized operator credentials to access database controls.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#ef4444',
              fontSize: '0.72rem',
              borderRadius: '2px',
              marginBottom: '18px'
            }}
          >
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.72rem',
                color: 'var(--cyan-glow)',
                marginBottom: '6px',
                letterSpacing: '0.1em'
              }}
            >
              <Mail size={13} />
              ADMIN IDENTIFIER / EMAIL
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(2, 6, 18, 0.9)',
                border: '1px solid rgba(0, 243, 255, 0.3)',
                color: '#ffffff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.72rem',
                color: 'var(--magenta-glow)',
                marginBottom: '6px',
                letterSpacing: '0.1em'
              }}
            >
              <Key size={13} />
              SECURITY KEY / PASSWORD
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(2, 6, 18, 0.9)',
                border: '1px solid rgba(224, 38, 255, 0.3)',
                color: '#ffffff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="cyber-btn"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '0.88rem',
              letterSpacing: '0.15em',
              borderColor: 'var(--magenta-glow)',
              marginTop: '6px'
            }}
          >
            <span>{isLoading ? 'AUTHENTICATING...' : 'ACCESS MISSION CONTROL'}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
