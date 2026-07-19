// Search and filter hook

import { useState, useMemo } from 'react';

export function useSearch(entries) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState('updated'); // 'updated' | 'name' | 'category'

  const filtered = useMemo(() => {
    let result = [...entries];

    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter(e => e.category === activeCategory);
    }

    // Filter favorites
    if (showFavoritesOnly) {
      result = result.filter(e => e.isFavorite);
    }

    // Search
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(e => {
        const searchable = [
          e.title,
          e.username,
          e.url,
          e.notes,
          e.category,
          ...(e.tags || []),
        ].filter(Boolean).join(' ').toLowerCase();
        return searchable.includes(q);
      });
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'category':
        result.sort((a, b) => (a.category || '').localeCompare(b.category || '') || (a.title || '').localeCompare(b.title || ''));
        break;
      case 'updated':
      default:
        result.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        break;
    }

    return result;
  }, [entries, query, activeCategory, showFavoritesOnly, sortBy]);

  return {
    query,
    setQuery,
    activeCategory,
    setActiveCategory,
    showFavoritesOnly,
    setShowFavoritesOnly,
    sortBy,
    setSortBy,
    filtered,
  };
}
