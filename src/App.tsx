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
  Settings, 
  KeyRound, 
  Palette, 
  Terminal, 
  ExternalLink,
  ShieldCheck,
  Send,
  Sparkles,
  Info
} from 'lucide-react';

const LOGO_URL = "https://i.ibb.co/FqjsgcCz/file-32.jpg";
const DEFAULT_PW = "TG:@IshakVhai";
const TELEGRAM_CONTACT = "telegram:@SA_T_OWNER";

export default function App() {
  const [scriptCode, setScriptCode] = useState<string>('');
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
    fetch('/ishak.js')
      .then(r => r.text())
      .then(code => setScriptCode(code))
      .catch(() => {
        // Fallback fetch from root if needed
      });
    
    addSimLog("RX OWNER Simulator initialized.");
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
      addSimLog("RX OWNER unlocked with default password (TG:@IshakVhai)!");
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
      addSimLog("RX OWNER 3 taps detected: Settings panel opened.");
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
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Background neon ambient gradients matching the logo colors */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-cyan-500/20">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden p-[2px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 shadow-[0_0_25px_rgba(0,210,255,0.4)]">
              <img 
                src={LOGO_URL} 
                alt="RX OWNER Logo" 
                className="w-full h-full object-cover rounded-full bg-slate-950" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400 bg-clip-text text-transparent">
                  RX OWNER
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                  ishak.js
                </span>
              </div>
              <p className="text-xs md:text-sm text-cyan-300/70 mt-0.5">
                Updated Browser Console Trading Script Suite
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all duration-200 shadow-[0_0_20px_rgba(0,210,255,0.35)] active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
              {copied ? "কোড কপি হয়েছে!" : "Copy ishak.js"}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 transition-all duration-200 shadow-md active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download ishak.js
            </button>
          </div>
        </header>

        {/* Change Log & Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 my-8">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
              <Sparkles className="w-4 h-4" />
              নাম পরিবর্তন
            </div>
            <div className="text-lg font-bold text-white">RX OWNER</div>
            <p className="text-xs text-slate-400 mt-1">
              আগের <span className="line-through text-slate-500">QX999</span> পরিবর্তন করে RX OWNER ব্র্যান্ডিং প্রয়োগ করা হয়েছে।
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
              <KeyRound className="w-4 h-4" />
              ডিফল্ট পাসওয়ার্ড
            </div>
            <div className="text-lg font-mono font-bold text-cyan-300">{DEFAULT_PW}</div>
            <p className="text-xs text-slate-400 mt-1">
              স্বয়ংক্রিয়ভাবে ডিফল্ট পাসওয়ার্ড হিসেবে সেট এবং যাচাইকরণ যুক্ত।
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
              <Palette className="w-4 h-4" />
              লগো ও কালারিং
            </div>
            <div className="text-lg font-bold text-cyan-300">ইলেকট্রিক ব্লু ও সায়ান</div>
            <p className="text-xs text-slate-400 mt-1">
              নতুন লগোটির কালার প্যালেটের সাথে স্ক্যান লাইন, গ্লো ও প্যানেলের রঙ ম্যাচ করা হয়েছে।
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
              <Send className="w-4 h-4" />
              টেলিগ্রাম কন্টাক্ট মেসেজ
            </div>
            <div className="text-xs font-mono font-semibold text-slate-200 mt-1 truncate">
              {TELEGRAM_CONTACT}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              ভুল পাসওয়ার্ড নোটিশে telegram:@SA_T_OWNER দিয়ে আপডেট করা হয়েছে।
            </p>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'preview'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-4 h-4" />
            লাইভ সিমুলেটর ও প্রিভিউ
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
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
            className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'border-cyan-400 text-cyan-300'
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
            <div className="lg:col-span-2 relative min-h-[500px] rounded-2xl bg-gradient-to-b from-[#060e20] to-[#020612] border border-cyan-500/30 overflow-hidden shadow-2xl p-6 flex flex-col justify-between">
              {/* Scan Line Laser Simulator */}
              {simScanning && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                  <div className="w-full h-1 bg-gradient-to-b from-cyan-300 via-sky-400 to-blue-600 shadow-[0_0_35px_#00d2ff,0_0_70px_#0088ff] animate-bounce" style={{
                    animationDuration: '1.5s',
                    animationIterationCount: 'infinite'
                  }}></div>
                </div>
              )}

              {/* Status Header */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${simScanning ? 'bg-cyan-400 shadow-[0_0_12px_#00d2ff] animate-ping' : simUnlocked ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                  <span className="text-xs font-semibold text-cyan-200">
                    {simScanning ? 'স্ক্যানিং চালু আছে (Scanning Active)' : simUnlocked ? 'আনলকড (Unlocked & Ready)' : 'লকড (Password Required)'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSimUnlocked(false);
                    setSimScanning(false);
                    setSimPanelOpen(false);
                    addSimLog("Simulator reset.");
                  }}
                  className="text-xs text-slate-400 hover:text-cyan-300 underline cursor-pointer"
                >
                  রিসেট সিমুলেটর
                </button>
              </div>

              {/* Center Content: Mock Trading Platform / Interactive Area */}
              <div className="flex-1 flex flex-col items-center justify-center my-8 z-10">
                {!simUnlocked ? (
                  /* Password Gate Modal */
                  <div className="w-full max-w-xs p-6 rounded-2xl bg-gradient-to-br from-[#071224] to-[#030712] border border-cyan-400/40 shadow-[0_0_50px_rgba(0,180,255,0.25)]">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-full overflow-hidden p-0.5 bg-cyan-400 shadow-[0_0_15px_rgba(0,210,255,0.4)]">
                        <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover rounded-full" />
                      </div>
                      <h3 className="text-lg font-bold text-cyan-400 tracking-wider">RX OWNER Login</h3>
                      <p className="text-xs text-blue-200/70 mt-1">Enter password to continue</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <input
                          type="text"
                          value={simPasswordInput}
                          onChange={(e) => setSimPasswordInput(e.target.value)}
                          placeholder="Password"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/80 border border-cyan-500/40 text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono"
                        />
                        <div className="text-[11px] text-cyan-300/80 mt-1">
                          ডিফল্ট পাসওয়ার্ড: <span className="font-mono text-cyan-200 font-bold">{DEFAULT_PW}</span>
                        </div>
                      </div>

                      {simPasswordError && (
                        <p className="text-xs text-rose-400 font-medium text-center">
                          {simPasswordError}
                        </p>
                      )}

                      <button
                        onClick={handleSimLogin}
                        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,210,255,0.3)] cursor-pointer"
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
                      className={`relative cursor-pointer transition-all duration-300 flex flex-col items-center gap-1.5 p-3 rounded-2xl group ${
                        simScanning ? 'scale-110 filter drop-shadow-[0_0_25px_#00d2ff]' : 'hover:scale-105'
                      }`}
                    >
                      <div className="relative w-20 h-20 rounded-full overflow-hidden p-1 bg-slate-950 border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,210,255,0.4)]">
                        <img 
                          src={LOGO_URL} 
                          alt="RX OWNER Icon" 
                          className="w-full h-full object-cover rounded-full" 
                        />
                        {simScanning && (
                          <div className="absolute inset-0 rounded-full border-2 border-cyan-300 animate-ping opacity-50"></div>
                        )}
                      </div>
                      <span className={`text-sm font-extrabold tracking-wider ${
                        simScanning 
                          ? 'text-cyan-200 drop-shadow-[0_0_12px_#00d2ff]' 
                          : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                      }`}>
                        RX OWNER
                      </span>
                    </div>

                    <p className="text-xs text-cyan-300/60 mt-4 text-center max-w-xs">
                      👉 <strong className="text-cyan-300">১ বার ট্যাপ:</strong> স্ক্যান শুরু/বন্ধ করুন<br />
                      👉 <strong className="text-cyan-300">৩ বার ট্যাপ:</strong> সেটিংস প্যানেল খুলুন
                    </p>
                  </div>
                )}
              </div>

              {/* Settings Modal Simulator */}
              {simPanelOpen && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex items-center justify-center p-4">
                  <div className="w-full max-w-xs p-5 rounded-2xl bg-gradient-to-br from-[#071224] to-[#030712] border border-cyan-400/40 shadow-[0_0_40px_rgba(0,210,255,0.3)]">
                    <h3 className="text-base font-bold text-cyan-400 text-center mb-4 tracking-wide">
                      RX OWNER Settings
                    </h3>

                    <div className="space-y-3.5 text-xs">
                      <div>
                        <label className="block text-cyan-200 mb-1">Scan delay (seconds)</label>
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={simSettings.delaySec}
                          onChange={(e) => setSimSettings(s => ({ ...s, delaySec: Number(e.target.value) || 10 }))}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-cyan-500/30 text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-cyan-200 mb-1">After trade scan (seconds)</label>
                        <p className="text-[10px] text-cyan-400/60 mb-1">0 = stop only when you tap the icon</p>
                        <input
                          type="number"
                          min="0"
                          max="300"
                          value={simSettings.afterTradeScanSec}
                          onChange={(e) => setSimSettings(s => ({ ...s, afterTradeScanSec: Number(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-cyan-500/30 text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-cyan-200 mb-1.5">Trade direction</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['up', 'down', 'random'] as const).map(dir => (
                            <button
                              key={dir}
                              type="button"
                              onClick={() => setSimSettings(s => ({ ...s, direction: dir }))}
                              className={`py-1.5 rounded-lg font-semibold capitalize border transition-all cursor-pointer ${
                                simSettings.direction === dir
                                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,210,255,0.3)]'
                                  : 'bg-slate-950/50 border-cyan-500/20 text-slate-300 hover:border-cyan-500/40'
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
                          className="flex-1 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold hover:brightness-110 active:scale-95 cursor-pointer"
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
                এই সিমুলেটরটিতে স্ক্রিপ্টের সকল ভিজ্যুয়াল পরিবর্তন (লগো, রঙ, পাসওয়ার্ড গেট ও স্ক্যানার) লাইভ টেস্ট করতে পারবেন।
              </div>
            </div>

            {/* Simulator Console Output */}
            <div className="flex flex-col rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs shadow-xl h-[500px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-cyan-400">
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
                    <span className="text-cyan-500">&gt;</span> {log}
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Password: <code className="text-cyan-300 font-bold">{DEFAULT_PW}</code></span>
                <span className="text-emerald-400">ishak.js ready</span>
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
                <span className="font-mono text-xs font-semibold text-cyan-300">
                  /ishak.js (বা /public/ishak.js)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 cursor-pointer transition-all"
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

            <pre className="p-6 text-xs md:text-sm font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-[600px] selection:bg-cyan-500 selection:text-black">
              <code>{scriptCode || "Loading ishak.js..."}</code>
            </pre>
          </div>
        )}

        {/* TAB 3: How to Use Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-cyan-500/20">
              <h2 className="text-xl font-bold text-cyan-300 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                ফাইলটি ব্যবহারের সহজ নিয়ম (How to use ishak.js)
              </h2>

              <ol className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center font-bold text-xs mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-white">কোড কপি করুন:</strong> উপরের{' '}
                    <span className="text-cyan-300 font-semibold">"Copy ishak.js"</span> বাটনে ক্লিক করে পুরো স্ক্রিপ্টটি ক্লিপবোর্ডে কপি করুন অথবা ফাইলটি ডাউনলোড করুন।
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center font-bold text-xs mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-white">ট্রেডিং প্ল্যাটফর্ম পেইজে যান:</strong> ব্রাউজারে আপনার কাঙ্ক্ষিত ট্রেডিং প্ল্যাটফর্ম ওপেন করুন।
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center font-bold text-xs mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-white">Console ওপেন করুন:</strong> কীবোর্ড থেকে{' '}
                    <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-xs">F12</kbd>{' '}
                    অথবা <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-xs">Ctrl + Shift + I</kbd> চেপে DevTools খুলুন এবং <strong>Console</strong> ট্যাবে যান।
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center font-bold text-xs mt-0.5">
                    4
                  </span>
                  <div>
                    <strong className="text-white">পেস্ট করে Enter চাপুন:</strong> কপি করা কোডটি পেস্ট করে Enter প্রেস করুন। সাথে সাথে স্ক্রিনের বাম পাশে নতুন <strong className="text-cyan-300">RX OWNER</strong> লগো সহ উইজেট চলে আসবে।
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center font-bold text-xs mt-0.5">
                    5
                  </span>
                  <div>
                    <strong className="text-white">পাসওয়ার্ড এন্টার করুন:</strong> প্রথমবার ক্লিক করলে পাসওয়ার্ড বক্স আসবে। ডিফল্ট পাসওয়ার্ড হিসেবে{' '}
                    <code className="text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-cyan-500/30 font-bold">
                      TG:@IshakVhai
                    </code>{' '}
                    দেওয়া থাকবে। শুধু <strong>Enter</strong> চাপলেই আনলক হয়ে যাবে!
                  </div>
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <span>File Location: <code className="text-cyan-400">/ishak.js</code> &amp; <code className="text-cyan-400">/public/ishak.js</code></span>
          </div>
          <div>
            RX OWNER Suite · Default Password: <span className="text-cyan-400 font-mono">TG:@IshakVhai</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
