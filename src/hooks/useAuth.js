// Auth state management hook

import { useState, useEffect, useCallback, useRef } from 'react';
import { isVaultSetup, setupVault, unlockVault, getPasswordHint } from '../auth/masterPassword';
import { unlockWithBiometric, isBiometricEnrolled } from '../auth/biometric';
import { loadSettings } from '../storage/settingsStore';

export function useAuth() {
  const [state, setState] = useState({
    loading: true,
    isSetup: false,
    isUnlocked: false,
    cryptoKey: null,
    settings: null,
    error: null,
    biometricEnrolled: false,
  });

  const lockTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    (async () => {
      const setup = await isVaultSetup();
      const biometricEnrolled = setup ? await isBiometricEnrolled() : false;
      setState(s => ({ ...s, loading: false, isSetup: setup, biometricEnrolled }));
    })();
  }, []);

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

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetActivity));

    lockTimerRef.current = setInterval(checkActivity, 15000);

    return () => {
      events.forEach(e => window.removeEventListener(e, resetActivity));
      if (lockTimerRef.current) clearInterval(lockTimerRef.current);
    };
  }, [state.isUnlocked, state.settings]);

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
        biometricEnrolled: false,
      }));
      return true;
    } catch {
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
      const biometricEnrolled = await isBiometricEnrolled();
      lastActivityRef.current = Date.now();
      setState(s => ({
        ...s,
        loading: false,
        isUnlocked: true,
        cryptoKey: key,
        settings,
        biometricEnrolled,
      }));
      return true;
    } catch {
      setState(s => ({ ...s, loading: false, error: 'Unlock failed. Please try again.' }));
      return false;
    }
  }, []);

  const unlockBiometric = useCallback(async () => {
    try {
      setState(s => ({ ...s, error: null, loading: true }));
      const result = await unlockWithBiometric();
      if (!result.key) {
        setState(s => ({
          ...s,
          loading: false,
          error: result.cancelled
            ? null
            : (result.error || 'Biometric unlock failed. Use your master password.'),
        }));
        return false;
      }
      const settings = await loadSettings(result.key);
      lastActivityRef.current = Date.now();
      setState(s => ({
        ...s,
        loading: false,
        isUnlocked: true,
        cryptoKey: result.key,
        settings,
        biometricEnrolled: true,
      }));
      return true;
    } catch {
      setState(s => ({
        ...s,
        loading: false,
        error: 'Biometric unlock failed. Use your master password.',
      }));
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

  const setBiometricEnrolled = useCallback((enrolled) => {
    setState(s => ({ ...s, biometricEnrolled: enrolled }));
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
    unlockBiometric,
    lock,
    updateSettings,
    setBiometricEnrolled,
    clearError,
    getHint,
  };
}
