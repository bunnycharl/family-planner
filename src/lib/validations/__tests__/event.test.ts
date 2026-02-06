import { describe, it, expect } from "vitest";
import { createEventSchema, updateEventSchema } from "../event";

describe("createEventSchema", () => {
  it("validates a minimal valid event", () => {
    const result = createEventSchema.safeParse({
      title: "Test event",
      startDate: "2025-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("validates a full event", () => {
    const result = createEventSchema.safeParse({
      title: "Full event",
      description: "A description",
      startDate: "2025-01-01T00:00:00.000Z",
      endDate: "2025-01-02T00:00:00.000Z",
      location: "Home",
      categoryId: "cat-1",
      assigneeIds: ["user-1", "user-2"],
      isRecurring: false,
      color: "#ff0000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = createEventSchema.safeParse({
      title: "",
      startDate: "2025-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing title", () => {
    const result = createEventSchema.safeParse({
      startDate: "2025-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects title exceeding max length", () => {
    const result = createEventSchema.safeParse({
      title: "a".repeat(201),
      startDate: "2025-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects description exceeding max length", () => {
    const result = createEventSchema.safeParse({
      title: "Valid title",
      startDate: "2025-01-01T00:00:00.000Z",
      description: "a".repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects location exceeding max length", () => {
    const result = createEventSchema.safeParse({
      title: "Valid title",
      startDate: "2025-01-01T00:00:00.000Z",
      location: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("accepts title at max length boundary", () => {
    const result = createEventSchema.safeParse({
      title: "a".repeat(200),
      startDate: "2025-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateEventSchema", () => {
  it("validates partial update", () => {
    const result = updateEventSchema.safeParse({
      title: "Updated title",
    });
    expect(result.success).toBe(true);
  });

  it("validates empty object (no fields required)", () => {
    const result = updateEventSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects empty title if provided", () => {
    const result = updateEventSchema.safeParse({
      title: "",
    });
    expect(result.success).toBe(false);
  });
});
