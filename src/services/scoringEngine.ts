/**
 * Mahi Crick Pro - Pure Cricket Scoring Engine
 * Adheres strictly to MCC Cricket Laws with full event reconstruction and undo support.
 */

import {
  Match,
  Innings,
  Delivery,
  DismissalType,
  ExtraType,
  ShotDirection,
  BatterInningsRecord,
  BowlerInningsRecord,
} from '../types/cricket';

export interface ScoreDeliveryParams {
  runsBatter: number;
  runsExtra: number;
  extraType: ExtraType;
  shotDirection?: ShotDirection;
  isWicket: boolean;
  wicketDetail?: {
    dismissalType: DismissalType;
    playerDismissedId: string;
    fielderId?: string;
    isBowlerCredited: boolean;
    newBatterId?: string;
  };
  customCommentary?: string;
}

export class ScoringEngine {
  /**
   * Helper to format balls to overs (e.g. 19 balls -> "3.1")
   */
  static formatOvers(legalBalls: number): string {
    const overs = Math.floor(legalBalls / 6);
    const rem = legalBalls % 6;
    return `${overs}.${rem}`;
  }

  /**
   * Calculate current run rate (CRR)
   */
  static calculateCRR(totalRuns: number, legalBalls: number): string {
    if (legalBalls === 0) return '0.00';
    const overs = legalBalls / 6;
    return (totalRuns / overs).toFixed(2);
  }

  /**
   * Calculate required run rate (RRR)
   */
  static calculateRRR(targetRuns: number, currentRuns: number, ballsRemaining: number): string {
    const needed = targetRuns - currentRuns;
    if (needed <= 0) return '0.00';
    if (ballsRemaining <= 0) return 'Required: ' + needed;
    const oversRemaining = ballsRemaining / 6;
    return (needed / oversRemaining).toFixed(2);
  }

  /**
   * Initialize a fresh Innings
   */
  static createInitialInnings(
    inningsNumber: 1 | 2,
    battingTeamId: string,
    bowlingTeamId: string,
    openingStrikerId: string,
    openingNonStrikerId: string,
    openingBowlerId: string,
    target?: number
  ): Innings {
    const batters: Record<string, BatterInningsRecord> = {
      [openingStrikerId]: {
        playerId: openingStrikerId,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        isOut: false,
        battingPosition: 1,
      },
      [openingNonStrikerId]: {
        playerId: openingNonStrikerId,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        isOut: false,
        battingPosition: 2,
      },
    };

    const bowlers: Record<string, BowlerInningsRecord> = {
      [openingBowlerId]: {
        playerId: openingBowlerId,
        balls: 0,
        maidens: 0,
        runs: 0,
        wickets: 0,
        wides: 0,
        noballs: 0,
        bowlingOrder: 1,
      },
    };

    return {
      inningsNumber,
      battingTeamId,
      bowlingTeamId,
      totalRuns: 0,
      wickets: 0,
      legalDeliveries: 0,
      totalDeliveries: 0,
      currentStrikerId: openingStrikerId,
      currentNonStrikerId: openingNonStrikerId,
      currentBowlerId: openingBowlerId,
      batters,
      bowlers,
      deliveries: [],
      extras: { wides: 0, noballs: 0, byes: 0, legbyes: 0, penalties: 0, total: 0 },
      fallOfWickets: [],
      isCompleted: false,
      target,
    };
  }

  /**
   * Score a delivery and produce new updated Innings and Match status
   */
  static processDelivery(match: Match, params: ScoreDeliveryParams): Match {
    const matchCopy: Match = JSON.parse(JSON.stringify(match));
    const inningsNum = matchCopy.currentInningsNumber;
    const innings = matchCopy.innings[inningsNum];

    if (!innings || innings.isCompleted) {
      throw new Error('Current innings is already completed or invalid.');
    }

    const {
      runsBatter,
      runsExtra,
      extraType,
      isWicket,
      wicketDetail,
      customCommentary,
    } = params;

    const isWide = extraType === 'wide';
    const isNoBall = extraType === 'noball';
    const isBye = extraType === 'bye';
    const isLegBye = extraType === 'legbye';
    const isPenalty = extraType === 'penalty';

    // Legal ball iff not a wide or no-ball
    const isLegalBall = !isWide && !isNoBall;

    // Calculate total run value on this delivery
    const totalDeliveryRuns = runsBatter + runsExtra;

    // Calculate over and ball index
    const currentLegalBalls = innings.legalDeliveries;
    const overIndex = Math.floor(currentLegalBalls / 6);
    const ballInOver = (currentLegalBalls % 6) + (isLegalBall ? 1 : 0);

    const strikerId = innings.currentStrikerId;
    const nonStrikerId = innings.currentNonStrikerId;
    const bowlerId = innings.currentBowlerId;

    // Prepare Delivery object
    const deliveryId = `del-${matchCopy.id}-${inningsNum}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    
    const directionLabels: Record<string, string> = {
      cover: 'through Extra Cover',
      point: 'towards Backward Point',
      mid_wicket: 'towards Deep Mid-Wicket',
      long_on: 'over Long On',
      long_off: 'over Long Off',
      square_leg: 'towards Deep Square Leg',
      fine_leg: 'down to Fine Leg',
      third_man: 'guided to Third Man',
      straight: 'straight down the ground',
    };
    const dirPhrase = params.shotDirection ? ` ${directionLabels[params.shotDirection] || ''}` : '';

    // Commentary generator
    let commentary = customCommentary || '';
    if (!commentary) {
      if (isWicket) {
        commentary = `OUT! ${wicketDetail?.dismissalType?.toUpperCase()}!`;
      } else if (runsBatter === 6) {
        commentary = params.shotDirection
          ? `SIX! Smashed high${dirPhrase} into the stands!`
          : 'SIX! Magnificent strike over the boundary ropes!';
      } else if (runsBatter === 4) {
        commentary = params.shotDirection
          ? `FOUR! Pierces the gap${dirPhrase} with glorious timing!`
          : 'FOUR! Pierces the gap with crisp timing!';
      } else if (isWide) {
        commentary = `Wide ball (+${runsExtra})`;
      } else if (isNoBall) {
        commentary = `No ball (+${runsExtra} runs)`;
      } else if (runsBatter === 0) {
        commentary = params.shotDirection
          ? `Dot ball, defended${dirPhrase}.`
          : 'Dot ball, solid defensive stroke.';
      } else {
        commentary = params.shotDirection
          ? `Pushed${dirPhrase} for ${runsBatter} run${runsBatter > 1 ? 's' : ''}.`
          : `${runsBatter} run${runsBatter > 1 ? 's' : ''} taken.`;
      }
    }

    const delivery: Delivery = {
      id: deliveryId,
      matchId: matchCopy.id,
      inningsNumber: inningsNum,
      overIndex,
      ballInOver: isLegalBall ? ballInOver : ballInOver,
      isLegalBall,
      bowlerId,
      strikerId,
      nonStrikerId,
      runsBatter,
      runsExtra,
      extraType,
      shotDirection: params.shotDirection,
      isWicket,
      wicketDetail: isWicket && wicketDetail ? { ...wicketDetail } : undefined,
      isBoundary: runsBatter === 4 || runsBatter === 6,
      isFour: runsBatter === 4,
      isSix: runsBatter === 6,
      commentary,
      timestamp: Date.now(),
    };

    // 1. Update Innings totals
    innings.totalRuns += totalDeliveryRuns;
    innings.totalDeliveries += 1;
    if (isLegalBall) {
      innings.legalDeliveries += 1;
    }

    // 2. Update Extras Breakdown
    if (isWide) {
      innings.extras.wides += runsExtra;
      innings.extras.total += runsExtra;
    } else if (isNoBall) {
      innings.extras.noballs += runsExtra;
      innings.extras.total += runsExtra;
    } else if (isBye) {
      innings.extras.byes += runsExtra;
      innings.extras.total += runsExtra;
    } else if (isLegBye) {
      innings.extras.legbyes += runsExtra;
      innings.extras.total += runsExtra;
    } else if (isPenalty) {
      innings.extras.penalties += runsExtra;
      innings.extras.total += runsExtra;
    }

    // 3. Update Batter Performance
    // Striker faces delivery unless it's a wide (wides do not count as balls faced by batter)
    if (!innings.batters[strikerId]) {
      innings.batters[strikerId] = {
        playerId: strikerId,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        isOut: false,
        battingPosition: Object.keys(innings.batters).length + 1,
      };
    }
    const strikerRec = innings.batters[strikerId];
    if (!isWide) {
      strikerRec.balls += 1;
    }
    strikerRec.runs += runsBatter;
    if (runsBatter === 4) strikerRec.fours += 1;
    if (runsBatter === 6) strikerRec.sixes += 1;

    // 4. Update Bowler Performance
    if (!innings.bowlers[bowlerId]) {
      innings.bowlers[bowlerId] = {
        playerId: bowlerId,
        balls: 0,
        maidens: 0,
        runs: 0,
        wickets: 0,
        wides: 0,
        noballs: 0,
        bowlingOrder: Object.keys(innings.bowlers).length + 1,
      };
    }
    const bowlerRec = innings.bowlers[bowlerId];
    if (isLegalBall) {
      bowlerRec.balls += 1;
    }
    // Runs charged to bowler: batter runs + wides + noballs (Byes & Legbyes & Penalty are NOT bowler runs)
    let bowlerRunsConceded = runsBatter;
    if (isWide) {
      bowlerRunsConceded += runsExtra;
      bowlerRec.wides += 1;
    }
    if (isNoBall) {
      bowlerRunsConceded += runsExtra;
      bowlerRec.noballs += 1;
    }
    bowlerRec.runs += bowlerRunsConceded;

    // 5. Handle Wickets
    if (isWicket && wicketDetail) {
      innings.wickets += 1;
      const dismissedId = wicketDetail.playerDismissedId;
      const dismissedBatter = innings.batters[dismissedId] || innings.batters[strikerId];

      if (dismissedBatter) {
        dismissedBatter.isOut = true;
        dismissedBatter.dismissalType = wicketDetail.dismissalType;
        dismissedBatter.fielderId = wicketDetail.fielderId;
        if (wicketDetail.isBowlerCredited) {
          dismissedBatter.bowlerCreditedId = bowlerId;
          bowlerRec.wickets += 1;
        }
      }

      // Record Fall of Wicket
      innings.fallOfWickets.push({
        wicketNumber: innings.wickets,
        runs: innings.totalRuns,
        overStr: ScoringEngine.formatOvers(innings.legalDeliveries),
        batterId: dismissedId,
      });

      // Swap in new batter if provided
      if (wicketDetail.newBatterId) {
        const newBatterId = wicketDetail.newBatterId;
        innings.batters[newBatterId] = {
          playerId: newBatterId,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          isOut: false,
          battingPosition: Object.keys(innings.batters).length + 1,
        };

        if (dismissedId === strikerId) {
          innings.currentStrikerId = newBatterId;
        } else {
          innings.currentNonStrikerId = newBatterId;
        }
      }
    }

    // 6. Strike Rotation:
    // How many runs caused physical running between wickets?
    // Batter runs + Byes + Leg Byes rotate strike on odd runs.
    // Wides with odd runs also rotate strike.
    let runsCausingRotation = runsBatter;
    if (isBye || isLegBye) {
      runsCausingRotation = runsExtra;
    } else if (isWide) {
      // If wide + extra runs taken
      runsCausingRotation = runsExtra - 1; // 1 is wide penalty, rest are run runs
    }

    let shouldSwapEnds = runsCausingRotation % 2 !== 0;

    // Check if over completed with this legal ball
    const isOverComplete = isLegalBall && innings.legalDeliveries % 6 === 0;

    if (shouldSwapEnds) {
      const temp = innings.currentStrikerId;
      innings.currentStrikerId = innings.currentNonStrikerId;
      innings.currentNonStrikerId = temp;
    }

    // If over completed, swap ends for next over
    if (isOverComplete) {
      const temp = innings.currentStrikerId;
      innings.currentStrikerId = innings.currentNonStrikerId;
      innings.currentNonStrikerId = temp;

      // Check maiden over
      const ballsInThisOver = innings.deliveries.filter((d) => d.overIndex === overIndex);
      const runsInThisOver = ballsInThisOver.reduce((sum, d) => sum + d.runsBatter + d.runsExtra, 0) + totalDeliveryRuns;
      if (runsInThisOver === 0) {
        bowlerRec.maidens += 1;
      }
    }

    // Add delivery to list
    innings.deliveries.push(delivery);

    // 7. Check Innings & Match Termination Conditions
    const maxLegalBalls = matchCopy.oversPerInnings * 6;
    const battingTeamSquad = innings.battingTeamId === matchCopy.teamAId ? matchCopy.teamAPlayers : matchCopy.teamBPlayers;
    const maxWickets = Math.max(1, battingTeamSquad.length - 1);

    const isAllOut = innings.wickets >= maxWickets;
    const isOversLimitReached = innings.legalDeliveries >= maxLegalBalls;

    // Target chased check for 2nd innings
    let isTargetChased = false;
    if (inningsNum === 2 && innings.target) {
      if (innings.totalRuns >= innings.target) {
        isTargetChased = true;
      }
    }

    if (isAllOut || isOversLimitReached || isTargetChased) {
      innings.isCompleted = true;

      if (inningsNum === 1) {
        matchCopy.status = 'innings_break';
        matchCopy.innings[1] = innings;
        // Setup target for innings 2
        const targetRuns = innings.totalRuns + 1;
        // Determine teams for innings 2
        const secondBattingTeamId = innings.bowlingTeamId;
        const secondBowlingTeamId = innings.battingTeamId;
        const secondBattingSquad = secondBattingTeamId === matchCopy.teamAId ? matchCopy.teamAPlayers : matchCopy.teamBPlayers;
        const secondBowlingSquad = secondBowlingTeamId === matchCopy.teamAId ? matchCopy.teamAPlayers : matchCopy.teamBPlayers;

        const opener1 = secondBattingSquad[0] || '';
        const opener2 = secondBattingSquad[1] || '';
        const openingBowler = secondBowlingSquad[secondBowlingSquad.length - 1] || secondBowlingSquad[0] || '';

        matchCopy.innings[2] = ScoringEngine.createInitialInnings(
          2,
          secondBattingTeamId,
          secondBowlingTeamId,
          opener1,
          opener2,
          openingBowler,
          targetRuns
        );
      } else if (inningsNum === 2) {
        // Match Finished! Calculate winner
        matchCopy.status = 'completed';
        const target = innings.target || 1;
        const runsChased = innings.totalRuns;
        const battingTeamId = innings.battingTeamId;
        const bowlingTeamId = innings.bowlingTeamId;

        if (runsChased >= target) {
          const wicketsRemaining = maxWickets - innings.wickets;
          matchCopy.winnerTeamId = battingTeamId;
          matchCopy.resultSummary = `Team won by ${wicketsRemaining} wicket${wicketsRemaining === 1 ? '' : 's'}`;
        } else if (runsChased === target - 1) {
          matchCopy.resultSummary = 'Match Tied!';
        } else {
          const runMargin = target - 1 - runsChased;
          matchCopy.winnerTeamId = bowlingTeamId;
          matchCopy.resultSummary = `Team won by ${runMargin} run${runMargin === 1 ? '' : 's'}`;
        }
      }
    } else {
      matchCopy.status = 'live';
    }

    matchCopy.updatedAt = Date.now();
    return matchCopy;
  }

  /**
   * Safe Undo: Rebuilds the current innings from scratch using the delivery history minus the last delivery.
   */
  static undoLastDelivery(match: Match): Match {
    const matchCopy: Match = JSON.parse(JSON.stringify(match));
    const inningsNum = matchCopy.currentInningsNumber;
    const currentInnings = matchCopy.innings[inningsNum];

    if (!currentInnings || currentInnings.deliveries.length === 0) {
      // If we are at the beginning of innings 2, we can revert to innings 1 break
      if (inningsNum === 2 && matchCopy.innings[1]) {
        matchCopy.currentInningsNumber = 1;
        matchCopy.status = 'live';
        matchCopy.innings[1].isCompleted = false;
        return matchCopy;
      }
      return matchCopy;
    }

    // Save deliveries history
    const allDeliveries = [...currentInnings.deliveries];
    allDeliveries.pop(); // remove last ball

    // Reconstruct initial innings
    const initialStrikerId = currentInnings.deliveries[0].strikerId;
    const initialNonStrikerId = currentInnings.deliveries[0].nonStrikerId;
    const initialBowlerId = currentInnings.deliveries[0].bowlerId;

    const freshInnings = ScoringEngine.createInitialInnings(
      inningsNum,
      currentInnings.battingTeamId,
      currentInnings.bowlingTeamId,
      initialStrikerId,
      initialNonStrikerId,
      initialBowlerId,
      currentInnings.target
    );

    matchCopy.innings[inningsNum] = freshInnings;
    matchCopy.status = 'live';

    // Replay deliveries
    for (const del of allDeliveries) {
      // Set current bowler/striker for this delivery
      matchCopy.innings[inningsNum].currentBowlerId = del.bowlerId;
      matchCopy.innings[inningsNum].currentStrikerId = del.strikerId;
      matchCopy.innings[inningsNum].currentNonStrikerId = del.nonStrikerId;

      ScoringEngine.processDelivery(matchCopy, {
        runsBatter: del.runsBatter,
        runsExtra: del.runsExtra,
        extraType: del.extraType,
        isWicket: del.isWicket,
        wicketDetail: del.wicketDetail,
        customCommentary: del.commentary,
      });
    }

    return matchCopy;
  }

  /**
   * Switch Bowler
   */
  static changeBowler(match: Match, newBowlerId: string): Match {
    const copy: Match = JSON.parse(JSON.stringify(match));
    const innings = copy.innings[copy.currentInningsNumber];
    if (innings) {
      innings.currentBowlerId = newBowlerId;
      if (!innings.bowlers[newBowlerId]) {
        innings.bowlers[newBowlerId] = {
          playerId: newBowlerId,
          balls: 0,
          maidens: 0,
          runs: 0,
          wickets: 0,
          wides: 0,
          noballs: 0,
          bowlingOrder: Object.keys(innings.bowlers).length + 1,
        };
      }
    }
    return copy;
  }

  /**
   * Swap active striker and non-striker (manual correction)
   */
  static swapStriker(match: Match): Match {
    const copy: Match = JSON.parse(JSON.stringify(match));
    const innings = copy.innings[copy.currentInningsNumber];
    if (innings) {
      const temp = innings.currentStrikerId;
      innings.currentStrikerId = innings.currentNonStrikerId;
      innings.currentNonStrikerId = temp;
    }
    return copy;
  }

  /**
   * Start Second Innings
   * Transitions match from innings_break to live 2nd innings with specified openers & opening bowler
   */
  static startSecondInnings(
    match: Match,
    customStrikerId?: string,
    customNonStrikerId?: string,
    customBowlerId?: string
  ): Match {
    const copy: Match = JSON.parse(JSON.stringify(match));
    const inn1 = copy.innings[1];
    if (!inn1) {
      throw new Error('1st Innings must exist before starting 2nd innings.');
    }

    inn1.isCompleted = true;
    const targetRuns = inn1.totalRuns + 1;

    const secondBattingTeamId = inn1.bowlingTeamId;
    const secondBowlingTeamId = inn1.battingTeamId;

    const secondBattingSquad =
      secondBattingTeamId === copy.teamAId ? copy.teamAPlayers : copy.teamBPlayers;
    const secondBowlingSquad =
      secondBowlingTeamId === copy.teamAId ? copy.teamAPlayers : copy.teamBPlayers;

    const striker = customStrikerId || secondBattingSquad[0] || 'striker-2';
    const nonStriker =
      customNonStrikerId ||
      secondBattingSquad[1] ||
      (secondBattingSquad[0] !== striker ? secondBattingSquad[0] : 'nonstriker-2');
    const openingBowler =
      customBowlerId ||
      secondBowlingSquad[secondBowlingSquad.length - 1] ||
      secondBowlingSquad[0] ||
      'bowler-2';

    copy.innings[2] = ScoringEngine.createInitialInnings(
      2,
      secondBattingTeamId,
      secondBowlingTeamId,
      striker,
      nonStriker,
      openingBowler,
      targetRuns
    );

    copy.currentInningsNumber = 2;
    copy.status = 'live';
    copy.updatedAt = Date.now();

    return copy;
  }

  /**
   * Declare / End Current Innings Early
   */
  static declareCurrentInnings(match: Match): Match {
    const copy: Match = JSON.parse(JSON.stringify(match));
    const innNum = copy.currentInningsNumber;
    const currentInnings = copy.innings[innNum];
    if (!currentInnings) return copy;

    currentInnings.isCompleted = true;

    if (innNum === 1) {
      copy.status = 'innings_break';
      const targetRuns = currentInnings.totalRuns + 1;
      const secondBattingTeamId = currentInnings.bowlingTeamId;
      const secondBowlingTeamId = currentInnings.battingTeamId;
      const secondBattingSquad =
        secondBattingTeamId === copy.teamAId ? copy.teamAPlayers : copy.teamBPlayers;
      const secondBowlingSquad =
        secondBowlingTeamId === copy.teamAId ? copy.teamAPlayers : copy.teamBPlayers;

      const opener1 = secondBattingSquad[0] || '';
      const opener2 = secondBattingSquad[1] || '';
      const openingBowler =
        secondBowlingSquad[secondBowlingSquad.length - 1] || secondBowlingSquad[0] || '';

      copy.innings[2] = ScoringEngine.createInitialInnings(
        2,
        secondBattingTeamId,
        secondBowlingTeamId,
        opener1,
        opener2,
        openingBowler,
        targetRuns
      );
    } else {
      copy.status = 'completed';
      const target = currentInnings.target || 1;
      const runsChased = currentInnings.totalRuns;
      const battingTeamId = currentInnings.battingTeamId;
      const bowlingTeamId = currentInnings.bowlingTeamId;
      const battingSquad = battingTeamId === copy.teamAId ? copy.teamAPlayers : copy.teamBPlayers;
      const maxWickets = Math.max(1, battingSquad.length - 1);

      if (runsChased >= target) {
        const wicketsRemaining = maxWickets - currentInnings.wickets;
        copy.winnerTeamId = battingTeamId;
        copy.resultSummary = `Team won by ${wicketsRemaining} wicket${wicketsRemaining === 1 ? '' : 's'}`;
      } else if (runsChased === target - 1) {
        copy.resultSummary = 'Match Tied!';
      } else {
        const runMargin = target - 1 - runsChased;
        copy.winnerTeamId = bowlingTeamId;
        copy.resultSummary = `Team won by ${runMargin} run${runMargin === 1 ? '' : 's'}`;
      }
    }

    copy.updatedAt = Date.now();
    return copy;
  }

  /**
   * Automated Cricket Scoring Test Suite
   * Runs unit tests and returns structured results
   */
  static runAutomatedTests(): { name: string; passed: boolean; message: string }[] {
    const results: { name: string; passed: boolean; message: string }[] = [];

    const mockMatch: Match = {
      id: 'test-m-1',
      title: 'Automated Test Match',
      date: '2026-10-10',
      oversPerInnings: 2,
      matchFormat: 'T5',
      teamAId: 'team-a',
      teamBId: 'team-b',
      teamAPlayers: ['p1', 'p2', 'p3', 'p4'],
      teamBPlayers: ['b1', 'b2', 'b3', 'b4'],
      tossWinnerId: 'team-a',
      tossDecision: 'bat',
      currentInningsNumber: 1,
      status: 'live',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      innings: {
        1: ScoringEngine.createInitialInnings(1, 'team-a', 'team-b', 'p1', 'p2', 'b1'),
      },
    };

    // Test 1: Single run updates score and swaps strike
    try {
      const state1 = ScoringEngine.processDelivery(mockMatch, {
        runsBatter: 1,
        runsExtra: 0,
        extraType: 'none',
        isWicket: false,
      });
      const inn = state1.innings[1];
      const pass = inn.totalRuns === 1 && inn.legalDeliveries === 1 && inn.currentStrikerId === 'p2';
      results.push({
        name: 'Single Run & Strike Rotation',
        passed: pass,
        message: pass ? 'Score is 1, 1 ball bowled, striker rotated to p2' : 'Failed to rotate or count runs',
      });
    } catch (e: any) {
      results.push({ name: 'Single Run & Strike Rotation', passed: false, message: e.message });
    }

    // Test 2: Boundary four credits batter and preserves strike
    try {
      const state2 = ScoringEngine.processDelivery(mockMatch, {
        runsBatter: 4,
        runsExtra: 0,
        extraType: 'none',
        isWicket: false,
      });
      const inn = state2.innings[1];
      const pass = inn.totalRuns === 4 && inn.batters['p1'].fours === 1 && inn.currentStrikerId === 'p1';
      results.push({
        name: 'Boundary Four (No Strike Swap)',
        passed: pass,
        message: pass ? 'Score is 4, batter fours credited, strike remains on p1' : 'Boundary handling mismatch',
      });
    } catch (e: any) {
      results.push({ name: 'Boundary Four (No Strike Swap)', passed: false, message: e.message });
    }

    // Test 3: Wide ball does NOT increment legal deliveries
    try {
      const state3 = ScoringEngine.processDelivery(mockMatch, {
        runsBatter: 0,
        runsExtra: 1,
        extraType: 'wide',
        isWicket: false,
      });
      const inn = state3.innings[1];
      const pass = inn.totalRuns === 1 && inn.legalDeliveries === 0 && inn.extras.wides === 1;
      results.push({
        name: 'Wide Ball (Non-Legal Delivery)',
        passed: pass,
        message: pass ? 'Score is 1, legal balls = 0, wide extra credited' : 'Wide counted as legal ball',
      });
    } catch (e: any) {
      results.push({ name: 'Wide Ball (Non-Legal Delivery)', passed: false, message: e.message });
    }

    // Test 4: Wicket falls and replaces batter
    try {
      const state4 = ScoringEngine.processDelivery(mockMatch, {
        runsBatter: 0,
        runsExtra: 0,
        extraType: 'none',
        isWicket: true,
        wicketDetail: {
          dismissalType: 'bowled',
          playerDismissedId: 'p1',
          isBowlerCredited: true,
          newBatterId: 'p3',
        },
      });
      const inn = state4.innings[1];
      const pass = inn.wickets === 1 && inn.batters['p1'].isOut && inn.currentStrikerId === 'p3';
      results.push({
        name: 'Wicket Fall & Incoming Batter',
        passed: pass,
        message: pass ? 'Wicket 1 registered, p1 dismissed bowled, p3 on strike' : 'Wicket handling error',
      });
    } catch (e: any) {
      results.push({ name: 'Wicket Fall & Incoming Batter', passed: false, message: e.message });
    }

    // Test 5: Undo last delivery restores score
    try {
      let runState = ScoringEngine.processDelivery(mockMatch, {
        runsBatter: 6,
        runsExtra: 0,
        extraType: 'none',
        isWicket: false,
      });
      runState = ScoringEngine.undoLastDelivery(runState);
      const inn = runState.innings[1];
      const pass = inn.totalRuns === 0 && inn.legalDeliveries === 0 && inn.deliveries.length === 0;
      results.push({
        name: 'Undo Transactional Safety',
        passed: pass,
        message: pass ? 'Successfully reverted 6 runs and restored state to 0.0' : 'Undo failed to revert state',
      });
    } catch (e: any) {
      results.push({ name: 'Undo Transactional Safety', passed: false, message: e.message });
    }

    // Test 6: Target chase detection
    try {
      const match2nd: Match = {
        ...mockMatch,
        currentInningsNumber: 2,
        innings: {
          1: { ...mockMatch.innings[1], totalRuns: 10, isCompleted: true },
          2: ScoringEngine.createInitialInnings(2, 'team-b', 'team-a', 'b1', 'b2', 'p1', 11),
        },
      };
      // Score 12 runs (exceeding target of 11)
      const afterChase = ScoringEngine.processDelivery(match2nd, {
        runsBatter: 12,
        runsExtra: 0,
        extraType: 'none',
        isWicket: false,
      });
      const pass = afterChase.status === 'completed' && afterChase.winnerTeamId === 'team-b';
      results.push({
        name: 'Second Innings Target Chase Completion',
        passed: pass,
        message: pass ? 'Target chased, match completed with team-b as winner' : 'Chase termination failed',
      });
    } catch (e: any) {
      results.push({ name: 'Second Innings Target Chase Completion', passed: false, message: e.message });
    }

    return results;
  }
}
