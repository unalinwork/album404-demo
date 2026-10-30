/* ================= 設定區 ================= */
const CONFIG = {
  // 發片時間（台北時間）。倒數秒數 = 這個時間 - 現在，歸零後停在 0
  RELEASE_AT: "2026-11-14T00:00:00+08:00",
  GREETING: "你好",
  ERROR_CODE: "404",
  ERROR_TEXT: "not found"
};
/* ========================================== */

const $ = (id) => document.getElementById(id);
const enter = $("screen-enter"), result = $("screen-result");
const form = $("gate"), input = $("code");
const outCode = $("out-code"), countEl = $("count");
let timer = null;

// 背景環：有 assets/ring.png 就用它
(function () {
  const ring = $("ring"), img = ring.querySelector("img");
  const ok = () => ring.classList.add("has-img");
  if (img.complete && img.naturalWidth) ok(); else img.addEventListener("load", ok);
})();

$("hello").textContent = CONFIG.GREETING;
const err = document.querySelector(".err");
err.textContent = CONFIG.ERROR_CODE;
err.dataset.text = CONFIG.ERROR_CODE;
document.querySelector(".nf").textContent = CONFIG.ERROR_TEXT;

function secondsLeft() {
  const t = new Date(CONFIG.RELEASE_AT).getTime() - Date.now();
  return Math.max(0, Math.floor(t / 1000));
}

function tick() {
  const s = secondsLeft();
  countEl.textContent = String(s);
  if (s <= 0) clearInterval(timer);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const code = input.value.trim();
  if (!code) {
    input.classList.remove("shake"); void input.offsetWidth; input.classList.add("shake");
    input.focus();
    return;
  }
  outCode.textContent = code;   // 粉絲自己編的代碼，原樣顯示（例如 5100）
  enter.classList.remove("active");
  result.classList.add("active");
  tick();
  timer = setInterval(tick, 250);
});

input.focus();
