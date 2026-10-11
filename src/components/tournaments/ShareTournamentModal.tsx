/**
 * Share Tournament Modal
 * Generates public live share link and WhatsApp message for tournament standings and points table
 */

import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check, QrCode, X, MessageCircle, ExternalLink, Globe } from 'lucide-react';
import QRCode from 'qrcode';
import { Tournament, Team } from '../../types/cricket';
import { getTournamentShareUrl } from '../../services/urlHelper';
import { TournamentCupIcon } from '../brand/CricketIcons';

interface ShareTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament;
  teams: Team[];
}

export const ShareTournamentModal: React.FC<ShareTournamentModalProps> = ({
  isOpen,
  onClose,
  tournament,
  teams,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const shareUrl = getTournamentShareUrl(tournament.id);

  const getTeamName = (id: string) => {
    const t = teams.find((tm) => tm.id === id);
    return t ? t.shortName : 'TEAM';
  };

  // Top 3 teams in points table
  const leaderBoardStr = tournament.pointsTable
    .slice(0, 3)
    .map((st, i) => `${i + 1}. ${getTeamName(st.teamId)}: ${st.points} pts (NRR ${st.netRunRate >= 0 ? '+' : ''}${st.netRunRate})`)
    .join('\n');

  const shareMessage = `🏆 *${tournament.name.toUpperCase()}*\n` +
    `📊 *LIVE POINTS TABLE & FIXTURES*\n\n` +
    `${leaderBoardStr}\n\n` +
    `📱 View Full Points Table, Match Results & Schedule:\n${shareUrl}`;

  useEffect(() => {
    if (isOpen && shareUrl) {
      QRCode.toDataURL(shareUrl, {
        width: 240,
        margin: 1.5,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch(() => {});
    }
  }, [isOpen, shareUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0a1226] border border-blue-500/40 rounded-3xl p-5 shadow-2xl z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <TournamentCupIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Share Tournament</h3>
              <p className="text-[11px] text-slate-400">लाइव पॉइंट्स टेबल व टूर्नामेंट लिंक</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tournament Info */}
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
            {tournament.format} • {tournament.oversPerInnings} OVERS
          </span>
          <h4 className="text-sm font-bold text-white mt-0.5">{tournament.name}</h4>
          <span className="text-xs text-slate-400">{tournament.teamIds.length} Teams Participating</span>
        </div>

        {/* WhatsApp Share */}
        <button
          onClick={handleWhatsAppShare}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Share Standings to WhatsApp</span>
        </button>

        {/* Live URL */}
        <div className="space-y-1">
          <label className="text-xs text-slate-300 font-semibold flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>Public Tournament Live Link:</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-slate-950 px-3 py-2.5 rounded-xl text-emerald-300 font-mono text-xs truncate border border-slate-800 select-all"
            />
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 active:scale-95 cursor-pointer shrink-0"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* QR Code */}
        {qrDataUrl && (
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col items-center">
            <div className="p-2 bg-white rounded-xl shadow-md">
              <img src={qrDataUrl} alt="Tournament QR" className="w-36 h-36" />
            </div>
            <span className="text-[11px] text-slate-400 mt-2">Scan to view live points table on phone</span>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
