'use client';

import React, { memo, useState, useEffect } from 'react';
import { LayoutGrid, Users, Clock, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  activeTab: 'board' | 'collaborators' | 'activity' | 'settings';
  onTabChange: (tab: 'board' | 'collaborators' | 'activity' | 'settings') => void;
  isOwner: boolean;
  onCloseMobile?: () => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOwner,
  onCloseMobile,
  className = '',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }
    setMounted(true);
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('sidebar_collapsed', String(nextState));
  };

  const tabs = [
    { id: 'board' as const, icon: LayoutGrid, label: 'Board' },
    { id: 'collaborators' as const, icon: Users, label: 'Team' },
    { id: 'activity' as const, icon: Clock, label: 'Activity' },
    ...(isOwner ? [{ id: 'settings' as const, icon: Settings, label: 'Settings' }] : []),
  ];

  const sidebarWidth = onCloseMobile ? 'w-full' : (mounted && isCollapsed ? 'w-16' : 'w-56');

  return (
    <aside
      className={`border-r border-white/10 bg-slate-900/20 backdrop-blur-md flex flex-col p-3 shrink-0 shadow-lg shadow-black/10 transition-width duration-300 ${sidebarWidth} ${className}`}
    >
      {/* Top Collapse Action Button (Desktop Only) */}
      {!onCloseMobile && (
        <div className={`hidden md:flex mb-4 ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
          <button
            onClick={toggleCollapse}
            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-slate-400 hover:text-white cursor-pointer active:scale-95 shadow-sm"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="space-y-1.5 flex-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center rounded-xl transition-all text-left font-semibold text-xs relative group ${
                isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'
              } ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {(!mounted || !isCollapsed) && <span>{tab.label}</span>}

              {/* Tooltip for collapsed mode */}
              {mounted && isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 border border-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1.5 transition-all duration-200 shadow-xl z-50 whitespace-nowrap">
                  {tab.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section (Branding & Theme switcher) */}
      <div className="mt-auto pt-4 flex flex-col gap-3">
        {(!mounted || !isCollapsed) && (
          <div className="px-3 py-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2 shadow-inner">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5 truncate">Coddee</p>
              <p className="text-[10px] text-slate-400 truncate">Project management</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default memo(Sidebar);