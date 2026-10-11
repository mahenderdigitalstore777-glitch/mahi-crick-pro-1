/**
 * Quick Player & Batch Squad Importer Modal
 * Super-fast 1-field player creation and 1-click batch squad import
 */

import React, { useState } from 'react';
import { X, UserPlus, Users, Sparkles, Check, AlertCircle } from 'lucide-react';
import { Team, PlayingRole, Player } from '../../types/cricket';
import { storageService } from '../../services/storage';

interface QuickAddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  defaultTeamId?: string;
  onPlayerCreated: () => void;
}

export const QuickAddPlayerModal: React.FC<QuickAddPlayerModalProps> = ({
  isOpen,
  onClose,
  teams,
  defaultTeamId,
  onPlayerCreated,
}) => {
  const [mode, setMode] = useState<'single' | 'batch'>('single');

  // Single Quick Add
  const [playerName, setPlayerName] = useState('');
  const [role, setRole] = useState<PlayingRole>('Batter');
  const [teamId, setTeamId] = useState<string>(defaultTeamId || teams[0]?.id || '');
  const [jerseyNumber, setJerseyNumber] = useState<number>(Math.floor(Math.random() * 99) + 1);

  // Batch Squad Import
  const [batchText, setBatchText] = useState('');
  const [batchTeamId, setBatchTeamId] = useState<string>(defaultTeamId || teams[0]?.id || '');

  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    const trimmed = playerName.trim();
    const newPlayer: Player = {
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      fullName: trimmed,
      displayName: trimmed,
      jerseyNumber: Number(jerseyNumber) || 10,
      role,
      battingStyle: 'Right Hand Bat',
      bowlingStyle: role === 'Bowler' ? 'Right-arm Fast' : 'None',
      isWicketKeeper: role === 'Wicketkeeper',
      teamId: teamId || undefined,
      avatarColor: role === 'Batter' ? '#3B82F6' : role === 'Bowler' ? '#EF4444' : role === 'All-Rounder' ? '#10B981' : '#F59E0B',
      stats: {
        matches: 0,
        innings: 0,
        runs: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0,
        highestScore: 0,
        notOuts: 0,
        oversBowled: 0,
        runsConceded: 0,
        wickets: 0,
        maidens: 0,
        bestBowlingWickets: 0,
        bestBowlingRuns: 0,
      },
      createdAt: Date.now(),
    };

    storageService.savePlayer(newPlayer);
    setPlayerName('');
    setJerseyNumber(Math.floor(Math.random() * 99) + 1);
    setMessage(`Added ${newPlayer.fullName}!`);
    setTimeout(() => setMessage(null), 2000);
    onPlayerCreated();
  };

  const handleBatchImport = () => {
    if (!batchText.trim()) return;

    // Split by comma or new lines
    const names = batchText
      .split(/[\n,]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (names.length === 0) return;

    const rolesList: PlayingRole[] = [
      'Batter',
      'Batter',
      'Batter',
      'Wicketkeeper',
      'All-Rounder',
      'All-Rounder',
      'Bowler',
      'Bowler',
      'Bowler',
      'Bowler',
      'Bowler',
    ];

    let count = 0;
    names.forEach((name, idx) => {
      const assignedRole = rolesList[idx % rolesList.length];
      const p: Player = {
        id: `p-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        fullName: name,
        displayName: name,
        jerseyNumber: idx + 1,
        role: assignedRole,
        battingStyle: 'Right Hand Bat',
        bowlingStyle: assignedRole === 'Bowler' ? 'Right-arm Fast' : 'None',
        isWicketKeeper: assignedRole === 'Wicketkeeper',
        teamId: batchTeamId || undefined,
        avatarColor: '#3B82F6',
        stats: {
          matches: 0,
          innings: 0,
          runs: 0,
          ballsFaced: 0,
          fours: 0,
          sixes: 0,
          highestScore: 0,
          notOuts: 0,
          oversBowled: 0,
          runsConceded: 0,
          wickets: 0,
          maidens: 0,
          bestBowlingWickets: 0,
          bestBowlingRuns: 0,
        },
        createdAt: Date.now() + idx,
      };
      storageService.savePlayer(p);
      count++;
    });

    setBatchText('');
    setMessage(`Successfully added ${count} squad players!`);
    setTimeout(() => {
      setMessage(null);
      onClose();
    }, 1500);
    onPlayerCreated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div onClick={onClose} className="fixed inset-0 bg-black/75 backdrop-blur-xs" />
      <div className="relative w-full max-w-md bg-[#0a1228] border border-slate-800 rounded-2xl shadow-2xl p-5 z-10 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Quick Add Players</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
              mode === 'single'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Single Player (त्वरित खिलाड़ी)
          </button>
          <button
            type="button"
            onClick={() => setMode('batch')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
              mode === 'batch'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Paste Full Squad (एक साथ 11 नाम)
          </button>
        </div>

        {message && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* 1. Single Player Quick Add */}
        {mode === 'single' && (
          <form onSubmit={handleCreateSingle} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Player Name (खिलाड़ी का नाम) *
              </label>
              <input
                type="text"
                autoFocus
                required
                placeholder="e.g. Sanju Samson"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Playing Role</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['Batter', 'Bowler', 'All-Rounder', 'Wicketkeeper'] as PlayingRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 rounded-xl text-[11px] font-bold border transition-all ${
                      role === r
                        ? 'bg-amber-400 text-slate-950 border-amber-400'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {r === 'Wicketkeeper' ? 'Keeper' : r}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assign Team</label>
                <select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="">No Team (Free Agent)</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.shortName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Jersey Number</label>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={jerseyNumber}
                  onChange={(e) => setJerseyNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
              >
                Done
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-md"
              >
                + Add Player
              </button>
            </div>
          </form>
        )}

        {/* 2. Batch Squad Import */}
        {mode === 'batch' && (
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Assign To Team</label>
              <select
                value={batchTeamId}
                onChange={(e) => setBatchTeamId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.shortName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Paste Player Names (Comma or New Line separated)
              </label>
              <textarea
                rows={5}
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder="Rohit Sharma&#10;Virat Kohli&#10;Shubman Gill&#10;KL Rahul&#10;Hardik Pandya&#10;Ravindra Jadeja&#10;Jasprit Bumrah&#10;Mohammed Siraj"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Tip: Paste names directly from WhatsApp, Telegram, or Notes.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBatchImport}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold shadow-md"
              >
                Import Entire Squad
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
