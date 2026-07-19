// Vault Health — weak / reused / old passwords

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
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border sticky top-0 bg-base/90 backdrop-blur-md z-10">
        <button type="button" className="flex items-center justify-center w-9 h-9 rounded-lg border-none bg-transparent text-txt-tertiary cursor-pointer transition-colors duration-150 hover:bg-overlay hover:text-txt" onClick={onClose} aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-base font-semibold text-txt tracking-[-0.03em]">Vault health</h2>
      </div>

      <div className="px-5 py-6 max-w-lg mx-auto">
        <div className="flex flex-col items-center gap-3 mb-8 py-6">
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-border-strong)" strokeWidth="5" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={getScoreStroke(analysis.score)} strokeWidth="5"
                strokeDasharray={`${analysis.score * 2.64} ${264 - analysis.score * 2.64}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold tabular-nums tracking-tight ${getScoreColor(analysis.score)}`}>{analysis.score}</span>
            </div>
          </div>
          <p className="text-sm text-txt-secondary text-center max-w-[280px]">
            {analysis.score >= 80 ? 'Looking good — keep it up.' : analysis.score >= 50 ? 'A few passwords need attention.' : 'Several passwords should be updated.'}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <HealthSection icon={<AlertTriangle size={15} />} title="Weak" count={analysis.weak.length}
            colorClass="text-bad" bgClass="bg-bad-muted" items={analysis.weak} onSelect={onSelectEntry} emptyText="No weak passwords" />
          <HealthSection icon={<Copy size={15} />} title="Reused" count={analysis.reused.length}
            colorClass="text-warn" bgClass="bg-warn-muted" items={analysis.reused} onSelect={onSelectEntry} emptyText="No reused passwords" />
          <HealthSection icon={<Clock size={15} />} title="Older than 90 days" count={analysis.old.length}
            colorClass="text-txt-secondary" bgClass="bg-overlay" items={analysis.old} onSelect={onSelectEntry} emptyText="All passwords are recent" />
        </div>
      </div>
    </div>
  );
}

function HealthSection({ icon, title, count, colorClass, bgClass, items, onSelect, emptyText }) {
  return (
    <div className="p-4 bg-surface rounded-xl border border-border">
      <div className="flex items-center gap-2.5 mb-2">
        <span className={colorClass}>{icon}</span>
        <h3 className="text-sm font-semibold text-txt flex-1">{title}</h3>
        <span className={`text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded-md ${count > 0 ? `${colorClass} ${bgClass}` : 'text-txt-tertiary bg-overlay'}`}>
          {count}
        </span>
      </div>
      {count === 0 ? (
        <p className="flex items-center gap-1.5 text-xs text-txt-tertiary">
          <ShieldCheck size={13} className="text-ok" /> {emptyText}
        </p>
      ) : (
        <div className="flex flex-col gap-0.5 mt-1">
          {items.slice(0, 5).map(entry => (
            <button type="button" key={entry.id} className="flex items-center gap-2.5 w-full p-2 rounded-lg bg-transparent border-none text-left cursor-pointer transition-colors duration-150 hover:bg-overlay" onClick={() => onSelect(entry.id)}>
              <CategoryIcon categoryId={entry.category} size={28} />
              <div className="flex-1 min-w-0">
                <span className="block text-sm text-txt truncate">{entry.title}</span>
                <span className="block text-[11px] text-txt-tertiary truncate">{entry.username}</span>
              </div>
            </button>
          ))}
          {items.length > 5 && <p className="text-xs text-txt-tertiary px-2 pt-1">and {items.length - 5} more</p>}
        </div>
      )}
    </div>
  );
}
