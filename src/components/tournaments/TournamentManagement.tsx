/**
 * Tournament Management Screen
 * Complete Tournament Hub with Live Points Table, Net Run Rate (NRR),
 * Match Fixtures, and Cloud Share links.
 */

import React, { useState } from 'react';
import {
  Trophy,
  Plus,
  Share2,
  Calendar,
  MapPin,
  ChevronRight,
  Play,
  RotateCcw,
  Trash2,
  Check,
  Globe,
  Radio,
} from 'lucide-react';
import { Tournament, Team, Match } from '../../types/cricket';
import { TournamentCupIcon, CricketBatIcon } from '../brand/CricketIcons';
import { CreateTournamentModal } from './CreateTournamentModal';
import { ShareTournamentModal } from './ShareTournamentModal';
import { storageService } from '../../services/storage';

interface TournamentManagementProps {
  tournaments: Tournament[];
  teams: Team[];
  matches: Match[];
  initialTournamentId?: string;
  onStartMatchInTournament: (tournamentId: string) => void;
  onViewScorecard: (matchId: string) => void;
  onRefreshData: () => void;
}

export const TournamentManagement: React.FC<TournamentManagementProps> = ({
  tournaments,
  teams,
  matches,
  initialTournamentId,
  onStartMatchInTournament,
  onViewScorecard,
  onRefreshData,
}) => {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(
    initialTournamentId || tournaments[0]?.id || ''
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [shareTourn, setShareTourn] = useState<Tournament | null>(null);

  React.useEffect(() => {
    if (initialTournamentId) {
      setSelectedTournamentId(initialTournamentId);
    }
  }, [initialTournamentId]);

  const selectedTourn =
    tournaments.find((t) => t.id === selectedTournamentId) || tournaments[0];

  const getTeam = (teamId: string) => teams.find((t) => t.id === teamId);

  const tournMatches = matches.filter(
    (m) =>
      m.tournamentId === selectedTourn?.id ||
      (selectedTourn?.matchIds && selectedTourn.matchIds.includes(m.id))
  );

  const handleRecalculate = () => {
    if (selectedTourn) {
      storageService.recalculateTournamentPoints(selectedTourn.id);
      onRefreshData();
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this tournament? Match data will be retained.')) {
      storageService.deleteTournament(id);
      onRefreshData();
      if (selectedTournamentId === id) {
        const remaining = tournaments.filter((t) => t.id !== id);
        setSelectedTournamentId(remaining[0]?.id || '');
      }
    }
  };

  return (
    <div className="p-3.5 sm:p-5 max-w-4xl mx-auto space-y-5 pb-24 select-none">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d1b3e] via-[#101f48] to-[#0a1226] p-4 sm:p-5 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/30 shrink-0">
              <TournamentCupIcon className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                CHAMPIONSHIP HUB
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Tournaments / टूर्नामेंट
              </h2>
              <p className="text-xs text-slate-300">
                पॉइंट्स टेबल, नेट रन रेट (NRR) और लाइव टूर्नामेंट शेयर लिंक
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Tournament</span>
          </button>
        </div>
      </div>

      {/* Tournaments Selector Tabs */}
      {tournaments.length > 0 ? (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {tournaments.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTournamentId(t.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                selectedTournamentId === t.id
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{t.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/40 text-current">
                {t.format}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-900/50 rounded-3xl border border-slate-800 space-y-3">
          <TournamentCupIcon className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Tournaments Yet</h3>
          <p className="text-xs text-slate-400">Create your first tournament to track standings and fixtures.</p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
          >
            Create Tournament
          </button>
        </div>
      )}

      {selectedTourn && (
        <div className="space-y-4">
          {/* Tournament Overview Card & Share Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#0a1226] border border-slate-800 space-y-3 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-amber-400 font-bold">
                  <span className="uppercase tracking-widest">{selectedTourn.format} ({selectedTourn.oversPerInnings} Overs)</span>
                  <span>•</span>
                  <span className="capitalize">{selectedTourn.status}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                  {selectedTourn.name}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {selectedTourn.startDate}
                  </span>
                  {selectedTourn.venue && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {selectedTourn.venue}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShareTourn(selectedTourn)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
                  title="Share Live Tournament Standings Link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Live Link</span>
                </button>

                <button
                  onClick={() => onStartMatchInTournament(selectedTourn.id)}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>New Match</span>
                </button>

                <button
                  onClick={handleRecalculate}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  title="Recalculate Points Table from Completed Matches"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(selectedTourn.id)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Delete Tournament"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Points Table (Live Standings) */}
          <div className="rounded-3xl bg-[#0a1226] border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-3.5 sm:p-4 bg-[#0d1730] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  Points Table / अंक तालिका
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">2 Pts for Win</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider bg-slate-950/40">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3 font-sans">Team</th>
                    <th className="py-2.5 px-2 text-center">P</th>
                    <th className="py-2.5 px-2 text-center">W</th>
                    <th className="py-2.5 px-2 text-center">L</th>
                    <th className="py-2.5 px-2 text-center">T/NR</th>
                    <th className="py-2.5 px-3 text-right">NRR</th>
                    <th className="py-2.5 px-4 text-right font-bold text-amber-400">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {selectedTourn.pointsTable.map((row, idx) => {
                    const teamObj = getTeam(row.teamId);
                    return (
                      <tr key={row.teamId} className="hover:bg-slate-900/30">
                        <td className="py-2.5 px-3 text-slate-500 font-bold">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-sans font-bold text-white flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: teamObj?.primaryColor || '#F59E0B' }}
                          />
                          <span className="truncate">{teamObj ? teamObj.name : row.teamId}</span>
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-300">{row.played}</td>
                        <td className="py-2.5 px-2 text-center text-emerald-400 font-bold">{row.won}</td>
                        <td className="py-2.5 px-2 text-center text-rose-400">{row.lost}</td>
                        <td className="py-2.5 px-2 text-center text-slate-400">{row.tied + row.noResult}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                          {row.netRunRate >= 0 ? `+${row.netRunRate.toFixed(3)}` : row.netRunRate.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-black text-amber-400 text-sm">
                          {row.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tournament Matches */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tournament Matches ({tournMatches.length})
            </h4>

            {tournMatches.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                No matches recorded in this tournament yet. Tap "New Match" above to start!
              </div>
            ) : (
              <div className="space-y-2">
                {tournMatches.map((m) => {
                  const teamA = getTeam(m.teamAId);
                  const teamB = getTeam(m.teamBId);
                  return (
                    <div
                      key={m.id}
                      onClick={() => onViewScorecard(m.id)}
                      className="p-3 rounded-2xl bg-[#0a1226] border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold text-amber-400 uppercase">
                            {m.matchFormat} • {m.date}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                              m.status === 'live'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {m.status}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-white">
                          {teamA?.name} vs {teamB?.name}
                        </div>
                        {m.resultSummary && (
                          <div className="text-[11px] text-emerald-400 font-medium mt-0.5">
                            {m.resultSummary}
                          </div>
                        )}
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateTournamentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        teams={teams}
        onCreateTournament={(newTourn) => {
          storageService.saveTournament(newTourn);
          onRefreshData();
          setSelectedTournamentId(newTourn.id);
        }}
      />

      {shareTourn && (
        <ShareTournamentModal
          isOpen={true}
          onClose={() => setShareTourn(null)}
          tournament={shareTourn}
          teams={teams}
        />
      )}
    </div>
  );
};
