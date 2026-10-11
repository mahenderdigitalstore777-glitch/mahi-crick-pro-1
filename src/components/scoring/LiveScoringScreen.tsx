/**
 * Screen 9: Live Cricket Scoring Screen (Ultra-Tactile & Voice-Enhanced)
 * Featuring massive thumb-friendly scoring buttons, voice mic input,
 * audio commentary synthesizer, wagon wheel shot placement, 2nd innings management,
 * and live spectator broadcast link.
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  ArrowLeftRight,
  UserCheck,
  FileSpreadsheet,
  Pause,
  Award,
  Trophy,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Share2,
  Tv,
  Check,
  Compass,
  Play,
  Flag,
  Radio,
  Wifi,
} from 'lucide-react';
import { Match, Player, Team, ExtraType, DismissalType, ShotDirection } from '../../types/cricket';
import { ScoringEngine, ScoreDeliveryParams } from '../../services/scoringEngine';
import { storageService } from '../../services/storage';
import { audioHaptics } from '../../services/audioHaptics';
import { voiceCommentaryService } from '../../services/voiceCommentary';
import { CustomRunsModal } from './CustomRunsModal';
import { WicketModal } from './WicketModal';
import { ChangeBowlerModal } from './ChangeBowlerModal';
import { WagonWheelGround } from './WagonWheelGround';
import { ShareMatchModal } from './ShareMatchModal';
import { calculateManOfTheMatch } from '../../services/manOfTheMatch';
import { generateMatchSummaryPDF } from '../../services/pdfGenerator';
import { MotmTrophyIcon, PdfIcon } from '../brand/CricketIcons';

interface LiveScoringScreenProps {
  match: Match;
  teams: Team[];
  players: Player[];
  onUpdateMatch: (updated: Match) => void;
  onPauseAndExit: () => void;
  onViewScorecard: (matchId: string) => void;
  onOpenSpectatorView: () => void;
}

export const LiveScoringScreen: React.FC<LiveScoringScreenProps> = ({
  match,
  teams,
  players,
  onUpdateMatch,
  onPauseAndExit,
  onViewScorecard,
  onOpenSpectatorView,
}) => {
  const [currentMatch, setCurrentMatch] = useState<Match>(match);
  const [isCustomRunsOpen, setIsCustomRunsOpen] = useState(false);
  const [isWicketOpen, setIsWicketOpen] = useState(false);
  const [isChangeBowlerOpen, setIsChangeBowlerOpen] = useState(false);
  const [showOverCompletePrompt, setShowOverCompletePrompt] = useState(false);
  const [showDeclareConfirm, setShowDeclareConfirm] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // 2nd Innings Lineup Selection
  const [secondInningsStrikerId, setSecondInningsStrikerId] = useState<string>('');
  const [secondInningsNonStrikerId, setSecondInningsNonStrikerId] = useState<string>('');
  const [secondInningsBowlerId, setSecondInningsBowlerId] = useState<string>('');

  // Sensory & Voice Controls
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceCommentaryEnabled, setVoiceCommentaryEnabled] = useState(true);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  // Shot Direction (Wagon Wheel)
  const [selectedShotDirection, setSelectedShotDirection] = useState<ShotDirection | undefined>(undefined);
  const [showWagonWheelDrawer, setShowWagonWheelDrawer] = useState(false);

  // Link copy feedback
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setCurrentMatch(match);
  }, [match]);

  const inningsNum = currentMatch.currentInningsNumber;
  const innings = currentMatch.innings[inningsNum];

  // Initialize 2nd innings lineup candidates if in innings break
  useEffect(() => {
    if (currentMatch.status === 'innings_break') {
      const inn1 = currentMatch.innings[1];
      if (inn1) {
        const chasingSquad =
          inn1.bowlingTeamId === currentMatch.teamAId
            ? currentMatch.teamAPlayers
            : currentMatch.teamBPlayers;
        const defendingSquad =
          inn1.battingTeamId === currentMatch.teamAId
            ? currentMatch.teamAPlayers
            : currentMatch.teamBPlayers;

        if (!secondInningsStrikerId && chasingSquad.length > 0) {
          setSecondInningsStrikerId(chasingSquad[0]);
        }
        if (!secondInningsNonStrikerId && chasingSquad.length > 1) {
          setSecondInningsNonStrikerId(chasingSquad[1]);
        }
        if (!secondInningsBowlerId && defendingSquad.length > 0) {
          setSecondInningsBowlerId(defendingSquad[defendingSquad.length - 1] || defendingSquad[0]);
        }
      }
    }
  }, [currentMatch.status, currentMatch.id]);

  if (!innings) {
    return (
      <div className="p-8 text-center text-white space-y-4">
        <p>Innings not found or match state unavailable.</p>
        <button
          onClick={onPauseAndExit}
          className="px-5 py-2.5 bg-amber-400 text-slate-950 font-bold rounded-xl cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const battingTeam = teams.find((t) => t.id === innings.battingTeamId);
  const bowlingTeam = teams.find((t) => t.id === innings.bowlingTeamId);

  const striker = players.find((p) => p.id === innings.currentStrikerId) || ({
    id: innings.currentStrikerId,
    fullName: 'Striker',
    stats: {} as any,
  } as Player);

  const nonStriker = players.find((p) => p.id === innings.currentNonStrikerId) || ({
    id: innings.currentNonStrikerId,
    fullName: 'Non-Striker',
    stats: {} as any,
  } as Player);

  const bowler = players.find((p) => p.id === innings.currentBowlerId) || ({
    id: innings.currentBowlerId,
    fullName: 'Bowler',
    stats: {} as any,
  } as Player);

  const strikerRecord = innings.batters[striker.id] || { runs: 0, balls: 0, fours: 0, sixes: 0 };
  const nonStrikerRecord = innings.batters[nonStriker.id] || { runs: 0, balls: 0, fours: 0, sixes: 0 };
  const bowlerRecord = innings.bowlers[bowler.id] || { balls: 0, maidens: 0, runs: 0, wickets: 0 };

  // Remaining eligible batters
  const battingSquadIds =
    innings.battingTeamId === currentMatch.teamAId
      ? currentMatch.teamAPlayers
      : currentMatch.teamBPlayers;
  const alreadyBattedIds = Object.keys(innings.batters);
  const availableNextBatterIds = battingSquadIds.filter((pid) => !alreadyBattedIds.includes(pid));
  const availableNextBatters = players.filter((p) => availableNextBatterIds.includes(p.id));

  // Fielding squad
  const bowlingSquadIds =
    innings.bowlingTeamId === currentMatch.teamAId
      ? currentMatch.teamAPlayers
      : currentMatch.teamBPlayers;
  const fieldingPlayers = players.filter((p) => bowlingSquadIds.includes(p.id));

  // Deliveries in current over
  const currentOverIndex = Math.floor(innings.legalDeliveries / 6);
  const deliveriesInCurrentOver = innings.deliveries.filter((d) => d.overIndex === currentOverIndex);

  // Commit delivery scoring event
  const handleScoreEvent = (params: ScoreDeliveryParams) => {
    try {
      // Audio synth feedback
      if (params.isWicket) {
        audioHaptics.playWicket(soundEnabled);
        audioHaptics.triggerHaptic('heavy');
      } else if (params.runsBatter === 6) {
        audioHaptics.playSixer(soundEnabled);
        audioHaptics.triggerHaptic('medium');
      } else if (params.runsBatter === 4) {
        audioHaptics.playBoundaryFour(soundEnabled);
        audioHaptics.triggerHaptic('medium');
      } else {
        audioHaptics.playTap(soundEnabled);
        audioHaptics.triggerHaptic('light');
      }

      // Attach selected shot direction
      const finalParams = {
        ...params,
        shotDirection: params.shotDirection || selectedShotDirection,
      };

      const updated = ScoringEngine.processDelivery(currentMatch, finalParams);

      // Voice Commentary Speech Announcer
      if (voiceCommentaryEnabled) {
        const inn = updated.innings[updated.currentInningsNumber];
        voiceCommentaryService.announceBallOutcome(
          striker.fullName,
          params.runsBatter,
          params.runsExtra,
          params.extraType,
          params.isWicket,
          params.wicketDetail?.dismissalType,
          inn ? `${inn.totalRuns} for ${inn.wickets}` : undefined
        );
      }

      // Check match victory / innings break
      if (updated.status === 'completed') {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        storageService.addNotification({
          title: 'Match Finished',
          message: `${updated.title} finished! ${updated.resultSummary}`,
          type: 'success',
        });
      } else if (updated.status === 'innings_break') {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        storageService.addNotification({
          title: 'Innings Break',
          message: `1st Innings finished with ${updated.innings[1].totalRuns} runs. Target: ${updated.innings[1].totalRuns + 1}.`,
          type: 'info',
        });
      } else {
        const prevBalls = innings.legalDeliveries;
        const targetInnings = updated.innings[updated.currentInningsNumber];
        const newBalls = targetInnings ? targetInnings.legalDeliveries : prevBalls;
        if (newBalls > prevBalls && newBalls % 6 === 0) {
          setShowOverCompletePrompt(true);
        }
      }

      // Reset chosen shot direction after recording
      setSelectedShotDirection(undefined);

      // Save to local storage + auto-sync to Firebase cloud
      storageService.saveMatch(updated);
      setCurrentMatch(updated);
      onUpdateMatch(updated);
    } catch (err: any) {
      alert(`Scoring Error: ${err.message}`);
    }
  };

  // Start Second Innings
  const handleStartSecondInnings = () => {
    try {
      const inn1 = currentMatch.innings[1];
      if (!inn1) return;

      const chasingSquad =
        inn1.bowlingTeamId === currentMatch.teamAId
          ? currentMatch.teamAPlayers
          : currentMatch.teamBPlayers;
      const defendingSquad =
        inn1.battingTeamId === currentMatch.teamAId
          ? currentMatch.teamAPlayers
          : currentMatch.teamBPlayers;

      const sId = secondInningsStrikerId || chasingSquad[0] || '';
      const nsId = secondInningsNonStrikerId || chasingSquad[1] || chasingSquad[0] || '';
      const bId =
        secondInningsBowlerId ||
        defendingSquad[defendingSquad.length - 1] ||
        defendingSquad[0] ||
        '';

      const updated = ScoringEngine.startSecondInnings(currentMatch, sId, nsId, bId);

      storageService.saveMatch(updated);
      setCurrentMatch(updated);
      onUpdateMatch(updated);

      audioHaptics.playTap(soundEnabled);
      audioHaptics.triggerHaptic('medium');
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.5 } });

      storageService.addNotification({
        title: '2nd Innings Started',
        message: `Target of ${inn1.totalRuns + 1} runs in ${currentMatch.oversPerInnings} overs.`,
        type: 'info',
      });
    } catch (err: any) {
      alert(`Error starting 2nd innings: ${err.message}`);
    }
  };

  // Declare Current Innings Early
  const handleDeclareInnings = () => {
    try {
      const updated = ScoringEngine.declareCurrentInnings(currentMatch);
      storageService.saveMatch(updated);
      setCurrentMatch(updated);
      onUpdateMatch(updated);
      setShowDeclareConfirm(false);
      audioHaptics.playTap(soundEnabled);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Voice Mic Recognition Handler
  const toggleVoiceScoring = () => {
    if (isListeningMic) {
      setIsListeningMic(false);
      setVoiceNotice(null);
      return;
    }

    setIsListeningMic(true);
    setVoiceNotice('Listening... Speak: "Four", "Six", "Single", "Out", "Wide", or "Dot"');

    const stopFn = voiceCommentaryService.startVoiceScoring(
      (transcript) => {
        setIsListeningMic(false);
        const action = voiceCommentaryService.parseVoiceCommand(transcript);
        if (action) {
          setVoiceNotice(`Recognized: "${transcript}"`);
          setTimeout(() => setVoiceNotice(null), 2500);

          if (action.isWicket) {
            setIsWicketOpen(true);
          } else {
            handleScoreEvent({
              runsBatter: action.runs,
              runsExtra: action.extraType === 'wide' || action.extraType === 'noball' ? 1 : 0,
              extraType: action.extraType,
              isWicket: false,
            });
          }
        } else {
          setVoiceNotice(`Unrecognized: "${transcript}". Please try: "Four", "Six", "Single"`);
          setTimeout(() => setVoiceNotice(null), 3000);
        }
      },
      (err) => {
        setIsListeningMic(false);
        setVoiceNotice(`Voice Note: ${err}`);
        setTimeout(() => setVoiceNotice(null), 3000);
      }
    );
  };

  // Undo delivery
  const handleUndo = () => {
    if (innings.deliveries.length === 0) return;
    const reverted = ScoringEngine.undoLastDelivery(currentMatch);
    storageService.saveMatch(reverted);
    setCurrentMatch(reverted);
    onUpdateMatch(reverted);
    audioHaptics.playTap(soundEnabled);
  };

  // Strike swap
  const handleSwapStrike = () => {
    const updated = ScoringEngine.swapStriker(currentMatch);
    storageService.saveMatch(updated);
    setCurrentMatch(updated);
    onUpdateMatch(updated);
    audioHaptics.playTap(soundEnabled);
  };

  // Bowler change
  const handleChangeBowler = (newBowlerId: string) => {
    const updated = ScoringEngine.changeBowler(currentMatch, newBowlerId);
    storageService.saveMatch(updated);
    setCurrentMatch(updated);
    onUpdateMatch(updated);
    setShowOverCompletePrompt(false);
  };

  // Share Live Match Link
  const handleShareMatchLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?liveMatchId=${currentMatch.id}&view=spectator`;
    const shareText = `🏏 LIVE CRICKET: ${currentMatch.title}\n${battingTeam?.shortName}: ${innings.totalRuns}/${innings.wickets} (${ScoringEngine.formatOvers(innings.legalDeliveries)} ov)\nWatch Live Ball-by-Ball Scorecard: ${shareUrl}`;

    if (navigator.share) {
      navigator
        .share({
          title: `Live Match: ${currentMatch.title}`,
          text: shareText,
          url: shareUrl,
        })
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleWhatsAppDirect = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?liveMatchId=${currentMatch.id}&view=spectator`;
    const shareText = encodeURIComponent(
      `🏏 LIVE CRICKET: ${currentMatch.title}\n${battingTeam?.shortName}: ${innings.totalRuns}/${innings.wickets} (${ScoringEngine.formatOvers(innings.legalDeliveries)} ov)\nLive Score link: ${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
  };

  // Telemetry
  const strikerSR =
    strikerRecord.balls > 0
      ? ((strikerRecord.runs / strikerRecord.balls) * 100).toFixed(1)
      : '0.0';
  const nonStrikerSR =
    nonStrikerRecord.balls > 0
      ? ((nonStrikerRecord.runs / nonStrikerRecord.balls) * 100).toFixed(1)
      : '0.0';

  const bowlerOvers = ScoringEngine.formatOvers(bowlerRecord.balls);
  const bowlerEcon =
    bowlerRecord.balls > 0
      ? (bowlerRecord.runs / (bowlerRecord.balls / 6)).toFixed(2)
      : '0.00';

  const totalBallsRemaining = Math.max(0, currentMatch.oversPerInnings * 6 - innings.legalDeliveries);
  const runsNeeded = innings.target ? Math.max(0, innings.target - innings.totalRuns) : undefined;

  const quickShotSectors: { id: ShotDirection; label: string }[] = [
    { id: 'cover', label: 'Cover' },
    { id: 'point', label: 'Point' },
    { id: 'mid_wicket', label: 'Mid-Wkt' },
    { id: 'long_on', label: 'Long On' },
    { id: 'straight', label: 'Straight' },
    { id: 'fine_leg', label: 'Fine Leg' },
  ];

  // Candidates for 2nd innings lineup
  const inn1 = currentMatch.innings[1];
  const chasingTeamId = inn1 ? inn1.bowlingTeamId : '';
  const defendingTeamId = inn1 ? inn1.battingTeamId : '';
  const chasingTeam = teams.find((t) => t.id === chasingTeamId);
  const defendingTeam = teams.find((t) => t.id === defendingTeamId);

  const chasingSquadIds =
    chasingTeamId === currentMatch.teamAId ? currentMatch.teamAPlayers : currentMatch.teamBPlayers;
  const defendingSquadIds =
    defendingTeamId === currentMatch.teamAId ? currentMatch.teamAPlayers : currentMatch.teamBPlayers;

  const chasingPlayersList = players.filter((p) => chasingSquadIds.includes(p.id));
  const defendingPlayersList = players.filter((p) => defendingSquadIds.includes(p.id));

  return (
    <div className="p-2 sm:p-4 max-w-xl mx-auto space-y-3 pb-24 select-none">
      {/* Top Controls Ribbon */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-amber-400">
            {inningsNum === 1 ? '1st Innings' : '2nd Innings'}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-xs text-slate-400">
            {currentMatch.oversPerInnings} Overs
          </span>
          <span className="text-slate-500">•</span>
          {/* Cloud Sync Status */}
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold" title="Live Firebase Cloud Sync Active">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Online</span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          {/* Fan Broadcast View Toggle */}
          <button
            onClick={onOpenSpectatorView}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all cursor-pointer"
            title="Open Fan Broadcast Screen"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fan View</span>
          </button>

          {/* Share Live Match Modal Trigger */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs cursor-pointer"
            title="Share Live Score, Code & QR"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          {/* Copy Link / Quick Share */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            title="Copy Public Match Link / Code"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Voice Commentary Speech Toggle */}
          <button
            onClick={() => {
              const next = !voiceCommentaryEnabled;
              setVoiceCommentaryEnabled(next);
              voiceCommentaryService.setVoiceEnabled(next);
            }}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              voiceCommentaryEnabled
                ? 'bg-amber-400/20 text-amber-400 border-amber-400/40'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
            title={voiceCommentaryEnabled ? 'Voice Commentary: ON' : 'Voice Commentary: OFF'}
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Declare / End Innings Early */}
          {currentMatch.status === 'live' && (
            <button
              onClick={() => setShowDeclareConfirm(true)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-700 cursor-pointer"
              title="Declare / End Innings"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}

          {/* Pause & Exit */}
          <button
            onClick={onPauseAndExit}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            title="Pause & Exit"
          >
            <Pause className="w-4 h-4 text-blue-400" />
          </button>
        </div>
      </div>

      {/* Voice Prompt Toast / Status */}
      {voiceNotice && (
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-blue-500/20 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between animate-fade-in">
          <span>{voiceNotice}</span>
          {isListeningMic && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
        </div>
      )}

      {/* Main Scoreboard Display (High Contrast Stadium Style) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0e1935] to-[#071024] border border-amber-500/40 p-4 sm:p-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-3.5 h-3.5 rounded-full inline-block"
                style={{ backgroundColor: battingTeam?.primaryColor || '#F59E0B' }}
              />
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                {battingTeam?.name}
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              vs {bowlingTeam?.name}
            </span>
          </div>

          {/* Runs / Wickets big display */}
          <div className="text-right">
            <div className="text-4xl sm:text-5xl font-black text-amber-400 font-mono tracking-tight drop-shadow-[0_2px_12px_rgba(245,158,11,0.3)]">
              {innings.totalRuns}
              <span className="text-2xl sm:text-3xl text-slate-400 font-normal">/</span>
              {innings.wickets}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-300 font-mono mt-0.5">
              Overs: {ScoringEngine.formatOvers(innings.legalDeliveries)} / {currentMatch.oversPerInnings}
            </div>
          </div>
        </div>

        {/* Telemetry: CRR, Target, RRR */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
          <div>
            CRR:{' '}
            <span className="font-bold text-white font-mono">
              {ScoringEngine.calculateCRR(innings.totalRuns, innings.legalDeliveries)}
            </span>
          </div>

          {inningsNum === 2 && innings.target && (
            <div className="text-center font-semibold text-amber-300">
              Need <span className="font-bold text-white font-mono">{runsNeeded}</span> in{' '}
              <span className="font-bold text-white font-mono">{totalBallsRemaining}</span>b
            </div>
          )}

          {inningsNum === 2 && innings.target ? (
            <div>
              RRR:{' '}
              <span className="font-bold text-amber-400 font-mono">
                {ScoringEngine.calculateRRR(innings.target, innings.totalRuns, totalBallsRemaining)}
              </span>
            </div>
          ) : (
            <div>
              Extras:{' '}
              <span className="font-bold text-white font-mono">{innings.extras.total}</span> (w{innings.extras.wides}, nb{innings.extras.noballs})
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2ND INNINGS BREAK CONTROLLER (CRITICAL USER REQUIREMENT)    */}
      {/* ============================================================ */}
      {currentMatch.status === 'innings_break' && (
        <div className="rounded-3xl bg-gradient-to-b from-[#101b3b] to-[#091124] border-2 border-amber-400/80 p-5 shadow-2xl space-y-4 animate-fade-in">
          {/* Innings Break Header */}
          <div className="text-center space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black tracking-wider uppercase border border-amber-400/30">
              ⏸️ INNINGS BREAK / पहली पारी समाप्त
            </span>
            <h3 className="text-lg font-black text-white">
              {chasingTeam?.name} needs{' '}
              <span className="text-amber-400 font-mono text-xl">
                {(currentMatch.innings[1]?.totalRuns || 0) + 1}
              </span>{' '}
              runs to win
            </h3>
            <p className="text-xs text-slate-300">
              1st Innings: {defendingTeam?.name} scored {currentMatch.innings[1]?.totalRuns}/{currentMatch.innings[1]?.wickets} in {ScoringEngine.formatOvers(currentMatch.innings[1]?.legalDeliveries || 0)} overs
            </p>
          </div>

          {/* 2nd Innings Openers & Bowler Selector */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              2nd Innings Setup (ओपनर एवं गेंदबाज़ चुनें)
            </h4>

            {/* Striker */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                🏏 Striker (स्ट्राइकर) - {chasingTeam?.name}
              </label>
              <select
                value={secondInningsStrikerId}
                onChange={(e) => setSecondInningsStrikerId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:border-amber-400"
              >
                {chasingPlayersList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Non-Striker */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                🏏 Non-Striker (नॉन-स्ट्राइकर) - {chasingTeam?.name}
              </label>
              <select
                value={secondInningsNonStrikerId}
                onChange={(e) => setSecondInningsNonStrikerId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:border-amber-400"
              >
                {chasingPlayersList
                  .filter((p) => p.id !== secondInningsStrikerId)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.role})
                    </option>
                  ))}
              </select>
            </div>

            {/* Opening Bowler */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                ⚡ Opening Bowler (पहला गेंदबाज़) - {defendingTeam?.name}
              </label>
              <select
                value={secondInningsBowlerId}
                onChange={(e) => setSecondInningsBowlerId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:border-amber-400"
              >
                {defendingPlayersList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Big Prominent Start 2nd Innings Action */}
          <div className="pt-2 space-y-2">
            <button
              onClick={handleStartSecondInnings}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-base shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>START 2ND INNINGS (सेकंड इनिंग शुरू करें)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewScorecard(currentMatch.id)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
              >
                1st Innings Scorecard
              </button>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Match Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match Completed Banner */}
      {currentMatch.status === 'completed' && (() => {
        const motm = calculateManOfTheMatch(currentMatch, [battingTeam, bowlingTeam].filter(Boolean) as Team[], players);
        return (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-transparent border-2 border-emerald-500/50 text-center space-y-3 animate-fade-in">
            <Trophy className="w-9 h-9 text-amber-400 mx-auto" />
            <div>
              <h3 className="text-lg font-black text-white">MATCH FINISHED!</h3>
              <p className="text-xs font-bold text-emerald-400 mt-0.5">{currentMatch.resultSummary}</p>
            </div>

            {/* Man of the Match Badge */}
            {motm && (
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-400/40 text-left flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-amber-400/20 text-amber-400 shrink-0">
                    <MotmTrophyIcon className="w-5 h-5" />
                  </span>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
                      MAN OF THE MATCH
                    </span>
                    <span className="text-xs font-black text-white">{motm.playerName} ({motm.teamName})</span>
                    <span className="text-[11px] text-slate-300 block">{motm.summary}</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
                  {motm.totalPoints} pts
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                onClick={() => onViewScorecard(currentMatch.id)}
                className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md active:scale-95"
              >
                Full Scorecard
              </button>
              <button
                onClick={() => generateMatchSummaryPDF(currentMatch, [battingTeam, bowlingTeam].filter(Boolean) as Team[], players)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-md flex items-center gap-1.5 active:scale-95"
              >
                <PdfIcon className="w-3.5 h-3.5" />
                <span>Download PDF Summary</span>
              </button>
              <button
                onClick={onOpenSpectatorView}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-md active:scale-95"
              >
                Fan Broadcast
              </button>
            </div>
          </div>
        );
      })()}

      {/* Batters & Bowler Active Cards (When Live) */}
      {currentMatch.status === 'live' && (
        <div className="space-y-2">
          {/* Batters at Crease */}
          <div className="p-3 rounded-2xl bg-[#0a1228] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Batters at Crease</span>
              <button
                onClick={handleSwapStrike}
                className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-[11px] font-bold cursor-pointer"
              >
                <ArrowLeftRight className="w-3 h-3" />
                <span>Swap Strike</span>
              </button>
            </div>

            {/* Striker */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-400/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    {striker.fullName} <span className="text-amber-400 text-[10px]">*</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {strikerRecord.fours}x4, {strikerRecord.sixes}x6 • SR: {strikerSR}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-amber-400 font-mono">
                  {strikerRecord.runs}
                </span>
                <span className="text-xs text-slate-400 font-mono"> ({strikerRecord.balls})</span>
              </div>
            </div>

            {/* Non-Striker */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-200">{nonStriker.fullName}</span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {nonStrikerRecord.fours}x4, {nonStrikerRecord.sixes}x6 • SR: {nonStrikerSR}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-slate-200 font-mono">
                  {nonStrikerRecord.runs}
                </span>
                <span className="text-xs text-slate-400 font-mono"> ({nonStrikerRecord.balls})</span>
              </div>
            </div>
          </div>

          {/* Current Bowler Card */}
          <div className="p-3 rounded-2xl bg-[#0a1228] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Current Bowler</span>
              <button
                onClick={() => setIsChangeBowlerOpen(true)}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-[11px] font-bold cursor-pointer"
              >
                <UserCheck className="w-3 h-3" />
                <span>Change Bowler</span>
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white">{bowler.fullName}</span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  Econ: {bowlerEcon} • Maidens: {bowlerRecord.maidens}
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-white font-mono">
                  {bowlerRecord.wickets}-{bowlerRecord.runs}
                </span>
                <span className="text-xs text-slate-400 font-mono"> ({bowlerOvers} ov)</span>
              </div>
            </div>

            {/* Over Ball Trail */}
            <div className="pt-1 flex items-center gap-1.5 overflow-x-auto py-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                This Over:
              </span>
              {deliveriesInCurrentOver.length === 0 ? (
                <span className="text-[10px] text-slate-400 italic">No balls bowled yet in over</span>
              ) : (
                deliveriesInCurrentOver.map((d, idx) => {
                  let badgeBg = 'bg-slate-800 text-slate-200 border-slate-700';
                  let text = `${d.runsBatter}`;

                  if (d.isWicket) {
                    badgeBg = 'bg-rose-600 text-white border-rose-500 font-black';
                    text = 'W';
                  } else if (d.isSix) {
                    badgeBg = 'bg-purple-600 text-white border-purple-500 font-black';
                    text = '6';
                  } else if (d.isFour) {
                    badgeBg = 'bg-blue-600 text-white border-blue-500 font-black';
                    text = '4';
                  } else if (d.extraType === 'wide') {
                    badgeBg = 'bg-amber-600/80 text-white border-amber-500 font-bold';
                    text = d.runsExtra > 1 ? `${d.runsExtra}Wd` : 'Wd';
                  } else if (d.extraType === 'noball') {
                    badgeBg = 'bg-amber-600/80 text-white border-amber-500 font-bold';
                    text = d.runsBatter > 0 ? `${d.runsBatter}Nb` : 'Nb';
                  } else if (d.runsBatter === 0) {
                    badgeBg = 'bg-slate-800 text-slate-400 border-slate-800';
                    text = '•';
                  }

                  return (
                    <div
                      key={idx}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono border shadow-xs shrink-0 ${badgeBg}`}
                    >
                      {text}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Shot Direction (Wagon Wheel) Quick Placement Bar */}
          <div className="p-2.5 rounded-2xl bg-[#0a1228] border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Shot Direction:
              </span>
              {quickShotSectors.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() =>
                    setSelectedShotDirection(selectedShotDirection === sec.id ? undefined : sec.id)
                  }
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                    selectedShotDirection === sec.id
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowWagonWheelDrawer(!showWagonWheelDrawer)}
              className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-750 text-slate-300 shrink-0 ml-1 cursor-pointer"
              title="Open Full Cricket Ground Wagon Wheel"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
            </button>
          </div>

          {/* Optional Wagon Wheel Full Drawer */}
          {showWagonWheelDrawer && (
            <div className="p-4 rounded-2xl bg-[#0a1228] border border-emerald-500/30 text-center animate-fade-in">
              <WagonWheelGround
                selectedDirection={selectedShotDirection}
                onSelectDirection={(dir) => {
                  setSelectedShotDirection(dir);
                  setShowWagonWheelDrawer(false);
                }}
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* BIG TACTILE SCORING PAD (Enlarged & Easy-Tap Buttons)        */}
          {/* ============================================================ */}
          <div className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-b from-[#0c1630] to-[#070e22] border border-slate-800 space-y-3 shadow-xl">
            {/* Top row: 0 (dot), 1, 2, 3 (ENLARGED h-18) */}
            <div className="grid grid-cols-4 gap-2.5">
              <button
                onClick={() =>
                  handleScoreEvent({
                    runsBatter: 0,
                    runsExtra: 0,
                    extraType: 'none',
                    isWicket: false,
                  })
                }
                className="h-18 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-black text-3xl border border-slate-700 active:scale-95 transition-all shadow-md flex items-center justify-center cursor-pointer"
              >
                <span>•</span>
              </button>

              <button
                onClick={() =>
                  handleScoreEvent({
                    runsBatter: 1,
                    runsExtra: 0,
                    extraType: 'none',
                    isWicket: false,
                  })
                }
                className="h-18 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-mono font-black text-3xl border border-slate-700 active:scale-95 transition-all shadow-md flex items-center justify-center cursor-pointer"
              >
                <span>1</span>
              </button>

              <button
                onClick={() =>
                  handleScoreEvent({
                    runsBatter: 2,
                    runsExtra: 0,
                    extraType: 'none',
                    isWicket: false,
                  })
                }
                className="h-18 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-mono font-black text-3xl border border-slate-700 active:scale-95 transition-all shadow-md flex items-center justify-center cursor-pointer"
              >
                <span>2</span>
              </button>

              <button
                onClick={() =>
                  handleScoreEvent({
                    runsBatter: 3,
                    runsExtra: 0,
                    extraType: 'none',
                    isWicket: false,
                  })
                }
                className="h-18 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-mono font-black text-3xl border border-slate-700 active:scale-95 transition-all shadow-md flex items-center justify-center cursor-pointer"
              >
                <span>3</span>
              </button>
            </div>

            {/* Boundaries Row: FOUR (4) & SIX (6) (ENLARGED h-20 with glowing stadium gradient) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  handleScoreEvent({
                    runsBatter: 4,
                    runsExtra: 0,
                    extraType: 'none',
                    isWicket: false,
                  })
                }
                className="h-20 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white font-mono font-black text-3xl shadow-lg shadow-blue-600/30 active:scale-95 transition-all border border-blue-400/40 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>4</span>
                <span className="text-xs font-sans font-bold uppercase tracking-wider text-blue-200">
                  FOUR
                </span>
              </button>

              <button
                onClick={() =>
                  handleScoreEvent({
                    runsBatter: 6,
                    runsExtra: 0,
                    extraType: 'none',
                    isWicket: false,
                  })
                }
                className="h-20 rounded-2xl bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 hover:from-purple-600 hover:to-pink-500 text-white font-mono font-black text-3xl shadow-lg shadow-purple-600/30 active:scale-95 transition-all border border-purple-400/40 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>6</span>
                <span className="text-xs font-sans font-bold uppercase tracking-wider text-purple-200">
                  SIX
                </span>
              </button>
            </div>

            {/* Extras Row: Wide, No Ball, Bye, Leg Bye, Custom */}
            <div className="grid grid-cols-5 gap-1.5 text-xs">
              <button
                onClick={() =>
                  handleScoreEvent({
                    runsBatter: 0,
                    runsExtra: 1,
                    extraType: 'wide',
                    isWicket: false,
                  })
                }
                className="py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold border border-slate-700/60 active:scale-95 cursor-pointer"
              >
                WD
              </button>
              <button
                onClick={() =>
                  handleScoreEvent({
                    runsBatter: 0,
                    runsExtra: 1,
                    extraType: 'noball',
                    isWicket: false,
                  })
                }
                className="py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold border border-slate-700/60 active:scale-95 cursor-pointer"
              >
                NB
              </button>
              <button
                onClick={() =>
                  handleScoreEvent({
                    runsBatter: 0,
                    runsExtra: 1,
                    extraType: 'bye',
                    isWicket: false,
                  })
                }
                className="py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold border border-slate-700/60 active:scale-95 cursor-pointer"
              >
                BYE
              </button>
              <button
                onClick={() =>
                  handleScoreEvent({
                    runsBatter: 0,
                    runsExtra: 1,
                    extraType: 'legbye',
                    isWicket: false,
                  })
                }
                className="py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold border border-slate-700/60 active:scale-95 cursor-pointer"
              >
                LB
              </button>
              <button
                onClick={() => setIsCustomRunsOpen(true)}
                className="py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold border border-slate-700/60 active:scale-95 cursor-pointer"
              >
                CUSTOM
              </button>
            </div>

            {/* Critical Row: OUT (WICKET), VOICE MIC SCORING, UNDO */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* Out Button */}
              <button
                onClick={() => setIsWicketOpen(true)}
                className="py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-black text-sm shadow-lg shadow-rose-600/30 active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>OUT / WKT</span>
              </button>

              {/* Voice Scoring Mic */}
              <button
                onClick={toggleVoiceScoring}
                className={`py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer ${
                  isListeningMic
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 active:scale-95'
                }`}
              >
                {isListeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isListeningMic ? 'Listening...' : 'Voice Score'}</span>
              </button>

              {/* Undo */}
              <button
                onClick={handleUndo}
                disabled={innings.deliveries.length === 0}
                className={`py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  innings.deliveries.length === 0
                    ? 'opacity-40 cursor-not-allowed bg-slate-900 border border-slate-800 text-slate-500'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95'
                }`}
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Undo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Over Complete Prompt Modal */}
      {showOverCompletePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs" />
          <div className="relative w-full max-w-sm bg-[#0a1228] border border-amber-400/50 rounded-2xl p-5 z-10 text-center space-y-3">
            <span className="w-10 h-10 rounded-full bg-amber-400/20 text-amber-400 inline-flex items-center justify-center font-bold">
              ✓
            </span>
            <h3 className="text-base font-bold text-white">Over Complete!</h3>
            <p className="text-xs text-slate-300">
              6 legal deliveries bowled. Ends have been swapped. Please select the next bowler.
            </p>
            <button
              onClick={() => {
                setShowOverCompletePrompt(false);
                setIsChangeBowlerOpen(true);
              }}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer"
            >
              Select Next Bowler
            </button>
          </div>
        </div>
      )}

      {/* Declare Innings Early Confirm Modal */}
      {showDeclareConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs" />
          <div className="relative w-full max-w-sm bg-[#0a1228] border border-rose-500/50 rounded-2xl p-5 z-10 text-center space-y-3">
            <h3 className="text-base font-bold text-white">Declare / End Innings?</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to end this innings early? If this is 1st innings, you will proceed to the 2nd innings target setup.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowDeclareConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeclareInnings}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black cursor-pointer"
              >
                End Innings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CustomRunsModal
        isOpen={isCustomRunsOpen}
        onClose={() => setIsCustomRunsOpen(false)}
        onSubmit={(runsB, runsE, extraT) => {
          handleScoreEvent({
            runsBatter: runsB,
            runsExtra: runsE,
            extraType: extraT,
            isWicket: false,
          });
        }}
      />

      <WicketModal
        isOpen={isWicketOpen}
        onClose={() => setIsWicketOpen(false)}
        striker={striker}
        nonStriker={nonStriker}
        bowler={bowler}
        fieldingPlayers={fieldingPlayers}
        availableBatters={availableNextBatters}
        onConfirmWicket={(dType, pDismissedId, fId, newBId) => {
          const isBowlerCredited = ['bowled', 'caught', 'lbw', 'stumped', 'hit_wicket'].includes(dType);
          handleScoreEvent({
            runsBatter: 0,
            runsExtra: 0,
            extraType: 'none',
            isWicket: true,
            wicketDetail: {
              dismissalType: dType,
              playerDismissedId: pDismissedId,
              fielderId: fId,
              isBowlerCredited,
              newBatterId: newBId,
            },
          });
        }}
      />

      <ChangeBowlerModal
        isOpen={isChangeBowlerOpen}
        onClose={() => setIsChangeBowlerOpen(false)}
        availableBowlers={fieldingPlayers}
        currentBowlerId={bowler.id}
        onSelectBowler={handleChangeBowler}
      />

      <ShareMatchModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        match={currentMatch}
        teamAName={battingTeam?.name || 'Team A'}
        teamBName={bowlingTeam?.name || 'Team B'}
      />
    </div>
  );
};
