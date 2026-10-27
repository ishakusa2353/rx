/**
 * RX OWNER — Browser console script
 * Paste entire file into DevTools Console (F12) on the trading platform page.
 */
(function () {
  if (window.__RX_OWNER_ACTIVE__) {
    console.warn("RX OWNER already running.");
    return;
  }

  const CHECK_URL = "https://qx999.netlify.app/api/check-password";
  const PW_STORAGE_KEY = "rx_owner_saved_password";
  const DEFAULT_PASSWORD = "TG:@IshakVhai";

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
    if (document.getElementById("rx-owner-login-overlay")) return;

    const loginStyle = document.createElement("style");
    loginStyle.id = "rx-owner-login-style";
    loginStyle.textContent = `
      #rx-owner-login-overlay {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.78);
        font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      }
      #rx-owner-login-box {
        width: min(320px, calc(100vw - 32px));
        padding: 22px 20px 18px;
        border-radius: 14px;
        background: linear-gradient(160deg, #071224 0%, #030712 100%);
        border: 1px solid rgba(0, 210, 255, 0.4);
        box-shadow: 0 0 50px rgba(0, 150, 255, 0.25), 0 16px 40px rgba(0, 0, 0, 0.7);
      }
      #rx-owner-login-box h3 {
        margin: 0 0 6px;
        text-align: center;
        color: #00d2ff;
        font-size: 18px;
        letter-spacing: 0.08em;
      }
      #rx-owner-login-box p {
        margin: 0 0 14px;
        text-align: center;
        font-size: 12px;
        color: #93c5fd;
      }
      #rx-owner-login-input {
        box-sizing: border-box;
        width: 100%;
        padding: 11px 12px;
        border-radius: 8px;
        border: 1px solid rgba(0, 210, 255, 0.35);
        background: rgba(2, 6, 23, 0.65);
        color: #fff;
        font-size: 15px;
        outline: none;
      }
      #rx-owner-login-input:focus {
        border-color: #00d2ff;
        box-shadow: 0 0 0 2px rgba(0, 210, 255, 0.25);
      }
      #rx-owner-login-btn {
        width: 100%;
        margin-top: 12px;
        padding: 12px;
        border: none;
        border-radius: 8px;
        background: linear-gradient(135deg, #00d2ff 0%, #0088ff 100%);
        color: #020b18;
        font-weight: 700;
        font-size: 14px;
        cursor: pointer;
        transition: filter 0.15s ease;
      }
      #rx-owner-login-btn:hover {
        filter: brightness(1.1);
      }
      #rx-owner-login-btn:disabled {
        opacity: 0.65;
        cursor: wait;
      }
      #rx-owner-login-err {
        min-height: 18px;
        margin-top: 8px;
        text-align: center;
        font-size: 12px;
        color: #ff6b6b;
        font-weight: 600;
      }
    `;
    document.head.appendChild(loginStyle);

    const overlay = document.createElement("div");
    overlay.id = "rx-owner-login-overlay";
    overlay.innerHTML = `
      <div id="rx-owner-login-box">
        <h3>RX OWNER Login</h3>
        <p>Enter password to continue</p>
        <input id="rx-owner-login-input" type="password" autocomplete="current-password" />
        <button type="button" id="rx-owner-login-btn">Enter</button>
        <p id="rx-owner-login-err"></p>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = overlay.querySelector("#rx-owner-login-input");
    const errEl = overlay.querySelector("#rx-owner-login-err");
    const btn = overlay.querySelector("#rx-owner-login-btn");

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

  function initRX_OWNER() {
    window.__RX_OWNER_ACTIVE__ = true;

    const LOGO_URL = "https://i.ibb.co/FqjsgcCz/file-32.jpg";
    const LABEL = "RX OWNER";
    const STORAGE_KEY = "rx_owner_settings_v1";
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
          const b = window.__RX_OWNER_SETTINGS_BACKUP__;
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
      window.__RX_OWNER_SETTINGS_BACKUP__ = { ...s };
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
    style.id = "rx-owner-widget-style";
    style.textContent = `
      #rx-owner-widget {
        position: fixed;
        z-index: 2147483646;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        cursor: grab;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        filter: drop-shadow(0 2px 8px rgba(0,0,0,0.55));
        transition: filter 0.25s ease;
      }
      #rx-owner-widget.rx-owner-glow {
        filter: drop-shadow(0 0 12px #00d2ff) drop-shadow(0 0 28px #0088ff)
          drop-shadow(0 0 48px rgba(0,180,255,0.65));
      }
      #rx-owner-widget:active { cursor: grabbing; }
      #rx-owner-logo-wrap {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        overflow: hidden;
        background: rgba(2,6,23,0.5);
        border: 1.5px solid rgba(0,210,255,0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        box-shadow: 0 0 15px rgba(0,150,255,0.25);
      }
      #rx-owner-logo-wrap img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        pointer-events: none;
      }
      #rx-owner-label {
        font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.08em;
        color: #fff;
        text-shadow: 0 1px 4px rgba(0,0,0,0.9);
        pointer-events: none;
      }
      #rx-owner-widget.rx-owner-glow #rx-owner-label {
        color: #d0f0ff;
        text-shadow: 0 0 8px #00d2ff, 0 0 18px #0088ff, 0 0 32px rgba(0,210,255,0.85);
      }
      #rx-owner-scan-overlay {
        position: fixed;
        inset: 0;
        z-index: 2147483645;
        pointer-events: none;
        overflow: hidden;
        display: none;
      }
      #rx-owner-scan-overlay.rx-owner-scan-on { display: block; }
      #rx-owner-scan-line {
        position: absolute;
        left: 0;
        width: 100%;
        height: 5px;
        background: linear-gradient(
          180deg,
          #97def8 0%,
          #4ba8e1 16%,
          #0284c7 40%,
          #0369a1 58%,
          #0328c8 82%,
          rgba(3, 40, 200, 0.55) 100%
        );
        box-shadow:
          0 -88px 130px rgba(0, 210, 255, 1),
          0 -68px 100px rgba(75, 168, 225, 1),
          0 -50px 78px rgba(14, 165, 233, 0.98),
          0 -34px 58px rgba(2, 132, 199, 0.96),
          0 -22px 40px rgba(3, 105, 161, 0.94),
          0 -12px 26px rgba(46, 93, 179, 0.9),
          0 -6px 14px rgba(3, 40, 200, 0.88),
          0 0 28px rgba(0, 150, 255, 0.85),
          0 0 55px rgba(3, 8, 110, 0.55);
        top: -8%;
        animation: rx-owner-scan-move 1.45s linear infinite;
      }
      @keyframes rx-owner-scan-move {
        0% { top: -8%; }
        100% { top: 108%; }
      }
      #rx-owner-panel {
        position: fixed;
        z-index: 2147483647;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;
        pointer-events: none;
        width: min(300px, calc(100vw - 32px));
        padding: 18px 16px 14px;
        border-radius: 14px;
        background: linear-gradient(160deg, #071224 0%, #030712 100%);
        border: 1px solid rgba(0,210,255,0.35);
        box-shadow: 0 0 40px rgba(0,180,255,0.25), 0 12px 40px rgba(0,0,0,0.65);
        font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        color: #e2f1ff;
      }
      #rx-owner-panel.rx-owner-panel-open {
        opacity: 1;
        pointer-events: auto;
      }
      #rx-owner-panel h3 {
        margin: 0 0 14px;
        font-size: 16px;
        font-weight: 700;
        text-align: center;
        color: #00d2ff;
        letter-spacing: 0.06em;
      }
      #rx-owner-panel .rx-owner-row {
        margin-bottom: 14px;
      }
      #rx-owner-panel label {
        display: block;
        font-size: 12px;
        color: #93c5fd;
        margin-bottom: 6px;
      }
      #rx-owner-panel .rx-owner-subhint {
        margin: -2px 0 6px;
        font-size: 10px;
        color: #60a5fa;
        line-height: 1.3;
      }
      #rx-owner-panel .rx-owner-input-block {
        display: block;
        width: 100%;
      }
      #rx-owner-panel .rx-owner-time-input {
        box-sizing: border-box;
        width: 100%;
        padding: 10px 12px;
        border-radius: 8px;
        border: 1px solid rgba(0,210,255,0.3);
        background: rgba(2,6,23,0.5);
        color: #fff;
        font-size: 15px;
        font-family: inherit;
        outline: none;
        -webkit-appearance: none;
        appearance: none;
      }
      #rx-owner-panel .rx-owner-time-input:focus {
        border-color: #00d2ff;
        box-shadow: 0 0 0 2px rgba(0,210,255,0.22);
      }
      #rx-owner-panel .rx-owner-time-input::-webkit-outer-spin-button,
      #rx-owner-panel .rx-owner-time-input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      #rx-owner-panel .rx-owner-time-input[type="number"] {
        -moz-appearance: textfield;
      }
      #rx-owner-panel .rx-owner-save-btn {
        flex-shrink: 0;
        padding: 10px 14px;
        border: none;
        border-radius: 8px;
        background: linear-gradient(135deg, #00d2ff 0%, #0088ff 100%);
        color: #020b18;
        font-weight: 700;
        font-size: 13px;
        font-family: inherit;
        cursor: pointer;
      }
      #rx-owner-panel .rx-owner-save-btn:active {
        filter: brightness(0.9);
      }
      #rx-owner-panel .rx-owner-save-btn-block {
        display: block;
        width: 100%;
        margin-top: 4px;
        padding: 12px 14px;
        font-size: 14px;
      }
      #rx-owner-dir-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      #rx-owner-dir-group button {
        padding: 11px 12px;
        border-radius: 8px;
        border: 1px solid rgba(0,210,255,0.25);
        background: rgba(2,6,23,0.45);
        color: #e2f1ff;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
      }
      #rx-owner-dir-group button.rx-owner-dir-active {
        background: rgba(0,210,255,0.18);
        border-color: #00d2ff;
        box-shadow: 0 0 16px rgba(0,210,255,0.35);
        color: #00d2ff;
      }
      #rx-owner-panel-backdrop {
        position: fixed;
        inset: 0;
        z-index: 2147483646;
        background: rgba(0, 0, 0, 0.55);
        opacity: 0;
        pointer-events: none;
      }
      #rx-owner-panel-backdrop.rx-owner-backdrop-open {
        opacity: 1;
        pointer-events: auto;
      }
      #rx-owner-panel-hint {
        margin: 10px 0 0;
        font-size: 11px;
        text-align: center;
        color: #60a5fa;
        line-height: 1.35;
      }
      #rx-owner-save-status {
        min-height: 18px;
        margin: 8px 0 0;
        font-size: 12px;
        text-align: center;
        color: #00d2ff;
        font-weight: 600;
      }
      #rx-owner-panel button,
      #rx-owner-panel input {
        touch-action: manipulation;
      }
    `;
    document.head.appendChild(style);

    const scanOverlay = document.createElement("div");
    scanOverlay.id = "rx-owner-scan-overlay";
    scanOverlay.innerHTML = '<div id="rx-owner-scan-line"></div>';
    document.body.appendChild(scanOverlay);

    const backdrop = document.createElement("div");
    backdrop.id = "rx-owner-panel-backdrop";

    const panel = document.createElement("div");
    panel.id = "rx-owner-panel";
    panel.innerHTML = `
      <h3>RX OWNER Settings</h3>
      <div class="rx-owner-row">
        <label>Scan delay (seconds)</label>
        <input id="rx-owner-delay-input" class="rx-owner-time-input rx-owner-input-block" type="number" min="1" max="120" step="1" />
      </div>
      <div class="rx-owner-row">
        <label>After trade scan (seconds)</label>
        <p class="rx-owner-subhint">0 = stop only when you tap the icon</p>
        <input id="rx-owner-after-trade-input" class="rx-owner-time-input rx-owner-input-block" type="number" min="0" max="300" step="1" />
      </div>
      <div class="rx-owner-row">
        <label>Trade direction</label>
        <div id="rx-owner-dir-group">
          <button type="button" data-dir="up">Up</button>
          <button type="button" data-dir="down">Down</button>
          <button type="button" data-dir="random">Random</button>
        </div>
      </div>
      <button type="button" id="rx-owner-save-all" class="rx-owner-save-btn rx-owner-save-btn-block">Save</button>
      <p id="rx-owner-save-status"></p>
      <p id="rx-owner-panel-hint">3 taps on icon to open · tap outside to close</p>
    `;
    document.body.appendChild(backdrop);
    document.body.appendChild(panel);

    panel.addEventListener("mousedown", (e) => e.stopPropagation());
    panel.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
    panel.addEventListener("touchend", (e) => e.stopPropagation());

    const delayInput = panel.querySelector("#rx-owner-delay-input");
    const afterTradeInput = panel.querySelector("#rx-owner-after-trade-input");
    const saveStatus = panel.querySelector("#rx-owner-save-status");
    const dirButtons = panel.querySelectorAll("#rx-owner-dir-group button");
    let saveStatusTimer = null;
    let pendingDirection = settings.direction;

    function syncDirectionUI(dir) {
      dirButtons.forEach((btn) => {
        btn.classList.toggle("rx-owner-dir-active", btn.dataset.dir === dir);
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
      backdrop.classList.add("rx-owner-backdrop-open");
      panel.classList.add("rx-owner-panel-open");
    }

    function closePanel() {
      backdrop.classList.remove("rx-owner-backdrop-open");
      panel.classList.remove("rx-owner-panel-open");
      saveStatus.textContent = "";
    }

    function showSaveStatus(msg, isError) {
      saveStatus.textContent = msg;
      saveStatus.style.color = isError ? "#ff6b6b" : "#00d2ff";
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
        "RX OWNER: settings saved | delay:",
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

    bindPanelAction(panel.querySelector("#rx-owner-save-all"), applyAllSettings);

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
    widget.id = "rx-owner-widget";
    widget.innerHTML = `
      <div id="rx-owner-logo-wrap"><img src="${LOGO_URL}" alt="RX OWNER" draggable="false" /></div>
      <span id="rx-owner-label">${LABEL}</span>
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
        console.error("RX OWNER: trade button not found for direction:", settings.direction);
        return false;
      }
      btn.click();
      const side = btn.classList.contains("JQZcs") ? "UP" : "DOWN";
      console.log("RX OWNER trade:", side, "| mode:", settings.direction);
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
          console.log("RX OWNER: scan auto-stopped after trade (" + settings.afterTradeScanSec + "s)");
        }
      }, ms);
    }

    function stopScanSession() {
      widget.classList.remove("rx-owner-glow");
      scanOverlay.classList.remove("rx-owner-scan-on");
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
      widget.classList.add("rx-owner-glow");
      scanOverlay.classList.add("rx-owner-scan-on");
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
      if (panel.classList.contains("rx-owner-panel-open")) return;

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
            console.log("RX OWNER unlocked — tap icon to scan, 3 taps for settings");
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

    window.__RX_OWNER_STOP__ = function () {
      stopScanSession();
      resetTapCounter();
      closePanel();
      widget.remove();
      scanOverlay.remove();
      backdrop.remove();
      panel.remove();
      style.remove();
      delete window.__RX_OWNER_ACTIVE__;
      delete window.__RX_OWNER_STOP__;
      console.log("RX OWNER removed.");
    };

    syncPanelUI();
    console.log(
      "RX OWNER loaded — icon ready (drag to move). Tap icon → password, then 1 tap: scan | 3 taps: settings | delay:",
      settings.delaySec + "s",
      "| after-trade scan:",
      settings.afterTradeScanSec === 0 ? "manual" : settings.afterTradeScanSec + "s",
      "| dir:",
      settings.direction
    );
  }

  initRX_OWNER();
})();
