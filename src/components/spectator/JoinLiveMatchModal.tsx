/**
 * Join Live Match Modal
 * Enables any user/spectator to enter a Match Code/ID to watch real-time ball-by-ball score
 */

import React, { useState } from 'react';
import { Radio, X, Search, Sparkles, Smartphone, ArrowRight, AlertCircle } from 'lucide-react';
import { Match } from '../../types/cricket';

interface JoinLiveMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectMatch: (matchId: string) => void;
  recentMatches?: Match[];
  isLoading?: boolean;
  error?: string | null;
}

export const JoinLiveMatchModal: React.FC<JoinLiveMatchModalProps> = ({
  isOpen,
  onClose,
  onConnectMatch,
  recentMatches = [],
  isLoading = false,
  error = null,
}) => {
  const [matchCodeInput, setMatchCodeInput] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = matchCodeInput.trim();
    if (!clean) {
      setLocalError('कृपया Match Code या ID दर्ज करें।');
      return;
    }
    setLocalError(null);
    onConnectMatch(clean);
  };

  const handleSelectRecent = (matchId: string) => {
    setLocalError(null);
    onConnectMatch(matchId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0a1226] border border-blue-500/40 rounded-3xl p-5 shadow-2xl z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Watch Live Match</h3>
              <p className="text-[11px] text-slate-400">Match Code डालकर लाइव स्कोर देखें</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span>Enter Match Code or ID</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. match_1728... या WhatsApp से कोड पेस्ट करें"
                value={matchCodeInput}
                onChange={(e) => {
                  setMatchCodeInput(e.target.value);
                  setLocalError(null);
                }}
                disabled={isLoading}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
                autoFocus
              />
            </div>
          </div>

          {(localError || error) && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{localError || error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !matchCodeInput.trim()}
            className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isLoading || !matchCodeInput.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 active:scale-98'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Connecting to Cloud Broadcast...</span>
              </>
            ) : (
              <>
                <Radio className="w-4 h-4" />
                <span>🔴 Connect Live Broadcast</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Pick: Active / Recent Matches */}
        {recentMatches.length > 0 && (
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Recent Matches on Device
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {recentMatches.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectRecent(m.id)}
                  className="w-full p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 text-left flex items-center justify-between text-xs transition-colors cursor-pointer"
                >
                  <div className="truncate">
                    <span className="font-semibold text-white truncate block">{m.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Code: {m.id}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-400/20 text-amber-300 shrink-0">
                    {m.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          💡 <strong>Tip:</strong> जब कोई स्कोरर मैच शेयर करता है, तो आप उनका Match Code यहाँ डालकर तुरंत बॉल-बाय-बॉल स्कोर और कॉमेंट्री अपने फोन पर देख सकते हैं।
        </div>
      </div>
    </div>
  );
};
