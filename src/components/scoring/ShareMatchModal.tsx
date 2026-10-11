/**
 * Share Match Modal
 * Allows scorers to share live match link, copy Match Code, generate QR code,
 * and send pre-formatted match summary directly to WhatsApp.
 * Uses smart public URL resolver so Android Studio / APK users never get 'localhost' links!
 */

import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Check,
  QrCode,
  X,
  MessageCircle,
  ExternalLink,
  Info,
  Globe,
  Smartphone,
  Settings,
} from 'lucide-react';
import QRCode from 'qrcode';
import { Match } from '../../types/cricket';
import { ScoringEngine } from '../../services/scoringEngine';
import { getMatchShareUrl, getPublicBaseUrl, getCustomPublicDomain, setCustomPublicDomain } from '../../services/urlHelper';
import { CricketBallIcon } from '../brand/CricketIcons';

interface ShareMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  teamAName: string;
  teamBName: string;
}

export const ShareMatchModal: React.FC<ShareMatchModalProps> = ({
  isOpen,
  onClose,
  match,
  teamAName,
  teamBName,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'domain'>('link');
  const [customDomainInput, setCustomDomainInput] = useState<string>(getCustomPublicDomain() || '');
  const [domainSavedNotice, setDomainSavedNotice] = useState<boolean>(false);

  const innNum = match.currentInningsNumber;
  const currentInn = match.innings[innNum];

  // Resolve the true internet public share URL (never localhost)
  const shareUrl = getMatchShareUrl(match.id);
  const publicBaseUrl = getPublicBaseUrl();

  // Score summary
  const scoreText = currentInn
    ? `${currentInn.totalRuns}/${currentInn.wickets} (${ScoringEngine.formatOvers(currentInn.legalDeliveries)} ov)`
    : 'Live';

  // Pre-formatted share text
  const shareMessage = `🏏 *LIVE CRICKET SCORECARD*\n` +
    `*${match.title}*\n` +
    `📊 Current Score: *${scoreText}*\n` +
    `🔑 Match Code: *${match.id}*\n\n` +
    `📱 Watch Ball-by-Ball Live Score & Commentary on any phone:\n${shareUrl}`;

  // Generate QR Code on open
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
        .catch((err) => console.error('QR code error:', err));
    }
  }, [isOpen, shareUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(match.id);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2200);
    }
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Live Match: ${match.title}`,
          text: shareMessage,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleSaveDomain = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomPublicDomain(customDomainInput.trim() ? customDomainInput.trim() : null);
    setDomainSavedNotice(true);
    setTimeout(() => {
      setDomainSavedNotice(false);
      setActiveTab('link');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#0a1226] border border-amber-400/40 rounded-3xl p-5 shadow-2xl z-10 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <CricketBallIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Share Live Match</h3>
              <p className="text-[11px] text-slate-400">लाइव स्कोर लिंक किसी भी फोन पर भेजें</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Match Info Chip */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                LIVE INTERNET LINK
              </span>
            </div>
            <div className="text-sm font-bold text-white">{match.title}</div>
            <div className="text-xs text-slate-400 font-mono">
              Score: <span className="text-amber-400 font-bold">{scoreText}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              Cloud Ready
            </span>
          </div>
        </div>

        {/* Tab Switcher: Share Link / QR Code / Domain Setup */}
        <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'link'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Link & WhatsApp
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'qr'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Code</span>
          </button>
          <button
            onClick={() => setActiveTab('domain')}
            className={`py-1.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'domain'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Configure Domain / Netlify"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Domain</span>
          </button>
        </div>

        {/* Tab 1: Link & Code */}
        {activeTab === 'link' && (
          <div className="space-y-3.5">
            {/* 1. Direct WhatsApp Share (High Priority) */}
            <button
              onClick={handleWhatsAppShare}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Share Directly to WhatsApp (व्हाट्सएप पर भेजें)</span>
            </button>

            {/* 2. Full Live Web URL (Pre-resolved, never localhost) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label className="text-slate-300 font-semibold flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Live Match Public Link (दूसरे के फोन में खुलने वाला लिंक):</span>
                </label>
                <span className="text-[10px] text-emerald-400 font-mono">Public Cloud</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-slate-950 px-3 py-2.5 rounded-xl text-emerald-300 font-mono text-xs truncate border border-slate-800 select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* 3. Match Code Box */}
            <div className="p-3 rounded-2xl bg-[#0e172e] border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Match Code (वैकल्पिक कोड)</span>
                </span>
                <span className="text-[10px] text-amber-400 font-mono">ID: {match.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-950 px-3 py-2 rounded-xl text-white font-mono font-bold text-xs truncate border border-slate-800">
                  {match.id}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Test Link in Browser button */}
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer block text-center"
            >
              <ExternalLink className="w-3.5 h-3.5 inline mr-1" />
              <span>Test Live Link in Browser (ब्राउज़र में टेस्ट करें)</span>
            </a>
          </div>
        )}

        {/* Tab 2: QR Code */}
        {activeTab === 'qr' && (
          <div className="flex flex-col items-center justify-center p-3 space-y-3 bg-slate-950/70 rounded-2xl border border-slate-800">
            {qrDataUrl ? (
              <div className="p-3 bg-white rounded-2xl shadow-xl">
                <img
                  src={qrDataUrl}
                  alt="Live Match QR Code"
                  className="w-48 h-48 rounded-lg"
                />
              </div>
            ) : (
              <div className="w-48 h-48 rounded-xl bg-slate-800 flex items-center justify-center text-xs text-slate-400">
                Generating QR...
              </div>
            )}
            <p className="text-xs text-slate-300 text-center font-medium">
              ग्राउंड पर मौजूद कोई भी दर्शक फोन के कैमरा से स्कैन करके तुरंत लाइव स्कोर देख सकता है।
            </p>
          </div>
        )}

        {/* Tab 3: Custom Domain & Netlify Configuration */}
        {activeTab === 'domain' && (
          <div className="space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-400" />
                <span>Custom Domain or Netlify URL</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                यदि आपने अपने ऐप को Netlify, Vercel, या अपने पर्सनल डोमेन पर डाला है, तो यहाँ उसका URL डालें। शेयर लिंक उसी डोमेन से बनेंगे!
              </p>
            </div>

            <form onSubmit={handleSaveDomain} className="space-y-2">
              <input
                type="text"
                placeholder="e.g. https://my-cricket.netlify.app"
                value={customDomainInput}
                onChange={(e) => setCustomDomainInput(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-amber-400 outline-none"
              />

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  {domainSavedNotice ? 'Saved!' : 'Save Domain (सेव करें)'}
                </button>
                {customDomainInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomDomainInput('');
                      setCustomPublicDomain(null);
                      setDomainSavedNotice(true);
                      setTimeout(() => setDomainSavedNotice(false), 1200);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
                  >
                    Reset Default
                  </button>
                )}
              </div>
            </form>

            <div className="text-[10px] text-slate-400 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              💡 <strong>डिफ़ॉल्ट क्लाउड लिंक:</strong> वर्तमान में आपका मैच Google Cloud Run के सुरक्षित लाइव सर्वर से शेयर हो रहा है। Netlify का उपयोग करना 100% वैकल्पिक (optional) है।
            </div>
          </div>
        )}

        {/* Android Studio Localhost Explanation Note */}
        <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Android Studio & WhatsApp Link Resolution</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            ✓ <strong>Localhost Fix:</strong> जब आप Android Studio APK में मैच स्कोर करते हैं, तो ऐप स्वचालित रूप से <strong>पब्लिक क्लाउड लिंक</strong> तैयार करता है ताकि किसी भी फोन पर WhatsApp से 1-क्लिक में लाइव स्कोर खुल जाए!
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
