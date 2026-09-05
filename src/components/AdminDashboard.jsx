import { ConfirmModal, PromptModal } from '../../shared/components/Modals';
import { toast } from '../../shared/components/Toast';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Users,
  Layers,
  Sparkles,
  Code2,
  Lock,
  Unlock,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Check,
  AlertTriangle,
  X,
  Radio,
  Trophy,
  Zap,
  Activity,
  LogOut,
  UserPlus,
  Copy,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  FileText,
  Terminal
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { eventStateService } from '../../shared/services/eventStateService';
import { checkSupabaseConnection } from '../../shared/services/supabaseClient';
import { soundEngine } from '../../shared/utils/SoundEngine';
import AdminLoginGate from '../components/AdminLoginGate';

export default function AdminDashboard({ onClose }) {
  // Auth state from sessionStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('cma_admin_auth') === 'true';
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState('overview');

  // Supabase Connection state
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [promptModal, setPromptModal] = useState({ isOpen: false, title: '', message: '', defaultValue: '', onConfirm: null });
  const [readingExplanation, setReadingExplanation] = useState({ isOpen: false, title: '', message: '' });
  
  const [viewingManualDetails, setViewingManualDetails] = useState(null);
  const [connStatus, setConnStatus] = useState({ connected: false, configured: false, message: 'CHECKING...' });

  // Database Data States
  const [usersList, setUsersList] = useState([]);
  const [layer1List, setLayer1List] = useState([]);
  const [layer1SubmissionsList, setLayer1SubmissionsList] = useState([]);
  const [layer1ManualAttemptsList, setLayer1ManualAttemptsList] = useState([]);
  const [layer2List, setLayer2List] = useState([]);
  const [layer2ManualAttemptsList, setLayer2ManualAttemptsList] = useState([]);
  const [layer2GenAiSubmissionsList, setLayer2GenAiSubmissionsList] = useState([]);
  const [duosList, setDuosList] = useState([]);
  const [eventSettings, setEventSettings] = useState({
    layer_1_locked: true,
    layer_2_locked: true,
    layer_3_locked: true,
    layer_4_locked: true,
    layer_1_genai_active: false,
    layer_1_manual_active: false,
    layer_2_genai_active: false,
    layer_2_manual_active: false,
    active_layer: 'standby'
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Search & Filter states
  const [userSearch, setUserSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [duoSearch, setDuoSearch] = useState('');
  const [duoYearFilter, setDuoYearFilter] = useState('ALL'); // 'ALL' | '1' | '2'

  const [layer1ActiveSubTab, setLayer1ActiveSubTab] = useState('results'); // 'results' | 'genai' | 'manual'
  const [layer1Search, setLayer1Search] = useState('');
  const [layer1YearFilter, setLayer1YearFilter] = useState('ALL'); // 'ALL' | '1' | '2'

  const [layer2ActiveSubTab, setLayer2ActiveSubTab] = useState('results'); // 'results' | 'genai' | 'manual'
  const [layer2Search, setLayer2Search] = useState('');
  const [layer2YearFilter, setLayer2YearFilter] = useState('ALL'); // 'ALL' | '1' | '2'

  const [submissionSearch, setSubmissionSearch] = useState('');
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState('ALL');
  const [manualSearch, setManualSearch] = useState('');
  const [manualBatchFilter, setManualBatchFilter] = useState('ALL');

  // Layer 1 Promotion State
  const [selectedForPromotion, setSelectedForPromotion] = useState(new Set());
  const [isSavingLayer1Promotion, setIsSavingLayer1Promotion] = useState(false);
  const [layer1PromotionSaveStatus, setLayer1PromotionSaveStatus] = useState(null);

  // Layer 2 Promotion State
  const [selectedForLayer2Promotion, setSelectedForLayer2Promotion] = useState(new Set());
  const [isSavingLayer2Promotion, setIsSavingLayer2Promotion] = useState(false);
  const [layer2PromotionSaveStatus, setLayer2PromotionSaveStatus] = useState(null);

  // Modals state
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const [viewingPrompt, setViewingPrompt] = useState(null);
  const [viewingImages, setViewingImages] = useState(null);
  const [subMarksInputs, setSubMarksInputs] = useState({});
  const [savingSubId, setSavingSubId] = useState(null);

  const [viewingManualBreakdown, setViewingManualBreakdown] = useState(null);
  const [manualMarksInputs, setManualMarksInputs] = useState({});
  const [savingManualId, setSavingManualId] = useState(null);

  const [editingLayer1Marks, setEditingLayer1Marks] = useState(null);
  const [editingLayer2Marks, setEditingLayer2Marks] = useState(null);
  const [deletingLayerResult, setDeletingLayerResult] = useState(null); // { layer: 1|2, rowId, userName }

  const [isCreateDuoOpen, setIsCreateDuoOpen] = useState(false);
  const [editingDuoMarks, setEditingDuoMarks] = useState(null);
  const [deletingDuo, setDeletingDuo] = useState(null);

  const [deletingGenAiSub, setDeletingGenAiSub] = useState(null); // { id, user_id, username, roll_number }
  const [isDeletingGenAiSub, setIsDeletingGenAiSub] = useState(false);

  // Create User form state
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    roll_number: '',
    branch: 'CSE',
    year: 1,
    section: 'A'
  });

  // Create Duo form state
  const [duoForm, setDuoForm] = useState({ player1Id: '', player2Id: '' });

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    if (type === 'success') soundEngine.playClick();
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cma_admin_auth');
    sessionStorage.removeItem('cma_admin_email');
    setIsAuthenticated(false);
    soundEngine.playClick();
  };

  // Central Database Fetcher: guarantees single source of truth from Supabase
  const loadAllDatabaseData = async () => {
    setIsLoading(true);
    try {
      const conn = await checkSupabaseConnection();
      setConnStatus(conn);

      const [usersRes, l1Res, l1SubRes, l1ManRes, l2Res, l2ManRes, l2GenAiRes, duosRes, settingsRes] = await Promise.all([
        adminService.fetchUsers(),
        adminService.fetchLayer1Results(),
        adminService.fetchLayer1Submissions(),
        adminService.fetchLayer1ManualAttempts(),
        adminService.fetchLayer2Results(),
        adminService.fetchAllLayer2ManualAttempts(),
        adminService.fetchLayer2GenAiSubmissions(),
        adminService.fetchDuos(),
        adminService.fetchEventSettings()
      ]);

      if (usersRes?.data) setUsersList(usersRes.data);
      if (l1Res?.data) setLayer1List(l1Res.data);
      if (l1SubRes?.data) setLayer1SubmissionsList(l1SubRes.data);
      if (l1ManRes?.data) setLayer1ManualAttemptsList(l1ManRes.data);
      if (l2Res?.data) setLayer2List(l2Res.data);
      if (l2ManRes?.data) setLayer2ManualAttemptsList(l2ManRes.data);
      if (l2GenAiRes?.data) setLayer2GenAiSubmissionsList(l2GenAiRes.data);
      if (duosRes?.data) setDuosList(duosRes.data);
      if (settingsRes?.data) setEventSettings(settingsRes.data);
    } catch (err) {
      console.error('Error fetching database:', err);
      showToast('FAILED TO REFRESH DATABASE', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllDatabaseData();

      // Subscribe to live Postgres changes across all tables
      const unsubs = [
        adminService.subscribeToChanges('users', () => loadAllDatabaseData()),
        adminService.subscribeToChanges('layer_1', () => loadAllDatabaseData()),
        adminService.subscribeToChanges('layer_1_genai_submissions', () => loadAllDatabaseData()),
        adminService.subscribeToChanges('layer_1_manual_attempts', () => loadAllDatabaseData()),
        adminService.subscribeToChanges('layer_2', () => loadAllDatabaseData()),
        adminService.subscribeToChanges('duos', () => loadAllDatabaseData()),
        adminService.subscribeToChanges('event_settings', (payload) => {
          if (payload.new) setEventSettings(payload.new);
        })
      ];

      return () => {
        unsubs.forEach((unsub) => unsub && unsub());
      };
    }
  }, [isAuthenticated]);

  // Sync selected promotion sets when usersList updates
  useEffect(() => {
    const l1Promoted = new Set();
    const l2Promoted = new Set();
    usersList.forEach((u) => {
      if (u.promoted_to_layer2) l1Promoted.add(u.user_id);
      if (u.promoted_to_layer3) l2Promoted.add(u.user_id);
    });
    setSelectedForPromotion(l1Promoted);
    setSelectedForLayer2Promotion(l2Promoted);
  }, [usersList]);

  // ── LAYER 1 PROMOTION HANDLERS ──
  const togglePromoteUser = (userId) => {
    soundEngine.playClick();
    setSelectedForPromotion((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const selectTopLayer1 = (count) => {
    soundEngine.playClick();
    const topIds = rankedLayer1Results.slice(0, count).map((item) => item.user.user_id);
    setSelectedForPromotion(new Set(topIds));
  };

  const selectAllLayer1 = () => {
    soundEngine.playClick();
    const allIds = rankedLayer1Results.map((item) => item.user.user_id);
    setSelectedForPromotion(new Set(allIds));
  };

  const clearLayer1Selection = () => {
    soundEngine.playClick();
    setSelectedForPromotion(new Set());
  };

  const handleSaveLayer1Promotions = () => {
    soundEngine.playClick();
    if (selectedForPromotion.size === 0) {
      setConfirmModal({
        isOpen: true,
        title: 'Zero Participants Selected',
        message: 'No participants are selected for promotion. If you proceed, ALL participants will be eliminated from Layer 2. Are you sure you want to proceed?',
        onConfirm: async () => {
          setConfirmModal({ isOpen: false });
          executeSaveLayer1Promotions();
        }
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Finalize Layer 1 Promotions',
      message: `You are about to promote ${selectedForPromotion.size} participant(s) to Layer 2. All remaining non-promoted participants will be eliminated from the competition according to event rules. Confirm finalize?`,
      onConfirm: async () => {
        setConfirmModal({ isOpen: false });
        executeSaveLayer1Promotions();
      }
    });
  };

  const executeSaveLayer1Promotions = async () => {
    setIsSavingLayer1Promotion(true);
    setLayer1PromotionSaveStatus('Saving promotions to Supabase...');
    try {
      const allIds = usersList.map((u) => u.user_id);
      const promotedIds = Array.from(selectedForPromotion);

      const { data, error } = await adminService.saveLayer1Promotions(promotedIds, allIds);
      if (error) {
        toast.error(`Promotion save failed: ${error.message || 'Database error'}`);
        setLayer1PromotionSaveStatus('Save failed');
      } else {
        toast.success(`Promotions saved! ${data?.promotedCount ?? promotedIds.length} promoted to Layer 2.`);
        setLayer1PromotionSaveStatus(`Saved ✓ (${data?.promotedCount ?? promotedIds.length} promoted)`);
        await loadAllDatabaseData();
      }
    } catch (err) {
      console.error('Error saving promotions:', err);
      toast.error('Failed to save promotions');
      setLayer1PromotionSaveStatus('Error saving');
    } finally {
      setIsSavingLayer1Promotion(false);
      setTimeout(() => setLayer1PromotionSaveStatus(null), 4000);
    }
  };

  const handleResetLayer1Promotions = () => {
    soundEngine.playClick();
    setConfirmModal({
      isOpen: true,
      title: 'Reset Layer 1 Promotions',
      message: 'This will reset all Layer 1 promotions and restore all eliminated participants to active state. Proceed?',
      onConfirm: async () => {
        setConfirmModal({ isOpen: false });
        const allIds = usersList.map((u) => u.user_id);
        const { error } = await adminService.resetLayer1Promotions(allIds);
        if (error) {
          toast.error('Reset failed: ' + error.message);
        } else {
          toast.success('Layer 1 promotions reset successfully.');
          setSelectedForPromotion(new Set());
          await loadAllDatabaseData();
        }
      }
    });
  };

  // ── LAYER 2 PROMOTION HANDLERS ──
  const togglePromoteLayer2User = (userId) => {
    soundEngine.playClick();
    setSelectedForLayer2Promotion((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const selectTopLayer2 = (count) => {
    soundEngine.playClick();
    const topIds = rankedLayer2Results.slice(0, count).map((item) => item.user.user_id);
    setSelectedForLayer2Promotion(new Set(topIds));
  };

  const selectAllLayer2 = () => {
    soundEngine.playClick();
    const allIds = rankedLayer2Results.map((item) => item.user.user_id);
    setSelectedForLayer2Promotion(new Set(allIds));
  };

  const clearLayer2Selection = () => {
    soundEngine.playClick();
    setSelectedForLayer2Promotion(new Set());
  };

  const handleSaveLayer2Promotions = () => {
    soundEngine.playClick();
    setConfirmModal({
      isOpen: true,
      title: 'Finalize Layer 2 Promotions',
      message: `You are about to promote ${selectedForLayer2Promotion.size} participant(s) to Layer 3 / Layer 4 (Duo Arena). All remaining non-promoted Layer 2 participants will be eliminated. Confirm finalize?`,
      onConfirm: async () => {
        setConfirmModal({ isOpen: false });
        executeSaveLayer2Promotions();
      }
    });
  };

  const executeSaveLayer2Promotions = async () => {
    setIsSavingLayer2Promotion(true);
    setLayer2PromotionSaveStatus('Saving Layer 2 promotions...');
    try {
      const allL2Ids = rankedLayer2Results.map((item) => item.user.user_id);
      const promotedIds = Array.from(selectedForLayer2Promotion);

      const { data, error } = await adminService.saveLayer2Promotions(promotedIds, allL2Ids);
      if (error) {
        toast.error(`Layer 2 promotion save failed: ${error.message || 'Database error'}`);
        setLayer2PromotionSaveStatus('Save failed');
      } else {
        toast.success(`Layer 2 promotions saved! ${data?.promotedCount ?? promotedIds.length} qualified for Layer 3 & Duos.`);
        setLayer2PromotionSaveStatus(`Saved ✓ (${data?.promotedCount ?? promotedIds.length} promoted)`);
        await loadAllDatabaseData();
      }
    } catch (err) {
      console.error('Error saving Layer 2 promotions:', err);
      toast.error('Failed to save Layer 2 promotions');
      setLayer2PromotionSaveStatus('Error saving');
    } finally {
      setIsSavingLayer2Promotion(false);
      setTimeout(() => setLayer2PromotionSaveStatus(null), 4000);
    }
  };

  const handleResetLayer2Promotions = () => {
    soundEngine.playClick();
    setConfirmModal({
      isOpen: true,
      title: 'Reset Layer 2 Promotions',
      message: 'This will reset all Layer 2 promotions to Layer 3. Proceed?',
      onConfirm: async () => {
        setConfirmModal({ isOpen: false });
        const allL2Ids = rankedLayer2Results.map((item) => item.user.user_id);
        const { error } = await adminService.resetLayer2Promotions(allL2Ids);
        if (error) {
          toast.error('Reset failed: ' + error.message);
        } else {
          toast.success('Layer 2 promotions reset successfully.');
          setSelectedForLayer2Promotion(new Set());
          await loadAllDatabaseData();
        }
      }
    });
  };

  // --------------------------------------------------------------------------
  // LAYER & TRACK LOCK CONTROLS
  // --------------------------------------------------------------------------
  const handleToggleLayerLock = async (layerNumber) => {
    soundEngine.playClick();
    const key = `layer_${layerNumber}_locked`;
    const newLockedState = !eventSettings[key];
    const newSettings = { ...eventSettings, [key]: newLockedState };

    setEventSettings(newSettings);

    await eventStateService.setLayerState(
      `layer${layerNumber}`,
      !newLockedState,
      newLockedState ? null : (layerNumber === 1 ? (newSettings.layer_1_genai_active ? 'gen-ai' : 'manual') : (newSettings.layer_2_genai_active ? 'gen-ai' : 'manual'))
    );

    showToast(`LAYER 0${layerNumber} ${newLockedState ? 'LOCKED' : 'UNLOCKED'}`);
  };

  const handleToggleTrack = async (layerNumber, track) => {
    soundEngine.playHover();
    const trackKey = `layer_${layerNumber}_${track === 'gen-ai' ? 'genai' : 'manual'}_active`;
    const newTrackState = !eventSettings[trackKey];
    const newSettings = { ...eventSettings, [trackKey]: newTrackState };

    setEventSettings(newSettings);

    await eventStateService.setLayerState(
      `layer${layerNumber}`,
      !newSettings[`layer_${layerNumber}_locked`],
      newTrackState ? track : null
    );

    showToast(`LAYER 0${layerNumber} ${track.toUpperCase()} ${newTrackState ? 'ACTIVATED' : 'DEACTIVATED'}`);
  };

  // --------------------------------------------------------------------------
  // USERS CRUD ACTIONS
  // --------------------------------------------------------------------------
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserForm.name.trim() || !newUserForm.roll_number.trim()) {
      showToast('NAME AND ROLL NUMBER ARE REQUIRED', 'error');
      return;
    }

    const { data, error } = await adminService.registerUser(newUserForm);
    if (error) {
      showToast(error.message || 'FAILED TO CREATE PLAYER', 'error');
    } else {
      showToast('✓ PLAYER CREATED IN SUPABASE');
      setIsCreateUserOpen(false);
      setNewUserForm({ name: '', roll_number: '', branch: 'CSE', year: 1, section: 'A' });
      loadAllDatabaseData();
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    const { error } = await adminService.updateUser(editingUser.user_id, editingUser);
    if (error) {
      showToast(error.message || 'FAILED TO UPDATE USER', 'error');
    } else {
      showToast('✓ PLAYER UPDATED IN SUPABASE');
      setEditingUser(null);
      loadAllDatabaseData();
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    const { error } = await adminService.deleteUser(deletingUser.user_id);
    if (error) {
      showToast(error.message || 'FAILED TO DELETE PLAYER', 'error');
    } else {
      showToast('✓ PLAYER DELETED FROM SUPABASE');
      setDeletingUser(null);
      loadAllDatabaseData();
    }
  };

  // --------------------------------------------------------------------------
  // LAYER 1 GENAI SUBMISSIONS VERIFICATION & SCORING
  // --------------------------------------------------------------------------
  const handleSaveSubmissionMarks = async (submission) => {
    const rawVal = subMarksInputs[submission.id] !== undefined ? subMarksInputs[submission.id] : (submission.marks ?? 0);
    const marksNum = parseFloat(rawVal);

    if (isNaN(marksNum) || marksNum < 0) {
      showToast('PLEASE ENTER A VALID MARKS VALUE (>= 0)', 'error');
      return;
    }

    setSavingSubId(submission.id);
    try {
      const { error } = await adminService.updateLayer1SubmissionMarks(
        submission.id,
        submission.user_id,
        marksNum,
        submission.username
      );

      if (error) {
        showToast(error.message || 'FAILED TO SAVE SUBMISSION MARKS', 'error');
      } else {
        showToast(`✓ MARKS (${marksNum}) SAVED FOR ${submission.username || 'PLAYER'} (L1 AVG AUTO-SYNCED)`);
        loadAllDatabaseData();
      }
    } catch (err) {
      console.error('Error saving submission marks:', err);
      showToast('FAILED TO SAVE MARKS', 'error');
    } finally {
      setSavingSubId(null);
    }
  };

  // --------------------------------------------------------------------------
  // LAYER 1 MANUAL CODING MARKS OVERRIDE
  // --------------------------------------------------------------------------
  const handleSaveManualMarksOverride = async (attemptOrUser, rawScore) => {
    const userId = attemptOrUser.user_id;
    const attemptId = attemptOrUser.id;
    const marksNum = parseFloat(rawScore);

    if (isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
      showToast('PLEASE ENTER A VALID SCORE (0 - 100)', 'error');
      return;
    }

    setSavingManualId(userId);
    try {
      const { error } = await adminService.updateLayer1ManualOverrideMarks(
        attemptId,
        userId,
        marksNum,
        attemptOrUser.username || attemptOrUser.name
      );

      if (error) {
        showToast(error.message || 'FAILED TO SAVE MANUAL MARKS', 'error');
      } else {
        showToast(`✓ MANUAL MARKS (${marksNum}) SAVED FOR ${attemptOrUser.username || attemptOrUser.name} (L1 AVG AUTO-SYNCED)`);
        loadAllDatabaseData();
      }
    } catch (err) {
      console.error('Error saving manual marks:', err);
      showToast('FAILED TO SAVE MANUAL MARKS', 'error');
    } finally {
      setSavingManualId(null);
    }
  };

  // --------------------------------------------------------------------------
  // LAYER 1 MARKS ACTIONS
  // --------------------------------------------------------------------------
  const handleSaveLayer1Marks = async (e) => {
    e.preventDefault();
    if (!editingLayer1Marks) return;

    const { error } = await adminService.updateLayer1Marks(
      editingLayer1Marks.user_id,
      editingLayer1Marks.layer_1_gen_ai_marks,
      editingLayer1Marks.layer_1_manual_marks,
      editingLayer1Marks.name
    );

    if (error) {
      showToast(error.message || 'FAILED TO SAVE MARKS', 'error');
    } else {
      showToast('✓ LAYER 1 MARKS SAVED (AVERAGE AUTO-SYNCED)');
      setEditingLayer1Marks(null);
      loadAllDatabaseData();
    }
  };

  // --------------------------------------------------------------------------
  // LAYER 2 MARKS ACTIONS
  // --------------------------------------------------------------------------
  const handleSaveLayer2Marks = async (e) => {
    e.preventDefault();
    if (!editingLayer2Marks) return;

    const { error } = await adminService.updateLayer2Marks(
      editingLayer2Marks.user_id,
      editingLayer2Marks.layer_2_gen_ai_marks,
      editingLayer2Marks.layer_2_manual_marks,
      editingLayer2Marks.name
    );

    if (error) {
      showToast(error.message || 'FAILED TO SAVE MARKS', 'error');
    } else {
      showToast('✓ LAYER 2 MARKS SAVED (AVERAGE AUTO-SYNCED)');
      setEditingLayer2Marks(null);
      loadAllDatabaseData();
    }
  };

  const handleDeleteLayerResult = async () => {
    if (!deletingLayerResult) return;
    const isL1 = deletingLayerResult.layer === 1;
    const { error } = isL1
      ? await adminService.deleteLayer1Result(deletingLayerResult.rowId)
      : await adminService.deleteLayer2Result(deletingLayerResult.rowId);

    if (error) {
      showToast(error.message || 'FAILED TO DELETE SCORE RECORD', 'error');
    } else {
      showToast(`✓ LAYER 0${deletingLayerResult.layer} SCORE RESET`);
      setDeletingLayerResult(null);
      loadAllDatabaseData();
    }
  };

  const handleDeleteGenAiSubmission = async () => {
    if (!deletingGenAiSub) return;
    setIsDeletingGenAiSub(true);
    const { error } = await adminService.deleteLayer1GenAiSubmission(
      deletingGenAiSub.id,
      deletingGenAiSub.user_id
    );
    setIsDeletingGenAiSub(false);

    if (error) {
      showToast(error.message || 'FAILED TO DELETE GENAI SUBMISSION', 'error');
    } else {
      showToast(`✓ GENAI SUBMISSION DELETED — ${deletingGenAiSub.username || 'Player'} can now re-submit`);
      setDeletingGenAiSub(null);
      loadAllDatabaseData();
    }
  };

  const handleCreateDuo = async (e) => {
    e.preventDefault();
    if (!duoForm.player1Id || !duoForm.player2Id) {
      showToast('SELECT BOTH PLAYER 1 AND PLAYER 2', 'error');
      return;
    }

    if (duoForm.player1Id === duoForm.player2Id) {
      showToast('CANNOT PAIR PLAYER WITH THEMSELVES', 'error');
      return;
    }

    if (pairedPlayerIds.has(duoForm.player1Id) || pairedPlayerIds.has(duoForm.player2Id)) {
      showToast('ONE OR BOTH PLAYERS ARE ALREADY PAIRED IN AN EXISTING DUO', 'error');
      return;
    }

    const { error } = await adminService.createDuo(duoForm.player1Id, duoForm.player2Id);
    if (error) {
      showToast(error.message || 'FAILED TO CREATE DUO', 'error');
    } else {
      showToast('✓ DUO CREATED & COMBINED SCORE INITIALIZED');
      setIsCreateDuoOpen(false);
      setDuoForm({ player1Id: '', player2Id: '' });
      loadAllDatabaseData();
    }
  };

  const handleSaveDuoMarks = async (e) => {
    e.preventDefault();
    if (!editingDuoMarks) return;

    const { error } = await adminService.updateDuoMarks(editingDuoMarks.duo_id, {
      layer_3_marks: editingDuoMarks.layer_3_marks,
      layer_4_marks: editingDuoMarks.layer_4_marks
    });

    if (error) {
      showToast(error.message || 'FAILED TO SAVE DUO MARKS', 'error');
    } else {
      showToast('✓ DUO SCORE SAVED (TOTAL AUTO-RECALCULATED)');
      setEditingDuoMarks(null);
      loadAllDatabaseData();
    }
  };

  const handleDeleteDuo = async () => {
    if (!deletingDuo) return;
    const { error } = await adminService.deleteDuo(deletingDuo.duo_id);
    if (error) {
      showToast(error.message || 'FAILED TO DELETE DUO', 'error');
    } else {
      showToast('✓ DUO DELETED FROM SUPABASE');
      setDeletingDuo(null);
      loadAllDatabaseData();
    }
  };

  // --------------------------------------------------------------------------
  // YEAR CLASSIFICATION & RANKING HELPERS
  // --------------------------------------------------------------------------
  const getPlayerYearLabel = (rollNumber, yearVal) => {
    const roll = (rollNumber || '').trim().toUpperCase();
    if (roll.startsWith('26')) return '1st Year (Junior)';
    if (roll.startsWith('25')) return '2nd Year (Senior)';
    if (yearVal === 1 || String(yearVal).includes('1')) return '1st Year (Junior)';
    if (yearVal === 2 || String(yearVal).includes('2')) return '2nd Year (Senior)';
    return yearVal ? `Year ${yearVal}` : 'N/A';
  };

  const getPlayerYearCode = (rollNumber, yearVal) => {
    const roll = (rollNumber || '').trim().toUpperCase();
    if (roll.startsWith('26')) return '1';
    if (roll.startsWith('25')) return '2';
    if (yearVal === 1 || String(yearVal).includes('1')) return '1';
    if (yearVal === 2 || String(yearVal).includes('2')) return '2';
    return 'other';
  };

  const renderRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '3px',
            background: 'rgba(251, 191, 36, 0.15)',
            border: '1px solid #fbbf24',
            color: '#fbbf24',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            fontWeight: 800,
            boxShadow: '0 0 10px rgba(251, 191, 36, 0.3)'
          }}
        >
          🏆 RANK 01
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '3px',
            background: 'rgba(148, 163, 184, 0.15)',
            border: '1px solid #cbd5e1',
            color: '#f8fafc',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            fontWeight: 800,
            boxShadow: '0 0 8px rgba(203, 213, 225, 0.25)'
          }}
        >
          🥈 RANK 02
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '3px',
            background: 'rgba(217, 119, 6, 0.15)',
            border: '1px solid #d97706',
            color: '#fcd34d',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            fontWeight: 800,
            boxShadow: '0 0 8px rgba(217, 119, 6, 0.25)'
          }}
        >
          🥉 RANK 03
        </span>
      );
    }
    return (
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.74rem',
          fontWeight: 700,
          color: '#9ca3af'
        }}
      >
        #{rank < 10 ? `0${rank}` : rank}
      </span>
    );
  };

  // --------------------------------------------------------------------------
  // FILTERED & RANKED DATASETS
  // --------------------------------------------------------------------------
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchSearch =
        (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.roll_number || '').toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.user_id || '').toLowerCase().includes(userSearch.toLowerCase());
      const matchBranch = branchFilter === 'ALL' || u.branch === branchFilter;
      return matchSearch && matchBranch;
    });
  }, [usersList, userSearch, branchFilter]);

  // LAYER 1 RANKED RESULTS (High -> Low by Layer 1 Average, deterministic tie-breakers)
  const rankedLayer1Results = useMemo(() => {
    const mapped = usersList.map((user) => {
      const l1Record = layer1List.find((r) => r.user_id === user.user_id) || {};
      const genAi = l1Record.layer_1_gen_ai_marks !== undefined && l1Record.layer_1_gen_ai_marks !== null
        ? parseFloat(l1Record.layer_1_gen_ai_marks)
        : 0;
      const manual = l1Record.layer_1_manual_marks !== undefined && l1Record.layer_1_manual_marks !== null
        ? parseFloat(l1Record.layer_1_manual_marks)
        : 0;
      const avg = l1Record.average_marks !== undefined && l1Record.average_marks !== null
        ? parseFloat(l1Record.average_marks)
        : parseFloat(((genAi + manual) / 2.0).toFixed(2));
      const yearCode = getPlayerYearCode(user.roll_number, user.year);

      return {
        user,
        l1Record,
        genAi,
        manual,
        average: avg,
        yearCode
      };
    });

    const filtered = mapped.filter((item) => {
      const u = item.user;
      const matchSearch =
        !layer1Search.trim() ||
        (u.name || '').toLowerCase().includes(layer1Search.toLowerCase()) ||
        (u.roll_number || '').toLowerCase().includes(layer1Search.toLowerCase()) ||
        (u.user_id || '').toLowerCase().includes(layer1Search.toLowerCase()) ||
        (u.branch || '').toLowerCase().includes(layer1Search.toLowerCase());

      const matchYear =
        layer1YearFilter === 'ALL' ||
        item.yearCode === layer1YearFilter;

      return matchSearch && matchYear;
    });

    // Sort: Highest Average first -> Higher GenAI -> Higher Manual -> Roll Number ascending (deterministic)
    filtered.sort((a, b) => {
      if (b.average !== a.average) return b.average - a.average;
      if (b.genAi !== a.genAi) return b.genAi - a.genAi;
      if (b.manual !== a.manual) return b.manual - a.manual;
      return (a.user.roll_number || '').localeCompare(b.user.roll_number || '');
    });

    return filtered;
  }, [usersList, layer1List, layer1Search, layer1YearFilter]);

  // LAYER 2 RANKED RESULTS (High -> Low by Layer 2 Average, deterministic tie-breakers)
  // Strictly includes ONLY participants whose Layer 1 promotion was saved (promoted_to_layer2 === true && !is_removed)
  const rankedLayer2Results = useMemo(() => {
    const eligibleL2Users = usersList.filter((u) => u.promoted_to_layer2 === true && !u.is_removed);

    const mapped = eligibleL2Users.map((user) => {
      const l2Record = layer2List.find((r) => r.user_id === user.user_id) || {};
      const genAi = l2Record.layer_2_gen_ai_marks !== undefined && l2Record.layer_2_gen_ai_marks !== null
        ? parseFloat(l2Record.layer_2_gen_ai_marks)
        : 0;
      const manual = l2Record.layer_2_manual_marks !== undefined && l2Record.layer_2_manual_marks !== null
        ? parseFloat(l2Record.layer_2_manual_marks)
        : 0;
      const avg = l2Record.average_marks !== undefined && l2Record.average_marks !== null
        ? parseFloat(l2Record.average_marks)
        : parseFloat(((genAi + manual) / 2.0).toFixed(2));
      const yearCode = getPlayerYearCode(user.roll_number, user.year);

      return {
        user,
        l2Record,
        genAi,
        manual,
        average: avg,
        yearCode
      };
    });

    const filtered = mapped.filter((item) => {
      const u = item.user;
      const matchSearch =
        !layer2Search.trim() ||
        (u.name || '').toLowerCase().includes(layer2Search.toLowerCase()) ||
        (u.roll_number || '').toLowerCase().includes(layer2Search.toLowerCase()) ||
        (u.user_id || '').toLowerCase().includes(layer2Search.toLowerCase()) ||
        (u.branch || '').toLowerCase().includes(layer2Search.toLowerCase());

      const matchYear =
        layer2YearFilter === 'ALL' ||
        item.yearCode === layer2YearFilter;

      return matchSearch && matchYear;
    });

    filtered.sort((a, b) => {
      if (b.average !== a.average) return b.average - a.average;
      if (b.genAi !== a.genAi) return b.genAi - a.genAi;
      if (b.manual !== a.manual) return b.manual - a.manual;
      return (a.user.roll_number || '').localeCompare(b.user.roll_number || '');
    });

    return filtered;
  }, [usersList, layer2List, layer2Search, layer2YearFilter]);

  // DUOS RANKED RESULTS (High -> Low by Total Marks, deterministic tie-breakers)
  const filteredDuos = useMemo(() => {
    const mapped = duosList.map((duo) => {
      const p1 = usersList.find((u) => u.user_id === duo.player_1_id);
      const p2 = usersList.find((u) => u.user_id === duo.player_2_id);
      const p1Year = getPlayerYearCode(p1?.roll_number, p1?.year);
      const p2Year = getPlayerYearCode(p2?.roll_number, p2?.year);
      const total = duo.total_marks !== null && duo.total_marks !== undefined ? parseFloat(duo.total_marks) : 0;
      const combinedL1 = duo.combined_layer_1_average !== null && duo.combined_layer_1_average !== undefined ? parseFloat(duo.combined_layer_1_average) : 0;
      const l3 = duo.layer_3_marks !== null && duo.layer_3_marks !== undefined ? parseFloat(duo.layer_3_marks) : 0;
      const l4 = duo.layer_4_marks !== null && duo.layer_4_marks !== undefined ? parseFloat(duo.layer_4_marks) : 0;

      return {
        duo,
        p1,
        p2,
        p1Year,
        p2Year,
        total,
        combinedL1,
        l3,
        l4
      };
    });

    const filtered = mapped.filter((item) => {
      const p1 = item.p1 || {};
      const p2 = item.p2 || {};
      const duo = item.duo || {};

      const matchSearch =
        !duoSearch.trim() ||
        (p1.name || '').toLowerCase().includes(duoSearch.toLowerCase()) ||
        (p1.roll_number || '').toLowerCase().includes(duoSearch.toLowerCase()) ||
        (p2.name || '').toLowerCase().includes(duoSearch.toLowerCase()) ||
        (p2.roll_number || '').toLowerCase().includes(duoSearch.toLowerCase()) ||
        (duo.duo_serial_number ? String(duo.duo_serial_number).includes(duoSearch) : false);

      const matchYear =
        duoYearFilter === 'ALL' ||
        item.p1Year === duoYearFilter ||
        item.p2Year === duoYearFilter;

      return matchSearch && matchYear;
    });

    filtered.sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      if (b.l4 !== a.l4) return b.l4 - a.l4;
      if (b.l3 !== a.l3) return b.l3 - a.l3;
      if (b.combinedL1 !== a.combinedL1) return b.combinedL1 - a.combinedL1;
      return (a.duo.duo_serial_number || 0) - (b.duo.duo_serial_number || 0);
    });

    return filtered;
  }, [duosList, usersList, duoSearch, duoYearFilter]);

  // Paired Player IDs Set derived from active duos list (Single source of truth)
  const pairedPlayerIds = useMemo(() => {
    const ids = new Set();
    duosList.forEach((d) => {
      if (d.player_1_id) ids.add(d.player_1_id);
      if (d.player_2_id) ids.add(d.player_2_id);
    });
    return ids;
  }, [duosList]);

  // Unpaired / Available Players for new Duo creation (Sorted by name)
  // Strictly includes ONLY participants promoted from Layer 2 to Layer 3 (promoted_to_layer3 === true && !is_removed)
  const unpairedUsers = useMemo(() => {
    return usersList.filter((u) => u.promoted_to_layer2 === true && u.promoted_to_layer3 === true && !u.is_removed && !pairedPlayerIds.has(u.user_id));
  }, [usersList, pairedPlayerIds]);

  const selectedP1 = useMemo(() => usersList.find((u) => u.user_id === duoForm.player1Id), [usersList, duoForm.player1Id]);
  const selectedP2 = useMemo(() => usersList.find((u) => u.user_id === duoForm.player2Id), [usersList, duoForm.player2Id]);
  const previewDuoDetails = useMemo(() => {
    if (!selectedP1 || !selectedP2) return null;
    const p1L1 = parseFloat(selectedP1.average_layer_1) || 0;
    const p1L2 = parseFloat(selectedP1.average_layer_2) || 0;
    const p1Combined = parseFloat((p1L1 + p1L2).toFixed(2));

    const p2L1 = parseFloat(selectedP2.average_layer_1) || 0;
    const p2L2 = parseFloat(selectedP2.average_layer_2) || 0;
    const p2Combined = parseFloat((p2L1 + p2L2).toFixed(2));

    const layer3Combined = parseFloat(((p1Combined + p2Combined) / 2.0).toFixed(2));
    return {
      p1L1,
      p1L2,
      p1Combined,
      p2L1,
      p2L2,
      p2Combined,
      layer3Combined
    };
  }, [selectedP1, selectedP2]);

  // If not authenticated, render Login Gate
  if (!isAuthenticated) {
    return <AdminLoginGate onLoginSuccess={() => setIsAuthenticated(true)} onCancel={onClose} />;
  }

  return (
    <>

  {/* Modals for Gen AI actions */}
  
  {viewingManualDetails && (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="cyber-card" style={{ background: 'rgba(2, 6, 18, 0.95)', padding: '24px', maxWidth: '800px', width: '90%', maxHeight: '80vh', overflowY: 'auto', border: '1px solid var(--magenta-glow)', boxShadow: '0 0 20px rgba(255, 0, 255, 0.15)' }}>
        <h3 style={{ color: 'var(--magenta-glow)', marginTop: 0, fontFamily: 'var(--font-title)' }}>ATTEMPTS: {viewingManualDetails.username || viewingManualDetails.name}</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
          <thead style={{ background: 'rgba(0,0,0,0.6)', color: '#f59e0b', borderBottom: '1px solid rgba(245,158,11,0.2)' }}>
            <tr><th style={{ padding: '8px' }}>QUESTION</th><th style={{ padding: '8px' }}>ATTEMPT #</th><th style={{ padding: '8px' }}>RESULT</th><th style={{ padding: '8px' }}>TIMESTAMP</th></tr>
          </thead>
          <tbody>
            {Object.entries(viewingManualDetails.question_states || {}).map(([qId, qState]) => (
              (qState.history || []).map((hist, idx) => (
                <tr key={qId + idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '8px', color: '#d1d5db' }}>{qId}</td>
                  <td style={{ padding: '8px', color: '#d1d5db' }}>{hist.attempt}</td>
                  <td style={{ padding: '8px' }}><span style={{ color: hist.result === 'CORRECT' ? '#10b981' : hist.result === 'COMPILE_ERROR' ? '#ef4444' : '#f59e0b' }}>{hist.result}</span></td>
                  <td style={{ padding: '8px', color: '#9ca3af' }}>{hist.timestamp ? new Date(hist.timestamp).toLocaleString() : '\u2014'}</td>
                </tr>
              ))
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button className="cyber-btn" onClick={() => setViewingManualDetails(null)} style={{ padding: '8px 16px', fontSize: '0.8rem', borderColor: '#4b5563', color: '#9ca3af' }}>CLOSE</button>
        </div>
      </div>
    </div>
  )}

  <ConfirmModal
    isOpen={confirmModal.isOpen}
    title={confirmModal.title}
    message={confirmModal.message}
    onConfirm={confirmModal.onConfirm}
    onCancel={() => setConfirmModal({ isOpen: false })}
  />
  <PromptModal
    isOpen={promptModal.isOpen}
    title={promptModal.title}
    message={promptModal.message}
    defaultValue={promptModal.defaultValue}
    onConfirm={promptModal.onConfirm}
    onCancel={() => setPromptModal({ isOpen: false })}
  />
  <ConfirmModal
    isOpen={readingExplanation.isOpen}
    title={readingExplanation.title}
    message={readingExplanation.message}
    onConfirm={() => setReadingExplanation({ isOpen: false })}
    onCancel={() => setReadingExplanation({ isOpen: false })}
    confirmText="CLOSE"
    cancelText=""
  />

<div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        backgroundColor: '#020612',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'var(--font-mono)'
      }}
    >
      {/* 1. TOP COMMAND HEADER */}
      <header
        style={{
          padding: '12px 24px',
          borderBottom: '1px solid rgba(0, 243, 255, 0.25)',
          background: 'rgba(4, 10, 26, 0.95)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={22} color="var(--magenta-glow)" />
            <h1
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: '1.2rem',
                margin: 0,
                letterSpacing: '0.12em',
                background: 'linear-gradient(90deg, #ffffff, var(--cyan-glow))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              CODE MEETS AI // MISSION CONTROL
            </h1>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '2px',
              fontSize: '0.7rem',
              background: connStatus.connected ? 'rgba(57, 255, 20, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: connStatus.connected ? '1px solid var(--lime-accent)' : '1px solid #ef4444',
              color: connStatus.connected ? 'var(--lime-accent)' : '#ef4444'
            }}
          >
            <Radio size={12} className={connStatus.connected ? 'animate-pulse' : ''} />
            <span>{connStatus.message}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={loadAllDatabaseData}
            disabled={isLoading}
            className="cyber-btn"
            style={{
              padding: '6px 14px',
              fontSize: '0.72rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>REFRESH DATABASE</span>
          </button>

          <button
            onClick={handleLogout}
            style={{
              padding: '6px 14px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid #6b7280',
              color: '#d1d5db',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LogOut size={13} /> LOGOUT
          </button>

          {onClose && (
            <button
              onClick={onClose}
              style={{
                padding: '6px 14px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #ef4444',
                color: '#ef4444',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <X size={13} /> CLOSE
            </button>
          )}
        </div>
      </header>

      {/* 2. NAVIGATION TABS */}
      <nav
        style={{
          display: 'flex',
          gap: '4px',
          padding: '8px 24px',
          background: 'rgba(3, 7, 18, 0.9)',
          borderBottom: '1px solid rgba(0, 243, 255, 0.15)',
          overflowX: 'auto',
          zIndex: 10
        }}
      >
        {[
          { id: 'overview', label: 'COMMAND OVERVIEW', icon: Activity, count: null },
          { id: 'users', label: 'USERS TABLE', icon: Users, count: usersList.length },
          { id: 'layer1', label: 'LAYER 01 RESULTS', icon: Layers, count: layer1List.length },
          { id: 'layer2', label: 'LAYER 02 RESULTS', icon: Layers, count: layer2List.length },
          { id: 'duos', label: 'DUO ARENA (L3/L4)', icon: Trophy, count: duosList.length }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundEngine.playHover();
                setActiveTab(tab.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: isActive ? 'rgba(0, 243, 255, 0.15)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--cyan-glow)' : '2px solid transparent',
                color: isActive ? '#ffffff' : '#9ca3af',
                fontFamily: 'var(--font-title)',
                fontSize: '0.8rem',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={14} color={isActive ? 'var(--cyan-glow)' : '#9ca3af'} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  style={{
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontSize: '0.65rem',
                    background: isActive ? 'var(--cyan-glow)' : 'rgba(255, 255, 255, 0.1)',
                    color: isActive ? '#000000' : '#ffffff',
                    fontWeight: 700
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. MAIN DASHBOARD CONTENT AREA */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          boxSizing: 'border-box',
          background: 'rgba(2, 6, 18, 0.98)'
        }}
      >
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              {[
                { label: 'TOTAL PLAYERS', value: usersList.length, color: 'var(--cyan-glow)', icon: Users },
                { label: 'TOTAL DUOS', value: duosList.length, color: 'var(--magenta-glow)', icon: Trophy },
                { label: 'LAYER 01 LOGGED', value: layer1List.length, color: 'var(--lime-accent)', icon: Layers },
                { label: 'LAYER 02 LOGGED', value: layer2List.length, color: 'var(--lime-accent)', icon: Layers },
                { label: 'LAYER 03 MARKED', value: duosList.filter((d) => d.layer_3_marks !== null).length, color: '#f59e0b', icon: Zap },
                { label: 'LAYER 04 MARKED', value: duosList.filter((d) => d.layer_4_marks !== null).length, color: '#f59e0b', icon: Zap }
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className="cyber-card"
                    style={{
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      background: 'rgba(5, 12, 32, 0.85)'
                    }}
                  >
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '4px',
                        background: 'rgba(0, 0, 0, 0.5)',
                        border: `1px solid ${stat.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon size={20} color={stat.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#9ca3af', letterSpacing: '0.08em' }}>{stat.label}</div>
                      <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.4rem', color: '#ffffff' }}>
                        {stat.value}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* LAYER 1 & 2 CONTROLS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
              <div className="cyber-card" style={{ padding: '20px', background: 'rgba(5, 12, 32, 0.9)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={18} color="var(--cyan-glow)" />
                    <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1rem', margin: 0 }}>LAYER 01 LIVE STATE</h3>
                  </div>
                  <button
                    onClick={() => handleToggleLayerLock(1)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      background: !eventSettings.layer_1_locked ? 'rgba(57, 255, 20, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      border: !eventSettings.layer_1_locked ? '1px solid var(--lime-accent)' : '1px solid #ef4444',
                      color: !eventSettings.layer_1_locked ? 'var(--lime-accent)' : '#ef4444',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    {!eventSettings.layer_1_locked ? <Unlock size={13} /> : <Lock size={13} />}
                    <span>{!eventSettings.layer_1_locked ? 'UNLOCKED' : 'LOCKED'}</span>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    onClick={() => handleToggleTrack(1, 'gen-ai')}
                    style={{
                      padding: '10px',
                      background: eventSettings.layer_1_genai_active ? 'rgba(0, 243, 255, 0.2)' : 'rgba(0, 0, 0, 0.4)',
                      border: eventSettings.layer_1_genai_active ? '1px solid var(--cyan-glow)' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: eventSettings.layer_1_genai_active ? '#ffffff' : '#9ca3af',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Sparkles size={14} color="var(--cyan-glow)" />
                    <span>GEN AI ({eventSettings.layer_1_genai_active ? 'ON' : 'OFF'})</span>
                  </button>

                  <button
                    onClick={() => handleToggleTrack(1, 'manual')}
                    style={{
                      padding: '10px',
                      background: eventSettings.layer_1_manual_active ? 'rgba(224, 38, 255, 0.2)' : 'rgba(0, 0, 0, 0.4)',
                      border: eventSettings.layer_1_manual_active ? '1px solid var(--magenta-glow)' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: eventSettings.layer_1_manual_active ? '#ffffff' : '#9ca3af',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Code2 size={14} color="var(--magenta-glow)" />
                    <span>MANUAL ({eventSettings.layer_1_manual_active ? 'ON' : 'OFF'})</span>
                  </button>
                </div>
              </div>

              <div className="cyber-card" style={{ padding: '20px', background: 'rgba(5, 12, 32, 0.9)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={18} color="var(--magenta-glow)" />
                    <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1rem', margin: 0 }}>LAYER 02 LIVE STATE</h3>
                  </div>
                  <button
                    onClick={() => handleToggleLayerLock(2)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      background: !eventSettings.layer_2_locked ? 'rgba(57, 255, 20, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      border: !eventSettings.layer_2_locked ? '1px solid var(--lime-accent)' : '1px solid #ef4444',
                      color: !eventSettings.layer_2_locked ? 'var(--lime-accent)' : '#ef4444',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    {!eventSettings.layer_2_locked ? <Unlock size={13} /> : <Lock size={13} />}
                    <span>{!eventSettings.layer_2_locked ? 'UNLOCKED' : 'LOCKED'}</span>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    onClick={() => handleToggleTrack(2, 'gen-ai')}
                    style={{
                      padding: '10px',
                      background: eventSettings.layer_2_genai_active ? 'rgba(0, 243, 255, 0.2)' : 'rgba(0, 0, 0, 0.4)',
                      border: eventSettings.layer_2_genai_active ? '1px solid var(--cyan-glow)' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: eventSettings.layer_2_genai_active ? '#ffffff' : '#9ca3af',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Sparkles size={14} color="var(--cyan-glow)" />
                    <span>GEN AI ({eventSettings.layer_2_genai_active ? 'ON' : 'OFF'})</span>
                  </button>

                  <button
                    onClick={() => handleToggleTrack(2, 'manual')}
                    style={{
                      padding: '10px',
                      background: eventSettings.layer_2_manual_active ? 'rgba(224, 38, 255, 0.2)' : 'rgba(0, 0, 0, 0.4)',
                      border: eventSettings.layer_2_manual_active ? '1px solid var(--magenta-glow)' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: eventSettings.layer_2_manual_active ? '#ffffff' : '#9ca3af',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Code2 size={14} color="var(--magenta-glow)" />
                    <span>MANUAL ({eventSettings.layer_2_manual_active ? 'ON' : 'OFF'})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS TABLE */}
        {activeTab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '280px' }}>
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(4, 10, 26, 0.8)',
                    border: '1px solid rgba(0, 243, 255, 0.2)',
                    padding: '8px 12px',
                    gap: '8px'
                  }}
                >
                  <Search size={14} color="var(--cyan-glow)" />
                  <input
                    type="text"
                    placeholder="Search by Name, Roll Number, or UUID..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#ffffff',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem',
                      width: '100%'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Filter size={14} color="#9ca3af" />
                  <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      background: '#050a18',
                      border: '1px solid rgba(0, 243, 255, 0.2)',
                      color: '#ffffff',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem'
                    }}
                  >
                    <option value="ALL">ALL BRANCHES</option>
                    {['CSE', 'AI & DS', 'AIML', 'IT', 'ECE', 'EEE', 'ME', 'CIVIL', 'Other'].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsCreateUserOpen(true);
                }}
                className="cyber-btn"
                style={{ padding: '8px 18px', fontSize: '0.8rem' }}
              >
                <UserPlus size={14} /> CREATE NEW PLAYER
              </button>
            </div>

            <div className="cyber-card" style={{ overflowX: 'auto', padding: 0, background: 'rgba(3, 7, 20, 0.9)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(0, 243, 255, 0.08)', borderBottom: '1px solid rgba(0, 243, 255, 0.2)' }}>
                    <th style={{ padding: '12px 14px' }}>#</th>
                    <th style={{ padding: '12px 14px' }}>NAME</th>
                    <th style={{ padding: '12px 14px' }}>ROLL NO</th>
                    <th style={{ padding: '12px 14px' }}>BRANCH</th>
                    <th style={{ padding: '12px 14px' }}>YEAR / SEC</th>
                    <th style={{ padding: '12px 14px' }}>L1 AVG</th>
                    <th style={{ padding: '12px 14px' }}>L2 AVG</th>
                    <th style={{ padding: '12px 14px' }}>TOTAL SCORE</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                        NO PLAYERS REGISTERED YET. CLICK "+ CREATE NEW PLAYER" TO ADD ONE.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.user_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '12px 14px', color: '#6b7280' }}>{user.serial_number}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#ffffff' }}>{user.name}</td>
                        <td style={{ padding: '12px 14px', color: 'var(--cyan-glow)', fontFamily: 'var(--font-mono)' }}>{user.roll_number}</td>
                        <td style={{ padding: '12px 14px' }}>{user.branch || 'N/A'}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span
                            className="cyber-badge"
                            style={{
                              fontSize: '0.66rem',
                              borderColor: user.roll_number?.startsWith('26') ? 'var(--cyan-glow)' : 'var(--magenta-glow)',
                              color: user.roll_number?.startsWith('26') ? 'var(--cyan-glow)' : 'var(--magenta-glow)'
                            }}
                          >
                            {getPlayerYearLabel(user.roll_number, user.year)} / {user.section || 'A'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#9ca3af' }}>{user.average_layer_1 || '0.0'}</td>
                        <td style={{ padding: '12px 14px', color: '#9ca3af' }}>{user.average_layer_2 || '0.0'}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--lime-accent)' }}>
                          {user.total_score || '0.0'}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => setEditingUser({ ...user })}
                              title="Edit"
                              style={{ padding: '4px 8px', background: 'rgba(224, 38, 255, 0.1)', border: '1px solid var(--magenta-glow)', color: 'var(--magenta-glow)', cursor: 'pointer' }}
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => setDeletingUser(user)}
                              title="Delete"
                              style={{ padding: '4px 8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer' }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: LAYER 01 RESULTS & GENAI SUBMISSIONS */}
        {activeTab === 'layer1' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* SUB-NAV SWITCHER: RESULTS vs GENAI SUBMISSIONS vs MANUAL ATTEMPTS */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setLayer1ActiveSubTab('results');
                }}
                className="cyber-btn"
                style={{
                  padding: '8px 18px',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: layer1ActiveSubTab === 'results' ? 'rgba(57, 255, 20, 0.2)' : 'transparent',
                  borderColor: layer1ActiveSubTab === 'results' ? 'var(--lime-accent)' : 'rgba(57, 255, 20, 0.3)',
                  color: layer1ActiveSubTab === 'results' ? 'var(--lime-accent)' : '#9ca3af'
                }}
              >
                <Trophy size={14} color="var(--lime-accent)" />
                <span>🏆 LAYER 01 RANKED RESULTS ({rankedLayer1Results.length})</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setLayer1ActiveSubTab('genai');
                }}
                className="cyber-btn"
                style={{
                  padding: '8px 16px',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: layer1ActiveSubTab === 'genai' ? 'rgba(0, 243, 255, 0.2)' : 'transparent',
                  borderColor: layer1ActiveSubTab === 'genai' ? 'var(--cyan-glow)' : 'rgba(0, 243, 255, 0.3)',
                  color: layer1ActiveSubTab === 'genai' ? '#ffffff' : '#9ca3af'
                }}
              >
                <Sparkles size={14} color="var(--cyan-glow)" />
                <span>✦ GENAI SUBMISSIONS ({layer1SubmissionsList.length})</span>
                {layer1SubmissionsList.filter((s) => s.status === 'pending').length > 0 && (
                  <span
                    style={{
                      background: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      fontWeight: 800
                    }}
                  >
                    {layer1SubmissionsList.filter((s) => s.status === 'pending').length} PENDING
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setLayer1ActiveSubTab('manual');
                }}
                className="cyber-btn"
                style={{
                  padding: '8px 16px',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: layer1ActiveSubTab === 'manual' ? 'rgba(224, 38, 255, 0.2)' : 'transparent',
                  borderColor: layer1ActiveSubTab === 'manual' ? 'var(--magenta-glow)' : 'rgba(224, 38, 255, 0.3)',
                  color: layer1ActiveSubTab === 'manual' ? '#ffffff' : '#9ca3af'
                }}
              >
                <Code2 size={14} color="var(--magenta-glow)" />
                <span>⚙ MANUAL CODING ATTEMPTS ({layer1ManualAttemptsList.length})</span>
              </button>
            </div>

            {/* 0. SUB-VIEW: LAYER 1 RANKED RESULTS TABLE */}
            {layer1ActiveSubTab === 'results' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Search & Year Filter Controls Bar */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                      type="text"
                      placeholder="Search Layer 1 by Name, Roll Number, UUID, Branch..."
                      value={layer1Search}
                      onChange={(e) => setLayer1Search(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 34px',
                        background: 'rgba(2, 6, 18, 0.9)',
                        border: '1px solid rgba(0, 243, 255, 0.25)',
                        color: '#ffffff',
                        fontSize: '0.78rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Year Filter Buttons */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontFamily: 'var(--font-mono)', marginRight: '4px' }}>
                      YEAR FILTER:
                    </span>
                    {[
                      { id: 'ALL', label: 'ALL' },
                      { id: '1', label: 'FIRST YEAR (26...)' },
                      { id: '2', label: 'SECOND YEAR (25...)' }
                    ].map((yf) => (
                      <button
                        key={yf.id}
                        onClick={() => {
                          soundEngine.playClick();
                          setLayer1YearFilter(yf.id);
                        }}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.72rem',
                          fontFamily: 'var(--font-mono)',
                          background: layer1YearFilter === yf.id ? 'rgba(0, 243, 255, 0.2)' : 'rgba(2, 6, 18, 0.8)',
                          border: layer1YearFilter === yf.id ? '1px solid var(--cyan-glow)' : '1px solid rgba(255, 255, 255, 0.1)',
                          color: layer1YearFilter === yf.id ? 'var(--cyan-glow)' : '#9ca3af',
                          cursor: 'pointer',
                          borderRadius: '2px',
                          fontWeight: layer1YearFilter === yf.id ? 700 : 400
                        }}
                      >
                        {yf.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ranked Table */}
                <div className="cyber-card" style={{ overflowX: 'auto', padding: 0, background: 'rgba(3, 7, 20, 0.9)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(0, 243, 255, 0.08)', borderBottom: '1px solid rgba(0, 243, 255, 0.2)' }}>
                        <th style={{ padding: '12px 14px', width: '110px' }}>RANK</th>
                        <th style={{ padding: '12px 14px' }}>PLAYER</th>
                        <th style={{ padding: '12px 14px' }}>ROLL NO</th>
                        <th style={{ padding: '12px 14px' }}>YEAR (PREFIX)</th>
                        <th style={{ padding: '12px 14px' }}>BRANCH / SEC</th>
                        <th style={{ padding: '12px 14px' }}>GENAI MARKS</th>
                        <th style={{ padding: '12px 14px' }}>MANUAL MARKS</th>
                        <th style={{ padding: '12px 14px' }} title="Formula: (GenAI + Manual) / 2">
                          LAYER 1 AVERAGE
                        </th>
                        <th style={{ padding: '12px 14px', textAlign: 'center', width: '130px' }}>PROMOTION</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankedLayer1Results.length === 0 ? (
                        <tr>
                          <td colSpan={10} style={{ padding: '36px', textAlign: 'center', color: '#6b7280' }}>
                            NO PARTICIPANTS FOUND MATCHING FILTER // RECORD SCORES OR CLEAR FILTERS
                          </td>
                        </tr>
                      ) : (
                        rankedLayer1Results.map((item, idx) => {
                          const u = item.user;
                          const rank = idx + 1;
                          const is1st = item.yearCode === '1';

                          return (
                            <tr
                              key={u.user_id}
                              style={{
                                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                background: rank === 1 ? 'rgba(251, 191, 36, 0.05)' : rank === 2 ? 'rgba(148, 163, 184, 0.04)' : rank === 3 ? 'rgba(217, 119, 6, 0.04)' : 'transparent'
                              }}
                            >
                              <td style={{ padding: '12px 14px' }}>
                                {renderRankBadge(rank)}
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ fontWeight: 700, color: '#ffffff' }}>{u.name}</div>
                              </td>
                              <td style={{ padding: '12px 14px', color: 'var(--cyan-glow)', fontFamily: 'var(--font-mono)' }}>
                                {u.roll_number}
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <span
                                  className="cyber-badge"
                                  style={{
                                    fontSize: '0.66rem',
                                    borderColor: is1st ? 'var(--cyan-glow)' : 'var(--magenta-glow)',
                                    color: is1st ? 'var(--cyan-glow)' : 'var(--magenta-glow)'
                                  }}
                                >
                                  {getPlayerYearLabel(u.roll_number, u.year)}
                                </span>
                              </td>
                              <td style={{ padding: '12px 14px', color: '#d1d5db' }}>
                                {u.branch || 'N/A'} / {u.section || 'A'}
                              </td>
                              <td style={{ padding: '12px 14px', color: '#38bdf8', fontWeight: 700 }}>
                                {item.genAi.toFixed(1)}
                              </td>
                              <td style={{ padding: '12px 14px', color: '#c084fc', fontWeight: 700 }}>
                                {item.manual.toFixed(1)}
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <span
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.88rem',
                                    fontWeight: 800,
                                    color: 'var(--lime-accent)',
                                    textShadow: '0 0 10px rgba(57, 255, 20, 0.3)'
                                  }}
                                >
                                  {item.average.toFixed(2)}
                                </span>
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => togglePromoteUser(u.user_id)}
                                  style={{
                                    padding: '5px 12px',
                                    fontSize: '0.72rem',
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 700,
                                    letterSpacing: '0.05em',
                                    cursor: 'pointer',
                                    borderRadius: '3px',
                                    transition: 'all 0.2s ease',
                                    background: selectedForPromotion.has(u.user_id)
                                      ? 'rgba(57, 255, 20, 0.2)'
                                      : 'rgba(255, 255, 255, 0.05)',
                                    border: selectedForPromotion.has(u.user_id)
                                      ? '1px solid var(--lime-accent)'
                                      : '1px solid rgba(255, 255, 255, 0.2)',
                                    color: selectedForPromotion.has(u.user_id)
                                      ? 'var(--lime-accent)'
                                      : '#9ca3af',
                                    boxShadow: selectedForPromotion.has(u.user_id)
                                      ? '0 0 10px rgba(57, 255, 20, 0.3)'
                                      : 'none'
                                  }}
                                >
                                  {selectedForPromotion.has(u.user_id) ? 'PROMOTED ✓' : 'PROMOTE'}
                                </button>
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                  <button
                                    onClick={() =>
                                      setEditingLayer1Marks({
                                        user_id: u.user_id,
                                        name: u.name,
                                        roll_number: u.roll_number,
                                        layer_1_gen_ai_marks: item.genAi,
                                        layer_1_manual_marks: item.manual
                                      })
                                    }
                                    className="cyber-btn"
                                    style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                                    title="Edit Layer 1 GenAI & Manual Marks"
                                  >
                                    <Edit2 size={11} /> SCORE L1
                                  </button>
                                  {item.l1Record.id && (
                                    <button
                                      onClick={() => setDeletingLayerResult({ layer: 1, rowId: item.l1Record.id, userName: u.name })}
                                      style={{
                                        padding: '4px 8px',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid #ef4444',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        borderRadius: '2px'
                                      }}
                                      title="Reset Layer 1 marks"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Layer 1 Promotion Save & Selection Control Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    padding: '12px 18px',
                    background: 'rgba(2, 6, 20, 0.95)',
                    border: '1px solid rgba(0, 243, 255, 0.3)',
                    borderRadius: '4px',
                    boxShadow: '0 0 20px rgba(0, 0, 0, 0.7)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: 'var(--lime-accent)'
                      }}
                    >
                      {selectedForPromotion.size} / {rankedLayer1Results.length} PARTICIPANTS SELECTED FOR LAYER 2
                    </span>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[5, 10, 15].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => selectTopLayer1(cnt)}
                          className="cyber-btn"
                          style={{ padding: '4px 8px', fontSize: '0.68rem' }}
                        >
                          TOP {cnt}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={selectAllLayer1}
                        className="cyber-btn"
                        style={{ padding: '4px 8px', fontSize: '0.68rem' }}
                      >
                        ALL
                      </button>
                      <button
                        type="button"
                        onClick={clearLayer1Selection}
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.68rem',
                          background: 'transparent',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#9ca3af',
                          cursor: 'pointer',
                          borderRadius: '2px',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        CLEAR
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {layer1PromotionSaveStatus && (
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.78rem',
                          color: layer1PromotionSaveStatus.includes('failed') || layer1PromotionSaveStatus.includes('Error') ? '#ef4444' : 'var(--lime-accent)'
                        }}
                      >
                        {layer1PromotionSaveStatus}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={handleResetLayer1Promotions}
                      style={{
                        padding: '8px 14px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                        borderRadius: '3px'
                      }}
                    >
                      RESET
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveLayer1Promotions}
                      disabled={isSavingLayer1Promotion}
                      style={{
                        padding: '8px 22px',
                        fontSize: '0.82rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        color: '#000000',
                        background: 'linear-gradient(135deg, var(--lime-accent) 0%, #22c55e 100%)',
                        border: '1px solid var(--lime-accent)',
                        borderRadius: '3px',
                        cursor: isSavingLayer1Promotion ? 'not-allowed' : 'pointer',
                        boxShadow: '0 0 20px rgba(57, 255, 20, 0.4)'
                      }}
                    >
                      {isSavingLayer1Promotion ? 'SAVING...' : 'SAVE PROMOTION'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 1. SUB-VIEW: GENAI SUBMISSIONS VERIFICATION TABLE */}
            {layer1ActiveSubTab === 'genai' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Search & Filter Bar */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                      type="text"
                      placeholder="Search submissions by player, roll no, prompt..."
                      value={submissionSearch}
                      onChange={(e) => setSubmissionSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 34px',
                        background: 'rgba(2, 6, 18, 0.9)',
                        border: '1px solid rgba(0, 243, 255, 0.25)',
                        color: '#ffffff',
                        fontSize: '0.78rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {['ALL', 'pending', 'reviewed', 'TIME_EXPIRED'].map((statusKey) => (
                      <button
                        key={statusKey}
                        onClick={() => {
                          soundEngine.playClick();
                          setSubmissionStatusFilter(statusKey);
                        }}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.72rem',
                          fontFamily: 'var(--font-mono)',
                          background: submissionStatusFilter === statusKey ? 'rgba(0, 243, 255, 0.15)' : 'rgba(2, 6, 18, 0.8)',
                          border: submissionStatusFilter === statusKey ? '1px solid var(--cyan-glow)' : '1px solid rgba(255, 255, 255, 0.1)',
                          color: submissionStatusFilter === statusKey ? 'var(--cyan-glow)' : '#9ca3af',
                          cursor: 'pointer',
                          borderRadius: '2px',
                          textTransform: 'uppercase'
                        }}
                      >
                        {statusKey}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submissions Table */}
                <div className="cyber-card" style={{ overflowX: 'auto', padding: 0, background: 'rgba(3, 7, 20, 0.9)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(0, 243, 255, 0.08)', borderBottom: '1px solid rgba(0, 243, 255, 0.2)' }}>
                        <th style={{ padding: '12px 14px', width: '40px' }}>#</th>
                        <th style={{ padding: '12px 14px' }}>PLAYER</th>
                        <th style={{ padding: '12px 14px' }}>ROLL NO</th>
                        <th style={{ padding: '12px 14px', width: '26%' }}>PROMPT</th>
                        <th style={{ padding: '12px 14px', width: '15%' }}>IMAGES</th>
                        <th style={{ padding: '12px 14px' }}>TIME TAKEN</th>
                        <th style={{ padding: '12px 14px' }}>SUBMITTED AT</th>
                        <th style={{ padding: '12px 14px', width: '110px' }}>GENAI MARKS</th>
                        <th style={{ padding: '12px 14px' }}>STATUS</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>SAVE</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>DELETE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {layer1SubmissionsList.length === 0 ? (
                        <tr>
                          <td colSpan={10} style={{ padding: '36px', textAlign: 'center', color: '#6b7280' }}>
                            NO GENAI SUBMISSIONS RECEIVED YET // WAITING FOR PLAYERS TO SUBMIT
                          </td>
                        </tr>
                      ) : (
                        layer1SubmissionsList
                          .filter((sub) => {
                            const matchText =
                              !submissionSearch.trim() ||
                              (sub.username && sub.username.toLowerCase().includes(submissionSearch.toLowerCase())) ||
                              (sub.roll_number && sub.roll_number.toLowerCase().includes(submissionSearch.toLowerCase())) ||
                              (sub.prompt && sub.prompt.toLowerCase().includes(submissionSearch.toLowerCase()));
                            const matchStatus = submissionStatusFilter === 'ALL' || sub.status === submissionStatusFilter;
                            return matchText && matchStatus;
                          })
                          .map((sub, idx) => {
                            const currentInputVal = subMarksInputs[sub.id] !== undefined ? subMarksInputs[sub.id] : (sub.marks ?? '');
                            const isReviewed = sub.status === 'reviewed';
                            const hasImages = sub.image_urls && Array.isArray(sub.image_urls) && sub.image_urls.length > 0;

                            return (
                              <tr key={sub.id || idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <td style={{ padding: '12px 14px', color: '#6b7280' }}>{idx + 1}</td>
                                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#ffffff' }}>
                                  {sub.username || 'Player'}
                                </td>
                                <td style={{ padding: '12px 14px', color: 'var(--cyan-glow)' }}>
                                  {sub.roll_number || 'N/A'}
                                </td>

                                {/* Prompt Preview & Modal Action */}
                                <td style={{ padding: '12px 14px' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div
                                      style={{
                                        color: sub.prompt ? '#d1d5db' : '#ef4444',
                                        fontSize: '0.74rem',
                                        fontStyle: sub.prompt ? 'normal' : 'italic',
                                        lineHeight: 1.4,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      }}
                                    >
                                      {sub.prompt ? `"${sub.prompt}"` : '[NOT PROVIDED - TIMEOUT]'}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setViewingPrompt(sub)}
                                      style={{
                                        alignSelf: 'flex-start',
                                        background: 'none',
                                        border: 'none',
                                        padding: 0,
                                        color: 'var(--cyan-glow)',
                                        fontSize: '0.68rem',
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <Eye size={11} /> VIEW FULL PROMPT ({sub.prompt?.length || 0} chars)
                                    </button>
                                  </div>
                                </td>

                                {/* Image Thumbnails & Gallery Action */}
                                <td style={{ padding: '12px 14px' }}>
                                  {hasImages ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      {sub.image_urls.slice(0, 3).map((url, imgIdx) => (
                                        <img
                                          key={imgIdx}
                                          src={url}
                                          alt="Thumb"
                                          onClick={() => setViewingImages({ ...sub, activeIndex: imgIdx })}
                                          style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '2px',
                                            border: '1px solid rgba(0, 243, 255, 0.4)',
                                            objectFit: 'cover',
                                            cursor: 'pointer'
                                          }}
                                          title="Click to zoom image"
                                        />
                                      ))}
                                      {sub.image_urls.length > 3 && (
                                        <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}>+{sub.image_urls.length - 3}</span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => setViewingImages({ ...sub, activeIndex: 0 })}
                                        className="cyber-btn"
                                        style={{ padding: '3px 6px', fontSize: '0.65rem', marginLeft: '4px' }}
                                        title="Open image gallery"
                                      >
                                        <Eye size={10} /> {sub.image_urls.length} ASSETS
                                      </button>
                                    </div>
                                  ) : (
                                    <span style={{ color: '#ef4444', fontStyle: 'italic', fontSize: '0.7rem' }}>[NOT UPLOADED]</span>
                                  )}
                                </td>

                                {/* Time Taken Column */}
                                <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', color: 'var(--cyan-glow)', fontWeight: 700 }}>
                                  {sub.time_taken && sub.time_taken !== '00:00' && sub.time_taken !== '00'
                                    ? sub.time_taken
                                    : (sub.submitted_at && sub.created_at ? (() => {
                                        const diff = Math.max(1, Math.floor((new Date(sub.submitted_at) - new Date(sub.created_at)) / 1000));
                                        const m = Math.floor(diff / 60);
                                        const s = diff % 60;
                                        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                                      })() : 'N/A')}
                                </td>

                                {/* Submitted At Column */}
                                <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', color: '#9ca3af', fontSize: '0.74rem' }}>
                                  {sub.submitted_at ? new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}
                                </td>

                                {/* GenAI Marks Input */}
                                <td style={{ padding: '12px 14px' }}>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    placeholder="Enter marks"
                                    value={currentInputVal}
                                    onChange={(e) => setSubMarksInputs({ ...subMarksInputs, [sub.id]: e.target.value })}
                                    style={{
                                      width: '90px',
                                      padding: '6px 8px',
                                      background: 'rgba(2, 6, 18, 0.9)',
                                      border: '1px solid rgba(0, 243, 255, 0.3)',
                                      color: '#ffffff',
                                      fontSize: '0.8rem',
                                      fontFamily: 'var(--font-mono)',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                </td>

                                {/* Status Badge */}
                                <td style={{ padding: '12px 14px' }}>
                                  {sub.status === 'TIME_EXPIRED' ? (
                                    <span className="cyber-badge" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                                      TIME EXPIRED
                                    </span>
                                  ) : isReviewed ? (
                                    <span className="cyber-badge" style={{ borderColor: 'var(--lime-accent)', color: 'var(--lime-accent)' }}>
                                      REVIEWED ({sub.marks})
                                    </span>
                                  ) : (
                                    <span className="cyber-badge" style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>
                                      PENDING
                                    </span>
                                  )}
                                </td>

                                {/* Save Button */}
                                <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                  <button
                                    onClick={() => handleSaveSubmissionMarks(sub)}
                                    disabled={savingSubId === sub.id}
                                    className="cyber-btn"
                                    style={{
                                      padding: '5px 14px',
                                      fontSize: '0.72rem',
                                      background: isReviewed ? 'rgba(57, 255, 20, 0.1)' : 'rgba(0, 243, 255, 0.15)',
                                      borderColor: isReviewed ? 'var(--lime-accent)' : 'var(--cyan-glow)',
                                      color: isReviewed ? 'var(--lime-accent)' : '#ffffff'
                                    }}
                                  >
                                    {savingSubId === sub.id ? 'SAVING...' : 'SAVE'}
                                  </button>
                                </td>

                                {/* Delete Submission Button */}
                                <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                  <button
                                    onClick={() => setDeletingGenAiSub(sub)}
                                    className="cyber-btn"
                                    style={{
                                      padding: '5px 12px',
                                      fontSize: '0.68rem',
                                      background: 'rgba(239, 68, 68, 0.12)',
                                      borderColor: '#ef4444',
                                      color: '#fca5a5',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '5px'
                                    }}
                                    title="Delete this GenAI submission — user keeps account and can re-submit"
                                  >
                                    <Trash2 size={12} />
                                    DELETE
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. SUB-VIEW: MANUAL CODING ATTEMPTS & ADMIN OVERRIDE TABLE */}
            {layer1ActiveSubTab === 'manual' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Search & Filter Bar */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                      type="text"
                      placeholder="Search manual attempts by player name, roll no, user ID..."
                      value={manualSearch}
                      onChange={(e) => setManualSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 34px',
                        background: 'rgba(2, 6, 18, 0.9)',
                        border: '1px solid rgba(224, 38, 255, 0.25)',
                        color: '#ffffff',
                        fontSize: '0.78rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {[
                      { key: 'ALL', label: 'ALL BATCHES' },
                      { key: '26', label: '1ST YEAR (26)' },
                      { key: '25', label: '2ND YEAR (25)' }
                    ].map((b) => (
                      <button
                        key={b.key}
                        onClick={() => {
                          soundEngine.playClick();
                          setManualBatchFilter(b.key);
                        }}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.72rem',
                          fontFamily: 'var(--font-mono)',
                          background: manualBatchFilter === b.key ? 'rgba(224, 38, 255, 0.15)' : 'rgba(2, 6, 18, 0.8)',
                          border: manualBatchFilter === b.key ? '1px solid var(--magenta-glow)' : '1px solid rgba(255, 255, 255, 0.1)',
                          color: manualBatchFilter === b.key ? 'var(--magenta-glow)' : '#9ca3af',
                          cursor: 'pointer',
                          borderRadius: '2px'
                        }}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual Attempts Table */}
                <div className="cyber-card" style={{ overflowX: 'auto', padding: 0, background: 'rgba(3, 7, 20, 0.9)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(224, 38, 255, 0.08)', borderBottom: '1px solid rgba(224, 38, 255, 0.2)' }}>
                        <th style={{ padding: '12px 14px', width: '40px' }}>#</th>
                        <th style={{ padding: '12px 14px' }}>PLAYER</th>
                        <th style={{ padding: '12px 14px' }}>USER ID</th>
                        <th style={{ padding: '12px 14px' }}>ROLL NO</th>
                        <th style={{ padding: '12px 14px' }}>YEAR / BATCH</th>
                        <th style={{ padding: '12px 14px', width: '120px' }}>MANUAL MARKS</th>
                        <th style={{ padding: '12px 14px' }}>STATUS</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#6b7280' }}>
                            NO PLAYERS REGISTERED IN SYSTEM
                          </td>
                        </tr>
                      ) : (
                        usersList
                          .filter((u) => {
                            const roll = u.roll_number || '';
                            const batch = roll.startsWith('26') ? '26' : roll.startsWith('25') ? '25' : 'other';
                            const matchSearch =
                              !manualSearch.trim() ||
                              (u.name && u.name.toLowerCase().includes(manualSearch.toLowerCase())) ||
                              (u.roll_number && u.roll_number.toLowerCase().includes(manualSearch.toLowerCase())) ||
                              (u.user_id && u.user_id.toLowerCase().includes(manualSearch.toLowerCase()));
                            const matchBatch = manualBatchFilter === 'ALL' || batch === manualBatchFilter;
                            return matchSearch && matchBatch;
                          })
                          .map((u, idx) => {
                            const attempt = layer1ManualAttemptsList.find((a) => a.user_id === u.user_id);
                            const l1Record = layer1List.find((r) => r.user_id === u.user_id) || {};
                            const roll = u.roll_number || '';
                            const isFirstYear = roll.startsWith('26');
                            const isSecondYear = roll.startsWith('25');
                            const batchLabel = isFirstYear ? 'First Year (26)' : isSecondYear ? 'Second Year (25)' : `Year ${u.year || '?'}`;

                            const currentMarksVal =
                              manualMarksInputs[u.user_id] !== undefined
                                ? manualMarksInputs[u.user_id]
                                : attempt?.score ?? l1Record.layer_1_manual_marks ?? '';

                            const isCompleted = !!attempt || l1Record.layer_1_manual_marks !== undefined;

                            return (
                              <tr key={u.user_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                <td style={{ padding: '12px 14px', color: '#6b7280' }}>{idx + 1}</td>
                                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#ffffff' }}>
                                  {u.name}
                                </td>
                                <td style={{ padding: '12px 14px', color: '#9ca3af', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                                  {u.user_id.substring(0, 8)}...
                                </td>
                                <td style={{ padding: '12px 14px', color: 'var(--cyan-glow)' }}>
                                  {u.roll_number || 'N/A'}
                                </td>
                                <td style={{ padding: '12px 14px' }}>
                                  <span
                                    className="cyber-badge"
                                    style={{
                                      fontSize: '0.66rem',
                                      borderColor: isFirstYear ? 'var(--cyan-glow)' : 'var(--magenta-glow)',
                                      color: isFirstYear ? 'var(--cyan-glow)' : 'var(--magenta-glow)'
                                    }}
                                  >
                                    {batchLabel}
                                  </span>
                                </td>

                                {/* Manual Score Input Override */}
                                <td style={{ padding: '12px 14px' }}>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="1"
                                    placeholder="0 - 100"
                                    value={currentMarksVal}
                                    onChange={(e) => setManualMarksInputs({ ...manualMarksInputs, [u.user_id]: e.target.value })}
                                    style={{
                                      width: '85px',
                                      padding: '6px 8px',
                                      background: 'rgba(2, 6, 18, 0.9)',
                                      border: '1px solid rgba(224, 38, 255, 0.3)',
                                      color: '#ffffff',
                                      fontSize: '0.8rem',
                                      fontFamily: 'var(--font-mono)',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                </td>

                                {/* Status Badge */}
                                <td style={{ padding: '12px 14px' }}>
                                  {attempt ? (
                                    <span className="cyber-badge" style={{ borderColor: 'var(--lime-accent)', color: 'var(--lime-accent)' }}>
                                      COMPLETED ({attempt.score} PTS)
                                    </span>
                                  ) : l1Record.layer_1_manual_marks > 0 ? (
                                    <span className="cyber-badge" style={{ borderColor: 'var(--cyan-glow)', color: 'var(--cyan-glow)' }}>
                                      SCORED ({l1Record.layer_1_manual_marks})
                                    </span>
                                  ) : (
                                    <span className="cyber-badge" style={{ borderColor: '#6b7280', color: '#6b7280' }}>
                                      PENDING
                                    </span>
                                  )}
                                </td>

                                {/* Actions */}
                                <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <button
                                      onClick={() => handleSaveManualMarksOverride(attempt || u, currentMarksVal)}
                                      disabled={savingManualId === u.user_id}
                                      className="cyber-btn"
                                      style={{
                                        padding: '5px 12px',
                                        fontSize: '0.72rem',
                                        borderColor: 'var(--magenta-glow)',
                                        color: '#ffffff'
                                      }}
                                    >
                                      {savingManualId === u.user_id ? 'SAVING...' : 'SAVE'}
                                    </button>

                                    {attempt && attempt.questions_pool && attempt.questions_pool.length > 0 && (
                                      <button
                                        onClick={() => setViewingManualBreakdown(attempt)}
                                        className="cyber-btn"
                                        style={{ padding: '5px 10px', fontSize: '0.7rem', borderColor: 'var(--cyan-glow)', color: 'var(--cyan-glow)' }}
                                        title="View 10 question answers breakdown"
                                      >
                                        <Eye size={11} /> DETAILS
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: LAYER 02 RESULTS */}
        {activeTab === 'layer2' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* ── SUB-NAV ── */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => setLayer2ActiveSubTab('results')} style={{ padding: '8px 16px', background: layer2ActiveSubTab === 'results' ? 'rgba(0,243,255,0.2)' : 'transparent', border: '1px solid', borderColor: layer2ActiveSubTab === 'results' ? 'var(--cyan-glow)' : 'rgba(255,255,255,0.15)', color: layer2ActiveSubTab === 'results' ? 'var(--cyan-glow)' : '#9ca3af', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={14} /> RANKED RESULTS ({rankedLayer2Results.length})
              </button>
              <button onClick={() => setLayer2ActiveSubTab('genai')} style={{ padding: '8px 16px', background: layer2ActiveSubTab === 'genai' ? 'rgba(0,243,255,0.2)' : 'transparent', border: '1px solid', borderColor: layer2ActiveSubTab === 'genai' ? 'var(--cyan-glow)' : 'rgba(255,255,255,0.15)', color: layer2ActiveSubTab === 'genai' ? 'var(--cyan-glow)' : '#9ca3af', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={14} /> GEN AI SUBMISSIONS ({layer2GenAiSubmissionsList.length})
              </button>
              <button onClick={() => setLayer2ActiveSubTab('manual')} style={{ padding: '8px 16px', background: layer2ActiveSubTab === 'manual' ? 'rgba(245,158,11,0.2)' : 'transparent', border: '1px solid', borderColor: layer2ActiveSubTab === 'manual' ? '#f59e0b' : 'rgba(255,255,255,0.15)', color: layer2ActiveSubTab === 'manual' ? '#f59e0b' : '#9ca3af', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Code2 size={14} /> MANUAL ATTEMPTS ({layer2ManualAttemptsList.length})
              </button>
            </div>

            {/* ── RESULTS ── */}
            {layer2ActiveSubTab === 'results' && (<>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input type="text" placeholder="Search by Name / Roll / UUID / Branch..." value={layer2Search} onChange={(e) => setLayer2Search(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px 8px 34px', background: 'rgba(2,6,18,0.9)', border: '1px solid rgba(0,243,255,0.25)', color: '#fff', fontSize: '0.78rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontFamily: 'var(--font-mono)', marginRight: '4px' }}>YEAR:</span>
                  {[{ id: 'ALL', label: 'ALL' }, { id: '1', label: '1st Year (26...)' }, { id: '2', label: '2nd Year (25...)' }].map(yf => (
                    <button key={yf.id} onClick={() => { soundEngine.playClick(); setLayer2YearFilter(yf.id); }} style={{ padding: '6px 12px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', background: layer2YearFilter === yf.id ? 'rgba(0,243,255,0.2)' : 'rgba(2,6,18,0.8)', border: layer2YearFilter === yf.id ? '1px solid var(--cyan-glow)' : '1px solid rgba(255,255,255,0.1)', color: layer2YearFilter === yf.id ? 'var(--cyan-glow)' : '#9ca3af', cursor: 'pointer', borderRadius: '2px', fontWeight: layer2YearFilter === yf.id ? 700 : 400 }}>
                      {yf.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="cyber-card" style={{ overflowX: 'auto', padding: 0, background: 'rgba(3,7,20,0.9)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,243,255,0.08)', borderBottom: '1px solid rgba(0,243,255,0.2)' }}>
                      <th style={{ padding: '12px 14px' }}>RANK</th><th style={{ padding: '12px 14px' }}>PLAYER</th><th style={{ padding: '12px 14px' }}>ROLL NO</th><th style={{ padding: '12px 14px' }}>YEAR</th><th style={{ padding: '12px 14px' }}>BRANCH/SEC</th><th style={{ padding: '12px 14px' }}>GENAI</th><th style={{ padding: '12px 14px' }}>MANUAL</th><th style={{ padding: '12px 14px' }}>L2 AVG</th><th style={{ padding: '12px 14px', textAlign: 'center', width: '130px' }}>PROMOTION</th><th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankedLayer2Results.length === 0 ? (
                      <tr><td colSpan={10} style={{ padding: '36px', textAlign: 'center', color: '#6b7280' }}>NO PARTICIPANTS PROMOTED TO LAYER 2 YET // PROMOTE PARTICIPANTS IN LAYER 1 RESULTS</td></tr>
                    ) : rankedLayer2Results.map((item, idx) => {
                      const u = item.user; const rank = idx + 1; const is1st = item.yearCode === '1';
                      return (
                        <tr key={u.user_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: rank === 1 ? 'rgba(251,191,36,0.05)' : rank === 2 ? 'rgba(148,163,184,0.04)' : rank === 3 ? 'rgba(217,119,6,0.04)' : 'transparent' }}>
                          <td style={{ padding: '12px 14px' }}>{renderRankBadge(rank)}</td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#fff' }}>{u.name}</td>
                          <td style={{ padding: '12px 14px', color: 'var(--cyan-glow)', fontFamily: 'var(--font-mono)' }}>{u.roll_number}</td>
                          <td style={{ padding: '12px 14px' }}><span className="cyber-badge" style={{ fontSize: '0.66rem', borderColor: is1st ? 'var(--cyan-glow)' : 'var(--magenta-glow)', color: is1st ? 'var(--cyan-glow)' : 'var(--magenta-glow)' }}>{getPlayerYearLabel(u.roll_number, u.year)}</span></td>
                          <td style={{ padding: '12px 14px', color: '#d1d5db' }}>{u.branch || 'N/A'} / {u.section || 'A'}</td>
                          <td style={{ padding: '12px 14px', color: '#38bdf8', fontWeight: 700 }}>{item.genAi.toFixed(1)}</td>
                          <td style={{ padding: '12px 14px', color: '#c084fc', fontWeight: 700 }}>{item.manual.toFixed(1)}</td>
                          <td style={{ padding: '12px 14px' }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 800, color: 'var(--lime-accent)' }}>{item.average.toFixed(2)}</span></td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => togglePromoteLayer2User(u.user_id)}
                              style={{
                                padding: '5px 12px',
                                fontSize: '0.72rem',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 700,
                                letterSpacing: '0.05em',
                                cursor: 'pointer',
                                borderRadius: '3px',
                                transition: 'all 0.2s ease',
                                background: selectedForLayer2Promotion.has(u.user_id)
                                  ? 'rgba(224, 38, 255, 0.2)'
                                  : 'rgba(255, 255, 255, 0.05)',
                                border: selectedForLayer2Promotion.has(u.user_id)
                                  ? '1px solid var(--magenta-glow)'
                                  : '1px solid rgba(255, 255, 255, 0.2)',
                                color: selectedForLayer2Promotion.has(u.user_id)
                                  ? 'var(--magenta-glow)'
                                  : '#9ca3af',
                                boxShadow: selectedForLayer2Promotion.has(u.user_id)
                                  ? '0 0 10px rgba(224, 38, 255, 0.3)'
                                  : 'none'
                              }}
                            >
                              {selectedForLayer2Promotion.has(u.user_id) ? 'PROMOTED ✓' : 'PROMOTE'}
                            </button>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button onClick={() => setEditingLayer2Marks({ user_id: u.user_id, name: u.name, roll_number: u.roll_number, layer_2_gen_ai_marks: item.genAi, layer_2_manual_marks: item.manual })} className="cyber-btn" style={{ padding: '4px 10px', fontSize: '0.7rem', borderColor: 'var(--magenta-glow)' }}><Edit2 size={11} /> SCORE L2</button>
                              {item.l2Record.id && (<button onClick={() => setDeletingLayerResult({ layer: 2, rowId: item.l2Record.id, userName: u.name })} style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer', borderRadius: '2px' }}><Trash2 size={11} /></button>)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Layer 2 Promotion Save & Selection Control Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  padding: '12px 18px',
                  background: 'rgba(2, 6, 20, 0.95)',
                  border: '1px solid rgba(224, 38, 255, 0.3)',
                  borderRadius: '4px',
                  boxShadow: '0 0 20px rgba(0, 0, 0, 0.7)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: 'var(--magenta-glow)'
                    }}
                  >
                    {selectedForLayer2Promotion.size} / {rankedLayer2Results.length} PARTICIPANTS SELECTED FOR LAYER 3 / DUOS
                  </span>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[5, 10, 15].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => selectTopLayer2(cnt)}
                        className="cyber-btn"
                        style={{ padding: '4px 8px', fontSize: '0.68rem', borderColor: 'rgba(224, 38, 255, 0.4)' }}
                      >
                        TOP {cnt}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={selectAllLayer2}
                      className="cyber-btn"
                      style={{ padding: '4px 8px', fontSize: '0.68rem', borderColor: 'rgba(224, 38, 255, 0.4)' }}
                    >
                      ALL
                    </button>
                    <button
                      type="button"
                      onClick={clearLayer2Selection}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.68rem',
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        borderRadius: '2px',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      CLEAR
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {layer2PromotionSaveStatus && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.78rem',
                        color: layer2PromotionSaveStatus.includes('failed') || layer2PromotionSaveStatus.includes('Error') ? '#ef4444' : 'var(--magenta-glow)'
                      }}
                    >
                      {layer2PromotionSaveStatus}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleResetLayer2Promotions}
                    style={{
                      padding: '8px 14px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                      borderRadius: '3px'
                    }}
                  >
                    RESET
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveLayer2Promotions}
                    disabled={isSavingLayer2Promotion}
                    style={{
                      padding: '8px 22px',
                      fontSize: '0.82rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      color: '#ffffff',
                      background: 'linear-gradient(135deg, var(--magenta-glow) 0%, #a855f7 100%)',
                      border: '1px solid var(--magenta-glow)',
                      borderRadius: '3px',
                      cursor: isSavingLayer2Promotion ? 'not-allowed' : 'pointer',
                      boxShadow: '0 0 20px rgba(224, 38, 255, 0.4)'
                    }}
                  >
                    {isSavingLayer2Promotion ? 'SAVING...' : 'SAVE PROMOTION'}
                  </button>
                </div>
              </div>
            </>)}

            {/* ── GEN AI SUBMISSIONS ── */}
            {layer2ActiveSubTab === 'genai' && (
              <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                  <thead style={{ background: 'rgba(0,0,0,0.6)', color: 'var(--cyan-glow)', borderBottom: '1px solid rgba(0,243,255,0.2)' }}>
                    <tr><th style={{ padding: '12px 14px' }}>PARTICIPANT</th><th style={{ padding: '12px 14px' }}>QUESTION</th><th style={{ padding: '12px 14px' }}>STATUS</th><th style={{ padding: '12px 14px' }}>MARKS</th><th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTIONS</th></tr>
                  </thead>
                  <tbody>
                    {layer2GenAiSubmissionsList.length === 0 ? (
                      <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>No Gen AI submissions yet. Run schema/migrations/002_layer2_genai_submissions.sql if table is missing.</td></tr>
                    ) : layer2GenAiSubmissionsList.map(sub => (
                      <tr key={sub.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px 14px' }}><div style={{ fontWeight: 'bold', color: '#fff' }}>{sub.username || 'Unknown'}</div><div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{sub.roll_number}</div></td>
                        <td style={{ padding: '12px 14px', color: '#d1d5db' }}>{sub.question_id}</td>
                        <td style={{ padding: '12px 14px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', background: sub.status === 'reviewed' ? 'rgba(16,185,129,0.1)' : sub.status === 'completed' ? 'rgba(245,158,11,0.1)' : 'rgba(156,163,175,0.1)', color: sub.status === 'reviewed' ? '#10b981' : sub.status === 'completed' ? '#f59e0b' : '#9ca3af' }}>{(sub.status || 'in_progress').replace('_', ' ').toUpperCase()}</span></td>
                        <td style={{ padding: '12px 14px', color: '#e5e7eb', fontWeight: 'bold' }}>{sub.admin_marks !== null && sub.admin_marks !== undefined ? sub.admin_marks : '—'}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button className="cyber-btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => { setPromptModal({ isOpen: true, title: 'Marks for ' + (sub.username || 'participant'), message: 'Enter marks:', defaultValue: sub.admin_marks || '0', onConfirm: (m) => { setPromptModal({ isOpen: false }); setPromptModal({ isOpen: true, title: 'Remarks', message: 'Remarks (optional):', defaultValue: sub.admin_remarks || '', onConfirm: (r) => { setPromptModal({ isOpen: false }); adminService.updateLayer2GenAiMarks(sub.id, sub.user_id, parseFloat(m) || 0, r).then(() => { loadAllDatabaseData(); toast.success('Marks updated'); }); } }); } }); }}>GRADE</button>
                            {sub.explanation && (<button className="cyber-btn" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => { setReadingExplanation({ isOpen: true, title: 'EXPLANATION FOR ' + sub.username, message: sub.explanation }); }}>READ</button>)}
                            <button className="cyber-btn" style={{ padding: '4px 10px', fontSize: '0.72rem', color: '#f59e0b', borderColor: '#f59e0b' }} onClick={() => { setPromptModal({ isOpen: true, title: 'Reassign Question', message: 'New question ID (GENAI-Q1 to GENAI-Q6):', defaultValue: sub.question_id, onConfirm: (q) => { setPromptModal({ isOpen: false }); if (q && q !== sub.question_id) adminService.overrideLayer2GenAiQuestion(sub.user_id, q).then(() => { loadAllDatabaseData(); toast.success('Question reassigned'); }); } }); }}>REASSIGN</button>
                            <button style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer', borderRadius: '2px' }} onClick={() => { setConfirmModal({ isOpen: true, title: 'Delete Submission', message: 'Delete Gen AI submission for ' + sub.username + '?', onConfirm: () => { setConfirmModal({ isOpen: false }); adminService.deleteLayer2GenAiSubmission(sub.id, sub.user_id).then(() => { loadAllDatabaseData(); toast.success('Submission deleted'); }); } }); }}><Trash2 size={11} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── MANUAL ATTEMPTS ── */}
            {layer2ActiveSubTab === 'manual' && (
                <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    <thead style={{ background: 'rgba(0,0,0,0.6)', color: '#f59e0b', borderBottom: '1px solid rgba(245,158,11,0.2)' }}>
                      <tr>
                        <th style={{ padding: '12px 14px' }}>PARTICIPANT</th>
                        <th style={{ padding: '12px 14px' }}>LANGUAGE</th>
                        <th style={{ padding: '12px 14px' }}>STATS (Q/C/W)</th>
                        <th style={{ padding: '12px 14px' }}>AUTO / OVERRIDE</th>
                        <th style={{ padding: '12px 14px' }}>STATUS</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {layer2ManualAttemptsList.length === 0 ? (
                        <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>No manual attempts recorded yet.</td></tr>
                      ) : layer2ManualAttemptsList.map(attempt => {
                        const states = attempt.question_states || {};
                        const attemptedCount = Object.keys(states).length;
                        const correctCount = Object.values(states).filter(s => s.status === 'correct').length;
                        const wrongCount = Object.values(states).filter(s => s.status === 'exhausted' || s.status === 'skipped').length;
                        
                        return (
                        <tr key={attempt.id || attempt.user_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '12px 14px' }}><div style={{ fontWeight: 'bold', color: '#fff' }}>{attempt.username || attempt.name || 'Unknown'}</div><div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{attempt.roll_number}</div></td>
                          <td style={{ padding: '12px 14px', color: '#d1d5db' }}>{attempt.language || '\u2014'}</td>
                          <td style={{ padding: '12px 14px', color: '#d1d5db' }}>{attemptedCount} Att / <span style={{ color: '#10b981' }}>{correctCount} Cor</span> / <span style={{ color: '#ef4444' }}>{wrongCount} Wr</span></td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ color: 'var(--lime-accent)', fontWeight: 'bold', marginRight: '8px' }}>{attempt.automatic_marks ?? attempt.score ?? '\u2014'}</span>
                            <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{attempt.admin_override_marks ?? '\u2014'}</span>
                          </td>
                          <td style={{ padding: '12px 14px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', background: attempt.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(156,163,175,0.1)', color: attempt.status === 'completed' ? '#10b981' : '#9ca3af' }}>{(attempt.status || 'pending').toUpperCase()}</span></td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button className="cyber-btn" style={{ padding: '4px 10px', fontSize: '0.72rem', borderColor: 'var(--cyan-glow)', color: 'var(--cyan-glow)' }} onClick={() => setViewingManualDetails(attempt)}>DETAILS</button>
                            <button className="cyber-btn" style={{ padding: '4px 10px', fontSize: '0.72rem', borderColor: '#f59e0b', color: '#f59e0b' }} onClick={() => { setPromptModal({ isOpen: true, title: 'Override Score', message: 'Override score for ' + (attempt.username || attempt.name) + ' (0-25):', defaultValue: attempt.admin_override_marks ?? attempt.score ?? '0', onConfirm: (s) => { setPromptModal({ isOpen: false }); const p = parseFloat(s); if (!isNaN(p) && p >= 0 && p <= 25) adminService.overrideLayer2ManualScore(attempt.user_id, p).then(() => { loadAllDatabaseData(); toast.success('Score overridden'); }); else toast.error('Must be 0-25.'); } }); }}>SCORE</button>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

          {/* TAB 5: DUO ARENA (LAYER 3 & LAYER 4 / FINAL RESULTS) */}
        {activeTab === 'duos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '280px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div
                  style={{
                    flex: 1,
                    minWidth: '240px',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(4, 10, 26, 0.8)',
                    border: '1px solid rgba(0, 243, 255, 0.2)',
                    padding: '8px 12px',
                    gap: '8px'
                  }}
                >
                  <Search size={14} color="var(--cyan-glow)" />
                  <input
                    type="text"
                    placeholder="Search Duos by Player Name, Roll, or Duo #..."
                    value={duoSearch}
                    onChange={(e) => setDuoSearch(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#ffffff',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem',
                      width: '100%'
                    }}
                  />
                </div>

                {/* Year Filter Buttons for Duos */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontFamily: 'var(--font-mono)', marginRight: '4px' }}>
                    YEAR:
                  </span>
                  {[
                    { id: 'ALL', label: 'ALL' },
                    { id: '1', label: '1ST YEAR (26...)' },
                    { id: '2', label: '2ND YEAR (25...)' }
                  ].map((yf) => (
                    <button
                      key={yf.id}
                      onClick={() => {
                        soundEngine.playClick();
                        setDuoYearFilter(yf.id);
                      }}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-mono)',
                        background: duoYearFilter === yf.id ? 'rgba(224, 38, 255, 0.2)' : 'rgba(2, 6, 18, 0.8)',
                        border: duoYearFilter === yf.id ? '1px solid var(--magenta-glow)' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: duoYearFilter === yf.id ? 'var(--magenta-glow)' : '#9ca3af',
                        cursor: 'pointer',
                        borderRadius: '2px',
                        fontWeight: duoYearFilter === yf.id ? 700 : 400
                      }}
                    >
                      {yf.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsCreateDuoOpen(true);
                }}
                className="cyber-btn"
                style={{
                  padding: '8px 18px',
                  fontSize: '0.8rem',
                  borderColor: 'var(--magenta-glow)',
                  color: '#ffffff'
                }}
              >
                <Plus size={14} /> CREATE NEW DUO
              </button>
            </div>

            <div className="cyber-card" style={{ padding: 0, overflowX: 'auto', background: 'rgba(3, 7, 20, 0.9)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(224, 38, 255, 0.08)', borderBottom: '1px solid rgba(224, 38, 255, 0.2)' }}>
                    <th style={{ padding: '12px 14px', width: '110px' }}>RANK</th>
                    <th style={{ padding: '12px 14px' }}>DUO #</th>
                    <th style={{ padding: '12px 14px' }}>PLAYER 1</th>
                    <th style={{ padding: '12px 14px' }}>PLAYER 2</th>
                    <th style={{ padding: '12px 14px' }} title="Formula: ((P1_L1_Avg + P1_L2_Avg) + (P2_L1_Avg + P2_L2_Avg)) / 2">
                      L3 COMBINED (L1+L2 AVG)
                    </th>
                    <th style={{ padding: '12px 14px' }}>LAYER 3 (0-10)</th>
                    <th style={{ padding: '12px 14px' }}>LAYER 4 (0-10)</th>
                    <th style={{ padding: '12px 14px' }}>TOTAL (0-30)</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDuos.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                        NO DUO TEAMS FOUND MATCHING FILTER. CLICK "+ CREATE NEW DUO" TO PAIR PLAYERS.
                      </td>
                    </tr>
                  ) : (
                    filteredDuos.map((item, idx) => {
                      const duo = item.duo;
                      const p1 = item.p1;
                      const p2 = item.p2;
                      const rank = idx + 1;

                      return (
                        <tr
                          key={duo.duo_id}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            background: rank === 1 ? 'rgba(251, 191, 36, 0.05)' : rank === 2 ? 'rgba(148, 163, 184, 0.04)' : rank === 3 ? 'rgba(217, 119, 6, 0.04)' : 'transparent'
                          }}
                        >
                          <td style={{ padding: '12px 14px' }}>
                            {renderRankBadge(rank)}
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--magenta-glow)', fontWeight: 700 }}>
                            #{duo.serial_number}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ color: '#ffffff', fontWeight: 700 }}>{duo.player_1_name || p1?.name || 'Player 1'}</div>
                            <div style={{ color: 'var(--cyan-glow)', fontSize: '0.7rem' }}>
                              {p1?.roll_number} <span style={{ color: '#9ca3af' }}>({getPlayerYearLabel(p1?.roll_number, p1?.year)})</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ color: '#ffffff', fontWeight: 700 }}>{duo.player_2_name || p2?.name || 'Player 2'}</div>
                            <div style={{ color: 'var(--cyan-glow)', fontSize: '0.7rem' }}>
                              {p2?.roll_number} <span style={{ color: '#9ca3af' }}>({getPlayerYearLabel(p2?.roll_number, p2?.year)})</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--cyan-glow)', fontFamily: 'var(--font-mono)' }}>
                            {duo.combined_layer_1_average ?? '0.0'}
                          </td>
                          <td style={{ padding: '12px 14px', color: duo.layer_3_marks !== null ? '#f59e0b' : '#6b7280', fontWeight: 700 }}>
                            {duo.layer_3_marks !== null ? duo.layer_3_marks : '[PENDING]'}
                          </td>
                          <td style={{ padding: '12px 14px', color: duo.layer_4_marks !== null ? '#f59e0b' : '#6b7280', fontWeight: 700 }}>
                            {duo.layer_4_marks !== null ? duo.layer_4_marks : '[PENDING]'}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.9rem',
                                fontWeight: 800,
                                color: 'var(--lime-accent)',
                                textShadow: '0 0 10px rgba(57, 255, 20, 0.3)'
                              }}
                            >
                              {duo.total_marks ?? '0.0'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => setEditingDuoMarks({ ...duo })}
                                className="cyber-btn"
                                style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                              >
                                <Edit2 size={11} /> SCORE L3/L4
                              </button>
                              <button
                                onClick={() => setDeletingDuo(duo)}
                                style={{
                                  padding: '4px 8px',
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  border: '1px solid #ef4444',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  borderRadius: '2px'
                                }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* 4. MODALS */}

      {/* CREATE USER MODAL */}
      <AnimatePresence>
        {isCreateUserOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="cyber-card"
              style={{ width: '100%', maxWidth: '460px', padding: '24px', background: 'rgba(5, 12, 32, 0.98)', borderColor: 'var(--cyan-glow)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', margin: 0, color: 'var(--cyan-glow)' }}>
                  CREATE NEW PARTICIPANT
                </h3>
                <button onClick={() => setIsCreateUserOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>FULL NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#030712', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#ffffff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>
                    ROLL NUMBER (10 CHARACTERS, STARTS WITH 25 OR 26)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 26ABC12345 or 2512345678"
                    value={newUserForm.roll_number}
                    onChange={(e) => setNewUserForm({ ...newUserForm, roll_number: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '10px', background: '#030712', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#ffffff', fontFamily: 'var(--font-mono)' }}
                  />
                  <div style={{ fontSize: '0.65rem', color: 'var(--cyan-glow)', marginTop: '3px', fontFamily: 'var(--font-mono)' }}>
                    26 = 1st Year (Junior) // 25 = 2nd Year (Senior)
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>BRANCH</label>
                  <select
                    value={newUserForm.branch}
                    onChange={(e) => setNewUserForm({ ...newUserForm, branch: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#030712', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#ffffff' }}
                  >
                    {['CSE', 'AI & DS', 'AIML', 'IT', 'ECE', 'EEE', 'ME', 'CIVIL', 'Other'].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>YEAR</label>
                    <select
                      value={newUserForm.year}
                      onChange={(e) => setNewUserForm({ ...newUserForm, year: parseInt(e.target.value, 10) })}
                      style={{ width: '100%', padding: '10px', background: '#030712', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#ffffff' }}
                    >
                      {[1, 2, 3, 4].map((y) => (
                        <option key={y} value={y}>{y} Year</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>SECTION</label>
                    <select
                      value={newUserForm.section}
                      onChange={(e) => setNewUserForm({ ...newUserForm, section: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: '#030712', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#ffffff' }}
                    >
                      {['A', 'B', 'C', 'D'].map((s) => (
                        <option key={s} value={s}>Section {s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setIsCreateUserOpen(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #6b7280', color: '#9ca3af', cursor: 'pointer' }}>
                    CANCEL
                  </button>
                  <button type="submit" className="cyber-btn" style={{ padding: '8px 20px' }}>
                    REGISTER IN SUPABASE
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE DUO MODAL */}
      <AnimatePresence>
        {isCreateDuoOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="cyber-card"
              style={{
                width: '100%',
                maxWidth: '520px',
                padding: '24px',
                background: 'rgba(5, 12, 32, 0.98)',
                borderColor: 'var(--magenta-glow)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', margin: 0, color: 'var(--magenta-glow)' }}>
                  CREATE DUO PAIRING
                </h3>
                <button onClick={() => setIsCreateDuoOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateDuo} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.72rem', color: 'var(--cyan-glow)', margin: 0 }}>
                      SELECT PLAYER 1
                    </label>
                    <span style={{ fontSize: '0.65rem', color: '#9ca3af', fontFamily: 'var(--font-mono)' }}>
                      {unpairedUsers.length} UNPAIRED PLAYERS AVAILABLE
                    </span>
                  </div>
                  <select
                    value={duoForm.player1Id}
                    onChange={(e) => setDuoForm({ ...duoForm, player1Id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#030712',
                      border: '1px solid rgba(0, 243, 255, 0.3)',
                      color: '#ffffff',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    <option value="">-- Choose Unpaired Participant ({unpairedUsers.length} available) --</option>
                    {unpairedUsers.map((u) => (
                      <option key={u.user_id} value={u.user_id}>
                        {u.name} ({u.roll_number}) - Total Score: {u.total_score || '0.0'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.72rem', color: 'var(--magenta-glow)', margin: 0 }}>
                      SELECT PLAYER 2
                    </label>
                    <span style={{ fontSize: '0.65rem', color: '#9ca3af', fontFamily: 'var(--font-mono)' }}>
                      {duoForm.player1Id ? Math.max(0, unpairedUsers.length - 1) : unpairedUsers.length} ELIGIBLE
                    </span>
                  </div>
                  <select
                    value={duoForm.player2Id}
                    onChange={(e) => setDuoForm({ ...duoForm, player2Id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#030712',
                      border: '1px solid rgba(224, 38, 255, 0.3)',
                      color: '#ffffff',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    <option value="">-- Choose Unpaired Participant --</option>
                    {unpairedUsers
                      .filter((u) => u.user_id !== duoForm.player1Id)
                      .map((u) => (
                        <option key={u.user_id} value={u.user_id}>
                          {u.name} ({u.roll_number}) - Total Score: {u.total_score || '0.0'}
                        </option>
                      ))}
                  </select>
                </div>

                {previewDuoDetails && (
                  <div
                    style={{
                      padding: '14px',
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid rgba(57, 255, 20, 0.3)',
                      borderRadius: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', color: '#9ca3af', letterSpacing: '0.08em' }}>
                      LAYER 3 COMBINED FORMULA BREAKDOWN:
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#ffffff' }}>
                      • <strong>{selectedP1?.name}</strong>: L1 Avg ({previewDuoDetails.p1L1}) + L2 Avg ({previewDuoDetails.p1L2}) = <span style={{ color: 'var(--cyan-glow)' }}>{previewDuoDetails.p1Combined}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#ffffff' }}>
                      • <strong>{selectedP2?.name}</strong>: L1 Avg ({previewDuoDetails.p2L1}) + L2 Avg ({previewDuoDetails.p2L2}) = <span style={{ color: 'var(--magenta-glow)' }}>{previewDuoDetails.p2Combined}</span>
                    </div>
                    <div style={{ marginTop: '4px', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--lime-accent)' }}>
                        L3 Combined: ({previewDuoDetails.p1Combined} + {previewDuoDetails.p2Combined}) / 2
                      </span>
                      <span style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', color: 'var(--lime-accent)' }}>
                        = {previewDuoDetails.layer3Combined}
                      </span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setIsCreateDuoOpen(false)}
                    style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #6b7280', color: '#9ca3af', cursor: 'pointer' }}
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="cyber-btn"
                    style={{ padding: '8px 20px', borderColor: 'var(--magenta-glow)' }}
                  >
                    INITIALIZE DUO
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT DUO MARKS MODAL */}
      <AnimatePresence>
        {editingDuoMarks && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="cyber-card"
              style={{ width: '100%', maxWidth: '480px', padding: '24px', background: 'rgba(5, 12, 32, 0.98)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', margin: 0, color: 'var(--cyan-glow)' }}>
                  EVALUATE DUO #{editingDuoMarks.serial_number}
                </h3>
                <button onClick={() => setEditingDuoMarks(null)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveDuoMarks} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#f59e0b', display: 'block', marginBottom: '6px' }}>
                    LAYER 3 MARKS (0.0 - 10.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={editingDuoMarks.layer_3_marks ?? ''}
                    onChange={(e) => setEditingDuoMarks({ ...editingDuoMarks, layer_3_marks: e.target.value })}
                    placeholder="e.g. 8.5"
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#030712',
                      border: '1px solid #f59e0b',
                      color: '#ffffff',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#f59e0b', display: 'block', marginBottom: '6px' }}>
                    LAYER 4 MARKS (0.0 - 10.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={editingDuoMarks.layer_4_marks ?? ''}
                    onChange={(e) => setEditingDuoMarks({ ...editingDuoMarks, layer_4_marks: e.target.value })}
                    placeholder="e.g. 9.0"
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#030712',
                      border: '1px solid #f59e0b',
                      color: '#ffffff',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setEditingDuoMarks(null)}
                    style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #6b7280', color: '#9ca3af', cursor: 'pointer' }}
                  >
                    CANCEL
                  </button>
                  <button type="submit" className="cyber-btn" style={{ padding: '8px 20px' }}>
                    SAVE TO SUPABASE
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT LAYER 1 OR LAYER 2 MARKS MODAL */}
      <AnimatePresence>
        {(editingLayer1Marks || editingLayer2Marks) && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="cyber-card"
              style={{ width: '100%', maxWidth: '460px', padding: '24px', background: 'rgba(5, 12, 32, 0.98)' }}
            >
              {editingLayer1Marks && (
                <form onSubmit={handleSaveLayer1Marks} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ borderBottom: '1px solid rgba(0, 243, 255, 0.2)', paddingBottom: '10px' }}>
                    <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', margin: 0, color: 'var(--cyan-glow)' }}>
                      EDIT LAYER 01 MARKS: {editingLayer1Marks.name}
                    </h3>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                      ROLL: <span style={{ color: 'var(--cyan-glow)' }}>{editingLayer1Marks.roll_number || 'N/A'}</span>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--cyan-glow)', display: 'block', marginBottom: '6px' }}>
                      GEN AI MARKS (0 - 100)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={editingLayer1Marks.layer_1_gen_ai_marks ?? ''}
                      onChange={(e) => setEditingLayer1Marks({ ...editingLayer1Marks, layer_1_gen_ai_marks: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: '#030712', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#ffffff', fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--magenta-glow)', display: 'block', marginBottom: '6px' }}>
                      MANUAL MARKS (0 - 100)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={editingLayer1Marks.layer_1_manual_marks ?? ''}
                      onChange={(e) => setEditingLayer1Marks({ ...editingLayer1Marks, layer_1_manual_marks: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: '#030712', border: '1px solid rgba(224, 38, 255, 0.3)', color: '#ffffff', fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  {/* Real-time calculated Layer 1 Average Preview */}
                  <div
                    style={{
                      padding: '10px 14px',
                      background: 'rgba(57, 255, 20, 0.08)',
                      border: '1px solid rgba(57, 255, 20, 0.3)',
                      borderRadius: '3px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontFamily: 'var(--font-mono)' }}>
                      CALCULATED L1 AVERAGE:
                    </span>
                    <span style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', color: 'var(--lime-accent)', fontWeight: 800 }}>
                      {(
                        ((Math.max(0, parseFloat(editingLayer1Marks.layer_1_gen_ai_marks) || 0) +
                          Math.max(0, parseFloat(editingLayer1Marks.layer_1_manual_marks) || 0)) /
                          2.0)
                      ).toFixed(2)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button type="button" onClick={() => setEditingLayer1Marks(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #6b7280', color: '#9ca3af', cursor: 'pointer' }}>
                      CANCEL
                    </button>
                    <button type="submit" className="cyber-btn" style={{ padding: '8px 20px' }}>
                      SAVE MARKS
                    </button>
                  </div>
                </form>
              )}

              {editingLayer2Marks && (
                <form onSubmit={handleSaveLayer2Marks} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ borderBottom: '1px solid rgba(224, 38, 255, 0.2)', paddingBottom: '10px' }}>
                    <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', margin: 0, color: 'var(--magenta-glow)' }}>
                      EDIT LAYER 02 MARKS: {editingLayer2Marks.name}
                    </h3>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                      ROLL: <span style={{ color: 'var(--cyan-glow)' }}>{editingLayer2Marks.roll_number || 'N/A'}</span>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--cyan-glow)', display: 'block', marginBottom: '6px' }}>
                      GEN AI MARKS (0 - 100)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={editingLayer2Marks.layer_2_gen_ai_marks ?? ''}
                      onChange={(e) => setEditingLayer2Marks({ ...editingLayer2Marks, layer_2_gen_ai_marks: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: '#030712', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#ffffff', fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--magenta-glow)', display: 'block', marginBottom: '6px' }}>
                      MANUAL MARKS (0 - 100)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={editingLayer2Marks.layer_2_manual_marks ?? ''}
                      onChange={(e) => setEditingLayer2Marks({ ...editingLayer2Marks, layer_2_manual_marks: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: '#030712', border: '1px solid rgba(224, 38, 255, 0.3)', color: '#ffffff', fontFamily: 'var(--font-mono)' }}
                    />
                  </div>

                  {/* Real-time calculated Layer 2 Average Preview */}
                  <div
                    style={{
                      padding: '10px 14px',
                      background: 'rgba(57, 255, 20, 0.08)',
                      border: '1px solid rgba(57, 255, 20, 0.3)',
                      borderRadius: '3px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontFamily: 'var(--font-mono)' }}>
                      CALCULATED L2 AVERAGE:
                    </span>
                    <span style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', color: 'var(--lime-accent)', fontWeight: 800 }}>
                      {(
                        ((Math.max(0, parseFloat(editingLayer2Marks.layer_2_gen_ai_marks) || 0) +
                          Math.max(0, parseFloat(editingLayer2Marks.layer_2_manual_marks) || 0)) /
                          2.0)
                      ).toFixed(2)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button type="button" onClick={() => setEditingLayer2Marks(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #6b7280', color: '#9ca3af', cursor: 'pointer' }}>
                      CANCEL
                    </button>
                    <button type="submit" className="cyber-btn" style={{ padding: '8px 20px', borderColor: 'var(--magenta-glow)' }}>
                      SAVE MARKS
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT USER MODAL */}
      <AnimatePresence>
        {editingUser && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="cyber-card"
              style={{ width: '100%', maxWidth: '460px', padding: '24px', background: 'rgba(5, 12, 32, 0.98)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', margin: 0, color: 'var(--cyan-glow)' }}>
                  EDIT PARTICIPANT DATA
                </h3>
                <button onClick={() => setEditingUser(null)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>FULL NAME</label>
                  <input
                    type="text"
                    required
                    value={editingUser.name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#030712', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#ffffff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>ROLL NUMBER</label>
                  <input
                    type="text"
                    required
                    value={editingUser.roll_number || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, roll_number: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#030712', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#ffffff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>BRANCH</label>
                  <input
                    type="text"
                    required
                    value={editingUser.branch || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, branch: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#030712', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#ffffff' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>YEAR</label>
                    <input
                      type="number"
                      min="1"
                      max="4"
                      required
                      value={editingUser.year || 1}
                      onChange={(e) => setEditingUser({ ...editingUser, year: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: '#030712', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#ffffff' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>SECTION</label>
                    <input
                      type="text"
                      required
                      value={editingUser.section || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, section: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: '#030712', border: '1px solid rgba(0, 243, 255, 0.3)', color: '#ffffff' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setEditingUser(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #6b7280', color: '#9ca3af', cursor: 'pointer' }}>
                    CANCEL
                  </button>
                  <button type="submit" className="cyber-btn" style={{ padding: '8px 20px' }}>
                    SAVE TO SUPABASE
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {(deletingUser || deletingDuo || deletingLayerResult) && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="cyber-card"
              style={{
                width: '100%',
                maxWidth: '440px',
                padding: '24px',
                borderColor: '#ef4444',
                boxShadow: '0 0 30px rgba(239, 68, 68, 0.3)',
                background: 'rgba(5, 12, 32, 0.98)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', marginBottom: '14px' }}>
                <AlertTriangle size={22} />
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', margin: 0 }}>
                  CONFIRM PERMANENT DELETION
                </h3>
              </div>

              {deletingUser && (
                <div>
                  <p style={{ fontSize: '0.82rem', color: '#ffffff', lineHeight: 1.5, marginBottom: '8px' }}>
                    Permanently force-delete player <strong>{deletingUser.name}</strong> (Roll: <span style={{ color: 'var(--cyan-glow)' }}>{deletingUser.roll_number}</span>)?
                  </p>
                  <div
                    style={{
                      padding: '10px 12px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      borderLeft: '3px solid #ef4444',
                      fontSize: '0.72rem',
                      color: '#fca5a5',
                      lineHeight: 1.5,
                      marginBottom: '16px'
                    }}
                  >
                    ⚠ <strong>FORCE EXIT CONSEQUENCE:</strong> If this participant is currently active on any arena screen or challenge round, they will be <strong>instantly force-exited</strong>, their session destroyed, and all Layer 1, Layer 2, and Duo records permanently purged. They must register again from scratch.
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button onClick={() => setDeletingUser(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #6b7280', color: '#9ca3af', cursor: 'pointer' }}>
                      CANCEL
                    </button>
                    <button onClick={handleDeleteUser} style={{ padding: '8px 18px', background: '#ef4444', border: 'none', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}>
                      ⚠ FORCE DELETE PARTICIPANT
                    </button>
                  </div>
                </div>
              )}

              {deletingDuo && (
                <div>
                  <p style={{ fontSize: '0.8rem', color: '#d1d5db', lineHeight: 1.5 }}>
                    Delete duo pairing <strong style={{ color: '#ffffff' }}>#{deletingDuo.serial_number}</strong>?
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                    <button onClick={() => setDeletingDuo(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #6b7280', color: '#9ca3af', cursor: 'pointer' }}>
                      CANCEL
                    </button>
                    <button onClick={handleDeleteDuo} style={{ padding: '8px 18px', background: '#ef4444', border: 'none', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}>
                      DELETE DUO
                    </button>
                  </div>
                </div>
              )}

              {deletingLayerResult && (
                <div>
                  <p style={{ fontSize: '0.8rem', color: '#d1d5db', lineHeight: 1.5 }}>
                    Reset Layer 0{deletingLayerResult.layer} marks for <strong style={{ color: '#ffffff' }}>{deletingLayerResult.userName}</strong>?
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                    <button onClick={() => setDeletingLayerResult(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #6b7280', color: '#9ca3af', cursor: 'pointer' }}>
                      CANCEL
                    </button>
                    <button onClick={handleDeleteLayerResult} style={{ padding: '8px 18px', background: '#ef4444', border: 'none', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}>
                      RESET MARKS
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GENAI SUBMISSION DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingGenAiSub && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10500,
              background: 'rgba(0, 0, 0, 0.88)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="cyber-card"
              style={{
                width: '100%',
                maxWidth: '480px',
                padding: '24px',
                background: 'rgba(5, 12, 32, 0.98)',
                borderColor: '#ef4444',
                boxShadow: '0 0 40px rgba(239, 68, 68, 0.2)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid rgba(239, 68, 68, 0.25)', paddingBottom: '12px' }}>
                <Trash2 size={20} color="#ef4444" />
                <h3 style={{ margin: 0, fontFamily: 'var(--font-title)', fontSize: '1.1rem', color: '#ffffff' }}>
                  DELETE GENAI SUBMISSION
                </h3>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#d1d5db', lineHeight: 1.6, marginBottom: '12px' }}>
                Delete GenAI submission from{' '}
                <strong style={{ color: '#ffffff' }}>{deletingGenAiSub.username || 'this player'}</strong>
                {deletingGenAiSub.roll_number && (
                  <> (Roll: <span style={{ color: 'var(--cyan-glow)' }}>{deletingGenAiSub.roll_number}</span>)</>
                )}
                ?
              </p>

              <div
                style={{
                  padding: '10px 12px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  borderLeft: '3px solid #ef4444',
                  fontSize: '0.72rem',
                  color: '#fca5a5',
                  lineHeight: 1.5,
                  marginBottom: '20px'
                }}
              >
                ⚠ This removes their submission from Supabase and ImageKit and resets their GenAI marks to 0.{' '}
                <strong>The participant keeps their account</strong> and can re-submit.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  onClick={() => setDeletingGenAiSub(null)}
                  disabled={isDeletingGenAiSub}
                  style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #6b7280', color: '#9ca3af', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                >
                  CANCEL
                </button>
                <button
                  onClick={handleDeleteGenAiSubmission}
                  disabled={isDeletingGenAiSub}
                  style={{ padding: '8px 18px', background: '#ef4444', border: 'none', color: '#ffffff', fontWeight: 700, cursor: isDeletingGenAiSub ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Trash2 size={14} />
                  {isDeletingGenAiSub ? 'DELETING...' : 'DELETE SUBMISSION'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PROMPT VIEWER MODAL */}
      <AnimatePresence>
        {viewingPrompt && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              background: 'rgba(0, 0, 0, 0.88)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="cyber-card"
              style={{
                width: '100%',
                maxWidth: '680px',
                padding: '24px',
                background: 'rgba(5, 12, 32, 0.98)',
                borderColor: 'var(--cyan-glow)',
                boxShadow: '0 0 40px rgba(0, 243, 255, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0, 243, 255, 0.2)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="var(--cyan-glow)" />
                  <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', margin: 0, color: '#ffffff' }}>
                    GENAI PROMPT: {viewingPrompt.username}
                  </h3>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--cyan-glow)' }}>
                  ROLL: {viewingPrompt.roll_number || 'N/A'}
                </span>
              </div>

              <div
                style={{
                  background: 'rgba(2, 6, 18, 0.95)',
                  border: '1px solid rgba(0, 243, 255, 0.2)',
                  borderRadius: '3px',
                  padding: '16px',
                  maxHeight: '360px',
                  overflowY: 'auto',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  lineHeight: '1.6',
                  color: '#e5e7eb',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {viewingPrompt.prompt}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#9ca3af' }}>
                  LENGTH: {viewingPrompt.prompt?.length || 0} characters // {viewingPrompt.prompt?.split(/\s+/).filter(Boolean).length || 0} words
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(viewingPrompt.prompt || '');
                      showToast('✓ PROMPT COPIED TO CLIPBOARD');
                    }}
                    className="cyber-btn"
                    style={{ padding: '6px 14px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Copy size={13} />
                    <span>COPY PROMPT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewingPrompt(null)}
                    style={{ padding: '6px 16px', background: 'transparent', border: '1px solid #6b7280', color: '#9ca3af', cursor: 'pointer', fontSize: '0.72rem' }}
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* IMAGE GALLERY VIEWER MODAL */}
      <AnimatePresence>
        {viewingImages && viewingImages.image_urls && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              background: 'rgba(0, 0, 0, 0.92)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="cyber-card"
              style={{
                width: '100%',
                maxWidth: '840px',
                padding: '20px',
                background: 'rgba(5, 12, 32, 0.98)',
                borderColor: 'var(--cyan-glow)',
                boxShadow: '0 0 50px rgba(0, 243, 255, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0, 243, 255, 0.2)', paddingBottom: '10px' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.05rem', margin: 0, color: '#ffffff' }}>
                    SUBMITTED REFERENCE ASSETS: {viewingImages.username}
                  </h3>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--cyan-glow)', marginTop: '2px' }}>
                    ASSET {(viewingImages.activeIndex || 0) + 1} OF {viewingImages.image_urls.length}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <a
                    href={viewingImages.image_urls[viewingImages.activeIndex || 0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cyber-btn"
                    style={{ padding: '4px 10px', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                  >
                    <ExternalLink size={12} />
                    <span>ORIGINAL IMAGEKIT URL</span>
                  </a>
                  <button
                    onClick={() => setViewingImages(null)}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Main Image Frame with Prev/Next controls */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '420px',
                  background: 'rgba(2, 6, 18, 0.95)',
                  border: '1px solid rgba(0, 243, 255, 0.25)',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                <img
                  src={viewingImages.image_urls[viewingImages.activeIndex || 0]}
                  alt="Submitted Asset"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />

                {viewingImages.image_urls.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setViewingImages({
                          ...viewingImages,
                          activeIndex: (viewingImages.activeIndex || 0) === 0 ? viewingImages.image_urls.length - 1 : (viewingImages.activeIndex || 0) - 1
                        })
                      }
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0, 0, 0, 0.7)',
                        border: '1px solid var(--cyan-glow)',
                        color: 'var(--cyan-glow)',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <button
                      onClick={() =>
                        setViewingImages({
                          ...viewingImages,
                          activeIndex: ((viewingImages.activeIndex || 0) + 1) % viewingImages.image_urls.length
                        })
                      }
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0, 0, 0, 0.7)',
                        border: '1px solid var(--cyan-glow)',
                        color: 'var(--cyan-glow)',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Filmstrip */}
              {viewingImages.image_urls.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', overflowX: 'auto', padding: '4px 0' }}>
                  {viewingImages.image_urls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Thumb ${i}`}
                      onClick={() => setViewingImages({ ...viewingImages, activeIndex: i })}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '2px',
                        border: (viewingImages.activeIndex || 0) === i ? '2px solid var(--cyan-glow)' : '1px solid rgba(255, 255, 255, 0.2)',
                        objectFit: 'cover',
                        cursor: 'pointer',
                        opacity: (viewingImages.activeIndex || 0) === i ? 1 : 0.6
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MANUAL ATTEMPT BREAKDOWN MODAL */}
      <AnimatePresence>
        {viewingManualBreakdown && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              background: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(14px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="cyber-card"
              style={{
                width: '100%',
                maxWidth: '780px',
                maxHeight: '85vh',
                padding: '24px',
                background: 'rgba(5, 12, 32, 0.98)',
                borderColor: 'var(--magenta-glow)',
                boxShadow: '0 0 45px rgba(224, 38, 255, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                overflow: 'hidden'
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(224, 38, 255, 0.2)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Terminal size={20} color="var(--magenta-glow)" />
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', margin: 0, color: '#ffffff' }}>
                      MANUAL ATTEMPT: {viewingManualBreakdown.username}
                    </h3>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px' }}>
                      ROLL: <span style={{ color: 'var(--cyan-glow)' }}>{viewingManualBreakdown.roll_number}</span> // BATCH: <span style={{ color: 'var(--magenta-glow)' }}>{viewingManualBreakdown.year || viewingManualBreakdown.batch}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      padding: '4px 12px',
                      background: 'rgba(57, 255, 20, 0.1)',
                      border: '1px solid var(--lime-accent)',
                      borderRadius: '3px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      color: 'var(--lime-accent)'
                    }}
                  >
                    SCORE: {viewingManualBreakdown.score} / 150 ({viewingManualBreakdown.correct_count ?? Math.round(viewingManualBreakdown.score / 10)} / 15 CORRECT)
                  </div>

                  <button
                    onClick={() => setViewingManualBreakdown(null)}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Questions List Container */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  paddingRight: '6px'
                }}
              >
                {viewingManualBreakdown.questions_pool?.map((q, idx) => {
                  const selectedKey = viewingManualBreakdown.selected_answers?.[q.id] || viewingManualBreakdown.selected_answers?.[idx];
                  const isCorrect = selectedKey === q.correct_answer;
                  const isEasy = q.difficulty === 'easy';

                  return (
                    <div
                      key={q.id || idx}
                      style={{
                        padding: '14px 16px',
                        background: 'rgba(2, 6, 20, 0.9)',
                        border: `1px solid ${isCorrect ? 'rgba(57, 255, 20, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        borderRadius: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      {/* Question Index & Status Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--cyan-glow)' }}>
                            #{idx + 1}
                          </span>
                          <span
                            className="cyber-badge"
                            style={{
                              fontSize: '0.62rem',
                              borderColor: isEasy ? 'var(--cyan-glow)' : 'var(--magenta-glow)',
                              color: isEasy ? 'var(--cyan-glow)' : 'var(--magenta-glow)'
                            }}
                          >
                            {isEasy ? 'EASY' : 'HARD'}
                          </span>
                        </div>

                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            color: isCorrect ? 'var(--lime-accent)' : '#ef4444'
                          }}
                        >
                          {isCorrect ? '✓ CORRECT (+10 PTS)' : '✗ INCORRECT (0 PTS)'}
                        </span>
                      </div>

                      {/* Question Text */}
                      <div style={{ fontSize: '0.82rem', color: '#e5e7eb', lineHeight: 1.5, fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap' }}>
                        {q.question}
                      </div>

                      {/* Options & Selection Summary */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' }}>
                        {['A', 'B', 'C', 'D'].map((optKey) => {
                          const optText = q.options?.[optKey];
                          if (!optText) return null;

                          const isThisSelected = selectedKey === optKey;
                          const isThisCorrect = q.correct_answer === optKey;

                          let bg = 'rgba(255, 255, 255, 0.03)';
                          let border = '1px solid rgba(255, 255, 255, 0.08)';
                          let color = '#9ca3af';

                          if (isThisCorrect) {
                            bg = 'rgba(57, 255, 20, 0.12)';
                            border = '1px solid var(--lime-accent)';
                            color = 'var(--lime-accent)';
                          } else if (isThisSelected && !isThisCorrect) {
                            bg = 'rgba(239, 68, 68, 0.12)';
                            border = '1px solid #ef4444';
                            color = '#ef4444';
                          }

                          return (
                            <div
                              key={optKey}
                              style={{
                                padding: '6px 10px',
                                background: bg,
                                border: border,
                                borderRadius: '3px',
                                fontSize: '0.72rem',
                                color: color,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <strong>[{optKey}]</strong>
                              <span style={{ color: '#ffffff' }}>{optText}</span>
                              {isThisSelected && <span>(CHOSEN)</span>}
                              {isThisCorrect && <span>✓</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setViewingManualBreakdown(null)}
                  style={{ padding: '6px 18px', background: 'transparent', border: '1px solid #6b7280', color: '#9ca3af', cursor: 'pointer', fontSize: '0.72rem' }}
                >
                  CLOSE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST POPUP */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              zIndex: 10001,
              padding: '12px 20px',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              background: toastMessage.type === 'success' ? 'rgba(5, 24, 18, 0.98)' : 'rgba(32, 5, 8, 0.98)',
              border: toastMessage.type === 'success' ? '1px solid var(--lime-accent)' : '1px solid #ef4444',
              color: toastMessage.type === 'success' ? 'var(--lime-accent)' : '#ef4444',
              boxShadow: '0 0 25px rgba(0, 0, 0, 0.9)'
            }}
          >
            {toastMessage.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}