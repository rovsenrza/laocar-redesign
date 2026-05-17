// ── Glass liquid SVG filter — injected once per page ──
function initGlassFilter() {
  if (document.getElementById('glass-liquid-filter')) return;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.style.position = 'absolute';
  svg.style.pointerEvents = 'none';

  svg.innerHTML = `
    <defs>
      <filter id="glass-liquid-filter" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="8" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="G" result="displaced" />
        <feGaussianBlur in="displaced" stdDeviation="0.25" result="softened" />
        <feComposite in="softened" in2="SourceGraphic" operator="atop" />
      </filter>
    </defs>
  `;

  document.body.prepend(svg);
  document.documentElement.classList.add('has-liquid-glass-filter');
}

// ── Hero images — revealed when banner animation starts ──
function initHeroImages() {
  const heroBgImage = document.querySelector('.hero-bg-image');
  const heroLight   = document.querySelector('.hero-light');
  const heroStop    = document.querySelector('.hero-stop');
  if (!heroBgImage && !heroLight && !heroStop) return;
  if (heroBgImage) heroBgImage.style.display = 'block';
  if (heroLight)   heroLight.style.display   = 'block';
  if (heroStop)    heroStop.style.display    = 'block';
}

// ── Modal utility ─────────────────────────────────────
function initModal(overlayId, openBtnId, closeBtnId, formId, submitBtnId, preventDefault = false) {
  const overlay   = document.getElementById(overlayId);
  if (!overlay) return;
  const openBtn   = document.getElementById(openBtnId);
  const closeBtn  = document.getElementById(closeBtnId);
  const form      = document.getElementById(formId);
  if (!openBtn || !closeBtn || !form) return;
  const submitBtn = document.getElementById(submitBtnId);
  const fields    = form.querySelectorAll('input, textarea');

  const openModal = (e) => {
    if (preventDefault && e) e.preventDefault();
    overlay.classList.add('cert-modal-overlay--visible');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    overlay.classList.remove('cert-modal-overlay--visible');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const checkFilled = () => {
    if (submitBtn) {
      submitBtn.disabled = ![...fields].every(f => f.value.trim() !== '');
    }
  };

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  fields.forEach(f => f.addEventListener('input', checkFilled));
  form.addEventListener('submit', (e) => { e.preventDefault(); closeModal(); });
}

// ── Init ──────────────────────────────────────────────
initGlassFilter();

document.addEventListener('DOMContentLoaded', () => {
  initHeroImages();
  initModal('certModalOverlay',   'certOrderBtn',       'certModalClose',          'certModalForm',          'certModalSubmit');
  initModal('meroModalOverlay',   'meroOrderBtn',       'meroModalClose',          'meroModalForm',          'meroModalSubmit');
  initModal('partnerIncomeModal', 'partnerIncomeBtn',   'partnerIncomeModalClose', 'partnerIncomeModalForm', 'partnerIncomeModalSubmit', true);
  initModal('reviewModalOverlay', 'reviewModalOpenBtn', 'reviewModalClose',        'reviewModalForm',        'reviewModalSubmit');
});
