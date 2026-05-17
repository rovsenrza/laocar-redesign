---
name: clean-frontend
description: 'Clean architecture and clean code for HTML/CSS/JS projects built from scratch. Use when: writing new pages, building UI components, structuring CSS, optimizing images (WebP/SVG, 91% quality, resize), improving page speed to 90+, creating reusable HTML/CSS/JS elements, dividing CSS into component properties and classes, refactoring frontend code for clarity and performance.'
argument-hint: 'Describe the component, page, or optimization task to perform...'
---

# Clean Frontend — HTML / CSS / JS

## When to Use

- Building new pages or UI components from scratch
- Structuring or refactoring CSS into clean component classes
- Writing reusable HTML snippets, JS modules, or utility functions
- Optimizing images (convert to WebP/SVG, 91% quality, resize oversized files)
- Improving Lighthouse / PageSpeed score to **90+**
- Reviewing existing code for clean-code violations

---

## 1. Project Structure

```
project/
├── index.html
├── assets/
│   ├── css/
│   │   ├── style.css          # Global entry — imports all partials (or single file with clear sections)
│   │   ├── base/
│   │   │   ├── _reset.css     # Box-model reset, * { margin:0; padding:0; box-sizing:border-box }
│   │   │   ├── _variables.css # CSS custom properties (--color-*, --font-*, --spacing-*, --radius-*)
│   │   │   └── _typography.css
│   │   ├── layout/
│   │   │   ├── _grid.css      # Page-level grid / flex skeletons
│   │   │   └── _header.css
│   │   └── components/
│   │       ├── _button.css
│   │       ├── _card.css
│   │       └── _form.css
│   ├── js/
│   │   ├── main.js            # Entry point — imports modules
│   │   └── modules/
│   │       ├── ui.js          # DOM helpers, toggling, events
│   │       └── utils.js       # Pure utility functions
│   └── img/
│       ├── originals/         # Never committed to production build
│       └── optimized/         # WebP + resized — used in HTML/CSS
├── pages/                     # Additional HTML pages
└── .github/
    └── skills/
        └── clean-frontend/
```

---

## 2. CSS Architecture — Component-First

### 2.1 Always Start with CSS Custom Properties

```css
/* assets/css/base/_variables.css */
:root {
  /* Colors */
  --color-primary:   #1A73E8;
  --color-secondary: #F5A623;
  --color-text:      #1C1C1C;
  --color-muted:     #6B7280;
  --color-bg:        #FFFFFF;
  --color-surface:   #F9FAFB;
  --color-border:    #E5E7EB;

  /* Typography */
  --font-base:  'Inter', sans-serif;
  --font-size-base: 1rem;       /* 16px */
  --line-height-base: 1.6;

  /* Spacing scale (8-pt grid) */
  --space-1: 0.25rem;   /* 4px  */
  --space-2: 0.5rem;    /* 8px  */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;

  /* Shadow */
  --shadow-sm: 0 1px 3px rgba(0,0,0,.10);
  --shadow-md: 0 4px 12px rgba(0,0,0,.12);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
}
```

### 2.2 CSS Reset

```css
/* assets/css/base/_reset.css */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
body { font-family: var(--font-base); font-size: var(--font-size-base); color: var(--color-text); background: var(--color-bg); line-height: var(--line-height-base); }
img, video, svg { display: block; max-width: 100%; }
a { color: inherit; text-decoration: none; }
button { cursor: pointer; border: none; background: none; font: inherit; }
ul, ol { list-style: none; }
```

### 2.3 Component CSS Rules

Each component file must:
- Use **BEM** naming: `.block__element--modifier`
- Reference only CSS variables — **no hardcoded hex/px values**
- Be self-contained (no dependencies on sibling components)
- Include states: `:hover`, `:focus-visible`, `:disabled`, `[aria-*]`

```css
/* assets/css/components/_button.css */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 600;
  transition: background var(--transition-fast), box-shadow var(--transition-fast);
}

.btn--primary {
  background: var(--color-primary);
  color: #fff;
}
.btn--primary:hover { filter: brightness(1.08); }
.btn--primary:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 3px; }
.btn--primary:disabled { opacity: .5; pointer-events: none; }

.btn--outline {
  background: transparent;
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
}
```

### 2.4 Section Order Inside `style.css`

```
1. @import base/_reset.css
2. @import base/_variables.css
3. @import base/_typography.css
4. @import layout/_grid.css
5. @import layout/_header.css
6. @import components/_button.css
7. @import components/_card.css
   ...
8. Utility classes (.sr-only, .container, .flex-center, etc.)
```

---

## 3. HTML Clean Code Rules

- **Semantic elements only**: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>` — never `<div>` where semantic tags apply.
- Every `<section>` must have a heading (`<h2>`–`<h6>`).
- All interactive elements must have accessible labels (`aria-label`, `<label for="…">`).
- Images must have `alt`, `width`, `height`, and `loading="lazy"` (except LCP image → `loading="eager"` + `fetchpriority="high"`).
- One `<h1>` per page only.
- Meta: `<meta charset="UTF-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`, `<meta name="description" content="…">`.
- Preload LCP font: `<link rel="preload" href="…" as="font" crossorigin>`.
- Scripts: `<script defer src="…">` at end of `<body>`.

### Reusable HTML Pattern (include via JS or SSI)

```html
<!-- components/navbar.html — injected via fetch or server include -->
<header class="header">
  <nav class="nav container" aria-label="Main navigation">
    <a class="nav__logo" href="/">
      <img src="/assets/img/logo.svg" alt="Brand name" width="120" height="40">
    </a>
    <ul class="nav__list" role="list">
      <li><a class="nav__link" href="/about.html">About</a></li>
      <!-- … -->
    </ul>
    <button class="nav__burger" aria-label="Open menu" aria-expanded="false" aria-controls="nav-list">
      <span></span><span></span><span></span>
    </button>
  </nav>
</header>
```

---

## 4. JavaScript Clean Code Rules

### 4.1 Module Pattern (no global pollution)

```js
// assets/js/modules/ui.js
export function initBurgerMenu() {
  const burger = document.querySelector('.nav__burger');
  const navList = document.querySelector('.nav__list');
  if (!burger || !navList) return;

  burger.addEventListener('click', () => {
    const isOpen = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!isOpen));
    navList.classList.toggle('nav__list--open', !isOpen);
  });
}
```

```js
// assets/js/main.js
import { initBurgerMenu } from './modules/ui.js';
document.addEventListener('DOMContentLoaded', () => {
  initBurgerMenu();
});
```

### 4.2 Rules

- **Pure functions** for data transforms — no side effects inside helpers.
- Cache DOM queries (`const el = document.querySelector(…)` once, reuse).
- Debounce scroll/resize listeners (`utils.js > debounce(fn, ms)`).
- Never inline event handlers in HTML (`onclick="…"` is forbidden).
- Use `const` by default; `let` only when reassignment is needed; never `var`.
- Guard early: `if (!el) return;` before any DOM operation.

### 4.3 Utility Helpers (utils.js)

```js
export const debounce = (fn, ms = 200) => {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

export const $ = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

export const loadHTML = async (url, target) => {
  const res = await fetch(url);
  if (!res.ok) return;
  target.innerHTML = await res.text();
};
```

---

## 5. Image Optimization Procedure

### Requirements
| Format | Use Case | Quality | Max Dimensions |
|--------|----------|---------|----------------|
| **WebP** | Photos, hero images, cards | **91%** | 1920 × 1080 px hero; 800 px wide for cards |
| **SVG** | Icons, logos, illustrations | — (lossless) | Minify with SVGO |
| **AVIF** | Optional progressive enhancement | 80% | Same as WebP |

### Step-by-Step

1. **Audit** — find all `<img>` and CSS `background-image` sources.
2. **Resize** — downscale images larger than target display size (2× for retina).
3. **Convert to WebP** using `cwebp` (CLI) or Sharp (Node):
   ```bash
   # Single file
   cwebp -q 91 input.jpg -o output.webp

   # Batch convert all JPG/PNG in assets/img/originals/
   for f in assets/img/originals/*.{jpg,jpeg,png}; do
     cwebp -q 91 "$f" -o "assets/img/optimized/$(basename "${f%.*}").webp"
   done
   ```
4. **Minify SVG** using SVGO:
   ```bash
   npx svgo --folder assets/img/icons --output assets/img/icons
   ```
5. **Use `<picture>` for progressive fallback**:
   ```html
   <picture>
     <source srcset="/assets/img/hero.webp" type="image/webp">
     <img src="/assets/img/hero.jpg" alt="Hero" width="1920" height="1080"
          loading="eager" fetchpriority="high">
   </picture>
   ```
6. **CSS backgrounds** — reference the `.webp` file directly (modern browsers); add JS detection if legacy support needed.

---

## 6. Page Speed Checklist (Lighthouse 90+)

### Critical Rendering Path

- [ ] `<link rel="preload">` for LCP image and main font
- [ ] Inline critical CSS (above-the-fold styles) in `<style>` tag in `<head>`
- [ ] All non-critical scripts use `defer` or `async`
- [ ] No render-blocking third-party scripts in `<head>`

### Assets

- [ ] All images converted to WebP at 91% quality
- [ ] Images have explicit `width` + `height` attributes (prevents CLS)
- [ ] `loading="lazy"` on all below-the-fold images
- [ ] CSS minified for production (`style.min.css`)
- [ ] JS minified and tree-shaken for production (`main.min.js`)

### Fonts

- [ ] Self-hosted (no Google Fonts DNS lookup)
- [ ] `font-display: swap` on all `@font-face`
- [ ] Only required weights/subsets loaded

### Network

- [ ] Gzip / Brotli compression enabled on server
- [ ] Cache headers set for static assets (`max-age=31536000` for immutable assets)
- [ ] No unused CSS (audit with Coverage tab in DevTools)

### Accessibility / Core Web Vitals

- [ ] LCP < 2.5 s — hero image preloaded + WebP
- [ ] CLS < 0.1 — all images/embeds have dimensions
- [ ] INP < 200 ms — no long tasks on main thread; debounce events

---

## 7. Code Review Gate

Before merging or shipping any file, verify:

```
[ ] No hardcoded colors or spacing values in CSS (use variables)
[ ] No inline styles in HTML
[ ] No global JS variables (everything in modules)
[ ] All images: WebP format, 91% quality, width+height attrs, lazy-load
[ ] Semantic HTML structure (no <div> where <section>/<article> applies)
[ ] BEM class naming consistent
[ ] Lighthouse Performance ≥ 90 on mobile
[ ] Lighthouse Accessibility ≥ 90
[ ] No console.log left in production JS
```

---

## References

- [CSS Variables Reference](./references/css-variables.md)
- [Component Templates](./assets/components/)
- [Image Optimization Scripts](./scripts/optimize-images.sh)
