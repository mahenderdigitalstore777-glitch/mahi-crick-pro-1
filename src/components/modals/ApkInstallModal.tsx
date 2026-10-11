/**
 * APK & Phone Installation Guide Modal
 * Guides users on how to install the app on Android phones as a native PWA or convert to APK
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Download,
  Share2,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  Radio,
  Layers,
  Copy,
  Check,
} from 'lucide-react';

interface ApkInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkInstallModal: React.FC<ApkInstallModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk' | 'link_fix'>('pwa');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstallable(false);
      }
    } else {
      alert("Android Chrome में ऊपर दाईं तरफ 3 डॉट्स (⋮) पर क्लिक करें और 'Add to Home screen' (या 'Install app') चुनें।");
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0] : '';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#0a1228] border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0d1b3d] to-[#122452] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                फोन में ऐप / APK कैसे लें?
              </h2>
              <p className="text-xs text-slate-400">Android Install & APK Generation Guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800/80 bg-slate-900/40 px-3 pt-2">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'pwa'
                ? 'bg-[#0f1b3d] text-amber-400 border-t-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            1. डायरेक्ट फोन में इंस्टॉल
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'apk'
                ? 'bg-[#0f1b3d] text-amber-400 border-t-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            2. APK फाइल बनाने के तरीके
          </button>
          <button
            onClick={() => setActiveTab('link_fix')}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'link_fix'
                ? 'bg-[#0f1b3d] text-purple-400 border-t-2 border-purple-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            3. लिंक क्यों नहीं खुल रहा था?
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-slate-200 text-xs leading-relaxed">
          {/* TAB 1: Direct PWA Install */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-300 text-sm">
                    सबसे तेज़ तरीका: 10 सेकंड में फोन की स्क्रीन पर ऐप लाएं
                  </h4>
                  <p className="text-slate-300 mt-1 text-xs">
                    आपको APK फाइल इंस्टॉल करने या Google Play Store की ज़रूरत नहीं है। यह ऐप <strong>Progressive Web App (PWA)</strong> सपोर्ट करती है और फोन में बिल्कुल असली Android ऐप की तरह चलती है!
                  </p>
                </div>
              </div>

              {isInstallable && (
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                >
                  <Download className="w-4 h-4" />
                  अभी फोन में Install करें (Install App)
                </button>
              )}

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
                  Android फोन पर लगाने के 3 आसान स्टेप्स:
                </h4>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold text-[11px] flex items-center justify-center shrink-0">
                      1
                    </span>
                    <p>अपने Android फोन में Chrome या कोई भी ब्राउज़र खोलें और इस ऐप का लिंक खोलें।</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold text-[11px] flex items-center justify-center shrink-0">
                      2
                    </span>
                    <p>
                      Chrome में ऊपर दाएँ कोने में <strong>3 डॉट्स (⋮)</strong> मेनू पर टैप करें।
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 font-bold text-[11px] flex items-center justify-center shrink-0">
                      3
                    </span>
                    <p>
                      <strong>"Add to Home screen"</strong> (या <strong>"Install app"</strong>) पर क्लिक करें।
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-400 font-medium">
                  ✓ तुरंत आपके फोन के ऐप ड्रॉअर में "Mahi Crick Pro" का आइकन आ जाएगा और बिना ब्राउज़र बार के फुल स्क्रीन में चलेगा!
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: How to convert to APK */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-600/10 border border-blue-500/30">
                <h4 className="font-bold text-blue-300 text-sm">
                  अगर आपको असली .APK फाइल डाउनलोड करनी है:
                </h4>
                <p className="text-slate-300 mt-1 text-xs">
                  वेबसाइट को Android APK में बदलने के 3 सबसे लोकप्रिय और सुरक्षित तरीके:
                </p>
              </div>

              {/* Method 1: PWABuilder */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 text-xs">विधि 1: PWABuilder (Microsoft का फ्री टूल - सबसे आसान)</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">Recommended</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-300 text-xs">
                  <li>
                    कंप्यूटर या फोन में <strong className="text-white">pwabuilder.com</strong> वेबसाइट खोलें।
                  </li>
                  <li>
                    अपनी ऐप का URL डालें और <strong className="text-white">"Start"</strong> पर क्लिक करें। (हमारी ऐप में Manifest और Icons पहले से कॉन्फ़िगर हैं)।
                  </li>
                  <li>
                    <strong className="text-white">"Package for Android"</strong> चुनें।
                  </li>
                  <li>
                    सीधा <strong>Download APK / AAB package</strong> मिल जाएगा जिसे आप किसी भी Android फोन में सीधे इंस्टॉल कर सकते हैं!
                  </li>
                </ol>
              </div>

              {/* Method 2: Google Bubblewrap */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="font-bold text-purple-400 text-xs">विधि 2: Google Bubblewrap (Play Store APK)</span>
                <p className="text-slate-300 text-xs">
                  Google का आधिकारिक CLI टूल जो PWA को TWA (Trusted Web Activity) APK में बदलता है। टर्मिनल में चलाएं:
                </p>
                <div className="bg-black/60 p-2.5 rounded-xl font-mono text-[11px] text-amber-300 select-all">
                  npm i -g @bubblewrap/cli && bubblewrap init --manifest /manifest.json
                </div>
              </div>

              {/* Method 3: Capacitor & Android Studio (Direct APK Build) */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400 text-xs">विधि 3: Android Studio में सीधे APK जनरेट करना</span>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold">100% Native APK</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-300 text-xs">
                  <li>
                    अपने कंप्यूटर पर <strong className="text-white">Android Studio</strong> खोलें।
                  </li>
                  <li>
                    <strong className="text-white">File &gt; Open</strong> पर क्लिक करें और इस प्रोजेक्ट के अंदर का <code className="text-amber-300 font-mono">android</code> फ़ोल्डर चुनें।
                  </li>
                  <li>
                    Android Studio अपने आप Gradle Sync पूरा करेगा (1-2 मिनट)।
                  </li>
                  <li>
                    ऊपर मेन्यू बार में <strong className="text-white">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong> पर क्लिक करें।
                  </li>
                  <li>
                    बिल्ड पूरा होने पर नीचे दाईं तरफ <strong className="text-emerald-400">"locate"</strong> का लिंक आएगा। उस पर क्लिक करते ही आपकी <code className="text-amber-300 font-mono">app-debug.apk</code> फ़ाइल तैयार मिलेगी!
                  </li>
                </ol>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300">
                  💡 इस APK को आप WhatsApp, Bluetooth या Google Drive से किसी भी Android फ़ोन में भेजकर सीधे इंस्टॉल कर सकते हैं।
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Why link wasn't opening */}
          {activeTab === 'link_fix' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <HelpCircle className="w-4 h-4" />
                  दूसरे के फोन में लिंक क्यों नहीं खुल रहा था?
                </div>
                <p className="text-slate-300 text-xs">
                  जब आप डेवलपमेंट एनवायरनमेंट में होते हैं, तो URL अक्सर <strong>localhost</strong> या एक प्राइवेट सैंडबॉक्स प्रीव्यू एड्रेस होता है। वह प्राइवेट लिंक सिर्फ आपके उसी कंप्यूटर/ब्राउज़र में चलता है, दूसरे फोन पर "Cannot reach site" या एरर दिखाता है।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  अब हमने क्या समाधान कर दिया है?
                </div>
                <ul className="space-y-2 text-slate-300 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>
                      <strong className="text-white">6-डिजिट Match Code सिस्टम:</strong> अब हर मैच का एक आसान कोड (जैसे <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded font-mono">CRK-7492</code>) बन गया है।
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>
                      <strong className="text-white">QR Code शेयरिंग:</strong> दर्शक सीधे मैच स्कोरर की स्क्रीन से QR कोड स्कैन कर सकते हैं।
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>
                      <strong className="text-white">Home Screen पर "लाइव मैच देखें" बटन:</strong> कोई भी दर्शक ऐप खोलकर केवल Match Code डालकर तुरंत बॉल-बाय-बॉल लाइव मैच देख सकता है!
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>
                      <strong className="text-white">Google Firebase Firestore:</strong> सभी स्कोर और बॉल-बाय-बॉल डेटा रियल-टाइम में क्लाउड डेटाबेस में सिंक होता है।
                    </span>
                  </li>
                </ul>
              </div>

              {currentUrl && (
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <span className="text-[11px] text-slate-400 font-semibold">ऐप का पब्लिक वेब लिंक:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={currentUrl}
                      className="flex-1 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs font-mono text-slate-300 focus:outline-none"
                    />
                    <button
                      onClick={handleCopyUrl}
                      className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {isCopied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Mahi Crick Pro • Android & Web Edition
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
          >
            समझ गया / Close
          </button>
        </div>
      </div>
    </div>
  );
};
