/**
 * In-App Notification Center Modal
 */

import React from 'react';
import { X, CheckCheck, Trash2, Bell, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { AppNotification } from '../../types/cricket';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-3 select-none">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/70 backdrop-blur-xs" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#0a1228] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0d1630]">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Notification Center</h2>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <>
                <button
                  onClick={onMarkAllAsRead}
                  title="Mark all as read"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={onClearAll}
                  title="Clear all notifications"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List Body */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center">
              <Bell className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-300">No new notifications</p>
              <p className="text-xs text-slate-400 mt-1">
                Match events, saves, and reminders will appear here.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-xl border transition-colors ${
                  n.isRead
                    ? 'bg-slate-900/40 border-slate-800/60'
                    : 'bg-slate-800/60 border-amber-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {n.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                    {n.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
                    {n.type === 'alert' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-200">{n.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
