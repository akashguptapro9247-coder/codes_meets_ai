import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Lock, Unlock, Sparkles, Code2, RefreshCw, X } from 'lucide-react';
import { eventStateService } from '../../shared/services/eventStateService';
import { soundEngine } from '../../shared/utils/SoundEngine';

export default function AdminControlModal({ eventState, onClose }) {

  const handleToggleLayer = (layerKey, currentActive, activeTrack) => {
    soundEngine.playClick();
    if (!currentActive) {
      // Activating layer default to 'gen-ai' if no track selected
      eventStateService.setLayerState(layerKey, true, activeTrack || 'gen-ai');
    } else {
      // Deactivating layer
      eventStateService.setLayerState(layerKey, false, null);
    }
  };

  const handleSelectTrack = (layerKey, track) => {
    soundEngine.playHover();
    eventStateService.setLayerState(layerKey, true, track);
  };

  const handleReset = () => {
    soundEngine.playClick();
    eventStateService.resetAll();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="cyber-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '28px',
          boxSizing: 'border-box',
          borderColor: 'var(--magenta-glow)',
          boxShadow: '0 0 40px rgba(224, 38, 255, 0.3)'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '1px solid rgba(224, 38, 255, 0.2)',
            paddingBottom: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--magenta-glow)' }}>
            <Settings size={20} />
            <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', margin: 0, color: '#ffffff' }}>
              ADMIN REALTIME CONTROL PANEL
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#9ca3af', marginTop: 0 }}>
          SIMULATE REALTIME BROADCAST STATE FROM ADMIN SERVER TO UNLOCK COMPETITION LAYERS & TRACKS.
        </p>

        {/* LAYER 01 CONTROL BLOCK */}
        <div
          style={{
            padding: '16px',
            background: 'rgba(2, 6, 18, 0.8)',
            border: '1px solid rgba(0, 243, 255, 0.2)',
            marginBottom: '16px',
            borderRadius: '4px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontFamily: 'var(--font-title)', fontSize: '0.95rem', color: '#ffffff' }}>
              LAYER 01 STATE
            </span>
            <button
              onClick={() => handleToggleLayer('layer1', eventState.layer1.active, eventState.layer1.activeTrack)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: eventState.layer1.active ? 'rgba(57, 255, 20, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: eventState.layer1.active ? '1px solid var(--lime-accent)' : '1px solid #ef4444',
                color: eventState.layer1.active ? 'var(--lime-accent)' : '#ef4444',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              {eventState.layer1.active ? <Unlock size={14} /> : <Lock size={14} />}
              <span>{eventState.layer1.active ? 'UNLOCKED' : 'LOCKED'}</span>
            </button>
          </div>

          {/* Track Selection options when layer active */}
          {eventState.layer1.active && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
              <button
                onClick={() => handleSelectTrack('layer1', 'gen-ai')}
                style={{
                  padding: '8px',
                  background: eventState.layer1.activeTrack === 'gen-ai' ? 'rgba(0, 243, 255, 0.2)' : 'rgba(0, 0, 0, 0.4)',
                  border: eventState.layer1.activeTrack === 'gen-ai' ? '1px solid var(--cyan-glow)' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: eventState.layer1.activeTrack === 'gen-ai' ? '#ffffff' : '#9ca3af',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Sparkles size={12} color="var(--cyan-glow)" /> GEN AI TRACK
              </button>

              <button
                onClick={() => handleSelectTrack('layer1', 'manual')}
                style={{
                  padding: '8px',
                  background: eventState.layer1.activeTrack === 'manual' ? 'rgba(224, 38, 255, 0.2)' : 'rgba(0, 0, 0, 0.4)',
                  border: eventState.layer1.activeTrack === 'manual' ? '1px solid var(--magenta-glow)' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: eventState.layer1.activeTrack === 'manual' ? '#ffffff' : '#9ca3af',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Code2 size={12} color="var(--magenta-glow)" /> MANUAL TRACK
              </button>
            </div>
          )}
        </div>

        {/* LAYER 02 CONTROL BLOCK */}
        <div
          style={{
            padding: '16px',
            background: 'rgba(2, 6, 18, 0.8)',
            border: '1px solid rgba(0, 243, 255, 0.2)',
            marginBottom: '20px',
            borderRadius: '4px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontFamily: 'var(--font-title)', fontSize: '0.95rem', color: '#ffffff' }}>
              LAYER 02 STATE
            </span>
            <button
              onClick={() => handleToggleLayer('layer2', eventState.layer2.active, eventState.layer2.activeTrack)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: eventState.layer2.active ? 'rgba(57, 255, 20, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: eventState.layer2.active ? '1px solid var(--lime-accent)' : '1px solid #ef4444',
                color: eventState.layer2.active ? 'var(--lime-accent)' : '#ef4444',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              {eventState.layer2.active ? <Unlock size={14} /> : <Lock size={14} />}
              <span>{eventState.layer2.active ? 'UNLOCKED' : 'LOCKED'}</span>
            </button>
          </div>

          {/* Track Selection options when layer active */}
          {eventState.layer2.active && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
              <button
                onClick={() => handleSelectTrack('layer2', 'gen-ai')}
                style={{
                  padding: '8px',
                  background: eventState.layer2.activeTrack === 'gen-ai' ? 'rgba(0, 243, 255, 0.2)' : 'rgba(0, 0, 0, 0.4)',
                  border: eventState.layer2.activeTrack === 'gen-ai' ? '1px solid var(--cyan-glow)' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: eventState.layer2.activeTrack === 'gen-ai' ? '#ffffff' : '#9ca3af',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Sparkles size={12} color="var(--cyan-glow)" /> GEN AI TRACK
              </button>

              <button
                onClick={() => handleSelectTrack('layer2', 'manual')}
                style={{
                  padding: '8px',
                  background: eventState.layer2.activeTrack === 'manual' ? 'rgba(224, 38, 255, 0.2)' : 'rgba(0, 0, 0, 0.4)',
                  border: eventState.layer2.activeTrack === 'manual' ? '1px solid var(--magenta-glow)' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: eventState.layer2.activeTrack === 'manual' ? '#ffffff' : '#9ca3af',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Code2 size={12} color="var(--magenta-glow)" /> MANUAL TRACK
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={handleReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: '1px solid #6b7280',
              color: '#9ca3af',
              padding: '8px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} /> RESET ALL LAYERS
          </button>

          <button
            onClick={onClose}
            className="cyber-btn"
            style={{ padding: '8px 24px', fontSize: '0.8rem' }}
          >
            CLOSE PANEL
          </button>
        </div>
      </div>
    </motion.div>
  );
}
