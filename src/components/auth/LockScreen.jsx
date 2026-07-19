// Lock Screen — master password entry and biometric unlock

import { useState, useRef, useEffect } from 'react';
import { Lock, Eye, EyeOff, Fingerprint, HelpCircle, Loader2, ShieldCheck } from 'lucide-react';
import { isBiometricAvailable } from '../../auth/biometric';

export default function LockScreen({ onUnlock, onGetHint, error, loading }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState('');
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    isBiometricAvailable().then(setBiometricSupported);
  }, []);

  useEffect(() => {
    if (error) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim() || loading) return;
    await onUnlock(password);
    setPassword('');
  };

  const handleShowHint = async () => {
    if (!showHint) {
      const h = await onGetHint();
      setHint(h || 'No hint was set');
    }
    setShowHint(!showHint);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-base z-50 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[30%] left-[40%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(120,111,229,0.12)_0%,transparent_70%)] blur-[80px] animate-glow" />
        <div className="absolute -bottom-[20%] right-[30%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(69,212,131,0.04)_0%,transparent_70%)] blur-[100px] animate-glow [animation-delay:2s]" />
      </div>

      <div className="relative flex flex-col items-center w-full max-w-[360px] px-8 animate-fade-in-up">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-[#9B8FEF] flex items-center justify-center text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset,0_8px_32px_rgba(120,111,229,0.25)]">
            <ShieldCheck size={30} strokeWidth={1.5} />
          </div>
          <h1 className="text-[28px] font-bold text-txt tracking-[-0.04em]">VaultSoft</h1>
          <p className="text-sm text-txt-tertiary text-center leading-relaxed">Enter your master password to unlock</p>
        </div>

        <form className={`flex flex-col gap-4 w-full ${shaking ? 'animate-shake' : ''}`} onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <div className="relative flex items-center">
              <Lock size={17} className="absolute left-3.5 text-txt-tertiary pointer-events-none" />
              <input
                ref={inputRef}
                id="master-password-input"
                type={showPassword ? 'text' : 'password'}
                className="w-full py-3 pl-10.5 pr-11 text-[15px] text-txt bg-elevated border border-border-strong rounded-xl outline-none transition-all duration-200 focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-muted)] focus:bg-overlay placeholder:text-txt-tertiary"
                placeholder="Master password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-1.5 flex items-center justify-center w-8 h-8 border-none bg-transparent text-txt-tertiary cursor-pointer rounded-lg transition-all duration-150 hover:text-txt-secondary hover:bg-overlay"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {error && (
              <p className="text-sm text-bad pl-0.5 animate-fade-in">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 text-sm font-semibold text-white bg-accent rounded-xl cursor-pointer transition-all duration-200 tracking-wide hover:bg-accent-hover hover:shadow-[0_4px_20px_var(--color-accent-muted)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!password.trim() || loading}
            id="unlock-button"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin mx-auto" />
            ) : (
              'Unlock'
            )}
          </button>

          {biometricSupported && (
            <button
              type="button"
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-txt-secondary bg-transparent border border-border-strong rounded-xl cursor-pointer transition-all duration-200 hover:border-accent hover:text-accent hover:bg-accent-subtle"
              aria-label="Unlock with biometrics"
            >
              <Fingerprint size={20} />
              <span>Use biometrics</span>
            </button>
          )}
        </form>

        <button
          className="flex items-center gap-1 mt-8 px-3 py-2 text-xs text-txt-tertiary bg-transparent border-none cursor-pointer transition-colors duration-150 hover:text-txt-secondary"
          onClick={handleShowHint}
        >
          <HelpCircle size={13} />
          <span>{showHint ? 'Hide hint' : 'Show hint'}</span>
        </button>

        {showHint && (
          <p className="mt-3 px-4 py-3 text-sm text-txt-secondary bg-elevated border border-border rounded-lg text-center max-w-full break-words animate-fade-in">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
