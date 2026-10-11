/**
 * Wagon Wheel & Shot Direction Selector
 * Visual 360-degree cricket ground showing 8 fielding sectors for shot placement
 */

import React from 'react';
import { ShotDirection } from '../../types/cricket';

interface WagonWheelGroundProps {
  selectedDirection?: ShotDirection;
  onSelectDirection: (dir: ShotDirection) => void;
  interactive?: boolean;
  className?: string;
}

export const WagonWheelGround: React.FC<WagonWheelGroundProps> = ({
  selectedDirection,
  onSelectDirection,
  interactive = true,
  className = '',
}) => {
  const sectors: {
    id: ShotDirection;
    name: string;
    short: string;
    angle: number; // in degrees from top
    color: string;
  }[] = [
    { id: 'straight', name: 'Straight / Long Off', short: 'Straight', angle: 0, color: '#3B82F6' },
    { id: 'long_off', name: 'Deep Extra Cover', short: 'Long Off', angle: 45, color: '#0EA5E9' },
    { id: 'cover', name: 'Extra Cover', short: 'Cover', angle: 90, color: '#10B981' },
    { id: 'point', name: 'Backward Point', short: 'Point', angle: 135, color: '#EAB308' },
    { id: 'third_man', name: 'Third Man', short: 'Third Man', angle: 180, color: '#F97316' },
    { id: 'fine_leg', name: 'Fine Leg', short: 'Fine Leg', angle: 225, color: '#EF4444' },
    { id: 'square_leg', name: 'Deep Square Leg', short: 'Square Leg', angle: 270, color: '#EC4899' },
    { id: 'mid_wicket', name: 'Deep Mid-Wicket', short: 'Mid-Wkt', angle: 315, color: '#A855F7' },
  ];

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Visual Oval Ground Canvas */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-radial from-[#1e3a24] via-[#142819] to-[#0a160d] border-2 border-emerald-500/40 shadow-inner flex items-center justify-center overflow-hidden">
        {/* 30-yard circle */}
        <div className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-dashed border-emerald-400/30 pointer-events-none" />

        {/* Cricket Pitch in Center */}
        <div className="absolute w-3.5 h-12 bg-amber-200/80 rounded-xs shadow-xs pointer-events-none" />

        {/* Batter / Crease marker */}
        <div className="absolute top-[52%] w-6 h-0.5 bg-white/70 pointer-events-none" />

        {/* Sectors Buttons / Markers */}
        {sectors.map((sec) => {
          const isSelected = selectedDirection === sec.id;
          // Calculate polar position on radius = 72px
          const rad = (sec.angle - 90) * (Math.PI / 180);
          const r = 70;
          const leftPercent = 50 + (Math.cos(rad) * r) / 1.05;
          const topPercent = 50 + (Math.sin(rad) * r) / 1.05;

          return (
            <button
              key={sec.id}
              type="button"
              disabled={!interactive}
              onClick={() => onSelectDirection(sec.id)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight transition-all z-10 ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 font-black scale-110 shadow-lg shadow-amber-400/40 ring-2 ring-white'
                  : 'bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-slate-700/60'
              }`}
              style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
            >
              {sec.short}
            </button>
          );
        })}
      </div>

      {/* Selected direction indicator badge */}
      <div className="mt-2 text-xs text-slate-300 flex items-center gap-1.5 font-medium">
        <span className="text-slate-400 text-[11px]">Shot Region:</span>
        <span className="font-bold text-amber-400">
          {sectors.find((s) => s.id === selectedDirection)?.name || 'Tap on ground to select'}
        </span>
      </div>
    </div>
  );
};
