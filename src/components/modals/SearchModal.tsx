/**
 * Global Search Modal
 * Searches Teams, Players, and Matches in local storage
 */

import React, { useState, useMemo } from 'react';
import { Search, X, Shield, User, Trophy, Calendar } from 'lucide-react';
import { storageService } from '../../services/storage';
import { Team, Player, Match } from '../../types/cricket';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTeam: (teamId: string) => void;
  onSelectPlayer: (playerId: string) => void;
  onSelectMatch: (matchId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTeam,
  onSelectPlayer,
  onSelectMatch,
}) => {
  const [query, setQuery] = useState('');

  const teams = useMemo(() => storageService.getTeams(), [isOpen]);
  const players = useMemo(() => storageService.getPlayers(), [isOpen]);
  const matches = useMemo(() => storageService.getMatches(), [isOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { teams: [], players: [], matches: [] };
    }

    const matchedTeams = teams.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.shortName.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q))
    );

    const matchedPlayers = players.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.displayName.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.battingStyle.toLowerCase().includes(q)
    );

    const matchedMatches = matches.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        (m.venue && m.venue.toLowerCase().includes(q)) ||
        m.matchFormat.toLowerCase().includes(q)
    );

    return {
      teams: matchedTeams.slice(0, 5),
      players: matchedPlayers.slice(0, 6),
      matches: matchedMatches.slice(0, 5),
    };
  }, [query, teams, players, matches]);

  if (!isOpen) return null;

  const totalResults = results.teams.length + results.players.length + results.matches.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-3 select-none">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/70 backdrop-blur-xs" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#0a1228] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-800 flex items-center gap-3 bg-[#0d1630]">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search teams, players, matches, venues..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400 hover:text-white"
            >
              ESC
            </button>
          )}
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 flex flex-col gap-4">
          {!query.trim() && (
            <div className="py-8 text-center text-slate-400 text-xs">
              Type at least one character to search your cricket database.
            </div>
          )}

          {query.trim() && totalResults === 0 && (
            <div className="py-10 text-center flex flex-col items-center">
              <Search className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-300">No records found</p>
              <p className="text-xs text-slate-400 mt-1">
                No matching teams, players, or matches for &ldquo;{query}&rdquo;.
              </p>
            </div>
          )}

          {/* Teams */}
          {results.teams.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Teams ({results.teams.length})
              </span>
              <div className="space-y-1.5">
                {results.teams.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTeam(t.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                        style={{ backgroundColor: t.primaryColor }}
                      >
                        {t.badgeCode}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-100">{t.name}</div>
                        <div className="text-xs text-slate-400">{t.shortName} • {t.playerIds.length} players</div>
                      </div>
                    </div>
                    <Shield className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Players */}
          {results.players.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Players ({results.players.length})
              </span>
              <div className="space-y-1.5">
                {results.players.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPlayer(p.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
                        style={{ backgroundColor: p.avatarColor || '#3B82F6' }}
                      >
                        #{p.jerseyNumber}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-100">{p.fullName}</div>
                        <div className="text-xs text-slate-400">{p.role} • {p.battingStyle}</div>
                      </div>
                    </div>
                    <User className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matches */}
          {results.matches.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Matches ({results.matches.length})
              </span>
              <div className="space-y-1.5">
                {results.matches.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectMatch(m.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 text-left transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-100">{m.title}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {m.date}
                        </span>
                        <span>•</span>
                        <span>{m.matchFormat} ({m.oversPerInnings} Overs)</span>
                      </div>
                    </div>
                    <Trophy className="w-4 h-4 text-amber-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
