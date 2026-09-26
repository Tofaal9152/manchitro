import * as React from "react";
import { DISTRICT_PATH } from "../data/districtPaths.data";
import {
  resolveDistrict,
  type DistrictInput,
  type ValidDistrict,
} from "../districts";

/** A district to highlight. Extra fields (counts, labels, ...) are allowed and ignored. */
export type DistrictItem = {
  /** Optional identifier for your own bookkeeping. Not used by the map. */
  id?: string | number;
  /** District name. Case, spaces and punctuation are ignored; common alternate spellings are accepted. */
  place: DistrictInput;
  [key: string]: unknown;
};

/** Map colors. Any CSS color value works. */
export type ManchitroColors = {
  /** Fill for districts that are not in `items`. Default `"#0f172a"`. */
  base?: string;
  /** Fill for districts in `items`. Default `"#14532d"`. */
  active?: string;
  /** Fill for the selected district. Default `"#22c55e"`. */
  selected?: string;
  /** Border color of districts. Default `"#334155"`. */
  stroke?: string;
  /** Border color of the selected district. Default `"#ffffff"`. */
  selectedStroke?: string;
  /** Glow around the selected district. Defaults to a translucent `selected` color. */
  selectedGlow?: string;
};

export type ManchitroProps = {
  /**
   * Districts to highlight and make clickable. Pass objects with a `place`
   * field or plain district names.
   * @example items={[{ id: 1, place: "Dhaka" }, "Chattogram"]}
   */
  items?: ReadonlyArray<DistrictItem | DistrictInput>;

  /** Selected district (controlled mode). Pass `null` for no selection. */
  value?: DistrictInput | null;

  /**
   * Initially selected district (uncontrolled mode). If omitted or not in
   * `items`, the first district in `items` is selected.
   */
  defaultValue?: DistrictInput | null;

  /** SVG viewBox, for cropping or zooming. Default `"0 0 1555 2140"`. */
  viewBox?: string;

  /** Called with the canonical district name when a highlighted district is clicked or activated with Enter/Space. */
  onSelect?: (district: ValidDistrict) => void;

  /** Called when the pointer enters a highlighted district. */
  onDistrictMouseEnter?: (
    district: ValidDistrict,
    e: React.MouseEvent<SVGGElement>,
  ) => void;

  /** Called when the pointer leaves a highlighted district. */
  onDistrictMouseLeave?: (
    district: ValidDistrict,
    e: React.MouseEvent<SVGGElement>,
  ) => void;

  /** Class names for the container `<div>`. When set, the default container background and border are not applied. */
  className?: string;

  /** Inline styles for the container `<div>`. */
  style?: React.CSSProperties;

  /** Class names for the `<svg>`. When set, the default SVG sizing (`width: 100%; height: auto`) is not applied. */
  svgClassName?: string;

  /** Inline styles for the `<svg>`, merged over the default sizing. */
  svgStyle?: React.CSSProperties;

  /** Custom map colors. */
  colors?: ManchitroColors;

  /** Called whenever the set of recognized or unrecognized names in `items` changes. */
  onDebug?: (info: {
    unknownPlaces: string[];
    activeDistricts: ValidDistrict[];
  }) => void;

  /**
   * Replaces the default "Selected: X" label. Return `null` to hide it.
   * @example renderSelected={() => null}
   */
  renderSelected?: (district: ValidDistrict) => React.ReactNode;

  /**
   * Replaces the default "Unknown places" warning. Return `null` to hide it.
   * @example renderDebug={() => null}
   */
  renderDebug?: (unknownPlaces: string[]) => React.ReactNode;

  /** Disables clicks, hover callbacks and keyboard selection. */
  disabled?: boolean;
};

const DISTRICT_ENTRIES = Object.entries(DISTRICT_PATH) as Array<
  [string, { name: ValidDistrict; path: string }]
>;

const DEFAULT_SELECTED = "#22c55e";

/**
 * Interactive SVG map of the 64 districts of Bangladesh.
 *
 * @example
 * <Manchitro
 *   items={[{ place: "Dhaka" }, { place: "Sylhet" }]}
 *   onSelect={(district) => console.log(district)}
 * />
 */
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
  svgStyle,
  colors,
  onDebug,
  renderSelected,
  renderDebug,
  disabled = false,
}: ManchitroProps): React.ReactElement {
  const mergedColors = {
    base: colors?.base ?? "#0f172a",
    active: colors?.active ?? "#14532d",
    selected: colors?.selected ?? DEFAULT_SELECTED,
    stroke: colors?.stroke ?? "#334155",
    selectedStroke: colors?.selectedStroke ?? "#ffffff",
    selectedGlow:
      colors?.selectedGlow ??
      (colors?.selected
        ? `color-mix(in srgb, ${colors.selected} 45%, transparent)`
        : "rgba(34,197,94,0.45)"),
  };

  // Split items into recognized districts and unknown names
  const resolved = (items ?? []).map((it) => {
    const place = typeof it === "string" ? it : it?.place;
    return { place: String(place ?? ""), district: resolveDistrict(place) };
  });
  const activeKey = resolved.map((r) => r.district ?? "").join("|");
  const unknownKey = resolved
    .map((r) => (r.district ? "" : r.place))
    .join("|");

  // Keyed on content (not array identity) so inline `items` arrays don't
  // produce new results on every render.
  const activeDistricts = React.useMemo(
    () =>
      Array.from(
        new Set(resolved.flatMap((r) => (r.district ? [r.district] : []))),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeKey],
  );
  const unknownPlaces = React.useMemo(
    () =>
      Array.from(
        new Set(resolved.flatMap((r) => (r.district ? [] : [r.place]))),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unknownKey],
  );
  const activeSet = React.useMemo(
    () => new Set<string>(activeDistricts),
    [activeDistricts],
  );

  // Latest-ref so an inline `onDebug` doesn't re-fire the effect every render
  const onDebugRef = React.useRef(onDebug);
  onDebugRef.current = onDebug;
  React.useEffect(() => {
    onDebugRef.current?.({ unknownPlaces, activeDistricts });
  }, [unknownPlaces, activeDistricts]);

  const isControlled = value !== undefined;
  const [inner, setInner] = React.useState<ValidDistrict | null>(() =>
    resolveDistrict(defaultValue),
  );

  // Uncontrolled: fall back to the first highlighted district when the
  // current choice isn't highlighted. Derived during render so SSR output
  // matches the first client render.
  const selectedDistrict: ValidDistrict | null = isControlled
    ? resolveDistrict(value)
    : inner && activeSet.has(inner)
      ? inner
      : (activeDistricts[0] ?? null);

  const pick = (district: ValidDistrict) => {
    if (disabled || !activeSet.has(district)) return;
    if (!isControlled) setInner(district);
    onSelect?.(district);
  };

  return (
    <div
      className={className}
      style={{
        position: "relative",
        ...(className
          ? undefined
          : {
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
            }),
        ...style,
      }}
    >
      <svg
        viewBox={viewBox}
        className={svgClassName}
        style={{
          ...(svgClassName
            ? undefined
            : { display: "block", width: "100%", height: "auto" }),
          userSelect: "none",
          ...svgStyle,
        }}
        xmlns="http://www.w3.org/2000/svg"
        role="group"
        aria-label="Bangladesh district map"
      >
        {DISTRICT_ENTRIES.map(([key, d]) => {
          const hasItems = activeSet.has(d.name);
          const isSelected = selectedDistrict === d.name;
          const isInteractive = hasItems && !disabled;

          return (
            <g
              key={key}
              onClick={isInteractive ? () => pick(d.name) : undefined}
              onMouseEnter={
                isInteractive
                  ? (e) => onDistrictMouseEnter?.(d.name, e)
                  : undefined
              }
              onMouseLeave={
                isInteractive
                  ? (e) => onDistrictMouseLeave?.(d.name, e)
                  : undefined
              }
              onKeyDown={
                isInteractive
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        pick(d.name);
                      }
                    }
                  : undefined
              }
              role={isInteractive ? "button" : "img"}
              aria-label={d.name}
              aria-pressed={isInteractive ? isSelected : undefined}
              tabIndex={isInteractive ? 0 : undefined}
              style={{ cursor: isInteractive ? "pointer" : "default" }}
            >
              <title>{d.name}</title>
              <path
                d={d.path}
                fill={
                  isSelected
                    ? mergedColors.selected
                    : hasItems
                      ? mergedColors.active
                      : mergedColors.base
                }
                stroke={
                  isSelected ? mergedColors.selectedStroke : mergedColors.stroke
                }
                strokeWidth={isSelected ? 3 : 1}
                opacity={hasItems ? 1 : 0.55}
                style={{
                  transition: "all 200ms ease",
                  filter: isSelected
                    ? `drop-shadow(0px 0px 10px ${mergedColors.selectedGlow})`
                    : "none",
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* Selected district overlay */}
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

      {/* Unknown places warning overlay */}
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
