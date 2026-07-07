(() => {
  'use strict';

  const STORAGE_PREFIX = 'wakabacup-staff:';
  const EVENT_DATE = new Date('2026-06-20T09:00:00+09:00');

  /* ========== Countdown ========== */
  const countdownEl = document.getElementById('staff-countdown');
  if (countdownEl) {
    const updateCountdown = () => {
      const now = new Date();
      const diff = EVENT_DATE - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (diff < 0) {
        countdownEl.textContent = 'EVENT DAY / 大会終了';
      } else if (days === 0) {
        countdownEl.textContent = 'TODAY — 大会当日！';
      } else {
        countdownEl.textContent = `D-${days} （${EVENT_DATE.getFullYear()}.${String(EVENT_DATE.getMonth()+1).padStart(2,'0')}.${String(EVENT_DATE.getDate()).padStart(2,'0')}まで）`;
      }
    };
    updateCountdown();
    setInterval(updateCountdown, 60_000);
  }

  /* ========== Saved indicator ========== */
  const savedEl = document.getElementById('staff-saved');
  let savedTimer = null;
  const flashSaved = (msg = '保存しました') => {
    if (!savedEl) return;
    savedEl.textContent = msg;
    savedEl.classList.add('is-flash');
    clearTimeout(savedTimer);
    savedTimer = setTimeout(() => savedEl.classList.remove('is-flash'), 1200);
  };

  const safeGet = (key) => {
    try { return localStorage.getItem(STORAGE_PREFIX + key); }
    catch { return null; }
  };
  const safeSet = (key, value) => {
    try { localStorage.setItem(STORAGE_PREFIX + key, value); return true; }
    catch { return false; }
  };
  const safeRemove = (key) => {
    try { localStorage.removeItem(STORAGE_PREFIX + key); return true; }
    catch { return false; }
  };

  /* ========== Checkboxes ========== */
  const checkboxes = document.querySelectorAll('input[type="checkbox"][data-check]');
  checkboxes.forEach(cb => {
    const key = `check:${cb.dataset.check}`;
    if (safeGet(key) === '1') cb.checked = true;
    cb.addEventListener('change', () => {
      if (cb.checked) safeSet(key, '1');
      else safeRemove(key);
      flashSaved();
    });
  });

  const resetChecksBtn = document.querySelector('[data-reset-checks]');
  if (resetChecksBtn) {
    resetChecksBtn.addEventListener('click', () => {
      if (!confirm('すべてのチェックを外します。よろしいですか？')) return;
      checkboxes.forEach(cb => {
        cb.checked = false;
        safeRemove(`check:${cb.dataset.check}`);
      });
      flashSaved('リセットしました');
    });
  }

  /* ========== Memo (textarea) ========== */
  const memoEl = document.getElementById('staff-memo');
  if (memoEl) {
    const memoKey = `memo:${memoEl.dataset.memo || 'default'}`;
    const saved = safeGet(memoKey);
    if (saved !== null) memoEl.value = saved;

    let memoTimer = null;
    memoEl.addEventListener('input', () => {
      clearTimeout(memoTimer);
      memoTimer = setTimeout(() => {
        safeSet(memoKey, memoEl.value);
        flashSaved();
      }, 400);
    });

    const resetMemoBtn = document.querySelector('[data-reset-memo]');
    if (resetMemoBtn) {
      resetMemoBtn.addEventListener('click', () => {
        if (!confirm('メモの内容をすべて消去します。よろしいですか？')) return;
        memoEl.value = '';
        safeRemove(memoKey);
        flashSaved('クリアしました');
      });
    }
  }
})();
