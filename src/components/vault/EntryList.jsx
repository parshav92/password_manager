// Entry list — search header + scrollable entries

import { Search, ArrowUpDown } from 'lucide-react';
import EntryCard from './EntryCard';
import EmptyState from './EmptyState';

export default function EntryList({
  entries,
  query,
  onQueryChange,
  selectedId,
  onSelect,
  onToggleFavorite,
  sortBy,
  onSortChange,
  loading,
  activeCategory,
  showFavoritesOnly,
}) {
  const sortOptions = [
    { value: 'updated', label: 'Last Modified' },
    { value: 'name', label: 'Name' },
    { value: 'category', label: 'Category' },
  ];

  const getTitle = () => {
    if (showFavoritesOnly) return 'Favorites';
    if (activeCategory === 'all') return 'All Items';
    return activeCategory?.charAt(0).toUpperCase() + activeCategory?.slice(1);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-1">
        <h2 className="text-base font-semibold text-txt tracking-[-0.02em]">{getTitle()}</h2>
        <span className="text-xs text-txt-tertiary font-medium tabular-nums">{entries.length} items</span>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2 px-5 py-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary pointer-events-none" />
          <input
            type="text"
            className="w-full py-2 pl-9 pr-3 text-sm text-txt bg-elevated border border-border rounded-lg outline-none transition-all duration-200 focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-muted)] placeholder:text-txt-tertiary"
            placeholder="Search passwords..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            id="search-input"
          />
        </div>
        <div className="relative">
          <select
            className="appearance-none py-2 pl-3 pr-7 text-xs text-txt-secondary bg-elevated border border-border rounded-lg cursor-pointer outline-none transition-all duration-200 focus:border-accent"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort by"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ArrowUpDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-txt-tertiary pointer-events-none" />
        </div>
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {loading ? (
          <div className="flex flex-col gap-2 px-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-elevated animate-pulse-slow" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          entries.map((entry, i) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              isSelected={selectedId === entry.id}
              onSelect={() => onSelect(entry.id)}
              onToggleFavorite={() => onToggleFavorite(entry.id)}
              style={{ animationDelay: `${i * 25}ms` }}
            />
          ))
        )}
      </div>
    </div>
  );
}
