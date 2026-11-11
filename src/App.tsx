/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  Play, 
  KeyRound, 
  Palette, 
  Terminal, 
  ShieldCheck,
  Send,
  Sparkles,
  Info
} from 'lucide-react';

import { ISHAK_SCRIPT_CODE } from './rawCode.ts';

const LOGO_IMG = "/rx-bot-logo-sq.jpg";
const BANNER_IMG = "/rx-bot-logo.jpg";
const DEFAULT_PW = "sakilvai";
const TELEGRAM_CONTACT = "telegram:@SA_T_OWNER";

export default function App() {
  const [scriptCode, setScriptCode] = useState<string>(ISHAK_SCRIPT_CODE);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'guide'>('preview');

  // Interactive Live Simulator State
  const [simUnlocked, setSimUnlocked] = useState(false);
  const [simPasswordInput, setSimPasswordInput] = useState(DEFAULT_PW);
  const [simPasswordError, setSimPasswordError] = useState('');
  const [simScanning, setSimScanning] = useState(false);
  const [simPanelOpen, setSimPanelOpen] = useState(false);
  const [simSettings, setSimSettings] = useState({
    delaySec: 10,
    afterTradeScanSec: 0,
    direction: 'random' as 'up' | 'down' | 'random'
  });
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simTapCount, setSimTapCount] = useState(0);

  useEffect(() => {
    // Also fetch with cache busting timestamp to ensure always updated
    fetch(`/ishak.js?t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.text())
      .then(code => {
        if (code && code.trim().length > 0) {
          setScriptCode(code);
        }
      })
      .catch(() => {});
    
    addSimLog("RX BOT Console Simulator initialized.");
  }, []);

  const addSimLog = (msg: string) => {
    setSimLogs(prev => [ `[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 19) ]);
  };

  const handleCopy = () => {
    if (!scriptCode) return;
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([scriptCode], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ishak.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSimLogin = () => {
    if (!simPasswordInput.trim()) {
      setSimPasswordError("Enter password");
      return;
    }
    if (simPasswordInput.trim() === DEFAULT_PW) {
      setSimPasswordError("");
      setSimUnlocked(true);
      addSimLog("RX BOT unlocked with default password (sakilvai)!");
    } else {
      setSimPasswordError(`Wrong or expired password. Get new one from ${TELEGRAM_CONTACT}`);
      addSimLog(`Login failed for input: "${simPasswordInput}"`);
    }
  };

  const handleSimWidgetTap = () => {
    if (!simUnlocked) {
      addSimLog("Widget clicked while locked — please unlock with password first.");
      return;
    }

    const nextCount = simTapCount + 1;
    setSimTapCount(nextCount);

    if (nextCount >= 3) {
      setSimTapCount(0);
      setSimPanelOpen(true);
      addSimLog("RX BOT 3 taps detected: Settings panel opened.");
      return;
    }

    setTimeout(() => {
      if (nextCount === 1) {
        setSimScanning(prev => {
          const next = !prev;
          addSimLog(next ? `Auto-trade scan started (delay: ${simSettings.delaySec}s, dir: ${simSettings.direction})` : "Scan stopped.");
          return next;
        });
      }
      setSimTapCount(0);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#040816] text-slate-100 font-sans selection:bg-orange-500 selection:text-white">
      {/* Background ambient neon glow matched to the RX logo (Orange + Cyan) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-600/15 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-[110px]"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-2/3 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-[90px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-cyan-500/20">
          <div className="flex items-center gap-4">
            <div className="relative w-18 h-18 rounded-full overflow-hidden p-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400 shadow-[0_0_30px_rgba(255,100,0,0.4),0_0_20px_rgba(0,210,255,0.35)]">
              <img 
                src={LOGO_IMG} 
                alt="RX BOT Logo" 
                className="w-full h-full object-cover rounded-full bg-slate-950" 
              />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-black tracking-wider bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400 bg-clip-text text-transparent">
                  RX BOT
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-900 text-orange-400 border border-orange-500/40 shadow-[0_0_10px_rgba(255,100,0,0.2)]">
                  ishak.js
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-400 mt-1 flex items-center gap-2">
                <span>Console Trading Bot Script Suite</span>
                <span className="text-cyan-400">•</span>
                <span className="text-cyan-300 font-mono">Password: {DEFAULT_PW}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 via-amber-500 to-cyan-400 hover:brightness-110 text-slate-950 transition-all duration-200 shadow-[0_0_25px_rgba(255,100,0,0.35),0_0_15px_rgba(0,210,255,0.3)] active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-950 stroke-[3]" /> : <Copy className="w-4 h-4" />}
              {copied ? "কোড কপি হয়েছে!" : "Copy ishak.js"}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 transition-all duration-200 shadow-md active:scale-95 cursor-pointer hover:border-orange-500/50"
            >
              <Download className="w-4 h-4" />
              Download ishak.js
            </button>
          </div>
        </header>

        {/* Banner Preview Card */}
        <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 my-6 shadow-[0_0_40px_rgba(0,210,255,0.15)] bg-slate-950">
          <div className="relative h-44 md:h-52 w-full overflow-hidden flex items-center justify-center">
            <img 
              src={BANNER_IMG} 
              alt="RX BOT Banner" 
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#040816] via-[#040816]/40 to-transparent"></div>
            <div className="absolute bottom-4 left-6 right-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/40">
                  Official Asset
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white mt-1 drop-shadow-md">
                  RX BOT Official Logo &amp; Color Theme
                </h2>
              </div>
              <div className="text-xs text-cyan-300 font-mono bg-slate-950/80 px-3 py-1.5 rounded-lg border border-cyan-500/40 backdrop-blur-sm">
                Default Password: <span className="text-orange-400 font-bold">{DEFAULT_PW}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Log & Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-orange-500/25 backdrop-blur-sm shadow-[0_0_15px_rgba(255,100,0,0.08)]">
            <div className="flex items-center gap-2 text-orange-400 text-xs font-bold mb-1">
              <Sparkles className="w-4 h-4" />
              ১/ লগো আপডেট
            </div>
            <div className="text-base font-bold text-white flex items-center gap-2">
              <span>আপলোডকৃত RX লগো</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              আগের লগো বাদ দিয়ে আপলোডকৃত নতুন অফিসিয়াল ইমেজটি বটের স্থায়ী লগো হিসেবে সেট করা হয়েছে।
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/25 backdrop-blur-sm shadow-[0_0_15px_rgba(0,210,255,0.08)]">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-1">
              <Terminal className="w-4 h-4" />
              ২/ নাম পরিবর্তন
            </div>
            <div className="text-lg font-black tracking-wide bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent">
              RX BOT
            </div>
            <p className="text-xs text-slate-400 mt-1">
              স্ক্রিপ্টের ভেতরে, উইজেটে, সেটিংস ও লগিনে সর্বত্র নাম <strong>RX BOT</strong> করা হয়েছে।
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/25 backdrop-blur-sm shadow-[0_0_15px_rgba(255,180,0,0.08)]">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
              <Palette className="w-4 h-4" />
              ৩/ কালারিং ম্যাচিং
            </div>
            <div className="text-sm font-bold text-amber-300">অরেঞ্জ + ইলেকট্রিক সায়ান</div>
            <p className="text-xs text-slate-400 mt-1">
              লগোর R (ফায়ার অরেঞ্জ) এবং X (নিয়ন সায়ান) এর গ্রেডিয়েন্টে স্ক্যানার লাইন, উইজেট গ্লো ও প্যানেল রাঙানো হয়েছে।
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-orange-500/25 backdrop-blur-sm shadow-[0_0_15px_rgba(255,100,0,0.08)]">
            <div className="flex items-center gap-2 text-orange-400 text-xs font-bold mb-1">
              <KeyRound className="w-4 h-4" />
              ৪/ নতুন পাসওয়ার্ড
            </div>
            <div className="text-lg font-mono font-bold text-orange-400">{DEFAULT_PW}</div>
            <p className="text-xs text-slate-400 mt-1">
              পাসওয়ার্ড পরিবর্তন করে <strong>{DEFAULT_PW}</strong> দেওয়া হয়েছে যা সরাসরি এন্টারে আনলক হবে।
            </p>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2.5 text-sm font-bold transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'preview'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-4 h-4" />
            লাইভ সিমুলেটর ও প্রিভিউ
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2.5 text-sm font-bold transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'code'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            ishak.js কোড ভিউয়ার
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2.5 text-sm font-bold transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-4 h-4" />
            ব্যবহার করার নিয়ম (Instructions)
          </button>
        </div>

        {/* TAB 1: Live Interactive Simulator */}
        {activeTab === 'preview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Simulator Stage */}
            <div className="lg:col-span-2 relative min-h-[520px] rounded-2xl bg-gradient-to-b from-[#0a1128] via-[#050b18] to-[#030612] border border-cyan-500/30 overflow-hidden shadow-2xl p-6 flex flex-col justify-between">
              {/* Scan Line Laser Simulator (Orange to Cyan Gradient) */}
              {simScanning && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                  <div 
                    className="w-full h-1.5 bg-gradient-to-r from-red-500 via-orange-500 via-amber-400 to-cyan-400 shadow-[0_0_40px_#ff5500,0_0_80px_#00d2ff]"
                    style={{
                      animation: 'scanMove 1.5s linear infinite'
                    }}
                  ></div>
                  <style>{`
                    @keyframes scanMove {
                      0% { transform: translateY(0); opacity: 0.8; }
                      50% { transform: translateY(260px); opacity: 1; }
                      100% { transform: translateY(520px); opacity: 0.8; }
                    }
                  `}</style>
                </div>
              )}

              {/* Status Header */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${simScanning ? 'bg-orange-500 shadow-[0_0_12px_#ff5500] animate-ping' : simUnlocked ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                  <span className="text-xs font-bold text-slate-200">
                    {simScanning ? '🔥 স্ক্যানিং চালু আছে (Scanning Active)' : simUnlocked ? '✅ আনলকড (Unlocked & Ready)' : '🔒 লকড (Password Required)'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSimUnlocked(false);
                    setSimScanning(false);
                    setSimPanelOpen(false);
                    addSimLog("Simulator reset.");
                  }}
                  className="text-xs text-slate-400 hover:text-orange-400 underline cursor-pointer"
                >
                  রিসেট সিমুলেটর
                </button>
              </div>

              {/* Center Content: Mock Trading Platform / Interactive Area */}
              <div className="flex-1 flex flex-col items-center justify-center my-8 z-10">
                {!simUnlocked ? (
                  /* Password Gate Modal */
                  <div className="w-full max-w-xs p-6 rounded-2xl bg-gradient-to-br from-[#101c3d] to-[#060b18] border border-cyan-400/40 shadow-[0_0_40px_rgba(255,100,0,0.25),0_0_60px_rgba(0,210,255,0.25)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400"></div>
                    <div className="text-center mb-4 mt-1">
                      <div className="w-14 h-14 mx-auto mb-2 rounded-full overflow-hidden p-0.5 bg-gradient-to-r from-orange-500 to-cyan-400 shadow-[0_0_20px_rgba(255,100,0,0.4)]">
                        <img src={LOGO_IMG} alt="Logo" className="w-full h-full object-cover rounded-full" />
                      </div>
                      <h3 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-orange-400 via-amber-300 to-cyan-400 bg-clip-text text-transparent">
                        RX BOT Login
                      </h3>
                      <p className="text-xs text-blue-200/70 mt-1">Enter password to continue</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <input
                          type="text"
                          value={simPasswordInput}
                          onChange={(e) => setSimPasswordInput(e.target.value)}
                          placeholder="Password"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/80 border border-cyan-500/40 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono"
                        />
                        <div className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
                          <span>ডিফল্ট পাসওয়ার্ড:</span>
                          <span className="font-mono text-orange-400 font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-orange-500/30">
                            {DEFAULT_PW}
                          </span>
                        </div>
                      </div>

                      {simPasswordError && (
                        <p className="text-xs text-rose-400 font-medium text-center">
                          {simPasswordError}
                        </p>
                      )}

                      <button
                        onClick={handleSimLogin}
                        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-orange-500 via-amber-500 to-cyan-400 text-slate-950 font-black text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,100,0,0.35)] cursor-pointer"
                      >
                        Enter
                      </button>
                    </div>
                  </div>
                ) : (
                  /* When Unlocked: Show Floating Interactive Widget */
                  <div className="flex flex-col items-center">
                    <div
                      onClick={handleSimWidgetTap}
                      className={`relative cursor-pointer transition-all duration-300 flex flex-col items-center gap-2 p-3 rounded-2xl group ${
                        simScanning 
                          ? 'scale-110 filter drop-shadow-[0_0_25px_#ff5500] drop-shadow-[0_0_35px_#00d2ff]' 
                          : 'hover:scale-105'
                      }`}
                    >
                      <div className="relative w-20 h-20 rounded-full overflow-hidden p-1 bg-slate-950 border-2 border-transparent bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400 shadow-[0_0_25px_rgba(255,100,0,0.4),0_0_25px_rgba(0,210,255,0.35)]">
                        <img 
                          src={LOGO_IMG} 
                          alt="RX BOT Icon" 
                          className="w-full h-full object-cover rounded-full bg-slate-950" 
                        />
                        {simScanning && (
                          <div className="absolute inset-0 rounded-full border-2 border-orange-400 animate-ping opacity-60"></div>
                        )}
                      </div>
                      <span className={`text-sm font-black tracking-widest ${
                        simScanning 
                          ? 'text-orange-300 drop-shadow-[0_0_12px_#ff6600]' 
                          : 'bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                      }`}>
                        RX BOT
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-4 text-center max-w-xs leading-relaxed">
                      👉 <strong className="text-orange-400">১ বার ট্যাপ:</strong> স্ক্যান শুরু/বন্ধ করুন<br />
                      👉 <strong className="text-cyan-300">৩ বার ট্যাপ:</strong> সেটিংস প্যানেল খুলুন
                    </p>
                  </div>
                )}
              </div>

              {/* Settings Modal Simulator */}
              {simPanelOpen && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-30 flex items-center justify-center p-4">
                  <div className="w-full max-w-xs p-5 rounded-2xl bg-gradient-to-br from-[#101c3d] to-[#060b18] border border-cyan-400/40 shadow-[0_0_40px_rgba(255,100,0,0.3),0_0_50px_rgba(0,210,255,0.25)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400"></div>
                    <h3 className="text-base font-extrabold text-center mb-4 tracking-wider bg-gradient-to-r from-orange-400 via-amber-300 to-cyan-400 bg-clip-text text-transparent mt-1">
                      RX BOT Settings
                    </h3>

                    <div className="space-y-3.5 text-xs">
                      <div>
                        <label className="block text-slate-200 mb-1 font-semibold">Scan delay (seconds)</label>
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={simSettings.delaySec}
                          onChange={(e) => setSimSettings(s => ({ ...s, delaySec: Number(e.target.value) || 10 }))}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-cyan-500/30 text-white font-mono focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-200 mb-1 font-semibold">After trade scan (seconds)</label>
                        <p className="text-[10px] text-cyan-400/70 mb-1">0 = stop only when you tap the icon</p>
                        <input
                          type="number"
                          min="0"
                          max="300"
                          value={simSettings.afterTradeScanSec}
                          onChange={(e) => setSimSettings(s => ({ ...s, afterTradeScanSec: Number(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-cyan-500/30 text-white font-mono focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-200 mb-1.5 font-semibold">Trade direction</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['up', 'down', 'random'] as const).map(dir => (
                            <button
                              key={dir}
                              type="button"
                              onClick={() => setSimSettings(s => ({ ...s, direction: dir }))}
                              className={`py-1.5 rounded-lg font-bold capitalize border transition-all cursor-pointer ${
                                simSettings.direction === dir
                                  ? 'bg-gradient-to-r from-orange-500/25 to-cyan-500/25 border-orange-500 text-white shadow-[0_0_12px_rgba(255,100,0,0.35)]'
                                  : 'bg-slate-950/60 border-cyan-500/20 text-slate-300 hover:border-cyan-500/40'
                              }`}
                            >
                              {dir}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => {
                            setSimPanelOpen(false);
                            addSimLog(`Settings saved: delay=${simSettings.delaySec}s, dir=${simSettings.direction}`);
                          }}
                          className="flex-1 py-2 rounded-lg bg-gradient-to-r from-orange-500 via-amber-500 to-cyan-400 text-slate-950 font-black hover:brightness-110 active:scale-95 cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setSimPanelOpen(false)}
                          className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom hint */}
              <div className="text-[11px] text-slate-500 text-center z-10">
                নতুন RX BOT-এর ফায়ার অরেঞ্জ ও নিয়ন সায়ান স্ক্যানার লাইন ও সেটিংস এখানে লাইভ টেস্ট করতে পারবেন।
              </div>
            </div>

            {/* Simulator Console Output */}
            <div className="flex flex-col rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs shadow-xl h-[520px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-orange-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span>DevTools Console Simulation</span>
                </div>
                <button
                  onClick={() => setSimLogs([])}
                  className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  Clear
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 py-3 text-slate-300">
                {simLogs.map((log, i) => (
                  <div key={i} className="leading-relaxed">
                    <span className="text-orange-500">&gt;</span> {log}
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Password: <code className="text-orange-400 font-bold">{DEFAULT_PW}</code></span>
                <span className="text-cyan-400">RX BOT is ready</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ishak.js Code Viewer */}
        {activeTab === 'code' && (
          <div className="rounded-2xl bg-slate-950 border border-cyan-500/30 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900/80 border-b border-cyan-500/20">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <span className="font-mono text-xs font-semibold text-orange-300">
                  ishak.js (RX BOT Console Edition)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 cursor-pointer transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy Code"}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            </div>

            <pre className="p-6 text-xs md:text-sm font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-[600px] selection:bg-orange-500 selection:text-white">
              <code>{scriptCode || "Loading ishak.js..."}</code>
            </pre>
          </div>
        )}

        {/* TAB 3: How to Use Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-orange-500/20">
              <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-orange-400" />
                RX BOT ব্যবহারের নির্দেশিকা (How to use)
              </h2>

              <ol className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 border border-orange-400 text-orange-300 flex items-center justify-center font-bold text-xs mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-white">কোড কপি করুন:</strong> ওপরের{' '}
                    <span className="text-orange-400 font-semibold">"Copy ishak.js"</span> বাটনে ক্লিক করে পুরো স্ক্রিপ্টটি কপি করুন অথবা ফাইল ডাউনলোড করে নিন।
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 border border-orange-400 text-orange-300 flex items-center justify-center font-bold text-xs mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-white">ট্রেডিং পেইজে যান:</strong> ব্রাউজারে আপনার ট্রেডিং প্ল্যাটফর্ম ওপেন করুন।
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 border border-orange-400 text-orange-300 flex items-center justify-center font-bold text-xs mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-white">Console ওপেন করুন:</strong> কীবোর্ড থেকে{' '}
                    <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-orange-400 font-mono text-xs">F12</kbd>{' '}
                    বা <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-orange-400 font-mono text-xs">Ctrl + Shift + I</kbd> চেপে Console ট্যাবে যান।
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 border border-orange-400 text-orange-300 flex items-center justify-center font-bold text-xs mt-0.5">
                    4
                  </span>
                  <div>
                    <strong className="text-white">পেস্ট করে Enter চাপুন:</strong> সম্পূর্ণ স্ক্রিপ্টটি পেস্ট করে Enter চাপলে স্ক্রিনে নতুন <strong className="text-orange-400">RX BOT</strong> উইজেট দৃশ্যমান হবে।
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 border border-orange-400 text-orange-300 flex items-center justify-center font-bold text-xs mt-0.5">
                    5
                  </span>
                  <div>
                    <strong className="text-white">নতুন পাসওয়ার্ড:</strong> প্রথম ক্লিকে পাসওয়ার্ড বক্স আসবে। পাসওয়ার্ড ফিল্ডে ইতিমধ্যে{' '}
                    <code className="text-orange-400 bg-slate-950 px-2 py-0.5 rounded border border-orange-500/40 font-bold">
                      {DEFAULT_PW}
                    </code>{' '}
                    দেওয়া থাকবে। শুধু <strong>Enter</strong> চাপলেই সফলভাবে আনলক হয়ে যাবে!
                  </div>
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <span>File Location: <code className="text-orange-400">/ishak.js</code> &amp; <code className="text-cyan-400">/public/ishak.js</code></span>
          </div>
          <div>
            RX BOT Suite · Default Password: <span className="text-orange-400 font-mono font-bold">{DEFAULT_PW}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
