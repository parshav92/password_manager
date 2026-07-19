// Bottom navigation for mobile

import { LayoutGrid, Star, Plus, Settings, Activity } from 'lucide-react';

export default function BottomNav({
  activeTab,
  onTabChange,
  onAddEntry,
  showFavoritesOnly,
  onFavoritesToggle,
}) {
  return (
    <nav className="hidden max-md:flex fixed bottom-0 left-0 right-0 h-[60px] bg-surface border-t border-border z-10 items-center justify-around px-1 pb-[env(safe-area-inset-bottom,0px)]" aria-label="Main navigation">
      <NavItem
        icon={<LayoutGrid size={19} />}
        label="Vault"
        active={activeTab === 'vault' && !showFavoritesOnly}
        onClick={() => { onTabChange('vault'); onFavoritesToggle(false); }}
        id="bnav-vault"
      />
      <NavItem
        icon={<Star size={19} />}
        label="Favorites"
        active={showFavoritesOnly}
        onClick={() => onFavoritesToggle(!showFavoritesOnly)}
        id="bnav-favorites"
      />

      {/* FAB */}
      <button
        className="flex items-center justify-center w-11 h-11 rounded-full border-none bg-accent text-white cursor-pointer shadow-[0_4px_16px_var(--color-accent-muted)] transition-all duration-200 -translate-y-2 active:scale-95 active:-translate-y-1"
        onClick={onAddEntry}
        aria-label="Add new entry"
        id="bnav-add"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

      <NavItem
        icon={<Activity size={19} />}
        label="Health"
        active={activeTab === 'health'}
        onClick={() => onTabChange('health')}
        id="bnav-health"
      />
      <NavItem
        icon={<Settings size={19} />}
        label="Settings"
        active={activeTab === 'settings'}
        onClick={() => onTabChange('settings')}
        id="bnav-settings"
      />
    </nav>
  );
}

function NavItem({ icon, label, active, onClick, id }) {
  return (
    <button
      className={`flex flex-col items-center gap-0.5 py-1.5 px-3 text-[10px] font-medium bg-transparent border-none cursor-pointer transition-all duration-150 rounded-lg min-w-[52px] active:scale-95 ${active ? 'text-accent' : 'text-txt-tertiary'}`}
      onClick={onClick}
      id={id}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
