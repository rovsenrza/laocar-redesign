const AUTOPARK_CARS = [
  { name: 'Lamborghini Urus', price: '890 $ / сутки', main: '/assets/img/prod-1.webp', second: '/assets/img/car-1-second.webp' },
  { name: 'Rolls-Royce Cullinan Black Badge', price: '1350 $ / сутки', main: '/assets/img/prod-2.webp', second: '/assets/img/car-2-second.webp' },
  { name: 'Mercedes G-class 63 AMG', price: '850 $ / сутки', main: '/assets/img/prod-3.webp', second: '/assets/img/car-3-second.webp' },
  { name: 'BMW X5 3.0d', price: '290 $ / сутки', main: '/assets/img/prod-4.webp', second: '/assets/img/car-7-second.webp' },
  { name: 'Zeekr 9X Max', price: '700 $ / сутки', main: '/assets/img/prod-3.webp', second: '/assets/img/car-6-second.webp' },
  { name: 'Porsche Cayenne Turbo GT', price: '840 $ / сутки', main: '/assets/img/prod-4.webp', second: '/assets/img/car-5-second.webp' },
  { name: 'BMW X5 3.0d', price: '300 $ / сутки', main: '/assets/img/prod-4.webp', second: '/assets/img/car-4-second.webp' },
  { name: 'Mercedes G-class 63 AMG', price: '890 $ / сутки', main: '/assets/img/prod-3.webp', second: '/assets/img/car-8-second.webp' },
];

const GRID_PATTERN = [0, 1, 2, 3, 4, 5, 0, 3, 0, 1, 2, 7, 4, 3, 3, 0, 0, 1, 2, 4, 4, 5, 3, 3];

function renderAutoparkGrid() {
  const grid = document.getElementById('autoparkCategoryGrid');
  if (!grid) return;

  grid.innerHTML = GRID_PATTERN.map((index) => {
    const car = AUTOPARK_CARS[index];
    return `
      <a href="car-detail.html" class="blog-detail-car-card">
        <div class="car-img-wrap">
          <img src="${car.main}" alt="${car.name}" class="car-img-main" loading="lazy" />
          <img src="${car.second}" alt="${car.name}" class="car-img-second" loading="lazy" />
        </div>
        <div class="blog-detail-car-body">
          <p class="blog-detail-car-name">${car.name}</p>
          <p class="blog-detail-car-price">${car.price}</p>
        </div>
      </a>
    `;
  }).join('');
}

function initAutoparkSearch() {
  const form = document.getElementById('autoparkSearchForm');
  if (!form) return;

  const input = form.querySelector('.autopark-search-input');
  const clearBtn = form.querySelector('.autopark-search-clear');
  if (!input) return;

  const updateState = () => {
    form.classList.toggle('has-value', input.value.trim().length > 0);
  };

  input.addEventListener('focus', () => {
    form.classList.add('is-focused');
  });

  input.addEventListener('blur', () => {
    form.classList.remove('is-focused');
  });

  input.addEventListener('input', updateState);

  clearBtn?.addEventListener('mousedown', (e) => {
    e.preventDefault();
  });

  clearBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    input.value = '';
    updateState();
    input.focus();
  });

  form.addEventListener('submit', (e) => e.preventDefault());

  updateState();
}

const SORT_OPTIONS = {
  default: 'По умолчанию',
  new: 'Сначала новые',
  'price-asc': 'Сначала низкие цены',
  'price-desc': 'Сначала высокие цены',
};

function initAutoparkSort() {
  const sortRoot = document.getElementById('autoparkSort');
  const control = document.getElementById('autoparkSortControl');
  const btn = document.getElementById('autoparkSortBtn');
  const menu = document.getElementById('autoparkSortMenu');
  const clearBtn = document.getElementById('autoparkSortClear');
  const chipText = sortRoot?.querySelector('.autopark-sort-chip-text');
  if (!sortRoot || !control || !btn || !menu || !chipText) return;

  let selectedSort = 'default';

  const setMenuOpen = (isOpen) => {
    menu.classList.toggle('is-open', isOpen);
    control.classList.toggle('is-open', isOpen);
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  };

  const updateSelectionUI = () => {
    menu.querySelectorAll('.autopark-sort-option').forEach((option) => {
      option.classList.toggle('is-active', option.dataset.sort === selectedSort);
    });

    const hasSelection = selectedSort !== 'default';
    control.classList.toggle('has-selection', hasSelection);
    clearBtn.hidden = !hasSelection;
    chipText.textContent = hasSelection ? SORT_OPTIONS[selectedSort] : '';
  };

  const selectSort = (sortKey) => {
    selectedSort = sortKey;
    updateSelectionUI();
    setMenuOpen(false);
  };

  btn.addEventListener('click', () => {
    setMenuOpen(!menu.classList.contains('is-open'));
  });

  menu.querySelectorAll('.autopark-sort-option').forEach((option) => {
    option.addEventListener('click', () => {
      selectSort(option.dataset.sort || 'default');
    });
  });

  clearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    selectSort('default');
  });

  document.addEventListener('click', (e) => {
    if (!sortRoot.contains(e.target)) {
      setMenuOpen(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setMenuOpen(false);
    }
  });

  updateSelectionUI();
}

const FILTER_SECTION_LABELS = {
  class: 'Класс',
  brand: 'Марка',
  engine: 'Тип двигателя',
  drive: 'Привод',
  power: 'Мощность',
  price: 'Цена',
  availability: 'Доступность',
};

function initAutoparkFilter() {
  const filterRoot = document.getElementById('autoparkFilter');
  const control = document.getElementById('autoparkFilterControl');
  const btn = document.getElementById('autoparkFilterBtn');
  const panel = document.getElementById('autoparkFilterPanel');
  const panelClose = document.getElementById('autoparkFilterPanelClose');
  const chipsWrap = document.getElementById('autoparkFilterChips');
  const barClear = document.getElementById('autoparkFilterBarClear');
  const findBtn = document.getElementById('autoparkFilterFind');
  const resetBtn = document.getElementById('autoparkFilterReset');

  if (!filterRoot || !control || !btn || !panel || !chipsWrap) return;

  const singleSelectGroups = new Set(['class', 'engine', 'drive', 'pricePeriod', 'availability']);
  let appliedSections = new Set();

  const setPanelOpen = (isOpen) => {
    panel.classList.toggle('is-open', isOpen);
    control.classList.toggle('is-open', isOpen);
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  };

  const getRangeState = (rangeEl) => {
    const min = Number(rangeEl.dataset.min);
    const max = Number(rangeEl.dataset.max);
    const defaultMin = Number(rangeEl.dataset.defaultMin);
    const defaultMax = Number(rangeEl.dataset.defaultMax);
    const from = Number(rangeEl.querySelector('.autopark-filter-range-from').value);
    const to = Number(rangeEl.querySelector('.autopark-filter-range-to').value);
    return { min, max, defaultMin, defaultMax, from, to };
  };

  const isRangeChanged = (rangeEl) => {
    const { defaultMin, defaultMax, from, to } = getRangeState(rangeEl);
    return from !== defaultMin || to !== defaultMax;
  };

  const getActiveSections = () => {
    const active = new Set();

    panel.querySelectorAll('.autopark-filter-capsule.is-selected').forEach((capsule) => {
      const group = capsule.dataset.group;
      if (group === 'class' && capsule.dataset.value === 'all') return;
      if (group === 'pricePeriod') return;

      const section = capsule.closest('[data-filter-section]')?.dataset.filterSection;
      if (section) active.add(section);
    });

    panel.querySelectorAll('.autopark-filter-range').forEach((rangeEl) => {
      if (isRangeChanged(rangeEl)) {
        const section = rangeEl.closest('[data-filter-section]')?.dataset.filterSection;
        if (section) active.add(section);
      }
    });

    const pricePeriodSelected = panel.querySelector('[data-group="pricePeriod"].is-selected');
    if (pricePeriodSelected && pricePeriodSelected.dataset.value !== 'day') {
      active.add('price');
    }

    return active;
  };

  const updateSliderFill = (rangeEl) => {
    const { min, max, from, to } = getRangeState(rangeEl);
    const fill = rangeEl.querySelector('.autopark-filter-slider-fill');
    const safeFrom = Math.min(from, to);
    const safeTo = Math.max(from, to);
    const left = ((safeFrom - min) / (max - min)) * 100;
    const width = ((safeTo - safeFrom) / (max - min)) * 100;
    fill.style.left = `${left}%`;
    fill.style.width = `${width}%`;
  };

  const syncRange = (rangeEl, source) => {
    const minInput = rangeEl.querySelector('.autopark-filter-slider-min');
    const maxInput = rangeEl.querySelector('.autopark-filter-slider-max');
    const fromInput = rangeEl.querySelector('.autopark-filter-range-from');
    const toInput = rangeEl.querySelector('.autopark-filter-range-to');
    const { min, max } = getRangeState(rangeEl);

    let from = Number(fromInput.value);
    let to = Number(toInput.value);

    if (source === 'min') from = Number(minInput.value);
    if (source === 'max') to = Number(maxInput.value);
    if (source === 'from') from = Number(fromInput.value);
    if (source === 'to') to = Number(toInput.value);

    from = Math.max(min, Math.min(max, from));
    to = Math.max(min, Math.min(max, to));

    if (from > to) {
      if (source === 'min' || source === 'from') to = from;
      else from = to;
    }

    fromInput.value = from;
    toInput.value = to;
    minInput.value = from;
    maxInput.value = to;
    updateSliderFill(rangeEl);
    updateUI();
  };

  const renderBarChips = (sections) => {
    chipsWrap.innerHTML = '';
    sections.forEach((section) => {
      const chip = document.createElement('span');
      chip.className = 'autopark-filter-chip';
      chip.textContent = FILTER_SECTION_LABELS[section] || section;
      chipsWrap.appendChild(chip);
    });
  };

  const updateUI = () => {
    const activeSections = getActiveSections();
    const barSections = panel.classList.contains('is-open') ? activeSections : appliedSections;

    panel.classList.toggle('has-selection', activeSections.size > 0);
    control.classList.toggle('has-selection', barSections.size > 0);
    barClear.hidden = barSections.size === 0;
    renderBarChips(barSections);
  };

  const resetFilters = () => {
    panel.querySelectorAll('.autopark-filter-capsule').forEach((capsule) => {
      const group = capsule.dataset.group;
      if (group === 'pricePeriod') {
        capsule.classList.toggle('is-selected', capsule.dataset.value === 'day');
      } else {
        capsule.classList.remove('is-selected');
      }
    });

    panel.querySelectorAll('.autopark-filter-range').forEach((rangeEl) => {
      const defaultMin = rangeEl.dataset.defaultMin;
      const defaultMax = rangeEl.dataset.defaultMax;
      rangeEl.querySelector('.autopark-filter-range-from').value = defaultMin;
      rangeEl.querySelector('.autopark-filter-range-to').value = defaultMax;
      rangeEl.querySelector('.autopark-filter-slider-min').value = defaultMin;
      rangeEl.querySelector('.autopark-filter-slider-max').value = defaultMax;
      updateSliderFill(rangeEl);
    });

    appliedSections = new Set();
    updateUI();
  };

  panel.querySelectorAll('.autopark-filter-capsule').forEach((capsule) => {
    capsule.addEventListener('click', () => {
      const group = capsule.dataset.group;

      if (singleSelectGroups.has(group)) {
        panel.querySelectorAll(`.autopark-filter-capsule[data-group="${group}"]`).forEach((item) => {
          item.classList.remove('is-selected');
        });
        if (group === 'class' && capsule.dataset.value === 'all') {
          updateUI();
          return;
        }
        capsule.classList.add('is-selected');
      } else {
        capsule.classList.toggle('is-selected');
      }

      updateUI();
    });
  });

  panel.querySelectorAll('.autopark-filter-range').forEach((rangeEl) => {
    updateSliderFill(rangeEl);

    rangeEl.querySelector('.autopark-filter-slider-min').addEventListener('input', () => syncRange(rangeEl, 'min'));
    rangeEl.querySelector('.autopark-filter-slider-max').addEventListener('input', () => syncRange(rangeEl, 'max'));
    rangeEl.querySelector('.autopark-filter-range-from').addEventListener('input', () => syncRange(rangeEl, 'from'));
    rangeEl.querySelector('.autopark-filter-range-to').addEventListener('input', () => syncRange(rangeEl, 'to'));
  });

  btn.addEventListener('click', () => {
    setPanelOpen(!panel.classList.contains('is-open'));
    updateUI();
  });

  panelClose?.addEventListener('click', () => {
    setPanelOpen(false);
    updateUI();
  });

  findBtn?.addEventListener('click', () => {
    appliedSections = getActiveSections();
    updateUI();
    setPanelOpen(false);
  });

  resetBtn?.addEventListener('click', resetFilters);

  barClear?.addEventListener('click', (e) => {
    e.stopPropagation();
    resetFilters();
    setPanelOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) {
      setPanelOpen(false);
    }
  });

  updateUI();
}

document.addEventListener('DOMContentLoaded', () => {
  renderAutoparkGrid();
  initAutoparkSearch();
  initAutoparkSort();
  initAutoparkFilter();
});
