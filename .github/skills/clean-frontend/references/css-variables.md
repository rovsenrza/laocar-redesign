# CSS Custom Properties Reference

Quick cheat-sheet for all standard variable names used in this project.

## Color Tokens
| Variable | Purpose |
|----------|---------|
| `--color-primary` | Brand / CTA color |
| `--color-secondary` | Accent color |
| `--color-text` | Body text |
| `--color-muted` | Secondary / placeholder text |
| `--color-bg` | Page background |
| `--color-surface` | Card / panel background |
| `--color-border` | Borders, dividers |

## Spacing (8-pt grid)
`--space-1` (4px) · `--space-2` (8px) · `--space-3` (12px) · `--space-4` (16px) · `--space-6` (24px) · `--space-8` (32px) · `--space-12` (48px) · `--space-16` (64px)

## Typography
`--font-base` · `--font-size-base` · `--line-height-base`

## Misc
`--radius-sm` · `--radius-md` · `--radius-lg`
`--shadow-sm` · `--shadow-md`
`--transition-fast` · `--transition-base`

## Rule
**Never hardcode** hex values or px numbers in component CSS. Always reference a variable. If a new value is needed, add it to `_variables.css` first.
