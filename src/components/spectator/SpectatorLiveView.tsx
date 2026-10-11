/**
 * Spectator / Fan Live Match Broadcast Screen
 * Clean, distraction-free live viewer for spectators opening a shared link on their phone.
 * Supports real-time cloud synchronization, ball-by-ball commentary, wagon wheel,
 * and full innings scorecard breakdown.
 */

import React, { useState } from 'react';
import {
  Trophy,
  Share2,
  Copy,
  Check,
  Calendar,
  MapPin,
  ChevronRight,
  Flame,
  Radio,
  FileSpreadsheet,
  ArrowLeft,
  Volume2,
  Wifi,
} from 'lucide-react';
import { Match, Team, Player, Delivery } from '../../types/cricket';
import { ScoringEngine } from '../../services/scoringEngine';
import { WagonWheelGround } from '../scoring/WagonWheelGround';

interface SpectatorLiveViewProps {
  match: Match;
  teams: Team[];
  players: Player[];
  onBackToScorer?: () => void;
  isPublicSharedView?: boolean;
}

export const SpectatorLiveView: React.FC<SpectatorLiveViewProps> = ({
  match,
  teams,
  players,
  onBackToScorer,
  isPublicSharedView = false,
}) => {
  const [activeTab, setActiveTab] = useState<'commentary' | 'wagon_wheel' | 'scorecard'>('commentary');
  const [copied, setCopied] = useState(false);

  const innNum = match.currentInningsNumber;
  const currentInnings = match.innings[innNum];
  const inn1 = match.innings[1];
  const inn2 = match.innings[2];

  // Resolve team names with fallback for cloud spectator viewers
  const battingTeam = teams.find((t) => t.id === currentInnings?.battingTeamId) || {
    id: currentInnings?.battingTeamId || 'team-a',
    name:
      currentInnings?.battingTeamId === match.teamAId
        ? (match as any).teamAName || 'Batting Team'
        : (match as any).teamBName || 'Batting Team',
    shortName:
      currentInnings?.battingTeamId === match.teamAId
        ? (match as any).teamAShortName || 'BAT'
        : (match as any).teamBShortName || 'BAT',
    primaryColor: (match as any).teamAColor || '#F59E0B',
  };

  const bowlingTeam = teams.find((t) => t.id === currentInnings?.bowlingTeamId) || {
    id: currentInnings?.bowlingTeamId || 'team-b',
    name:
      currentInnings?.bowlingTeamId === match.teamAId
        ? (match as any).teamAName || 'Bowling Team'
        : (match as any).teamBName || 'Bowling Team',
    shortName:
      currentInnings?.bowlingTeamId === match.teamAId
        ? (match as any).teamAShortName || 'BOWL'
        : (match as any).teamBShortName || 'BOWL',
    primaryColor: (match as any).teamBColor || '#3B82F6',
  };

  const getPlayerName = (id?: string) => {
    if (!id) return 'Player';
    const p = players.find((player) => player.id === id);
    if (p) return p.fullName;
    if ((match as any).playerNamesMap && (match as any).playerNamesMap[id]) {
      return (match as any).playerNamesMap[id];
    }
    return id.replace(/^p-/, '').replace(/-/g, ' ');
  };

  const striker = players.find((p) => p.id === currentInnings?.currentStrikerId) || {
    id: currentInnings?.currentStrikerId || '',
    fullName: getPlayerName(currentInnings?.currentStrikerId),
  };

  const nonStriker = players.find((p) => p.id === currentInnings?.currentNonStrikerId) || {
    id: currentInnings?.currentNonStrikerId || '',
    fullName: getPlayerName(currentInnings?.currentNonStrikerId),
  };

  const bowler = players.find((p) => p.id === currentInnings?.currentBowlerId) || {
    id: currentInnings?.currentBowlerId || '',
    fullName: getPlayerName(currentInnings?.currentBowlerId),
  };

  const strikerRecord = currentInnings?.currentStrikerId
    ? currentInnings.batters[currentInnings.currentStrikerId]
    : null;
  const nonStrikerRecord = currentInnings?.currentNonStrikerId
    ? currentInnings.batters[currentInnings.currentNonStrikerId]
    : null;
  const bowlerRecord = currentInnings?.currentBowlerId
    ? currentInnings.bowlers[currentInnings.currentBowlerId]
    : null;

  // Recent Deliveries Commentary list (reversed so newest on top)
  const allDeliveries = currentInnings ? [...currentInnings.deliveries].reverse() : [];

  // Share link generator
  const handleShareLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?liveMatchId=${match.id}&view=spectator`;

    const shareText = `🏏 LIVE CRICKET: ${match.title}\n${battingTeam.shortName}: ${currentInnings?.totalRuns}/${currentInnings?.wickets} (${ScoringEngine.formatOvers(currentInnings?.legalDeliveries || 0)} ov)\nWatch Live Scorecard: ${shareUrl}`;

    if (navigator.share) {
      navigator
        .share({
          title: `Live Cricket: ${match.title}`,
          text: shareText,
          url: shareUrl,
        })
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?liveMatchId=${match.id}&view=spectator`;
    const shareText = encodeURIComponent(
      `🏏 LIVE CRICKET: ${match.title}\n${battingTeam.shortName}: ${currentInnings?.totalRuns}/${currentInnings?.wickets} (${ScoringEngine.formatOvers(currentInnings?.legalDeliveries || 0)} ov)\nLive Score Link: ${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
  };

  return (
    <div className="p-3 sm:p-5 max-w-2xl mx-auto space-y-4 pb-20 select-none">
      {/* Top Bar with Live Indicator & Sharing */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {onBackToScorer && (
            <button
              onClick={onBackToScorer}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Scorer Panel</span>
            </button>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>LIVE BROADCAST</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span>Synced</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
            title="Share on WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleShareLink}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-md cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Main Broadcast TV Score Banner */}
      <div className="rounded-3xl bg-gradient-to-b from-[#111f44] to-[#071026] border border-amber-500/40 p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-bold text-amber-400 uppercase tracking-widest">
            {match.matchFormat} • {match.oversPerInnings} OVERS
          </span>
          <span>{match.venue || match.date}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: battingTeam.primaryColor || '#F59E0B' }}
              />
              <h1 className="text-xl sm:text-2xl font-black text-white">{battingTeam.name}</h1>
            </div>
            <span className="text-xs text-slate-400">vs {bowlingTeam.name}</span>
          </div>

          <div className="text-right">
            <div className="text-4xl sm:text-5xl font-black text-amber-400 font-mono tracking-tight drop-shadow-md">
              {currentInnings?.totalRuns || 0}
              <span className="text-2xl sm:text-3xl text-slate-400 font-normal">/</span>
              {currentInnings?.wickets || 0}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-300 font-mono mt-0.5">
              Overs: {ScoringEngine.formatOvers(currentInnings?.legalDeliveries || 0)} / {match.oversPerInnings}
            </div>
          </div>
        </div>

        {/* Chasing equation / Status */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div>
            CRR:{' '}
            <span className="font-bold text-white font-mono">
              {ScoringEngine.calculateCRR(
                currentInnings?.totalRuns || 0,
                currentInnings?.legalDeliveries || 0
              )}
            </span>
          </div>

          {innNum === 2 && currentInnings?.target && (
            <div className="text-amber-400 font-bold">
              Need {Math.max(0, currentInnings.target - currentInnings.totalRuns)} in{' '}
              {Math.max(0, match.oversPerInnings * 6 - currentInnings.legalDeliveries)}b
            </div>
          )}

          {innNum === 2 && currentInnings?.target ? (
            <div>
              RRR:{' '}
              <span className="font-bold text-amber-400 font-mono">
                {ScoringEngine.calculateRRR(
                  currentInnings.target,
                  currentInnings.totalRuns,
                  match.oversPerInnings * 6 - currentInnings.legalDeliveries
                )}
              </span>
            </div>
          ) : (
            <div>
              {match.status === 'innings_break' ? (
                <span className="text-amber-300 font-bold">Innings Break</span>
              ) : (
                <span>1st Innings</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Innings Break Notification Banner for Spectators */}
      {match.status === 'innings_break' && (
        <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-center space-y-1 animate-fade-in">
          <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
            ⏸️ 1st Innings Finished
          </span>
          <p className="text-sm font-bold text-white">
            Target: {(inn1?.totalRuns || 0) + 1} runs in {match.oversPerInnings} overs
          </p>
          <p className="text-xs text-slate-300">
            2nd Innings starting shortly... stay tuned!
          </p>
        </div>
      )}

      {/* Match Completed Banner */}
      {match.status === 'completed' && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-center space-y-1 animate-fade-in">
          <Trophy className="w-7 h-7 text-amber-400 mx-auto" />
          <h3 className="text-base font-black text-white">MATCH COMPLETED</h3>
          <p className="text-xs font-bold text-emerald-400">{match.resultSummary}</p>
        </div>
      )}

      {/* Batters & Bowler Telemetry Cards (When match in progress) */}
      {match.status === 'live' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Batters */}
          <div className="p-3.5 rounded-2xl bg-[#0a1228] border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Batters at Crease
            </span>

            {striker.fullName && (
              <div className="p-2 rounded-xl bg-slate-900/80 border border-amber-400/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-bold text-white">{striker.fullName} *</span>
                </div>
                <div className="font-mono text-amber-400 font-bold">
                  {strikerRecord?.runs || 0}{' '}
                  <span className="text-slate-400 font-normal">({strikerRecord?.balls || 0})</span>
                </div>
              </div>
            )}

            {nonStriker.fullName && (
              <div className="p-2 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300">{nonStriker.fullName}</span>
                <div className="font-mono text-slate-200 font-bold">
                  {nonStrikerRecord?.runs || 0}{' '}
                  <span className="text-slate-400 font-normal">({nonStrikerRecord?.balls || 0})</span>
                </div>
              </div>
            )}
          </div>

          {/* Bowler */}
          <div className="p-3.5 rounded-2xl bg-[#0a1228] border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Current Bowler
            </span>

            {bowler.fullName ? (
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white">{bowler.fullName}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Overs: {ScoringEngine.formatOvers(bowlerRecord?.balls || 0)}
                  </span>
                </div>
                <div className="text-right font-mono font-bold text-white">
                  {bowlerRecord?.wickets || 0} - {bowlerRecord?.runs || 0}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">Bowler ready</div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('commentary')}
          className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'commentary'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Ball-by-Ball Feed
        </button>

        <button
          onClick={() => setActiveTab('wagon_wheel')}
          className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'wagon_wheel'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Wagon Wheel (Shots)
        </button>

        <button
          onClick={() => setActiveTab('scorecard')}
          className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'scorecard'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Scorecard
        </button>
      </div>

      {/* TAB 1: Live Commentary Feed */}
      {activeTab === 'commentary' && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {allDeliveries.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 rounded-2xl bg-[#0a1228] border border-slate-800">
              No deliveries recorded yet. Waiting for play to start...
            </div>
          ) : (
            allDeliveries.map((del) => {
              let tagColor = 'bg-slate-800 text-slate-300';
              if (del.isWicket) tagColor = 'bg-rose-600 text-white font-black';
              else if (del.isSix) tagColor = 'bg-purple-600 text-white font-black';
              else if (del.isFour) tagColor = 'bg-blue-600 text-white font-black';
              else if (del.extraType === 'wide' || del.extraType === 'noball')
                tagColor = 'bg-amber-600 text-white font-bold';

              return (
                <div
                  key={del.id}
                  className="p-3 rounded-xl bg-[#0a1228] border border-slate-800 flex items-start gap-3 text-xs"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold shrink-0 ${tagColor}`}
                  >
                    {del.isWicket ? 'W' : del.runsBatter + del.runsExtra}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>
                        Over {del.overIndex}.{del.ballInOver} • {getPlayerName(del.bowlerId)} to{' '}
                        {getPlayerName(del.strikerId)}
                      </span>
                      <span className="font-mono">
                        {new Date(del.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-100 mt-0.5">{del.commentary}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: Wagon Wheel Shot Distribution */}
      {activeTab === 'wagon_wheel' && (
        <div className="p-4 rounded-2xl bg-[#0a1228] border border-slate-800 space-y-4 text-center">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Shot Direction Field Placement
          </h3>
          <WagonWheelGround
            interactive={false}
            onSelectDirection={() => {}}
            selectedDirection={allDeliveries[0]?.shotDirection}
          />

          {/* Shot counts by sector */}
          <div className="pt-2 border-t border-slate-800 grid grid-cols-4 gap-2 text-xs">
            {[
              'cover',
              'point',
              'third_man',
              'fine_leg',
              'square_leg',
              'mid_wicket',
              'long_on',
              'straight',
            ].map((sector) => {
              const count = allDeliveries.filter((d) => d.shotDirection === sector).length;
              return (
                <div key={sector} className="p-2 rounded-xl bg-slate-900/60">
                  <span className="text-[10px] text-slate-400 capitalize block truncate">
                    {sector.replace('_', ' ')}
                  </span>
                  <span className="font-bold text-amber-400 font-mono">{count} shots</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Full Scorecard */}
      {activeTab === 'scorecard' && (
        <div className="space-y-4 text-xs">
          {[1, 2].map((iNum) => {
            const inn = match.innings[iNum as 1 | 2];
            if (!inn) return null;
            const bTeamName =
              inn.battingTeamId === match.teamAId
                ? (match as any).teamAName || 'Team A'
                : (match as any).teamBName || 'Team B';

            return (
              <div
                key={iNum}
                className="p-4 rounded-2xl bg-[#0a1228] border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-black text-amber-400 uppercase">
                    {iNum === 1 ? '1st' : '2nd'} Innings - {bTeamName}
                  </span>
                  <span className="font-mono font-bold text-white">
                    {inn.totalRuns}/{inn.wickets} ({ScoringEngine.formatOvers(inn.legalDeliveries)} ov)
                  </span>
                </div>

                {/* Batting list */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Batting
                  </span>
                  {Object.values(inn.batters).map((b) => (
                    <div
                      key={b.playerId}
                      className="flex items-center justify-between py-1 border-b border-slate-800/50"
                    >
                      <div>
                        <span className="font-bold text-slate-200">
                          {getPlayerName(b.playerId)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {b.isOut ? (b.dismissalType || 'Out') : 'not out'}
                        </span>
                      </div>
                      <div className="font-mono text-right">
                        <span className="font-bold text-white">{b.runs}</span>
                        <span className="text-slate-400 text-[10px]"> ({b.balls}b, {b.fours}x4, {b.sixes}x6)</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bowling list */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Bowling
                  </span>
                  {Object.values(inn.bowlers).map((bw) => (
                    <div
                      key={bw.playerId}
                      className="flex items-center justify-between py-1 border-b border-slate-800/50"
                    >
                      <span className="font-bold text-slate-200">
                        {getPlayerName(bw.playerId)}
                      </span>
                      <div className="font-mono text-right text-slate-300">
                        <span className="font-bold text-white">
                          {bw.wickets}-{bw.runs}
                        </span>{' '}
                        <span className="text-slate-400 text-[10px]">
                          ({ScoringEngine.formatOvers(bw.balls)} ov, M: {bw.maidens})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
