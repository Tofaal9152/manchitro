# Manchitro: Bangladesh District Map for React

An interactive, accessible and fully typed SVG map of all **64 districts of Bangladesh** as a single React component. Highlight districts from your data, handle clicks and hovers, and style it with your own colors or Tailwind classes.

Works with **Next.js (App Router and Pages Router)**, **Vite**, **Remix / React Router**, **TanStack Start** and plain React 18 or 19. No runtime dependencies.

<p align="center">
  <a href="https://tofaal9152.github.io/manchitro-demo/"><strong>▶ Try the live demo</strong></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/Tofaal9152/manchitro-demo">Demo source</a>
  &nbsp;·&nbsp;
  <a href="https://www.npmjs.com/package/manchitro">npm</a>
</p>

<div align="center">
  <table>
    <tr>
      <td>
        <a href="https://tofaal9152.github.io/manchitro-demo/"><img src="https://i.ibb.co.com/v4KtY2vq/photo-1-2026-04-18-12-48-43.jpg" alt="Manchitro dark map with highlighted districts" width="400" /></a>
      </td>
      <td>
        <a href="https://tofaal9152.github.io/manchitro-demo/"><img src="https://i.ibb.co.com/MDSYzq1H/photo-2-2026-04-18-12-48-43.jpg" alt="Manchitro map with a selected district" width="400" /></a>
      </td>
    </tr>
  </table>
</div>

## Features

- **Typed district names:** Editor autocomplete for all 64 districts; `onSelect` gives you a typed `ValidDistrict`.
- **Forgiving input:** Case, spaces and punctuation are ignored, and common spellings are accepted (`"Chattogram"`, `"Cumilla"`, `"Barishal"`, `"Bogura"`, `"Jashore"`, `"cox's bazar"`, `"Dhaka District"`).
- **Controlled or uncontrolled** selection.
- **Accessible:** Highlighted districts are keyboard focusable buttons (`Tab`, then `Enter`/`Space`).
- **Customizable:** Colors, class names, inline styles, render props for the overlays, and `viewBox` cropping.
- **Server rendering ready:** Ships with `"use client"`, so you can import it straight into a Next.js Server Component.
- **ESM + CommonJS** builds with correct types for every TypeScript `moduleResolution` mode.

## Installation

```bash
npm install manchitro
# or
pnpm add manchitro
# or
yarn add manchitro
```

Peer dependencies: `react` and `react-dom` 18 or newer.

## Quick Start

```tsx
import { Manchitro } from "manchitro";

export default function Page() {
  return <Manchitro items={[{ place: "Dhaka" }, { place: "Sylhet" }]} />;
}
```

This works as-is in a Next.js App Router page (a Server Component). You don't need to add `"use client"` yourself.

### Handling selection (controlled)

```tsx
"use client";

import { useState } from "react";
import { Manchitro, type ValidDistrict } from "manchitro";

const offices = [
  { id: 1, place: "Dhaka" },
  { id: 2, place: "Chattogram" },
  { id: 3, place: "Sylhet" },
];

export function OfficeMap() {
  const [selected, setSelected] = useState<ValidDistrict | null>("Dhaka");

  return (
    <Manchitro items={offices} value={selected} onSelect={setSelected} />
  );
}
```

`onSelect` always receives the **canonical** name (e.g. `"Chattogram"` in your data comes back as `"Chittagong"`). Use `resolveDistrict` to match it back to your own records:

```ts
import { resolveDistrict } from "manchitro";

const office = offices.find((o) => resolveDistrict(o.place) === selected);
```

## The `items` prop

`items` controls which districts are highlighted and clickable. Each entry can be:

- an object with a `place` field: `{ place: "Dhaka" }`. `id` is optional, and any extra fields (counts, labels, …) are allowed and ignored.
- a plain string: `"Dhaka"`.

```tsx
<Manchitro items={["Dhaka", { id: 7, place: "Khulna", total: 12 }]} />
```

Names that can't be matched are shown in a small warning in the top-right corner and reported through `onDebug`.

## District names

`onSelect`, `renderSelected` and `onDebug` always use these 64 canonical names (also exported as `DISTRICTS`):

| Division   | Districts                                                                                                                                      |
| :--------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| Dhaka      | Dhaka, Faridpur, Gazipur, Gopalganj, Kishoreganj, Madaripur, Manikganj, Munshiganj, Narayanganj, Narshingdi, Rajbari, Shariatpur, Tangail |
| Chittagong | Bandarban, Brahmanbaria, Chandpur, Chittagong, Comilla, Cox's Bazar, Feni, Khagrachari, Lakshmipur, Noakhali, Rangamati                    |
| Rajshahi   | Bogra, Chapai Nawabganj, Jaipurhat, Naogaon, Natore, Pabna, Rajshahi, Sirajganj                                                             |
| Khulna     | Bagerhat, Chuadanga, Jessore, Jhinaidaha, Khulna, Kushtia, Magura, Meherpur, Narail, Satkhira                                               |
| Barisal    | Barisal, Bhola, Borguna, Jhalokati, Patuakhali, Pirojpur                                                                                    |
| Sylhet     | Habiganj, Maulvibazar, Sunamganj, Sylhet                                                                                                    |
| Rangpur    | Dinajpur, Gaibandha, Kurigram, Lalmonirhat, Nilfamari, Panchagarh, Rangpur, Thakurgaon                                                      |
| Mymensingh | Jamalpur, Mymensingh, Netrokona, Sherpur                                                                                                    |

Matching ignores case, spaces, punctuation and a trailing "District"/"Zila". These alternate spellings are also accepted:

| You can pass                                | Resolves to      |
| :------------------------------------------ | :--------------- |
| Chattogram, Chottogram                      | Chittagong       |
| Cumilla, Kumilla                            | Comilla          |
| Barishal                                    | Barisal          |
| Barguna                                     | Borguna          |
| Bogura                                      | Bogra            |
| Jashore                                     | Jessore          |
| Joypurhat, Jaypurhat                        | Jaipurhat        |
| Jhenaidah, Jhenidah                         | Jhinaidaha       |
| Jhalakathi, Jhalakati, Jhalokathi           | Jhalokati        |
| Moulvibazar, Moulavibazar                   | Maulvibazar      |
| Narsingdi, Narsinghdi                       | Narshingdi       |
| Netrakona                                   | Netrokona        |
| Nilphamari                                  | Nilfamari        |
| Khagrachhari                                | Khagrachari      |
| Kishorganj                                  | Kishoreganj      |
| Laxmipur                                    | Lakshmipur       |
| Chapainawabganj, Nawabganj, Chapai          | Chapai Nawabganj |
| Cox Bazar                                   | Cox's Bazar      |
| Any "-gonj" spelling (Munshigonj, Sirajgonj) | "-ganj" form     |

## Customization

### Colors and styling

```tsx
<Manchitro
  items={myData}
  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4"
  colors={{
    base: "#e2e8f0", // districts not in items
    active: "#3b82f6", // districts in items
    selected: "#ef4444", // the selected district
    stroke: "#ffffff", // district borders
    selectedStroke: "#000000", // border of the selected district
    // selectedGlow: "rgba(239,68,68,0.4)", // optional, defaults to a translucent `selected`
  }}
/>
```

- Without `className`, the container gets a default dark background, border and radius. Passing `className` replaces them with your classes. The container always keeps `position: relative` so the overlays stay inside it.
- Without `svgClassName`, the SVG gets `width: 100%; height: auto`. Use `svgStyle` (e.g. `{ maxHeight: 600 }`) or `svgClassName` to size it.

### Custom or hidden overlays

```tsx
<Manchitro
  items={myData}
  renderSelected={(district) => (
    <div className="absolute left-4 top-4 rounded-lg bg-blue-600 px-4 py-2 text-white">
      {district}
    </div>
  )}
  renderDebug={() => null} // hide the unknown-names warning
/>
```

### Tooltips and hover

`onDistrictMouseEnter` and `onDistrictMouseLeave` fire for highlighted districts:

```tsx
"use client";

import { useState } from "react";
import { Manchitro, type ValidDistrict } from "manchitro";

export function MapWithTooltip() {
  const [hover, setHover] = useState<{ name: ValidDistrict; x: number; y: number } | null>(null);

  return (
    <div style={{ position: "relative" }}>
      <Manchitro
        items={["Dhaka", "Khulna", "Rajshahi"]}
        onDistrictMouseEnter={(name, e) => setHover({ name, x: e.clientX, y: e.clientY })}
        onDistrictMouseLeave={() => setHover(null)}
      />
      {hover && (
        <div style={{ position: "fixed", left: hover.x + 12, top: hover.y + 12 }}>
          {hover.name}
        </div>
      )}
    </div>
  );
}
```

### Cropping or zooming

```tsx
<Manchitro items={myData} viewBox="200 200 1000 1500" />
```

## API

### `<Manchitro />` props

All props are optional.

| Prop                   | Type                                                  | Default           | Description                                                                                     |
| :--------------------- | :---------------------------------------------------- | :---------------- | :---------------------------------------------------------------------------------------------- |
| `items`                | `Array<{ place: string; id?: string \| number } \| string>` | `[]`         | Districts to highlight and make clickable.                                                      |
| `value`                | `string \| null`                                      | —                 | Selected district (controlled). Any accepted spelling; `null` for no selection.                 |
| `defaultValue`         | `string \| null`                                      | first of `items`  | Initial selection (uncontrolled). Falls back to the first item if not in `items`.               |
| `onSelect`             | `(district: ValidDistrict) => void`                   | —                 | Highlighted district clicked or activated with the keyboard.                                    |
| `onDistrictMouseEnter` | `(district: ValidDistrict, e: React.MouseEvent) => void` | —              | Pointer entered a highlighted district.                                                         |
| `onDistrictMouseLeave` | `(district: ValidDistrict, e: React.MouseEvent) => void` | —              | Pointer left a highlighted district.                                                            |
| `colors`               | `ManchitroColors`                                     | dark green theme  | `base`, `active`, `selected`, `stroke`, `selectedStroke`, `selectedGlow`.                       |
| `className`            | `string`                                              | —                 | Classes for the container. Replaces the default background/border.                              |
| `style`                | `React.CSSProperties`                                 | —                 | Inline styles for the container.                                                                |
| `svgClassName`         | `string`                                              | —                 | Classes for the `<svg>`. Replaces the default `width: 100%; height: auto`.                      |
| `svgStyle`             | `React.CSSProperties`                                 | —                 | Inline styles for the `<svg>`.                                                                  |
| `viewBox`              | `string`                                              | `"0 0 1555 2140"` | SVG viewBox for cropping or zooming.                                                            |
| `renderSelected`       | `(district: ValidDistrict) => ReactNode`              | —                 | Replaces the "Selected: X" label. Return `null` to hide it.                                     |
| `renderDebug`          | `(unknownPlaces: string[]) => ReactNode`              | —                 | Replaces the "Unknown places" warning. Return `null` to hide it.                                |
| `onDebug`              | `(info: { unknownPlaces: string[]; activeDistricts: ValidDistrict[] }) => void` | — | Called when the recognized or unrecognized names change.                            |
| `disabled`             | `boolean`                                             | `false`           | Disables clicks, hover callbacks and keyboard selection.                                        |

### Other exports

| Export                  | Description                                                                 |
| :---------------------- | :-------------------------------------------------------------------------- |
| `DISTRICTS`             | Readonly array of the 64 canonical district names.                          |
| `resolveDistrict(name)` | Returns the canonical name for any accepted spelling, or `null`.            |
| `isDistrict(name)`      | `true` if `name` is a recognizable district.                                |
| `ValidDistrict`         | Type: union of the 64 canonical names.                                      |
| `DistrictInput`         | Type: accepted input name (autocompletes canonical names, allows any string). |
| `DistrictItem`          | Type: an object entry in `items`.                                           |
| `ManchitroProps`, `ManchitroColors` | Types for the component props and colors.                       |

## Debugging

If a district doesn't light up, its name wasn't recognized. The map shows the unknown names in the top-right corner, and you can log them:

```tsx
<Manchitro
  items={myData}
  onDebug={({ unknownPlaces }) => {
    if (unknownPlaces.length) console.warn("Unknown districts:", unknownPlaces);
  }}
/>
```

## License

MIT
