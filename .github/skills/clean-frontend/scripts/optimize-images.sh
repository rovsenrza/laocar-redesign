#!/usr/bin/env bash
# optimize-images.sh
# Converts JPG/PNG → WebP at 91% quality and minifies SVGs.
# Usage: bash .github/skills/clean-frontend/scripts/optimize-images.sh
# Requirements: cwebp (brew install webp), svgo (npm i -g svgo)

set -euo pipefail

SRC="assets/img/originals"
OUT="assets/img/optimized"
ICONS="assets/img/icons"
QUALITY=91

mkdir -p "$OUT"

echo "▶ Converting images to WebP (quality: $QUALITY)…"
for f in "$SRC"/*.{jpg,jpeg,png,JPG,JPEG,PNG}; do
  [[ -e "$f" ]] || continue
  name="$(basename "${f%.*}")"
  cwebp -q "$QUALITY" "$f" -o "$OUT/${name}.webp"
  echo "  ✔ $f → $OUT/${name}.webp"
done

echo "▶ Minifying SVGs…"
if command -v svgo &>/dev/null; then
  svgo --folder "$ICONS" --output "$ICONS"
  echo "  ✔ SVGs minified in $ICONS"
else
  echo "  ⚠ svgo not found — run: npm i -g svgo"
fi

echo "✅ Done. Output: $OUT"
