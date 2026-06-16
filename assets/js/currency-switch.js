/* ── Currency switcher (mobile header, visual-only) ────
   Cycles BYN → USD → RUB → BYN on tap.
   No price conversion — backend will handle conversion later.
   ──────────────────────────────────────────────────────── */

(function () {
  const CURRENCIES = ['BYN', 'USD', 'RUB'];

  function initCurrencyBtn(btn) {
    btn.addEventListener('click', function () {
      const current = btn.dataset.currency || 'BYN';
      const idx = CURRENCIES.indexOf(current);
      const next = CURRENCIES[(idx + 1) % CURRENCIES.length];
      btn.dataset.currency = next;
      btn.textContent = next;
    });
  }

  document.querySelectorAll('.header-currency-btn').forEach(initCurrencyBtn);
})();
