/**
 * Mahi Crick Pro - Firebase Online Cloud Sync Service
 * Real-time cloud synchronization for live matches and spectator sharing
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Match, Team, Player, Tournament } from '../types/cricket';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: null,
      email: null,
    },
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
}

// Test initial connection as required by skill guidelines
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'matches', 'connection-test'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is offline or network is disconnected.');
    }
    return false;
  }
}

// Non-blocking initial connectivity check
if (typeof window !== 'undefined') {
  setTimeout(() => {
    testConnection().catch(() => {});
  }, 100);
}

export interface EnrichedMatchPayload extends Match {
  teamAName?: string;
  teamBName?: string;
  teamAShortName?: string;
  teamBShortName?: string;
  teamAColor?: string;
  teamBColor?: string;
  playerNamesMap?: Record<string, string>;
  cloudSyncedAt?: number;
}

class CloudSyncService {
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Upload or sync match state to Firestore cloud with rich team/player metadata
   */
  async syncMatchToCloud(
    match: Match,
    teams?: Team[],
    players?: Player[]
  ): Promise<boolean> {
    const docPath = `matches/${match.id}`;
    try {
      const matchRef = doc(db, 'matches', match.id);

      // Clean undefined values before writing to Firestore
      const cleanMatch: EnrichedMatchPayload = JSON.parse(JSON.stringify(match));
      cleanMatch.cloudSyncedAt = Date.now();

      // Enrich with team names and player maps for instant spectator viewing without local storage
      if (teams && teams.length > 0) {
        const teamA = teams.find((t) => t.id === match.teamAId);
        const teamB = teams.find((t) => t.id === match.teamBId);
        if (teamA) {
          cleanMatch.teamAName = teamA.name;
          cleanMatch.teamAShortName = teamA.shortName;
          cleanMatch.teamAColor = teamA.primaryColor;
        }
        if (teamB) {
          cleanMatch.teamBName = teamB.name;
          cleanMatch.teamBShortName = teamB.shortName;
          cleanMatch.teamBColor = teamB.primaryColor;
        }
      }

      if (players && players.length > 0) {
        const pMap: Record<string, string> = {};
        players.forEach((p) => {
          pMap[p.id] = p.fullName;
        });
        cleanMatch.playerNamesMap = pMap;
      }

      await setDoc(matchRef, cleanMatch, { merge: true });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, docPath);
      return false;
    }
  }

  /**
   * Subscribe to live match updates from Firestore (for spectators)
   */
  subscribeToCloudMatch(
    matchId: string,
    onUpdate: (match: EnrichedMatchPayload) => void,
    onError?: (err: any) => void
  ): () => void {
    const docPath = `matches/${matchId}`;
    try {
      const matchRef = doc(db, 'matches', matchId);
      const unsubscribe = onSnapshot(
        matchRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as EnrichedMatchPayload;
            onUpdate(data);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, docPath);
          if (onError) onError(error);
        }
      );
      return unsubscribe;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, docPath);
      return () => {};
    }
  }

  /**
   * Fetch a single match document from cloud
   */
  async fetchCloudMatch(matchId: string): Promise<EnrichedMatchPayload | null> {
    const docPath = `matches/${matchId}`;
    try {
      const matchRef = doc(db, 'matches', matchId);
      const snapshot = await getDoc(matchRef);
      if (snapshot.exists()) {
        return snapshot.data() as EnrichedMatchPayload;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, docPath);
      return null;
    }
  }

  /**
   * Upload and sync tournament data (standings, matches, teams) to Firestore cloud
   */
  async syncTournamentToCloud(
    tournament: Tournament,
    teams?: Team[],
    matches?: Match[]
  ): Promise<boolean> {
    const docPath = `tournaments/${tournament.id}`;
    try {
      const tournRef = doc(db, 'tournaments', tournament.id);
      const cleanTourn: any = JSON.parse(JSON.stringify(tournament));
      cleanTourn.cloudSyncedAt = Date.now();

      if (teams && teams.length > 0) {
        const teamMap: Record<string, { name: string; shortName: string; color: string }> = {};
        teams.forEach((t) => {
          teamMap[t.id] = { name: t.name, shortName: t.shortName, color: t.primaryColor };
        });
        cleanTourn.teamsMap = teamMap;
      }

      if (matches && matches.length > 0) {
        cleanTourn.recentMatches = matches
          .filter((m) => tournament.matchIds.includes(m.id))
          .map((m) => ({
            id: m.id,
            title: m.title,
            status: m.status,
            resultSummary: m.resultSummary || '',
            date: m.date,
          }));
      }

      await setDoc(tournRef, cleanTourn, { merge: true });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, docPath);
      return false;
    }
  }

  /**
   * Fetch tournament from cloud
   */
  async fetchCloudTournament(tournamentId: string): Promise<Tournament | null> {
    const docPath = `tournaments/${tournamentId}`;
    try {
      const tournRef = doc(db, 'tournaments', tournamentId);
      const snapshot = await getDoc(tournRef);
      if (snapshot.exists()) {
        return snapshot.data() as Tournament;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, docPath);
      return null;
    }
  }

  /**
   * Subscribe to live tournament updates
   */
  subscribeToCloudTournament(
    tournamentId: string,
    onUpdate: (data: Tournament) => void,
    onError?: (err: any) => void
  ): () => void {
    const docPath = `tournaments/${tournamentId}`;
    try {
      const tournRef = doc(db, 'tournaments', tournamentId);
      const unsubscribe = onSnapshot(
        tournRef,
        (snapshot) => {
          if (snapshot.exists()) {
            onUpdate(snapshot.data() as Tournament);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, docPath);
          if (onError) onError(error);
        }
      );
      return unsubscribe;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, docPath);
      return () => {};
    }
  }

  /**
   * Diagnostic details
   */
  getDatabaseId(): string {
    return firebaseConfig.firestoreDatabaseId || 'default';
  }

  getProjectId(): string {
    return firebaseConfig.projectId || '';
  }
}

export const cloudSyncService = new CloudSyncService();
