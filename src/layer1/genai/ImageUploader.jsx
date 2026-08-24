import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, X, Trash2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { soundEngine } from '../../shared/utils/SoundEngine';

export default function ImageUploader({
  images = [],
  onAddImages,
  onRemoveImage,
  disabled = false,
  maxImages = 1
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Accepted MIME types
  const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  const validateAndProcessFiles = (fileList) => {
    if (disabled) return;
    setLocalError(null);

    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    // Check if an image is already uploaded
    if (images.length >= maxImages) {
      soundEngine.playClick();
      setLocalError('Only one image can be uploaded. Remove the current image to upload a new one.');
      return;
    }

    // Check if user dropped / selected multiple files at once
    if (files.length > 1) {
      soundEngine.playClick();
      setLocalError('Only one image can be uploaded at a time.');
      return;
    }

    const file = files[0];

    // Check if valid image file
    const isValidType = ACCEPTED_TYPES.includes(file.type) || file.type.startsWith('image/');
    if (!isValidType) {
      soundEngine.playClick();
      setLocalError('Invalid file type. Please upload an image file (PNG, JPG, JPEG, or WEBP).');
      return;
    }

    soundEngine.playClick();

    const newEntry = {
      id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      file,
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      previewUrl: URL.createObjectURL(file)
    };

    onAddImages([newEntry]);

    // Reset input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileInputChange = (e) => {
    validateAndProcessFiles(e.target.files);
  };

  const handleTriggerUpload = () => {
    if (disabled) return;
    if (images.length >= maxImages) {
      soundEngine.playClick();
      setLocalError('Only one image can be uploaded. Remove the current image to replace it.');
      return;
    }
    soundEngine.playClick();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Drag & Drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer && e.dataTransfer.files) {
      validateAndProcessFiles(e.dataTransfer.files);
    }
  };

  const selectedImage = images[0] || null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        background: 'rgba(3, 7, 20, 0.75)',
        border: '1px solid rgba(0, 243, 255, 0.2)',
        borderRadius: '4px',
        padding: '12px',
        boxSizing: 'border-box',
        position: 'relative',
        opacity: disabled ? 0.7 : 1,
        gap: '8px'
      }}
    >
      {/* Hidden Single-File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={false}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ImageIcon size={14} color="var(--cyan-glow)" />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: 'var(--cyan-glow)',
              letterSpacing: '0.12em',
              fontWeight: 700
            }}
          >
            IMAGE SUBMISSION
          </span>
        </div>

        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.66rem',
            color: selectedImage ? 'var(--lime-accent)' : 'rgba(0, 243, 255, 0.6)'
          }}
        >
          {selectedImage ? '1 / 1 IMAGE ATTACHED' : '0 / 1 IMAGE ATTACHED'}
        </div>
      </div>

      {/* Inline Warning Notice */}
      <AnimatePresence>
        {localError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              padding: '6px 10px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              borderRadius: '2px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: '#fca5a5'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={13} color="#ef4444" style={{ flexShrink: 0 }} />
              <span>{localError}</span>
            </div>
            <button
              onClick={() => setLocalError(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fca5a5',
                cursor: 'pointer',
                padding: '0 2px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN UPLOAD / PREVIEW BODY */}
      {selectedImage ? (
        /* 1. SINGLE IMAGE PREVIEW CARD */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            padding: '10px 14px',
            background: 'rgba(2, 6, 20, 0.95)',
            border: '1px solid rgba(57, 255, 20, 0.4)',
            boxShadow: '0 0 20px rgba(57, 255, 20, 0.15), inset 0 0 15px rgba(57, 255, 20, 0.05)',
            borderRadius: '4px'
          }}
        >
          {/* Left Thumbnail + File Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '3px',
                border: '1px solid var(--lime-accent)',
                overflow: 'hidden',
                flexShrink: 0,
                background: '#000000',
                position: 'relative'
              }}
            >
              <img
                src={selectedImage.previewUrl}
                alt={selectedImage.name || 'Preview'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  color: '#ffffff',
                  fontWeight: 700,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                title={selectedImage.name}
              >
                {selectedImage.name || 'Generated_Image.png'}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: '#9ca3af' }}>
                {selectedImage.size} • <span style={{ color: 'var(--lime-accent)', fontWeight: 700 }}>READY FOR SUBMISSION</span>
              </div>
            </div>
          </div>

          {/* Right Action: Remove Button */}
          {!disabled && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                soundEngine.playClick();
                setLocalError(null);
                onRemoveImage(selectedImage.id || 0);
              }}
              className="cyber-btn"
              style={{
                padding: '6px 12px',
                fontSize: '0.7rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(239, 68, 68, 0.15)',
                borderColor: '#ef4444',
                color: '#fca5a5',
                flexShrink: 0,
                cursor: 'pointer'
              }}
              title="Remove this image to choose another"
            >
              <Trash2 size={13} color="#ef4444" />
              <span>REMOVE</span>
            </motion.button>
          )}
        </motion.div>
      ) : (
        /* 2. DRAG & DROP / CLICK-TO-UPLOAD DROPZONE */
        <motion.div
          onClick={handleTriggerUpload}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          whileHover={!disabled ? { borderColor: 'var(--cyan-glow)' } : {}}
          animate={{
            borderColor: isDragging ? 'var(--cyan-glow)' : 'rgba(0, 243, 255, 0.3)',
            backgroundColor: isDragging ? 'rgba(0, 243, 255, 0.12)' : 'rgba(2, 6, 20, 0.85)',
            boxShadow: isDragging ? '0 0 25px rgba(0, 243, 255, 0.3), inset 0 0 15px rgba(0, 243, 255, 0.15)' : 'none'
          }}
          transition={{ duration: 0.2 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '18px 16px',
            borderWidth: '1.5px',
            borderStyle: isDragging ? 'solid' : 'dashed',
            borderRadius: '4px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            textAlign: 'center',
            userSelect: 'none',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: isDragging ? 'rgba(0, 243, 255, 0.2)' : 'rgba(0, 243, 255, 0.08)',
              border: '1px solid var(--cyan-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--cyan-glow)',
              transition: 'all 0.2s ease'
            }}
          >
            <UploadCloud size={20} />
          </div>

          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: isDragging ? '#ffffff' : 'var(--cyan-glow)',
                letterSpacing: '0.04em'
              }}
            >
              {isDragging ? 'DROP YOUR IMAGE HERE' : 'DRAG & DROP IMAGE HERE'}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
                color: '#9ca3af',
                marginTop: '2px'
              }}
            >
              or <span style={{ color: '#ffffff', textDecoration: 'underline' }}>click to browse</span> from your device
            </div>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.62rem',
              color: 'rgba(156, 163, 175, 0.7)',
              letterSpacing: '0.04em',
              marginTop: '2px'
            }}
          >
            Supported formats: PNG, JPG, JPEG, WEBP • Max: 1 Image
          </div>
        </motion.div>
      )}
    </div>
  );
}
