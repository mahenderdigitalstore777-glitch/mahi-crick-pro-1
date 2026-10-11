/**
 * Start Second Innings Modal
 * Guarantees foolproof initialization of 2nd innings with proper openers, bowler, and target
 */

import React, { useState } from 'react';
import { Trophy, ArrowRight, X, AlertTriangle, Users } from 'lucide-react';
import { Match, Player, Team } from '../../types/cricket';
import { ScoringEngine } from '../../services/scoringEngine';

interface StartSecondInningsModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  teams: Team[];
  players: Player[];
  onConfirmStart: (strikerId: string, nonStrikerId: string, bowlerId: string) => void;
}

export const StartSecondInningsModal: React.FC<StartSecondInningsModalProps> = ({
  isOpen,
  onClose,
  match,
  teams,
  players,
  onConfirmStart,
}) => {
  const inn1 = match.innings[1];
  const targetRuns = inn1 ? inn1.totalRuns + 1 : 1;

  // Determine teams for 2nd innings
  const secondBattingTeamId = inn1 ? inn1.bowlingTeamId : match.teamBId;
  const secondBowlingTeamId = inn1 ? inn1.battingTeamId : match.teamAId;

  const secondBattingTeam = teams.find((t) => t.id === secondBattingTeamId);
  const secondBowlingTeam = teams.find((t) => t.id === secondBowlingTeamId);

  const battingSquadIds = secondBattingTeamId === match.teamAId ? match.teamAPlayers : match.teamBPlayers;
  const bowlingSquadIds = secondBowlingTeamId === match.teamAId ? match.teamAPlayers : match.teamBPlayers;

  const battingSquad = players.filter((p) => battingSquadIds.includes(p.id));
  const bowlingSquad = players.filter((p) => bowlingSquadIds.includes(p.id));

  // Default openers
  const [strikerId, setStrikerId] = useState<string>(battingSquad[0]?.id || '');
  const [nonStrikerId, setNonStrikerId] = useState<string>(battingSquad[1]?.id || battingSquad[0]?.id || '');
  const [bowlerId, setBowlerId] = useState<string>(
    bowlingSquad[bowlingSquad.length - 1]?.id || bowlingSquad[0]?.id || ''
  );
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!strikerId || !nonStrikerId || !bowlerId) {
      setError('Please select both opening batters and the opening bowler.');
      return;
    }
    if (strikerId === nonStrikerId) {
      setError('Opening striker and non-striker cannot be the same player.');
      return;
    }
    onConfirmStart(strikerId, nonStrikerId, bowlerId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-xs" />
      <div className="relative w-full max-w-md bg-[#0a1228] border border-amber-500/40 rounded-3xl shadow-2xl p-5 z-10 space-y-4 max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-black text-white">Start 2nd Innings Run Chase</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-blue-500/10 to-transparent border border-amber-500/30 text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
            Target to Win
          </span>
          <div className="text-3xl font-black text-amber-400 font-mono tracking-tight my-0.5">
            {targetRuns} Runs
          </div>
          <p className="text-xs text-slate-300">
            {secondBattingTeam?.name} needs {targetRuns} runs in {match.oversPerInnings} overs (
            {match.oversPerInnings * 6} balls) to win.
          </p>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Opening Striker */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">
              Opening Striker ({secondBattingTeam?.shortName}) *
            </label>
            <select
              value={strikerId}
              onChange={(e) => setStrikerId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-medium"
            >
              {battingSquad.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.role})
                </option>
              ))}
            </select>
          </div>

          {/* Opening Non-Striker */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">
              Opening Non-Striker ({secondBattingTeam?.shortName}) *
            </label>
            <select
              value={nonStrikerId}
              onChange={(e) => setNonStrikerId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-medium"
            >
              {battingSquad
                .filter((p) => p.id !== strikerId)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.role})
                  </option>
                ))}
            </select>
          </div>

          {/* Opening Bowler */}
          <div>
            <label className="block text-slate-300 font-bold mb-1">
              Opening Bowler ({secondBowlingTeam?.shortName}) *
            </label>
            <select
              value={bowlerId}
              onChange={(e) => setBowlerId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400 font-medium"
            >
              {bowlingSquad.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.bowlingStyle})
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
            >
              <span>Begin 2nd Innings</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
