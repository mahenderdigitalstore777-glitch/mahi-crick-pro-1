/**
 * Screen 8: Statistics Screen
 * Aggregated player leaderboard, top batting performers, and leading wicket takers
 */

import React from 'react';
import { BarChart3, Trophy, Flame, Target, Award } from 'lucide-react';
import { Player, Team, Match } from '../../types/cricket';

interface StatisticsScreenProps {
  players: Player[];
  teams: Team[];
  matches: Match[];
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({
  players,
  teams,
  matches,
}) => {
  // Sort top run scorers
  const topRunScorers = [...players]
    .filter((p) => p.stats.runs > 0)
    .sort((a, b) => b.stats.runs - a.stats.runs)
    .slice(0, 5);

  // Sort top wicket takers
  const topWicketTakers = [...players]
    .filter((p) => p.stats.wickets > 0)
    .sort((a, b) => b.stats.wickets - a.stats.wickets)
    .slice(0, 5);

  // Sort highest individual scores
  const highestScores = [...players]
    .filter((p) => p.stats.highestScore > 0)
    .sort((a, b) => b.stats.highestScore - a.stats.highestScore)
    .slice(0, 5);

  const getTeamName = (tId?: string) => {
    if (!tId) return 'Free Agent';
    const t = teams.find((team) => team.id === tId);
    return t ? t.shortName : 'Free Agent';
  };

  return (
    <div className="p-3.5 sm:p-5 max-w-3xl mx-auto space-y-4 pb-24 select-none">
      <div>
        <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-400" />
          Tournament & Career Statistics
        </h2>
        <p className="text-xs text-slate-400">
          Cumulative performance figures calculated across {matches.length} matches
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Top Run Scorers */}
        <div className="p-4 rounded-2xl bg-[#0a1228] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Leading Run Scorers
            </h3>
          </div>

          <div className="space-y-2">
            {topRunScorers.map((p, idx) => (
              <div
                key={p.id}
                className="p-2.5 rounded-xl bg-slate-900/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-amber-400">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-white block">{p.fullName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {getTeamName(p.teamId)} • {p.stats.innings} Innings
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-black text-amber-400 text-sm block">
                    {p.stats.runs}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    SR: {p.stats.ballsFaced > 0 ? ((p.stats.runs / p.stats.ballsFaced) * 100).toFixed(0) : 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leading Wicket Takers */}
        <div className="p-4 rounded-2xl bg-[#0a1228] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Target className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Leading Wicket Takers
            </h3>
          </div>

          <div className="space-y-2">
            {topWicketTakers.map((p, idx) => (
              <div
                key={p.id}
                className="p-2.5 rounded-xl bg-slate-900/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-blue-400">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-white block">{p.fullName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {getTeamName(p.teamId)} • {p.stats.oversBowled} Overs
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-black text-blue-400 text-sm block">
                    {p.stats.wickets}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Best: {p.stats.bestBowlingWickets}/{p.stats.bestBowlingRuns}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Highest Scores Card */}
      <div className="p-4 rounded-2xl bg-[#0a1228] border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Award className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Highest Individual Scores
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {highestScores.map((p) => (
            <div key={p.id} className="p-3 rounded-xl bg-slate-900/70 text-center">
              <span className="text-[10px] text-slate-400 block truncate">{p.fullName}</span>
              <span className="text-lg font-black text-purple-400 font-mono block my-0.5">
                {p.stats.highestScore}*
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{getTeamName(p.teamId)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
