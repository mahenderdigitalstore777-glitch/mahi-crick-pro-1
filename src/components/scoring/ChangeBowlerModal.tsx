/**
 * Change Bowler Modal
 * Enforces cricket bowling limits: bowler cannot bowl two consecutive overs
 */

import React, { useState } from 'react';
import { X, UserCheck } from 'lucide-react';
import { Player } from '../../types/cricket';

interface ChangeBowlerModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBowlers: Player[];
  currentBowlerId: string;
  lastOverBowlerId?: string;
  onSelectBowler: (bowlerId: string) => void;
  title?: string;
}

export const ChangeBowlerModal: React.FC<ChangeBowlerModalProps> = ({
  isOpen,
  onClose,
  availableBowlers,
  currentBowlerId,
  lastOverBowlerId,
  onSelectBowler,
  title = 'Select Next Bowler',
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    availableBowlers.find((b) => b.id !== currentBowlerId)?.id || availableBowlers[0]?.id || ''
  );

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedId) {
      onSelectBowler(selectedId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-xs" />
      <div className="relative w-full max-w-sm bg-[#0a1228] border border-slate-800 rounded-2xl shadow-2xl p-5 z-10 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">{title}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Bowler cannot bowl two consecutive overs as per official MCC rules.
        </p>

        <div className="space-y-1.5 max-h-60 overflow-y-auto">
          {availableBowlers.map((b) => {
            const isConsecutiveDisallowed = b.id === currentBowlerId && availableBowlers.length > 1;

            return (
              <button
                key={b.id}
                type="button"
                disabled={isConsecutiveDisallowed}
                onClick={() => setSelectedId(b.id)}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                  isConsecutiveDisallowed
                    ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-800'
                    : selectedId === b.id
                    ? 'bg-amber-400/20 border-amber-400 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white">{b.fullName}</div>
                  <div className="text-[10px] text-slate-400">
                    {b.bowlingStyle} {isConsecutiveDisallowed && '(Just bowled)'}
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400">#{b.jerseyNumber}</span>
              </button>
            );
          })}
        </div>

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
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-md"
          >
            Confirm Bowler
          </button>
        </div>
      </div>
    </div>
  );
};
