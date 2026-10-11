/**
 * Create Tournament Modal
 * Enables organizers to set up a new cricket tournament, select participating teams,
 * and define formats and overs.
 */

import React, { useState } from 'react';
import { X, Trophy, Plus, Check, Shield, AlertCircle } from 'lucide-react';
import { Tournament, Team, MatchFormat } from '../../types/cricket';
import { TournamentCupIcon } from '../brand/CricketIcons';

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  onCreateTournament: (tournament: Tournament) => void;
}

export const CreateTournamentModal: React.FC<CreateTournamentModalProps> = ({
  isOpen,
  onClose,
  teams,
  onCreateTournament,
}) => {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [format, setFormat] = useState<MatchFormat>('T20');
  const [oversPerInnings, setOversPerInnings] = useState<number>(20);
  const [venue, setVenue] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>(teams.map((t) => t.id));
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFormatChange = (fmt: MatchFormat) => {
    setFormat(fmt);
    if (fmt === 'T5') setOversPerInnings(5);
    else if (fmt === 'T10') setOversPerInnings(10);
    else if (fmt === 'T15') setOversPerInnings(15);
    else if (fmt === 'T20') setOversPerInnings(20);
    else if (fmt === 'ODI') setOversPerInnings(50);
  };

  const toggleTeam = (teamId: string) => {
    if (selectedTeamIds.includes(teamId)) {
      if (selectedTeamIds.length <= 2) {
        setError('At least 2 teams are required for a tournament.');
        return;
      }
      setSelectedTeamIds(selectedTeamIds.filter((id) => id !== teamId));
    } else {
      setSelectedTeamIds([...selectedTeamIds, teamId]);
    }
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a tournament name.');
      return;
    }
    if (selectedTeamIds.length < 2) {
      setError('Select at least 2 teams.');
      return;
    }

    const newTournament: Tournament = {
      id: `tourn-${Date.now()}`,
      name: name.trim(),
      shortName: shortName.trim() || name.trim().slice(0, 6).toUpperCase(),
      format,
      oversPerInnings,
      startDate,
      venue: venue.trim() || 'Local Cricket Grounds',
      status: 'ongoing',
      teamIds: selectedTeamIds,
      matchIds: [],
      pointsTable: selectedTeamIds.map((tId) => ({
        teamId: tId,
        played: 0,
        won: 0,
        lost: 0,
        tied: 0,
        noResult: 0,
        points: 0,
        netRunRate: 0,
        runsScored: 0,
        oversFaced: 0,
        runsConceded: 0,
        oversBowled: 0,
      })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onCreateTournament(newTournament);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0a1226] border border-amber-500/40 rounded-3xl p-5 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
              <TournamentCupIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create New Tournament</h3>
              <p className="text-[11px] text-slate-400">नया टूर्नामेंट बनाएं एवं टीमें जोड़ें</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tournament Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tournament Name (टूर्नामेंट का नाम) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Gramin Premier League 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:border-amber-400 outline-none"
            />
          </div>

          {/* Short Name & Venue */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Short Name / Code
              </label>
              <input
                type="text"
                placeholder="e.g. GPL 2026"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:border-amber-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Venue (स्थान/ग्राउंड)
              </label>
              <input
                type="text"
                placeholder="e.g. Stadium Ground"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          {/* Format & Overs */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Match Format & Overs
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(['T5', 'T10', 'T15', 'T20', 'ODI'] as MatchFormat[]).map((fmt) => (
                <button
                  type="button"
                  key={fmt}
                  onClick={() => handleFormatChange(fmt)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    format === fmt
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Participating Teams Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Select Participating Teams ({selectedTeamIds.length} Selected)</span>
              <span className="text-[10px] text-amber-400">Min 2 Teams</span>
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1 bg-slate-950/60 rounded-2xl border border-slate-800">
              {teams.map((t) => {
                const isSelected = selectedTeamIds.includes(t.id);
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => toggleTeam(t.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400/15 border-amber-400/50 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: t.primaryColor }}
                      />
                      <span className="text-xs font-bold truncate">{t.shortName}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Tournament (टूर्नामेंट बनाएं)</span>
          </button>
        </form>
      </div>
    </div>
  );
};
