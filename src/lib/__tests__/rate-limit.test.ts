import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock NextResponse before importing rate-limit
vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
    }),
  },
}));

import { rateLimit } from "../rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    // Reset by using a unique key prefix for each test
  });

  it("allows requests within limit", () => {
    const key = `test-allow-${Date.now()}`;
    const result = rateLimit(key, 5, 60000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("tracks remaining count correctly", () => {
    const key = `test-count-${Date.now()}`;
    rateLimit(key, 5, 60000);
    rateLimit(key, 5, 60000);
    const result = rateLimit(key, 5, 60000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("blocks requests exceeding limit", () => {
    const key = `test-block-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      rateLimit(key, 3, 60000);
    }
    const result = rateLimit(key, 3, 60000);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after window expires", () => {
    const key = `test-reset-${Date.now()}`;
    // Use a very short window
    for (let i = 0; i < 3; i++) {
      rateLimit(key, 3, 1); // 1ms window
    }

    // Wait for window to expire
    const start = Date.now();
    while (Date.now() - start < 5) {
      // busy wait 5ms
    }

    const result = rateLimit(key, 3, 1);
    expect(result.success).toBe(true);
  });

  it("uses separate counters for different keys", () => {
    const key1 = `test-sep1-${Date.now()}`;
    const key2 = `test-sep2-${Date.now()}`;

    for (let i = 0; i < 3; i++) {
      rateLimit(key1, 3, 60000);
    }

    const result1 = rateLimit(key1, 3, 60000);
    const result2 = rateLimit(key2, 3, 60000);

    expect(result1.success).toBe(false);
    expect(result2.success).toBe(true);
  });
});
