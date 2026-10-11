/**
 * Top App Bar
 * 1-row balanced header with hamburger, screen title, search, and notifications
 */

import React from 'react';
import { Menu, Search, Bell, Smartphone, Monitor } from 'lucide-react';
import { MahiLogo } from '../brand/MahiLogo';

interface TopAppBarProps {
  title: string;
  onOpenDrawer: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  deviceFrameMode: boolean;
  onToggleDeviceFrame: () => void;
  isScoringScreen?: boolean;
  onOpenApkGuide?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  onOpenDrawer,
  onOpenSearch,
  onOpenNotifications,
  unreadCount,
  deviceFrameMode,
  onToggleDeviceFrame,
  isScoringScreen = false,
  onOpenApkGuide,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#091124]/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-4 h-14 flex items-center justify-between select-none">
      {/* Left Slot: Menu + Brand */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={onOpenDrawer}
          aria-label="Open navigation drawer"
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-200 active:scale-95 transition-all"
        >
          <Menu className="w-5 h-5 text-amber-400" />
        </button>

        <div className="flex items-center gap-2">
          <MahiLogo size="sm" showText={false} />
          <span className="hidden sm:inline-block font-bold text-sm text-slate-100 tracking-tight">
            Mahi Crick <span className="text-amber-400">Pro</span>
          </span>
        </div>
      </div>

      {/* Center Slot: Screen Title */}
      <div className="flex-1 text-center px-2">
        <h1 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight truncate">
          {title}
        </h1>
      </div>

      {/* Right Slot: Actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Toggle Phone Frame / Desktop view on larger screens */}
        <button
          onClick={onToggleDeviceFrame}
          title={deviceFrameMode ? 'Switch to Full Screen View' : 'Switch to Android Frame Preview'}
          aria-label="Toggle Android frame view"
          className="hidden md:flex w-9 h-9 items-center justify-center rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          {deviceFrameMode ? (
            <Monitor className="w-4 h-4 text-blue-400" />
          ) : (
            <Smartphone className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Install / APK Guide Button */}
        {onOpenApkGuide && (
          <button
            onClick={onOpenApkGuide}
            title="Install App on Phone / Download APK"
            aria-label="Install App or APK"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 text-xs font-bold transition-all cursor-pointer active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install / APK</span>
          </button>
        )}

        {/* Search */}
        <button
          onClick={onOpenSearch}
          aria-label="Search teams and players"
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          aria-label="View notifications"
          className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-[#091124]" />
          )}
        </button>
      </div>
    </header>
  );
};
