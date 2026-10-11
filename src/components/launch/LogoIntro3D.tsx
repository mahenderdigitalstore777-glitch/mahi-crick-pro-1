/**
 * Screen 2: Animated 3D Logo Intro
 * 1. Cricket ball appears with rotation
 * 2. Logo emerges smoothly
 * 3. 3D ball tumble & rotation
 * 4. Logo settles and transitions to Home
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CricketBall3D } from '../brand/CricketBall3D';
import { MahiLogo } from '../brand/MahiLogo';
import { FastForward } from 'lucide-react';

interface LogoIntro3DProps {
  onFinish: () => void;
  isFirstLaunch?: boolean;
}

export const LogoIntro3D: React.FC<LogoIntro3DProps> = ({
  onFinish,
  isFirstLaunch = true,
}) => {
  const [stage, setStage] = useState<number>(1); // 1: ball appears, 2: logo emerges, 3: settled

  useEffect(() => {
    // Timing: first launch is ~3s total; subsequent is ~1.5s total
    const stage2Delay = isFirstLaunch ? 800 : 400;
    const stage3Delay = isFirstLaunch ? 2000 : 1000;
    const completeDelay = isFirstLaunch ? 3200 : 1600;

    const t1 = setTimeout(() => setStage(2), stage2Delay);
    const t2 = setTimeout(() => setStage(3), stage3Delay);
    const t3 = setTimeout(() => onFinish(), completeDelay);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isFirstLaunch, onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070c1e] text-slate-100 overflow-hidden select-none">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute inset-0 bg-radial from-blue-900/30 via-[#070c1e] to-[#040711] pointer-events-none" />

      {/* Skip Button */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={onFinish}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
        >
          <span>Skip</span>
          <FastForward className="w-3.5 h-3.5 text-amber-400" />
        </button>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Animated Cricket Ball */}
        <AnimatePresence>
          {stage < 3 && (
            <motion.div
              initial={{ scale: 0.2, opacity: 0, y: -60, rotate: -90 }}
              animate={{
                scale: stage === 2 ? 1.15 : 1,
                opacity: 1,
                y: 0,
                rotate: stage === 2 ? 360 : 180,
              }}
              exit={{ scale: 0.6, opacity: 0, y: -40 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6 drop-shadow-[0_12px_24px_rgba(220,38,38,0.45)]"
            >
              <CricketBall3D size={stage === 2 ? 140 : 110} rotationSpeed={0.045} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logo Emergence */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{
            opacity: stage >= 2 ? 1 : 0,
            scale: stage >= 2 ? 1 : 0.85,
            y: stage >= 2 ? 0 : 30,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center"
        >
          <MahiLogo size={stage === 3 ? 'xl' : 'lg'} showText={true} />
        </motion.div>

        {/* Progress bar / subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: stage >= 2 ? 1 : 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 flex flex-col items-center gap-2"
        >
          <span className="text-xs font-medium tracking-widest text-slate-400 uppercase">
            {stage === 1 && 'Pitching seam...'}
            {stage === 2 && 'Calibrating scoring engine...'}
            {stage === 3 && 'Ready to play'}
          </span>
          <div className="w-36 h-1 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-blue-500 rounded-full"
              initial={{ width: '15%' }}
              animate={{ width: stage === 1 ? '35%' : stage === 2 ? '80%' : '100%' }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
