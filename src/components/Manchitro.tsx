import * as React from "react";
import { DISTRICT_PATH } from "../data/districtPaths.data";
/** Complete list of all 64 districts in Bangladesh */
export type ValidDistrict =
  | "Rajshahi"
  | "Nilfamari"
  | "Panchagarh"
  | "Thakurgaon"
  | "Lalmonirhat"
  | "Dinajpur"
  | "Rangpur"
  | "Kurigram"
  | "Gaibandha"
  | "Naogaon"
  | "Jaipurhat"
  | "Chapai Nawabganj"
  | "Bogra"
  | "Natore"
  | "Sirajganj"
  | "Kushtia"
  | "Meherpur"
  | "Chuadanga"
  | "Magura"
  | "Jessore"
  | "Narail"
  | "Khulna"
  | "Pirojpur"
  | "Bagerhat"
  | "Sherpur"
  | "Tangail"
  | "Manikganj"
  | "Dhaka"
  | "Noakhali"
  | "Lakshmipur"
  | "Kishoreganj"
  | "Jamalpur"
  | "Mymensingh"
  | "Gazipur"
  | "Netrokona"
  | "Sunamganj"
  | "Sylhet"
  | "Habiganj"
  | "Maulvibazar"
  | "Narshingdi"
  | "Narayanganj"
  | "Brahmanbaria"
  | "Comilla"
  | "Chandpur"
  | "Madaripur"
  | "Faridpur"
  | "Jhalokati"
  | "Barisal"
  | "Borguna"
  | "Patuakhali"
  | "Bhola"
  | "Shariatpur"
  | "Chittagong"
  | "Khagrachari"
  | "Bandarban"
  | "Rangamati"
  | "Cox's Bazar"
  | "Pabna"
  | "Munshiganj"
  | "Gopalganj"
  | "Satkhira"
  | "Jhinaidaha"
  | "Rajbari"
  | "Feni";

export type DistrictItem = {
  id: string;
  /** * District name.
   * Uses a TypeScript trick to provide auto-complete for 64 districts while still allowing any string.
   */
  place: ValidDistrict | (string & {}); // Updated this line
};

export type ManchitroProps = {
  /** Array of districts to highlight on the map */
  items: DistrictItem[];

  /** Selected district (Controlled mode) */
  value?: string | null;

  /** Default selected district (Uncontrolled mode) */
  defaultValue?: string | null;

  /** Custom SVG viewBox dimensions */
  viewBox?: string;

  /** Callback fired when an active district is clicked */
  onSelect?: (districtName: string) => void;

  /** Callback fired when the mouse enters an active district */
  onDistrictMouseEnter?: (districtName: string, e: React.MouseEvent) => void;

  /** Callback fired when the mouse leaves an active district */
  onDistrictMouseLeave?: (districtName: string, e: React.MouseEvent) => void;

  /** Tailwind or custom CSS classes for the map container */
  className?: string;

  /** Standard React inline styles for the map container */
  style?: React.CSSProperties;

  /** Custom CSS classes for the SVG element */
  svgClassName?: string;

  /** Custom map colors */
  colors?: {
    base?: string; // Color for inactive districts
    active?: string; // Color for active districts
    selected?: string; // Color for the selected district
    stroke?: string; // Border color
    selectedStroke?: string; // Border color for the selected district
  };

  /** Callback to debug unknown or misspelled district names */
  onDebug?: (info: {
    unknownPlaces: string[];
    activeDistricts: string[];
  }) => void;

  /** Render prop to customize the selected district overlay */
  renderSelected?: (district: string) => React.ReactNode;

  /** Render prop to customize the debug warning overlay */
  renderDebug?: (unknownPlaces: string[]) => React.ReactNode;

  /** Disables all map interactions */
  disabled?: boolean;
};

/**
 * Normalizes strings by trimming, lowercasing, and removing special characters.
 * Example: "Cox's Bazar" -> "coxsbazar"
 */
const normalize = (s: string) =>
  (s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");

function Manchitro({
  items,
  value,
  defaultValue = null,
  viewBox = "0 0 1555 2140",
  onSelect,
  onDistrictMouseEnter,
  onDistrictMouseLeave,
  className,
  style,
  svgClassName,
  colors,
  onDebug,
  renderSelected,
  renderDebug,
  disabled = false,
}: ManchitroProps) {
  // Merge user-provided colors with default colors
  const mergedColors = React.useMemo(
    () => ({
      base: colors?.base ?? "#0f172a",
      active: colors?.active ?? "#14532d",
      selected: colors?.selected ?? "#22c55e",
      stroke: colors?.stroke ?? "#334155",
      selectedStroke: colors?.selectedStroke ?? "#ffffff",
    }),
    [colors],
  );

  // Create a lookup map for fast normalization matching
  const districtNameLookup = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const [, d] of Object.entries(DISTRICT_PATH)) {
      map.set(normalize(d.name), d.name);
    }
    return map;
  }, []);

  // Separate active districts from unknown/misspelled ones
  const { activeDistricts, unknownPlaces } = React.useMemo(() => {
    const active: string[] = [];
    const unknown: string[] = [];

    for (const it of items || []) {
      // Safely cast it to a primitive string for the logic checks
      const placeName = it.place as string;

      const canonical = districtNameLookup.get(normalize(placeName));
      if (canonical) active.push(canonical);
      else unknown.push(placeName);
    }

    return {
      activeDistricts: Array.from(new Set(active)),
      unknownPlaces: Array.from(new Set(unknown)),
    };
  }, [items, districtNameLookup]);

  // Trigger debug callback if missing places are found
  React.useEffect(() => {
    onDebug?.({ unknownPlaces, activeDistricts });
  }, [unknownPlaces, activeDistricts, onDebug]);

  // Handle local state for uncontrolled usage
  const [inner, setInner] = React.useState<string | null>(defaultValue);
  const selectedDistrict = value !== undefined ? value : inner;

  // Auto-select the first available district if none is selected
  React.useEffect(() => {
    if (!activeDistricts.length) {
      if (value === undefined) setInner(null);
      return;
    }
    if (!selectedDistrict || !activeDistricts.includes(selectedDistrict)) {
      if (value === undefined) setInner(activeDistricts[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDistricts.join("|")]);

  // Determine the fill color based on state
  const getFill = (districtName: string) => {
    const isSelected = selectedDistrict === districtName;
    const hasItems = activeDistricts.includes(districtName);

    if (isSelected) return mergedColors.selected;
    if (hasItems) return mergedColors.active;
    return mergedColors.base;
  };

  // Handle district click events
  const onPick = (districtName: string) => {
    if (disabled) return;
    if (!activeDistricts.includes(districtName)) return;

    if (value === undefined) setInner(districtName);
    onSelect?.(districtName);
  };

  // Handle keyboard events for accessibility
  const handleKeyDown = (e: React.KeyboardEvent, districtName: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onPick(districtName);
    }
  };

  return (
    <div
      className={
        className ??
        "relative w-full rounded-2xl border border-white/10 bg-black/40 backdrop-blur p-4"
      }
      style={
        style ??
        (className
          ? undefined
          : {
              position: "relative",
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
            })
      }
    >
      <svg
        viewBox={viewBox}
        className={svgClassName ?? "w-full h-auto h-screen select-none"}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Bangladesh district map"
      >
        {Object.entries(DISTRICT_PATH).map(([key, d]) => {
          const hasItems = activeDistricts.includes(d.name);
          const isSelected = selectedDistrict === d.name;
          const isInteractive = hasItems && !disabled;

          return (
            <g
              key={key}
              onClick={() => onPick(d.name)}
              onMouseEnter={(e) => onDistrictMouseEnter?.(d.name, e)}
              onMouseLeave={(e) => onDistrictMouseLeave?.(d.name, e)}
              onKeyDown={(e) => isInteractive && handleKeyDown(e, d.name)}
              role={isInteractive ? "button" : "img"}
              aria-label={d.name}
              tabIndex={isInteractive ? 0 : undefined}
              style={{
                cursor: isInteractive ? "pointer" : "default",
                outline: "none",
              }}
            >
              <title>{d.name}</title>
              <path
                d={d.path}
                fill={getFill(d.name)}
                stroke={
                  isSelected ? mergedColors.selectedStroke : mergedColors.stroke
                }
                strokeWidth={isSelected ? 3 : 1}
                opacity={hasItems ? 1 : 0.55}
                style={{
                  transition: "all 200ms ease",
                  filter: isSelected
                    ? "drop-shadow(0px 0px 10px rgba(34,197,94,0.45))"
                    : "none",
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* Selected District Overlay */}
      {selectedDistrict &&
        (renderSelected ? (
          renderSelected(selectedDistrict)
        ) : (
          <div
            style={{
              marginTop: 10,
              fontSize: 14,
              fontWeight: "bold",
              color: mergedColors.selected,
              position: "absolute",
              top: 10,
              left: 16,
            }}
          >
            Selected: {selectedDistrict}
          </div>
        ))}

      {/* Unknown Places Warning Overlay */}
      {unknownPlaces.length > 0 &&
        (renderDebug ? (
          renderDebug(unknownPlaces)
        ) : (
          <div
            style={{
              marginTop: 10,
              fontSize: 12,
              color: "rgba(252,211,77,0.95)",
              position: "absolute",
              top: 10,
              right: 16,
            }}
          >
            ⚠️ Unknown places:{" "}
            <span style={{ color: "rgba(253,230,138,0.95)" }}>
              {unknownPlaces.join(", ")}
            </span>
          </div>
        ))}
    </div>
  );
}

export { Manchitro };
