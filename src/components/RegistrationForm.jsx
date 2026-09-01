import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Hash, GitBranch, Calendar, Grid } from 'lucide-react';
import InputField from './InputField';
import SelectField from './SelectField';
import ValidationMessage from './ValidationMessage';
import LetsPlayButton from './LetsPlayButton';
import { adminService } from '../services/adminService';

const BRANCH_OPTIONS = [
  'CSE', 'AI & DS', 'AIML', 'IT', 'ECE', 'EEE', 'ME', 'CIVIL', 'Other'
];

const YEAR_OPTIONS = [
  '1st Year', '2nd Year'
];

const SECTION_OPTIONS = [
  'A', 'B', 'C', 'D'
];

const PERSONALITY_TICKERS = [
  'Checking if you\'re actually ready...',
  'Compiling participant profile...',
  'Human verified. Probably.',
  'AI is watching 👀',
  'Verifying arena permissions...',
  'Okay. You look dangerous.'
];

export default function RegistrationForm({ onSubmit, onFormChange }) {
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    branch: '',
    year: '',
    section: ''
  });

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [tickerIndex, setTickerIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field Refs for Sequential Keyboard Focus Flow
  const nameRef = useRef(null);
  const rollRef = useRef(null);
  const branchRef = useRef(null);
  const yearRef = useRef(null);
  const sectionRef = useRef(null);
  const buttonRef = useRef(null);

  // Auto-focus Full Name field on component mount
  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  // Keyboard Navigation Event Handlers
  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      rollRef.current?.focus();
    }
  };

  const handleRollKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      branchRef.current?.focus();
    }
  };

  const handleBranchConfirmNext = () => {
    yearRef.current?.focus();
  };

  const handleYearConfirmNext = () => {
    sectionRef.current?.focus();
  };

  const handleSectionConfirmNext = () => {
    buttonRef.current?.focus();
  };

  // Rotate subtle technical status messages
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % PERSONALITY_TICKERS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (onFormChange) onFormChange(updated);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
    if (globalError) setGlobalError('');
  };

  // Determine progress steps
  const isIdentityComplete = Boolean(formData.name.trim() && formData.rollNumber.trim());
  const isAcademicComplete = Boolean(formData.branch && formData.year);
  const isArenaAccessComplete = Boolean(formData.section);

  const isFormFullyComplete = isIdentityComplete && isAcademicComplete && isArenaAccessComplete;

  const handleValidationAndSubmit = async () => {
    const newErrors = {};
    const roll = formData.rollNumber.trim().toUpperCase();

    if (!formData.name.trim()) newErrors.name = true;

    // Strict 10-character alphanumeric roll number validation
    if (!roll) {
      newErrors.rollNumber = true;
    } else if (roll.length !== 10) {
      newErrors.rollNumber = true;
      setErrors(newErrors);
      setGlobalError(`INVALID ROLL NUMBER // MUST BE EXACTLY 10 CHARACTERS (RECEIVED ${roll.length})`);
      return;
    } else if (!roll.startsWith('25') && !roll.startsWith('26')) {
      newErrors.rollNumber = true;
      setErrors(newErrors);
      setGlobalError('INVALID ROLL NUMBER // FIRST TWO CHARACTERS MUST BE 25 (2ND YEAR) OR 26 (1ST YEAR)');
      return;
    } else if (!/^[A-Z0-9]{10}$/i.test(roll)) {
      newErrors.rollNumber = true;
      setErrors(newErrors);
      setGlobalError('INVALID ROLL NUMBER // ONLY LETTERS & NUMBERS ALLOWED (NO SPECIAL CHARACTERS)');
      return;
    }

    // Verify Year selection against Roll Number Prefix
    const expectedYearLabel = roll.startsWith('26') ? '1st Year' : '2nd Year';
    const isMismatch =
      (roll.startsWith('26') && formData.year && formData.year.toLowerCase().includes('2')) ||
      (roll.startsWith('25') && formData.year && formData.year.toLowerCase().includes('1'));

    if (isMismatch) {
      newErrors.year = true;
      newErrors.rollNumber = true;
      setErrors(newErrors);
      setGlobalError(`YEAR MISMATCH // ROLL PREFIX ${roll.substring(0, 2)} IS ${expectedYearLabel.toUpperCase()}, BUT ${formData.year.toUpperCase()} SELECTED`);
      return;
    }

    if (!formData.branch) newErrors.branch = true;
    if (!formData.year) newErrors.year = true;
    if (!formData.section) newErrors.section = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setGlobalError('IDENTITY DATA INCOMPLETE // ALL FIELDS REQUIRED TO INITIALIZE SESSION');
      return;
    }

    setGlobalError('');
    setIsSubmitting(true);

    try {
      // Register into Supabase users table
      const { data, error } = await adminService.registerUser({
        name: formData.name.trim(),
        rollNumber: roll,
        branch: formData.branch,
        year: roll.startsWith('26') ? 1 : roll.startsWith('25') ? 2 : formData.year,
        section: formData.section
      });

      if (error || !data) {
        setErrors({ rollNumber: true });
        setGlobalError(error?.message || 'REGISTRATION REJECTED // ROLL NUMBER IS ALREADY REGISTERED');
        return;
      }

      const participantPayload = {
        userId: data.user_id,
        name: data.name,
        rollNumber: data.roll_number,
        branch: data.branch,
        year: data.year,
        section: data.section,
        serialNumber: data.serial_number || 1
      };

      onSubmit(participantPayload);
    } catch (err) {
      console.error('Registration exception:', err);
      setGlobalError('REGISTRATION FAILED // UNABLE TO REACH EVENT SERVER');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '540px'
      }}
    >
      {/* FLOATING HOLOGRAPHIC AMBIENT INDICATORS AROUND CARD */}
      <div
        style={{
          position: 'absolute',
          top: '-24px',
          left: '-20px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: 'rgba(0, 243, 255, 0.6)',
          letterSpacing: '0.12em',
          pointerEvents: 'none'
        }}
        className="hidden md:block"
      >
        [ PLAYER SLOT: READY ]
      </div>

      <div
        style={{
          position: 'absolute',
          top: '-24px',
          right: '-20px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: 'rgba(57, 255, 20, 0.7)',
          letterSpacing: '0.12em',
          pointerEvents: 'none'
        }}
        className="hidden md:block"
      >
        [ ARENA CONNECTION: STABLE ]
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '-24px',
          left: '-20px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: 'rgba(224, 38, 255, 0.6)',
          letterSpacing: '0.12em',
          pointerEvents: 'none'
        }}
        className="hidden md:block"
      >
        [ AI CORE: ONLINE ]
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '-24px',
          right: '-20px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: 'rgba(0, 243, 255, 0.6)',
          letterSpacing: '0.12em',
          pointerEvents: 'none'
        }}
        className="hidden md:block"
      >
        [ COMPETITION INITIALIZING ]
      </div>

      {/* MAIN PLAYER INITIALIZATION TERMINAL CARD */}
      <div
        className="cyber-card"
        style={{
          width: '100%',
          padding: '24px 28px',
          boxSizing: 'border-box',
          zIndex: 25,
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: isFormFullyComplete
            ? '0 12px 50px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 243, 255, 0.3), inset 0 0 15px rgba(0, 243, 255, 0.15)'
            : '0 12px 40px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 243, 255, 0.15)',
          transition: 'all 0.4s ease'
        }}
      >
        {/* Corner Bracket Accents */}
        <div className="hud-corner hud-top-left" style={{ width: '12px', height: '12px' }} />
        <div className="hud-corner hud-top-right" style={{ width: '12px', height: '12px' }} />
        <div className="hud-corner hud-bottom-left" style={{ width: '12px', height: '12px' }} />
        <div className="hud-corner hud-bottom-right" style={{ width: '12px', height: '12px' }} />

        {/* Terminal Micro Header & Title */}
        <div style={{ textAlign: 'center', marginBottom: '2px' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              color: 'var(--cyan-glow)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              marginBottom: '4px'
            }}
          >
            PLAYER INITIALIZATION // 01
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: '1.3rem',
              margin: 0,
              color: '#ffffff',
              letterSpacing: '0.1em',
              textShadow: '0 0 12px rgba(0, 243, 255, 0.6)'
            }}
          >
            IDENTITY VERIFICATION
          </h2>

          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: '#9ca3af',
              marginTop: '4px',
              margin: 0
            }}
          >
            Enter your details to initialize your Code Meets AI session.
          </p>
        </div>

        {/* PROFILE INITIALIZATION STEP INDICATOR */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'rgba(2, 6, 18, 0.8)',
            border: '1px solid rgba(0, 243, 255, 0.15)',
            borderRadius: '2px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            letterSpacing: '0.08em'
          }}
        >
          <span style={{ color: 'rgba(0, 243, 255, 0.7)' }}>PROFILE SETUP:</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ color: isIdentityComplete ? 'var(--lime-accent)' : '#9ca3af' }}>
              {isIdentityComplete ? '●' : '○'} IDENTITY
            </span>
            <span style={{ color: isAcademicComplete ? 'var(--lime-accent)' : '#9ca3af' }}>
              {isAcademicComplete ? '●' : '○'} ACADEMIC
            </span>
            <span style={{ color: isArenaAccessComplete ? 'var(--lime-accent)' : '#9ca3af' }}>
              {isArenaAccessComplete ? '●' : '○'} ARENA ACCESS
            </span>
          </div>
        </div>

        {/* Global Sci-Fi Validation Error Banner */}
        <ValidationMessage message={globalError} />

        {/* Form Fields Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Field 1: Full Name */}
          <InputField
            ref={nameRef}
            label="FULL NAME"
            placeholder="Enter your name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onKeyDown={handleNameKeyDown}
            error={errors.name}
            icon={User}
          />

          {/* Field 2: Roll Number */}
          <InputField
            ref={rollRef}
            label="ROLL NUMBER"
            placeholder="Enter roll number"
            value={formData.rollNumber}
            onChange={(e) => handleChange('rollNumber', e.target.value)}
            onKeyDown={handleRollKeyDown}
            error={errors.rollNumber}
            icon={Hash}
          />

          {/* Field 3: Branch Dropdown */}
          <SelectField
            ref={branchRef}
            label="BRANCH"
            placeholder="Select Branch"
            value={formData.branch}
            onChange={(e) => handleChange('branch', e.target.value)}
            onConfirmNext={handleBranchConfirmNext}
            options={BRANCH_OPTIONS}
            error={errors.branch}
            icon={GitBranch}
          />

          {/* Two-Column Row for Year & Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Field 4: Year Dropdown */}
            <SelectField
              ref={yearRef}
              label="YEAR"
              placeholder="Select Year"
              value={formData.year}
              onChange={(e) => handleChange('year', e.target.value)}
              onConfirmNext={handleYearConfirmNext}
              options={YEAR_OPTIONS}
              error={errors.year}
              icon={Calendar}
            />

            {/* Field 5: Section Dropdown */}
            <SelectField
              ref={sectionRef}
              label="SECTION"
              placeholder="Select Section"
              value={formData.section}
              onChange={(e) => handleChange('section', e.target.value)}
              onConfirmNext={handleSectionConfirmNext}
              options={SECTION_OPTIONS}
              error={errors.section}
              icon={Grid}
            />
          </div>
        </div>

        {/* Subtle Personality Status Ticker */}
        <div style={{ textAlign: 'center', height: '16px', margin: '-2px 0' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={tickerIndex}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 0.7, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: 'var(--cyan-glow)',
                letterSpacing: '0.1em'
              }}
            >
              {PERSONALITY_TICKERS[tickerIndex]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Main CTA Button: LET'S PLAY */}
        <LetsPlayButton ref={buttonRef} onClick={handleValidationAndSubmit} isComplete={isFormFullyComplete} />
      </div>
    </div>
  );
}
