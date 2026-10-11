/**
 * Wicket Dismissal Modal
 * Full dismissal capture conforming to MCC cricket laws
 */

import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Player, DismissalType } from '../../types/cricket';

interface WicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  striker: Player;
  nonStriker: Player;
  bowler: Player;
  fieldingPlayers: Player[];
  availableBatters: Player[];
  onConfirmWicket: (
    dismissalType: DismissalType,
    playerDismissedId: string,
    fielderId?: string,
    newBatterId?: string
  ) => void;
}

export const WicketModal: React.FC<WicketModalProps> = ({
  isOpen,
  onClose,
  striker,
  nonStriker,
  bowler,
  fieldingPlayers,
  availableBatters,
  onConfirmWicket,
}) => {
  const [dismissalType, setDismissalType] = useState<DismissalType>('bowled');
  const [dismissedBatterId, setDismissedBatterId] = useState<string>(striker.id);
  const [fielderId, setFielderId] = useState<string>(fieldingPlayers[0]?.id || '');
  const [newBatterId, setNewBatterId] = useState<string>(availableBatters[0]?.id || '');

  if (!isOpen) return null;

  const needsFielder = dismissalType === 'caught' || dismissalType === 'run_out' || dismissalType === 'stumped';
  const hasRemainingBatters = availableBatters.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmWicket(
      dismissalType,
      dismissedBatterId,
      needsFielder && fielderId ? fielderId : undefined,
      hasRemainingBatters ? newBatterId : undefined
    );
    onClose();
  };

  const dismissalOptions: { type: DismissalType; label: string }[] = [
    { type: 'bowled', label: 'Bowled' },
    { type: 'caught', label: 'Caught' },
    { type: 'lbw', label: 'LBW' },
    { type: 'run_out', label: 'Run Out' },
    { type: 'stumped', label: 'Stumped' },
    { type: 'hit_wicket', label: 'Hit Wicket' },
    { type: 'retired_hurt', label: 'Retired Hurt' },
    { type: 'obstructing_field', label: 'Obstructing Field' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-xs" />
      <div className="relative w-full max-w-md bg-[#0a1228] border border-rose-500/40 rounded-2xl shadow-2xl p-5 z-10 max-h-[90vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <h3 className="text-base font-bold text-white">Record Wicket Fall</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* 1. Who was dismissed */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Dismissed Batter *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDismissedBatterId(striker.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  dismissedBatterId === striker.id
                    ? 'bg-rose-500/20 border-rose-500 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <span className="block text-white font-bold">{striker.fullName}</span>
                <span className="text-[10px] text-amber-400">Striker</span>
              </button>

              <button
                type="button"
                onClick={() => setDismissedBatterId(nonStriker.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  dismissedBatterId === nonStriker.id
                    ? 'bg-rose-500/20 border-rose-500 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <span className="block text-white font-bold">{nonStriker.fullName}</span>
                <span className="text-[10px] text-slate-400">Non-Striker</span>
              </button>
            </div>
          </div>

          {/* 2. Dismissal Type */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Dismissal Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {dismissalOptions.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setDismissalType(opt.type)}
                  className={`p-2 rounded-xl border font-semibold text-center transition-all ${
                    dismissalType === opt.type
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Fielder (if required) */}
          {needsFielder && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Fielder / Assistant ({dismissalType === 'caught' ? 'Catch by' : 'Run out / stumping by'})
              </label>
              <select
                value={fielderId}
                onChange={(e) => setFielderId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
              >
                {fieldingPlayers.map((fp) => (
                  <option key={fp.id} value={fp.id}>
                    {fp.fullName} (#{fp.jerseyNumber})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 4. Incoming Batter */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Next Batter In *
            </label>
            {hasRemainingBatters ? (
              <select
                value={newBatterId}
                onChange={(e) => setNewBatterId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
              >
                {availableBatters.map((ab) => (
                  <option key={ab.id} value={ab.id}>
                    {ab.fullName} ({ab.role})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 font-semibold text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>No remaining eligible batters in squad (Innings / All Out).</span>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-600/30"
            >
              Confirm Wicket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
