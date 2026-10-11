/**
 * Mahi Crick Pro - Local-First Transactional Storage Service
 * Simulates SQLite persistence layer with relational schema and transactional safety
 */

import { Match, Player, Team, AppNotification, AppSettings, MatchFormat, Tournament, TournamentTeamStats } from '../types/cricket';
import { cloudSyncService } from './firebase';

const STORAGE_KEYS = {
  TEAMS: 'mahi_crick_teams_v1',
  PLAYERS: 'mahi_crick_players_v1',
  MATCHES: 'mahi_crick_matches_v1',
  TOURNAMENTS: 'mahi_crick_tournaments_v1',
  ACTIVE_MATCH_ID: 'mahi_crick_active_match_id_v1',
  SETTINGS: 'mahi_crick_settings_v1',
  NOTIFICATIONS: 'mahi_crick_notifications_v1',
  SCHEMA_VERSION: 'mahi_crick_schema_ver',
  INTRO_SEEN: 'mahi_crick_intro_seen',
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'navy',
  soundEnabled: true,
  hapticEnabled: true,
  defaultFormat: 'T20',
  defaultOvers: 20,
  showCommentary: true,
  deviceFrameMode: false,
};

// Realistic Seed Data
const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-csk',
    name: 'Chennai Super Kings',
    shortName: 'CSK',
    badgeCode: 'CSK',
    primaryColor: '#FBBF24', // Yellow Gold
    secondaryColor: '#1E3A8A', // Navy
    captainId: 'p-dhoni',
    wicketKeeperId: 'p-dhoni',
    playerIds: ['p-dhoni', 'p-ruturaj', 'p-jadeja', 'p-dube', 'p-pathirana', 'p-chahar'],
    notes: '5-time champion franchise led by Mahi',
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'team-mi',
    name: 'Mumbai Indians',
    shortName: 'MI',
    badgeCode: 'MI',
    primaryColor: '#2563EB', // Royal Blue
    secondaryColor: '#D97706', // Gold
    captainId: 'p-rohit',
    wicketKeeperId: 'p-ishan',
    playerIds: ['p-rohit', 'p-surya', 'p-hardik', 'p-bumrah', 'p-ishan', 'p-tilak'],
    notes: '5-time champions with legendary squad',
    createdAt: Date.now() - 86400000 * 29,
  },
  {
    id: 'team-rcb',
    name: 'Royal Challengers Bengaluru',
    shortName: 'RCB',
    badgeCode: 'RCB',
    primaryColor: '#DC2626', // Red
    secondaryColor: '#1E293B', // Charcoal
    captainId: 'p-faf',
    wicketKeeperId: 'p-dk',
    playerIds: ['p-kohli', 'p-faf', 'p-maxwell', 'p-siraj', 'p-dk'],
    notes: 'High voltage squad featuring King Kohli',
    createdAt: Date.now() - 86400000 * 28,
  },
  {
    id: 'team-ind',
    name: 'India XI',
    shortName: 'IND',
    badgeCode: 'IND',
    primaryColor: '#0284C7', // Sky Blue
    secondaryColor: '#EA580C', // Saffron
    captainId: 'p-rohit',
    wicketKeeperId: 'p-dhoni',
    playerIds: ['p-dhoni', 'p-rohit', 'p-kohli', 'p-surya', 'p-hardik', 'p-bumrah', 'p-jadeja'],
    notes: 'National squad',
    createdAt: Date.now() - 86400000 * 27,
  },
];

const INITIAL_PLAYERS: Player[] = [
  {
    id: 'p-dhoni',
    fullName: 'MS Dhoni',
    displayName: 'MS Dhoni (Mahi)',
    jerseyNumber: 7,
    role: 'Wicketkeeper',
    battingStyle: 'Right Hand Bat',
    bowlingStyle: 'Right-arm Medium',
    isWicketKeeper: true,
    teamId: 'team-csk',
    avatarColor: '#F59E0B',
    notes: 'Legendary finisher and captain cool',
    stats: {
      matches: 250,
      innings: 218,
      runs: 5082,
      ballsFaced: 3739,
      fours: 349,
      sixes: 239,
      highestScore: 84,
      notOuts: 87,
      oversBowled: 0,
      runsConceded: 0,
      wickets: 0,
      maidens: 0,
      bestBowlingWickets: 0,
      bestBowlingRuns: 0,
    },
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'p-ruturaj',
    fullName: 'Ruturaj Gaikwad',
    displayName: 'R. Gaikwad',
    jerseyNumber: 31,
    role: 'Batter',
    battingStyle: 'Right Hand Bat',
    bowlingStyle: 'Right-arm Off Spin',
    isWicketKeeper: false,
    teamId: 'team-csk',
    avatarColor: '#EAB308',
    stats: {
      matches: 52,
      innings: 51,
      runs: 1797,
      ballsFaced: 1324,
      fours: 168,
      sixes: 73,
      highestScore: 108,
      notOuts: 7,
      oversBowled: 0,
      runsConceded: 0,
      wickets: 0,
      maidens: 0,
      bestBowlingWickets: 0,
      bestBowlingRuns: 0,
    },
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'p-jadeja',
    fullName: 'Ravindra Jadeja',
    displayName: 'R. Jadeja',
    jerseyNumber: 8,
    role: 'All-Rounder',
    battingStyle: 'Left Hand Bat',
    bowlingStyle: 'Left-arm Orthodox Spin',
    isWicketKeeper: false,
    teamId: 'team-csk',
    avatarColor: '#10B981',
    stats: {
      matches: 226,
      innings: 170,
      runs: 2692,
      ballsFaced: 2093,
      fours: 198,
      sixes: 98,
      highestScore: 62,
      notOuts: 69,
      oversBowled: 590,
      runsConceded: 4480,
      wickets: 152,
      maidens: 2,
      bestBowlingWickets: 5,
      bestBowlingRuns: 16,
    },
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'p-dube',
    fullName: 'Shivam Dube',
    displayName: 'S. Dube',
    jerseyNumber: 25,
    role: 'All-Rounder',
    battingStyle: 'Left Hand Bat',
    bowlingStyle: 'Right-arm Medium',
    isWicketKeeper: false,
    teamId: 'team-csk',
    avatarColor: '#6366F1',
    stats: {
      matches: 51,
      innings: 47,
      runs: 1106,
      ballsFaced: 700,
      fours: 68,
      sixes: 73,
      highestScore: 95,
      notOuts: 9,
      oversBowled: 28,
      runsConceded: 240,
      wickets: 4,
      maidens: 0,
      bestBowlingWickets: 2,
      bestBowlingRuns: 15,
    },
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'p-pathirana',
    fullName: 'Matheesha Pathirana',
    displayName: 'M. Pathirana',
    jerseyNumber: 99,
    role: 'Bowler',
    battingStyle: 'Right Hand Bat',
    bowlingStyle: 'Right-arm Fast',
    isWicketKeeper: false,
    teamId: 'team-csk',
    avatarColor: '#EF4444',
    stats: {
      matches: 14,
      innings: 2,
      runs: 5,
      ballsFaced: 6,
      fours: 0,
      sixes: 0,
      highestScore: 4,
      notOuts: 1,
      oversBowled: 53,
      runsConceded: 420,
      wickets: 21,
      maidens: 0,
      bestBowlingWickets: 4,
      bestBowlingRuns: 28,
    },
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'p-chahar',
    fullName: 'Deepak Chahar',
    displayName: 'D. Chahar',
    jerseyNumber: 90,
    role: 'Bowler',
    battingStyle: 'Right Hand Bat',
    bowlingStyle: 'Right-arm Medium',
    isWicketKeeper: false,
    teamId: 'team-csk',
    avatarColor: '#3B82F6',
    stats: {
      matches: 73,
      innings: 15,
      runs: 80,
      ballsFaced: 60,
      fours: 6,
      sixes: 3,
      highestScore: 39,
      notOuts: 6,
      oversBowled: 260,
      runsConceded: 2040,
      wickets: 72,
      maidens: 8,
      bestBowlingWickets: 4,
      bestBowlingRuns: 13,
    },
    createdAt: Date.now() - 86400000 * 30,
  },
  // MI
  {
    id: 'p-rohit',
    fullName: 'Rohit Sharma',
    displayName: 'Rohit Sharma',
    jerseyNumber: 45,
    role: 'Batter',
    battingStyle: 'Right Hand Bat',
    bowlingStyle: 'Right-arm Off Spin',
    isWicketKeeper: false,
    teamId: 'team-mi',
    avatarColor: '#2563EB',
    notes: 'Hitman - dynamic opening batter',
    stats: {
      matches: 243,
      innings: 238,
      runs: 6211,
      ballsFaced: 4760,
      fours: 561,
      sixes: 257,
      highestScore: 109,
      notOuts: 28,
      oversBowled: 32,
      runsConceded: 260,
      wickets: 15,
      maidens: 0,
      bestBowlingWickets: 4,
      bestBowlingRuns: 6,
    },
    createdAt: Date.now() - 86400000 * 29,
  },
  {
    id: 'p-surya',
    fullName: 'Suryakumar Yadav',
    displayName: 'Suryakumar Yadav',
    jerseyNumber: 63,
    role: 'Batter',
    battingStyle: 'Right Hand Bat',
    bowlingStyle: 'Right-arm Medium',
    isWicketKeeper: false,
    teamId: 'team-mi',
    avatarColor: '#3B82F6',
    stats: {
      matches: 139,
      innings: 124,
      runs: 3249,
      ballsFaced: 2260,
      fours: 349,
      sixes: 112,
      highestScore: 103,
      notOuts: 23,
      oversBowled: 0,
      runsConceded: 0,
      wickets: 0,
      maidens: 0,
      bestBowlingWickets: 0,
      bestBowlingRuns: 0,
    },
    createdAt: Date.now() - 86400000 * 29,
  },
  {
    id: 'p-hardik',
    fullName: 'Hardik Pandya',
    displayName: 'Hardik Pandya',
    jerseyNumber: 33,
    role: 'All-Rounder',
    battingStyle: 'Right Hand Bat',
    bowlingStyle: 'Right-arm Fast',
    isWicketKeeper: false,
    teamId: 'team-mi',
    avatarColor: '#8B5CF6',
    stats: {
      matches: 123,
      innings: 115,
      runs: 2309,
      ballsFaced: 1580,
      fours: 172,
      sixes: 125,
      highestScore: 91,
      notOuts: 38,
      oversBowled: 235,
      runsConceded: 2060,
      wickets: 53,
      maidens: 0,
      bestBowlingWickets: 3,
      bestBowlingRuns: 17,
    },
    createdAt: Date.now() - 86400000 * 29,
  },
  {
    id: 'p-bumrah',
    fullName: 'Jasprit Bumrah',
    displayName: 'Jasprit Bumrah',
    jerseyNumber: 93,
    role: 'Bowler',
    battingStyle: 'Right Hand Bat',
    bowlingStyle: 'Right-arm Fast',
    isWicketKeeper: false,
    teamId: 'team-mi',
    avatarColor: '#EC4899',
    notes: 'World premier yorker specialist',
    stats: {
      matches: 120,
      innings: 24,
      runs: 56,
      ballsFaced: 60,
      fours: 5,
      sixes: 1,
      highestScore: 16,
      notOuts: 14,
      oversBowled: 457,
      runsConceded: 3380,
      wickets: 145,
      maidens: 7,
      bestBowlingWickets: 5,
      bestBowlingRuns: 10,
    },
    createdAt: Date.now() - 86400000 * 29,
  },
  {
    id: 'p-ishan',
    fullName: 'Ishan Kishan',
    displayName: 'Ishan Kishan',
    jerseyNumber: 23,
    role: 'Wicketkeeper',
    battingStyle: 'Left Hand Bat',
    bowlingStyle: 'None',
    isWicketKeeper: true,
    teamId: 'team-mi',
    avatarColor: '#06B6D4',
    stats: {
      matches: 91,
      innings: 85,
      runs: 2324,
      ballsFaced: 1730,
      fours: 220,
      sixes: 103,
      highestScore: 99,
      notOuts: 6,
      oversBowled: 0,
      runsConceded: 0,
      wickets: 0,
      maidens: 0,
      bestBowlingWickets: 0,
      bestBowlingRuns: 0,
    },
    createdAt: Date.now() - 86400000 * 29,
  },
  {
    id: 'p-tilak',
    fullName: 'Tilak Varma',
    displayName: 'Tilak Varma',
    jerseyNumber: 9,
    role: 'Batter',
    battingStyle: 'Left Hand Bat',
    bowlingStyle: 'Right-arm Off Spin',
    isWicketKeeper: false,
    teamId: 'team-mi',
    avatarColor: '#14B8A6',
    stats: {
      matches: 25,
      innings: 25,
      runs: 740,
      ballsFaced: 512,
      fours: 55,
      sixes: 41,
      highestScore: 84,
      notOuts: 5,
      oversBowled: 2,
      runsConceded: 18,
      wickets: 0,
      maidens: 0,
      bestBowlingWickets: 0,
      bestBowlingRuns: 0,
    },
    createdAt: Date.now() - 86400000 * 29,
  },
  // RCB
  {
    id: 'p-kohli',
    fullName: 'Virat Kohli',
    displayName: 'Virat Kohli (King)',
    jerseyNumber: 18,
    role: 'Batter',
    battingStyle: 'Right Hand Bat',
    bowlingStyle: 'Right-arm Medium',
    isWicketKeeper: false,
    teamId: 'team-rcb',
    avatarColor: '#DC2626',
    notes: 'Record run machine and chase master',
    stats: {
      matches: 237,
      innings: 229,
      runs: 7263,
      ballsFaced: 5580,
      fours: 643,
      sixes: 234,
      highestScore: 113,
      notOuts: 34,
      oversBowled: 41,
      runsConceded: 368,
      wickets: 4,
      maidens: 0,
      bestBowlingWickets: 2,
      bestBowlingRuns: 25,
    },
    createdAt: Date.now() - 86400000 * 28,
  },
  {
    id: 'p-faf',
    fullName: 'Faf du Plessis',
    displayName: 'Faf du Plessis',
    jerseyNumber: 13,
    role: 'Batter',
    battingStyle: 'Right Hand Bat',
    bowlingStyle: 'Right-arm Leg Spin',
    isWicketKeeper: false,
    teamId: 'team-rcb',
    avatarColor: '#F97316',
    stats: {
      matches: 130,
      innings: 123,
      runs: 4133,
      ballsFaced: 3080,
      fours: 374,
      sixes: 145,
      highestScore: 96,
      notOuts: 13,
      oversBowled: 1,
      runsConceded: 16,
      wickets: 0,
      maidens: 0,
      bestBowlingWickets: 0,
      bestBowlingRuns: 0,
    },
    createdAt: Date.now() - 86400000 * 28,
  },
  {
    id: 'p-maxwell',
    fullName: 'Glenn Maxwell',
    displayName: 'Glenn Maxwell',
    jerseyNumber: 32,
    role: 'All-Rounder',
    battingStyle: 'Right Hand Bat',
    bowlingStyle: 'Right-arm Off Spin',
    isWicketKeeper: false,
    teamId: 'team-rcb',
    avatarColor: '#A855F7',
    stats: {
      matches: 124,
      innings: 120,
      runs: 2719,
      ballsFaced: 1720,
      fours: 226,
      sixes: 158,
      highestScore: 95,
      notOuts: 16,
      oversBowled: 140,
      runsConceded: 1160,
      wickets: 31,
      maidens: 0,
      bestBowlingWickets: 2,
      bestBowlingRuns: 15,
    },
    createdAt: Date.now() - 86400000 * 28,
  },
  {
    id: 'p-siraj',
    fullName: 'Mohammed Siraj',
    displayName: 'M. Siraj',
    jerseyNumber: 73,
    role: 'Bowler',
    battingStyle: 'Right Hand Bat',
    bowlingStyle: 'Right-arm Fast',
    isWicketKeeper: false,
    teamId: 'team-rcb',
    avatarColor: '#0EA5E9',
    stats: {
      matches: 79,
      innings: 17,
      runs: 48,
      ballsFaced: 52,
      fours: 3,
      sixes: 1,
      highestScore: 14,
      notOuts: 10,
      oversBowled: 280,
      runsConceded: 2380,
      wickets: 78,
      maidens: 4,
      bestBowlingWickets: 4,
      bestBowlingRuns: 21,
    },
    createdAt: Date.now() - 86400000 * 28,
  },
  {
    id: 'p-dk',
    fullName: 'Dinesh Karthik',
    displayName: 'Dinesh Karthik',
    jerseyNumber: 19,
    role: 'Wicketkeeper',
    battingStyle: 'Right Hand Bat',
    bowlingStyle: 'Right-arm Off Spin',
    isWicketKeeper: true,
    teamId: 'team-rcb',
    avatarColor: '#E11D48',
    stats: {
      matches: 242,
      innings: 221,
      runs: 4516,
      ballsFaced: 3390,
      fours: 439,
      sixes: 139,
      highestScore: 97,
      notOuts: 48,
      oversBowled: 0,
      runsConceded: 0,
      wickets: 0,
      maidens: 0,
      bestBowlingWickets: 0,
      bestBowlingRuns: 0,
    },
    createdAt: Date.now() - 86400000 * 28,
  },
];

// Sample completed match for history & scorecard inspection right after launch
const SAMPLE_COMPLETED_MATCH: Match = {
  id: 'match-sample-01',
  title: 'El Clásico: CSK vs MI',
  date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
  venue: 'M. A. Chidambaram Stadium, Chennai',
  oversPerInnings: 20,
  matchFormat: 'T20',
  teamAId: 'team-mi',
  teamBId: 'team-csk',
  teamAPlayers: ['p-rohit', 'p-ishan', 'p-surya', 'p-tilak', 'p-hardik', 'p-bumrah'],
  teamBPlayers: ['p-ruturaj', 'p-dube', 'p-jadeja', 'p-dhoni', 'p-chahar', 'p-pathirana'],
  tossWinnerId: 'team-csk',
  tossDecision: 'bowl',
  currentInningsNumber: 2,
  status: 'completed',
  resultSummary: 'CSK won by 4 wickets (with 2 balls remaining)',
  winnerTeamId: 'team-csk',
  createdAt: Date.now() - 86400000 * 2,
  updatedAt: Date.now() - 86400000 * 2 + 7200000,
  innings: {
    1: {
      inningsNumber: 1,
      battingTeamId: 'team-mi',
      bowlingTeamId: 'team-csk',
      totalRuns: 178,
      wickets: 5,
      legalDeliveries: 120,
      totalDeliveries: 124,
      currentStrikerId: 'p-hardik',
      currentNonStrikerId: 'p-tilak',
      currentBowlerId: 'p-pathirana',
      target: 179,
      isCompleted: true,
      extras: { wides: 3, noballs: 1, byes: 0, legbyes: 0, penalties: 0, total: 4 },
      fallOfWickets: [
        { wicketNumber: 1, runs: 38, overStr: '4.2', batterId: 'p-rohit' },
        { wicketNumber: 2, runs: 85, overStr: '9.4', batterId: 'p-ishan' },
        { wicketNumber: 3, runs: 122, overStr: '14.1', batterId: 'p-surya' },
      ],
      deliveries: [],
      batters: {
        'p-rohit': { playerId: 'p-rohit', runs: 26, balls: 19, fours: 3, sixes: 1, isOut: true, dismissalType: 'caught', bowlerCreditedId: 'p-chahar', fielderId: 'p-jadeja', battingPosition: 1 },
        'p-ishan': { playerId: 'p-ishan', runs: 42, balls: 31, fours: 5, sixes: 2, isOut: true, dismissalType: 'bowled', bowlerCreditedId: 'p-jadeja', battingPosition: 2 },
        'p-surya': { playerId: 'p-surya', runs: 34, balls: 22, fours: 4, sixes: 1, isOut: true, dismissalType: 'lbw', bowlerCreditedId: 'p-pathirana', battingPosition: 3 },
        'p-tilak': { playerId: 'p-tilak', runs: 41, balls: 28, fours: 3, sixes: 2, isOut: false, battingPosition: 4 },
        'p-hardik': { playerId: 'p-hardik', runs: 31, balls: 20, fours: 2, sixes: 2, isOut: false, battingPosition: 5 },
      },
      bowlers: {
        'p-chahar': { playerId: 'p-chahar', balls: 24, maidens: 0, runs: 36, wickets: 1, wides: 1, noballs: 0, bowlingOrder: 1 },
        'p-jadeja': { playerId: 'p-jadeja', balls: 24, maidens: 0, runs: 28, wickets: 1, wides: 0, noballs: 0, bowlingOrder: 2 },
        'p-pathirana': { playerId: 'p-pathirana', balls: 24, maidens: 0, runs: 32, wickets: 2, wides: 1, noballs: 1, bowlingOrder: 3 },
      },
    },
    2: {
      inningsNumber: 2,
      battingTeamId: 'team-csk',
      bowlingTeamId: 'team-mi',
      totalRuns: 182,
      wickets: 6,
      legalDeliveries: 118,
      totalDeliveries: 122,
      currentStrikerId: 'p-dhoni',
      currentNonStrikerId: 'p-jadeja',
      currentBowlerId: 'p-bumrah',
      target: 179,
      isCompleted: true,
      extras: { wides: 2, noballs: 1, byes: 1, legbyes: 0, penalties: 0, total: 4 },
      fallOfWickets: [
        { wicketNumber: 1, runs: 45, overStr: '5.1', batterId: 'p-ruturaj' },
        { wicketNumber: 2, runs: 98, overStr: '11.3', batterId: 'p-dube' },
      ],
      deliveries: [],
      batters: {
        'p-ruturaj': { playerId: 'p-ruturaj', runs: 48, balls: 32, fours: 6, sixes: 1, isOut: true, dismissalType: 'caught', bowlerCreditedId: 'p-bumrah', fielderId: 'p-rohit', battingPosition: 1 },
        'p-dube': { playerId: 'p-dube', runs: 56, balls: 34, fours: 4, sixes: 4, isOut: true, dismissalType: 'bowled', bowlerCreditedId: 'p-hardik', battingPosition: 2 },
        'p-jadeja': { playerId: 'p-jadeja', runs: 22, balls: 16, fours: 2, sixes: 0, isOut: false, battingPosition: 3 },
        'p-dhoni': { playerId: 'p-dhoni', runs: 38, balls: 18, fours: 3, sixes: 3, isOut: false, battingPosition: 4 },
      },
      bowlers: {
        'p-bumrah': { playerId: 'p-bumrah', balls: 24, maidens: 1, runs: 22, wickets: 2, wides: 0, noballs: 0, bowlingOrder: 1 },
        'p-hardik': { playerId: 'p-hardik', balls: 24, maidens: 0, runs: 42, wickets: 1, wides: 1, noballs: 1, bowlingOrder: 2 },
      },
    },
  },
};

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-welcome',
    title: 'Welcome to Mahi Crick Pro',
    message: 'Local-first offline scoring engine initialized. CSK, MI, RCB squads loaded.',
    type: 'success',
    timestamp: Date.now() - 3600000,
    isRead: false,
  },
  {
    id: 'notif-match-1',
    title: 'Match Record Ready',
    message: 'CSK vs MI completed match scorecard available for review in Match History.',
    type: 'info',
    timestamp: Date.now() - 1800000,
    isRead: false,
  },
];

class StorageService {
  private ensureInitialized(): void {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.TEAMS)) {
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PLAYERS)) {
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(INITIAL_PLAYERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MATCHES)) {
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify([SAMPLE_COMPLETED_MATCH]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TOURNAMENTS)) {
      const initialTournaments: Tournament[] = [
        {
          id: 'tourn-champions-cup-2026',
          name: 'Mahi Champions Premier League 2026',
          shortName: 'MCPL 2026',
          format: 'T20',
          oversPerInnings: 20,
          startDate: new Date().toISOString().split('T')[0],
          venue: 'Wankhede & Chepauk Stadiums',
          status: 'ongoing',
          teamIds: ['team-csk', 'team-mi', 'team-rcb', 'team-ind'],
          matchIds: ['match-sample-01'],
          pointsTable: [
            {
              teamId: 'team-csk',
              played: 1,
              won: 1,
              lost: 0,
              tied: 0,
              noResult: 0,
              points: 2,
              netRunRate: 0.25,
              runsScored: 182,
              oversFaced: 19.4,
              runsConceded: 178,
              oversBowled: 20,
            },
            {
              teamId: 'team-mi',
              played: 1,
              won: 0,
              lost: 1,
              tied: 0,
              noResult: 0,
              points: 0,
              netRunRate: -0.25,
              runsScored: 178,
              oversFaced: 20,
              runsConceded: 182,
              oversBowled: 19.4,
            },
            {
              teamId: 'team-rcb',
              played: 0,
              won: 0,
              lost: 0,
              tied: 0,
              noResult: 0,
              points: 0,
              netRunRate: 0.0,
              runsScored: 0,
              oversFaced: 0,
              runsConceded: 0,
              oversBowled: 0,
            },
            {
              teamId: 'team-ind',
              played: 0,
              won: 0,
              lost: 0,
              tied: 0,
              noResult: 0,
              points: 0,
              netRunRate: 0.0,
              runsScored: 0,
              oversFaced: 0,
              runsConceded: 0,
              oversBowled: 0,
            },
          ],
          createdAt: Date.now() - 86400000 * 5,
          updatedAt: Date.now(),
        },
      ];
      localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(initialTournaments));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION)) {
      localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, '1.0');
    }
  }

  // Settings
  getSettings(): AppSettings {
    this.ensureInitialized();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings(settings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }

  // Teams
  getTeams(): Team[] {
    this.ensureInitialized();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEAMS);
      return data ? JSON.parse(data) : INITIAL_TEAMS;
    } catch {
      return INITIAL_TEAMS;
    }
  }

  getTeamById(id: string): Team | undefined {
    return this.getTeams().find((t) => t.id === id);
  }

  saveTeam(team: Team): void {
    const teams = this.getTeams();
    const index = teams.findIndex((t) => t.id === team.id);
    if (index >= 0) {
      teams[index] = team;
    } else {
      teams.unshift(team);
    }
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    this.addNotification({
      title: 'Team Saved',
      message: `${team.name} (${team.shortName}) successfully updated.`,
      type: 'success',
    });
  }

  deleteTeam(id: string): boolean {
    const teams = this.getTeams().filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    return true;
  }

  // Players
  getPlayers(): Player[] {
    this.ensureInitialized();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYERS);
      return data ? JSON.parse(data) : INITIAL_PLAYERS;
    } catch {
      return INITIAL_PLAYERS;
    }
  }

  getPlayerById(id: string): Player | undefined {
    return this.getPlayers().find((p) => p.id === id);
  }

  getPlayersByTeam(teamId: string): Player[] {
    return this.getPlayers().filter((p) => p.teamId === teamId);
  }

  savePlayer(player: Player): void {
    const players = this.getPlayers();
    const index = players.findIndex((p) => p.id === player.id);
    if (index >= 0) {
      players[index] = player;
    } else {
      players.unshift(player);
    }
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));

    // Also update team roster if player has teamId
    if (player.teamId) {
      const team = this.getTeamById(player.teamId);
      if (team && !team.playerIds.includes(player.id)) {
        team.playerIds.push(player.id);
        this.saveTeam(team);
      }
    }
  }

  deletePlayer(id: string): boolean {
    const players = this.getPlayers().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    return true;
  }

  // Matches
  getMatches(): Match[] {
    this.ensureInitialized();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getMatchById(id: string): Match | undefined {
    return this.getMatches().find((m) => m.id === id);
  }

  getActiveMatch(): Match | undefined {
    this.ensureInitialized();
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_MATCH_ID);
    if (!activeId) {
      // Find any match with status 'live' or 'innings_break'
      const matches = this.getMatches();
      return matches.find((m) => m.status === 'live' || m.status === 'innings_break');
    }
    return this.getMatchById(activeId);
  }

  setActiveMatchId(id: string | null): void {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_MATCH_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_MATCH_ID);
    }
  }

  /**
   * Transactional save of match state
   */
  saveMatch(match: Match): void {
    const matches = this.getMatches();
    const index = matches.findIndex((m) => m.id === match.id);
    match.updatedAt = Date.now();

    if (index >= 0) {
      matches[index] = match;
    } else {
      matches.unshift(match);
    }

    try {
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
      if (match.status === 'live' || match.status === 'innings_break') {
        this.setActiveMatchId(match.id);
      } else if (match.status === 'completed' || match.status === 'abandoned') {
        if (localStorage.getItem(STORAGE_KEYS.ACTIVE_MATCH_ID) === match.id) {
          this.setActiveMatchId(null);
        }
      }

      // Automatically broadcast and sync to Firebase Firestore cloud in real-time
      try {
        const currentTeams = this.getTeams();
        const currentPlayers = this.getPlayers();
        cloudSyncService.syncMatchToCloud(match, currentTeams, currentPlayers).catch(() => {});
      } catch {
        // Non-blocking local fallback
      }
    } catch (err) {
      console.error('Storage transactional write failure:', err);
      throw new Error('Failed to commit match transaction to local database.');
    }
  }

  deleteMatch(id: string): void {
    const matches = this.getMatches().filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
    if (localStorage.getItem(STORAGE_KEYS.ACTIVE_MATCH_ID) === id) {
      this.setActiveMatchId(null);
    }
  }

  // Tournaments
  getTournaments(): Tournament[] {
    this.ensureInitialized();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getTournamentById(id: string): Tournament | undefined {
    return this.getTournaments().find((t) => t.id === id);
  }

  saveTournament(tournament: Tournament): void {
    const tournaments = this.getTournaments();
    const index = tournaments.findIndex((t) => t.id === tournament.id);
    tournament.updatedAt = Date.now();
    if (index >= 0) {
      tournaments[index] = tournament;
    } else {
      tournaments.unshift(tournament);
    }
    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));

    // Sync to Firestore Cloud in real-time
    try {
      const teams = this.getTeams();
      const matches = this.getMatches();
      cloudSyncService.syncTournamentToCloud(tournament, teams, matches).catch(() => {});
    } catch {
      // Non-blocking fallback
    }
  }

  deleteTournament(id: string): void {
    const list = this.getTournaments().filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(list));
  }

  recalculateTournamentPoints(tournamentId: string): Tournament | undefined {
    const tourn = this.getTournamentById(tournamentId);
    if (!tourn) return undefined;

    const allMatches = this.getMatches();
    const tournMatches = allMatches.filter((m) => m.tournamentId === tournamentId || tourn.matchIds.includes(m.id));

    // Build fresh stats for all participating teams
    const teamStatsMap = new Map<string, TournamentTeamStats>();
    tourn.teamIds.forEach((tId) => {
      teamStatsMap.set(tId, {
        teamId: tId,
        played: 0,
        won: 0,
        lost: 0,
        tied: 0,
        noResult: 0,
        points: 0,
        netRunRate: 0,
        runsScored: 0,
        oversFaced: 0,
        runsConceded: 0,
        oversBowled: 0,
      });
    });

    tournMatches.forEach((m) => {
      if (m.status !== 'completed' && m.status !== 'abandoned') return;

      const statsA = teamStatsMap.get(m.teamAId);
      const statsB = teamStatsMap.get(m.teamBId);
      if (!statsA || !statsB) return;

      statsA.played += 1;
      statsB.played += 1;

      if (m.status === 'abandoned') {
        statsA.noResult += 1;
        statsB.noResult += 1;
        statsA.points += 1;
        statsB.points += 1;
        return;
      }

      if (m.winnerTeamId === m.teamAId) {
        statsA.won += 1;
        statsA.points += 2;
        statsB.lost += 1;
      } else if (m.winnerTeamId === m.teamBId) {
        statsB.won += 1;
        statsB.points += 2;
        statsA.lost += 1;
      } else {
        statsA.tied += 1;
        statsB.tied += 1;
        statsA.points += 1;
        statsB.points += 1;
      }

      // Add runs and overs for NRR estimation
      const inn1 = m.innings[1];
      const inn2 = m.innings[2];
      if (inn1 && inn2) {
        const team1IsA = inn1.battingTeamId === m.teamAId;
        const runsTeamA = team1IsA ? inn1.totalRuns : inn2.totalRuns;
        const ovTeamA = team1IsA ? inn1.legalDeliveries / 6 : inn2.legalDeliveries / 6;
        const runsTeamB = team1IsA ? inn2.totalRuns : inn1.totalRuns;
        const ovTeamB = team1IsA ? inn2.legalDeliveries / 6 : inn1.legalDeliveries / 6;

        statsA.runsScored += runsTeamA;
        statsA.oversFaced += ovTeamA;
        statsA.runsConceded += runsTeamB;
        statsA.oversBowled += ovTeamB;

        statsB.runsScored += runsTeamB;
        statsB.oversFaced += ovTeamB;
        statsB.runsConceded += runsTeamA;
        statsB.oversBowled += ovTeamA;
      }
    });

    // Compute NRR
    teamStatsMap.forEach((st) => {
      const batRate = st.oversFaced > 0 ? st.runsScored / st.oversFaced : 0;
      const bowlRate = st.oversBowled > 0 ? st.runsConceded / st.oversBowled : 0;
      st.netRunRate = Number((batRate - bowlRate).toFixed(3));
    });

    // Sort by Points descending, then NRR descending
    const updatedTable = Array.from(teamStatsMap.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.netRunRate - a.netRunRate;
    });

    tourn.pointsTable = updatedTable;
    this.saveTournament(tourn);
    return tourn;
  }

  // Notifications
  getNotifications(): AppNotification[] {
    this.ensureInitialized();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>): void {
    const current = this.getNotifications();
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
      isRead: false,
    };
    current.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(current.slice(0, 30)));
  }

  markAllNotificationsAsRead(): void {
    const notifs = this.getNotifications().map((n) => ({ ...n, isRead: true }));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }

  clearNotifications(): void {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
  }

  // Intro flag
  hasSeenIntro(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEYS.INTRO_SEEN) === 'true';
  }

  setIntroSeen(): void {
    localStorage.setItem(STORAGE_KEYS.INTRO_SEEN, 'true');
  }

  // Backup & Restore
  exportBackupJSON(): string {
    this.ensureInitialized();
    const dump = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      teams: this.getTeams(),
      players: this.getPlayers(),
      matches: this.getMatches(),
      settings: this.getSettings(),
    };
    return JSON.stringify(dump, null, 2);
  }

  importBackupJSON(jsonStr: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.teams || !parsed.players || !parsed.matches) {
        return { success: false, message: 'Invalid backup format. Missing core tables.' };
      }
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(parsed.teams));
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(parsed.players));
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(parsed.matches));
      if (parsed.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));
      }
      return { success: true, message: 'Database restored successfully!' };
    } catch (err: any) {
      return { success: false, message: `Import error: ${err.message}` };
    }
  }

  resetToDefaults(): void {
    localStorage.clear();
    this.ensureInitialized();
  }
}

export const storageService = new StorageService();
