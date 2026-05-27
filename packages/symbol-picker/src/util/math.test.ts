import { describe, it, expect } from "vitest";
import { add, remove } from "./math";

describe("add function", () => {
  it("should add two numbers correctly", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("should handle negative numbers", () => {
    expect(add(-2, -3)).toBe(-5);
  });

  it("should handle zero", () => {
    expect(add(0, 0)).toBe(0);
  });

  it("should handle large numbers", () => {
    expect(add(1000000, 2000000)).toBe(3000000);
  });
});

describe("remove function", () => {
  it("should subtract two numbers correctly", () => {
    expect(remove(5, 3)).toBe(2);
  });

  it("should handle negative results", () => {
    expect(remove(3, 5)).toBe(-2);
  });

  it("should handle zero result", () => {
    expect(remove(3, 3)).toBe(0);
  });

  it("should handle large numbers", () => {
    expect(remove(2000000, 1000000)).toBe(1000000);
  });
});
