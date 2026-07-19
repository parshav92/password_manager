// Vault state management hook

import { useState, useCallback, useEffect } from 'react';
import { getAllEntries, addEntry, updateEntry, deleteEntry } from '../storage/vaultStore';

export function useVault(cryptoKey) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  // Load all entries when vault is unlocked
  useEffect(() => {
    if (!cryptoKey) {
      setEntries([]);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      const all = await getAllEntries(cryptoKey);
      setEntries(all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)));
      setLoading(false);
    })();
  }, [cryptoKey]);

  const add = useCallback(async (entryData) => {
    if (!cryptoKey) return;
    const id = await addEntry(entryData, cryptoKey);
    const all = await getAllEntries(cryptoKey);
    setEntries(all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)));
    return id;
  }, [cryptoKey]);

  const update = useCallback(async (id, entryData) => {
    if (!cryptoKey) return;
    await updateEntry(id, entryData, cryptoKey);
    const all = await getAllEntries(cryptoKey);
    setEntries(all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)));
  }, [cryptoKey]);

  const remove = useCallback(async (id) => {
    if (!cryptoKey) return;
    await deleteEntry(id);
    setEntries(prev => prev.filter(e => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [cryptoKey, selectedId]);

  const toggleFavorite = useCallback(async (id) => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    await update(id, { ...entry, isFavorite: !entry.isFavorite });
  }, [entries, update]);

  return {
    entries,
    loading,
    selectedId,
    setSelectedId,
    add,
    update,
    remove,
    toggleFavorite,
  };
}
