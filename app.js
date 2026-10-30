(() => {
  'use strict';
  const config = window.ALBUM_CONFIG || {};
  const releaseTimestamp = Date.parse(config.releaseAt);
  // Everyone shares the SAME release time; no per-user countdown or password checking.
  // Invalid configuration must not start a different private countdown for every visitor.
  const target = Number.isFinite(releaseTimestamp) ? releaseTimestamp : Date.now();
  const form = document.getElementById('code-form');
  const input = document.getElementById('code-input');
  const error = document.getElementById('code-error');
  const entry = document.getElementById('entry-screen');
  const countdown = document.getElementById('countdown-screen');
  const code = document.getElementById('display-code');
  const timer = document.getElementById('timer-number');
  const reset = document.getElementById('restart-button');
  const phoneScreen = document.getElementById('phone-screen');
  const overlay = document.getElementById('access-overlay');
  const annotationEntry = document.getElementById('annotation-entry');
  const annotationTimer = document.getElementById('annotation-timer');
  let tickId = null;
  let transitionId = null;
  let busy = false;

  function tick() {
    const remaining = Math.max(0, Math.ceil((target - Date.now()) / 1000));
    // 保持純數字總秒數，不顯示千分位逗號（例如 1296000）。
    timer.textContent = String(remaining);
    timer.setAttribute('aria-label', `距離發行還有 ${remaining} 秒`);
    // Stop at zero. Never switch to a third page, announcement, or unlock state.
    if (remaining === 0 && tickId !== null) {
      clearInterval(tickId);
      tickId = null;
    }
  }

  function setScreen(showTimer) {
    entry.classList.toggle('is-hidden', showTimer);
    entry.setAttribute('aria-hidden', String(showTimer));
    countdown.classList.toggle('is-hidden', !showTimer);
    countdown.setAttribute('aria-hidden', String(!showTimer));
    annotationEntry.classList.toggle('is-hidden', showTimer);
    annotationTimer.classList.toggle('is-hidden', !showTimer);
    phoneScreen.classList.toggle('showing-countdown', showTimer);
  }

  function startCountdown(value) {
    code.textContent = value;
    setScreen(true);
    if (tickId !== null) clearInterval(tickId);
    tickId = null;
    tick();
    if (target > Date.now()) tickId = setInterval(tick, 1000);
    // 軟體鍵盤關閉後才聚焦，避免移動裝置畫面突然跳動。
    input.blur();
    phoneScreen.classList.remove('authenticating');
    overlay.setAttribute('aria-hidden', 'true');
    busy = false;
  }

  function showEntry() {
    if (transitionId !== null) { clearTimeout(transitionId); transitionId = null; }
    if (tickId !== null) { clearInterval(tickId); tickId = null; }
    phoneScreen.classList.remove('authenticating', 'input-shake');
    overlay.setAttribute('aria-hidden', 'true');
    setScreen(false);
    error.textContent = '';
    input.setAttribute('aria-invalid', 'false');
    input.value = '';
    busy = false;
    input.focus({ preventScroll: true });
  }

  function invalid(message) {
    error.textContent = message;
    phoneScreen.classList.remove('input-shake');
    // Reflow to restart animation after repeated wrong-code attempts.
    void phoneScreen.offsetWidth;
    phoneScreen.classList.add('input-shake');
    input.setAttribute('aria-invalid', 'true');
    input.focus();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (busy) return;
    const value = input.value.trim();
    if (!/^[0-9]{1,12}$/.test(value)) return invalid('請輸入 1–12 位數字編號');
    error.textContent = '';
    input.setAttribute('aria-invalid', 'false');
    busy = true;
    input.blur();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    overlay.setAttribute('aria-hidden', 'false');
    phoneScreen.classList.add('authenticating');
    // 純視覺轉場效果，不提供會員登入或密碼驗證。
    transitionId = setTimeout(() => { transitionId = null; startCountdown(value); }, 1100);
  });
  reset.addEventListener('click', showEntry);
  input.addEventListener('input', () => {
    // Use a string rather than Number(), so numbers like 0012 keep their leading zeroes.
    const digits = input.value.replace(/[^0-9]/g, '').slice(0, 12);
    if (input.value !== digits) input.value = digits;
    error.textContent = '';
    input.setAttribute('aria-invalid', 'false');
    phoneScreen.classList.remove('input-shake');
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !countdown.classList.contains('is-hidden')) tick();
  });
  tick();
})();
