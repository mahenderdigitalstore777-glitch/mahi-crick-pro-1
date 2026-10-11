/**
 * Screen 6: Team Management
 * Complete team CRUD, roster assignment, Captain/Wicketkeeper assignment, and squad review
 */

import React, { useState } from 'react';
import {
  Shield,
  Plus,
  Users,
  Edit2,
  Trash2,
  Crown,
  Check,
  X,
  AlertTriangle,
  History,
} from 'lucide-react';
import { Team, Player, Match } from '../../types/cricket';
import { storageService } from '../../services/storage';

interface TeamManagementProps {
  teams: Team[];
  players: Player[];
  matches: Match[];
  onRefreshData: () => void;
  onViewScorecard: (matchId: string) => void;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({
  teams,
  players,
  matches,
  onRefreshData,
  onViewScorecard,
}) => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deleteConfirmTeamId, setDeleteConfirmTeamId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formShortName, setFormShortName] = useState('');
  const [formPrimaryColor, setFormPrimaryColor] = useState('#2563EB');
  const [formSecondaryColor, setFormSecondaryColor] = useState('#F59E0B');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  const openCreateModal = () => {
    setEditingTeam(null);
    setFormName('');
    setFormShortName('');
    setFormPrimaryColor('#2563EB');
    setFormSecondaryColor('#F59E0B');
    setFormNotes('');
    setFormError('');
    setIsCreateOpen(true);
  };

  const openEditModal = (t: Team) => {
    setEditingTeam(t);
    setFormName(t.name);
    setFormShortName(t.shortName);
    setFormPrimaryColor(t.primaryColor);
    setFormSecondaryColor(t.secondaryColor);
    setFormNotes(t.notes || '');
    setFormError('');
    setIsCreateOpen(true);
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formShortName.trim()) {
      setFormError('Please enter both team name and short name.');
      return;
    }

    const short = formShortName.trim().toUpperCase().slice(0, 4);

    if (editingTeam) {
      const updated: Team = {
        ...editingTeam,
        name: formName.trim(),
        shortName: short,
        badgeCode: short,
        primaryColor: formPrimaryColor,
        secondaryColor: formSecondaryColor,
        notes: formNotes.trim(),
      };
      storageService.saveTeam(updated);
      if (selectedTeam?.id === updated.id) {
        setSelectedTeam(updated);
      }
    } else {
      const newTeam: Team = {
        id: `team-${Date.now()}`,
        name: formName.trim(),
        shortName: short,
        badgeCode: short,
        primaryColor: formPrimaryColor,
        secondaryColor: formSecondaryColor,
        playerIds: [],
        notes: formNotes.trim(),
        createdAt: Date.now(),
      };
      storageService.saveTeam(newTeam);
    }

    setIsCreateOpen(false);
    onRefreshData();
  };

  const handleDeleteTeam = (id: string) => {
    storageService.deleteTeam(id);
    setDeleteConfirmTeamId(null);
    if (selectedTeam?.id === id) {
      setSelectedTeam(null);
    }
    onRefreshData();
  };

  const handleSetCaptain = (team: Team, playerId: string) => {
    const updated = { ...team, captainId: playerId };
    storageService.saveTeam(updated);
    setSelectedTeam(updated);
    onRefreshData();
  };

  const handleSetWicketKeeper = (team: Team, playerId: string) => {
    const updated = { ...team, wicketKeeperId: playerId };
    storageService.saveTeam(updated);
    setSelectedTeam(updated);
    onRefreshData();
  };

  // Team match history
  const getTeamMatches = (teamId: string) => {
    return matches.filter((m) => m.teamAId === teamId || m.teamBId === teamId);
  };

  return (
    <div className="p-3.5 sm:p-5 max-w-4xl mx-auto space-y-5 pb-24 select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            Team Management
          </h2>
          <p className="text-xs text-slate-400">
            Create clubs, assign playing squads, captains, and wicketkeepers
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-xs shadow-md active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Team</span>
        </button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {teams.map((t) => {
          const teamRoster = players.filter((p) => t.playerIds.includes(p.id));
          const captain = players.find((p) => p.id === t.captainId);
          const keeper = players.find((p) => p.id === t.wicketKeeperId);

          return (
            <div
              key={t.id}
              className={`p-4 rounded-2xl border transition-all ${
                selectedTeam?.id === t.id
                  ? 'bg-[#101b38] border-amber-400/60 shadow-lg'
                  : 'bg-[#0a1228] border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-base text-white shadow-md"
                    style={{ backgroundColor: t.primaryColor }}
                  >
                    {t.badgeCode}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">{t.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="font-mono font-semibold text-amber-400">{t.shortName}</span>
                      <span>•</span>
                      <span>{teamRoster.length} Players</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(t)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Edit Team"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmTeamId(t.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                    title="Delete Team"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Roles Summary */}
              <div className="mt-3.5 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Captain
                  </span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {captain ? captain.fullName : 'Not assigned'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Wicketkeeper
                  </span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {keeper ? keeper.fullName : 'Not assigned'}
                  </span>
                </div>
              </div>

              {/* Manage Squad Button */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => setSelectedTeam(selectedTeam?.id === t.id ? null : t)}
                  className={`w-full py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    selectedTeam?.id === t.id
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{selectedTeam?.id === t.id ? 'Close Squad' : 'View Squad & Matches'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Team Squad Details */}
      {selectedTeam && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0d1630] border border-amber-500/30 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{selectedTeam.name} Roster</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">
                  {selectedTeam.playerIds.length} Squad
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Click Captain or Keeper icons to designate roles
              </p>
            </div>
            <button
              onClick={() => setSelectedTeam(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Player Roster */}
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {players
              .filter((p) => selectedTeam.playerIds.includes(p.id))
              .map((p) => {
                const isCaptain = selectedTeam.captainId === p.id;
                const isKeeper = selectedTeam.wicketKeeperId === p.id;

                return (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
                        style={{ backgroundColor: p.avatarColor || '#3B82F6' }}
                      >
                        #{p.jerseyNumber}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                          <span>{p.fullName}</span>
                          {isCaptain && (
                            <span className="text-[10px] px-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold">
                              (C)
                            </span>
                          )}
                          {isKeeper && (
                            <span className="text-[10px] px-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40 font-bold">
                              (WK)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">
                          {p.role} • {p.battingStyle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSetCaptain(selectedTeam, p.id)}
                        title="Set as Captain"
                        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                          isCaptain
                            ? 'bg-amber-400 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-amber-400'
                        }`}
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">C</span>
                      </button>

                      <button
                        onClick={() => handleSetWicketKeeper(selectedTeam, p.id)}
                        title="Set as Wicketkeeper"
                        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                          isKeeper
                            ? 'bg-blue-500 text-white font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-blue-400'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WK</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Team Match History */}
          <div className="border-t border-slate-800 pt-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-amber-400" />
              Match History ({getTeamMatches(selectedTeam.id).length})
            </h4>
            {getTeamMatches(selectedTeam.id).length === 0 ? (
              <p className="text-xs text-slate-400">No recorded matches for this team yet.</p>
            ) : (
              <div className="space-y-1.5">
                {getTeamMatches(selectedTeam.id).map((m) => (
                  <div
                    key={m.id}
                    onClick={() => onViewScorecard(m.id)}
                    className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-medium text-slate-200">{m.title}</span>
                    <span className="text-amber-400 font-semibold">{m.resultSummary || m.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Team Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCreateOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-[#0a1228] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">
                {editingTeam ? 'Edit Team Details' : 'Create New Team'}
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

            <form onSubmit={handleSaveTeam} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Team Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Challengers"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Short Name (Badge Code, 2-4 chars) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  placeholder="e.g. RCB"
                  value={formShortName}
                  onChange={(e) => setFormShortName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white uppercase focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formPrimaryColor}
                      onChange={(e) => setFormPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                    />
                    <span className="font-mono text-slate-400">{formPrimaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formSecondaryColor}
                      onChange={(e) => setFormSecondaryColor(e.target.value)}
                      className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                    />
                    <span className="font-mono text-slate-400">{formSecondaryColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Home venue, coach, club notes..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

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
                  {editingTeam ? 'Save Changes' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTeamId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setDeleteConfirmTeamId(null)} className="fixed inset-0 bg-black/70 backdrop-blur-xs" />
          <div className="relative w-full max-w-sm bg-[#0a1228] border border-rose-500/30 rounded-2xl shadow-2xl p-5 z-10 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">Delete Team?</h3>
            <p className="text-xs text-slate-300 mt-1">
              Historical scorecards with this team will remain intact, but the team will be removed from future selection.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                onClick={() => setDeleteConfirmTeamId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTeam(deleteConfirmTeamId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
