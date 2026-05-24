# TODO - Production UI/UX Fixes (Parlour)

## Plan Approved Steps
- [x] 1) Implement safe-area & fixed-layout strategy
  - Introduce CSS variables / classes to standardize bottom insets.
  - Remove per-page inline padding hacks where appropriate.


- [x] 2) Update `frontend/src/components/BottomNav.jsx`

  - Make admin item layout non-breaking.
  - Ensure full-width fit without horizontal overflow.
  - Proper safe-area padding and max width handling.
- [x] 3) Fix `frontend/src/components/SocialShareButton.jsx`

  - Correct bottom-right positioning so it never overlaps BottomNav.
  - Respect safe-area inset and z-index layering.
  - Ensure the share button stays inside viewport on small screens.
- [x] 4) Fix `frontend/src/components/AppInstallPrompt.jsx` mobile bottom-sheet stacking
  - Ensure it layers above BottomNav but doesn’t cause overflow.
- [x] 5) Add global overflow containment
  - Add/adjust global CSS to prevent horizontal scroll.
  - Ensure fixed components reserve space via padding/margins.
- [x] 6) Run production checks

  - `npm test/lint` if available, or run `npm run build` for frontend.
  - Manual checks: iPhone/Android viewport sizes + small desktop.

