// Password generator component — cryptographically secure with rejection sampling

import { useState, useCallback, useEffect } from 'react';
import { RefreshCw, Copy, Check } from 'lucide-react';
import { PASSWORD_CHARS } from '../../utils/constants';
import { calculateStrength } from '../../utils/passwordStrength';
import { copyToClipboard } from '../../utils/clipboard';

/**
 * Generate a cryptographically uniform random index in [0, max)
 * using rejection sampling to avoid modulo bias.
 */
function secureRandomIndex(max) {
  const limit = Math.floor(0xFFFFFFFF / max) * max;
  let value;
  do {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    value = arr[0];
  } while (value >= limit);
  return value % max;
}

export default function PasswordGenerator({ onSelect }) {
  const [length, setLength] = useState(18);
  const [options, setOptions] = useState({
    uppercase: true, lowercase: true, numbers: true, symbols: true, excludeAmbiguous: false,
  });
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    let chars = '';
    if (options.lowercase) chars += PASSWORD_CHARS.lowercase;
    if (options.uppercase) chars += PASSWORD_CHARS.uppercase;
    if (options.numbers) chars += PASSWORD_CHARS.numbers;
    if (options.symbols) chars += PASSWORD_CHARS.symbols;
    if (options.excludeAmbiguous) {
      for (const c of PASSWORD_CHARS.ambiguous) {
        chars = chars.replace(new RegExp(c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
      }
    }
    if (!chars) chars = PASSWORD_CHARS.lowercase;
    let pwd = '';
    for (let i = 0; i < length; i++) {
      pwd += chars[secureRandomIndex(chars.length)];
    }
    setPassword(pwd);
    setCopied(false);
  }, [length, options]);

  useEffect(() => { generate(); }, [generate]);

  const strength = calculateStrength(password);

  const strengthColor = {
    Weak: 'bg-bad', Fair: 'bg-warn', Good: 'bg-accent', Strong: 'bg-ok', None: 'bg-txt-tertiary',
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(password);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleOption = (key) => {
    const newOpts = { ...options, [key]: !options[key] };
    const hasAny = newOpts.uppercase || newOpts.lowercase || newOpts.numbers || newOpts.symbols;
    if (!hasAny) return;
    setOptions(newOpts);
  };

  return (
    <div className="mt-2 p-4 bg-surface border border-border rounded-xl flex flex-col gap-3 animate-scale-in">
      {/* Generated password */}
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-elevated rounded-lg border border-border">
        <span className="text-sm font-mono text-txt tracking-wider truncate select-all">{password}</span>
        <div className="flex items-center gap-1 shrink-0">
          <button className="flex items-center justify-center w-7 h-7 rounded-md border-none bg-transparent text-txt-tertiary cursor-pointer transition-all duration-150 hover:bg-overlay hover:text-txt" onClick={handleCopy} title="Copy">
            {copied ? <Check size={13} className="text-ok" /> : <Copy size={13} />}
          </button>
          <button className="flex items-center justify-center w-7 h-7 rounded-md border-none bg-transparent text-txt-tertiary cursor-pointer transition-all duration-150 hover:bg-overlay hover:text-txt" onClick={generate} title="Regenerate">
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Strength */}
      <div className="flex items-center gap-2.5">
        <div className="flex-1 h-1 rounded-full bg-elevated overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-400 ${strengthColor[strength.label] || 'bg-txt-tertiary'}`} style={{ width: `${strength.score}%` }} />
        </div>
        <span className="text-[11px] font-semibold" style={{ color: strength.color }}>{strength.label}</span>
      </div>

      {/* Length slider */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs text-txt-secondary">Length</label>
          <span className="text-xs font-semibold text-txt tabular-nums">{length}</span>
        </div>
        <input type="range" min="8" max="64" value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full" />
      </div>

      {/* Options */}
      <div className="flex gap-1.5">
        {[{ key: 'uppercase', label: 'A-Z' }, { key: 'lowercase', label: 'a-z' }, { key: 'numbers', label: '0-9' }, { key: 'symbols', label: '!@#' }].map(opt => (
          <button
            key={opt.key}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer transition-all duration-150 ${options[opt.key] ? 'bg-accent-muted text-accent border-accent/20' : 'bg-transparent text-txt-tertiary border-border hover:border-border-strong'}`}
            onClick={() => toggleOption(opt.key)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Exclude ambiguous */}
      <label className="flex items-center gap-2 text-xs text-txt-secondary cursor-pointer">
        <input type="checkbox" checked={options.excludeAmbiguous} onChange={() => toggleOption('excludeAmbiguous')} className="accent-accent" />
        <span>Exclude ambiguous (I, l, 1, O, 0)</span>
      </label>

      {/* Use button */}
      <button
        type="button"
        className="w-full py-2.5 text-sm font-semibold text-white bg-accent rounded-xl cursor-pointer transition-colors duration-150 hover:bg-accent-hover active:scale-[0.99]"
        onClick={() => onSelect(password)}
      >
        Use password
      </button>
    </div>
  );
}
