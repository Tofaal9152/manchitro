import { describe, expect, it } from "vitest";
import { DISTRICTS, isDistrict, resolveDistrict } from "../src";
import { DISTRICT_PATH } from "../src/data/districtPaths.data";

describe("DISTRICTS", () => {
  it("has 64 unique names matching the map paths", () => {
    expect(new Set(DISTRICTS).size).toBe(64);
    const pathNames = Object.values(DISTRICT_PATH).map((d) => d.name);
    expect([...pathNames].sort()).toEqual([...DISTRICTS].sort());
  });
});

describe("resolveDistrict", () => {
  it("resolves every canonical name to itself", () => {
    for (const d of DISTRICTS) expect(resolveDistrict(d)).toBe(d);
  });

  it("ignores case, spacing, punctuation and suffixes", () => {
    expect(resolveDistrict("  dhaka ")).toBe("Dhaka");
    expect(resolveDistrict("COX’S BAZAR")).toBe("Cox's Bazar");
    expect(resolveDistrict("chapainawabganj")).toBe("Chapai Nawabganj");
    expect(resolveDistrict("Dhaka District")).toBe("Dhaka");
    expect(resolveDistrict("Sylhet Zila")).toBe("Sylhet");
  });

  it("accepts official and README spellings", () => {
    const cases: Record<string, string> = {
      Chattogram: "Chittagong",
      Cumilla: "Comilla",
      Barishal: "Barisal",
      Bogura: "Bogra",
      Jashore: "Jessore",
      Joypurhat: "Jaipurhat",
      Jhenaidah: "Jhinaidaha",
      Barguna: "Borguna",
      Moulvibazar: "Maulvibazar",
      Nilphamari: "Nilfamari",
      Narsingdi: "Narshingdi",
      Netrakona: "Netrokona",
      Khagrachhari: "Khagrachari",
      Munshigonj: "Munshiganj",
      Sirajgonj: "Sirajganj",
    };
    for (const [input, expected] of Object.entries(cases)) {
      expect(resolveDistrict(input), input).toBe(expected);
    }
  });

  it("returns null for unknown or non-string input", () => {
    expect(resolveDistrict("Atlantis")).toBeNull();
    expect(resolveDistrict("")).toBeNull();
    expect(resolveDistrict("district")).toBeNull();
    expect(resolveDistrict(null)).toBeNull();
    expect(resolveDistrict(undefined)).toBeNull();
    expect(isDistrict(42)).toBe(false);
    expect(isDistrict("cumilla")).toBe(true);
  });
});
