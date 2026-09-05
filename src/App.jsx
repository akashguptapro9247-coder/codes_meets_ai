import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, UserX, RefreshCw, ArrowRight } from 'lucide-react';
import IntroScene from './shared/components/IntroScene';
import RegistrationScene from './shared/components/RegistrationScene';
import EventArenaScene from './shared/components/EventArenaScene';
import AdminDashboard from './admin/pages/AdminDashboard';
import Layer2ManualRoute from './layer2/manual/Layer2ManualRoute';
import Layer2GenAIRoute from './layer2/genai/Layer2GenAIRoute';
import { ToastContainer } from './shared/components/Toast';
import { participantGuard } from './shared/services/participantGuard';
import { soundEngine } from './shared/utils/SoundEngine';

export const getStoredParticipant = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('cma_participant_session') || localStorage.getItem('cma_participant_session');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error parsing stored participant session:', e);
  }
  return null;
};

export const saveParticipantSession = (participantData) => {
  if (typeof window === 'undefined') return;
  try {
    const dataStr = JSON.stringify(participantData);
    sessionStorage.setItem('cma_participant_session', dataStr);
    localStorage.setItem('cma_participant_session', dataStr);
  } catch (e) {
    console.warn('Error saving participant session:', e);
  }
};

export const clearAllParticipantStorage = () => {
  participantGuard.clearParticipantSession();
};

function App() {
  const getRouteFromLocation = useCallback(() => {
    if (typeof window === 'undefined') return 'landing';
    const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
    const hash = window.location.hash.toLowerCase();

    if (path === '/admin' || path === '/admin-panel' || hash === '#admin' || hash === '#admin-panel') {
      return 'admin';
    }
    if (path === '/register' || path === '/registration' || hash === '#register') {
      return 'register';
    }
    if (path === '/play' || path === '/arena' || hash === '#play' || hash === '#arena') {
      return 'arena';
    }
    // Specific Layer 2 routes MUST be checked BEFORE generic /layer2 prefix
    if (path === '/layer2/manual' || path === '/layer/2/manual' || path === '/layer-2/manual') {
      return 'layer2_manual';
    }
    if (path === '/layer2/gen-ai' || path === '/layer2/genai' || path === '/layer/2/gen-ai' || path === '/layer-2/gen-ai') {
      return 'layer2_genai';
    }
    if (path.startsWith('/layer/1') || path.startsWith('/layer1') || path.startsWith('/layer-1')) {
      return 'layer1';
    }
    if (path.startsWith('/layer/2') || path.startsWith('/layer2') || path.startsWith('/layer-2')) {
      return 'layer2';
    }

    // Default route
    return 'landing';
  }, []);

  const [currentRoute, setCurrentRoute] = useState(getRouteFromLocation);
  const [participant, setParticipant] = useState(getStoredParticipant);
  const [selectedRound, setSelectedRound] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const isLayer2 = path.startsWith('/layer/2') || path.startsWith('/layer2') || path.startsWith('/layer-2');
      const isLayer1 = path.startsWith('/layer/1') || path.startsWith('/layer1') || path.startsWith('/layer-1');
      const isManual = path.includes('manual');
      const isGenAi = path.includes('gen-ai') || path.includes('genai');
      if (isLayer2 && isManual) return { path: '/layer2/manual', title: 'LAYER 02 - MANUAL TRACK' };
      if (isLayer2 && isGenAi)  return { path: '/layer2/gen-ai', title: 'LAYER 02 - GEN AI TRACK' };
      if (isLayer1 && isManual) return { path: '/layer1/manual', title: 'LAYER 01 - MANUAL TRACK' };
      if (isLayer1 && isGenAi)  return { path: '/layer1/gen-ai', title: 'LAYER 01 - GEN AI TRACK' };
    }
    return null;
  });
  const [terminationNotice, setTerminationNotice] = useState(null); // { message, reason }

  // Navigate helper that pushes or replaces browser history
  const navigateTo = useCallback((path, newRoute, replace = false) => {
    if (typeof window !== 'undefined' && window.history) {
      if (replace && window.history.replaceState) {
        window.history.replaceState({}, '', path);
      } else if (window.history.pushState) {
        window.history.pushState({}, '', path);
      }
    }
    setCurrentRoute(newRoute);
  }, []);

  // Central forced exit handler: wipes state and prevents browser Back bypass
  const handleForceExit = useCallback((message = 'Your session has been terminated by the event admin.') => {
    soundEngine.playClick();
    participantGuard.clearParticipantSession();
    setParticipant(null);
    setTerminationNotice({
      message: message || 'Your session has been terminated by the event admin.',
      time: new Date().toLocaleTimeString()
    });

    // Replace history entry so browser BACK button CANNOT re-enter protected arena routes
    navigateTo('/', 'landing', true);
  }, [navigateTo]);

  // 1. Participant Realtime Security Watcher
  useEffect(() => {
    const activeUserId = participant?.userId || participant?.user_id;
    if (activeUserId) {
      participantGuard.startWatching(activeUserId);
    } else {
      participantGuard.stopWatching();
    }

    const unsubscribe = participantGuard.subscribe((event) => {
      if (event.type === 'FORCE_EXIT') {
        handleForceExit(event.message);
      } else if (event.type === 'PROMOTION_UPDATED') {
        const stored = getStoredParticipant();
        if (stored) {
          setParticipant({
            ...stored,
            promoted_to_layer2: event.promoted_to_layer2,
            promoted_to_layer3: event.promoted_to_layer3
          });
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [participant?.userId, participant?.user_id, handleForceExit]);

  // 2. Strict Route Guard on Route Changes & Page Focus
  useEffect(() => {
    const isProtected = currentRoute === 'arena' || currentRoute === 'layer1' || currentRoute === 'layer2' || currentRoute === 'layer2_manual' || currentRoute === 'layer2_genai';

    if (isProtected) {
      const stored = getStoredParticipant();
      if (!stored || (!stored.userId && !stored.user_id)) {
        // No session exists — immediate bounce to landing
        navigateTo('/', 'landing', true);
      } else {
        // If attempting to access Layer 2 routes, verify participant is promoted
        const isL2Route = currentRoute === 'layer2' || currentRoute === 'layer2_manual' || currentRoute === 'layer2_genai';
        if (isL2Route && !stored.promoted_to_layer2) {
          navigateTo('/play', 'arena', true);
          return;
        }

        // Active session exists — asynchronously verify against Supabase users table
        participantGuard.validateParticipantExists(stored.userId || stored.user_id).then((valid) => {
          if (!valid) {
            handleForceExit('Your participant record no longer exists in the event database.');
          }
        });
      }
    }
  }, [currentRoute, navigateTo, handleForceExit]);

  // 3. Re-validate on tab visibility/focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const stored = getStoredParticipant();
        const isProtected = currentRoute === 'arena' || currentRoute === 'layer1' || currentRoute === 'layer2' || currentRoute === 'layer2_manual' || currentRoute === 'layer2_genai';
        if (isProtected && stored) {
          participantGuard.validateParticipantExists(stored.userId || stored.user_id);
        }
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [currentRoute]);

  // 4. Synchronize route state with browser popstate and hashchange events
  useEffect(() => {
    const handleLocationChange = () => {
      const route = getRouteFromLocation();
      const stored = getStoredParticipant();
      setParticipant(stored);

      // Guard check on back/forward button navigation
      const isProtected = route === 'arena' || route === 'layer1' || route === 'layer2' || route === 'layer2_manual' || route === 'layer2_genai';
      if (isProtected && (!stored || (!stored.userId && !stored.user_id))) {
        navigateTo('/', 'landing', true);
      } else {
        const path = window.location.pathname.toLowerCase();
        const isLayer2 = path.startsWith('/layer/2') || path.startsWith('/layer2') || path.startsWith('/layer-2');
        const isLayer1 = path.startsWith('/layer/1') || path.startsWith('/layer1') || path.startsWith('/layer-1');
        const isManual = path.includes('manual');
        const isGenAi = path.includes('gen-ai') || path.includes('genai');

        if (isLayer2 && isManual) {
          setSelectedRound({ path: '/layer2/manual', title: 'LAYER 02 - MANUAL TRACK' });
        } else if (isLayer2 && isGenAi) {
          setSelectedRound({ path: '/layer2/gen-ai', title: 'LAYER 02 - GEN AI TRACK' });
        } else if (isLayer1 && isManual) {
          setSelectedRound({ path: '/layer1/manual', title: 'LAYER 01 - MANUAL TRACK' });
        } else if (isLayer1 && isGenAi) {
          setSelectedRound({ path: '/layer1/gen-ai', title: 'LAYER 01 - GEN AI TRACK' });
        } else if (path === '/play' || path === '/arena') {
          setSelectedRound(null);
        }
        setCurrentRoute(route);
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [getRouteFromLocation, navigateTo]);

  // Participant Registration Complete Handler
  const handleRegistrationComplete = (participantData) => {
    setTerminationNotice(null);
    saveParticipantSession(participantData);
    setParticipant(participantData);
    soundEngine.playWarp();
    navigateTo('/play', 'arena');
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#030712'
      }}
    >
      {/* ==================================================================== */}
      {/* TERMINATION / FORCE EXIT MODAL OVERLAY */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {terminationNotice && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              background: 'rgba(2, 6, 23, 0.94)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="cyber-card"
              style={{
                width: '100%',
                maxWidth: '520px',
                padding: '32px',
                boxSizing: 'border-box',
                background: 'rgba(10, 15, 30, 0.98)',
                borderColor: '#ef4444',
                boxShadow: '0 0 50px rgba(239, 68, 68, 0.4), inset 0 0 20px rgba(239, 68, 68, 0.15)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '2px solid #ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)'
                }}
              >
                <UserX size={32} color="#ef4444" />
              </div>

              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: '#ef4444',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    marginBottom: '4px'
                  }}
                >
                  SYSTEM NOTICE // ACCESS TERMINATED
                </div>

                <h2
                  style={{
                    fontFamily: 'var(--font-title)',
                    fontSize: '1.4rem',
                    margin: 0,
                    color: '#ffffff',
                    letterSpacing: '0.08em'
                  }}
                >
                  PARTICIPANT REMOVED
                </h2>
              </div>

              <div
                style={{
                  padding: '14px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  color: '#e5e7eb',
                  lineHeight: 1.5,
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                {terminationNotice.message}
                <div style={{ marginTop: '8px', fontSize: '0.7rem', color: '#9ca3af' }}>
                  All local session data and layer progress have been cleared. You must re-register to enter the arena.
                </div>
              </div>

              <button
                onClick={() => {
                  setTerminationNotice(null);
                  soundEngine.playClick();
                  navigateTo('/register', 'register', true);
                }}
                className="cyber-btn"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderColor: 'var(--cyan-glow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '8px'
                }}
              >
                <span>PROCEED TO REGISTRATION</span>
                <ArrowRight size={16} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1. LANDING PAGE (ROUTE: /) */}
      {currentRoute === 'landing' && (
        <IntroScene
          onBegin={() => navigateTo('/register', 'register')}
        />
      )}

      {/* 2. REGISTRATION TERMINAL (ROUTE: /register) */}
      {currentRoute === 'register' && (
        <RegistrationScene
          onRegistrationSubmit={handleRegistrationComplete}
        />
      )}

      {/* 3. EVENT ARENA & CHALLENGE LAYERS (ROUTE: /play, generic /layer1, generic /layer2) */}
      {(currentRoute === 'arena' || currentRoute === 'layer1' || currentRoute === 'layer2') && (
        <EventArenaScene
          participant={participant}
          initialRound={selectedRound}
          onNavigate={(path, round) => {
            if (path === '/play') {
              setSelectedRound(null);
              navigateTo('/play', 'arena');
            } else if (path.includes('1')) {
              const roundObj = round || {
                path,
                title: path.includes('manual') ? 'LAYER 01 - MANUAL TRACK' : 'LAYER 01 - GEN AI TRACK'
              };
              setSelectedRound(roundObj);
              navigateTo(path, 'layer1');
            } else if (path.includes('2')) {
              const roundObj = round || {
                path,
                title: path.includes('manual') ? 'LAYER 02 - MANUAL TRACK' : 'LAYER 02 - GEN AI TRACK'
              };
              setSelectedRound(roundObj);
              if (path.includes('manual')) {
                navigateTo(path, 'layer2_manual');
              } else if (path.includes('gen-ai') || path.includes('genai')) {
                navigateTo(path, 'layer2_genai');
              } else {
                navigateTo(path, 'layer2');
              }
            }
          }}
          onForceExit={handleForceExit}
          onOpenAdmin={() => navigateTo('/admin-panel', 'admin')}
        />
      )}

      {/* 3b. DEDICATED LAYER 2 MANUAL ROUTE (ROUTE: /layer2/manual) */}
      {currentRoute === 'layer2_manual' && (
        <Layer2ManualRoute
          participant={participant}
          onBack={() => navigateTo('/play', 'arena')}
        />
      )}

      {/* 3c. DEDICATED LAYER 2 GEN AI ROUTE (ROUTE: /layer2/gen-ai) */}
      {currentRoute === 'layer2_genai' && (
        <Layer2GenAIRoute
          participant={participant}
          onBack={() => navigateTo('/play', 'arena')}
        />
      )}

      {/* 4. ADMIN MISSION CONTROL (ROUTE: /admin, /admin-panel) */}
      {currentRoute === 'admin' && (
        <AdminDashboard
          onClose={() => navigateTo('/play', 'arena')}
        />
      )}
    <ToastContainer />
    </div>
  );
}

export default App;
