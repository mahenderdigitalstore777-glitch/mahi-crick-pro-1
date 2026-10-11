/**
 * Screen 11: Match History
 * Local-first repository of In Progress and Completed matches with filters and management
 */

import React, { useState, useMemo } from 'react';
import {
  History,
  Play,
  FileSpreadsheet,
  Trash2,
  Calendar,
  Clock,
  Trophy,
  Search,
  Filter,
  AlertTriangle,
  Share2,
} from 'lucide-react';
import { Match, Team, Player } from '../../types/cricket';
import { ScoringEngine } from '../../services/scoringEngine';
import { storageService } from '../../services/storage';
import { generateMatchSummaryPDF } from '../../services/pdfGenerator';
import { PdfIcon } from '../brand/CricketIcons';
import { ShareMatchModal } from '../scoring/ShareMatchModal';

interface MatchHistoryProps {
  matches: Match[];
  teams: Team[];
  players?: Player[];
  onResumeMatch: (matchId: string) => void;
  onViewScorecard: (matchId: string) => void;
  onRefreshData: () => void;
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({
  matches,
  teams,
  players = [],
  onResumeMatch,
  onViewScorecard,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'in_progress' | 'completed'>('completed');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [sharingMatch, setSharingMatch] = useState<Match | null>(null);

  const getTeamName = (teamId: string) => {
    const t = teams.find((team) => team.id === teamId);
    return t ? t.shortName : 'TEAM';
  };

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const matchStatus =
        activeTab === 'in_progress'
          ? m.status === 'live' || m.status === 'innings_break'
          : m.status === 'completed' || m.status === 'abandoned';

      const matchFormat = formatFilter === 'all' || m.matchFormat === formatFilter;

      const matchQuery =
        !searchQuery.trim() ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.venue && m.venue.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchStatus && matchFormat && matchQuery;
    });
  }, [matches, activeTab, formatFilter, searchQuery]);

  const handleDelete = (id: string) => {
    storageService.deleteMatch(id);
    setDeleteConfirmId(null);
    onRefreshData();
  };

  const handleAbandon = (match: Match) => {
    const copy: Match = { ...match, status: 'abandoned', resultSummary: 'Match Abandoned' };
    storageService.saveMatch(copy);
    onRefreshData();
  };

  const inProgressCount = matches.filter((m) => m.status === 'live' || m.status === 'innings_break').length;
  const completedCount = matches.filter((m) => m.status === 'completed').length;

  return (
    <div className="p-3.5 sm:p-5 max-w-3xl mx-auto space-y-4 pb-24 select-none">
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
          <History className="w-5 h-5 text-amber-400" />
          Match Archives
        </h2>
        <p className="text-xs text-slate-400">
          Persistent offline history of all tournament and bilateral matches
        </p>
      </div>

      {/* Tabs: In Progress vs Completed */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => setActiveTab('in_progress')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'in_progress'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>In Progress</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-amber-400 font-mono">
            {inProgressCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'completed'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Completed</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
            {completedCount}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-2xl bg-[#0a1228] border border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="relative">
          <input
            type="text"
            placeholder="Search match title or ground..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <select
          value={formatFilter}
          onChange={(e) => setFormatFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
        >
          <option value="all">All Formats</option>
          <option value="T5">T5</option>
          <option value="T10">T10</option>
          <option value="T15">T15</option>
          <option value="T20">T20</option>
          <option value="ODI">ODI</option>
          <option value="CUSTOM">Custom</option>
        </select>
      </div>

      {/* Matches List */}
      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-[#0a1228] border border-slate-800/80">
            <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No matches found</p>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'in_progress'
                ? 'No active matches currently in progress.'
                : 'No completed match records match your filters.'}
            </p>
          </div>
        ) : (
          filteredMatches.map((m) => {
            const inn1 = m.innings[1];
            const inn2 = m.innings[2];
            const isInProgress = m.status === 'live' || m.status === 'innings_break';

            return (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-[#0a1228] border border-slate-800/80 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400 font-mono">
                      {m.matchFormat} ({m.oversPerInnings} ov)
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {m.date}
                    </span>
                  </div>

                  <button
                    onClick={() => setDeleteConfirmId(m.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-400"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <h3 className="text-sm font-bold text-white">{m.title}</h3>
                    <div className="mt-1 space-y-0.5 text-xs">
                      {inn1 && (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-300">
                            {getTeamName(inn1.battingTeamId)}:
                          </span>
                          <span className="font-mono text-slate-200">
                            {inn1.totalRuns}/{inn1.wickets} (
                            {ScoringEngine.formatOvers(inn1.legalDeliveries)} ov)
                          </span>
                        </div>
                      )}
                      {inn2 && (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-300">
                            {getTeamName(inn2.battingTeamId)}:
                          </span>
                          <span className="font-mono text-slate-200">
                            {inn2.totalRuns}/{inn2.wickets} (
                            {ScoringEngine.formatOvers(inn2.legalDeliveries)} ov)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2">
                    {isInProgress ? (
                      <button
                        onClick={() => onResumeMatch(m.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md"
                      >
                        <Play className="w-3.5 h-3.5 fill-slate-950" />
                        <span>Resume</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <button
                          onClick={() => onViewScorecard(m.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs cursor-pointer"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                          <span>Scorecard</span>
                        </button>

                        <button
                          onClick={() => generateMatchSummaryPDF(m, teams, players)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold text-xs border border-rose-500/30 cursor-pointer"
                          title="Download Match Summary PDF"
                        >
                          <PdfIcon className="w-3 h-3" />
                          <span>PDF</span>
                        </button>

                        <button
                          onClick={() => setSharingMatch(m)}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 cursor-pointer"
                          title="Share Match Link"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {isInProgress && (
                      <button
                        onClick={() => handleAbandon(m)}
                        className="text-[10px] text-rose-400 hover:underline"
                      >
                        Abandon Match
                      </button>
                    )}
                  </div>
                </div>

                {m.resultSummary && (
                  <div className="pt-2 border-t border-slate-800/80 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>{m.resultSummary}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setDeleteConfirmId(null)} className="fixed inset-0 bg-black/70 backdrop-blur-xs" />
          <div className="relative w-full max-w-sm bg-[#0a1228] border border-rose-500/30 rounded-2xl p-5 z-10 text-center">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white">Delete Match Record?</h3>
            <p className="text-xs text-slate-300 mt-1">
              This will permanently delete this match scorecard and all delivery history from your local device.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {sharingMatch && (
        <ShareMatchModal
          isOpen={true}
          onClose={() => setSharingMatch(null)}
          match={sharingMatch}
          teamAName={getTeamName(sharingMatch.teamAId)}
          teamBName={getTeamName(sharingMatch.teamBId)}
        />
      )}
    </div>
  );
};
