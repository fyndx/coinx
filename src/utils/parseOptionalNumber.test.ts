import { parseOptionalNumber } from "./parseOptionalNumber";

describe("parseOptionalNumber", () => {
  it("returns 0 for nullish values", () => {
    expect(parseOptionalNumber(null)).toBe(0);
    expect(parseOptionalNumber(undefined)).toBe(0);
  });

  it("parses numeric strings and numbers", () => {
    expect(parseOptionalNumber("12.5")).toBe(12.5);
    expect(parseOptionalNumber(7)).toBe(7);
  });

  it("returns 0 for NaN-producing input", () => {
    expect(parseOptionalNumber("not-a-number")).toBe(0);
  });
});
