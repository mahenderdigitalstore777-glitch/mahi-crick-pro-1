/**
 * Mahi Crick Pro - Domain Types & Data Contracts
 */

export type PlayingRole = 'Batter' | 'Bowler' | 'All-Rounder' | 'Wicketkeeper';
export type BattingStyle = 'Right Hand Bat' | 'Left Hand Bat';
export type BowlingStyle = 
  | 'Right-arm Fast' 
  | 'Right-arm Medium' 
  | 'Right-arm Off Spin' 
  | 'Right-arm Leg Spin' 
  | 'Left-arm Fast' 
  | 'Left-arm Medium' 
  | 'Left-arm Orthodox Spin' 
  | 'Left-arm Chinaman' 
  | 'None';

export interface PlayerStats {
  matches: number;
  innings: number;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  highestScore: number;
  notOuts: number;
  oversBowled: number;
  runsConceded: number;
  wickets: number;
  maidens: number;
  bestBowlingWickets: number;
  bestBowlingRuns: number;
}

export interface Player {
  id: string;
  fullName: string;
  displayName: string;
  jerseyNumber: number;
  role: PlayingRole;
  battingStyle: BattingStyle;
  bowlingStyle: BowlingStyle;
  isWicketKeeper: boolean;
  teamId?: string;
  avatarColor?: string;
  notes?: string;
  isArchived?: boolean;
  stats: PlayerStats;
  createdAt: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  badgeCode: string;
  primaryColor: string;
  secondaryColor: string;
  captainId?: string;
  wicketKeeperId?: string;
  playerIds: string[];
  notes?: string;
  isArchived?: boolean;
  createdAt: number;
}

export type MatchFormat = 'T5' | 'T10' | 'T15' | 'T20' | 'ODI' | 'PRACTICE' | 'CUSTOM';

export type DismissalType =
  | 'bowled'
  | 'caught'
  | 'lbw'
  | 'run_out'
  | 'stumped'
  | 'hit_wicket'
  | 'retired_hurt'
  | 'obstructing_field'
  | 'handled_ball'
  | 'timed_out';

export type ExtraType = 'none' | 'wide' | 'noball' | 'bye' | 'legbye' | 'penalty';

export type ShotDirection =
  | 'fine_leg'
  | 'square_leg'
  | 'mid_wicket'
  | 'long_on'
  | 'straight'
  | 'long_off'
  | 'cover'
  | 'point'
  | 'third_man';

export interface Delivery {
  id: string;
  matchId: string;
  inningsNumber: 1 | 2;
  overIndex: number; // 0-indexed over (0 = 1st over)
  ballInOver: number; // 1 to 6 (for legal deliveries)
  isLegalBall: boolean;
  bowlerId: string;
  strikerId: string;
  nonStrikerId: string;
  runsBatter: number; // 0, 1, 2, 3, 4, 6 or custom
  runsExtra: number; // additional extra runs
  extraType: ExtraType;
  shotDirection?: ShotDirection;
  isWicket: boolean;
  wicketDetail?: {
    dismissalType: DismissalType;
    playerDismissedId: string;
    fielderId?: string;
    isBowlerCredited: boolean;
  };
  isBoundary: boolean;
  isFour: boolean;
  isSix: boolean;
  commentary: string;
  timestamp: number;
}

export interface BatterInningsRecord {
  playerId: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  dismissalType?: DismissalType;
  bowlerCreditedId?: string;
  fielderId?: string;
  battingPosition: number;
}

export interface BowlerInningsRecord {
  playerId: string;
  balls: number; // legal deliveries bowled
  maidens: number;
  runs: number;
  wickets: number;
  wides: number;
  noballs: number;
  bowlingOrder: number;
}

export interface FallOfWicket {
  wicketNumber: number;
  runs: number;
  overStr: string;
  batterId: string;
}

export interface Partnership {
  batter1Id: string;
  batter2Id: string;
  runs: number;
  balls: number;
}

export interface ExtrasSummary {
  wides: number;
  noballs: number;
  byes: number;
  legbyes: number;
  penalties: number;
  total: number;
}

export interface Innings {
  inningsNumber: 1 | 2;
  battingTeamId: string;
  bowlingTeamId: string;
  totalRuns: number;
  wickets: number;
  legalDeliveries: number; // e.g. 19 = 3.1 overs
  totalDeliveries: number;
  currentStrikerId: string;
  currentNonStrikerId: string;
  currentBowlerId: string;
  batters: Record<string, BatterInningsRecord>;
  bowlers: Record<string, BowlerInningsRecord>;
  deliveries: Delivery[];
  extras: ExtrasSummary;
  fallOfWickets: FallOfWicket[];
  isCompleted: boolean;
  target?: number; // target for 2nd innings
}

export type MatchStatus = 'live' | 'innings_break' | 'completed' | 'abandoned';

export interface Match {
  id: string;
  title: string;
  date: string;
  venue?: string;
  oversPerInnings: number;
  matchFormat: MatchFormat;
  teamAId: string;
  teamBId: string;
  teamAPlayers: string[];
  teamBPlayers: string[];
  tossWinnerId: string;
  tossDecision: 'bat' | 'bowl';
  currentInningsNumber: 1 | 2;
  innings: {
    1: Innings;
    2?: Innings;
  };
  status: MatchStatus;
  resultSummary?: string;
  winnerTeamId?: string;
  tournamentId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface TournamentTeamStats {
  teamId: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  points: number;
  netRunRate: number;
  runsScored: number;
  oversFaced: number;
  runsConceded: number;
  oversBowled: number;
}

export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed';

export interface Tournament {
  id: string;
  name: string;
  shortName: string;
  format: MatchFormat;
  oversPerInnings: number;
  startDate: string;
  endDate?: string;
  venue?: string;
  status: TournamentStatus;
  teamIds: string[];
  matchIds: string[];
  pointsTable: TournamentTeamStats[];
  winnerTeamId?: string;
  runnerUpTeamId?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ManOfTheMatchResult {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  totalPoints: number;
  summary: string;
  batting?: {
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strikeRate: number;
  };
  bowling?: {
    wickets: number;
    runs: number;
    oversStr: string;
    maidens: number;
    economy: number;
  };
  fielding?: {
    catches: number;
    stumpings: number;
    runOuts: number;
  };
  isWinningTeam: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'alert';
  timestamp: number;
  isRead: boolean;
}

export interface AppSettings {
  theme: 'navy' | 'dark' | 'light';
  soundEnabled: boolean;
  hapticEnabled: boolean;
  defaultFormat: MatchFormat;
  defaultOvers: number;
  showCommentary: boolean;
  deviceFrameMode: boolean; // toggle phone wrapper on desktop
}
