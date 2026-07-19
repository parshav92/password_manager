// Auth state management hook

import { useState, useEffect, useCallback, useRef } from 'react';
import { isVaultSetup, setupVault, unlockVault, getPasswordHint } from '../auth/masterPassword';
import { loadSettings } from '../storage/settingsStore';

export function useAuth() {
  const [state, setState] = useState({
    loading: true,
    isSetup: false,    // Has a master password been set?
    isUnlocked: false, // Is the vault currently unlocked?
    cryptoKey: null,    // The in-memory encryption key
    settings: null,
    error: null,
  });

  const lockTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Check initial state
  useEffect(() => {
    (async () => {
      const setup = await isVaultSetup();
      setState(s => ({ ...s, loading: false, isSetup: setup }));
    })();
  }, []);

  // Auto-lock timer
  useEffect(() => {
    if (!state.isUnlocked || !state.settings) return;

    const timeout = state.settings.autoLockTimeout;
    if (timeout <= 0) return;

    const checkActivity = () => {
      const elapsed = (Date.now() - lastActivityRef.current) / 1000 / 60;
      if (elapsed >= timeout) {
        lock();
      }
    };

    const resetActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Track user activity
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetActivity));

    lockTimerRef.current = setInterval(checkActivity, 15000); // Check every 15s

    return () => {
      events.forEach(e => window.removeEventListener(e, resetActivity));
      if (lockTimerRef.current) clearInterval(lockTimerRef.current);
    };
  }, [state.isUnlocked, state.settings]);

  // Lock on visibility change (tab hidden)
  useEffect(() => {
    if (!state.isUnlocked) return;

    const handleVisibility = () => {
      if (document.hidden) {
        lastActivityRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [state.isUnlocked]);

  const setup = useCallback(async (password, hint) => {
    try {
      setState(s => ({ ...s, error: null, loading: true }));
      const key = await setupVault(password, hint);
      const settings = await loadSettings(key);
      setState(s => ({
        ...s,
        loading: false,
        isSetup: true,
        isUnlocked: true,
        cryptoKey: key,
        settings,
      }));
      return true;
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: 'Setup failed. Please try again.' }));
      return false;
    }
  }, []);

  const unlock = useCallback(async (password) => {
    try {
      setState(s => ({ ...s, error: null, loading: true }));
      const key = await unlockVault(password);
      if (!key) {
        setState(s => ({ ...s, loading: false, error: 'Incorrect password' }));
        return false;
      }
      const settings = await loadSettings(key);
      lastActivityRef.current = Date.now();
      setState(s => ({
        ...s,
        loading: false,
        isUnlocked: true,
        cryptoKey: key,
        settings,
      }));
      return true;
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: 'Unlock failed. Please try again.' }));
      return false;
    }
  }, []);

  const lock = useCallback(() => {
    if (lockTimerRef.current) clearInterval(lockTimerRef.current);
    setState(s => ({
      ...s,
      isUnlocked: false,
      cryptoKey: null,
      error: null,
    }));
  }, []);

  const updateSettings = useCallback((newSettings) => {
    setState(s => ({ ...s, settings: newSettings }));
  }, []);

  const clearError = useCallback(() => {
    setState(s => ({ ...s, error: null }));
  }, []);

  const getHint = useCallback(async () => {
    return await getPasswordHint();
  }, []);

  return {
    ...state,
    setup,
    unlock,
    lock,
    updateSettings,
    clearError,
    getHint,
  };
}
