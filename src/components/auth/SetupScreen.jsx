// First-time vault setup

import { useState } from 'react';
import { Shield, Eye, EyeOff, Lock, ArrowRight, Check, Loader2 } from 'lucide-react';
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
    Weak: 'bg-bad',
    Fair: 'bg-warn',
    Good: 'bg-accent',
    Strong: 'bg-ok',
    None: 'bg-txt-tertiary',
  };

  return (
    <div className="auth-atmosphere fixed inset-0 flex items-center justify-center z-50 overflow-y-auto p-6">
      <div className="relative flex flex-col items-center w-full max-w-[400px] animate-fade-in-up">
        <div className="flex flex-col items-center gap-3 mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-white">
            <Shield size={28} strokeWidth={1.6} />
          </div>
          <h1 className="text-[1.75rem] font-bold text-txt tracking-[-0.04em]">VaultSoft</h1>
          <p className="text-sm text-txt-secondary leading-relaxed max-w-[340px]">
            Create a master password. It encrypts your vault and never leaves this device.
          </p>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <StepPill n={1} label="Create" active={step >= 1} done={step > 1} />
          <div className="w-8 h-px bg-border-strong" />
          <StepPill n={2} label="Confirm" active={step >= 2} done={false} />
        </div>

        {step === 1 ? (
          <div className="flex flex-col gap-5 w-full animate-fade-in" key="step1">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-txt" htmlFor="setup-password-input">Master password</label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-txt-tertiary pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full py-3 pl-10 pr-11 text-[15px] text-txt bg-surface border border-border-strong rounded-xl outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-muted)] placeholder:text-txt-tertiary"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  autoFocus
                  id="setup-password-input"
                />
                <button
                  type="button"
                  className="absolute right-1.5 flex items-center justify-center w-8 h-8 border-none bg-transparent text-txt-tertiary cursor-pointer rounded-lg transition-colors duration-150 hover:text-txt-secondary hover:bg-overlay"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {password && (
                <div className="flex items-center gap-3 animate-fade-in">
                  <div className="flex-1 h-1 rounded-full bg-subtle overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strengthBarColor[strength.label] || 'bg-txt-tertiary'}`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold min-w-[48px] text-right" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-txt" htmlFor="setup-hint-input">
                Hint <span className="font-normal text-txt-tertiary">(optional)</span>
              </label>
              <input
                type="text"
                className="w-full py-3 px-4 text-[15px] text-txt bg-surface border border-border-strong rounded-xl outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-muted)] placeholder:text-txt-tertiary"
                placeholder="A clue only you would understand"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                id="setup-hint-input"
              />
              <p className="text-xs text-txt-tertiary leading-snug">
                Stored unencrypted — never include the password itself.
              </p>
            </div>

            {error && <p className="text-sm text-bad animate-fade-in">{error}</p>}

            <button
              type="button"
              className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-white bg-accent rounded-xl cursor-pointer transition-colors duration-150 hover:bg-accent-hover active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleNext}
              disabled={!password}
              id="setup-next-button"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5 w-full animate-fade-in" key="step2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-txt" htmlFor="setup-confirm-input">Confirm password</label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-txt-tertiary pointer-events-none" />
                <input
                  type="password"
                  className="w-full py-3 pl-10 pr-4 text-[15px] text-txt bg-surface border border-border-strong rounded-xl outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-muted)] placeholder:text-txt-tertiary"
                  placeholder="Re-enter master password"
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
                type="button"
                className="flex-1 py-3 text-sm font-semibold text-txt-secondary bg-surface border border-border rounded-xl cursor-pointer transition-colors duration-150 hover:bg-overlay"
                onClick={() => { setStep(1); setConfirm(''); setError(''); }}
              >
                Back
              </button>
              <button
                type="button"
                className="flex-1 py-3 text-sm font-semibold text-white bg-accent rounded-xl cursor-pointer transition-colors duration-150 hover:bg-accent-hover active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={handleCreate}
                disabled={!confirm || loading}
                id="setup-create-button"
              >
                {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Create vault'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepPill({ n, label, active, done }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${active ? 'text-accent' : 'text-txt-tertiary'}`}>
      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-semibold transition-colors duration-150 ${active ? 'bg-accent text-white' : 'bg-surface text-txt-tertiary border border-border'}`}>
        {done ? <Check size={12} /> : n}
      </span>
      <span>{label}</span>
    </div>
  );
}
