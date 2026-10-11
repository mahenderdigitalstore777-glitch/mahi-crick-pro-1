/**
 * Screen 7: Player Management
 * Player profiles, career stats, role classifications, and team assignments
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Shield,
  User,
  X,
  AlertTriangle,
  Award,
  Sparkles,
} from 'lucide-react';
import { Player, Team, PlayingRole, BattingStyle, BowlingStyle } from '../../types/cricket';
import { storageService } from '../../services/storage';
import { QuickAddPlayerModal } from './QuickAddPlayerModal';

interface PlayerManagementProps {
  players: Player[];
  teams: Team[];
  onRefreshData: () => void;
}

export const PlayerManagement: React.FC<PlayerManagementProps> = ({
  players,
  teams,
  onRefreshData,
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filters
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState(7);
  const [role, setRole] = useState<PlayingRole>('Batter');
  const [battingStyle, setBattingStyle] = useState<BattingStyle>('Right Hand Bat');
  const [bowlingStyle, setBowlingStyle] = useState<BowlingStyle>('None');
  const [isWicketKeeper, setIsWicketKeeper] = useState(false);
  const [teamId, setTeamId] = useState<string>('');
  const [avatarColor, setAvatarColor] = useState('#2563EB');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const matchTeam = selectedTeamFilter === 'all' || p.teamId === selectedTeamFilter;
      const matchRole = selectedRoleFilter === 'all' || p.role === selectedRoleFilter;
      const matchSearch =
        !searchQuery.trim() ||
        p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.displayName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTeam && matchRole && matchSearch;
    });
  }, [players, selectedTeamFilter, selectedRoleFilter, searchQuery]);

  const openCreateModal = () => {
    setEditingPlayer(null);
    setFullName('');
    setDisplayName('');
    setJerseyNumber(Math.floor(Math.random() * 99) + 1);
    setRole('Batter');
    setBattingStyle('Right Hand Bat');
    setBowlingStyle('None');
    setIsWicketKeeper(false);
    setTeamId(teams[0]?.id || '');
    setAvatarColor('#2563EB');
    setNotes('');
    setFormError('');
    setIsCreateOpen(true);
  };

  const openEditModal = (p: Player) => {
    setEditingPlayer(p);
    setFullName(p.fullName);
    setDisplayName(p.displayName);
    setJerseyNumber(p.jerseyNumber);
    setRole(p.role);
    setBattingStyle(p.battingStyle);
    setBowlingStyle(p.bowlingStyle);
    setIsWicketKeeper(p.isWicketKeeper);
    setTeamId(p.teamId || '');
    setAvatarColor(p.avatarColor || '#2563EB');
    setNotes(p.notes || '');
    setFormError('');
    setIsCreateOpen(true);
  };

  const handleSavePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setFormError('Player full name is required.');
      return;
    }

    if (editingPlayer) {
      const updated: Player = {
        ...editingPlayer,
        fullName: fullName.trim(),
        displayName: displayName.trim() || fullName.trim(),
        jerseyNumber: Number(jerseyNumber) || 0,
        role,
        battingStyle,
        bowlingStyle,
        isWicketKeeper: role === 'Wicketkeeper' || isWicketKeeper,
        teamId: teamId || undefined,
        avatarColor,
        notes: notes.trim(),
      };
      storageService.savePlayer(updated);
      if (selectedPlayer?.id === updated.id) {
        setSelectedPlayer(updated);
      }
    } else {
      const newPlayer: Player = {
        id: `p-${Date.now()}`,
        fullName: fullName.trim(),
        displayName: displayName.trim() || fullName.trim(),
        jerseyNumber: Number(jerseyNumber) || 0,
        role,
        battingStyle,
        bowlingStyle,
        isWicketKeeper: role === 'Wicketkeeper' || isWicketKeeper,
        teamId: teamId || undefined,
        avatarColor,
        notes: notes.trim(),
        stats: {
          matches: 0,
          innings: 0,
          runs: 0,
          ballsFaced: 0,
          fours: 0,
          sixes: 0,
          highestScore: 0,
          notOuts: 0,
          oversBowled: 0,
          runsConceded: 0,
          wickets: 0,
          maidens: 0,
          bestBowlingWickets: 0,
          bestBowlingRuns: 0,
        },
        createdAt: Date.now(),
      };
      storageService.savePlayer(newPlayer);
    }

    setIsCreateOpen(false);
    onRefreshData();
  };

  const handleDeletePlayer = (id: string) => {
    storageService.deletePlayer(id);
    setDeleteConfirmId(null);
    if (selectedPlayer?.id === id) {
      setSelectedPlayer(null);
    }
    onRefreshData();
  };

  const getTeamName = (tId?: string) => {
    if (!tId) return 'Free Agent';
    const t = teams.find((team) => team.id === tId);
    return t ? t.shortName : 'Free Agent';
  };

  return (
    <div className="p-3.5 sm:p-5 max-w-4xl mx-auto space-y-5 pb-24 select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            Player Directory
          </h2>
          <p className="text-xs text-slate-400">
            {players.length} registered cricketers with individual career telemetry
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-xs shadow-md active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quick Add (आसान)</span>
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Detailed</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-3 rounded-2xl bg-[#0a1228] border border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <input
          type="text"
          placeholder="Search by player name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
        />

        <select
          value={selectedTeamFilter}
          onChange={(e) => setSelectedTeamFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
        >
          <option value="all">All Teams</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.shortName})
            </option>
          ))}
        </select>

        <select
          value={selectedRoleFilter}
          onChange={(e) => setSelectedRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
        >
          <option value="all">All Roles</option>
          <option value="Batter">Batter</option>
          <option value="Bowler">Bowler</option>
          <option value="All-Rounder">All-Rounder</option>
          <option value="Wicketkeeper">Wicketkeeper</option>
        </select>
      </div>

      {/* Players List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredPlayers.map((p) => {
          const isSelected = selectedPlayer?.id === p.id;
          const strikeRate =
            p.stats.ballsFaced > 0
              ? ((p.stats.runs / p.stats.ballsFaced) * 100).toFixed(1)
              : '0.0';

          return (
            <div
              key={p.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                isSelected
                  ? 'bg-[#101b38] border-amber-400/60 shadow-lg'
                  : 'bg-[#0a1228] border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-black text-sm text-white shadow-md shrink-0"
                    style={{ backgroundColor: p.avatarColor || '#3B82F6' }}
                  >
                    #{p.jerseyNumber}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{p.fullName}</span>
                      {p.isWicketKeeper && (
                        <span className="text-[10px] text-amber-400 font-mono font-bold">(WK)</span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="font-semibold text-slate-300">{p.role}</span>
                      <span>•</span>
                      <span className="text-amber-400 font-semibold">{getTeamName(p.teamId)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Edit Player"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(p.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                    title="Delete Player"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Stats Teaser Strip */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-4 gap-1 text-center text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">Runs</div>
                  <div className="font-bold text-white font-mono">{p.stats.runs}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">SR</div>
                  <div className="font-bold text-amber-400 font-mono">{strikeRate}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Wickets</div>
                  <div className="font-bold text-white font-mono">{p.stats.wickets}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Matches</div>
                  <div className="font-bold text-slate-300 font-mono">{p.stats.matches}</div>
                </div>
              </div>

              {/* View Full Profile Toggle */}
              <button
                onClick={() => setSelectedPlayer(isSelected ? null : p)}
                className="w-full mt-2.5 py-1 text-xs text-center text-slate-400 hover:text-amber-400 font-medium transition-colors"
              >
                {isSelected ? 'Hide Career Card' : 'View Full Career Card'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Expanded Player Career Profile */}
      {selectedPlayer && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0d1630] border border-amber-500/30 space-y-4 animate-fade-in">
          <div className="flex items-start justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg text-white"
                style={{ backgroundColor: selectedPlayer.avatarColor || '#3B82F6' }}
              >
                #{selectedPlayer.jerseyNumber}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{selectedPlayer.fullName}</h3>
                <p className="text-xs text-slate-400">
                  {selectedPlayer.battingStyle} • {selectedPlayer.bowlingStyle}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedPlayer(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Batting Career Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Batting Career
            </h4>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 text-center">
              <div className="p-2 rounded-xl bg-slate-800/50">
                <span className="text-[10px] text-slate-400 block">Matches</span>
                <span className="font-bold text-white text-sm font-mono">
                  {selectedPlayer.stats.matches}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/50">
                <span className="text-[10px] text-slate-400 block">Innings</span>
                <span className="font-bold text-white text-sm font-mono">
                  {selectedPlayer.stats.innings}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/50">
                <span className="text-[10px] text-slate-400 block">Runs</span>
                <span className="font-bold text-amber-400 text-sm font-mono">
                  {selectedPlayer.stats.runs}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/50">
                <span className="text-[10px] text-slate-400 block">Balls</span>
                <span className="font-bold text-white text-sm font-mono">
                  {selectedPlayer.stats.ballsFaced}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/50">
                <span className="text-[10px] text-slate-400 block">4s</span>
                <span className="font-bold text-white text-sm font-mono">
                  {selectedPlayer.stats.fours}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/50">
                <span className="text-[10px] text-slate-400 block">6s</span>
                <span className="font-bold text-white text-sm font-mono">
                  {selectedPlayer.stats.sixes}
                </span>
              </div>
            </div>
          </div>

          {/* Bowling Career Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Bowling Career
            </h4>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 text-center">
              <div className="p-2 rounded-xl bg-slate-800/50">
                <span className="text-[10px] text-slate-400 block">Overs</span>
                <span className="font-bold text-white text-sm font-mono">
                  {selectedPlayer.stats.oversBowled}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/50">
                <span className="text-[10px] text-slate-400 block">Wickets</span>
                <span className="font-bold text-blue-400 text-sm font-mono">
                  {selectedPlayer.stats.wickets}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/50">
                <span className="text-[10px] text-slate-400 block">Maidens</span>
                <span className="font-bold text-white text-sm font-mono">
                  {selectedPlayer.stats.maidens}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/50">
                <span className="text-[10px] text-slate-400 block">Runs Conceded</span>
                <span className="font-bold text-white text-sm font-mono">
                  {selectedPlayer.stats.runsConceded}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/50">
                <span className="text-[10px] text-slate-400 block">Best</span>
                <span className="font-bold text-amber-400 text-sm font-mono">
                  {selectedPlayer.stats.bestBowlingWickets}/{selectedPlayer.stats.bestBowlingRuns}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Player Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCreateOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-xs" />
          <div className="relative w-full max-w-lg bg-[#0a1228] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">
                {editingPlayer ? 'Edit Player Profile' : 'Register New Player'}
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 mb-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSavePlayer} className="space-y-3.5 text-xs">
              {/* Primary Name Field */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Player Name * (खिलाड़ी का नाम)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohit Sharma or Virat"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (!displayName || displayName === fullName) {
                      setDisplayName(e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              {/* Quick Role Selector (Tap one to set) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Playing Role (भूमिका)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Batter', 'Bowler', 'All-Rounder', 'Wicketkeeper'] as PlayingRole[]).map((r) => {
                    const isSelected = role === r;
                    const icons: Record<PlayingRole, string> = {
                      Batter: '🏏 Batter',
                      Bowler: '⚡ Bowler',
                      'All-Rounder': '🔥 All-Rounder',
                      Wicketkeeper: '🧤 Wicketkeeper',
                    };
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setRole(r);
                          if (r === 'Wicketkeeper') setIsWicketKeeper(true);
                          if (r === 'Bowler') setBowlingStyle('Right-arm Fast');
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md scale-102'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {icons[r]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Team Assignment */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Team (टीम)
                </label>
                <select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="">No Team (Free Agent)</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.shortName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Collapsible Advanced Section */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>{showAdvanced ? '− Hide' : '+ Show'} More Details (Jersey, Bat/Bowl Style, Notes)</span>
                </button>
              </div>

              {showAdvanced && (
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Display / Nickname</label>
                      <input
                        type="text"
                        placeholder="e.g. J. Bumrah"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Jersey Number</label>
                      <input
                        type="number"
                        min={0}
                        max={999}
                        value={jerseyNumber}
                        onChange={(e) => setJerseyNumber(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Batting Style</label>
                      <select
                        value={battingStyle}
                        onChange={(e) => setBattingStyle(e.target.value as BattingStyle)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                      >
                        <option value="Right Hand Bat">Right Hand Bat</option>
                        <option value="Left Hand Bat">Left Hand Bat</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Bowling Style</label>
                      <select
                        value={bowlingStyle}
                        onChange={(e) => setBowlingStyle(e.target.value as BowlingStyle)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                      >
                        <option value="None">None</option>
                        <option value="Right-arm Fast">Right-arm Fast</option>
                        <option value="Right-arm Medium">Right-arm Medium</option>
                        <option value="Right-arm Off Spin">Right-arm Off Spin</option>
                        <option value="Right-arm Leg Spin">Right-arm Leg Spin</option>
                        <option value="Left-arm Fast">Left-arm Fast</option>
                        <option value="Left-arm Medium">Left-arm Medium</option>
                        <option value="Left-arm Orthodox Spin">Left-arm Orthodox Spin</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold"
                >
                  {editingPlayer ? 'Save Changes' : 'Register Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setDeleteConfirmId(null)} className="fixed inset-0 bg-black/70 backdrop-blur-xs" />
          <div className="relative w-full max-w-sm bg-[#0a1228] border border-rose-500/30 rounded-2xl shadow-2xl p-5 z-10 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">Delete Player?</h3>
            <p className="text-xs text-slate-300 mt-1">
              Historical scorecards with this player will remain safe, but the player will be removed from future selection.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePlayer(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Player & Batch Squad Modal */}
      <QuickAddPlayerModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        teams={teams}
        onPlayerCreated={onRefreshData}
      />
    </div>
  );
};
