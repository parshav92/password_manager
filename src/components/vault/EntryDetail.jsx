// Entry detail view — shows full entry info with actions

import { useState } from 'react';
import {
  Eye, EyeOff, Copy, ExternalLink, Star, Edit, Trash2,
  ArrowLeft, Clock, Tag
} from 'lucide-react';
import CategoryIcon from '../ui/CategoryIcon';
import { useToast } from '../ui/Toast';
import { copyToClipboard } from '../../utils/clipboard';
import { calculateStrength } from '../../utils/passwordStrength';
import { CATEGORY_MAP } from '../../utils/constants';

export default function EntryDetail({ entry, onEdit, onDelete, onToggleFavorite, onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const toast = useToast();
  const strength = calculateStrength(entry.password);

  const handleCopy = async (text, label) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success(`${label} copied`);
    } else {
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(entry.id);
      toast.success('Entry deleted');
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  const category = CATEGORY_MAP[entry.category];

  const strengthColor = {
    'Weak': 'bg-bad',
    'Fair': 'bg-warn',
    'Good': 'bg-blue-400',
    'Strong': 'bg-ok',
    'None': 'bg-txt-tertiary',
  };

  return (
    <div className="h-full overflow-y-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-base/80 backdrop-blur-xl z-10">
        <button className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent text-txt-tertiary cursor-pointer transition-all duration-150 hover:bg-overlay hover:text-txt" onClick={onClose} aria-label="Close">
          <ArrowLeft size={18} />
        </button>

        <div className="flex items-center gap-1">
          <button
            className={`flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer transition-all duration-150 ${entry.isFavorite ? 'text-warn' : 'text-txt-tertiary hover:text-txt hover:bg-overlay'}`}
            onClick={() => onToggleFavorite(entry.id)}
            aria-label={entry.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star size={16} fill={entry.isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent text-txt-tertiary cursor-pointer transition-all duration-150 hover:bg-overlay hover:text-txt" onClick={onEdit} aria-label="Edit">
            <Edit size={16} />
          </button>
          <button
            className={`flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer transition-all duration-150 ${confirmDelete ? 'text-bad bg-bad-muted' : 'text-txt-tertiary hover:text-bad hover:bg-bad-muted'}`}
            onClick={handleDelete}
            aria-label="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Title Section */}
        <div className="flex items-center gap-4 mb-8">
          <CategoryIcon categoryId={entry.category} size={48} />
          <div>
            <h2 className="text-xl font-semibold text-txt tracking-[-0.02em]">{entry.title}</h2>
            {category && (
              <span className="text-xs font-medium mt-0.5 inline-block" style={{ color: category.color }}>
                {category.label}
              </span>
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-5">
          {entry.username && (
            <Field label="Username / Email">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-txt truncate">{entry.username}</span>
                <IconBtn icon={<Copy size={13} />} onClick={() => handleCopy(entry.username, 'Username')} />
              </div>
            </Field>
          )}

          {entry.password && (
            <Field label="Password">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-txt font-mono tracking-wide truncate">
                  {showPassword ? entry.password : '•'.repeat(Math.min(entry.password.length, 24))}
                </span>
                <div className="flex items-center gap-0.5 shrink-0">
                  <IconBtn icon={showPassword ? <EyeOff size={13} /> : <Eye size={13} />} onClick={() => setShowPassword(!showPassword)} />
                  <IconBtn icon={<Copy size={13} />} onClick={() => handleCopy(entry.password, 'Password')} />
                </div>
              </div>
              <div className="flex items-center gap-2.5 mt-2">
                <div className="flex-1 h-1 rounded-full bg-surface overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${strengthColor[strength.label] || 'bg-txt-tertiary'}`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
                <span className="text-[11px] font-semibold" style={{ color: strength.color }}>{strength.label}</span>
              </div>
            </Field>
          )}

          {entry.url && (
            <Field label="Website">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-accent truncate">{entry.url}</span>
                <div className="flex items-center gap-0.5 shrink-0">
                  <IconBtn icon={<ExternalLink size={13} />} onClick={() => {
                    const url = entry.url.startsWith('http') ? entry.url : `https://${entry.url}`;
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }} />
                  <IconBtn icon={<Copy size={13} />} onClick={() => handleCopy(entry.url, 'URL')} />
                </div>
              </div>
            </Field>
          )}

          {entry.notes && (
            <Field label="Notes">
              <p className="text-sm text-txt-secondary leading-relaxed whitespace-pre-wrap">{entry.notes}</p>
            </Field>
          )}

          {/* Custom fields */}
          {entry.customFields?.length > 0 && (
            <Field label="Custom Fields">
              <div className="flex flex-col gap-2">
                {entry.customFields.map((cf, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-txt-tertiary font-medium">{cf.key}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-txt">{cf.value}</span>
                      <IconBtn icon={<Copy size={13} />} onClick={() => handleCopy(cf.value, cf.key)} />
                    </div>
                  </div>
                ))}
              </div>
            </Field>
          )}

          {/* Tags */}
          {entry.tags?.length > 0 && (
            <Field label="Tags">
              <div className="flex flex-wrap gap-1.5">
                {entry.tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-txt-secondary bg-surface rounded-full">
                    <Tag size={10} />
                    {tag}
                  </span>
                ))}
              </div>
            </Field>
          )}
        </div>

        {/* Timestamps */}
        <div className="flex flex-col gap-2 mt-8 pt-6 border-t border-border">
          <TimeStamp label="Created" date={formatDate(entry.createdAt)} />
          <TimeStamp label="Modified" date={formatDate(entry.updatedAt)} />
          <TimeStamp label="Password changed" date={formatDate(entry.passwordLastChanged)} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-txt-tertiary uppercase tracking-wider">{label}</label>
      <div className="px-3.5 py-3 bg-surface rounded-xl border border-border">
        {children}
      </div>
    </div>
  );
}

function IconBtn({ icon, onClick }) {
  return (
    <button
      className="flex items-center justify-center w-6 h-6 rounded-md border-none bg-transparent text-txt-tertiary cursor-pointer transition-all duration-150 hover:bg-overlay hover:text-txt"
      onClick={onClick}
    >
      {icon}
    </button>
  );
}

function TimeStamp({ label, date }) {
  return (
    <div className="flex items-center gap-2 text-xs text-txt-tertiary">
      <Clock size={11} />
      <span>{label} {date}</span>
    </div>
  );
}
