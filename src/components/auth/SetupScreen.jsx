// First-time vault setup screen

import { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Lock, ArrowRight, Check, Loader2 } from 'lucide-react';
import { calculateStrength } from '../../utils/passwordStrength';

export default function SetupScreen({ onSetup, loading }) {
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [hint, setHint] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const strength = calculateStrength(password);

  const handleNext = () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleCreate = async () => {
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    await onSetup(password, hint);
  };

  const strengthBarColor = {
    'Weak': 'bg-bad',
    'Fair': 'bg-warn',
    'Good': 'bg-blue-400',
    'Strong': 'bg-ok',
    'None': 'bg-txt-tertiary',
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-base z-50 overflow-y-auto p-8">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[25%] left-[45%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(120,111,229,0.1)_0%,transparent_70%)] blur-[80px] animate-glow" />
      </div>

      <div className="relative flex flex-col items-center w-full max-w-[400px] animate-fade-in-up">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4 mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-[#9B8FEF] flex items-center justify-center text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset,0_8px_32px_rgba(120,111,229,0.25)]">
            <ShieldCheck size={30} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-txt tracking-[-0.03em]">Welcome to VaultSoft</h1>
          <p className="text-sm text-txt-tertiary leading-relaxed max-w-[340px]">
            Create a master password to secure your vault. This is the only key to your data — remember it well.
          </p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`flex items-center gap-1.5 text-xs font-medium ${step >= 1 ? 'text-accent' : 'text-txt-tertiary'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all duration-200 ${step >= 1 ? 'bg-accent text-white' : 'bg-surface text-txt-tertiary'}`}>
              {step > 1 ? <Check size={12} /> : '1'}
            </span>
            <span>Create</span>
          </div>
          <div className="w-10 h-0.5 bg-border-strong rounded-full" />
          <div className={`flex items-center gap-1.5 text-xs font-medium ${step >= 2 ? 'text-accent' : 'text-txt-tertiary'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all duration-200 ${step >= 2 ? 'bg-accent text-white' : 'bg-surface text-txt-tertiary'}`}>
              2
            </span>
            <span>Confirm</span>
          </div>
        </div>

        {step === 1 ? (
          <div className="flex flex-col gap-6 w-full animate-fade-in" key="step1">
            {/* Password field */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-txt">Master Password</label>
              <div className="relative flex items-center">
                <Lock size={17} className="absolute left-3.5 text-txt-tertiary pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full py-3 pl-10.5 pr-11 text-[15px] text-txt bg-elevated border border-border-strong rounded-xl outline-none transition-all duration-200 focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-muted)] focus:bg-overlay placeholder:text-txt-tertiary"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  autoFocus
                  id="setup-password-input"
                />
                <button
                  type="button"
                  className="absolute right-1.5 flex items-center justify-center w-8 h-8 border-none bg-transparent text-txt-tertiary cursor-pointer rounded-lg transition-all duration-150 hover:text-txt-secondary hover:bg-overlay"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {/* Strength meter */}
              {password && (
                <div className="flex items-center gap-3 animate-fade-in">
                  <div className="flex-1 h-1 rounded-full bg-surface overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-400 ${strengthBarColor[strength.label] || 'bg-txt-tertiary'}`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold min-w-[48px] text-right" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Hint field */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-txt">
                Password Hint <span className="font-normal text-txt-tertiary">(optional)</span>
              </label>
              <input
                type="text"
                className="w-full py-3 px-4 text-[15px] text-txt bg-elevated border border-border-strong rounded-xl outline-none transition-all duration-200 focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-muted)] focus:bg-overlay placeholder:text-txt-tertiary"
                placeholder="A clue to remember your password"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                id="setup-hint-input"
              />
              <p className="text-xs text-txt-tertiary leading-snug">
                ⚠️ This hint is stored unencrypted — don't include your actual password
              </p>
            </div>

            {error && <p className="text-sm text-bad animate-fade-in">{error}</p>}

            <button
              className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-white bg-accent rounded-xl cursor-pointer transition-all duration-200 hover:bg-accent-hover hover:shadow-[0_4px_20px_var(--color-accent-muted)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleNext}
              disabled={!password}
              id="setup-next-button"
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 w-full animate-fade-in" key="step2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-txt">Confirm Password</label>
              <div className="relative flex items-center">
                <Lock size={17} className="absolute left-3.5 text-txt-tertiary pointer-events-none" />
                <input
                  type="password"
                  className="w-full py-3 pl-10.5 pr-4 text-[15px] text-txt bg-elevated border border-border-strong rounded-xl outline-none transition-all duration-200 focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-muted)] focus:bg-overlay placeholder:text-txt-tertiary"
                  placeholder="Re-enter your master password"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                  autoFocus
                  id="setup-confirm-input"
                />
              </div>
            </div>

            {error && <p className="text-sm text-bad animate-fade-in">{error}</p>}

            <div className="flex gap-3">
              <button
                className="flex-1 py-3 text-sm font-semibold text-txt-secondary bg-surface rounded-xl cursor-pointer transition-all duration-200 hover:bg-overlay"
                onClick={() => { setStep(1); setConfirm(''); setError(''); }}
              >
                Back
              </button>
              <button
                className="flex-1 py-3 text-sm font-semibold text-white bg-accent rounded-xl cursor-pointer transition-all duration-200 hover:bg-accent-hover hover:shadow-[0_4px_20px_var(--color-accent-muted)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={handleCreate}
                disabled={!confirm || loading}
                id="setup-create-button"
              >
                {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Create Vault'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
