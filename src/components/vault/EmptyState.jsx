// Empty state illustration for vault

import { ShieldPlus, Search } from 'lucide-react';

export default function EmptyState({ query }) {
  if (query) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center text-txt-tertiary mb-4">
          <Search size={24} strokeWidth={1.5} />
        </div>
        <h3 className="text-sm font-semibold text-txt mb-1">No results found</h3>
        <p className="text-xs text-txt-tertiary text-center max-w-[240px] leading-relaxed">
          Try adjusting your search or check a different category
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 animate-fade-in">
      <div className="w-12 h-12 rounded-2xl bg-accent-muted flex items-center justify-center text-accent mb-4">
        <ShieldPlus size={24} strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-semibold text-txt mb-1">Your vault is empty</h3>
      <p className="text-xs text-txt-tertiary text-center max-w-[260px] leading-relaxed">
        Add your first password to get started. Your data is encrypted and stored locally on this device.
      </p>
    </div>
  );
}
