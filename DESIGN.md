# Design

## Theme

Light, warm, archival. Scene: a philosophy teacher in a sunlit staff room between classes, filing documents before an inspection visit; paper, daylight, quiet focus. Light theme is forced by the scene: daytime work, document-centric tasks, print-like legibility.

## Color Palette

Strategy: **Restrained** (product default). Tinted warm-paper neutrals carrying the surface; one deep cedar-green accent reserved for primary actions, selection, and state. All values in OKLCH.

| Role | Value | Usage |
|---|---|---|
| Paper (app background) | `oklch(0.968 0.007 95)` | App canvas |
| Surface | `oklch(0.992 0.003 95)` | Cards, panels, content sheets |
| Panel (sidebar/toolbars) | `oklch(0.943 0.009 92)` | Right sidebar, top bar, wells |
| Ink (primary text) | `oklch(0.255 0.014 152)` | Headings, body |
| Ink-soft (secondary text) | `oklch(0.44 0.016 150)` | Labels, meta, captions |
| Ink-faint (tertiary) | `oklch(0.58 0.012 148)` | Disabled text, timestamps |
| Border | `oklch(0.885 0.010 100)` | Hairlines, dividers |
| Border-strong | `oklch(0.80 0.014 105)` | Inputs, hover edges |
| Accent (cedar green) | `oklch(0.42 0.088 158)` | Primary buttons, active nav, selection |
| Accent-hover | `oklch(0.365 0.082 158)` | Button/nav hover |
| Accent-tint | `oklch(0.94 0.028 162)` | Selected rows, active chips, focus fills |
| Success | `oklch(0.55 0.11 150)` | Uploaded/complete states |
| Warning | `oklch(0.62 0.115 75)` | Missing/incomplete nudges |
| Error | `oklch(0.52 0.15 30)` | Destructive, validation |

Never pure black/white; every neutral carries the warm-green tint. Contrast: ink on paper ≈ 12:1, ink-soft ≥ 4.6:1, white-on-accent ≥ 5:1 (AA).

## Typography

Family: **IBM Plex Sans Arabic** (Google Fonts CDN), weights 300/400/500/600/700. Fallback: `"Segoe UI", system-ui, sans-serif`. One family everywhere; hierarchy via scale and weight, never display fonts in UI. Western numerals (Moroccan administrative convention). Fixed rem scale, ratio ≈ 1.2:

- Caption/meta: 0.75rem (500) / 0.8125rem (400)
- Body: 0.9375rem (400), line-height 1.65 for prose, 1.45 in UI lists
- H3/card title: 1.0625rem (600)
- H2/section title: 1.375rem (650)
- H1/page title: 1.75rem (700)
- Display (login only): 2.375rem (700)

Prose line length capped at 68ch; dense tables may run wider.

## Elevation & Depth

Flat archival aesthetic: hairline borders over shadows. Two elevations only: `0 1px 2px oklch(0.255 0.014 152 / 0.05)` for resting cards, `0 8px 24px oklch(0.255 0.014 152 / 0.10)` for drawers/popovers. Radius vocabulary: 6px inputs/buttons/chips, 10px cards/panels, 14px drawers/modals.

## Components

Buttons: primary (accent fill, white text), secondary (surface fill, border-strong, ink), ghost (transparent, ink-soft, hover panel tint), danger (error). States: hover, focus-visible (2px accent outline offset 2px), active (pressed translate none, darken), disabled (40% opacity, no pointer), loading (inline spinner, label kept).

Inputs: surface fill, border-strong, 6px radius, focus ring accent-tint + accent border; error border + helper text in error color. Selects native-styled consistently.

File chips: format badge (PDF/DOC/XLS/PPT/JPG/MP4) as small mono-label chip, panel background, ink-soft text.

Navigation tree (the signature component): the ministry taxonomy rendered as an indented RTL tree in the right sidebar; axes are group labels, elements are links, counts as faint numerals; active item gets accent-tint pill.

Empty states: instructive, not blank: icon + one-line explanation + the action that fills the space.

## Layout

RTL (`dir="rtl"`), app shell: fixed top bar (64px) with global search + user menu; right sidebar (288px) holding the three-section taxonomy tree, collapsible under 1024px; main column max 1200px, generous 32–48px rhythm, varied vertical spacing (24/32/48) for hierarchy rather than uniform padding. Dashboard uses an asymmetric two-column arrangement (completeness ledger + recent activity), never equal card grids.

## Motion

State-conveying only, 150–250ms, ease-out-quart `cubic-bezier(0.25, 1, 0.5, 1)`. Drawer slide, tree expand (grid-template-rows transition on wrapper height via max-height clamp), toast entry. No orchestrated load sequences; no decorative loops. Full `prefers-reduced-motion: reduce` fallback disabling transforms/transitions.
