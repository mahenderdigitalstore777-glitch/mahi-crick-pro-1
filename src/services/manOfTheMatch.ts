/**
 * Mahi Crick Pro - Man of the Match (MOTM) Evaluation Engine
 * 
 * Accurately evaluates best all-round individual match performance across both teams:
 * - Batting: Runs scored, milestone bonuses (30+, 50+, 100+), boundaries (4s, 6s), Strike Rate index
 * - Bowling: Wickets taken, haul bonuses (3w, 5w), maidens, economy rate restriction (<6.0)
 * - Fielding: Catches taken, stumpings, run-outs
 * - Impact: Winning team bonus (+15 pts)
 */

import { Match, Team, Player, ManOfTheMatchResult, Innings } from '../types/cricket';
import { ScoringEngine } from './scoringEngine';

export function calculateManOfTheMatch(
  match: Match,
  teams: Team[],
  players: Player[]
): ManOfTheMatchResult | null {
  const inn1 = match.innings[1];
  const inn2 = match.innings[2];

  if (!inn1) return null;

  // Map players to lookup
  const playerMap = new Map<string, Player>();
  players.forEach((p) => playerMap.set(p.id, p));

  const teamMap = new Map<string, Team>();
  teams.forEach((t) => teamMap.set(t.id, t));

  // Map to accumulate points per player
  interface PlayerTracker {
    playerId: string;
    teamId: string;
    points: number;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    wickets: number;
    runsConceded: number;
    ballsBowled: number;
    maidens: number;
    catches: number;
    stumpings: number;
    runOuts: number;
  }

  const trackers = new Map<string, PlayerTracker>();

  const getTracker = (playerId: string, teamId: string): PlayerTracker => {
    let t = trackers.get(playerId);
    if (!t) {
      t = {
        playerId,
        teamId,
        points: 0,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        wickets: 0,
        runsConceded: 0,
        ballsBowled: 0,
        maidens: 0,
        catches: 0,
        stumpings: 0,
        runOuts: 0,
      };
      trackers.set(playerId, t);
    }
    return t;
  };

  const processInnings = (inn: Innings) => {
    // 1. Process Batters
    Object.values(inn.batters).forEach((b) => {
      const t = getTracker(b.playerId, inn.battingTeamId);
      t.runs += b.runs;
      t.balls += b.balls;
      t.fours += b.fours;
      t.sixes += b.sixes;

      // Base: 1 pt per run
      let pts = b.runs;

      // Milestone bonuses
      if (b.runs >= 100) pts += 35;
      else if (b.runs >= 50) pts += 15;
      else if (b.runs >= 30) pts += 6;

      // Boundary bonuses
      pts += b.fours * 1;
      pts += b.sixes * 2;

      // Strike Rate bonus (min 15 runs)
      if (b.balls > 0 && b.runs >= 15) {
        const sr = (b.runs / b.balls) * 100;
        if (sr >= 200) pts += 14;
        else if (sr >= 160) pts += 8;
        else if (sr >= 135) pts += 4;
      }

      t.points += pts;
    });

    // 2. Process Bowlers
    Object.values(inn.bowlers).forEach((bowler) => {
      const t = getTracker(bowler.playerId, inn.bowlingTeamId);
      t.wickets += bowler.wickets;
      t.runsConceded += bowler.runs;
      t.ballsBowled += bowler.balls;
      t.maidens += bowler.maidens;

      // 25 pts per wicket
      let pts = bowler.wickets * 25;

      // Haul bonuses
      if (bowler.wickets >= 5) pts += 40;
      else if (bowler.wickets >= 3) pts += 20;

      // Maidens: 10 pts per maiden
      pts += bowler.maidens * 10;

      // Economy rate bonus (minimum 2 overs = 12 balls)
      if (bowler.balls >= 12) {
        const overs = bowler.balls / 6;
        const econ = bowler.runs / overs;
        if (econ <= 5.0) pts += 16;
        else if (econ <= 6.5) pts += 8;
        else if (econ <= 7.5) pts += 4;
      }

      t.points += pts;
    });

    // 3. Process Dismissals & Fielding (Catches, stumpings, runouts)
    inn.deliveries.forEach((d) => {
      if (d.isWicket && d.wicketDetail && d.wicketDetail.fielderId) {
        const fId = d.wicketDetail.fielderId;
        const t = getTracker(fId, inn.bowlingTeamId);
        if (d.wicketDetail.dismissalType === 'caught') {
          t.catches += 1;
          t.points += 10;
        } else if (d.wicketDetail.dismissalType === 'stumped') {
          t.stumpings += 1;
          t.points += 12;
        } else if (d.wicketDetail.dismissalType === 'run_out') {
          t.runOuts += 1;
          t.points += 12;
        }
      }
    });
  };

  processInnings(inn1);
  if (inn2) {
    processInnings(inn2);
  }

  // Winning team bonus (+15 pts)
  if (match.winnerTeamId) {
    trackers.forEach((t) => {
      if (t.teamId === match.winnerTeamId) {
        t.points += 15;
      }
    });
  }

  // Sort by points descending
  const sorted = Array.from(trackers.values()).sort((a, b) => b.points - a.points);
  if (sorted.length === 0) return null;

  const winner = sorted[0];
  const playerObj = playerMap.get(winner.playerId);
  const teamObj = teamMap.get(winner.teamId);

  // Construct summary sentence
  const parts: string[] = [];
  if (winner.runs > 0) {
    parts.push(`${winner.runs} runs (${winner.balls}b, ${winner.fours}x4, ${winner.sixes}x6)`);
  }
  if (winner.wickets > 0 || winner.ballsBowled >= 6) {
    const ovStr = ScoringEngine.formatOvers(winner.ballsBowled);
    parts.push(`${winner.wickets}/${winner.runsConceded} (${ovStr} ov)`);
  }
  if (winner.catches > 0) {
    parts.push(`${winner.catches} catch${winner.catches > 1 ? 'es' : ''}`);
  }
  if (winner.stumpings > 0) {
    parts.push(`${winner.stumpings} stumping${winner.stumpings > 1 ? 's' : ''}`);
  }

  const summary = parts.length > 0 ? parts.join(' & ') : `${winner.points} match impact points`;

  const sr = winner.balls > 0 ? Number(((winner.runs / winner.balls) * 100).toFixed(1)) : 0;
  const econ =
    winner.ballsBowled > 0
      ? Number(((winner.runsConceded / (winner.ballsBowled / 6))).toFixed(2))
      : 0;

  return {
    playerId: winner.playerId,
    playerName: playerObj ? playerObj.fullName : 'Player',
    teamId: winner.teamId,
    teamName: teamObj ? teamObj.name : 'Team',
    totalPoints: Math.round(winner.points),
    summary,
    batting:
      winner.balls > 0 || winner.runs > 0
        ? {
            runs: winner.runs,
            balls: winner.balls,
            fours: winner.fours,
            sixes: winner.sixes,
            strikeRate: sr,
          }
        : undefined,
    bowling:
      winner.ballsBowled > 0
        ? {
            wickets: winner.wickets,
            runs: winner.runsConceded,
            oversStr: ScoringEngine.formatOvers(winner.ballsBowled),
            maidens: winner.maidens,
            economy: econ,
          }
        : undefined,
    fielding: {
      catches: winner.catches,
      stumpings: winner.stumpings,
      runOuts: winner.runOuts,
    },
    isWinningTeam: match.winnerTeamId === winner.teamId,
  };
}
