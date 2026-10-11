/**
 * Mahi Crick Pro - Branded Emblem & Logo Mark
 */

import React from 'react';

interface MahiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const MahiLogo: React.FC<MahiLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { icon: 32, textClass: 'text-base', subClass: 'text-[9px]' },
    md: { icon: 48, textClass: 'text-xl', subClass: 'text-[11px]' },
    lg: { icon: 84, textClass: 'text-3xl', subClass: 'text-xs' },
    xl: { icon: 120, textClass: 'text-4xl', subClass: 'text-sm' },
  };

  const dim = sizeMap[size].icon;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Emblem SVG */}
      <div
        className="relative shrink-0 flex items-center justify-center"
        style={{ width: dim, height: dim }}
      >
        {/* Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/30 to-blue-600/30 blur-md pointer-events-none" />

        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_4px_12px_rgba(217,119,6,0.35)] relative z-10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="shieldGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0B132B" />
              <stop offset="0.5" stopColor="#1C2541" />
              <stop offset="1" stopColor="#0B132B" />
            </linearGradient>

            <linearGradient id="goldGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE047" />
              <stop offset="0.5" stopColor="#F59E0B" />
              <stop offset="1" stopColor="#B45309" />
            </linearGradient>

            <linearGradient id="ballGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#DC2626" />
              <stop offset="0.7" stopColor="#991B1B" />
              <stop offset="1" stopColor="#450A0A" />
            </linearGradient>
          </defs>

          {/* Shield Outline */}
          <path
            d="M50 4L88 18V50C88 74 50 94 50 94C50 94 12 74 12 50V18L50 4Z"
            fill="url(#shieldGrad)"
            stroke="url(#goldGrad)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Inner Shield Inset */}
          <path
            d="M50 11L81 23V49C81 69 50 86 50 86C50 86 19 69 19 49V23L50 11Z"
            stroke="#2563EB"
            strokeWidth="1.5"
            strokeOpacity="0.6"
            fill="none"
          />

          {/* Crossed Bats Silhouette */}
          <g stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" opacity="0.85">
            {/* Bat 1 */}
            <line x1="26" y1="72" x2="74" y2="28" />
            <line x1="74" y1="28" x2="78" y2="24" strokeWidth="4" />
            {/* Bat 2 */}
            <line x1="74" y1="72" x2="26" y2="28" />
            <line x1="26" y1="28" x2="22" y2="24" strokeWidth="4" />
          </g>

          {/* Wickets & Bails in Center */}
          <g stroke="url(#goldGrad)" strokeWidth="2" strokeLinecap="round">
            <line x1="42" y1="38" x2="42" y2="64" />
            <line x1="50" y1="36" x2="50" y2="64" />
            <line x1="58" y1="38" x2="58" y2="64" />
            {/* Bails */}
            <line x1="40" y1="37" x2="50" y2="35" strokeWidth="2.5" />
            <line x1="50" y1="35" x2="60" y2="37" strokeWidth="2.5" />
          </g>

          {/* Cricket Ball in Center Foreground */}
          <circle cx="50" cy="54" r="14" fill="url(#ballGrad)" stroke="#F59E0B" strokeWidth="1" />
          
          {/* Cricket Ball Curved Seam */}
          <path
            d="M40 46 Q50 54 60 62"
            stroke="#FEF08A"
            strokeWidth="1.5"
            strokeDasharray="2 1.5"
            fill="none"
          />

          {/* Crown / Star at Top */}
          <polygon
            points="50,15 52,20 57,20 53,23 55,28 50,25 45,28 47,23 43,20 48,20"
            fill="url(#goldGrad)"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight text-white ${sizeMap[size].textClass}`}
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              MAHI <span className="text-amber-400">CRICK</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 uppercase tracking-wider">
              PRO
            </span>
          </div>
          <span
            className={`font-medium tracking-widest text-slate-400 uppercase ${sizeMap[size].subClass}`}
          >
            Offline Cricket Scorer
          </span>
        </div>
      )}
    </div>
  );
};
