# React Bangladesh District Map

A highly customizable, interactive, and accessible SVG map of Bangladesh districts for React applications. Built with flexibility in mind, allowing developers to easily integrate, style, and extend its functionality.

## Features

- **TypeScript Auto-Complete:** Full IntelliSense support. VS Code will automatically suggest the correct names for all 64 districts while typing.
- **Fully Customizable:** Change colors, borders, and CSS classes (Tailwind compatible).
- **Render Props:** Completely override the default UI overlays with your own React components.
- **Interactive:** Hover events, click events, and fully accessible keyboard navigation (`Tab` + `Enter`/`Space`).
- **Flexible Dimensions:** Adjustable `viewBox` for custom cropping and zooming.

## Installation

Install the package via your preferred package manager:

```bash
npm install manchitro
# or
yarn add manchitro
# or
pnpm add manchitro
```

---

## Quick Start

Here is a minimal example to get the map rendering in your app.

```tsx
import React, { useState } from "react";
import { Manchitro } from "manchitro";

const myData = [
  { id: "1", place: "Dhaka" },
  { id: "2", place: "Rajshahi" },
  { id: "3", place: "Sylhet" },
];

export default function App() {
  const [selected, setSelected] = useState<string | null>("Dhaka");

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Manchitro 
        items={myData} 
        value={selected}
        onSelect={(district) => setSelected(district)}
      />
    </div>
  );
}
```

---

## Supported Districts

This package fully supports all **64 districts** of Bangladesh. When passing data to the map, use the exact spelling (or any capitalization without spaces) of the districts below:

**Dhaka Division:** Dhaka, Gazipur, Kishoreganj, Manikganj, Munshiganj, Narayanganj, Narsingdi, Tangail, Faridpur, Gopalganj, Madaripur, Rajbari, Shariatpur.

**Chittagong Division:** Brahmanbaria, Comilla, Chandpur, Lakshmipur, Noakhali, Feni, Khagrachari, Rangamati, Bandarban, Chittagong, Cox's Bazar.

**Rajshahi Division:** Bogra, Joypurhat, Naogaon, Natore, Chapai Nawabganj, Pabna, Rajshahi, Sirajganj.

**Khulna Division:** Bagerhat, Chuadanga, Jessore, Jhenaidah, Khulna, Kushtia, Magura, Meherpur, Narail, Satkhira.

**Barisal Division:** Barguna, Barisal, Bhola, Jhalokati, Patuakhali, Pirojpur.

**Sylhet Division:** Habiganj, Moulvibazar, Sunamganj, Sylhet.

**Rangpur Division:** Dinajpur, Gaibandha, Kurigram, Lalmonirhat, Nilphamari, Panchagarh, Rangpur, Thakurgaon.

**Mymensingh Division:** Jamalpur, Mymensingh, Netrokona, Sherpur.

---

## Advanced Customization

### 1. Custom Colors & Styling
You can match the map perfectly to your brand by overriding the `colors` prop and passing custom classes.

```tsx
<Manchitro 
  items={myData}
  className="relative w-full rounded-xl bg-slate-50 border border-slate-200 p-4"
  colors={{
    base: "#e2e8f0",       // Default color for empty districts
    active: "#3b82f6",     // Color for districts in your 'items' list
    selected: "#ef4444",   // Color when a district is selected
    stroke: "#ffffff",     // Border line color
    selectedStroke: "#000" // Border color of the selected district
  }}
/>
```

### 2. Custom Overlays (Render Props)
Don't like the default text overlays? Build your own using `renderSelected` and `renderDebug`.

```tsx
<Manchitro 
  items={myData}
  renderSelected={(district) => (
    <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md font-medium">
       Active Region: {district}
    </div>
  )}
/>
```

### 3. Tooltips & Hover Events
Use the `onDistrictMouseEnter` and `onDistrictMouseLeave` events to integrate your own custom tooltips (like Radix UI, Tippy.js, or Floating UI).

```tsx
<Manchitro 
  items={myData}
  onDistrictMouseEnter={(district, event) => {
    console.log(`Mouse entered ${district} at X: ${event.clientX}, Y: ${event.clientY}`);
  }}
/>
```

### 4. Custom Zoom / ViewBox
Need to focus on a specific part of the map or change the aspect ratio? Use the `viewBox` prop.

```tsx
<Manchitro 
  items={myData}
  viewBox="200 200 1000 1500" // Custom crop
/>
```

---

## API Reference (Props)

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `items` | `DistrictItem[]` | `[]` | **Required.** Array of objects `{ id: string, place: string }` representing active districts. Provides IDE auto-complete for 64 districts. |
| `value` | `string \| null` | `undefined` | The currently selected district (Controlled mode). |
| `defaultValue`| `string \| null` | `null` | The district selected by default on first render (Uncontrolled mode). |
| `onSelect` | `(district: string) => void`| `undefined` | Callback fired when an active district is clicked or selected via keyboard. |
| `colors` | `Object` | `{...}` | Override map colors: `base`, `active`, `selected`, `stroke`, `selectedStroke`. |
| `className` | `string` | `"relative w-full..."`| Tailwind or CSS classes for the main container wrapper. |
| `style` | `React.CSSProperties`| `{}` | Standard React inline styles for the main container wrapper. |
| `svgClassName`| `string` | `"w-full h-auto..."`| CSS classes applied directly to the `<svg>` element. |
| `viewBox` | `string` | `"0 0 1555 2140"` | Adjusts the SVG viewBox for zooming or cropping. |
| `renderSelected`| `(district: string) => ReactNode` | `undefined` | Render prop to completely replace the "Selected" UI overlay. |
| `renderDebug` | `(unknown: string[]) => ReactNode`| `undefined` | Render prop to completely replace the "Unknown places" UI overlay. |
| `onDistrictMouseEnter`| `(district: string, e: MouseEvent) => void`| `undefined` | Callback fired when the mouse hovers over an active district. |
| `onDistrictMouseLeave`| `(district: string, e: MouseEvent) => void`| `undefined` | Callback fired when the mouse leaves an active district. |
| `onDebug` | `(info: object) => void` | `undefined` | Returns `{ activeDistricts, unknownPlaces }` arrays for debugging missing data. |
| `disabled` | `boolean` | `false` | If `true`, disables all interactions (clicks, hovers, keyboard). |

---

## Debugging

If you pass a list of items but some districts aren't lighting up, they might be misspelled. The map will automatically display a small warning in the top right corner with the unrecognized names. 

You can also programmatically track these using the `onDebug` prop:

```tsx
<Manchitro 
  items={myData}
  onDebug={({ unknownPlaces }) => {
    if (unknownPlaces.length > 0) {
      console.warn("These districts were not found:", unknownPlaces);
    }
  }}
/>
```