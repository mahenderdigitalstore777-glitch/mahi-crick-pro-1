/**
 * Info & Guide Screens
 * Handles Help & Guide, About Mahi Crick Pro, Privacy, and Data Management
 */

import React from 'react';
import {
  HelpCircle,
  Info,
  Lock,
  Database,
  ArrowLeft,
  CheckCircle,
  Shield,
  Smartphone,
} from 'lucide-react';
import { NavScreenId } from '../layout/NavigationDrawer';
import { MahiLogo } from '../brand/MahiLogo';

interface InfoScreenProps {
  screenId: NavScreenId;
  onBack: () => void;
}

export const InfoScreen: React.FC<InfoScreenProps> = ({ screenId, onBack }) => {
  return (
    <div className="p-3.5 sm:p-5 max-w-2xl mx-auto space-y-5 pb-24 select-none">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>

      {screenId === 'help_guide' && (
        <div className="p-5 rounded-2xl bg-[#0a1228] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <HelpCircle className="w-5 h-5" />
            <h2 className="text-lg font-bold text-white">Help & Scoring Guide</h2>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <h3 className="font-bold text-amber-400">1. Recording Standard Deliveries</h3>
              <p>
                Tap 0, 1, 2, 3, 4, 6 to record batter runs. Single or 3 runs automatically rotate the
                strike to the partner. Boundary 4 and 6 maintain the current batter on strike.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <h3 className="font-bold text-amber-400">2. Extras & Legal Deliveries</h3>
              <p>
                Wides and No-balls grant +1 run and do not increment the legal ball counter in the
                over. Byes and Leg-byes are legal deliveries that do not credit runs to the batter&apos;s personal score.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <h3 className="font-bold text-amber-400">3. Wickets & Dismissal Attribution</h3>
              <p>
                Bowler is credited for Bowled, Caught, LBW, Stumped, and Hit Wicket. Run Out does
                not add a wicket to the bowler&apos;s figures. Select incoming batters from the remaining squad.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <h3 className="font-bold text-amber-400">4. Over Progression & Bowling Rotation</h3>
              <p>
                After 6 legal deliveries, the over concludes, bowling ends swap, and you will be
                prompted to choose the next bowler. A bowler cannot bowl consecutive overs.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <h3 className="font-bold text-amber-400">5. Undo Delivery</h3>
              <p>
                Tapping &ldquo;Undo Delivery&rdquo; safely rolls back the previous event, recalculating score,
                overs, individual figures, and strike position accurately.
              </p>
            </div>
          </div>
        </div>
      )}

      {screenId === 'about' && (
        <div className="p-5 rounded-2xl bg-[#0a1228] border border-slate-800 space-y-4 text-center">
          <MahiLogo size="lg" className="justify-center" />

          <div className="space-y-2 text-xs text-slate-300 max-w-md mx-auto pt-2">
            <h2 className="text-base font-bold text-white">Mahi Crick Pro • Version 1.0.0</h2>
            <p>
              Mahi Crick Pro is engineered for grassroots cricketers, local tournament organizers,
              and club scorers who demand complete reliability without relying on unstable internet connections.
            </p>
            <div className="p-3 rounded-xl bg-slate-900/80 text-left space-y-1.5 text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Offline-First SQLite Local Architecture</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>MCC Compliant Scoring & Strike Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Custom Overs (any integer: 3, 7, 12, 17, 25, 50)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Full Innings Scorecards & Career Statistics</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {screenId === 'privacy' && (
        <div className="p-5 rounded-2xl bg-[#0a1228] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-blue-400">
            <Lock className="w-5 h-5" />
            <h2 className="text-lg font-bold text-white">Privacy & Local Storage</h2>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <p>
              Mahi Crick Pro adheres to a strict <strong>Zero Telemetry, Zero Data Collection</strong> philosophy.
            </p>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <h3 className="font-bold text-white">Your Data Stays on Your Device</h3>
              <p>
                Every delivery, player record, team configuration, and match outcome is stored exclusively
                in your device&apos;s local memory. No data is transmitted to external servers.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <h3 className="font-bold text-white">No Tracking or Third-Party SDKs</h3>
              <p>
                We do not use advertising trackers, analytics SDKs, or background location services.
              </p>
            </div>
          </div>
        </div>
      )}

      {screenId === 'data_mgmt' && (
        <div className="p-5 rounded-2xl bg-[#0a1228] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <Database className="w-5 h-5" />
            <h2 className="text-lg font-bold text-white">Data Management & Safeguards</h2>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <p>
              Because Mahi Crick Pro operates entirely offline without remote cloud servers, clearing
              your browser cache or uninstalling without backing up will erase saved matches.
            </p>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <strong>Recommendation:</strong> Use the Export feature in Settings periodically to save a backup JSON file to your device storage or Google Drive.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
