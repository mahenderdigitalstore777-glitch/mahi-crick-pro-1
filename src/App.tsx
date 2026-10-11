/**
 * Mahi Crick Pro - Phase 1: Premium Cricket Scoring Application
 * Main Application Orchestrator
 */

import React, { useState, useEffect } from 'react';
import { SplashScreen } from './components/launch/SplashScreen';
import { LogoIntro3D } from './components/launch/LogoIntro3D';
import { TopAppBar } from './components/layout/TopAppBar';
import { NavigationDrawer, NavScreenId } from './components/layout/NavigationDrawer';
import { BottomNavigationBar } from './components/layout/BottomNavigationBar';
import { SearchModal } from './components/modals/SearchModal';
import { NotificationCenterModal } from './components/modals/NotificationCenterModal';
import { HomeDashboard } from './components/home/HomeDashboard';
import { TeamManagement } from './components/teams/TeamManagement';
import { PlayerManagement } from './components/players/PlayerManagement';
import { NewMatchWizard } from './components/match/NewMatchWizard';
import { LiveScoringScreen } from './components/scoring/LiveScoringScreen';
import { SpectatorLiveView } from './components/spectator/SpectatorLiveView';
import { JoinLiveMatchModal } from './components/spectator/JoinLiveMatchModal';
import { ApkInstallModal } from './components/modals/ApkInstallModal';
import { MatchHistory } from './components/history/MatchHistory';
import { FullScorecardView } from './components/scorecard/FullScorecardView';
import { StatisticsScreen } from './components/stats/StatisticsScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { InfoScreen } from './components/layout/InfoScreen';
import { TournamentManagement } from './components/tournaments/TournamentManagement';
import { SpectatorTournamentView } from './components/spectator/SpectatorTournamentView';
import { ShareTournamentModal } from './components/tournaments/ShareTournamentModal';
import { storageService } from './services/storage';
import { cloudSyncService } from './services/firebase';
import { Match, Team, Player, AppNotification, AppSettings, Tournament } from './types/cricket';
import { Radio, AlertCircle } from 'lucide-react';

export default function App() {
  // Launch Lifecycle
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [show3DIntro, setShow3DIntro] = useState<boolean>(false);
  const [hasLaunched, setHasLaunched] = useState<boolean>(false);

  // Core App State
  const [activeScreen, setActiveScreen] = useState<NavScreenId>('home');
  const [activeMatch, setActiveMatch] = useState<Match | undefined>(undefined);
  const [viewingScorecardMatchId, setViewingScorecardMatchId] = useState<string | null>(null);

  // Database Records
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());

  // Tournament specific match launcher state
  const [tournamentMatchContextId, setTournamentMatchContextId] = useState<string | undefined>(undefined);
  const [activeTournamentId, setActiveTournamentId] = useState<string | undefined>(undefined);

  // Overlays
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [shareTournamentTarget, setShareTournamentTarget] = useState<Tournament | null>(null);

  // Cloud Live Match Spectator States
  const [isConnectingCloudMatch, setIsConnectingCloudMatch] = useState(false);
  const [cloudMatchError, setCloudMatchError] = useState<string | null>(null);
  const [currentSharedMatchId, setCurrentSharedMatchId] = useState<string | null>(null);

  // Cloud Live Tournament Spectator States
  const [spectatorTournament, setSpectatorTournament] = useState<Tournament | null>(null);
  const [isConnectingCloudTournament, setIsConnectingCloudTournament] = useState(false);
  const [cloudTournamentError, setCloudTournamentError] = useState<string | null>(null);

  // Load Database State
  const refreshAllData = () => {
    setTeams(storageService.getTeams());
    setPlayers(storageService.getPlayers());
    setMatches(storageService.getMatches());
    setTournaments(storageService.getTournaments());
    setNotifications(storageService.getNotifications());
    setActiveMatch(storageService.getActiveMatch());
    setSettings(storageService.getSettings());
  };

  // Connect to Live Tournament (Shared Link)
  const handleConnectTournament = async (targetTournId: string) => {
    const cleanId = targetTournId.trim();
    if (!cleanId) return;

    setActiveTournamentId(cleanId);
    setActiveScreen('tournaments');
    setIsConnectingCloudTournament(true);
    setCloudTournamentError(null);
    setShowSplash(false);
    setShow3DIntro(false);
    setHasLaunched(true);

    // 1. Check local first
    const localTourn = storageService.getTournamentById(cleanId);
    if (localTourn) {
      setSpectatorTournament(localTourn);
      setIsConnectingCloudTournament(false);
    }

    // 2. Fetch from Cloud Firestore
    try {
      const cloudTourn = await cloudSyncService.fetchCloudTournament(cleanId);
      if (cloudTourn) {
        setSpectatorTournament(cloudTourn);
        storageService.saveTournament(cloudTourn);
        refreshAllData();
        setIsConnectingCloudTournament(false);
      } else if (!localTourn) {
        setCloudTournamentError('Tournament not found in cloud database.');
        setIsConnectingCloudTournament(false);
      }
    } catch (err: any) {
      if (!localTourn) {
        setCloudTournamentError(err?.message || 'Failed to fetch live tournament.');
      }
      setIsConnectingCloudTournament(false);
    }

    // 3. Attach real-time listener
    const unsub = cloudSyncService.subscribeToCloudTournament(
      cleanId,
      (updated) => {
        if (updated) {
          setSpectatorTournament(updated);
          storageService.saveTournament(updated);
          refreshAllData();
          setIsConnectingCloudTournament(false);
        }
      },
      (err) => console.warn('Tournament cloud subscription notice:', err)
    );

    return unsub;
  };

  // Connect to Live Match (by ID or Shared Link)
  const handleConnectLiveMatch = async (targetMatchId: string) => {
    const cleanId = targetMatchId.trim();
    if (!cleanId) return;

    setCurrentSharedMatchId(cleanId);
    setIsConnectingCloudMatch(true);
    setCloudMatchError(null);
    setShowSplash(false);
    setShow3DIntro(false);
    setHasLaunched(true);
    setActiveScreen('spectator_live');
    setIsJoinModalOpen(false);

    // 1. Check local storage first (instant if on scorer's phone)
    const localFound = storageService.getMatchById(cleanId);
    if (localFound) {
      setActiveMatch(localFound);
      setIsConnectingCloudMatch(false);
    }

    // 2. Fetch from Firestore Cloud database
    try {
      const cloudMatch = await cloudSyncService.fetchCloudMatch(cleanId);
      if (cloudMatch) {
        setActiveMatch(cloudMatch);
        setIsConnectingCloudMatch(false);
        setCloudMatchError(null);
      } else if (!localFound) {
        // Neither local nor cloud found yet
        setCloudMatchError(
          'Match not found in cloud database. Please verify the Match Code, or ask the scorer to start the match.'
        );
        setIsConnectingCloudMatch(false);
      }
    } catch (err: any) {
      if (!localFound) {
        setCloudMatchError(
          err?.message || 'Unable to connect to live cloud match broadcast.'
        );
      }
      setIsConnectingCloudMatch(false);
    }

    // 3. Attach real-time cloud listener for instant ball-by-ball updates
    const unsubscribe = cloudSyncService.subscribeToCloudMatch(
      cleanId,
      (cloudUpdated) => {
        if (cloudUpdated) {
          setActiveMatch(cloudUpdated);
          setIsConnectingCloudMatch(false);
          setCloudMatchError(null);
        }
      },
      (err) => {
        console.warn('Real-time subscription notice:', err);
      }
    );

    return unsubscribe;
  };

  useEffect(() => {
    refreshAllData();

    // Check if user clicked a shared live score link or tournament link
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const sharedMatchId = urlParams.get('liveMatchId');
      const sharedTournId = urlParams.get('tournamentId');

      if (sharedMatchId) {
        handleConnectLiveMatch(sharedMatchId);
      } else if (sharedTournId) {
        handleConnectTournament(sharedTournId);
      }
    }
  }, []);

  // Handle splash completion
  const handleSplashDone = () => {
    setShowSplash(false);
    const seenBefore = storageService.hasSeenIntro();
    if (!seenBefore) {
      setShow3DIntro(true);
    } else {
      setHasLaunched(true);
    }
  };

  // Handle 3D intro completion
  const handleIntroDone = () => {
    setShow3DIntro(false);
    storageService.setIntroSeen();
    setHasLaunched(true);
  };

  // Screen Title helper
  const getScreenTitle = (): string => {
    if (activeScreen === 'home') return 'Mahi Crick Pro';
    if (activeScreen === 'new_match') return 'New Match Wizard';
    if (activeScreen === 'continue_match') {
      return activeMatch ? `${activeMatch.title}` : 'Live Scoring';
    }
    if (activeScreen === 'spectator_live') return 'Fan Live Broadcast';
    if (activeScreen === 'match_history') return 'Match Archives';
    if (activeScreen === 'tournaments') return 'Tournaments & Leagues';
    if (activeScreen === 'teams') return 'Team Management';
    if (activeScreen === 'players') return 'Player Management';
    if (activeScreen === 'scorecards') return 'Scorecards';
    if (activeScreen === 'statistics') return 'Statistics';
    if (activeScreen === 'settings') return 'Settings';
    if (activeScreen === 'help_guide') return 'Scoring Guide';
    if (activeScreen === 'about') return 'About Mahi Crick Pro';
    if (activeScreen === 'privacy') return 'Privacy';
    if (activeScreen === 'data_mgmt') return 'Data Management';
    return 'Mahi Crick Pro';
  };

  // Navigation handlers
  const handleNavigate = (screen: NavScreenId) => {
    if (screen === 'continue_match') {
      if (activeMatch) {
        setActiveScreen('continue_match');
      } else {
        setActiveScreen('new_match');
      }
    } else if (screen === 'spectator_live') {
      if (activeMatch) {
        setActiveScreen('spectator_live');
      } else {
        setActiveScreen('home');
      }
    } else {
      setActiveScreen(screen);
    }
    setViewingScorecardMatchId(null);
  };

  const handleStartMatch = (newMatch: Match) => {
    storageService.saveMatch(newMatch);
    refreshAllData();
    setActiveMatch(newMatch);
    setActiveScreen('continue_match');
  };

  const handleOpenScorecard = (matchId: string) => {
    setViewingScorecardMatchId(matchId);
  };

  const selectedScorecardMatch = viewingScorecardMatchId
    ? matches.find((m) => m.id === viewingScorecardMatchId) || activeMatch
    : null;

  // Unread notifications count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#070c1e] text-slate-100 flex flex-col justify-start">
      {/* Screen 1: Native Splash */}
      {showSplash && <SplashScreen onComplete={handleSplashDone} />}

      {/* Screen 2: Animated 3D Logo Intro */}
      {show3DIntro && (
        <LogoIntro3D
          onFinish={handleIntroDone}
          isFirstLaunch={!storageService.hasSeenIntro()}
        />
      )}

      {/* Main App Container */}
      {hasLaunched && (
        <div
          className={`flex-1 flex flex-col mx-auto w-full transition-all duration-300 ${
            settings.deviceFrameMode
              ? 'max-w-[420px] my-4 rounded-3xl border-4 border-slate-700/80 shadow-2xl overflow-hidden min-h-[92vh] bg-[#070c1e]'
              : 'max-w-4xl'
          }`}
        >
          {/* Top App Bar */}
          <TopAppBar
            title={getScreenTitle()}
            onOpenDrawer={() => setIsDrawerOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            unreadCount={unreadCount}
            deviceFrameMode={settings.deviceFrameMode}
            onToggleDeviceFrame={() => {
              const updated = storageService.saveSettings({
                deviceFrameMode: !settings.deviceFrameMode,
              });
              setSettings(updated);
            }}
            isScoringScreen={activeScreen === 'continue_match'}
            onOpenApkGuide={() => setIsApkModalOpen(true)}
          />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto">
            {/* View Full Scorecard (Modal / Full View) */}
            {selectedScorecardMatch ? (
              <FullScorecardView
                match={selectedScorecardMatch}
                teams={teams}
                players={players}
                onBack={() => setViewingScorecardMatchId(null)}
              />
            ) : spectatorTournament ? (
              <SpectatorTournamentView
                tournament={spectatorTournament}
                teams={teams}
                matches={matches}
                onBackToApp={() => {
                  setSpectatorTournament(null);
                  setActiveScreen('home');
                }}
                onShare={() => setShareTournamentTarget(spectatorTournament)}
              />
            ) : (
              <>
                {/* 1. Home Dashboard */}
                {activeScreen === 'home' && (
                  <HomeDashboard
                    activeMatch={activeMatch}
                    teams={teams}
                    playersCount={players.length}
                    matches={matches}
                    onStartNewMatch={() => {
                      setTournamentMatchContextId(undefined);
                      setActiveScreen('new_match');
                    }}
                    onContinueMatch={() => {
                      if (activeMatch) {
                        setActiveScreen('continue_match');
                      } else {
                        setActiveScreen('new_match');
                      }
                    }}
                    onViewMatchHistory={() => setActiveScreen('match_history')}
                    onManageTeams={() => setActiveScreen('teams')}
                    onManagePlayers={() => setActiveScreen('players')}
                    onViewScorecard={handleOpenScorecard}
                    onOpenTournaments={() => setActiveScreen('tournaments')}
                    onOpenApkGuide={() => setIsApkModalOpen(true)}
                  />
                )}

                {/* 2. New Match Wizard */}
                {activeScreen === 'new_match' && (
                  <NewMatchWizard
                    teams={teams}
                    players={players}
                    tournaments={tournaments}
                    initialTournamentId={tournamentMatchContextId}
                    onStartMatch={(newM) => {
                      handleStartMatch(newM);
                      // If match belongs to a tournament, recalculate standings
                      if (newM.tournamentId) {
                        storageService.recalculateTournamentPoints(newM.tournamentId);
                        refreshAllData();
                      }
                    }}
                    onCancel={() => setActiveScreen('home')}
                    onCreateTeamShortcut={() => setActiveScreen('teams')}
                  />
                )}

                {/* 3. Live Scoring (Scorer Console) */}
                {activeScreen === 'continue_match' && (
                  activeMatch ? (
                    <LiveScoringScreen
                      match={activeMatch}
                      teams={teams}
                      players={players}
                      onUpdateMatch={(updated) => {
                        setActiveMatch(updated);
                        refreshAllData();
                      }}
                      onPauseAndExit={() => setActiveScreen('home')}
                      onViewScorecard={handleOpenScorecard}
                      onOpenSpectatorView={() => setActiveScreen('spectator_live')}
                    />
                  ) : (
                    <div className="p-8 text-center space-y-3">
                      <p className="text-sm text-slate-300">No active match in progress.</p>
                      <button
                        onClick={() => setActiveScreen('new_match')}
                        className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                      >
                        Start New Match
                      </button>
                    </div>
                  )
                )}

                {/* 3.1 Fan Live Broadcast View (Spectator Panel) */}
                {activeScreen === 'spectator_live' && (
                  isConnectingCloudMatch ? (
                    <div className="p-8 text-center space-y-4 max-w-sm mx-auto my-12 bg-[#0c1633] rounded-3xl border border-blue-500/40 shadow-2xl animate-fade-in">
                      <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                        <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400 text-blue-400 flex items-center justify-center">
                          <Radio className="w-6 h-6 text-rose-400 animate-pulse" />
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                          LIVE SATELLITE BROADCAST
                        </span>
                        <h3 className="text-base font-bold text-white mt-1">Connecting to Live Match...</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Fetching real-time cloud feed {currentSharedMatchId ? `(${currentSharedMatchId})` : ''}
                        </p>
                      </div>
                      <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : activeMatch ? (
                    <SpectatorLiveView
                      match={activeMatch}
                      teams={teams}
                      players={players}
                      onBackToScorer={() => {
                        const local = storageService.getActiveMatch();
                        if (local && local.id === activeMatch.id) {
                          setActiveScreen('continue_match');
                        } else {
                          setActiveScreen('home');
                        }
                      }}
                      isPublicSharedView={true}
                    />
                  ) : (
                    <div className="p-8 text-center space-y-4 max-w-sm mx-auto my-12 bg-[#0c1633] rounded-3xl border border-slate-800 shadow-2xl">
                      <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">Match Not Found / ऑफलाइन</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {cloudMatchError ||
                            'The match was not found on cloud. Scorer may not have started yet, or Match Code is incorrect.'}
                        </p>
                      </div>
                      <div className="flex gap-2 justify-center pt-2">
                        <button
                          onClick={() => setIsJoinModalOpen(true)}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer"
                        >
                          Enter Match Code
                        </button>
                        <button
                          onClick={() => setActiveScreen('home')}
                          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                        >
                          Home
                        </button>
                      </div>
                    </div>
                  )
                )}

                {/* 3.2 Tournaments & Leagues */}
                {activeScreen === 'tournaments' && (
                  <TournamentManagement
                    tournaments={tournaments}
                    teams={teams}
                    matches={matches}
                    initialTournamentId={activeTournamentId}
                    onStartMatchInTournament={(tournId) => {
                      setTournamentMatchContextId(tournId);
                      setActiveScreen('new_match');
                    }}
                    onViewScorecard={handleOpenScorecard}
                    onRefreshData={refreshAllData}
                  />
                )}

                {/* 4. Match History & Scorecards */}
                {(activeScreen === 'match_history' || activeScreen === 'scorecards') && (
                  <MatchHistory
                    matches={matches}
                    teams={teams}
                    players={players}
                    onResumeMatch={(matchId) => {
                      const m = storageService.getMatchById(matchId);
                      if (m) {
                        storageService.setActiveMatchId(m.id);
                        setActiveMatch(m);
                        setActiveScreen('continue_match');
                      }
                    }}
                    onViewScorecard={handleOpenScorecard}
                    onRefreshData={refreshAllData}
                  />
                )}

                {/* 5. Teams */}
                {activeScreen === 'teams' && (
                  <TeamManagement
                    teams={teams}
                    players={players}
                    matches={matches}
                    onRefreshData={refreshAllData}
                    onViewScorecard={handleOpenScorecard}
                  />
                )}

                {/* 6. Players */}
                {activeScreen === 'players' && (
                  <PlayerManagement
                    players={players}
                    teams={teams}
                    onRefreshData={refreshAllData}
                  />
                )}

                {/* 7. Statistics */}
                {activeScreen === 'statistics' && (
                  <StatisticsScreen
                    players={players}
                    teams={teams}
                    matches={matches}
                  />
                )}

                {/* 8. Settings */}
                {activeScreen === 'settings' && (
                  <SettingsScreen
                    settings={settings}
                    onUpdateSettings={(newSet) => {
                      const updated = storageService.saveSettings(newSet);
                      setSettings(updated);
                    }}
                    onRefreshAllData={refreshAllData}
                  />
                )}

                {/* Additional Info Screens */}
                {(activeScreen === 'help_guide' ||
                  activeScreen === 'about' ||
                  activeScreen === 'privacy' ||
                  activeScreen === 'data_mgmt') && (
                  <InfoScreen
                    screenId={activeScreen}
                    onBack={() => setActiveScreen('home')}
                  />
                )}
              </>
            )}
          </main>

          {/* Bottom Navigation Bar */}
          <BottomNavigationBar
            activeScreen={activeScreen}
            onSelectScreen={handleNavigate}
            hasActiveMatch={!!activeMatch}
            hidden={activeScreen === 'continue_match'}
          />

          {/* Navigation Drawer */}
          <NavigationDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            activeScreen={activeScreen}
            onSelectScreen={handleNavigate}
            hasActiveMatch={!!activeMatch}
          />

          {/* Search Modal */}
          <SearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            onSelectTeam={(tId) => {
              setActiveScreen('teams');
            }}
            onSelectPlayer={(pId) => {
              setActiveScreen('players');
            }}
            onSelectMatch={(mId) => {
              handleOpenScorecard(mId);
            }}
          />

          {/* Notification Center */}
          <NotificationCenterModal
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            notifications={notifications}
            onMarkAllAsRead={() => {
              storageService.markAllNotificationsAsRead();
              refreshAllData();
            }}
            onClearAll={() => {
              storageService.clearNotifications();
              refreshAllData();
            }}
          />

          {/* Join Live Match by Code Modal */}
          <JoinLiveMatchModal
            isOpen={isJoinModalOpen}
            onClose={() => setIsJoinModalOpen(false)}
            onConnectMatch={handleConnectLiveMatch}
            recentMatches={matches}
            isLoading={isConnectingCloudMatch}
            error={cloudMatchError}
          />

          {/* Phone Install & APK Guide Modal */}
          <ApkInstallModal
            isOpen={isApkModalOpen}
            onClose={() => setIsApkModalOpen(false)}
          />

          {/* Share Tournament Standings Modal */}
          {shareTournamentTarget && (
            <ShareTournamentModal
              isOpen={true}
              onClose={() => setShareTournamentTarget(null)}
              tournament={shareTournamentTarget}
              teams={teams}
            />
          )}
        </div>
      )}
    </div>
  );
}
