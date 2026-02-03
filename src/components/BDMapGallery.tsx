import * as React from "react";
import { BD_DISTRICT_PATH } from "../data/bd-paths";

export type DistrictItem = {
  id: string;
  /** District name like: "Dhaka", "Rajshahi", "Cox's Bazar" */
  place: string;
};

export type BDDistrictMapProps = {
  items: DistrictItem[];

  /** controlled selected district */
  value?: string | null;

  /** uncontrolled default selected district */
  defaultValue?: string | null;

  /** fires when user clicks a highlighted district */
  onSelect?: (districtName: string) => void;

  /** map container class (Tailwind optional) */
  className?: string;

  /** svg class */
  svgClassName?: string;

  /** custom colors */
  colors?: {
    base?: string; // non-active
    active?: string; // has items
    selected?: string; // selected
    stroke?: string;
    selectedStroke?: string;
  };

  /** if true, returns unknownPlaces list via onDebug */
  onDebug?: (info: {
    unknownPlaces: string[];
    activeDistricts: string[];
  }) => void;

  /** disable click selection */
  disabled?: boolean;
};

const normalize = (s: string) =>
  (s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, ""); // "Cox's Bazar" -> "coxsbazar"

function BDDistrictMap({
  items,
  value,
  defaultValue = null,
  onSelect,
  className,
  svgClassName,
  colors,
  onDebug,
  disabled = false,
}: BDDistrictMapProps) {
  const mergedColors = React.useMemo(
    () => ({
      base: colors?.base ?? "#0f172a", // slate-900
      active: colors?.active ?? "#14532d",
      selected: colors?.selected ?? "#22c55e",
      stroke: colors?.stroke ?? "#334155",
      selectedStroke: colors?.selectedStroke ?? "#ffffff",
    }),
    [colors],
  );

  // normalized -> canonical
  const districtNameLookup = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const [, d] of Object.entries(BD_DISTRICT_PATH)) {
      map.set(normalize(d.name), d.name);
    }
    return map;
  }, []);

  const { activeDistricts, unknownPlaces } = React.useMemo(() => {
    const active: string[] = [];
    const unknown: string[] = [];

    for (const it of items || []) {
      const canonical = districtNameLookup.get(normalize(it.place));
      if (canonical) active.push(canonical);
      else unknown.push(it.place);
    }

    return {
      activeDistricts: Array.from(new Set(active)),
      unknownPlaces: Array.from(new Set(unknown)),
    };
  }, [items, districtNameLookup]);

  React.useEffect(() => {
    onDebug?.({ unknownPlaces, activeDistricts });
  }, [unknownPlaces, activeDistricts, onDebug]);

  // internal state for uncontrolled mode
  const [inner, setInner] = React.useState<string | null>(defaultValue);

  const selectedDistrict = value !== undefined ? value : inner;

  // auto select first active if none/invalid
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

  const getFill = (districtName: string) => {
    const isSelected = selectedDistrict === districtName;
    const hasItems = activeDistricts.includes(districtName);

    if (isSelected) return mergedColors.selected;
    if (hasItems) return mergedColors.active;
    return mergedColors.base;
  };

  const onPick = (districtName: string) => {
    if (disabled) return;
    if (!activeDistricts.includes(districtName)) return;

    if (value === undefined) setInner(districtName);
    onSelect?.(districtName);
  };

  return (
    <div
      className={
        className ??
        "w-full rounded-2xl border border-white/10 bg-black/40 backdrop-blur p-4"
      }
      style={
        className
          ? undefined
          : {
              // if Tailwind না থাকে, এটা fallback
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
            }
      }
    >
      <svg
        viewBox="0 0 1555 2140"
        className={svgClassName ?? "w-full h-auto h-screen select-none"}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Bangladesh district map"
      >
        {Object.entries(BD_DISTRICT_PATH).map(([key, d]) => {
          const hasItems = activeDistricts.includes(d.name);
          const isSelected = selectedDistrict === d.name;

          return (
            <g
              key={key}
              onClick={() => onPick(d.name)}
              role={hasItems && !disabled ? "button" : "img"}
              aria-label={d.name}
              style={{ cursor: hasItems && !disabled ? "pointer" : "default" }}
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
      {/* selected district display */}
      {selectedDistrict && (
        <div
          style={{
            marginTop: 10,
            fontSize: 14,
            fontWeight: "bold",
            color: mergedColors.selected,
            position: "absolute",
            top: 10,
          }}
        >
          Selected: {selectedDistrict}
        </div>
      )}

      {/* super tiny debug (optional) */}

      {unknownPlaces.length > 0 && (
        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            color: "rgba(252,211,77,0.95)",
            position: "absolute",
            top: 10,
            right: 10,
          }}
        >
          ⚠️ Unknown places:{" "}
          <span style={{ color: "rgba(253,230,138,0.95)" }}>
            {unknownPlaces.join(", ")}
          </span>
        </div>
      )}
    </div>
  );
}

export { BDDistrictMap };
