// VaultSoft — Main App Component

import { useState, useMemo, useCallback } from 'react';
import { Shield } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useVault } from './hooks/useVault';
import { useSearch } from './hooks/useSearch';
import { useTheme } from './hooks/useTheme';

import { ToastProvider } from './components/ui/Toast';
import LockScreen from './components/auth/LockScreen';
import SetupScreen from './components/auth/SetupScreen';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import EntryList from './components/vault/EntryList';
import EntryDetail from './components/vault/EntryDetail';
import EntryForm from './components/vault/EntryForm';
import VaultHealth from './components/tools/VaultHealth';
import SettingsPage from './components/settings/SettingsPage';

function AppInner() {
  const auth = useAuth();
  const vault = useVault(auth.cryptoKey);
  const search = useSearch(vault.entries);
  useTheme(auth.settings?.theme);

  const [view, setView] = useState('list');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileTab, setMobileTab] = useState('vault');

  const entryCounts = useMemo(() => {
    const counts = {};
    vault.entries.forEach(e => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });
    return counts;
  }, [vault.entries]);

  const selectedEntry = useMemo(() => {
    if (!vault.selectedId) return null;
    return vault.entries.find(e => e.id === vault.selectedId) || null;
  }, [vault.selectedId, vault.entries]);

  const handleSelectEntry = useCallback((id) => {
    vault.setSelectedId(id);
    setView('detail');
  }, [vault]);

  const handleAddEntry = useCallback(() => {
    vault.setSelectedId(null);
    setView('add');
  }, [vault]);

  const handleEditEntry = useCallback(() => {
    setView('edit');
  }, []);

  const handleSaveEntry = useCallback(async (formData) => {
    if (view === 'edit' && vault.selectedId) {
      await vault.update(vault.selectedId, formData);
    } else {
      const id = await vault.add(formData);
      vault.setSelectedId(id);
    }
    setView('list');
  }, [view, vault]);

  const handleDeleteEntry = useCallback(async (id) => {
    await vault.remove(id);
    setView('list');
  }, [vault]);

  const handleBackToList = useCallback(() => {
    vault.setSelectedId(null);
    setView('list');
    setMobileTab('vault');
  }, [vault]);

  const handleMobileTabChange = useCallback((tab) => {
    setMobileTab(tab);
    if (tab === 'vault') {
      setView('list');
      vault.setSelectedId(null);
    } else if (tab === 'health') {
      setView('health');
    } else if (tab === 'settings') {
      setView('settings');
    }
  }, [vault]);

  const handleOpenHealth = useCallback(() => {
    setView('health');
    setMobileTab('health');
  }, []);

  const handleOpenSettings = useCallback(() => {
    setView('settings');
    setMobileTab('settings');
  }, []);

  if (auth.loading) {
    return (
      <div className="flex items-center justify-center h-dvh bg-base">
        <div className="w-7 h-7 border-2 border-border-strong border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!auth.isSetup) {
    return <SetupScreen onSetup={auth.setup} loading={auth.loading} />;
  }

  if (!auth.isUnlocked) {
    return (
      <LockScreen
        onUnlock={auth.unlock}
        onUnlockBiometric={auth.unlockBiometric}
        onGetHint={auth.getHint}
        error={auth.error}
        loading={auth.loading}
        biometricEnrolled={auth.biometricEnrolled}
      />
    );
  }

  const showListOnly = view === 'list';

  const renderRightPanel = () => {
    switch (view) {
      case 'detail':
        if (!selectedEntry) return <EmptyDetail />;
        return (
          <EntryDetail
            entry={selectedEntry}
            onEdit={handleEditEntry}
            onDelete={handleDeleteEntry}
            onToggleFavorite={vault.toggleFavorite}
            onClose={handleBackToList}
          />
        );
      case 'add':
        return (
          <EntryForm onSave={handleSaveEntry} onCancel={handleBackToList} />
        );
      case 'edit':
        return (
          <EntryForm
            entry={selectedEntry}
            onSave={handleSaveEntry}
            onCancel={() => setView('detail')}
          />
        );
      case 'health':
        return (
          <VaultHealth
            entries={vault.entries}
            onSelectEntry={(id) => { vault.setSelectedId(id); setView('detail'); }}
            onClose={handleBackToList}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            settings={auth.settings}
            cryptoKey={auth.cryptoKey}
            onUpdateSettings={auth.updateSettings}
            onLock={auth.lock}
            onClose={handleBackToList}
            biometricEnrolled={auth.biometricEnrolled}
            onBiometricEnrolledChange={auth.setBiometricEnrolled}
          />
        );
      default:
        return <EmptyDetail />;
    }
  };

  return (
    <div className="flex min-h-dvh bg-base">
      <Sidebar
        activeCategory={search.activeCategory}
        onCategoryChange={search.setActiveCategory}
        showFavoritesOnly={search.showFavoritesOnly}
        onFavoritesToggle={search.setShowFavoritesOnly}
        onAddEntry={handleAddEntry}
        onOpenSettings={handleOpenSettings}
        onOpenHealth={handleOpenHealth}
        onLock={auth.lock}
        entryCounts={entryCounts}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className={`flex flex-1 h-dvh overflow-hidden transition-[margin] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${sidebarCollapsed ? 'ml-16' : 'ml-60'} max-lg:ml-16 max-md:ml-0 max-md:flex-col max-md:pb-14`}>
        <div className={`w-[340px] min-w-[340px] border-r border-border bg-surface overflow-hidden flex flex-col max-lg:w-[300px] max-lg:min-w-[300px] max-md:w-full max-md:min-w-full max-md:border-r-0 max-md:h-full ${!showListOnly ? 'max-md:hidden' : ''}`}>
          <EntryList
            entries={search.filtered}
            query={search.query}
            onQueryChange={search.setQuery}
            selectedId={vault.selectedId}
            onSelect={handleSelectEntry}
            onToggleFavorite={vault.toggleFavorite}
            sortBy={search.sortBy}
            onSortChange={search.setSortBy}
            loading={vault.loading}
            activeCategory={search.activeCategory}
            showFavoritesOnly={search.showFavoritesOnly}
          />
        </div>

        <div className={`flex-1 overflow-hidden bg-base max-md:fixed max-md:inset-0 max-md:z-20 max-md:animate-slide-in-right ${showListOnly ? 'max-md:hidden' : ''}`}>
          {renderRightPanel()}
        </div>
      </main>

      <BottomNav
        activeTab={mobileTab}
        onTabChange={handleMobileTabChange}
        onAddEntry={handleAddEntry}
        showFavoritesOnly={search.showFavoritesOnly}
        onFavoritesToggle={search.setShowFavoritesOnly}
      />
    </div>
  );
}

function EmptyDetail() {
  return (
    <div className="hidden md:flex flex-col items-center justify-center h-full gap-3 px-8">
      <div className="w-12 h-12 rounded-2xl bg-accent-subtle flex items-center justify-center text-accent">
        <Shield size={22} strokeWidth={1.5} />
      </div>
      <p className="text-sm text-txt-secondary text-center">Select an entry to view details</p>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
