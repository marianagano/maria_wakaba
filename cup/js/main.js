(() => {
  'use strict';

  /* ========== Header scroll effect ========== */
  const header = document.getElementById('header');
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ========== Mobile menu ========== */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });
    document.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
      });
    });
  }

  /* ========== Scroll-triggered fade-up ========== */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  /* ========== "行きたい" Going button + global counter ==========
     - UI state (Going! display) persists per browser via localStorage
     - Global tally uses abacus.jasoncameron.dev (free public counter)
     - Each browser increments the counter once max (debounced via localStorage flag)
  */
  const STORAGE_KEY = 'wakabacup-going';
  const COUNTED_KEY = 'wakabacup-counted';
  const COUNTER_API = 'https://abacus.jasoncameron.dev';
  const COUNTER_NS = 'wakabacup-2026';
  const COUNTER_KEY = 'going';
  const COUNT_BASELINE = 120; // 表示の初期値 (API実カウント + baseline = 表示値)

  const goingBtn = document.getElementById('going-btn');
  const goingHelper = document.getElementById('going-helper');
  const goingCount = document.getElementById('going-count');
  const goingCountNum = document.getElementById('going-count-num');

  if (goingBtn && goingHelper) {
    const labelEl = goingBtn.querySelector('.going-label');
    const defaultLabel = '行きたい！';
    const goingLabel = 'Going! 当日会場で会いましょう';
    const defaultHelper = goingHelper.textContent;
    const goingHelperText = 'ありがとうございます！下口選手と運営チームより、当日会場でお会いできるのを楽しみにしています。';

    const setState = (isGoing) => {
      if (isGoing) {
        goingBtn.classList.add('is-going');
        goingHelper.classList.add('is-going');
        labelEl.textContent = goingLabel;
        goingHelper.textContent = goingHelperText;
        goingBtn.setAttribute('aria-pressed', 'true');
        if (goingCount) goingCount.classList.add('is-active');
      } else {
        goingBtn.classList.remove('is-going');
        goingHelper.classList.remove('is-going');
        labelEl.textContent = defaultLabel;
        goingHelper.textContent = defaultHelper;
        goingBtn.setAttribute('aria-pressed', 'false');
        if (goingCount) goingCount.classList.remove('is-active');
      }
    };

    const renderCount = (n, { bump = false } = {}) => {
      if (!goingCountNum) return;
      const real = (typeof n === 'number') ? n : 0;
      const display = real + COUNT_BASELINE;
      goingCountNum.textContent = display.toLocaleString('ja-JP');
      if (bump && goingCount) {
        goingCount.classList.add('bumping');
        setTimeout(() => goingCount.classList.remove('bumping'), 400);
      }
    };

    const fetchCount = async () => {
      try {
        const res = await fetch(`${COUNTER_API}/get/${COUNTER_NS}/${COUNTER_KEY}`);
        if (!res.ok) return null;
        const json = await res.json();
        return typeof json.value === 'number' ? json.value : null;
      } catch (_) { return null; }
    };

    const incrementCount = async () => {
      try {
        const res = await fetch(`${COUNTER_API}/hit/${COUNTER_NS}/${COUNTER_KEY}`);
        if (!res.ok) return null;
        const json = await res.json();
        return typeof json.value === 'number' ? json.value : null;
      } catch (_) { return null; }
    };

    /* --- initial state --- */
    let isGoing = false;
    let hasCounted = false;
    try {
      isGoing = localStorage.getItem(STORAGE_KEY) === 'true';
      hasCounted = localStorage.getItem(COUNTED_KEY) === 'true';
    } catch (_) { /* localStorage unavailable */ }
    setState(isGoing);

    /* --- initial render with baseline, then fetch real count --- */
    renderCount(null);
    if (goingCount) goingCount.classList.add('is-loading');
    fetchCount().then(n => {
      if (goingCount) goingCount.classList.remove('is-loading');
      renderCount(n);
    });

    /* --- click handler --- */
    goingBtn.addEventListener('click', async () => {
      isGoing = !isGoing;
      try {
        if (isGoing) localStorage.setItem(STORAGE_KEY, 'true');
        else localStorage.removeItem(STORAGE_KEY);
      } catch (_) { /* ignore */ }
      setState(isGoing);

      // Only increment global tally on first ever activation per browser.
      if (isGoing && !hasCounted) {
        hasCounted = true;
        try { localStorage.setItem(COUNTED_KEY, 'true'); } catch (_) { /* ignore */ }
        const n = await incrementCount();
        if (n !== null) renderCount(n, { bump: true });
      }
    });
  }

  /* ========== Placeholder buttons (data-todo) ========== */
  document.querySelectorAll('[data-todo]').forEach(el => {
    el.addEventListener('click', (e) => {
      if (el.getAttribute('href') === '#' || !el.getAttribute('href')) {
        e.preventDefault();
        const msg = el.getAttribute('data-todo');
        alert(`【未設定】${msg}\n\nindex.html の該当ボタンの href を実際のURLに差し替えてください。`);
      }
    });
  });
})();
