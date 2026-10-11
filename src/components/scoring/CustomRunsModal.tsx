/**
 * Custom Runs & Overthrows Modal
 * Enables recording any non-negative integer run value with proper extra attribution
 */

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { ExtraType } from '../../types/cricket';

interface CustomRunsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (runsBatter: number, runsExtra: number, extraType: ExtraType, isOverthrow: boolean) => void;
}

export const CustomRunsModal: React.FC<CustomRunsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [runsValue, setRunsValue] = useState<number>(7);
  const [runType, setRunType] = useState<ExtraType>('none');
  const [isOverthrow, setIsOverthrow] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const val = Math.max(0, Number(runsValue));
    if (runType === 'none') {
      onSubmit(val, 0, 'none', isOverthrow);
    } else if (runType === 'wide' || runType === 'noball') {
      // 1 penalty run + (val - 1) additional runs if applicable
      const extraRuns = Math.max(1, val);
      onSubmit(0, extraRuns, runType, isOverthrow);
    } else {
      // byes, legbyes, penalty
      onSubmit(0, val, runType, isOverthrow);
    }
    onClose();
  };

  const presetValues = [5, 7, 8, 10, 12, 15];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div onClick={onClose} className="fixed inset-0 bg-black/75 backdrop-blur-xs" />
      <div className="relative w-full max-w-sm bg-[#0a1228] border border-slate-800 rounded-2xl shadow-2xl p-5 z-10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Record Custom Runs</h3>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Number Input & Presets */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Total Run Value
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={100}
              value={runsValue}
              onChange={(e) => setRunsValue(Math.max(0, Number(e.target.value)))}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono font-bold text-lg focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto py-1">
            {presetValues.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setRunsValue(val)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-mono font-bold text-slate-300"
              >
                +{val}
              </button>
            ))}
          </div>
        </div>

        {/* Scoring Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Attribution / Extra Type
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setRunType('none')}
              className={`p-2 rounded-xl border font-semibold text-left transition-all ${
                runType === 'none'
                  ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              Batter Runs
            </button>
            <button
              type="button"
              onClick={() => setRunType('wide')}
              className={`p-2 rounded-xl border font-semibold text-left transition-all ${
                runType === 'wide'
                  ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              Wide + Runs
            </button>
            <button
              type="button"
              onClick={() => setRunType('noball')}
              className={`p-2 rounded-xl border font-semibold text-left transition-all ${
                runType === 'noball'
                  ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              No Ball + Runs
            </button>
            <button
              type="button"
              onClick={() => setRunType('bye')}
              className={`p-2 rounded-xl border font-semibold text-left transition-all ${
                runType === 'bye'
                  ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              Byes
            </button>
            <button
              type="button"
              onClick={() => setRunType('legbye')}
              className={`p-2 rounded-xl border font-semibold text-left transition-all ${
                runType === 'legbye'
                  ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              Leg Byes
            </button>
            <button
              type="button"
              onClick={() => setRunType('penalty')}
              className={`p-2 rounded-xl border font-semibold text-left transition-all ${
                runType === 'penalty'
                  ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              Penalty Runs
            </button>
          </div>
        </div>

        {/* Overthrow Toggle */}
        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
          <input
            type="checkbox"
            checked={isOverthrow}
            onChange={(e) => setIsOverthrow(e.target.checked)}
            className="w-4 h-4 rounded text-amber-400 bg-slate-900 border-slate-800"
          />
          <span>Include overthrow event tag</span>
        </label>

        {/* Submit */}
        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold"
          >
            Apply {runsValue} Runs
          </button>
        </div>
      </div>
    </div>
  );
};
