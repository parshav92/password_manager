// Empty vault / no search results

import { ShieldPlus, Search } from 'lucide-react';

export default function EmptyState({ query }) {
  if (query) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 animate-fade-in">
        <div className="w-11 h-11 rounded-xl bg-overlay flex items-center justify-center text-txt-tertiary mb-3">
          <Search size={20} strokeWidth={1.5} />
        </div>
        <h3 className="text-sm font-semibold text-txt mb-1">No matches</h3>
        <p className="text-xs text-txt-tertiary text-center max-w-[220px] leading-relaxed">
          Try a different search or category
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 animate-fade-in">
      <div className="w-11 h-11 rounded-xl bg-accent-muted flex items-center justify-center text-accent mb-3">
        <ShieldPlus size={20} strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-semibold text-txt mb-1">Vault is empty</h3>
      <p className="text-xs text-txt-tertiary text-center max-w-[240px] leading-relaxed">
        Add a password to get started. Everything stays encrypted on this device.
      </p>
    </div>
  );
}
