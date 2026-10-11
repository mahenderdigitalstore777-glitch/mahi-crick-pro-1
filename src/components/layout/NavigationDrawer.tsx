/**
 * Left Navigation Drawer
 * Material 3 side drawer with complete app destinations and information sections
 */

import React, { useEffect } from 'react';
import {
  Home,
  PlusCircle,
  PlayCircle,
  History,
  Shield,
  Users,
  FileSpreadsheet,
  BarChart3,
  Settings,
  HelpCircle,
  Info,
  Lock,
  Database,
  Tv,
  X,
} from 'lucide-react';
import { MahiLogo } from '../brand/MahiLogo';
import { TournamentCupIcon } from '../brand/CricketIcons';

export type NavScreenId =
  | 'home'
  | 'new_match'
  | 'continue_match'
  | 'tournaments'
  | 'spectator_live'
  | 'match_history'
  | 'teams'
  | 'players'
  | 'scorecards'
  | 'statistics'
  | 'settings'
  | 'help_guide'
  | 'about'
  | 'privacy'
  | 'data_mgmt';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeScreen: NavScreenId;
  onSelectScreen: (screen: NavScreenId) => void;
  hasActiveMatch: boolean;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeScreen,
  onSelectScreen,
  hasActiveMatch,
}) => {
  // Support Escape key to close drawer (Android Back behavior in web)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNavigate = (screen: NavScreenId) => {
    onSelectScreen(screen);
    onClose();
  };

  const navItems: { id: NavScreenId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'new_match', label: 'New Match', icon: <PlusCircle className="w-5 h-5 text-amber-400" /> },
    {
      id: 'continue_match',
      label: 'Scorer Console',
      icon: <PlayCircle className="w-5 h-5 text-emerald-400" />,
      badge: hasActiveMatch ? 'LIVE' : undefined,
    },
    {
      id: 'tournaments',
      label: 'Tournaments (टूर्नामेंट)',
      icon: <TournamentCupIcon className="w-5 h-5 text-blue-400" />,
    },
    {
      id: 'spectator_live',
      label: 'Fan Live Broadcast (दर्शक)',
      icon: <Tv className="w-5 h-5 text-purple-400" />,
      badge: hasActiveMatch ? 'TV' : undefined,
    },
    { id: 'match_history', label: 'Match History', icon: <History className="w-5 h-5" /> },
    { id: 'teams', label: 'Teams', icon: <Shield className="w-5 h-5" /> },
    { id: 'players', label: 'Players', icon: <Users className="w-5 h-5" /> },
    { id: 'scorecards', label: 'Scorecards', icon: <FileSpreadsheet className="w-5 h-5" /> },
    { id: 'statistics', label: 'Statistics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const secondaryItems: { id: NavScreenId; label: string; icon: React.ReactNode }[] = [
    { id: 'help_guide', label: 'Help & Rules Guide', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'about', label: 'About Mahi Crick Pro', icon: <Info className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy Information', icon: <Lock className="w-4 h-4" /> },
    { id: 'data_mgmt', label: 'Data Management & Backup', icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex select-none">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Drawer Container */}
      <aside className="relative w-72 sm:w-80 max-w-[85vw] h-full bg-[#0a1228] border-r border-slate-800 flex flex-col z-10 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="p-5 bg-gradient-to-b from-[#0f1b3b] to-[#0a1228] border-b border-slate-800 flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <MahiLogo size="sm" showText={true} />
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400">
                v1.0.0 Pro • Android Release
              </span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-900/60 text-emerald-300 rounded font-mono">
                Local-First
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="w-8 h-8 rounded-lg bg-slate-800/60 hover:bg-slate-700 flex items-center justify-center text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Navigation */}
        <div className="p-3 flex-1 flex flex-col gap-1">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Main Menu
          </div>

          {navItems.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-400/15 text-amber-400 border border-amber-400/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-amber-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500 text-slate-950 uppercase animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <hr className="my-3 border-slate-800" />

          {/* Additional Sections */}
          <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Information & Data
          </div>

          {secondaryItems.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80 bg-[#070d1e] text-[11px] text-slate-400 flex flex-col gap-0.5">
          <p className="font-semibold text-slate-300">Offline SQLite / Local Storage</p>
          <p>No internet required • Zero telemetry</p>
        </div>
      </aside>
    </div>
  );
};
