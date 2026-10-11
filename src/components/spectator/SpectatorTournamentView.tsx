/**
 * Spectator Tournament View
 * Standalone live view for fans and players watching tournament standings on their phones
 */

import React from 'react';
import { Trophy, Calendar, MapPin, ArrowLeft, Share2, Radio, Check } from 'lucide-react';
import { Tournament, Team, Match } from '../../types/cricket';
import { TournamentCupIcon } from '../brand/CricketIcons';

interface SpectatorTournamentViewProps {
  tournament: Tournament;
  teams: Team[];
  matches?: Match[];
  onBackToApp: () => void;
  onShare: () => void;
}

export const SpectatorTournamentView: React.FC<SpectatorTournamentViewProps> = ({
  tournament,
  teams,
  matches = [],
  onBackToApp,
  onShare,
}) => {
  const getTeam = (teamId: string) => teams.find((t) => t.id === teamId);

  const tournMatches = matches.filter(
    (m) => m.tournamentId === tournament.id || (tournament.matchIds && tournament.matchIds.includes(m.id))
  );

  return (
    <div className="p-3.5 sm:p-5 max-w-3xl mx-auto space-y-4 pb-24 select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToApp}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Mahi Crick Pro</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE STANDINGS</span>
          </span>

          <button
            onClick={onShare}
            className="p-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
            title="Share Tournament Link"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tournament Spotlight Header */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#0c1a3b] via-[#0e172e] to-[#070e20] border border-blue-500/40 space-y-2 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
          <TournamentCupIcon className="w-4 h-4" />
          <span>{tournament.format} • {tournament.oversPerInnings} OVERS PER MATCH</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white">{tournament.name}</h2>

        <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {tournament.startDate}
          </span>
          {tournament.venue && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {tournament.venue}
            </span>
          )}
        </div>
      </div>

      {/* Official Points Table */}
      <div className="rounded-3xl bg-[#0a1226] border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-3.5 bg-[#0d1630] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Points Table / अंक तालिका
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Win: 2 pts • Tie: 1 pt</span>
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
                <th className="py-2.5 px-2 text-center">T</th>
                <th className="py-2.5 px-3 text-right">NRR</th>
                <th className="py-2.5 px-4 text-right font-bold text-amber-400">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tournament.pointsTable.map((row, idx) => {
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
                    <td className="py-2.5 px-2 text-center text-slate-400">{row.tied}</td>
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
      {tournMatches.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Tournament Matches ({tournMatches.length})
          </h4>
          <div className="space-y-2">
            {tournMatches.map((m) => {
              const teamA = getTeam(m.teamAId);
              const teamB = getTeam(m.teamBId);
              return (
                <div
                  key={m.id}
                  className="p-3 rounded-2xl bg-[#0a1226] border border-slate-800 space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-amber-400 uppercase">{m.matchFormat}</span>
                    <span>{m.date}</span>
                  </div>
                  <div className="text-xs font-bold text-white">
                    {teamA?.name} vs {teamB?.name}
                  </div>
                  {m.resultSummary && (
                    <div className="text-xs font-medium text-emerald-400">
                      {m.resultSummary}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Powered by footer */}
      <div className="p-3 text-center text-[11px] text-slate-500">
        Live Tournament Standings Powered by Mahi Crick Pro
      </div>
    </div>
  );
};
