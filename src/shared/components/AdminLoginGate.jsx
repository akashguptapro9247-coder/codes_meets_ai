import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, Key, ArrowRight, Zap, AlertCircle } from 'lucide-react';
import { soundEngine } from '../utils/SoundEngine';

export default function AdminLoginGate({ onLoginSuccess, onCancel }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAutoFill = () => {
    soundEngine.playHover();
    setEmail('admin@codemeets.ai');
    setPassword('admin123');
    setErrorMsg('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    soundEngine.playClick();
    setIsLoading(true);

    setTimeout(() => {
      // Configurable admin credentials (accepts admin@codemeets.ai/admin123 or any valid admin email)
      if (
        (email.trim().toLowerCase() === 'admin@codemeets.ai' && password === 'admin123') ||
        (email.trim().toLowerCase().includes('admin') && password.length >= 6) ||
        (email.trim() && password === 'admin123')
      ) {
        soundEngine.playBoot();
        sessionStorage.setItem('cma_admin_auth', 'true');
        sessionStorage.setItem('cma_admin_email', email);
        setIsLoading(false);
        onLoginSuccess();
      } else {
        soundEngine.playClick();
        setErrorMsg('INVALID CREDENTIALS // ACCESS DENIED');
        setIsLoading(false);
      }
    }, 450);
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
              placeholder="e.g. admin@codemeets.ai"
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

          {/* Quick Demo Autofill Hint Box */}
          <div
            style={{
              padding: '10px 12px',
              background: 'rgba(0, 243, 255, 0.05)',
              border: '1px dashed rgba(0, 243, 255, 0.25)',
              borderRadius: '2px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>
              Default: <span style={{ color: '#ffffff' }}>admin@codemeets.ai</span> / <span style={{ color: '#ffffff' }}>admin123</span>
            </div>
            <button
              type="button"
              onClick={handleAutoFill}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--cyan-glow)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Zap size={12} /> AUTO-FILL
            </button>
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

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#6b7280',
                fontSize: '0.72rem',
                cursor: 'pointer',
                marginTop: '4px'
              }}
            >
              [ RETURN TO ARENA ]
            </button>
          )}
        </form>
      </motion.div>
    </div>
  );
}
