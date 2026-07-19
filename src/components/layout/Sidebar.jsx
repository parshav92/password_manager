// Sidebar — clean browse + categories

import {
  Shield, Star, LayoutGrid, Settings,
  LogOut, ChevronLeft, ChevronRight, Plus, Activity
} from 'lucide-react';
import {
  Users, Mail, Landmark, Briefcase, ShoppingBag,
  Gamepad2, Code, MoreHorizontal
} from 'lucide-react';
import { CATEGORIES } from '../../utils/constants';

const categoryIcons = {
  Users, Mail, Landmark, Briefcase, ShoppingBag,
  Gamepad2, Code, MoreHorizontal,
};

export default function Sidebar({
  activeCategory,
  onCategoryChange,
  showFavoritesOnly,
  onFavoritesToggle,
  onAddEntry,
  onOpenSettings,
  onOpenHealth,
  onLock,
  entryCounts,
  collapsed,
  onToggleCollapse,
}) {
  const totalCount = Object.values(entryCounts || {}).reduce((a, b) => a + b, 0);

  return (
    <aside className={`fixed left-0 top-0 bottom-0 bg-surface border-r border-border flex flex-col z-10 transition-[width] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden max-md:hidden ${collapsed ? 'w-16' : 'w-60'} max-lg:w-16`}>
      <div className={`flex items-center min-h-14 px-3 ${collapsed ? 'justify-center' : 'justify-between px-4'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 max-lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white shrink-0">
              <Shield size={16} strokeWidth={1.75} />
            </div>
            <span className="text-[15px] font-bold text-txt tracking-[-0.03em] whitespace-nowrap">VaultSoft</span>
          </div>
        )}
        <button
          type="button"
          className="flex items-center justify-center w-7 h-7 border-none bg-transparent text-txt-tertiary cursor-pointer rounded-md transition-colors duration-150 shrink-0 hover:bg-overlay hover:text-txt max-lg:hidden"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <button
        type="button"
        className={`flex items-center justify-center gap-2 mx-3 mb-3 py-2 text-sm font-semibold text-white bg-accent rounded-lg cursor-pointer transition-colors duration-150 whitespace-nowrap hover:bg-accent-hover ${collapsed ? 'mx-2 px-0' : ''} max-lg:mx-2 max-lg:px-0`}
        onClick={onAddEntry}
        id="sidebar-add-button"
      >
        <Plus size={16} />
        {!collapsed && <span className="max-lg:hidden">New entry</span>}
      </button>

      <nav className="flex-1 overflow-y-auto px-2 max-lg:px-1.5">
        <div className="mb-4">
          {!collapsed && <span className="block px-2.5 py-1.5 text-[11px] font-semibold text-txt-tertiary uppercase tracking-wider max-lg:hidden">Browse</span>}

          <SidebarItem
            icon={<LayoutGrid size={16} />}
            label="All items"
            count={totalCount}
            active={activeCategory === 'all' && !showFavoritesOnly}
            onClick={() => { onCategoryChange('all'); onFavoritesToggle(false); }}
            collapsed={collapsed}
          />
          <SidebarItem
            icon={<Star size={16} />}
            label="Favorites"
            active={showFavoritesOnly}
            onClick={() => onFavoritesToggle(!showFavoritesOnly)}
            collapsed={collapsed}
          />
        </div>

        <div className="mb-3">
          {!collapsed && <span className="block px-2.5 py-1.5 text-[11px] font-semibold text-txt-tertiary uppercase tracking-wider max-lg:hidden">Categories</span>}

          {CATEGORIES.map(cat => {
            const Icon = categoryIcons[cat.icon] || MoreHorizontal;
            const count = entryCounts?.[cat.id] || 0;
            return (
              <SidebarItem
                key={cat.id}
                icon={<Icon size={16} style={{ color: cat.color }} />}
                label={cat.label}
                count={count > 0 ? count : null}
                active={activeCategory === cat.id && !showFavoritesOnly}
                onClick={() => { onCategoryChange(cat.id); onFavoritesToggle(false); }}
                collapsed={collapsed}
              />
            );
          })}
        </div>
      </nav>

      <div className="border-t border-border p-2">
        <SidebarItem icon={<Activity size={16} />} label="Vault health" onClick={onOpenHealth} collapsed={collapsed} />
        <SidebarItem icon={<Settings size={16} />} label="Settings" onClick={onOpenSettings} collapsed={collapsed} />
        <SidebarItem icon={<LogOut size={16} />} label="Lock vault" onClick={onLock} collapsed={collapsed} danger />
      </div>
    </aside>
  );
}

function SidebarItem({ icon, label, count, active, onClick, collapsed, danger }) {
  return (
    <button
      type="button"
      className={`flex items-center gap-2.5 w-full py-2 px-2.5 text-[13px] bg-transparent border-none rounded-lg cursor-pointer transition-colors duration-150 whitespace-nowrap text-left
        ${active ? 'bg-accent-muted text-accent font-medium' : 'text-txt-secondary hover:bg-overlay hover:text-txt'}
        ${danger && !active ? 'hover:!text-bad hover:!bg-bad-muted' : ''}
        ${collapsed ? 'justify-center px-0' : ''}
        max-lg:justify-center max-lg:px-0
      `}
      onClick={onClick}
    >
      {icon}
      {!collapsed && (
        <>
          <span className="flex-1 max-lg:hidden">{label}</span>
          {count != null && (
            <span className={`text-[11px] font-medium tabular-nums max-lg:hidden ${active ? 'text-accent' : 'text-txt-tertiary'}`}>
              {count}
            </span>
          )}
        </>
      )}
    </button>
  );
}
