// ── Glass liquid SVG filter — injected once per page ──
function initGlassFilter() {
  if (document.getElementById('glass-liquid-filter')) return;
  if (window.matchMedia('(max-width: 576px)').matches) return;

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
  if (window.matchMedia('(max-width: 576px)').matches) return;

  const heroBgImage = document.querySelector('.hero-bg-image:not(.hero-bg-image--mobile)');
  const heroLight   = document.querySelector('.hero-light');
  const heroStop    = document.querySelector('.hero-stop');
  if (!heroBgImage && !heroLight && !heroStop) return;
  if (heroBgImage) heroBgImage.style.display = 'block';
  if (heroLight)   heroLight.style.display   = 'block';
  if (heroStop)    heroStop.style.display    = 'block';
}

// ── Mobile menu ───────────────────────────────────────
function initMobileMenu() {
  const menuBtn = document.querySelector('.header-mobile-menu');
  const menu    = document.getElementById('mobile-menu');
  if (!menuBtn || !menu) return;

  const openMenu = () => {
    document.body.classList.add('mobile-menu-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
  };

  const closeMenu = () => {
    document.body.classList.remove('mobile-menu-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
  };

  menuBtn.addEventListener('click', () => {
    if (document.body.classList.contains('mobile-menu-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  menu.querySelectorAll('.mobile-menu-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('mobile-menu-open')) {
      closeMenu();
    }
  });
}

// ── Accordion cards ───────────────────────────────────
function initAccordionGroup(cards) {
  if (!cards.length) return;

  const isMobile = () => window.matchMedia('(max-width: 576px)').matches;

  cards.forEach((card) => {
    const trigger = card.querySelector('.accordion-card__trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      if (!isMobile()) return;

      const isOpen = card.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });
}

function initAccordionCards() {
  initAccordionGroup(document.querySelectorAll('.events-list .accordion-card'));
  initAccordionGroup(document.querySelectorAll('.footer-accordion'));
}

// ── Modal utility ─────────────────────────────────────
function initModal(overlayId, openBtnId, closeBtnId, formId, submitBtnId, preventDefault = false) {
  const overlay   = document.getElementById(overlayId);
  if (!overlay) return;
  const openBtn   = openBtnId ? document.getElementById(openBtnId) : null;
  const closeBtn  = document.getElementById(closeBtnId);
  const form      = document.getElementById(formId);
  if (!closeBtn || !form) return;
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

  if (openBtn) openBtn.addEventListener('click', openModal);
  document.querySelectorAll(`[data-open-modal="${overlayId}"]`).forEach((btn) => {
    btn.addEventListener('click', openModal);
  });
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  fields.forEach(f => f.addEventListener('input', checkFilled));
  form.addEventListener('submit', (e) => { e.preventDefault(); closeModal(); });
}

function initMobileAccordion() {
  const cards = document.querySelectorAll(
    '.terms-content-section .terms-wide-card, .partner-faq-list .terms-wide-card, .legal-page .terms-wide-card'
  );
  if (!cards.length) return;

  cards.forEach((card) => {
    const title = card.querySelector('.terms-card-title');
    if (!title) return;

    title.addEventListener('click', () => {
      if (!window.matchMedia('(max-width: 576px)').matches) return;
      card.classList.toggle('is-open');
    });
  });
}

function initInlineForm(formId, submitBtnId) {
  const form = document.getElementById(formId);
  if (!form) return;
  const submitBtn = document.getElementById(submitBtnId);
  const fields = form.querySelectorAll('input, textarea');

  const checkFilled = () => {
    if (submitBtn) {
      submitBtn.disabled = ![...fields].every(f => f.value.trim() !== '');
    }
  };

  fields.forEach(f => f.addEventListener('input', checkFilled));
  form.addEventListener('submit', (e) => { e.preventDefault(); });
}

// ── Init ──────────────────────────────────────────────
initGlassFilter();

document.addEventListener('DOMContentLoaded', () => {
  initHeroImages();
  initMobileMenu();
  initAccordionCards();
  initModal('certModalOverlay',   'certOrderBtn',       'certModalClose',          'certModalForm',          'certModalSubmit');
  initModal('meroModalOverlay',   'meroOrderBtn',       'meroModalClose',          'meroModalForm',          'meroModalSubmit');
  initModal('partnerIncomeModal', 'partnerIncomeBtn',   'partnerIncomeModalClose', 'partnerIncomeModalForm', 'partnerIncomeModalSubmit', true);
  initModal('reviewModalOverlay', 'reviewModalOpenBtn', 'reviewModalClose',        'reviewModalForm',        'reviewModalSubmit');
  initInlineForm('legalContactForm', 'legalContactSubmit');
  initMobileAccordion();
});
