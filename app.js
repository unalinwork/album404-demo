(() => {
  'use strict';
  const config = window.ALBUM_CONFIG || {};
  const releaseTimestamp = Date.parse(config.releaseAt);
  const target = Number.isFinite(releaseTimestamp) ? releaseTimestamp : Date.now() + 15 * 86400 * 1000;
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
    timer.textContent = String(remaining);
    timer.setAttribute('aria-label', `距離發行還有 ${remaining} 秒`);
    const label = document.querySelector('.timer-caption');
    if (remaining === 0) {
      label.textContent = config.finishedLabel || 'RELEASED';
      document.body.classList.add('has-released');
    } else {
      label.textContent = 'SECONDS UNTIL RELEASE';
      document.body.classList.remove('has-released');
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
    code.textContent = '#' + value;
    setScreen(true);
    tick();
    if (tickId !== null) clearInterval(tickId);
    tickId = setInterval(tick, 1000);
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
    if (!value) return invalid('請先輸入四位數代碼');
    if (value !== (config.demoCode || '1030')) return invalid('代碼錯誤，請再試一次');
    error.textContent = '';
    input.setAttribute('aria-invalid', 'false');
    busy = true;
    input.blur();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    overlay.setAttribute('aria-hidden', 'false');
    phoneScreen.classList.add('authenticating');
    // 動畫僅為視覺效果。這是概念展示，非安全驗證。
    transitionId = setTimeout(() => { transitionId = null; startCountdown(value); }, 1100);
  });
  reset.addEventListener('click', showEntry);
  input.addEventListener('input', () => {
    error.textContent = '';
    input.setAttribute('aria-invalid', 'false');
    phoneScreen.classList.remove('input-shake');
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !countdown.classList.contains('is-hidden')) tick();
  });
  tick();
})();
