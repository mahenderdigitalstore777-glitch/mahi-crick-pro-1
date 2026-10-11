/**
 * Bottom Navigation Bar
 * 5-tab ergonomic thumb-zone navigation with elevated primary Score action
 */

import React from 'react';
import { Home, History, Play, Shield, Users } from 'lucide-react';
import { NavScreenId } from './NavigationDrawer';

interface BottomNavigationBarProps {
  activeScreen: NavScreenId;
  onSelectScreen: (screen: NavScreenId) => void;
  hasActiveMatch: boolean;
  hidden?: boolean;
}

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  activeScreen,
  onSelectScreen,
  hasActiveMatch,
  hidden = false,
}) => {
  if (hidden) return null;

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-30 bg-[#091124]/95 backdrop-blur-md border-t border-slate-800/80 max-w-full pb-safe select-none"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
        {/* 1. Home */}
        <button
          onClick={() => onSelectScreen('home')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeScreen === 'home' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* 2. Matches */}
        <button
          onClick={() => onSelectScreen('match_history')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeScreen === 'match_history'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-5 h-5 mb-1" />
          <span className="text-[10px] tracking-tight">Matches</span>
        </button>

        {/* 3. Score (Prominent Center CTA) */}
        <div className="flex items-center justify-center -mt-5">
          <button
            onClick={() => onSelectScreen(hasActiveMatch ? 'continue_match' : 'new_match')}
            aria-label={hasActiveMatch ? 'Continue Live Match' : 'Start New Match'}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex flex-col items-center justify-center shadow-lg shadow-amber-500/25 border-4 border-[#070c1e] active:scale-95 transition-transform"
          >
            <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
            <span className="text-[9px] font-black uppercase tracking-tighter leading-none mt-0.5">
              {hasActiveMatch ? 'Live' : 'Score'}
            </span>
          </button>
        </div>

        {/* 4. Teams */}
        <button
          onClick={() => onSelectScreen('teams')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeScreen === 'teams' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-5 h-5 mb-1" />
          <span className="text-[10px] tracking-tight">Teams</span>
        </button>

        {/* 5. Players */}
        <button
          onClick={() => onSelectScreen('players')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            activeScreen === 'players' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5 mb-1" />
          <span className="text-[10px] tracking-tight">Players</span>
        </button>
      </div>
    </nav>
  );
};
