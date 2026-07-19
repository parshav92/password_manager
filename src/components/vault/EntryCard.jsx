// Entry row in the list

import { Star, Copy, ExternalLink } from 'lucide-react';
import CategoryIcon from '../ui/CategoryIcon';
import { useToast } from '../ui/Toast';
import { copyToClipboard } from '../../utils/clipboard';

export default function EntryCard({ entry, isSelected, onSelect }) {
  const toast = useToast();

  const handleCopy = async (e) => {
    e.stopPropagation();
    const success = await copyToClipboard(entry.password);
    if (success) toast.success('Password copied');
    else toast.error('Failed to copy');
  };

  const handleOpenUrl = (e) => {
    e.stopPropagation();
    if (entry.url) {
      const url = entry.url.startsWith('http') ? entry.url : `https://${entry.url}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const domain = (() => {
    try {
      if (!entry.url) return '';
      const url = entry.url.startsWith('http') ? entry.url : `https://${entry.url}`;
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return '';
    }
  })();

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xl cursor-pointer transition-colors duration-150 group
        ${isSelected
          ? 'bg-accent-muted'
          : 'hover:bg-overlay'
        }`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onSelect(); }}
      id={`entry-${entry.id}`}
    >
      <CategoryIcon categoryId={entry.category} size={36} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-medium text-txt truncate">{entry.title}</h3>
          {entry.isFavorite && <Star size={11} className="text-warn shrink-0" fill="currentColor" />}
        </div>
        <p className="text-xs text-txt-tertiary truncate mt-0.5">
          {entry.username && <span>{entry.username}</span>}
          {entry.username && domain && <span className="mx-1 opacity-40">·</span>}
          {domain && <span>{domain}</span>}
        </p>
      </div>

      <div className="flex items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150">
        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent text-txt-tertiary cursor-pointer transition-colors duration-150 hover:bg-surface hover:text-txt"
          onClick={handleCopy}
          aria-label="Copy password"
        >
          <Copy size={14} />
        </button>
        {entry.url && (
          <button
            type="button"
            className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent text-txt-tertiary cursor-pointer transition-colors duration-150 hover:bg-surface hover:text-txt"
            onClick={handleOpenUrl}
            aria-label="Open website"
          >
            <ExternalLink size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
