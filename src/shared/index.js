// ==========================================================================
// CODE MEETS AI - SHARED DOMAIN EXPORTS
// ==========================================================================

// Components
export { default as ArenaHeader } from './components/ArenaHeader';
export { default as ArenaStatusPanel } from './components/ArenaStatusPanel';
export { default as BeginButton } from './components/BeginButton';
export { default as DiagonalSlash } from './components/DiagonalSlash';
export { default as DigitalParticles } from './components/DigitalParticles';
export { default as EventArenaScene } from './components/EventArenaScene';
export { default as EventHeader } from './components/EventHeader';
export { default as EventTitle } from './components/EventTitle';
export { default as HandshakeVideoBackground } from './components/HandshakeVideoBackground';
export { default as InputField } from './components/InputField';
export { default as IntroScene } from './components/IntroScene';
export { default as IntroTransition } from './components/IntroTransition';
export { default as LayerCard } from './components/LayerCard';
export { default as LetsPlayButton } from './components/LetsPlayButton';
export { default as LockedBlurOverlay } from './components/LockedBlurOverlay';
export { default as PageThreeArena } from './components/PageThreeArena';
export { default as PageTransition } from './components/PageTransition';
export { default as PageTwoRegistration } from './components/PageTwoRegistration';
export { default as PlayerProfileCard } from './components/PlayerProfileCard';
export { default as ProgressTicker } from './components/ProgressTicker';
export { default as RegistrationBackground } from './components/RegistrationBackground';
export { default as RegistrationForm } from './components/RegistrationForm';
export { default as RegistrationScene } from './components/RegistrationScene';
export { default as RoundPlaceholder } from './components/RoundPlaceholder';
export { default as ScanOverlay } from './components/ScanOverlay';
export { default as SelectField } from './components/SelectField';
export { default as ThreeBackground } from './components/ThreeBackground';
export { default as ValidationMessage } from './components/ValidationMessage';
export { default as VideoOverlay } from './components/VideoOverlay';

// Services
export { supabase, isSupabaseConfigured, checkSupabaseConnection } from './services/supabaseClient';
export { eventStateService } from './services/eventStateService';
export { participantGuard } from './services/participantGuard';
export { imagekitClient } from './services/imagekitClient';

// Utils
export { soundEngine } from './utils/SoundEngine';
