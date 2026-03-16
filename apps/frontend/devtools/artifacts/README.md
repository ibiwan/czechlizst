# Devtools Artifacts

Small, copy/pasteable helpers for experimenting locally.

## Playground

Interactive curve editor (rectangular + polar + plot):
- `apps/frontend/devtools/bezier-playground.html`

Notes:
- Control points `P1` / `P2` are draggable on the canvas.
- “Copy” works best when served from `http://localhost` (some browsers block clipboard on `file://`).

## Polar model (our encoding)

We encode a `cubic-bezier(x1, y1, x2, y2)` using “endpoint handles” described by:
- `a1`, `a2` in `[0, 1]` → angles in `[0°, 90°]`
- `r1`, `r2` in `[0, 1]` → normalized handle lengths (“effort”)

The mapping is intentionally chosen so `a=0.5` means `45°` (“aim at the goal”), and the standard keyword easings map cleanly.

Radius modes:
- `angleScaled` (default): `r=1` means “max handle length that still fits in the unit square at this angle”.
- `globalSqrt2`: `r=1` means “length √2”, then we fit into the square (optionally shrinking both ends proportionally).

## Coverage / limitations

Raw CSS `cubic-bezier()` allows `y1` and `y2` outside `[0, 1]` (overshoot / undershoot). Our current polar encoding “fits handles into the unit square”, so it does **not** cover those overshoot cases (by design).

## Tailwind easing helper

`tailwind-easing.ts` exports a polar-parameter easing helper that compiles to a standard CSS `cubic-bezier(x1, y1, x2, y2)` string.

Example usage in a Tailwind config (TypeScript):

```ts
// apps/frontend/tailwind.config.ts
import type { Config } from 'tailwindcss';
import { cubicBezierFromPolar } from './devtools/artifacts/tailwind-easing.mjs';

export default {
  theme: {
    extend: {
      transitionTimingFunction: {
        // 45° handles, medium effort
        'polar-mid': cubicBezierFromPolar({ a1: 0.5, r1: 0.6, a2: 0.5, r2: 0.6 })
      }
    }
  }
} satisfies Config;
```

Then use: `ease-polar-mid` with `transition` utilities.

## PostCSS bezier-polar() helper

This repo now includes a tiny PostCSS plugin that lets you write:

```css
transition-timing-function: bezier-polar(0.5 0.6 0.5 0.6);
```

…and have it compile to a standard `cubic-bezier(...)` at build time.

Files:
- `apps/frontend/devtools/artifacts/postcss-bezier-polar/index.cjs`
- enabled in `apps/frontend/postcss.config.cjs`

Signature:
- `bezier-polar(a1 r1 a2 r2)` (spaces or commas; four numbers)

## Standard easings (polar form)

These `bezier-polar(a1 r1 a2 r2)` values correspond to the CSS keyword cubics, using the same polar mapping as `apps/frontend/devtools/bezier-playground.html` and the `radiusMode: 'angleScaled'` default.

- `ease`: `cubic-bezier(0.25, 0.1, 0.25, 1)` → `bezier-polar(0.242 0.25 0 0.75)`
- `ease-in`: `cubic-bezier(0.42, 0, 1, 1)` → `bezier-polar(0 0.42 0 0)`
- `ease-out`: `cubic-bezier(0, 0, 0.58, 1)` → `bezier-polar(0 0 0 0.42)`
- `ease-in-out`: `cubic-bezier(0.42, 0, 0.58, 1)` → `bezier-polar(0 0.42 0 0.42)`

There isn’t a single “canonical” polar encoding for a feel; nearby polar values can look very similar even when the exact rectangular control points differ.
