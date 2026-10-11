/**
 * Screen 1: Native Splash Screen
 * Lightweight, dark navy-blue background with glowing Mahi Crick Pro logo
 */

import React, { useEffect } from 'react';
import { MahiLogo } from '../brand/MahiLogo';

interface SplashScreenProps {
  onComplete: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  durationMs = 600,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [onComplete, durationMs]);

  return (
    <div
      onClick={onComplete}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070c1e] text-white cursor-pointer select-none"
    >
      {/* Background Radial Glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-700/20 via-amber-500/15 to-transparent blur-3xl pointer-events-none" />

      {/* Centered Branded Logo */}
      <div className="relative z-10 flex flex-col items-center animate-fade-in">
        <MahiLogo size="xl" showText={true} />

        <div className="mt-8 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
            Initializing Engine
          </span>
        </div>
      </div>
    </div>
  );
};
