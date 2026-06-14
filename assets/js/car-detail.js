function initCarGallery() {
  const gallery = document.querySelector('.car-detail-gallery');
  if (!gallery) return;

  const viewport = gallery.querySelector('.car-detail-gallery-viewport');
  const track = gallery.querySelector('.car-detail-gallery-track');
  const prevBtn = gallery.querySelector('.car-detail-gallery-btn--prev');
  const nextBtn = gallery.querySelector('.car-detail-gallery-btn--next');
  if (!viewport || !track || !prevBtn || !nextBtn) return;

  const originals = [...track.querySelectorAll('.car-detail-gallery-slide')];
  if (originals.length < 2) return;

  const firstClone = originals[0].cloneNode(true);
  const lastClone = originals[originals.length - 1].cloneNode(true);
  firstClone.classList.add('is-clone');
  lastClone.classList.add('is-clone');
  firstClone.classList.remove('is-active');
  lastClone.classList.remove('is-active');
  firstClone.setAttribute('aria-hidden', 'true');
  lastClone.setAttribute('aria-hidden', 'true');

  track.insertBefore(lastClone, originals[0]);
  track.appendChild(firstClone);

  const slides = [...track.querySelectorAll('.car-detail-gallery-slide')];
  let activeOriginal = originals.findIndex((slide) => slide.classList.contains('is-active'));
  if (activeOriginal < 0) activeOriginal = 0;

  let trackIndex = activeOriginal + 1;
  let isAnimating = false;

  const getMetrics = () => {
    const isMobile = window.innerWidth <= 576;
    const gap = isMobile ? 0 : 20;
    const slideWidth = slides[0].getBoundingClientRect().width;
    return {
      gap,
      slideWidth,
      viewportWidth: viewport.getBoundingClientRect().width,
    };
  };

  const setTransform = (idx, animate = true) => {
    const { gap, slideWidth, viewportWidth } = getMetrics();
    const offset = (viewportWidth - slideWidth) / 2 - idx * (slideWidth + gap);
    track.style.transition = animate ? 'transform 0.45s ease' : 'none';
    track.style.transform = `translateX(${offset}px)`;
  };

  const dotsRoot = gallery.querySelector('.car-detail-gallery-dots');
  const originalCount = originals.length;

  const getOriginalIndex = () => {
    if (trackIndex === 0) return originalCount - 1;
    if (trackIndex === slides.length - 1) return 0;
    return trackIndex - 1;
  };

  const updateDots = () => {
    if (!dotsRoot) return;
    const active = getOriginalIndex();
    dotsRoot.querySelectorAll('.car-detail-gallery-dot').forEach((dot, i) => {
      dot.classList.toggle('is-active', i === active);
      dot.setAttribute('aria-selected', i === active ? 'true' : 'false');
    });
  };

  const updateActive = () => {
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === trackIndex);
    });
    updateDots();
  };

  if (dotsRoot) {
    dotsRoot.innerHTML = '';
    originals.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'car-detail-gallery-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Фото ${i + 1}`);
      dot.addEventListener('click', () => {
        if (isAnimating) return;
        isAnimating = true;
        goTo(i + 1, true);
      });
      dotsRoot.appendChild(dot);
    });
  }

  const goTo = (idx, animate = true) => {
    trackIndex = idx;
    updateActive();
    setTransform(trackIndex, animate);
  };

  const resetLoopPosition = () => {
    if (trackIndex === 0) {
      trackIndex = slides.length - 2;
      updateActive();
      setTransform(trackIndex, false);
      return;
    }

    if (trackIndex === slides.length - 1) {
      trackIndex = 1;
      updateActive();
      setTransform(trackIndex, false);
    }
  };

  track.addEventListener('transitionend', (event) => {
    if (event.target !== track || event.propertyName !== 'transform') return;
    isAnimating = false;
    resetLoopPosition();
  });

  const move = (direction) => {
    if (isAnimating) return;
    isAnimating = true;
    goTo(trackIndex + direction, true);
  };

  prevBtn.addEventListener('click', () => move(-1));
  nextBtn.addEventListener('click', () => move(1));

  const refresh = () => goTo(trackIndex, false);

  window.addEventListener('resize', refresh);
  track.querySelectorAll('img').forEach((img) => {
    if (img.complete) return;
    img.addEventListener('load', refresh, { once: true });
  });

  refresh();
}

function initCarReviewsSlider() {
  const section = document.querySelector('.car-detail-reviews');
  if (!section) return;

  const track = section.querySelector('.car-detail-reviews-track');
  const cards = [...section.querySelectorAll('.car-detail-review-card')];
  const prevBtn = section.querySelector('.car-detail-reviews-btn--prev');
  const nextBtn = section.querySelector('.car-detail-reviews-btn--next');
  const viewport = section.querySelector('.car-detail-reviews-viewport');
  if (!track || cards.length === 0 || !prevBtn || !nextBtn || !viewport) return;

  let index = 0;

  const getVisibleCount = () => {
    if (window.innerWidth <= 576) return 1;
    if (window.innerWidth <= 1100) return 2;
    return 3;
  };

  const updateReviews = () => {
    const visibleCount = getVisibleCount();
    const maxIndex = Math.max(0, cards.length - visibleCount);
    index = Math.min(index, maxIndex);

    const gap = 20;
    const viewportWidth = viewport.offsetWidth;
    const cardWidth = (viewportWidth - gap * (visibleCount - 1)) / visibleCount;

    cards.forEach((card) => {
      card.style.flexBasis = `${cardWidth}px`;
    });

    track.style.transform = `translateX(${-index * (cardWidth + gap)}px)`;

    prevBtn.disabled = index === 0;
    nextBtn.disabled = index >= maxIndex;
  };

  prevBtn.addEventListener('click', () => {
    index = Math.max(0, index - 1);
    updateReviews();
  });

  nextBtn.addEventListener('click', () => {
    const maxIndex = Math.max(0, cards.length - getVisibleCount());
    index = Math.min(maxIndex, index + 1);
    updateReviews();
  });

  window.addEventListener('resize', updateReviews);
  updateReviews();
}

function initCarBookingForm() {
  const form = document.getElementById('carBookingForm');
  const submitBtn = document.getElementById('carBookingSubmit');
  if (!form || !submitBtn) return;

  const fields = form.querySelectorAll('input');

  const checkFilled = () => {
    submitBtn.disabled = ![...fields].every((field) => field.value.trim() !== '');
  };

  fields.forEach((field) => field.addEventListener('input', checkFilled));
  form.addEventListener('submit', (e) => e.preventDefault());
}

document.addEventListener('DOMContentLoaded', () => {
  initCarGallery();
  initCarReviewsSlider();
  initCarBookingForm();
});
