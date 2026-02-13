import { describe, it, expect } from "vitest";
import { evaluateFormula, validateFormula, extractParamKeys } from "../formula-engine";

describe("evaluateFormula", () => {
  it("computes simple multiplication", () => {
    const result = evaluateFormula("a * b", { a: 12, b: 3000 });
    expect(result).toBe(36000);
  });

  it("computes complex formula with multiple operations", () => {
    const result = evaluateFormula("(hours * rate) + bonus", {
      hours: 160,
      rate: 500,
      bonus: 10000,
    });
    expect(result).toBe(90000);
  });

  it("returns 0 for empty formula", () => {
    expect(evaluateFormula("", { a: 1 })).toBe(0);
    expect(evaluateFormula("   ", { a: 1 })).toBe(0);
  });

  it("returns 0 for invalid formula", () => {
    expect(evaluateFormula("+++", { a: 1 })).toBe(0);
  });

  it("treats missing param as 0", () => {
    // mathjs will throw for undefined symbol, so evaluateFormula returns 0
    const result = evaluateFormula("a * b", { a: 100 });
    expect(result).toBe(0);
  });
});

describe("validateFormula", () => {
  it("marks valid formula as valid", () => {
    const result = validateFormula("clients * price", ["clients", "price"]);
    expect(result).toEqual({ valid: true });
  });

  it("fails when unknown variable is used", () => {
    const result = validateFormula("clients * price", ["clients"]);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("price");
  });

  it("fails for empty formula", () => {
    const result = validateFormula("", ["a"]);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("fails for formula with syntax error", () => {
    const result = validateFormula("a ** / b", ["a", "b"]);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("extractParamKeys", () => {
  it("extracts correct keys from formula", () => {
    const keys = extractParamKeys("clients * price");
    expect(keys).toEqual(expect.arrayContaining(["clients", "price"]));
    expect(keys).toHaveLength(2);
  });

  it("handles nested expressions with parentheses", () => {
    const keys = extractParamKeys("(hours * rate) + bonus");
    expect(keys).toEqual(expect.arrayContaining(["hours", "rate", "bonus"]));
    expect(keys).toHaveLength(3);
  });

  it("returns empty array for empty formula", () => {
    expect(extractParamKeys("")).toEqual([]);
  });

  it("returns empty array for invalid formula", () => {
    expect(extractParamKeys("+++")).toEqual([]);
  });
});
