// Vault Health dashboard — identifies weak, reused, and old passwords

import { useMemo } from 'react';
import { AlertTriangle, Copy, Clock, ShieldCheck, ArrowLeft } from 'lucide-react';
import { calculateStrength } from '../../utils/passwordStrength';
import CategoryIcon from '../ui/CategoryIcon';

export default function VaultHealth({ entries, onSelectEntry, onClose }) {
  const analysis = useMemo(() => {
    const weak = [];
    const reused = [];
    const old = [];
    const passwordMap = {};
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;

    entries.forEach(entry => {
      if (!entry.password) return;
      const strength = calculateStrength(entry.password);
      if (strength.score < 50) weak.push({ ...entry, strength });
      if (!passwordMap[entry.password]) passwordMap[entry.password] = [];
      passwordMap[entry.password].push(entry);
      if (entry.passwordLastChanged && Date.now() - entry.passwordLastChanged > ninetyDays) {
        old.push(entry);
      }
    });

    Object.values(passwordMap).forEach(group => {
      if (group.length > 1) reused.push(...group);
    });

    const totalScore = entries.length > 0
      ? Math.round(((entries.length - weak.length - reused.length * 0.5 - old.length * 0.3) / entries.length) * 100)
      : 100;

    return { weak, reused, old, score: Math.max(0, Math.min(100, totalScore)) };
  }, [entries]);

  const getScoreColor = (s) => {
    if (s >= 80) return 'text-ok';
    if (s >= 50) return 'text-warn';
    return 'text-bad';
  };

  const getScoreStroke = (s) => {
    if (s >= 80) return 'var(--color-ok)';
    if (s >= 50) return 'var(--color-warn)';
    return 'var(--color-bad)';
  };

  return (
    <div className="h-full overflow-y-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border sticky top-0 bg-base/80 backdrop-blur-xl z-10">
        <button className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent text-txt-tertiary cursor-pointer transition-all duration-150 hover:bg-overlay hover:text-txt" onClick={onClose}>
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-base font-semibold text-txt tracking-[-0.02em]">Vault Health</h2>
      </div>

      <div className="px-6 py-6">
        {/* Score card */}
        <div className="flex flex-col items-center gap-4 mb-8 p-6 bg-surface rounded-2xl border border-border">
          <div className="relative w-28 h-28">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-border-strong)" strokeWidth="5" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={getScoreStroke(analysis.score)} strokeWidth="5"
                strokeDasharray={`${analysis.score * 2.64} ${264 - analysis.score * 2.64}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold tabular-nums ${getScoreColor(analysis.score)}`}>{analysis.score}</span>
              <span className="text-[10px] text-txt-tertiary font-medium">/ 100</span>
            </div>
          </div>
          <p className="text-sm text-txt-secondary text-center">
            {analysis.score >= 80 ? 'Your vault is in great shape!' : analysis.score >= 50 ? 'Some passwords need attention.' : 'Your vault needs immediate attention.'}
          </p>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-4">
          <HealthSection icon={<AlertTriangle size={16} />} title="Weak Passwords" count={analysis.weak.length}
            colorClass="text-bad" bgClass="bg-bad-muted" items={analysis.weak} onSelect={onSelectEntry} emptyText="No weak passwords found" />
          <HealthSection icon={<Copy size={16} />} title="Reused Passwords" count={analysis.reused.length}
            colorClass="text-warn" bgClass="bg-warn-muted" items={analysis.reused} onSelect={onSelectEntry} emptyText="No reused passwords" />
          <HealthSection icon={<Clock size={16} />} title="Old Passwords (90+ days)" count={analysis.old.length}
            colorClass="text-txt-secondary" bgClass="bg-surface" items={analysis.old} onSelect={onSelectEntry} emptyText="All passwords are recent" />
        </div>
      </div>
    </div>
  );
}

function HealthSection({ icon, title, count, colorClass, bgClass, items, onSelect, emptyText }) {
  return (
    <div className="p-4 bg-surface rounded-xl border border-border">
      <div className="flex items-center gap-2.5 mb-3">
        <span className={colorClass}>{icon}</span>
        <h3 className="text-sm font-semibold text-txt flex-1">{title}</h3>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${count > 0 ? `${colorClass} ${bgClass}` : 'text-txt-tertiary bg-elevated'}`}>
          {count}
        </span>
      </div>
      {count === 0 ? (
        <p className="flex items-center gap-1.5 text-xs text-txt-tertiary">
          <ShieldCheck size={13} className="text-ok" /> {emptyText}
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {items.slice(0, 5).map(entry => (
            <button key={entry.id} className="flex items-center gap-2.5 w-full p-2 rounded-lg bg-transparent border-none text-left cursor-pointer transition-all duration-150 hover:bg-overlay" onClick={() => onSelect(entry.id)}>
              <CategoryIcon categoryId={entry.category} size={30} />
              <div className="flex-1 min-w-0">
                <span className="block text-sm text-txt truncate">{entry.title}</span>
                <span className="block text-[11px] text-txt-tertiary truncate">{entry.username}</span>
              </div>
            </button>
          ))}
          {items.length > 5 && <p className="text-xs text-txt-tertiary px-2 pt-1">and {items.length - 5} more...</p>}
        </div>
      )}
    </div>
  );
}
