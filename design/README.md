# Design source

- Screens and prototypes: Claude Design canvas "dabei. Prototyp 1 · Inés".
- Design system: `tokens.json` in that canvas (`project/ds/dabei/tokens.json`).

The tokens are implemented as CSS variables in `src/app/globals.css`. When a token changes in the design system, update it there; everything in the app uses those variables.

Rule of thumb: what is built lives in code. New screens or big changes are explored in Claude Design first; small tweaks go straight into code.
