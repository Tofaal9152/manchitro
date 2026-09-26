# Changelog

## 2.1.1

- Added a link to the live demo (https://tofaal9152.github.io/manchitro-demo/) in the README, the npm homepage link and `llms.txt`.

## 2.1.0

### Fixed

- **Next.js App Router:** the bundle now starts with `"use client"`. Previously, rendering the map from a Server Component crashed with `useEffect is not a function`.
- **TypeScript:** types now resolve under every `moduleResolution` mode (`node16`/`nodenext` previously failed). CommonJS `require("manchitro")` now works.
- District names listed in the README (Joypurhat, Jhenaidah, Barguna, Moulvibazar, Nilphamari, Narsingdi) and official spellings (Chattogram, Cumilla, Barishal, Bogura, Jashore, …) are now recognized instead of reported as unknown.
- `onDebug` no longer causes an infinite render loop when it sets state, or when `items` / `onDebug` are passed inline.
- `value` and `defaultValue` are now matched like `items` (case, spacing, alternate spellings). An unrecognized `value` means no selection.
- Uncontrolled auto-selection is computed during render, so server-rendered HTML matches the client (no selection flash after hydration).
- The container always keeps `position: relative`, so the overlays stay inside it when you pass a `className`.
- The selected-district glow follows `colors.selected` instead of always being green.
- `onDistrictMouseEnter` / `onDistrictMouseLeave` now fire only for highlighted districts and not when `disabled`, as documented.
- Accessibility: district buttons are no longer hidden from screen readers (the SVG had `role="img"`), keyboard focus is visible, and `aria-pressed` marks the selection.
- Removed the default Tailwind classes, which only applied if Tailwind scanned `node_modules` and conflicted with each other (`h-auto h-screen`). The SVG now gets `width: 100%; height: auto` inline by default.
- `.gitIgnore` renamed to `.gitignore` so it works on case-sensitive file systems.

### Added

- `items` accepts plain strings and readonly arrays; `id` is optional and may be a number; extra fields are allowed.
- `svgStyle` prop and `colors.selectedGlow`.
- Exports: `DISTRICTS`, `resolveDistrict`, `isDistrict`, and the `DistrictInput` and `ManchitroColors` types.
- Callbacks are typed with `ValidDistrict`, so `onSelect={setState}` works with `useState<ValidDistrict | null>`.
- `llms.txt` shipped in the package for AI coding assistants.
- Test suite, and `publint` + `arethetypeswrong` checks that run before publishing.

## 2.0.1

- Documentation updates.
