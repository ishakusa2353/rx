/**
 * RX BOT — Browser console script
 * Paste entire file into DevTools Console (F12) on the trading platform page.
 */
(function () {
  if (window.__RX_BOT_ACTIVE__) {
    console.warn("RX BOT already running.");
    return;
  }

  const CHECK_URL = "https://qx999.netlify.app/api/check-password";
  const PW_STORAGE_KEY = "rx_bot_saved_password";
  const DEFAULT_PASSWORD = "sakilvai";

  function getSavedPassword() {
    try {
      return (
        localStorage.getItem(PW_STORAGE_KEY) ||
        sessionStorage.getItem(PW_STORAGE_KEY) ||
        DEFAULT_PASSWORD
      );
    } catch {
      return DEFAULT_PASSWORD;
    }
  }

  function rememberPassword(pw) {
    try {
      localStorage.setItem(PW_STORAGE_KEY, pw);
    } catch {
      try {
        sessionStorage.setItem(PW_STORAGE_KEY, pw);
      } catch {
        /* ignore */
      }
    }
  }

  function showPasswordGate(onSuccess) {
    if (document.getElementById("rx-bot-login-overlay")) return;

    const loginStyle = document.createElement("style");
    loginStyle.id = "rx-bot-login-style";
    loginStyle.textContent = `
      #rx-bot-login-overlay {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(4, 9, 24, 0.85);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      }
      #rx-bot-login-box {
        width: min(330px, calc(100vw - 32px));
        padding: 24px 22px 20px;
        border-radius: 16px;
        background: radial-gradient(circle at 50% 0%, #101c3d 0%, #060b18 100%);
        border: 1px solid rgba(0, 210, 255, 0.45);
        box-shadow: 0 0 35px rgba(255, 107, 0, 0.25), 0 0 60px rgba(0, 210, 255, 0.28), 0 20px 50px rgba(0, 0, 0, 0.85);
        position: relative;
        overflow: hidden;
      }
      #rx-bot-login-box::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, #ff5500 0%, #ff8800 50%, #00d2ff 100%);
      }
      #rx-bot-login-header {
        text-align: center;
        margin-bottom: 16px;
      }
      #rx-bot-login-box h3 {
        margin: 0 0 4px;
        text-align: center;
        font-size: 20px;
        font-weight: 800;
        letter-spacing: 0.08em;
        background: linear-gradient(90deg, #ff6b00 0%, #ffaa00 48%, #00d2ff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      #rx-bot-login-box p {
        margin: 0 0 14px;
        text-align: center;
        font-size: 12px;
        color: #93c5fd;
      }
      #rx-bot-login-input {
        box-sizing: border-box;
        width: 100%;
        padding: 12px 14px;
        border-radius: 10px;
        border: 1px solid rgba(0, 210, 255, 0.4);
        background: rgba(3, 8, 20, 0.75);
        color: #fff;
        font-size: 15px;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      #rx-bot-login-input:focus {
        border-color: #ff7700;
        box-shadow: 0 0 0 2px rgba(255, 119, 0, 0.3), 0 0 14px rgba(0, 210, 255, 0.35);
      }
      #rx-bot-login-btn {
        width: 100%;
        margin-top: 14px;
        padding: 12px;
        border: none;
        border-radius: 10px;
        background: linear-gradient(90deg, #ff5500 0%, #ff8c00 45%, #00aaff 100%);
        color: #ffffff;
        font-weight: 800;
        font-size: 14px;
        letter-spacing: 0.05em;
        cursor: pointer;
        transition: filter 0.2s ease, transform 0.1s ease;
        box-shadow: 0 4px 18px rgba(255, 85, 0, 0.35);
      }
      #rx-bot-login-btn:hover {
        filter: brightness(1.15);
      }
      #rx-bot-login-btn:active {
        transform: scale(0.98);
      }
      #rx-bot-login-btn:disabled {
        opacity: 0.65;
        cursor: wait;
      }
      #rx-bot-login-err {
        min-height: 18px;
        margin-top: 10px;
        text-align: center;
        font-size: 12px;
        color: #ff5555;
        font-weight: 600;
      }
    `;
    document.head.appendChild(loginStyle);

    const overlay = document.createElement("div");
    overlay.id = "rx-bot-login-overlay";
    overlay.innerHTML = `
      <div id="rx-bot-login-box">
        <div id="rx-bot-login-header">
          <h3>RX BOT Login</h3>
          <p>Enter password to continue</p>
        </div>
        <input id="rx-bot-login-input" type="password" autocomplete="current-password" />
        <button type="button" id="rx-bot-login-btn">Enter</button>
        <p id="rx-bot-login-err"></p>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = overlay.querySelector("#rx-bot-login-input");
    const errEl = overlay.querySelector("#rx-bot-login-err");
    const btn = overlay.querySelector("#rx-bot-login-btn");

    input.value = getSavedPassword();

    async function tryLogin() {
      const pw = String(input.value || "").trim();
      if (!pw) {
        errEl.textContent = "Enter password";
        return;
      }

      // Default password verification
      if (pw === DEFAULT_PASSWORD) {
        rememberPassword(pw);
        overlay.remove();
        loginStyle.remove();
        onSuccess();
        return;
      }

      errEl.textContent = "Checking...";
      btn.disabled = true;
      try {
        const res = await fetch(CHECK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: pw }),
        });
        const data = await res.json().catch(() => ({}));
        if (data.valid) {
          rememberPassword(pw);
          overlay.remove();
          loginStyle.remove();
          onSuccess();
          return;
        }
        errEl.textContent =
          "Wrong or expired password. Get new one from telegram:@SA_T_OWNER";
        input.focus();
        input.select();
      } catch {
        errEl.textContent =
          "Wrong or expired password. Get new one from telegram:@SA_T_OWNER";
      } finally {
        btn.disabled = false;
      }
    }

    btn.addEventListener("click", tryLogin);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        tryLogin();
      }
    });

    setTimeout(() => input.focus(), 50);
    if (input.value) {
      setTimeout(() => input.select(), 60);
    }
  }

  function initRX_BOT() {
    window.__RX_BOT_ACTIVE__ = true;

    const LOGO_SRC = "data:image/jpeg;base64,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";
    const LABEL = "RX BOT";
    const STORAGE_KEY = "rx_bot_settings_v1";
    const TAP_REQUIRED = 3;
    const TAP_SETTLE_MS = 380;
    const TAP_SEQUENCE_MS = 650;

    const defaults = { delaySec: 10, afterTradeScanSec: 0, direction: "random" };

    function parseStored(raw) {
      if (!raw) return null;
      const s = JSON.parse(raw);
      const delaySec = Math.max(1, Math.min(120, Number(s.delaySec) || defaults.delaySec));
      const afterTradeScanSec = Math.max(
        0,
        Math.min(300, Math.round(Number(s.afterTradeScanSec) || 0))
      );
      const direction = ["up", "down", "random"].includes(s.direction)
        ? s.direction
        : defaults.direction;
      return { delaySec, afterTradeScanSec, direction };
    }

    function loadSettings() {
      const sources = [
        () => localStorage.getItem(STORAGE_KEY),
        () => sessionStorage.getItem(STORAGE_KEY),
        () => {
          const b = window.__RX_BOT_SETTINGS_BACKUP__;
          return b ? JSON.stringify(b) : null;
        },
      ];
      for (const get of sources) {
        try {
          const parsed = parseStored(get());
          if (parsed) return parsed;
        } catch {
          /* try next */
        }
      }
      return { ...defaults };
    }

    function saveSettings(s) {
      const json = JSON.stringify(s);
      window.__RX_BOT_SETTINGS_BACKUP__ = { ...s };
      let ok = false;
      try {
        localStorage.setItem(STORAGE_KEY, json);
        ok = true;
      } catch {
        /* blocked */
      }
      try {
        sessionStorage.setItem(STORAGE_KEY, json);
        ok = true;
      } catch {
        /* blocked */
      }
      return ok;
    }

    let settings = loadSettings();

    const style = document.createElement("style");
    style.id = "rx-bot-widget-style";
    style.textContent = `
      #rx-bot-widget {
        position: fixed;
        z-index: 2147483646;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        cursor: grab;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        filter: drop-shadow(0 4px 12px rgba(0,0,0,0.65));
        transition: filter 0.25s ease;
      }
      #rx-bot-widget.rx-bot-glow {
        filter: drop-shadow(0 0 14px #ff6600) drop-shadow(0 0 28px #00d2ff)
          drop-shadow(0 0 50px rgba(0,210,255,0.7));
      }
      #rx-bot-widget:active { cursor: grabbing; }
      #rx-bot-logo-wrap {
        width: 66px;
        height: 66px;
        border-radius: 50%;
        overflow: hidden;
        background: #060b19;
        border: 2px solid transparent;
        background-image: linear-gradient(#060b19, #060b19), linear-gradient(135deg, #ff5500 0%, #ff8800 45%, #00d2ff 100%);
        background-origin: border-box;
        background-clip: padding-box, border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        box-shadow: 0 0 20px rgba(255,100,0,0.3), 0 0 20px rgba(0,210,255,0.35);
      }
      #rx-bot-logo-wrap img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        pointer-events: none;
      }
      #rx-bot-label {
        font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0.1em;
        background: linear-gradient(90deg, #ff6b00 0%, #ffaa00 45%, #00d2ff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 2px 6px rgba(0,0,0,0.85);
        pointer-events: none;
      }
      #rx-bot-widget.rx-bot-glow #rx-bot-label {
        filter: drop-shadow(0 0 8px #ff6600) drop-shadow(0 0 16px #00d2ff);
      }
      #rx-bot-scan-overlay {
        position: fixed;
        inset: 0;
        z-index: 2147483645;
        pointer-events: none;
        overflow: hidden;
        display: none;
      }
      #rx-bot-scan-overlay.rx-bot-scan-on { display: block; }
      #rx-bot-scan-line {
        position: absolute;
        left: 0;
        width: 100%;
        height: 5px;
        background: linear-gradient(
          90deg,
          #ff3300 0%,
          #ff7700 28%,
          #ffbb00 50%,
          #00d2ff 75%,
          #0088ff 100%
        );
        box-shadow:
          0 -75px 110px rgba(255, 85, 0, 0.85),
          0 -50px 80px rgba(255, 136, 0, 0.9),
          0 -28px 45px rgba(255, 187, 0, 0.95),
          0 0 25px rgba(255, 102, 0, 1),
          0 0 45px rgba(0, 210, 255, 0.95),
          0 10px 30px rgba(0, 136, 255, 0.8);
        top: -8%;
        animation: rx-bot-scan-move 1.45s linear infinite;
      }
      @keyframes rx-bot-scan-move {
        0% { top: -8%; }
        100% { top: 108%; }
      }
      #rx-bot-panel {
        position: fixed;
        z-index: 2147483647;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;
        pointer-events: none;
        width: min(315px, calc(100vw - 32px));
        padding: 20px 18px 16px;
        border-radius: 16px;
        background: radial-gradient(circle at 50% 0%, #101c3d 0%, #060b18 100%);
        border: 1px solid rgba(0, 210, 255, 0.4);
        box-shadow: 0 0 35px rgba(255,100,0,0.22), 0 0 50px rgba(0,210,255,0.25), 0 16px 45px rgba(0,0,0,0.75);
        font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        color: #e2f1ff;
        position: fixed;
        overflow: hidden;
      }
      #rx-bot-panel::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, #ff5500 0%, #ff8800 48%, #00d2ff 100%);
      }
      #rx-bot-panel.rx-bot-panel-open {
        opacity: 1;
        pointer-events: auto;
      }
      #rx-bot-panel h3 {
        margin: 0 0 16px;
        font-size: 17px;
        font-weight: 800;
        text-align: center;
        letter-spacing: 0.08em;
        background: linear-gradient(90deg, #ff6b00 0%, #ffaa00 48%, #00d2ff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      #rx-bot-panel .rx-bot-row {
        margin-bottom: 14px;
      }
      #rx-bot-panel label {
        display: block;
        font-size: 12px;
        color: #93c5fd;
        margin-bottom: 6px;
        font-weight: 600;
      }
      #rx-bot-panel .rx-bot-subhint {
        margin: -2px 0 6px;
        font-size: 10px;
        color: #60a5fa;
        line-height: 1.3;
      }
      #rx-bot-panel .rx-bot-input-block {
        display: block;
        width: 100%;
      }
      #rx-bot-panel .rx-bot-time-input {
        box-sizing: border-box;
        width: 100%;
        padding: 10px 12px;
        border-radius: 8px;
        border: 1px solid rgba(0,210,255,0.35);
        background: rgba(3,8,20,0.7);
        color: #fff;
        font-size: 15px;
        font-family: inherit;
        outline: none;
        -webkit-appearance: none;
        appearance: none;
      }
      #rx-bot-panel .rx-bot-time-input:focus {
        border-color: #ff7700;
        box-shadow: 0 0 0 2px rgba(255,119,0,0.25), 0 0 12px rgba(0,210,255,0.3);
      }
      #rx-bot-panel .rx-bot-time-input::-webkit-outer-spin-button,
      #rx-bot-panel .rx-bot-time-input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      #rx-bot-panel .rx-bot-time-input[type="number"] {
        -moz-appearance: textfield;
      }
      #rx-bot-panel .rx-bot-save-btn {
        flex-shrink: 0;
        padding: 10px 14px;
        border: none;
        border-radius: 8px;
        background: linear-gradient(90deg, #ff5500 0%, #ff8c00 45%, #00aaff 100%);
        color: #ffffff;
        font-weight: 800;
        font-size: 14px;
        font-family: inherit;
        cursor: pointer;
        box-shadow: 0 3px 12px rgba(255,85,0,0.3);
      }
      #rx-bot-panel .rx-bot-save-btn:active {
        filter: brightness(0.9);
      }
      #rx-bot-panel .rx-bot-save-btn-block {
        display: block;
        width: 100%;
        margin-top: 6px;
        padding: 12px 14px;
        font-size: 14px;
      }
      #rx-bot-dir-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      #rx-bot-dir-group button {
        padding: 11px 12px;
        border-radius: 8px;
        border: 1px solid rgba(0,210,255,0.25);
        background: rgba(3,8,20,0.55);
        color: #e2f1ff;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
      }
      #rx-bot-dir-group button.rx-bot-dir-active {
        background: linear-gradient(90deg, rgba(255,85,0,0.25) 0%, rgba(0,210,255,0.25) 100%);
        border-color: #ff8800;
        box-shadow: 0 0 16px rgba(255,100,0,0.35);
        color: #ffffff;
      }
      #rx-bot-panel-backdrop {
        position: fixed;
        inset: 0;
        z-index: 2147483646;
        background: rgba(4, 9, 24, 0.65);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        opacity: 0;
        pointer-events: none;
      }
      #rx-bot-panel-backdrop.rx-bot-backdrop-open {
        opacity: 1;
        pointer-events: auto;
      }
      #rx-bot-panel-hint {
        margin: 10px 0 0;
        font-size: 11px;
        text-align: center;
        color: #60a5fa;
        line-height: 1.35;
      }
      #rx-bot-save-status {
        min-height: 18px;
        margin: 8px 0 0;
        font-size: 12px;
        text-align: center;
        color: #ffaa00;
        font-weight: 700;
      }
      #rx-bot-panel button,
      #rx-bot-panel input {
        touch-action: manipulation;
      }
    `;
    document.head.appendChild(style);

    const scanOverlay = document.createElement("div");
    scanOverlay.id = "rx-bot-scan-overlay";
    scanOverlay.innerHTML = '<div id="rx-bot-scan-line"></div>';
    document.body.appendChild(scanOverlay);

    const backdrop = document.createElement("div");
    backdrop.id = "rx-bot-panel-backdrop";

    const panel = document.createElement("div");
    panel.id = "rx-bot-panel";
    panel.innerHTML = `
      <h3>RX BOT Settings</h3>
      <div class="rx-bot-row">
        <label>Scan delay (seconds)</label>
        <input id="rx-bot-delay-input" class="rx-bot-time-input rx-bot-input-block" type="number" min="1" max="120" step="1" />
      </div>
      <div class="rx-bot-row">
        <label>After trade scan (seconds)</label>
        <p class="rx-bot-subhint">0 = stop only when you tap the icon</p>
        <input id="rx-bot-after-trade-input" class="rx-bot-time-input rx-bot-input-block" type="number" min="0" max="300" step="1" />
      </div>
      <div class="rx-bot-row">
        <label>Trade direction</label>
        <div id="rx-bot-dir-group">
          <button type="button" data-dir="up">Up</button>
          <button type="button" data-dir="down">Down</button>
          <button type="button" data-dir="random">Random</button>
        </div>
      </div>
      <button type="button" id="rx-bot-save-all" class="rx-bot-save-btn rx-bot-save-btn-block">Save</button>
      <p id="rx-bot-save-status"></p>
      <p id="rx-bot-panel-hint">3 taps on icon to open · tap outside to close</p>
    `;
    document.body.appendChild(backdrop);
    document.body.appendChild(panel);

    panel.addEventListener("mousedown", (e) => e.stopPropagation());
    panel.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
    panel.addEventListener("touchend", (e) => e.stopPropagation());

    const delayInput = panel.querySelector("#rx-bot-delay-input");
    const afterTradeInput = panel.querySelector("#rx-bot-after-trade-input");
    const saveStatus = panel.querySelector("#rx-bot-save-status");
    const dirButtons = panel.querySelectorAll("#rx-bot-dir-group button");
    let saveStatusTimer = null;
    let pendingDirection = settings.direction;

    function syncDirectionUI(dir) {
      dirButtons.forEach((btn) => {
        btn.classList.toggle("rx-bot-dir-active", btn.dataset.dir === dir);
      });
    }

    function syncPanelUI() {
      delayInput.value = String(settings.delaySec);
      afterTradeInput.value = String(settings.afterTradeScanSec);
      pendingDirection = settings.direction;
      syncDirectionUI(pendingDirection);
    }

    function openPanel() {
      syncPanelUI();
      backdrop.classList.add("rx-bot-backdrop-open");
      panel.classList.add("rx-bot-panel-open");
    }

    function closePanel() {
      backdrop.classList.remove("rx-bot-backdrop-open");
      panel.classList.remove("rx-bot-panel-open");
      saveStatus.textContent = "";
    }

    function showSaveStatus(msg, isError) {
      saveStatus.textContent = msg;
      saveStatus.style.color = isError ? "#ff5555" : "#ffaa00";
      if (saveStatusTimer) clearTimeout(saveStatusTimer);
      saveStatusTimer = setTimeout(() => {
        saveStatus.textContent = "";
      }, 2500);
    }

    function parseDelayInput() {
      const n = Number(String(delayInput.value).trim());
      if (!Number.isFinite(n) || n < 1) return defaults.delaySec;
      return Math.max(1, Math.min(120, Math.round(n)));
    }

    function parseAfterTradeInput() {
      const n = Number(String(afterTradeInput.value).trim());
      if (!Number.isFinite(n) || n < 0) return defaults.afterTradeScanSec;
      return Math.max(0, Math.min(300, Math.round(n)));
    }

    function applyAllSettings() {
      settings.delaySec = parseDelayInput();
      settings.afterTradeScanSec = parseAfterTradeInput();
      settings.direction = pendingDirection;
      delayInput.value = String(settings.delaySec);
      afterTradeInput.value = String(settings.afterTradeScanSec);
      const stored = saveSettings(settings);
      syncPanelUI();
      closePanel();
      console.log(
        "RX BOT: settings saved | delay:",
        settings.delaySec + "s",
        "| after-trade:",
        settings.afterTradeScanSec === 0 ? "manual" : settings.afterTradeScanSec + "s",
        "| dir:",
        settings.direction,
        stored ? "" : "(storage blocked)"
      );
    }

    function bindPanelAction(el, handler) {
      let lock = false;
      const run = (e) => {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        if (lock) return;
        lock = true;
        setTimeout(() => {
          lock = false;
        }, 300);
        handler();
      };
      el.addEventListener("pointerup", run);
      el.addEventListener("click", run);
    }

    bindPanelAction(panel.querySelector("#rx-bot-save-all"), applyAllSettings);

    function onSettingsEnter(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        applyAllSettings();
      }
    }
    delayInput.addEventListener("keydown", onSettingsEnter);
    afterTradeInput.addEventListener("keydown", onSettingsEnter);

    dirButtons.forEach((btn) => {
      bindPanelAction(btn, () => {
        pendingDirection = btn.dataset.dir;
        syncDirectionUI(pendingDirection);
      });
    });

    bindPanelAction(backdrop, closePanel);

    const widget = document.createElement("div");
    widget.id = "rx-bot-widget";
    widget.innerHTML = `
      <div id="rx-bot-logo-wrap"><img src="${LOGO_SRC}" alt="RX BOT" draggable="false" /></div>
      <span id="rx-bot-label">${LABEL}</span>
    `;
    document.body.appendChild(widget);

    let unlocked = false;
    let scanActive = false;
    let tradeTimer = null;
    let afterTradeTimer = null;
    let tapCount = 0;
    let tapSettleTimer = null;
    let lastTapAt = 0;

    function getTradeButtons() {
      const root = document.getElementById("trade-button");
      if (!root) return { up: null, down: null };
      return {
        up: root.querySelector("button.JQZcs"),
        down: root.querySelector("button.twQq3"),
      };
    }

    function pickTradeButton() {
      const { up, down } = getTradeButtons();
      if (!up && !down) return null;
      if (settings.direction === "up") return up || null;
      if (settings.direction === "down") return down || null;
      const pool = [up, down].filter(Boolean);
      return pool[Math.floor(Math.random() * pool.length)];
    }

    function placeTrade() {
      const btn = pickTradeButton();
      if (!btn) {
        console.error("RX BOT: trade button not found for direction:", settings.direction);
        return false;
      }
      btn.click();
      const side = btn.classList.contains("JQZcs") ? "UP" : "DOWN";
      console.log("RX BOT trade:", side, "| mode:", settings.direction);
      return true;
    }

    function clearAfterTradeTimer() {
      if (afterTradeTimer) {
        clearTimeout(afterTradeTimer);
        afterTradeTimer = null;
      }
    }

    function scheduleAfterTradeScanStop() {
      clearAfterTradeTimer();
      if (!settings.afterTradeScanSec || settings.afterTradeScanSec <= 0) return;
      const ms = settings.afterTradeScanSec * 1000;
      afterTradeTimer = setTimeout(() => {
        afterTradeTimer = null;
        if (scanActive) {
          stopScanSession();
          console.log("RX BOT: scan auto-stopped after trade (" + settings.afterTradeScanSec + "s)");
        }
      }, ms);
    }

    function stopScanSession() {
      widget.classList.remove("rx-bot-glow");
      scanOverlay.classList.remove("rx-bot-scan-on");
      scanActive = false;
      if (tradeTimer) {
        clearTimeout(tradeTimer);
        tradeTimer = null;
      }
      clearAfterTradeTimer();
    }

    function startAutoTrade() {
      if (scanActive) return;
      closePanel();
      clearAfterTradeTimer();
      scanActive = true;
      widget.classList.add("rx-bot-glow");
      scanOverlay.classList.add("rx-bot-scan-on");
      const delayMs = settings.delaySec * 1000;

      tradeTimer = setTimeout(() => {
        tradeTimer = null;
        placeTrade();
        scheduleAfterTradeScanStop();
      }, delayMs);
    }

    function resetTapCounter() {
      tapCount = 0;
      if (tapSettleTimer) {
        clearTimeout(tapSettleTimer);
        tapSettleTimer = null;
      }
    }

    function registerTap() {
      if (panel.classList.contains("rx-bot-panel-open")) return;

      const now = Date.now();
      if (now - lastTapAt > TAP_SEQUENCE_MS) tapCount = 0;
      lastTapAt = now;
      tapCount += 1;

      if (tapSettleTimer) {
        clearTimeout(tapSettleTimer);
        tapSettleTimer = null;
      }

      if (tapCount >= TAP_REQUIRED) {
        resetTapCounter();
        openPanel();
        return;
      }

      tapSettleTimer = setTimeout(() => {
        tapSettleTimer = null;
        if (tapCount === 1) {
          if (scanActive) {
            stopScanSession();
          } else {
            startAutoTrade();
          }
        }
        tapCount = 0;
      }, TAP_SETTLE_MS);
    }

    /* ——— Drag (mouse + touch) ——— */
    let dragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    const DRAG_THRESHOLD = 8;

    function clampPosition(left, top) {
      const rect = widget.getBoundingClientRect();
      const maxL = window.innerWidth - rect.width;
      const maxT = window.innerHeight - rect.height;
      return {
        left: Math.max(0, Math.min(left, maxL)),
        top: Math.max(0, Math.min(top, maxT)),
      };
    }

    function onPointerDown(clientX, clientY) {
      dragging = true;
      moved = false;
      const r = widget.getBoundingClientRect();
      startX = clientX;
      startY = clientY;
      startLeft = r.left;
      startTop = r.top;
      widget.style.transform = "none";
      widget.style.left = startLeft + "px";
      widget.style.top = startTop + "px";
    }

    function onPointerMove(clientX, clientY) {
      if (!dragging) return;
      const dx = clientX - startX;
      const dy = clientY - startY;
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        moved = true;
      }
      const pos = clampPosition(startLeft + dx, startTop + dy);
      widget.style.left = pos.left + "px";
      widget.style.top = pos.top + "px";
    }

    function onPointerUp() {
      if (!dragging) return;
      dragging = false;
      if (!moved) {
        if (!unlocked) {
          showPasswordGate(function () {
            unlocked = true;
            console.log("RX BOT unlocked — tap icon to scan, 3 taps for settings");
          });
          return;
        }
        registerTap();
      }
    }

    widget.addEventListener("mousedown", (e) => {
      e.preventDefault();
      onPointerDown(e.clientX, e.clientY);
    });

    widget.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length !== 1) return;
        e.preventDefault();
        const t = e.touches[0];
        onPointerDown(t.clientX, t.clientY);
      },
      { passive: false }
    );

    document.addEventListener("mousemove", (e) => {
      onPointerMove(e.clientX, e.clientY);
    });

    document.addEventListener(
      "touchmove",
      (e) => {
        if (!dragging || e.touches.length !== 1) return;
        e.preventDefault();
        const t = e.touches[0];
        onPointerMove(t.clientX, t.clientY);
      },
      { passive: false }
    );

    document.addEventListener("mouseup", onPointerUp);
    document.addEventListener("touchend", onPointerUp);
    document.addEventListener("touchcancel", onPointerUp);

    window.__RX_BOT_STOP__ = function () {
      stopScanSession();
      resetTapCounter();
      closePanel();
      widget.remove();
      scanOverlay.remove();
      backdrop.remove();
      panel.remove();
      style.remove();
      delete window.__RX_BOT_ACTIVE__;
      delete window.__RX_BOT_STOP__;
      console.log("RX BOT removed.");
    };

    syncPanelUI();
    console.log(
      "RX BOT loaded — icon ready (drag to move). Tap icon → password, then 1 tap: scan | 3 taps: settings | delay:",
      settings.delaySec + "s",
      "| after-trade scan:",
      settings.afterTradeScanSec === 0 ? "manual" : settings.afterTradeScanSec + "s",
      "| dir:",
      settings.direction
    );
  }

  initRX_BOT();
})();
