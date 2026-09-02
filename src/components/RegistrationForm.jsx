import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Hash, GitBranch, Calendar, Grid } from 'lucide-react';
import InputField from './InputField';
import SelectField from './SelectField';
import ValidationMessage from './ValidationMessage';
import LetsPlayButton from './LetsPlayButton';
import { adminService } from '../admin/services/adminService';
import { supabase, isSupabaseConfigured } from '../shared/services/supabaseClient';

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

  // Roll Number specific validation & authorization states
  const [rollVerified, setRollVerified] = useState(false);
  const [rollSuccessMessage, setRollSuccessMessage] = useState('');
  const [isValidatingRoll, setIsValidatingRoll] = useState(false);

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

  const validateAndAdvanceRollNumber = async (rollOverride) => {
    const roll = (rollOverride !== undefined ? rollOverride : formData.rollNumber || '').trim().toUpperCase();

    // RULE 1 — FORMAT VALIDATION
    if (!roll) {
      setErrors((prev) => ({ ...prev, rollNumber: true }));
      setGlobalError('INVALID ROLL NUMBER // ROLL NUMBER IS REQUIRED');
      setRollVerified(false);
      setRollSuccessMessage('');
      rollRef.current?.focus();
      return false;
    }

    if (roll.length !== 10) {
      setErrors((prev) => ({ ...prev, rollNumber: true }));
      setGlobalError(`INVALID ROLL NUMBER FORMAT // MUST BE EXACTLY 10 CHARACTERS (RECEIVED ${roll.length})`);
      setRollVerified(false);
      setRollSuccessMessage('');
      rollRef.current?.focus();
      return false;
    }

    if (!roll.startsWith('25') && !roll.startsWith('26')) {
      setErrors((prev) => ({ ...prev, rollNumber: true }));
      setGlobalError('INVALID ROLL NUMBER FORMAT // FIRST TWO CHARACTERS MUST BE 25 OR 26');
      setRollVerified(false);
      setRollSuccessMessage('');
      rollRef.current?.focus();
      return false;
    }

    if (!/^[A-Z0-9]{10}$/i.test(roll)) {
      setErrors((prev) => ({ ...prev, rollNumber: true }));
      setGlobalError('INVALID ROLL NUMBER FORMAT // ONLY LETTERS & NUMBERS ALLOWED');
      setRollVerified(false);
      setRollSuccessMessage('');
      rollRef.current?.focus();
      return false;
    }

    // RULE 2 — DATABASE / AUTHORIZATION CHECK
    setIsValidatingRoll(true);
    try {
      let existingUser = null;
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('roll_number', roll)
          .maybeSingle();

        if (error) {
          console.warn('[Supabase::rollCheck] Warning:', error);
        }
        existingUser = data;
      }

      setErrors((prev) => ({ ...prev, rollNumber: false }));
      setGlobalError('');
      setRollVerified(true);

      if (existingUser) {
        setRollSuccessMessage('✓ PARTICIPANT VERIFIED (RETURNING PLAYER)');
        setFormData((prev) => ({
          ...prev,
          name: prev.name.trim() ? prev.name : existingUser.name || prev.name,
          branch: prev.branch || existingUser.branch || '',
          year: prev.year || (roll.startsWith('26') ? '1st Year' : '2nd Year'),
          section: prev.section || existingUser.section || 'A'
        }));
      } else {
        const autoYear = roll.startsWith('26') ? '1st Year' : '2nd Year';
        setFormData((prev) => ({
          ...prev,
          year: prev.year || autoYear
        }));
        setRollSuccessMessage('✓ PARTICIPANT VERIFIED');
      }

      // SUCCESS STATE: Progression to Branch
      setTimeout(() => {
        branchRef.current?.focus();
      }, 50);

      return true;
    } catch (err) {
      console.error('Roll number verification error:', err);
      setErrors((prev) => ({ ...prev, rollNumber: false }));
      setGlobalError('');
      setRollVerified(true);
      setRollSuccessMessage('✓ PARTICIPANT VERIFIED');
      setTimeout(() => {
        branchRef.current?.focus();
      }, 50);
      return true;
    } finally {
      setIsValidatingRoll(false);
    }
  };

  const handleRollKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      validateAndAdvanceRollNumber();
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
    const finalValue = field === 'rollNumber' ? value.slice(0, 10) : value;
    const updated = { ...formData, [field]: finalValue };
    setFormData(updated);
    if (field === 'rollNumber') {
      setRollVerified(false);
      setRollSuccessMessage('');
      if (finalValue.length === 10) {
        validateAndAdvanceRollNumber(finalValue);
      }
    }
    if (onFormChange) onFormChange(updated);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
    if (globalError) setGlobalError('');
  };

  // Determine progress steps
  const isIdentityComplete = Boolean(formData.name.trim() && formData.rollNumber.trim() && rollVerified);
  const isAcademicComplete = Boolean(formData.branch && formData.year);
  const isArenaAccessComplete = Boolean(formData.section);

  const isFormFullyComplete = isIdentityComplete && isAcademicComplete && isArenaAccessComplete;

  const handleValidationAndSubmit = async () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = true;

    // Must validate Roll Number if not already verified
    if (!rollVerified) {
      const isValidRoll = await validateAndAdvanceRollNumber();
      if (!isValidRoll) {
        return;
      }
    }

    const roll = formData.rollNumber.trim().toUpperCase();

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
      // Register or retrieve participant in Supabase users table
      const { data, error } = await adminService.registerUser({
        name: formData.name.trim(),
        rollNumber: roll,
        branch: formData.branch,
        year: roll.startsWith('26') ? 1 : roll.startsWith('25') ? 2 : (formData.year.includes('1') ? 1 : 2),
        section: formData.section
      });

      if (error || !data) {
        setErrors({ rollNumber: true });
        setGlobalError(error?.message || 'REGISTRATION REJECTED // UNABLE TO AUTHORIZE ROLL NUMBER');
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
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        padding: '24px 28px',
        background: 'rgba(5, 12, 28, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(0, 243, 255, 0.3)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 243, 255, 0.15)',
        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)'
      }}
    >
      {/* Top Header & Cyber Subtitle */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: 'var(--cyan-glow)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: '4px',
            opacity: 0.9
          }}
        >
          [ COMPETITOR REGISTRATION PROTOCOL ]
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '1.45rem',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            margin: 0,
            textShadow: '0 0 12px rgba(0, 243, 255, 0.5)'
          }}
        >
          IDENTITY VERIFICATION
        </h2>
      </div>

      {/* Main Registration Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleValidationAndSubmit();
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Field 1: Full Name */}
          <InputField
            ref={nameRef}
            label="FULL NAME"
            placeholder="Enter full legal name"
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
            placeholder="Enter roll number (e.g. 25121A0501)"
            value={formData.rollNumber}
            onChange={(e) => handleChange('rollNumber', e.target.value)}
            onKeyDown={handleRollKeyDown}
            error={errors.rollNumber}
            successMessage={rollSuccessMessage}
            maxLength={10}
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
            disabled={!rollVerified}
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
              disabled={!rollVerified}
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
              disabled={!rollVerified}
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
                fontSize: '0.68rem',
                color: 'var(--cyan-glow)',
                letterSpacing: '0.08em'
              }}
            >
              {PERSONALITY_TICKERS[tickerIndex]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global Technical Validation Error Banner */}
        <ValidationMessage message={globalError} />

        {/* Cyber Submit Action Button */}
        <div style={{ marginTop: '4px' }}>
          <LetsPlayButton
            ref={buttonRef}
            onClick={handleValidationAndSubmit}
            disabled={isSubmitting || isValidatingRoll}
            isComplete={isFormFullyComplete}
          />
        </div>
      </form>
    </div>
  );
}
