/**
 * Screen 5: Home Dashboard
 * Primary landing dashboard with Live match summary, Quick action cards,
 * Tournament Hub, Recent matches, and Local Database statistics.
 * Upgraded with original professional cricket vector icons.
 */

import React from 'react';
import {
  Play,
  PlusCircle,
  History,
  Shield,
  Users,
  ChevronRight,
  Flame,
  ArrowRight,
  Clock,
  Radio,
  Smartphone,
  Download,
} from 'lucide-react';
import { Match, Team } from '../../types/cricket';
import { ScoringEngine } from '../../services/scoringEngine';
import {
  CricketBatIcon,
  CricketBallIcon,
  WicketsIcon,
  TournamentCupIcon,
  MotmTrophyIcon,
} from '../brand/CricketIcons';

interface HomeDashboardProps {
  activeMatch?: Match;
  teams: Team[];
  playersCount: number;
  matches: Match[];
  onStartNewMatch: () => void;
  onContinueMatch: () => void;
  onViewMatchHistory: () => void;
  onManageTeams: () => void;
  onManagePlayers: () => void;
  onViewScorecard: (matchId: string) => void;
  onOpenTournaments?: () => void;
  onOpenApkGuide?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  activeMatch,
  teams,
  playersCount,
  matches,
  onStartNewMatch,
  onContinueMatch,
  onViewMatchHistory,
  onManageTeams,
  onManagePlayers,
  onViewScorecard,
  onOpenTournaments,
  onOpenApkGuide,
}) => {
  const completedMatches = matches.filter((m) => m.status === 'completed');
  const recentCompleted = completedMatches.slice(0, 3);

  const getTeamName = (teamId: string) => {
    const t = teams.find((team) => team.id === teamId);
    return t ? t.shortName : 'TEAM';
  };

  const getTeamFullName = (teamId: string) => {
    const t = teams.find((team) => team.id === teamId);
    return t ? t.name : 'Team';
  };

  const getTeamColor = (teamId: string) => {
    const t = teams.find((team) => team.id === teamId);
    return t?.primaryColor || '#3B82F6';
  };

  return (
    <div className="p-3.5 sm:p-5 max-w-4xl mx-auto space-y-5 pb-24 select-none">
      {/* Top Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d1b3e] via-[#091530] to-[#0a1226] p-4 sm:p-5 border border-slate-800 shadow-xl">
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                PRO CRICKET SCORER
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-500" />
              <span className="text-[11px] font-medium text-emerald-400">CLOUD SYNC ACTIVE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Welcome to <span className="text-amber-400">Mahi Crick Pro</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-md">
              Tournament-grade ball-by-ball scoring, instant PDF match summary, and real-time live match broadcasting.
            </p>
          </div>
          <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 shrink-0">
            <CricketBallIcon className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Tournament Hub Banner (Replaces clunky match ID code card) */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0e1f48] via-[#101b3b] to-[#121430] border border-blue-500/30 p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600/30 to-indigo-600/20 border border-blue-400/40 text-blue-400 flex items-center justify-center shrink-0 shadow-inner">
            <TournamentCupIcon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                TOURNAMENT HUB
              </span>
              <span className="text-xs text-slate-400">Points Table & Standings</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
              Tournaments & Leagues / टूर्नामेंट्स
            </h3>
            <p className="text-[11px] text-slate-300">
              टूर्नामेंट बनाएं, अंक तालिका (NRR) देखें और दर्शकों के साथ लाइव स्टैंडिंग्स शेयर करें।
            </p>
          </div>
        </div>
        <button
          onClick={onOpenTournaments}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 flex items-center justify-center gap-1.5 shrink-0 active:scale-95 transition-all cursor-pointer"
        >
          <TournamentCupIcon className="w-4 h-4" />
          <span>Open Tournaments</span>
        </button>
      </div>

      {/* Active Match Banner (if in progress) */}
      {activeMatch && (
        <div className="rounded-3xl bg-gradient-to-br from-[#101e42] to-[#0a142c] border border-amber-500/40 p-4 sm:p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Live Match in Progress
              </span>
            </div>
            <span className="text-xs font-medium text-slate-400">
              {activeMatch.matchFormat} • {activeMatch.oversPerInnings} Overs
            </span>
          </div>

          {/* Teams and Live Scores */}
          {(() => {
            const innNum = activeMatch.currentInningsNumber;
            const currentInn = activeMatch.innings[innNum];

            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-md border border-white/10"
                      style={{ backgroundColor: getTeamColor(currentInn?.battingTeamId || activeMatch.teamAId) }}
                    >
                      {getTeamName(currentInn?.battingTeamId || activeMatch.teamAId)}
                    </div>
                    <div>
                      <div className="font-bold text-base text-white">
                        {getTeamFullName(currentInn?.battingTeamId || activeMatch.teamAId)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {innNum === 2 ? 'Target: ' + currentInn?.target : '1st Innings'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
                      {currentInn?.totalRuns || 0} / {currentInn?.wickets || 0}
                    </div>
                    <div className="text-xs font-medium text-slate-300 font-mono">
                      Over: {ScoringEngine.formatOvers(currentInn?.legalDeliveries || 0)} / {activeMatch.oversPerInnings}
                    </div>
                  </div>
                </div>

                {/* CRR & Status */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <div>
                    CRR:{' '}
                    <span className="font-bold text-white">
                      {ScoringEngine.calculateCRR(currentInn?.totalRuns || 0, currentInn?.legalDeliveries || 0)}
                    </span>
                  </div>

                  {innNum === 2 && currentInn?.target && (
                    <div>
                      Need{' '}
                      <span className="font-bold text-amber-400">
                        {Math.max(0, currentInn.target - currentInn.totalRuns)}
                      </span>{' '}
                      runs in{' '}
                      <span className="font-bold text-white">
                        {Math.max(0, activeMatch.oversPerInnings * 6 - currentInn.legalDeliveries)}
                      </span>{' '}
                      balls
                    </div>
                  )}

                  <button
                    onClick={onContinueMatch}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
                  >
                    <span>Continue Scoring</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Main Action Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. Start New Match (Primary CTA) */}
        <button
          onClick={onStartNewMatch}
          className="flex flex-col items-start p-4 rounded-3xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 hover:border-amber-400 text-left transition-all active:scale-[0.98] group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold mb-3 shadow-md group-hover:scale-105 transition-transform">
            <CricketBatIcon className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-white block">New Match</span>
          <span className="text-[11px] text-slate-400 mt-0.5">T20, T10 or Custom</span>
        </button>

        {/* 2. Tournaments */}
        <button
          onClick={onOpenTournaments}
          className="flex flex-col items-start p-4 rounded-3xl bg-[#0a142c] border border-slate-800 hover:border-blue-500/50 text-left transition-all active:scale-[0.98] group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
            <TournamentCupIcon className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-white block">Tournaments</span>
          <span className="text-[11px] text-slate-400 mt-0.5">Points table & NRR</span>
        </button>

        {/* 3. Match History */}
        <button
          onClick={onViewMatchHistory}
          className="flex flex-col items-start p-4 rounded-3xl bg-[#0a142c] border border-slate-800 hover:border-slate-700 text-left transition-all active:scale-[0.98] group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-slate-800 text-slate-200 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
            <History className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold text-white block">Match History</span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            {matches.length} matches saved
          </span>
        </button>

        {/* 4. Manage Teams */}
        <button
          onClick={onManageTeams}
          className="flex flex-col items-start p-4 rounded-3xl bg-[#0a142c] border border-slate-800 hover:border-slate-700 text-left transition-all active:scale-[0.98] group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold text-white block">Teams & Squads</span>
          <span className="text-[11px] text-slate-400 mt-0.5">{teams.length} teams registered</span>
        </button>
      </div>

      {/* Quick Statistics Strip */}
      <div className="p-4 rounded-3xl bg-[#0a1228] border border-slate-800/80">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
          Local Database Overview
        </div>
        <div className="grid grid-cols-4 gap-2 text-center divide-x divide-slate-800">
          <div>
            <div className="text-lg sm:text-xl font-black text-white font-mono">{matches.length}</div>
            <div className="text-[10px] text-slate-400">Total Matches</div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
              {completedMatches.length}
            </div>
            <div className="text-[10px] text-slate-400">Completed</div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-amber-400 font-mono">{teams.length}</div>
            <div className="text-[10px] text-slate-400">Teams</div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-blue-400 font-mono">{playersCount}</div>
            <div className="text-[10px] text-slate-400">Players</div>
          </div>
        </div>
      </div>

      {/* Recent Matches List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Recent Completed Matches</span>
          </h3>
          {completedMatches.length > 0 && (
            <button
              onClick={onViewMatchHistory}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentCompleted.length === 0 ? (
          <div className="p-6 rounded-3xl bg-[#0a1228] border border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">No completed matches in database yet.</p>
            <button
              onClick={onStartNewMatch}
              className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Start First Match
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentCompleted.map((m) => (
              <div
                key={m.id}
                onClick={() => onViewScorecard(m.id)}
                className="p-3.5 rounded-2xl bg-[#0a1228] border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase">
                      {m.matchFormat} • {m.date}
                    </span>
                    <span className="text-[10px] text-slate-400">({m.oversPerInnings} ov)</span>
                  </div>
                  <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                    {m.title}
                  </div>
                  {m.resultSummary && (
                    <div className="text-xs font-medium text-emerald-400 mt-0.5">
                      {m.resultSummary}
                    </div>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
