import { describe, it, expect } from "vitest";
import { createCategorySchema, updateCategorySchema } from "../category";

describe("createCategorySchema", () => {
  it("validates a valid category", () => {
    const result = createCategorySchema.safeParse({
      name: "Travel",
      color: "#3b82f6",
    });
    expect(result.success).toBe(true);
  });

  it("validates a category with icon", () => {
    const result = createCategorySchema.safeParse({
      name: "Travel",
      color: "#3b82f6",
      icon: "plane",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createCategorySchema.safeParse({
      name: "",
      color: "#3b82f6",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing color", () => {
    const result = createCategorySchema.safeParse({
      name: "Travel",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding max length", () => {
    const result = createCategorySchema.safeParse({
      name: "a".repeat(101),
      color: "#fff",
    });
    expect(result.success).toBe(false);
  });

  it("accepts name at max length boundary", () => {
    const result = createCategorySchema.safeParse({
      name: "a".repeat(100),
      color: "#fff",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateCategorySchema", () => {
  it("validates partial update", () => {
    const result = updateCategorySchema.safeParse({
      name: "Updated",
    });
    expect(result.success).toBe(true);
  });

  it("validates empty object", () => {
    const result = updateCategorySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects empty name if provided", () => {
    const result = updateCategorySchema.safeParse({
      name: "",
    });
    expect(result.success).toBe(false);
  });
});
