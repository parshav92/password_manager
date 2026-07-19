// Bottom navigation for mobile — flat bar, no floating FAB

import { LayoutGrid, Star, Plus, Settings, Activity } from 'lucide-react';

export default function BottomNav({
  activeTab,
  onTabChange,
  onAddEntry,
  showFavoritesOnly,
  onFavoritesToggle,
}) {
  return (
    <nav
      className="hidden max-md:flex fixed bottom-0 left-0 right-0 h-14 bg-surface/95 backdrop-blur-md border-t border-border z-10 items-center justify-around px-1 pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Main navigation"
    >
      <NavItem
        icon={<LayoutGrid size={20} />}
        label="Vault"
        active={activeTab === 'vault' && !showFavoritesOnly}
        onClick={() => { onTabChange('vault'); onFavoritesToggle(false); }}
        id="bnav-vault"
      />
      <NavItem
        icon={<Star size={20} />}
        label="Favorites"
        active={showFavoritesOnly}
        onClick={() => onFavoritesToggle(!showFavoritesOnly)}
        id="bnav-favorites"
      />
      <NavItem
        icon={<Plus size={20} strokeWidth={2.25} />}
        label="Add"
        active={false}
        onClick={onAddEntry}
        id="bnav-add"
        accent
      />
      <NavItem
        icon={<Activity size={20} />}
        label="Health"
        active={activeTab === 'health'}
        onClick={() => onTabChange('health')}
        id="bnav-health"
      />
      <NavItem
        icon={<Settings size={20} />}
        label="Settings"
        active={activeTab === 'settings'}
        onClick={() => onTabChange('settings')}
        id="bnav-settings"
      />
    </nav>
  );
}

function NavItem({ icon, label, active, onClick, id, accent }) {
  return (
    <button
      type="button"
      className={`flex flex-col items-center gap-0.5 py-1.5 px-3 text-[10px] font-medium bg-transparent border-none cursor-pointer transition-colors duration-150 rounded-lg min-w-[52px] active:scale-95
        ${accent ? 'text-accent' : active ? 'text-accent' : 'text-txt-tertiary'}
      `}
      onClick={onClick}
      id={id}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
