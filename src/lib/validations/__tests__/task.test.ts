import { describe, it, expect } from "vitest";
import { createTaskSchema, updateTaskSchema, moveTaskSchema } from "../task";

describe("createTaskSchema", () => {
  it("validates a minimal valid task", () => {
    const result = createTaskSchema.safeParse({
      title: "Test task",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("TODO");
      expect(result.data.priority).toBe("MEDIUM");
    }
  });

  it("validates a full task", () => {
    const result = createTaskSchema.safeParse({
      title: "Full task",
      description: "Description",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: "2025-06-01",
      categoryId: "cat-1",
      assigneeId: "user-1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = createTaskSchema.safeParse({
      title: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects title exceeding max length", () => {
    const result = createTaskSchema.safeParse({
      title: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("rejects description exceeding max length", () => {
    const result = createTaskSchema.safeParse({
      title: "Valid",
      description: "a".repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = createTaskSchema.safeParse({
      title: "Task",
      status: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid priority", () => {
    const result = createTaskSchema.safeParse({
      title: "Task",
      priority: "CRITICAL",
    });
    expect(result.success).toBe(false);
  });

  it("applies default status TODO", () => {
    const result = createTaskSchema.safeParse({ title: "Task" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("TODO");
    }
  });

  it("applies default priority MEDIUM", () => {
    const result = createTaskSchema.safeParse({ title: "Task" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe("MEDIUM");
    }
  });
});

describe("updateTaskSchema", () => {
  it("validates partial update", () => {
    const result = updateTaskSchema.safeParse({
      title: "Updated",
    });
    expect(result.success).toBe(true);
  });

  it("validates empty object", () => {
    const result = updateTaskSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("validates status-only update", () => {
    const result = updateTaskSchema.safeParse({
      status: "DONE",
    });
    expect(result.success).toBe(true);
  });
});

describe("moveTaskSchema", () => {
  it("validates move with status and position", () => {
    const result = moveTaskSchema.safeParse({
      status: "IN_PROGRESS",
      position: 2,
    });
    expect(result.success).toBe(true);
  });

  it("validates move with only position", () => {
    const result = moveTaskSchema.safeParse({
      position: 0,
    });
    expect(result.success).toBe(true);
  });

  it("validates empty object", () => {
    const result = moveTaskSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
