/**
 * Screen 12: Full Scorecard View
 * Comprehensive match scorecard with Man of the Match (MOTM) spotlight,
 * one-click PDF summary generator, innings breakdown, batting tables,
 * bowling tables, extras, and fall of wickets.
 */

import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Trophy,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Download,
  Star,
  Award,
} from 'lucide-react';
import { Match, Team, Player, Innings } from '../../types/cricket';
import { ScoringEngine } from '../../services/scoringEngine';
import { calculateManOfTheMatch } from '../../services/manOfTheMatch';
import { generateMatchSummaryPDF } from '../../services/pdfGenerator';
import { MotmTrophyIcon, PdfIcon, CricketBallIcon } from '../brand/CricketIcons';
import { ShareMatchModal } from '../scoring/ShareMatchModal';

interface FullScorecardViewProps {
  match: Match;
  teams: Team[];
  players: Player[];
  onBack: () => void;
}

export const FullScorecardView: React.FC<FullScorecardViewProps> = ({
  match,
  teams,
  players,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<1 | 2>(1);
  const [copied, setCopied] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const teamA = teams.find((t) => t.id === match.teamAId);
  const teamB = teams.find((t) => t.id === match.teamBId);

  const inn1 = match.innings[1];
  const inn2 = match.innings[2];

  const currentInnings: Innings | undefined = activeTab === 1 ? inn1 : inn2;

  // Calculate Man of the Match automatically
  const motm = calculateManOfTheMatch(match, teams, players);

  const getPlayerName = (id: string) => {
    const p = players.find((player) => player.id === id);
    return p ? p.fullName : 'Player';
  };

  const getTeamName = (id: string) => {
    const t = teams.find((team) => team.id === id);
    return t ? t.name : 'Team';
  };

  const handleCopyTextScorecard = () => {
    let summaryText = `🏏 *${match.title.toUpperCase()}*\n📅 ${match.date} | ${match.venue || 'Stadium'}\n\n`;

    if (inn1) {
      summaryText += `1st Innings: ${getTeamName(inn1.battingTeamId)} - ${inn1.totalRuns}/${inn1.wickets} (${ScoringEngine.formatOvers(inn1.legalDeliveries)} ov)\n`;
    }
    if (inn2) {
      summaryText += `2nd Innings: ${getTeamName(inn2.battingTeamId)} - ${inn2.totalRuns}/${inn2.wickets} (${ScoringEngine.formatOvers(inn2.legalDeliveries)} ov)\n`;
    }
    if (match.resultSummary) {
      summaryText += `\n🏆 Result: ${match.resultSummary}\n`;
    }
    if (motm) {
      summaryText += `★ Man of the Match: ${motm.playerName} (${motm.summary})\n`;
    }
    summaryText += `\nScored on Mahi Crick Pro`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPdf = () => {
    setIsPdfGenerating(true);
    try {
      generateMatchSummaryPDF(match, teams, players);
    } catch (err: any) {
      alert(`PDF Error: ${err.message}`);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return (
    <div className="p-3.5 sm:p-5 max-w-3xl mx-auto space-y-4 pb-24 select-none">
      {/* Top Header & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Download Match Summary PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isPdfGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/25 active:scale-95 transition-all cursor-pointer"
            title="Download Official Match Summary PDF"
          >
            <PdfIcon className="w-3.5 h-3.5" />
            <span>{isPdfGenerating ? 'Generating...' : 'PDF Summary'}</span>
          </button>

          {/* Share Live Link */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/25 active:scale-95 transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Link</span>
          </button>

          {/* Copy Text Summary */}
          <button
            onClick={handleCopyTextScorecard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>
        </div>
      </div>

      {/* Match Header Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#0e1b3d] to-[#0a1226] border border-slate-800 space-y-2.5 shadow-xl">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold text-amber-400 uppercase tracking-widest">
            {match.matchFormat} • {match.oversPerInnings} Overs
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {match.date}
            </span>
            {match.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {match.venue}
              </span>
            )}
          </div>
        </div>

        <h2 className="text-lg sm:text-xl font-black text-white">{match.title}</h2>

        {/* Results Banner */}
        {match.resultSummary && (
          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{match.resultSummary}</span>
          </div>
        )}
      </div>

      {/* MAN OF THE MATCH / PLAYER OF THE MATCH SPOTLIGHT CARD */}
      {motm && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1f1604] via-[#241a06] to-[#120f04] border-2 border-amber-400/80 p-4 sm:p-5 shadow-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/30">
                <MotmTrophyIcon className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                  OFFICIAL MAN OF THE MATCH
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {motm.playerName}
                </h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-amber-300 block">{motm.teamName}</span>
              <span className="text-[10px] font-mono text-slate-400">{motm.totalPoints} Impact Pts</span>
            </div>
          </div>

          <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center gap-3 text-xs">
            <div className="text-amber-200 font-semibold">
              Performance: <span className="text-white font-mono">{motm.summary}</span>
            </div>

            {motm.batting && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-300 font-mono">
                SR: {motm.batting.strikeRate}
              </span>
            )}
            {motm.bowling && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-300 font-mono">
                Econ: {motm.bowling.economy}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Innings Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => setActiveTab(1)}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 1
              ? 'bg-amber-400 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          1st Innings ({inn1 ? getTeamName(inn1.battingTeamId) : 'Team 1'})
          {inn1 && ` - ${inn1.totalRuns}/${inn1.wickets}`}
        </button>

        {inn2 && (
          <button
            onClick={() => setActiveTab(2)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 2
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2nd Innings ({getTeamName(inn2.battingTeamId)})
            {` - ${inn2.totalRuns}/${inn2.wickets}`}
          </button>
        )}
      </div>

      {/* Active Innings Details */}
      {currentInnings ? (
        <div className="space-y-4">
          {/* Batting Table */}
          <div className="rounded-3xl bg-[#0a1228] border border-slate-800 overflow-hidden shadow-lg">
            <div className="p-3.5 bg-[#0d1630] border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Batting • {getTeamName(currentInnings.battingTeamId)}
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {currentInnings.totalRuns} / {currentInnings.wickets} (
                {ScoringEngine.formatOvers(currentInnings.legalDeliveries)} ov)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider bg-slate-900/40">
                    <th className="py-2.5 px-3">Batter</th>
                    <th className="py-2.5 px-2">Dismissal</th>
                    <th className="py-2.5 px-2 text-right">R</th>
                    <th className="py-2.5 px-2 text-right">B</th>
                    <th className="py-2.5 px-2 text-right">4s</th>
                    <th className="py-2.5 px-2 text-right">6s</th>
                    <th className="py-2.5 px-3 text-right">SR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {Object.values(currentInnings.batters).map((b) => {
                    const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0';
                    let dismissalDesc = 'not out';
                    if (b.isOut) {
                      if (b.dismissalType === 'bowled') dismissalDesc = 'b ' + getPlayerName(b.bowlerCreditedId || '');
                      else if (b.dismissalType === 'caught') dismissalDesc = 'c ' + getPlayerName(b.fielderId || '') + ' b ' + getPlayerName(b.bowlerCreditedId || '');
                      else if (b.dismissalType === 'lbw') dismissalDesc = 'lbw b ' + getPlayerName(b.bowlerCreditedId || '');
                      else if (b.dismissalType === 'run_out') dismissalDesc = 'run out';
                      else if (b.dismissalType === 'stumped') dismissalDesc = 'st ' + getPlayerName(b.fielderId || '') + ' b ' + getPlayerName(b.bowlerCreditedId || '');
                      else dismissalDesc = b.dismissalType || 'out';
                    }

                    return (
                      <tr key={b.playerId} className="hover:bg-slate-900/30">
                        <td className="py-2.5 px-3 font-sans font-semibold text-white">
                          {getPlayerName(b.playerId)}
                        </td>
                        <td className="py-2.5 px-2 font-sans text-[11px] text-slate-400 truncate max-w-[140px]">
                          {dismissalDesc}
                        </td>
                        <td className="py-2.5 px-2 text-right font-bold text-amber-400">{b.runs}</td>
                        <td className="py-2.5 px-2 text-right text-slate-300">{b.balls}</td>
                        <td className="py-2.5 px-2 text-right text-slate-300">{b.fours}</td>
                        <td className="py-2.5 px-2 text-right text-slate-300">{b.sixes}</td>
                        <td className="py-2.5 px-3 text-right text-slate-300">{sr}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Extras Row */}
            <div className="p-3 border-t border-slate-800 bg-[#070d1e] flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Extras:{' '}
                <span className="font-mono text-slate-300">
                  (w {currentInnings.extras.wides}, nb {currentInnings.extras.noballs}, b{' '}
                  {currentInnings.extras.byes}, lb {currentInnings.extras.legbyes})
                </span>
              </span>
              <span className="font-mono font-bold text-white">{currentInnings.extras.total}</span>
            </div>
          </div>

          {/* Bowling Table */}
          <div className="rounded-3xl bg-[#0a1228] border border-slate-800 overflow-hidden shadow-lg">
            <div className="p-3.5 bg-[#0d1630] border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Bowling • {getTeamName(currentInnings.bowlingTeamId)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider bg-slate-900/40">
                    <th className="py-2.5 px-3">Bowler</th>
                    <th className="py-2.5 px-2 text-right">O</th>
                    <th className="py-2.5 px-2 text-right">M</th>
                    <th className="py-2.5 px-2 text-right">R</th>
                    <th className="py-2.5 px-2 text-right">W</th>
                    <th className="py-2.5 px-3 text-right">ECON</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {Object.values(currentInnings.bowlers).map((bw) => {
                    const ov = ScoringEngine.formatOvers(bw.balls);
                    const econ =
                      bw.balls > 0 ? (bw.runs / (bw.balls / 6)).toFixed(2) : '0.00';

                    return (
                      <tr key={bw.playerId} className="hover:bg-slate-900/30">
                        <td className="py-2.5 px-3 font-sans font-semibold text-white">
                          {getPlayerName(bw.playerId)}
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-300">{ov}</td>
                        <td className="py-2.5 px-2 text-right text-slate-300">{bw.maidens}</td>
                        <td className="py-2.5 px-2 text-right text-slate-300">{bw.runs}</td>
                        <td className="py-2.5 px-2 text-right font-bold text-amber-400">
                          {bw.wickets}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-300">{econ}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fall of Wickets */}
          {currentInnings.fallOfWickets.length > 0 && (
            <div className="p-3.5 rounded-3xl bg-[#0a1228] border border-slate-800 space-y-2 shadow-md">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Fall of Wickets
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {currentInnings.fallOfWickets.map((fow, i) => (
                  <div
                    key={i}
                    className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-slate-300"
                  >
                    <span className="font-bold text-amber-400">
                      {fow.runs}/{fow.wicketNumber}
                    </span>{' '}
                    <span className="text-slate-400 text-[11px]">
                      ({getPlayerName(fow.batterId)}, {fow.overStr} ov)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-slate-400">
          Innings details not yet available.
        </div>
      )}

      {/* Share Modal */}
      <ShareMatchModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        match={match}
        teamAName={teamA?.name || 'Team A'}
        teamBName={teamB?.name || 'Team B'}
      />
    </div>
  );
};
