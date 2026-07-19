// Lock Screen — master password + biometric unlock

import { useState, useRef, useEffect } from 'react';
import { Lock, Eye, EyeOff, Fingerprint, HelpCircle, Loader2, Shield } from 'lucide-react';
import { isBiometricAvailable } from '../../auth/biometric';

export default function LockScreen({
  onUnlock,
  onUnlockBiometric,
  onGetHint,
  error,
  loading,
  biometricEnrolled,
}) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState('');
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricBusy, setBiometricBusy] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef(null);
  const autoTriedRef = useRef(false);

  const canUseBiometric = biometricEnrolled && biometricSupported;

  useEffect(() => {
    isBiometricAvailable().then((ok) => {
      setBiometricSupported(ok);
    });
  }, []);

  useEffect(() => {
    if (error) {
      setShaking(true);
      const t = setTimeout(() => setShaking(false), 500);
      return () => clearTimeout(t);
    }
  }, [error]);

  // Auto-prompt biometrics once when enrolled (mobile-friendly)
  useEffect(() => {
    if (!canUseBiometric || autoTriedRef.current || loading) return;
    autoTriedRef.current = true;
    (async () => {
      setBiometricBusy(true);
      await onUnlockBiometric();
      setBiometricBusy(false);
      inputRef.current?.focus();
    })();
  }, [canUseBiometric, loading, onUnlockBiometric]);

  useEffect(() => {
    if (!biometricBusy) inputRef.current?.focus();
  }, [biometricBusy]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim() || loading || biometricBusy) return;
    await onUnlock(password);
    setPassword('');
  };

  const handleBiometric = async () => {
    if (!canUseBiometric || loading || biometricBusy) return;
    setBiometricBusy(true);
    await onUnlockBiometric();
    setBiometricBusy(false);
  };

  const handleShowHint = async () => {
    if (!showHint) {
      const h = await onGetHint();
      setHint(h || 'No hint was set');
    }
    setShowHint(!showHint);
  };

  return (
    <div className="auth-atmosphere fixed inset-0 flex items-center justify-center z-50 overflow-hidden">
      <div className="relative flex flex-col items-center w-full max-w-[380px] px-6 animate-fade-in-up">
        <div className="flex flex-col items-center gap-3 mb-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-white">
            <Shield size={28} strokeWidth={1.6} />
          </div>
          <h1 className="text-[2rem] font-bold text-txt tracking-[-0.04em] leading-none">VaultSoft</h1>
          <p className="text-sm text-txt-secondary leading-relaxed">
            {canUseBiometric ? 'Unlock with biometrics or your master password' : 'Unlock with your master password'}
          </p>
        </div>

        {canUseBiometric && (
          <button
            type="button"
            className="flex items-center justify-center gap-2 w-full mb-4 py-3 text-sm font-semibold text-white bg-accent rounded-xl cursor-pointer transition-colors duration-150 hover:bg-accent-hover active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleBiometric}
            disabled={loading || biometricBusy}
            aria-label="Unlock with biometrics"
          >
            {biometricBusy || loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Fingerprint size={18} />
                Unlock with biometrics
              </>
            )}
          </button>
        )}

        {canUseBiometric && (
          <div className="flex items-center gap-3 w-full mb-4">
            <div className="flex-1 h-px bg-border-strong" />
            <span className="text-[11px] text-txt-tertiary font-medium">or</span>
            <div className="flex-1 h-px bg-border-strong" />
          </div>
        )}

        <form className={`flex flex-col gap-3 w-full ${shaking ? 'animate-shake' : ''}`} onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-txt-tertiary pointer-events-none" />
              <input
                ref={inputRef}
                id="master-password-input"
                type={showPassword ? 'text' : 'password'}
                className="w-full py-3 pl-10 pr-11 text-[15px] text-txt bg-surface border border-border-strong rounded-xl outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-muted)] placeholder:text-txt-tertiary"
                placeholder="Master password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading || biometricBusy}
              />
              <button
                type="button"
                className="absolute right-1.5 flex items-center justify-center w-8 h-8 border-none bg-transparent text-txt-tertiary cursor-pointer rounded-lg transition-colors duration-150 hover:text-txt-secondary hover:bg-overlay"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <p className="text-sm text-bad animate-fade-in">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 text-sm font-semibold text-txt bg-surface border border-border-strong rounded-xl cursor-pointer transition-colors duration-150 hover:bg-overlay active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!password.trim() || loading || biometricBusy}
            id="unlock-button"
          >
            {loading && !biometricBusy ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Unlock with password'}
          </button>
        </form>

        <button
          type="button"
          className="flex items-center gap-1.5 mt-8 text-xs text-txt-tertiary bg-transparent border-none cursor-pointer transition-colors duration-150 hover:text-txt-secondary"
          onClick={handleShowHint}
        >
          <HelpCircle size={13} />
          {showHint ? 'Hide hint' : 'Forgot password? Show hint'}
        </button>

        {showHint && (
          <p className="mt-3 w-full px-4 py-3 text-sm text-txt-secondary bg-surface border border-border rounded-xl text-center break-words animate-fade-in">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
