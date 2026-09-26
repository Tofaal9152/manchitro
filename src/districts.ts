/**
 * Canonical names of all 64 districts of Bangladesh, exactly as the map
 * reports them in `onSelect`, `renderSelected` and `onDebug`.
 */
export const DISTRICTS = [
  "Bagerhat",
  "Bandarban",
  "Barisal",
  "Bhola",
  "Bogra",
  "Borguna",
  "Brahmanbaria",
  "Chandpur",
  "Chapai Nawabganj",
  "Chittagong",
  "Chuadanga",
  "Comilla",
  "Cox's Bazar",
  "Dhaka",
  "Dinajpur",
  "Faridpur",
  "Feni",
  "Gaibandha",
  "Gazipur",
  "Gopalganj",
  "Habiganj",
  "Jaipurhat",
  "Jamalpur",
  "Jessore",
  "Jhalokati",
  "Jhinaidaha",
  "Khagrachari",
  "Khulna",
  "Kishoreganj",
  "Kurigram",
  "Kushtia",
  "Lakshmipur",
  "Lalmonirhat",
  "Madaripur",
  "Magura",
  "Manikganj",
  "Maulvibazar",
  "Meherpur",
  "Munshiganj",
  "Mymensingh",
  "Naogaon",
  "Narail",
  "Narayanganj",
  "Narshingdi",
  "Natore",
  "Netrokona",
  "Nilfamari",
  "Noakhali",
  "Pabna",
  "Panchagarh",
  "Patuakhali",
  "Pirojpur",
  "Rajbari",
  "Rajshahi",
  "Rangamati",
  "Rangpur",
  "Satkhira",
  "Shariatpur",
  "Sherpur",
  "Sirajganj",
  "Sunamganj",
  "Sylhet",
  "Tangail",
  "Thakurgaon",
] as const;

/** Canonical name of one of the 64 districts of Bangladesh. */
export type ValidDistrict = (typeof DISTRICTS)[number];

/**
 * Any district name the map accepts as input. Suggests the 64 canonical names
 * in the editor, but also accepts any string: matching ignores case, spaces
 * and punctuation, and understands common alternate spellings
 * (e.g. "Chattogram", "Cumilla", "Barishal", "Bogura", "Jashore").
 */
export type DistrictInput = ValidDistrict | (string & {});

/** Alternate spellings (already normalized) mapped to canonical names. */
const ALIASES: Record<string, ValidDistrict> = {
  barishal: "Barisal",
  barguna: "Borguna",
  bogura: "Bogra",
  chapai: "Chapai Nawabganj",
  chapainababganj: "Chapai Nawabganj",
  nawabganj: "Chapai Nawabganj",
  chattogram: "Chittagong",
  chottogram: "Chittagong",
  cumilla: "Comilla",
  kumilla: "Comilla",
  coxbazar: "Cox's Bazar",
  joypurhat: "Jaipurhat",
  jaypurhat: "Jaipurhat",
  jashore: "Jessore",
  jhalakathi: "Jhalokati",
  jhalakati: "Jhalokati",
  jhalokathi: "Jhalokati",
  jhenaidah: "Jhinaidaha",
  jhenaidaha: "Jhinaidaha",
  jhenidah: "Jhinaidaha",
  khagrachhari: "Khagrachari",
  kishorganj: "Kishoreganj",
  kustia: "Kushtia",
  laxmipur: "Lakshmipur",
  lakshipur: "Lakshmipur",
  moulvibazar: "Maulvibazar",
  moulavibazar: "Maulvibazar",
  narsingdi: "Narshingdi",
  narsinghdi: "Narshingdi",
  netrakona: "Netrokona",
  nilphamari: "Nilfamari",
  panchagar: "Panchagarh",
};

/**
 * Lowercases and strips everything except a-z, plus a trailing
 * "district"/"zila" suffix. Example: "Cox's Bazar District" -> "coxsbazar".
 */
const normalize = (s: string) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .replace(/(district|zilla|zila|jela)$/, "");

const LOOKUP = new Map<string, ValidDistrict>();
for (const name of DISTRICTS) LOOKUP.set(normalize(name), name);
for (const [alias, name] of Object.entries(ALIASES)) LOOKUP.set(alias, name);

/**
 * Converts any accepted spelling of a district to its canonical name.
 * Returns `null` if the input is not a recognizable district.
 *
 * @example
 * resolveDistrict("chattogram"); // "Chittagong"
 * resolveDistrict("COX'S BAZAR"); // "Cox's Bazar"
 * resolveDistrict("Atlantis"); // null
 */
export function resolveDistrict(
  name: string | null | undefined,
): ValidDistrict | null {
  if (typeof name !== "string") return null;
  const key = normalize(name);
  if (!key) return null;
  return LOOKUP.get(key) ?? LOOKUP.get(key.replace(/gonj$/, "ganj")) ?? null;
}

/**
 * True if `name` is a recognizable district (any accepted spelling).
 * Use `resolveDistrict` to get the canonical name.
 */
export function isDistrict(name: unknown): boolean {
  return typeof name === "string" && resolveDistrict(name) !== null;
}
